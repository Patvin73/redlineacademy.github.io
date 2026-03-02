<?php
/**
 * Redline Academy – Registration Form Handler
 * Handles file upload (KTP) + sends email notification
 * Place this file in the ROOT of your Hostinger public_html folder
 */

// ── CONFIGURATION – ubah sesuai kebutuhan ──────────────────────────────────
define('ADMIN_EMAIL',    'hello@redlineacademy.com.au'); // Email penerima notifikasi
define('FROM_EMAIL',     'hello@redlineacademy.com.au'); // Email pengirim
define('UPLOAD_DIR',     __DIR__ . '/uploads/ktp/');    // Folder penyimpanan KTP
define('MAX_FILE_SIZE',  5 * 1024 * 1024);              // Maks 5 MB
define('ALLOWED_TYPES',  ['image/jpeg','image/png','image/webp','application/pdf']);
define('SUCCESS_URL',    '/pages/programs.html?status=success');
define('ERROR_URL',      '/pages/programs.html?status=error');
// ───────────────────────────────────────────────────────────────────────────

// Hanya terima POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

// ── 1. Kumpulkan & sanitasi data form ──────────────────────────────────────
function clean(string $val): string {
    return htmlspecialchars(trim(strip_tags($val)), ENT_QUOTES, 'UTF-8');
}

$fullname      = clean($_POST['fullname']      ?? '');
$dob           = clean($_POST['dob']           ?? '');
$gender        = clean($_POST['gender']        ?? '');
$email         = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone         = clean($_POST['phone']         ?? '');
$id_number     = clean($_POST['id_number']     ?? '');
$address       = clean($_POST['address']       ?? '');
$postcode      = clean($_POST['postcode']      ?? '');
$qualification = clean($_POST['qualification'] ?? '');
$employment    = clean($_POST['employment']    ?? '');
$experience    = clean($_POST['experience']    ?? '');
$accuracy      = isset($_POST['accuracy']);
$terms         = isset($_POST['terms']);

// ── 2. Validasi field wajib ────────────────────────────────────────────────
$errors = [];

if (empty($fullname))                           $errors[] = 'Nama lengkap wajib diisi.';
if (empty($dob))                                $errors[] = 'Tanggal lahir wajib diisi.';
if (empty($gender))                             $errors[] = 'Jenis kelamin wajib dipilih.';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL))
                                                $errors[] = 'Email tidak valid.';
if (empty($phone))                              $errors[] = 'Nomor telepon wajib diisi.';
if (empty($id_number))                          $errors[] = 'Nomor KTP wajib diisi.';
if (empty($address))                            $errors[] = 'Alamat wajib diisi.';
if (empty($postcode))                           $errors[] = 'Kode pos wajib diisi.';
if (!$accuracy)                                 $errors[] = 'Pernyataan kebenaran data wajib dicentang.';
if (!$terms)                                    $errors[] = 'Persetujuan syarat & ketentuan wajib dicentang.';

// ── 3. Validasi file KTP ───────────────────────────────────────────────────
$fileUploaded = false;
$savedFileName = '';

if (!isset($_FILES['id_document']) || $_FILES['id_document']['error'] === UPLOAD_ERR_NO_FILE) {
    $errors[] = 'Foto/scan KTP wajib diunggah.';
} elseif ($_FILES['id_document']['error'] !== UPLOAD_ERR_OK) {
    $errors[] = 'Terjadi kesalahan saat mengunggah file KTP (kode: ' . $_FILES['id_document']['error'] . ').';
} else {
    $file = $_FILES['id_document'];

    // Cek ukuran
    if ($file['size'] > MAX_FILE_SIZE) {
        $errors[] = 'Ukuran file KTP maksimal 5 MB.';
    }

    // Cek tipe file (gunakan finfo, bukan ekstensi)
    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
    if (!in_array($mimeType, ALLOWED_TYPES, true)) {
        $errors[] = 'Format file KTP harus JPG, PNG, WEBP, atau PDF.';
    }

    $fileUploaded = empty($errors);
}

// ── 4. Jika ada error, redirect balik ────────────────────────────────────
if (!empty($errors)) {
    $msg = urlencode(implode(' | ', $errors));
    header("Location: " . ERROR_URL . "&msg=$msg");
    exit;
}

// ── 5. Simpan file KTP ke server ──────────────────────────────────────────
// Buat folder jika belum ada
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// Nama file aman: timestamp + id_number (tanpa spasi) + ekstensi asli
$ext           = pathinfo($_FILES['id_document']['name'], PATHINFO_EXTENSION);
$safeName      = preg_replace('/[^a-zA-Z0-9_-]/', '', $id_number);
$savedFileName = date('Ymd_His') . '_' . $safeName . '.' . strtolower($ext);
$destination   = UPLOAD_DIR . $savedFileName;

if (!move_uploaded_file($_FILES['id_document']['tmp_name'], $destination)) {
    header("Location: " . ERROR_URL . "&msg=" . urlencode('Gagal menyimpan file KTP di server.'));
    exit;
}

// ── 6. Kirim email notifikasi ke admin ────────────────────────────────────
$genderLabel = match($gender) {
    'male'   => 'Laki-laki',
    'female' => 'Perempuan',
    default  => 'Lainnya',
};
$employmentLabel = match($employment) {
    'employed'   => 'Bekerja',
    'unemployed' => 'Tidak Bekerja',
    'student'    => 'Pelajar',
    default      => '-',
};

$subject = "Pendaftaran Baru – Redline Academy: $fullname";

$body = "
================================================
  PENDAFTARAN BARU – REDLINE ACADEMY
================================================

--- INFORMASI PRIBADI ---
Nama Lengkap   : $fullname
Tanggal Lahir  : $dob
Jenis Kelamin  : $genderLabel
Email          : $email
Telepon        : $phone
Nomor KTP      : $id_number
Alamat         : $address
Kode Pos       : $postcode

--- PENDIDIKAN & LATAR BELAKANG ---
Pendidikan     : " . ($qualification ?: '-') . "
Status Kerja   : $employmentLabel
Pengalaman     : " . ($experience ?: '-') . "

--- FILE KTP ---
Nama File      : $savedFileName
Lokasi Server  : uploads/ktp/$savedFileName

--- PERNYATAAN ---
Kebenaran Data : Ya
Syarat & Ketentuan: Ya

--- WAKTU SUBMIT ---
" . date('d M Y H:i:s T') . "
================================================
";

$headers  = "From: Redline Academy Form <" . FROM_EMAIL . ">\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

mail(ADMIN_EMAIL, $subject, $body, $headers);

// ── 7. Redirect ke halaman sukses ─────────────────────────────────────────
header("Location: " . SUCCESS_URL);
exit;
