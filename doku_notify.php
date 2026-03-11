<?php
/**
 * doku_notify.php
 * Redline Academy - DOKU Webhook / Notification Handler
 *
 * DOKU akan POST ke URL ini setelah transaksi selesai (sukses/gagal).
 * Verifikasi signature sebelum memproses notifikasi.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/mail_helper.php';

define('DOKU_SECRET_KEY', getenv('DOKU_SECRET_KEY') ?: '');
define('DOKU_CLIENT_ID',  getenv('DOKU_CLIENT_ID')  ?: '');

// Log file (opsional, pastikan writable)
define('LOG_FILE', __DIR__ . '/logs/doku_notify.log');

// -----------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------

function writeLog(string $message): void
{
    if (!is_dir(dirname(LOG_FILE))) {
        mkdir(dirname(LOG_FILE), 0755, true);
    }
    file_put_contents(LOG_FILE, '[' . date('Y-m-d H:i:s') . '] ' . $message . PHP_EOL, FILE_APPEND);
}

function dbLogPaymentEvent(string $invoiceNumber, string $eventType, array $payload): void
{
    $db = db();
    if (!$db) {
        return;
    }

    $stmt = $db->prepare('insert into public.payment_events (invoice_number, event_type, payload) values (:invoice, :event_type, :payload)');
    $stmt->execute([
        ':invoice' => $invoiceNumber ?: null,
        ':event_type' => $eventType,
        ':payload' => json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    ]);
}

function dbUpsertRegistrationStatus(
    string $invoiceNumber,
    string $status,
    string $transactionId,
    $amount,
    array $payload,
    ?string $lastError
): void {
    $db = db();
    if (!$db) {
        return;
    }

    $stmt = $db->prepare(
        'insert into public.registrations (invoice_number, status, transaction_id, final_amount, last_error, doku_response)\n'
        . 'values (:invoice, :status, :transaction_id, :final_amount, :last_error, :doku_response)\n'
        . 'on conflict (invoice_number) do update set\n'
        . '  status = excluded.status,\n'
        . '  transaction_id = coalesce(excluded.transaction_id, public.registrations.transaction_id),\n'
        . '  final_amount = coalesce(public.registrations.final_amount, excluded.final_amount),\n'
        . '  last_error = coalesce(excluded.last_error, public.registrations.last_error),\n'
        . '  doku_response = excluded.doku_response,\n'
        . '  updated_at = now()'
    );

    $stmt->execute([
        ':invoice' => $invoiceNumber,
        ':status' => $status,
        ':transaction_id' => $transactionId ?: null,
        ':final_amount' => $amount ?: null,
        ':last_error' => $lastError,
        ':doku_response' => json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    ]);
}

function dbFetchRegistration(string $invoiceNumber): ?array
{
    $db = db();
    if (!$db) {
        return null;
    }

    $stmt = $db->prepare('select full_name, email, final_amount from public.registrations where invoice_number = :invoice limit 1');
    $stmt->execute([':invoice' => $invoiceNumber]);
    $row = $stmt->fetch();
    return $row ?: null;
}

/** Verifikasi DOKU signature dari header request */
function verifyDokuSignature(string $rawBody): bool
{
    $clientId  = $_SERVER['HTTP_CLIENT_ID']         ?? '';
    $requestId = $_SERVER['HTTP_REQUEST_ID']        ?? '';
    $timestamp = $_SERVER['HTTP_REQUEST_TIMESTAMP'] ?? '';
    $sigHeader = $_SERVER['HTTP_SIGNATURE']         ?? '';

    $digest       = base64_encode(hash('sha256', $rawBody, true));
    $target       = '/doku_notify.php';
    $componentStr = "Client-Id:{$clientId}\n"
                  . "Request-Id:{$requestId}\n"
                  . "Request-Timestamp:{$timestamp}\n"
                  . "Request-Target:{$target}\n"
                  . "Digest:{$digest}";

    $expected = 'HMAC SHA256=' . base64_encode(hash_hmac('sha256', $componentStr, DOKU_SECRET_KEY, true));
    return hash_equals($expected, $sigHeader);
}

