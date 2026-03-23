/* ================================================================
   REDLINE ACADEMY — dashboard-student.js
   Controller for Student Dashboard
   Dependencies: supabase-client.js (window.lmsSupabase), script.js (t(), setLanguage())
   ================================================================ */

(function () {
  "use strict";

  /* ── i18n keys baru untuk student dashboard ─────────────────────
     Tambahkan semua key di bawah ini ke object translations
     (id & en) di dalam file js/script.js Anda.
  ────────────────────────────────────────────────────────────────── */
  const NEW_I18N_KEYS = {
    id: {
      lmsDashboardHome:      "Dashboard",
      lmsMyCourses:          "Kursus Saya",
      lmsAssignments:        "Tugas & Kuis",
      lmsSchedule:           "Jadwal",
      lmsCertificates:       "Sertifikat",
      lmsMessages:           "Pesan",
      lmsResources:          "Materi",
      lmsProfile:            "Profil",
      lmsWelcomeBack:        "Selamat datang kembali,",
      lmsWelcomeSubtitle:    "Lanjutkan perjalanan caregiver Anda hari ini.",
      lmsBatch:              "Batch",
      lmsSidebarRoleStudent: "Student",
      lmsCoursesEnrolled:    "Kursus Aktif",
      lmsLessonsCompleted:   "Lesson Selesai",
      lmsPendingAssignments: "Tugas Pending",
      lmsCertificatesEarned: "Sertifikat Diraih",
      lmsContinueLearning:   "Lanjut Belajar",
      lmsUpcomingSchedule:   "Jadwal Mendatang",
      lmsRecentActivity:     "Aktivitas Terkini",
      lmsViewAll:            "Lihat Semua",
      lmsNoSchedule:         "Tidak ada jadwal mendatang",
      lmsNoActivity:         "Belum ada aktivitas",
      lmsNoAssignments:      "Tidak ada tugas di sini",
      lmsNoCertificates:     "Belum ada sertifikat. Selesaikan kursus untuk mendapatkannya!",
      lmsNoMessages:         "Belum ada pesan",
      lmsNoResources:        "Belum ada materi tersedia",
      lmsNoNotifications:    "Tidak ada notifikasi",
      lmsMarkAllRead:        "Tandai semua dibaca",
      lmsNotifications:      "Notifikasi",
      lmsNewMessage:         "Pesan Baru",
      lmsSelectMessage:      "Pilih pesan untuk dibaca",
      lmsFilterAll:          "Semua",
      lmsFilterActive:       "Sedang Berjalan",
      lmsFilterCompleted:    "Selesai",
      lmsTabPending:         "Belum Dikerjakan",
      lmsTabSubmitted:       "Sudah Dikirim",
      lmsTabGraded:          "Sudah Dinilai",
      lmsViewList:           "Daftar",
      lmsViewCalendar:       "Kalender",
      lmsSearchPlaceholder:  "Cari kursus...",
      lmsSearchResources:    "Cari materi...",
      lmsEditProfile:        "Edit Profil",
      lmsSaveProfile:        "Simpan Perubahan",
      lmsChangePassword:     "Ganti Password",
      lmsCurrentPassword:    "Password Saat Ini",
      lmsNewPassword:        "Password Baru",
      lmsConfirmPassword:    "Konfirmasi Password Baru",
      lmsUpdatePassword:     "Perbarui Password",
      lmsTimezone:           "Zona Waktu",
      lmsCityLabel:          "Kota",
      lmsBioLabel:           "Bio",
      lmsJoinedLabel:        "Bergabung:",
      lmsContinueBtn:        "Lanjutkan",
      lmsProgress:           "Progres",
    },
    en: {
      lmsDashboardHome:      "Dashboard",
      lmsMyCourses:          "My Courses",
      lmsAssignments:        "Assignments & Quizzes",
      lmsSchedule:           "Schedule",
      lmsCertificates:       "Certificates",
      lmsMessages:           "Messages",
      lmsResources:          "Resources",
      lmsProfile:            "Profile",
      lmsWelcomeBack:        "Welcome back,",
      lmsWelcomeSubtitle:    "Continue your caregiver journey today.",
      lmsBatch:              "Batch",
      lmsSidebarRoleStudent: "Student",
      lmsCoursesEnrolled:    "Courses Enrolled",
      lmsLessonsCompleted:   "Lessons Completed",
      lmsPendingAssignments: "Pending Assignments",
      lmsCertificatesEarned: "Certificates Earned",
      lmsContinueLearning:   "Continue Learning",
      lmsUpcomingSchedule:   "Upcoming Schedule",
      lmsRecentActivity:     "Recent Activity",
      lmsViewAll:            "View All",
      lmsNoSchedule:         "No upcoming events",
      lmsNoActivity:         "No activity yet",
      lmsNoAssignments:      "No assignments here",
      lmsNoCertificates:     "No certificates yet. Complete a course to earn one!",
      lmsNoMessages:         "No messages yet",
      lmsNoResources:        "No resources available",
      lmsNoNotifications:    "No notifications",
      lmsMarkAllRead:        "Mark all read",
      lmsNotifications:      "Notifications",
      lmsNewMessage:         "New Message",
      lmsSelectMessage:      "Select a message to view",
      lmsFilterAll:          "All",
      lmsFilterActive:       "In Progress",
      lmsFilterCompleted:    "Completed",
      lmsTabPending:         "Pending",
      lmsTabSubmitted:       "Submitted",
      lmsTabGraded:          "Graded",
      lmsViewList:           "List",
      lmsViewCalendar:       "Calendar",
      lmsSearchPlaceholder:  "Search courses...",
      lmsSearchResources:    "Search resources...",
      lmsEditProfile:        "Edit Profile",
      lmsSaveProfile:        "Save Changes",
      lmsChangePassword:     "Change Password",
      lmsCurrentPassword:    "Current Password",
      lmsNewPassword:        "New Password",
      lmsConfirmPassword:    "Confirm New Password",
      lmsUpdatePassword:     "Update Password",
      lmsTimezone:           "Timezone",
      lmsCityLabel:          "City",
      lmsBioLabel:           "Bio",
      lmsJoinedLabel:        "Joined:",
      lmsContinueBtn:        "Continue",
      lmsProgress:           "Progress",
    },
  };

  /* ── Inject new keys into existing translations object ──────────
     This runs automatically so you don't need to edit script.js immediately.
     However, it is strongly recommended you copy these keys into script.js
     for long-term maintainability.
  ────────────────────────────────────────────────────────────────── */
  if (window.translations) {
    Object.entries(NEW_I18N_KEYS).forEach(([lang, keys]) => {
      if (window.translations[lang]) {
        Object.assign(window.translations[lang], keys);
      }
    });
    // Re-run language update now that new keys are available
    if (typeof updatePageLanguage === "function") updatePageLanguage();
  }

  /* ── State ──────────────────────────────────────────────────────── */
  let currentStudentProfile = null;
  let currentSection = "home";

  /* ── DOM refs ───────────────────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);

  /* ================================================================
     INIT — runs after DOM is ready
  ================================================================ */
  document.addEventListener("DOMContentLoaded", async () => {
    setupSidebar();
    setupNavigation();
    setupTopbar();
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

    hamburger && hamburger.addEventListener("click", openSidebar);
    closeBtn  && closeBtn.addEventListener("click", closeSidebar);
    overlay   && overlay.addEventListener("click", closeSidebar);

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("open")) {
        closeSidebar();
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

  /* ================================================================
     NOTIFICATION PANEL
  ================================================================ */
  function setupNotificationPanel() {
    const markAllBtn = $("markAllRead");
    if (markAllBtn) {
      markAllBtn.addEventListener("click", () => {
        document.querySelectorAll(".sd-notif-list-item.unread").forEach((el) => {
          el.classList.remove("unread");
        });
        updateNotifDot();
      });
    }
  }

  function renderNotifications(notifications) {
    const list    = $("notifList");
    const dot     = $("notifDot");
    if (!list) return;

    if (!notifications || notifications.length === 0) {
      list.innerHTML = `<li class="sd-notif-empty" data-i18n="lmsNoNotifications">No notifications</li>`;
      if (dot) dot.style.display = "none";
      return;
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length;
    if (dot) dot.style.display = unreadCount > 0 ? "block" : "none";

    list.innerHTML = notifications
      .slice(0, 10)
      .map(
        (n) => `
      <li class="sd-notif-list-item ${n.is_read ? "" : "unread"}" data-id="${n.id}">
        <div class="sd-notif-list-item__icon">
          ${getNotifIcon(n.type)}
        </div>
        <div class="sd-notif-list-item__body">
          <p class="sd-notif-list-item__title">${escHtml(n.title)}</p>
          <p class="sd-notif-list-item__time">${timeAgo(n.created_at)}</p>
        </div>
      </li>`
      )
      .join("");

    // Mark as read on click
    list.querySelectorAll(".sd-notif-list-item").forEach((item) => {
      item.addEventListener("click", async () => {
        item.classList.remove("unread");
        updateNotifDot();
        const id = item.dataset.id;
        if (id && window.lmsSupabase) {
          await window.lmsSupabase
            .from("notifications")
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq("id", id)
            .catch(() => {});
        }
      });
    });
  }

  function updateNotifDot() {
    const unread = document.querySelectorAll(".sd-notif-list-item.unread").length;
    const dot = $("notifDot");
    if (dot) dot.style.display = unread > 0 ? "block" : "none";
  }

  function getNotifIcon(type) {
    const icons = {
      assignment_graded: "📝",
      quiz_result:       "✅",
      new_message:       "💬",
      forum_reply:       "💬",
      course_enrolled:   "🎓",
      certificate_issued:"🏆",
      session_reminder:  "📅",
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

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarEls = document.querySelectorAll(".sd-avatar");
        avatarEls.forEach((el) => {
          el.innerHTML = `<img src="${e.target.result}" alt="Avatar" />`;
        });
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      if (!window.lmsSupabase || !currentStudentProfile) return;
      try {
        const ext  = file.name.split(".").pop();
        const path = `avatars/${currentStudentProfile.id}.${ext}`;
        const { error } = await window.lmsSupabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true });

        if (!error) {
          const { data: urlData } = window.lmsSupabase.storage
            .from("avatars")
            .getPublicUrl(path);

          await window.lmsSupabase
            .from("profiles")
            .update({ avatar_url: urlData.publicUrl })
            .eq("id", currentStudentProfile.id);
        }
      } catch (err) {
        console.error("Avatar upload error:", err);
      }
    });
  }

  /* ================================================================
     SAVE PROFILE
  ================================================================ */
  function setupProfileForm() {
    const saveBtn = $("saveProfileBtn");
    const msgEl   = $("profileMsg");

    if (!saveBtn) return;

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
  async function loadStudentData() {
    if (!window.lmsSupabase) {
      console.warn("Supabase not initialised");
      return;
    }

    try {
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

      // 4. Load dashboard stats
      await Promise.all([
        loadDashboardStats(user.id),
        loadContinueLearning(user.id),
        loadCourseGrid(user.id),
        loadAssignments(user.id),
        loadUpcomingSchedule(user.id),
        loadActivityFeed(user.id),
        loadNotifications(user.id),
      ]);

      // 5. Setup interactive forms now that profile is loaded
      setupProfileForm();

      // 6. Setup Supabase Realtime for notifications
      setupRealtimeNotifications(user.id);

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
      $("profileCardId").textContent = profile.id
        ? profile.id.substring(0, 8).toUpperCase()
        : "—";
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
      $("welcomeBatch").textContent = profile.batch || "2025";
    }

    // Avatar
    if (profile.avatar_url) {
      document.querySelectorAll(".sd-avatar").forEach((el) => {
        el.innerHTML = `<img src="${escHtml(profile.avatar_url)}" alt="${escHtml(name)}" />`;
      });
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

  /* ── Dashboard Stats ────────────────────────────────────────────── */
  async function loadDashboardStats(userId) {
    try {
      // Use the v_student_dashboard view from our schema
      const { data, error } = await window.lmsSupabase
        .from("v_student_dashboard")
        .select("*")
        .eq("student_id", userId)
        .single();

      if (error) throw error;

      if ($("statCoursesEnrolled"))    $("statCoursesEnrolled").textContent    = data.courses_enrolled    || 0;
      if ($("statLessonsCompleted"))   $("statLessonsCompleted").textContent   = data.lessons_completed   || 0;
      if ($("statPendingAssignments")) $("statPendingAssignments").textContent = data.pending_submissions || 0;
      if ($("statCertificates"))       $("statCertificates").textContent       = data.certificates_earned || 0;

      // Update assignment badge in nav
      const badge = $("assignmentBadge");
      if (badge) {
        const count = data.pending_submissions || 0;
        badge.textContent = count;
        badge.style.display = count > 0 ? "inline-block" : "none";
      }
    } catch (err) {
      console.warn("Stats load error (view may not exist yet):", err.message);
      // Fallback: set all stats to 0
      ["statCoursesEnrolled","statLessonsCompleted","statPendingAssignments","statCertificates"]
        .forEach((id) => { if ($(id)) $(id).textContent = "0"; });
    }
  }

  /* ── Continue Learning ──────────────────────────────────────────── */
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
          courses ( id, title, thumbnail_url, slug ),
          enrollments ( status )
        `)
        .eq("student_id", userId)
        .lt("completion_percent", 100)
        .order("last_accessed_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) throw error || new Error("No active course");

      const course  = data.courses;
      const pct     = Math.round(data.completion_percent || 0);
      const thumbSrc = course.thumbnail_url || "";

      container.innerHTML = `
        <div class="sd-continue-item">
          <div class="sd-continue-item__thumb${thumbSrc ? "" : " sd-continue-item__thumb--placeholder"}">
            ${thumbSrc
              ? `<img src="${escHtml(thumbSrc)}" alt="${escHtml(course.title)}" loading="lazy" />`
              : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`
            }
          </div>
          <div>
            <p class="sd-continue-item__course">Caregiver Program</p>
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
    } catch {
      container.innerHTML = `
        <div class="sd-empty-state" style="padding:1.5rem 0">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          <p data-i18n="lmsNoCourses" style="margin:0;font-size:.875rem">No active courses</p>
        </div>`;
    }
  }

  /* ── Upcoming Schedule ──────────────────────────────────────────── */
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
      if (!enrollments || enrollments.length === 0) {
        renderEmpty();
        setupFilterHandler();
        return;
      }

      const courseIds = enrollments.map((e) => e.course_id).filter(Boolean);
      if (courseIds.length === 0) {
        renderEmpty();
        setupFilterHandler();
        return;
      }

      const { data: progressRows, error: progressErr } = await window.lmsSupabase
        .from("course_progress")
        .select("course_id, completion_percent")
        .eq("student_id", userId)
        .in("course_id", courseIds);

      if (progressErr) throw progressErr;
      const progressMap = new Map(
        (progressRows || [])
          .filter((row) => row.course_id)
          .map((row) => [row.course_id, row.completion_percent || 0])
      );

      const { data: courses, error: courseErr } = await window.lmsSupabase
        .from("courses")
        .select("id, title, thumbnail_url, category_id, trainer_id")
        .in("id", courseIds);

      if (courseErr) throw courseErr;

      const courseMap = new Map((courses || []).map((c) => [c.id, c]));

      grid.innerHTML = "";

      const cards = enrollments.map((enroll) => {
        const course = courseMap.get(enroll.course_id) || {};
        const statusRaw = (enroll.status || "active").toLowerCase();
        const status = statusRaw === "completed" ? "completed" : "active";
        const statusLabel = typeof t === "function"
          ? t(status === "completed" ? "lmsFilterCompleted" : "lmsFilterActive")
          : status === "completed" ? "Completed" : "Active";
        const badgeClass = status === "completed"
          ? "sd-status-badge--completed"
          : "sd-status-badge--active";
        const progress = Math.round(progressMap.get(enroll.course_id) || 0);
        const progressLabel = typeof t === "function" ? t("lmsProgress") : "Progress";
        const thumbSrc = course.thumbnail_url || "";
        const category = course.category_id || "Course";
        const trainer = "Redline Academy";

        return `
          <div class="sd-course-card" data-status="${status}">
            <div class="sd-course-card__thumb">
              ${thumbSrc
                ? `<img src="${escHtml(thumbSrc)}" alt="${escHtml(course.title || "Course")}" loading="lazy" />`
                : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`
              }
            </div>
            <div class="sd-course-card__body">
              <p class="sd-course-card__category">${escHtml(category)}</p>
              <h3 class="sd-course-card__title">${escHtml(course.title || "Course")}</h3>
              <p class="sd-course-card__trainer">${escHtml(trainer)}</p>
              <div class="sd-course-card__footer">
                <span class="sd-status-badge ${badgeClass}">${escHtml(statusLabel)}</span>
                <span class="sd-course-card__progress">${progress}% ${escHtml(progressLabel)}</span>
              </div>
            </div>
          </div>`;
      }).join("");

      grid.insertAdjacentHTML("beforeend", cards);
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
        const isVisible = activeFilter === status;
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
      const { data: assignments, error: assignErr } = await window.lmsSupabase
        .from("assignments")
        .select("*")
        .eq("student_id", userId)
        .order("due_at", { ascending: true });

      if (assignErr) throw assignErr;
      if (!assignments || assignments.length === 0) {
        renderEmpty();
        setupFilterHandler();
        return;
      }

      const { data: submissions } = await window.lmsSupabase
        .from("assignment_submissions")
        .select("*")
        .eq("student_id", userId);

      const submissionMap = new Map(
        (submissions || []).map((s) => [s.assignment_id, s])
      );

      list.querySelectorAll(".sd-assignment-item").forEach((el) => el.remove());
      hideEmpty();

      assignments.forEach((assignment) => {
        const submission = submissionMap.get(assignment.id);
        const statusRaw = submission?.status || "pending";
        const status = ["pending", "submitted", "graded"].includes(statusRaw)
          ? statusRaw
          : "pending";

        const statusLabel = typeof t === "function"
          ? t(
              status === "graded"
                ? "lmsTabGraded"
                : status === "submitted"
                ? "lmsTabSubmitted"
                : "lmsTabPending"
            )
          : status;

        const icon = assignment.type === "quiz" ? "📝" : "📘";
        const title = assignment.title || "Assignment";
        const courseLabel = assignment.course_title || "Course";
        const dueLabel = assignment.due_at
          ? new Date(assignment.due_at).toLocaleDateString("en-AU")
          : "";

        const actions = status === "pending"
          ? `<button class="sd-btn sd-btn--primary sd-btn--sm" data-action="submit" data-assignment-id="${assignment.id}">
               ${typeof t === "function" ? t("submit") : "Submit"}
             </button>`
          : `<span class="sd-status-badge ${
               status === "graded"
                 ? "sd-status-badge--completed"
                 : "sd-status-badge--active"
             }">${statusLabel}</span>`;

        const item = document.createElement("div");
        item.className = "sd-assignment-item";
        item.dataset.status = status;
        item.innerHTML = `
          <div class="sd-assignment-item__icon">${icon}</div>
          <div class="sd-assignment-item__body">
            <p class="sd-assignment-item__title">${escHtml(title)}</p>
            <p class="sd-assignment-item__meta">${escHtml(courseLabel)}${dueLabel ? ` • ${dueLabel}` : ""}</p>
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
          btn.disabled = true;
          try {
            await window.lmsSupabase
              .from("assignment_submissions")
              .insert({
                student_id: userId,
                assignment_id: assignmentId,
                status: "submitted",
                submitted_at: new Date().toISOString()
              });
            await loadAssignments(userId);
          } catch (err) {
            console.error("Submit assignment error:", err.message);
          } finally {
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

  async function loadUpcomingSchedule(userId) {
    const list  = $("scheduleList");
    const empty = $("scheduleEmpty");
    if (!list) return;

    try {
      // Get courses student is enrolled in first
      const { data: enrollments } = await window.lmsSupabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", userId)
        .eq("status", "active");

      const courseIds = (enrollments || []).map((e) => e.course_id);

      if (courseIds.length === 0) throw new Error("No enrollments");

      const { data, error } = await window.lmsSupabase
        .from("schedules")
        .select("id, title, event_type, start_datetime, end_datetime, meeting_url")
        .in("course_id", courseIds)
        .gte("start_datetime", new Date().toISOString())
        .order("start_datetime", { ascending: true })
        .limit(4);

      if (error) throw error;

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
          ${event.meeting_url
            ? `<a href="${escHtml(event.meeting_url)}" target="_blank" rel="noopener" class="sd-btn sd-btn--outline sd-btn--sm">Join</a>`
            : ""}
        `;
        list.insertBefore(li, empty);
      });
    } catch {
      if (empty) empty.style.display = "block";
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
        return { icon: "🏅", iconClass: "sd-activity-item__icon--cert", text: `Passed quiz with <strong>${meta.score || 0}%</strong>` };
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
    try {
      const { data, error } = await window.lmsSupabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(15);

      if (error) throw error;
      renderNotifications(data || []);
    } catch {
      renderNotifications([]);
    }
  }

  /* ── Realtime: subscribe to new notifications ───────────────────── */
  function setupRealtimeNotifications(userId) {
    if (!window.lmsSupabase) return;
    window.lmsSupabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => { loadNotifications(userId); }
      )
      .subscribe();
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

})();
