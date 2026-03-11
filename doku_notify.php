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

// Logging + metrics (structured)
define('LOG_DIR', __DIR__ . '/logs');
define('LOG_FILE', LOG_DIR . '/doku_notify.log');
define('METRICS_FILE', LOG_DIR . '/webhook_metrics.json');

define('WEBHOOK_ALERT_WINDOW_SEC', (int) (getenv('WEBHOOK_ALERT_WINDOW_SEC') ?: 900));
define('WEBHOOK_ALERT_THRESHOLD', (int) (getenv('WEBHOOK_ALERT_THRESHOLD') ?: 5));
define('WEBHOOK_ALERT_COOLDOWN_SEC', (int) (getenv('WEBHOOK_ALERT_COOLDOWN_SEC') ?: 1800));

define('ALERT_EMAIL', getenv('ALERT_EMAIL') ?: '');
define('ALERT_NAME', getenv('ALERT_NAME') ?: 'Admin');

// -----------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------

function ensureLogDir(): void
{
    if (!is_dir(LOG_DIR)) {
        mkdir(LOG_DIR, 0755, true);
    }
}

function logEvent(string $level, string $message, array $context = []): void
{
    ensureLogDir();
    $entry = [
        'ts' => gmdate('c'),
        'level' => $level,
        'message' => $message,
        'context' => $context,
    ];
    file_put_contents(
        LOG_FILE,
        json_encode($entry, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL,
        FILE_APPEND
    );

    if ($level === 'error') {
        error_log($message);
    }
}

function writeLog(string $message): void
{
    logEvent('info', $message);
}

function readWebhookMetrics(): array
{
    if (!is_file(METRICS_FILE)) {
        return [
            'total_success' => 0,
            'total_error' => 0,
            'errors_window' => [],
        ];
    }

    $raw = file_get_contents(METRICS_FILE);
    $data = $raw ? json_decode($raw, true) : null;
    if (!is_array($data)) {
        return [
            'total_success' => 0,
            'total_error' => 0,
            'errors_window' => [],
        ];
    }

    if (!isset($data['errors_window']) || !is_array($data['errors_window'])) {
        $data['errors_window'] = [];
    }

    return $data;
}

function writeWebhookMetrics(array $metrics): void
{
    ensureLogDir();
    file_put_contents(
        METRICS_FILE,
        json_encode($metrics, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
}

function pruneWindow(array $timestamps, int $windowSec, ?int $now = null): array
{
    $now = $now ?? time();
    $cutoff = $now - $windowSec;
    return array_values(array_filter($timestamps, function ($ts) use ($cutoff) {
        return is_int($ts) && $ts >= $cutoff;
    }));
}

function recordWebhookSuccess(array $context = []): void
{
    $metrics = readWebhookMetrics();
    $metrics['last_success_at'] = time();
    $metrics['total_success'] = ($metrics['total_success'] ?? 0) + 1;

    if ($context) {
        $metrics['last_success_context'] = $context;
    }

    writeWebhookMetrics($metrics);
}

function sendAlertEmail(string $subject, string $html): bool
{
    if (empty(ALERT_EMAIL)) {
        return false;
    }

    return sendPaymentEmail(ALERT_EMAIL, ALERT_NAME, $subject, $html);
}

function maybeAlertWebhookFailures(array $metrics, string $reason, array $context = []): bool
{
    if (empty(ALERT_EMAIL)) {
        return false;
    }

    $errors = $metrics['errors_window'] ?? [];
    if (!is_array($errors) || count($errors) < WEBHOOK_ALERT_THRESHOLD) {
        return false;
    }

    $lastAlertAt = $metrics['last_alert_at'] ?? 0;
    if ($lastAlertAt && (time() - $lastAlertAt) < WEBHOOK_ALERT_COOLDOWN_SEC) {
        return false;
    }

    $count = count($errors);
    $lastErrorAt = $metrics['last_error_at'] ?? null;

    $subject = 'ALERT: DOKU webhook failure spike';
    $html = '<p>Terjadi ' . $count . ' error webhook dalam ' . WEBHOOK_ALERT_WINDOW_SEC . " detik terakhir.</p>"
          . '<p><strong>Alasan terakhir:</strong> ' . htmlspecialchars($reason, ENT_QUOTES, 'UTF-8') . '</p>';

    if ($lastErrorAt) {
        $html .= '<p><strong>Waktu terakhir (UTC):</strong> ' . gmdate('c', (int) $lastErrorAt) . '</p>';
    }

    if (!empty($context)) {
        $html .= '<pre>' . htmlspecialchars(json_encode($context, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), ENT_QUOTES, 'UTF-8') . '</pre>';
    }

    return sendAlertEmail($subject, $html);
}

function recordWebhookError(string $reason, int $httpCode, array $context = []): void
{
    $metrics = readWebhookMetrics();
    $now = time();

    $metrics['last_error_at'] = $now;
    $metrics['last_error_message'] = $reason;
    $metrics['last_error_code'] = $httpCode;
    $metrics['total_error'] = ($metrics['total_error'] ?? 0) + 1;

    $errors = $metrics['errors_window'] ?? [];
    if (!is_array($errors)) {
        $errors = [];
    }
    $errors = pruneWindow($errors, WEBHOOK_ALERT_WINDOW_SEC, $now);
    $errors[] = $now;
    $metrics['errors_window'] = $errors;

    $alertSent = maybeAlertWebhookFailures($metrics, $reason, $context);
    if ($alertSent) {
        $metrics['last_alert_at'] = $now;
        $metrics['last_alert_reason'] = $reason;
    }

    writeWebhookMetrics($metrics);
}

function respondWithError(int $statusCode, string $message, array $context = []): void
{
    logEvent('error', $message, array_merge($context, ['http_code' => $statusCode]));
    recordWebhookError($message, $statusCode, $context);
    http_response_code($statusCode);
    exit($message);
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
logEvent('info', 'Webhook received', [
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    'request_id' => $_SERVER['HTTP_REQUEST_ID'] ?? '',
    'client_id' => $_SERVER['HTTP_CLIENT_ID'] ?? '',
    'body_len' => strlen($rawBody),
]);

// Hanya terima POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logEvent('warn', 'Method not allowed', [
        'method' => $_SERVER['REQUEST_METHOD'] ?? '',
    ]);
    http_response_code(405);
    exit('Method Not Allowed');
}
// Pastikan kredensial DOKU tersedia
if (empty(DOKU_SECRET_KEY) || empty(DOKU_CLIENT_ID)) {
    respondWithError(500, 'DOKU credentials missing');
}
// Verifikasi signature
if (!verifyDokuSignature($rawBody)) {
    respondWithError(401, 'Invalid signature', [
        'request_id' => $_SERVER['HTTP_REQUEST_ID'] ?? '',
        'client_id' => $_SERVER['HTTP_CLIENT_ID'] ?? '',
    ]);
}
$data = json_decode($rawBody, true);
if (!$data) {
    respondWithError(400, 'Invalid JSON body');
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
recordWebhookSuccess([
    'invoice_number' => $invoiceNumber,
    'status' => $mappedStatus,
]);
http_response_code(200);
echo json_encode(['status' => 'OK']);









