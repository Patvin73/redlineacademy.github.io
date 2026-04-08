/* ============================================
   REDLINE ACADEMY - MAIN JAVASCRIPT
   ============================================ */

// Language translations
const translations = {
  id: {
    // Header
    home: "Beranda",
    about: "Tentang Kami",
    programs: "Program",
    contact: "Hubungi Kami",
    blog: "Blog",
    // legal: "Legal",
    assistantCarer: "Asisten Perawat",
    brandName: "Redline Academy",
    footerCopyright: "Â© 2025 Redline Academy.",
    allRightsReserved: "Semua Hak Dilindungi",
    legalTitle: "Legal",
    termsTitle: "Syarat & Ketentuan",
    privacyTitle: "Kebijakan Privasi",
    blogPost1Date: "19 Oktober 2024",
    blogPost1Title: "Tren Industri Perawatan Kesehatan 2024",
    blogPost1Excerpt:
      "Pelajari tentang tren terbaru dalam industri perawatan kesehatan dan bagaimana program Asisten Perawat kami mempersiapkan Anda untuk sukses.",
    blogPost2Date: "15 Oktober 2024",
    blogPost2Title: "Seni Kuliner Modern: Dari Dapur ke Meja",
    blogPost2Excerpt:
      "Temukan bagaimana teknik memasak modern mengubah industri kuliner dan peluang karier yang menanti lulusan program Chef.",
    blogPost3Date: "10 Oktober 2024",
    blogPost3Title: "Budaya Kopi Spesialti: Peluang Bisnis yang Berkembang",
    blogPost3Excerpt:
      "Jelajahi pertumbuhan pasar kopi spesialti dan bagaimana keterampilan barista profesional membuka pintu kesuksesan.",
    blogPost4Date: "5 Oktober 2024",
    blogPost4Title: "Masa Depan Pemrograman: Skill yang Paling Dicari",
    blogPost4Excerpt:
      "Pelajari bahasa pemrograman dan skill yang paling dicari oleh perusahaan teknologi terkemuka di tahun 2024.",
    blogPost5Date: "1 Oktober 2024",
    blogPost5Title: "Industri Perhotelan: Peluang Karier Global",
    blogPost5Excerpt:
      "Temukan bagaimana program Bartender kami membuka peluang karier internasional di industri perhotelan yang dinamis.",
    blogPost6Date: "25 September 2024",
    blogPost6Title: "Teknisi Listrik: Profesi Esensial untuk Masa Depan",
    blogPost6Excerpt:
      "Pelajari mengapa teknisi listrik adalah profesi yang sangat dibutuhkan dan bagaimana program kami mempersiapkan Anda untuk berhasil di bidang ini.",
    blogReadMore: "Baca Selengkapnya",

    // LMS common
    lmsNewMessage: "Pesan Baru",
    lmsNoMessages: "Belum ada pesan",
    lmsSelectMessage: "Pilih pesan untuk dibaca",
    lmsTimezone: "Zona Waktu",
    lmsNotifications: "Notifikasi",
    lmsMarkAllRead: "Tandai semua dibaca",
    lmsNoNotifications: "Tidak ada notifikasi",
    // LMS admin
    adAddUser: "Tambah User",
    adAddUserName: "Nama lengkap",
    adAddUserEmail: "Email",
    adAddUserRole: "Role",
    adAddUserPassword: "Password sementara",
    adAddUserCreate: "Buat User",
    adRecordPayment: "Catat Pembayaran",
    adPaymentStudent: "Student",
    adPaymentCourse: "Kursus",
    adPaymentAmount: "Jumlah",
    adPaymentCurrency: "Mata Uang",
    adPaymentMethod: "Metode",
    adPaymentStatus: "Status",
    adPaymentStatusPaid: "Lunas",
    adPaymentStatusPending: "Menunggu",
    adPaymentPlan: "Cara Pembayaran",
    adPaymentPlanFull: "Full payment",
    adPaymentPlanInstallment: "Cicilan",
    adPaymentNextDue: "Jatuh tempo berikutnya",
    adPaymentInstallmentPaid: "Cicilan ke",
    adPaymentInstallmentTotal: "Total cicilan (2-4x)",
    adPaymentSelectStudent: "Pilih student",
    adPaymentSelectCourse: "Pilih kursus",
    adPaymentNoStudents: "Belum ada student",
    adPaymentNoCourses: "Belum ada kursus",
    adSavePayment: "Simpan Pembayaran",

    // Homepage
    heroWelcome: "Selamat datang",
    missionBadge: "Act Locally. Grow Locally. Think Globally.",
    heroTitle: "Standar Dunia, Akses Indonesia",
    heroSubtitle:
      "Mulai dari merawat orang yang kamu cintai. Bangun karir lokal dengan credential yang diakui. Buka pintu global ketika kamu siap.",
    applyNow: "Mulai Perjalananmu →",
    heroSecondaryCta: "Lihat Potensi Karir Global ↓",

    // Programs Section
    ourPrograms: "Program Kami",
    programDetail: "Detail Program",
    learningMaterials: "Materi Pembelajaran",
    durationMode: "Durasi & Mode Pembelajaran",
    durationModeContent:
      "Fleksibel berdasarkan mode pembelajaran (biasanya bagian dari kualifikasi lengkap).",
    learningMode: "Mode Pembelajaran:",
    learningMode1: "Kelas tatap muka.",
    learningMode2: "Pembelajaran campuran (blended learning).",
    learningMode3: "Online dengan dukungan trainer.",
    programsOverview: "Ringkasan Program",
    programsOverview1:
      "Durasi: 12 Minggu Online + 3.5 Minggu Praktik Lapangan.",
    programsOverview2:
      "Tipe Studi: Hybrid (Fleksibilitas Online & Tatap Muka).",
    programsOverview3:
      "Sertifikat: Ya (Diberikan setelah penyelesaian seluruh modul).",
    programsOverview4:
      "Prasyarat: Semangat untuk merawat dan komitmen untuk belajar (Tidak memerlukan pengalaman medis sebelumnya).",
    scoreMethode: "Metode Penilaian",
    yourScore: "Anda akan dinilai melalui:",
    scoreMethode1:
      "Penilaian tertulis (studi kasus, pertanyaan pilihan ganda, esai).",
    scoreMethode2: "Demonstrasi praktik dan observasi.",
    scoreMethode3: "Portofolio bukti.",
    scoreMethode4: "Proyek dan presentasi.",

    // Program Cards
    careGiver: "Care Giver",
    careGiverDesc:
      "Dapatkan keterampilan dasar perawatan kesehatan dan pelatihan berbasis empati untuk mendukung pasien di rumah sakit, panti jompo, dan lingkungan masyarakat.",

    bartender: "Bartender",
    bartenderDesc:
      "Pelajari seni mixology, pelayanan pelanggan, dan manajemen bar untuk berkembang di dunia perhotelan yang dinamis dan serba cepat.",

    cooking: "Memasak (Chef)",
    cookingDesc:
      "Kembangkan keahlian kuliner â€” mulai dari teknik dapur hingga perencanaan menu â€” dan ubah passion terhadap makanan menjadi karier profesional.",

    barista: "Barista",
    baristaDesc:
      "Kuasai seni meracik kopi, teknik penyeduhan, serta keterampilan pelayanan untuk membangun karier sukses di kafe dan kedai kopi spesialti.",

    coding: "Pemrograman (IT)",
    codingDesc:
      "Bangun keterampilan pemrograman dan IT yang dibutuhkan industri untuk mempersiapkan diri berkarier di bidang pengembangan web, perangkat lunak, dan solusi digital.",

    electrician: "Teknisi Listrik",
    electricianDesc:
      "Dapatkan pelatihan praktis kelistrikan, pengetahuan keselamatan industri, dan kemampuan memecahkan masalah untuk menghidupkan rumah maupun bisnis.",

    // Our Commitment Section
    ourCommitment: "Komitmen Kami",

    caregiverExcellence:
      "Keunggulan Care Giver: Memberdayakan Hidup dengan Pendekatan Person-Centred Care",
    caregiverExcellenceIntro:
      "Jembatani potensi Anda dengan kurikulum yang menyelaraskan kompetensi praktis dan pendekatan perawatan yang berpusat pada individu (person-centred care). Program ini membekali Anda dengan kecakapan yang diperlukan untuk unggul di rumah sakit, perawatan lansia, maupun lingkungan masyarakat dengan tetap menghargai martabat serta pilihan unik setiap pribadi. Bergabunglah bersama kami untuk memberikan dukungan yang bukan sekadar layanan, melainkan komitmen tulus untuk meningkatkan kualitas hidup sesama. Mulailah langkah Anda untuk membawa perubahan berarti bagi dunia, melalui pengabdian tulus bagi setiap pribadi yang Anda rawat.",

    dedicatedEducator: "Pendidik yang Berdedikasi",
    dedicatedEducatorDesc:
      "Belajar jadi lebih mudah ketika ada bimbingan yang tepat. Para pelatih kami sangat terampil di bidangnya dan memiliki semangat tinggi terhadap apa yang mereka ajarkan. Mereka membawa energi dan pengalaman nyata ke setiap program, menjadikan proses belajar lebih praktis dan menarik.",

    australianMicro: "Program Micro-Credentials Australia",
    australianMicroDesc:
      "Baik kamu pemula maupun ingin mengasah kemampuan, program kami mengikuti Microcredentials Framework. Artinya, kamu memperoleh kualifikasi yang memenuhi standar internasional dan diakui lintas industri, memberi dasar yang kuat untuk peluang karier di masa depan.",

    commitmentExcellence: "Komitmen terhadap Keunggulan",
    commitmentExcellenceDesc:
      "Di RedLine Academy, keunggulan bukan sekadar tujuan â€” ini adalah budaya kami. Kami berfokus pada pengembangan berpikir kritis dan pemecahan masalah, mendorong siswa melampaui sekadar menghafal. Dengan dukungan pengajar yang kompeten dan standar tinggi, kami menciptakan lingkungan di mana pembelajar dapat tumbuh percaya diri dan meraih kesuksesan yang berkelanjutan.",

    innovativeLearning: "Lingkungan Belajar Inovatif",
    innovativeLearningDesc:
      "Kami mengadopsi alat pembelajaran modern dan metode interaktif yang membuat pendidikan lebih dinamis dan relevan. Dengan menggabungkan teori dan praktik langsung, kami mempersiapkan siswa menghadapi tantangan dunia nyata.",

    personalizedSupport: "Dukungan Personalisasi",
    personalizedSupportDesc:
      "Setiap perjalanan belajar itu unik. Kami menyediakan bimbingan dan sumber daya yang disesuaikan dengan kebutuhan masing-masing individu, memastikan setiap siswa merasa didukung dalam studi dan karier mereka.",

    globalMindset: "Wawasan Global",
    globalMindsetDesc:
      "Program kami dirancang dengan perspektif global, membantu siswa mengembangkan kemampuan beradaptasi dan kepercayaan diri untuk sukses di berbagai industri dan lingkungan internasional.",

    // Testimonials Section
    whatAlumniSay: "Apa Kata Alumni Kami?",

    testimonial1:
      '"RedLine Academy memberi saya lebih dari sekadar kualifikasi â€” akademi ini memberi saya kepercayaan diri untuk terjun ke lingkungan kerja kesehatan yang menantang dan berkembang di dalamnya. Pelatihannya sangat praktis, berbasis pengalaman nyata, dan benar-benar sesuai dengan ekspektasi dunia kerja. Kini, saya dengan bangga merawat pasien dengan keyakinan bahwa saya telah dilatih dengan standar tertinggi."',
    testimonial1Author: "Sarah Mitchell, Perawat Terdaftar",

    testimonial2:
      '"Keterampilan yang saya dapatkan di RedLine Academy benar-benar mengubah arah karier saya. Fokus pada penerapan nyata dan koneksi industri membantu saya bertransisi dengan mulus ke bidang baru. Sekarang saya memimpin proyek-proyek yang dulu hanya bisa saya impikan."',
    testimonial2Author: "Daniel Roberts, Supervisor Teknik Listrik",

    testimonial3:
      '"Belajar di RedLine Academy adalah pengalaman yang mengubah hidup. Lebih dari sekadar pelatihan, saya belajar bagaimana menghadapi tantangan dan tumbuh sebagai seorang pemimpin. Akademi ini benar-benar menepati janjinya â€” membantu saya berani berubah dan membentuk masa depan yang lebih baik."',
    testimonial3Author: "Maria Gonzalez, Supervisor Perhotelan",

    // Contact Section - Homepage
    contactUs: "Hubungi Kami",
    contactForm: "Formulir Kontak",
    name: "Nama",
    course: "Kursus",
    email: "Email",
    gender: "Jenis Kelamin",
    postalCode: "Kode Pos",
    message: "Beritahu kami apa yang bisa dibantu",
    submit: "Kirim",
    selectCourse: "Pilih Kursus",

    // Form Placeholders
    namePlaceholder: "Nama Anda",
    emailPlaceholder: "Email Anda",
    postalCodePlaceholder: "Kode Pos Anda",
    messagePlaceholder: "Pesan Anda...",
    genderSelect: "Pilih",
    genderMale: "Laki-laki",
    genderFemale: "Perempuan",
    genderOther: "Lainnya",
    contactDesc:
      "Kami siap membantu Anda. Hubungi kami melalui formulir di bawah ini atau gunakan informasi kontak kami.",
    officeHours: "Jam Kerja",
    mondayFriday: "Senin - Jumat: 08:00 - 17:00",
    saturday: "Sabtu: 09:00 - 13:00",
    sunday: "Minggu: Tutup",
    faqTitle: "Pertanyaan yang Sering Diajukan",
    faqQ1: "Apakah program ini terakreditasi?",
    faqA1:
      "Ya. Anda akan menyelesaikan Unit Pelatihan Terakreditasi Australia yang diakui secara nasional.",
    faqQ2: "Berapa lama durasi kursusnya?",
    faqA2:
      "Jalur cepat kami dirancang untuk diselesaikan hanya dalam waktu 12 minggu.",
    faqQ3: "Apakah saya butuh pengalaman medis?",
    faqA3: "Tidak perlu. Kami melatih Anda agar siap kerja sejak hari pertama.",
    faqQ4: "Apakah ada bantuan bahasa?",
    faqA4:
      "Ya, kami menyediakan dukungan penuh dalam Bahasa Inggris dan Bahasa Indonesia.",
    faqQ5: "Bagaimana dengan bagian praktiknya?",
    faqA5:
      "Program ini mencakup 120 jam asesmen praktis di fasilitas perawatan nyata.",
    faqQ6: "Pekerjaan apa yang bisa saya dapatkan?",
    faqA6:
      "Anda bisa bekerja di sektor Perawatan Lansia, Dukungan Disabilitas, atau Kesehatan Mental.",
    faqQ7: "Apakah tersedia rencana pembayaran?",
    faqA7:
      "Ya, kami menawarkan rencana pembayaran yang fleksibel agar pendidikan Anda lebih terjangkau. Silakan hubungi kami untuk mendiskusikan opsi yang sesuai dengan anggaran Anda.",

    // Contact Info Section
    contactInfo: "Informasi Kontak",
    address: "Alamat",
    addressValue:
      "Jl. Terusan Jakarta No.330 KAV. 25, Bandung - West Java, Indonesia",
    phone: "Telepon",
    phoneValue: "+62 821-2017-1731",
    emailLabel: "Email",
    emailValue: "hello@redlineacademy.com.au",
    whatsapp: "WhatsApp",
    whatsappText: "Chat dengan kami",
    whatsappQuickAccess: "Hubungi kami",
    glocalBarLocal: "Rawat lokal",
    glocalBarGrow: "Tumbuh lokal",
    glocalBarGlobal: "Buka global saat siap",
    glocalBarPrice: "Sertifikat AU · Mulai dari",
    glocalBarPriceStrong: "Rp 500rb/bulan",
    glocalBarCta: "Mulai Perjalananmu",
    rlTrustBadge:
      "🇦🇺 Diakui Australia · Act Locally. Grow Locally. Think Globally.",
    rlTrustGraduatesLabel: "Lulusan terlatih",
    rlTrustDurationUnit: "mgg",
    rlTrustDurationLabel: "Selesai belajar",
    rlTrustRatingUnit: "/5",
    rlTrustRatingLabel: "Rating program",
    rlTrustFrameworkShort: "AU",
    rlTrustFrameworkLabel: "Micro-credentials framework",
    rlJourneyKicker: "Satu sertifikat. Satu perjalanan.",
    rlJourneyTitle: "Dimulai dari rumah. Sampai ke mana pun kamu ingin pergi.",
    rlJourneyDesc:
      "Sertifikat Redline bekerja di setiap tahap — bukan hanya untuk yang ingin ke luar negeri.",
    rlJourneyStage1Label: "Rawat Keluarga",
    rlJourneyStage1Tag: "Hari pertama setelah lulus",
    rlJourneyStage2Label: "Kerja Lokal",
    rlJourneyStage2Tag: "Masuk fasilitas kesehatan Indonesia",
    rlJourneyStage3Label: "Bangun Rekam Jejak",
    rlJourneyStage3Tag: "Credential AU + work history = profil global",
    rlJourneyStage4Label: "Buka Global",
    rlJourneyStage4Tag: "Ketika kamu siap — AU · UK · CA · SG",
    rlJourneyDetail1Title:
      "Rawat orang yang kamu cintai — hari pertama setelah lulus",
    rlJourneyDetail1Desc:
      "Sertifikat Redline langsung bisa kamu gunakan. Merawat orang tua, anggota keluarga, atau tetangga yang membutuhkan bantuan. Bukan sekadar merawat — tapi merawat dengan standar, martabat, dan pendekatan yang benar.",
    rlJourneyCta: "Mulai Perjalananmu — Daftar Sekarang →",
    rlJourneyCtaSub: "Mulai dari Rp 500rb/bulan · Sertifikat AU · 15 minggu",
    glocalCalcTitle: "Visualisasi Potensi Karir Anda",
    glocalCalcDesc:
      "Sertifikat yang sama membuka pintu berbeda di setiap tahap perjalananmu.",
    glocalCalcLocalTag: "🏠 Act Locally (Tahap 1–3)",
    glocalCalcLocalLabel: "Gaji caregiver profesional lokal / bulan",
    glocalCalcGlobalTag: "🌏 Think Globally (Tahap 4)",
    glocalCalcSelectLabel: "Pilih Destinasi Global (ketika kamu siap):",
    glocalCalcOptionAu: "🇦🇺 Australia",
    glocalCalcOptionUk: "🇬🇧 United Kingdom",
    glocalCalcOptionCa: "🇨🇦 Canada",
    glocalCalcOptionSg: "🇸🇬 Singapore",
    glocalCalcDestAu: "Destinasi: Australia 🇦🇺 / bulan",
    glocalCalcDestUk: "Destinasi: United Kingdom 🇬🇧 / bulan",
    glocalCalcDestCa: "Destinasi: Canada 🇨🇦 / bulan",
    glocalCalcDestSg: "Destinasi: Singapore 🇸🇬 / bulan",
    glocalCalcNote:
      "Sertifikat Redline + rekam jejak kerja lokal = profil yang dibaca employer di semua destinasi di atas.",
    glocalCalcCta: "Mulai Perjalananmu →",
    ourLocation: "Lokasi Kami",
    mapsPlaceholder: "Google Maps akan ditampilkan di sini",

    // About Page
    aboutUs: "Tentang Kami",
    aboutContent:
      "Program pelatihan ini dirancang khusus untuk membangun kompetensi unggul di bidang perawatan lansia secara komprehensif. Keterampilan yang Anda kuasai akan membuka gerbang karier di sektor pelayanan komunitas, pengabdian bagi keluarga, hingga peran strategis sebagai relawan dan pekerja sosial profesional.\n\nMelalui kurikulum terakreditasi yang menggabungkan metode klasikal, pembelajaran mandiri, dan praktik intensif, kami mengundang Anda untuk bergabung. Mari bersama Redline Academy, membentuk insan peduli yang berdaya saing global.\n\nProgram ini mencakup 6 Australian Accredited Training Units serta 120 jam asesmen praktik, yang mencerminkan standar industri dan praktik perawatan terkini.",

    visionTitle: "Visi Kami",
    visionContent:
      "Visi kami adalah menyediakan pelatihan vokasi bersertifikat Australia yang diakui secara internasional dan selaras dengan Kerangka Microcredentials, yang dirancang untuk membuka pintu menuju peluang nyata. Kami berkomitmen menciptakan jalur menuju karier yang bermakna, membantu siswa mengubah ambisi menjadi pencapaian, serta mempersiapkan mereka untuk unggul di dunia yang dinamis dan terus berubah.",

    missionTitle: "Misi Kami",
    missionContent:
      "Memberdayakan setiap individu di setiap tahap perjalanan mereka â€” baik saat memulai karier maupun berpindah dari bidang lain â€” melalui pelatihan berkualitas tinggi yang berfokus pada kebutuhan industri. Kami berdedikasi untuk membekali siswa dengan keterampilan praktis, kepercayaan diri, dan pola pikir yang tangguh untuk berkembang di pasar kerja global yang kompetitif.",

    ourValues: "Nilai-Nilai Kami",
    empowerment: "Pemberdayaan",
    empowermentDesc:
      "Kami percaya setiap pembelajar berhak mendapatkan alat, kepercayaan diri, dan dukungan untuk mengambil kendali atas masa depannya dan mencapai potensi terbaiknya, tanpa memandang latar belakang.",

    excellence: "Keunggulan",
    excellenceDesc:
      "Kami menjaga standar tertinggi dalam pelatihan, pengajaran, dan dukungan agar siswa memperoleh keterampilan serta pengetahuan yang relevan dengan industri dan benar-benar bermanfaat.",

    integrity: "Integritas",
    integrityDesc:
      "Kami beroperasi dengan kejujuran, transparansi, dan prinsip etika dalam setiap program dan interaksi, membangun kepercayaan dan rasa hormat di lingkungan belajar kami.",

    innovation: "Inovasi",
    innovationDesc:
      "Kami mengadopsi metode pengajaran modern, pengalaman belajar praktis, dan pendekatan kreatif untuk mempersiapkan siswa menghadapi tuntutan dunia kerja global yang terus berkembang.",

    inclusivity: "Inklusivitas",
    inclusivityDesc:
      "Kami berkomitmen menciptakan lingkungan yang inklusif di mana setiap individu merasa dihargai dan didukung, terlepas dari latar belakang atau pengalaman mereka.",

    courage: "Keberanian",
    courageDesc:
      "Kami menginspirasi siswa untuk keluar dari zona nyaman, berani mengambil risiko, dan beradaptasi dengan perubahan â€” membantu mereka mengubah tantangan menjadi peluang.",

    // Team Section
    ourTeam: "Tim Kami",

    // Footer
    company: "Perusahaan",
    footerDesc:
      "Platform pelatihan vokasi bersertifikat Australia yang diakui secara internasional.",
    termsConditions: "Syarat & Ketentuan",
    privacyPolicy: "Kebijakan Privasi",
    allRightsReserved: "Semua Hak Dilindungi",

    // Blog Page
    blogTitle: "Blog",
    blogDesc:
      "Baca artikel terbaru kami tentang pendidikan, karier, dan tips industri.",
    subscribeNewsletter: "Berlangganan Newsletter Kami",
    subscribeDesc:
      "Dapatkan artikel terbaru, tips karier, dan informasi program langsung ke email Anda.",
    subscribe: "Berlangganan",
    previous: "Sebelumnya",
    next: "Berikutnya",
    page: "Halaman",
    of: "dari",

    // Programs Page
    whatYouWillLearn: "Apa yang akan Anda pelajari:",
    careGiverLearn1: "Keterampilan Perawatan Lansia.",
    careGiverLearn2: "Komunikasi Efektif di Layanan Kesehatan.",
    careGiverLearn3: "Standar Keselamatan Klien dan Pengendalian Infeksi.",
    careGiverLearn4: "Strategi Pemberdayaan Klien.",
    careGiverLearn5: "Dukungan berorientasi Pelayanan Klien.",
    careGiverLearn6: "Pencegahan & Manajemen Risiko Cedera.",
    duration6Months: "Durasi Program: 6 bulan",
    duration4Months: "Durasi Program: 4 bulan",
    duration3Months:
      "Durasi Program: 12 Minggu Pembelajaran Online plus 3.5 Minggu Praktik Lapangan.",
    certificationInternational: "Sertifikasi: Internasional",
    whyChooseOurProgram: "Mengapa Memilih Program Kami?",
    programsIntro:
      "Pendampingan Perawatan (Unit Pelatihan Terakreditasi Australia).\n\nKita mungkin tidak bisa mengubah seluruh dunia, namun jika Anda memiliki rasa kasih sayang, Anda dapat mengubah kehidupan orang-orang di sekitar Anda yang membutuhkan bantuan.\n\nApakah Anda baru saja akan menyelesaikan pendidikan dan bingung memilih jalur karier? Atau mungkin pekerjaan Anda saat ini terasa membosankan dan tidak memberikan kepuasan batin yang nyata?\n\nHanya dalam enam belas minggu pelatihan berkualitas standar Australia yang diakui secara internasional, Anda dapat mengubah segalanya. Pelatihan yang kami tawarkan dirancang untuk membuka pintu peluang nyata menuju karier yang bermakna, di mana Anda dapat memberikan dampak yang nyata.\n\nKursus ini terdiri dari dua belas minggu pelatihan daring (online) ditambah 3 Â½ minggu praktik kerja lapangan untuk mendapatkan pengalaman langsung.\n\nDengan bekal pelatihan ini, Anda siap untuk mengubah dunia Anda.",

    // Enrollment / Enroll form translations (ID)
    enrollTitle: "Formulir Pendaftaran Program",
    enrollSubtitle:
      'Silakan lengkapi formulir di bawah ini dan tim kami akan menghubungi Anda.<p>Di Redline Academy, kami menjaga privasi Anda. Informasi yang Anda bagikan kepada kami akan tetap aman bersama kami dan kami tidak akan membagikannya kepada pihak diluar Redline Academy, kecuali:</p><ul class="enroll-privacy-list"><li>Anda memberikan izin tertulis kepada kami.</li><li>Atau, Kami diwajibkan secara hukum untuk membagikannya.</li></ul><p>Kepercayaan Anda sangat berarti bagi kami, dan kami berkomitmen untuk menjaga keamanan informasi Anda.</p>',
    personalInfoLegend: "Informasi Pribadi",
    fullNameLabel: "Nama Lengkap",
    fullNamePlaceholder: "Nama lengkap Anda",
    dobLabel: "Tanggal Lahir",
    genderLabel: "Jenis Kelamin",
    selectOption: "Pilih",
    maleOption: "Laki-laki",
    femaleOption: "Perempuan",
    otherOption: "Lainnya",
    emailLabel: "Email",
    emailPlaceholder: "Email Anda",
    phoneLabel: "Nomor Telepon",
    phonePlaceholder: "Nomor telepon Anda",
    addressLabel: "Alamat",
    addressPlaceholder: "Alamat lengkap",
    postcodeLabel: "Kode Pos",
    postcodePlaceholder: "Kode Pos Anda",
    educationLegend: "Pendidikan & Latar Belakang",
    qualificationLabel: "Pendidikan Terakhir",
    qualificationPlaceholder: "Contoh: SMA / Diploma / Sarjana",
    employmentStatusLabel: "Status Pekerjaan",
    employedOption: "Bekerja",
    unemployedOption: "Tidak Bekerja",
    studentOption: "Pelajar",
    experienceLabel: "Pengalaman Relevan",
    experiencePlaceholder: "Ceritakan pengalaman Anda (jika ada)",
    declarationLegend: "Pernyataan",
    accuracyDeclaration:
      "Saya menyatakan bahwa informasi yang diberikan adalah benar.",
    termsDeclaration:
      "Saya menyetujui Syarat & Ketentuan serta Kebijakan Privasi.",
    submitApplicationBtn: "Kirim Pendaftaran",
    paymentLegend: "Pembayaran",
    paymentIntro:
      "Lengkapi data pembayaran berikut. Setelah formulir dikirim, transaksi akan dibuat ke payment gateway.",
    selectedProgramLabel: "Program Dipilih",
    selectedProgramPlaceholder: "Pilih Program",
    paymentProgramCaregiver: "Asisten Perawat - Rp4.600.000",
    paymentPlanLabel: "Skema Pembayaran",
    paymentPlanFull: "Lunas (Diskon 5%)",
    paymentPlanInstallment: "Cicilan (Tanpa Diskon)",
    paymentPlanFullTitle: "Lunas",
    paymentPlanFullDesc: "Diskon 5%",
    paymentPlanInstallmentTitle: "Cicilan",
    paymentPlanInstallmentDesc: "Tanpa Diskon",
    paymentMethodLabel: "Metode Pembayaran",
    paymentMethodPlaceholder: "Pilih Metode Pembayaran",
    paymentMethodVa: "Virtual Account (BCA/BNI/BRI)",
    paymentMethodQris: "QRIS / QR Code",
    paymentMethodEwallet: "E-Wallet (GoPay/OVO/DANA)",
    paymentMethodCard: "Kartu Debit/Kredit",
    paymentMethodTransfer: "Transfer Bank Manual",
    invoiceNameLabel: "Nama pada Tagihan",
    invoiceNamePlaceholder: "Nama sesuai rekening / e-wallet",
    invoiceEmailLabel: "Email Tagihan",
    invoiceEmailPlaceholder: "Email untuk receipt pembayaran",
    promoCodeLabel: "Kode Promo (Opsional)",
    promoCodePlaceholder: "Contoh: EARLYBIRD10",
    applyPromoBtn: "Terapkan",
    paymentSummaryTitle: "Ringkasan Pembayaran",
    summaryProgramFee: "Biaya Program",
    summaryAdminFee: "Biaya Admin",
    summaryPlanDiscount: "Diskon Skema",
    summaryPromoDiscount: "Diskon Promo",
    summaryTotal: "Total",
    paymentGatewayNote:
      'Setelah menekan tombol "Siapkan Pembayaran", sistem akan menandai transaksi siap diproses oleh payment gateway.',
    preparePaymentBtn: "Siapkan Pembayaran",
    paymentPrepDefault: 'Isi detail pembayaran lalu klik "Siapkan Pembayaran".',
    paymentConsent:
      "Saya menyetujui biaya program, kebijakan pembayaran, dan proses transaksi melalui payment gateway.",
    idNumberLabel: "Nomor KTP",
    idNumberPlaceholder: "Nomor KTP Anda",
    uploadIdBtn: "Unggah KTP",
    lmsNavLogin: "Login LMS",
    lmsLoginTitle: "Login LMS",
    lmsLoginSubtitle: "Masuk dengan akun resmi Redline Academy.",
    password: "Password",
    lmsPasswordPlaceholder: "Masukkan password Anda",
    lmsLoginButton: "Masuk",
    lmsBackToSite: "Kembali ke website utama",
    lmsLoggingIn: "Memproses login...",
    lmsLoginSuccessRedirect: "Login berhasil. Mengarahkan dashboard...",
    lmsStudentDashboardTitle: "Dashboard Student",
    lmsAdminDashboardTitle: "Dashboard Admin",
    lmsLogout: "Keluar",
    lmsStudentProfileTitle: "Profil Student",
    lmsAdminProfileTitle: "Profil Admin",
    lmsNameLabel: "Nama:",
    lmsStudentIdLabel: "Student ID:",
    lmsAdminIdLabel: "Admin ID:",
    lmsEmailLabelSimple: "Email:",
    lmsStudentListTitle: "Daftar Student",
    lmsTableName: "Nama",
    lmsTableStudentId: "Student ID",
    lmsTableEmail: "Email",
    lmsErrInvalidCredentials: "Email atau password tidak valid.",
    lmsErrProfileNotFound: "Profil tidak ditemukan.",
    lmsErrLoginFailed: "Login gagal.",
    lmsErrLoadStudents: "Gagal memuat data student.",
    lmsStatusPaid: "Lunas",
    lmsStatusPending: "Menunggu",
    lmsStatusActive: "Aktif",
    lmsStatusCompleted: "Selesai",
    lmsStatusFailed: "Gagal",
    lmsStatusRefunded: "Refund",
    lmsStatusInstallment: "Cicilan",
    lmsStatusInactive: "Nonaktif",
    lmsActionActivate: "Aktifkan",
    lmsActionSuspend: "Suspend",
    lmsNoStudents: "Belum ada student.",
    adNoEnrollmentsForTrainer: "Belum ada pendaftaran untuk kursus Anda.",

    // Legal Page
    legalTitle: "Legal",
    termsTitle: "Syarat & Ketentuan",
    privacyTitle: "Kebijakan Privasi",
  },

  en: {
    // Header
    home: "Home",
    about: "About Us",
    programs: "Programs",
    contact: "Contact Us",
    blog: "Blog",
    // legal: "Legal",
    assistantCarer: "Assistant Carer",
    brandName: "Redline Academy",
    footerCopyright: "Â© 2025 Redline Academy.",
    allRightsReserved: "All Rights Reserved",
    legalTitle: "Legal",
    termsTitle: "Terms & Conditions",
    privacyTitle: "Privacy Policy",
    blogPost1Date: "October 19, 2024",
    blogPost1Title: "2024 Healthcare Industry Trends",
    blogPost1Excerpt:
      "Learn about the latest trends in healthcare and how our Care Assistant program prepares you for success.",
    blogPost2Date: "October 15, 2024",
    blogPost2Title: "Modern Culinary Arts: From Kitchen to Table",
    blogPost2Excerpt:
      "Discover how modern cooking techniques are reshaping the culinary industry and the career paths awaiting Chef graduates.",
    blogPost3Date: "October 10, 2024",
    blogPost3Title: "Specialty Coffee Culture: A Growing Business Opportunity",
    blogPost3Excerpt:
      "Explore the rise of the specialty coffee market and how professional barista skills open the door to success.",
    blogPost4Date: "October 5, 2024",
    blogPost4Title: "The Future of Programming: Most In-Demand Skills",
    blogPost4Excerpt:
      "Learn which programming languages and skills are most sought after by leading technology companies in 2024.",
    blogPost5Date: "October 1, 2024",
    blogPost5Title: "The Hospitality Industry: Global Career Opportunities",
    blogPost5Excerpt:
      "See how our Bartender program opens up international career opportunities in a dynamic hospitality industry.",
    blogPost6Date: "September 25, 2024",
    blogPost6Title: "Electricians: An Essential Profession for the Future",
    blogPost6Excerpt:
      "Learn why electricians are in high demand and how our program prepares you to thrive in the field.",
    blogReadMore: "Read More",

    // LMS common
    lmsNewMessage: "New Message",
    lmsNoMessages: "No messages yet",
    lmsSelectMessage: "Select a message to view",
    lmsTimezone: "Timezone",
    lmsNotifications: "Notifications",
    lmsMarkAllRead: "Mark all read",
    lmsNoNotifications: "No notifications",
    // LMS admin
    adAddUser: "Add User",
    adAddUserName: "Full name",
    adAddUserEmail: "Email",
    adAddUserRole: "Role",
    adAddUserPassword: "Temporary password",
    adAddUserCreate: "Create User",
    adRecordPayment: "Record Payment",
    adPaymentStudent: "Student",
    adPaymentCourse: "Course",
    adPaymentAmount: "Amount",
    adPaymentCurrency: "Currency",
    adPaymentMethod: "Method",
    adPaymentStatus: "Status",
    adPaymentStatusPaid: "Paid",
    adPaymentStatusPending: "Pending",
    adPaymentPlan: "Payment Plan",
    adPaymentPlanFull: "Full payment",
    adPaymentPlanInstallment: "Installment",
    adPaymentNextDue: "Next due date",
    adPaymentInstallmentPaid: "Installment #",
    adPaymentInstallmentTotal: "Total installments (2-4x)",
    adPaymentSelectStudent: "Select student",
    adPaymentSelectCourse: "Select course",
    adPaymentNoStudents: "No students found",
    adPaymentNoCourses: "No courses found",
    adSavePayment: "Save Payment",

    // Homepage
    heroWelcome: "Welcome",
    missionBadge: "Act Locally. Grow Locally. Think Globally.",
    heroTitle: "World Standards, Indonesia Access",
    heroSubtitle:
      "Start by caring for the people you love. Build a local career with a recognised credential. Open global doors when you are ready.",
    applyNow: "Start Your Journey →",
    heroSecondaryCta: "See Global Career Potential ↓",

    // Programs Section
    ourPrograms: "Our Programs",
    programDetail: "Program Detail",
    learningMaterials: "Learning Materials",
    durationMode: "Duration & Mode of Learning",
    durationModeContent:
      "Flexible depending on the mode of delivery (usually part of the full qualification).",
    learningMode: "Mode of Delivery:",
    learningMode1: "Face-to-face classroom.",
    learningMode2: "Blended learning.",
    learningMode3: "Online with trainer support.",
    programsOverview: "Program Overview",
    programsOverview1:
      "Duration: 12 weeks online + 3.5 weeks practical placement.",
    programsOverview2:
      "Study Type: Hybrid (Online & Face-to-face flexibility).",
    programsOverview3:
      "Certificate: Yes (awarded upon completion of all modules).",
    programsOverview4:
      "Prerequisites: Passion for caregiving and commitment to learning (No prior medical experience required).",
    scoreMethode: "Assessment Methods",
    yourScore: "You will be assessed through:",
    scoreMethode1: "Written assessments (case studies, MCQs, essays).",
    scoreMethode2: "Practical demonstration and observation.",
    scoreMethode3: "Portfolio of evidence.",
    scoreMethode4: "Projects and presentations.",

    // Program Cards
    careGiver: "Care Giver",
    careGiverDesc:
      "Gain essential healthcare skills and compassion-driven training to support patients in hospitals, aged care, and community settings.",

    bartender: "Bartender",
    bartenderDesc:
      "Learn mixology, customer service, and bar management to thrive in fast-paced hospitality environments.",

    cooking: "Cooking (Chef)",
    cookingDesc:
      "Develop culinary expertise, from kitchen techniques to menu planning, turning your passion for food into a professional career.",

    barista: "Barista",
    baristaDesc:
      "Master coffee craft, brewing techniques, and service skills for a thriving career in cafÃ©s and specialty coffee shops.",

    coding: "Coding (IT)",
    codingDesc:
      "Build in-demand programming and IT skills, preparing you for tech roles in web development, software, and digital solutions.",

    electrician: "Electrician",
    electricianDesc:
      "Acquire hands-on electrical training, industry safety knowledge, and problem-solving skills to power homes and businesses.",

    // Our Commitment Section
    ourCommitment: "Our Commitment",

    caregiverExcellence:
      "Care Giver Excellence: Empowering Lives with a Person-Centred Care Approach",
    caregiverExcellenceIntro:
      "Bridge your potential with a curriculum that aligns practical competence and person-centred care. This program equips you with the skills to excel in hospitals, aged care and community settings while honoring each person's dignity and choices. Join us to provide support that goes beyond service - a genuine commitment to improving quality of life. Start your journey to make meaningful change through compassionate care.",

    dedicatedEducator: "Dedicated Educator",
    dedicatedEducatorDesc:
      "Learning is easier when you have the right guidance. Our trainers are highly skilled in their fields and passionate about what they teach. They bring energy and real-world experience into every program, making learning both practical and engaging.",

    australianMicro: "Australian Micro-Credentials Program",
    australianMicroDesc:
      "Whether you're a beginner or looking to refine your skills, our programs follow the Microcredentials Framework. This means you gain qualifications that meet international standards and are recognised across industries, giving you a solid foundation for future opportunities.",

    commitmentExcellence: "Commitment to Excellence",
    commitmentExcellenceDesc:
      "At RedLine Academy, excellence is more than a goalâ€”it's our culture. We focus on developing critical thinking and problem-solving, encouraging students to go beyond memorization. With supportive educators and high standards, we create an environment where learners can grow with confidence and achieve lasting success.",

    innovativeLearning: "Innovative Learning Environment",
    innovativeLearningDesc:
      "We embrace modern learning tools and interactive methods that make education dynamic and relevant. By combining theory with hands-on practice, we prepare students to meet real-world challenges.",

    personalizedSupport: "Personalised Support",
    personalizedSupportDesc:
      "Every student's journey is different. We provide guidance and resources tailored to individual needs, ensuring learners feel supported as they move forward in their studies and careers.",

    globalMindset: "Global Mindset",
    globalMindsetDesc:
      "Our programs are designed with a global perspective, helping students develop the adaptability and confidence to succeed in diverse industries and international settings.",

    // Testimonials Section
    whatAlumniSay: "What Our Alumni Say?",

    testimonial1:
      '"RedLine Academy gave me more than just qualificationsâ€”it gave me the confidence to step into a demanding healthcare environment and thrive. The training was hands-on, practical, and aligned perfectly with what employers expect. Today, I proudly care for patients knowing I was trained to the highest standard."',
    testimonial1Author: "Sarah Mitchell, Registered Nurse",

    testimonial2:
      '"The skills I gained at RedLine Academy completely transformed my career. The focus on real-world application and industry connections helped me transition smoothly into a new field. I\'m now leading projects I once only dreamed of being part of."',
    testimonial2Author: "Daniel Roberts, Electrician Supervisor",

    testimonial3:
      '"Studying at RedLine Academy was a life-changing experience. Beyond the training, I learned how to embrace challenges and grow as a leader. The academy truly lived up to its promiseâ€”helping me dare to change and shape a better future."',
    testimonial3Author: "Maria Gonzalez, Hospitality Supervisor",

    // Contact Section - Homepage
    contactUs: "Contact Us",
    contactForm: "Contact Form",
    name: "Name",
    course: "Course",
    email: "Email",
    gender: "Gender",
    postalCode: "Postal Code",
    message: "Tell us how we can help",
    submit: "Submit",
    selectCourse: "Select Course",

    // Form Placeholders
    namePlaceholder: "Your Name",
    emailPlaceholder: "Your Email",
    postalCodePlaceholder: "Your Postal Code",
    messagePlaceholder: "Your Message...",
    genderSelect: "Select",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    contactDesc:
      "We are ready to help you. Contact us through the form below or use our contact information.",
    officeHours: "Office Hours",
    mondayFriday: "Monday - Friday: 08:00 - 17:00",
    saturday: "Saturday: 09:00 - 13:00",
    sunday: "Sunday: Closed",
    faqTitle: "Frequently Asked Questions",
    faqQ1: "Is this program accredited?",
    faqA1:
      "Yes. You will complete Australian Accredited Training Units that are nationally recognized.",
    faqQ2: "How long is the course?",
    faqA2:
      "Our fast-track pathway is designed to be completed in just 12 weeks.",
    faqQ3: "Do I need medical experience?",
    faqA3:
      "No experience is needed. We train you for job-readiness from day one.",
    faqQ4: "Is there language support?",
    faqA4:
      "Yes, we provide full Bilingual Support in English and Bahasa Indonesia.",
    faqQ5: "What about the practical part?",
    faqA5:
      "The program includes 120 hours of practical assessment in a real care facility.",
    faqQ6: "What jobs can I get?",
    faqA6:
      "You can work in the Aged Care, Disability Support, or Mental Health sectors.",
    faqQ7: "Do you offer payment plans?",
    faqA7:
      "Yes, we offer flexible payment plans to make your education more accessible. Please contact us to discuss options that suit your budget.",

    // Contact Info Section
    contactInfo: "Contact Information",
    address: "Address",
    addressValue:
      "Jl. Terusan Jakarta No.330 KAV. 25, Bandung - West Java, Indonesia",
    phone: "Phone",
    phoneValue: "+62 821-2017-1731",
    emailLabel: "Email",
    emailValue: "hello@redlineacademy.com.au",
    whatsapp: "WhatsApp",
    whatsappText: "Chat with us",
    whatsappQuickAccess: "Contact us",
    glocalBarLocal: "Care locally",
    glocalBarGrow: "Grow locally",
    glocalBarGlobal: "Go global when ready",
    glocalBarPrice: "AU Certificate · Starting from",
    glocalBarPriceStrong: "Rp 500rb/month",
    glocalBarCta: "Start Your Journey",
    rlTrustBadge:
      "🇦🇺 Australia Recognised · Act Locally. Grow Locally. Think Globally.",
    rlTrustGraduatesLabel: "Trained graduates",
    rlTrustDurationUnit: "wks",
    rlTrustDurationLabel: "To complete",
    rlTrustRatingUnit: "/5",
    rlTrustRatingLabel: "Program rating",
    rlTrustFrameworkShort: "AU",
    rlTrustFrameworkLabel: "Micro-credentials framework",
    rlJourneyKicker: "One credential. One journey.",
    rlJourneyTitle: "It starts at home. It can take you anywhere.",
    rlJourneyDesc:
      "Redline certification works at every stage — not only for those planning to go abroad.",
    rlJourneyStage1Label: "Care for Family",
    rlJourneyStage1Tag: "Your first day after graduating",
    rlJourneyStage2Label: "Work Locally",
    rlJourneyStage2Tag: "Enter Indonesian healthcare facilities",
    rlJourneyStage3Label: "Build Your Track Record",
    rlJourneyStage3Tag: "AU credential + work history = global profile",
    rlJourneyStage4Label: "Open Global Doors",
    rlJourneyStage4Tag: "When you are ready — AU · UK · CA · SG",
    rlJourneyDetail1Title:
      "Care for the people you love — from day one after graduation",
    rlJourneyDetail1Desc:
      "You can use your Redline certificate immediately. Care for parents, family members, or neighbours who need support. Not just care — but care with standards, dignity, and the right approach.",
    rlJourneyCta: "Start Your Journey — Apply Now →",
    rlJourneyCtaSub: "Starting from Rp 500rb/month · AU Certificate · 15 weeks",
    glocalCalcTitle: "Visualise Your Career Potential",
    glocalCalcDesc:
      "The same certificate opens different doors at every stage of your journey.",
    glocalCalcLocalTag: "🏠 Act Locally (Stage 1–3)",
    glocalCalcLocalLabel: "Professional local caregiver salary / month",
    glocalCalcGlobalTag: "🌏 Think Globally (Stage 4)",
    glocalCalcSelectLabel: "Choose Your Global Destination (when you are ready):",
    glocalCalcOptionAu: "🇦🇺 Australia",
    glocalCalcOptionUk: "🇬🇧 United Kingdom",
    glocalCalcOptionCa: "🇨🇦 Canada",
    glocalCalcOptionSg: "🇸🇬 Singapore",
    glocalCalcDestAu: "Destination: Australia 🇦🇺 / month",
    glocalCalcDestUk: "Destination: United Kingdom 🇬🇧 / month",
    glocalCalcDestCa: "Destination: Canada 🇨🇦 / month",
    glocalCalcDestSg: "Destination: Singapore 🇸🇬 / month",
    glocalCalcNote:
      "Redline certification + local work track record = a profile employers across all destinations above can read.",
    glocalCalcCta: "Start Your Journey →",
    ourLocation: "Our Location",
    mapsPlaceholder: "Google Maps will be displayed here",

    // About Page
    aboutUs: "About Us",
    aboutContent:
      "This training program is specifically designed to build outstanding competencies in aged care comprehensively. The skills you acquire will open pathways to careers in the community services sector, family caregiving, as well as strategic roles as volunteers and professional social workers.\n\nThrough an accredited curriculum that integrates classroom-based learning, self-directed study, and intensive practical training, we invite you to join us. Together with Redline Academy, let us shape compassionate professionals with global competitiveness.\n\nThis program comprises 6 Australian Accredited Training Units and 120 hours of practical assessment, reflecting current industry standards and best practices in care provision.",

    visionTitle: "Our Vision",
    visionContent:
      "Our vision is to provide Australian-certified, internationally recognised vocational training aligned with the Microcredentials Framework, designed to open doors to real opportunities. We are passionate about creating pathways to meaningful careers, helping students transform ambition into achievement, and preparing them to excel in a dynamic and ever changing world.",

    missionTitle: "Our Mission",
    missionContent:
      "To empower individuals at every stage of their journeyâ€”whether starting a career or transitioning from another field through high-quality, industry-focused training. We are dedicated to equipping our students with practical skills, confidence, and the mindset to thrive in a competitive global workforce.",

    ourValues: "Our Values",
    empowerment: "Empowerment",
    empowermentDesc:
      "We believe every learner deserves the tools, confidence, and support to take control of their future and reach their full potential, regardless of their background.",

    excellence: "Excellence",
    excellenceDesc:
      "We maintain the highest standards in training, teaching, and support, ensuring our students gain industry-relevant skills and knowledge that truly matter.",

    integrity: "Integrity",
    integrityDesc:
      "We operate with honesty, transparency, and ethical principles in all our programs and interactions, fostering trust and respect in our learning community.",

    innovation: "Innovation",
    innovationDesc:
      "We embrace modern teaching methods, practical learning experiences, and creative approaches to prepare students for the evolving demands of the global workforce.",

    inclusivity: "Inclusivity",
    inclusivityDesc:
      "We are committed to creating an inclusive environment where every individual feels valued and supported, regardless of their background or experience.",

    courage: "Courage",
    courageDesc:
      "We inspire students to step beyond their comfort zones, take risks, and embrace change, encouraging them to transform challenges into opportunities.",

    // Team Section
    ourTeam: "Our Team",

    // Footer
    company: "Company",
    footerDesc:
      "Australian-certified vocational training platform recognised internationally.",
    termsConditions: "Terms & Conditions",
    privacyPolicy: "Privacy Policy",
    allRightsReserved: "All Rights Reserved",

    // Blog Page
    blogTitle: "Blog",
    blogDesc:
      "Read our latest articles about education, careers, and industry tips.",
    subscribeNewsletter: "Subscribe to Our Newsletter",
    subscribeDesc:
      "Get the latest articles, career tips, and program information delivered directly to your email.",
    subscribe: "Subscribe",
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",

    // Programs Page
    whatYouWillLearn: "What You Will Learn:",
    careGiverLearn1: "Elderly Care Skills.",
    careGiverLearn2: "Effective Communication in Healthcare Services.",
    careGiverLearn3: "Client Safety Standards and Infection Control.",
    careGiverLearn4: "Client Empowerment Strategies.",
    careGiverLearn5: "Provide Individualised Support.",
    careGiverLearn6: "Injury Prevention and Risk Management.",
    duration6Months: "Program Duration: 6 months",
    duration4Months: "Program Duration: 4 months",
    duration3Months:
      "Program Duration: 12 Weeks of Online Learning plus 3.5 Weeks of Practical Field Placement",
    certificationInternational: "Certification: International",
    whyChooseOurProgram: "Why Choose Our Program?",
    programsIntro:
      "Care Support (Australian Accredited Training Units).\n\nWe may not be able to change the whole world, but if you have compassion, you can change the lives of those around you who need support.\n\nAre you about to complete your studies and feeling uncertain about your career path? Or perhaps your current job feels unfulfilling and lacks genuine purpose?\n\nIn just sixteen weeks of high-quality, Australian-standard training that is internationally recognized, you can transform your future. The training we offer is designed to open real opportunities for a meaningful careerâ€”one where you can make a tangible and lasting impact.\n\nThis course consists of twelve weeks of online training followed by 3Â½ weeks of workplace practicum, providing hands-on, real-world experience.\n\nWith this training, you will be equipped and ready to change your world.",

    // Enrollment / Enroll form translations (EN)
    enrollTitle: "Program Enrollment Form",
    enrollSubtitle:
      'Please complete the form below and our team will contact you.<p>At Redline Academy, we respect your privacy. The information you share with us will be kept secure and will not be shared with parties outside Redline Academy, except:</p><ul class="enroll-privacy-list"><li>You give us written consent.</li><li>Or, we are legally required to disclose it.</li></ul><p>Your trust means a great deal to us, and we are committed to protecting your information.</p>',
    personalInfoLegend: "Personal Information",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Your full name",
    dobLabel: "Date of Birth",
    genderLabel: "Gender",
    selectOption: "Select",
    maleOption: "Male",
    femaleOption: "Female",
    otherOption: "Other",
    emailLabel: "Email",
    emailPlaceholder: "Your email",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Your phone number",
    addressLabel: "Address",
    addressPlaceholder: "Full address",
    postcodeLabel: "Postcode",
    postcodePlaceholder: "Your postcode",
    educationLegend: "Education & Background",
    qualificationLabel: "Highest Qualification",
    qualificationPlaceholder: "Eg: High School / Diploma / Bachelor",
    employmentStatusLabel: "Employment Status",
    employedOption: "Employed",
    unemployedOption: "Unemployed",
    studentOption: "Student",
    experienceLabel: "Relevant Experience",
    experiencePlaceholder: "Describe your experience (if any)",
    declarationLegend: "Declaration",
    accuracyDeclaration: "I declare that the information provided is true.",
    termsDeclaration: "I agree to the Terms & Conditions and Privacy Policy.",
    submitApplicationBtn: "Submit Application",
    paymentLegend: "Payment",
    paymentIntro:
      "Complete the payment details below. Once the form is submitted, the transaction will be created in the payment gateway.",
    selectedProgramLabel: "Selected Program",
    selectedProgramPlaceholder: "Select Program",
    paymentProgramCaregiver: "Assistant Carer - IDR 4,600,000",
    paymentPlanLabel: "Payment Plan",
    paymentPlanFull: "Full Payment (5% Discount)",
    paymentPlanInstallment: "Installment (No Discount)",
    paymentPlanFullTitle: "Full Payment",
    paymentPlanFullDesc: "5% Discount",
    paymentPlanInstallmentTitle: "Installment",
    paymentPlanInstallmentDesc: "No Discount",
    paymentMethodLabel: "Payment Method",
    paymentMethodPlaceholder: "Select Payment Method",
    paymentMethodVa: "Virtual Account (BCA/BNI/BRI)",
    paymentMethodQris: "QRIS / QR Code",
    paymentMethodEwallet: "E-Wallet (GoPay/OVO/DANA)",
    paymentMethodCard: "Debit/Credit Card",
    paymentMethodTransfer: "Manual Bank Transfer",
    invoiceNameLabel: "Billing Name",
    invoiceNamePlaceholder: "Name as shown in bank/e-wallet account",
    invoiceEmailLabel: "Billing Email",
    invoiceEmailPlaceholder: "Email for payment receipt",
    promoCodeLabel: "Promo Code (Optional)",
    promoCodePlaceholder: "Example: EARLYBIRD10",
    applyPromoBtn: "Apply",
    paymentSummaryTitle: "Payment Summary",
    summaryProgramFee: "Program Fee",
    summaryAdminFee: "Admin Fee",
    summaryPlanDiscount: "Plan Discount",
    summaryPromoDiscount: "Promo Discount",
    summaryTotal: "Total",
    paymentGatewayNote:
      'After clicking "Prepare Payment", the system will mark this transaction ready for payment gateway processing.',
    preparePaymentBtn: "Prepare Payment",
    paymentPrepDefault:
      'Fill in payment details and click "Prepare Payment".',
    paymentConsent:
      "I agree to the program fee, payment policy, and transaction processing via payment gateway.",
    idNumberLabel: "ID Number",
    idNumberPlaceholder: "Your ID number",
    uploadIdBtn: "Upload ID",
    lmsNavLogin: "LMS Login",
    lmsLoginTitle: "LMS Login",
    lmsLoginSubtitle: "Sign in with your official Redline Academy account.",
    password: "Password",
    lmsPasswordPlaceholder: "Enter your password",
    lmsLoginButton: "Sign In",
    lmsBackToSite: "Back to main website",
    lmsLoggingIn: "Signing in...",
    lmsLoginSuccessRedirect: "Login successful. Redirecting to dashboard...",
    lmsStudentDashboardTitle: "Student Dashboard",
    lmsAdminDashboardTitle: "Admin Dashboard",
    lmsLogout: "Log Out",
    lmsStudentProfileTitle: "Student Profile",
    lmsAdminProfileTitle: "Admin Profile",
    lmsNameLabel: "Name:",
    lmsStudentIdLabel: "Student ID:",
    lmsAdminIdLabel: "Admin ID:",
    lmsEmailLabelSimple: "Email:",
    lmsStudentListTitle: "Student List",
    lmsTableName: "Name",
    lmsTableStudentId: "Student ID",
    lmsTableEmail: "Email",
    lmsErrInvalidCredentials: "Invalid email or password.",
    lmsErrProfileNotFound: "Profile not found.",
    lmsErrLoginFailed: "Login failed.",
    lmsErrLoadStudents: "Failed to load student data.",
    lmsStatusPaid: "Paid",
    lmsStatusPending: "Pending",
    lmsStatusActive: "Active",
    lmsStatusCompleted: "Completed",
    lmsStatusFailed: "Failed",
    lmsStatusRefunded: "Refunded",
    lmsStatusInstallment: "Installment",
    lmsStatusInactive: "Inactive",
    lmsActionActivate: "Activate",
    lmsActionSuspend: "Suspend",
    lmsNoStudents: "No students found.",
    adNoEnrollmentsForTrainer: "No enrollments found for your courses.",

    // Legal Page
    legalTitle: "Legal",
    termsTitle: "Terms & Conditions",
    privacyTitle: "Privacy Policy",
  },
};

