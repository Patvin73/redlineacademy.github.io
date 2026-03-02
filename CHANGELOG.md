# Changelog — ringkas

**2026-02-25**

- CSS: `css/style.css` — direfaktor (struktur ulang, duplikasi dihapus, media query dikelompokkan). Tidak mengubah tampilan, kelas, atau breakpoint.
- CSS: `css/style.css` — WhatsApp floating button: ganti latar menjadi hijau WhatsApp (#25D366), ukuran diperbesar (64px desktop, 56px mobile), ikon SVG sedikit diperbesar.
- HTML: `index.html` — tambah secondary hero CTA ("Submit an Enquiry") dan penempatan CTA wrapper; tambahkan callout "Care Giver Excellence".
- Pages: `pages/programs.html`, `pages/about.html`, `pages/contact.html`, `pages/blog.html`, `pages/legal.html` — tambahkan anchor WhatsApp float ke seluruh halaman; `pages/programs.html`: ubah blok pembelajaran jadi 3-kolom dalam kartu dan center CTA.
- JS: `js/script.js` — tambahkan kunci i18n baru untuk teks/label yang ditambahkan (hero CTA, callout, programs details).
- Global styles: perbaikan hover tombol menjadi outline/transparent, pengurangan spasi vertikal antar-seksi, dan penggantian warna primer menjadi variabel gradient (`--primary-gradient`) pada elemen yang relevan.

Catatan: Perubahan bersifat struktural dan gaya; mohon lakukan verifikasi visual (desktop & mobile) untuk memastikan stacking/kontras sesuai kebutuhan.
