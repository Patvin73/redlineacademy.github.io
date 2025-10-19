/* ============================================
   REDLINE ACADEMY - MAIN JAVASCRIPT
   ============================================ */

// Language translations
const translations = {
  id: {
    // Header
    home: 'Beranda',
    about: 'Tentang Kami',
    programs: 'Program',
    contact: 'Hubungi Kami',
    blog: 'Blog',
    legal: 'Legal',
    
    // Homepage
    heroWelcome: 'Selamat Datang',
    heroTitle: 'Redline bukan sekadar akademi',
    heroSubtitle: '— ini adalah tempat untuk membuka potensi, menembus batas, dan mengambil kendali atas masa depanmu. Berani mengubah masa depanmu?',
    enrollNow: 'Daftar Sekarang',
    
    // Programs Section
    ourPrograms: 'Program Kami',
    programDetail: 'Detail Program',
    
    // Program Cards
    assistantCarer: 'Asisten Perawat',
    assistantCarerDesc: 'Dapatkan keterampilan dasar perawatan kesehatan dan pelatihan berbasis empati untuk mendukung pasien di rumah sakit, panti jompo, dan lingkungan masyarakat.',
    
    bartender: 'Bartender',
    bartenderDesc: 'Pelajari seni mixology, pelayanan pelanggan, dan manajemen bar untuk berkembang di dunia perhotelan yang dinamis dan serba cepat.',
    
    cooking: 'Memasak (Chef)',
    cookingDesc: 'Kembangkan keahlian kuliner — mulai dari teknik dapur hingga perencanaan menu — dan ubah passion terhadap makanan menjadi karier profesional.',
    
    barista: 'Barista',
    baristaDesc: 'Kuasai seni meracik kopi, teknik penyeduhan, serta keterampilan pelayanan untuk membangun karier sukses di kafe dan kedai kopi spesialti.',
    
    coding: 'Pemrograman (IT)',
    codingDesc: 'Bangun keterampilan pemrograman dan IT yang dibutuhkan industri untuk mempersiapkan diri berkarier di bidang pengembangan web, perangkat lunak, dan solusi digital.',
    
    electrician: 'Teknisi Listrik',
    electricianDesc: 'Dapatkan pelatihan praktis kelistrikan, pengetahuan keselamatan industri, dan kemampuan memecahkan masalah untuk menghidupkan rumah maupun bisnis.',
    
    // Our Commitment Section
    ourCommitment: 'Komitmen Kami',
    
    dedicatedEducator: 'Pendidik yang Berdedikasi',
    dedicatedEducatorDesc: 'Belajar jadi lebih mudah ketika ada bimbingan yang tepat. Para pelatih kami sangat terampil di bidangnya dan memiliki semangat tinggi terhadap apa yang mereka ajarkan. Mereka membawa energi dan pengalaman nyata ke setiap program, menjadikan proses belajar lebih praktis dan menarik.',
    
    australianMicro: 'Program Micro-Credentials Australia',
    australianMicroDesc: 'Baik kamu pemula maupun ingin mengasah kemampuan, program kami mengikuti Microcredentials Framework. Artinya, kamu memperoleh kualifikasi yang memenuhi standar internasional dan diakui lintas industri, memberi dasar yang kuat untuk peluang karier di masa depan.',
    
    commitmentExcellence: 'Komitmen terhadap Keunggulan',
    commitmentExcellenceDesc: 'Di RedLine Academy, keunggulan bukan sekadar tujuan — ini adalah budaya kami. Kami berfokus pada pengembangan berpikir kritis dan pemecahan masalah, mendorong siswa melampaui sekadar menghafal. Dengan dukungan pengajar yang kompeten dan standar tinggi, kami menciptakan lingkungan di mana pembelajar dapat tumbuh percaya diri dan meraih kesuksesan yang berkelanjutan.',
    
    innovativeLearning: 'Lingkungan Belajar Inovatif',
    innovativeLearningDesc: 'Kami mengadopsi alat pembelajaran modern dan metode interaktif yang membuat pendidikan lebih dinamis dan relevan. Dengan menggabungkan teori dan praktik langsung, kami mempersiapkan siswa menghadapi tantangan dunia nyata.',
    
    personalizedSupport: 'Dukungan Personalisasi',
    personalizedSupportDesc: 'Setiap perjalanan belajar itu unik. Kami menyediakan bimbingan dan sumber daya yang disesuaikan dengan kebutuhan masing-masing individu, memastikan setiap siswa merasa didukung dalam studi dan karier mereka.',
    
    globalMindset: 'Wawasan Global',
    globalMindsetDesc: 'Program kami dirancang dengan perspektif global, membantu siswa mengembangkan kemampuan beradaptasi dan kepercayaan diri untuk sukses di berbagai industri dan lingkungan internasional.',
    
    // Testimonials Section
    whatAlumniSay: 'Apa Kata Alumni Kami?',
    
    testimonial1: '"RedLine Academy memberi saya lebih dari sekadar kualifikasi — akademi ini memberi saya kepercayaan diri untuk terjun ke lingkungan kerja kesehatan yang menantang dan berkembang di dalamnya. Pelatihannya sangat praktis, berbasis pengalaman nyata, dan benar-benar sesuai dengan ekspektasi dunia kerja. Kini, saya dengan bangga merawat pasien dengan keyakinan bahwa saya telah dilatih dengan standar tertinggi."',
    testimonial1Author: 'Sarah Mitchell, Perawat Terdaftar',
    
    testimonial2: '"Keterampilan yang saya dapatkan di RedLine Academy benar-benar mengubah arah karier saya. Fokus pada penerapan nyata dan koneksi industri membantu saya bertransisi dengan mulus ke bidang baru. Sekarang saya memimpin proyek-proyek yang dulu hanya bisa saya impikan."',
    testimonial2Author: 'Daniel Roberts, Supervisor Teknik Listrik',
    
    testimonial3: '"Belajar di RedLine Academy adalah pengalaman yang mengubah hidup. Lebih dari sekadar pelatihan, saya belajar bagaimana menghadapi tantangan dan tumbuh sebagai seorang pemimpin. Akademi ini benar-benar menepati janjinya — membantu saya berani berubah dan membentuk masa depan yang lebih baik."',
    testimonial3Author: 'Maria Gonzalez, Supervisor Perhotelan',
    
    // Contact Section - Homepage
    contactUs: 'Hubungi Kami',
    contactForm: 'Formulir Kontak',
    name: 'Nama',
    course: 'Kursus',
    email: 'Email',
    gender: 'Jenis Kelamin',
    postalCode: 'Kode Pos',
    message: 'Beritahu kami apa yang bisa dibantu',
    submit: 'Kirim',
    selectCourse: 'Pilih Kursus',
    
    // Form Placeholders
    namePlaceholder: 'Nama Anda',
    emailPlaceholder: 'Email Anda',
    postalCodePlaceholder: 'Kode Pos Anda',
    messagePlaceholder: 'Pesan Anda...',
    genderSelect: 'Pilih',
    genderMale: 'Laki-laki',
    genderFemale: 'Perempuan',
    genderOther: 'Lainnya',
    contactDesc: 'Kami siap membantu Anda. Hubungi kami melalui formulir di bawah ini atau gunakan informasi kontak kami.',
    officeHours: 'Jam Kerja',
    mondayFriday: 'Senin - Jumat: 08:00 - 17:00',
    saturday: 'Sabtu: 09:00 - 13:00',
    sunday: 'Minggu: Tutup',
    faqTitle: 'Pertanyaan yang Sering Diajukan',
    
    // Contact Info Section
    contactInfo: 'Informasi Kontak',
    address: 'Alamat',
    addressValue: 'Jl. Pendidikan No. 123, Jakarta, Indonesia 12345',
    phone: 'Telepon',
    phoneValue: '+62 (21) 2345-678',
    emailLabel: 'Email',
    emailValue: 'info@redlineacademy.com',
    whatsapp: 'WhatsApp',
    whatsappText: 'Chat dengan kami',
    mapsPlaceholder: 'Google Maps akan ditampilkan di sini',
    
    // About Page
    aboutUs: 'Tentang Kami',
    aboutContent: 'Di RedLine Academy, kami percaya bahwa setiap individu memiliki potensi untuk membentuk masa depannya sendiri. Kami bukan sekadar akademi — kami adalah tempat di mana ambisi bertemu dengan peluang, dan di mana keterampilan, semangat, serta tekad bersatu untuk menciptakan dampak yang berarti.\n\nProgram kami dibangun berdasarkan pelatihan vokasi bersertifikat Australia yang diakui secara internasional dan selaras dengan Kerangka Microcredentials, memastikan setiap siswa memperoleh keterampilan praktis yang relevan dan dibutuhkan di dunia kerja nyata.\n\nKami memiliki semangat untuk memberdayakan para pembelajar — baik yang baru memulai karier, ingin meningkatkan keterampilan, maupun berpindah ke bidang baru. Kami yakin bahwa setiap orang berhak mendapatkan titik awal yang sama, tanpa memandang latar belakang, dan kami menyediakan bimbingan serta sumber daya yang membantu setiap siswa mencapai potensi terbaiknya.\n\nMelalui pengajaran inovatif, bimbingan personal, dan pengalaman langsung, kami membantu siswa mengubah tantangan menjadi peluang dan mimpi menjadi pencapaian nyata.\n\nDi RedLine Academy, kami menumbuhkan budaya pertumbuhan, keberanian, dan transformasi — menginspirasi siswa untuk melangkah keluar dari zona nyaman, beradaptasi dengan perubahan, dan mengambil kendali atas masa depan mereka.',
    
    visionTitle: 'Visi Kami',
    visionContent: 'Visi kami adalah menyediakan pelatihan vokasi bersertifikat Australia yang diakui secara internasional dan selaras dengan Kerangka Microcredentials, yang dirancang untuk membuka pintu menuju peluang nyata. Kami berkomitmen menciptakan jalur menuju karier yang bermakna, membantu siswa mengubah ambisi menjadi pencapaian, serta mempersiapkan mereka untuk unggul di dunia yang dinamis dan terus berubah.',
    
    missionTitle: 'Misi Kami',
    missionContent: 'Memberdayakan setiap individu di setiap tahap perjalanan mereka — baik saat memulai karier maupun berpindah dari bidang lain — melalui pelatihan berkualitas tinggi yang berfokus pada kebutuhan industri. Kami berdedikasi untuk membekali siswa dengan keterampilan praktis, kepercayaan diri, dan pola pikir yang tangguh untuk berkembang di pasar kerja global yang kompetitif.',
    
    ourValues: 'Nilai-Nilai Kami',
    empowerment: 'Pemberdayaan',
    empowermentDesc: 'Kami percaya setiap pembelajar berhak mendapatkan alat, kepercayaan diri, dan dukungan untuk mengambil kendali atas masa depannya dan mencapai potensi terbaiknya, tanpa memandang latar belakang.',
    
    excellence: 'Keunggulan',
    excellenceDesc: 'Kami menjaga standar tertinggi dalam pelatihan, pengajaran, dan dukungan agar siswa memperoleh keterampilan serta pengetahuan yang relevan dengan industri dan benar-benar bermanfaat.',
    
    integrity: 'Integritas',
    integrityDesc: 'Kami beroperasi dengan kejujuran, transparansi, dan prinsip etika dalam setiap program dan interaksi, membangun kepercayaan dan rasa hormat di lingkungan belajar kami.',
    
    innovation: 'Inovasi',
    innovationDesc: 'Kami mengadopsi metode pengajaran modern, pengalaman belajar praktis, dan pendekatan kreatif untuk mempersiapkan siswa menghadapi tuntutan dunia kerja global yang terus berkembang.',
    
    inclusivity: 'Inklusivitas',
    inclusivityDesc: 'Kami berkomitmen menciptakan lingkungan yang inklusif di mana setiap individu merasa dihargai dan didukung, terlepas dari latar belakang atau pengalaman mereka.',
    
    courage: 'Keberanian',
    courageDesc: 'Kami menginspirasi siswa untuk keluar dari zona nyaman, berani mengambil risiko, dan beradaptasi dengan perubahan — membantu mereka mengubah tantangan menjadi peluang.',
    
    // Team Section
    ourTeam: 'Tim Kami',
    
    // Footer
    company: 'Perusahaan',
    footerDesc: 'Platform pelatihan vokasi bersertifikat Australia yang diakui secara internasional.',
    termsConditions: 'Syarat & Ketentuan',
    privacyPolicy: 'Kebijakan Privasi',
    allRightsReserved: 'Semua Hak Dilindungi',
    
    // Blog Page
    blogTitle: 'Blog',
    blogDesc: 'Baca artikel terbaru kami tentang pendidikan, karier, dan tips industri.',
    subscribeNewsletter: 'Berlangganan Newsletter Kami',
    subscribeDesc: 'Dapatkan artikel terbaru, tips karier, dan informasi program langsung ke email Anda.',
    subscribe: 'Berlangganan',
    previous: 'Sebelumnya',
    next: 'Berikutnya',
    page: 'Halaman',
    of: 'dari',
    
    // Programs Page
    whatYouWillLearn: 'Apa yang akan Anda pelajari:',
    duration6Months: 'Durasi Program: 6 bulan',
    duration4Months: 'Durasi Program: 4 bulan',
    duration3Months: 'Durasi Program: 3 bulan',
    certificationInternational: 'Sertifikasi: Internasional',
    whyChooseOurProgram: 'Mengapa Memilih Program Kami?',
    programsIntro: 'Pilih salah satu program pelatihan vokasi bersertifikat Australia kami dan mulai perjalanan karier Anda menuju kesuksesan.',
    
    // Legal Page
    legalTitle: 'Legal',
    termsTitle: 'Syarat & Ketentuan',
    privacyTitle: 'Kebijakan Privasi',
  },
  
  en: {
    // Header
    home: 'Home',
    about: 'About Us',
    programs: 'Programs',
    contact: 'Contact Us',
    blog: 'Blog',
    legal: 'Legal',
    
    // Homepage
    heroWelcome: 'Welcome', 
    heroTitle: 'Redline is more than an academy',
    heroSubtitle: '— it\'s a place to unlock potential, break boundaries and take control of what comes next. Dare to change your future?',
    enrollNow: 'Enroll Now',
    
    // Programs Section
    ourPrograms: 'Our Programs',
    programDetail: 'Program Detail',
    
    // Program Cards
    assistantCarer: 'Assistant Carer',
    assistantCarerDesc: 'Gain essential healthcare skills and compassion-driven training to support patients in hospitals, aged care, and community settings.',
    
    bartender: 'Bartender',
    bartenderDesc: 'Learn mixology, customer service, and bar management to thrive in fast-paced hospitality environments.',
    
    cooking: 'Cooking (Chef)',
    cookingDesc: 'Develop culinary expertise, from kitchen techniques to menu planning, turning your passion for food into a professional career.',
    
    barista: 'Barista',
    baristaDesc: 'Master coffee craft, brewing techniques, and service skills for a thriving career in cafés and specialty coffee shops.',
    
    coding: 'Coding (IT)',
    codingDesc: 'Build in-demand programming and IT skills, preparing you for tech roles in web development, software, and digital solutions.',
    
    electrician: 'Electrician',
    electricianDesc: 'Acquire hands-on electrical training, industry safety knowledge, and problem-solving skills to power homes and businesses.',
    
    // Our Commitment Section
    ourCommitment: 'Our Commitment',
    
    dedicatedEducator: 'Dedicated Educator',
    dedicatedEducatorDesc: 'Learning is easier when you have the right guidance. Our trainers are highly skilled in their fields and passionate about what they teach. They bring energy and real-world experience into every program, making learning both practical and engaging.',
    
    australianMicro: 'Australian Micro-Credentials Program',
    australianMicroDesc: 'Whether you\'re a beginner or looking to refine your skills, our programs follow the Microcredentials Framework. This means you gain qualifications that meet international standards and are recognised across industries, giving you a solid foundation for future opportunities.',
    
    commitmentExcellence: 'Commitment to Excellence',
    commitmentExcellenceDesc: 'At RedLine Academy, excellence is more than a goal—it\'s our culture. We focus on developing critical thinking and problem-solving, encouraging students to go beyond memorization. With supportive educators and high standards, we create an environment where learners can grow with confidence and achieve lasting success.',
    
    innovativeLearning: 'Innovative Learning Environment',
    innovativeLearningDesc: 'We embrace modern learning tools and interactive methods that make education dynamic and relevant. By combining theory with hands-on practice, we prepare students to meet real-world challenges.',
    
    personalizedSupport: 'Personalised Support',
    personalizedSupportDesc: 'Every student\'s journey is different. We provide guidance and resources tailored to individual needs, ensuring learners feel supported as they move forward in their studies and careers.',
    
    globalMindset: 'Global Mindset',
    globalMindsetDesc: 'Our programs are designed with a global perspective, helping students develop the adaptability and confidence to succeed in diverse industries and international settings.',
    
    // Testimonials Section
    whatAlumniSay: 'What Our Alumni Say?',
    
    testimonial1: '"RedLine Academy gave me more than just qualifications—it gave me the confidence to step into a demanding healthcare environment and thrive. The training was hands-on, practical, and aligned perfectly with what employers expect. Today, I proudly care for patients knowing I was trained to the highest standard."',
    testimonial1Author: 'Sarah Mitchell, Registered Nurse',
    
    testimonial2: '"The skills I gained at RedLine Academy completely transformed my career. The focus on real-world application and industry connections helped me transition smoothly into a new field. I\'m now leading projects I once only dreamed of being part of."',
    testimonial2Author: 'Daniel Roberts, Electrician Supervisor',
    
    testimonial3: '"Studying at RedLine Academy was a life-changing experience. Beyond the training, I learned how to embrace challenges and grow as a leader. The academy truly lived up to its promise—helping me dare to change and shape a better future."',
    testimonial3Author: 'Maria Gonzalez, Hospitality Supervisor',
    
    // Contact Section - Homepage
    contactUs: 'Contact Us',
    contactForm: 'Contact Form',
    name: 'Name',
    course: 'Course',
    email: 'Email',
    gender: 'Gender',
    postalCode: 'Postal Code',
    message: 'Tell us how we can help',
    submit: 'Submit',
    selectCourse: 'Select Course',
    
    // Form Placeholders
    namePlaceholder: 'Your Name',
    emailPlaceholder: 'Your Email',
    postalCodePlaceholder: 'Your Postal Code',
    messagePlaceholder: 'Your Message...',
    genderSelect: 'Select',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    contactDesc: 'We are ready to help you. Contact us through the form below or use our contact information.',
    officeHours: 'Office Hours',
    mondayFriday: 'Monday - Friday: 08:00 - 17:00',
    saturday: 'Saturday: 09:00 - 13:00',
    sunday: 'Sunday: Closed',
    faqTitle: 'Frequently Asked Questions',
    
    // Contact Info Section
    contactInfo: 'Contact Information',
    address: 'Address',
    addressValue: 'Jl. Pendidikan No. 123, Jakarta, Indonesia 12345',
    phone: 'Phone',
    phoneValue: '+62 (21) 2345-678',
    emailLabel: 'Email',
    emailValue: 'info@redlineacademy.com',
    whatsapp: 'WhatsApp',
    whatsappText: 'Chat with us',
    mapsPlaceholder: 'Google Maps will be displayed here',
    
    // About Page
    aboutUs: 'About Us',
    aboutContent: 'At RedLine Academy, we believe that every individual has the potential to shape their own future. We are more than an academy—we are a place where ambition meets opportunity, and where skills, passion, and determination come together to create lasting impact.\n\nOur programs are built on Australian-certified, internationally recognised vocational training, aligned with the Microcredentials Framework, ensuring every student gains practical, industry-focused skills that matter in the real world.\n\nWe are passionate about empowering learners—whether you\'re just starting your career, looking to upskill, or transitioning into a new field. We firmly believe that everyone deserves the same starting point, regardless of their background, and we provide the guidance and resources to help every student reach their potential. Through innovative teaching, personalised guidance, and hands-on experience, we help our students turn challenges into opportunities and dreams into tangible achievements.\n\nAt RedLine Academy, we cultivate a culture of growth, courage, and transformation, inspiring students to step beyond their comfort zones, embrace change, and take control of their future.',
    
    visionTitle: 'Our Vision',
    visionContent: 'Our vision is to provide Australian-certified, internationally recognised vocational training aligned with the Microcredentials Framework, designed to open doors to real opportunities. We are passionate about creating pathways to meaningful careers, helping students transform ambition into achievement, and preparing them to excel in a dynamic and ever changing world.',
    
    missionTitle: 'Our Mission',
    missionContent: 'To empower individuals at every stage of their journey—whether starting a career or transitioning from another field through high-quality, industry-focused training. We are dedicated to equipping our students with practical skills, confidence, and the mindset to thrive in a competitive global workforce.',
    
    ourValues: 'Our Values',
    empowerment: 'Empowerment',
    empowermentDesc: 'We believe every learner deserves the tools, confidence, and support to take control of their future and reach their full potential, regardless of their background.',
    
    excellence: 'Excellence',
    excellenceDesc: 'We maintain the highest standards in training, teaching, and support, ensuring our students gain industry-relevant skills and knowledge that truly matter.',
    
    integrity: 'Integrity',
    integrityDesc: 'We operate with honesty, transparency, and ethical principles in all our programs and interactions, fostering trust and respect in our learning community.',
    
    innovation: 'Innovation',
    innovationDesc: 'We embrace modern teaching methods, practical learning experiences, and creative approaches to prepare students for the evolving demands of the global workforce.',
    
    inclusivity: 'Inclusivity',
    inclusivityDesc: 'We are committed to creating an inclusive environment where every individual feels valued and supported, regardless of their background or experience.',
    
    courage: 'Courage',
    courageDesc: 'We inspire students to step beyond their comfort zones, take risks, and embrace change, encouraging them to transform challenges into opportunities.',
    
    // Team Section
    ourTeam: 'Our Team',
    
    // Footer
    company: 'Company',
    footerDesc: 'Australian-certified vocational training platform recognised internationally.',
    termsConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    allRightsReserved: 'All Rights Reserved',
    
    // Blog Page
    blogTitle: 'Blog',
    blogDesc: 'Read our latest articles about education, careers, and industry tips.',
    subscribeNewsletter: 'Subscribe to Our Newsletter',
    subscribeDesc: 'Get the latest articles, career tips, and program information delivered directly to your email.',
    subscribe: 'Subscribe',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    
    // Programs Page
    whatYouWillLearn: 'What You Will Learn:',
    duration6Months: 'Program Duration: 6 months',
    duration4Months: 'Program Duration: 4 months',
    duration3Months: 'Program Duration: 3 months',
    certificationInternational: 'Certification: International',
    whyChooseOurProgram: 'Why Choose Our Program?',
    programsIntro: 'Choose one of our Australian-certified vocational training programs and start your journey to career success.',
    
    // Legal Page
    legalTitle: 'Legal',
    termsTitle: 'Terms & Conditions',
    privacyTitle: 'Privacy Policy',
  }
};

