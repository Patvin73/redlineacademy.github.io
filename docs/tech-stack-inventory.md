# Inventarisasi Tech Stack (Current) + Gap Mapping

Repo: `D:\OneDrive\Dokumen\GitHub\redlineacademy.github.io`  
Terakhir dipindai: 2026-03-11

Dokumen ini merangkum teknologi yang benar-benar terlihat dipakai di repo saat ini, lalu memetakan komponen yang belum ada namun diperlukan agar fitur yang sudah ada (LMS + payment + upload) berjalan end-to-end dan aman di production.

## 1) Inventarisasi Semua Komponen Tech Stack Saat Ini

### Frontend

- Framework/library
  - HTML/CSS/JavaScript vanilla (tanpa framework SPA).
  - Supabase JS SDK v2 via CDN: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` (contoh: `pages/login.html`, `pages/dashboard-*.html`).
  - Google Fonts (mis. Bricolage Grotesque, DM Sans, Nunito): `css/style.css` dan `pages/dashboard-*.html`.
- State management
  - Vanilla state via DOM + data-attributes.
  - `localStorage` untuk bahasa (`js/script.js`).
  - `sessionStorage` untuk invoice/nama di halaman hasil pembayaran (`pages/payment_success.html`).
- UI component library
  - Tidak ada UI library pihak ketiga yang terdeteksi (komponen dibangun via CSS custom).
- Tools build (Vite/Webpack/dll)
  - Tidak ada build step (lihat `README.md`).
  - Local dev server sederhana: `tools/static-server.js`, juga ada helper PowerShell `serve_one.ps1` dan `serve_favicon.ps1`.

### Backend

- Bahasa pemrograman
  - PHP (file: `submit_registration.php`, `doku_notify.php`, `get_csrf_token.php`).
- Framework
  - Tidak ada framework backend (plain PHP).
- Autentikasi & otorisasi
  - Supabase Auth (email/password) digunakan di frontend LMS (`js/auth.js`, `pages/login.html`).
  - Proteksi halaman via guard di frontend (`js/guard.js`).
  - Otorisasi data mengandalkan RLS/policy Supabase (lihat file SQL Supabase di root).

### Database

- Jenis DB
  - Supabase (PostgreSQL) untuk LMS dan data terkait (file: `SUPABASE_LMS_SETUP.sql`, `SUPABASE_MARKETER_SETUP.sql`, dll).
- ORM/query builder
  - Supabase client JS (PostgREST) dari browser (lihat query `.from("profiles")` dll di `js/dashboard-*.js`).
- Tools migrasi dan seeding
  - SQL manual dijalankan lewat Supabase SQL Editor (lihat `LMS_QUICKSTART.md`).
  - Tidak ada tool migrasi terstandardisasi (mis. `supabase migrations`) yang terdeteksi di repo.

### Infrastruktur & Deployment

- Hosting/server
  - Hosting shared (Hostinger) terindikasi dari konfigurasi VS Code FTP: `.vscode/sftp.json` menunjuk ke `.../public_html`.
  - Catatan: GitHub Pages cocok untuk static, tapi tidak bisa menjalankan PHP, sehingga flow DOKU (PHP) butuh hosting yang menjalankan PHP (seperti Hostinger).
- CI/CD
  - Tidak ada GitHub Actions / pipeline otomatis yang terdeteksi (folder `.github` hanya berisi instruksi).
- Version control
  - Git + GitHub repository.

### Layanan Pihak Ketiga

- Payment gateway
  - DOKU Checkout API (lihat `DOKU_SETUP.md`, `submit_registration.php`, `doku_notify.php`).
- Email service
  - Belum ada service email yang benar-benar terimplementasi.
  - `doku_notify.php` masih TODO untuk "kirim email konfirmasi".
- Storage
  - Upload KTP disimpan di filesystem server, di luar webroot: `uploads_private/ktp/` (lihat `submit_registration.php`).
  - Logging webhook DOKU ke file: `logs/doku_notify.log` (lihat `doku_notify.php`).

## 2) Mapping Yang Belum Ada dan Wajib Harus Ada

Di bawah ini "wajib" dimaknai: wajib agar fitur yang sudah ada (registrasi + pembayaran + LMS) siap production dan bisa diaudit saat ada masalah.

### Wajib (Untuk Payment End-to-End)

1. Database untuk order/registrasi pembayaran
   - Saat ini `doku_notify.php` hanya log dan TODO, belum ada tempat persist status transaksi.
   - Wajib ada tabel seperti `registrations` / `orders` yang menyimpan minimal: `invoice_number`, data pendaftar, `selected_program`, `final_amount`, `status`, `transaction_id`, timestamps.
2. Update status pembayaran dari webhook (idempotent)
   - Wajib implement `UPDATE ... WHERE invoice_number=...` dan pastikan webhook aman di-retry (idempotency).
3. Email konfirmasi transaksi
   - Wajib kirim email ke customer setelah `SUCCESS` (dan opsional internal alert).
   - Pilih salah satu: SMTP (mis. Hostinger SMTP) atau provider (SendGrid/Mailgun/dll).
4. Pemisahan environment sandbox vs production (payment)
   - Saat ini `DOKU_SANDBOX` di `submit_registration.php` masih `true`; wajib prosedur switch yang jelas untuk production.
5. Backup dan audit trail
   - Minimal: backup DB Supabase terjadwal dan retensi log webhook (atau kirim log ke DB).

### Wajib (Untuk Operasional & Keamanan Minimum)

1. Hindari konfigurasi deploy sensitif di repo
   - `.vscode/sftp.json` berisi detail host/username/remotePath (meski tanpa password); sebaiknya dipindah ke konfigurasi lokal (tidak di-commit) atau pakai secret di CI.
2. Rate limiting / anti-spam untuk form registrasi
   - Karena ada endpoint publik (`submit_registration.php` + upload), wajib mitigasi spam (mis. CAPTCHA atau throttling per IP).
3. Observability dasar
   - Minimal: error logging terstruktur (bukan hanya append file), monitoring uptime endpoint webhook, dan alert kalau webhook sering gagal.

### Sangat Disarankan (Agar Maintainable)

1. CI minimal
   - Lint/format dasar, cek link, dan smoke test Playwright (repo sudah punya dependency `playwright` di `package.json`, tapi belum ada script test yang berguna).
2. Standarisasi migrasi Supabase
   - Gunakan `supabase` CLI + folder migrations agar perubahan skema tidak hanya "copy-paste SQL".
3. Staging environment
  - Domain test/live QA + Supabase live project + DOKU sandbox untuk uji end-to-end sebelum production.