// Language management
// Expose translations globally so other modules can inject new keys
window.translations = translations;
if (window.pageTranslations && typeof window.pageTranslations === "object") {
  Object.entries(window.pageTranslations).forEach(([lang, values]) => {
    if (!translations[lang]) {
      translations[lang] = {};
    }

    Object.assign(translations[lang], values);
  });
}

Object.assign(translations.id, {
  articleEyebrow: "Artikel Pilihan",
  articleHighlightsFocus: "Fokus",
  articleHighlightsIntent: "Intent",
  articleHighlightsLocation: "Lokasi",
  articleHighlightsCluster: "Cluster",
  articlesBlogSectionTitle: "Artikel & Blog",
  articlesBlogSectionDesc:
    "Telusuri cluster artikel caregiver Redline Academy dari tahap discovery, riset credential, perbandingan lembaga, sampai siap daftar.",
  articlesBlogBadge: "Blog",
  articlesArticleBadge: "Artikel",
  articlesBlogMainTitle: "Blog Caregiver & Karier",
  articlesBlogMainDesc:
    "Baca empat artikel utama caregiver yang saling terhubung untuk membantu Anda memahami program, credential, lembaga, dan langkah pendaftaran.",
  articlesOpenPage: "Buka Halaman",
  articlesReadMore: "Baca Artikel",
  articlesPelatihanTitle: "Pelatihan Caregiver Indonesia",
  articlesPelatihanDesc:
    "Kenali alasan mengapa standar Australia mengubah nilai sebuah pelatihan caregiver dan membuka pintu pengakuan internasional.",
  articlesKursusTitle: "Kursus Caregiver Bersertifikat",
  articlesKursusDesc:
    "Pahami perbedaan credential AUS NMF dengan sertifikat biasa, recognition gap, dan apa yang benar-benar dibaca employer global.",
  articlesLembagaTitle: "Lembaga Pelatihan Caregiver",
  articlesLembagaDesc:
    "Bandingkan lembaga secara cerdas lewat 7 pemeriksaan penting sebelum mendaftar, dari verifikasi credential sampai dukungan karier.",
  articlesDaftarTitle: "Daftar Menjadi Caregiver Profesional",
  articlesDaftarDesc:
    "Ikuti panduan langkah demi langkah untuk memilih jalur, mengecek syarat masuk, memilih format belajar, dan memulai pendaftaran.",
  articleCtaBadge: "🏠 Rawat Lokal · 💼 Tumbuh Lokal · 🌏 Buka Global",
  articleCtaTitle: "Siap memulai perjalananmu sebagai caregiver profesional?",
  articleCtaBody:
    "Rawat keluarga hari ini. Bangun karir lokal dengan credential yang diakui. Buka pintu global ketika kamu siap - dengan sertifikat yang sama. Mulai dari Rp 500rb/bulan.",
  articleCtaButton: "Mulai Perjalananmu →",
  articleCtaWhatsapp: "💬 Tanya via WhatsApp",
  pelatihanArticleTitle: "Pelatihan Caregiver Indonesia di Indonesia",
  pelatihanArticleIntro:
    "Halaman ini membahas pelatihan caregiver indonesia untuk kebutuhan informational di Indonesia. Konten disusun agar calon peserta memahami materi, biaya, jalur belajar, dan langkah pendaftaran.",
  pelatihanArticleMeta:
    'Fokus kata kunci: <strong>pelatihan caregiver indonesia</strong> | Intent: <strong>informational</strong> | Lokasi: <strong>Indonesia</strong>',
  pelatihanWhyTitle: "Mengapa pelatihan caregiver indonesia penting?",
  pelatihanWhyBody1:
    "Permintaan tenaga caregiver terus tumbuh di Indonesia. Memahami pelatihan caregiver indonesia membantu Anda memilih program yang relevan dengan kebutuhan industri.",
  pelatihanWhyBody2:
    "Fokus pembelajaran tidak hanya teori, tetapi juga komunikasi empatik, keselamatan pasien, dan standar layanan yang konsisten.",
  pelatihanCoreTitle: "Kompetensi inti yang dipelajari",
  pelatihanCoreItem1: "Pendampingan aktivitas harian dan personal care",
  pelatihanCoreItem2: "Komunikasi efektif dengan keluarga dan tim medis",
  pelatihanCoreItem3: "Pencegahan risiko serta prosedur keselamatan dasar",
  pelatihanStructureTitle: "Struktur program yang direkomendasikan",
  pelatihanStructureBody:
    "Kurikulum terbaik memadukan pembelajaran online, praktik terarah, dan asesmen berbasis kasus nyata.",
  pelatihanComponentsTitle: "Komponen belajar",
  pelatihanComponentsItem1: "Modul teori terstruktur per topik layanan",
  pelatihanComponentsItem2: "Praktik lapangan dengan supervisi",
  pelatihanComponentsItem3: "Evaluasi kompetensi untuk kesiapan kerja",
  pelatihanStartTitle: "Langkah memulai pendaftaran",
  pelatihanStartBody:
    "Siapkan dokumen identitas, pilih jadwal belajar, dan konsultasikan target karier Anda agar rencana belajar lebih tepat sasaran.",
  pelatihanChecklistTitle: "Checklist sebelum mendaftar",
  pelatihanChecklistItem1:
    "Pastikan tujuan karier dan minat spesialisasi caregiver",
  pelatihanChecklistItem2:
    "Bandingkan kurikulum, durasi, serta model pembelajaran",
  pelatihanChecklistItem3:
    "Konfirmasi skema biaya dan dukungan pasca-lulus",
  pelatihanFaqTitle: "FAQ pelatihan caregiver indonesia",
  pelatihanFaqQ1: "Apakah pelatihan caregiver indonesia cocok untuk pemula?",
  pelatihanFaqA1:
    "Ya. Program dirancang bertahap dari dasar hingga praktik, termasuk pendampingan untuk peserta tanpa pengalaman kerja di bidang perawatan.",
  pelatihanFaqQ2:
    "Berapa lama durasi pelatihan caregiver indonesia di Indonesia?",
  pelatihanFaqA2:
    "Durasi bergantung paket belajar, namun umumnya mencakup teori, praktik terstruktur, dan asesmen akhir sebelum sertifikasi diterbitkan.",
  pelatihanFaqQ3: "Apakah ada dukungan setelah lulus?",
  pelatihanFaqA3:
    "Ada. Peserta mendapatkan panduan penyusunan CV, simulasi wawancara, serta arahan jalur kerja di fasilitas layanan perawatan.",
  pelatihanRelatedTitle: "Halaman Terkait",
  pelatihanRelatedLink1:
    "Pelatihan Caregiver Indonesia: Standar Global dengan Hati Indonesia",
  pelatihanRelatedLink2:
    "Kursus Caregiver Bersertifikat Indonesia di Indonesia",
  pelatihanRelatedLink3: "Kelas Caregiver Online Indonesia di Indonesia",
  biayaArticleEyebrow: "Artikel Pilihan",
  biayaArticleTitle:
    "Pelatihan Caregiver Indonesia: Standar Global dengan Hati Indonesia",
  biayaArticleIntro:
    "Indonesia sedang menuju perubahan demografi besar. Pada 2050, populasi lansia diproyeksikan melebihi 72 juta orang, sehingga kebutuhan pelatihan caregiver yang profesional, manusiawi, dan relevan dengan konteks lokal menjadi semakin mendesak.",
  biayaArticleMeta:
    'Fokus kata kunci: <strong>pelatihan caregiver indonesia</strong> | Intent: <strong>informational</strong> | Sudut pandang: <strong>global standards, local values</strong>',
  biayaHighlightFocus: "pelatihan caregiver indonesia",
  biayaHighlightIntent: "informational",
  biayaHighlightCluster: "sertifikasi, standar global, demensia, karier",
  biayaWhyTitle: "Perubahan paradigma: dari ketergantungan menuju pemberdayaan",
  biayaWhyBody1:
    "Selama ini, lansia sering dipandang hanya sebagai pihak yang sepenuhnya bergantung pada bantuan orang lain. Pendekatan seperti ini berfokus pada kebutuhan fisik semata dan belum cukup untuk menjawab tantangan kualitas hidup di masa depan.",
  biayaWhyBody2:
    "Pelatihan caregiver modern perlu mengusung empowered paradigm, yaitu pendekatan yang melatih caregiver untuk mendukung kemandirian lansia, menghormati hak individu, dan melihat perawatan sebagai proses yang holistik, bukan sekadar rutinitas teknis.",
  biayaWhyBody3:
    'Untuk membandingkan jalur belajar yang lebih spesifik, Anda juga bisa membaca <a href="kursus-caregiver-bersertifikat.html">kursus caregiver bersertifikat</a> dan <a href="lembaga-pelatihan-caregiver.html">panduan memilih lembaga pelatihan caregiver</a>.',
  biayaImageCaption1:
    "Program caregiver yang kuat tidak berhenti pada tugas teknis, tetapi membentuk standar profesional, etika, dan kesiapan menghadapi kebutuhan lansia modern.",
  biayaFactorsTitle: "Dua dunia, satu standar: inti kurikulum caregiver modern",
  biayaFactorsBody:
    "Materi baru Redline menegaskan bahwa pelatihan caregiver yang relevan di Indonesia harus mampu memadukan standar klinis internasional dengan nilai budaya lokal. Inilah fondasi yang membuat lulusan tidak hanya kompeten secara teknis, tetapi juga sensitif secara sosial dan budaya.",
  biayaFactorsItem1:
    "<strong>Standar global:</strong> patient safety, etika klinis, legalitas, dan presisi praktik menjadi dasar penting dalam sistem caregiver profesional.",
  biayaFactorsItem2:
    "<strong>Nilai Indonesia:</strong> bakti kepada orang tua, gotong royong, sopan santun, dan musyawarah membuat pendekatan perawatan lebih dekat dengan realitas keluarga Indonesia.",
  biayaFactorsItem3:
    "<strong>Adaptasi lapangan:</strong> caregiver perlu siap bekerja di lingkungan dengan sumber daya berbeda-beda, termasuk konteks komunitas dan layanan kesehatan lokal.",
  biayaFactorsItem4:
    "<strong>Kualitas hidup sebagai tujuan:</strong> hasil akhir pelatihan bukan hanya kemampuan merawat, tetapi kemampuan meningkatkan martabat dan kualitas hidup lansia.",
  biayaClusterTitle: "Empat pilar pelatihan caregiver profesional di Indonesia",
  biayaClusterBody:
    "Agar siap menghadapi kebutuhan dunia kerja, pelatihan caregiver tidak cukup hanya mengajarkan perawatan dasar. Program yang baik perlu dibangun di atas empat pilar kompetensi utama berikut.",
  biayaClusterItem1:
    "<strong>Praktik profesional dan dasar perawatan:</strong> memahami etika, batas hukum, dan kolaborasi dengan keluarga maupun fasilitas kesehatan.",
  biayaClusterItem2:
    "<strong>Dukungan berbasis pemberdayaan:</strong> caregiver dilatih menjadi fasilitator yang mendorong autonomi lansia, bukan sekadar pelaksana bantuan.",
  biayaClusterItem3:
    "<strong>Pencegahan infeksi dan keselamatan:</strong> fokus pada kebersihan, keselamatan, dan adaptasi standar internasional dalam konteks lokal.",
  biayaClusterItem4:
    "<strong>Dukungan spesialis:</strong> materi demensia, disabilitas, serta pendekatan emosional dan sosial untuk kasus yang lebih kompleks.",
  biayaChecklistTitle: "Mengapa pelatihan ini penting untuk masa depan caregiver Indonesia?",
  biayaChecklistBody:
    "Ketika kebutuhan layanan lansia terus meningkat, pelatihan caregiver yang kuat menjadi investasi penting bagi peserta, keluarga, dan sistem perawatan Indonesia secara keseluruhan.",
  biayaChecklistItem1:
    "Membuka peluang kerja di dalam dan luar negeri melalui kompetensi yang lebih terstandar.",
  biayaChecklistItem2:
    "Membangun global mindset tanpa kehilangan empati budaya Indonesia.",
  biayaChecklistItem3:
    "Membekali peserta menghadapi kasus kompleks seperti demensia, disabilitas, dan kebutuhan emosional lansia.",
  biayaChecklistItem4:
    "Menyiapkan lulusan yang tidak hanya terampil, tetapi juga mampu menjaga martabat dan kualitas hidup pasien.",
  biayaChecklistNote:
    'Jika Anda ingin melihat bagaimana jalur belajar ini terhubung ke sertifikasi, perbandingan lembaga, dan rencana karier, lanjutkan ke <a href="kursus-caregiver-bersertifikat.html">kursus caregiver bersertifikat</a>, <a href="lembaga-pelatihan-caregiver.html">panduan memilih lembaga</a>, atau <a href="daftar-menjadi-caregiver-profesional.html">panduan menjadi caregiver profesional</a>.',
  biayaImageCaption2:
    "Caregiver masa depan membutuhkan perpaduan antara standar global, kepekaan emosional, dan pemahaman budaya Indonesia.",
  biayaFaqTitle: "FAQ pelatihan caregiver Indonesia",
  biayaFaqQ1:
    "Apa itu pelatihan caregiver Indonesia?",
  biayaFaqA1:
    "Pelatihan caregiver Indonesia adalah program pendidikan untuk membekali keterampilan merawat lansia secara profesional, mencakup aspek medis dasar, etika, dan komunikasi.",
  biayaFaqQ2: "Apakah pelatihan caregiver memiliki sertifikasi?",
  biayaFaqA2:
    "Ya, pelatihan caregiver profesional biasanya menyediakan sertifikasi yang dapat digunakan untuk bekerja di dalam maupun luar negeri.",
  biayaFaqQ3: "Apa saja yang dipelajari dalam pelatihan caregiver?",
  biayaFaqA3:
    "Materi meliputi perawatan lansia, pencegahan infeksi, keselamatan pasien, komunikasi, serta penanganan demensia dan disabilitas.",
  biayaFaqQ4: "Apakah peluang kerja caregiver di Indonesia tinggi?",
  biayaFaqA4:
    "Ya, kebutuhan caregiver di Indonesia terus meningkat seiring bertambahnya populasi lansia.",
  biayaRelatedTitle: "Halaman Terkait",
  biayaRelatedLink1: "Pelatihan Caregiver Indonesia",
  biayaRelatedLink2: "Kursus Caregiver Bersertifikat Indonesia",
  biayaRelatedLink3: "Kelas Caregiver Online Indonesia",
  biayaRelatedLink4: "Cara Menjadi Caregiver Profesional Indonesia",
});
Object.assign(translations.id, {
  caraArticleTitle:
    "Cara Menjadi Caregiver Profesional Indonesia di Indonesia",
  caraArticleIntro:
    "Halaman ini membahas cara menjadi caregiver profesional indonesia untuk kebutuhan informational di Indonesia. Konten disusun agar calon peserta memahami materi, biaya, jalur belajar, dan langkah pendaftaran.",
  caraArticleMeta:
    'Fokus kata kunci: <strong>cara menjadi caregiver profesional indonesia</strong> | Intent: <strong>informational</strong> | Lokasi: <strong>Indonesia</strong>',
  caraWhyTitle:
    "Mengapa cara menjadi caregiver profesional indonesia penting?",
  caraWhyBody1:
    "Permintaan tenaga caregiver terus tumbuh di Indonesia. Memahami cara menjadi caregiver profesional indonesia membantu Anda memilih program yang relevan dengan kebutuhan industri.",
  caraWhyBody2:
    "Fokus pembelajaran tidak hanya teori, tetapi juga komunikasi empatik, keselamatan pasien, dan standar layanan yang konsisten.",
  caraCoreTitle: "Kompetensi inti yang dipelajari",
  caraCoreItem1: "Pendampingan aktivitas harian dan personal care",
  caraCoreItem2: "Komunikasi efektif dengan keluarga dan tim medis",
  caraCoreItem3: "Pencegahan risiko serta prosedur keselamatan dasar",
  caraStructureTitle: "Struktur program yang direkomendasikan",
  caraStructureBody:
    "Kurikulum terbaik memadukan pembelajaran online, praktik terarah, dan asesmen berbasis kasus nyata.",
  caraComponentsTitle: "Komponen belajar",
  caraComponentsItem1: "Modul teori terstruktur per topik layanan",
  caraComponentsItem2: "Praktik lapangan dengan supervisi",
  caraComponentsItem3: "Evaluasi kompetensi untuk kesiapan kerja",
  caraStartTitle: "Langkah memulai pendaftaran",
  caraStartBody:
    "Siapkan dokumen identitas, pilih jadwal belajar, dan konsultasikan target karier Anda agar rencana belajar lebih tepat sasaran.",
  caraChecklistTitle: "Checklist sebelum mendaftar",
  caraChecklistItem1:
    "Pastikan tujuan karier dan minat spesialisasi caregiver",
  caraChecklistItem2:
    "Bandingkan kurikulum, durasi, serta model pembelajaran",
  caraChecklistItem3:
    "Konfirmasi skema biaya dan dukungan pasca-lulus",
  caraFaqTitle: "FAQ cara menjadi caregiver profesional indonesia",
  caraFaqQ1:
    "Apakah cara menjadi caregiver profesional indonesia cocok untuk pemula?",
  caraFaqA1:
    "Ya. Program dirancang bertahap dari dasar hingga praktik, termasuk pendampingan untuk peserta tanpa pengalaman kerja di bidang perawatan.",
  caraFaqQ2:
    "Berapa lama durasi cara menjadi caregiver profesional indonesia di Indonesia?",
  caraFaqA2:
    "Durasi bergantung paket belajar, namun umumnya mencakup teori, praktik terstruktur, dan asesmen akhir sebelum sertifikasi diterbitkan.",
  caraFaqQ3: "Apakah ada dukungan setelah lulus?",
  caraFaqA3:
    "Ada. Peserta mendapatkan panduan penyusunan CV, simulasi wawancara, serta arahan jalur kerja di fasilitas layanan perawatan.",
  caraRelatedTitle: "Halaman Terkait",
  caraRelatedLink1: "Pelatihan Caregiver Indonesia di Indonesia",
  caraRelatedLink2:
    "Kursus Caregiver Bersertifikat Indonesia di Indonesia",
  caraRelatedLink3:
    "Pelatihan Caregiver Indonesia: Standar Global dengan Hati Indonesia",
  kelasArticleTitle: "Kelas Caregiver Online Indonesia di Indonesia",
  kelasArticleIntro:
    "Halaman ini membahas kelas caregiver online indonesia untuk kebutuhan commercial investigation di Indonesia. Konten disusun agar calon peserta memahami materi, biaya, jalur belajar, dan langkah pendaftaran.",
  kelasArticleMeta:
    'Fokus kata kunci: <strong>kelas caregiver online indonesia</strong> | Intent: <strong>commercial investigation</strong> | Lokasi: <strong>Indonesia</strong>',
  kelasWhyTitle: "Mengapa kelas caregiver online indonesia penting?",
  kelasWhyBody1:
    "Permintaan tenaga caregiver terus tumbuh di Indonesia. Memahami kelas caregiver online indonesia membantu Anda memilih program yang relevan dengan kebutuhan industri.",
  kelasWhyBody2:
    "Fokus pembelajaran tidak hanya teori, tetapi juga komunikasi empatik, keselamatan pasien, dan standar layanan yang konsisten.",
  kelasCoreTitle: "Kompetensi inti yang dipelajari",
  kelasCoreItem1: "Pendampingan aktivitas harian dan personal care",
  kelasCoreItem2: "Komunikasi efektif dengan keluarga dan tim medis",
  kelasCoreItem3: "Pencegahan risiko serta prosedur keselamatan dasar",
  kelasStructureTitle: "Struktur program yang direkomendasikan",
  kelasStructureBody:
    "Kurikulum terbaik memadukan pembelajaran online, praktik terarah, dan asesmen berbasis kasus nyata.",
  kelasComponentsTitle: "Komponen belajar",
  kelasComponentsItem1: "Modul teori terstruktur per topik layanan",
  kelasComponentsItem2: "Praktik lapangan dengan supervisi",
  kelasComponentsItem3: "Evaluasi kompetensi untuk kesiapan kerja",
  kelasStartTitle: "Langkah memulai pendaftaran",
  kelasStartBody:
    "Siapkan dokumen identitas, pilih jadwal belajar, dan konsultasikan target karier Anda agar rencana belajar lebih tepat sasaran.",
  kelasChecklistTitle: "Checklist sebelum mendaftar",
  kelasChecklistItem1:
    "Pastikan tujuan karier dan minat spesialisasi caregiver",
  kelasChecklistItem2:
    "Bandingkan kurikulum, durasi, serta model pembelajaran",
  kelasChecklistItem3:
    "Konfirmasi skema biaya dan dukungan pasca-lulus",
  kelasFaqTitle: "FAQ kelas caregiver online indonesia",
  kelasFaqQ1: "Apakah kelas caregiver online indonesia cocok untuk pemula?",
  kelasFaqA1:
    "Ya. Program dirancang bertahap dari dasar hingga praktik, termasuk pendampingan untuk peserta tanpa pengalaman kerja di bidang perawatan.",
  kelasFaqQ2:
    "Berapa lama durasi kelas caregiver online indonesia di Indonesia?",
  kelasFaqA2:
    "Durasi bergantung paket belajar, namun umumnya mencakup teori, praktik terstruktur, dan asesmen akhir sebelum sertifikasi diterbitkan.",
  kelasFaqQ3: "Apakah ada dukungan setelah lulus?",
  kelasFaqA3:
    "Ada. Peserta mendapatkan panduan penyusunan CV, simulasi wawancara, serta arahan jalur kerja di fasilitas layanan perawatan.",
  kelasRelatedTitle: "Halaman Terkait",
  kelasRelatedLink1: "Pelatihan Caregiver Indonesia di Indonesia",
  kelasRelatedLink2:
    "Kursus Caregiver Bersertifikat Indonesia di Indonesia",
  kelasRelatedLink3:
    "Pelatihan Caregiver Indonesia: Standar Global dengan Hati Indonesia",
  kursusArticleTitle:
    "Kursus Caregiver Bersertifikat Indonesia di Indonesia",
  kursusArticleIntro:
    "Halaman ini membahas kursus caregiver bersertifikat indonesia untuk kebutuhan commercial investigation di Indonesia. Konten disusun agar calon peserta memahami materi, biaya, jalur belajar, dan langkah pendaftaran.",
  kursusArticleMeta:
    'Fokus kata kunci: <strong>kursus caregiver bersertifikat indonesia</strong> | Intent: <strong>commercial investigation</strong> | Lokasi: <strong>Indonesia</strong>',
  kursusWhyTitle:
    "Mengapa kursus caregiver bersertifikat indonesia penting?",
  kursusWhyBody1:
    "Permintaan tenaga caregiver terus tumbuh di Indonesia. Memahami kursus caregiver bersertifikat indonesia membantu Anda memilih program yang relevan dengan kebutuhan industri.",
  kursusWhyBody2:
    "Fokus pembelajaran tidak hanya teori, tetapi juga komunikasi empatik, keselamatan pasien, dan standar layanan yang konsisten.",
  kursusCoreTitle: "Kompetensi inti yang dipelajari",
  kursusCoreItem1: "Pendampingan aktivitas harian dan personal care",
  kursusCoreItem2: "Komunikasi efektif dengan keluarga dan tim medis",
  kursusCoreItem3: "Pencegahan risiko serta prosedur keselamatan dasar",
  kursusStructureTitle: "Struktur program yang direkomendasikan",
  kursusStructureBody:
    "Kurikulum terbaik memadukan pembelajaran online, praktik terarah, dan asesmen berbasis kasus nyata.",
  kursusComponentsTitle: "Komponen belajar",
  kursusComponentsItem1: "Modul teori terstruktur per topik layanan",
  kursusComponentsItem2: "Praktik lapangan dengan supervisi",
  kursusComponentsItem3: "Evaluasi kompetensi untuk kesiapan kerja",
  kursusStartTitle: "Langkah memulai pendaftaran",
  kursusStartBody:
    "Siapkan dokumen identitas, pilih jadwal belajar, dan konsultasikan target karier Anda agar rencana belajar lebih tepat sasaran.",
  kursusChecklistTitle: "Checklist sebelum mendaftar",
  kursusChecklistItem1:
    "Pastikan tujuan karier dan minat spesialisasi caregiver",
  kursusChecklistItem2:
    "Bandingkan kurikulum, durasi, serta model pembelajaran",
  kursusChecklistItem3:
    "Konfirmasi skema biaya dan dukungan pasca-lulus",
  kursusFaqTitle: "FAQ kursus caregiver bersertifikat indonesia",
  kursusFaqQ1:
    "Apakah kursus caregiver bersertifikat indonesia cocok untuk pemula?",
  kursusFaqA1:
    "Ya. Program dirancang bertahap dari dasar hingga praktik, termasuk pendampingan untuk peserta tanpa pengalaman kerja di bidang perawatan.",
  kursusFaqQ2:
    "Berapa lama durasi kursus caregiver bersertifikat indonesia di Indonesia?",
  kursusFaqA2:
    "Durasi bergantung paket belajar, namun umumnya mencakup teori, praktik terstruktur, dan asesmen akhir sebelum sertifikasi diterbitkan.",
  kursusFaqQ3: "Apakah ada dukungan setelah lulus?",
  kursusFaqA3:
    "Ada. Peserta mendapatkan panduan penyusunan CV, simulasi wawancara, serta arahan jalur kerja di fasilitas layanan perawatan.",
  kursusRelatedTitle: "Halaman Terkait",
  kursusRelatedLink1: "Pelatihan Caregiver Indonesia di Indonesia",
  kursusRelatedLink2:
    "Pelatihan Caregiver Indonesia: Standar Global dengan Hati Indonesia",
  kursusRelatedLink3: "Kelas Caregiver Online Indonesia di Indonesia",
});
Object.assign(translations.en, {
  articleEyebrow: "Featured Article",
  articleHighlightsFocus: "Focus",
  articleHighlightsIntent: "Intent",
  articleHighlightsLocation: "Location",
  articleHighlightsCluster: "Cluster",
  articlesBlogSectionTitle: "Article & Blog",
  articlesBlogSectionDesc:
    "Explore Redline Academy's caregiver article cluster from discovery and credential research to institution comparison and ready-to-enrol guidance.",
  articlesBlogBadge: "Blog",
  articlesArticleBadge: "Article",
  articlesBlogMainTitle: "Caregiver & Career Blog",
  articlesBlogMainDesc:
    "Read four connected caregiver articles designed to help you understand the program, credential value, institution quality, and enrolment steps.",
  articlesOpenPage: "Open Page",
  articlesReadMore: "Read Article",
  articlesPelatihanTitle: "Caregiver Training in Indonesia",
  articlesPelatihanDesc:
    "See why Australian standards change the value of caregiver training and help Indonesian talent earn international recognition.",
  articlesKursusTitle: "Certified Caregiver Course",
  articlesKursusDesc:
    "Understand the difference between an AUS NMF credential and a regular certificate, including what global employers actually evaluate.",
  articlesLembagaTitle: "Caregiver Training Institution",
  articlesLembagaDesc:
    "Compare institutions with seven essential checks before you enrol, from credential verification to post-study career support.",
  articlesDaftarTitle: "Apply to Become a Professional Caregiver",
  articlesDaftarDesc:
    "Follow a step-by-step guide to choose a pathway, check the requirements, select a study format, and start your enrolment.",
  articleCtaBadge: "🏠 Care Locally · 💼 Grow Locally · 🌏 Open Global Doors",
  articleCtaTitle: "Ready to start your journey as a professional caregiver?",
  articleCtaBody:
    "Care for your family today. Build a local career with a recognised credential. Open global doors when you are ready - with the same certificate. Starting from Rp 500rb/month.",
  articleCtaButton: "Start Your Journey →",
  articleCtaWhatsapp: "💬 Ask via WhatsApp",
  pelatihanArticleTitle: "Caregiver Training in Indonesia",
  pelatihanArticleIntro:
    "This page discusses caregiver training in Indonesia for informational intent. The content is designed to help prospective participants understand the curriculum, cost factors, learning pathway, and enrollment steps.",
  pelatihanArticleMeta:
    'Keyword focus: <strong>pelatihan caregiver indonesia</strong> | Intent: <strong>informational</strong> | Location: <strong>Indonesia</strong>',
  pelatihanWhyTitle: "Why is caregiver training in Indonesia important?",
  pelatihanWhyBody1:
    "Demand for caregivers continues to grow in Indonesia. Understanding caregiver training helps you choose a program that aligns with industry needs.",
  pelatihanWhyBody2:
    "The learning focus goes beyond theory and includes empathetic communication, patient safety, and consistent service standards.",
  pelatihanCoreTitle: "Core competencies you will learn",
  pelatihanCoreItem1: "Daily activity assistance and personal care",
  pelatihanCoreItem2: "Effective communication with families and medical teams",
  pelatihanCoreItem3: "Risk prevention and basic safety procedures",
  pelatihanStructureTitle: "Recommended program structure",
  pelatihanStructureBody:
    "A strong curriculum combines online learning, guided practice, and competency assessment based on real cases.",
  pelatihanComponentsTitle: "Learning components",
  pelatihanComponentsItem1: "Structured theory modules by care topic",
  pelatihanComponentsItem2: "Field practice with supervision",
  pelatihanComponentsItem3: "Competency evaluation for work readiness",
  pelatihanStartTitle: "How to begin enrollment",
  pelatihanStartBody:
    "Prepare your identification documents, choose a study schedule, and discuss your career goals so your learning plan is more targeted.",
  pelatihanChecklistTitle: "Checklist before enrolling",
  pelatihanChecklistItem1:
    "Clarify your career goals and caregiver specialization interests",
  pelatihanChecklistItem2:
    "Compare curriculum, duration, and learning model",
  pelatihanChecklistItem3:
    "Confirm cost scheme and post-graduation support",
  pelatihanFaqTitle: "Caregiver training FAQ",
  pelatihanFaqQ1: "Is caregiver training suitable for beginners?",
  pelatihanFaqA1:
    "Yes. The program is designed progressively from fundamentals to practice, including support for learners with no prior caregiving experience.",
  pelatihanFaqQ2:
    "How long does caregiver training in Indonesia usually take?",
  pelatihanFaqA2:
    "The duration depends on the package, but it generally includes theory, structured practice, and final assessment before certification is issued.",
  pelatihanFaqQ3: "Is there support after graduation?",
  pelatihanFaqA3:
    "Yes. Participants receive CV guidance, interview simulation, and direction for career pathways in care service facilities.",
  pelatihanRelatedTitle: "Related Pages",
  pelatihanRelatedLink1:
    "Caregiver Training in Indonesia: Global Standards with Indonesian Values",
  pelatihanRelatedLink2: "Certified Caregiver Course Indonesia",
  pelatihanRelatedLink3: "Online Caregiver Class Indonesia",
  biayaArticleEyebrow: "Featured Article",
  biayaArticleTitle:
    "Caregiver Training in Indonesia: Global Standards with Indonesian Values",
  biayaArticleIntro:
    "Indonesia is entering a major demographic transition. By 2050, the elderly population is projected to exceed 72 million people, making professional and culturally grounded caregiver training more important than ever.",
  biayaArticleMeta:
    'Keyword focus: <strong>pelatihan caregiver indonesia</strong> | Intent: <strong>informational</strong> | Angle: <strong>global standards, local values</strong>',
  biayaHighlightFocus: "caregiver training in Indonesia",
  biayaHighlightIntent: "informational",
  biayaHighlightCluster:
    "certification, global standards, dementia care, careers",
  biayaWhyTitle: "A paradigm shift: from dependency to empowerment",
  biayaWhyBody1:
    "Older adults have often been treated only as dependent recipients of care. That view focuses narrowly on physical support and does not fully answer the future need for dignity, autonomy, and quality of life.",
  biayaWhyBody2:
    "Modern caregiver training should adopt an empowered paradigm, where caregivers learn to support independence, respect individual rights, and provide holistic care rather than routine assistance alone.",
  biayaWhyBody3:
    'To compare more specific learning paths, you can also explore the <a href="kursus-caregiver-bersertifikat.html">certified caregiver course</a> and the <a href="lembaga-pelatihan-caregiver.html">caregiver training institution guide</a>.',
  biayaImageCaption1:
    "A strong caregiver program goes beyond basic tasks and develops professional standards, ethics, and readiness for modern elderly care.",
  biayaFactorsTitle: "Two worlds, one standard: the core of modern caregiver training",
  biayaFactorsBody:
    "Redline's updated material shows that relevant caregiver training in Indonesia must combine international clinical standards with local cultural values. This is what makes graduates technically competent and socially aware.",
  biayaFactorsItem1:
    "<strong>Global standards:</strong> patient safety, clinical ethics, legal awareness, and precise care practices form the professional foundation.",
  biayaFactorsItem2:
    "<strong>Indonesian values:</strong> filial piety, mutual cooperation, respect, and shared decision-making keep care aligned with local family realities.",
  biayaFactorsItem3:
    "<strong>Field adaptability:</strong> caregivers should be ready for different environments, including community settings and limited-resource care contexts.",
  biayaFactorsItem4:
    "<strong>Quality of life as the goal:</strong> training should not stop at completing tasks, but aim to improve dignity and overall well-being.",
  biayaClusterTitle: "The four pillars of professional caregiver training in Indonesia",
  biayaClusterBody:
    "To meet real workforce needs, caregiver training must go beyond basic care routines. A strong program should be built on these four core pillars.",
  biayaClusterItem1:
    "<strong>Professional practice and care foundations:</strong> ethics, legal boundaries, and collaboration with families and care facilities.",
  biayaClusterItem2:
    "<strong>Empowerment-based support:</strong> caregivers learn to act as facilitators who promote autonomy, not only as task providers.",
  biayaClusterItem3:
    "<strong>Infection prevention and safety:</strong> hygiene, safety, and local adaptation of international standards remain essential.",
  biayaClusterItem4:
    "<strong>Specialist support:</strong> dementia, disability, and emotional-social care prepare learners for more complex cases.",
  biayaChecklistTitle:
    "Why this training matters for the future of caregiving in Indonesia",
  biayaChecklistItem1:
    "It opens local and international career opportunities through stronger professional standards.",
  biayaChecklistItem2:
    "It builds a global mindset without losing Indonesian cultural empathy.",
  biayaChecklistItem3:
    "It prepares learners for complex cases such as dementia, disability, and emotional support needs.",
  biayaChecklistItem4:
    "It helps graduates protect dignity and quality of life, not just complete daily tasks.",
  biayaChecklistBody:
    "As elderly care demand continues to rise, strong caregiver training becomes an important investment for learners, families, and Indonesia's wider care system.",
  biayaChecklistNote:
    'To see how this learning path connects with certification, institution comparison, and career planning, continue to the <a href="kursus-caregiver-bersertifikat.html">certified caregiver course</a>, the <a href="lembaga-pelatihan-caregiver.html">institution comparison guide</a>, or the <a href="daftar-menjadi-caregiver-profesional.html">professional caregiver enrolment guide</a>.',
  biayaImageCaption2:
    "Future caregivers need a balance of global standards, emotional sensitivity, and Indonesian cultural understanding.",
  biayaFaqTitle: "Caregiver training FAQ",
  biayaFaqQ1: "What is caregiver training in Indonesia?",
  biayaFaqA1:
    "Caregiver training in Indonesia is a professional program designed to teach elderly care skills, including basic medical support, ethics, and communication.",
  biayaFaqQ2: "Is caregiver training certified?",
  biayaFaqA2:
    "Yes. Most professional caregiver training programs provide certification that can support local and international job opportunities.",
  biayaFaqQ3: "What do you learn in caregiver training?",
  biayaFaqA3:
    "Topics include elderly care, infection control, patient safety, communication skills, and dementia and disability support.",
  biayaFaqQ4: "Is there high demand for caregivers in Indonesia?",
  biayaFaqA4:
    "Yes. Demand continues to grow as Indonesia's elderly population increases.",
  biayaRelatedTitle: "Related Pages",
  biayaRelatedLink1: "Caregiver Training in Indonesia",
  biayaRelatedLink2: "Certified Caregiver Course Indonesia",
  biayaRelatedLink3: "Online Caregiver Class Indonesia",
  biayaRelatedLink4: "How to Become a Professional Caregiver in Indonesia",
});
Object.assign(translations.en, {
  caraArticleTitle: "How to Become a Professional Caregiver in Indonesia",
  caraArticleIntro:
    "This page discusses how to become a professional caregiver in Indonesia for informational intent. The content is designed to help prospective participants understand the curriculum, pathway, and enrollment steps.",
  caraArticleMeta:
    'Keyword focus: <strong>cara menjadi caregiver profesional indonesia</strong> | Intent: <strong>informational</strong> | Location: <strong>Indonesia</strong>',
  caraWhyTitle: "Why is becoming a professional caregiver important?",
  caraWhyBody1:
    "Demand for caregivers continues to grow in Indonesia. Understanding the pathway to becoming a professional caregiver helps you choose a program that aligns with industry needs.",
  caraWhyBody2:
    "The learning focus goes beyond theory and includes empathetic communication, patient safety, and consistent service standards.",
  caraCoreTitle: "Core competencies you will learn",
  caraCoreItem1: "Daily activity assistance and personal care",
  caraCoreItem2: "Effective communication with families and medical teams",
  caraCoreItem3: "Risk prevention and basic safety procedures",
  caraStructureTitle: "Recommended program structure",
  caraStructureBody:
    "A strong curriculum combines online learning, guided practice, and competency assessment based on real cases.",
  caraComponentsTitle: "Learning components",
  caraComponentsItem1: "Structured theory modules by care topic",
  caraComponentsItem2: "Field practice with supervision",
  caraComponentsItem3: "Competency evaluation for work readiness",
  caraStartTitle: "How to begin enrollment",
  caraStartBody:
    "Prepare your identification documents, choose a study schedule, and discuss your career goals so your learning plan is more targeted.",
  caraChecklistTitle: "Checklist before enrolling",
  caraChecklistItem1:
    "Clarify your career goals and caregiver specialization interests",
  caraChecklistItem2:
    "Compare curriculum, duration, and learning model",
  caraChecklistItem3:
    "Confirm cost scheme and post-graduation support",
  caraFaqTitle: "Professional caregiver pathway FAQ",
  caraFaqQ1: "Is this path suitable for beginners?",
  caraFaqA1:
    "Yes. The program is designed progressively from fundamentals to practice, including support for learners with no prior caregiving experience.",
  caraFaqQ2:
    "How long does the path to becoming a professional caregiver usually take?",
  caraFaqA2:
    "The duration depends on the package, but it generally includes theory, structured practice, and final assessment before certification is issued.",
  caraFaqQ3: "Is there support after graduation?",
  caraFaqA3:
    "Yes. Participants receive CV guidance, interview simulation, and direction for career pathways in care service facilities.",
  caraRelatedTitle: "Related Pages",
  caraRelatedLink1: "Caregiver Training in Indonesia",
  caraRelatedLink2: "Certified Caregiver Course Indonesia",
  caraRelatedLink3:
    "Caregiver Training in Indonesia: Global Standards with Indonesian Values",
  kelasArticleTitle: "Online Caregiver Class Indonesia",
  kelasArticleIntro:
    "This page discusses online caregiver classes in Indonesia for commercial investigation intent. The content is designed to help prospective participants understand the curriculum, value, learning pathway, and enrollment steps.",
  kelasArticleMeta:
    'Keyword focus: <strong>kelas caregiver online indonesia</strong> | Intent: <strong>commercial investigation</strong> | Location: <strong>Indonesia</strong>',
  kelasWhyTitle: "Why are online caregiver classes in Indonesia important?",
  kelasWhyBody1:
    "Demand for caregivers continues to grow in Indonesia. Understanding online caregiver classes helps you choose a program that aligns with industry needs and study flexibility.",
  kelasWhyBody2:
    "The learning focus goes beyond theory and includes empathetic communication, patient safety, and consistent service standards.",
  kelasCoreTitle: "Core competencies you will learn",
  kelasCoreItem1: "Daily activity assistance and personal care",
  kelasCoreItem2: "Effective communication with families and medical teams",
  kelasCoreItem3: "Risk prevention and basic safety procedures",
  kelasStructureTitle: "Recommended program structure",
  kelasStructureBody:
    "A strong curriculum combines online learning, guided practice, and competency assessment based on real cases.",
  kelasComponentsTitle: "Learning components",
  kelasComponentsItem1: "Structured theory modules by care topic",
  kelasComponentsItem2: "Field practice with supervision",
  kelasComponentsItem3: "Competency evaluation for work readiness",
  kelasStartTitle: "How to begin enrollment",
  kelasStartBody:
    "Prepare your identification documents, choose a study schedule, and discuss your career goals so your learning plan is more targeted.",
  kelasChecklistTitle: "Checklist before enrolling",
  kelasChecklistItem1:
    "Clarify your career goals and caregiver specialization interests",
  kelasChecklistItem2:
    "Compare curriculum, duration, and learning model",
  kelasChecklistItem3:
    "Confirm cost scheme and post-graduation support",
  kelasFaqTitle: "Online caregiver class FAQ",
  kelasFaqQ1: "Is an online caregiver class suitable for beginners?",
  kelasFaqA1:
    "Yes. The program is designed progressively from fundamentals to practice, including support for learners with no prior caregiving experience.",
  kelasFaqQ2:
    "How long do online caregiver classes in Indonesia usually take?",
  kelasFaqA2:
    "The duration depends on the package, but it generally includes theory, structured practice, and final assessment before certification is issued.",
  kelasFaqQ3: "Is there support after graduation?",
  kelasFaqA3:
    "Yes. Participants receive CV guidance, interview simulation, and direction for career pathways in care service facilities.",
  kelasRelatedTitle: "Related Pages",
  kelasRelatedLink1: "Caregiver Training in Indonesia",
  kelasRelatedLink2: "Certified Caregiver Course Indonesia",
  kelasRelatedLink3:
    "Caregiver Training in Indonesia: Global Standards with Indonesian Values",
  kursusArticleTitle: "Certified Caregiver Course Indonesia",
  kursusArticleIntro:
    "This page discusses certified caregiver courses in Indonesia for commercial investigation intent. The content is designed to help prospective participants understand the curriculum, value, learning pathway, and enrollment steps.",
  kursusArticleMeta:
    'Keyword focus: <strong>kursus caregiver bersertifikat indonesia</strong> | Intent: <strong>commercial investigation</strong> | Location: <strong>Indonesia</strong>',
  kursusWhyTitle: "Why is a certified caregiver course in Indonesia important?",
  kursusWhyBody1:
    "Demand for caregivers continues to grow in Indonesia. Understanding certified caregiver courses helps you choose a program that aligns with industry needs.",
  kursusWhyBody2:
    "The learning focus goes beyond theory and includes empathetic communication, patient safety, and consistent service standards.",
  kursusCoreTitle: "Core competencies you will learn",
  kursusCoreItem1: "Daily activity assistance and personal care",
  kursusCoreItem2: "Effective communication with families and medical teams",
  kursusCoreItem3: "Risk prevention and basic safety procedures",
  kursusStructureTitle: "Recommended program structure",
  kursusStructureBody:
    "A strong curriculum combines online learning, guided practice, and competency assessment based on real cases.",
  kursusComponentsTitle: "Learning components",
  kursusComponentsItem1: "Structured theory modules by care topic",
  kursusComponentsItem2: "Field practice with supervision",
  kursusComponentsItem3: "Competency evaluation for work readiness",
  kursusStartTitle: "How to begin enrollment",
  kursusStartBody:
    "Prepare your identification documents, choose a study schedule, and discuss your career goals so your learning plan is more targeted.",
  kursusChecklistTitle: "Checklist before enrolling",
  kursusChecklistItem1:
    "Clarify your career goals and caregiver specialization interests",
  kursusChecklistItem2:
    "Compare curriculum, duration, and learning model",
  kursusChecklistItem3:
    "Confirm cost scheme and post-graduation support",
  kursusFaqTitle: "Certified caregiver course FAQ",
  kursusFaqQ1: "Is a certified caregiver course suitable for beginners?",
  kursusFaqA1:
    "Yes. The program is designed progressively from fundamentals to practice, including support for learners with no prior caregiving experience.",
  kursusFaqQ2:
    "How long does a certified caregiver course in Indonesia usually take?",
  kursusFaqA2:
    "The duration depends on the package, but it generally includes theory, structured practice, and final assessment before certification is issued.",
  kursusFaqQ3: "Is there support after graduation?",
  kursusFaqA3:
    "Yes. Participants receive CV guidance, interview simulation, and direction for career pathways in care service facilities.",
  kursusRelatedTitle: "Related Pages",
  kursusRelatedLink1: "Caregiver Training in Indonesia",
  kursusRelatedLink2:
    "Caregiver Training in Indonesia: Global Standards with Indonesian Values",
  kursusRelatedLink3: "Online Caregiver Class Indonesia",
});
Object.assign(translations.id, {
  blogPageTitle: "Blog Caregiver & Karier",
  blogMetaDescription:
    "Artikel edukasi caregiver, tips karier kesehatan, dan wawasan pelatihan vokasi dari Redline Academy untuk calon tenaga perawatan Indonesia.",
});
Object.assign(translations.en, {
  blogPageTitle: "Caregiver & Career Blog",
  blogMetaDescription:
    "Caregiver education articles, healthcare career tips, and vocational training insights from Redline Academy for aspiring care professionals in Indonesia.",
});
let currentLanguage;

