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
      lmsNoCourses:          "Belum ada kursus aktif",
      lmsNoMessages:         "Belum ada pesan",
      lmsNoResources:        "Belum ada materi tersedia",
      lmsNoNotifications:    "Tidak ada notifikasi",
      lmsMarkAllRead:        "Tandai semua dibaca",
      lmsNotifications:      "Notifikasi",
      lmsNewMessage:         "Pesan Baru",
      lmsSelectMessage:      "Pilih pesan untuk dibaca",
      lmsComposeTitle:       "Pesan Baru",
      lmsMsgRecipient:       "Kirim ke",
      lmsMsgSelectRecipient: "Pilih penerima (maks. 50)",
      lmsMsgSubject:         "Subjek",
      lmsMsgBody:            "Isi pesan",
      lmsMsgBodyPlaceholder: "Tulis isi pesan...",
      lmsMsgSent:            "Pesan terkirim.",
      lmsMsgNoRecipients:    "Tidak ada penerima tersedia.",
      lmsMsgRequired:        "Pilih minimal satu penerima, subjek, dan isi pesan wajib diisi.",
      lmsMsgTooManyRecipients:"Maksimal 50 penerima sekali kirim.",
      lmsMsgSelectedCount:   "{count} penerima dipilih",
      lmsFileRequired:       "Pilih file sebelum mengumpulkan tugas.",
      lmsMsgFailed:          "Pesan gagal dikirim.",
      lmsCancel:             "Batal",
      lmsSendMessage:        "Kirim Pesan",
      lmsFilterAll:          "Semua",
      lmsFilterActive:       "Sedang Berjalan",
      lmsFilterCompleted:    "Selesai",
      lmsTabPending:         "Belum Dikerjakan",
      lmsTabSubmitted:       "Sudah Dikirim",
      lmsTabGraded:          "Sudah Dinilai",
      lmsSubmitAssignment:   "Kumpulkan",
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
      lmsStatusAvailable:    "Tersedia",
      lmsCreatorId:          "Creator ID",
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
      lmsNoCourses:          "No active courses",
      lmsNoMessages:         "No messages yet",
      lmsNoResources:        "No resources available",
      lmsNoNotifications:    "No notifications",
      lmsMarkAllRead:        "Mark all read",
      lmsNotifications:      "Notifications",
      lmsNewMessage:         "New Message",
      lmsSelectMessage:      "Select a message to view",
      lmsComposeTitle:       "New Message",
      lmsMsgRecipient:       "Send to",
      lmsMsgSelectRecipient: "Select recipients (max 50)",
      lmsMsgSubject:         "Subject",
      lmsMsgBody:            "Message",
      lmsMsgBodyPlaceholder: "Write your message...",
      lmsMsgSent:            "Message sent.",
      lmsMsgNoRecipients:    "No recipients available.",
      lmsMsgRequired:        "Select at least one recipient, subject, and message.",
      lmsMsgTooManyRecipients:"You can select up to 50 recipients at once.",
      lmsMsgSelectedCount:   "{count} recipients selected",
      lmsFileRequired:       "Please select a file before submitting.",
      lmsMsgFailed:          "Message failed to send.",
      lmsCancel:             "Cancel",
      lmsSendMessage:        "Send Message",
      lmsFilterAll:          "All",
      lmsFilterActive:       "In Progress",
      lmsFilterCompleted:    "Completed",
      lmsTabPending:         "Pending",
      lmsTabSubmitted:       "Submitted",
      lmsTabGraded:          "Graded",
      lmsSubmitAssignment:   "Submit",
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
      lmsStatusAvailable:    "Available",
      lmsCreatorId:          "Creator ID",
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
  const loadedStudentSections = new Set(["home"]);
  let fullScheduleCache = [];
  let studentMessageComposerBound = false;
  const ASSIGNMENT_SUBMISSIONS_BUCKET = "assignment-submissions";

  /* ── DOM refs ───────────────────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);

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

  async function uploadAssignmentSubmissionFile(file, userId, assignmentId) {
    if (!file) throw new Error("Please choose a file before submitting.");
    if (!window.lmsSupabase?.storage) throw new Error("Supabase Storage is not available.");

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
        updateNotifDot();
        if (!window.lmsSupabase || unreadItems.length === 0) return;
        const unreadIds = unreadItems.map((item) => item.dataset.id).filter(Boolean);
        if (unreadIds.length === 0) return;
        await window.lmsSupabase
          .from("notifications")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in("id", unreadIds)
          .catch(() => {});
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
        loadContinueLearning(user.id),
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
          courses ( id, title, thumbnail_url, slug, category_id, categories(name) ),
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
      const thumbSrc = toSafeUiUrl(course.thumbnail_url) || "";

      container.innerHTML = `
        <div class="sd-continue-item">
          <div class="sd-continue-item__thumb${thumbSrc ? "" : " sd-continue-item__thumb--placeholder"}">
            ${thumbSrc
              ? `<img src="${escHtml(thumbSrc)}" alt="${escHtml(course.title)}" loading="lazy" />`
              : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`
            }
          </div>
          <div>
            <p class="sd-continue-item__course">${escHtml(data.courses?.categories?.name || data.courses?.category_id || "Program")}</p>
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
  async function markLessonCompleted(lessonId, courseId) {
    if (!currentStudentProfile?.id || !window.lmsSupabase) return;
    const userId = currentStudentProfile.id;

    try {
      const { count: totalLessons } = await window.lmsSupabase
        .from("lessons")
        .select("id", { count: "exact", head: true })
        .eq("course_id", courseId);

      await window.lmsSupabase.from("lesson_progress").upsert({
        student_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        completed_at: new Date().toISOString()
      }, { onConflict: "student_id,lesson_id" }).catch(() => {});

      const { count: completedLessons } = await window.lmsSupabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)
        .eq("course_id", courseId);

      const pct = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      await window.lmsSupabase.from("course_progress").update({
        completion_percent: pct,
        last_accessed_at: new Date().toISOString(),
        last_lesson_id: lessonId
      }).eq("student_id", userId).eq("course_id", courseId);

      await window.lmsSupabase.from("activity_logs").insert({
        user_id: userId,
        action: "lesson_completed",
        entity_type: "lesson",
        entity_id: lessonId,
        metadata: { course_id: courseId, lesson_id: lessonId }
      }).catch(() => {});

      if (pct >= 100) {
        await window.lmsSupabase.from("certificates").upsert({
          student_id: userId,
          course_id: courseId,
          issued_at: new Date().toISOString(),
          certificate_no: "CERT-" + userId.substring(0, 6).toUpperCase() + "-" + courseId.substring(0, 6).toUpperCase()
        }, { onConflict: "student_id,course_id" }).catch(() => {});
      }

      await loadDashboardStats(userId);
      await loadContinueLearning(userId);
    } catch (err) {
      console.error("Progress update error:", err.message);
    }
  }

  window.lmsMarkLessonCompleted = markLessonCompleted;

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
      const enrolledCourseIds = (enrollments || []).map((e) => e.course_id).filter(Boolean);

      let progressRows = [];
      if (enrolledCourseIds.length) {
        const { data, error: progressErr } = await window.lmsSupabase
          .from("course_progress")
          .select("course_id, completion_percent")
          .eq("student_id", userId)
          .in("course_id", enrolledCourseIds);

        if (progressErr) throw progressErr;
        progressRows = data || [];
      }
      const progressMap = new Map(
        (progressRows || [])
          .filter((row) => row.course_id)
          .map((row) => [row.course_id, row.completion_percent || 0])
      );

      const { data: courses, error: courseErr } = await window.lmsSupabase
        .from("courses")
        .select(`
          id, title, thumbnail_url, category_id, trainer_id,
          categories ( name ),
          profiles!courses_trainer_id_fkey(admin_id, student_id)
        `)
        .order("title", { ascending: true });

      if (courseErr) throw courseErr;
      if (!courses || courses.length === 0) {
        renderEmpty();
        setupFilterHandler();
        return;
      }

      const enrollmentMap = new Map((enrollments || []).map((enroll) => [enroll.course_id, enroll]));

      grid.innerHTML = "";

      const cards = courses.map((course) => {
        const enroll = enrollmentMap.get(course.id);
        const statusRaw = (enroll?.status || "available").toLowerCase();
        const status = statusRaw === "completed"
          ? "completed"
          : enroll
          ? "active"
          : "available";
        const statusLabel = typeof t === "function"
          ? t(status === "completed" ? "lmsFilterCompleted" : status === "available" ? "lmsStatusAvailable" : "lmsFilterActive")
          : status === "completed" ? "Completed" : status === "available" ? "Available" : "Active";
        const badgeClass = status === "completed"
          ? "sd-status-badge--completed"
          : "sd-status-badge--active";
        const progress = Math.round(progressMap.get(course.id) || 0);
        const progressLabel = typeof t === "function" ? t("lmsProgress") : "Progress";
        const thumbSrc = toSafeUiUrl(course.thumbnail_url) || "";
        const category = course.categories?.name || course.category_id || "Course";
        const creatorLabel = typeof t === "function" ? t("lmsCreatorId") : "Creator ID";
        const creatorId = creatorIdForCourse(course);

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
              <p class="sd-course-card__trainer">${escHtml(creatorLabel)}: ${escHtml(creatorId)}</p>
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
      const { data: enrollments, error: enrollErr } = await window.lmsSupabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", userId);

      if (enrollErr) throw enrollErr;

      const courseIds = [
        ...new Set((enrollments || []).map((enroll) => enroll.course_id).filter(Boolean))
      ];

      if (courseIds.length === 0) {
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
        .eq("assignment_submissions.student_id", userId)
        .order("due_at", { ascending: true });

      if (assignErr) throw assignErr;
      if (!assignments || assignments.length === 0) {
        renderEmpty();
        setupFilterHandler();
        return;
      }

      list.querySelectorAll(".sd-assignment-item").forEach((el) => el.remove());
      hideEmpty();

      assignments.forEach((assignment) => {
        const joinedSubmissions = Array.isArray(assignment.assignment_submissions)
          ? assignment.assignment_submissions
          : [];
        const submission = joinedSubmissions.find((item) => item.student_id === userId);
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
        const courseLabel = assignment.courses?.title || "Course";
        const dueLabel = assignment.due_at
          ? new Date(assignment.due_at).toLocaleDateString("en-AU")
          : "";

        const actions = status === "pending"
          ? `<input class="sd-assignment-item__file" type="file" data-assignment-file="${escHtml(assignment.id)}" aria-label="Assignment submission file" />
             <button class="sd-btn sd-btn--primary sd-btn--sm" data-action="submit" data-assignment-id="${assignment.id}">
               ${typeof t === "function" ? t("lmsSubmitAssignment") : "Submit"}
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
          const fileInput = btn.closest(".sd-assignment-item")?.querySelector("input[type='file']");
          const file = fileInput?.files?.[0] || null;
          btn.disabled = true;
          const errSpan = btn.closest(".sd-assignment-item__actions")?.querySelector(".sd-assignment-err");
          if (errSpan) errSpan.remove();
          try {
            if (!file) throw new Error(typeof t === "function" ? t("lmsFileRequired") : "Please select a file before submitting.");
            const fileUrl = await uploadAssignmentSubmissionFile(file, userId, assignmentId);
            await window.lmsSupabase
              .from("assignment_submissions")
              .insert({
                student_id: userId,
                assignment_id: assignmentId,
                status: "submitted",
                submitted_at: new Date().toISOString(),
                file_urls: [fileUrl]
              });
            await loadAssignments(userId);
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

  async function loadUpcomingSchedule(userId) {
    const list  = $("scheduleList");
    const empty = $("scheduleEmpty");
    if (!list) return;

    try {
      // Get courses student is enrolled in first
      const { data: enrollments } = await window.lmsSupabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", userId);

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

  async function loadFullSchedule(userId) {
    const list  = $("scheduleFullList");
    const empty = $("scheduleFullEmpty");
    if (!list) return;

    try {
      const { data: enrollments } = await window.lmsSupabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", userId)

      const courseIds = (enrollments || []).map((e) => e.course_id).filter(Boolean);
      if (courseIds.length === 0) throw new Error("No enrollments");

      const { data, error } = await window.lmsSupabase
        .from("schedules")
        .select("id, title, event_type, start_datetime, end_datetime, meeting_url")
        .in("course_id", courseIds)
        .order("start_datetime", { ascending: true })
        .limit(20);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No schedule");

      fullScheduleCache = data;
      renderFullSchedule();
    } catch {
      fullScheduleCache = [];
      if (empty) empty.style.display = "flex";
    }
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
      const baseDate = new Date(fullScheduleCache[0]?.start_datetime || Date.now());
      const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      const startWeekday = (monthStart.getDay() + 6) % 7;
      const totalCells = Math.ceil((startWeekday + monthEnd.getDate()) / 7) * 7;
      const eventMap = new Map();

      fullScheduleCache.forEach((event) => {
        const key = new Date(event.start_datetime).toISOString().slice(0, 10);
        if (!eventMap.has(key)) eventMap.set(key, []);
        eventMap.get(key).push(event);
      });

      const calendar = document.createElement("div");
      calendar.dataset.scheduleRender = "true";
      calendar.style.display = "grid";
      calendar.style.gridTemplateColumns = "repeat(7, minmax(0, 1fr))";
      calendar.style.gap = ".75rem";

      for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
        const dayNumber = cellIndex - startWeekday + 1;
        const cell = document.createElement("div");
        cell.dataset.scheduleRender = "true";
        cell.style.border = "1px solid var(--sd-border)";
        cell.style.borderRadius = "var(--sd-radius-md)";
        cell.style.padding = ".6rem";
        cell.style.minHeight = "120px";
        cell.style.background = "#fff";

        if (dayNumber < 1 || dayNumber > monthEnd.getDate()) {
          cell.style.opacity = ".35";
          calendar.appendChild(cell);
          continue;
        }

        const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), dayNumber);
        const key = date.toISOString().slice(0, 10);
        const dayEvents = eventMap.get(key) || [];

        cell.innerHTML = `<div style="font-weight:700;margin-bottom:.5rem;">${dayNumber}</div>`;
        dayEvents.forEach((event) => {
          const item = document.createElement("div");
          item.style.fontSize = ".78rem";
          item.style.lineHeight = "1.35";
          item.style.marginBottom = ".45rem";
          item.innerHTML = `<strong>${escHtml(event.title || "Event")}</strong><br>${escHtml(formatDateTime(event.start_datetime))}`;
          cell.appendChild(item);
        });

        calendar.appendChild(cell);
      }

      list.insertBefore(calendar, empty);
      return;
    }

    fullScheduleCache.forEach((event) => {
      const typeClass = {
        live_session: "sd-schedule-item--live",
        exam: "sd-schedule-item--exam",
        orientation: "sd-schedule-item--live",
      }[event.event_type] || "sd-schedule-item--deadline";

      const item = document.createElement("div");
      item.dataset.scheduleRender = "true";
      item.className = `sd-schedule-item ${typeClass}`;
      item.innerHTML = `
        <span class="sd-schedule-item__dot"></span>
        <div class="sd-schedule-item__info">
          <p class="sd-schedule-item__title">${escHtml(event.title || "Event")}</p>
          <p class="sd-schedule-item__time">${formatDateTime(event.start_datetime)}${event.end_datetime ? ` - ${formatDateTime(event.end_datetime)}` : ""}</p>
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
    el.style.display = visible ? "" : "none";
  }

  const MAX_MESSAGE_RECIPIENTS = 50;

  function setStudentComposerStatus(text, isError = false) {
    const msg = $("studentMsgComposeMsg");
    if (!msg) return;
    msg.textContent = text || "";
    msg.className = `sd-profile-form__msg${isError ? " error" : text ? " success" : ""}`;
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
    if (sendBtn?.disabled) return;
    const recipientIds = getSelectedStudentMessageRecipients(recipient);
    const messageSubject = subject?.value.trim() || "";
    const messageBody = body?.value.trim() || "";

    if (recipientIds.length === 0 || !messageSubject || !messageBody) {
      setStudentComposerStatus(
        dashboardText("lmsMsgRequired", "Trainer, subject, and message are required."),
        true
      );
      return;
    }
    if (recipientIds.length > MAX_MESSAGE_RECIPIENTS) {
      setStudentComposerStatus(dashboardText("lmsMsgTooManyRecipients", "You can select up to 50 recipients at once."), true);
      return;
    }

    try {
      if (sendBtn) sendBtn.disabled = true;
      const messageRows = recipientIds.map((recipientId) => ({
        id: createClientId(),
        sender_id: currentStudentProfile.id,
        recipient_id: recipientId,
        subject: messageSubject,
        body: messageBody
      }));
      const { error } = await window.lmsSupabase
        .from("messages")
        .insert(messageRows);
      if (error) throw error;
      await Promise.all(messageRows.map((message) => sendMessageEmailNotification(message.id)));

      if (subject) subject.value = "";
      if (body) body.value = "";
      Array.from(recipient?.options || []).forEach((option) => {
        option.selected = false;
      });
      syncStudentRecipientCheckboxes();
      setStudentRecipientDropdownOpen(false);
      setStudentComposerStatus(dashboardText("lmsMsgSent", "Message sent."));
      // Tutup composer setelah 1.2 detik agar user sempat baca konfirmasi
      setTimeout(() => closeStudentMessageComposer(), 1200);
      if (window._sdActivateSection) window._sdActivateSection("messages");
      await loadMessages(currentStudentProfile.id);
    } catch (err) {
      setStudentComposerStatus(err.message || dashboardText("lmsMsgFailed", "Message failed to send."), true);
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  async function openStudentMessageComposer() {
    if (window._sdActivateSection) window._sdActivateSection("messages");
    if (!currentStudentProfile?.id || !window.lmsSupabase) return;

    const viewEmpty = $("messageViewEmpty");
    const detail = $("messageDetail");
    const composeForm = $("studentMsgComposeForm");
    const recipient = $("studentMsgRecipient");
    const subject = $("studentMsgSubject");
    const cancelBtn = $("studentCancelMsgBtn");
    if (!composeForm) return;

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

    if (recipient && recipient.options.length === 1) {
      recipient.selectedIndex = 0;
      syncStudentRecipientCheckboxes();
    }
    if (subject) subject.focus();
  }

  async function loadMessages(userId) {
    const inbox = $("inboxList");
    const inboxEmpty = $("inboxEmpty");
    const view = $("messageView");
    const viewEmpty = $("messageViewEmpty");
    const detail = $("messageDetail");
    const composeForm = $("studentMsgComposeForm");
    if (!inbox || !view) return;

    const openMessage = async (msg) => {
      setMessagePanelVisible(viewEmpty, false);
      setMessagePanelVisible(composeForm, false);
      const target = detail || view;
      target.innerHTML = `
        <div class="sd-message-view__body">
          <p class="sd-inbox-item__name">${escHtml(msg.profiles?.full_name || "System")}</p>
          <p class="sd-inbox-item__time">${formatDateTime(msg.created_at)}</p>
          <h3>${escHtml(msg.subject || "Message")}</h3>
          <p>${escHtml(msg.body || "-").replace(/\n/g, "<br>")}</p>
        </div>`;
      if (detail) setMessagePanelVisible(detail, true);

      if (!msg.is_read && msg.recipient_id === userId) {
        await window.lmsSupabase
          .from("messages")
          .update({ is_read: true })
          .eq("id", msg.id)
          .catch(() => {});
      }
    };

    try {
      const { data, error } = await window.lmsSupabase
        .from("messages")
        .select("id, sender_id, recipient_id, subject, body, is_read, created_at, profiles!sender_id(full_name, avatar_url)")
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No messages");

      if (inboxEmpty) inboxEmpty.style.display = "none";
      inbox.querySelectorAll(".sd-inbox-item").forEach((el) => el.remove());

      const unreadCount = (data || []).filter((m) => !m.is_read && m.recipient_id === userId).length;
      const msgBadge = $("messageBadge");
      if (msgBadge) {
        msgBadge.textContent = unreadCount;
        msgBadge.style.display = unreadCount > 0 ? "inline-block" : "none";
      }

      data.forEach((msg) => {
        const item = document.createElement("div");
        item.className = `sd-inbox-item${msg.is_read ? "" : " unread"}`;
        item.innerHTML = `
          <div class="sd-avatar sd-avatar--sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
          <div class="sd-inbox-item__body">
            <p class="sd-inbox-item__name">${escHtml(msg.profiles?.full_name || "System")}</p>
            <p class="sd-inbox-item__preview">${escHtml(msg.body?.substring(0, 60) || "—")}</p>
          </div>
          <span class="sd-inbox-item__time">${timeAgo(msg.created_at)}</span>`;
        item.addEventListener("click", async () => {
          inbox.querySelectorAll(".sd-inbox-item").forEach((el) => el.classList.remove("active"));
          item.classList.add("active");
          item.classList.remove("unread");
          await openMessage(msg);
        });
        inbox.insertBefore(item, inboxEmpty);
      });
    } catch {
      if (inboxEmpty) inboxEmpty.style.display = "flex";
      if (composeForm?.hidden) {
        setMessagePanelVisible(detail, false);
        setMessagePanelVisible(viewEmpty, true);
      }
    }
  }

  async function loadResources(userId) {
    const grid = $("resourceGrid");
    const empty = $("resourceEmpty");
    const tabs = $("resourceCategoryTabs");
    if (!grid) return;

    const applyResourceFilter = () => {
      const query = ($("resourceSearch")?.value || "").trim().toLowerCase();
      const activeTab = tabs?.querySelector(".sd-filter-tab.active");
      const activeCategory = activeTab?.dataset.category || "all";
      let visible = 0;

      grid.querySelectorAll("[data-resource-card='true']").forEach((card) => {
        const text = (card.textContent || "").toLowerCase();
        const category = card.dataset.category || "";
        const matchesQuery = !query || text.includes(query);
        const matchesCategory = activeCategory === "all" || category === activeCategory;
        const show = matchesQuery && matchesCategory;
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });

      if (empty && grid.querySelectorAll("[data-resource-card='true']").length) {
        empty.style.display = visible ? "none" : "flex";
      }
    };

    try {
      const { data: enrollments, error: enrollErr } = await window.lmsSupabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", userId)

      if (enrollErr) throw enrollErr;
      const courseIds = (enrollments || []).map((e) => e.course_id).filter(Boolean);
      if (courseIds.length === 0) throw new Error("No enrollments");

      const { data, error } = await window.lmsSupabase
        .from("courses")
        .select("id, title, thumbnail_url, category_id, categories(id, name)")
        .in("id", courseIds)
        .order("title", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No resources");

      if (empty) empty.style.display = "none";
      grid.querySelectorAll("[data-resource-card='true']").forEach((el) => el.remove());

      data.forEach((course) => {
        const card = document.createElement("div");
        card.setAttribute("data-resource-card", "true");
        card.dataset.category = (course.categories?.name || "").toLowerCase().replace(/\s+/g, "-") || "all";
        card.className = "sd-course-card";
        card.innerHTML = `
          <div class="sd-course-card__thumb">
            ${toSafeUiUrl(course.thumbnail_url)
              ? `<img src="${escHtml(toSafeUiUrl(course.thumbnail_url))}" alt="${escHtml(course.title || "Resource")}" loading="lazy" />`
              : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`}
          </div>
          <div class="sd-course-card__body">
            <p class="sd-course-card__category">${escHtml(course.categories?.name || course.category_id || "Course")}</p>
            <h3 class="sd-course-card__title">${escHtml(course.title || "Resource")}</h3>
            <p class="sd-course-card__trainer">Redline Academy</p>
          </div>`;
        grid.appendChild(card);
      });

      if (tabs && !tabs.dataset.bound) {
        tabs.dataset.bound = "true";
        tabs.addEventListener("sd:filter-change", applyResourceFilter);
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

    const sections = Array.from(document.querySelectorAll(".sd-section"));
    const matchSection = sections.find((section) => (section.textContent || "").toLowerCase().includes(needle));
    if (!matchSection) return;

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

})();
