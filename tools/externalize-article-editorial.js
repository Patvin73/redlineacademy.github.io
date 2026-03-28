const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const configs = {
  "pages/pelatihan-caregiver-indonesia.html": {
    metaPrefix: "pelatihan",
    author: {
      roleId: "Ditulis oleh",
      roleEn: "Written by",
      name: "Redline Academy Editorial Team",
      bioId:
        "Tim editorial Redline Academy menulis tentang caregiver training, credential design, dan pathway karier internasional untuk membantu pembaca mengambil keputusan dengan lebih percaya diri.",
      bioEn:
        "The Redline Academy editorial team writes about caregiver training, credential design, and international career pathways to help readers make clearer decisions.",
    },
    tags: ["pelatihan caregiver indonesia", "australian nmf", "caregiver training", "career pathway"],
    stats: [
      {
        value: "11.7%",
        labelId: "Populasi lansia dalam konteks artikel",
        labelEn: "The ageing population signal highlighted in the article",
      },
      {
        value: "17-55",
        labelId: "Rentang usia peserta yang diterima",
        labelEn: "The inclusive learner age range",
      },
      {
        value: "60 detik",
        labelId: "Ambisi pengalaman verifikasi credential digital",
        labelEn: "The target speed for digital credential verification",
      },
    ],
    statSection: 1,
    upNext: {
      href: "kursus-caregiver-bersertifikat.html",
      image: "../assets/images/caregiver-optimized.jpg",
      titleId: "Kursus Caregiver Bersertifikat: Apa Bedanya Credential AUS NMF dengan Sertifikat Biasa?",
      titleEn: "Certified Caregiver Course: What Makes an AUS NMF Credential Different from an Ordinary Certificate?",
      bodyId:
        "Lanjutkan ke tahap credential research untuk memahami mengapa tidak semua sertifikat caregiver memiliki nilai yang sama.",
      bodyEn:
        "Continue to the credential research stage to understand why not all caregiver certificates carry the same value.",
    },
    related: [
      { href: "kursus-caregiver-bersertifikat.html", image: "../assets/images/caregiver-optimized.jpg", title: "Kursus Caregiver Bersertifikat" },
      { href: "lembaga-pelatihan-caregiver.html", image: "../assets/images/elder_support-optimized.jpg", title: "Lembaga Pelatihan Caregiver" },
      { href: "daftar-menjadi-caregiver-profesional.html", image: "../assets/images/care_and_love-optimized.jpg", title: "Daftar Menjadi Caregiver Profesional" },
    ],
    figures: {
      2: {
        src: "https://source.unsplash.com/800x450/?community,caregiver",
        alt: "Caregiver Indonesia lintas usia",
        captionId:
          "Program yang inklusif memadukan pengalaman hidup, empati, dan credential yang lebih legible.",
        captionEn:
          "An inclusive pathway combines life experience, empathy, and a more legible credential.",
      },
    },
  },
  "pages/kursus-caregiver-bersertifikat.html": {
    metaPrefix: "kursus",
    author: {
      roleId: "Ditulis oleh",
      roleEn: "Written by",
      name: "Redline Academy Editorial Team",
      bioId:
        "Tim editorial Redline Academy menulis tentang caregiver training, credential architecture, dan career pathways untuk membantu pembaca memahami nilai sebuah credential.",
      bioEn:
        "The Redline Academy editorial team writes about caregiver training, credential architecture, and career pathways to help readers understand credential value.",
    },
    tags: ["kursus caregiver bersertifikat", "credential research", "australian nmf", "micro credential"],
    stats: [
      { value: "60 detik", labelId: "Verifikasi credential digital yang lebih meyakinkan employer", labelEn: "Digital credential verification that gives employers clearer confidence" },
      { value: "2 jalur", labelId: "Recognition pathway: internasional dan domestik", labelEn: "Recognition pathways for international and domestic contexts" },
      { value: "1 gap", labelId: "Recognition gap yang ingin ditutup oleh credential design", labelEn: "The recognition gap the credential design aims to close" },
    ],
    statSection: 1,
    upNext: {
      href: "lembaga-pelatihan-caregiver.html",
      image: "../assets/images/elder_support-optimized.jpg",
      titleId: "Lembaga Pelatihan Caregiver: 7 Hal yang Harus Kamu Periksa Sebelum Mendaftar",
      titleEn: "Caregiver Training Institution: 7 Things You Should Check Before Enrolling",
      bodyId: "Setelah paham credential, langkah berikutnya adalah membandingkan kualitas institusi secara lebih cerdas.",
      bodyEn: "Once the credential is clear, the next step is comparing institution quality more intelligently.",
    },
    related: [
      { href: "pelatihan-caregiver-indonesia.html", image: "../assets/images/assistant_carer-optimized.jpg", title: "Pelatihan Caregiver Indonesia" },
      { href: "lembaga-pelatihan-caregiver.html", image: "../assets/images/elder_support-optimized.jpg", title: "Lembaga Pelatihan Caregiver" },
      { href: "daftar-menjadi-caregiver-profesional.html", image: "../assets/images/care_and_love-optimized.jpg", title: "Daftar Menjadi Caregiver Profesional" },
    ],
    figures: {
      0: {
        src: "https://source.unsplash.com/800x450/?certificate,caregiver",
        alt: "Credential caregiver",
        captionId:
          "Credential yang kuat harus menjelaskan capability, assessment, dan konteks learning outcomes.",
        captionEn:
          "A strong credential should explain capability, assessment, and learning outcomes clearly.",
      },
    },
  },
  "pages/lembaga-pelatihan-caregiver.html": {
    metaPrefix: "lembaga",
    author: {
      roleId: "Ditulis oleh",
      roleEn: "Written by",
      name: "Redline Academy Editorial Team",
      bioId:
        "Tim editorial Redline Academy menulis untuk membantu calon peserta membandingkan lembaga, credential, dan pathway karier dengan lebih kritis.",
      bioEn:
        "The Redline Academy editorial team helps prospective learners compare institutions, credentials, and career pathways more critically.",
    },
    tags: ["lembaga pelatihan caregiver", "institution comparison", "caregiver credential", "career support"],
    stats: [
      { value: "7 poin", labelId: "Checklist inti sebelum mendaftar ke lembaga mana pun", labelEn: "The core checklist before enrolling anywhere" },
      { value: "1 keputusan", labelId: "Pilihan institusi yang membentuk nilai credential jangka panjang", labelEn: "One institution decision that shapes long-term credential value" },
      { value: "0 asumsi", labelId: "Semua calon peserta perlu verifikasi, bukan sekadar percaya promosi", labelEn: "Future learners need verification, not just promotional claims" },
    ],
    statSection: 1,
    upNext: {
      href: "daftar-menjadi-caregiver-profesional.html",
      image: "../assets/images/care_and_love-optimized.jpg",
      titleId: "Daftar Menjadi Caregiver Profesional: Panduan Langkah demi Langkah",
      titleEn: "Apply to Become a Professional Caregiver: Step-by-Step Guide",
      bodyId: "Kalau institusinya sudah jelas, sekarang saatnya masuk ke langkah pendaftaran yang paling realistis.",
      bodyEn: "Once the institution is clear, it is time to move into the most practical enrolment steps.",
    },
    related: [
      { href: "pelatihan-caregiver-indonesia.html", image: "../assets/images/assistant_carer-optimized.jpg", title: "Pelatihan Caregiver Indonesia" },
      { href: "kursus-caregiver-bersertifikat.html", image: "../assets/images/caregiver-optimized.jpg", title: "Kursus Caregiver Bersertifikat" },
      { href: "daftar-menjadi-caregiver-profesional.html", image: "../assets/images/care_and_love-optimized.jpg", title: "Daftar Menjadi Caregiver Profesional" },
    ],
    figures: {
      0: {
        src: "https://source.unsplash.com/800x450/?caregiver,school",
        alt: "Lembaga caregiver",
        captionId:
          "Pilihan lembaga bukan hanya soal belajar, tetapi juga tentang bagaimana credential dibawa ke pasar kerja.",
        captionEn:
          "Choosing an institution is not only about learning, but about how the credential travels into the job market.",
      },
    },
  },
  "pages/daftar-menjadi-caregiver-profesional.html": {
    metaPrefix: "daftar",
    author: {
      roleId: "Ditulis oleh",
      roleEn: "Written by",
      name: "Redline Academy Editorial Team",
      bioId:
        "Tim editorial Redline Academy membantu calon peserta memahami langkah nyata menuju karier caregiver profesional, dari kesiapan hingga enrolment.",
      bioEn:
        "The Redline Academy editorial team helps future learners understand the practical steps into a professional caregiver career, from readiness to enrolment.",
    },
    tags: ["daftar caregiver profesional", "ready to enrol", "caregiver career", "program pathway"],
    stats: [
      { value: "4 langkah", labelId: "Kerangka pendaftaran yang dibuat lebih mudah dipahami", labelEn: "The enrolment framework simplified into four steps" },
      { value: "24 jam", labelId: "Estimasi respons orientasi awal dari tim program", labelEn: "Expected response window for the initial orientation" },
      { value: "stackable", labelId: "Credential bisa dilanjutkan ke tier berikutnya kapan saja", labelEn: "Credentials can stack into the next tier anytime" },
    ],
    statSection: 1,
    upNext: {
      href: "pelatihan-caregiver-indonesia.html",
      image: "../assets/images/assistant_carer-optimized.jpg",
      titleId: "Pelatihan Caregiver Indonesia: Mengapa Standar Australia Mengubah Segalanya",
      titleEn: "Caregiver Training in Indonesia: Why Australian Standards Change Everything",
      bodyId: "Butuh kembali ke gambaran besar? Mulai lagi dari halaman discovery untuk melihat cluster artikel secara utuh.",
      bodyEn: "Need to step back into the bigger picture? Return to the discovery page and review the full article cluster.",
    },
    related: [
      { href: "pelatihan-caregiver-indonesia.html", image: "../assets/images/assistant_carer-optimized.jpg", title: "Pelatihan Caregiver Indonesia" },
      { href: "kursus-caregiver-bersertifikat.html", image: "../assets/images/caregiver-optimized.jpg", title: "Kursus Caregiver Bersertifikat" },
      { href: "lembaga-pelatihan-caregiver.html", image: "../assets/images/elder_support-optimized.jpg", title: "Lembaga Pelatihan Caregiver" },
    ],
    figures: {
      0: {
        src: "https://source.unsplash.com/800x450/?caregiver,application",
        alt: "Pendaftaran caregiver",
        captionId:
          "Keputusan mendaftar menjadi lebih mudah ketika program, credential, dan institusi sudah dipahami lebih dulu.",
        captionEn:
          "The enrolment decision becomes easier once the program, credential, and institution are already understood.",
      },
    },
  },
};