function getOptionalTranslation(key) {
  if (translations[currentLanguage] && translations[currentLanguage][key]) {
    return translations[currentLanguage][key];
  }
  if (translations.id && translations.id[key]) {
    return translations.id[key];
  }
  if (translations.en && translations.en[key]) {
    return translations.en[key];
  }
  return null;
}

// Try to get language from localStorage, with fallback
try {
  currentLanguage = localStorage.getItem("language") || "id";
  console.log("Language loaded from localStorage:", currentLanguage);
} catch (e) {
  // localStorage might be unavailable in private mode or strict privacy settings
  console.warn("localStorage not available, using default language 'id'");
  currentLanguage = "id";
}

function setLanguage(lang) {
  console.log("setLanguage called with lang:", lang);

  // Validate language
  if (!translations[lang]) {
    console.error("Language not found in translations:", lang);
    return;
  }

  currentLanguage = lang;

  // Try to save to localStorage
  try {
    localStorage.setItem("language", lang);
    console.log("Language saved to localStorage:", lang);
  } catch (e) {
    console.warn("Could not save to localStorage:", e.message);
  }

  updatePageLanguage();
  document.dispatchEvent(
    new CustomEvent("languagechange", {
      detail: { lang: currentLanguage },
    }),
  );

  // Update active button
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  const activeBtn = document.querySelector(`[data-lang="${lang}"]`);
  if (activeBtn) {
    activeBtn.classList.add("active");
    console.log("Active button updated for language:", lang);
  } else {
    console.warn("Could not find button for language:", lang);
  }
}

