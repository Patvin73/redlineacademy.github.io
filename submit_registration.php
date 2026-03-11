<?php
/**
 * submit_registration.php
 * Redline Academy â€” DOKU Checkout Integration
 *
 * Flow:
 *  1. Terima POST dari programs.html
 *  2. Validasi CSRF + input
 *  3. Hitung total di SERVER (tidak percaya nilai dari form)
 *  4. Panggil DOKU Checkout API â†’ dapat payment_url
 *  5. Redirect user ke halaman pembayaran DOKU (hosted page)
 *
 * CHANGELOG (fixes):
 *  - [KRITIS] Kredensial dipindah ke env var, tidak hardcoded
 *  - [KRITIS] program_fee dihitung ulang di server (tidak dari POST)
 *  - [KRITIS] promo_discount divalidasi di server (tidak dari POST)
 *  - [KRITIS] line_items price disesuaikan dengan finalAmount (anti-reject DOKU)
 *  - [KRITIS] 'callback_url' â†’ 'notification_url' (field benar di DOKU v1)
 *  - [PENTING] Tambah CSRF token protection
 *  - [PENTING] Tambah curl_error() handling
 *  - [PENTING] Tambah validasi format phone +62
 *  - [PENTING] Field payment_method dipass ke payload DOKU
 *  - [PENTING] Return type 'never' â†’ void + exit (kompatibel PHP 7.4+)
 *  - [INFO] Hapus field non-standar: auto_redirect, callback_url_key
 */

require_once __DIR__ . '/db.php';
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  KONFIGURASI â€” ISI VIA ENVIRONMENT VARIABLE
//  Jangan pernah hardcode kredensial di sini!
//
//  Di server (cPanel/VPS), set env var:
//    DOKU_CLIENT_ID=BRN-xxxx-xxxx
//    DOKU_SECRET_KEY=SK-xxxxxxxx
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
define('DOKU_CLIENT_ID',  getenv('DOKU_CLIENT_ID')  ?: '');
define('DOKU_SECRET_KEY', getenv('DOKU_SECRET_KEY') ?: '');
$envSandbox = getenv('DOKU_SANDBOX');
define('DOKU_SANDBOX',    filter_var($envSandbox ?? 'true', FILTER_VALIDATE_BOOLEAN));

define('BASE_URL',    'https://redlineacademy.com.au');
define('NOTIFY_URL',  BASE_URL . '/doku_notify.php');
define('SUCCESS_URL', BASE_URL . '/pages/payment_success.html');
define('FAILED_URL',  BASE_URL . '/pages/payment_failed.html');

// Simpan KTP DI LUAR webroot (aman dari akses URL langsung)
// Contoh: /home/username/private_uploads/ktp/  (di atas public_html)
// Jika tidak bisa, gunakan .htaccess di folder uploads/ untuk blokir akses
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads_private/ktp/');

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  HARGA & DISKON â€” SOURCE OF TRUTH DI SERVER
//  Jangan pernah percaya nilai dari POST/form!
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PROGRAM_PRICES = [
    'assistant_carer' => 4_600_000,
    'bartender'       => 4_600_000,
    'barista'         => 4_600_000,
    'cooking'         => 4_600_000,
    'coding'          => 4_600_000,
    'electrician'     => 4_600_000,
];

const PROGRAM_NAMES = [
    'assistant_carer' => 'Program Asisten Perawat (Care Giver)',
    'bartender'       => 'Program Bartender',
    'barista'         => 'Program Barista',
    'cooking'         => 'Program Memasak (Chef)',
    'coding'          => 'Program Pemrograman (IT)',
    'electrician'     => 'Program Teknisi Listrik',
];

// Diskon plan pembayaran (kalkulasi di server, bukan dari form)
const PLAN_DISCOUNTS = [
    'full'        => 0.05,   // 5% diskon bayar penuh
    'installment' => 0.00,   // tanpa diskon
];

// Kode promo valid + rate diskon (kalkulasi di server, bukan dari form)
const PROMO_CODES = [
    'EARLYBIRD10' => 0.10,
    'REDLINE15'   => 0.15,
];


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  HELPER FUNCTIONS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Redirect ke halaman gagal dengan pesan error */
function redirectError(string $message): void
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