// -----------------------------------------------------------------------------
// Proses notifikasi
// -----------------------------------------------------------------------------

$rawBody = file_get_contents('php://input');
writeLog('Notif masuk: ' . $rawBody);

// Hanya terima POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

// Pastikan kredensial DOKU tersedia
if (empty(DOKU_SECRET_KEY) || empty(DOKU_CLIENT_ID)) {
    writeLog('ERROR: DOKU credentials missing.');
    http_response_code(500);
    exit('Server misconfigured');
}

// Verifikasi signature
if (!verifyDokuSignature($rawBody)) {
    writeLog('GAGAL: Signature tidak valid.');
    http_response_code(401);
    exit('Unauthorized');
}

$data = json_decode($rawBody, true);
if (!$data) {
    writeLog('GAGAL: Body bukan JSON valid.');
    http_response_code(400);
    exit('Bad Request');
}

// Ambil data transaksi dari payload DOKU
$invoiceNumber  = $data['order']['invoice_number']    ?? '';
$resultCode     = $data['transaction']['status']      ?? '';
$amount         = $data['order']['amount']            ?? 0;
$transactionId  = $data['transaction']['id']          ?? '';

writeLog("Invoice: {$invoiceNumber} | Status: {$resultCode} | Amount: {$amount} | TxID: {$transactionId}");

$statusMap = [
    'SUCCESS' => 'paid',
    'PENDING' => 'pending',
    'FAILED'  => 'failed',
    'EXPIRED' => 'expired',
];

$mappedStatus = $statusMap[$resultCode] ?? 'unknown';
$lastError = null;
if (in_array($mappedStatus, ['failed', 'expired', 'unknown'], true)) {
    $lastError = 'DOKU status: ' . ($resultCode ?: 'UNKNOWN');
}

// Persist status + audit trail (best-effort)
dbUpsertRegistrationStatus($invoiceNumber, $mappedStatus, $transactionId, $amount, $data, $lastError);
dbLogPaymentEvent($invoiceNumber, 'webhook_' . $mappedStatus, $data);

switch ($mappedStatus) {
    case 'paid':
        writeLog("SUKSES: Pembayaran {$invoiceNumber} berhasil. TxID: {$transactionId}");

        $reg = dbFetchRegistration($invoiceNumber);
        $customerName = $reg['full_name'] ?? ($data['customer']['name'] ?? 'Customer');
        $customerEmail = $reg['email'] ?? ($data['customer']['email'] ?? '');
        $finalAmount = $reg['final_amount'] ?? $amount;

        if (!empty($customerEmail)) {
            $amountText = number_format((float) $finalAmount, 0, ',', '.');
            $subject = 'Pembayaran berhasil - Redline Academy';
            $html = "<p>Halo {$customerName},</p>"
                  . "<p>Pembayaran Anda telah kami terima.</p>"
                  . "<p><strong>Invoice:</strong> {$invoiceNumber}<br>"
                  . "<strong>Jumlah:</strong> IDR {$amountText}</p>"
                  . "<p>Terima kasih telah mendaftar di Redline Academy.</p>";

            if (!sendPaymentEmail($customerEmail, $customerName, $subject, $html)) {
                writeLog("ERROR: Email gagal dikirim ke {$customerEmail} (invoice {$invoiceNumber}).");
            }
        } else {
            writeLog("WARN: Email customer tidak ditemukan untuk invoice {$invoiceNumber}.");
        }
        break;

    case 'pending':
        writeLog("PENDING: Menunggu konfirmasi bank untuk {$invoiceNumber}.");
        break;

    case 'failed':
    case 'expired':
        writeLog("GAGAL/EXPIRED: Invoice {$invoiceNumber} status {$resultCode}.");
        break;

    default:
        writeLog("Status tidak dikenal: {$resultCode} untuk invoice {$invoiceNumber}.");
        break;
}

// Wajib balas 200 OK agar DOKU tidak retry
http_response_code(200);
echo json_encode(['status' => 'OK']);
