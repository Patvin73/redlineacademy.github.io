/* ================================================================
   REDLINE ACADEMY — dashboard-admin.js
   Controller for Admin & Trainer Dashboard
   Dependencies: supabase-client.js (window.lmsSupabase), script.js (t())
   ================================================================ */

(function () {
  "use strict";

  /* ================================================================
     STATE
  ================================================================ */
  let currentProfile   = null;
  let currentRole      = "trainer"; // "trainer" | "admin" — set from profile
  let currentSection   = "home";
  let usersCache       = [];
  let activeUserRoleFilter = "all";
  let selectedSubmissionId = null;
  let currentGradingFilter = "submitted";
  let editingCourseId  = null;
  let adminNotificationChannel = null;
  let adminNotificationChannelUserId = null;
  let adminMessageChannel = null;
  let adminMessageChannelUserId = null;
  let adminUnreadSections = { courses: 0, grading: 0, schedule: 0 };
  const USER_ROLE_TAGS = { admin: "red", trainer: "purple", student: "blue" };
  const COURSE_MATERIAL_BUCKET = "course-materials";
  const LESSON_MATERIAL_ACCEPT = {
    video: "video/*",
    pdf: "application/pdf",
    text: ".txt,.md,text/plain,text/markdown",
    quiz: ".pdf,.doc,.docx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown",
    assignment: ".pdf,.doc,.docx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
  };

  /* ================================================================
     HELPERS
  ================================================================ */
  const $ = (id) => document.getElementById(id);

  function removeRealtimeChannel(channel) {
    if (!channel) return;
    if (window.lmsSupabase?.removeChannel) {
      window.lmsSupabase.removeChannel(channel);
    } else {
      channel.unsubscribe?.();
    }
  }

  function escHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function showConfirmModal(message, onConfirm) {
    const overlay = document.createElement("div");
    overlay.className = "ad-modal";
    overlay.innerHTML = `
       <div class="ad-modal__backdrop"></div>
       <div class="ad-modal__card" role="dialog" aria-modal="true" style="max-width:380px">
         <div class="ad-modal__header">
           <h3>Konfirmasi</h3>
         </div>
         <div class="ad-modal__body" style="padding:16px 20px">
           <p style="margin:0">${escHtml(message)}</p>
         </div>
         <div class="ad-modal__actions" style="padding:12px 20px">
           <button class="ad-btn ad-btn--outline" id="confirmCancel">Batal</button>
           <button class="ad-btn ad-btn--danger" id="confirmOk">Hapus</button>
         </div>
       </div>`;
    document.body.appendChild(overlay);
    overlay.hidden = false;
    overlay.querySelector("#confirmCancel").onclick = () => overlay.remove();
    overlay.querySelector("#confirmOk").onclick = () => { overlay.remove(); onConfirm(); };
    overlay.querySelector(".ad-modal__backdrop").onclick = () => overlay.remove();
  }

  function showToastError(message) {
    const toastMsg = document.createElement("div");
    toastMsg.className = "ad-toast-error";
    toastMsg.textContent = message;
    document.body.appendChild(toastMsg);
    setTimeout(() => toastMsg.remove(), 4000);
  }

  function withAvatarCacheBust(url) {
    if (!url) return "";
    const separator = String(url).includes("?") ? "&" : "?";
    return `${url}${separator}v=${Date.now()}`;
  }

  function renderAdminAvatar(src, name = "Avatar") {
    if (!src) return;
    const img = `<img src="${escHtml(src)}" alt="${escHtml(name)}" loading="lazy" decoding="async" />`;
    document.querySelectorAll(".ad-avatar").forEach((el) => { el.innerHTML = img; });
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("Could not preview image."));
      reader.readAsDataURL(file);
    });
  }

  function tSafe(key, fallback) {
    return typeof t === "function" ? t(key) : fallback;
  }

  function createClientId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return "10000000-1000-4000-8000-" + Math.random().toString(16).slice(2, 14).padEnd(12, "0");
  }

  async function sendMessageEmailNotification(messageId) {
    if (!messageId || !window.lmsSupabase?.functions?.invoke) return;
    try {
      const { error } = await window.lmsSupabase.functions.invoke("send-message-email", {
        body: { message_id: messageId }
      });
      if (error) throw error;
    } catch (err) {
      console.warn("Message email notification failed:", err.message || err);
    }
  }

  function safeStorageSegment(value, fallback = "material") {
    return String(value || fallback)
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || fallback;
  }

  function creatorIdForCourse(course) {
    const profileId = course?.profiles?.admin_id || course?.profiles?.student_id;
    if (profileId) return profileId;
    return course?.trainer_id ? course.trainer_id.substring(0, 8).toUpperCase() : "-";
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
    setupTopbarActions();
    setupTopbarNotifications();
    setupCourseBuilder();
    setupGradingPanel();
    setupAssignmentForm();
    $("refreshAssignmentsBtn")?.addEventListener("click", loadMyAssignments);
    setupScheduleForm();
    setupAnnouncementForm();
    setupManualPaymentForm();
    setupBuilderTabs();
    setupUserManagement();
    setupSystemSettings();
    setupFilterTabs();
    setWelcomeDate();

    await loadAdminData();
    setupAdminProfileForm();
    setupAdminAvatarUpload();
    setupAdminChangePassword();
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

  function setupTopbarActions() {
    const profileBtn = $("adTopbarProfileBtn");
    const searchInput = $("adSearchInput");
    const newMsgBtn = $("adNewMsgBtn");
    const exportReportBtn = $("exportReportBtn");
    const exportPaymentsBtn = $("exportPaymentsBtn");

    profileBtn && profileBtn.addEventListener("click", () => {
      if (window._adActivateSection) window._adActivateSection("profile");
    });
    profileBtn && profileBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (window._adActivateSection) window._adActivateSection("profile");
      }
    });

    searchInput && searchInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const query = searchInput.value.trim();
      if (!query) return;
      runAdminSearch(query);
    });

    newMsgBtn && newMsgBtn.addEventListener("click", () => openMessageComposer());

    exportReportBtn && exportReportBtn.addEventListener("click", () => {
      exportTableToCsv($("courseOverviewBody")?.closest("table"), "reports.csv");
    });

    exportPaymentsBtn && exportPaymentsBtn.addEventListener("click", () => {
      exportTableToCsv($("enrollmentTableBody")?.closest("table"), "payments.csv");
    });
  }

  function exportTableToCsv(table, filename) {
    if (!table) return;

    const rows = Array.from(table.querySelectorAll("tr"))
      .filter((row) => row.style.display !== "none")
      .map((row) => Array.from(row.querySelectorAll("th, td"))
        .map((cell) => `"${(cell.textContent || "").replace(/\s+/g, " ").trim().replace(/"/g, '""')}"`)
        .join(","))
      .join("\n");

    if (!rows) return;

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  /* ── Lazy load by section ────────────────────────────────────── */
  const loadedSections = new Set(["home"]);

  async function loadSectionData(sectionId) {
    const alwaysReload = sectionId === "settings";
    if (loadedSections.has(sectionId) && !alwaysReload) return;
    if (!alwaysReload) loadedSections.add(sectionId);

    switch (sectionId) {
      case "students":    await loadStudentsTable(); break;
      case "courses":     await loadCoursesList(); break;
      case "grading":     await Promise.all([loadSubmissionQueue(), loadMyAssignments()]); break;
      case "schedule":    await loadEventsList(); break;
      case "messages":    await loadMessages(); break;
      case "profile":     break;
      case "reports":     await loadReports(); break;
      case "settings":    await loadStorageMonitor(); break;
      case "users":       await loadUsersTable(); break;
      case "enrollments": await loadEnrollmentsTable(); break;
      case "announcements": await loadAnnouncements(); break;
    }
  }

  /* ================================================================
     SUPABASE DATA — main loader
  ================================================================ */
  async function loadAdminData() {
    try {
      if (!window.lmsSupabase) {
        if (window.__lmsSupabaseReady__) {
          await window.__lmsSupabaseReady__;
        }
      }
      if (!window.lmsSupabase) return;

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

      async function checkRequiredViews() {
        const requiredViews = [
          { name: "v_trainer_dashboard", role: "trainer" },
          { name: "v_students_at_risk", role: "admin" },
          { name: "v_course_overview", role: "admin" },
        ];

        for (const view of requiredViews) {
          // Hanya cek view yang relevan untuk role saat ini
          if (currentRole !== view.role) continue;
          const { error } = await window.lmsSupabase
            .from(view.name)
            .select("*")
            .limit(1);
          if (error?.code === "42P01") {
            console.error(`[LMS] View missing: ${view.name}. Run migration SQL.`);
            const banner = document.createElement("div");
            banner.style.cssText = "background:#fff3cd;color:#856404;padding:10px 16px;font-size:13px;";
            banner.textContent = `⚠️ Database view "${view.name}" belum dibuat. Beberapa fitur mungkin tidak berfungsi.`;
            document.querySelector(".ad-main")?.prepend(banner);
          }
        }
      }

      await checkRequiredViews();

      populateUI(profile);
      await loadSystemSettings();

      await Promise.all([
        loadKPIs(),
        loadActivityFeed(),
        loadPendingActions(),
        loadAtRiskStudents(),
        loadNotifications(),
        refreshAdminMessageIndicators(user.id),
      ]);

      setupRealtimeNotifications(user.id);
      setupRealtimeMessages(user.id);

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
    if ($("adminName")) $("adminName").textContent = name;
    if ($("adminEmail")) $("adminEmail").textContent = profile.email || "—";

    // Role badge
    const badge = $("sidebarRoleBadge");
    if (badge) {
      badge.textContent = role === "admin" ? "Admin" : "Trainer";
      if (role === "trainer") badge.classList.add("ad-role-badge--trainer");
    }

    const topbarProfileBtn = $("adTopbarProfileBtn");
    if (topbarProfileBtn) {
      // Tampilkan untuk semua role (admin dan trainer) — navigasi ke Profile
      topbarProfileBtn.hidden = false;
      topbarProfileBtn.setAttribute("aria-hidden", "false");
      topbarProfileBtn.tabIndex = 0;
    }

    // data-lms-role on body (for guard.js)
    document.body.setAttribute("data-lms-role", role);

    // Welcome sub-line
    const sub = $("welcomeRoleSub");
    if (sub) sub.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} · Redline Academy`;

    // Avatar
    if (profile.avatar_url) {
      renderAdminAvatar(profile.avatar_url, name);
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
      let data = null;
      if (currentRole === "admin") {
        const [
          { count: totalStudents },
          { count: coursesCreated },
          { count: pendingGrading },
          { data: progressRows }
        ] = await Promise.all([
          window.lmsSupabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
          window.lmsSupabase.from("courses").select("id", { count: "exact", head: true }).eq("status", "published"),
          window.lmsSupabase.from("assignment_submissions").select("id", { count: "exact", head: true }).eq("status", "submitted"),
          window.lmsSupabase.from("course_progress").select("completion_percent")
        ]);

        const avgCompletion = (progressRows || []).length
          ? Math.round(((progressRows || []).reduce((sum, row) => sum + parseFloat(row.completion_percent || 0), 0) / progressRows.length) * 10) / 10
          : 0;

        data = {
          total_students: totalStudents || 0,
          courses_created: coursesCreated || 0,
          pending_grading: pendingGrading || 0,
          avg_completion_percent: avgCompletion
        };
      } else {
        const { data: trainerData } = await window.lmsSupabase
          .from("v_trainer_dashboard")
          .select("*")
          .eq("trainer_id", currentProfile.id)
          .single();
        data = trainerData;
        if (data) {
          const [visibleStudentCount, pendingGradingCount] = await Promise.all([
            countVisibleStudentsForCurrentRole().catch(() => null),
            countPendingGradingForCurrentRole().catch(() => null)
          ]);
          if ((data.total_students || 0) === 0 && visibleStudentCount !== null) data.total_students = visibleStudentCount;
          if (pendingGradingCount !== null) data.pending_grading = pendingGradingCount;
        }
      }

      if (data) {
        if ($("kpiTotalStudents"))   $("kpiTotalStudents").textContent   = data.total_students    || 0;
        if ($("kpiActiveCourses"))   $("kpiActiveCourses").textContent   = data.courses_created   || 0;
        if ($("kpiPendingGrading"))  $("kpiPendingGrading").textContent  = data.pending_grading   || 0;
        if ($("kpiCompletionRate"))  $("kpiCompletionRate").textContent  = (data.avg_completion_percent || 0) + "%";

        // Update grading badge in nav
        const gb = $("gradingBadge");
        const count = data.pending_grading || 0;
        if (gb) { gb.textContent = count; gb.style.display = count > 0 ? "inline-block" : "none"; }

        // Map KPI card ke section tujuan
        const kpiNavMap = [
          { cardId: "kpiTotalStudents", section: "students" },
          { cardId: "kpiActiveCourses", section: "courses" },
          { cardId: "kpiPendingGrading", section: "grading" },
          { cardId: "kpiCompletionRate", section: "reports" },
        ];
        kpiNavMap.forEach(({ cardId, section }) => {
          const el = $(cardId)?.closest(".ad-kpi-card");
          if (el) {
            el.style.cursor = "pointer";
            el.setAttribute("role", "button");
            el.setAttribute("tabindex", "0");
            el.addEventListener("click", () => window._adActivateSection?.(section));
            el.addEventListener("keydown", (e) => {
              if (e.key === "Enter" || e.key === " ") window._adActivateSection?.(section);
            });
          }
        });
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

    const actionToSection = {
      assignment_submitted: "grading",
      quiz_submitted:       "grading",
      course_enrolled:      "students",
      lesson_completed:     "students",
      certificate_issued:   "reports",
    };

    try {
      let query = window.lmsSupabase
        .from("activity_logs")
        .select("user_id, action, metadata, created_at, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(10);

      if (currentRole !== "admin") {
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

        query = query.in("user_id", studentIds);
      }

      const { data: logs } = await query;

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
        const targetSection = actionToSection[log.action] || "home";
        li.style.cursor = "pointer";
        li.setAttribute("tabindex", "0");
        li.setAttribute("title", `Buka ${targetSection}`);
        li.addEventListener("click", () => window._adActivateSection?.(targetSection));
        li.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window._adActivateSection?.(targetSection);
          }
        });
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
  async function getTrainerGradingAssignmentIds() {
    if (currentRole !== "trainer" || !currentProfile?.id) return null;

    const assignmentIds = new Set();

    const { data: ownAssignments, error: ownAssignmentsErr } = await window.lmsSupabase
      .from("assignments")
      .select("id")
      .eq("trainer_id", currentProfile.id);
    if (ownAssignmentsErr) throw ownAssignmentsErr;
    (ownAssignments || []).forEach((assignment) => {
      if (assignment.id) assignmentIds.add(assignment.id);
    });

    const { data: trainerCourses, error: trainerCoursesErr } = await window.lmsSupabase
      .from("courses")
      .select("id")
      .eq("trainer_id", currentProfile.id);
    if (trainerCoursesErr) throw trainerCoursesErr;

    const courseIds = (trainerCourses || []).map((course) => course.id).filter(Boolean);
    if (courseIds.length > 0) {
      const { data: courseAssignments, error: courseAssignmentsErr } = await window.lmsSupabase
        .from("assignments")
        .select("id")
        .in("course_id", courseIds);
      if (courseAssignmentsErr) throw courseAssignmentsErr;
      (courseAssignments || []).forEach((assignment) => {
        if (assignment.id) assignmentIds.add(assignment.id);
      });
    }

    return [...assignmentIds];
  }

  async function countVisibleStudentsForCurrentRole() {
    const { count, error } = await window.lmsSupabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student");
    if (error) throw error;
    return count || 0;
  }

  async function countPendingGradingForCurrentRole() {
    const gradingAssignmentIds = await getTrainerGradingAssignmentIds();
    if (currentRole === "trainer" && gradingAssignmentIds.length === 0) return 0;
    let query = window.lmsSupabase
      .from("assignment_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "submitted");
    if (currentRole === "trainer") query = query.in("assignment_id", gradingAssignmentIds);
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async function loadPendingActions() {
    const list  = $("pendingList");
    const count = $("pendingActionCount");
    const empty = $("pendingEmpty");
    if (!list) return;

    const actions = [];

    try {
      // Pending grading
      const gradingAssignmentIds = await getTrainerGradingAssignmentIds();
      let subs = [];
      if (currentRole !== "trainer" || gradingAssignmentIds.length > 0) {
        let pendingQuery = window.lmsSupabase
          .from("assignment_submissions")
          .select("id, student_id, assignment_id, submitted_at, assignments!inner(title, trainer_id)")
          .eq("status", "submitted")
          .limit(5);
        if (currentRole === "trainer") pendingQuery = pendingQuery.in("assignment_id", gradingAssignmentIds);
        const { data: pendingSubs } = await pendingQuery;
        subs = pendingSubs || [];
      }

      subs.forEach((s) => {
        const assignment = Array.isArray(s.assignments) ? s.assignments[0] : s.assignments;
        actions.push({
          icon: "📝",
          text: `Grade: ${assignment?.title || "Assignment"}`,
          meta: timeAgo(s.submitted_at),
          section: "grading",
        });
      });

      // Unanswered forum posts > 24h
      const { data: posts } = await window.lmsSupabase
        .from("forum_posts")
        .select("id, title, created_at, courses!inner(trainer_id)")
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

      li.style.cursor = "pointer";
      li.setAttribute("tabindex", "0");
      li.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        window._adActivateSection?.(a.section);
      });
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window._adActivateSection?.(a.section); }
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
      let data = null;
      if (currentRole === "admin") {
        const result = await window.lmsSupabase
          .from("v_students_at_risk")
          .select("*")
          .order("inactive_duration", { ascending: false })
          .limit(5);
        data = result.data;
      } else {
        const result = await window.lmsSupabase
          .from("enrollments")
          .select(`
            student_id,
            profiles ( full_name, email ),
            courses!inner ( title, trainer_id ),
            course_progress ( completion_percent, last_accessed_at )
          `)
          .eq("status", "active")
          .eq("courses.trainer_id", currentProfile.id)
          .order("enrolled_at", { ascending: false });

        data = (result.data || []).map((row) => {
          const progress = row.course_progress?.[0] || {};
          const lastAccessed = progress.last_accessed_at || null;
          const inactiveDuration = lastAccessed
            ? Math.floor((Date.now() - new Date(lastAccessed).getTime()) / 86400000)
            : 9999;
          return {
            student_id: row.student_id,
            full_name: row.profiles?.full_name,
            email: row.profiles?.email,
            course_title: row.courses?.title,
            completion_percent: progress.completion_percent || 0,
            last_accessed_at: lastAccessed,
            inactive_duration: inactiveDuration
          };
        })
          .filter((row) => !row.last_accessed_at || row.inactive_duration >= 7)
          .sort((a, b) => b.inactive_duration - a.inactive_duration)
          .slice(0, 5);
      }

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
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="ad-btn ad-btn--outline ad-btn--sm ad-risk-view-btn" title="Lihat detail student">View</button>
              <button class="ad-btn ad-btn--outline ad-btn--sm" data-student-id="${s.student_id}" data-i18n="adMsgToStudent">Message</button>
            </div>
          </td>`;
        tbody.appendChild(tr);
        tr.style.cursor = "pointer";
        tr.addEventListener("click", (e) => {
          if (e.target.closest("button")) return;
          window._adActivateSection?.("students");
        });
        const viewBtn = tr.querySelector(".ad-risk-view-btn");
        if (viewBtn) viewBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          window._adActivateSection?.("students");
        });
      });

    } catch { if (empty) empty.style.display = "table-row"; }
  }

  /* ================================================================
     STUDENTS TABLE
  ================================================================ */
  function getStudentRowStatus(profile, enrollment, progress) {
    if (enrollment?.status === "completed") return "completed";
    if (profile?.is_active === false) return "at_risk";
    if (enrollment?.status === "active") {
      const lastAccessed = progress?.last_accessed_at || null;
      if (!lastAccessed) return "at_risk";
      const inactiveDays = Math.floor((Date.now() - new Date(lastAccessed).getTime()) / 86400000);
      if (inactiveDays >= 7) return "at_risk";
    }
    return "active";
  }

  function applyStudentFilter(filter = "all") {
    const rows = Array.from(document.querySelectorAll("#studentTableBody tr.ad-student-row"));
    let visibleCount = 0;

    rows.forEach((row) => {
      const isVisible = filter === "all" || row.dataset.status === filter;
      row.style.display = isVisible ? "" : "none";
      if (isVisible) visibleCount += 1;
    });

    const empty = $("studentTableEmpty");
    if (empty && rows.length > 0) empty.style.display = visibleCount === 0 ? "table-row" : "none";
  }

  async function loadStudentsTable() {
    const tbody = $("studentTableBody");
    const empty = $("studentTableEmpty");
    if (!tbody) return;

    try {
      const { data: students, error: studentsErr } = await window.lmsSupabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, student_id, is_active")
        .eq("role", "student")
        .order("full_name", { ascending: true });

      if (studentsErr) throw studentsErr;
      if (!students || students.length === 0) throw new Error("No students");

      const studentIds = students.map((student) => student.id).filter(Boolean);
      let enrollments = [];

      if (studentIds.length) {
        const { data, error: enrollErr } = await window.lmsSupabase
          .from("enrollments")
          .select(`
            id, student_id, status, enrolled_at,
            courses   ( id, title, enrollment_type, price ),
            course_progress ( completion_percent, last_accessed_at )
          `)
          .in("student_id", studentIds)
          .order("enrolled_at", { ascending: false });

        if (enrollErr) throw enrollErr;
        enrollments = data || [];
      }

      let paymentMap = new Map();
      if (currentRole === "admin") {
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

      const enrollmentByStudent = new Map();
      enrollments.forEach((en) => {
        if (en.student_id && !enrollmentByStudent.has(en.student_id)) {
          enrollmentByStudent.set(en.student_id, en);
        }
      });

      if (empty) empty.style.display = "none";
      tbody.querySelectorAll("tr:not(#studentTableEmpty)").forEach((r) => r.remove());

      students.forEach((p) => {
        const en  = enrollmentByStudent.get(p.id);
        const c   = en?.courses;
        const cp  = en?.course_progress?.[0];
        const pct = Math.round(cp?.completion_percent || 0);

        const statusCompleted = tSafe("lmsStatusCompleted", "Completed");
        const statusActive = tSafe("lmsStatusActive", "Active");
        const statusInactive = tSafe("lmsStatusInactive", "Inactive");
        const statusPaid = tSafe("lmsStatusPaid", "Paid");
        const statusInstallment = tSafe("lmsStatusInstallment", "Installment");

        let statusTag = !en
          ? `<span class="ad-tag ${p?.is_active === false ? "ad-tag--gray" : "ad-tag--blue"}">${p?.is_active === false ? statusInactive : statusActive}</span>`
          : en.status === "completed"
          ? `<span class="ad-tag ad-tag--green">${statusCompleted}</span>`
          : en.status === "active"
          ? `<span class="ad-tag ad-tag--blue">${statusActive}</span>`
          : `<span class="ad-tag ad-tag--gray">${escHtml(en.status)}</span>`;

        if (currentRole === "admin" && p?.id && c?.id) {
          const key = `${p.id}:${c.id}`;
          const payment = paymentMap.get(key);
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
          }
        }

        const tr = document.createElement("tr");
        tr.className = "ad-student-row";
        tr.dataset.status = getStudentRowStatus(p, en, cp);
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
            <button class="ad-btn ad-btn--outline ad-btn--sm" data-student-id="${p.id}">Message</button>
          </td>`;
        tbody.appendChild(tr);
        tr.querySelector("[data-student-id]")?.addEventListener("click", (event) => {
          event.stopPropagation();
          openStudentMessage(p.id);
        });
      });

      const activeFilter = document.querySelector("#section-students .ad-filter-tab.active")?.dataset.filter || "all";
      applyStudentFilter(activeFilter);

    } catch {
      if (empty) {
        empty.style.display = "table-row";
        const cell = empty.querySelector("td");
        if (cell) {
          const key = "lmsNoStudents";
          cell.setAttribute("data-i18n", key);
          cell.textContent = typeof t === "function" ? t(key) : "No students found";
        }
      }
    }
  }
  /* ================================================================
     COURSE LIST
  ================================================================ */
  function ensureAdminCourseDetailPanel() {
    const section = $("section-courses");
    if (!section) return null;
    let panel = $("adminCourseDetail");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "adminCourseDetail";
      panel.className = "ad-message-view ad-course-detail";
      panel.hidden = true;
      section.appendChild(panel);
    }
    return panel;
  }

  function renderAdminLessonModules(lessons) {
    if (!lessons?.length) {
      return `<p class="ad-message-detail__body">Belum ada materi tersedia untuk kursus ini.</p>`;
    }
    const modules = new Map();
    lessons.forEach((lesson) => {
      const key = String(lesson.module_order || 1);
      if (!modules.has(key)) {
        modules.set(key, { title: lesson.module_title || `Module ${key}`, lessons: [] });
      }
      modules.get(key).lessons.push(lesson);
    });
    return Array.from(modules.values()).map((module) => `
      <div class="ad-message-detail__recipients">
        <p class="ad-message-detail__label">${escHtml(module.title)}</p>
        ${module.lessons.map((lesson) => {
          const safeUrl = toSafeUiUrl(lesson.material_display_url);
          return `
            <div class="ad-message-recipient">
              <span>${escHtml(lesson.title || "Lesson")}</span>
              ${safeUrl
                ? `<a class="ad-btn ad-btn--outline ad-btn--sm" href="${escHtml(safeUrl)}" target="_blank" rel="noopener">Open material</a>`
                : `<span class="ad-inbox-item__time">${escHtml(lesson.material_type || "Material")}</span>`}
            </div>`;
        }).join("")}
      </div>`).join("");
  }

  async function openAdminCourseDetail(course) {
    const panel = ensureAdminCourseDetailPanel();
    if (!panel || !course?.id || !window.lmsSupabase) return;

    panel.hidden = false;
    panel.innerHTML = `
      <div class="ad-message-view__detail">
        <div class="ad-message-detail__actions">
          <div>
            <p class="ad-inbox-item__name">${escHtml(course.title || "Course")}</p>
            <p class="ad-inbox-item__time">${escHtml(course.category || "Course")} - Creator ID: ${escHtml(course.creatorId || "-")}${course.createdAt ? ` - Created ${formatDT(course.createdAt)}` : ""}</p>
          </div>
          <button class="ad-btn ad-btn--outline ad-btn--sm" type="button" data-admin-course-close>Close</button>
        </div>
        <div class="ad-message-view__compose">
          <p class="ad-message-detail__body">Loading course contents...</p>
        </div>
      </div>`;
    panel.querySelector("[data-admin-course-close]")?.addEventListener("click", () => {
      panel.hidden = true;
    });
    panel.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const { data: lessons, error } = await window.lmsSupabase
        .from("lessons")
        .select("id, title, material_type, material_url, material_path, module_title, module_order, lesson_order")
        .eq("course_id", course.id)
        .order("module_order", { ascending: true })
        .order("lesson_order", { ascending: true });
      if (error) throw error;
      const lessonsWithUrls = await prepareCourseMaterialUrls(lessons || []);
      const body = panel.querySelector(".ad-message-view__compose");
      if (body) body.innerHTML = renderAdminLessonModules(lessonsWithUrls);
    } catch (err) {
      const body = panel.querySelector(".ad-message-view__compose");
      if (body) body.innerHTML = `<p class="ad-message-detail__body">${escHtml(err.message || "Course contents failed to load.")}</p>`;
    }
  }

  async function loadCoursesList() {
    const list = $("adminCourseList");
    if (!list) return;

    try {
      let query = window.lmsSupabase
        .from("courses")
        .select(`
          id, title, status, category_id, thumbnail_url, created_at, trainer_id,
          categories(name),
          profiles!courses_trainer_id_fkey(admin_id, student_id)
        `)
        .order("created_at", { ascending: false });
      if (currentRole !== "admin") {
        query = query.eq("trainer_id", currentProfile.id);
      }
      const { data: courses } = await query;

      // Remove skeletons dan existing rows sebelum re-render
      list.querySelectorAll(".ad-skeleton-row").forEach((el) => el.remove());
      list.querySelectorAll(".ad-course-row").forEach((el) => el.remove());

      if (!courses || courses.length === 0) {
        list.innerHTML = `<div class="ad-empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg><p>No courses yet. Create your first course!</p></div>`;
        return;
      }

      const coursesWithThumbnails = await Promise.all(courses.map(async (course) => ({
        course,
        thumbnailDisplayUrl: await resolveCourseMaterialUrl({ material_url: course.thumbnail_url })
      })));

      coursesWithThumbnails.forEach(({ course, thumbnailDisplayUrl }) => {
        const canManageCourse = currentRole === "admin" || course.trainer_id === currentProfile?.id;
        const creatorId = creatorIdForCourse(course);
        const statusTag = {
          published: `<span class="ad-tag ad-tag--green">Published</span>`,
          draft:     `<span class="ad-tag ad-tag--orange">Draft</span>`,
          archived:  `<span class="ad-tag ad-tag--gray">Archived</span>`,
        }[course.status] || `<span class="ad-tag">${course.status}</span>`;

        const row = document.createElement("div");
        row.className = "ad-course-row";
        row.dataset.courseId = course.id;
        row.dataset.courseTitle = course.title || "Course";
        row.dataset.courseCategory = course.categories?.name || course.category_id || "Course";
        row.dataset.courseCreatorId = creatorId;
        row.dataset.courseCreatedAt = course.created_at || "";
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        row.setAttribute("aria-label", `View ${course.title || "course"}`);
        row.innerHTML = `
          <div class="ad-course-row__thumb">
            ${thumbnailDisplayUrl
              ? `<img src="${escHtml(thumbnailDisplayUrl)}" alt="${escHtml(course.title)}" style="width:100%;height:100%;object-fit:cover;border-radius:6px" />`
              : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`
            }
          </div>
          <div class="ad-course-row__body">
            <p class="ad-course-row__title">${escHtml(course.title)}</p>
            <p class="ad-course-row__meta">${escHtml(course.categories?.name || "—")} · Creator ID: ${escHtml(creatorId)} · Created ${formatDT(course.created_at)}</p>
          </div>
          ${statusTag}
          <div class="ad-course-row__actions">
            ${canManageCourse
              ? `<button class="ad-btn ad-btn--outline ad-btn--sm" data-action="edit" data-i18n="adEditCourse">Edit</button>
                <button class="ad-icon-btn ad-icon-btn--danger" data-action="delete" aria-label="Delete course">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>`
              : ""
            }
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
    const requiredFields = ["cbTitle"];

    requiredFields.forEach((id) => { if ($(id)) $(id).required = true; });

    createBtn  && createBtn.addEventListener("click",  () => {
      resetCourseBuilderForm();
      panel.hidden = false;
      panel.scrollIntoView({ behavior: "smooth" });
    });
    closeBtn   && closeBtn.addEventListener("click",   () => {
      resetCourseBuilderForm();
      panel.hidden = true;
    });
    const thumbInput = $("cbThumbnail");
    thumbInput && thumbInput.addEventListener("change", () => {
      const file = thumbInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        $("cbThumbnailImg").src = e.target.result;
        $("cbThumbnailPreview").style.display = "block";
      };
      reader.readAsDataURL(file);
    });
    saveDraftBtn && saveDraftBtn.addEventListener("click", () => saveCourse("draft"));
    saveBtn    && saveBtn.addEventListener("click",    () => saveCourse("published"));
    panel && panel.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.target.tagName === "TEXTAREA") return;
      e.preventDefault();
      saveBtn && saveBtn.click();
    });
    panel && panel.addEventListener("click", (e) => {
      const uploadBtn = e.target.closest(".ad-material-upload-btn");
      const removeLessonBtn = e.target.closest(".ad-lesson-item .ad-icon-btn--danger");
      const removeModuleBtn = e.target.closest(".ad-module-item__header .ad-icon-btn--danger");

      if (uploadBtn) {
        uploadBtn.closest(".ad-material-upload")?.querySelector(".ad-material-input")?.click();
        return;
      }
      if (removeLessonBtn) {
        removeLessonBtn.closest(".ad-lesson-item")?.remove();
        return;
      }
      if (removeModuleBtn) removeModuleBtn.closest(".ad-module-item")?.remove();
    });
    panel && panel.addEventListener("change", (e) => {
      const lessonItem = e.target.closest(".ad-lesson-item");
      if (!lessonItem) return;
      if (e.target.matches(".ad-lesson-type")) updateLessonMaterialControl(lessonItem, true);
      if (e.target.matches(".ad-material-input")) updateLessonFileLabel(lessonItem);
    });

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
      if (!deleteBtn && !editBtn) {
        openAdminCourseDetail({
          id: row.dataset.courseId,
          title: row.dataset.courseTitle,
          category: row.dataset.courseCategory,
          creatorId: row.dataset.courseCreatorId,
          createdAt: row.dataset.courseCreatedAt
        });
      }
    });
    list && list.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (e.target.closest("button,a")) return;
      const row = e.target.closest(".ad-course-row");
      if (!row) return;
      e.preventDefault();
      openAdminCourseDetail({
        id: row.dataset.courseId,
        title: row.dataset.courseTitle,
        category: row.dataset.courseCategory,
        creatorId: row.dataset.courseCreatorId,
        createdAt: row.dataset.courseCreatedAt
      });
    });
  }

  function addModule() {
    const modulesList = $("builderModulesList");
    if (!modulesList) return;
    const template = $("moduleTemplate");
    const clone    = template.cloneNode(true);
    clone.id       = "module-" + Date.now();

    // Add lesson to module
    clone.querySelector(".ad-add-lesson-btn").addEventListener("click", () => {
      const li = document.createElement("li");
      li.className = "ad-lesson-item";
      li.innerHTML = `
        <select class="ad-input ad-select ad-select--xs ad-lesson-type">
          <option value="video">📹 Video</option>
          <option value="pdf">📄 PDF</option>
          <option value="text">📝 Text</option>
          <option value="quiz">❓ Quiz</option>
          <option value="assignment">📋 Assignment</option>
        </select>
        <input class="ad-input ad-input--grow" type="text" placeholder="Lesson title..." />
        <div class="ad-material-upload">
          <input class="ad-material-input" type="file" accept="video/*" hidden />
          <button class="ad-btn ad-btn--outline ad-btn--sm ad-material-upload-btn" type="button">Upload Material</button>
          <span class="ad-material-file">No file selected</span>
        </div>
        <button class="ad-icon-btn ad-icon-btn--danger" aria-label="Remove lesson">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>`;
      li.querySelector(".ad-icon-btn--danger").addEventListener("click", () => li.remove());
      clone.querySelector(".ad-lessons-list").appendChild(li);
    });

    modulesList.appendChild(clone);
  }

  function updateLessonMaterialControl(lessonItem, resetFile) {
    const type = lessonItem.querySelector(".ad-lesson-type")?.value || "video";
    const input = lessonItem.querySelector(".ad-material-input");
    if (input) {
      input.accept = LESSON_MATERIAL_ACCEPT[type] || "";
      if (resetFile) input.value = "";
    }
    updateLessonFileLabel(lessonItem);
  }

  function updateLessonFileLabel(lessonItem) {
    const fileInput = lessonItem.querySelector(".ad-material-input");
    const label = lessonItem.querySelector(".ad-material-file");
    if (!label) return;
    const fileName = fileInput?.files?.[0]?.name || "";
    label.textContent = fileName || "No file selected";
    label.style.color = "";
    delete label.dataset.existingUrl;
    delete label.dataset.existingPath;
  }

  function collectCourseModules() {
    const modulesList = $("builderModulesList");
    if (!modulesList) return [];

    return [...modulesList.querySelectorAll(".ad-module-item")]
      .map((moduleEl, moduleIndex) => {
        const moduleTitle = moduleEl.querySelector(".ad-module-item__header input")?.value.trim() || `Module ${moduleIndex + 1}`;
        const lessons = [...moduleEl.querySelectorAll(".ad-lesson-item")]
          .map((lessonEl) => {
            const title = lessonEl.querySelector(".ad-input--grow")?.value.trim() || "";
            const materialType = lessonEl.querySelector(".ad-lesson-type")?.value || "video";
            const file = lessonEl.querySelector(".ad-material-input")?.files?.[0] || null;
            const fileLabel = lessonEl.querySelector(".ad-material-file");
            const existingUrl = fileLabel?.dataset.existingUrl || null;
            const existingPath = fileLabel?.dataset.existingPath || null;
            return { title, materialType, file, existingUrl, existingPath };
          })
          .filter((lesson) => lesson.title || lesson.file);

        return { title: moduleTitle, order: moduleIndex + 1, lessons };
      })
      .filter((module) => module.lessons.length);
  }

  async function uploadLessonMaterial(file, courseId, moduleOrder, lessonOrder, materialType) {
    if (!file) return { materialPath: null, materialUrl: null };
    if (!window.lmsSupabase?.storage) throw new Error("Supabase Storage is not available.");
    if (file.size > 500 * 1024 * 1024) {
      throw new Error("File terlalu besar. Maksimum ukuran file adalah 500 MB.");
    }

    const fileName = safeStorageSegment(file.name);
    const path = [
      "courses",
      safeStorageSegment(courseId, "course"),
      `module-${moduleOrder}`,
      `lesson-${lessonOrder}-${safeStorageSegment(materialType)}-${Date.now()}-${fileName}`
    ].join("/");

    const { error } = await window.lmsSupabase.storage
      .from(COURSE_MATERIAL_BUCKET)
      .upload(path, file, { upsert: true });
    if (error) throw error;

    const { data } = window.lmsSupabase.storage
      .from(COURSE_MATERIAL_BUCKET)
      .getPublicUrl(path);

    return { materialPath: path, materialUrl: data?.publicUrl || null };
  }

  async function insertLessonRows(rows) {
    if (!rows.length) return;

    const { error } = await window.lmsSupabase.from("lessons").insert(rows);
    if (!error) return;

    const legacyRows = rows.map((row) => ({
      course_id: row.course_id,
      title: row.title,
      content: row.material_type === "video" ? null : row.material_url,
      video_url: row.material_type === "video" ? row.material_url : null,
      lesson_order: row.lesson_order
    }));
    const { error: legacyError } = await window.lmsSupabase.from("lessons").insert(legacyRows);
    if (legacyError) throw legacyError;
  }

  async function saveCourseLessons(courseId, modules) {
    if (!modules.length) return;

    const rows = [];
    let lessonOrder = 1;
    for (const module of modules) {
      for (const lesson of module.lessons) {
        const material = lesson.file
          ? await uploadLessonMaterial(lesson.file, courseId, module.order, lessonOrder, lesson.materialType)
          : {
              materialPath: lesson.existingPath || extractCourseMaterialPath(lesson.existingUrl) || null,
              materialUrl: lesson.existingUrl || null
            };
        rows.push({
          course_id: courseId,
          title: lesson.title || lesson.file?.name || "Untitled lesson",
          content: lesson.materialType === "video" ? null : material.materialUrl,
          video_url: lesson.materialType === "video" ? material.materialUrl : null,
          lesson_order: lessonOrder,
          module_title: module.title,
          module_order: module.order,
          material_type: lesson.materialType,
          material_url: material.materialUrl,
          material_path: material.materialPath
        });
        lessonOrder += 1;
      }
    }

    await window.lmsSupabase.from("lessons").delete().eq("course_id", courseId);
    await insertLessonRows(rows);
  }

  async function saveCourse(status) {
    const msg = $("builderMsg");
    const btn = status === "draft" ? $("saveDraftBtn") : $("saveCourseBtn");

    const title    = $("cbTitle")?.value.trim();
    const category = $("cbCategory")?.value;
    const desc     = $("cbDesc")?.value.trim();
    const modules  = collectCourseModules();
    if ($("cbTitle") && !$("cbTitle").reportValidity()) return;

    if (!title) {
      if (msg) { msg.textContent = "Course title is required"; msg.style.color = "var(--sd-red)"; }
      return;
    }

    if (btn) btn.disabled = true;

    try {
      const payload = {
        trainer_id:       currentProfile.id,
        title,
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

      let thumbnailUrl = null;
      const thumbFile = $("cbThumbnail")?.files?.[0];
      if (thumbFile) {
        const thumbPath = `courses/thumbnails/${Date.now()}-${safeStorageSegment(thumbFile.name)}`;
        const { error: thumbErr } = await window.lmsSupabase.storage
          .from(COURSE_MATERIAL_BUCKET)
          .upload(thumbPath, thumbFile, { upsert: true, contentType: thumbFile.type });
        if (!thumbErr) {
          const { data: urlData } = window.lmsSupabase.storage
            .from(COURSE_MATERIAL_BUCKET).getPublicUrl(thumbPath);
          thumbnailUrl = urlData?.publicUrl || null;
        }
      }
      if (thumbnailUrl) payload.thumbnail_url = thumbnailUrl;

      let error = null;
      let courseId = editingCourseId;
      if (editingCourseId) {
        ({ error } = await window.lmsSupabase.from("courses").update(payload).eq("id", editingCourseId));
      } else {
        courseId = createClientId();
        payload.id = courseId;
        payload.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
        ({ error } = await window.lmsSupabase.from("courses").insert(payload));
      }
      if (error) throw error;
      const hasNewMaterials = modules.some((module) => module.lessons.some((lesson) => lesson.file));
      if (modules.length) {
        if (msg) { msg.textContent = "Uploading course materials..."; msg.style.color = "var(--sd-text-secondary)"; }
        await saveCourseLessons(courseId, modules);
      }
      if (hasNewMaterials) {
        await notifyActiveStudents(
          courseId,
          "material_new",
          `Materi baru tersedia di "${title}"`
        );
      }

      if (msg) { msg.textContent = "✓ Course saved!"; msg.style.color = "var(--sd-green)"; }

      setTimeout(() => {
        resetCourseBuilderForm();
        $("courseBuilderPanel").hidden = true;
        loadedSections.delete("courses");
        loadCoursesList();
      }, 1200);

    } catch (err) {
      if (msg) { msg.textContent = "Error: " + (err.message || "Save failed"); msg.style.color = "var(--sd-red)"; }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function confirmDeleteCourse(courseId, row) {
    showConfirmModal("Delete this course? This cannot be undone.", async () => {
      try {
        const { error } = await window.lmsSupabase.from("courses").delete().eq("id", courseId);
        if (error) throw error;
        row.remove();
      } catch (err) { showToastError("Delete failed: " + err.message); }
    });
    return;
  }

  function resetCourseBuilderForm() {
    editingCourseId = null;
    if ($("builderTitle")) $("builderTitle").textContent = "Create Course";
    if ($("builderMsg")) $("builderMsg").textContent = "";
    if ($("cbTitle")) $("cbTitle").value = "";
    if ($("cbCategory")) $("cbCategory").value = "";
    if ($("cbDesc")) $("cbDesc").value = "";
    if ($("cbLevel")) $("cbLevel").value = "beginner";
    if ($("cbDuration")) $("cbDuration").value = "";
    if ($("cbPassMark")) $("cbPassMark").value = 70;
    if ($("cbEnrollType")) $("cbEnrollType").value = "open";
    if ($("cbMaxStudents")) $("cbMaxStudents").value = "";
    if ($("cbPrice")) $("cbPrice").value = 0;
    if ($("cbStatus")) $("cbStatus").value = "draft";
    if ($("cbIsFeatured")) $("cbIsFeatured").value = "false";
    if ($("cbThumbnail")) $("cbThumbnail").value = "";
    if ($("cbThumbnailPreview")) $("cbThumbnailPreview").style.display = "none";
    document.querySelectorAll("#builderModulesList .ad-module-item").forEach((moduleEl, index) => {
      if (index > 0) {
        moduleEl.remove();
        return;
      }
      const moduleTitleInput = moduleEl.querySelector(".ad-module-item__header input");
      if (moduleTitleInput) moduleTitleInput.value = "";
      moduleEl.querySelectorAll(".ad-lesson-item").forEach((lessonEl, lessonIndex) => {
        if (lessonIndex > 0) {
          lessonEl.remove();
          return;
        }
        const lessonType = lessonEl.querySelector(".ad-lesson-type");
        const lessonTitle = lessonEl.querySelector(".ad-input--grow");
        if (lessonType) lessonType.value = "video";
        if (lessonTitle) lessonTitle.value = "";
        updateLessonMaterialControl(lessonEl, true);
      });
    });
  }

  async function openEditCourse(courseId) {
    try {
      const { data, error } = await window.lmsSupabase
        .from("courses")
        .select("id, title, category_id, description, level, duration_hours, pass_mark, enrollment_type, max_students, price, status, is_featured, thumbnail_url")
        .eq("id", courseId)
        .single();
      if (error) throw error;

      editingCourseId = data.id;
      $("courseBuilderPanel").hidden = false;
      $("builderTitle").textContent  = "Edit Course";
      if ($("builderMsg")) $("builderMsg").textContent = "";
      if ($("cbTitle")) $("cbTitle").value = data.title || "";
      if ($("cbCategory")) $("cbCategory").value = data.category_id || "";
      if ($("cbDesc")) $("cbDesc").value = data.description || "";
      if ($("cbLevel")) $("cbLevel").value = data.level || "beginner";
      if ($("cbDuration")) $("cbDuration").value = data.duration_hours ?? "";
      if ($("cbPassMark")) $("cbPassMark").value = data.pass_mark ?? 70;
      if ($("cbEnrollType")) $("cbEnrollType").value = data.enrollment_type || "open";
      if ($("cbMaxStudents")) $("cbMaxStudents").value = data.max_students ?? "";
      if ($("cbPrice")) $("cbPrice").value = data.price ?? 0;
      if ($("cbStatus")) $("cbStatus").value = data.status || "draft";
      if ($("cbIsFeatured")) $("cbIsFeatured").value = data.is_featured ? "true" : "false";
      // Show existing thumbnail if available
      if (data.thumbnail_url && $("cbThumbnailImg") && $("cbThumbnailPreview")) {
        const safeUrl = toSafeUiUrl(data.thumbnail_url);
        if (safeUrl) {
          $("cbThumbnailImg").src = safeUrl;
          $("cbThumbnailPreview").style.display = "block";
        }
      }
      $("courseBuilderPanel").scrollIntoView({ behavior: "smooth" });

      // Load existing lessons ke builder
      try {
        const { data: existingLessons } = await window.lmsSupabase
          .from("lessons")
          .select("id, title, material_type, module_title, module_order, lesson_order, material_url, material_path")
          .eq("course_id", courseId)
          .order("lesson_order", { ascending: true });

        if (existingLessons && existingLessons.length > 0) {
          // Group by module
          const moduleMap = new Map();
          existingLessons.forEach((lesson) => {
            const key = lesson.module_order || 1;
            if (!moduleMap.has(key)) {
              moduleMap.set(key, {
                title: lesson.module_title || `Module ${key}`,
                lessons: []
              });
            }
            moduleMap.get(key).lessons.push(lesson);
          });

          // Clear existing modules, keep the template module available for addModule().
          const modulesList = $("builderModulesList");
          if (!modulesList) return;
          const templateModule = modulesList.querySelector("#moduleTemplate") || modulesList.querySelector(".ad-module-item");
          const lessonTemplate = modulesList.querySelector(".ad-lesson-item")?.cloneNode(true);
          modulesList.querySelectorAll(".ad-module-item").forEach((el) => {
            if (el !== templateModule) el.remove();
          });

          const sortedModules = [...moduleMap.entries()].sort((a, b) => a[0] - b[0]);
          for (const [index, [, moduleData]] of sortedModules.entries()) {
            if (index > 0) addModule(); // tambah module baru
            const moduleEls = modulesList.querySelectorAll(".ad-module-item");
            const lastModule = index === 0 && templateModule
              ? templateModule
              : moduleEls[moduleEls.length - 1];
            if (!lastModule) continue;
            const titleInput = lastModule.querySelector(".ad-module-item__header input");
            if (titleInput) titleInput.value = moduleData.title;

            // Hapus lesson template pertama, tambah per lesson
            lastModule.querySelectorAll(".ad-lesson-item").forEach((el) => el.remove());
            for (const lesson of moduleData.lessons) {
              const lastLesson = lessonTemplate?.cloneNode(true);
              if (!lastLesson) continue;
              const fileInput = lastLesson.querySelector(".ad-material-input");
              if (fileInput) fileInput.value = "";
              lastModule.querySelector(".ad-lessons-list")?.appendChild(lastLesson);
              const typeSelect = lastLesson.querySelector(".ad-lesson-type");
              const titleEl = lastLesson.querySelector(".ad-input--grow");
              const fileLabel = lastLesson.querySelector(".ad-material-file");
              if (typeSelect) typeSelect.value = lesson.material_type || "video";
              if (titleEl) titleEl.value = lesson.title || "";
              if (fileLabel && lesson.material_url) {
                const filename = lesson.material_url.split("/").pop();
                fileLabel.textContent = filename || "Existing file";
                fileLabel.style.color = "var(--sd-green)";
                fileLabel.dataset.existingUrl = lesson.material_url;
                if (lesson.material_path) fileLabel.dataset.existingPath = lesson.material_path;
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not load existing lessons for edit:", err.message);
      }
    } catch (err) {
      showToastError("Edit failed: " + err.message);
    }
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
      const gradingAssignmentIds = await getTrainerGradingAssignmentIds();
      if (currentRole === "trainer" && gradingAssignmentIds.length === 0) {
        if (empty) empty.style.display = "flex";
        return;
      }

      let query = window.lmsSupabase
        .from("assignment_submissions")
        .select("id, student_id, assignment_id, status, submitted_at, grade, notes, file_urls")
        .order("submitted_at", { ascending: false })
        .limit(20);

      if (filter !== "all") query = query.eq("status", filter);
      if (currentRole === "trainer") query = query.in("assignment_id", gradingAssignmentIds);

      const { data, error } = await query;
      if (error) throw error;

      const visibleSubmissions = await hydrateSubmissionQueueRows(data || []);

      if (!visibleSubmissions || visibleSubmissions.length === 0) { if (empty) empty.style.display = "flex"; return; }
      if (empty) empty.style.display = "none";

      visibleSubmissions.forEach((sub) => {
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

  async function hydrateSubmissionQueueRows(submissions) {
    const studentIds = [...new Set((submissions || []).map((sub) => sub.student_id).filter(Boolean))];
    const assignmentIds = [...new Set((submissions || []).map((sub) => sub.assignment_id).filter(Boolean))];
    let profileRows = [];
    let assignmentRows = [];
    try {
      if (studentIds.length) {
        const { data } = await window.lmsSupabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds);
        profileRows = data || [];
      }
    } catch {
      profileRows = [];
    }
    try {
      if (assignmentIds.length) {
        const { data } = await window.lmsSupabase
          .from("assignments")
          .select("id, title, trainer_id, pass_mark, course_id")
          .in("id", assignmentIds);
        assignmentRows = data || [];
      }
    } catch {
      assignmentRows = [];
    }
    const profileMap = new Map(profileRows.map((profile) => [profile.id, profile]));
    const assignmentMap = new Map(assignmentRows.map((assignment) => [assignment.id, assignment]));
    return (submissions || []).map((sub) => ({
      ...sub,
      profiles: sub.profiles || profileMap.get(sub.student_id) || null,
      assignments: sub.assignments || assignmentMap.get(sub.assignment_id) || null
    }));
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
        const safeUrl = toSafeUiUrl(url);
        if (!safeUrl) return "";
        return `<a href="${escHtml(safeUrl || "")}" target="_blank" rel="noopener" class="ad-file-chip">
          📄 ${escHtml(name)}
        </a>`;
      }).join("") || "<span style='color:var(--sd-text-muted);font-size:.82rem'>No files</span>";
    }
  }

  async function loadMyAssignments() {
    const list = $("myAssignmentsList");
    const empty = $("myAssignmentsEmpty");
    if (!list || !window.lmsSupabase || !currentProfile?.id) return;

    try {
      const { data, error } = await window.lmsSupabase
        .from("assignments")
        .select("id, title, type, due_at, pass_mark, max_score, is_published, courses(title)")
        .eq("trainer_id", currentProfile.id)
        .order("due_at", { ascending: true });

      list.querySelectorAll(".ad-assignment-row").forEach((el) => el.remove());

      if (error) throw error;
      if (!data || data.length === 0) {
        if (empty) empty.style.display = "block";
        return;
      }
      if (empty) empty.style.display = "none";

      data.forEach((assignment) => {
        const isOverdue = assignment.due_at && new Date(assignment.due_at) < new Date();
        const dueLabel = assignment.due_at
          ? new Date(assignment.due_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
          : "—";
        const row = document.createElement("div");
        row.className = "ad-assignment-row";
        row.style.cssText = "display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--sd-border);";
        row.innerHTML = `
          <div style="flex:1;min-width:0;">
            <p style="font-weight:600;margin:0;font-size:.875rem;">${escHtml(assignment.title)}</p>
            <p style="margin:2px 0 0;font-size:.78rem;color:var(--sd-text-muted);">
              ${escHtml(assignment.courses?.title || "—")} &nbsp;·&nbsp;
              <span style="color:${isOverdue ? "var(--sd-red)" : "inherit"};">
                Deadline: ${escHtml(dueLabel)}${isOverdue ? " ⚠️" : ""}
              </span>
            </p>
          </div>
          <span class="ad-tag ${assignment.is_published ? "ad-tag--green" : "ad-tag--gray"}" style="white-space:nowrap;">
            ${assignment.is_published ? "Published" : "Draft"}
          </span>
          <button class="ad-icon-btn ad-icon-btn--danger" data-delete-assignment="${assignment.id}" aria-label="Hapus tugas">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>`;

        row.querySelector("[data-delete-assignment]")?.addEventListener("click", () => {
          showConfirmModal("Hapus tugas ini? Semua submission yang ada akan ikut terhapus.", async () => {
            await window.lmsSupabase.from("assignments").delete().eq("id", assignment.id).catch(() => {});
            row.remove();
            loadMyAssignments();
            loadSubmissionQueue(currentGradingFilter);
          });
          return;
        });

        list.appendChild(row);
      });
    } catch (err) {
      console.warn("loadMyAssignments error:", err.message);
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
          currentGradingFilter = tab.dataset.filter || "submitted";
          loadSubmissionQueue(currentGradingFilter);
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

  function setupAssignmentForm() {
    const createBtn = $("createAssignmentBtn");
    const card = $("assignmentFormCard");
    const closeBtn = $("closeAssignmentForm");
    const cancelBtn = $("cancelAssignmentBtn");
    const saveBtn = $("saveAssignmentBtn");
    const msg = $("assignmentFormMsg");

    const setMsg = (text, isErr = false) => {
      if (!msg) return;
      msg.textContent = text || "";
      msg.style.color = isErr ? "var(--sd-red)" : "var(--sd-green)";
    };

    const resetForm = () => {
      if ($("atTitle")) $("atTitle").value = "";
      if ($("atDesc")) $("atDesc").value = "";
      if ($("atCourse")) $("atCourse").value = "";
      if ($("atType")) $("atType").value = "assignment";
      if ($("atDueAt")) $("atDueAt").value = "";
      if ($("atPassMark")) $("atPassMark").value = 70;
      if ($("atMaxScore")) $("atMaxScore").value = 100;
      setMsg("");
    };

    const openForm = async () => {
      resetForm();
      card.hidden = false;
      const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      if ($("atDueAt")) $("atDueAt").min = nowLocal;
      // Reset cache agar kursus baru terlihat
      const atCourse = $("atCourse");
      if (atCourse) atCourse.dataset.loaded = "";
      await populateCourseSelect("atCourse");
      card.scrollIntoView({ behavior: "smooth" });
    };

    const closeForm = () => {
      resetForm();
      card.hidden = true;
    };

    createBtn && createBtn.addEventListener("click", openForm);
    closeBtn && closeBtn.addEventListener("click", closeForm);
    cancelBtn && cancelBtn.addEventListener("click", closeForm);
    saveBtn && saveBtn.addEventListener("click", saveAssignment);
  }

  async function saveAssignment() {
    const msg = $("assignmentFormMsg");
    const saveBtn = $("saveAssignmentBtn");
    const title = $("atTitle")?.value.trim();
    const courseId = $("atCourse")?.value;
    const dueAt = $("atDueAt")?.value;
    const setMsg = (text, isErr = false) => {
      if (!msg) return;
      msg.textContent = text || "";
      msg.style.color = isErr ? "var(--sd-red)" : "var(--sd-green)";
    };
    const closeForm = () => {
      if ($("atTitle")) $("atTitle").value = "";
      if ($("atDesc")) $("atDesc").value = "";
      if ($("atCourse")) $("atCourse").value = "";
      if ($("atType")) $("atType").value = "assignment";
      if ($("atDueAt")) $("atDueAt").value = "";
      if ($("atPassMark")) $("atPassMark").value = 70;
      if ($("atMaxScore")) $("atMaxScore").value = 100;
      setMsg("");
      if ($("assignmentFormCard")) $("assignmentFormCard").hidden = true;
    };

    if (!title || !courseId || !dueAt) {
      setMsg("Judul, kursus, dan deadline wajib diisi.", true);
      return;
    }
    // Validasi deadline tidak boleh di masa lalu
    const dueAtDate = new Date(dueAt);
    if (isNaN(dueAtDate.getTime()) || dueAtDate <= new Date()) {
      setMsg("Deadline harus di masa mendatang.", true);
      return;
    }
    if (saveBtn) saveBtn.disabled = true;
    try {
      const payload = {
        trainer_id: currentProfile.id,
        course_id: courseId,
        title,
        description: $("atDesc")?.value.trim() || null,
        type: $("atType")?.value || "assignment",
        due_at: new Date(dueAt).toISOString(),
        pass_mark: parseInt($("atPassMark")?.value || 70, 10),
        max_score: parseInt($("atMaxScore")?.value || 100, 10),
        is_published: true,
      };
      const { error } = await window.lmsSupabase.from("assignments").insert(payload);
      if (error) throw error;

      // Ambil semua student yang enroll di kursus ini
      try {
        const { data: enrollments } = await window.lmsSupabase
          .from("enrollments")
          .select("student_id")
          .eq("course_id", courseId)
          .eq("status", "active");

        const studentIds = (enrollments || [])
          .map((e) => e.student_id)
          .filter(Boolean);

        if (studentIds.length > 0) {
          const dueDate = new Date(dueAt).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric"
          });
          const notifRows = studentIds.map((studentId) => ({
            user_id: studentId,
            type: "assignment_new",
            title: `Tugas baru: "${title}" — Deadline ${dueDate}`,
            is_read: false,
          }));
          await window.lmsSupabase.from("notifications").insert(notifRows).catch(() => {});
        }
      } catch {
        // Notifikasi non-blocking — jangan throw
      }

      setMsg("✓ Tugas berhasil dibuat!");
      setTimeout(() => { closeForm(); loadSubmissionQueue(currentGradingFilter); loadMyAssignments(); }, 1200);
    } catch (err) {
      setMsg("Error: " + (err.message || "Gagal menyimpan"), true);
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  async function recalculateCourseProgressForStudent(studentId, courseId) {
    if (!studentId || !courseId || !window.lmsSupabase) return null;
    const { data, error } = await window.lmsSupabase.rpc("recalculate_course_progress", {
      p_student_id: studentId,
      p_course_id: courseId,
      p_last_lesson_id: null
    });
    if (error) throw error;
    return data?.completion_percent ?? null;
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
    if (score < 0 || score > 100) {
      if (msg) { msg.textContent = "Grade harus antara 0–100"; msg.className = "ad-grading-msg error"; }
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

      // Fetch submission data to notify the student with the assignment result.
      const { data: submissionData } = await window.lmsSupabase
        .from("assignment_submissions")
        .select("assignment_id, student_id, assignments(title, course_id, pass_mark)")
        .eq("id", selectedSubmissionId)
        .single();

      if (submissionData?.student_id) {
        const assignmentData = Array.isArray(submissionData.assignments)
          ? submissionData.assignments[0]
          : submissionData.assignments;
        const assignmentTitle = assignmentData?.title || "Assignment";
        const isPass = newStatus === "graded" && !isNaN(score) && score >= (assignmentData?.pass_mark || 70);
        const notifTitle = newStatus === "graded"
          ? `Your assignment "${assignmentTitle}" has been graded: ${score}% (${isPass ? "PASS" : "FAIL"})`
          : `Your assignment "${assignmentTitle}" needs resubmission.`;

        await recalculateCourseProgressForStudent(submissionData.student_id, assignmentData?.course_id);

        await window.lmsSupabase.from("notifications").insert({
          user_id: submissionData.student_id,
          type: "assignment_graded",
          title: notifTitle,
          is_read: false,
        }).catch(() => {});
      }

      if (msg) { msg.textContent = "✓ Saved! Student notified."; msg.className = "ad-grading-msg success"; }
      setTimeout(() => {
        loadSubmissionQueue(currentGradingFilter);
        // Reset grading panel state
        selectedSubmissionId = null;
        const gradingForm = $("gradingForm");
        const gradingPanelEmpty = $("gradingPanelEmpty");
        if (gradingForm) gradingForm.hidden = true;
        if (gradingPanelEmpty) gradingPanelEmpty.style.display = "flex";
        document.querySelectorAll(".ad-submission-item").forEach((el) => el.classList.remove("active"));
        if ($("gradeScore")) $("gradeScore").value = "";
        if ($("gradeFeedback")) $("gradeFeedback").value = "";
        if ($("gradeResult")) { $("gradeResult").textContent = "—"; $("gradeResult").className = "ad-grade-result"; }
      }, 1500);

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
  async function populateCourseSelect(selectId) {
    const select = $(selectId);
    if (!select || select.dataset.loaded === "true") return;

    try {
      let courseQuery = window.lmsSupabase
        .from("courses")
        .select("id, title")
        .order("title");
      if (currentRole !== "admin") {
        courseQuery = courseQuery.eq("trainer_id", currentProfile.id);
      }
      const { data, error } = await courseQuery;
      if (error) throw error;

      const defaultOption = select.querySelector("option[value='']");
      select.innerHTML = "";
      if (defaultOption) select.appendChild(defaultOption);

      (data || []).forEach((course) => {
        const option = document.createElement("option");
        option.value = course.id;
        option.textContent = course.title || "";
        select.appendChild(option);
      });

      select.dataset.loaded = "true";
    } catch (err) {
      console.warn("course select load error:", err.message || err);
    }
  }

  async function getActiveStudentIdsForCourseNotification(courseId = null) {
    if (!window.lmsSupabase || !currentProfile?.id) return [];
    let courseIds = courseId ? [courseId] : [];

    if (!courseIds.length) {
      const { data: courses, error: courseErr } = await window.lmsSupabase
        .from("courses")
        .select("id")
        .eq("trainer_id", currentProfile.id);
      if (courseErr) throw courseErr;
      courseIds = (courses || []).map((course) => course.id).filter(Boolean);
    }
    if (!courseIds.length) return [];

    const { data: enrollments, error } = await window.lmsSupabase
      .from("enrollments")
      .select("student_id")
      .in("course_id", courseIds)
      .eq("status", "active");
    if (error) throw error;

    return [...new Set((enrollments || []).map((row) => row.student_id).filter(Boolean))];
  }

  async function notifyActiveStudents(courseId, type, title) {
    try {
      const studentIds = await getActiveStudentIdsForCourseNotification(courseId);
      if (!studentIds.length) return;
      const rows = studentIds.map((studentId) => ({
        user_id: studentId,
        type,
        title,
        is_read: false
      }));
      await window.lmsSupabase.from("notifications").insert(rows).catch(() => {});
    } catch {
      // Notification delivery is non-blocking for creator workflows.
    }
  }

  function setupScheduleForm() {
    const createBtn = $("createEventBtn");
    const card      = $("eventFormCard");
    const cancelBtn = $("cancelEventBtn");
    const saveBtn   = $("saveEventBtn");

    ["evTitle", "evStart", "evEnd"].forEach((id) => { if ($(id)) $(id).required = true; });

    createBtn && createBtn.addEventListener("click", async () => {
      card.hidden = false;
      const evCourse = $("evCourse");
      if (evCourse) evCourse.dataset.loaded = "";
      await populateCourseSelect("evCourse");
      card.scrollIntoView({ behavior: "smooth" });
    });
    cancelBtn && cancelBtn.addEventListener("click", () => { card.hidden = true; });
    saveBtn   && saveBtn.addEventListener("click",   saveEvent);
    card && card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.target.tagName === "TEXTAREA") return;
      e.preventDefault();
      saveBtn && saveBtn.click();
    });
  }

  async function saveEvent() {
    const msg    = $("eventMsg");
    const saveBtn = $("saveEventBtn");
    const title  = $("evTitle")?.value.trim();
    const start  = $("evStart")?.value;
    const end    = $("evEnd")?.value;
    const eventFields = ["evTitle", "evStart", "evEnd", "evMeetingUrl"].map((id) => $(id)).filter(Boolean);
    if (eventFields.some((field) => !field.reportValidity())) return;

    if (!title || !start || !end) {
      if (msg) { msg.textContent = "Title, start and end time are required"; msg.style.color = "var(--sd-red)"; }
      return;
    }

    if (saveBtn) saveBtn.disabled = true;

    try {
      const meetingUrl = toSafeUiUrl($("evMeetingUrl")?.value.trim() || "");
      const payload = {
        trainer_id:      currentProfile.id,
        title,
        event_type:      $("evType")?.value || "live_session",
        start_datetime:  new Date(start).toISOString(),
        end_datetime:    new Date(end).toISOString(),
        meeting_url:     meetingUrl || null,
        course_id:       $("evCourse")?.value || null,
        is_mandatory:    $("evMandatory")?.value === "true",
      };

      const { error } = await window.lmsSupabase.from("schedules").insert(payload);
      if (error) throw error;

      await notifyActiveStudents(
        payload.course_id,
        "schedule_new",
        `Jadwal baru: "${title}" - ${formatDT(payload.start_datetime)}`
      );

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
      let evQuery = window.lmsSupabase
        .from("schedules")
        .select("id, title, event_type, start_datetime, end_datetime, meeting_url, courses(title)")
        .gte("start_datetime", new Date().toISOString())
        .order("start_datetime", { ascending: true })
        .limit(10);
      if (currentRole !== "admin") {
        evQuery = evQuery.eq("trainer_id", currentProfile.id);
      }
      const { data } = await evQuery;

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
          ${toSafeUiUrl(ev.meeting_url) ? `<a href="${escHtml(toSafeUiUrl(ev.meeting_url))}" target="_blank" rel="noopener" class="ad-btn ad-btn--outline ad-btn--sm">Join</a>` : ""}
          <button class="ad-icon-btn ad-icon-btn--danger" data-event-id="${ev.id}" aria-label="Delete event">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>`;

        row.querySelector(".ad-icon-btn--danger").addEventListener("click", () => {
          showConfirmModal("Delete this event?", async () => {
            await window.lmsSupabase.from("schedules").delete().eq("id", ev.id).catch(() => {});
            row.remove();
          });
          return;
        });

        list.insertBefore(row, empty);
      });
    } catch (err) { console.warn("Events load error:", err.message); }
  }

  /* ================================================================
     MESSAGES
  ================================================================ */
  const MAX_MESSAGE_RECIPIENTS = 50;
  let messageComposerBound = false;
  let activeMessageView = "inbox";
  let adminUnreadMessages = 0;
  let adminUnreadNotifications = 0;

  function updateAdminAttentionIndicators() {
    const sectionBadges = [
      { id: "adCourseBadge", count: adminUnreadSections.courses },
      { id: "gradingBadge", count: adminUnreadSections.grading },
      { id: "adScheduleBadge", count: adminUnreadSections.schedule }
    ];
    sectionBadges.forEach(({ id, count }) => {
      const badge = $(id);
      if (!badge) return;
      const existingCount = id === "gradingBadge" ? parseInt(badge.textContent || "0", 10) || 0 : 0;
      const nextCount = Math.max(count, existingCount);
      badge.textContent = nextCount;
      badge.style.display = nextCount > 0 ? "inline-block" : "none";
    });
    const msgBadge = $("adMsgBadge");
    if (msgBadge) {
      msgBadge.textContent = adminUnreadMessages;
      msgBadge.style.display = adminUnreadMessages > 0 ? "inline-block" : "none";
    }
    const dot = $("adNotifDot");
    if (dot) dot.style.display = (adminUnreadMessages + adminUnreadNotifications) > 0 ? "block" : "none";
  }

  function adminNotificationSection(type) {
    return {
      assignment_new: "grading",
      assignment_graded: "grading",
      submission_received: "grading",
      course_enrolled: "courses",
      material_new: "courses",
      schedule_new: "schedule",
      session_reminder: "schedule"
    }[type] || "";
  }

  function updateAdminSectionNotificationCounts(notifs = []) {
    const counts = { courses: 0, grading: 0, schedule: 0 };
    (notifs || []).forEach((notif) => {
      if (notif.is_read) return;
      const section = adminNotificationSection(notif.type);
      if (section && Object.prototype.hasOwnProperty.call(counts, section)) counts[section] += 1;
    });
    adminUnreadSections = counts;
  }

  async function refreshAdminMessageIndicators(userId = currentProfile?.id) {
    if (!userId || !window.lmsSupabase) return;
    try {
      const { data, error } = await window.lmsSupabase
        .from("messages")
        .select("id")
        .eq("recipient_id", userId)
        .eq("is_read", false)
        .or("is_archived.eq.false,is_archived.is.null");
      if (error) throw error;
      adminUnreadMessages = (data || []).length;
    } catch {
      adminUnreadMessages = 0;
    }
    updateAdminAttentionIndicators();
  }

  function setComposerStatus(text, isError = false) {
    const msg = $("adMsgComposeMsg");
    if (!msg) return;
    msg.textContent = text || "";
    msg.style.color = isError ? "var(--sd-red)" : "var(--sd-green)";
  }

  function setMessagePanelVisible(el, visible) {
    if (!el) return;
    el.hidden = !visible;
    el.style.display = visible ? "block" : "none";
    // Ensure the element is visible when shown
    if (visible) {
      el.style.visibility = "visible";
    }
  }

  function getSelectedMessageRecipients(recipient = $("adMsgRecipient")) {
    return Array.from(recipient?.selectedOptions || [])
      .map((option) => option.value)
      .filter(Boolean);
  }

  function setMessageRecipientDropdownOpen(open) {
    const toggle = $("adMsgRecipientToggle");
    const panel = $("adMsgRecipientPanel");
    if (!toggle || !panel) return;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function updateMessageRecipientSummary() {
    const recipient = $("adMsgRecipient");
    const summary = $("adMsgRecipientSummary");
    if (!summary) return;

    const selected = Array.from(recipient?.selectedOptions || []);
    if (selected.length === 0) {
      summary.textContent = tSafe("adMsgSelectRecipient", "Select recipients (max 50)");
    } else if (selected.length === 1) {
      summary.textContent = selected[0].dataset.label || selected[0].textContent || selected[0].value;
    } else {
      summary.textContent = tSafe("adMsgSelectedCount", "{count} recipients selected").replace("{count}", selected.length);
    }
  }

  function syncMessageRecipientCheckboxes() {
    const recipient = $("adMsgRecipient");
    const list = $("adMsgRecipientList");
    if (!recipient || !list) return;

    Array.from(list.querySelectorAll("input[type='checkbox'][data-recipient-id]")).forEach((checkbox) => {
      const option = Array.from(recipient.options).find((item) => item.value === checkbox.dataset.recipientId);
      checkbox.checked = Boolean(option?.selected);
    });
    updateMessageRecipientSummary();
  }

  function enforceMessageRecipientLimit() {
    const recipient = $("adMsgRecipient");
    const selectedOptions = Array.from(recipient?.selectedOptions || []).filter((option) => option.value);
    if (selectedOptions.length <= MAX_MESSAGE_RECIPIENTS) return;
    selectedOptions.slice(MAX_MESSAGE_RECIPIENTS).forEach((option) => {
      option.selected = false;
    });
    syncMessageRecipientCheckboxes();
    setComposerStatus(tSafe("adMsgTooManyRecipients", "You can select up to 50 recipients at once."), true);
  }

  function closeMessageComposer() {
    const composeForm = $("adMsgComposeForm");
    const viewEmpty = $("adMsgViewEmpty");
    const viewDetail = $("adMsgDetail");
    setMessagePanelVisible(composeForm, false);
    setMessageRecipientDropdownOpen(false);
    setComposerStatus("");
    if (viewDetail && viewDetail.innerHTML.trim()) {
      setMessagePanelVisible(viewDetail, true);
      return;
    }
    setMessagePanelVisible(viewEmpty, true);
  }

  async function loadMessageRecipients() {
    const recipient = $("adMsgRecipient");
    const toggle = $("adMsgRecipientToggle");
    const list = $("adMsgRecipientList");
    if (!recipient || !toggle || !list || !window.lmsSupabase || !currentProfile?.id) return [];

    toggle.disabled = true;
    recipient.innerHTML = "";
    list.innerHTML = "";
    updateMessageRecipientSummary();

    const { data, error } = await window.lmsSupabase
      .from("profiles")
      .select("id, full_name, email, role")
      .order("full_name", { ascending: true });
    if (error) throw error;
    const recipients = (data || []).filter((profile) => profile.id && profile.id !== currentProfile.id);

    recipients.forEach((profile) => {
      const labelText = profile.full_name || profile.email || profile.id;
      const option = document.createElement("option");
      option.value = profile.id;
      option.dataset.label = labelText;
      option.textContent = labelText;
      recipient.appendChild(option);

      const label = document.createElement("label");
      label.className = "ad-recipient-option";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.recipientId = profile.id;
      checkbox.addEventListener("change", () => {
        option.selected = checkbox.checked;
        enforceMessageRecipientLimit();
        updateMessageRecipientSummary();
      });
      const text = document.createElement("span");
      text.textContent = labelText;
      label.appendChild(checkbox);
      label.appendChild(text);
      list.appendChild(label);
    });

    toggle.disabled = recipients.length === 0;
    if (recipients.length === 0) setComposerStatus(tSafe("adMsgNoRecipients", "No recipients available."), true);
    updateMessageRecipientSummary();
    return recipients;
  }

  async function sendComposedMessage(e) {
    if (e) e.preventDefault();
    const recipient = $("adMsgRecipient");
    const body = $("adMsgBody");
    const sendBtn = $("adSendMsgBtn");
    if (sendBtn?.disabled) return;
    const recipientIds = getSelectedMessageRecipients(recipient);
    const messageBody = body?.value.trim() || "";

    if (recipientIds.length === 0 || !messageBody) {
      setComposerStatus(tSafe("adMsgRequired", "Recipient and message are required."), true);
      return;
    }
    if (recipientIds.length > MAX_MESSAGE_RECIPIENTS) {
      setComposerStatus(tSafe("adMsgTooManyRecipients", "You can select up to 50 recipients at once."), true);
      return;
    }
    if (!window.lmsSupabase || !currentProfile?.id) return;

    try {
      if (sendBtn) sendBtn.disabled = true;
      const messageSubject = ($("adMsgSubject")?.value.trim()) || null;
      const messageRows = recipientIds.map((recipientId) => ({
        id: createClientId(),
        sender_id: currentProfile.id,
        recipient_id: recipientId,
        subject: messageSubject,
        body: messageBody
      }));
      const { error } = await window.lmsSupabase
        .from("messages")
        .insert(messageRows);
      if (error) throw error;
      await Promise.all(messageRows.map((message) => sendMessageEmailNotification(message.id)));
      if (body) body.value = "";
      const subjectEl = $("adMsgSubject");
      if (subjectEl) subjectEl.value = "";
      Array.from(recipient?.options || []).forEach((option) => {
        option.selected = false;
      });
      syncMessageRecipientCheckboxes();
      setMessageRecipientDropdownOpen(false);
      setComposerStatus(tSafe("adMsgSent", "Message sent."));
      activeMessageView = "history";
      loadedSections.delete("messages");
      await loadMessages();
    } catch (err) {
      setComposerStatus(err.message || "Message failed.", true);
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  function getReplySubject(subject) {
    const value = String(subject || "Message").trim();
    return /^re:/i.test(value) ? value : `Re: ${value}`;
  }

  async function openMessageComposer(selectedRecipientId = "", options = {}) {
    if (window._adActivateSection) window._adActivateSection("messages");

    const viewEmpty = $("adMsgViewEmpty");
    const viewDetail = $("adMsgDetail");
    const composeForm = $("adMsgComposeForm");
    const recipient = $("adMsgRecipient");
    const subject = $("adMsgSubject");
    const body = $("adMsgBody");
    const sendBtn = $("adSendMsgBtn");
    const cancelBtn = $("adCancelMsgBtn");
    if (!composeForm) return;

    setMessagePanelVisible(viewEmpty, false);
    setMessagePanelVisible(viewDetail, false);
    setMessagePanelVisible(composeForm, true);
    setComposerStatus("");

    if (!messageComposerBound) {
      composeForm.addEventListener("submit", sendComposedMessage);
      sendBtn && sendBtn.addEventListener("click", sendComposedMessage);
      cancelBtn && cancelBtn.addEventListener("click", closeMessageComposer);
      recipient && recipient.addEventListener("change", enforceMessageRecipientLimit);
      const toggle = $("adMsgRecipientToggle");
      const panel = $("adMsgRecipientPanel");
      toggle && toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        setMessageRecipientDropdownOpen(panel?.hidden !== false);
      });
      panel && panel.addEventListener("click", (event) => event.stopPropagation());
      document.addEventListener("click", () => setMessageRecipientDropdownOpen(false));
      messageComposerBound = true;
    }

    try {
      await loadMessageRecipients();
      const selectedOption = Array.from(recipient?.options || []).find((option) => option.value === selectedRecipientId);
      if (selectedOption) {
        selectedOption.selected = true;
      }
      syncMessageRecipientCheckboxes();
    } catch (err) {
      setComposerStatus(err.message || "Recipients failed to load.", true);
    }

    if (subject && options.subject) subject.value = options.subject;
    if (body) body.focus();
  }

  async function archiveMessage(messageIds, archived = true) {
    if (!messageIds?.length || !window.lmsSupabase) return;
    const { error } = await window.lmsSupabase.from("messages")
      .update({ is_archived: archived })
      .in("id", messageIds);
    if (error) throw error;
  }

  function bindMessageViewTabs() {
    const tabs = document.querySelectorAll("#section-messages [data-message-view]");
    tabs.forEach((tab) => {
      if (tab.dataset.bound === "true") return;
      tab.dataset.bound = "true";
      tab.addEventListener("click", async () => {
        activeMessageView = tab.dataset.messageView || "history";
        tabs.forEach((item) => item.classList.toggle("active", item === tab));
        await loadMessages();
      });
    });
    tabs.forEach((tab) => {
      tab.classList.toggle("active", (tab.dataset.messageView || "inbox") === activeMessageView);
    });
  }

  function groupMessagesForHistory(messages) {
    const groups = new Map();
    (messages || []).forEach((msg) => {
      const isSent = msg.sender_id === currentProfile.id;
      const batchTime = msg.created_at ? String(msg.created_at).slice(0, 19) : "pending";
      const groupId = isSent
        ? `sent:${msg.sender_id}|${msg.subject || ""}|${msg.body || ""}|${batchTime}`
        : `received:${msg.id}`;
      if (!groups.has(groupId)) {
        groups.set(groupId, {
          id: groupId,
          type: isSent ? "sent" : "received",
          subject: msg.subject || "Message",
          body: msg.body || "",
          created_at: msg.created_at,
          sender_id: msg.sender_id,
          messages: []
        });
      }
      groups.get(groupId).messages.push(msg);
    });

    return Array.from(groups.values()).map((group) => {
      group.messages.sort((a, b) => String(a.recipient_id || "").localeCompare(String(b.recipient_id || "")));
      group.key = `${group.type}:${group.messages.map((msg) => msg.id).sort().join(",")}`;
      group.isUnread = group.messages.some((msg) => !msg.is_read && msg.recipient_id === currentProfile.id);
      return group;
    });
  }

  async function loadMessages(...args) {
    const [options = {}] = args;
    const selectedMessageId = options?.selectedMessageId ? String(options.selectedMessageId) : "";
    const inbox = $("adInboxList");
    const empty = $("adInboxEmpty");
    const viewEmpty = $("adMsgViewEmpty");
    // adMsgDetail should exist; fallback to adMessageView container if missing
    const viewDetail = $("adMsgDetail") || $("adMessageView");
    const composeForm = $("adMsgComposeForm");
    if (!inbox) return;

    try {
      bindMessageViewTabs();
      const messageSelect = "id, sender_id, recipient_id, subject, body, is_read, read_at, is_archived, created_at";
      // Profiles diambil terpisah lewat profileMap di bawah — sudah benar.
      const [{ data: receivedData, error: receivedError }, { data: sentData, error: sentError }] = await Promise.all([
        (() => {
          const q = window.lmsSupabase
            .from("messages")
            .select(messageSelect)
            .eq("recipient_id", currentProfile.id);
          return activeMessageView === "archive"
            ? q.eq("is_archived", true)
            : q.or("is_archived.eq.false,is_archived.is.null");
        })()
          .order("created_at", { ascending: false })
          .limit(100),
        (() => {
          const q = window.lmsSupabase
            .from("messages")
            .select(messageSelect)
            .eq("sender_id", currentProfile.id);
          return activeMessageView === "archive"
            ? q.eq("is_archived", true)
            : q.or("is_archived.eq.false,is_archived.is.null");
        })()
          .order("created_at", { ascending: false })
          .limit(100)
      ]);
      if (receivedError || sentError) throw receivedError || sentError;
      const data = Array.from(
        new Map([...(receivedData || []), ...(sentData || [])].map((msg) => [msg.id, msg])).values()
      ).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 100);

      inbox.querySelectorAll(".ad-inbox-item").forEach((el) => el.remove());
      setMessagePanelVisible(viewDetail, false);
      setMessagePanelVisible(viewEmpty, true);

      const emptyText = empty?.querySelector("p");
      if (emptyText) {
        const emptyByView = {
          inbox: "No incoming messages",
          history: "No sent history",
          archive: "No archived messages"
        };
        emptyText.textContent = emptyByView[activeMessageView] || "No messages";
      }

      if (!data || data.length === 0) {
        adminUnreadMessages = 0;
        updateAdminAttentionIndicators();
        if (empty) empty.style.display = "flex";
        return;
      }

      const unread = data.filter((m) => !m.is_read && m.recipient_id === currentProfile.id).length;
      adminUnreadMessages = unread;
      updateAdminAttentionIndicators();

      const profileIds = Array.from(new Set(data.flatMap((msg) => [msg.sender_id, msg.recipient_id]).filter(Boolean)));
      const profileMap = new Map();
      if (profileIds.length > 0) {
        const { data: profiles } = await window.lmsSupabase
          .from("profiles")
          .select("id, full_name, email, role")
          .in("id", profileIds);
        (profiles || []).forEach((profile) => profileMap.set(profile.id, profile));
      }

      const groups = groupMessagesForHistory(data).filter((group) => {
        if (activeMessageView === "archive") return true;
        if (activeMessageView === "history") return group.type === "sent";
        return group.type === "received";
      });

      if (empty) empty.style.display = groups.length === 0 ? "flex" : "none";
      if (groups.length === 0) return;

      const refreshMessageBadges = () => {
        adminUnreadMessages = data.filter((m) => !m.is_read && m.recipient_id === currentProfile.id && !m.is_archived).length;
        updateAdminAttentionIndicators();
      };

      const renderMessageDetail = async (group) => {
        if (!viewDetail) return;
        try {
          setMessagePanelVisible(viewEmpty, false);
          setMessagePanelVisible(composeForm, false);
          setMessagePanelVisible(viewDetail, true);

          if (group.type === "received") {
            const msg = group.messages[0];
            if (!msg.is_read && msg.recipient_id === currentProfile.id) {
              const { error } = await window.lmsSupabase
                .from("messages")
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq("id", msg.id);
              if (error) {
                showToastError(error.message || "Message read status failed.");
              } else {
                msg.is_read = true;
                refreshMessageBadges();
              }
            }
            const sender = profileMap.get(msg.sender_id) || msg.profiles || {};
            viewDetail.innerHTML = `
              <div class="ad-message-view__detail">
                <p class="ad-inbox-item__name">${escHtml(group.subject)}</p>
                <p class="ad-inbox-item__time">From: ${escHtml(sender.full_name || sender.email || "System")} - ${timeAgo(group.created_at)}</p>
                <div class="ad-message-detail__body">${escHtml(group.body || "-").replace(/\n/g, "<br>")}</div>
                <div class="ad-message-detail__actions">
                  <button class="ad-btn ad-btn--outline" type="button" data-ad-msg-reply>Reply</button>
                  ${activeMessageView === "archive"
                    ? `<button class="ad-btn ad-btn--outline" type="button" data-ad-msg-restore>Restore</button>`
                    : `<button class="ad-btn ad-btn--outline" type="button" data-ad-msg-archive>Archive</button>`}
                  <button class="ad-btn ad-btn--danger" type="button" data-ad-msg-delete-inbox="${escHtml(msg.id)}">Delete</button>
                </div>
              </div>`;
          } else {
            const recipients = group.messages.map((msg) => ({
              message: msg,
              profile: profileMap.get(msg.recipient_id) || {}
            }));
            viewDetail.innerHTML = `
              <div class="ad-message-view__detail">
                <p class="ad-inbox-item__name">${escHtml(group.subject)}</p>
                <p class="ad-inbox-item__time">Sent to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"} - ${timeAgo(group.created_at)}</p>
                <div class="ad-message-detail__body">${escHtml(group.body || "-").replace(/\n/g, "<br>")}</div>
                <div class="ad-message-detail__recipients">
                  <p class="ad-message-detail__label">Dikirim ke</p>
                  ${recipients.map(({ message, profile }) => `
                    <div class="ad-message-recipient" data-message-id="${escHtml(message.id)}">
                      <span>${escHtml(profile.full_name || profile.email || message.recipient_id)}</span>
                      <button class="ad-btn ad-btn--outline ad-btn--xs" type="button" data-ad-msg-delete-one="${escHtml(message.id)}">Hapus penerima</button>
                    </div>
                  `).join("")}
                </div>
                <div class="ad-message-detail__actions">
                  <button class="ad-btn ad-btn--outline" type="button" data-ad-msg-edit>Edit</button>
                  ${activeMessageView === "archive"
                    ? `<button class="ad-btn ad-btn--outline" type="button" data-ad-msg-restore>Restore</button>`
                    : `<button class="ad-btn ad-btn--outline" type="button" data-ad-msg-archive>Archive</button>`}
                  <button class="ad-btn ad-btn--danger" type="button" data-ad-msg-delete-all>Hapus pesan</button>
                </div>
              </div>`;
          }

          viewDetail.querySelector("[data-ad-msg-archive]")?.addEventListener("click", async () => {
            try {
              await archiveMessage(group.messages.map((msg) => msg.id), true);
              await loadMessages();
            } catch (err) {
              showToastError(err.message || "Message archive failed.");
            }
          });
          viewDetail.querySelector("[data-ad-msg-restore]")?.addEventListener("click", async () => {
            try {
              await archiveMessage(group.messages.map((msg) => msg.id), false);
              await loadMessages();
            } catch (err) {
              showToastError(err.message || "Message restore failed.");
            }
          });
          viewDetail.querySelector("[data-ad-msg-reply]")?.addEventListener("click", async () => {
            const msg = group.messages[0];
            await openMessageComposer(msg.sender_id, { subject: getReplySubject(group.subject) });
          });
          viewDetail.querySelector("[data-ad-msg-delete-inbox]")?.addEventListener("click", async () => {
            const messageId = group.messages[0]?.id;
            if (!messageId) return;
            const { error } = await window.lmsSupabase
              .from("messages")
              .delete()
              .eq("id", messageId);
            if (error) {
              showToastError(error.message || "Message delete failed.");
              return;
            }
            await loadMessages();
          });
          viewDetail.querySelector("[data-ad-msg-edit]")?.addEventListener("click", () => {
            viewDetail.innerHTML = `
              <form class="ad-message-edit-form">
                <div class="ad-field">
                  <label class="ad-label" for="adMsgEditSubject">Subject</label>
                  <input class="ad-input" id="adMsgEditSubject" value="${escHtml(group.subject)}" />
                </div>
                <div class="ad-field">
                  <label class="ad-label" for="adMsgEditBody">Isi pesan</label>
                  <textarea class="ad-input ad-textarea" id="adMsgEditBody" rows="7">${escHtml(group.body || "")}</textarea>
                </div>
                <div class="ad-message-detail__actions">
                  <button class="ad-btn ad-btn--outline" type="button" data-ad-msg-edit-cancel>Batal</button>
                  <button class="ad-btn ad-btn--primary" type="submit">Simpan</button>
                </div>
              </form>`;
            viewDetail.querySelector("[data-ad-msg-edit-cancel]")?.addEventListener("click", () => renderMessageDetail(group));
            viewDetail.querySelector(".ad-message-edit-form")?.addEventListener("submit", async (event) => {
              event.preventDefault();
              const subject = $("adMsgEditSubject")?.value.trim() || null;
              const body = $("adMsgEditBody")?.value.trim() || "";
              const { error } = await window.lmsSupabase
                .from("messages")
                .update({ subject, body })
                .in("id", group.messages.map((msg) => msg.id));
              if (error) {
                setComposerStatus(error.message || "Message update failed.", true);
                return;
              }
              await loadMessages();
            });
          });
          viewDetail.querySelector("[data-ad-msg-delete-all]")?.addEventListener("click", () => {
            showConfirmModal("Hapus pesan ini dari history?", async () => {
              const { error } = await window.lmsSupabase
                .from("messages")
                .delete()
                .in("id", group.messages.map((msg) => msg.id));
              if (error) {
                showToastError(error.message || "Message delete failed.");
                return;
              }
              await loadMessages();
            });
            return;
          });
          viewDetail.querySelectorAll("[data-ad-msg-delete-one]").forEach((button) => {
            button.addEventListener("click", async () => {
              const messageId = button.getAttribute("data-ad-msg-delete-one");
              if (!messageId) return;
              const { error } = await window.lmsSupabase
                .from("messages")
                .delete()
                .eq("id", messageId);
              if (error) {
                showToastError(error.message || "Message delete failed.");
                return;
              }
              await loadMessages();
            });
          });
        } catch (err) {
          console.error("renderMessageDetail error:", err);
          try { viewDetail.innerHTML = '<div class="ad-message-view__empty"><p>Error loading message</p></div>'; } catch (e) {}
        }
      };

      let selectedMessageItem = null;
      let selectedMessageGroup = null;

      const setActiveMessage = async (item, group) => {
        inbox.querySelectorAll(".ad-inbox-item").forEach((el) => {
          el.classList.remove("active");
          el.setAttribute("aria-selected", "false");
        });
        item.classList.add("active");
        item.setAttribute("aria-selected", "true");
        item.classList.remove("unread");
        await renderMessageDetail(group);
      };

      const renderMessageList = () => groups.forEach((group) => {
        const item = document.createElement("div");
        item.className = `ad-inbox-item${group.isUnread ? " unread" : ""}`;
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute("aria-selected", "false");
        const recipientNames = group.type === "sent"
          ? group.messages.map((msg) => {
              const profile = profileMap.get(msg.recipient_id) || {};
              return profile.full_name || profile.email || msg.recipient_id;
            })
          : [];
        const sender = profileMap.get(group.sender_id) || {};
        const title = group.type === "sent"
          ? group.subject || "Sent message"
          : group.subject || sender.full_name || "Message";
        const preview = group.type === "sent"
          ? `To: ${recipientNames.slice(0, 2).join(", ")}${recipientNames.length > 2 ? ` +${recipientNames.length - 2}` : ""}`
          : (group.body?.substring(0, 60) || "-");
        item.innerHTML = `
          <div class="ad-avatar ad-avatar--sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
          <div class="ad-inbox-item__body">
            <p class="ad-inbox-item__name">${escHtml(title)}</p>
            <p class="ad-inbox-item__preview">${escHtml(preview)}</p>
          </div>
          <span class="ad-inbox-item__time">${group.type === "sent" ? "Sent" : timeAgo(group.created_at)}</span>`;
        item.addEventListener("click", async () => {
          await setActiveMessage(item, group);
        });
        item.addEventListener("keydown", async (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          await setActiveMessage(item, group);
        });
        if (selectedMessageId && group.messages.some((msg) => String(msg.id) === selectedMessageId)) {
          selectedMessageItem = item;
          selectedMessageGroup = group;
        }
        inbox.insertBefore(item, empty);
      });
      renderMessageList();
      if (selectedMessageItem && selectedMessageGroup) {
        await setActiveMessage(selectedMessageItem, selectedMessageGroup);
        selectedMessageItem.scrollIntoView({ block: "nearest" });
      }
    } catch (err) { console.warn("Messages load error:", err.message); }
  }

  /* ================================================================
     REPORTS
  ================================================================ */
  async function loadReports() {
    try {
      // Course overview
      let overviewQuery = window.lmsSupabase
        .from("v_course_overview")
        .select("*");
      let overviewResult;

      if (currentRole !== "admin") {
        overviewResult = await overviewQuery.eq("trainer_id", currentProfile.id);

        const errorText = `${overviewResult.error?.code || ""} ${overviewResult.error?.message || ""} ${overviewResult.error?.details || ""} ${overviewResult.error?.hint || ""}`.toLowerCase();
        const isMissingTrainerIdColumn = errorText.includes("trainer_id") && (errorText.includes("column") || errorText.includes("schema cache"));

        if (isMissingTrainerIdColumn) {
          overviewResult = await window.lmsSupabase
            .from("v_course_overview")
            .select("*")
            .eq("trainer_name", currentProfile.full_name);
        }
      } else {
        overviewResult = await overviewQuery;
      }

      if (overviewResult.error) throw overviewResult.error;
      const overview = overviewResult.data || [];

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
      const { count: certsCount } = await window.lmsSupabase
        .from("certificates")
        .select("id", { count: "exact", head: true });

      if ($("metricCerts")) $("metricCerts").textContent = certsCount || 0;

      const { data: gradedSubmissions, error: gradedErr } = await window.lmsSupabase
        .from("assignment_submissions")
        .select("grade")
        .eq("status", "graded");

      if (gradedErr) throw gradedErr;

      const grades = (gradedSubmissions || [])
        .map((row) => Number(row.grade))
        .filter((grade) => Number.isFinite(grade));
      const avgScore = grades.length
        ? Math.round((grades.reduce((sum, grade) => sum + grade, 0) / grades.length) * 10) / 10
        : 0;
      if ($("metricAvgScore")) $("metricAvgScore").textContent = `${avgScore}%`;

      const { data: enrollments, error: enrollErr } = await window.lmsSupabase
        .from("enrollments")
        .select("status");

      if (enrollErr) throw enrollErr;

      const totalEnrollments = (enrollments || []).length;
      const dropoutCount = (enrollments || [])
        .filter((row) => ["inactive", "dropped"].includes(row.status))
        .length;
      const dropoutRate = totalEnrollments
        ? Math.round((dropoutCount / totalEnrollments) * 1000) / 10
        : 0;
      if ($("metricDropout")) $("metricDropout").textContent = `${dropoutRate}%`;

      // Revenue (admin only)
      if (currentRole === "admin") {
        const { data: payments } = await window.lmsSupabase
          .from("payments")
          .select("amount")
          .eq("status", "completed");
        const total = (payments || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        if ($("metricRevenue")) $("metricRevenue").textContent = formatCurrency(total, "IDR");
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

    const fragment = document.createDocumentFragment();
    users.forEach((u) => {
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
            <p class="ad-table-user__name">${escHtml(u.full_name || "-")}</p>
          </div>
        </td>
        <td style="color:var(--sd-text-muted);font-size:.82rem">${escHtml(u.email)}</td>
        <td><span class="ad-tag ad-tag--${USER_ROLE_TAGS[u.role] || "gray"}">${u.role}</span></td>
        <td><span class="ad-tag ${u.is_active ? "ad-tag--green" : "ad-tag--gray"}">${u.is_active ? tSafe("lmsStatusActive", "Active") : tSafe("lmsStatusInactive", "Inactive")}</span></td>
        <td style="color:var(--sd-text-muted);font-size:.82rem">${formatDT(u.created_at)}</td>
        <td>
          <button class="ad-btn ad-btn--outline ad-btn--sm" data-uid="${u.id}" data-action="toggle-active">
            ${u.is_active ? "Suspend" : "Activate"}
          </button>
          ${u.id === currentProfile?.id ? "" : `
            <select class="ad-input ad-select ad-select--xs" data-uid="${u.id}" data-action="change-role" data-prev-role="${u.role || "student"}">
              <option value="student" ${u.role === "student" ? "selected" : ""}>Student</option>
              <option value="trainer" ${u.role === "trainer" ? "selected" : ""}>Trainer</option>
              <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
            </select>
          `}
        </td>`;
      fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);
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
    const isActive = btn.textContent.trim() === "Suspend";
      await window.lmsSupabase.from("profiles").update({ is_active: !isActive }).eq("id", uid).catch(() => {});
    btn.textContent = isActive ? "Activate" : "Suspend";
    });

    tbody.addEventListener("change", async (e) => {
      const select = e.target.closest("[data-action='change-role']");
      if (!select) return;

      const uid = select.dataset.uid;
      const previousRole = select.dataset.prevRole || select.closest("tr")?.dataset.role || "student";
      const newRole = select.value;

      select.value = previousRole;
      showConfirmModal(`Change role to ${newRole}? This affects their access.`, async () => {
        select.value = newRole;
        const { error } = await window.lmsSupabase
          .from("profiles")
          .update({ role: newRole }).eq("id", uid);

        if (error) {
          select.value = previousRole;
          showToastError("Failed to change role. Please try again.");
          return;
        }

        const row = select.closest("tr");
        const tag = row?.querySelector(".ad-tag");
        if (row) row.dataset.role = newRole;
        if (tag) {
          tag.className = `ad-tag ad-tag--${USER_ROLE_TAGS[newRole] || "gray"}`;
          tag.textContent = newRole;
        }
        select.dataset.prevRole = newRole;
      });
      return;
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
        if (p.status === "completed") {
          totalRevenue += parseFloat(p.amount || 0);
        }
        if (p.status === "pending")   pending++;

        const statusPaid = "Paid";
        const statusPending = "Pending";
        const statusFailed = "Failed";
        const statusRefunded = "Refunded";
        const statusInstallment = "Installment";

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
          <td><strong>${formatCurrency(parseFloat(p.amount || 0), "IDR")}</strong></td>
          <td>${statusTag}</td>
          <td style="color:var(--sd-text-muted);font-size:.82rem">${p.paid_at ? formatDT(p.paid_at) : "—"}</td>
          <td><button class="ad-btn ad-btn--outline ad-btn--sm" data-payment-id="${p.id}">Receipt</button></td>`;
        tr.querySelector("[data-payment-id]")?.addEventListener("click", () => openPaymentReceipt(p));
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

    ["anTitle", "anBody"].forEach((id) => { if ($(id)) $(id).required = true; });

    createBtn && createBtn.addEventListener("click", async () => {
      card.hidden = false;
      const anCourse = $("anCourse");
      if (anCourse) anCourse.dataset.loaded = "";
      await populateCourseSelect("anCourse");
      card.scrollIntoView({ behavior: "smooth" });
    });
    cancelBtn && cancelBtn.addEventListener("click", () => { card.hidden = true; });
    saveBtn   && saveBtn.addEventListener("click",   saveAnnouncement);
    card && card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.target.tagName === "TEXTAREA") return;
      e.preventDefault();
      saveBtn && saveBtn.click();
    });
  }

  async function loadSystemSettings() {
    if (!window.lmsSupabase || !currentProfile?.id) return;
    try {
      const { data } = await window.lmsSupabase
        .from("activity_logs")
        .select("metadata")
        .eq("user_id", currentProfile.id)
        .eq("action", "admin_settings_saved")
        .eq("entity_type", "system_settings")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const brandingSettings = data?.metadata?.brandingSettings || {};
      if (brandingSettings.platformName && $("settPlatformName")) $("settPlatformName").value = brandingSettings.platformName;
      if (brandingSettings.timezone && $("settDefaultTimezone")) $("settDefaultTimezone").value = brandingSettings.timezone;
      if (brandingSettings.language && $("settDefaultLang")) $("settDefaultLang").value = brandingSettings.language;

      const emailSettings = data?.metadata?.emailSettings || {};
      if (typeof emailSettings.newEnroll === "boolean" && $("emailNewEnroll")) $("emailNewEnroll").checked = emailSettings.newEnroll;
      if (typeof emailSettings.submission === "boolean" && $("emailSubmission")) $("emailSubmission").checked = emailSettings.submission;
      if (typeof emailSettings.graded === "boolean" && $("emailGraded")) $("emailGraded").checked = emailSettings.graded;
      if (typeof emailSettings.certificate === "boolean" && $("emailCertificate")) $("emailCertificate").checked = emailSettings.certificate;
      if (typeof emailSettings.reminder === "boolean" && $("emailReminder")) $("emailReminder").checked = emailSettings.reminder;
    } catch {}
  }

  function setupSystemSettings() {
    const brandingBtn = $("saveBrandingBtn");
    const emailBtn    = $("saveEmailSettingsBtn");
    const brandingMsg = $("brandingMsg");

    const saveSettings = async () => {
      if (!window.lmsSupabase || !currentProfile?.id) return;
      try {
        const { error } = await window.lmsSupabase
          .from("activity_logs")
          .insert({
            user_id: currentProfile.id,
            action: "admin_settings_saved",
            entity_type: "system_settings",
            metadata: {
              brandingSettings: {
                platformName: $("settPlatformName")?.value.trim() || "",
                timezone: $("settDefaultTimezone")?.value || "",
                language: $("settDefaultLang")?.value || ""
              },
              emailSettings: {
                newEnroll: $("emailNewEnroll")?.checked || false,
                submission: $("emailSubmission")?.checked || false,
                graded: $("emailGraded")?.checked || false,
                certificate: $("emailCertificate")?.checked || false,
                reminder: $("emailReminder")?.checked || false
              }
            }
          });
        if (error) throw error;
        if (brandingMsg) {
          brandingMsg.textContent = "Settings saved.";
          brandingMsg.style.color = "var(--sd-green)";
        }
      } catch (err) {
        if (brandingMsg) {
          brandingMsg.textContent = "Error: " + (err.message || "Save failed");
          brandingMsg.style.color = "var(--sd-red)";
        }
      }
    };

    brandingBtn && brandingBtn.addEventListener("click", saveSettings);
    emailBtn && emailBtn.addEventListener("click", saveSettings);
  }

  async function loadStorageMonitor() {
    const dbBar      = $("storageDBBar");
    const filesBar   = $("storageFilesBar");
    const dbLabel    = $("storageDB");
    const filesLabel = $("storageFiles");
    const dbLimit    = 500;
    const filesLimit = 1000;

    const fmtMB = (mb) =>
      mb >= 1000
        ? (mb / 1024).toFixed(2) + " GB"
        : mb.toFixed(1) + " MB";

    const updateBar = (barEl, labelEl, usedMB, limitMB) => {
      const safeUsed = Number(usedMB) || 0;
      const safeLimit = Number(limitMB) || 1;
      const pct = Math.min(100, Math.round((safeUsed / safeLimit) * 100));
      if (barEl) {
        barEl.style.width = pct + "%";
        barEl.style.background =
          pct > 90 ? "var(--sd-red, #E24B4A)"
          : pct > 70 ? "var(--sd-orange, #EF9F27)"
          : "var(--sd-green, #639922)";
      }
      if (labelEl) {
        labelEl.textContent = `${fmtMB(safeUsed)} / ${fmtMB(safeLimit)}`;
      }
    };

    if (window.lmsSupabase?.functions?.invoke) {
      try {
        const { data, error } = await window.lmsSupabase.functions.invoke(
          "get-storage-stats"
        );
        const hasStats =
          Number.isFinite(Number(data?.db_size_mb)) ||
          Number.isFinite(Number(data?.files_size_mb));
        if (!error && data && hasStats) {
          updateBar(dbBar, dbLabel, data.db_size_mb || 0, dbLimit);
          updateBar(filesBar, filesLabel, data.files_size_mb || 0, filesLimit);
          return;
        }
      } catch {}
    }

    try {
      const [
        { count: profilesCount },
        { count: coursesCount },
        { count: enrollCount },
        { count: subsCount },
        { count: logsCount },
        { count: messagesCount },
        { count: notifsCount },
      ] = await Promise.all([
        window.lmsSupabase.from("profiles").select("id", { count: "exact", head: true }),
        window.lmsSupabase.from("courses").select("id", { count: "exact", head: true }),
        window.lmsSupabase.from("enrollments").select("id", { count: "exact", head: true }),
        window.lmsSupabase.from("assignment_submissions").select("id", { count: "exact", head: true }),
        window.lmsSupabase.from("activity_logs").select("id", { count: "exact", head: true }),
        window.lmsSupabase.from("messages").select("id", { count: "exact", head: true }),
        window.lmsSupabase.from("notifications").select("id", { count: "exact", head: true }),
      ]);

      const totalRows =
        (profilesCount || 0) +
        (coursesCount || 0) +
        (enrollCount || 0) +
        (subsCount || 0) +
        (logsCount || 0) +
        (messagesCount || 0) +
        (notifsCount || 0);

      const estimatedDbMB = Math.max(0.1, (totalRows * 2) / 1024);

      const buckets = ["avatars", "course-materials", "assignment-submissions"];
      let totalFileBytes = 0;

      for (const bucket of buckets) {
        try {
          const { data: files } = await window.lmsSupabase.storage
            .from(bucket)
            .list("", { limit: 100, offset: 0 });

          totalFileBytes += (files || []).reduce(
            (sum, f) => sum + (f.metadata?.size || 0),
            0
          );
        } catch {}
      }

      const totalFileMB = totalFileBytes / (1024 * 1024);

      updateBar(dbBar, dbLabel, estimatedDbMB, dbLimit);
      updateBar(filesBar, filesLabel, totalFileMB, filesLimit);

      const note = $("storageNote");
      if (note) {
        note.textContent =
          "Estimated from row counts · File storage from bucket listing";
        note.style.fontSize = "11px";
        note.style.color = "var(--sd-text-muted)";
      }
    } catch (err) {
      console.warn("Storage monitor error:", err.message);
      if (dbLabel) dbLabel.textContent = "Unable to load";
      if (filesLabel) filesLabel.textContent = "Unable to load";
    }
  }

  // ─── 1. SETUP ADMIN PROFILE FORM ─────────────────────────────────
  function setupAdminProfileForm() {
    const saveBtn = $("adSaveProfileBtn");
    const msgEl = $("adProfileMsg");

    if (!saveBtn) return;

    // Pre-fill form with current profile data
    if (currentProfile) {
      if ($("adPfFullName")) $("adPfFullName").value = currentProfile.full_name || "";
      if ($("adPfPhone")) $("adPfPhone").value = currentProfile.phone || "";
      if ($("adPfBio")) $("adPfBio").value = currentProfile.bio || "";
    }

    saveBtn.addEventListener("click", async () => {
      if (!currentProfile || !window.lmsSupabase) return;
      saveBtn.disabled = true;
      if (msgEl) { msgEl.textContent = ""; msgEl.style.color = ""; }

      const payload = {
        full_name: ($("adPfFullName")?.value || "").trim(),
        phone: ($("adPfPhone")?.value || "").trim(),
        bio: ($("adPfBio")?.value || "").trim(),
      };

      try {
        const { error } = await window.lmsSupabase
          .from("profiles").update(payload).eq("id", currentProfile.id);
        if (error) throw error;

        // Update in-memory profile & displayed name
        currentProfile = { ...currentProfile, ...payload };
        [$("sidebarName"), $("topbarName"), $("welcomeName"), $("adminName")]
          .forEach((el) => { if (el && payload.full_name) el.textContent = payload.full_name; });

        if (msgEl) { msgEl.textContent = "✓ Profile saved."; msgEl.style.color = "var(--sd-green)"; }
      } catch (err) {
        if (msgEl) { msgEl.textContent = "Error: " + err.message; msgEl.style.color = "var(--sd-red)"; }
      } finally {
        saveBtn.disabled = false;
        setTimeout(() => { if (msgEl) msgEl.textContent = ""; }, 4000);
      }
    });
  }

  // ─── 2. SETUP ADMIN AVATAR UPLOAD ────────────────────────────────
  function setupAdminAvatarUpload() {
    const uploadBtn = $("adAvatarUploadBtn");
    const fileInput = $("adAvatarInput");
    const statusEl = $("adAvatarMsg");

    if (!uploadBtn || !fileInput) return;

    uploadBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        showToastError("Ukuran foto maksimum 2 MB");
        return;
      }
      const previousAvatars = Array.from(document.querySelectorAll(".ad-avatar"))
        .map((el) => [el, el.innerHTML]);

      if (!window.lmsSupabase || !currentProfile) {
        if (statusEl) { statusEl.textContent = "Storage not available."; statusEl.style.color = "var(--sd-red)"; }
        setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 3000);
        return;
      }
      uploadBtn.disabled = true;
      if (statusEl) { statusEl.textContent = "Uploading..."; statusEl.style.color = "var(--sd-text-muted)"; }

      try {
        const previewSrc = await readFileAsDataUrl(file);
        renderAdminAvatar(previewSrc, currentProfile.full_name || "Avatar");

        const ext = file.name.split(".").pop().toLowerCase();
        const path = `avatars/${currentProfile.id}.${ext}`;
        const { error } = await window.lmsSupabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true, contentType: file.type });
        if (error) throw error;

        const { data: urlData } = window.lmsSupabase.storage.from("avatars").getPublicUrl(path);
        const avatarUrl = withAvatarCacheBust(urlData.publicUrl);
        const { error: profileErr } = await window.lmsSupabase.from("profiles")
          .update({ avatar_url: avatarUrl }).eq("id", currentProfile.id);
        if (profileErr) throw profileErr;

        currentProfile = { ...currentProfile, avatar_url: avatarUrl };
        renderAdminAvatar(avatarUrl, currentProfile.full_name || "Avatar");
        if (statusEl) { statusEl.textContent = "✓ Photo updated."; statusEl.style.color = "var(--sd-green)"; }
      } catch (err) {
        previousAvatars.forEach(([el, html]) => { el.innerHTML = html; });
        if (statusEl) { statusEl.textContent = "Upload failed: " + err.message; statusEl.style.color = "var(--sd-red)"; }
      } finally {
        uploadBtn.disabled = false;
      }
      setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 4000);
    });
  }

  // ─── 3. SETUP ADMIN CHANGE PASSWORD ──────────────────────────────
  function setupAdminChangePassword() {
    const btn = $("adChangePasswordBtn");
    const msgEl = $("adPasswordMsg");

    if (!btn) return;
    btn.addEventListener("click", async () => {
      const current = $("adCurrentPw")?.value;
      const newPw = $("adNewPw")?.value;
      const confirm = $("adConfirmPw")?.value;
      const setMsg = (txt, color) => { if (msgEl) { msgEl.textContent = txt; msgEl.style.color = color; } };

      if (!current) return setMsg("Current password is required.", "var(--sd-red)");
      if (!newPw || newPw !== confirm) return setMsg("Passwords do not match.", "var(--sd-red)");
      if (newPw.length < 8) return setMsg("Password must be at least 8 characters.", "var(--sd-red)");

      btn.disabled = true;
      setMsg("Verifying...", "var(--sd-text-muted)");

      try {
        const { error: verifyErr } = await window.lmsSupabase.auth.signInWithPassword({
          email: currentProfile?.email || "", password: current
        });
        if (verifyErr) throw new Error("Current password is incorrect.");

        const { error } = await window.lmsSupabase.auth.updateUser({ password: newPw });
        if (error) throw error;

        [$("adCurrentPw"), $("adNewPw"), $("adConfirmPw")].forEach((el) => { if (el) el.value = ""; });
        setMsg("✓ Password updated successfully.", "var(--sd-green)");
      } catch (err) {
        setMsg("Error: " + err.message, "var(--sd-red)");
      } finally {
        btn.disabled = false;
        setTimeout(() => setMsg("", ""), 5000);
      }
    });
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
        setMessage("User created successfully.", "var(--sd-green)");
        if (tempPassword) {
          const pwContainer = document.createElement("div");
          pwContainer.style.cssText = "margin-top:8px;display:flex;align-items:center;gap:8px;";
          pwContainer.innerHTML = `
            <span style="font-size:.85rem;color:var(--sd-text-secondary)">Temp password:</span>
            <input type="password" id="tempPwField" value="${escHtml(tempPassword)}" readonly
              style="font-size:.85rem;border:1px solid var(--sd-border);border-radius:4px;padding:2px 6px;background:var(--sd-bg-secondary);flex:1;" />
            <button type="button" id="tempPwToggle" style="font-size:.75rem;padding:2px 6px;border:1px solid var(--sd-border);border-radius:4px;cursor:pointer;">Show</button>
            <button type="button" id="tempPwCopy" style="font-size:.75rem;padding:2px 6px;border:1px solid var(--sd-border);border-radius:4px;cursor:pointer;">Copy</button>
          `;
          msg?.appendChild(pwContainer);

          pwContainer.querySelector("#tempPwToggle")?.addEventListener("click", () => {
            const input = pwContainer.querySelector("#tempPwField");
            if (input) {
              input.type = input.type === "password" ? "text" : "password";
              pwContainer.querySelector("#tempPwToggle").textContent = input.type === "password" ? "Show" : "Hide";
            }
          });
          pwContainer.querySelector("#tempPwCopy")?.addEventListener("click", () => {
            navigator.clipboard.writeText(tempPassword).then(() => {
              pwContainer.querySelector("#tempPwCopy").textContent = "Copied!";
              setTimeout(() => { pwContainer.querySelector("#tempPwCopy").textContent = "Copy"; }, 2000);
            });
          });
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

      if (!window.lmsSupabase) {
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        return;
      }

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

        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
      } catch (err) {
        setMessage("Error loading data: " + (err.message || "Failed"), "var(--sd-red)");
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
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
      const currency  = "IDR";
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
        setMessage("Amount is required.", "var(--sd-red)");
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
            await recalculateCourseProgressForStudent(studentId, courseId);
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
    const annFields = ["anTitle", "anBody"].map((id) => $(id)).filter(Boolean);
    if (annFields.some((field) => !field.reportValidity())) return;

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
      let annQuery = window.lmsSupabase
        .from("announcements")
        .select("id, title, body, target_role, is_published, publish_at, expires_at")
        .order("publish_at", { ascending: false });
      if (currentRole !== "admin") {
        annQuery = annQuery.eq("author_id", currentProfile.id);
      }
      const { data } = await annQuery;

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
              <span>Target: ${escHtml(ann.target_role || "—")}</span>
              <span>${formatDT(ann.publish_at)}</span>
              ${ann.expires_at ? `<span>Expires: ${formatDT(ann.expires_at)}</span>` : ""}
            </div>
          </div>
          <div class="ad-announcement-item__actions">
            <button class="ad-icon-btn ad-icon-btn--danger" data-ann-id="${ann.id}" aria-label="Delete announcement">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>`;

        item.querySelector(".ad-icon-btn--danger").addEventListener("click", () => {
          showConfirmModal("Delete this announcement?", async () => {
            await window.lmsSupabase.from("announcements").delete().eq("id", ann.id).catch(() => {});
            item.remove();
          });
          return;
        });

        list.insertBefore(item, empty);
      });
    } catch (err) { console.warn("Announcements load error:", err.message); }
  }

  function openPaymentReceipt(payment) {
    if (!payment) return;
    const receiptWin = window.open("", "_blank", "width=720,height=820");
    if (!receiptWin) return;
    const amount = formatCurrency(parseFloat(payment.amount || 0), "IDR");
    const paidAt = payment.paid_at ? formatDT(payment.paid_at) : "—";
    const status = payment.payment_plan === "installment"
      ? `Installment ${parseInt(payment.installment_paid || 0, 10)}/${parseInt(payment.installment_total || 0, 10)}`
      : (payment.status || "—");
    receiptWin.document.write(`<!DOCTYPE html>
<html><head><title>Receipt</title></head><body style="font-family:Arial,sans-serif;padding:32px;color:#111;">
  <h1 style="margin:0 0 24px;">Payment Receipt</h1>
  <p><strong>Receipt ID:</strong> ${escHtml(payment.id || "—")}</p>
  <p><strong>Student:</strong> ${escHtml(payment.profiles?.full_name || "—")}</p>
  <p><strong>Course:</strong> ${escHtml(payment.courses?.title || "—")}</p>
  <p><strong>Method:</strong> ${escHtml(payment.payment_method || "Manual")}</p>
  <p><strong>Amount:</strong> ${escHtml(amount)}</p>
  <p><strong>Status:</strong> ${escHtml(status)}</p>
  <p><strong>Paid At:</strong> ${escHtml(paidAt)}</p>
</body></html>`);
    receiptWin.document.close();
    receiptWin.focus();
    receiptWin.print();
  }

  async function openStudentMessage(studentId) {
    if (!studentId) return;

    // Aktifkan section messages
    if (window._adActivateSection) window._adActivateSection("messages");

    // Tunggu hingga elemen composer tersedia (max 2 detik)
    let attempts = 0;
    while (!$("adMsgComposeForm") && attempts < 20) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!$("adMsgComposeForm")) {
      console.warn("[openStudentMessage] adMsgComposeForm not found after wait");
      return;
    }

    // Reset bound flag agar handler ter-bind ulang dengan recipient baru
    messageComposerBound = false;

    await openMessageComposer(studentId);
  }

  /* ================================================================
     NOTIFICATIONS
  ================================================================ */
  async function loadNotifications() {
    if (!currentProfile || !window.lmsSupabase) return;
    let notifications = [];
    let unreadMessages = [];
    try {
      const { data } = await window.lmsSupabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentProfile.id)
        .order("created_at", { ascending: false })
        .limit(15);
      notifications = data || [];
    } catch {
      notifications = [];
    }
    try {
      const { data } = await window.lmsSupabase
        .from("messages")
        .select("id, sender_id, recipient_id, subject, body, is_read, created_at")
        .eq("recipient_id", currentProfile.id)
        .eq("is_read", false)
        .or("is_archived.eq.false,is_archived.is.null")
        .order("created_at", { ascending: false })
        .limit(25);
      unreadMessages = data || [];
    } catch {
      unreadMessages = [];
    }
    renderNotifications(notifications, unreadMessages);
  }

  function renderNotifications(notifs, messageNotifs = []) {
    const list = $("adNotifList");
    if (!list) return;

    updateAdminSectionNotificationCounts(notifs);
    adminUnreadNotifications = notifs.filter((n) => !n.is_read).length;
    adminUnreadMessages = messageNotifs.filter((msg) => !msg.is_read && msg.recipient_id === currentProfile?.id).length;
    updateAdminAttentionIndicators();

    const messageItems = messageNotifs.map((msg) => ({
      id: msg.id,
      kind: "message",
      unread: true,
      type: "new_message",
      title: msg.subject || `New message from ${msg.profiles?.full_name || msg.profiles?.email || "User"}`,
      created_at: msg.created_at,
      preview: msg.body || ""
    }));
    const notificationItems = notifs.map((notif) => ({
      id: notif.id,
      kind: "notification",
      unread: !notif.is_read,
      type: notif.type,
      title: notif.title,
      created_at: notif.created_at,
      preview: ""
    }));
    const items = [...messageItems, ...notificationItems]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 10);

    if (items.length === 0) {
      list.innerHTML = `<li class="ad-notif-empty" data-i18n="lmsNoNotifications">No notifications</li>`;
      return;
    }

    list.innerHTML = items.map((item) => `
      <li class="ad-notif-list-item ${item.unread ? "unread" : ""}" data-kind="${item.kind}" ${item.kind === "message" ? `data-message-id="${escHtml(item.id)}"` : `data-id="${escHtml(item.id)}"`}>
        <div class="ad-notif-list-item__icon">${getNotifIcon(item.type)}</div>
        <div>
          <p class="ad-notif-list-item__title">${escHtml(item.title || "Notification")}</p>
          ${item.preview ? `<p class="ad-notif-list-item__time">${escHtml(String(item.preview).slice(0, 90))}</p>` : ""}
          <p class="ad-notif-list-item__time">${timeAgo(item.created_at)}</p>
        </div>
      </li>`).join("");

    list.querySelectorAll(".ad-notif-list-item").forEach((item) => {
      item.addEventListener("click", async () => {
        const kind = item.dataset.kind;
        item.classList.remove("unread");
        if (kind === "message") {
          const messageId = item.dataset.messageId;
          if (messageId && window.lmsSupabase) {
            await window.lmsSupabase
              .from("messages")
              .update({ is_read: true, read_at: new Date().toISOString() })
              .eq("id", messageId)
              .catch(() => {});
          }
          adminUnreadMessages = Math.max(adminUnreadMessages - 1, 0);
          activeMessageView = "inbox";
          const notifPanel = $("adNotifPanel");
          if (notifPanel) notifPanel.hidden = true;
          if (window._adActivateSection) window._adActivateSection("messages");
          await loadMessages({ selectedMessageId: messageId });
        } else {
          adminUnreadNotifications = list.querySelectorAll(".ad-notif-list-item.unread[data-kind='notification']").length;
          await window.lmsSupabase
            .from("notifications")
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq("id", item.dataset.id)
            .catch(() => {});
        }
        updateAdminAttentionIndicators();
      });
    });
  }

  function getNotifIcon(type) {
    return { assignment_new: "📋", assignment_graded: "📝", material_new: "📚", quiz_result: "✅", new_message: "💬",
      course_enrolled: "🎓", certificate_issued: "🏆", submission_received: "📤",
      session_reminder: "📅", schedule_new: "📅", announcement: "📢" }[type] || "🔔";
  }

  function setupRealtimeNotifications(userId) {
    if (!window.lmsSupabase) return;
    if (adminNotificationChannel && adminNotificationChannelUserId === userId) return;
    removeRealtimeChannel(adminNotificationChannel);
    adminNotificationChannelUserId = userId;
    adminNotificationChannel = window.lmsSupabase
      .channel("admin-notif-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        async () => {
          await loadNotifications();
          await loadKPIs();
        })
      .subscribe();
  }

  function setupRealtimeMessages(userId) {
    if (!window.lmsSupabase) return;
    if (adminMessageChannel && adminMessageChannelUserId === userId) return;
    removeRealtimeChannel(adminMessageChannel);
    adminMessageChannelUserId = userId;
    const channel = window.lmsSupabase.channel("admin-message-channel");
    adminMessageChannel = channel;
    const refreshMessages = async () => {
      await refreshAdminMessageIndicators(userId);
      await loadNotifications();
      if (currentSection === "messages") loadMessages();
    };
    channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` }, refreshMessages);
    channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` }, refreshMessages);
    channel.subscribe?.();
  }

  function runAdminSearch(query) {
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) return;

    // Kecualikan section yang mengandung data personal (email, profile, messages)
    const EXCLUDED_SEARCH_SECTIONS = ["profile", "messages"];
    const sections = Array.from(document.querySelectorAll(".ad-section"))
      .filter((section) => {
        const sectionId = section.id.replace(/^section-/, "");
        return !EXCLUDED_SEARCH_SECTIONS.includes(sectionId);
      });
    const matchSection = sections.find((section) => (section.textContent || "").toLowerCase().includes(needle));

    if (!matchSection) {
      // Tampilkan feedback ke user bahwa tidak ditemukan
      const searchInput = $("adSearchInput");
      if (searchInput) {
        searchInput.style.outline = "2px solid var(--sd-red)";
        setTimeout(() => { searchInput.style.outline = ""; }, 1500);
      }
      return;
    }

    const sectionId = matchSection.id.replace(/^section-/, "");
    if (window._adActivateSection) window._adActivateSection(sectionId);

    requestAnimationFrame(() => {
      const targetSection = document.getElementById("section-" + sectionId);
      if (!targetSection) return;
      const candidates = targetSection.querySelectorAll("h1,h2,h3,p,button,a,label,td,th,div");
      const matchEl = Array.from(candidates).find((el) => (el.textContent || "").toLowerCase().includes(needle));
      if (matchEl) matchEl.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function toSafeUiUrl(value) {
    if (!value) return "";
    try {
      const parsed = new URL(value, window.location.origin);
      return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "";
    } catch {
      return "";
    }
  }

  function extractCourseMaterialPath(value) {
    if (!value) return "";
    const raw = String(value).trim();
    if (!raw) return "";
    if (raw.startsWith("courses/")) return raw;
    try {
      const parsed = new URL(raw, window.location.origin);
      const marker = `/${COURSE_MATERIAL_BUCKET}/`;
      const markerIndex = parsed.pathname.indexOf(marker);
      if (markerIndex === -1) return "";
      return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
    } catch {
      return "";
    }
  }

  async function resolveCourseMaterialUrl(lesson) {
    const materialPath = lesson?.material_path || extractCourseMaterialPath(lesson?.material_url);
    if (materialPath) {
      try {
        const bucket = window.lmsSupabase?.storage?.from?.(COURSE_MATERIAL_BUCKET);
        if (!bucket?.createSignedUrl) return "";
        const { data, error } = await bucket.createSignedUrl(materialPath, 60 * 60);
        if (error) throw error;
        return toSafeUiUrl(data?.signedUrl);
      } catch (err) {
        console.warn("Could not create signed course material URL:", err.message || err);
        return "";
      }
    }
    return toSafeUiUrl(lesson?.material_url);
  }

  async function prepareCourseMaterialUrls(lessons) {
    return Promise.all((lessons || []).map(async (lesson) => ({
      ...lesson,
      material_display_url: await resolveCourseMaterialUrl(lesson)
    })));
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

    markAllBtn && markAllBtn.addEventListener("click", async () => {
      const unreadItems = Array.from(document.querySelectorAll(".ad-notif-list-item.unread"));
      unreadItems.forEach((el) => el.classList.remove("unread"));
      adminUnreadNotifications = 0;
      adminUnreadMessages = 0;
      updateAdminAttentionIndicators();
      if (!window.lmsSupabase || unreadItems.length === 0) return;
      const unreadNotificationIds = unreadItems.map((item) => item.dataset.id).filter(Boolean);
      const unreadMessageIds = unreadItems.map((item) => item.dataset.messageId).filter(Boolean);
      if (unreadNotificationIds.length > 0) {
        await window.lmsSupabase
          .from("notifications")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in("id", unreadNotificationIds)
          .catch(() => {});
      }
      if (unreadMessageIds.length > 0) {
        await window.lmsSupabase
          .from("messages")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in("id", unreadMessageIds)
          .catch(() => {});
        if (currentSection === "messages") await loadMessages();
      }
      // Re-fetch dari DB untuk pastikan state akurat
      await loadNotifications();
      $("adNotifPanel") && ($("adNotifPanel").hidden = true);
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
          if (group.closest("#section-students")) {
            applyStudentFilter(tab.dataset.filter || "all");
          }
        });
      });
    });
  }

  document.addEventListener("click", (e) => {
    const msgBtn = e.target.closest("[data-student-id]");
    if (!msgBtn) return;
    openStudentMessage(msgBtn.dataset.studentId);
  });

})();