window.setLanguage = setLanguage;

function t(key) {
  // Prefer current language, fall back to Indonesian, then English, then key
  if (translations[currentLanguage] && translations[currentLanguage][key]) {
    return translations[currentLanguage][key];
  }
  if (translations.id && translations.id[key]) {
    return translations.id[key];
  }
  if (translations.en && translations.en[key]) {
    return translations.en[key];
  }
  return key;
}

window.t = t;

function mergePageTranslations() {
  if (!window.pageTranslations || typeof window.pageTranslations !== "object") {
    return;
  }

  Object.entries(window.pageTranslations).forEach(([lang, values]) => {
    if (!translations[lang]) {
      translations[lang] = {};
    }

    if (values && typeof values === "object") {
      Object.assign(translations[lang], values);
    }
  });
}

mergePageTranslations();

function getArticleSeoConfig() {
  const bodyPrefix = document.body?.dataset?.articlePrefix;
  if (bodyPrefix) {
    return { prefix: bodyPrefix };
  }

  const path = window.location.pathname;
  const configs = [
    { match: "pelatihan-caregiver-indonesia-standar-global", prefix: "biaya" },
    { match: "pelatihan-caregiver-indonesia", prefix: "pelatihan" },
    { match: "lembaga-pelatihan-caregiver", prefix: "lembaga" },
    { match: "daftar-menjadi-caregiver-profesional", prefix: "daftar" },
    { match: "kursus-caregiver-bersertifikat.html", prefix: "kursus" },
    { match: "cara-menjadi-caregiver-profesional-indonesia", prefix: "cara" },
    { match: "kelas-caregiver-online-indonesia", prefix: "kelas" },
    { match: "kursus-caregiver-bersertifikat-indonesia", prefix: "kursus" },
  ];

  return configs.find((config) => path.includes(config.match)) || null;
}

