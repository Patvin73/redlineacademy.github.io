# Redline Academy - Static Website

Website statis Redline Academy dengan dukungan 2 bahasa (`id` dan `en`), halaman publik, serta modul LMS sederhana (login + dashboard student/admin).  
Redline Academy static website with 2-language support (`id` and `en`), public pages, and a simple LMS module (login + student/admin dashboards).

## Ringkasan | Overview

- Tanpa build step (HTML, CSS, JavaScript vanilla).  
  No build step required (HTML, CSS, vanilla JavaScript).
- Multi-language via atribut `data-i18n` dan objek `translations` di `js/script.js`.  
  Multi-language support via `data-i18n` attributes and the `translations` object in `js/script.js`.
- Form registrasi publik diproses oleh `submit_registration.php`.  
  Public registration form is handled by `submit_registration.php`.
- Modul LMS frontend terhubung ke Supabase (`js/supabase-client.js`, `js/auth.js`, `js/guard.js`).  
  LMS frontend is connected to Supabase (`js/supabase-client.js`, `js/auth.js`, `js/guard.js`).

## Struktur Repository (Detail) | Repository Structure (Detailed)

```text
redlineacademy.github.io/
|-- .github/
|   `-- copilot-instructions.md
|-- .vscode/
|   `-- sftp.json
|-- assets/
|   |-- images/
|   |   |-- apple-touch-icon.png
|   |   |-- assistant_carer.png
|   |   |-- barista.png
|   |   |-- bartender.png
|   |   |-- caregiver.jpg
|   |   |-- carer_in_the_park.png
|   |   |-- care_and_love.png
|   |   |-- caring_hand.png
|   |   |-- coding.jpg
|   |   |-- cooking.png
|   |   |-- dashboard-32x32.png
|   |   |-- elder_support.png
|   |   |-- electrician.png
|   |   |-- favicon-16x16.png
|   |   |-- favicon-32x32.png
|   |   |-- hero_pict.png
|   |   |-- redlinelogo.png
|   |   |-- redlinewlogo.png
|   |   |-- red_line.png
|   |   |-- user_registration.png
|   |   `-- flags/
|   |       |-- en.png
|   |       `-- id.png
|   `-- videos/
|       |-- dengan_kakek.mp4
|       `-- with_grandma.mp4
|-- css/
|   |-- lms-admin.css
|   |-- lms-student.css
|   |-- lms.css
|   `-- style.css
|-- js/
|   |-- auth.js
|   |-- dashboard-admin.js
|   |-- dashboard-student.js
|   |-- guard.js
|   |-- script.js
|   `-- supabase-client.js
|-- pages/
|   |-- about.html
|   |-- blog.html
|   |-- contact.html
|   |-- dashboard-admin.html
|   |-- dashboard-student.html
|   |-- legal.html
|   |-- login.html
|   `-- programs.html
|-- tools/
|   `-- generate_favicons.py
|-- CHANGELOG.md
|-- favicon.ico
|-- index.html
|-- LMS_QUICKSTART.md
|-- package-lock.json
|-- package.json
|-- README.md
|-- robots.txt
|-- serve_favicon.ps1
|-- serve_one.ps1
|-- sitemap.xml
|-- submit_registration.php
|-- SUPABASE_LMS_SETUP.sql
|-- SUPABASE_USER_ROLE_TEMPLATE.sql
`-- test-lang.html
```

Catatan: folder `node_modules/` ada di local environment dan tidak didokumentasikan rinci di atas.  
Note: `node_modules/` exists in local environment and is intentionally not listed in detail above.

## Bagan Struktur | Structure Diagram (Mermaid)

```mermaid
flowchart TD
    ROOT[redlineacademy.github.io]

    ROOT --> A[assets/]
    ROOT --> C[css/]
    ROOT --> J[js/]
    ROOT --> P[pages/]
    ROOT --> T[tools/]
    ROOT --> F1[index.html]
    ROOT --> F2[submit_registration.php]
    ROOT --> F3[sitemap.xml]
    ROOT --> F4[robots.txt]
    ROOT --> F5[LMS_QUICKSTART.md]
    ROOT --> F6[SUPABASE_LMS_SETUP.sql]
    ROOT --> F7[SUPABASE_USER_ROLE_TEMPLATE.sql]

    A --> A1[images/]
    A --> A2[videos/]
    A1 --> A1a[flags/]
    A1a --> A1b[id.png]
    A1a --> A1c[en.png]

    C --> C1[style.css]
    C --> C2[lms.css]
    C --> C3[lms-admin.css]
    C --> C4[lms-student.css]

    J --> J1[script.js (i18n + UI logic)]
    J --> J2[supabase-client.js]
    J --> J3[auth.js]
    J --> J4[guard.js]
    J --> J5[dashboard-admin.js]
    J --> J6[dashboard-student.js]

    P --> P1[about.html]
    P --> P2[programs.html]
    P --> P3[contact.html]
    P --> P4[blog.html]
    P --> P5[legal.html]
    P --> P6[login.html]
    P --> P7[dashboard-admin.html]
    P --> P8[dashboard-student.html]