// Language management
let currentLanguage = localStorage.getItem('language') || 'id';

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  updatePageLanguage();
  
  // Update active button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
}

function t(key) {
  return translations[currentLanguage][key] || key;
}

function updatePageLanguage() {
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const text = t(key);
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = text;
    } else if (element.tagName === 'OPTION') {
      element.textContent = text;
    } else {
      element.textContent = text;
    }
  });
  
  // Update page title and meta
  updatePageTitle();
}

function updatePageTitle() {
  const path = window.location.pathname;
  if (path.includes('about')) {
    document.title = `${t('aboutUs')} - Redline Academy`;
  } else if (path.includes('programs')) {
    document.title = `${t('ourPrograms')} - Redline Academy`;
  } else if (path.includes('contact')) {
    document.title = `${t('contactUs')} - Redline Academy`;
  } else if (path.includes('blog')) {
    document.title = `${t('blogTitle')} - Redline Academy`;
  } else if (path.includes('legal')) {
    document.title = `${t('legalTitle')} - Redline Academy`;
  } else {
    document.title = 'Redline Academy';
  }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
  // Set initial language
  const langBtn = document.querySelector(`[data-lang="${currentLanguage}"]`);
  if (langBtn) {
    langBtn.classList.add('active');
  }
  
  updatePageLanguage();
  
  // Set up language switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      setLanguage(this.getAttribute('data-lang'));
    });
  });
  
  // Set up navigation active state
  const currentPath = window.location.pathname;
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.includes(href) || (currentPath === '/' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
  }
  
  // Form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert(currentLanguage === 'id' ? 'Terima kasih telah menghubungi kami!' : 'Thank you for contacting us!');
      this.reset();
    });
  }
});

// Smooth scroll for anchor links
document.addEventListener('click', function(e) {
  if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