function updateStructuredDataForArticle(prefix, pageTitle, pageDescription) {
  if (
    window.location.pathname.includes(
      "pelatihan-caregiver-indonesia-standar-global",
    ) &&
    typeof window.applyPageSeo === "function"
  ) {
    window.applyPageSeo(currentLanguage);
    return;
  }

  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  if (!scripts.length) return;

  scripts.forEach((script) => {
    try {
      const data = JSON.parse(script.textContent);
      if (data["@type"] === "Article") {
        data.headline = getOptionalTranslation(`${prefix}ArticleTitle`) || pageTitle;
        data.description = pageDescription;
        data.inLanguage = currentLanguage;
        script.textContent = JSON.stringify(data, null, 2);
      } else if (data["@type"] === "Course") {
        data.name = t(`${prefix}ArticleTitle`);
        data.description = pageDescription;
        data.inLanguage = [currentLanguage];
        data.availableLanguage = ["id", "en"];
        script.textContent = JSON.stringify(data, null, 2);
      } else if (data["@type"] === "FAQPage" && Array.isArray(data.mainEntity)) {
        const faqKeys = [];
        for (let index = 1; index <= 10; index += 1) {
          const question = t(`${prefix}FaqQ${index}`);
          const answer = t(`${prefix}FaqA${index}`);
          if (question !== `${prefix}FaqQ${index}` && answer !== `${prefix}FaqA${index}`) {
            faqKeys.push(index);
          }
        }

        data.mainEntity = faqKeys.map((index) => ({
          "@type": "Question",
          name: t(`${prefix}FaqQ${index}`),
          acceptedAnswer: {
            "@type": "Answer",
            text: t(`${prefix}FaqA${index}`),
          },
        }));
        script.textContent = JSON.stringify(data, null, 2);
      }
    } catch (error) {
      console.warn("Failed to update structured data block:", error);
    }
  });
}

