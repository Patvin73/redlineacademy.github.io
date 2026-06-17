/* ================================================================
   REDLINE ACADEMY — dashboard-student.js
   Controller for Student Dashboard
   Dependencies: supabase-client.js (window.lmsSupabase), script.js (t(), setLanguage())
   ================================================================ */

(function () {
  "use strict";

  /* State */
  let currentStudentProfile = null;
  let currentSection = "home";
  const loadedStudentSections = new Set(["home"]);
  let fullScheduleCache = [];
  let studentMessageComposerBound = false;
  let studentMessageComposerReturnView = "";
  let studentMessageSending = false;
  let studentMessagesLoadSeq = 0;
  let activeStudentMessageView = "inbox";
  let studentUnreadMessages = 0;
  let studentUnreadNotifications = 0;
  let studentPendingAssignmentCount = 0;
  let studentNotificationChannel = null;
  let studentNotificationChannelUserId = null;
  let studentMessageChannel = null;
  let studentMessageChannelUserId = null;
  let studentUnreadSections = { courses: 0, assignments: 0, schedule: 0 };
  let scheduleCalendarCursor = null;
  let scheduleSortOrder = "asc";
  const COURSE_MATERIAL_BUCKET = "course-materials";
  const ASSIGNMENT_SUBMISSIONS_BUCKET = "assignment-submissions";
  const Competency = window.RedlineCompetency || {};

  /* ── DOM refs ───────────────────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);

  function removeRealtimeChannel(channel) {
    if (!channel) return;
    if (window.lmsSupabase?.removeChannel) {
      window.lmsSupabase.removeChannel(channel);
    } else {
      channel.unsubscribe?.();
    }
  }

  function updateStudentAttentionIndicators() {
    const sectionBadges = [
      { id: "courseBadge", count: studentUnreadSections.courses },
      { id: "assignmentBadge", count: studentUnreadSections.assignments },
      { id: "scheduleBadge", count: studentUnreadSections.schedule }
    ];
    sectionBadges.forEach(({ id, count }) => {
      const badge = $(id);
      if (!badge) return;
      const existingCount = id === "assignmentBadge" ? studentPendingAssignmentCount : 0;
      const nextCount = Math.max(count, existingCount);
      badge.textContent = nextCount;
      badge.style.display = nextCount > 0 ? "inline-block" : "none";
    });
    const msgBadge = $("messageBadge");
    if (msgBadge) {
      msgBadge.textContent = studentUnreadMessages;
      msgBadge.style.display = studentUnreadMessages > 0 ? "inline-block" : "none";
    }
    const dot = $("notifDot");
    if (dot) dot.style.display = (studentUnreadMessages + studentUnreadNotifications) > 0 ? "block" : "none";
  }

  function notificationSection(type) {
    return {
      assignment_new: "assignments",
      assignment_graded: "assignments",
      submission_received: "assignments",
      course_enrolled: "courses",
      material_new: "courses",
      schedule_new: "schedule",
      session_reminder: "schedule"
    }[type] || "";
  }

  function updateStudentSectionNotificationCounts(notifications = []) {
    const counts = { courses: 0, assignments: 0, schedule: 0 };
    (notifications || []).forEach((notification) => {
      if (notification.is_read) return;
      const section = notificationSection(notification.type);
      if (section && Object.prototype.hasOwnProperty.call(counts, section)) counts[section] += 1;
    });
    studentUnreadSections = counts;
  }

  const INACTIVE_ENROLLMENT_STATUSES = ["completed"];

  function normalizeCompletionPercent(value) {
    const percent = Number(value);
    if (!Number.isFinite(percent)) return 0;
    return Math.max(0, Math.min(100, Math.round(percent)));
  }

  function isEnrollmentCourseActive(enrollment, progressMap = new Map()) {
    if (!enrollment?.course_id) return false;
    const hasProgress = progressMap.has(enrollment.course_id);
    const percent = normalizeCompletionPercent(progressMap.get(enrollment.course_id));
    const status = (enrollment.status || "active").toLowerCase();
    if (percent >= 100) return false;
    if (status === "completed") return hasProgress && percent < 100;
    return !INACTIVE_ENROLLMENT_STATUSES.includes(status);
  }

  async function getCourseProgressMap(userId, courseIds = []) {
    const uniqueCourseIds = [...new Set((courseIds || []).filter(Boolean))];
    if (!userId || uniqueCourseIds.length === 0 || !window.lmsSupabase) return new Map();
    const { data, error } = await window.lmsSupabase
      .from("course_progress")
      .select("course_id, completion_percent")
      .eq("student_id", userId)
      .in("course_id", uniqueCourseIds);
    if (error) throw error;
    return new Map(
      (data || [])
        .filter((row) => row.course_id)
        .map((row) => [row.course_id, normalizeCompletionPercent(row.completion_percent)])
    );
  }

  function getCurrentStudentBatch() {
    const profile = currentStudentProfile || {};
    const batch = profile.batch
      || (profile.created_at ? new Date(profile.created_at).getFullYear() : "");
    return String(batch || "").trim();
  }

  function uniqueIds(values = []) {
    return [...new Set((values || []).filter(Boolean))];
  }

  async function getStudentBatchMaterialCourseIds() {
    if (!window.lmsSupabase || !getCurrentStudentBatch()) return [];
    try {
      const { data, error } = await window.lmsSupabase
        .from("lessons")
        .select("course_id")
        .not("material_url", "is", null);
      if (error) throw error;
      return uniqueIds((data || []).map((lesson) => lesson.course_id));
    } catch (err) {
      console.warn("Batch material course scope skipped:", err.message || err);
      return [];
    }
  }

  async function getStudentLearningCourseIds(userId, { includeBatchMaterials = false } = {}) {
    const enrolledCourseIds = await getStudentEnrollmentCourseIds(userId) || [];
    if (!includeBatchMaterials) return enrolledCourseIds;
    const batchMaterialCourseIds = await getStudentBatchMaterialCourseIds();
    return uniqueIds([...enrolledCourseIds, ...batchMaterialCourseIds]);
  }

  async function runSupabaseSilently(query) {
    try {
      const { error } = await query;
      if (error) console.warn("Supabase mutation skipped:", error.message || error);
    } catch (err) {
      console.warn("Supabase mutation skipped:", err.message || err);
    }
  }

  async function getStudentEnrollmentCourseIds(userId, { activeOnly = false } = {}) {
    if (!userId || !window.lmsSupabase) return null;
    const { data, error } = await window.lmsSupabase
      .from("enrollments")
      .select("course_id, status")
      .eq("student_id", userId);
    if (error) throw error;
    const rows = data || [];
    const progressMap = activeOnly
      ? await getCourseProgressMap(userId, rows.map((row) => row.course_id))
      : new Map();
    const result = [
      ...new Set(rows
        .filter((row) => !activeOnly || isEnrollmentCourseActive(row, progressMap))
        .map((row) => row.course_id)
        .filter(Boolean))
    ];
    // [FIX-BUG#3] Diagnostik: log jika tidak ada course ditemukan
    if (result.length === 0) {
      console.warn(
        "[ENROLLMENT] courseIds kosong untuk userId:", userId,
        "| activeOnly:", activeOnly,
        "| raw rows:", (data || []).map(r => ({ course_id: r.course_id, status: r.status }))
      );
    }
    return result;
  }

  async function countStudentActiveCourses(userId) {
    try {
      const { data, error } = await window.lmsSupabase
        .from("enrollments")
        .select("course_id, status")
        .eq("student_id", userId);
      if (error) throw error;
      const enrollments = data || [];
      const progressMap = await getCourseProgressMap(userId, enrollments.map((row) => row.course_id));
      const activeEnrollmentCourseIds = enrollments
        .filter((row) => isEnrollmentCourseActive(row, progressMap))
        .map((row) => row.course_id);
      const batchMaterialCourseIds = await getStudentBatchMaterialCourseIds();
      const { data: publishedCourses, error: courseErr } = await window.lmsSupabase
        .from("courses")
        .select("id")
        .eq("status", "published");
      if (courseErr) throw courseErr;
      const publishedCourseIds = (publishedCourses || []).map((course) => course.id);
      return uniqueIds([...activeEnrollmentCourseIds, ...batchMaterialCourseIds, ...publishedCourseIds]).length;
    } catch {
      return null;
    }
  }

  async function countStudentPendingAssignments(userId) {
    try {
      const courseIds = await getStudentEnrollmentCourseIds(userId);
      if (!courseIds || courseIds.length === 0) return 0;

      const { data, error } = await window.lmsSupabase
        .from("assignments")
        .select(`
          id,
          is_published,
          assignment_submissions (
            id,
            student_id,
            status
          )
        `)
        .in("course_id", courseIds);
      if (error) throw error;

      return (data || []).filter((assignment) => {
        if (assignment.is_published === false) return false;
        const submissions = Array.isArray(assignment.assignment_submissions)
          ? assignment.assignment_submissions
          : [];
        const ownSubmission = submissions.find((item) => item.student_id === userId);
        return !ownSubmission || ["pending", "resubmit_required"].includes(ownSubmission.status || "pending");
      }).length;
    } catch {
      return null;
    }
  }

  async function refreshStudentMessageIndicators(userId = currentStudentProfile?.id) {
    if (!userId || !window.lmsSupabase) return;
    try {
      const { data, error } = await window.lmsSupabase
        .from("messages")
        .select("id")
        .eq("recipient_id", userId)
        .eq("is_read", false)
        .or("is_archived.eq.false,is_archived.is.null");
      if (error) throw error;
      studentUnreadMessages = (data || []).length;
    } catch {
      studentUnreadMessages = 0;
    }
    updateStudentAttentionIndicators();
  }

  function safeStorageSegment(value, fallback = "file") {
    return String(value || fallback)
      .trim()
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120) || fallback;
  }

  function createClientId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return "10000000-1000-4000-8000-" + Math.random().toString(16).slice(2, 14).padEnd(12, "0");
  }

  async function sendExternalNotificationDelivery(payload) {
    if (!window.lmsSupabase?.functions?.invoke) return;
    const body = {
      message_ids: (payload?.message_ids || []).filter(Boolean),
      notification_ids: (payload?.notification_ids || []).filter(Boolean)
    };
    if (!body.message_ids.length && !body.notification_ids.length) return;
    try {
      const { error } = await window.lmsSupabase.functions.invoke("send-lms-notification", {
        body
      });
      if (error) throw error;
    } catch (err) {
      console.warn("External notification delivery failed:", err.message || err);
    }
  }

  async function createNotificationsWithDelivery(rows, label = "Notification insert failed") {
    const items = (Array.isArray(rows) ? rows : [rows]).filter(Boolean);
    if (!items.length || !window.lmsSupabase) return [];
    try {
      const { data, error } = await window.lmsSupabase
        .from("notifications")
        .insert(items)
        .select("id");
      if (error) throw error;
      const notificationIds = (data || []).map((row) => row.id).filter(Boolean);
      await sendExternalNotificationDelivery({ notification_ids: notificationIds });
      return notificationIds;
    } catch (err) {
      console.warn(label, err.message || err);
      return [];
    }
  }

  async function uploadAssignmentSubmissionFile(file, userId, assignmentId) {
    if (!file) throw new Error("Please choose a file before submitting.");
    if (!window.lmsSupabase?.storage) throw new Error("Supabase Storage is not available.");
    if (file.size > 50 * 1024 * 1024) {
      throw new Error("File terlalu besar. Maksimum ukuran file submission adalah 50 MB.");
    }

    const path = [
      safeStorageSegment(userId, "student"),
      safeStorageSegment(assignmentId, "assignment"),
      safeStorageSegment(file.name, "submission")
    ].join("/");

    const { error } = await window.lmsSupabase.storage
      .from(ASSIGNMENT_SUBMISSIONS_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;

    const { data } = window.lmsSupabase.storage
      .from(ASSIGNMENT_SUBMISSIONS_BUCKET)
      .getPublicUrl(path);

    return data?.publicUrl || path;
  }

  /* ================================================================
     INIT — runs after DOM is ready
  ================================================================ */
  document.addEventListener("DOMContentLoaded", async () => {
    setupSidebar();
    setupNavigation();
    setupTopbar();
    setupInteractiveControls();
    setupNotificationPanel();
    setupAccordion();
    setupAvatarUpload();
    setupFilterTabs();
    setupLinkButtons();

    // Load data from Supabase
    await loadStudentData();
  });

  /* ================================================================
     SIDEBAR — mobile open/close
  ================================================================ */
  function setupSidebar() {
    const sidebar  = $("sdSidebar");
    const overlay  = $("sdOverlay");
    const hamburger = $("sdHamburger");
    const closeBtn  = $("sdSidebarClose");
    const desktopQuery = window.matchMedia("(min-width: 769px)");
    const collapsedKey = "redline-student-sidebar-collapsed";

    document.querySelectorAll(".sd-nav__item[data-section], .sd-logout-btn").forEach((item) => {
      const labelSource = item.querySelector("span[data-i18n]") || item;
      const label = (labelSource.textContent || "").replace(/\s+/g, " ").trim();
      if (!label) return;
      item.dataset.sidebarTooltip = label;
      item.setAttribute("title", label);
      if (!item.getAttribute("aria-label")) item.setAttribute("aria-label", label);
    });

    function openSidebar() {
      sidebar.classList.add("open");
      overlay.classList.add("active");
      hamburger.setAttribute("aria-expanded", "true");
    }

    function closeSidebar() {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }

    function setCollapsed(collapsed) {
      document.body.classList.toggle("sd-sidebar-collapsed", collapsed);
      closeBtn?.setAttribute("aria-label", collapsed ? "Open sidebar" : "Close sidebar");
      closeBtn?.setAttribute("aria-expanded", collapsed ? "false" : "true");
      hamburger?.setAttribute("aria-label", collapsed ? "Open sidebar" : "Close sidebar");
      try { localStorage.setItem(collapsedKey, collapsed ? "1" : "0"); } catch {}
    }

    function toggleDesktopSidebar() {
      setCollapsed(!document.body.classList.contains("sd-sidebar-collapsed"));
    }

    try {
      setCollapsed(desktopQuery.matches && localStorage.getItem(collapsedKey) === "1");
    } catch {
      setCollapsed(false);
    }

    hamburger && hamburger.addEventListener("click", () => {
      if (desktopQuery.matches) toggleDesktopSidebar();
      else openSidebar();
    });
    closeBtn  && closeBtn.addEventListener("click", () => {
      if (desktopQuery.matches) toggleDesktopSidebar();
      else closeSidebar();
    });
    overlay   && overlay.addEventListener("click", closeSidebar);

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("open")) {
        closeSidebar();
      }
    });

    desktopQuery.addEventListener?.("change", (event) => {
      if (!event.matches) {
        document.body.classList.remove("sd-sidebar-collapsed");
        closeSidebar();
      } else {
        try { setCollapsed(localStorage.getItem(collapsedKey) === "1"); } catch {}
      }
    });
  }

  /* ================================================================
     NAVIGATION — section switching
  ================================================================ */
  function setupNavigation() {
    const navItems = document.querySelectorAll(".sd-nav__item[data-section]");
    const sections = document.querySelectorAll(".sd-section");
    const topBarTitle = $("topBarTitle");

    function activateSection(sectionId) {
      currentSection = sectionId;

      // Toggle sections
      sections.forEach((s) => {
        s.classList.toggle("active", s.id === "section-" + sectionId);
      });

      // Toggle nav active state
      navItems.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.section === sectionId);
        if (btn.dataset.section === sectionId) {
          btn.setAttribute("aria-current", "page");
        } else {
          btn.removeAttribute("aria-current");
        }
      });

      // Update top bar title (use the text inside the nav button span)
      const activeBtn = document.querySelector(
        `.sd-nav__item[data-section="${sectionId}"] span[data-i18n]`
      );
      if (topBarTitle && activeBtn) {
        topBarTitle.textContent = activeBtn.textContent;
      }

      // Close mobile sidebar on navigate
      const sidebar = $("sdSidebar");
      const overlay = $("sdOverlay");
      if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove("open");
        overlay && overlay.classList.remove("active");
      }

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      loadStudentSectionData(sectionId);
    }

    navItems.forEach((btn) => {
      btn.addEventListener("click", () => activateSection(btn.dataset.section));
    });

    // Expose for use by "View All" buttons
    window._sdActivateSection = activateSection;
  }

  /* ── "View All" / link buttons that navigate to a section ──────── */
  function setupLinkButtons() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".sd-link-btn[data-section]");
      if (btn && window._sdActivateSection) {
        window._sdActivateSection(btn.dataset.section);
      }
    });
  }

  /* ================================================================
     TOPBAR — notification panel toggle
  ================================================================ */
  function setupTopbar() {
    const notifBtn   = $("sdNotifBtn");
    const notifPanel = $("notifPanel");

    if (!notifBtn || !notifPanel) return;

    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !notifPanel.hidden;
      notifPanel.hidden = isOpen;
    });

    document.addEventListener("click", (e) => {
      if (!notifPanel.hidden && !notifPanel.contains(e.target) && e.target !== notifBtn) {
        notifPanel.hidden = true;
      }
    });

    // Keyboard
    notifBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        notifBtn.click();
      }
    });
  }

  function setupInteractiveControls() {
    const searchInput = $("sdSearchInput");
    const profileBtn = $("topbarProfileBtn");
    const newMessageBtn = $("newMessageBtn");
    const resourceSearch = $("resourceSearch");

    searchInput && searchInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const query = searchInput.value.trim();
      if (!query) return;
      runDashboardSearch(query);
    });

    const openProfile = () => {
      if (window._sdActivateSection) window._sdActivateSection("profile");
    };

    profileBtn && profileBtn.addEventListener("click", openProfile);
    profileBtn && profileBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProfile();
      }
    });

    newMessageBtn && newMessageBtn.addEventListener("click", () => {
      openStudentMessageComposer();
    });

    resourceSearch && resourceSearch.addEventListener("input", () => {
      const query = resourceSearch.value.trim().toLowerCase();
      const grid = $("resourceGrid");
      const empty = $("resourceEmpty");
      if (!grid) return;

      let visible = 0;
      Array.from(grid.children).forEach((item) => {
        if (item.id === "resourceEmpty") return;
        const match = !query || (item.textContent || "").toLowerCase().includes(query);
        item.style.display = match ? "" : "none";
        if (match) visible++;
      });

      if (empty && grid.children.length > 1) {
        empty.style.display = visible ? "none" : "flex";
      }
    });

    document.querySelectorAll(".sd-view-toggle").forEach((group) => {
      group.querySelectorAll(".sd-view-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          group.querySelectorAll(".sd-view-btn").forEach((item) => item.classList.remove("active"));
          btn.classList.add("active");
          const container = group.closest(".sd-schedule-full");
          if (container) container.dataset.view = btn.dataset.view || "";
          renderFullSchedule();
        });
      });
    });

    const sortSelect = $("scheduleSortOrder");
    sortSelect?.addEventListener("change", () => {
      scheduleSortOrder = sortSelect.value === "desc" ? "desc" : "asc";
      renderFullSchedule();
    });
  }

  /* ================================================================
     NOTIFICATION PANEL
  ================================================================ */
  function setupNotificationPanel() {
    const markAllBtn = $("markAllRead");
    if (markAllBtn) {
      markAllBtn.addEventListener("click", async () => {
        const unreadItems = Array.from(document.querySelectorAll(".sd-notif-list-item.unread"));
        unreadItems.forEach((el) => {
          el.classList.remove("unread");
        });
        studentUnreadMessages = 0;
        studentUnreadNotifications = 0;
        studentUnreadSections = { courses: 0, assignments: 0, schedule: 0 };
        updateNotifDot();
        if (!window.lmsSupabase || unreadItems.length === 0) return;
        const unreadNotificationIds = unreadItems.map((item) => item.dataset.id).filter(Boolean);
        const unreadMessageIds = unreadItems.map((item) => item.dataset.messageId).filter(Boolean);
        if (unreadNotificationIds.length > 0) {
          await runSupabaseSilently(window.lmsSupabase
            .from("notifications")
            .update({ is_read: true, read_at: new Date().toISOString() })
            .in("id", unreadNotificationIds));
        }
        if (unreadMessageIds.length > 0) {
          await runSupabaseSilently(window.lmsSupabase
            .from("messages")
            .update({ is_read: true, read_at: new Date().toISOString() })
            .in("id", unreadMessageIds));
          if (currentSection === "messages") await loadMessages(currentStudentProfile?.id);
        }
        // Re-fetch dari DB untuk pastikan state akurat
        await loadNotifications(currentStudentProfile?.id);
        $("notifPanel") && ($("notifPanel").hidden = true);
      });
    }
  }

  function renderNotifications(notifications, messageNotifs = []) {
    const list    = $("notifList");
    if (!list) return;
    updateStudentSectionNotificationCounts(notifications);

    const messageItems = (messageNotifs || []).map((msg) => ({
      id: msg.id,
      kind: "message",
      unread: true,
      type: "new_message",
      title: msg.subject || `New message from ${msg.profiles?.full_name || msg.profiles?.email || "Trainer"}`,
      created_at: msg.created_at,
      preview: msg.body || ""
    }));
    const notificationItems = (notifications || []).map((n) => ({
      id: n.id,
      kind: "notification",
      unread: !n.is_read,
      type: n.type,
      title: n.title,
      created_at: n.created_at,
      preview: ""
    }));
    const items = [...messageItems, ...notificationItems]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 10);

    if (items.length === 0) {
      list.innerHTML = `<li class="sd-notif-empty" data-i18n="lmsNoNotifications">No notifications</li>`;
      studentUnreadNotifications = 0;
      studentUnreadMessages = 0;
      studentUnreadSections = { courses: 0, assignments: 0, schedule: 0 };
      updateStudentAttentionIndicators();
      return;
    }

    studentUnreadNotifications = (notifications || []).filter((n) => !n.is_read).length;
    studentUnreadMessages = (messageNotifs || []).filter((msg) => !msg.is_read && msg.recipient_id === currentStudentProfile?.id).length;
    updateStudentAttentionIndicators();

    list.innerHTML = items
      .map(
        (item) => `
      <li class="sd-notif-list-item ${item.unread ? "unread" : ""}" data-kind="${item.kind}" data-type="${escHtml(item.type || "")}" ${item.kind === "message" ? `data-message-id="${escHtml(item.id)}"` : `data-id="${escHtml(item.id)}"`}>
        <div class="sd-notif-list-item__icon">
          ${getNotifIcon(item.type)}
        </div>
        <div class="sd-notif-list-item__body">
          <p class="sd-notif-list-item__title">${escHtml(item.title || "Notification")}</p>
          ${item.preview ? `<p class="sd-notif-list-item__time">${escHtml(String(item.preview).slice(0, 90))}</p>` : ""}
          <p class="sd-notif-list-item__time">${timeAgo(item.created_at)}</p>
        </div>
      </li>`
      )
      .join("");

    // Mark as read on click
    list.querySelectorAll(".sd-notif-list-item").forEach((item) => {
      item.addEventListener("click", async () => {
        const kind = item.dataset.kind;
        item.classList.remove("unread");
        if (kind === "message") {
          const messageId = item.dataset.messageId;
          if (messageId && window.lmsSupabase) {
            await runSupabaseSilently(window.lmsSupabase
              .from("messages")
              .update({ is_read: true, read_at: new Date().toISOString() })
              .eq("id", messageId));
          }
          studentUnreadMessages = Math.max(studentUnreadMessages - 1, 0);
          activeStudentMessageView = "inbox";
          const notifPanel = $("notifPanel");
          if (notifPanel) notifPanel.hidden = true;
          if (window._sdActivateSection) window._sdActivateSection("messages");
          await loadMessages(currentStudentProfile?.id, { selectedMessageId: messageId });
        } else {
          const id = item.dataset.id;
          studentUnreadNotifications = list.querySelectorAll(".sd-notif-list-item.unread[data-kind='notification']").length;
          if (id && window.lmsSupabase) {
            await runSupabaseSilently(window.lmsSupabase
              .from("notifications")
              .update({ is_read: true, read_at: new Date().toISOString() })
              .eq("id", id));
          }
          const targetSection = notificationSection(item.dataset.type);
          const notifPanel = $("notifPanel");
          if (notifPanel) notifPanel.hidden = true;
          await loadNotifications(currentStudentProfile?.id);
          if (targetSection && window._sdActivateSection) window._sdActivateSection(targetSection);
        }
        updateStudentAttentionIndicators();
      });
    });
  }

  function updateNotifDot() {
    studentUnreadNotifications = document.querySelectorAll(".sd-notif-list-item.unread").length;
    updateStudentAttentionIndicators();
  }

  function getNotifIcon(type) {
    const icons = {
      assignment_graded: "📝",
      assignment_new:    "📋",
      material_new:      "📚",
      quiz_result:       "✅",
      new_message:       "💬",
      forum_reply:       "💬",
      course_enrolled:   "🎓",
      certificate_issued:"🏆",
      session_reminder:  "📅",
      schedule_new:      "📅",
      announcement:      "📢",
      deadline_reminder: "⏰",
    };
    return icons[type] || "🔔";
  }

  /* ================================================================
     ACCORDION (Change Password)
  ================================================================ */
  function setupAccordion() {
    const trigger = $("changePasswordToggle");
    const body    = $("changePasswordBody");

    if (!trigger || !body) return;

    trigger.addEventListener("click", () => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!expanded));
      body.hidden = expanded;
    });
  }

  /* ================================================================
     FILTER TABS (generic)
  ================================================================ */
  function setupFilterTabs() {
    document.querySelectorAll(".sd-filter-tabs").forEach((tabGroup) => {
      tabGroup.querySelectorAll(".sd-filter-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          tabGroup.querySelectorAll(".sd-filter-tab").forEach((t) =>
            t.classList.remove("active")
          );
          tab.classList.add("active");
          // Emit custom event for section-specific handlers
          tab.dispatchEvent(
            new CustomEvent("sd:filter-change", {
              bubbles: true,
              detail: {
                filter: tab.dataset.filter || tab.dataset.category || tab.dataset.view,
              },
            })
          );
        });
      });
    });
  }

  /* ================================================================
     AVATAR UPLOAD (client-side preview + Supabase Storage upload)
  ================================================================ */
  function setupAvatarUpload() {
    const uploadBtn = $("avatarUploadBtn");
    const fileInput = $("avatarInput");

    if (!uploadBtn || !fileInput) return;

    uploadBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      const previousAvatars = Array.from(document.querySelectorAll(".sd-avatar"))
        .map((el) => [el, el.innerHTML]);

      // Get or create status element
      const statusEl = $("avatarUploadStatus") || (() => {
        const el = document.createElement("p");
        el.id = "avatarUploadStatus";
        el.style.cssText = "font-size:11.5px;margin-top:6px;";
        uploadBtn?.parentNode?.insertBefore(el, uploadBtn.nextSibling);
        return el;
      })();

      const setStatus = (txt, color) => {
        if (statusEl) { statusEl.textContent = txt; statusEl.style.color = color; }
      };

      // Disable button during upload
      if (uploadBtn) uploadBtn.disabled = true;
      setStatus("Uploading...", "var(--sd-text-muted)");

      // Upload to Supabase Storage
      try {
        if (!window.lmsSupabase || !currentStudentProfile) {
          throw new Error("Supabase Storage is not available.");
        }

        const previewSrc = await readFileAsDataUrl(file);
        renderStudentAvatar(previewSrc, currentStudentProfile.full_name || "Avatar");

        const ext  = file.name.split(".").pop();
        const path = `avatars/${currentStudentProfile.id}.${ext}`;
        const { error } = await window.lmsSupabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true, contentType: file.type });

        if (!error) {
          const { data: urlData } = window.lmsSupabase.storage
            .from("avatars")
            .getPublicUrl(path);
          const avatarUrl = withAvatarCacheBust(urlData.publicUrl);

          const { error: profileErr } = await window.lmsSupabase
            .from("profiles")
            .update({ avatar_url: avatarUrl })
            .eq("id", currentStudentProfile.id);
          if (profileErr) throw profileErr;

          currentStudentProfile = { ...currentStudentProfile, avatar_url: avatarUrl };
          renderStudentAvatar(avatarUrl, currentStudentProfile.full_name || "Avatar");
          setStatus("✓ Photo updated!", "var(--sd-green)");
        } else {
          throw error;
        }
      } catch (err) {
        previousAvatars.forEach(([el, html]) => { el.innerHTML = html; });
        setStatus("Upload failed: " + (err.message || "Unknown error"), "var(--sd-red)");
        console.error("Avatar upload error:", err);
      } finally {
        if (uploadBtn) uploadBtn.disabled = false;
        setTimeout(() => setStatus("", ""), 4000);
      }
    });
  }

  /* ================================================================
     SAVE PROFILE
  ================================================================ */
  function setupProfileForm() {
    const saveBtn = $("saveProfileBtn");
    const msgEl   = $("profileMsg");
    const formWrap = document.querySelector(".sd-profile-form");

    if (!saveBtn) return;

    formWrap && formWrap.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.target.tagName === "TEXTAREA") return;
      e.preventDefault();
      saveBtn.click();
    });

    saveBtn.addEventListener("click", async () => {
      if (!currentStudentProfile || !window.lmsSupabase) return;

      saveBtn.disabled = true;
      if (msgEl) { msgEl.textContent = ""; msgEl.className = "sd-profile-form__msg"; }

      const payload = {
        full_name:    ($("pfFullName")?.value || "").trim(),
        phone:        ($("pfPhone")?.value    || "").trim(),
        date_of_birth: $("pfDob")?.value || null,
        timezone:     $("pfTimezone")?.value  || "Australia/Sydney",
        address:      ($("pfAddress")?.value  || "").trim(),
        city:         ($("pfCity")?.value     || "").trim(),
        postcode:     ($("pfPostcode")?.value || "").trim(),
        bio:          ($("pfBio")?.value      || "").trim(),
      };

      try {
        const { error } = await window.lmsSupabase
          .from("profiles")
          .update(payload)
          .eq("id", currentStudentProfile.id);

        if (error) throw error;

        if (msgEl) {
          msgEl.textContent = "✓ Changes saved successfully";
          msgEl.classList.add("success");
        }

        // Update sidebar name
        if (payload.full_name) {
          setNameDisplays(payload.full_name);
        }
      } catch (err) {
        if (msgEl) {
          msgEl.textContent = "Error: " + (err.message || "Could not save changes");
          msgEl.classList.add("error");
        }
      } finally {
        saveBtn.disabled = false;
        setTimeout(() => {
          if (msgEl) { msgEl.textContent = ""; msgEl.className = "sd-profile-form__msg"; }
        }, 4000);
      }
    });

    // Change Password
    const changePwBtn = $("changePasswordBtn");
    const pwMsgEl     = $("passwordMsg");

    if (!changePwBtn) return;

    changePwBtn.addEventListener("click", async () => {
      const current = $("pfCurrentPw")?.value;
      const newPw   = $("pfNewPw")?.value;
      const confirm = $("pfConfirmPw")?.value;

      if (!current) {
        if (pwMsgEl) {
          pwMsgEl.textContent = "Current password is required";
          pwMsgEl.className = "sd-profile-form__msg error";
        }
        return;
      }

      if (!newPw || newPw !== confirm) {
        if (pwMsgEl) {
          pwMsgEl.textContent = "Passwords do not match";
          pwMsgEl.className = "sd-profile-form__msg error";
        }
        return;
      }

      if (newPw.length < 8) {
        if (pwMsgEl) {
          pwMsgEl.textContent = "Password must be at least 8 characters";
          pwMsgEl.className = "sd-profile-form__msg error";
        }
        return;
      }

      changePwBtn.disabled = true;

      try {
        const { error: verifyError } = await window.lmsSupabase.auth.signInWithPassword({
          email: currentStudentProfile?.email || "",
          password: current,
        });
        if (verifyError) throw verifyError;

        const { error } = await window.lmsSupabase.auth.updateUser({ password: newPw });
        if (error) throw error;

        if (pwMsgEl) {
          pwMsgEl.textContent = "✓ Password updated";
          pwMsgEl.className = "sd-profile-form__msg success";
        }

        // Clear fields
        [$("pfCurrentPw"), $("pfNewPw"), $("pfConfirmPw")].forEach((el) => {
          if (el) el.value = "";
        });
      } catch (err) {
        if (pwMsgEl) {
          pwMsgEl.textContent = "Error: " + (err.message || "Could not update password");
          pwMsgEl.className = "sd-profile-form__msg error";
        }
      } finally {
        changePwBtn.disabled = false;
        setTimeout(() => {
          if (pwMsgEl) { pwMsgEl.textContent = ""; pwMsgEl.className = "sd-profile-form__msg"; }
        }, 4000);
      }
    });
  }

  /* ================================================================
     SUPABASE DATA LOADERS
  ================================================================ */
  async function loadStudentSectionData(sectionId) {
    // Profile selalu di-refresh (tidak pakai cache guard)
    if (sectionId === "profile") {
      if (currentStudentProfile) {
        if ($("pfFullName")) $("pfFullName").value = currentStudentProfile.full_name || "";
        if ($("pfPhone"))    $("pfPhone").value    = currentStudentProfile.phone     || "";
        if ($("pfDob"))      $("pfDob").value      = currentStudentProfile.date_of_birth || "";
        if ($("pfBio"))      $("pfBio").value      = currentStudentProfile.bio       || "";
        if ($("pfTimezone")) $("pfTimezone").value = currentStudentProfile.timezone  || "Australia/Sydney";
        if ($("pfAddress"))  $("pfAddress").value  = currentStudentProfile.address   || "";
        if ($("pfCity"))     $("pfCity").value     = currentStudentProfile.city      || "";
        if ($("pfPostcode")) $("pfPostcode").value = currentStudentProfile.postcode  || "";
      }
      return; // tidak perlu cache untuk profile
    }

    // Sections yang harus selalu reload agar data terbaru terlihat
    const alwaysReload = ["assignments", "messages", "schedule", "resources"];
    if (alwaysReload.includes(sectionId)) {
      loadedStudentSections.delete(sectionId);
    }

    if (loadedStudentSections.has(sectionId)) return;
    loadedStudentSections.add(sectionId);

    switch (sectionId) {
      case "courses":      await loadCourseGrid(currentStudentProfile?.id); break;
      case "assignments":  await loadAssignments(currentStudentProfile?.id); break;
      case "schedule":     await loadFullSchedule(currentStudentProfile?.id); break;
      case "certificates": await loadCertificates(currentStudentProfile?.id); break;
      case "messages":     await loadMessages(currentStudentProfile?.id); break;
      case "resources":    await loadResources(currentStudentProfile?.id); break;
    }
  }

  async function loadStudentData() {
    try {
      if (!window.lmsSupabase) {
        if (window.__lmsSupabaseReady__) {
          await window.__lmsSupabaseReady__;
        }
      }
      if (!window.lmsSupabase) {
        console.warn("Supabase not initialised");
        return;
      }

      // 1. Get current user
      const { data: { user }, error: authErr } = await window.lmsSupabase.auth.getUser();
      if (authErr || !user) {
        console.warn("Not authenticated — guard.js should redirect");
        return;
      }

      // 2. Fetch profile
      const { data: profile, error: profileErr } = await window.lmsSupabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileErr || !profile) {
        console.error("Profile not found:", profileErr);
        return;
      }

      currentStudentProfile = profile;

      // 3. Populate UI
      populateProfileUI(profile);

      // 4. Load home dashboard data; other sections lazy-load when opened.
      await Promise.all([
        loadDashboardStats(user.id),
        loadCompetencySummary(user.id),
        loadContinueLearning(user.id),
        loadUpcomingSchedule(user.id),
        loadAnnouncements(currentStudentProfile.id),
        loadActivityFeed(user.id),
        loadNotifications(user.id),
        refreshStudentMessageIndicators(user.id),
      ]);

      // 5. Setup interactive forms now that profile is loaded
      setupProfileForm();

      // 6. Setup Supabase Realtime for notifications
      setupRealtimeNotifications(user.id);
      setupRealtimeMessages(user.id);

    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  }

  /* ── Populate profile information across all UI elements ────────── */
  function populateProfileUI(profile) {
    const name = profile.full_name || "—";

    setNameDisplays(name);

    // Email
    const emailEls = [$("topbarName"), $("profileCardEmail")];
    // topbarName is name not email, handle separately below
    if ($("profileCardEmail")) $("profileCardEmail").textContent = profile.email || "—";
    if ($("studentEmail")) $("studentEmail").textContent = profile.email || "—";

    // IDs
    if ($("profileCardId")) {
      $("profileCardId").textContent = profile.student_id || profile.id || "—";
    }

    // Joined date
    if ($("profileCardJoined") && profile.created_at) {
      $("profileCardJoined").textContent = new Date(profile.created_at).toLocaleDateString(
        "en-AU",
        { year: "numeric", month: "long", day: "numeric" }
      );
    }

    // Batch (from metadata or profile — adapt field name as needed)
    if ($("welcomeBatch")) {
      const batchYear = profile.batch
        || (profile.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear());
      $("welcomeBatch").textContent = batchYear;
    }

    // Avatar
    if (profile.avatar_url) {
      renderStudentAvatar(profile.avatar_url, name);
    }

    // Pre-fill form fields
    if ($("pfFullName")) $("pfFullName").value = profile.full_name || "";
    if ($("pfPhone"))    $("pfPhone").value    = profile.phone     || "";
    if ($("pfDob"))      $("pfDob").value      = profile.date_of_birth || "";
    if ($("pfAddress"))  $("pfAddress").value  = profile.address   || "";
    if ($("pfCity"))     $("pfCity").value     = profile.city      || "";
    if ($("pfPostcode")) $("pfPostcode").value = profile.postcode  || "";
    if ($("pfBio"))      $("pfBio").value      = profile.bio       || "";
    if ($("pfTimezone")) $("pfTimezone").value = profile.timezone  || "Australia/Sydney";
  }

  function setNameDisplays(name) {
    const nameEls = [
      $("sidebarName"), $("topbarName"), $("welcomeName"), $("profileCardName"),
    ];
    nameEls.forEach((el) => { if (el) el.textContent = name; });
    if ($("studentName")) $("studentName").textContent = name;
  }

  async function loadCompetencySummary(userId) {
    const container = $("competencySummaryContent");
    if (!container || !window.lmsSupabase || !Competency.calculateCompetencyResult) return;

    const renderEmpty = (message = "No assessment components are available yet.") => {
      container.innerHTML = `
        <div class="sd-empty-state" style="padding:1rem 0">
          <p style="margin:0;font-size:.875rem">${escHtml(message)}</p>
        </div>`;
    };

    try {
      const { data: enrollments, error: enrollErr } = await window.lmsSupabase
        .from("enrollments")
        .select("id, student_id, course_id, status, courses(id, title)")
        .eq("student_id", userId);
      if (enrollErr) throw enrollErr;

      const validEnrollments = (enrollments || []).filter((enrollment) =>
        ["active", "completed", "paid", "enrolled"].includes(String(enrollment.status || "").toLowerCase())
      );
      const courseIds = [...new Set(validEnrollments.map((enrollment) => enrollment.course_id).filter(Boolean))];
      if (courseIds.length === 0) {
        renderEmpty("No active competency assessments.");
        return;
      }

      const { data: courses } = await window.lmsSupabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds)
        .catch(() => ({ data: [] }));
      const courseMap = new Map((courses || []).map((course) => [course.id, course]));

      const { data: assignments, error: assignErr } = await window.lmsSupabase
        .from("assignments")
        .select(`
          *,
          assignment_submissions (
            id,
            assignment_id,
            student_id,
            status,
            submitted_at,
            grade,
            feedback
          )
        `)
        .in("course_id", courseIds);
      if (assignErr) throw assignErr;

      const rows = validEnrollments.map((enrollment) => {
        const courseAssignments = (assignments || []).filter((assignment) =>
          assignment.course_id === enrollment.course_id && assignment.is_published !== false
        );
        const components = courseAssignments.map((assignment) => {
          const submissions = Array.isArray(assignment.assignment_submissions)
            ? assignment.assignment_submissions
            : [];
          const submission = submissions.find((item) => item.student_id === userId);
          return Competency.componentFromAssignment(assignment, submission);
        });
        const result = Competency.calculateCompetencyResult({
          enrollment,
          requiredComponents: components
        });
        const course = enrollment.courses || courseMap.get(enrollment.course_id) || {};
        const reason = result.unsatisfactoryReasons[0] || "All required assessment components are satisfactory.";
        return `
          <div class="sd-assignment-item" data-competency-course="${escHtml(enrollment.course_id)}">
            <div class="sd-assignment-item__body">
              <p class="sd-assignment-item__title">${escHtml(course.title || "Course")}</p>
              <p class="sd-assignment-item__meta">Assessment Progress: ${result.completedRequiredCount}/${result.totalRequiredCount} required components satisfactory</p>
              <p class="sd-assignment-item__meta">${escHtml(reason)}</p>
            </div>
            <div class="sd-assignment-item__actions">
              <span class="sd-status-badge ${result.isCompetent ? "sd-status-badge--completed" : "sd-status-badge--inactive"}">
                ${escHtml(result.displayLabel)}
              </span>
            </div>
          </div>`;
      }).join("");

      if (!rows) {
        renderEmpty();
        return;
      }
      container.innerHTML = rows;
    } catch (err) {
      console.warn("Competency summary load error:", err.message || err);
      renderEmpty("Competency status is not available right now.");
    }
  }

  /* ── Dashboard Stats ────────────────────────────────────────────── */
  async function loadDashboardStats(userId) {
    // [FIX-BUG#2] Hitung dari enrollments langsung, tidak bergantung pada view
    let activeCourseCount = null;
    let pendingAssignmentCount = null;
    try {
      activeCourseCount = await countStudentActiveCourses(userId);
      pendingAssignmentCount = await countStudentPendingAssignments(userId);
    } catch (preErr) {
      console.warn("[STATS] Pre-fetch error:", preErr.message);
    }

    try {
      // Use the v_student_dashboard view from our schema
      const { data, error } = await window.lmsSupabase
        .from("v_student_dashboard")
        .select("*")
        .eq("student_id", userId)
        .single();

      if (error) {
        if (error.code === "42P01") {
          console.error("[LMS] View missing: v_student_dashboard.", error);
        } else if (error.code === "PGRST116") {
          // [FIX-BUG#2] Student belum punya row di view — tampilkan dari direct count
          console.warn("[STATS] No row in v_student_dashboard for this student. Using direct count.");
          if ($("statCoursesEnrolled"))
            $("statCoursesEnrolled").textContent = activeCourseCount ?? 0;
          if ($("statPendingAssignments"))
            $("statPendingAssignments").textContent = pendingAssignmentCount ?? 0;
          studentPendingAssignmentCount = pendingAssignmentCount ?? 0;
          if ($("statLessonsCompleted"))   $("statLessonsCompleted").textContent   = 0;
          if ($("statCertificates"))       $("statCertificates").textContent       = 0;
          updateStudentAttentionIndicators();
          return;
        } else {
          throw error;
        }
        throw error;
      }

      const dashboardCourseCount = data.courses_enrolled || 0;
      const dashboardPendingCount = data.pending_submissions || 0;
      const finalPendingCount = pendingAssignmentCount === null
        ? dashboardPendingCount
        : Math.max(dashboardPendingCount, pendingAssignmentCount);
      studentPendingAssignmentCount = finalPendingCount;
      if ($("statCoursesEnrolled")) {
        $("statCoursesEnrolled").textContent = activeCourseCount === null
          ? dashboardCourseCount
          : activeCourseCount;
      }
      if ($("statLessonsCompleted"))   $("statLessonsCompleted").textContent   = data.lessons_completed   || 0;
      if ($("statPendingAssignments")) $("statPendingAssignments").textContent = finalPendingCount;
      if ($("statCertificates"))       $("statCertificates").textContent       = 0;

      // Update assignment badge in nav
      updateStudentAttentionIndicators();

      const statNavMap = [
        { cardId: "statCoursesEnrolled",    section: "courses",      trend: "up"   },
        { cardId: "statLessonsCompleted",   section: "courses",      trend: "up"   },
        { cardId: "statPendingAssignments", section: "assignments",  trend: "down" },
        { cardId: "statCertificates",       section: "certificates", trend: "up"   },
      ];
      statNavMap.forEach(({ cardId, section, trend }) => {
        const card = $(cardId)?.closest(".sd-stat-card");
        if (!card) return;
        if (!card.querySelector(".sd-stat-card__trend")) {
          const trendEl = document.createElement("div");
          trendEl.className = "sd-stat-card__trend";
          trendEl.innerHTML = `<span class="sd-trend sd-trend--${trend}">${trend === "up" ? "↑" : "↓"}</span>`;
          card.appendChild(trendEl);
        }
        card.style.cursor = "pointer";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `Buka section ${section}`);
        card.addEventListener("click", () => window._sdActivateSection?.(section));
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window._sdActivateSection?.(section); }
        });
      });
    } catch (err) {
      console.warn("Stats load error (view may not exist yet):", err.message);
      // [FIX-BUG#2] Gunakan direct count jika view error
      if ($("statCoursesEnrolled"))
        $("statCoursesEnrolled").textContent = activeCourseCount ?? 0;
      if ($("statPendingAssignments"))
        $("statPendingAssignments").textContent = pendingAssignmentCount ?? 0;
      studentPendingAssignmentCount = pendingAssignmentCount ?? 0;
      if ($("statLessonsCompleted"))   $("statLessonsCompleted").textContent   = 0;
      if ($("statCertificates"))       $("statCertificates").textContent       = 0;
      updateStudentAttentionIndicators();
    }
  }

  /* ── Continue Learning ──────────────────────────────────────────── */
  async function getFirstActiveCourseForContinue(userId) {
    const courseIds = await getStudentEnrollmentCourseIds(userId, { activeOnly: true });
    if (!courseIds || courseIds.length === 0) return null;
    const { data, error } = await window.lmsSupabase
      .from("courses")
      .select("id, title, thumbnail_url, slug, category_id, categories(name)")
      .in("id", courseIds)
      .eq("status", "published")
      .order("title", { ascending: true })
      .limit(1);
    if (error) throw error;
    return data?.[0] || null;
  }

  async function renderContinueLearningCourse(container, course, completionPercent = 0) {
    const pct = Math.round(completionPercent || 0);
    const thumbSrc = await resolveCourseMaterialUrl({ material_url: course.thumbnail_url }) || "";
    container.innerHTML = `
        <div class="sd-continue-item">
          <div class="sd-continue-item__thumb${thumbSrc ? "" : " sd-continue-item__thumb--placeholder"}">
            ${thumbSrc
              ? `<img src="${escHtml(thumbSrc)}" alt="${escHtml(course.title)}" loading="lazy" />`
              : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`
            }
          </div>
          <div>
            <p class="sd-continue-item__course">${escHtml(course.categories?.name || course.category_id || "Program")}</p>
            <p class="sd-continue-item__title">${escHtml(course.title)}</p>
            <div class="sd-progress">
              <div class="sd-progress__bar">
                <div class="sd-progress__fill" style="width:${pct}%"></div>
              </div>
              <span class="sd-progress__pct">${pct}%</span>
            </div>
            <button class="sd-btn sd-btn--primary sd-btn--sm sd-continue-item__btn"
              onclick="window._sdActivateSection('courses')"
              data-i18n="lmsContinueBtn">Continue</button>
          </div>
        </div>`;
  }

  function renderNoActiveCourses(container) {
    container.innerHTML = `
        <div class="sd-empty-state" style="padding:1.5rem 0">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          <p data-i18n="lmsNoCourses" style="margin:0;font-size:.875rem">No active courses</p>
        </div>`;
  }

  async function loadContinueLearning(userId) {
    const container = $("continueLearningContent");
    if (!container) return;

    try {
      const { data, error } = await window.lmsSupabase
        .from("course_progress")
        .select(`
          completion_percent,
          last_accessed_at,
          last_lesson_id,
          courses ( id, title, thumbnail_url, slug, category_id, categories(name) ),
          enrollments ( status )
        `)
        .eq("student_id", userId)
        .lt("completion_percent", 100)
        .order("last_accessed_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) throw error || new Error("No active course");

      await renderContinueLearningCourse(container, data.courses, data.completion_percent);
    } catch {
      try {
        const fallbackCourse = await getFirstActiveCourseForContinue(userId);
        if (fallbackCourse) {
          await renderContinueLearningCourse(container, fallbackCourse, 0);
          return;
        }
      } catch {}
      renderNoActiveCourses(container);
    }
  }

  /* ── Upcoming Schedule ──────────────────────────────────────────── */
  async function markLessonCompleted(lessonId, courseId) {
    if (!currentStudentProfile?.id || !window.lmsSupabase) return;
    const userId = currentStudentProfile.id;

    try {
      const completedAt = new Date().toISOString();
      const { data: existingLessonProgress, error: existingLessonErr } = await window.lmsSupabase
        .from("progress")
        .select("id")
        .eq("student_id", userId)
        .eq("lesson_id", lessonId)
        .limit(1);
      if (existingLessonErr) throw existingLessonErr;

      if (existingLessonProgress?.[0]?.id) {
        const { error: lessonUpdateErr } = await window.lmsSupabase
          .from("progress")
          .update({ completed: true, completed_at: completedAt })
          .eq("id", existingLessonProgress[0].id);
        if (lessonUpdateErr) throw lessonUpdateErr;
      } else {
        const { error: lessonInsertErr } = await window.lmsSupabase
          .from("progress")
          .insert({
            student_id: userId,
            lesson_id: lessonId,
            completed: true,
            completed_at: completedAt
          });
        if (lessonInsertErr) throw lessonInsertErr;
      }

      const { error: progressRpcErr } = await window.lmsSupabase.rpc("recalculate_course_progress", {
        p_student_id: userId,
        p_course_id: courseId,
        p_last_lesson_id: lessonId
      });
      if (progressRpcErr) throw progressRpcErr;

      // Ambil judul lesson untuk activity log
      const { data: lessonData } = await window.lmsSupabase
        .from("lessons")
        .select("title")
        .eq("id", lessonId)
        .single()
        .catch(() => ({ data: null }));

      await window.lmsSupabase.from("activity_logs").insert({
        user_id: userId,
        action: "lesson_completed",
        entity_type: "lesson",
        entity_id: lessonId,
        metadata: {
          course_id: courseId,
          lesson_id: lessonId,
          lesson_title: lessonData?.title || "Lesson"
        }
      }).catch(() => {});

      await loadDashboardStats(userId);
      await loadContinueLearning(userId);
    } catch (err) {
      console.error("Progress update error:", err.message);
    }
  }

  window.lmsMarkLessonCompleted = markLessonCompleted;

  function ensureStudentCourseDetailPanel() {
    const section = $("section-courses");
    if (!section) return null;
    let panel = $("studentCourseDetail");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "studentCourseDetail";
      panel.className = "sd-message-view sd-course-detail";
      panel.hidden = true;
      section.appendChild(panel);
    }
    return panel;
  }

  function renderStudentLessonModules(lessons) {
    if (!lessons?.length) {
      return `<div class="sd-course-detail__empty">Belum ada materi tersedia untuk kursus ini.</div>`;
    }
    const modules = new Map();
    lessons.forEach((lesson) => {
      const key = String(lesson.module_order || 1);
      if (!modules.has(key)) {
        modules.set(key, {
          title: lesson.module_title || `Module ${key}`,
          lessons: []
        });
      }
      modules.get(key).lessons.push(lesson);
    });
    return Array.from(modules.values()).map((module) => `
      <section class="sd-course-detail__module">
        <div class="sd-course-detail__module-head">
          <h4>${escHtml(module.title)}</h4>
          <span>${module.lessons.length} lesson${module.lessons.length === 1 ? "" : "s"}</span>
        </div>
        <div class="sd-course-detail__lesson-list">
          ${module.lessons.map((lesson, index) => {
          const safeUrl = toSafeUiUrl(lesson.material_display_url);
          return `
            <div class="sd-course-detail__lesson">
              <div class="sd-course-detail__lesson-index">${index + 1}</div>
              <div class="sd-course-detail__lesson-main">
                <p>${escHtml(lesson.title || "Lesson")}</p>
                <span>${escHtml(lesson.material_type || "Material")}</span>
              </div>
              ${safeUrl
                ? `<a class="sd-btn sd-btn--outline sd-btn--sm sd-course-detail__material-link" href="${escHtml(safeUrl)}" target="_blank" rel="noopener">Open material</a>`
                : `<span class="sd-course-detail__lesson-status">No file</span>`}
            </div>`;
        }).join("")}
        </div>
      </section>`).join("");
  }

  async function openStudentCourseDetail(course) {
    const panel = ensureStudentCourseDetailPanel();
    if (!panel || !course?.id || !window.lmsSupabase) return;

    panel.hidden = false;
    panel.innerHTML = `
      <div class="sd-course-detail__header">
        <div class="sd-course-detail__heading">
          <span class="sd-course-detail__eyebrow">${escHtml(course.categories?.name || course.category_id || "Course")}</span>
          <h3>${escHtml(course.title || "Course")}</h3>
          <p>Course contents and learning materials</p>
        </div>
        <button class="sd-btn sd-btn--outline sd-btn--sm" type="button" data-student-course-close>Close</button>
      </div>
      <div class="sd-course-detail__body">
        <div class="sd-course-detail__empty">Loading course contents...</div>
      </div>`;
    panel.querySelector("[data-student-course-close]")?.addEventListener("click", () => {
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
      const body = panel.querySelector(".sd-course-detail__body");
      if (body) body.innerHTML = renderStudentLessonModules(lessonsWithUrls);
    } catch (err) {
      const body = panel.querySelector(".sd-course-detail__body");
      if (body) body.innerHTML = `<div class="sd-course-detail__empty">${escHtml(err.message || "Course contents failed to load.")}</div>`;
    }
  }

  async function loadCourseGrid(userId) {
    const grid = $("courseGrid");
    if (!grid) return;

    const renderEmpty = () => {
      grid.innerHTML = `
        <div class="sd-empty-state" style="padding:1.5rem 0">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          <p data-i18n="lmsNoCourses" style="margin:0;font-size:.875rem">No active courses</p>
        </div>`;
      if (typeof updatePageLanguage === "function") updatePageLanguage();
    };

    const applyFilter = (filter) => {
      const activeFilter = (filter || "all").toLowerCase();
      const cards = grid.querySelectorAll(".sd-course-card");
      cards.forEach((card) => {
        const status = (card.dataset.status || "active").toLowerCase();
        const isVisible = activeFilter === "all" || status === activeFilter;
        card.style.display = isVisible ? "" : "none";
      });
    };

    const setupFilterHandler = () => {
      if (grid.dataset.filterBound) return;
      const section = $("section-courses");
      if (!section) return;
      grid.dataset.filterBound = "true";
      section.addEventListener("sd:filter-change", (event) => {
        applyFilter(event.detail?.filter || "all");
      });
      const activeTab = section.querySelector(".sd-filter-tab.active");
      applyFilter(activeTab?.dataset.filter || "all");
    };

    try {
      const { data: enrollments, error: enrollErr } = await window.lmsSupabase
        .from("enrollments")
        .select("course_id, status")
        .eq("student_id", userId);

      if (enrollErr) throw enrollErr;
      const enrolledCourseIds = uniqueIds((enrollments || []).map((e) => e.course_id));
      const batchMaterialCourseIds = await getStudentBatchMaterialCourseIds();
      const studentCourseIds = uniqueIds([...enrolledCourseIds, ...batchMaterialCourseIds]);

      const progressMap = await getCourseProgressMap(userId, studentCourseIds);
      const courseSelect = `
          id, title, thumbnail_url, category_id, trainer_id,
          categories ( name ),
          profiles!courses_trainer_id_fkey(admin_id, student_id)
        `;

      let studentCourses = [];
      if (studentCourseIds.length) {
        const { data, error: enrolledCourseErr } = await window.lmsSupabase
          .from("courses")
          .select(courseSelect)
          .in("id", studentCourseIds)
          .order("title", { ascending: true });
        if (enrolledCourseErr) throw enrolledCourseErr;
        studentCourses = data || [];
      }

      const { data: publishedCourses, error: courseErr } = await window.lmsSupabase
        .from("courses")
        .select(courseSelect)
        .eq("status", "published")
        .order("title", { ascending: true });

      if (courseErr) throw courseErr;
      const courses = Array.from(
        new Map([...(studentCourses || []), ...(publishedCourses || [])].map((course) => [course.id, course])).values()
      ).sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
      if (!courses || courses.length === 0) {
        renderEmpty();
        setupFilterHandler();
        return;
      }

      const enrollmentMap = new Map((enrollments || []).map((enroll) => [enroll.course_id, enroll]));

      grid.innerHTML = "";

      const coursesWithThumbnails = await Promise.all(courses.map(async (course) => ({
        course,
        thumbnailDisplayUrl: await resolveCourseMaterialUrl({ material_url: course.thumbnail_url })
      })));

      const cards = coursesWithThumbnails.map(({ course, thumbnailDisplayUrl }) => {
        const enroll = enrollmentMap.get(course.id);
        const isBatchMaterialCourse = batchMaterialCourseIds.includes(course.id);
        const statusRaw = (enroll?.status || "available").toLowerCase();
        const hasProgress = progressMap.has(course.id);
        const progress = normalizeCompletionPercent(progressMap.get(course.id));
        const status = !enroll && !isBatchMaterialCourse
          ? "available"
          : progress >= 100 || (statusRaw === "completed" && !hasProgress)
          ? "completed"
          : "active";
        const statusLabel = typeof t === "function"
          ? t(status === "completed" ? "lmsFilterCompleted" : status === "available" ? "lmsStatusAvailable" : "lmsFilterActive")
          : status === "completed" ? "Completed" : status === "available" ? "Available" : "Active";
        const badgeClass = status === "completed"
          ? "sd-status-badge--completed"
          : "sd-status-badge--active";
        const progressLabel = typeof t === "function" ? t("lmsProgress") : "Progress";
        const thumbSrc = thumbnailDisplayUrl || "";
        const category = course.categories?.name || course.category_id || "Course";
        const creatorLabel = typeof t === "function" ? t("lmsCreatorId") : "Creator ID";
        const creatorId = creatorIdForCourse(course);

        return `
          <div class="sd-course-card" data-status="${status}" data-course-id="${escHtml(course.id)}" role="button" tabindex="0" aria-label="View ${escHtml(course.title || "course")}">
            <div class="sd-course-card__thumb">
              ${thumbSrc
                ? `<img src="${escHtml(thumbSrc)}" alt="${escHtml(course.title || "Course")}" loading="lazy" />`
                : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`
              }
            </div>
            <div class="sd-course-card__body">
              <p class="sd-course-card__category">${escHtml(category)}</p>
              <h3 class="sd-course-card__title">${escHtml(course.title || "Course")}</h3>
              <p class="sd-course-card__trainer">${escHtml(creatorLabel)}: ${escHtml(creatorId)}</p>
              <div class="sd-course-card__footer">
                <span class="sd-status-badge ${badgeClass}">${escHtml(statusLabel)}</span>
                <span class="sd-course-card__progress">${progress}% ${escHtml(progressLabel)}</span>
              </div>
            </div>
          </div>`;
      }).join("");

      grid.insertAdjacentHTML("beforeend", cards);
      grid.querySelectorAll(".sd-course-card[data-course-id]").forEach((card) => {
        const course = courses.find((item) => item.id === card.dataset.courseId);
        if (!course) return;
        const openDetail = () => openStudentCourseDetail(course);
        card.addEventListener("click", (event) => {
          if (event.target.closest("a,button")) return;
          openDetail();
        });
        card.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          openDetail();
        });
      });
      setupFilterHandler();
    } catch (err) {
      console.warn("Course load error:", err.message);
      renderEmpty();
      setupFilterHandler();
    }
  }

  /* ── Assignments / Quizzes ───────────────────────────────────── */
  async function loadAssignments(userId) {
    const list = $("assignmentList");
    const empty = $("assignmentEmpty");
    if (!list) return;

    const renderEmpty = () => {
      if (empty) empty.style.display = "flex";
    };

    const hideEmpty = () => {
      if (empty) empty.style.display = "none";
    };

    const applyFilter = (filter) => {
      const activeFilter = (filter || "pending").toLowerCase();
      const items = list.querySelectorAll(".sd-assignment-item");
      items.forEach((item) => {
        const status = (item.dataset.status || "pending").toLowerCase();
        const isVisible = activeFilter === status || (activeFilter === "pending" && status === "resubmit_required");
        item.style.display = isVisible ? "" : "none";
      });
    };

    const setupFilterHandler = () => {
      if (list.dataset.filterBound) return;
      const section = $("section-assignments");
      if (!section) return;
      list.dataset.filterBound = "true";
      section.addEventListener("sd:filter-change", (event) => {
        applyFilter(event.detail?.filter || "pending");
      });
      const activeTab = section.querySelector(".sd-filter-tab.active");
      applyFilter(activeTab?.dataset.filter || "pending");
    };

    try {
      const courseIds = await getStudentEnrollmentCourseIds(userId) || [];

      if (courseIds.length === 0) {
        console.warn("[ASSIGNMENTS] No enrolled courses found. Trainer-created assignments won't show.");
        renderEmpty();
        setupFilterHandler();
        return;
      }

      const { data: assignments, error: assignErr } = await window.lmsSupabase
        .from("assignments")
        .select(`
          *,
          courses ( title ),
          assignment_submissions (
            id,
            assignment_id,
            student_id,
            status,
            submitted_at,
            grade,
            feedback
          )
        `)
        .in("course_id", courseIds)
        .order("due_at", { ascending: true });

      if (assignErr) throw assignErr;
      const publishedAssignments = (assignments || []).filter(a => a.is_published !== false);
      if (!publishedAssignments || publishedAssignments.length === 0) {
        renderEmpty();
        setupFilterHandler();
        return;
      }

      list.querySelectorAll(".sd-assignment-item").forEach((el) => el.remove());
      hideEmpty();

      publishedAssignments.forEach((assignment) => {
        const joinedSubmissions = Array.isArray(assignment.assignment_submissions)
          ? assignment.assignment_submissions
          : [];
        const submission = joinedSubmissions.find((item) => item.student_id === userId);
        const statusRaw = submission?.status || "pending";
        const status = ["pending", "submitted", "graded", "resubmit_required"].includes(statusRaw)
          ? statusRaw
          : "pending";

        const statusLabel = typeof t === "function"
          ? t(
              status === "graded"
                ? "lmsTabGraded"
                : status === "submitted"
                ? "lmsTabSubmitted"
                : status === "resubmit_required"
                ? "lmsTabResubmit"
                : "lmsTabPending"
            )
          : status;

        const icon = assignment.type === "quiz" ? "📝" : "📘";
        const title = assignment.title || "Assignment";
        const courseLabel = assignment.courses?.title || "Course";
        const dueDate = assignment.due_at ? new Date(assignment.due_at) : null;
        const isOverdue = dueDate && dueDate < new Date()
          && (status === "pending" || status === "resubmit_required");
        const dueLabel = dueDate
          ? dueDate.toLocaleDateString("en-AU")
          : "";
        const dueLabelHtml = dueDate
          ? `<span style="color:${isOverdue ? "var(--sd-red)" : "var(--sd-text-muted)"};">
              ${isOverdue ? "⚠️ Overdue: " : "Due: "}${escHtml(dueLabel)}
             </span>`
          : "";

        let actions;
        if (status === "pending" || status === "resubmit_required") {
          const resubmitNote = status === "resubmit_required"
            ? `<p style="font-size:11.5px;color:var(--sd-red);margin-bottom:6px;">⚠️ Trainer meminta kamu mengumpulkan ulang tugas ini.</p>`
            : "";
          actions = `
            ${resubmitNote}
            <input
              class="sd-assignment-item__file"
              type="file"
              data-assignment-file="${escHtml(assignment.id)}"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/*,audio/*"
              aria-label="Assignment submission file"
            />
            <button class="sd-btn sd-btn--primary sd-btn--sm" data-action="submit" data-assignment-id="${assignment.id}">
              ${status === "resubmit_required" ? "Kumpulkan Ulang" : (typeof t === "function" ? t("lmsSubmitAssignment") : "Submit")}
            </button>`;
        } else if (status === "graded") {
          const gradeScore = submission?.grade !== null && submission?.grade !== undefined ? `${submission.grade}%` : "-";
          const component = Competency.componentFromAssignment
            ? Competency.componentFromAssignment(assignment, submission)
            : { isSatisfactory: submission?.grade !== null && parseFloat(submission?.grade || 0) >= (assignment.pass_mark || 70) };
          const isPassed = component.isSatisfactory;
          const assessmentLabel = isPassed ? "Satisfactory" : "Not Yet Satisfactory";
          const feedbackText = submission?.feedback ? escHtml(submission.feedback) : "";
          actions = `
            <div class="sd-grade-result" style="text-align:right;">
              <span class="sd-status-badge ${isPassed ? "sd-status-badge--completed" : "sd-status-badge--inactive"}" style="font-size:1rem;">
                ${gradeScore} ${isPassed ? "✓ LULUS" : "✗ TIDAK LULUS"} · ${assessmentLabel}
              </span>
              ${feedbackText ? `<p style="font-size:11.5px;color:var(--sd-text-secondary);margin-top:6px;max-width:220px;">"${feedbackText}"</p>` : ""}
            </div>`;
        } else {
          actions = `<span class="sd-status-badge sd-status-badge--active">${statusLabel}</span>`;
        }

        const item = document.createElement("div");
        item.className = "sd-assignment-item";
        item.dataset.status = status;
        item.innerHTML = `
          <div class="sd-assignment-item__icon">${icon}</div>
          <div class="sd-assignment-item__body">
            <p class="sd-assignment-item__title">${escHtml(title)}</p>
            <p class="sd-assignment-item__meta">${escHtml(courseLabel)}${dueLabelHtml ? ` • ` : ""}${dueLabelHtml}</p>
          </div>
          <div class="sd-assignment-item__actions">
            ${actions}
          </div>`;

        list.appendChild(item);
      });

      list.querySelectorAll("button[data-action='submit']").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const assignmentId = btn.getAttribute("data-assignment-id");
          if (!assignmentId) return;
          const fileInput = btn.closest(".sd-assignment-item")?.querySelector("input[type='file']");
          const file = fileInput?.files?.[0] || null;
          btn.disabled = true;
          const errSpan = btn.closest(".sd-assignment-item__actions")?.querySelector(".sd-assignment-err");
          if (errSpan) errSpan.remove();
          try {
            if (!file) throw new Error(typeof t === "function" ? t("lmsFileRequired") : "Please select a file before submitting.");
            const fileUrl = await uploadAssignmentSubmissionFile(file, userId, assignmentId);
            // Cek apakah sudah ada submission sebelumnya
            const { data: existing } = await window.lmsSupabase
              .from("assignment_submissions")
              .select("id, status")
              .eq("student_id", userId)
              .eq("assignment_id", assignmentId)
              .maybeSingle();

            if (existing?.status === "submitted" || existing?.status === "graded") {
              throw new Error("Tugas ini sudah dikumpulkan dan tidak bisa disubmit ulang.");
            }

            if (existing?.id) {
              // Update existing submission (untuk kasus resubmit_required)
              const { error: updateErr } = await window.lmsSupabase
                .from("assignment_submissions")
                .update({
                  status: "submitted",
                  submitted_at: new Date().toISOString(),
                  file_urls: [fileUrl],
                  notes: null
                })
                .eq("id", existing.id);
              if (updateErr) throw updateErr;
            } else {
              // Insert baru
              const { error: insertErr } = await window.lmsSupabase
                .from("assignment_submissions")
                .insert({
                  student_id: userId,
                  assignment_id: assignmentId,
                  status: "submitted",
                  submitted_at: new Date().toISOString(),
                  file_urls: [fileUrl]
                });
              if (insertErr) throw insertErr;
            }
            await loadAssignments(userId);

            // Tulis activity log
            await window.lmsSupabase.from("activity_logs").insert({
              user_id: userId,
              action: "assignment_submitted",
              entity_type: "assignment_submission",
              entity_id: assignmentId,
              metadata: {
                assignment_title: btn.closest(".sd-assignment-item")
                  ?.querySelector(".sd-assignment-item__title")?.textContent || "Assignment",
                assignment_id: assignmentId
              }
            }).catch(() => {});

            // Ambil trainer_id dari assignment untuk notifikasi
            const { data: assignmentData } = await window.lmsSupabase
              .from("assignments")
              .select("trainer_id, title")
              .eq("id", assignmentId)
              .single()
              .catch(() => ({ data: null }));

            if (assignmentData?.trainer_id) {
              await createNotificationsWithDelivery({
                user_id: assignmentData.trainer_id,
                type: "submission_received",
                title: `New submission for "${assignmentData.title || "Assignment"}"`,
                is_read: false,
              }, "Submission notification insert failed");
            }
          } catch (err) {
            const span = document.createElement("span");
            span.className = "sd-assignment-err";
            span.style.cssText = "font-size:11.5px;color:var(--sd-red,#E24B4A);margin-top:4px;display:block";
            span.textContent = err.message || "Submission failed.";
            btn.closest(".sd-assignment-item__actions")?.appendChild(span);
            btn.disabled = false;
          }
        });
      });

      setupFilterHandler();
    } catch (err) {
      console.warn("Assignments load error:", err.message);
      renderEmpty();
      setupFilterHandler();
    }
  }

  async function fetchStudentScheduleEvents(userId, options = {}) {
    const nowIso = new Date().toISOString();
    const limit = options.limit || 20;
    // [FIX-BUG#3] Gunakan activeOnly: false agar enrollment dengan status
    // non-standard (null, "enrolled") tetap mendapat jadwal.
    const courseIds = await getStudentEnrollmentCourseIds(userId, { activeOnly: false }) || [];
    // [FIX-BUG#3] Jangan early return jika courseIds kosong —
    // jadwal global (course_id IS NULL) tetap harus ditampilkan.

    // TODO: Add is_published column to schedules table if trainer schedule visibility is needed.
    // [FIX-BUG#3] Skip course-specific query jika tidak ada courseIds
    let courseEvents = [];
    if (courseIds.length > 0) {
      const courseScheduleQuery = window.lmsSupabase
        .from("schedules")
        .select("id, title, event_type, start_datetime, end_datetime, meeting_url, course_id, trainer_id")
        .in("course_id", courseIds)
        .order("start_datetime", { ascending: true })
        .limit(limit);
      if (options.upcomingOnly !== false) courseScheduleQuery.gte("start_datetime", nowIso);
      const { data: courseEventsData, error: courseScheduleErr } = await courseScheduleQuery;
      if (courseScheduleErr) throw courseScheduleErr;
      courseEvents = courseEventsData || [];
    }

    let globalEvents = [];
    try {
      const globalScheduleQuery = window.lmsSupabase
        .from("schedules")
        .select("id, title, event_type, start_datetime, end_datetime, meeting_url, course_id, trainer_id")
        .or("course_id.is.null")
        .order("start_datetime", { ascending: true })
        .limit(limit);
      if (options.upcomingOnly !== false) globalScheduleQuery.gte("start_datetime", nowIso);
      const { data, error } = await globalScheduleQuery;
      if (error) throw error;
      globalEvents = data || [];
    } catch (err) {
      console.warn("Global schedule load skipped:", err.message || err);
    }

    let trainerEvents = [];
    try {
      let courseRows = [];
      if (courseIds.length > 0) {
        const { data, error: courseErr } = await window.lmsSupabase
          .from("courses")
          .select("id, trainer_id")
          .in("id", courseIds);
        if (courseErr) throw courseErr;
        courseRows = data || [];
      }
      const trainerIds = [...new Set((courseRows || []).map((row) => row.trainer_id).filter(Boolean))];

      if (trainerIds.length > 0) {
        // [FIX-BUG#3] Ambil SEMUA jadwal dari trainer yang mengajar
        // kursus student — baik yang punya course_id maupun tidak.
        const trainerScheduleQuery = window.lmsSupabase
          .from("schedules")
          .select("id, title, event_type, start_datetime, end_datetime, meeting_url, course_id, trainer_id")
          .in("trainer_id", trainerIds)
          .order("start_datetime", { ascending: true })
          .limit(limit);
        if (options.upcomingOnly !== false) trainerScheduleQuery.gte("start_datetime", nowIso);
        const { data, error } = await trainerScheduleQuery;
        if (error) throw error;
        trainerEvents = data || [];
      }
    } catch (err) {
      console.warn("Trainer-wide schedule load skipped:", err.message || err);
    }

    return Array.from(
      new Map([...(courseEvents || []), ...globalEvents, ...trainerEvents].map((event) => [event.id, event])).values()
    )
      .sort((a, b) => new Date(a.start_datetime || 0) - new Date(b.start_datetime || 0))
      .slice(0, limit);
  }

  async function loadUpcomingSchedule(userId) {
    const list  = $("scheduleList");
    const empty = $("scheduleEmpty");
    if (!list) return;

    try {
      const data = await fetchStudentScheduleEvents(userId, { limit: 4 });
      if (!data || data.length === 0) throw new Error("No upcoming events");

      if (empty) empty.style.display = "none";

      // Remove skeleton
      list.querySelectorAll(".sd-schedule-item").forEach((el) => el.remove());

      data.forEach((event) => {
        const typeClass = {
          live_session: "sd-schedule-item--live",
          exam:         "sd-schedule-item--exam",
          orientation:  "sd-schedule-item--live",
        }[event.event_type] || "sd-schedule-item--deadline";

        const li = document.createElement("li");
        li.className = `sd-schedule-item ${typeClass}`;
        li.innerHTML = `
          <span class="sd-schedule-item__dot"></span>
          <div class="sd-schedule-item__info">
            <p class="sd-schedule-item__title">${escHtml(event.title)}</p>
            <p class="sd-schedule-item__time">${formatDateTime(event.start_datetime)}</p>
          </div>
          ${toSafeUiUrl(event.meeting_url)
            ? `<a href="${escHtml(toSafeUiUrl(event.meeting_url))}" target="_blank" rel="noopener" class="sd-btn sd-btn--outline sd-btn--sm">Join</a>`
            : ""}
        `;
        li.style.cursor = "pointer";
        li.addEventListener("click", (e) => {
          if (e.target.closest("a")) return;
          window._sdActivateSection?.("schedule");
        });
        list.insertBefore(li, empty);
      });
    } catch {
      if (empty) empty.style.display = "block";
    }
  }

  async function loadAnnouncements(userId) {
    const list = $("studentAnnouncementList");
    const empty = $("studentAnnouncementEmpty");
    if (!list) return;

    try {
      const { data, error } = await window.lmsSupabase
        .from("announcements")
        .select("id,title,body,publish_at")
        .lte("publish_at", new Date().toISOString())
        .or("expires_at.is.null,expires_at.gte." + new Date().toISOString())
        .or("target_role.eq.all,target_role.eq.student")
        .order("publish_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      list.querySelectorAll(".sd-announcement-item").forEach((el) => el.remove());

      if (!data || data.length === 0) {
        if (empty) empty.style.display = "block";
        return;
      }

      if (empty) empty.style.display = "none";

      data.forEach((announcement) => {
        const body = String(announcement.body || "");
        const preview = body.length > 120 ? `${body.slice(0, 120)}...` : body;
        const li = document.createElement("li");
        li.className = "sd-announcement-item";
        li.innerHTML = `
          <p class="sd-announcement-item__title">${escHtml(announcement.title || "Announcement")}</p>
          ${preview ? `<p class="sd-announcement-item__preview">${escHtml(preview)}</p>` : ""}
          <p class="sd-announcement-item__date">${escHtml(formatDateTime(announcement.publish_at))}</p>
        `;
        list.insertBefore(li, empty);
      });
    } catch (err) {
      console.warn("Announcements load error:", err.message);
      list.querySelectorAll(".sd-announcement-item").forEach((el) => el.remove());
      if (empty) empty.style.display = "block";
    }
  }

  async function loadFullSchedule(userId) {
    const list  = $("scheduleFullList");
    const empty = $("scheduleFullEmpty");
    if (!list) return;

    try {
      const data = await fetchStudentScheduleEvents(userId, { limit: 20, upcomingOnly: false });
      if (!data || data.length === 0) throw new Error("No schedule");

      fullScheduleCache = data;
      renderFullSchedule();
    } catch {
      fullScheduleCache = [];
      if (empty) empty.style.display = "flex";
    }
  }

  function scheduleDateKey(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatScheduleMonthTitle(date) {
    return date.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
  }

  function formatScheduleEventDateParts(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return { day: "", monthYear: "", weekday: "", fullDate: "", time: "" };
    }
    return {
      day: date.toLocaleDateString("en-AU", { day: "2-digit" }),
      monthYear: date.toLocaleDateString("en-AU", { month: "short", year: "numeric" }),
      weekday: date.toLocaleDateString("en-AU", { weekday: "long" }),
      fullDate: date.toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
      time: date.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
    };
  }

  function formatScheduleEventTimeRange(event) {
    const start = formatScheduleEventDateParts(event.start_datetime);
    if (!event.end_datetime) return `${start.fullDate}, ${start.time}`;
    const end = new Date(event.end_datetime);
    const startDate = new Date(event.start_datetime);
    const endTime = end.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
    if (scheduleDateKey(startDate) === scheduleDateKey(end)) {
      return `${start.fullDate}, ${start.time} - ${endTime}`;
    }
    return `${start.fullDate}, ${start.time} - ${formatDateTime(event.end_datetime)}`;
  }

  function scheduleTypeLabel(type) {
    return {
      live_session: "Live session",
      exam: "Exam",
      orientation: "Orientation"
    }[type] || "Deadline";
  }

  function sortedFullScheduleEvents() {
    const direction = scheduleSortOrder === "desc" ? -1 : 1;
    return [...fullScheduleCache].sort((a, b) =>
      direction * (new Date(a.start_datetime || 0) - new Date(b.start_datetime || 0))
    );
  }

  function renderFullSchedule() {
    const container = $("scheduleFullContent");
    const list = $("scheduleFullList");
    const empty = $("scheduleFullEmpty");
    if (!list) return;

    list.querySelectorAll("[data-schedule-render='true']").forEach((el) => el.remove());

    if (!fullScheduleCache.length) {
      if (empty) empty.style.display = "flex";
      return;
    }

    if (empty) empty.style.display = "none";

    if ((container?.dataset.view || "list") === "calendar") {
      const baseDate = scheduleCalendarCursor || new Date();
      scheduleCalendarCursor = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      const startWeekday = monthStart.getDay();
      const totalCells = Math.ceil((startWeekday + monthEnd.getDate()) / 7) * 7;
      const eventMap = new Map();

      fullScheduleCache.forEach((event) => {
        const key = scheduleDateKey(new Date(event.start_datetime));
        if (!eventMap.has(key)) eventMap.set(key, []);
        eventMap.get(key).push(event);
      });

      const toolbar = document.createElement("div");
      toolbar.dataset.scheduleRender = "true";
      toolbar.className = "sd-schedule-calendar__toolbar";
      toolbar.innerHTML = `
        <button class="sd-btn sd-btn--outline sd-btn--sm" type="button" data-schedule-month="prev" aria-label="Previous month">&lt;</button>
        <p class="sd-schedule-calendar__title">${escHtml(formatScheduleMonthTitle(monthStart))}</p>
        <button class="sd-btn sd-btn--outline sd-btn--sm" type="button" data-schedule-month="next" aria-label="Next month">&gt;</button>
      `;
      toolbar.querySelectorAll("[data-schedule-month]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const direction = btn.dataset.scheduleMonth === "next" ? 1 : -1;
          scheduleCalendarCursor = new Date(monthStart.getFullYear(), monthStart.getMonth() + direction, 1);
          renderFullSchedule();
        });
      });
      list.insertBefore(toolbar, empty);

      const calendar = document.createElement("div");
      calendar.dataset.scheduleRender = "true";
      calendar.className = "sd-schedule-calendar";

      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((weekday, index) => {
        const header = document.createElement("div");
        header.dataset.scheduleRender = "true";
        header.className = `sd-schedule-calendar__weekday${index === 0 ? " is-sunday" : ""}`;
        header.textContent = weekday;
        calendar.appendChild(header);
      });

      for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
        const dayNumber = cellIndex - startWeekday + 1;
        const cell = document.createElement("div");
        cell.dataset.scheduleRender = "true";
        cell.className = "sd-schedule-calendar__cell";

        if (dayNumber < 1 || dayNumber > monthEnd.getDate()) {
          cell.classList.add("is-muted");
          calendar.appendChild(cell);
          continue;
        }

        const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), dayNumber);
        const key = scheduleDateKey(date);
        const dayEvents = eventMap.get(key) || [];
        const isSunday = date.getDay() === 0;
        if (isSunday) cell.classList.add("is-sunday");
        const dateCaption = `${date.toLocaleDateString("en-AU", { weekday: "short" })}, ${date.toLocaleDateString("en-AU", { month: "short", year: "numeric" })}`;

        cell.innerHTML = `
          <div class="sd-schedule-calendar__date" aria-label="${escHtml(date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}">
            <span>${dayNumber}</span>
            <small>${escHtml(dateCaption)}</small>
          </div>`;
        dayEvents.forEach((event) => {
          const item = document.createElement("div");
          const eventClass = {
            live_session: "sd-schedule-calendar__event--live",
            exam: "sd-schedule-calendar__event--exam",
            orientation: "sd-schedule-calendar__event--live",
          }[event.event_type] || "sd-schedule-calendar__event--deadline";
          item.className = `sd-schedule-calendar__event ${eventClass}`;
          item.innerHTML = `
            <strong>${escHtml(event.title || "Event")}</strong>
            <span>${escHtml(formatScheduleEventTimeRange(event))}</span>`;
          cell.appendChild(item);
        });

        calendar.appendChild(cell);
      }

      list.insertBefore(calendar, empty);
      return;
    }

    sortedFullScheduleEvents().forEach((event) => {
      const typeClass = {
        live_session: "sd-schedule-event-card--live",
        exam: "sd-schedule-event-card--exam",
        orientation: "sd-schedule-event-card--live",
      }[event.event_type] || "sd-schedule-event-card--deadline";
      const dateParts = formatScheduleEventDateParts(event.start_datetime);

      const item = document.createElement("div");
      item.dataset.scheduleRender = "true";
      item.className = `sd-schedule-event-card ${typeClass}`;
      item.innerHTML = `
        <div class="sd-schedule-event-card__date">
          <p class="sd-schedule-event-card__day">${escHtml(dateParts.day)}</p>
          <p class="sd-schedule-event-card__month">${escHtml(dateParts.monthYear)}</p>
        </div>
        <div class="sd-schedule-event-card__info">
          <p class="sd-schedule-event-card__title">${escHtml(event.title || "Event")}</p>
          <p class="sd-schedule-event-card__meta">${escHtml(scheduleTypeLabel(event.event_type))} - ${escHtml(formatScheduleEventTimeRange(event))}</p>
        </div>
        ${toSafeUiUrl(event.meeting_url)
          ? `<a href="${escHtml(toSafeUiUrl(event.meeting_url))}" target="_blank" rel="noopener" class="sd-btn sd-btn--outline sd-btn--sm">Join</a>`
          : ""}
      `;
      list.insertBefore(item, empty);
    });
  }

  async function loadCertificates(userId) {
    const grid = $("certGrid");
    const empty = $("certEmpty");
    if (!grid) return;

    try {
      const { data, error } = await window.lmsSupabase
        .from("certificates")
        .select("id, certificate_no, issued_at, file_url, courses(title)")
        .eq("student_id", userId)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No certificates");

      if (empty) empty.style.display = "none";
      grid.querySelectorAll("[data-cert-card='true']").forEach((el) => el.remove());

      data.forEach((cert) => {
        const card = document.createElement("div");
        card.setAttribute("data-cert-card", "true");
        card.className = "sd-course-card";
        card.innerHTML = `
          <div class="sd-course-card__thumb">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>
          </div>
          <div class="sd-course-card__body">
            <p class="sd-course-card__category">${escHtml(cert.certificate_no || "Certificate")}</p>
            <h3 class="sd-course-card__title">${escHtml(cert.courses?.title || "Course Certificate")}</h3>
            <p class="sd-course-card__trainer">${escHtml(formatDateTime(cert.issued_at))}</p>
            <div class="sd-course-card__footer">
              ${toSafeUiUrl(cert.file_url) ? `<a href="${escHtml(toSafeUiUrl(cert.file_url))}" target="_blank" rel="noopener" class="sd-btn sd-btn--outline sd-btn--sm">Open</a>` : ""}
            </div>
          </div>`;
        grid.appendChild(card);
      });
    } catch {
      if (empty) empty.style.display = "flex";
    }
  }

  function dashboardText(key, fallback) {
    if (typeof window.t === "function") {
      const value = window.t(key);
      if (value && value !== key) return value;
    }
    return fallback;
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

  const MAX_MESSAGE_RECIPIENTS = 50;

  function setStudentComposerStatus(text, isError = false) {
    const msg = $("studentMsgComposeMsg");
    if (!msg) return;
    msg.textContent = text || "";
    msg.className = `sd-profile-form__msg${isError ? " error" : text ? " success" : ""}`;
  }

  function setStudentMessageStatus(text, isError = false) {
    const detail = $("messageDetail");
    if (!detail) {
      setStudentComposerStatus(text, isError);
      return;
    }
    let status = detail.querySelector("[data-sd-message-status]");
    if (!status) {
      status = document.createElement("p");
      status.setAttribute("data-sd-message-status", "true");
      detail.prepend(status);
    }
    status.textContent = text || "";
    status.className = `sd-profile-form__msg${isError ? " error" : text ? " success" : ""}`;
  }

  function getSelectedStudentMessageRecipients(recipient = $("studentMsgRecipient")) {
    return Array.from(recipient?.selectedOptions || [])
      .map((option) => option.value)
      .filter(Boolean);
  }

  function setStudentRecipientDropdownOpen(open) {
    const toggle = $("studentMsgRecipientToggle");
    const panel = $("studentMsgRecipientPanel");
    if (!toggle || !panel) return;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function updateStudentRecipientSummary() {
    const recipient = $("studentMsgRecipient");
    const summary = $("studentMsgRecipientSummary");
    if (!summary) return;

    const selected = Array.from(recipient?.selectedOptions || []);
    if (selected.length === 0) {
      summary.textContent = dashboardText("lmsMsgSelectRecipient", "Select recipients (max 50)");
    } else if (selected.length === 1) {
      summary.textContent = selected[0].dataset.label || selected[0].textContent || selected[0].value;
    } else {
      summary.textContent = dashboardText("lmsMsgSelectedCount", "{count} recipients selected").replace("{count}", selected.length);
    }
  }

  function syncStudentRecipientCheckboxes() {
    const recipient = $("studentMsgRecipient");
    const list = $("studentMsgRecipientList");
    if (!recipient || !list) return;

    Array.from(list.querySelectorAll("input[type='checkbox'][data-recipient-id]")).forEach((checkbox) => {
      const option = Array.from(recipient.options).find((item) => item.value === checkbox.dataset.recipientId);
      checkbox.checked = Boolean(option?.selected);
    });
    updateStudentRecipientSummary();
  }

  function ensureStudentRecipientOption(recipientId, labelText) {
    const recipient = $("studentMsgRecipient");
    const list = $("studentMsgRecipientList");
    if (!recipient || !recipientId) return;
    if (Array.from(recipient.options).some((option) => option.value === recipientId)) return;

    const label = labelText || recipientId;
    const option = document.createElement("option");
    option.value = recipientId;
    option.dataset.label = label;
    option.textContent = label;
    recipient.appendChild(option);

    if (list) {
      const optionLabel = document.createElement("label");
      optionLabel.className = "sd-recipient-option";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.recipientId = recipientId;
      checkbox.addEventListener("change", () => {
        option.selected = checkbox.checked;
        enforceStudentMessageRecipientLimit();
        updateStudentRecipientSummary();
      });
      const text = document.createElement("span");
      text.textContent = label;
      optionLabel.appendChild(checkbox);
      optionLabel.appendChild(text);
      list.appendChild(optionLabel);
    }
  }

  function enforceStudentMessageRecipientLimit() {
    const recipient = $("studentMsgRecipient");
    const selectedOptions = Array.from(recipient?.selectedOptions || []).filter((option) => option.value);
    if (selectedOptions.length <= MAX_MESSAGE_RECIPIENTS) return;
    selectedOptions.slice(MAX_MESSAGE_RECIPIENTS).forEach((option) => {
      option.selected = false;
    });
    syncStudentRecipientCheckboxes();
    setStudentComposerStatus(dashboardText("lmsMsgTooManyRecipients", "You can select up to 50 recipients at once."), true);
  }

  function closeStudentMessageComposer() {
    const composeForm = $("studentMsgComposeForm");
    const viewEmpty = $("messageViewEmpty");
    const detail = $("messageDetail");

    setMessagePanelVisible(composeForm, false);
    setStudentRecipientDropdownOpen(false);
    setStudentComposerStatus("");
    if (detail && detail.innerHTML.trim()) {
      setMessagePanelVisible(detail, true);
      return;
    }
    setMessagePanelVisible(viewEmpty, true);
  }

  function getStudentReplySubject(value) {
    return /^re:/i.test(value) ? value : `Re: ${value}`;
  }

  async function archiveMessage(messageIds, archived = true) {
    if (!messageIds?.length || !window.lmsSupabase) return;
    const { error } = await window.lmsSupabase.from("messages")
      .update({ is_archived: archived })
      .in("id", messageIds);
    if (error) throw error;
  }

  function bindStudentMessageViewTabs() {
    const tabs = document.querySelectorAll("#section-messages [data-student-message-view]");
    tabs.forEach((tab) => {
      if (tab.dataset.bound === "true") return;
      tab.dataset.bound = "true";
      tab.addEventListener("click", async () => {
        activeStudentMessageView = tab.dataset.studentMessageView || "inbox";
        tabs.forEach((item) => item.classList.toggle("active", item === tab));
        await loadMessages(currentStudentProfile?.id);
      });
    });
    tabs.forEach((tab) => {
      tab.classList.toggle("active", (tab.dataset.studentMessageView || "inbox") === activeStudentMessageView);
    });
  }

  function groupStudentMessages(messages, profileMap) {
    const normalizeThreadSubject = (subject) =>
      String(subject || "Message").replace(/^(re:\s*)+/i, "").trim().toLowerCase();

    const groups = new Map();
    (messages || []).forEach((msg) => {
      const isSent = msg.sender_id === currentStudentProfile.id;
      const counterpartId = isSent ? msg.recipient_id : msg.sender_id;
      const threadSubject = normalizeThreadSubject(msg.subject);
      const batchTime = msg.created_at ? String(msg.created_at).slice(0, 19) : "pending";
      const groupId = isSent
        ? `sent:${msg.sender_id}|${msg.subject || ""}|${msg.body || ""}|${batchTime}`
        : `received:${counterpartId}|${threadSubject}`;
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
      const group = groups.get(groupId);
      group.messages.push(msg);
      if (new Date(msg.created_at || 0) >= new Date(group.created_at || 0)) {
        group.created_at = msg.created_at;
        group.body = msg.body || "";
        group.subject = msg.subject || group.subject;
        if (!isSent) group.sender_id = msg.sender_id;
      }
    });

    return Array.from(groups.values()).map((group) => {
      group.messages.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      group.key = `${group.type}:${group.messages.map((msg) => msg.id).sort().join(",")}`;
      group.isUnread = group.messages.some((msg) => !msg.is_read && msg.recipient_id === currentStudentProfile.id);
      const senderMessage = group.messages.find((msg) => msg.sender_id === group.sender_id);
      group.sender = profileMap.get(group.sender_id) || senderMessage?.sender_profile || senderMessage?.profiles || {};
      return group;
    });
  }

  async function loadStudentMessageRecipients() {
    const recipient = $("studentMsgRecipient");
    const toggle = $("studentMsgRecipientToggle");
    const list = $("studentMsgRecipientList");
    if (!recipient || !toggle || !list || !window.lmsSupabase || !currentStudentProfile?.id) return [];

    toggle.disabled = true;
    recipient.innerHTML = "";
    list.innerHTML = "";
    updateStudentRecipientSummary();

    const { data: recipients, error } = await window.lmsSupabase
      .from("profiles")
      .select("id, full_name, email, role")
      .order("full_name", { ascending: true });
    if (error) throw error;

    const availableRecipients = (recipients || []).filter((profile) => profile.id && profile.id !== currentStudentProfile.id);
    availableRecipients.forEach((trainer) => {
      const labelText = trainer.full_name || trainer.email || trainer.id;
      const option = document.createElement("option");
      option.value = trainer.id;
      option.dataset.label = labelText;
      option.textContent = labelText;
      recipient.appendChild(option);

      const label = document.createElement("label");
      label.className = "sd-recipient-option";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.recipientId = trainer.id;
      checkbox.addEventListener("change", () => {
        option.selected = checkbox.checked;
        enforceStudentMessageRecipientLimit();
        updateStudentRecipientSummary();
      });
      const text = document.createElement("span");
      text.textContent = labelText;
      label.appendChild(checkbox);
      label.appendChild(text);
      list.appendChild(label);
    });

    toggle.disabled = availableRecipients.length === 0;
    if (availableRecipients.length === 0) {
      setStudentComposerStatus(dashboardText("lmsMsgNoRecipients", "No recipients available."), true);
    }
    updateStudentRecipientSummary();
    return availableRecipients;
  }

  async function sendStudentComposedMessage(e) {
    if (e) e.preventDefault();
    if (!window.lmsSupabase || !currentStudentProfile?.id) return;

    const recipient = $("studentMsgRecipient");
    const subject = $("studentMsgSubject");
    const body = $("studentMsgBody");
    const sendBtn = $("studentSendMsgBtn");
    const composeForm = $("studentMsgComposeForm");
    if (studentMessageSending || sendBtn?.disabled) return;
    studentMessageSending = true;
    const recipientIds = getSelectedStudentMessageRecipients(recipient);
    const messageSubject = subject?.value.trim() || "";
    const messageBody = body?.value.trim() || "";

    if (recipientIds.length === 0 || !messageSubject || !messageBody) {
      studentMessageSending = false;
      setStudentComposerStatus(
        dashboardText("lmsMsgRequired", "Trainer, subject, and message are required."),
        true
      );
      return;
    }
    if (recipientIds.length > MAX_MESSAGE_RECIPIENTS) {
      studentMessageSending = false;
      setStudentComposerStatus(dashboardText("lmsMsgTooManyRecipients", "You can select up to 50 recipients at once."), true);
      return;
    }

    try {
      if (sendBtn) sendBtn.disabled = true;
      const sentAt = new Date().toISOString();
      const messageRows = recipientIds.map((recipientId) => ({
        id: createClientId(),
        sender_id: currentStudentProfile.id,
        recipient_id: recipientId,
        subject: messageSubject,
        body: messageBody,
        created_at: sentAt
      }));
      const { error } = await window.lmsSupabase
        .from("messages")
        .insert(messageRows);
      if (error) throw error;
      await sendExternalNotificationDelivery({
        message_ids: messageRows.map((message) => message.id)
      });

      if (subject) subject.value = "";
      if (body) body.value = "";
      Array.from(recipient?.options || []).forEach((option) => {
        option.selected = false;
      });
      syncStudentRecipientCheckboxes();
      setStudentRecipientDropdownOpen(false);
      setStudentComposerStatus(dashboardText("lmsMsgSent", "Message sent."));
      const replyViewFallback = /^re:/i.test(messageSubject) && recipientIds.length === 1 ? "inbox" : "history";
      activeStudentMessageView = studentMessageComposerReturnView || composeForm?.dataset.returnView || replyViewFallback;
      studentMessageComposerReturnView = "";
      if (composeForm) delete composeForm.dataset.returnView;
      // Tutup composer setelah 1.2 detik agar user sempat baca konfirmasi
      setTimeout(() => closeStudentMessageComposer(), 1200);
      if (window._sdActivateSection) window._sdActivateSection("messages");
      await loadMessages(currentStudentProfile.id, {
        selectedMessageId: messageRows[0]?.id,
        scrollThreadToLatest: true,
        selectedThread: recipientIds.length === 1
          ? { counterpartId: recipientIds[0], subject: messageSubject }
          : null
      });
      setTimeout(() => {
        scrollStudentMessageThreadToLatest(document.querySelector("#sdMsgThread, .sd-msg-thread"));
      }, 300);
    } catch (err) {
      setStudentComposerStatus(err.message || dashboardText("lmsMsgFailed", "Message failed to send."), true);
    } finally {
      studentMessageSending = false;
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  async function openStudentMessageComposer(selectedRecipientId = "", options = {}) {
    if (window._sdActivateSection) window._sdActivateSection("messages");
    if (!currentStudentProfile?.id || !window.lmsSupabase) return;

    const viewEmpty = $("messageViewEmpty");
    const detail = $("messageDetail");
    const composeForm = $("studentMsgComposeForm");
    const recipient = $("studentMsgRecipient");
    const subject = $("studentMsgSubject");
    const body = $("studentMsgBody");
    const cancelBtn = $("studentCancelMsgBtn");
    if (!composeForm) return;
    studentMessageComposerReturnView = options.returnView || "";
    if (options.returnView) composeForm.dataset.returnView = options.returnView;
    else delete composeForm.dataset.returnView;

    setMessagePanelVisible(viewEmpty, false);
    setMessagePanelVisible(detail, false);
    setMessagePanelVisible(composeForm, true);
    setStudentComposerStatus("");

    if (!studentMessageComposerBound) {
      composeForm.addEventListener("submit", sendStudentComposedMessage);
      const sendBtn = $("studentSendMsgBtn");
      sendBtn && sendBtn.addEventListener("click", sendStudentComposedMessage);
      cancelBtn && cancelBtn.addEventListener("click", closeStudentMessageComposer);
      recipient && recipient.addEventListener("change", enforceStudentMessageRecipientLimit);
      const toggle = $("studentMsgRecipientToggle");
      const panel = $("studentMsgRecipientPanel");
      toggle && toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        setStudentRecipientDropdownOpen(panel?.hidden !== false);
      });
      panel && panel.addEventListener("click", (event) => event.stopPropagation());
      document.addEventListener("click", () => setStudentRecipientDropdownOpen(false));
      studentMessageComposerBound = true;
    }

    try {
      await loadStudentMessageRecipients();
    } catch (err) {
      setStudentComposerStatus(err.message || "Recipients failed to load.", true);
    }

    if (selectedRecipientId) {
      ensureStudentRecipientOption(selectedRecipientId, options.recipientLabel || selectedRecipientId);
    }
    if (recipient && recipient.options.length === 1) {
      recipient.selectedIndex = 0;
      syncStudentRecipientCheckboxes();
    }
    if (selectedRecipientId && recipient) {
      Array.from(recipient.options).forEach((option) => {
        option.selected = option.value === selectedRecipientId;
      });
      syncStudentRecipientCheckboxes();
    }
    if (subject && options.subject) subject.value = options.subject;
    if (options.focusBody && body) body.focus();
    else if (subject) subject.focus();
  }

  function scrollStudentMessageThreadToLatest(thread) {
    if (!thread) return;
    const scroller = thread.closest("#messageDetail") || thread;
    const align = () => {
      const lastMessage = thread.querySelector(".sd-thread-msg:last-child");
      if (lastMessage?.scrollIntoView) {
        lastMessage.scrollIntoView({ block: "end", inline: "nearest" });
      }
      scroller.scrollTop = scroller.scrollHeight;
    };
    const schedule = typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame.bind(window)
      : (callback) => setTimeout(callback, 0);
    schedule(() => {
      align();
      setTimeout(align, 80);
    });
  }

  function scrollStudentMessageThreadToStart(thread) {
    if (!thread) return;
    const scroller = thread.closest("#messageDetail") || thread;
    const align = () => {
      scroller.scrollTop = 0;
      thread.scrollTop = 0;
    };
    const schedule = typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame.bind(window)
      : (callback) => setTimeout(callback, 0);
    schedule(() => {
      align();
      setTimeout(align, 80);
    });
  }

  function bindStudentMessageThreadScrolling(panel) {
    if (!panel || panel.dataset.sdThreadScrollBound === "true") return;
    panel.dataset.sdThreadScrollBound = "true";
    panel.addEventListener("wheel", (event) => {
      if (panel.scrollHeight <= panel.clientHeight) return;
      const maxScroll = panel.scrollHeight - panel.clientHeight;
      const nextScroll = Math.max(0, Math.min(maxScroll, panel.scrollTop + event.deltaY));
      if (nextScroll === panel.scrollTop) return;
      panel.scrollTop = nextScroll;
      event.preventDefault();
    }, { passive: false });
  }

  async function loadMessages(...args) {
    const loadSeq = ++studentMessagesLoadSeq;
    const [userId, options = {}] = args;
    const selectedMessageId = options?.selectedMessageId ? String(options.selectedMessageId) : "";
    const selectedThread = options?.selectedThread || null;
    const scrollThreadToLatest = Boolean(options?.scrollThreadToLatest);
    const inbox = $("inboxList");
    const inboxEmpty = $("inboxEmpty");
    const view = $("messageView");
    const viewEmpty = $("messageViewEmpty");
    const detail = $("messageDetail");
    const composeForm = $("studentMsgComposeForm");
    if (!inbox || !view || !userId) return;

    try {
      bindStudentMessageViewTabs();
      const messageSelect = `
        id, sender_id, recipient_id, subject, body, is_read, is_archived, created_at,
        sender_profile:profiles!messages_sender_id_fkey ( id, full_name, email, role ),
        recipient_profile:profiles!messages_recipient_id_fkey ( id, full_name, email, role )
      `;
      const [{ data: receivedData, error: receivedError }, { data: sentData, error: sentError }] = await Promise.all([
        (() => {
          const q = window.lmsSupabase
            .from("messages")
            .select(messageSelect)
            .eq("recipient_id", userId);
          return activeStudentMessageView === "archive"
            ? q.eq("is_archived", true)
            : q.or("is_archived.eq.false,is_archived.is.null");
        })()
          .order("created_at", { ascending: false })
          .limit(100),
        (() => {
          const q = window.lmsSupabase
            .from("messages")
            .select(messageSelect)
            .eq("sender_id", userId);
          return activeStudentMessageView === "archive"
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
      if (loadSeq !== studentMessagesLoadSeq) return;

      inbox.querySelectorAll(".sd-inbox-item").forEach((el) => el.remove());
      if (composeForm?.hidden) {
        setMessagePanelVisible(detail, false);
        setMessagePanelVisible(viewEmpty, true);
      }

      const emptyText = inboxEmpty?.querySelector("p");
      if (emptyText) {
        const emptyByView = {
          inbox: "No incoming messages",
          history: "No sent history",
          archive: "No archived messages"
        };
        emptyText.textContent = emptyByView[activeStudentMessageView] || "No messages yet";
      }

      if (!data || data.length === 0) {
        studentUnreadMessages = 0;
        updateStudentAttentionIndicators();
        if (inboxEmpty) inboxEmpty.style.display = "flex";
        return;
      }

      const unreadCount = data.filter((m) => !m.is_read && m.recipient_id === userId).length;
      studentUnreadMessages = unreadCount;
      updateStudentAttentionIndicators();

      const profileIds = Array.from(new Set(data.flatMap((msg) => [msg.sender_id, msg.recipient_id]).filter(Boolean)));
      const profileMap = new Map();
      if (profileIds.length > 0) {
        const { data: profiles } = await window.lmsSupabase
          .from("profiles")
          .select("id, full_name, email, role")
          .in("id", profileIds);
        (profiles || []).forEach((profile) => profileMap.set(profile.id, profile));
      }

      const groups = groupStudentMessages(data, profileMap).filter((group) => {
        if (activeStudentMessageView === "archive") return true;
        if (activeStudentMessageView === "history") return group.type === "sent";
        return group.type === "received";
      });

      if (inboxEmpty) inboxEmpty.style.display = groups.length === 0 ? "flex" : "none";
      if (groups.length === 0) return;

      const refreshMessageBadges = () => {
        studentUnreadMessages = data.filter((m) => !m.is_read && m.recipient_id === userId && !m.is_archived).length;
        updateStudentAttentionIndicators();
      };

      const profileLabel = (profile = {}, fallback = "Unknown sender") =>
        profile.full_name || profile.email || fallback;
      const initialsFor = (value) => {
        const words = String(value || "RA").trim().split(/\s+/).filter(Boolean);
        return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : words[0]?.slice(0, 2) || "RA").toUpperCase();
      };
      const roleClassFor = (role) => {
        const normalized = String(role || "system").toLowerCase();
        return ["admin", "trainer", "student"].includes(normalized) ? normalized : "system";
      };
      const renderRoleTag = (profile = {}) => {
        const role = roleClassFor(profile.role);
        return `<span class="sd-role-tag sd-role-tag--${role}">${escHtml(role)}</span>`;
      };
      const renderThreadMessage = ({ out = false, name, body, time }) => {
        const avatar = initialsFor(name);
        return `
          <div class="sd-thread-msg${out ? " sd-thread-msg--out" : ""}">
            <div class="sd-thread-av${out ? " sd-thread-av--me" : ""}">${escHtml(avatar)}</div>
            <div class="sd-thread-bubble-wrap">
              <div class="sd-thread-name">${escHtml(name)}</div>
              <div class="sd-thread-bubble">${escHtml(body || "-")}</div>
              <div class="sd-thread-time">${escHtml(time || "")}</div>
            </div>
          </div>`;
      };
      const normalizeThreadSubject = (subject) =>
        String(subject || "Message").replace(/^(re:\s*)+/i, "").trim().toLowerCase();
      const getThreadMessages = (baseMsg) => {
        if (!baseMsg) return [];
        const baseSubject = normalizeThreadSubject(baseMsg.subject);
        const firstUser = baseMsg.sender_id;
        const secondUser = baseMsg.recipient_id;
        const threadMessages = data
          .filter((msg) => {
            const samePair = (msg.sender_id === firstUser && msg.recipient_id === secondUser)
              || (msg.sender_id === secondUser && msg.recipient_id === firstUser);
            return samePair && normalizeThreadSubject(msg.subject) === baseSubject;
          })
          .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        return threadMessages.length > 0 ? threadMessages : [baseMsg];
      };
      const fetchFullThread = async (baseMsg) => {
        if (!baseMsg || !baseMsg.sender_id || !baseMsg.recipient_id) return getThreadMessages(baseMsg);
        const userA = baseMsg.sender_id;
        const userB = baseMsg.recipient_id;
        const baseSubject = normalizeThreadSubject(baseMsg.subject);
        try {
          const { data: threadData, error } = await window.lmsSupabase
            .from("messages")
            .select(messageSelect)
            .or(`and(sender_id.eq.${userA},recipient_id.eq.${userB}),and(sender_id.eq.${userB},recipient_id.eq.${userA})`)
            .order("created_at", { ascending: true })
            .limit(300);
          if (error) throw error;
          const filtered = (threadData || [])
            .filter((msg) => normalizeThreadSubject(msg.subject) === baseSubject);
          return filtered.length > 0 ? filtered : [baseMsg];
        } catch {
          return getThreadMessages(baseMsg);
        }
      };
      const renderThreadFor = async (baseMsg, fallbackSenderName) => {
        const threadMessages = await fetchFullThread(baseMsg);
        return threadMessages.map((threadMsg) => {
          const isOut = threadMsg.sender_id === userId;
          const senderProfile = isOut
            ? currentStudentProfile
            : profileMap.get(threadMsg.sender_id) || threadMsg.sender_profile || threadMsg.profiles || {};
          return renderThreadMessage({
            out: isOut,
            name: isOut ? profileLabel(senderProfile, "You") : profileLabel(senderProfile, fallbackSenderName),
            body: threadMsg.body,
            time: formatDateTime(threadMsg.created_at)
          });
        }).join("");
      };
      const groupMatchesSelectedMessage = (group) => {
        const baseMsg = group.messages[group.messages.length - 1] || group.messages[0];
        if (selectedMessageId) {
          if (group.messages.some((msg) => String(msg.id) === selectedMessageId)) return true;
          if (getThreadMessages(baseMsg).some((msg) => String(msg.id) === selectedMessageId)) return true;
        }
        if (!selectedThread || !baseMsg) return false;
        const counterpartId = group.type === "sent" ? baseMsg.recipient_id : group.sender_id;
        return counterpartId === selectedThread.counterpartId
          && normalizeThreadSubject(group.subject) === normalizeThreadSubject(selectedThread.subject);
      };

      const renderMessageDetail = async (group) => {
        if (!detail) return;
        setMessagePanelVisible(viewEmpty, false);
        setMessagePanelVisible(composeForm, false);
        setMessagePanelVisible(detail, true);
        setStudentMessageStatus("");
        let detailStatus = "";

        if (group.type === "received") {
          const unreadIds = group.messages
            .filter((msg) => !msg.is_read && msg.recipient_id === userId)
            .map((msg) => msg.id);
          if (unreadIds.length > 0) {
            const { error } = await window.lmsSupabase
              .from("messages")
              .update({ is_read: true, read_at: new Date().toISOString() })
              .in("id", unreadIds);
            if (error) {
              detailStatus = error.message || "Message read status failed.";
            } else {
              group.messages.forEach((msg) => {
                if (unreadIds.includes(msg.id)) msg.is_read = true;
              });
              refreshMessageBadges();
            }
          }
          const msg = group.messages[group.messages.length - 1];
          const senderMessage = group.messages.find((item) => item.sender_id === group.sender_id);
          const sender = profileMap.get(group.sender_id) || group.sender || senderMessage?.sender_profile || senderMessage?.profiles || {};
          const senderLabel = profileLabel(sender);
          const threadHTML = await renderThreadFor(msg, senderLabel);
          detail.innerHTML = `
            <div class="sd-msg-detail-header">
              <div class="sd-msg-detail-avatar">${escHtml(initialsFor(senderLabel))}</div>
              <div class="sd-msg-detail-meta">
                <p class="sd-msg-detail-subject">${escHtml(group.subject)}</p>
                <p class="sd-msg-detail-from">From: <strong>${escHtml(senderLabel)}</strong></p>
                <p class="sd-msg-detail-date">Received: ${formatDateTime(group.created_at)}</p>
              </div>
              <div class="sd-msg-detail-actions">
                <button class="sd-btn sd-btn--msg-reply" type="button" data-sd-msg-reply>Reply</button>
                ${activeStudentMessageView === "archive"
                  ? `<button class="sd-btn sd-btn--msg-archive" type="button" data-sd-msg-restore>Restore</button>`
                  : `<button class="sd-btn sd-btn--msg-archive" type="button" data-sd-msg-archive>Archive</button>`}
                <button class="sd-btn sd-btn--msg-delete" type="button" data-sd-msg-delete-inbox>Delete</button>
              </div>
            </div>
            <div class="sd-msg-thread" id="sdMsgThread">
              ${threadHTML}
            </div>`;
        } else {
          const recipients = group.messages.map((msg) => ({
            message: msg,
            profile: profileMap.get(msg.recipient_id) || {}
          }));
          const senderLabel = profileLabel(currentStudentProfile, "You");
          const canRenderConversation = group.messages.length === 1;
          const threadHTML = canRenderConversation
            ? await renderThreadFor(group.messages[0], senderLabel)
            : renderThreadMessage({
                out: true,
                name: senderLabel,
                body: group.body,
                time: formatDateTime(group.created_at)
              });
          detail.innerHTML = `
            <div class="sd-msg-detail-header">
              <div class="sd-msg-detail-avatar">${escHtml(initialsFor(senderLabel))}</div>
              <div class="sd-msg-detail-meta">
                <p class="sd-msg-detail-subject">${escHtml(group.subject)}</p>
                <p class="sd-msg-detail-from">Sent to <strong>${recipients.length} recipient${recipients.length === 1 ? "" : "s"}</strong></p>
                <p class="sd-msg-detail-date">${formatDateTime(group.created_at)}</p>
              </div>
              <div class="sd-msg-detail-actions">
                ${activeStudentMessageView === "archive"
                  ? `<button class="sd-btn sd-btn--msg-archive" type="button" data-sd-msg-restore>Restore</button>`
                  : `<button class="sd-btn sd-btn--msg-archive" type="button" data-sd-msg-archive>Archive</button>`}
                <button class="sd-btn sd-btn--msg-delete" type="button" data-sd-msg-delete-all>Delete</button>
              </div>
            </div>
            <div class="sd-msg-thread" id="sdMsgThread">
              ${threadHTML}
            </div>
            <div class="sd-message-detail__recipients">
              <p class="sd-message-detail__label">Dikirim ke</p>
              ${recipients.map(({ message, profile }) => `
                <div class="sd-message-recipient" data-message-id="${escHtml(message.id)}">
                  <span>${escHtml(profile.full_name || profile.email || message.recipient_id)}</span>
                </div>
              `).join("")}
            </div>`;
        }
        if (detailStatus) setStudentMessageStatus(detailStatus, true);
        const activeMessageIds = (group.type === "received"
          ? await fetchFullThread(group.messages[group.messages.length - 1] || group.messages[0])
          : group.messages
        ).map((msg) => msg.id);
        bindStudentMessageThreadScrolling(detail);
        setTimeout(() => {
          const thread = detail.querySelector("#sdMsgThread, .sd-msg-thread");
          if (scrollThreadToLatest) scrollStudentMessageThreadToLatest(thread);
          else scrollStudentMessageThreadToStart(thread);
        }, 50);

        detail.querySelector("[data-sd-msg-reply]")?.addEventListener("click", async () => {
          await openStudentMessageComposer(group.sender_id, {
            subject: getStudentReplySubject(group.subject),
            focusBody: true,
            recipientLabel: group.sender?.full_name || group.sender?.email || group.sender_id,
            returnView: activeStudentMessageView === "archive" ? "history" : activeStudentMessageView
          });
        });
        detail.querySelector("[data-sd-msg-archive]")?.addEventListener("click", async () => {
          try {
            await archiveMessage(group.messages.map((msg) => msg.id), true);
            await loadMessages(userId);
          } catch (err) {
            setStudentMessageStatus(err.message || "Message archive failed.", true);
          }
        });
        detail.querySelector("[data-sd-msg-restore]")?.addEventListener("click", async () => {
          try {
            await archiveMessage(group.messages.map((msg) => msg.id), false);
            await loadMessages(userId);
          } catch (err) {
            setStudentMessageStatus(err.message || "Message restore failed.", true);
          }
        });
        detail.querySelector("[data-sd-msg-delete-inbox]")?.addEventListener("click", () => {
          showStudentConfirmModal("Hapus seluruh percakapan ini?", async () => {
            const { error } = await window.lmsSupabase
              .from("messages")
              .delete()
              .in("id", activeMessageIds);
            if (error) {
              setStudentMessageStatus(error.message || "Message delete failed.", true);
              return;
            }
            await loadMessages(userId);
          });
        });
        detail.querySelector("[data-sd-msg-delete-all]")?.addEventListener("click", () => {
          showStudentConfirmModal("Hapus pesan yang sudah dikirim?", async () => {
            const { error } = await window.lmsSupabase
              .from("messages")
              .delete()
              .in("id", group.messages.map((msg) => msg.id));
            if (error) {
              setStudentMessageStatus(error.message || "Message delete failed.", true);
              return;
            }
            await loadMessages(userId);
          });
        });
      };

      let selectedMessageItem = null;
      let selectedMessageGroup = null;

      const setActiveMessage = async (item, group) => {
        inbox.querySelectorAll(".sd-inbox-item").forEach((el) => {
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
        item.className = `sd-inbox-item${group.isUnread ? " unread" : ""}`;
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute("aria-selected", "false");
        const recipientNames = group.type === "sent"
          ? group.messages.map((msg) => {
              const profile = profileMap.get(msg.recipient_id) || {};
              return profile.full_name || profile.email || msg.recipient_id;
            })
          : [];
        const senderName = group.type === "sent"
          ? `To ${recipientNames.length} recipient${recipientNames.length === 1 ? "" : "s"}`
          : profileLabel(group.sender);
        const subject = group.subject || (group.type === "sent" ? "Sent message" : "Message");
        const preview = group.type === "sent"
          ? `To: ${recipientNames.slice(0, 2).join(", ")}${recipientNames.length > 2 ? ` +${recipientNames.length - 2}` : ""}`
          : (group.body?.substring(0, 60) || "-");
        const statusBadge = activeStudentMessageView === "archive"
          ? `<span class="sd-msg-status-badge sd-msg-status-badge--archived">Archived</span>`
          : group.type === "sent"
            ? `<span class="sd-msg-status-badge sd-msg-status-badge--sent">Sent</span>`
            : "";
        item.innerHTML = `
          <div class="sd-inbox-item__avatar">${escHtml(initialsFor(senderName))}</div>
          <div class="sd-inbox-item__body">
            <div class="sd-inbox-item__top">
              <span class="sd-inbox-item__name">${escHtml(senderName)}</span>
              <span class="sd-inbox-item__time">${group.type === "sent" ? "Sent" : timeAgo(group.created_at)}</span>
            </div>
            <div class="sd-inbox-item__subject">${escHtml(subject)}</div>
            <div class="sd-inbox-item__preview">${escHtml(preview)}</div>
            <div class="sd-inbox-item__tags">
              ${group.type === "sent" ? statusBadge : renderRoleTag(group.sender)}
              ${group.isUnread ? `<span class="sd-msg-status-badge sd-msg-status-badge--received">Unread</span>` : ""}
            </div>
          </div>
          ${group.isUnread ? `<div class="sd-inbox-item__unread-dot"></div>` : ""}`;
        item.addEventListener("click", async () => {
          await setActiveMessage(item, group);
        });
        item.addEventListener("keydown", async (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          await setActiveMessage(item, group);
        });
        if (groupMatchesSelectedMessage(group)) {
          selectedMessageItem = item;
          selectedMessageGroup = group;
        }
        inbox.insertBefore(item, inboxEmpty);
      });

      renderMessageList();

      if (selectedMessageItem && selectedMessageGroup) {
        await setActiveMessage(selectedMessageItem, selectedMessageGroup);
        selectedMessageItem.scrollIntoView({ block: "nearest" });
      }
    } catch (err) {
      console.warn("Messages load error:", err.message);
    }
  }

  async function loadResources(userId) {
    const grid = $("resourceGrid");
    const empty = $("resourceEmpty");
    if (!grid) return;

    try {
      const courseIds = await getStudentLearningCourseIds(userId, { includeBatchMaterials: true });
      if (courseIds.length === 0) throw new Error("No learning courses");

      // Ambil lesson materials dari kursus yang dienroll
      const { data, error } = await window.lmsSupabase
        .from("lessons")
        .select(`
          id, title, material_type, material_url, material_path, lesson_order,
          courses!inner(id, title, enrollment_type)
        `)
        .in("course_id", courseIds)
        .not("material_url", "is", null)
        .order("lesson_order", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No resources");
      const lessonsWithUrls = await prepareCourseMaterialUrls(data);

      if (empty) empty.style.display = "none";
      grid.querySelectorAll("[data-resource-card='true']").forEach((el) => el.remove());

      const materialIcons = {
        video: "📹",
        pdf: "📄",
        text: "📝",
        quiz: "❓"
      };
      const materialIconClasses = {
        video: "sd-resource-card__icon--video",
        pdf: "sd-resource-card__icon--pdf",
        text: "sd-resource-card__icon--doc",
        quiz: "sd-resource-card__icon--link"
      };

      lessonsWithUrls.forEach((lesson) => {
        const materialType = (lesson.material_type || "text").toLowerCase();
        const safeUrl = toSafeUiUrl(lesson.material_display_url);
        const actionLabel = materialType === "pdf" ? "Download" : "Open";
        const card = document.createElement("div");
        card.setAttribute("data-resource-card", "true");
        card.dataset.category = materialType;
        card.className = "sd-resource-card";
        card.innerHTML = `
          <div class="sd-resource-card__icon ${escHtml(materialIconClasses[materialType] || "sd-resource-card__icon--doc")}">
            ${escHtml(materialIcons[materialType] || "📝")}
          </div>
          <div class="sd-resource-card__body">
            <h3 class="sd-resource-card__title">${escHtml(lesson.title || "Lesson material")}</h3>
            <p class="sd-resource-card__meta">${escHtml(lesson.courses?.title || "Course")}</p>
            ${safeUrl
              ? `<a href="${escHtml(safeUrl)}" target="_blank" rel="noopener" class="sd-btn sd-btn--outline sd-btn--sm">${actionLabel}</a>`
              : `<button class="sd-btn sd-btn--outline sd-btn--sm" type="button" disabled>${actionLabel}</button>`}
          </div>`;
        grid.appendChild(card);
      });

      // ── Filter resources berdasarkan tab kategori ──
      function applyResourceFilter() {
        const section = $("section-resources");
        if (!section) return;
        const activeTab = section.querySelector(".sd-filter-tab.active");
        const activeCategory = (activeTab?.dataset?.category || "all").toLowerCase();
        grid.querySelectorAll("[data-resource-card='true']").forEach((card) => {
          const category = (card.dataset.category || "text").toLowerCase();
          card.style.display =
            activeCategory === "all" || category === activeCategory ? "" : "none";
        });
      }

      // ── Bind filter tabs ──
      const resourceSection = $("section-resources");
      if (resourceSection && !resourceSection.dataset.resourceFilterBound) {
        resourceSection.dataset.resourceFilterBound = "true";
        resourceSection.addEventListener("sd:filter-change", applyResourceFilter);
      }
      applyResourceFilter();
    } catch {
      if (empty) empty.style.display = "flex";
    }
  }

  /* ── Activity Feed ──────────────────────────────────────────────── */
  async function loadActivityFeed(userId) {
    const list  = $("activityList");
    const empty = $("activityEmpty");
    if (!list) return;

    try {
      const { data, error } = await window.lmsSupabase
        .from("activity_logs")
        .select("action, entity_type, metadata, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No activity");

      if (empty) empty.style.display = "none";

      // Remove existing items
      list.querySelectorAll(".sd-activity-item").forEach((el) => el.remove());

      const activityNavMap = {
        lesson_completed:     "courses",
        quiz_submitted:       "assignments",
        quiz_passed:          "assignments",
        assignment_submitted: "assignments",
        course_enrolled:      "courses",
        certificate_issued:   "certificates",
      };

      data.forEach((log) => {
        const { icon, iconClass, text } = formatActivityLog(log);
        const li = document.createElement("li");
        li.className = "sd-activity-item";
        li.innerHTML = `
          <div class="sd-activity-item__icon ${iconClass}">${icon}</div>
          <div class="sd-activity-item__body">
            <p class="sd-activity-item__text">${text}</p>
            <p class="sd-activity-item__time">${timeAgo(log.created_at)}</p>
          </div>`;
        const targetSection = activityNavMap[log.action] || "home";
        li.style.cursor = "pointer";
        li.setAttribute("tabindex", "0");
        li.addEventListener("click", () => window._sdActivateSection?.(targetSection));
        li.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window._sdActivateSection?.(targetSection); }
        });
        list.insertBefore(li, empty);
      });
    } catch {
      if (empty) empty.style.display = "flex";
    }
  }

  function formatActivityLog(log) {
    const meta = log.metadata || {};
    switch (log.action) {
      case "lesson_completed":
        return { icon: "✅", iconClass: "sd-activity-item__icon--complete", text: `Completed lesson: <strong>${escHtml(meta.lesson_title || log.entity_type)}</strong>` };
      case "quiz_submitted":
        return { icon: "📝", iconClass: "sd-activity-item__icon--quiz", text: `Submitted quiz: <strong>${escHtml(meta.quiz_title || "Quiz")}</strong>` };
      case "assignment_submitted":
        return { icon: "📤", iconClass: "sd-activity-item__icon--quiz", text: `Submitted assignment: <strong>${escHtml(meta.assignment_title || "Assignment")}</strong>` };
      case "quiz_passed":
        return { icon: "🏅", iconClass: "sd-activity-item__icon--cert", text: `Passed quiz with <strong>${escHtml(meta.score || 0)}%</strong>` };
      case "course_enrolled":
        return { icon: "🎓", iconClass: "sd-activity-item__icon--enroll", text: `Enrolled in <strong>${escHtml(meta.course_title || "a course")}</strong>` };
      case "certificate_issued":
        return { icon: "🏆", iconClass: "sd-activity-item__icon--cert", text: `Earned certificate: <strong>${escHtml(meta.course_title || "Certificate")}</strong>` };
      default:
        return { icon: "📌", iconClass: "sd-activity-item__icon--enroll", text: `<strong>${escHtml(log.action.replace(/_/g, " "))}</strong>` };
    }
  }

  /* ── Notifications ──────────────────────────────────────────────── */
  async function loadNotifications(userId) {
    let notifications = [];
    let unreadMessages = [];
    try {
      const { data, error } = await window.lmsSupabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(15);

      if (error) throw error;
      notifications = data || [];
    } catch {
      notifications = [];
    }
    try {
      const { data, error } = await window.lmsSupabase
        .from("messages")
        .select("id, sender_id, recipient_id, subject, body, is_read, created_at")
        .eq("recipient_id", userId)
        .eq("is_read", false)
        .or("is_archived.eq.false,is_archived.is.null")
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      unreadMessages = data || [];
    } catch {
      unreadMessages = [];
    }
    renderNotifications(notifications, unreadMessages);
  }

  /* ── Realtime: subscribe to new notifications ───────────────────── */
  function setupRealtimeNotifications(userId) {
    if (!window.lmsSupabase) return;
    if (studentNotificationChannel && studentNotificationChannelUserId === userId) return;
    removeRealtimeChannel(studentNotificationChannel);
    studentNotificationChannelUserId = userId;
    // Realtime: listen untuk assignment baru di kursus yang dienroll student
    // Gunakan notifications table sebagai trigger (trainer akan insert notif saat buat tugas - lihat Prompt 5)
    studentNotificationChannel = window.lmsSupabase
      .channel("student-assignment-notif")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          loadedStudentSections.delete("assignments");
          loadedStudentSections.delete("schedule");
          loadedStudentSections.delete("resources");
          await loadNotifications(userId);
          // Refresh stat cards di home saat ada notifikasi baru (kursus/tugas baru)
          await loadDashboardStats(userId);
          await loadContinueLearning(userId);
          if (currentSection === "assignments") loadAssignments(userId);
          if (currentSection === "schedule") loadFullSchedule(userId);
          if (currentSection === "resources") loadResources(userId);
          if (currentSection === "courses") {
            loadedStudentSections.delete("courses");
            await loadCourseGrid(userId);
          }
        }
      )
      .subscribe();
  }

  function setupRealtimeMessages(userId) {
    if (!window.lmsSupabase) return;
    if (studentMessageChannel && studentMessageChannelUserId === userId) return;
    removeRealtimeChannel(studentMessageChannel);
    studentMessageChannelUserId = userId;
    const channel = window.lmsSupabase.channel("student-message-channel");
    studentMessageChannel = channel;
    const refreshMessages = async () => {
      await refreshStudentMessageIndicators(userId);
      await loadNotifications(userId);
      await loadDashboardStats(userId);
      if (currentSection === "messages") loadMessages(userId);
    };
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `recipient_id=eq.${userId}`,
      },
      refreshMessages
    );
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `recipient_id=eq.${userId}`,
      },
      refreshMessages
    );
    channel.subscribe?.();
  }

  /* ================================================================
     HELPERS
  ================================================================ */
  function escHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showStudentConfirmModal(message, onConfirm) {
    const overlay = document.createElement("div");
    overlay.className = "sd-modal-overlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;";
    overlay.innerHTML = `
      <div style="background:var(--sd-bg,#fff);border-radius:12px;padding:24px;max-width:360px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,.18);">
        <p style="margin:0 0 20px;font-size:.95rem;">${escHtml(message)}</p>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button class="sd-btn sd-btn--outline" id="sdConfirmCancel">Batal</button>
          <button class="sd-btn sd-btn--danger" id="sdConfirmOk">Hapus</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector("#sdConfirmCancel").onclick = () => overlay.remove();
    overlay.querySelector("#sdConfirmOk").onclick = () => {
      overlay.remove();
      onConfirm();
    };
  }

  function withAvatarCacheBust(url) {
    if (!url) return "";
    const separator = String(url).includes("?") ? "&" : "?";
    return `${url}${separator}v=${Date.now()}`;
  }

  function renderStudentAvatar(src, name = "Avatar") {
    if (!src) return;
    const img = `<img src="${escHtml(src)}" alt="${escHtml(name)}" loading="lazy" decoding="async" />`;
    document.querySelectorAll(".sd-avatar").forEach((el) => { el.innerHTML = img; });
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("Could not preview image."));
      reader.readAsDataURL(file);
    });
  }

  function creatorIdForCourse(course) {
    const profileId = course?.profiles?.admin_id || course?.profiles?.student_id;
    if (profileId) return profileId;
    return course?.trainer_id ? course.trainer_id.substring(0, 8).toUpperCase() : "-";
  }

  function timeAgo(iso) {
    if (!iso) return "";
    const diff  = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days > 0)  return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0)  return `${mins}m ago`;
    return "just now";
  }

  function formatDateTime(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-AU", {
      weekday: "short",
      month:   "short",
      day:     "numeric",
      hour:    "2-digit",
      minute:  "2-digit",
    });
  }

  function runDashboardSearch(query) {
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) return;

    // Kecualikan section yang mengandung data personal (email, profile, messages)
    const EXCLUDED_SEARCH_SECTIONS = ["profile", "messages"];
    const sections = Array.from(document.querySelectorAll(".sd-section"))
      .filter((section) => {
        const sectionId = section.id.replace(/^section-/, "");
        return !EXCLUDED_SEARCH_SECTIONS.includes(sectionId);
      });
    const matchSection = sections.find((section) => (section.textContent || "").toLowerCase().includes(needle));

    if (!matchSection) {
      // Tampilkan feedback ke user bahwa tidak ditemukan
      const searchInput = $("sdSearchInput");
      if (searchInput) {
        searchInput.style.outline = "2px solid var(--sd-red)";
        setTimeout(() => { searchInput.style.outline = ""; }, 1500);
      }
      return;
    }

    const sectionId = matchSection.id.replace(/^section-/, "");
    if (window._sdActivateSection) window._sdActivateSection(sectionId);

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

})();