```

## Peta Halaman | Page Map

- Publik | Public:
  - `/index.html`
  - `/pages/about.html`
  - `/pages/programs.html`
  - `/pages/contact.html`
  - `/pages/blog.html`
  - `/pages/legal.html`
- LMS:
  - `/pages/login.html`
  - `/pages/dashboard-student.html`
  - `/pages/dashboard-admin.html`

## Komponen Penting | Key Components

- `js/script.js`: dictionary terjemahan + logika pergantian bahasa.  
  `js/script.js`: translation dictionary + language switching logic.
- `js/supabase-client.js`: inisialisasi Supabase client di frontend.  
  `js/supabase-client.js`: Supabase client initialization on frontend.
- `js/auth.js`: login/logout + redirect dashboard berbasis role.  
  `js/auth.js`: login/logout + role-based dashboard redirect.
- `js/guard.js`: proteksi/validasi akses halaman LMS.  
  `js/guard.js`: LMS page access guard/validation.
- `submit_registration.php`: endpoint server-side untuk submit registrasi.  
  `submit_registration.php`: server-side endpoint for registration submission.
- `SUPABASE_LMS_SETUP.sql` dan `SUPABASE_USER_ROLE_TEMPLATE.sql`: template setup database dan role.  
  `SUPABASE_LMS_SETUP.sql` and `SUPABASE_USER_ROLE_TEMPLATE.sql`: database and role setup templates.

## Menjalankan Secara Lokal | Run Locally

1. Buka terminal di root project.  
   Open terminal in the project root.
2. Jalankan static server:  
   Start the static server:

```bash
python -m http.server 8000
```

3. Buka `http://localhost:8000` di browser.  
   Open `http://localhost:8000` in your browser.

Alternatif Windows | Windows helpers:

- `serve_one.ps1` untuk skenario serve halaman tertentu.  
  `serve_one.ps1` for single-page serve scenarios.
- `serve_favicon.ps1` untuk validasi favicon route.  
  `serve_favicon.ps1` for favicon route checks.

## Workflow Multi-language | Internationalization Workflow

1. Tambahkan `data-i18n="yourKey"` pada elemen HTML.  
   Add `data-i18n="yourKey"` to HTML elements.
2. Tambahkan `yourKey` pada `translations.id` dan `translations.en` di `js/script.js`.  
   Add `yourKey` to both `translations.id` and `translations.en` in `js/script.js`.
3. Pastikan konten yang harus diterjemahkan tidak hardcoded di luar alur i18n.  
   Ensure translatable content is not hardcoded outside the i18n flow.

## Deployment

Target deployment yang cocok | Suitable deployment targets:

- GitHub Pages
- Netlify
- Vercel (static mode)
- Shared/static hosting lainnya | Other static/shared hosting

Checklist sebelum deploy | Pre-deploy checklist:

- Perbarui `sitemap.xml` jika URL berubah.  
  Update `sitemap.xml` when URLs change.
- Pastikan `robots.txt` sesuai environment target.  
  Verify `robots.txt` for the target environment.
- Cek ulang path aset relatif pada semua file di `pages/`.  
  Recheck relative asset paths in all files under `pages/`.

## Kontak Redline Academy | Redline Academy Contact

- Email: `hello@redlineacademy.com.au`
- Telepon | Phone: `+61 408 578 253` `+62 821-2017-1731`

---

**Developed and maintained by Patrio Vincentio, Email: patvin73@gmail.com** Update: 2026-03-08
