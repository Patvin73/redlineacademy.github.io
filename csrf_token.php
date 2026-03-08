<?php
/**
 * csrf_token.php
 * Redline Academy — CSRF Token Generator
 *
 * CARA PAKAI:
 * Rename programs.html → programs.php, lalu tambahkan di bagian paling atas file (sebelum <!DOCTYPE html>):
 *
 *   <?php require_once 'csrf_token.php'; ?>
 *
 * Dan di dalam <form class="enroll-form"> tambahkan:
 *
 *   <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
 *
 * ALTERNATIF (tanpa rename file ke .php):
 * Buat endpoint PHP kecil yang generate token via fetch/AJAX dari JS,
 * lalu inject ke form sebelum submit.
 */

session_start();

// Generate CSRF token baru jika belum ada di session
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
