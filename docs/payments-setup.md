# Payment Setup (DOKU + Supabase)

Dokumen ini menjelaskan setup minimum agar flow pembayaran end-to-end berjalan, termasuk database, webhook, dan email.

## 1) Database

Jalankan file ini di Supabase SQL Editor:
- `SUPABASE_PAYMENTS_SETUP.sql`

Tabel utama:
- `public.registrations` (data pendaftar + status pembayaran)
- `public.payment_events` (audit trail webhook)

## 2) Environment Variables

Wajib (DOKU):
- `DOKU_CLIENT_ID`
- `DOKU_SECRET_KEY`
- `DOKU_SANDBOX` (isi `true` untuk sandbox, `false` untuk production)

Database (pilih salah satu):
- `DATABASE_URL` (contoh Supabase Postgres connection string)
- atau gunakan `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`

Email (pilih salah satu transport):
- `MAIL_TRANSPORT=mail` (default, gunakan PHP mail())
- `MAIL_TRANSPORT=smtp` + `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`
- `MAIL_FROM` (wajib), `MAIL_FROM_NAME` (opsional), `MAIL_REPLY_TO` (opsional)

## 3) Webhook

Pastikan URL webhook di DOKU Dashboard mengarah ke:
- `https://redlineacademy.com.au/doku_notify.php`

## 4) Backup dan Retensi Log

- Aktifkan backup terjadwal di Supabase Dashboard.
- Retensi audit trail disimpan di `payment_events`.
- Log file lokal tetap ditulis di `logs/doku_notify.log`.
