<?php
/**
 * submit_registration.php
 * Redline Academy — DOKU Checkout Integration
 *
 * Flow:
 *  1. Terima POST dari programs.html
 *  2. Validasi input & generate invoice number
 *  3. Hitung total final (harga - diskon plan - diskon promo)
 *  4. Panggil DOKU Checkout API → dapat payment_url
 *  5. Redirect user ke halaman pembayaran DOKU (hosted page)
 *
 * File upload KTP disimpan lokal terlebih dahulu.
 * Notifikasi pembayaran diterima di doku_notify.php (webhook).
 */

// ─────────────────────────────────────────────
//  KONFIGURASI — ganti dengan kredensial asli
// ─────────────────────────────────────────────
define('DOKU_CLIENT_ID',  getenv('DOKU_CLIENT_ID')  ?: 'BRN-0251-1772691096121');
define('DOKU_SECRET_KEY', getenv('DOKU_SECRET_KEY') ?: 'SK-lZklcjk9xPBWz1hMY6fL');
define('DOKU_SANDBOX',    true);   // ubah ke false saat production

define('BASE_URL',        'https://redlineacademy.com.au');
define('NOTIFY_URL',      BASE_URL . '/doku_notify.php');
define('SUCCESS_URL',     BASE_URL . '/pages/payment_success.html');
define('FAILED_URL',      BASE_URL . '/pages/payment_failed.html');

// Direktori simpan KTP (pastikan writable, di luar public jika memungkinkan)
define('UPLOAD_DIR', __DIR__ . '/uploads/ktp/');

// ─────────────────────────────────────────────
//  HELPER FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Generate DOKU request signature
 * Format: HMAC-SHA256( "Client-Id:{id}\nRequest-Id:{rid}\nRequest-Timestamp:{ts}\nRequest-Target:{path}\nDigest:{digest}" )
 */
function dokuSignature(string $clientId, string $secretKey, string $requestId, string $timestamp, string $requestTarget, string $body): string
{
    $digest        = base64_encode(hash('sha256', $body, true));
    $componentStr  = "Client-Id:{$clientId}\n"
                   . "Request-Id:{$requestId}\n"
                   . "Request-Timestamp:{$timestamp}\n"
                   . "Request-Target:{$requestTarget}\n"
                   . "Digest:{$digest}";
    return 'HMAC SHA256=' . base64_encode(hash_hmac('sha256', $componentStr, $secretKey, true));
}

/** Kirim request ke DOKU API */
function dokuRequest(string $endpoint, array $payload): array
{
    $isSandbox   = DOKU_SANDBOX;
    $baseApi     = $isSandbox
                 ? 'https://api-sandbox.doku.com'
                 : 'https://api.doku.com';

    $url         = $baseApi . $endpoint;
    $requestId   = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                    mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
                    mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
                    mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff));
    $timestamp   = gmdate('Y-m-d\TH:i:s\Z');
    $body        = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $signature   = dokuSignature(DOKU_CLIENT_ID, DOKU_SECRET_KEY, $requestId, $timestamp, $endpoint, $body);

    $headers = [
        'Content-Type: application/json',
        'Client-Id: '          . DOKU_CLIENT_ID,
        'Request-Id: '         . $requestId,
        'Request-Timestamp: '  . $timestamp,
        'Signature: '          . $signature,
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $body,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 30,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'http_code' => $httpCode,
        'body'      => json_decode($response, true) ?? [],
        'raw'       => $response,
    ];
}

/** Redirect dengan pesan error sederhana */
function redirectError(string $message): never
{
    $url = FAILED_URL . '?error=' . urlencode($message);
    header('Location: ' . $url);
    exit;
}

/** Sanitize string input */
function clean(string $val): string
{
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

// ─────────────────────────────────────────────
//  MULAI PROSES
// ─────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /pages/programs.html');
    exit;
}

// 1. Ambil & validasi field wajib
$required = ['fullname', 'dob', 'gender', 'email', 'phone', 'id_number',
             'address', 'postcode', 'selected_program', 'payment_plan',
             'payment_method', 'program_fee'];

foreach ($required as $field) {
    if (empty($_POST[$field])) {
        redirectError("Field '{$field}' tidak boleh kosong.");
    }
}