/** Insert registration row into database (if DB configured). */
function dbInsertRegistration(array $data): void
{
    $db = db();
    if (!$db) {
        return;
    }

    $sql = "insert into public.registrations (
        invoice_number, full_name, email, phone, date_of_birth, gender, id_number,
        address, postcode, qualification, employment, experience,
        selected_program, payment_plan, payment_method,
        program_fee, plan_discount, promo_code, promo_discount, final_amount,
        status, ktp_file
    ) values (
        :invoice_number, :full_name, :email, :phone, :date_of_birth, :gender, :id_number,
        :address, :postcode, :qualification, :employment, :experience,
        :selected_program, :payment_plan, :payment_method,
        :program_fee, :plan_discount, :promo_code, :promo_discount, :final_amount,
        :status, :ktp_file
    )";

    try {
        $stmt = $db->prepare($sql);
        $stmt->execute($data);
    } catch (Throwable $e) {
        error_log('DB insert failed: ' . $e->getMessage());
    }
}

/** Update registration row by invoice (if DB configured). */
function dbUpdateRegistration(string $invoiceNumber, array $fields): void
{
    $db = db();
    if (!$db || !$fields) {
        return;
    }

    $allowed = [
        'status',
        'transaction_id',
        'payment_url',
        'doku_response',
        'last_error',
    ];

    $setParts = [];
    $params = [':invoice_number' => $invoiceNumber];
    foreach ($fields as $key => $value) {
        if (!in_array($key, $allowed, true)) {
            continue;
        }
        $setParts[] = $key . ' = :' . $key;
        $params[':' . $key] = $value;
    }

    if (!$setParts) {
        return;
    }

    $sql = 'update public.registrations set ' . implode(', ', $setParts) . ', updated_at = now() where invoice_number = :invoice_number';
    try {
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
    } catch (Throwable $e) {
        error_log('DB update failed: ' . $e->getMessage());
    }
}

/**
 * Generate DOKU request signature
 * Spec: HMAC-SHA256( "Client-Id:{id}\nRequest-Id:{rid}\nRequest-Timestamp:{ts}\nRequest-Target:{path}\nDigest:{digest}" )
 */
function dokuSignature(
    string $clientId, string $secretKey, string $requestId,
    string $timestamp, string $requestTarget, string $body
): string {
    $digest       = base64_encode(hash('sha256', $body, true));
    $componentStr = "Client-Id:{$clientId}\n"
                  . "Request-Id:{$requestId}\n"
                  . "Request-Timestamp:{$timestamp}\n"
                  . "Request-Target:{$requestTarget}\n"
                  . "Digest:{$digest}";
    return 'HMAC SHA256=' . base64_encode(hash_hmac('sha256', $componentStr, $secretKey, true));
}

/** Kirim request ke DOKU API */
function dokuRequest(string $endpoint, array $payload): array
{
    $baseApi   = DOKU_SANDBOX ? 'https://api-sandbox.doku.com' : 'https://api.doku.com';
    $url       = $baseApi . $endpoint;
    $requestId = sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
    $timestamp = gmdate('Y-m-d\TH:i:s\Z');
    $body      = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $signature = dokuSignature(DOKU_CLIENT_ID, DOKU_SECRET_KEY, $requestId, $timestamp, $endpoint, $body);

    $headers = [
        'Content-Type: application/json',
        'Client-Id: '         . DOKU_CLIENT_ID,
        'Request-Id: '        . $requestId,
        'Request-Timestamp: ' . $timestamp,
        'Signature: '         . $signature,
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $body,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 30,
    ]);

    $response  = curl_exec($ch);
    $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);   // FIX: tangkap curl error
    curl_close($ch);

    // FIX: Handle curl network error
    if ($response === false || !empty($curlError)) {
        return [
            'http_code' => 0,
            'body'      => ['message' => 'Koneksi ke server pembayaran gagal: ' . $curlError],
            'raw'       => '',
        ];
    }

    return [
        'http_code' => $httpCode,
        'body'      => json_decode($response, true) ?? [],
        'raw'       => $response,
    ];
}


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  MULAI PROSES REQUEST
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Pastikan server memiliki kredensial
if (empty(DOKU_CLIENT_ID) || empty(DOKU_SECRET_KEY)) {
    redirectError('Konfigurasi server belum lengkap. Hubungi administrator.');
}