function updateSeoMetadata() {
  document.documentElement.lang = currentLanguage;

  if (
    window.location.pathname.includes(
      "pelatihan-caregiver-indonesia-standar-global",
    ) &&
    typeof window.applyPageSeo === "function"
  ) {
    window.applyPageSeo(currentLanguage);
    return;
  }

  if (window.location.pathname.includes("blog")) {
    const blogTitle = `${t("blogPageTitle")} | Redline Academy`;
    const blogDescription = t("blogMetaDescription");
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
    const twitterTitleMeta = document.querySelector('meta[name="twitter:title"]');
    const twitterDescriptionMeta = document.querySelector('meta[name="twitter:description"]');
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    if (descriptionMeta) descriptionMeta.setAttribute("content", blogDescription);
    if (ogTitleMeta) ogTitleMeta.setAttribute("content", blogTitle);
    if (ogDescriptionMeta) ogDescriptionMeta.setAttribute("content", blogDescription);
    if (twitterTitleMeta) twitterTitleMeta.setAttribute("content", blogTitle);
    if (twitterDescriptionMeta) twitterDescriptionMeta.setAttribute("content", blogDescription);

    scripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent);
        if (data["@type"] === "CollectionPage") {
          data.name = blogTitle;
          data.description = blogDescription;
          script.textContent = JSON.stringify(data, null, 2);
        }
      } catch (error) {
        console.warn("Failed to update blog structured data block:", error);
      }
    });
    return;
  }

  const explicitMetaTitle = getOptionalTranslation("pageMetaTitle");
  const explicitMetaDescription = getOptionalTranslation("pageMetaDescription");
  if (explicitMetaTitle || explicitMetaDescription) {
    const pageTitle = explicitMetaTitle || document.title;
    const pageDescription =
      explicitMetaDescription || document.querySelector('meta[name="description"]')?.content || "";
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
    const twitterTitleMeta = document.querySelector('meta[name="twitter:title"]');
    const twitterDescriptionMeta = document.querySelector('meta[name="twitter:description"]');

    if (descriptionMeta) descriptionMeta.setAttribute("content", pageDescription);
    if (ogTitleMeta) ogTitleMeta.setAttribute("content", pageTitle);
    if (ogDescriptionMeta) ogDescriptionMeta.setAttribute("content", pageDescription);
    if (twitterTitleMeta) twitterTitleMeta.setAttribute("content", pageTitle);
    if (twitterDescriptionMeta) twitterDescriptionMeta.setAttribute("content", pageDescription);
    return;
  }

  const articleConfig = getArticleSeoConfig();
  if (!articleConfig) return;

  const titleKey = `${articleConfig.prefix}ArticleTitle`;
  const introKey = `${articleConfig.prefix}ArticleIntro`;
  const metaTitleKey = `${articleConfig.prefix}MetaTitle`;
  const metaDescriptionKey = `${articleConfig.prefix}MetaDescription`;
  const pageTitle =
    getOptionalTranslation(metaTitleKey) || `${t(titleKey)} | Redline Academy`;
  const pageDescription =
    getOptionalTranslation(metaDescriptionKey) || t(introKey);

  const descriptionMeta = document.querySelector('meta[name="description"]');
  const ogTitleMeta = document.querySelector('meta[property="og:title"]');
  const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
  const twitterTitleMeta = document.querySelector('meta[name="twitter:title"]');
  const twitterDescriptionMeta = document.querySelector('meta[name="twitter:description"]');

  if (descriptionMeta) descriptionMeta.setAttribute("content", pageDescription);
  if (ogTitleMeta) ogTitleMeta.setAttribute("content", pageTitle);
  if (ogDescriptionMeta) ogDescriptionMeta.setAttribute("content", pageDescription);
  if (twitterTitleMeta) twitterTitleMeta.setAttribute("content", pageTitle);
  if (twitterDescriptionMeta) twitterDescriptionMeta.setAttribute("content", pageDescription);

  updateStructuredDataForArticle(articleConfig.prefix, pageTitle, pageDescription);
}

