const { slugify, titleCase, trimToLength } = require('./text');

function makeSeoTitle(keyword) {
  const base = `${titleCase(keyword)} | Pelatihan Caregiver Indonesia`;
  if (base.length <= 60) return base;
  return trimToLength(`${titleCase(keyword)} | Redline Academy`, 60);
}

function makeMetaDescription(keyword, location) {
  const base = `Pelajari ${keyword} di ${location} bersama Redline Academy. Program caregiver bersertifikat, praktik langsung, panduan karier, dan FAQ lengkap.`;
  return trimToLength(base, 155);
}

function makeIntro(keyword, searchIntent, location) {
  return `Halaman ini membahas ${keyword} untuk kebutuhan ${searchIntent} di ${location}. Konten disusun agar calon peserta memahami materi, biaya, jalur belajar, dan langkah pendaftaran.`;
}

function makeFaq(keyword, location) {
  return [
    {
      question: `Apakah ${keyword} cocok untuk pemula?`,
      answer:
        'Ya. Program dirancang bertahap dari dasar hingga praktik, termasuk pendampingan untuk peserta tanpa pengalaman kerja di bidang perawatan.',
    },
    {
      question: `Berapa lama durasi ${keyword} di ${location}?`,
      answer:
        'Durasi bergantung paket belajar, namun umumnya mencakup teori, praktik terstruktur, dan asesmen akhir sebelum sertifikasi diterbitkan.',
    },
    {
      question: 'Apakah ada dukungan setelah lulus?',
      answer:
        'Ada. Peserta mendapatkan panduan penyusunan CV, simulasi wawancara, serta arahan jalur kerja di fasilitas layanan perawatan.',
    },
  ];
}

function buildPageModel(record) {
  const slug = slugify(record.keyword);
  const seoTitle = makeSeoTitle(record.keyword);
  const metaDescription = makeMetaDescription(record.keyword, record.location);
  const headingTitle = `${titleCase(record.keyword)} di ${record.location}`;
  const intro = makeIntro(record.keyword, record.searchIntent, record.location);
  const faq = makeFaq(record.keyword, record.location);

  const sections = [
    {
      h2: `Mengapa ${record.keyword} penting?`,
      paragraphs: [
        `Permintaan tenaga caregiver terus tumbuh di ${record.location}. Memahami ${record.keyword} membantu Anda memilih program yang relevan dengan kebutuhan industri.`,
        'Fokus pembelajaran tidak hanya teori, tetapi juga komunikasi empatik, keselamatan pasien, dan standar layanan yang konsisten.',
      ],
      h3: [
        {
          title: 'Kompetensi inti yang dipelajari',
          points: [
            'Pendampingan aktivitas harian dan personal care',
            'Komunikasi efektif dengan keluarga dan tim medis',
            'Pencegahan risiko serta prosedur keselamatan dasar',
          ],
        },
      ],
    },
    {
      h2: 'Struktur program yang direkomendasikan',
      paragraphs: [
        'Kurikulum terbaik memadukan pembelajaran online, praktik terarah, dan asesmen berbasis kasus nyata.',
      ],
      h3: [
        {
          title: 'Komponen belajar',
          points: [
            'Modul teori terstruktur per topik layanan',
            'Praktik lapangan dengan supervisi',
            'Evaluasi kompetensi untuk kesiapan kerja',
          ],
        },
      ],
    },
    {
      h2: 'Langkah memulai pendaftaran',
      paragraphs: [
        'Siapkan dokumen identitas, pilih jadwal belajar, dan konsultasikan target karier Anda agar rencana belajar lebih tepat sasaran.',
      ],
      h3: [
        {
          title: 'Checklist sebelum mendaftar',
          points: [
            'Pastikan tujuan karier dan minat spesialisasi caregiver',
            'Bandingkan kurikulum, durasi, serta model pembelajaran',
            'Konfirmasi skema biaya dan dukungan pasca-lulus',
          ],
        },
      ],
    },
  ];

  return {
    ...record,
    slug,
    seoTitle,
    metaDescription,
    headingTitle,
    intro,
    sections,
    faq,
  };
}

module.exports = {
  buildPageModel,
};
