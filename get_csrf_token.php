<?php
/**
 * get_csrf_token.php
 * Redline Academy — CSRF Token Endpoint
 *
 * Dipanggil via fetch() dari programs.html (JavaScript)
 * sebelum form di-submit. Mengembalikan token JSON.
 *
 * Letakkan di: / (root, sama level dengan submit_registration.php)
 */

session_start();

// Generate token baru jika belum ada
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Hanya boleh diakses dari domain sendiri
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

// Cegah akses dari domain lain (CORS sederhana)
$allowedOrigin = 'https://redlineacademy.com.au';
$origin        = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === $allowedOrigin) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Access-Control-Allow-Credentials: true');
}

echo json_encode(['token' => $_SESSION['csrf_token']]);