function updatePageLanguage() {
  console.log("updatePageLanguage called for", currentLanguage);

  // Update all elements with data-i18n attribute
  const elements = document.querySelectorAll("[data-i18n]");
  console.log("Found", elements.length, "elements with data-i18n");

  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const text = t(key);

    if (!text || text === key) {
      console.warn(`Translation missing for key: ${key}`);
    }

    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      element.placeholder = text;
    } else if (element.tagName === "OPTION") {
      element.textContent = text;
    } else {
      // If the translation contains HTML tags, render as HTML
      if (typeof text === "string" && text.includes("<")) {
        element.innerHTML = text;
      } else {
        element.textContent = text;
      }
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    element.setAttribute("placeholder", t(key));
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const key = element.getAttribute("data-i18n-aria-label");
    element.setAttribute("aria-label", t(key));
  });

  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    const key = element.getAttribute("data-i18n-title");
    element.setAttribute("title", t(key));
  });

  document.querySelectorAll("[data-lang-block]").forEach((block) => {
    block.hidden = block.getAttribute("data-lang-block") !== currentLanguage;
  });

  console.log("Page language updated to:", currentLanguage);

  // Update page title and meta
  updatePageTitle();
  updateSeoMetadata();
}

window.updatePageLanguage = updatePageLanguage;

