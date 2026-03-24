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
    footerCopyright: "© 2025 Redline Academy.",
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
    heroTitle: "Redline bukan sekadar akademi",
    heroSubtitle:
      "— ini adalah tempat untuk membuka potensi, menembus batas, dan mengambil kendali atas masa depanmu. Berani mengubah masa depanmu?",
    applyNow: "Daftar Sekarang",

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
      "Kembangkan keahlian kuliner — mulai dari teknik dapur hingga perencanaan menu — dan ubah passion terhadap makanan menjadi karier profesional.",

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
      "Di RedLine Academy, keunggulan bukan sekadar tujuan — ini adalah budaya kami. Kami berfokus pada pengembangan berpikir kritis dan pemecahan masalah, mendorong siswa melampaui sekadar menghafal. Dengan dukungan pengajar yang kompeten dan standar tinggi, kami menciptakan lingkungan di mana pembelajar dapat tumbuh percaya diri dan meraih kesuksesan yang berkelanjutan.",

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
      '"RedLine Academy memberi saya lebih dari sekadar kualifikasi — akademi ini memberi saya kepercayaan diri untuk terjun ke lingkungan kerja kesehatan yang menantang dan berkembang di dalamnya. Pelatihannya sangat praktis, berbasis pengalaman nyata, dan benar-benar sesuai dengan ekspektasi dunia kerja. Kini, saya dengan bangga merawat pasien dengan keyakinan bahwa saya telah dilatih dengan standar tertinggi."',
    testimonial1Author: "Sarah Mitchell, Perawat Terdaftar",

    testimonial2:
      '"Keterampilan yang saya dapatkan di RedLine Academy benar-benar mengubah arah karier saya. Fokus pada penerapan nyata dan koneksi industri membantu saya bertransisi dengan mulus ke bidang baru. Sekarang saya memimpin proyek-proyek yang dulu hanya bisa saya impikan."',
    testimonial2Author: "Daniel Roberts, Supervisor Teknik Listrik",

    testimonial3:
      '"Belajar di RedLine Academy adalah pengalaman yang mengubah hidup. Lebih dari sekadar pelatihan, saya belajar bagaimana menghadapi tantangan dan tumbuh sebagai seorang pemimpin. Akademi ini benar-benar menepati janjinya — membantu saya berani berubah dan membentuk masa depan yang lebih baik."',
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
      "Memberdayakan setiap individu di setiap tahap perjalanan mereka — baik saat memulai karier maupun berpindah dari bidang lain — melalui pelatihan berkualitas tinggi yang berfokus pada kebutuhan industri. Kami berdedikasi untuk membekali siswa dengan keterampilan praktis, kepercayaan diri, dan pola pikir yang tangguh untuk berkembang di pasar kerja global yang kompetitif.",

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
      "Kami menginspirasi siswa untuk keluar dari zona nyaman, berani mengambil risiko, dan beradaptasi dengan perubahan — membantu mereka mengubah tantangan menjadi peluang.",

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
      "Pendampingan Perawatan (Unit Pelatihan Terakreditasi Australia).\n\nKita mungkin tidak bisa mengubah seluruh dunia, namun jika Anda memiliki rasa kasih sayang, Anda dapat mengubah kehidupan orang-orang di sekitar Anda yang membutuhkan bantuan.\n\nApakah Anda baru saja akan menyelesaikan pendidikan dan bingung memilih jalur karier? Atau mungkin pekerjaan Anda saat ini terasa membosankan dan tidak memberikan kepuasan batin yang nyata?\n\nHanya dalam enam belas minggu pelatihan berkualitas standar Australia yang diakui secara internasional, Anda dapat mengubah segalanya. Pelatihan yang kami tawarkan dirancang untuk membuka pintu peluang nyata menuju karier yang bermakna, di mana Anda dapat memberikan dampak yang nyata.\n\nKursus ini terdiri dari dua belas minggu pelatihan daring (online) ditambah 3 ½ minggu praktik kerja lapangan untuk mendapatkan pengalaman langsung.\n\nDengan bekal pelatihan ini, Anda siap untuk mengubah dunia Anda.",

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
    footerCopyright: "© 2025 Redline Academy.",
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
    heroTitle: "Redline is more than an academy",
    heroSubtitle:
      "— it's a place to unlock potential, break boundaries and take control of what comes next. Dare to change your future?",
    applyNow: "Apply Now",

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
      "Master coffee craft, brewing techniques, and service skills for a thriving career in cafés and specialty coffee shops.",

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
      "Bridge your potential with a curriculum that aligns practical competence and person-centred care. This program equips you with the skills to excel in hospitals, aged care and community settings while honoring each person's dignity and choices. Join us to provide support that goes beyond service — a genuine commitment to improving quality of life. Start your journey to make meaningful change through compassionate care.",

    dedicatedEducator: "Dedicated Educator",
    dedicatedEducatorDesc:
      "Learning is easier when you have the right guidance. Our trainers are highly skilled in their fields and passionate about what they teach. They bring energy and real-world experience into every program, making learning both practical and engaging.",

    australianMicro: "Australian Micro-Credentials Program",
    australianMicroDesc:
      "Whether you're a beginner or looking to refine your skills, our programs follow the Microcredentials Framework. This means you gain qualifications that meet international standards and are recognised across industries, giving you a solid foundation for future opportunities.",

    commitmentExcellence: "Commitment to Excellence",
    commitmentExcellenceDesc:
      "At RedLine Academy, excellence is more than a goal—it's our culture. We focus on developing critical thinking and problem-solving, encouraging students to go beyond memorization. With supportive educators and high standards, we create an environment where learners can grow with confidence and achieve lasting success.",

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
      '"RedLine Academy gave me more than just qualifications—it gave me the confidence to step into a demanding healthcare environment and thrive. The training was hands-on, practical, and aligned perfectly with what employers expect. Today, I proudly care for patients knowing I was trained to the highest standard."',
    testimonial1Author: "Sarah Mitchell, Registered Nurse",

    testimonial2:
      '"The skills I gained at RedLine Academy completely transformed my career. The focus on real-world application and industry connections helped me transition smoothly into a new field. I\'m now leading projects I once only dreamed of being part of."',
    testimonial2Author: "Daniel Roberts, Electrician Supervisor",

    testimonial3:
      '"Studying at RedLine Academy was a life-changing experience. Beyond the training, I learned how to embrace challenges and grow as a leader. The academy truly lived up to its promise—helping me dare to change and shape a better future."',
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
      "To empower individuals at every stage of their journey—whether starting a career or transitioning from another field through high-quality, industry-focused training. We are dedicated to equipping our students with practical skills, confidence, and the mindset to thrive in a competitive global workforce.",

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
      "Care Support (Australian Accredited Training Units).\n\nWe may not be able to change the whole world, but if you have compassion, you can change the lives of those around you who need support.\n\nAre you about to complete your studies and feeling uncertain about your career path? Or perhaps your current job feels unfulfilling and lacks genuine purpose?\n\nIn just sixteen weeks of high-quality, Australian-standard training that is internationally recognized, you can transform your future. The training we offer is designed to open real opportunities for a meaningful career—one where you can make a tangible and lasting impact.\n\nThis course consists of twelve weeks of online training followed by 3½ weeks of workplace practicum, providing hands-on, real-world experience.\n\nWith this training, you will be equipped and ready to change your world.",

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
Object.assign(translations.id, {
  articleEyebrow: "Artikel Pilihan",
  articleHighlightsFocus: "Fokus",
  articleHighlightsIntent: "Intent",
  articleHighlightsLocation: "Lokasi",
  articlesBlogSectionTitle: "Artikel & Blog",
  articlesBlogSectionDesc:
    "Jelajahi halaman blog utama dan kumpulan artikel caregiver dari Redline Academy. Setiap ringkasan di bawah ini bisa diklik untuk membuka halaman lengkapnya.",
  articlesBlogBadge: "Blog",
  articlesArticleBadge: "Artikel",
  articlesBlogMainTitle: "Blog Caregiver & Karier",
  articlesBlogMainDesc:
    "Baca kumpulan insight, edukasi caregiver, tips karier kesehatan, dan wawasan pelatihan vokasi untuk calon tenaga perawatan Indonesia.",
  articlesOpenPage: "Buka Halaman",
  articlesReadMore: "Baca Artikel",
  articlesPelatihanTitle: "Pelatihan Caregiver Indonesia",
  articlesPelatihanDesc:
    "Gambaran umum program pelatihan caregiver di Indonesia, termasuk manfaat program, praktik langsung, panduan karier, dan FAQ dasar.",
  articlesKursusTitle: "Kursus Caregiver Bersertifikat Indonesia",
  articlesKursusDesc:
    "Ringkasan tentang kursus caregiver bersertifikat, fokus kompetensi, manfaat sertifikasi, dan kesiapan kerja setelah lulus.",
  articlesKelasTitle: "Kelas Caregiver Online Indonesia",
  articlesKelasDesc:
    "Penjelasan format belajar online, fleksibilitas kelas, struktur materi, dan cara memulai jalur belajar caregiver dari rumah.",
  articlesCaraTitle: "Cara Menjadi Caregiver Profesional Indonesia",
  articlesCaraDesc:
    "Langkah-langkah menjadi caregiver profesional, mulai dari keterampilan inti, pilihan pelatihan, hingga kesiapan masuk dunia kerja.",
  articlesBiayaTitle: "Biaya Pelatihan Caregiver Indonesia",
  articlesBiayaDesc:
    "Ringkasan faktor biaya pelatihan, struktur program, dan hal-hal yang perlu dipertimbangkan sebelum memilih program caregiver.",
  articleCtaTitle: "Siap Mulai Karier Caregiver?",
  articleCtaBody:
    "Hubungi tim Redline Academy untuk konsultasi program dan jalur belajar yang sesuai kebutuhan Anda.",
  articleCtaButton: "Konsultasi Sekarang",
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
  pelatihanRelatedLink1: "Biaya Pelatihan Caregiver Indonesia di Indonesia",
  pelatihanRelatedLink2:
    "Kursus Caregiver Bersertifikat Indonesia di Indonesia",
  pelatihanRelatedLink3: "Kelas Caregiver Online Indonesia di Indonesia",
  biayaArticleTitle: "Biaya Pelatihan Caregiver Indonesia di Indonesia",
  biayaArticleIntro:
    "Halaman ini membahas biaya pelatihan caregiver indonesia untuk kebutuhan transactional di Indonesia. Konten disusun agar calon peserta memahami materi, biaya, jalur belajar, dan langkah pendaftaran.",
  biayaArticleMeta:
    'Fokus kata kunci: <strong>biaya pelatihan caregiver indonesia</strong> | Intent: <strong>transactional</strong> | Lokasi: <strong>Indonesia</strong>',
  biayaWhyTitle: "Mengapa biaya pelatihan caregiver indonesia penting?",
  biayaWhyBody1:
    "Permintaan tenaga caregiver terus tumbuh di Indonesia. Memahami biaya pelatihan caregiver indonesia membantu Anda memilih program yang relevan dengan kebutuhan industri.",
  biayaWhyBody2:
    "Fokus pembelajaran tidak hanya teori, tetapi juga komunikasi empatik, keselamatan pasien, dan standar layanan yang konsisten.",
  biayaCoreTitle: "Kompetensi inti yang dipelajari",
  biayaCoreItem1: "Pendampingan aktivitas harian dan personal care",
  biayaCoreItem2: "Komunikasi efektif dengan keluarga dan tim medis",
  biayaCoreItem3: "Pencegahan risiko serta prosedur keselamatan dasar",
  biayaStructureTitle: "Struktur program yang direkomendasikan",
  biayaStructureBody:
    "Kurikulum terbaik memadukan pembelajaran online, praktik terarah, dan asesmen berbasis kasus nyata.",
  biayaComponentsTitle: "Komponen belajar",
  biayaComponentsItem1: "Modul teori terstruktur per topik layanan",
  biayaComponentsItem2: "Praktik lapangan dengan supervisi",
  biayaComponentsItem3: "Evaluasi kompetensi untuk kesiapan kerja",
  biayaStartTitle: "Langkah memulai pendaftaran",
  biayaStartBody:
    "Siapkan dokumen identitas, pilih jadwal belajar, dan konsultasikan target karier Anda agar rencana belajar lebih tepat sasaran.",
  biayaChecklistTitle: "Checklist sebelum mendaftar",
  biayaChecklistItem1:
    "Pastikan tujuan karier dan minat spesialisasi caregiver",
  biayaChecklistItem2:
    "Bandingkan kurikulum, durasi, serta model pembelajaran",
  biayaChecklistItem3:
    "Konfirmasi skema biaya dan dukungan pasca-lulus",
  biayaFaqTitle: "FAQ biaya pelatihan caregiver indonesia",
  biayaFaqQ1:
    "Apakah biaya pelatihan caregiver indonesia cocok untuk pemula?",
  biayaFaqA1:
    "Ya. Program dirancang bertahap dari dasar hingga praktik, termasuk pendampingan untuk peserta tanpa pengalaman kerja di bidang perawatan.",
  biayaFaqQ2:
    "Berapa lama durasi biaya pelatihan caregiver indonesia di Indonesia?",
  biayaFaqA2:
    "Durasi bergantung paket belajar, namun umumnya mencakup teori, praktik terstruktur, dan asesmen akhir sebelum sertifikasi diterbitkan.",
  biayaFaqQ3: "Apakah ada dukungan setelah lulus?",
  biayaFaqA3:
    "Ada. Peserta mendapatkan panduan penyusunan CV, simulasi wawancara, serta arahan jalur kerja di fasilitas layanan perawatan.",
  biayaRelatedTitle: "Halaman Terkait",
  biayaRelatedLink1: "Pelatihan Caregiver Indonesia di Indonesia",
  biayaRelatedLink2:
    "Kursus Caregiver Bersertifikat Indonesia di Indonesia",
  biayaRelatedLink3: "Kelas Caregiver Online Indonesia di Indonesia",
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
  caraRelatedLink3: "Biaya Pelatihan Caregiver Indonesia di Indonesia",
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
  kelasRelatedLink3: "Biaya Pelatihan Caregiver Indonesia di Indonesia",
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
  kursusRelatedLink2: "Biaya Pelatihan Caregiver Indonesia di Indonesia",
  kursusRelatedLink3: "Kelas Caregiver Online Indonesia di Indonesia",
});
Object.assign(translations.en, {
  articleEyebrow: "Featured Article",
  articleHighlightsFocus: "Focus",
  articleHighlightsIntent: "Intent",
  articleHighlightsLocation: "Location",
  articlesBlogSectionTitle: "Article & Blog",
  articlesBlogSectionDesc:
    "Explore the main blog page and Redline Academy's caregiver article collection. Each summary below can be clicked to open the full page.",
  articlesBlogBadge: "Blog",
  articlesArticleBadge: "Article",
  articlesBlogMainTitle: "Caregiver & Career Blog",
  articlesBlogMainDesc:
    "Read insights, caregiver education, health career tips, and vocational training updates for aspiring care professionals in Indonesia.",
  articlesOpenPage: "Open Page",
  articlesReadMore: "Read Article",
  articlesPelatihanTitle: "Caregiver Training in Indonesia",
  articlesPelatihanDesc:
    "An overview of caregiver training in Indonesia, including program benefits, hands-on practice, career guidance, and essential FAQs.",
  articlesKursusTitle: "Certified Caregiver Course Indonesia",
  articlesKursusDesc:
    "A summary of certified caregiver courses, competency focus, certification benefits, and job readiness after graduation.",
  articlesKelasTitle: "Online Caregiver Class Indonesia",
  articlesKelasDesc:
    "An explanation of online study format, learning flexibility, course structure, and how to start your caregiver journey from home.",
  articlesCaraTitle: "How to Become a Professional Caregiver in Indonesia",
  articlesCaraDesc:
    "The key steps to become a professional caregiver, from core skills and training choices to job readiness.",
  articlesBiayaTitle: "Caregiver Training Costs in Indonesia",
  articlesBiayaDesc:
    "A summary of cost factors, program structure, and what to consider before choosing a caregiver training program.",
  articleCtaTitle: "Ready to Start Your Caregiver Career?",
  articleCtaBody:
    "Contact the Redline Academy team for program advice and a learning path that suits your goals.",
  articleCtaButton: "Consult Now",
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
  pelatihanRelatedLink1: "Caregiver Training Costs in Indonesia",
  pelatihanRelatedLink2: "Certified Caregiver Course Indonesia",
  pelatihanRelatedLink3: "Online Caregiver Class Indonesia",
  biayaArticleTitle: "Caregiver Training Costs in Indonesia",
  biayaArticleIntro:
    "This page discusses caregiver training costs in Indonesia for transactional intent. The content is designed to help prospective participants understand the curriculum, pricing considerations, learning pathway, and enrollment steps.",
  biayaArticleMeta:
    'Keyword focus: <strong>biaya pelatihan caregiver indonesia</strong> | Intent: <strong>transactional</strong> | Location: <strong>Indonesia</strong>',
  biayaWhyTitle: "Why are caregiver training costs in Indonesia important?",
  biayaWhyBody1:
    "Demand for caregivers continues to grow in Indonesia. Understanding caregiver training costs helps you choose a program that fits your needs and budget.",
  biayaWhyBody2:
    "The learning focus goes beyond theory and includes empathetic communication, patient safety, and consistent service standards.",
  biayaCoreTitle: "Core competencies you will learn",
  biayaCoreItem1: "Daily activity assistance and personal care",
  biayaCoreItem2: "Effective communication with families and medical teams",
  biayaCoreItem3: "Risk prevention and basic safety procedures",
  biayaStructureTitle: "Recommended program structure",
  biayaStructureBody:
    "A strong curriculum combines online learning, guided practice, and competency assessment based on real cases.",
  biayaComponentsTitle: "Learning components",
  biayaComponentsItem1: "Structured theory modules by care topic",
  biayaComponentsItem2: "Field practice with supervision",
  biayaComponentsItem3: "Competency evaluation for work readiness",
  biayaStartTitle: "How to begin enrollment",
  biayaStartBody:
    "Prepare your identification documents, choose a study schedule, and discuss your career goals so your learning plan is more targeted.",
  biayaChecklistTitle: "Checklist before enrolling",
  biayaChecklistItem1:
    "Clarify your career goals and caregiver specialization interests",
  biayaChecklistItem2:
    "Compare curriculum, duration, and learning model",
  biayaChecklistItem3:
    "Confirm cost scheme and post-graduation support",
  biayaFaqTitle: "Caregiver training cost FAQ",
  biayaFaqQ1: "Are caregiver training costs suitable for beginners?",
  biayaFaqA1:
    "Yes. The program is designed progressively from fundamentals to practice, including support for learners with no prior caregiving experience.",
  biayaFaqQ2:
    "How long does caregiver training related to this cost plan usually take?",
  biayaFaqA2:
    "The duration depends on the package, but it generally includes theory, structured practice, and final assessment before certification is issued.",
  biayaFaqQ3: "Is there support after graduation?",
  biayaFaqA3:
    "Yes. Participants receive CV guidance, interview simulation, and direction for career pathways in care service facilities.",
  biayaRelatedTitle: "Related Pages",
  biayaRelatedLink1: "Caregiver Training in Indonesia",
  biayaRelatedLink2: "Certified Caregiver Course Indonesia",
  biayaRelatedLink3: "Online Caregiver Class Indonesia",
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
  caraRelatedLink3: "Caregiver Training Costs in Indonesia",
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
  kelasRelatedLink3: "Caregiver Training Costs in Indonesia",
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
  kursusRelatedLink2: "Caregiver Training Costs in Indonesia",
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

function getArticleSeoConfig() {
  const path = window.location.pathname;
  const configs = [
    { match: "pelatihan-caregiver-indonesia", prefix: "pelatihan" },
    { match: "biaya-pelatihan-caregiver-indonesia", prefix: "biaya" },
    { match: "cara-menjadi-caregiver-profesional-indonesia", prefix: "cara" },
    { match: "kelas-caregiver-online-indonesia", prefix: "kelas" },
    { match: "kursus-caregiver-bersertifikat-indonesia", prefix: "kursus" },
  ];

  return configs.find((config) => path.includes(config.match)) || null;
}

function updateStructuredDataForArticle(prefix, pageTitle, pageDescription) {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  if (!scripts.length) return;

  scripts.forEach((script) => {
    try {
      const data = JSON.parse(script.textContent);
      if (data["@type"] === "Article") {
        data.headline = pageTitle;
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
        data.mainEntity = [1, 2, 3].map((index) => ({
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

  const articleConfig = getArticleSeoConfig();
  if (!articleConfig) return;

  const titleKey = `${articleConfig.prefix}ArticleTitle`;
  const introKey = `${articleConfig.prefix}ArticleIntro`;
  const pageTitle = `${t(titleKey)} | Redline Academy`;
  const pageDescription = t(introKey);

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

  console.log("Page language updated to:", currentLanguage);

  // Update page title and meta
  updatePageTitle();
  updateSeoMetadata();
}

function updatePageTitle() {
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
  } else if (path.includes("pelatihan-caregiver-indonesia")) {
    document.title = `${t("pelatihanArticleTitle")} - Redline Academy`;
  } else if (path.includes("biaya-pelatihan-caregiver-indonesia")) {
    document.title = `${t("biayaArticleTitle")} - Redline Academy`;
  } else if (path.includes("cara-menjadi-caregiver-profesional-indonesia")) {
    document.title = `${t("caraArticleTitle")} - Redline Academy`;
  } else if (path.includes("kelas-caregiver-online-indonesia")) {
    document.title = `${t("kelasArticleTitle")} - Redline Academy`;
  } else if (path.includes("kursus-caregiver-bersertifikat-indonesia")) {
    document.title = `${t("kursusArticleTitle")} - Redline Academy`;
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
              ? "Terima kasih — pesan Anda telah terkirim."
              : "Thank you — your message has been sent.",
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