// 2. Sanitize semua input
$fullname        = clean($_POST['fullname']);
$dob             = clean($_POST['dob']);
$gender          = clean($_POST['gender']);
$email           = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
$phone           = preg_replace('/[^0-9+]/', '', $_POST['phone']);
$idNumber        = clean($_POST['id_number']);
$address         = clean($_POST['address']);
$postcode        = clean($_POST['postcode']);
$qualification   = clean($_POST['qualification']  ?? '');
$employment      = clean($_POST['employment']     ?? '');
$experience      = clean($_POST['experience']     ?? '');
$selectedProgram = clean($_POST['selected_program']);
$paymentPlan     = clean($_POST['payment_plan']);      // 'full' | 'installment'
$paymentMethod   = clean($_POST['payment_method']);    // 'va_bca' | 'qris' | dll
$programFee      = (int) $_POST['program_fee'];
$promoDiscount   = (int) ($_POST['promo_discount'] ?? 0);
$promoCode       = clean($_POST['promo_code']     ?? '');

// 3. Hitung total
$planDiscountRate = ($paymentPlan === 'full') ? 0.05 : 0.0;
$planDiscount     = (int) round($programFee * $planDiscountRate);
$finalAmount      = max($programFee - $planDiscount - $promoDiscount, 0);

if ($finalAmount <= 0) {
    redirectError('Total pembayaran tidak valid.');
}

// 4. Validasi email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirectError('Format email tidak valid.');
}

// 5. Simpan file KTP
if (!isset($_FILES['id_document']) || $_FILES['id_document']['error'] !== UPLOAD_ERR_OK) {
    redirectError('File KTP wajib diunggah.');
}

if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
$fileMime     = mime_content_type($_FILES['id_document']['tmp_name']);
if (!in_array($fileMime, $allowedMimes, true)) {
    redirectError('Format file KTP tidak didukung (JPG/PNG/PDF).');
}

$fileExt      = pathinfo($_FILES['id_document']['name'], PATHINFO_EXTENSION);
$fileName     = 'KTP_' . preg_replace('/[^a-zA-Z0-9]/', '', $fullname) . '_' . time() . '.' . $fileExt;
$filePath     = UPLOAD_DIR . $fileName;

if (!move_uploaded_file($_FILES['id_document']['tmp_name'], $filePath)) {
    redirectError('Gagal menyimpan file KTP.');
}

// 6. Map program & metode pembayaran ke nama tampilan
$programNames = [
    'assistant_carer' => 'Program Asisten Perawat (Care Giver)',
    'bartender'       => 'Program Bartender',
    'barista'         => 'Program Barista',
    'cooking'         => 'Program Memasak (Chef)',
    'coding'          => 'Program Pemrograman (IT)',
    'electrician'     => 'Program Teknisi Listrik',
];
$programLabel = $programNames[$selectedProgram] ?? $selectedProgram;

// 7. Generate invoice number unik
$invoiceNumber = 'RA-' . strtoupper(substr($selectedProgram, 0, 3)) . '-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));

// 8. Susun payload DOKU Checkout
$payload = [
    'order' => [
        'invoice_number'  => $invoiceNumber,
        'line_items'      => [
            [
                'name'     => $programLabel,
                'price'    => $programFee,
                'quantity' => 1,
            ],
        ],
        'amount'          => $finalAmount,
        'currency'        => 'IDR',
        'callback_url'    => NOTIFY_URL,
        'callback_url_key'=> 'invoice_number',
        'auto_redirect'   => true,
    ],
    'payment' => [
        'payment_due_date' => 1440,   // 24 jam dalam menit
    ],
    'customer' => [
        'name'  => $fullname,
        'email' => $email,
        'phone' => $phone,
    ],
    'additional_info' => [
        'program'       => $selectedProgram,
        'payment_plan'  => $paymentPlan,
        'promo_code'    => $promoCode,
        'plan_discount' => $planDiscount,
        'promo_discount'=> $promoDiscount,
        'ktp_file'      => $fileName,
    ],
];

// 9. Simpan data sesi sementara (opsional — untuk ditampilkan di halaman sukses)
session_start();
$_SESSION['pending_invoice'] = [
    'invoice_number' => $invoiceNumber,
    'fullname'       => $fullname,
    'email'          => $email,
    'program'        => $programLabel,
    'amount'         => $finalAmount,
];

// 10. Panggil DOKU API
$result = dokuRequest('/checkout/v1/payment', $payload);

if ($result['http_code'] !== 200) {
    $errMsg = $result['body']['message'] ?? 'Gagal membuat sesi pembayaran.';
    redirectError($errMsg);
}

$paymentUrl = $result['body']['response']['payment']['url'] ?? null;
if (empty($paymentUrl)) {
    redirectError('URL pembayaran tidak ditemukan dari DOKU.');
}

// 11. Redirect ke DOKU Checkout hosted page
header('Location: ' . $paymentUrl);
exit;