function updatePageTitle() {
  const explicitPageTitle = getOptionalTranslation("pageMetaTitle");
  if (explicitPageTitle) {
    document.title = explicitPageTitle;
    return;
  }

  const articleConfig = getArticleSeoConfig();
  if (articleConfig) {
    document.title =
      getOptionalTranslation(`${articleConfig.prefix}MetaTitle`) ||
      `${t(`${articleConfig.prefix}ArticleTitle`)} | Redline Academy`;
    return;
  }

  const path = window.location.pathname;
  if (path.includes("about")) {
    document.title = `${t("aboutUs")} - Redline Academy`;
  } else if (path.includes("programs")) {
    document.title = `${t("ourPrograms")} - Redline Academy`;
  } else if (path.includes("contact")) {
    document.title = `${t("contactUs")} - Redline Academy`;
  } else if (path.includes("blog")) {
    document.title = `${t("blogPageTitle")} - Redline Academy`;
  } else if (path.includes("legal")) {
    document.title = `${t("legalTitle")} - Redline Academy`;
  } else if (path.includes("login")) {
    document.title = `${t("lmsLoginTitle")} - Redline Academy`;
  } else if (path.includes("dashboard-student")) {
    document.title = `${t("lmsStudentDashboardTitle")} - Redline Academy`;
  } else if (path.includes("dashboard-admin")) {
    document.title = `${t("lmsAdminDashboardTitle")} - Redline Academy`;
  } else {
    document.title = "Redline Academy";
  }
}

// Initialize language on page load
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded fired");
  console.log("Current language:", currentLanguage);
  console.log("Translations object:", typeof translations);
  console.log(
    "Lang buttons found:",
    document.querySelectorAll(".lang-btn").length,
  );

  // Set initial language
  const langBtn = document.querySelector(`[data-lang="${currentLanguage}"]`);
  if (langBtn) {
    langBtn.classList.add("active");
    console.log("Active language button set:", currentLanguage);
  } else {
    console.warn("Language button not found for:", currentLanguage);
  }

  updatePageLanguage();
  document.dispatchEvent(
    new CustomEvent("languagechange", {
      detail: { lang: currentLanguage },
    }),
  );

  // Set up language switcher
  const langButtons = document.querySelectorAll(".lang-btn");
  console.log(
    "Setting up language switcher for",
    langButtons.length,
    "buttons",
  );

  langButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const lang = this.getAttribute("data-lang");
      console.log("Language button clicked:", lang);
      setLanguage(lang);
    });
  });

  // Set up navigation active state
  const normalizePath = (path) => {
    const cleanPath = (path || "").replace(/\/+$/, "");
    return cleanPath || "/";
  };

  const normalizeHrefPath = (href) => {
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
      return "";
    }

    try {
      return normalizePath(new URL(href, window.location.href).pathname);
    } catch (err) {
      return "";
    }
  };

  const currentPath = normalizePath(window.location.pathname);

  document.querySelectorAll("nav .nav-links a").forEach((link) => {
    const href = link.getAttribute("href");
    const hrefPath = normalizeHrefPath(href);
    const isHomeHref = hrefPath === "/" || hrefPath.endsWith("/index.html");
    const isHomeCurrent =
      currentPath === "/" || currentPath.endsWith("/index.html");
    const isActive =
      (isHomeHref && isHomeCurrent) ||
      (!isHomeHref && hrefPath !== "" && hrefPath === currentPath);

    link.classList.toggle("active", isActive);
  });

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("nav");
  if (menuToggle && nav) {
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", function () {
      // Toggle the CSS `active` class so the menu appearance is driven by CSS
      const isOpen = nav.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function () {
        nav.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Form submission (AJAX to Formspree)
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const form = this;
      const action = form.getAttribute("action") || form.dataset.action;
      if (!action) {
        alert(
          currentLanguage === "id"
            ? "Form action tidak ditemukan."
            : "Form action not found.",
        );
        return;
      }

      const submitBtn = form.querySelector(
        'button[type="submit"], input[type="submit"]',
      );
      if (submitBtn) submitBtn.disabled = true;

      const formData = new FormData(form);
      // honeypot check
      if (formData.get("_gotcha")) {
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      fetch(action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok)
            return response.json().catch(function () {
              return {};
            });
          return response.json().then(function (err) {
            throw err;
          });
        })
        .then(function () {
          // success
          alert(
            currentLanguage === "id"
              ? "Terima kasih â€” pesan Anda telah terkirim."
              : "Thank you â€” your message has been sent.",
          );
          form.reset();
          if (submitBtn) submitBtn.disabled = false;
          var next = formData.get("_next");
          if (next)
            setTimeout(function () {
              window.location.href = next;
            }, 900);
        })
        .catch(function () {
          alert(
            currentLanguage === "id"
              ? "Terjadi kesalahan saat mengirim. Silakan coba lagi."
              : "Error sending form. Please try again.",
          );
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  // Handling enrollment buttons
  document.querySelectorAll('[data-i18n="enrollNow"]').forEach((button) => {
    button.addEventListener("click", () => {
      // Scroll to contact section
      document.querySelector("#contact").scrollIntoView({ behavior: "smooth" });
    });
  });
});

// Smooth scroll for anchor links
document.addEventListener("click", function (e) {
  if (
    e.target.tagName === "A" &&
    e.target.getAttribute("href").startsWith("#")
  ) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }
});

// File upload preview + simple client-side validation for enroll form
(function () {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];

  document.addEventListener("DOMContentLoaded", function () {
    const enroll = document.getElementById("enroll-form");
    if (!enroll) return;

    enroll.querySelectorAll('input[type="file"]').forEach(function (fileInput) {
      const label = fileInput.closest("label");
      const fileNameSpan = document.createElement("span");
      fileNameSpan.className = "file-name";
      fileNameSpan.setAttribute("aria-live", "polite");

      if (label && label.parentNode) {
        label.parentNode.insertBefore(fileNameSpan, label.nextSibling);
      } else if (fileInput.parentNode) {
        fileInput.parentNode.insertBefore(fileNameSpan, fileInput.nextSibling);
      }

      fileInput.addEventListener("change", function () {
        const f = fileInput.files && fileInput.files[0];
        if (!f) {
          fileNameSpan.textContent = "";
          return;
        }

        if (ALLOWED_TYPES.indexOf(f.type) === -1) {
          fileNameSpan.textContent =
            typeof currentLanguage !== "undefined" && currentLanguage === "id"
              ? "Tipe file tidak didukung"
              : "File type not supported";
          fileNameSpan.style.color = "red";
          fileInput.value = "";
          return;
        }

        if (f.size > MAX_SIZE) {
          fileNameSpan.textContent =
            typeof currentLanguage !== "undefined" && currentLanguage === "id"
              ? "File terlalu besar (max 5MB)"
              : "File too large (max 5MB)";
          fileNameSpan.style.color = "red";
          fileInput.value = "";
          return;
        }

        fileNameSpan.style.color = "";
        fileNameSpan.textContent = f.name;
      });
    });
  });
})();

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".rl-count[data-target]").forEach((el) => {
    const t = +el.dataset.target;
    let n = 0;
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const s = () => {
        n = Math.min(n + Math.ceil(t / 40), t);
        el.textContent = n;
        if (n < t) requestAnimationFrame(s);
      };
      s();
    }).observe(el);
  });
});

const JOURNEY_DATA = {
  id: {
    1: {
      icon: "🏠",
      title: "Rawat orang yang kamu cintai — hari pertama setelah lulus",
      desc: "Sertifikat Redline langsung bisa kamu gunakan. Merawat orang tua, anggota keluarga, atau tetangga yang membutuhkan bantuan. Bukan sekadar merawat — tapi merawat dengan standar, martabat, dan pendekatan yang benar.",
      certs: ["✓ Person-centred care", "✓ Infection control", "✓ Safety management"],
      color: "#d7001e",
      stageClass: "stage1",
    },
    2: {
      icon: "💼",
      title: "Jadilah caregiver yang dicari fasilitas kesehatan di kotamu",
      desc: "Credential AU membedakanmu dari pelamar tanpa sertifikasi. Buka peluang di rumah sakit, panti jompo, home care, dan klinik lansia Indonesia. Penghasilan stabil. Pengakuan profesional. Kontribusi nyata.",
      certs: ["✓ Diakui RS & panti jompo", "✓ Home care providers", "✓ Klinik lansia lokal"],
      color: "#d7001e",
      stageClass: "stage2",
    },
    3: {
      icon: "📋",
      title: "Setiap bulan kerja kamu membangun profil yang diakui employer global",
      desc: "Credential AU + rekam jejak kerja Indonesia = kombinasi yang dibaca employer internasional. Mereka melihat: standar yang mereka percaya (AU credential) + pengalaman nyata (work history). Profil ini tidak bisa dibangun tanpa keduanya.",
      certs: ["✓ AU credential", "✓ Indonesia work history", "✓ Internationally readable CV"],
      color: "#d7001e",
      stageClass: "stage3",
    },
    4: {
      icon: "🌏",
      title: "Ketika kamu siap — pintunya sudah terbuka, Redline yang membuatnya",
      desc: "Bukan soal harus pergi. Tapi soal punya pilihan. Credential Redline diakui employer di Australia, UK, Kanada, dan Singapura. Dengan rekam jejak lokal yang solid, kamu melamar bukan sebagai pemula — tapi sebagai profesional berpengalaman.",
      certs: ["✓ 🇦🇺 Australia", "✓ 🇬🇧 United Kingdom", "✓ 🇨🇦 Canada", "✓ 🇸🇬 Singapore"],
      color: "#d7001e",
      stageClass: "stage4",
    },
  },
  en: {
    1: {
      icon: "🏠",
      title: "Care for the people you love — from day one after graduation",
      desc: "You can use your Redline certificate immediately. Care for parents, family members, or neighbours who need support. Not just care — but care with standards, dignity, and the right approach.",
      certs: ["✓ Person-centred care", "✓ Infection control", "✓ Safety management"],
      color: "#d7001e",
      stageClass: "stage1",
    },
    2: {
      icon: "💼",
      title: "Become the caregiver local health facilities are looking for",
      desc: "An AU credential sets you apart from applicants without certification. Open opportunities in hospitals, nursing homes, home care, and elder clinics across Indonesia. Stable income. Professional recognition. Real contribution.",
      certs: ["✓ Recognised by hospitals & care homes", "✓ Home care providers", "✓ Local elder clinics"],
      color: "#d7001e",
      stageClass: "stage2",
    },
    3: {
      icon: "📋",
      title: "Every month of work builds a profile global employers can read",
      desc: "An AU credential plus Indonesian work history is a combination international employers understand. They see standards they trust and real-world experience. You cannot build that profile without both.",
      certs: ["✓ AU credential", "✓ Indonesia work history", "✓ Internationally readable CV"],
      color: "#d7001e",
      stageClass: "stage3",
    },
    4: {
      icon: "🌏",
      title: "When you are ready — the door is already open, and Redline helps unlock it",
      desc: "It is not about having to leave. It is about having options. Redline credentials are recognised by employers in Australia, the UK, Canada, and Singapore. With a strong local track record, you apply not as a beginner, but as an experienced professional.",
      certs: ["✓ 🇦🇺 Australia", "✓ 🇬🇧 United Kingdom", "✓ 🇨🇦 Canada", "✓ 🇸🇬 Singapore"],
      color: "#d7001e",
      stageClass: "stage4",
    },
  },
};

function rlJourneySelect(stage) {
  const lang = typeof currentLanguage === "string" && JOURNEY_DATA[currentLanguage]
    ? currentLanguage
    : "id";
  const d = JOURNEY_DATA[lang][stage] || JOURNEY_DATA.id[stage];
  if (!d) return;
  document.querySelectorAll(".rl-jstage").forEach((el) => {
    el.classList.toggle("active", +el.dataset.stage === stage);
  });
  const panel = document.getElementById("rlJDetail");
  if (!panel) return;
  panel.className = `rl-jdetail ${d.stageClass}`;
  panel.style.borderLeftColor = d.color;
  document.getElementById("rlJIcon").textContent = d.icon;
  document.getElementById("rlJTitle").textContent = d.title;
  document.getElementById("rlJDesc").textContent = d.desc;
  const certsEl = document.getElementById("rlJCerts");
  certsEl.innerHTML = d.certs.map((c) => `<span>${c}</span>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("journey")) rlJourneySelect(1);
});

document.addEventListener("click", function (e) {
  if (e.target.closest(".lang-btn") && document.getElementById("journey")) {
    setTimeout(() => {
      const activeStage = document.querySelector(".rl-jstage.active");
      rlJourneySelect(activeStage ? +activeStage.dataset.stage : 1);
    }, 0);
  }
});
