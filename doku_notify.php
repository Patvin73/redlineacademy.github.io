<?php
/**
 * doku_notify.php
 * Redline Academy — DOKU Webhook / Notification Handler
 *
 * DOKU akan POST ke URL ini setelah transaksi selesai (sukses/gagal).
 * Verifikasi signature sebelum memproses notifikasi.
 *
 * Dokumentasi: https://developers.doku.com/accept-payment/checkout/notify
 */

define('DOKU_SECRET_KEY', getenv('DOKU_SECRET_KEY') ?: 'YOUR_SECRET_KEY');
define('DOKU_CLIENT_ID',  getenv('DOKU_CLIENT_ID')  ?: 'YOUR_CLIENT_ID');

// Log file (opsional, pastikan writable)
define('LOG_FILE', __DIR__ . '/logs/doku_notify.log');

// ─────────────────────────────────────────────
//  HELPER
// ─────────────────────────────────────────────

function writeLog(string $message): void
{
    if (!is_dir(dirname(LOG_FILE))) {
        mkdir(dirname(LOG_FILE), 0755, true);
    }
    file_put_contents(LOG_FILE, '[' . date('Y-m-d H:i:s') . '] ' . $message . PHP_EOL, FILE_APPEND);
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

// ─────────────────────────────────────────────
//  PROSES NOTIFIKASI
// ─────────────────────────────────────────────

$rawBody = file_get_contents('php://input');
writeLog("Notif masuk: " . $rawBody);

// Hanya terima POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

// Verifikasi signature
if (!verifyDokuSignature($rawBody)) {
    writeLog("GAGAL: Signature tidak valid.");
    http_response_code(401);
    exit('Unauthorized');
}

$data = json_decode($rawBody, true);
if (!$data) {
    writeLog("GAGAL: Body bukan JSON valid.");
    http_response_code(400);
    exit('Bad Request');
}

// Ambil data transaksi dari payload DOKU
$invoiceNumber  = $data['order']['invoice_number']    ?? '';
$resultCode     = $data['transaction']['status']      ?? '';
$amount         = $data['order']['amount']            ?? 0;
$transactionId  = $data['transaction']['id']          ?? '';

writeLog("Invoice: {$invoiceNumber} | Status: {$resultCode} | Amount: {$amount} | TxID: {$transactionId}");

// ─────────────────────────────────────────────
//  LOGIKA BISNIS — sesuaikan dengan database Anda
// ─────────────────────────────────────────────

switch ($resultCode) {
    case 'SUCCESS':
        /**
         * TODO: Update status order di database:
         *   UPDATE registrations SET status='paid', transaction_id='...'
         *   WHERE invoice_number = '{$invoiceNumber}';
         *
         * Kirim email konfirmasi ke customer (gunakan PHPMailer / SMTP).
         * Notif ke tim internal (Slack/email).
         */
        writeLog("SUKSES: Pembayaran {$invoiceNumber} berhasil. TxID: {$transactionId}");
        break;

    case 'PENDING':
        /**
         * TODO: Update status = 'pending' di database.
         */
        writeLog("PENDING: Menunggu konfirmasi bank untuk {$invoiceNumber}.");
        break;

    case 'FAILED':
    case 'EXPIRED':
        /**
         * TODO: Update status = 'failed'/'expired' di database.
         * Kirim notif ke user bahwa pembayaran gagal.
         */
        writeLog("GAGAL/EXPIRED: Invoice {$invoiceNumber} status {$resultCode}.");
        break;

    default:
        writeLog("Status tidak dikenal: {$resultCode} untuk invoice {$invoiceNumber}.");
        break;
}

// Wajib balas 200 OK agar DOKU tidak retry
http_response_code(200);
echo json_encode(['status' => 'OK']);
