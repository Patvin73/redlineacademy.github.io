# Redline Academy

Website Redline Academy dengan halaman publik bilingual (`id` dan `en`) serta modul LMS dan operasional yang terhubung ke Supabase.

## Overview

- Frontend publik menggunakan HTML, CSS, dan JavaScript vanilla.
- Mendukung multi-language melalui `data-i18n` dan dictionary di `js/script.js`.
- Login dan dashboard berbasis role tersedia untuk `student`, `admin`/`trainer`, dan `marketer`.
- Pendaftaran publik saat ini dikirim ke Supabase Edge Function `public-enroll`.
- Pembayaran sementara menggunakan manual transfer dan diverifikasi oleh admin.

## Architecture

Repo ini bersifat `hybrid`:

- `Static frontend`: halaman publik di `index.html` dan folder `pages/`
- `Dynamic app layer`: auth, session, role guard, dan dashboard berbasis Supabase
- `Legacy backend`: beberapa file PHP lama masih ada di repo, tetapi bukan jalur utama untuk flow aktif saat ini

## Main Pages

- Public:
  `/index.html`, `/pages/about.html`, `/pages/programs.html`, `/pages/contact.html`, `/pages/blog.html`
- App:
  `/pages/login.html`, `/pages/dashboard-student.html`, `/pages/dashboard-admin.html`, `/pages/dashboard-marketer.html`

## Key Files

- `js/script.js`: i18n dan interaksi UI publik
- `js/auth.js`: login, logout, dan redirect berbasis role
- `js/guard.js`: proteksi akses dashboard
- `scripts/dashboard-admin.js`: logika dashboard admin/trainer
- `scripts/dashboard-marketer.js`: logika portal marketer
- `supabase/functions/public-enroll/index.ts`: endpoint aktif untuk pendaftaran publik

## User Flow

- Ringkas: `docs/user-flow-manual-transfer.mmd`
- Per role: `docs/user-flow-by-role.mmd`

## Run Locally

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Contact

- Email: `hello@redlineacademy.com.au`
- Phone: `+61 408 578 253`
- Indonesia: `+62 821-2017-1731`

Develop & Design by Patrio Vincentio, email patvin73@gmail.com
