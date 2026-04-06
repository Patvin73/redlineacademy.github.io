# 🛡️ Setup: Keep Supabase Alive (Auto-Ping)

Panduan lengkap memasang GitHub Actions agar Supabase tidak auto-pause.

---

## 📁 Struktur File

Letakkan file workflow di dalam repo GitHub kamu:

```
your-project/
└── .github/
    └── workflows/
        └── keep-supabase-alive.yml   ← file ini
```

---

## 🔑 Step 1 — Ambil Credentials Supabase

1. Buka [supabase.com](https://supabase.com) → pilih project kamu
2. Pergi ke **Settings → API**
3. Salin dua nilai ini:
   - **Project URL** → contoh: `https://xyzabc.supabase.co`
   - **anon / public key** → string panjang yang dimulai `eyJ...`

---

## 🔐 Step 2 — Tambahkan Secrets ke GitHub

1. Buka repo GitHub project kamu
2. Klik **Settings → Secrets and variables → Actions**
3. Klik **"New repository secret"**, tambahkan dua secret berikut:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://xyzabc.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` (anon key kamu) |

> ⚠️ Jangan pernah hardcode credentials langsung di file workflow!

---

## 📂 Step 3 — Tambahkan File Workflow

1. Di dalam repo kamu, buat folder `.github/workflows/` jika belum ada
2. Upload atau buat file `keep-supabase-alive.yml` (file yang sudah diberikan)
3. Commit & push ke branch `main`

---

## ✅ Step 4 — Verifikasi Berjalan

1. Di GitHub, klik tab **"Actions"**
2. Kamu akan lihat workflow **"Keep Supabase Alive"**
3. Klik **"Run workflow"** untuk test manual pertama kali
4. Pastikan hasilnya ✅ hijau

---

## ⏰ Jadwal Berjalan

Workflow ini berjalan otomatis setiap **5 hari sekali** pukul **08:00 WIB**.

Karena batas pause Supabase adalah **7 hari**, ping setiap 5 hari memberikan buffer aman 2 hari.

---

## 🔧 Troubleshooting

**Workflow gagal / merah?**
- Pastikan `SUPABASE_URL` tidak ada trailing slash di akhir
- Pastikan `SUPABASE_ANON_KEY` sudah benar (cek di Supabase → Settings → API)
- Coba test manual: jalankan curl di terminal kamu dulu

```bash
curl -s -o /dev/null -w "%{http_code}" \
  "https://YOUR_PROJECT.supabase.co/rest/v1/?limit=1" \
  -H "apikey: YOUR_ANON_KEY"
# Output yang benar: 200
```

**Project sudah terlanjur di-pause?**
- Login ke supabase.com → klik tombol **"Restore"** di project
- Tunggu beberapa menit hingga aktif kembali
- Lalu pasang workflow ini agar tidak terulang

---

## 💡 Tips Tambahan

- Kamu bisa punya **2 project Supabase gratis** — manfaatkan untuk LMS dan portal marketer secara terpisah, tapi pastikan keduanya dipasangi workflow ini
- Jika traffic sudah ramai, pertimbangkan upgrade ke **Supabase Pro ($25/bulan)** untuk menghilangkan batasan pause ini selamanya
