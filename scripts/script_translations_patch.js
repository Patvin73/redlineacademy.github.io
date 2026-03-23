/* ============================================================
   REDLINE ACADEMY — TRANSLATION KEYS PATCH
   
   CARA PAKAI: Copy-paste blok id{} dan en{} ini ke dalam
   objek translations yang sudah ada di script.js.
   Tambahkan di dalam:
     - translations.id { ... }   ← tambahkan kunci-kunci id berikut
     - translations.en { ... }   ← tambahkan kunci-kunci en berikut
   ============================================================ */

// ── TAMBAHKAN KE translations.id ──
const newKeysID = {

  // Login tabs
  loginTabLMS:               "Login LMS",
  loginTabStaff:             "Marketer Portal",
  staffLoginTitle:           "Marketer Portal",
  staffLoginBadge:           "Portal",
  staffLoginSubtitle:        "Masuk ke portal komisi & manajemen pemasaran.",
  staffLoginButton:          "Masuk ke Portal",
  staffLoginSuccessRedirect: "Login berhasil. Mengarahkan ke portal...",

  // Role error
  lmsErrWrongRoleForPortal:  "Akun ini tidak memiliki akses ke portal ini. Gunakan form login yang sesuai.",

  // Marketer portal header
  staffPortalLabel:          "Marketing Portal",
  mkRoleLabel:               "Marketer",

  // Tabs
  mkTabOverview:  "Ringkasan",
  mkTabSchools:   "Sekolah",
  mkTabClaim:     "Ajukan Klaim",
  mkTabReports:   "Laporan Komisi",
  mkTabGuide:     "Panduan",

  // Overview panel
  mkOverviewEyebrow:      "Dashboard",
  mkOverviewTitle:        "Ringkasan Aktivitas",
  mkOverviewSub:          "Pantau performa komisi dan status klaim Anda secara real-time.",
  mkStatTotalEarnings:    "Total Komisi",
  mkStatAllTime:          "Sepanjang waktu",
  mkStatPending:          "Menunggu Pencairan",
  mkStatPendingNote:      "Belum dibayarkan",
  mkStatEnrolled:         "Siswa Terdaftar",
  mkStatEnrolledNote:     "Dari semua sekolah",
  mkStatSchools:          "Sekolah Aktif",
  mkStatSchoolsNote:      "Presentasi dilakukan",
  mkRecentActivity:       "Aktivitas Terbaru",
  mkLast30Days:           "30 hari terakhir",
  mkNoActivity:           "Belum ada aktivitas tercatat.",
  mkCommClaim:            "Klaim Komisi",

  // Commission structure
  mkCommStructureTitle:   "Struktur Komisi",
  mkBadgeRef:             "Referensi",
  mkStructType:           "Tipe",
  mkStructCond:           "Syarat",
  mkStructValue:          "Nilai",
  mkStructAccessFee:      "Access Fee (Presentasi)",
  mkStructAccessCond:     "Min. 30 siswa hadir, presentasi selesai",
  mkStructEnrollComm:     "Komisi Pendaftaran",
  mkStructEnrollCond:     "Siswa lunas dari sekolah yang difasilitasi",
  mkStructBonus5:         "Bonus Performa – 5 siswa",
  mkStructBonus10:        "Bonus Performa – 10 siswa",
  mkStructNote:           "* Komisi berlaku untuk pendaftaran dalam 60 hari setelah presentasi.",

  // Schools panel
  mkSchoolsEyebrow:       "Manajemen",
  mkSchoolsTitle:         "Daftar Sekolah",
  mkSchoolsSub:           "Sekolah SMK yang telah Anda fasilitasi untuk presentasi program.",
  mkAddSchool:            "+ Tambah Sekolah",
  mkAddSchoolTitle:       "Tambah / Edit Sekolah",
  mkSchoolNameLabel:      "Nama Sekolah",
  mkSchoolNamePH:         "Contoh: SMKN 1 Surabaya",
  mkSchoolCityLabel:      "Kota / Kabupaten",
  mkSchoolCityPH:         "Contoh: Surabaya",
  mkSchoolContactLabel:   "Nama PIC Sekolah",
  mkSchoolContactPH:      "Nama guru / wakil kepala sekolah",
  mkSchoolPhoneLabel:     "No. Telepon PIC",
  mkSchoolPhonePH:        "08xx-xxxx-xxxx",
  mkSchoolNotesLabel:     "Catatan",
  mkSchoolNotesPH:        "Status negosiasi, jadwal presentasi, dll.",
  mkSaveSchool:           "Simpan",
  mkCancel:               "Batal",
  mkSchoolListTitle:      "Semua Sekolah",
  mkColSchoolName:        "Nama Sekolah",
  mkColCity:              "Kota",
  mkColContact:           "PIC",
  mkColEnrolled:          "Siswa Daftar",
  mkColStatus:            "Status",
  mkColActions:           "Aksi",
  mkNoSchools:            "Belum ada sekolah ditambahkan.",
  mkEditSchool:           "Edit",
  mkSchoolSaved:          "Sekolah berhasil disimpan!",
  mkSchoolValidationError:"Nama sekolah dan kota wajib diisi.",

  // Claims panel
  mkClaimEyebrow:           "Form",
  mkClaimTitle:             "Ajukan Klaim Komisi",
  mkClaimSub:               "Isi data presentasi dan jumlah siswa yang mendaftar untuk menghitung dan mengajukan klaim komisi Anda.",
  mkClaimAlertInfo:         "Klaim Access Fee dan Komisi Pendaftaran diajukan dalam satu form. Pastikan data sudah terverifikasi oleh tim Redline Academy sebelum submission.",
  mkClaimFormTitle:         "Data Presentasi & Pendaftaran",
  mkClaimSec1:              "1. Data Sekolah & Presentasi",
  mkClaimSec2:              "2. Kalkulasi Komisi",
  mkClaimSec3:              "3. Catatan & Verifikasi",
  mkClaimSchoolLabel:       "Nama Sekolah",
  mkClaimSchoolPH:          "Pilih sekolah...",
  mkClaimSchoolHint:        "Sekolah harus sudah ditambahkan di tab Sekolah.",
  mkClaimPresDateLabel:     "Tanggal Presentasi",
  mkClaimStudentsPresentLabel:  "Jumlah Siswa Hadir",
  mkClaimStudentsPresentHint:   "Minimal 30 siswa untuk memenuhi syarat Access Fee.",
  mkClaimStudentsEnrolledLabel: "Jumlah Siswa Mendaftar & Lunas",
  mkClaimStudentsEnrolledHint:  "Hanya siswa yang sudah lunas pembayaran.",
  mkClaimProgramFeeLabel:   "Biaya Program Per Siswa (Rp)",
  mkClaimProgramFeeHint:    "Digunakan untuk menghitung 10% komisi pendaftaran.",
  mkClaimNotesLabel:        "Catatan Tambahan",
  mkClaimNotesPH:           "Informasi tambahan, kendala, atau catatan untuk tim admin...",
  mkClaimConsent:           "Saya menyatakan data yang diajukan akurat dan dapat diverifikasi oleh tim Redline Academy.",
  mkClaimSubmitBtn:         "Kirim Klaim",
  mkClaimSubmitting:        "Mengirim klaim...",
  mkClaimSuccess:           "Klaim berhasil diajukan! Menunggu verifikasi admin.",
  mkClaimValidationSchool:  "Pilih sekolah dan tanggal presentasi.",
  mkClaimValidationStudents:"Isi jumlah siswa yang hadir.",
  mkClaimValidationConsent: "Harap centang persetujuan sebelum mengirim.",

  // Calculator
  mkCalcTitle:             "Estimasi Komisi",
  mkCalcAccessFee:         "Access Fee Presentasi",
  mkCalcAccessFeeFormula:  "Rp 350.000 × 1 presentasi (min. 30 siswa hadir)",
  mkCalcEnrollComm:        "Komisi Pendaftaran",
  mkCalcBonus:             "Bonus Performa",
  mkCalcBonusFormulaNone:  "Belum ada (min. 5 siswa)",
  mkCalcTotal:             "TOTAL ESTIMASI",

  // Reports panel
  mkReportsEyebrow:        "Riwayat",
  mkReportsTitle:          "Laporan Komisi",
  mkReportsSub:            "Seluruh klaim yang telah Anda ajukan beserta statusnya.",
  mkReportsListTitle:      "Semua Klaim",
  mkColRef:                "Ref. ID",
  mkColDate:               "Tanggal",
  mkColSchool:             "Sekolah",
  mkColStudents:           "Siswa",
  mkColTotal:              "Total Komisi",
  mkColType:               "Jenis",
  mkColAmount:             "Jumlah",
  mkNoReports:             "Belum ada klaim yang diajukan.",
  mkViewReport:            "Lihat",
  mkBackToList:            "← Kembali ke Daftar",
  mkClaimSingular:         "klaim",
  mkClaimPlural:           "klaim",

  // Report detail
  mkReportBrand:           "Redline Academy",
  mkReportTypeLbl:         "Laporan Komisi Marketing",
  mkDetailSchool:          "Sekolah",
  mkDetailPresDate:        "Tgl Presentasi",
  mkDetailStudents:        "Siswa Hadir / Daftar",
  mkDetailNotes:           "Catatan",

  // Status badges
  mkStatusPaid:            "Dibayar",
  mkStatusPending:         "Menunggu",
  mkStatusRejected:        "Ditolak",

  // Guide panel
  mkGuideEyebrow:          "Panduan",
  mkGuideTitle:            "Cara Mengajukan Klaim Komisi",
  mkGuideSub:              "Panduan langkah demi langkah untuk marketer Redline Academy.",
  mkGuideStructTitle:      "Struktur Komisi Lengkap",
  mkStructAccessFeeSub:    "Per presentasi",
  mkStructAccessCondFull:  "Presentasi disetujui sekolah, min. 30 siswa hadir, presentasi berhasil dilaksanakan",
  mkStructEnrollCommSub:   "Per siswa",
  mkStructEnrollCondFull:  "Siswa dari sekolah yang difasilitasi, menyelesaikan pembayaran, dalam 60 hari setelah presentasi",
  mkStructPerStudent:      "dari biaya program per siswa",

  // Steps
  mkStep1Title: "Tambahkan Sekolah",
  mkStep1Desc:  "Buka tab Sekolah dan klik \"Tambah Sekolah\". Isi data SMK yang akan Anda fasilitasi: nama, kota, dan kontak PIC sekolah.",
  mkStep2Title: "Laksanakan Presentasi",
  mkStep2Desc:  "Koordinasikan jadwal presentasi program Redline Academy dengan pihak sekolah. Pastikan minimal 30 siswa hadir untuk memenuhi syarat Access Fee sebesar Rp 350.000.",
  mkStep3Title: "Catat Data Pendaftaran",
  mkStep3Desc:  "Setelah presentasi, catat jumlah siswa yang mendaftar dan telah menyelesaikan pembayaran. Komisi pendaftaran (10%) hanya berlaku untuk siswa yang sudah lunas dalam 60 hari sejak presentasi.",
  mkStep4Title: "Ajukan Klaim",
  mkStep4Desc:  "Buka tab Ajukan Klaim, pilih sekolah, isi data presentasi, dan sistem akan otomatis menghitung total komisi Anda. Centang persetujuan dan kirimkan klaim.",
  mkStep5Title: "Pembayaran Komisi",
  mkStep5Desc:  "Setelah verifikasi oleh tim Redline Academy, komisi akan dibayarkan secara periodik (bulanan). Pantau status klaim di tab Laporan Komisi.",

  // Scenario
  mkScenarioTitle:       "Contoh Skenario Penghasilan",
  mkScenarioDesc:        "1 presentasi di 1 SMK, 60 siswa hadir, 6 siswa mendaftar dan lunas (biaya program Rp 4.600.000/siswa).",
  mkScenarioResult:      "Hasil Estimasi",
  mkScenarioBonusFormula:"6 siswa ≥ 5 → Bonus aktif",

  // FAQ
  mkFaqTitle: "FAQ",
  mkFaq1Q:    "Kapan komisi dibayarkan?",
  mkFaq1A:    "Komisi direkap dan dibayarkan secara periodik (bulanan) setelah siswa menyelesaikan pembayaran dan diverifikasi oleh tim Redline Academy.",
  mkFaq2Q:    "Apakah Access Fee otomatis didapat jika presentasi dilakukan?",
  mkFaq2A:    "Tidak. Access Fee diberikan hanya jika: (1) presentasi disetujui sekolah, (2) minimal 30 siswa hadir, dan (3) presentasi berhasil dilaksanakan.",
  mkFaq3Q:    "Apakah ada batas waktu pendaftaran siswa?",
  mkFaq3A:    "Ya. Komisi hanya berlaku untuk pendaftaran yang terjadi dalam 60 hari setelah tanggal presentasi di sekolah tersebut.",
};