// Hanya terima POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /pages/programs.html');
    exit;
}

// FIX: CSRF Token Validation
session_start();
$csrfToken  = $_POST['csrf_token']               ?? '';
$sessionCsrf = $_SESSION['csrf_token']           ?? '';
if (empty($sessionCsrf) || !hash_equals($sessionCsrf, $csrfToken)) {
    redirectError('Permintaan tidak valid (CSRF). Silakan refresh halaman dan coba lagi.');
}
// Hapus token setelah dipakai (one-time use)
unset($_SESSION['csrf_token']);

// 1. Validasi field wajib
$required = [
    'fullname', 'dob', 'gender', 'email', 'phone', 'id_number',
    'address', 'postcode', 'selected_program', 'payment_plan', 'payment_method',
];
foreach ($required as $field) {
    if (empty($_POST[$field])) {
        redirectError("Field '{$field}' tidak boleh kosong.");
    }
}

// 2. Sanitize input
$fullname        = clean($_POST['fullname']);
$dob             = clean($_POST['dob']);
$gender          = clean($_POST['gender']);
$email           = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
$phone           = preg_replace('/[^0-9+]/', '', $_POST['phone']);
$idNumber        = clean($_POST['id_number']);
$address         = clean($_POST['address']);
$postcode        = clean($_POST['postcode']);
$qualification   = clean($_POST['qualification'] ?? '');
$employment      = clean($_POST['employment']    ?? '');
$experience      = clean($_POST['experience']    ?? '');
$selectedProgram = clean($_POST['selected_program']);
$paymentPlan     = clean($_POST['payment_plan']);
$paymentMethod   = clean($_POST['payment_method']);
$promoCode       = strtoupper(clean($_POST['promo_code'] ?? ''));

// 3. Validasi email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirectError('Format email tidak valid.');
}

// FIX: Validasi format nomor telepon Indonesia
if (!preg_match('/^(\+62|62|0)[0-9]{8,13}$/', $phone)) {
    redirectError('Format nomor telepon tidak valid. Gunakan format: 08xx atau +628xx');
}

// 4. FIX: Hitung harga DI SERVER â€” tidak percaya nilai dari form
if (!array_key_exists($selectedProgram, PROGRAM_PRICES)) {
    redirectError('Program tidak valid.');
}
if (!array_key_exists($paymentPlan, PLAN_DISCOUNTS)) {
    redirectError('Paket pembayaran tidak valid.');
}

$programFee       = PROGRAM_PRICES[$selectedProgram];
$programLabel     = PROGRAM_NAMES[$selectedProgram];
$planDiscountRate = PLAN_DISCOUNTS[$paymentPlan];
$planDiscount     = (int) round($programFee * $planDiscountRate);

// FIX: Validasi kode promo di server â€” tidak percaya nilai diskon dari form
$promoDiscount = 0;
$promoRate     = 0.0;
if (!empty($promoCode)) {
    if (!array_key_exists($promoCode, PROMO_CODES)) {
        redirectError('Kode promo tidak valid: ' . $promoCode);
    }
    $promoRate     = PROMO_CODES[$promoCode];
    $promoDiscount = (int) round($programFee * $promoRate);
}

$finalAmount = max($programFee - $planDiscount - $promoDiscount, 0);

if ($finalAmount <= 0) {
    redirectError('Total pembayaran tidak valid.');
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
    redirectError('Format file KTP tidak didukung. Gunakan JPG, PNG, atau PDF.');
}

// Batas ukuran file 5MB
if ($_FILES['id_document']['size'] > 5 * 1024 * 1024) {
    redirectError('Ukuran file KTP maksimal 5MB.');
}

$fileExt  = pathinfo($_FILES['id_document']['name'], PATHINFO_EXTENSION);
$fileName = 'KTP_' . preg_replace('/[^a-zA-Z0-9]/', '', $fullname) . '_' . time() . '.' . $fileExt;
$filePath = UPLOAD_DIR . $fileName;

if (!move_uploaded_file($_FILES['id_document']['tmp_name'], $filePath)) {
    redirectError('Gagal menyimpan file KTP. Hubungi administrator.');
}