for (const [relativePath, config] of Object.entries(configs)) {
  const filePath = path.join(root, relativePath);
  let source = fs.readFileSync(filePath, "utf8");

  source = source.replace(/\n\s*<style>[\s\S]*?\/\* Editorial Redesign \*\/[\s\S]*?<\/style>/, "");
  source = source.replace(/\n\s*<div class="reading-progress">[\s\S]*?<\/div>\s*<\/div>/, "");
  source = source.replace(/\n\s*<script>\s*window\.editorialConfig[\s\S]*?<\/script>/, "");
  source = source.replace(/\n\s*<script>\s*\(function \(\) \{[\s\S]*?<\/script>/, "");

  if (!source.includes('../styles/article-editorial.css')) {
    source = source.replace(
      '<link rel="stylesheet" href="../styles/main.css" />',
      '<link rel="stylesheet" href="../styles/main.css" />\n    <link rel="stylesheet" href="../styles/article-editorial.css" />',
    );
  }

  const footerScripts = `
    <script>
      window.articleEditorialConfig = ${JSON.stringify(config)};
    </script>
    <script src="../js/script.js" defer></script>
    <script src="../js/article-editorial.js" defer></script>
  </body>`;

  source = source.replace(/\s*<\/body>/, footerScripts);
  fs.writeFileSync(filePath, source, "utf8");
}

console.log("Externalized article editorial CSS and JS.");
