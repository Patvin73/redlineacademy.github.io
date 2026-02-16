# Redline Academy - Website Statis Multi-Language

Website modern dan responsif untuk Redline Academy dengan dukungan multi-language (Indonesia dan Inggris).

## 📋 Deskripsi Proyek

Redline Academy adalah platform pelatihan vokasi bersertifikat Australia yang menawarkan berbagai program pelatihan profesional. Website ini dibangun sebagai aplikasi web statis dengan HTML, CSS, dan JavaScript vanilla, tanpa dependencies eksternal.

## Fitur Utama

- **Multi-Language Support**: Dukungan penuh untuk Bahasa Indonesia dan Bahasa Inggris
- **Responsive Design**: Desain yang responsif dan mobile-friendly
- **Modern Corporate Style**: Desain modern dengan warna profesional (merah dan biru)
- **Multi-Page Navigation**: 6 halaman utama dengan navigasi yang intuitif
- **Static Website**: Tidak memerlukan server backend, hanya HTML/CSS/JS
- **Smooth Animations**: Animasi yang halus dan engaging
- **SEO Friendly**: Meta tags dan struktur HTML yang SEO-friendly

## Struktur Folder

```
redline-academy/
├── index.html                 # Halaman utama (Homepage)
├── pages/
│   ├── about.html            # Halaman Tentang Kami
│   ├── programs.html         # Halaman Program
│   ├── contact.html          # Halaman Hubungi Kami
│   ├── blog.html             # Halaman Blog
│   └── legal.html            # Halaman Legal (Terms & Privacy)
├── css/
│   └── style.css             # Stylesheet utama
├── js/
│   └── script.js             # JavaScript untuk multi-language dan interaksi
├── assets/
│   └── images/               # Folder untuk semua gambar/logo
│       ├── redlineacademy_logo.png
│       ├── redlineacademy_logo_header.png
│       ├── hero_pict.png
│       ├── assistant_carer.png
│       ├── bartender.png
│       ├── cooking.png
│       ├── barista.png
│       ├── coding.jpg
│       └── electrician.png
└── README.md                 # File dokumentasi ini
```

## Halaman-Halaman

### 1. Homepage (index.html)

- Hero section dengan call-to-action
- Program showcase dengan 6 program utama
- Komitmen dan nilai-nilai academy
- Testimonial dari alumni
- Contact form terintegrasi

### 2. About Us (pages/about.html)

- Deskripsi lengkap tentang academy
- Visi dan misi
- Nilai-nilai perusahaan
- Tim management

### 3. Programs (pages/programs.html)

- Detail 6 program pelatihan:
  - Assistant Carer (Asisten Perawat)
  - Bartender
  - Cooking (Chef)
  - Barista
  - Coding (IT)
  - Electrician (Teknisi Listrik)
- Deskripsi, durasi, dan sertifikasi setiap program

### 4. Contact Us (pages/contact.html)

- Formulir kontak interaktif
- Informasi kontak lengkap
- Jam kerja
- FAQ (Frequently Asked Questions)
- Integrasi Google Maps

### 5. Blog (pages/blog.html)

- Daftar artikel blog
- Pagination
- Newsletter subscription

### 6. Legal (pages/legal.html)

- Terms & Conditions
- Privacy Policy
- Tab navigation untuk switching antar section

## Desain & Styling

### Warna Utama

- **Primary Color**: #EF4444 (Merah terang)
- **Secondary Color**: #3B82F6 (Biru)
- **Background**: #FFFFFF (Putih)
- **Text Dark**: #1F2937 (Abu-abu gelap)
- **Text Light**: #6B7280 (Abu-abu terang)

### Typography

- Font: System fonts (Segoe UI, Roboto, sans-serif)
- Responsive font sizes
- Proper line heights untuk readability

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Multi-Language System

Website menggunakan sistem i18n (internationalization) sederhana dengan JavaScript:

### Cara Kerja

1. Semua text yang perlu diterjemahkan memiliki atribut `data-i18n="key"`
2. File `script.js` mengandung object dengan semua terjemahan
3. Tombol language switcher di header mengubah bahasa secara real-time
4. Bahasa yang dipilih disimpan di localStorage

### Menambah Terjemahan Baru

1. Buka `js/script.js`
2. Cari object `translations`
3. Tambahkan key baru dengan terjemahan untuk ID dan EN
4. Tambahkan `data-i18n="key"` pada elemen HTML yang ingin diterjemahkan

Contoh:

```javascript
translations = {
  id: {
    home: "Beranda",
    about: "Tentang Kami",
    // ... tambah key baru di sini
  },
  en: {
    home: "Home",
    about: "About Us",
    // ... tambah key baru di sini
  },
};
```

## Cara Menggunakan

### 1. Membuka Website Secara Lokal

- Buka file `index.html` langsung di browser
- Atau gunakan local server:
  ```bash
  python3 -m http.server 8000
  ```
  Kemudian akses `http://localhost:8000`

### 2. Mengedit Konten

- Edit file HTML di folder `pages/` untuk mengubah konten
- Edit `css/style.css` untuk mengubah styling
- Edit `js/script.js` untuk mengubah JavaScript atau terjemahan

### 3. Menambah Halaman Baru

1. Buat file HTML baru di folder `pages/`
2. Copy struktur dari halaman existing
3. Update navigation links di semua halaman
4. Tambahkan terjemahan di `script.js` jika diperlukan

### 4. Mengubah Gambar/Assets

- Ganti file di folder `assets/images/`
- Pastikan nama file sesuai dengan referensi di HTML
- Gunakan format yang dioptimalkan (PNG untuk logo, JPG untuk foto)

## Browser Support

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## SEO Optimization

- Semantic HTML structure
- Meta descriptions pada setiap halaman
- Open Graph tags untuk social sharing
- Mobile-friendly viewport settings
- Fast loading times (static files)

## Deployment

Website dapat di-deploy ke berbagai platform:

### GitHub Pages

1. Push repository ke GitHub
2. Enable GitHub Pages di settings
3. Website akan accessible di `username.github.io/redline-academy`

### Netlify

1. Connect repository ke Netlify
2. Set build command: (tidak perlu, static site)
3. Deploy

### Traditional Hosting

1. Upload semua file ke hosting server
2. Pastikan struktur folder tetap sama
3. Website siap diakses

## Troubleshooting

### Language tidak berubah

- Buka browser console (F12)
- Pastikan tidak ada error
- Cek localStorage di DevTools

### Gambar tidak muncul

- Pastikan path gambar benar
- Cek apakah file ada di folder `assets/images/`
- Gunakan path relatif yang benar

### Styling tidak sesuai

- Clear browser cache (Ctrl+Shift+Delete)
- Reload halaman (Ctrl+F5)
- Cek apakah file `css/style.css` ter-load dengan baik

## Lisensi

Copyright © 2025 Redline Academy. Semua hak dilindungi.

## Kontak

- Email: hello@redlineacademy.com.au
- Telepon: +61 408 578 253
- WhatsApp: Chat dengan kami
- Alamat: Jl. Terusan Jakarta No.330 KAV. 25, Bandung - West Java, Indonesia

---

**Dibuat oleh Patrio Vincentio for Redline Academy**