// 6. Generate invoice number unik
// Gunakan kode program yang sudah aman (bukan 3 karakter pertama nama)
$programCodes = [
    'assistant_carer' => 'CGV',
    'bartender'       => 'BAR',
    'barista'         => 'BRS',
    'cooking'         => 'CHF',
    'coding'          => 'ITC',
    'electrician'     => 'ELC',
];
$programCode   = $programCodes[$selectedProgram] ?? 'PRG';
$invoiceNumber = 'RA-' . $programCode . '-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid('', true)), 0, 6));

// 6b. Persist registration (best-effort)
$dbData = [
    'invoice_number'  => $invoiceNumber,
    'full_name'       => $fullname,
    'email'           => $email,
    'phone'           => $phone,
    'date_of_birth'   => $dob ?: null,
    'gender'          => $gender,
    'id_number'       => $idNumber,
    'address'         => $address,
    'postcode'        => $postcode,
    'qualification'   => $qualification,
    'employment'      => $employment,
    'experience'      => $experience,
    'selected_program'=> $selectedProgram,
    'payment_plan'    => $paymentPlan,
    'payment_method'  => $paymentMethod,
    'program_fee'     => $programFee,
    'plan_discount'   => $planDiscount,
    'promo_code'      => $promoCode ?: null,
    'promo_discount'  => $promoDiscount,
    'final_amount'    => $finalAmount,
    'status'          => 'initiated',
    'ktp_file'        => $fileName,
];

dbInsertRegistration($dbData);
// 7. Susun payload DOKU Checkout
//    FIX: 'notification_url' (bukan 'callback_url')
//    FIX: line_items price = finalAmount (bukan programFee) agar total cocok
//    FIX: payment_method dimasukkan ke payload
//    FIX: Hapus field non-standar (auto_redirect, callback_url_key)
$payload = [
    'order' => [
        'invoice_number' => $invoiceNumber,
        'line_items'     => [
            [
                'name'     => $programLabel,
                'price'    => $finalAmount,   // FIX: harus sama dengan order amount
                'quantity' => 1,
            ],
        ],
        'amount'           => $finalAmount,
        'currency'         => 'IDR',
        'notification_url' => NOTIFY_URL,     // FIX: field yang benar di DOKU v1
        'session_id'       => $invoiceNumber,
    ],
    'payment' => [
        'payment_due_date' => 1440,           // 24 jam
        'type'             => strtoupper($paymentMethod), // FIX: pass ke DOKU
    ],
    'customer' => [
        'name'  => $fullname,
        'email' => $email,
        'phone' => $phone,
    ],
    'additional_info' => [
        'program'        => $selectedProgram,
        'payment_plan'   => $paymentPlan,
        'promo_code'     => $promoCode,
        'base_price'     => $programFee,
        'plan_discount'  => $planDiscount,
        'promo_discount' => $promoDiscount,
        'ktp_file'       => $fileName,
    ],
];

// 8. Simpan ke session untuk halaman sukses
$_SESSION['pending_invoice'] = [
    'invoice_number' => $invoiceNumber,
    'fullname'       => $fullname,
    'email'          => $email,
    'program'        => $programLabel,
    'amount'         => $finalAmount,
];

// 9. Panggil DOKU API
$result = dokuRequest('/checkout/v1/payment', $payload);

if ($result['http_code'] !== 200) {
    $errMsg = $result['body']['message'] ?? 'Gagal membuat sesi pembayaran DOKU.';
    dbUpdateRegistration($invoiceNumber, [
        'status' => 'failed',
        'last_error' => $errMsg,
        'doku_response' => json_encode($result['body'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    ]);

    redirectError($errMsg);
}

// Ambil payment URL dari response DOKU
// Verifikasi path ini dengan response sandbox aktual jika berbeda
$paymentUrl = $result['body']['response']['payment']['url']
           ?? $result['body']['payment']['url']   // fallback alternatif
           ?? null;

if (empty($paymentUrl)) {
    redirectError('URL pembayaran tidak ditemukan. Coba beberapa saat lagi.');
}

// Update registration with payment URL (best-effort)
dbUpdateRegistration($invoiceNumber, [
    'status' => 'awaiting_payment',
    'payment_url' => $paymentUrl,
    'doku_response' => json_encode($result['body'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
]);

// 10. Redirect ke DOKU Checkout hosted page
header('Location: ' . $paymentUrl);
exit;








