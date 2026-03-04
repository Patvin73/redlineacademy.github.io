# LMS Quickstart (Supabase)

## 1) Isi konfigurasi client
Edit `js/supabase-client.js`:
- `YOUR_SUPABASE_URL`
- `YOUR_SUPABASE_ANON_KEY`

Gunakan anon key (public), jangan pakai service role key.

## 2) Setup database dan policy
Jalankan file SQL berikut di Supabase SQL Editor:
- `SUPABASE_LMS_SETUP.sql`

## 3) Buat user awal
- Buat akun di Supabase Authentication (email/password).
- Login pertama akan membuat row profile otomatis via trigger.

## 4) Set role dan ID
Contoh update manual:

```sql
update public.profiles
set role = 'admin', admin_id = 'ADM-001'
where email = 'admin@contoh.com';

update public.profiles
set role = 'student', student_id = 'STD-001'
where email = 'student@contoh.com';
```

## 5) URL halaman LMS
- Login: `pages/login.html`
- Dashboard student: `pages/dashboard-student.html`
- Dashboard admin: `pages/dashboard-admin.html`

## 6) Catatan deploy
Jika frontend di GitHub Pages, tetap bisa dipakai karena autentikasi berjalan langsung ke Supabase.