// ── TAMBAHKAN KE translations.en ──
const newKeysEN = {

  // Login tabs
  loginTabLMS:               "LMS Login",
  loginTabStaff:             "Marketer Portal",
  staffLoginTitle:           "Marketer Portal",
  staffLoginBadge:           "Portal",
  staffLoginSubtitle:        "Sign in to the commission & marketing management portal.",
  staffLoginButton:          "Sign In to Portal",
  staffLoginSuccessRedirect: "Login successful. Redirecting to portal...",

  // Role error
  lmsErrWrongRoleForPortal:  "This account does not have access to this portal. Please use the correct login form.",

  // Marketer portal header
  staffPortalLabel:   "Marketing Portal",
  mkRoleLabel:        "Marketer",

  // Tabs
  mkTabOverview:  "Overview",
  mkTabSchools:   "Schools",
  mkTabClaim:     "Submit Claim",
  mkTabReports:   "Commission Reports",
  mkTabGuide:     "Guide",

  // Overview panel
  mkOverviewEyebrow:      "Dashboard",
  mkOverviewTitle:        "Activity Overview",
  mkOverviewSub:          "Monitor your commission performance and claim status in real-time.",
  mkStatTotalEarnings:    "Total Commission",
  mkStatAllTime:          "All time",
  mkStatPending:          "Awaiting Payout",
  mkStatPendingNote:      "Not yet paid",
  mkStatEnrolled:         "Students Enrolled",
  mkStatEnrolledNote:     "Across all schools",
  mkStatSchools:          "Active Schools",
  mkStatSchoolsNote:      "Presentations held",
  mkRecentActivity:       "Recent Activity",
  mkLast30Days:           "Last 30 days",
  mkNoActivity:           "No activity recorded yet.",
  mkCommClaim:            "Commission Claim",

  // Commission structure
  mkCommStructureTitle:   "Commission Structure",
  mkBadgeRef:             "Reference",
  mkStructType:           "Type",
  mkStructCond:           "Conditions",
  mkStructValue:          "Value",
  mkStructAccessFee:      "Access Fee (Presentation)",
  mkStructAccessCond:     "Min. 30 students attended, presentation completed",
  mkStructEnrollComm:     "Enrollment Commission",
  mkStructEnrollCond:     "Students who paid from facilitated schools",
  mkStructBonus5:         "Performance Bonus – 5 students",
  mkStructBonus10:        "Performance Bonus – 10 students",
  mkStructNote:           "* Commission applies to enrollments within 60 days of the school presentation.",

  // Schools panel
  mkSchoolsEyebrow:       "Management",
  mkSchoolsTitle:         "School List",
  mkSchoolsSub:           "SMK vocational schools you have facilitated for program presentations.",
  mkAddSchool:            "+ Add School",
  mkAddSchoolTitle:       "Add / Edit School",
  mkSchoolNameLabel:      "School Name",
  mkSchoolNamePH:         "e.g. SMKN 1 Surabaya",
  mkSchoolCityLabel:      "City / District",
  mkSchoolCityPH:         "e.g. Surabaya",
  mkSchoolContactLabel:   "PIC Name",
  mkSchoolContactPH:      "Teacher / vice principal name",
  mkSchoolPhoneLabel:     "PIC Phone",
  mkSchoolPhonePH:        "Phone number",
  mkSchoolNotesLabel:     "Notes",
  mkSchoolNotesPH:        "Negotiation status, presentation schedule, etc.",
  mkSaveSchool:           "Save",
  mkCancel:               "Cancel",
  mkSchoolListTitle:      "All Schools",
  mkColSchoolName:        "School Name",
  mkColCity:              "City",
  mkColContact:           "PIC",
  mkColEnrolled:          "Enrolled",
  mkColStatus:            "Status",
  mkColActions:           "Actions",
  mkNoSchools:            "No schools added yet.",
  mkEditSchool:           "Edit",
  mkSchoolSaved:          "School saved successfully!",
  mkSchoolValidationError:"School name and city are required.",

  // Claims
  mkClaimEyebrow:           "Form",
  mkClaimTitle:             "Submit Commission Claim",
  mkClaimSub:               "Fill in presentation data and enrolled student count to calculate and submit your commission claim.",
  mkClaimAlertInfo:         "Access Fee and Enrollment Commission claims are submitted in one form. Ensure data has been verified by the Redline Academy team before submission.",
  mkClaimFormTitle:         "Presentation & Enrollment Data",
  mkClaimSec1:              "1. School & Presentation Data",
  mkClaimSec2:              "2. Commission Calculation",
  mkClaimSec3:              "3. Notes & Verification",
  mkClaimSchoolLabel:       "School Name",
  mkClaimSchoolPH:          "Select school...",
  mkClaimSchoolHint:        "School must first be added in the Schools tab.",
  mkClaimPresDateLabel:     "Presentation Date",
  mkClaimStudentsPresentLabel:  "Students Present",
  mkClaimStudentsPresentHint:   "Minimum 30 students required for Access Fee eligibility.",
  mkClaimStudentsEnrolledLabel: "Students Enrolled & Paid",
  mkClaimStudentsEnrolledHint:  "Only count students who have completed payment.",
  mkClaimProgramFeeLabel:   "Program Fee Per Student (Rp)",
  mkClaimProgramFeeHint:    "Used to calculate the 10% enrollment commission.",
  mkClaimNotesLabel:        "Additional Notes",
  mkClaimNotesPH:           "Additional info, issues, or notes for the admin team...",
  mkClaimConsent:           "I confirm the submitted data is accurate and verifiable by the Redline Academy team.",
  mkClaimSubmitBtn:         "Submit Claim",
  mkClaimSubmitting:        "Submitting claim...",
  mkClaimSuccess:           "Claim submitted successfully! Awaiting admin verification.",
  mkClaimValidationSchool:  "Please select a school and presentation date.",
  mkClaimValidationStudents:"Please fill in the number of students present.",
  mkClaimValidationConsent: "Please check the agreement box before submitting.",

  // Calculator
  mkCalcTitle:             "Commission Estimate",
  mkCalcAccessFee:         "Presentation Access Fee",
  mkCalcAccessFeeFormula:  "Rp 350,000 × 1 presentation (min. 30 students)",
  mkCalcEnrollComm:        "Enrollment Commission",
  mkCalcBonus:             "Performance Bonus",
  mkCalcBonusFormulaNone:  "Not yet (min. 5 students)",
  mkCalcTotal:             "TOTAL ESTIMATE",

  // Reports
  mkReportsEyebrow:        "History",
  mkReportsTitle:          "Commission Reports",
  mkReportsSub:            "All claims you have submitted and their current status.",
  mkReportsListTitle:      "All Claims",
  mkColRef:                "Ref. ID",
  mkColDate:               "Date",
  mkColSchool:             "School",
  mkColStudents:           "Students",
  mkColTotal:              "Total Commission",
  mkColType:               "Type",
  mkColAmount:             "Amount",
  mkNoReports:             "No claims submitted yet.",
  mkViewReport:            "View",
  mkBackToList:            "← Back to List",
  mkClaimSingular:         "claim",
  mkClaimPlural:           "claims",

  // Report detail
  mkReportBrand:           "Redline Academy",
  mkReportTypeLbl:         "Marketing Commission Report",
  mkDetailSchool:          "School",
  mkDetailPresDate:        "Presentation Date",
  mkDetailStudents:        "Present / Enrolled",
  mkDetailNotes:           "Notes",

  // Status
  mkStatusPaid:            "Paid",
  mkStatusPending:         "Pending",
  mkStatusRejected:        "Rejected",

  // Guide
  mkGuideEyebrow:          "Guide",
  mkGuideTitle:            "How to Submit a Commission Claim",
  mkGuideSub:              "Step-by-step guide for Redline Academy marketers.",
  mkGuideStructTitle:      "Full Commission Structure",
  mkStructAccessFeeSub:    "Per presentation",
  mkStructAccessCondFull:  "School-approved presentation, min. 30 students present, presentation successfully conducted",
  mkStructEnrollCommSub:   "Per student",
  mkStructEnrollCondFull:  "Students from facilitated school, payment completed, within 60 days of presentation",
  mkStructPerStudent:      "of program fee per student",

  // Steps
  mkStep1Title: "Add School",
  mkStep1Desc:  "Open the Schools tab and click \"Add School\". Enter the SMK school details: name, city, and PIC contact.",
  mkStep2Title: "Conduct Presentation",
  mkStep2Desc:  "Coordinate the presentation schedule with the school. Ensure at least 30 students are present to qualify for the Rp 350,000 Access Fee.",
  mkStep3Title: "Record Enrollment Data",
  mkStep3Desc:  "After the presentation, record the number of students who enrolled and completed payment. The 10% enrollment commission only applies to paid students within 60 days.",
  mkStep4Title: "Submit Claim",
  mkStep4Desc:  "Open the Submit Claim tab, select your school, fill in the data, and the system will automatically calculate your commission. Check the agreement and submit.",
  mkStep5Title: "Commission Payment",
  mkStep5Desc:  "After verification by the Redline Academy team, commissions are paid out periodically (monthly). Monitor claim status in the Commission Reports tab.",

  // Scenario
  mkScenarioTitle:       "Sample Earnings Scenario",
  mkScenarioDesc:        "1 presentation at 1 SMK, 60 students attend, 6 students enroll and complete payment (program fee Rp 4,600,000/student).",
  mkScenarioResult:      "Estimated Results",
  mkScenarioBonusFormula:"6 students ≥ 5 → Bonus activated",

  // FAQ
  mkFaqTitle: "FAQ",
  mkFaq1Q:    "When are commissions paid?",
  mkFaq1A:    "Commissions are summarized and paid periodically (monthly) after students complete payment and are verified by the Redline Academy team.",
  mkFaq2Q:    "Is the Access Fee automatically awarded after a presentation?",
  mkFaq2A:    "No. The Access Fee is awarded only if: (1) the presentation is approved by the school, (2) at least 30 students attend, and (3) the presentation is successfully conducted.",
  mkFaq3Q:    "Is there a deadline for student enrollment?",
  mkFaq3A:    "Yes. Commission only applies to enrollments within 60 days of the presentation date at that school.",
};

/*
  ── CARA INTEGRASI KE script.js ──
  
  Cari baris ini di script.js:
    const translations = {
      id: {
        ...
      },
      en: {
        ...
      }
    };
  
  Tambahkan semua key dari newKeysID ke dalam block translations.id
  dan semua key dari newKeysEN ke dalam block translations.en.
  
  Atau, gunakan pendekatan programatik di bawah ini (tambahkan di akhir
  script.js, SETELAH deklarasi translations dan SEBELUM DOMContentLoaded):
  
    Object.assign(translations.id, newKeysID);
    Object.assign(translations.en, newKeysEN);
  
  Namun perlu mendefinisikan newKeysID dan newKeysEN terlebih dahulu,
  atau langsung copy-paste isi objek ke dalam translations.
*/
