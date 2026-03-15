/* ================================================================
   REDLINE ACADEMY — dashboard-admin.js
   Controller for Admin & Trainer Dashboard
   Dependencies: supabase-client.js (window.lmsSupabase), script.js (t())
   ================================================================ */

(function () {
  "use strict";

  /* ================================================================
     NEW i18n KEYS — inject into script.js translations
     Copy the contents of NEW_I18N_KEYS into both
     translations.id and translations.en in js/script.js
  ================================================================ */
  const NEW_I18N_KEYS = {
    id: {
      adNavDashboard:        "Dashboard",
      adNavStudents:         "Student Saya",
      adNavCourses:          "Manajemen Kursus",
      adNavGrading:          "Tugas & Penilaian",
      adNavSchedule:         "Jadwal",
      adNavMessages:         "Pesan",
      adNavReports:          "Laporan & Analitik",
      adNavGroupMain:        "Menu Utama",
      adNavGroupAdmin:       "Administrasi",
      adNavUsers:            "Manajemen User",
      adNavEnrollments:      "Pendaftaran & Pembayaran",
      adNavAnnouncements:    "Pengumuman",
      adNavSettings:         "Pengaturan Sistem",
      adWelcomeBack:         "Selamat datang kembali,",
      adKpiStudents:         "Total Student",
      adKpiCourses:          "Kursus Aktif",
      adKpiGrading:          "Tugas Menunggu Nilai",
      adKpiCompletion:       "Rata-rata Penyelesaian",
      adActivityFeed:        "Feed Aktivitas",
      adPendingActions:      "Aksi Tertunda",
      adAtRiskTitle:         "Student Berisiko",
      adAtRiskSub:           "Tidak aktif 7+ hari",
      adNoActivity:          "Belum ada aktivitas",
      adNoPending:           "Semua sudah ditangani! 🎉",
      adNoAtRisk:            "Tidak ada student berisiko 🎉",
      adColStudent:          "Student",
      adColCourse:           "Kursus",
      adColProgress:         "Progres",
      adColLastActive:       "Terakhir Aktif",
      adColAction:           "Aksi",
      adColStatus:           "Status",
      adColEnrolled:         "Terdaftar",
      adColCompleted:        "Selesai",
      adColCompletionRate:   "Tingkat Penyelesaian",
      adColCerts:            "Sertifikat",
      adColUser:             "User",
      adColRole:             "Role",
      adColJoined:           "Bergabung",
      adColPayMethod:        "Metode",
      adFilterAll:           "Semua",
      adFilterActive:        "Aktif",
      adFilterCompleted:     "Selesai",
      adFilterAtRisk:        "Berisiko",
      adFilterStudents:      "Student",
      adFilterTrainers:      "Trainer",
      adFilterAdmins:        "Admin",
      adSearchStudents:      "Cari student...",
      adSearchUsers:         "Cari user...",
      adSearchPlaceholder:   "Cari student, kursus...",
      adCreateCourse:        "Buat Kursus",
      adTabCourseInfo:       "Info Kursus",
      adTabModules:          "Modul & Lesson",
      adTabCourseSettings:   "Pengaturan",
      adCourseTitle:         "Judul Kursus",
      adCourseCategory:      "Kategori",
      adCourseDesc:          "Deskripsi",
      adCourseLevel:         "Level",
      adCourseDuration:      "Durasi (jam)",
      adPassMark:            "Nilai Lulus (%)",
      adEnrollmentType:      "Tipe Pendaftaran",
      adEnrollOpen:          "Terbuka",
      adEnrollInvite:        "Undangan",
      adEnrollPaid:          "Berbayar",
      adMaxStudents:         "Maks. Student",
      adPrice:               "Harga (IDR)",
      adCourseStatus:        "Status Kursus",
      adStatusDraft:         "Draft",
      adStatusPublished:     "Diterbitkan",
      adStatusArchived:      "Diarsipkan",
      adFeatured:            "Kursus Unggulan",
      adAddModule:           "+ Tambah Modul",
      adAddLesson:           "+ Tambah Lesson",
      adSaveDraft:           "Simpan sebagai Draft",
      adSaveCourse:          "Simpan & Terbitkan",
      adEditCourse:          "Edit Kursus",
      adDeleteCourse:        "Hapus",
      adGradeTabPending:     "Perlu Dinilai",
      adGradeTabGraded:      "Sudah Dinilai",
      adNoSubmissions:       "Tidak ada tugas untuk dinilai",
      adSelectSubmission:    "Pilih submission untuk dinilai",
      adSubmittedFiles:      "File yang Dikirim",
      adStudentNotes:        "Catatan Student",
      adGrade:               "Nilai (%)",
      adPassFail:            "Hasil",
      adFeedback:            "Feedback ke Student",
      adFeedbackPlaceholder: "Tulis feedback Anda...",
      adReqResubmit:         "Minta Kumpul Ulang",
      adSaveGrade:           "Simpan & Notifikasi Student",
      adCreateEvent:         "Buat Event",
      adEventTitle:          "Judul Event",
      adEventType:           "Tipe",
      adEventStart:          "Tanggal & Waktu Mulai",
      adEventEnd:            "Tanggal & Waktu Selesai",
      adMeetingUrl:          "Link Meeting (Zoom / Teams)",
      adMandatory:           "Wajib Hadir",
      adUpcomingEvents:      "Event Mendatang",
      adNoEvents:            "Tidak ada event mendatang",
      adSaveEvent:           "Simpan Event",
      adCancel:              "Batal",
      adExportCSV:           "Export CSV",
      adMetricAvgScore:      "Rata-rata Nilai Kuis",
      adMetricDropout:       "Tingkat Dropout",
      adMetricCerts:         "Sertifikat Diterbitkan",
      adMetricRevenue:       "Total Pendapatan (IDR)",
      adCourseOverview:      "Ringkasan Kursus",
      adNoData:              "Tidak ada data",
      adAddUser:             "Tambah User",
      adNoUsers:             "Tidak ada user",
      adPayTotal:            "Total Pembayaran",
      adPayPending:          "Menunggu",
      adPayRevenue:          "Pendapatan (IDR)",
      adPayMethod:           "Metode",
      adPayAmount:           "Jumlah",
      adPayDate:             "Tanggal",
      adNoPayments:          "Tidak ada data pembayaran",
      adPaymentPlan:         "Cara Pembayaran",
      adPaymentPlanFull:     "Full payment",
      adPaymentPlanInstallment: "Cicilan",
      adPaymentNextDue:      "Jatuh tempo berikutnya",
      adPaymentInstallmentPaid: "Cicilan ke",
      adPaymentInstallmentTotal: "Total cicilan (2-4x)",
      adPaymentSelectStudent: "Pilih student",
      adPaymentSelectCourse: "Pilih kursus",
      adPaymentNoStudents:   "Belum ada student",
      adPaymentNoCourses:    "Belum ada kursus",
      adCreateAnnouncement:  "Buat Pengumuman",
      adAnnouncementTitle:   "Judul",
      adAnnouncementTarget:  "Target Audiens",
      adAnnouncementBody:    "Konten",
      adAnnouncementCourse:  "Target Kursus (opsional)",
      adPublishAt:           "Waktu Publish",
      adExpiresAt:           "Waktu Berakhir (opsional)",
      adPublish:             "Terbitkan",
      adNoAnnouncements:     "Belum ada pengumuman",
      adSettingsBranding:    "Branding Platform",
      adSettingsEmail:       "Notifikasi Email",
      adSettingsStorage:     "Monitor Storage",
      adPlatformName:        "Nama Platform",
      adDefaultLanguage:     "Bahasa Default",
      adSaveSettings:        "Simpan Pengaturan",
      adEmailNewEnroll:      "Pendaftaran baru",
      adEmailSubmission:     "Tugas dikirim",
      adEmailGraded:         "Tugas dinilai",
      adEmailCertificate:    "Sertifikat diterbitkan",
      adEmailReminder:       "Pengingat sesi (24 jam sebelum)",
      adStorageDB:           "Database",
      adStorageFiles:        "Penyimpanan File",
      adStorageNote:         "Batas Supabase Free Tier",
      adSendMessage:         "Kirim Pesan",
      adMsgToStudent:        "Kirim ke student ini",
    },
    en: {
      adNavDashboard:        "Dashboard",
      adNavStudents:         "My Students",
      adNavCourses:          "Course Management",
      adNavGrading:          "Assignments & Grading",
      adNavSchedule:         "Schedule",
      adNavMessages:         "Messages",
      adNavReports:          "Reports & Analytics",
      adNavGroupMain:        "Main Menu",
      adNavGroupAdmin:       "Administration",
      adNavUsers:            "User Management",
      adNavEnrollments:      "Enrollments & Payments",
      adNavAnnouncements:    "Announcements",
      adNavSettings:         "System Settings",
      adWelcomeBack:         "Welcome back,",
      adKpiStudents:         "Total Students",
      adKpiCourses:          "Active Courses",
      adKpiGrading:          "Pending Grading",
      adKpiCompletion:       "Avg. Completion Rate",
      adActivityFeed:        "Activity Feed",
      adPendingActions:      "Pending Actions",
      adAtRiskTitle:         "Students At Risk",
      adAtRiskSub:           "Inactive 7+ days",
      adNoActivity:          "No recent activity",
      adNoPending:           "All caught up! 🎉",
      adNoAtRisk:            "No at-risk students 🎉",
      adColStudent:          "Student",
      adColCourse:           "Course",
      adColProgress:         "Progress",
      adColLastActive:       "Last Active",
      adColAction:           "Action",
      adColStatus:           "Status",
      adColEnrolled:         "Enrolled",
      adColCompleted:        "Completed",
      adColCompletionRate:   "Completion Rate",
      adColCerts:            "Certs",
      adColUser:             "User",
      adColRole:             "Role",
      adColJoined:           "Joined",
      adColPayMethod:        "Method",
      adFilterAll:           "All",
      adFilterActive:        "Active",
      adFilterCompleted:     "Completed",
      adFilterAtRisk:        "At Risk",
      adFilterStudents:      "Students",
      adFilterTrainers:      "Trainers",
      adFilterAdmins:        "Admins",
      adSearchStudents:      "Search students...",
      adSearchUsers:         "Search users...",
      adSearchPlaceholder:   "Search students, courses...",
      adCreateCourse:        "Create Course",
      adTabCourseInfo:       "Course Info",
      adTabModules:          "Modules & Lessons",
      adTabCourseSettings:   "Settings",
      adCourseTitle:         "Course Title",
      adCourseCategory:      "Category",
      adCourseDesc:          "Description",
      adCourseLevel:         "Level",
      adCourseDuration:      "Duration (hours)",
      adPassMark:            "Pass Mark (%)",
      adEnrollmentType:      "Enrollment Type",
      adEnrollOpen:          "Open",
      adEnrollInvite:        "Invite Only",
      adEnrollPaid:          "Paid",
      adMaxStudents:         "Max Students",
      adPrice:               "Price (IDR)",
      adCourseStatus:        "Course Status",
      adStatusDraft:         "Draft",
      adStatusPublished:     "Published",
      adStatusArchived:      "Archived",
      adFeatured:            "Featured Course",
      adAddModule:           "+ Add Module",
      adAddLesson:           "+ Add Lesson",
      adSaveDraft:           "Save as Draft",
      adSaveCourse:          "Save & Publish",
      adEditCourse:          "Edit Course",
      adDeleteCourse:        "Delete",
      adGradeTabPending:     "Needs Grading",
      adGradeTabGraded:      "Graded",
      adNoSubmissions:       "No submissions to grade",
      adSelectSubmission:    "Select a submission to grade",
      adSubmittedFiles:      "Submitted Files",
      adStudentNotes:        "Student Notes",
      adGrade:               "Grade (%)",
      adPassFail:            "Result",
      adFeedback:            "Feedback to Student",
      adFeedbackPlaceholder: "Write your feedback here...",
      adReqResubmit:         "Request Resubmit",
      adSaveGrade:           "Save & Notify Student",
      adCreateEvent:         "Create Event",
      adEventTitle:          "Event Title",
      adEventType:           "Type",
      adEventStart:          "Start Date & Time",
      adEventEnd:            "End Date & Time",
      adMeetingUrl:          "Meeting URL (Zoom / Teams)",
      adMandatory:           "Mandatory",
      adUpcomingEvents:      "Upcoming Events",
      adNoEvents:            "No upcoming events",
      adSaveEvent:           "Save Event",
      adCancel:              "Cancel",
      adExportCSV:           "Export CSV",
      adMetricAvgScore:      "Avg. Quiz Score",
      adMetricDropout:       "Dropout Rate",
      adMetricCerts:         "Certificates Issued",
      adMetricRevenue:       "Total Revenue (IDR)",
      adCourseOverview:      "Course Overview",
      adNoData:              "No data available",
      adAddUser:             "Add User",
      adNoUsers:             "No users found",
      adPayTotal:            "Total Payments",
      adPayPending:          "Pending",
      adPayRevenue:          "Revenue (IDR)",
      adPayMethod:           "Method",
      adPayAmount:           "Amount",
      adPayDate:             "Date",
      adNoPayments:          "No payment data",
      adPaymentPlan:         "Payment Plan",
      adPaymentPlanFull:     "Full payment",
      adPaymentPlanInstallment: "Installment",
      adPaymentNextDue:      "Next due date",
      adPaymentInstallmentPaid: "Installment #",
      adPaymentInstallmentTotal: "Total installments (2-4x)",
      adPaymentSelectStudent: "Select student",
      adPaymentSelectCourse: "Select course",
      adPaymentNoStudents:   "No students found",
      adPaymentNoCourses:    "No courses found",
      adCreateAnnouncement:  "Create Announcement",
      adAnnouncementTitle:   "Title",
      adAnnouncementTarget:  "Target Audience",
      adAnnouncementBody:    "Content",
      adAnnouncementCourse:  "Target Course (optional)",
      adPublishAt:           "Publish At",
      adExpiresAt:           "Expires At (optional)",
      adPublish:             "Publish",
      adNoAnnouncements:     "No announcements yet",
      adSettingsBranding:    "Platform Branding",
      adSettingsEmail:       "Email Notifications",
      adSettingsStorage:     "Storage Monitor",
      adPlatformName:        "Platform Name",
      adDefaultLanguage:     "Default Language",
      adSaveSettings:        "Save Settings",
      adEmailNewEnroll:      "New enrollment",
      adEmailSubmission:     "Assignment submitted",
      adEmailGraded:         "Assignment graded",
      adEmailCertificate:    "Certificate issued",
      adEmailReminder:       "Session reminders (24h before)",
      adStorageDB:           "Database",
      adStorageFiles:        "File Storage",
      adStorageNote:         "Supabase Free Tier limits",
      adSendMessage:         "Send Message",
      adMsgToStudent:        "Message this student",
    },
  };

  /* Auto-inject keys into script.js translations at runtime */
  if (window.translations) {
    Object.entries(NEW_I18N_KEYS).forEach(([lang, keys]) => {
      if (window.translations[lang]) {
        Object.assign(window.translations[lang], keys);
      }
    });
    if (typeof updatePageLanguage === "function") updatePageLanguage();
  }

  /* ================================================================
     STATE
  ================================================================ */
  let currentProfile   = null;
  let currentRole      = "trainer"; // "trainer" | "admin" — set from profile
  let currentSection   = "home";
  let usersCache       = [];
  let activeUserRoleFilter = "all";
  let selectedSubmissionId = null;

  /* ================================================================
     HELPERS
  ================================================================ */
  const $ = (id) => document.getElementById(id);

  function escHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function tSafe(key, fallback) {
    return typeof t === "function" ? t(key) : fallback;
  }

  function formatCurrency(value, currency = "IDR") {
    const amount = Number(value || 0);
    try {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "IDR" ? 0 : 2
      }).format(amount);
    } catch {
      return `${amount.toFixed(currency === "IDR" ? 0 : 2)} ${currency}`;
    }
  }

  function timeAgo(iso) {
    if (!iso) return "-";
    const diff  = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days > 0)  return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0)  return `${mins}m ago`;
    return "just now";
  }

  function formatDT(iso, opts = {}) {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("en-AU", {
      year: "numeric", month: "short", day: "numeric",
      ...opts,
    });
  }

  function formatDateShort(iso) {
    if (!iso) return { day: "-", month: "" };
    const d = new Date(iso);
    return {
      day:   d.getDate(),
      month: d.toLocaleString("en-AU", { month: "short" }).toUpperCase(),
    };
  }

  /* ================================================================
     INIT
  ================================================================ */
  document.addEventListener("DOMContentLoaded", async () => {
    setupSidebar();
    setupNavigation();
    setupTopbarNotifications();
    setupCourseBuilder();
    setupGradingPanel();
    setupScheduleForm();
    setupAnnouncementForm();
    setupManualPaymentForm();
    setupBuilderTabs();
    setupUserManagement();
    setupFilterTabs();
    setWelcomeDate();

    await loadAdminData();
  });

  /* ================================================================
     SIDEBAR
  ================================================================ */
  function setupSidebar() {
    const sidebar   = $("adSidebar");
    const overlay   = $("adOverlay");
    const hamburger = $("adHamburger");
    const closeBtn  = $("adSidebarClose");

    const open  = () => { sidebar.classList.add("open"); overlay.classList.add("active"); hamburger.setAttribute("aria-expanded", "true"); };
    const close = () => { sidebar.classList.remove("open"); overlay.classList.remove("active"); hamburger.setAttribute("aria-expanded", "false"); };

    hamburger && hamburger.addEventListener("click", open);
    closeBtn  && closeBtn.addEventListener("click", close);
    overlay   && overlay.addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ================================================================
     NAVIGATION
  ================================================================ */
  function setupNavigation() {
    const navItems = document.querySelectorAll(".ad-nav__item[data-section]");
    const sections = document.querySelectorAll(".ad-section");
    const topBarTitle = $("topBarTitle");

    function activate(sectionId) {
      currentSection = sectionId;

      sections.forEach((s) => s.classList.toggle("active", s.id === "section-" + sectionId));

      navItems.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.section === sectionId);
        btn.setAttribute("aria-current", btn.dataset.section === sectionId ? "page" : "false");
      });

      const activeSpan = document.querySelector(`.ad-nav__item[data-section="${sectionId}"] span[data-i18n]`);
      if (topBarTitle && activeSpan) topBarTitle.textContent = activeSpan.textContent;

      // Close mobile sidebar
      if (window.innerWidth <= 768) {
        $("adSidebar").classList.remove("open");
        $("adOverlay").classList.remove("active");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });

      // Lazy-load section data on first visit
      loadSectionData(sectionId);
    }

    navItems.forEach((btn) => btn.addEventListener("click", () => activate(btn.dataset.section)));

    window._adActivateSection = activate;
  }

  /* ── Lazy load by section ────────────────────────────────────── */
  const loadedSections = new Set(["home"]);

  async function loadSectionData(sectionId) {
    if (loadedSections.has(sectionId)) return;
    loadedSections.add(sectionId);

    switch (sectionId) {
      case "students":    await loadStudentsTable(); break;
      case "courses":     await loadCoursesList(); break;
      case "grading":     await loadSubmissionQueue(); break;
      case "schedule":    await loadEventsList(); break;
      case "messages":    await loadMessages(); break;
      case "reports":     await loadReports(); break;
      case "users":       await loadUsersTable(); break;
      case "enrollments": await loadEnrollmentsTable(); break;
      case "announcements": await loadAnnouncements(); break;
    }
  }

  /* ================================================================
     SUPABASE DATA — main loader
  ================================================================ */
  async function loadAdminData() {
    if (!window.lmsSupabase) return;

    try {
      const { data: { user }, error: authErr } = await window.lmsSupabase.auth.getUser();
      if (authErr || !user) return;

      const { data: profile } = await window.lmsSupabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) return;
      currentProfile = profile;
      currentRole    = profile.role; // "trainer" or "admin"

      populateUI(profile);

      await Promise.all([
        loadKPIs(),
        loadActivityFeed(),
        loadPendingActions(),
        loadAtRiskStudents(),
        loadNotifications(),
      ]);

      setupRealtimeNotifications(user.id);

    } catch (err) {
      console.error("Admin dashboard load error:", err);
    }
  }

  /* ── Populate header/sidebar with profile ────────────────────── */
  function populateUI(profile) {
    const name = profile.full_name || "—";
    const role = profile.role;

    // Apply trainer class to body to hide admin-only items
    if (role === "trainer") document.body.classList.add("is-trainer");

    // Names
    [$("sidebarName"), $("topbarName"), $("welcomeName")]
      .forEach((el) => { if (el) el.textContent = name; });

    // Role badge
    const badge = $("sidebarRoleBadge");
    if (badge) {
      badge.textContent = role === "admin" ? "Admin" : "Trainer";
      if (role === "trainer") badge.classList.add("ad-role-badge--trainer");
    }

    // data-lms-role on body (for guard.js)
    document.body.setAttribute("data-lms-role", role);

    // Welcome sub-line
    const sub = $("welcomeRoleSub");
    if (sub) sub.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} · Redline Academy`;

    // Avatar
    if (profile.avatar_url) {
      document.querySelectorAll(".ad-avatar").forEach((el) => {
        el.innerHTML = `<img src="${escHtml(profile.avatar_url)}" alt="${escHtml(name)}" />`;
      });
    }
  }

  /* ── Welcome date ─────────────────────────────────────────────── */
  function setWelcomeDate() {
    const el = $("welcomeDate");
    if (!el) return;
    const now = new Date();
    el.innerHTML = `
      <span>${now.toLocaleDateString("en-AU", { weekday: "long" })}</span><br>
      <span>${now.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</span>`;
  }

  /* ================================================================
     KPI CARDS
  ================================================================ */
  async function loadKPIs() {
    try {
      const view = currentRole === "admin" ? "v_trainer_dashboard" : "v_trainer_dashboard";
      const { data } = await window.lmsSupabase
        .from(view)
        .select("*")
        .eq("trainer_id", currentProfile.id)
        .single();

      if (data) {
        if ($("kpiTotalStudents"))   $("kpiTotalStudents").textContent   = data.total_students    || 0;
        if ($("kpiActiveCourses"))   $("kpiActiveCourses").textContent   = data.courses_created   || 0;
        if ($("kpiPendingGrading"))  $("kpiPendingGrading").textContent  = data.pending_grading   || 0;
        if ($("kpiCompletionRate"))  $("kpiCompletionRate").textContent  = (data.avg_completion_percent || 0) + "%";

        // Update grading badge in nav
        const gb = $("gradingBadge");
        const count = data.pending_grading || 0;
        if (gb) { gb.textContent = count; gb.style.display = count > 0 ? "inline-block" : "none"; }
      }
    } catch (err) {
      console.warn("KPI load error:", err.message);
      ["kpiTotalStudents","kpiActiveCourses","kpiPendingGrading"].forEach((id) => {
        if ($(id)) $(id).textContent = "0";
      });
      if ($("kpiCompletionRate")) $("kpiCompletionRate").textContent = "0%";
    }
  }

  /* ================================================================
     ACTIVITY FEED
  ================================================================ */
  async function loadActivityFeed() {
    const list  = $("adActivityList");
    const empty = $("adActivityEmpty");
    if (!list) return;

    try {
      // Get activities from students enrolled in trainer's courses
      const { data: courseIds } = await window.lmsSupabase
        .from("courses")
        .select("id")
        .eq("trainer_id", currentProfile.id);

      const ids = (courseIds || []).map((c) => c.id);
      if (ids.length === 0) throw new Error("No courses");

      const { data: enrollments } = await window.lmsSupabase
        .from("enrollments")
        .select("student_id")
        .in("course_id", ids);

      const studentIds = [...new Set((enrollments || []).map((e) => e.student_id))];
      if (studentIds.length === 0) throw new Error("No students");

      const { data: logs } = await window.lmsSupabase
        .from("activity_logs")
        .select("user_id, action, metadata, created_at, profiles(full_name)")
        .in("user_id", studentIds)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!logs || logs.length === 0) throw new Error("No activity");

      if (empty) empty.style.display = "none";
      list.querySelectorAll(".ad-activity-item").forEach((el) => el.remove());

      logs.forEach((log) => {
        const name     = log.profiles?.full_name || "A student";
        const { icon, cls, text } = formatAdminActivity(log, name);
        const li = document.createElement("li");
        li.className = "ad-activity-item";
        li.innerHTML = `
          <div class="ad-activity-item__icon ${cls}">${icon}</div>
          <div class="ad-activity-item__body">
            <p class="ad-activity-item__text">${text}</p>
            <p class="ad-activity-item__time">${timeAgo(log.created_at)}</p>
          </div>`;
        list.insertBefore(li, empty);
      });

    } catch { if (empty) empty.style.display = "flex"; }
  }

  function formatAdminActivity(log, name) {
    const meta = log.metadata || {};
    switch (log.action) {
      case "assignment_submitted":
        return { icon: "📤", cls: "ad-activity-item__icon--submit",
          text: `<strong>${escHtml(name)}</strong> submitted <em>${escHtml(meta.assignment_title || "an assignment")}</em>` };
      case "course_enrolled":
        return { icon: "🎓", cls: "ad-activity-item__icon--enroll",
          text: `<strong>${escHtml(name)}</strong> enrolled in <em>${escHtml(meta.course_title || "a course")}</em>` };
      case "quiz_submitted":
        return { icon: "📝", cls: "ad-activity-item__icon--submit",
          text: `<strong>${escHtml(name)}</strong> submitted quiz: <em>${escHtml(meta.quiz_title || "Quiz")}</em>` };
      case "lesson_completed":
        return { icon: "✅", cls: "ad-activity-item__icon--grade",
          text: `<strong>${escHtml(name)}</strong> completed <em>${escHtml(meta.lesson_title || "a lesson")}</em>` };
      case "certificate_issued":
        return { icon: "🏆", cls: "ad-activity-item__icon--cert",
          text: `<strong>${escHtml(name)}</strong> earned a certificate` };
      default:
        return { icon: "📌", cls: "ad-activity-item__icon--enroll",
          text: `<strong>${escHtml(name)}</strong> — ${escHtml(log.action.replace(/_/g, " "))}` };
    }
  }

  /* ================================================================
     PENDING ACTIONS
  ================================================================ */
  async function loadPendingActions() {
    const list  = $("pendingList");
    const count = $("pendingActionCount");
    const empty = $("pendingEmpty");
    if (!list) return;

    const actions = [];

    try {
      // Pending grading
      const { data: subs } = await window.lmsSupabase
        .from("assignment_submissions")
        .select("id, student_id, assignment_id, submitted_at, assignments(title)")
        .eq("status", "submitted")
        .eq("assignments.trainer_id", currentProfile.id)
        .limit(5);

      (subs || []).forEach((s) => {
        actions.push({
          icon: "📝",
          text: `Grade: ${s.assignments?.title || "Assignment"}`,
          meta: timeAgo(s.submitted_at),
          section: "grading",
        });
      });

      // Unanswered forum posts > 24h
      const { data: posts } = await window.lmsSupabase
        .from("forum_posts")
        .select("id, title, created_at, courses(trainer_id)")
        .eq("is_resolved", false)
        .eq("courses.trainer_id", currentProfile.id)
        .lt("created_at", new Date(Date.now() - 86400000).toISOString())
        .limit(3);

      (posts || []).forEach((p) => {
        actions.push({
          icon: "💬",
          text: `Unanswered: "${p.title}"`,
          meta: timeAgo(p.created_at),
          section: "messages",
        });
      });

    } catch {}

    if (count) count.textContent = actions.length;

    if (actions.length === 0) { if (empty) empty.style.display = "block"; return; }
    if (empty) empty.style.display = "none";
    list.querySelectorAll(".ad-pending-item").forEach((el) => el.remove());

    actions.forEach((a) => {
      const li = document.createElement("li");
      li.className = "ad-pending-item";
      li.innerHTML = `
        <span style="font-size:1.1rem">${a.icon}</span>
        <div class="ad-pending-item__body">
          <p class="ad-pending-item__text">${escHtml(a.text)}</p>
          <p class="ad-pending-item__meta">${a.meta}</p>
        </div>
        <button class="ad-btn ad-btn--outline ad-btn--sm" data-section="${a.section}">View</button>`;

      li.querySelector("button").addEventListener("click", () => {
        if (window._adActivateSection) window._adActivateSection(a.section);
      });

      list.insertBefore(li, empty);
    });
  }

  /* ================================================================
     AT-RISK STUDENTS
  ================================================================ */
  async function loadAtRiskStudents() {
    const tbody = $("atRiskTableBody");
    const empty = $("atRiskEmpty");
    if (!tbody) return;

    try {
      const { data } = await window.lmsSupabase
        .from("v_students_at_risk")
        .select("*")
        .order("inactive_duration", { ascending: false })
        .limit(5);

      if (!data || data.length === 0) throw new Error("No at-risk");

      if (empty) empty.style.display = "none";

      // Update nav badge
      const badge = $("atRiskBadge");
      if (badge) { badge.textContent = data.length; badge.style.display = "inline-block"; }

      tbody.querySelectorAll("tr.ad-risk-row").forEach((r) => r.remove());

      data.forEach((s) => {
        const pct = Math.round(s.completion_percent || 0);
        const tr = document.createElement("tr");
        tr.className = "ad-risk-row";
        tr.innerHTML = `
          <td>
            <div class="ad-table-user">
              <div class="ad-avatar ad-avatar--sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </div>
              <div>
                <p class="ad-table-user__name">${escHtml(s.full_name)}</p>
                <p class="ad-table-user__email">${escHtml(s.email)}</p>
              </div>
            </div>
          </td>
          <td>${escHtml(s.course_title)}</td>
          <td>
            <div class="ad-mini-progress">
              <div class="ad-mini-progress__bar">
                <div class="ad-mini-progress__fill" style="width:${pct}%"></div>
              </div>
              <span class="ad-mini-progress__pct">${pct}%</span>
            </div>
          </td>
          <td><span class="ad-tag ad-tag--orange">${s.last_accessed_at ? timeAgo(s.last_accessed_at) : "-"}</span></td>
          <td>
            <button class="ad-btn ad-btn--outline ad-btn--sm" data-student-id="${s.student_id}" data-i18n="adMsgToStudent">Message</button>
          </td>`;
        tbody.appendChild(tr);
      });

    } catch { if (empty) empty.style.display = "table-row"; }
  }

  /* ================================================================
     STUDENTS TABLE
  ================================================================ */
  async function loadStudentsTable() {
    const tbody = $("studentTableBody");
    const empty = $("studentTableEmpty");
    if (!tbody) return;

    try {
      let enrollments = [];

      if (currentRole === "admin") {
        const { data, error } = await window.lmsSupabase
          .from("enrollments")
          .select(`
            id, status, enrolled_at,
            profiles ( id, full_name, email, avatar_url ),
            courses   ( id, title, enrollment_type, price ),
            course_progress ( completion_percent, last_accessed_at )
          `)
          .order("enrolled_at", { ascending: false });
        if (error) throw error;
        enrollments = data || [];
      } else {
        if (!currentProfile?.id) throw new Error("Missing trainer profile");

        const { data: courses, error: courseErr } = await window.lmsSupabase
          .from("courses")
          .select("id")
          .eq("trainer_id", currentProfile.id);

        if (courseErr) throw courseErr;

        const courseIds = (courses || []).map((c) => c.id).filter(Boolean);
        if (courseIds.length === 0) throw new Error("No courses");

        const { data, error: enrollErr } = await window.lmsSupabase
          .from("enrollments")
          .select(`
            id, status, enrolled_at,
            profiles ( id, full_name, email, avatar_url ),
            courses   ( id, title, enrollment_type, price ),
            course_progress ( completion_percent, last_accessed_at )
          `)
          .in("course_id", courseIds)
          .order("enrolled_at", { ascending: false });

        if (enrollErr) throw enrollErr;
        enrollments = data || [];
      }

      if (!enrollments || enrollments.length === 0) throw new Error("No enrollments");

      let paymentMap = new Map();
      if (currentRole === "admin") {
        const studentIds = [...new Set(enrollments.map((en) => en.profiles?.id).filter(Boolean))];
        const courseIds = [...new Set(enrollments.map((en) => en.courses?.id).filter(Boolean))];
        if (studentIds.length && courseIds.length) {
          const { data: payments } = await window.lmsSupabase
            .from("payments")
            .select("student_id, course_id, status, payment_plan, installment_paid, installment_total")
            .in("student_id", studentIds)
            .in("course_id", courseIds)
            .order("created_at", { ascending: false });
          (payments || []).forEach((p) => {
            const key = `${p.student_id}:${p.course_id}`;
            if (!paymentMap.has(key)) paymentMap.set(key, p);
          });
        }
      }

      if (empty) empty.style.display = "none";
      tbody.querySelectorAll("tr:not(#studentTableEmpty)").forEach((r) => r.remove());

      const requiresPayment = (course) => {
        const price = parseFloat(course?.price || 0);
        return course?.enrollment_type === "paid" || price > 0;
      };

      enrollments.forEach((en) => {
        const p   = en.profiles;
        const c   = en.courses;
        const cp  = en.course_progress?.[0];
        const pct = Math.round(cp?.completion_percent || 0);

        const statusCompleted = tSafe("lmsStatusCompleted", "Completed");
        const statusActive = tSafe("lmsStatusActive", "Active");
        const statusPaid = tSafe("lmsStatusPaid", "Paid");
        const statusInstallment = tSafe("lmsStatusInstallment", "Installment");

        let statusTag = en.status === "completed"
          ? `<span class="ad-tag ad-tag--green">${statusCompleted}</span>`
          : en.status === "active"
          ? `<span class="ad-tag ad-tag--blue">${statusActive}</span>`
          : `<span class="ad-tag ad-tag--gray">${escHtml(en.status)}</span>`;

        if (currentRole === "admin" && p?.id && c?.id) {
          const key = `${p.id}:${c.id}`;
          const payment = paymentMap.get(key);
          if (requiresPayment(c) && !payment) return;
          if (payment?.payment_plan === "installment") {
            const paid = parseInt(payment.installment_paid || 0, 10);
            const total = parseInt(payment.installment_total || 0, 10);
            const isLunas = total > 0 && paid >= total;
            const label = isLunas
              ? `${statusPaid} (${paid}/${total})`
              : `${statusInstallment} ${paid}/${total}`;
            statusTag = `<span class="ad-tag ${isLunas ? "ad-tag--green" : "ad-tag--orange"}">${label}</span>`;
          } else if (payment?.status === "completed") {
            statusTag = `<span class="ad-tag ad-tag--green">${statusPaid}</span>`;
          } else if (requiresPayment(c)) {
            return;
          }
        }

        const tr = document.createElement("tr");
        tr.className = "ad-student-row";
        tr.innerHTML = `
          <td>
            <div class="ad-table-user">
              <div class="ad-avatar ad-avatar--sm">
                ${p?.avatar_url
                  ? `<img src="${escHtml(p.avatar_url)}" alt="" />`
                  : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`
                }
              </div>
              <div>
                <p class="ad-table-user__name">${escHtml(p?.full_name || "-")}</p>
              </div>
            </div>
          </td>
          <td><code style="font-size:.75rem;color:var(--sd-text-muted)">${(p?.id || "").substring(0,8).toUpperCase()}</code></td>
          <td>${escHtml(c?.title || "-")}</td>
          <td>
            <div class="ad-mini-progress">
              <div class="ad-mini-progress__bar">
                <div class="ad-mini-progress__fill" style="width:${pct}%"></div>
              </div>
              <span class="ad-mini-progress__pct">${pct}%</span>
            </div>
          </td>
          <td>${cp?.last_accessed_at ? timeAgo(cp.last_accessed_at) : "-"}</td>
          <td>${statusTag}</td>
          <td>
            <button class="ad-btn ad-btn--outline ad-btn--sm" data-student-id="${p?.id}">Message</button>
          </td>`;
        tbody.appendChild(tr);
      });

    } catch {
      if (empty) {
        empty.style.display = "table-row";
        const cell = empty.querySelector("td");
        if (cell) {
          const key = currentRole === "admin" ? "lmsNoStudents" : "adNoEnrollmentsForTrainer";
          cell.setAttribute("data-i18n", key);
          cell.textContent = typeof t === "function" ? t(key) : "No students found";
        }
      }
    }
  }
  /* ================================================================
     COURSE LIST
  ================================================================ */
  async function loadCoursesList() {
    const list = $("adminCourseList");
    if (!list) return;

    try {
      const { data: courses } = await window.lmsSupabase
        .from("courses")
        .select("id, title, status, category_id, thumbnail_url, created_at, categories(name)")
        .eq("trainer_id", currentProfile.id)
        .order("created_at", { ascending: false });

      // Remove skeletons
      list.querySelectorAll(".ad-skeleton-row").forEach((el) => el.remove());

      if (!courses || courses.length === 0) {
        list.innerHTML = `<div class="ad-empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg><p>No courses yet. Create your first course!</p></div>`;
        return;
      }

      courses.forEach((course) => {
        const statusTag = {
          published: `<span class="ad-tag ad-tag--green">Published</span>`,
          draft:     `<span class="ad-tag ad-tag--orange">Draft</span>`,
          archived:  `<span class="ad-tag ad-tag--gray">Archived</span>`,
        }[course.status] || `<span class="ad-tag">${course.status}</span>`;

        const row = document.createElement("div");
        row.className = "ad-course-row";
        row.dataset.courseId = course.id;
        row.innerHTML = `
          <div class="ad-course-row__thumb">
            ${course.thumbnail_url
              ? `<img src="${escHtml(course.thumbnail_url)}" alt="${escHtml(course.title)}" style="width:100%;height:100%;object-fit:cover;border-radius:6px" />`
              : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`
            }
          </div>
          <div class="ad-course-row__body">
            <p class="ad-course-row__title">${escHtml(course.title)}</p>
            <p class="ad-course-row__meta">${escHtml(course.categories?.name || "—")} · Created ${formatDT(course.created_at)}</p>
          </div>
          ${statusTag}
          <div class="ad-course-row__actions">
            <button class="ad-btn ad-btn--outline ad-btn--sm" data-action="edit" data-i18n="adEditCourse">Edit</button>
            <button class="ad-icon-btn ad-icon-btn--danger" data-action="delete" aria-label="Delete course">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>`;
        list.appendChild(row);
      });

    } catch (err) {
      console.warn("Courses load error:", err.message);
    }
  }

  /* ================================================================
     COURSE BUILDER
  ================================================================ */
  function setupCourseBuilder() {
    const createBtn    = $("createCourseBtn");
    const panel        = $("courseBuilderPanel");
    const closeBtn     = $("closeCourseBuilder");
    const saveDraftBtn = $("saveDraftBtn");
    const saveBtn      = $("saveCourseBtn");

    createBtn  && createBtn.addEventListener("click",  () => { panel.hidden = false; panel.scrollIntoView({ behavior: "smooth" }); });
    closeBtn   && closeBtn.addEventListener("click",   () => { panel.hidden = true; });
    saveDraftBtn && saveDraftBtn.addEventListener("click", () => saveCourse("draft"));
    saveBtn    && saveBtn.addEventListener("click",    () => saveCourse("published"));

    // Add module button
    const addModuleBtn = $("addModuleBtn");
    addModuleBtn && addModuleBtn.addEventListener("click", addModule);

    // Delete course via event delegation
    const list = $("adminCourseList");
    list && list.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest("[data-action='delete']");
      const editBtn   = e.target.closest("[data-action='edit']");
      const row       = e.target.closest(".ad-course-row");
      if (!row) return;
      if (deleteBtn) confirmDeleteCourse(row.dataset.courseId, row);
      if (editBtn)   openEditCourse(row.dataset.courseId);
    });
  }

  function addModule() {
    const modulesList = $("builderModulesList");
    if (!modulesList) return;
    const template = $("moduleTemplate");
    const clone    = template.cloneNode(true);
    clone.id       = "module-" + Date.now();

    // Remove lesson button
    clone.querySelector(".ad-icon-btn--danger").addEventListener("click", () => clone.remove());

    // Add lesson to module
    clone.querySelector(".ad-add-lesson-btn").addEventListener("click", () => {
      const li = document.createElement("li");
      li.className = "ad-lesson-item";
      li.innerHTML = `
        <select class="ad-input ad-select ad-select--xs">
          <option value="video">📹 Video</option>
          <option value="pdf">📄 PDF</option>
          <option value="text">📝 Text</option>
          <option value="quiz">❓ Quiz</option>
          <option value="assignment">📋 Assignment</option>
        </select>
        <input class="ad-input ad-input--grow" type="text" placeholder="Lesson title..." />
        <button class="ad-icon-btn ad-icon-btn--danger" aria-label="Remove lesson">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>`;
      li.querySelector(".ad-icon-btn--danger").addEventListener("click", () => li.remove());
      clone.querySelector(".ad-lessons-list").appendChild(li);
    });

    modulesList.appendChild(clone);
  }

  async function saveCourse(status) {
    const msg = $("builderMsg");
    const btn = status === "draft" ? $("saveDraftBtn") : $("saveCourseBtn");

    const title    = $("cbTitle")?.value.trim();
    const category = $("cbCategory")?.value;
    const desc     = $("cbDesc")?.value.trim();

    if (!title) {
      if (msg) { msg.textContent = "Course title is required"; msg.style.color = "var(--sd-red)"; }
      return;
    }

    if (btn) btn.disabled = true;

    try {
      const payload = {
        trainer_id:       currentProfile.id,
        title,
        slug:             title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
        description:      desc,
        category_id:      category || null,
        level:            $("cbLevel")?.value || "beginner",
        duration_hours:   parseFloat($("cbDuration")?.value) || null,
        pass_mark:        parseInt($("cbPassMark")?.value) || 70,
        enrollment_type:  $("cbEnrollType")?.value || "open",
        max_students:     parseInt($("cbMaxStudents")?.value) || null,
        price:            parseFloat($("cbPrice")?.value) || 0,
        is_featured:      $("cbIsFeatured")?.value === "true",
        status,
      };

      const { error } = await window.lmsSupabase.from("courses").insert(payload);
      if (error) throw error;

      if (msg) { msg.textContent = "✓ Course saved!"; msg.style.color = "var(--sd-green)"; }

      setTimeout(() => { $("courseBuilderPanel").hidden = true; loadSectionData("courses"); loadedSections.delete("courses"); loadCoursesList(); }, 1200);

    } catch (err) {
      if (msg) { msg.textContent = "Error: " + (err.message || "Save failed"); msg.style.color = "var(--sd-red)"; }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function confirmDeleteCourse(courseId, row) {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    try {
      const { error } = await window.lmsSupabase.from("courses").delete().eq("id", courseId);
      if (error) throw error;
      row.remove();
    } catch (err) { alert("Delete failed: " + err.message); }
  }

  function openEditCourse(courseId) {
    $("courseBuilderPanel").hidden = false;
    $("builderTitle").textContent  = "Edit Course";
    // In a real implementation: fetch course by ID and populate the form fields
    console.log("Edit course:", courseId);
  }

  /* ================================================================
     BUILDER TABS
  ================================================================ */
  function setupBuilderTabs() {
    document.querySelectorAll(".ad-builder-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".ad-builder-tab").forEach((t) => { t.classList.remove("active"); t.removeAttribute("aria-selected"); });
        document.querySelectorAll(".ad-builder-tab-content").forEach((c) => c.classList.remove("active"));

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        const content = $("builderTab-" + tab.dataset.tab);
        if (content) content.classList.add("active");
      });
    });
  }

  /* ================================================================
     GRADING
  ================================================================ */
  async function loadSubmissionQueue(filter = "submitted") {
    const queue = $("submissionQueue");
    const empty = $("submissionEmpty");
    if (!queue) return;

    queue.querySelectorAll(".ad-submission-item").forEach((el) => el.remove());

    try {
      let query = window.lmsSupabase
        .from("assignment_submissions")
        .select(`
          id, status, submitted_at, grade,
          profiles ( id, full_name ),
          assignments ( title, trainer_id, pass_mark )
        `)
        .eq("assignments.trainer_id", currentProfile.id)
        .order("submitted_at", { ascending: false })
        .limit(20);

      if (filter !== "all") query = query.eq("status", filter);

      const { data } = await query;

      if (!data || data.length === 0) { if (empty) empty.style.display = "flex"; return; }
      if (empty) empty.style.display = "none";

      data.forEach((sub) => {
        const item = document.createElement("div");
        item.className = "ad-submission-item";
        item.dataset.id = sub.id;

        const statusTag = {
          submitted:    `<span class="ad-tag ad-tag--orange">Submitted</span>`,
          graded:       `<span class="ad-tag ad-tag--green">Graded</span>`,
          under_review: `<span class="ad-tag ad-tag--blue">In Review</span>`,
          resubmit_required: `<span class="ad-tag ad-tag--red">Resubmit</span>`,
        }[sub.status] || "";

        item.innerHTML = `
          <div>
            <p class="ad-submission-item__student">${escHtml(sub.profiles?.full_name || "—")}</p>
            <p class="ad-submission-item__assignment">${escHtml(sub.assignments?.title || "—")}</p>
            <p class="ad-submission-item__time">${timeAgo(sub.submitted_at)} ${statusTag}</p>
          </div>`;

        item.addEventListener("click", () => openGradingForm(sub));
        queue.insertBefore(item, empty);
      });

    } catch (err) { console.warn("Submission queue error:", err.message); }
  }

  function openGradingForm(sub) {
    const panel = $("gradingPanel");
    const empty = $("gradingPanelEmpty");
    const form  = $("gradingForm");

    if (!panel || !form) return;

    selectedSubmissionId = sub.id;
    document.querySelectorAll(".ad-submission-item").forEach((el) => {
      el.classList.toggle("active", el.dataset.id === sub.id);
    });

    if (empty) empty.style.display = "none";
    form.hidden = false;

    if ($("gradeStudentName"))    $("gradeStudentName").textContent    = sub.profiles?.full_name || "—";
    if ($("gradeAssignmentTitle")) $("gradeAssignmentTitle").textContent = sub.assignments?.title || "—";
    if ($("gradeCurrentStatus"))  $("gradeCurrentStatus").textContent   = sub.status;
    if ($("gradeStudentNotes"))   $("gradeStudentNotes").textContent    = sub.notes || "(No notes)";
    if ($("gradeScore"))          $("gradeScore").value                 = sub.grade || "";

    updateGradeResult(sub.grade, sub.assignments?.pass_mark);

    // File list
    const fileList = $("gradeFileList");
    if (fileList) {
      fileList.innerHTML = (sub.file_urls || []).map((url) => {
        const name = url.split("/").pop();
        return `<a href="${escHtml(url)}" target="_blank" rel="noopener" class="ad-file-chip">
          📄 ${escHtml(name)}
        </a>`;
      }).join("") || "<span style='color:var(--sd-text-muted);font-size:.82rem'>No files</span>";
    }
  }

  function updateGradeResult(score, passMark = 70) {
    const el = $("gradeResult");
    if (!el) return;
    if (!score) { el.textContent = "—"; el.className = "ad-grade-result"; return; }
    if (parseFloat(score) >= passMark) {
      el.textContent  = "PASS ✓";
      el.className    = "ad-grade-result ad-grade-result--pass";
    } else {
      el.textContent  = "FAIL ✗";
      el.className    = "ad-grade-result ad-grade-result--fail";
    }
  }

  function setupGradingPanel() {
    // Filter tabs in grading section
    const gradingSection = $("section-grading");
    if (gradingSection) {
      gradingSection.querySelectorAll(".ad-filter-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          gradingSection.querySelectorAll(".ad-filter-tab").forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          loadSubmissionQueue(tab.dataset.filter);
        });
      });
    }

    // Live grade preview
    const scoreInput = $("gradeScore");
    scoreInput && scoreInput.addEventListener("input", () => updateGradeResult(scoreInput.value));

    // Save grade
    const saveBtn = $("saveGradeBtn");
    saveBtn && saveBtn.addEventListener("click", () => submitGrade("graded"));

    // Request resubmit
    const resubBtn = $("reqResubmitBtn");
    resubBtn && resubBtn.addEventListener("click", () => submitGrade("resubmit_required"));
  }

  async function submitGrade(newStatus) {
    const msg      = $("gradingMsg");
    const saveBtn  = $("saveGradeBtn");
    const score    = parseFloat($("gradeScore")?.value);
    const feedback = $("gradeFeedback")?.value.trim();

    if (!selectedSubmissionId) return;
    if (newStatus === "graded" && isNaN(score)) {
      if (msg) { msg.textContent = "Please enter a grade"; msg.className = "ad-grading-msg error"; }
      return;
    }

    if (saveBtn) saveBtn.disabled = true;

    try {
      const payload = { status: newStatus, graded_by: currentProfile.id, graded_at: new Date().toISOString() };
      if (newStatus === "graded") { payload.grade = score; payload.feedback = feedback; }

      const { error } = await window.lmsSupabase
        .from("assignment_submissions")
        .update(payload)
        .eq("id", selectedSubmissionId);

      if (error) throw error;

      if (msg) { msg.textContent = "✓ Saved! Student notified."; msg.className = "ad-grading-msg success"; }
      setTimeout(() => loadSubmissionQueue(), 1500);

    } catch (err) {
      if (msg) { msg.textContent = "Error: " + (err.message || "Save failed"); msg.className = "ad-grading-msg error"; }
    } finally {
      if (saveBtn) saveBtn.disabled = false;
      setTimeout(() => { if (msg) { msg.textContent = ""; msg.className = "ad-grading-msg"; } }, 4000);
    }
  }

  /* ================================================================
     SCHEDULE
  ================================================================ */
  function setupScheduleForm() {
    const createBtn = $("createEventBtn");
    const card      = $("eventFormCard");
    const cancelBtn = $("cancelEventBtn");
    const saveBtn   = $("saveEventBtn");

    createBtn && createBtn.addEventListener("click", () => { card.hidden = false; card.scrollIntoView({ behavior: "smooth" }); });
    cancelBtn && cancelBtn.addEventListener("click", () => { card.hidden = true; });
    saveBtn   && saveBtn.addEventListener("click",   saveEvent);
  }

  async function saveEvent() {
    const msg    = $("eventMsg");
    const saveBtn = $("saveEventBtn");
    const title  = $("evTitle")?.value.trim();
    const start  = $("evStart")?.value;
    const end    = $("evEnd")?.value;

    if (!title || !start || !end) {
      if (msg) { msg.textContent = "Title, start and end time are required"; msg.style.color = "var(--sd-red)"; }
      return;
    }

    if (saveBtn) saveBtn.disabled = true;

    try {
      const payload = {
        trainer_id:      currentProfile.id,
        title,
        event_type:      $("evType")?.value || "live_session",
        start_datetime:  new Date(start).toISOString(),
        end_datetime:    new Date(end).toISOString(),
        meeting_url:     $("evMeetingUrl")?.value.trim() || null,
        course_id:       $("evCourse")?.value || null,
        is_mandatory:    $("evMandatory")?.value === "true",
      };

      const { error } = await window.lmsSupabase.from("schedules").insert(payload);
      if (error) throw error;

      if (msg) { msg.textContent = "✓ Event created!"; msg.style.color = "var(--sd-green)"; }
      setTimeout(() => { $("eventFormCard").hidden = true; loadedSections.delete("schedule"); loadEventsList(); }, 1000);

    } catch (err) {
      if (msg) { msg.textContent = "Error: " + (err.message || "Save failed"); msg.style.color = "var(--sd-red)"; }
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  async function loadEventsList() {
    const list  = $("adminEventsList");
    const empty = $("eventsEmpty");
    if (!list) return;

    try {
      const { data } = await window.lmsSupabase
        .from("schedules")
        .select("id, title, event_type, start_datetime, end_datetime, meeting_url, courses(title)")
        .eq("trainer_id", currentProfile.id)
        .gte("start_datetime", new Date().toISOString())
        .order("start_datetime", { ascending: true })
        .limit(10);

      if (!data || data.length === 0) { if (empty) empty.style.display = "flex"; return; }
      if (empty) empty.style.display = "none";

      list.querySelectorAll(".ad-event-row").forEach((el) => el.remove());

      data.forEach((ev) => {
        const { day, month } = formatDateShort(ev.start_datetime);
        const typeColors = { live_session: "blue", exam: "red", webinar: "purple" };
        const row = document.createElement("div");
        row.className = "ad-event-row";
        row.innerHTML = `
          <div class="ad-event-row__date">
            <p class="ad-event-row__day">${day}</p>
            <p class="ad-event-row__month">${month}</p>
          </div>
          <div class="ad-event-row__body">
            <p class="ad-event-row__title">${escHtml(ev.title)}</p>
            <p class="ad-event-row__meta">${escHtml(ev.courses?.title || "All students")} · ${new Date(ev.start_datetime).toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"})}</p>
          </div>
          <span class="ad-tag ad-tag--${typeColors[ev.event_type] || "gray"}">${ev.event_type.replace("_", " ")}</span>
          ${ev.meeting_url ? `<a href="${escHtml(ev.meeting_url)}" target="_blank" rel="noopener" class="ad-btn ad-btn--outline ad-btn--sm">Join</a>` : ""}
          <button class="ad-icon-btn ad-icon-btn--danger" data-event-id="${ev.id}" aria-label="Delete event">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>`;

        row.querySelector(".ad-icon-btn--danger").addEventListener("click", async () => {
          if (!confirm("Delete this event?")) return;
          await window.lmsSupabase.from("schedules").delete().eq("id", ev.id).catch(() => {});
          row.remove();
        });

        list.insertBefore(row, empty);
      });
    } catch (err) { console.warn("Events load error:", err.message); }
  }

  /* ================================================================
     MESSAGES
  ================================================================ */
  async function loadMessages() {
    const inbox = $("adInboxList");
    const empty = $("adInboxEmpty");
    if (!inbox) return;

    try {
      const { data } = await window.lmsSupabase
        .from("messages")
        .select(`id, subject, body, is_read, created_at, profiles!sender_id(full_name, avatar_url)`)
        .or(`sender_id.eq.${currentProfile.id},recipient_id.eq.${currentProfile.id}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!data || data.length === 0) { if (empty) empty.style.display = "flex"; return; }
      if (empty) empty.style.display = "none";

      inbox.querySelectorAll(".ad-inbox-item").forEach((el) => el.remove());

      const unread = data.filter((m) => !m.is_read && m.profiles).length;
      const badge  = $("adMsgBadge");
      if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? "inline-block" : "none"; }

      data.forEach((msg) => {
        const item = document.createElement("div");
        item.className = `ad-inbox-item${msg.is_read ? "" : " unread"}`;
        item.innerHTML = `
          <div class="ad-avatar ad-avatar--sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
          <div class="ad-inbox-item__body">
            <p class="ad-inbox-item__name">${escHtml(msg.profiles?.full_name || "System")}</p>
            <p class="ad-inbox-item__preview">${escHtml(msg.body?.substring(0, 60) || "—")}</p>
          </div>
          <span class="ad-inbox-item__time">${timeAgo(msg.created_at)}</span>`;
        inbox.insertBefore(item, empty);
      });

    } catch (err) { console.warn("Messages load error:", err.message); }
  }

  /* ================================================================
     REPORTS
  ================================================================ */
  async function loadReports() {
    try {
      // Course overview
      const { data: overview } = await window.lmsSupabase
        .from("v_course_overview")
        .select("*")
        .eq("trainer_name", currentProfile.full_name);

      const tbody = $("courseOverviewBody");
      const empty = $("courseOverviewEmpty");

      if (overview && overview.length > 0 && tbody) {
        if (empty) empty.style.display = "none";
        overview.forEach((row) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${escHtml(row.title)}</strong></td>
            <td>${row.total_enrolled || 0}</td>
            <td>${row.total_completed || 0}</td>
            <td>
              <div class="ad-mini-progress">
                <div class="ad-mini-progress__bar">
                  <div class="ad-mini-progress__fill" style="width:${row.completion_rate_pct || 0}%"></div>
                </div>
                <span class="ad-mini-progress__pct">${row.completion_rate_pct || 0}%</span>
              </div>
            </td>
            <td>${row.certificates_issued || 0}</td>`;
          tbody.appendChild(tr);
        });
      }

      // Metrics
      const { data: certs } = await window.lmsSupabase
        .from("certificates")
        .select("id", { count: "exact" });

      if ($("metricCerts")) $("metricCerts").textContent = certs?.length || 0;

      // Revenue (admin only)
      if (currentRole === "admin") {
        const { data: payments } = await window.lmsSupabase
          .from("payments")
          .select("amount")
          .eq("status", "completed");
        const total = (payments || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        if ($("metricRevenue")) $("metricRevenue").textContent = "$" + total.toFixed(2);
      }

    } catch (err) { console.warn("Reports load error:", err.message); }
  }

  /* ================================================================
     USER MANAGEMENT (Admin only)
  ================================================================ */
  async function loadUsersTable() {
    const tbody = $("userTableBody");
    const empty = $("userTableEmpty");
    if (!tbody) return;

    try {
      const { data: users } = await window.lmsSupabase
        .from("profiles")
        .select("id, full_name, email, role, is_active, created_at, avatar_url")
        .order("created_at", { ascending: false });

      if (!users || users.length === 0) {
        usersCache = [];
        renderUsersTable([]);
        return;
      }

      usersCache = users;
      renderUsersTable(usersCache);
      bindUserTableActions();
      applyUserFilters();

    } catch {
      usersCache = [];
      if (empty) empty.style.display = "table-row";
    }
  }

  function renderUsersTable(users) {
    const tbody = $("userTableBody");
    const empty = $("userTableEmpty");
    if (!tbody) return;

    tbody.querySelectorAll("tr.ad-user-row").forEach((r) => r.remove());

    if (!users || users.length === 0) {
      if (empty) empty.style.display = "table-row";
      return;
    }

    if (empty) empty.style.display = "none";

    users.forEach((u) => {
      const roleTags = { admin: "red", trainer: "purple", student: "blue" };
      const tr = document.createElement("tr");
      tr.className = "ad-user-row";
      tr.dataset.role = u.role || "";
      tr.dataset.name = (u.full_name || "").toLowerCase();
      tr.dataset.email = (u.email || "").toLowerCase();
      tr.innerHTML = `
        <td>
          <div class="ad-table-user">
            <div class="ad-avatar ad-avatar--sm">
              ${u.avatar_url ? `<img src="${escHtml(u.avatar_url)}" alt="" />` : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`}
            </div>
            <p class="ad-table-user__name">${escHtml(u.full_name || "â€”")}</p>
          </div>
        </td>
        <td style="color:var(--sd-text-muted);font-size:.82rem">${escHtml(u.email)}</td>
        <td><span class="ad-tag ad-tag--${roleTags[u.role] || "gray"}">${u.role}</span></td>
        <td><span class="ad-tag ${u.is_active ? "ad-tag--green" : "ad-tag--gray"}">${u.is_active ? tSafe("lmsStatusActive", "Active") : tSafe("lmsStatusInactive", "Inactive")}</span></td>
        <td style="color:var(--sd-text-muted);font-size:.82rem">${formatDT(u.created_at)}</td>
        <td>
          <button class="ad-btn ad-btn--outline ad-btn--sm" data-uid="${u.id}" data-action="toggle-active">
            ${u.is_active ? "Suspend" : "Activate"}
          </button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  function bindUserTableActions() {
    const tbody = $("userTableBody");
    if (!tbody || tbody.dataset.bound === "true") return;
    tbody.dataset.bound = "true";

    // Toggle active/suspend
    tbody.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-action='toggle-active']");
      if (!btn) return;
      const uid = btn.dataset.uid;
    const isActive = btn.textContent.trim() === tSafe("lmsActionSuspend", "Suspend");
      await window.lmsSupabase.from("profiles").update({ is_active: !isActive }).eq("id", uid).catch(() => {});
    btn.textContent = isActive ? tSafe("lmsActionActivate", "Activate") : tSafe("lmsActionSuspend", "Suspend");
    });
  }

  function applyUserFilters() {
    const tbody = $("userTableBody");
    const empty = $("userTableEmpty");
    if (!tbody) return;

    const query = ($("userSearchInput")?.value || "").trim().toLowerCase();
    let visible = 0;

    tbody.querySelectorAll("tr.ad-user-row").forEach((row) => {
      const role = row.dataset.role || "";
      const name = row.dataset.name || "";
      const email = row.dataset.email || "";
      const matchesRole = activeUserRoleFilter === "all" || role === activeUserRoleFilter;
      const matchesQuery = !query || name.includes(query) || email.includes(query);
      const show = matchesRole && matchesQuery;
      row.style.display = show ? "" : "none";
      if (show) visible++;
    });

    if (empty) empty.style.display = visible ? "none" : "table-row";
  }
/* ================================================================
     ENROLLMENTS
  ================================================================ */
  async function loadEnrollmentsTable() {
    const tbody = $("enrollmentTableBody");
    const empty = $("enrollmentTableEmpty");
    if (!tbody) return;

    try {
      const { data } = await window.lmsSupabase
        .from("payments")
        .select(`
          id, amount, currency, payment_method, status, paid_at, payment_plan, installment_paid, installment_total, next_due_at,
          profiles ( full_name ),
          courses   ( title )
        `)
        .order("paid_at", { ascending: false })
        .limit(50);

      if (!data || data.length === 0) throw new Error("No payments");

      if (empty) empty.style.display = "none";
      tbody.querySelectorAll("tr.ad-enroll-row").forEach((r) => r.remove());

      let totalRevenue = 0;
      let pending = 0;

      data.forEach((p) => {
        if (p.status === "completed") totalRevenue += parseFloat(p.amount || 0);
        if (p.status === "pending")   pending++;

        const statusPaid = tSafe("lmsStatusPaid", "Paid");
        const statusPending = tSafe("lmsStatusPending", "Pending");
        const statusFailed = tSafe("lmsStatusFailed", "Failed");
        const statusRefunded = tSafe("lmsStatusRefunded", "Refunded");
        const statusInstallment = tSafe("lmsStatusInstallment", "Installment");

        let statusTag = {
          completed: `<span class="ad-tag ad-tag--green">${statusPaid}</span>`,
          pending:   `<span class="ad-tag ad-tag--orange">${statusPending}</span>`,
          failed:    `<span class="ad-tag ad-tag--red">${statusFailed}</span>`,
          refunded:  `<span class="ad-tag ad-tag--gray">${statusRefunded}</span>`,
        }[p.status] || `<span class="ad-tag">${p.status}</span>`;

        if (p.payment_plan === "installment") {
          const paid = parseInt(p.installment_paid || 0, 10);
          const total = parseInt(p.installment_total || 0, 10);
          const isLunas = total > 0 && paid >= total;
          const label = isLunas ? `${statusPaid} (${paid}/${total})` : `${statusInstallment} ${paid}/${total}`;
          statusTag = `<span class="ad-tag ${isLunas ? "ad-tag--green" : "ad-tag--orange"}">${label}</span>`;
        }

        const tr = document.createElement("tr");
        tr.className = "ad-enroll-row";
        tr.innerHTML = `
          <td>${escHtml(p.profiles?.full_name || "—")}</td>
          <td>${escHtml(p.courses?.title || "—")}</td>
          <td>${escHtml(p.payment_method || "Manual")}</td>
          <td><strong>${formatCurrency(parseFloat(p.amount || 0), p.currency || "IDR")}</strong></td>
          <td>${statusTag}</td>
          <td style="color:var(--sd-text-muted);font-size:.82rem">${p.paid_at ? formatDT(p.paid_at) : "—"}</td>
          <td><button class="ad-btn ad-btn--outline ad-btn--sm">Receipt</button></td>`;
        tbody.appendChild(tr);
      });

      if ($("payTotal"))   $("payTotal").textContent   = data.length;
      if ($("payPending")) $("payPending").textContent = pending;
      if ($("payRevenue")) $("payRevenue").textContent = formatCurrency(totalRevenue, "IDR");

    } catch { if (empty) empty.style.display = "table-row"; }
  }

  /* ================================================================
     ANNOUNCEMENTS
  ================================================================ */
  function setupAnnouncementForm() {
    const createBtn = $("createAnnouncementBtn");
    const card      = $("announcementFormCard");
    const cancelBtn = $("cancelAnnouncementBtn");
    const saveBtn   = $("saveAnnouncementBtn");

    createBtn && createBtn.addEventListener("click", () => { card.hidden = false; card.scrollIntoView({ behavior: "smooth" }); });
    cancelBtn && cancelBtn.addEventListener("click", () => { card.hidden = true; });
    saveBtn   && saveBtn.addEventListener("click",   saveAnnouncement);
  }

  function setupUserManagement() {
    const modal      = $("addUserModal");
    const form       = $("addUserForm");
    const addBtn     = $("addUserBtn");
    const cancelBtn  = $("addUserCancel");
    const submitBtn  = $("addUserSubmit");
    const msg        = $("addUserMessage");
    const search     = $("userSearchInput");
    const roleTabs   = document.querySelectorAll("#section-users .ad-filter-tab");

    const setMessage = (text, color) => {
      if (!msg) return;
      msg.textContent = text || "";
      msg.style.color = color || "var(--sd-text-secondary)";
    };

    const openModal = () => {
      if (!modal) return;
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      setMessage("");
      form && form.reset();
      $("addUserRole") && ($("addUserRole").value = "student");
      $("addUserName") && $("addUserName").focus();
    };

    const closeModal = () => {
      if (!modal) return;
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      setMessage("");
    };

    addBtn && addBtn.addEventListener("click", openModal);
    cancelBtn && cancelBtn.addEventListener("click", closeModal);
    modal && modal.querySelectorAll("[data-modal-close]").forEach((el) => el.addEventListener("click", closeModal));

    form && form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!window.lmsSupabase) return;

      const fullName = $("addUserName")?.value.trim();
      const email    = $("addUserEmail")?.value.trim();
      const role     = $("addUserRole")?.value || "student";
      const password = $("addUserPassword")?.value.trim();

      if (!fullName || !email) {
        setMessage("Full name and email are required.", "var(--sd-red)");
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      setMessage("Creating user...", "var(--sd-text-secondary)");

      try {
        const { data: sessionData, error: sessionErr } = await window.lmsSupabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (sessionErr || !accessToken) {
          throw new Error("Session expired. Please sign in again.");
        }

        const url = `${window.lmsConfig.supabaseUrl}/functions/v1/admin-create-user`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            apikey: window.lmsConfig.supabaseAnonKey
          },
          body: JSON.stringify({ full_name: fullName, email, role, password })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Request failed (${res.status})`);
        }

        const tempPassword = data?.temp_password;
        if (tempPassword) {
          setMessage(`User created. Temporary password: ${tempPassword}`, "var(--sd-green)");
        } else {
          setMessage("User created.", "var(--sd-green)");
        }

        await loadUsersTable();

      } catch (err) {
        setMessage("Error: " + (err.message || "Create failed"), "var(--sd-red)");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    let searchTimer = null;
    search && search.addEventListener("input", () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(applyUserFilters, 120);
    });

    roleTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        activeUserRoleFilter = tab.dataset.filter || "all";
        applyUserFilters();
      });
    });
  }
  function setupManualPaymentForm() {
    const modal     = $("recordPaymentModal");
    const form      = $("recordPaymentForm");
    const openBtn   = $("recordPaymentBtn");
    const cancelBtn = $("recordPaymentCancel");
    const submitBtn = $("recordPaymentSubmit");
    const msg       = $("recordPaymentMessage");
    const studentEl = $("paymentStudent");
    const courseEl  = $("paymentCourse");
    const amountEl  = $("paymentAmount");
    const currencyEl = $("paymentCurrency");
    const methodEl  = $("paymentMethod");
    const statusEl  = $("paymentStatus");
    const planEl    = $("paymentPlan");
    const nextDueEl = $("paymentNextDue");
    const nextDueField = $("paymentNextDueField");
    const installmentField = $("paymentInstallmentField");
    const installmentPaidEl = $("paymentInstallmentPaid");
    const installmentTotalEl = $("paymentInstallmentTotal");

    let coursesCache = [];

    const getText = (key, fallback) => (typeof t === "function" ? t(key) : fallback);
    const setMessage = (text, color) => {
      if (!msg) return;
      msg.textContent = text || "";
      msg.style.color = color || "var(--sd-text-secondary)";
    };

    const closeModal = () => {
      if (!modal) return;
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      setMessage("");
    };

    const openModal = async () => {
      if (!modal) return;
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      setMessage("");
      form && form.reset();
      if (currencyEl) currencyEl.value = "IDR";
      if (statusEl) statusEl.value = "completed";
      if (methodEl) methodEl.value = "Manual Transfer";
      if (planEl) planEl.value = "full";
      if (nextDueEl) nextDueEl.value = "";
      if (nextDueField) nextDueField.hidden = true;
      if (installmentField) installmentField.hidden = true;
      if (installmentPaidEl) installmentPaidEl.value = "";
      if (installmentTotalEl) installmentTotalEl.value = "";
      if (planEl && nextDueField) {
        const isInstallment = planEl.value === "installment";
        nextDueField.hidden = !isInstallment;
      }

      if (!window.lmsSupabase) return;

      try {
        const { data: students, error: studentErr } = await window.lmsSupabase
          .from("profiles")
          .select("id, full_name, email, student_id")
          .eq("role", "student")
          .order("full_name", { ascending: true });

        if (studentErr) throw studentErr;

        if (studentEl) {
          studentEl.innerHTML = "";
          const placeholder = document.createElement("option");
          placeholder.value = "";
          placeholder.disabled = true;
          placeholder.selected = true;
          placeholder.textContent = getText("adPaymentSelectStudent", "Select student");
          studentEl.appendChild(placeholder);

          if (!students || students.length === 0) {
            const emptyOpt = document.createElement("option");
            emptyOpt.value = "";
            emptyOpt.disabled = true;
            emptyOpt.textContent = getText("adPaymentNoStudents", "No students found");
            studentEl.appendChild(emptyOpt);
          } else {
            (students || []).forEach((s) => {
              const label = `${s.full_name || "Student"} (${s.email || s.student_id || ""})`;
              const opt = document.createElement("option");
              opt.value = s.id;
              opt.textContent = label.trim();
              studentEl.appendChild(opt);
            });
          }
        }

        const { data: courses, error: courseErr } = await window.lmsSupabase
          .from("courses")
          .select("id, title, price")
          .order("title", { ascending: true });

        if (courseErr) throw courseErr;

        coursesCache = courses || [];
        if (courseEl) {
          courseEl.innerHTML = "";
          const placeholder = document.createElement("option");
          placeholder.value = "";
          placeholder.disabled = true;
          placeholder.selected = true;
          placeholder.textContent = getText("adPaymentSelectCourse", "Select course");
          courseEl.appendChild(placeholder);

          if (!coursesCache.length) {
            const emptyOpt = document.createElement("option");
            emptyOpt.value = "";
            emptyOpt.disabled = true;
            emptyOpt.textContent = getText("adPaymentNoCourses", "No courses found");
            courseEl.appendChild(emptyOpt);
          } else {
            coursesCache.forEach((c) => {
              const opt = document.createElement("option");
              opt.value = c.id;
              opt.textContent = c.title || "Course";
              courseEl.appendChild(opt);
            });
          }
        }

        if (courseEl && amountEl && coursesCache.length) {
          const match = coursesCache.find((c) => c.id === courseEl.value);
          if (match && !amountEl.value) amountEl.value = match.price || 0;
        }
        if (!coursesCache.length) {
          setMessage(getText("adPaymentNoCourses", "No courses found"), "var(--sd-text-secondary)");
        }
      } catch (err) {
        setMessage("Error loading data: " + (err.message || "Failed"), "var(--sd-red)");
      }
    };

    openBtn && openBtn.addEventListener("click", openModal);
    cancelBtn && cancelBtn.addEventListener("click", closeModal);
    modal && modal.querySelectorAll("[data-modal-close]").forEach((el) => el.addEventListener("click", closeModal));

    courseEl && courseEl.addEventListener("change", () => {
      if (!amountEl) return;
      const match = coursesCache.find((c) => c.id === courseEl.value);
      if (match) amountEl.value = match.price || 0;
    });

    const toggleInstallmentFields = () => {
      if (!planEl) return;
      const isInstallment = planEl.value === "installment";
      if (nextDueField) nextDueField.hidden = !isInstallment;
      if (installmentField) installmentField.hidden = !isInstallment;
      if (!isInstallment) {
        if (nextDueEl) nextDueEl.value = "";
        if (installmentPaidEl) installmentPaidEl.value = "";
        if (installmentTotalEl) installmentTotalEl.value = "";
      } else {
        if (installmentTotalEl && !installmentTotalEl.value) installmentTotalEl.value = "2";
        if (installmentPaidEl && !installmentPaidEl.value) installmentPaidEl.value = "1";
      }
    };

    planEl && planEl.addEventListener("change", toggleInstallmentFields);

    form && form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!window.lmsSupabase) return;

      const studentId = studentEl?.value;
      const courseId  = courseEl?.value;
      const amount    = parseFloat(amountEl?.value || 0);
      const currency  = currencyEl?.value || "IDR";
      const method    = methodEl?.value || "Manual Transfer";
      const status    = statusEl?.value || "completed";
      const plan      = planEl?.value || "full";
      const nextDueRaw = nextDueEl?.value || "";
      const installmentTotalRaw = installmentTotalEl?.value || "";
      const installmentPaidRaw = installmentPaidEl?.value || "";

      if (!studentId || !courseId || !amount) {
        setMessage("Student, course, and amount are required.", "var(--sd-red)");
        return;
      }
      if (plan === "installment") {
        const totalInt = parseInt(installmentTotalRaw || "0", 10);
        const paidInt = parseInt(installmentPaidRaw || "0", 10);
        if (!(totalInt >= 2 && totalInt <= 4)) {
          setMessage("Total installments must be between 2 and 4.", "var(--sd-red)");
          return;
        }
        if (!(paidInt >= 1 && paidInt <= totalInt)) {
          setMessage("Installment number must be between 1 and total.", "var(--sd-red)");
          return;
        }
        if (paidInt < totalInt && !nextDueRaw) {
          setMessage("Next due date is required for installments.", "var(--sd-red)");
          return;
        }
      } else if (!amount) {
        setMessage("Next due date is required for installments.", "var(--sd-red)");
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      setMessage("Saving payment...", "var(--sd-text-secondary)");

      try {
        const totalInt = plan === "installment" ? parseInt(installmentTotalRaw || "0", 10) : 1;
        const paidInt = plan === "installment" ? parseInt(installmentPaidRaw || "0", 10) : (status === "completed" ? 1 : 0);
        const computedStatus = plan === "installment"
          ? (paidInt >= totalInt ? "completed" : "pending")
          : status;
        const paidAt = computedStatus === "completed" ? new Date().toISOString() : null;
        const nextDueAt = plan === "installment" && nextDueRaw ? new Date(nextDueRaw).toISOString() : null;

        const { data: existingPay, error: payFindErr } = await window.lmsSupabase
          .from("payments")
          .select("id")
          .eq("student_id", studentId)
          .eq("course_id", courseId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (payFindErr) throw payFindErr;

        if (existingPay?.id) {
          const { error: payUpdErr } = await window.lmsSupabase
            .from("payments")
            .update({
              amount,
              currency,
              payment_method: method,
              status: computedStatus,
              paid_at: paidAt,
              payment_plan: plan,
              next_due_at: nextDueAt,
              installment_total: totalInt,
              installment_paid: paidInt
            })
            .eq("id", existingPay.id);
          if (payUpdErr) throw payUpdErr;
        } else {
          const { error: payErr } = await window.lmsSupabase
            .from("payments")
            .insert({
              student_id: studentId,
              course_id: courseId,
              amount,
              currency,
              payment_method: method,
              status: computedStatus,
              paid_at: paidAt,
              payment_plan: plan,
              next_due_at: nextDueAt,
              installment_total: totalInt,
              installment_paid: paidInt
            });
          if (payErr) throw payErr;
        }

        if (computedStatus === "completed") {
          const { data: existing, error: enrollFindErr } = await window.lmsSupabase
            .from("enrollments")
            .select("id")
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .maybeSingle();
          if (enrollFindErr) throw enrollFindErr;

          let enrollmentId = existing?.id || null;
          if (!enrollmentId) {
            const { data: inserted, error: enrollErr } = await window.lmsSupabase
              .from("enrollments")
              .insert({ student_id: studentId, course_id: courseId, status: "active", enrolled_at: new Date().toISOString() })
              .select("id")
              .single();
            if (enrollErr) throw enrollErr;
            enrollmentId = inserted?.id;
          } else {
            const { error: enrollUpdateErr } = await window.lmsSupabase
              .from("enrollments")
              .update({ status: "active" })
              .eq("id", enrollmentId);
            if (enrollUpdateErr) console.warn("enrollment update error:", enrollUpdateErr.message);
          }

          if (enrollmentId) {
            const { data: prog, error: progErr } = await window.lmsSupabase
              .from("course_progress")
              .select("id")
              .eq("student_id", studentId)
              .eq("course_id", courseId)
              .maybeSingle();
            if (progErr) throw progErr;

            if (!prog) {
              const { error: progressInsertErr } = await window.lmsSupabase
                .from("course_progress")
                .insert({ enrollment_id: enrollmentId, student_id: studentId, course_id: courseId, completion_percent: 0 });
              if (progressInsertErr) console.warn("course_progress insert error:", progressInsertErr.message);
            }
          }
        }

        setMessage("Payment saved.", "var(--sd-green)");
        await loadEnrollmentsTable();
        await loadStudentsTable();
        setTimeout(closeModal, 800);

      } catch (err) {
        setMessage("Error: " + (err.message || "Save failed"), "var(--sd-red)");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
  async function saveAnnouncement() {
    const msg     = $("annMsg");
    const saveBtn = $("saveAnnouncementBtn");
    const title   = $("anTitle")?.value.trim();
    const body    = $("anBody")?.value.trim();

    if (!title || !body) {
      if (msg) { msg.textContent = "Title and content are required"; msg.style.color = "var(--sd-red)"; }
      return;
    }

    if (saveBtn) saveBtn.disabled = true;

    try {
      const publishAt = $("anPublishAt")?.value ? new Date($("anPublishAt").value).toISOString() : new Date().toISOString();
      const payload = {
        author_id:   currentProfile.id,
        title,
        body,
        target_role: $("anTarget")?.value || "all",
        course_id:   $("anCourse")?.value || null,
        is_published: true,
        publish_at:   publishAt,
        expires_at:   $("anExpiresAt")?.value ? new Date($("anExpiresAt").value).toISOString() : null,
      };

      const { error } = await window.lmsSupabase.from("announcements").insert(payload);
      if (error) throw error;

      if (msg) { msg.textContent = "✓ Announcement published!"; msg.style.color = "var(--sd-green)"; }
      setTimeout(() => { $("announcementFormCard").hidden = true; loadedSections.delete("announcements"); loadAnnouncements(); }, 1000);

    } catch (err) {
      if (msg) { msg.textContent = "Error: " + (err.message || "Save failed"); msg.style.color = "var(--sd-red)"; }
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  async function loadAnnouncements() {
    const list  = $("announcementsList");
    const empty = $("announcementsEmpty");
    if (!list) return;

    try {
      const { data } = await window.lmsSupabase
        .from("announcements")
        .select("id, title, body, target_role, is_published, publish_at, expires_at")
        .eq("author_id", currentProfile.id)
        .order("publish_at", { ascending: false });

      if (!data || data.length === 0) { if (empty) empty.style.display = "flex"; return; }
      if (empty) empty.style.display = "none";

      list.querySelectorAll(".ad-announcement-item").forEach((el) => el.remove());

      data.forEach((ann) => {
        const isPublished = ann.is_published && new Date(ann.publish_at) <= new Date();
        const item = document.createElement("div");
        item.className = "ad-announcement-item";
        item.innerHTML = `
          <div class="ad-announcement-item__icon">📢</div>
          <div class="ad-announcement-item__body">
            <p class="ad-announcement-item__title">${escHtml(ann.title)}</p>
            <p class="ad-announcement-item__preview">${escHtml(ann.body?.substring(0, 120) || "")}${(ann.body?.length || 0) > 120 ? "…" : ""}</p>
            <div class="ad-announcement-item__meta">
              <span class="ad-tag ${isPublished ? "ad-tag--green" : "ad-tag--orange"}">${isPublished ? "Published" : "Scheduled"}</span>
              <span>Target: ${ann.target_role}</span>
              <span>${formatDT(ann.publish_at)}</span>
              ${ann.expires_at ? `<span>Expires: ${formatDT(ann.expires_at)}</span>` : ""}
            </div>
          </div>
          <div class="ad-announcement-item__actions">
            <button class="ad-icon-btn ad-icon-btn--danger" data-ann-id="${ann.id}" aria-label="Delete announcement">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>`;

        item.querySelector(".ad-icon-btn--danger").addEventListener("click", async () => {
          if (!confirm("Delete this announcement?")) return;
          await window.lmsSupabase.from("announcements").delete().eq("id", ann.id).catch(() => {});
          item.remove();
        });

        list.insertBefore(item, empty);
      });
    } catch (err) { console.warn("Announcements load error:", err.message); }
  }

  /* ================================================================
     NOTIFICATIONS
  ================================================================ */
  async function loadNotifications() {
    if (!currentProfile) return;
    try {
      const { data } = await window.lmsSupabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentProfile.id)
        .order("created_at", { ascending: false })
        .limit(15);

      renderNotifications(data || []);
    } catch { renderNotifications([]); }
  }

  function renderNotifications(notifs) {
    const list = $("adNotifList");
    const dot  = $("adNotifDot");
    if (!list) return;

    const unread = notifs.filter((n) => !n.is_read).length;
    if (dot) dot.style.display = unread > 0 ? "block" : "none";

    if (notifs.length === 0) {
      list.innerHTML = `<li class="ad-notif-empty" data-i18n="lmsNoNotifications">No notifications</li>`;
      return;
    }

    list.innerHTML = notifs.slice(0, 10).map((n) => `
      <li class="ad-notif-list-item ${n.is_read ? "" : "unread"}" data-id="${n.id}">
        <div class="ad-notif-list-item__icon">${getNotifIcon(n.type)}</div>
        <div>
          <p class="ad-notif-list-item__title">${escHtml(n.title)}</p>
          <p class="ad-notif-list-item__time">${timeAgo(n.created_at)}</p>
        </div>
      </li>`).join("");

    list.querySelectorAll(".ad-notif-list-item").forEach((item) => {
      item.addEventListener("click", async () => {
        item.classList.remove("unread");
        const unreadNow = list.querySelectorAll(".ad-notif-list-item.unread").length;
        if (dot) dot.style.display = unreadNow > 0 ? "block" : "none";
        await window.lmsSupabase.from("notifications").update({ is_read: true }).eq("id", item.dataset.id).catch(() => {});
      });
    });
  }

  function getNotifIcon(type) {
    return { assignment_graded: "📝", quiz_result: "✅", new_message: "💬",
      course_enrolled: "🎓", certificate_issued: "🏆", submission_received: "📤",
      session_reminder: "📅", announcement: "📢" }[type] || "🔔";
  }

  function setupRealtimeNotifications(userId) {
    if (!window.lmsSupabase) return;
    window.lmsSupabase
      .channel("admin-notif-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => loadNotifications())
      .subscribe();
  }

  /* ================================================================
     TOPBAR NOTIFICATIONS
  ================================================================ */
  function setupTopbarNotifications() {
    const notifBtn   = $("adNotifBtn");
    const notifPanel = $("adNotifPanel");
    const markAllBtn = $("adMarkAllRead");

    notifBtn && notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notifPanel.hidden = !notifPanel.hidden;
    });

    document.addEventListener("click", (e) => {
      if (!notifPanel.hidden && !notifPanel.contains(e.target) && e.target !== notifBtn) {
        notifPanel.hidden = true;
      }
    });

    markAllBtn && markAllBtn.addEventListener("click", () => {
      document.querySelectorAll(".ad-notif-list-item.unread").forEach((el) => el.classList.remove("unread"));
      const dot = $("adNotifDot");
      if (dot) dot.style.display = "none";
    });
  }

  /* ================================================================
     FILTER TABS (generic delegation)
  ================================================================ */
  function setupFilterTabs() {
    document.querySelectorAll(".ad-filter-tabs").forEach((group) => {
      group.querySelectorAll(".ad-filter-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          group.querySelectorAll(".ad-filter-tab").forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
        });
      });
    });
  }

})();


