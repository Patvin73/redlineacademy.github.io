# Integrasi DOKU Checkout — Redline Academy
## Panduan Setup & Deployment

---

## 📁 File yang Ditambahkan

| File | Lokasi | Fungsi |
|------|--------|--------|
| `submit_registration.php` | `/` (root) | Terima form, panggil DOKU API, redirect ke checkout |
| `doku_notify.php` | `/` (root) | Webhook — terima notifikasi hasil pembayaran dari DOKU |
| `pages/payment_success.html` | `/pages/` | Halaman sesudah bayar sukses |
| `pages/payment_failed.html` | `/pages/` | Halaman sesudah bayar gagal/timeout |

> **`programs.html` tidak perlu diubah** — form action sudah mengarah ke `../submit_registration.php`.

---

## 🔑 Kredensial DOKU yang Diperlukan

Login ke **[my.doku.id](https://my.doku.id)** → Settings → Integration

| Variabel | Keterangan |
|----------|------------|
| `DOKU_CLIENT_ID` | Client ID merchant Anda |
| `DOKU_SECRET_KEY` | Secret Key untuk generate signature |

### Cara Set Kredensial (pilih salah satu):

**Opsi A — Environment Variable (Direkomendasikan)**
```bash
# Di server / .env file
DOKU_CLIENT_ID=your_client_id_here
DOKU_SECRET_KEY=your_secret_key_here
```

**Opsi B — Edit langsung di file** (tidak disarankan untuk production)
```php
// submit_registration.php & doku_notify.php, baris konfigurasi:
define('DOKU_CLIENT_ID',  'ISI_CLIENT_ID_ANDA');
define('DOKU_SECRET_KEY', 'ISI_SECRET_KEY_ANDA');
```

---

## 🌐 URL yang Perlu Didaftarkan di DOKU Dashboard

| Setting | URL |
|---------|-----|
| **Notification URL** (Webhook) | `https://redlineacademy.com.au/doku_notify.php` |
| **Success Redirect URL** | `https://redlineacademy.com.au/pages/payment_success.html` |
| **Failed Redirect URL** | `https://redlineacademy.com.au/pages/payment_failed.html` |

Daftarkan di: DOKU Dashboard → Settings → Payment Configuration

---

## 🔄 Alur Transaksi

```
User isi form programs.html
        ↓
submit_registration.php
  - Validasi input & KTP
  - Hitung total (harga - diskon plan - diskon promo)
  - Generate invoice number unik (RA-ASS-20240308-AB1C2D)
  - POST ke DOKU API /checkout/v1/payment
        ↓
DOKU API → kembalikan payment_url
        ↓
Redirect user ke DOKU Hosted Checkout Page
  (User pilih bank / scan QRIS / input kartu kredit)
        ↓
DOKU POST ke doku_notify.php (webhook)
  - Verifikasi signature HMAC-SHA256
  - Update status di database
  - Kirim email konfirmasi
        ↓
DOKU Redirect user ke:
  ✅ payment_success.html  (jika SUCCESS)
  ❌ payment_failed.html   (jika FAILED/EXPIRED)
```

---

## ⚙️ Setup Server

### PHP Requirements
- PHP >= 7.4
- Extension: `curl`, `json`, `fileinfo`, `openssl`
- Pastikan `allow_url_fopen = On` atau `curl` aktif

### Direktori yang Harus Writable
```
/uploads/ktp/     ← file KTP pendaftar
/logs/            ← log webhook DOKU
```

```bash
mkdir -p uploads/ktp logs
chmod 755 uploads/ktp logs
```

### Keamanan File Upload
Tambahkan `.htaccess` di folder `uploads/` agar file tidak bisa diakses langsung:
```apache
# uploads/.htaccess
Options -Indexes
<FilesMatch "\.(php|php5|phtml)$">
    Deny from all
</FilesMatch>
```

---

## 🧪 Testing (Sandbox)

Pastikan `DOKU_SANDBOX = true` di `submit_registration.php`.

Kartu kredit test DOKU Sandbox:
| Field | Value |
|-------|-------|
| Nomor Kartu | `4111 1111 1111 1111` |
| Expiry | Bulan/tahun mana saja di masa depan |
| CVV | `123` |

Virtual Account test: transfer berapapun ke VA yang digenerate DOKU Sandbox.

---

## 🚀 Checklist Sebelum Go Live

- [ ] Ganti `DOKU_SANDBOX = false` di `submit_registration.php`
- [ ] Set kredensial Production (bukan Sandbox) di environment variable
- [ ] Daftarkan URL Production di DOKU Dashboard
- [ ] Test 1 transaksi nyata sebelum launch
- [ ] Pastikan HTTPS aktif (wajib untuk payment gateway)
- [ ] Tambahkan koneksi database untuk menyimpan status pembayaran
- [ ] Implementasikan pengiriman email konfirmasi di `doku_notify.php`
- [ ] Proteksi folder `uploads/` dan `logs/` dari akses publik

---

## 📞 Referensi

- Dokumentasi DOKU: https://developers.doku.com
- Dashboard Merchant: https://my.doku.id
- DOKU Support: support@doku.com
