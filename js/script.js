/* ============================================
   REDLINE ACADEMY - MAIN JAVASCRIPT
   ============================================ */

// Language translations
const translations = {
  id: {
    // Header
    home: "Beranda",
    about: "Tentang Kami",
    // programs: "Program",
    contact: "Hubungi Kami",
    // blog: "Blog",
    // legal: "Legal",

    // Homepage
    heroWelcome: "Selamat datang",
    heroTitle: "Redline bukan sekadar akademi",
    heroSubtitle:
      "— ini adalah tempat untuk membuka potensi, menembus batas, dan mengambil kendali atas masa depanmu. Berani mengubah masa depanmu?",
    enrollNow: "Daftar Sekarang",

    // Programs Section
    ourPrograms: "Program Kami",
    programDetail: "Detail Program",

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
    addressValue: "Jl. Pendidikan No. 123, Jakarta, Indonesia 12345",
    phone: "Telepon",
    phoneValue: "+62 (21) 2345-678",
    emailLabel: "Email",
    emailValue: "hello@redlineacademy.com.au",
    whatsapp: "WhatsApp",
    whatsappText: "Chat dengan kami",
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
    careGiverLearn5: "Dukungan Personal Berpusat pada Klien.",
    careGiverLearn6: "Pencegahan & Manajemen Risiko Cedera.",
    duration6Months: "Durasi Program: 6 bulan",
    duration4Months: "Durasi Program: 4 bulan",
    duration3Months: "Durasi Program: 3 bulan",
    certificationInternational: "Sertifikasi: Internasional",
    whyChooseOurProgram: "Mengapa Memilih Program Kami?",
    programsIntro:
      "Program Mikro-Kredensial: Pendampingan Perawatan (Unit Pelatihan Terakreditasi Australia).\n\nKita mungkin tidak bisa mengubah seluruh dunia, namun jika Anda memiliki rasa kasih sayang, Anda dapat mengubah kehidupan orang-orang di sekitar Anda yang membutuhkan bantuan.\n\nApakah Anda baru saja akan menyelesaikan pendidikan dan bingung memilih jalur karier? Atau mungkin pekerjaan Anda saat ini terasa membosankan dan tidak memberikan kepuasan batin yang nyata?\n\nHanya dalam enam belas minggu pelatihan berkualitas standar Australia yang diakui secara internasional, Anda dapat mengubah segalanya. Pelatihan yang kami tawarkan dirancang untuk membuka pintu peluang nyata menuju karier yang bermakna, di mana Anda dapat memberikan dampak yang nyata.\n\nKursus ini terdiri dari dua belas minggu pelatihan daring (online) ditambah 3 ½ minggu praktik kerja lapangan untuk mendapatkan pengalaman langsung.\n\nDengan bekal pelatihan ini, Anda siap untuk mengubah dunia Anda.",

    // Legal Page
    legalTitle: "Legal",
    termsTitle: "Syarat & Ketentuan",
    privacyTitle: "Kebijakan Privasi",
  },

  en: {
    // Header
    home: "Home",
    about: "About Us",
    // programs: "Programs",
    contact: "Contact Us",
    // blog: "Blog",
    // legal: "Legal",

    // Homepage
    heroWelcome: "Welcome",
    heroTitle: "Redline is more than an academy",
    heroSubtitle:
      "— it's a place to unlock potential, break boundaries and take control of what comes next. Dare to change your future?",
    enrollNow: "Enroll Now",

    // Programs Section
    ourPrograms: "Our Programs",
    programDetail: "Program Detail",

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
    addressValue: "Jl. Pendidikan No. 123, Jakarta, Indonesia 12345",
    phone: "Phone",
    phoneValue: "+62 (21) 2345-678",
    emailLabel: "Email",
    emailValue: "hello@redlineacademy.com.au",
    whatsapp: "WhatsApp",
    whatsappText: "Chat with us",
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
    careGiverLearn5: "Client-Centered Personal Support.",
    careGiverLearn6: "Injury Prevention and Risk Management.",
    duration6Months: "Program Duration: 6 months",
    duration4Months: "Program Duration: 4 months",
    duration3Months: "Program Duration: 3 months",
    certificationInternational: "Certification: International",
    whyChooseOurProgram: "Why Choose Our Program?",
    programsIntro:
      "Micro-Credential Program: Care Support (Australian Accredited Training Units).\n\nWe may not be able to change the whole world, but if you have compassion, you can change the lives of those around you who need support.\n\nAre you about to complete your studies and feeling uncertain about your career path? Or perhaps your current job feels unfulfilling and lacks genuine purpose?\n\nIn just sixteen weeks of high-quality, Australian-standard training that is internationally recognized, you can transform your future. The training we offer is designed to open real opportunities for a meaningful career—one where you can make a tangible and lasting impact.\n\nThis course consists of twelve weeks of online training followed by 3½ weeks of workplace practicum, providing hands-on, real-world experience.\n\nWith this training, you will be equipped and ready to change your world.",

    // Legal Page
    legalTitle: "Legal",
    termsTitle: "Terms & Conditions",
    privacyTitle: "Privacy Policy",
  },
};

// Language management
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
  return translations[currentLanguage][key] || key;
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
      element.textContent = text;
    }
  });

  console.log("Page language updated to:", currentLanguage);

  // Update page title and meta
  updatePageTitle();
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
    document.title = `${t("blogTitle")} - Redline Academy`;
  } else if (path.includes("legal")) {
    document.title = `${t("legalTitle")} - Redline Academy`;
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
  const currentPath = window.location.pathname;
  document.querySelectorAll("nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (
      currentPath.includes(href) ||
      (currentPath === "/" && href === "index.html")
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("nav");
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      // Toggle the CSS `active` class so the menu appearance is driven by CSS
      nav.classList.toggle("active");
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
