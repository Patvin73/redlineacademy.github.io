/* ============================================================
   REDLINE ACADEMY DASHBOARD MARKETER JS
   Handles: tab navigation, schools CRUD, commission claims,
            reports, real-time calculator, Supabase integration
   ============================================================ */

(function () {
  "use strict";
  /* Inject marketer i18n keys from patch file (loaded in HTML) */
  if (window.translations) {
    if (
      typeof newKeysID === "object" &&
      newKeysID !== null &&
      window.translations.id
    ) {
      Object.assign(window.translations.id, newKeysID);
    }
    if (
      typeof newKeysEN === "object" &&
      newKeysEN !== null &&
      window.translations.en
    ) {
      Object.assign(window.translations.en, newKeysEN);
    }
    if (typeof updatePageLanguage === "function") updatePageLanguage();
  }

  /* Helpers */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const esc = (v) =>
    String(v ?? "-").replace(
      /[<>&"']/g,
      (c) =>
        ({
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
  const tt = (key, fallback) => (typeof t === "function" ? t(key) : fallback);

  /* State */
  let marketerProfile = null;
  let schools = []; // from Supabase
  let claims = []; // from Supabase

  /* Section */
     1.  TAB NAVIGATION

  function initTabs() {
    const tabs = $$(".mk-nav-tab");
    const panels = $$(".mk-panel");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;

        tabs.forEach((t) => {
          t.classList.toggle("active", t.dataset.tab === target);
          t.setAttribute(
            "aria-selected",
            t.dataset.tab === target ? "true" : "false",
          );
        });
        panels.forEach((p) => {
          p.classList.toggle("active", p.id === `panel-${target}`);
        });

        // If switching to reports, hide detail view
        if (target === "reports") showReportsList();

        closeMobileNav();
      });
    });
  }

  function closeMobileNav() {
    const nav = document.getElementById("mkNavTabs");
    const toggle = document.getElementById("mkMobileToggle");
    const overlay = document.getElementById("mkMobileOverlay");

    if (nav) {
      nav.classList.remove("open");
      nav.classList.remove("active");
    }
    if (overlay) {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
    }
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function initMobileNav() {
    const nav = document.getElementById("mkNavTabs");
    const toggle = document.getElementById("mkMobileToggle");
    const overlay = document.getElementById("mkMobileOverlay");

    if (!nav || !toggle || !overlay) return;

    const openMobileNav = () => {
      nav.classList.add("open");
      nav.classList.add("active");
      overlay.classList.add("active");
      overlay.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
    };

    const toggleMobileNav = () => {
      if (nav.classList.contains("open")) {
        closeMobileNav();
        return;
      }

      openMobileNav();
    };

    toggle.addEventListener("click", toggleMobileNav);
    overlay.addEventListener("click", closeMobileNav);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobileNav();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 600) closeMobileNav();
    });
  }

  /* Section */
     2.  LOAD PROFILE (from guard.js via Supabase)

  async function loadProfile() {
    if (!window.lmsAuth) return;
    const user = await window.lmsAuth.getSessionUser();
    if (!user) return;

    const res = await window.lmsAuth.getProfile(user.id);
    if (!res.ok) return;

    marketerProfile = res.profile;

    // Populate header
    const nameEl = document.getElementById("marketerName");
    const roleEl = document.getElementById("marketerRole");
    const avatarEl = document.getElementById("marketerAvatar");

    if (nameEl)
      nameEl.textContent = esc(marketerProfile.full_name || user.email || "-");
    if (roleEl)
      roleEl.textContent =
        marketerProfile.role === "staff" &&
        (window.lmsConfig?.enableStaff === true ||
          window.__LMS_ENABLE_STAFF__ === true)
          ? "Staff"
          : "Marketer";
    if (avatarEl)
      avatarEl.textContent = (marketerProfile.full_name ||
        user.email ||
        "M")[0].toUpperCase();
  }

  /* Section */
     3.  SCHOOLS (Supabase table: marketer_schools)

  async function loadSchools() {
    if (!window.lmsSupabase || !marketerProfile) return;

    const { data, error } = await window.lmsSupabase
      .from("marketer_schools")
      .select("*")
      .eq("marketer_id", marketerProfile.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      schools = data;
    }

    renderSchoolTable();
    populateSchoolSelect();
    updateCounters();
  }

  function renderSchoolTable() {
    const tbody = document.getElementById("schoolTableBody");
    const badge = document.getElementById("schoolCountBadge");
    const navCount = document.getElementById("schoolCount");

    if (badge) badge.textContent = schools.length;
    if (navCount) navCount.textContent = schools.length;

    if (!tbody) return;

    if (schools.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="7">
          <div class="mk-empty">
            <span class="mk-empty-icon">&#127979;</span>
            <p>${tt("mkNoSchools", "Belum ada sekolah ditambahkan.")}</p>
          </div>
        </td></tr>`;
      return;
    }

    tbody.innerHTML = schools
      .map((s, i) => {
        // Count enrolled students from claims for this school
        const enrolled = claims
          .filter((c) => c.school_id === s.id && c.students_enrolled > 0)
          .reduce((sum, c) => sum + (c.students_enrolled || 0), 0);

        return `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${esc(s.name)}</strong></td>
          <td>${esc(s.city)}</td>
          <td>${esc(s.contact_name)}</td>
          <td><strong>${enrolled}</strong></td>
          <td><span class="mk-badge ${s.status === "active" ? "done" : "pending"}">${esc(s.status || "aktif")}</span></td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="marketerDash.editSchool('${esc(s.id)}')"
              aria-label="${tt("mkEditSchool", "Edit")} ${esc(s.name)}">
              ${tt("mkEditSchool", "Edit")}
            </button>
          </td>
        </tr>`;
      })
      .join("");
  }

  function populateSchoolSelect() {
    const sel = document.getElementById("claimSchool");
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = `<option value="">${tt("mkClaimSchoolPH", "Pilih sekolah...")}</option>`;
    schools.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name + " - " + s.city;
      if (s.id === current) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function initSchoolForm() {
    const addBtn = document.getElementById("addSchoolBtn");
    const cancelBtn = document.getElementById("cancelSchoolBtn");
    const saveBtn = document.getElementById("saveSchoolBtn");
    const formEl = document.getElementById("addSchoolForm");

    if (addBtn) {
      addBtn.addEventListener("click", () => {
        formEl.style.display = "block";
        formEl.scrollIntoView({ behavior: "smooth", block: "start" });
        formEl.dataset.editId = "";
        // clear fields
        [
          "schoolName",
          "schoolCity",
          "schoolContact",
          "schoolPhone",
          "schoolNotes",
        ].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.value = "";
        });
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        formEl.style.display = "none";
        formEl.dataset.editId = "";
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", saveSchool);
    }
  }

  async function saveSchool() {
    const formEl = document.getElementById("addSchoolForm");
    const msgEl = document.getElementById("schoolFormMsg");
    const editId = formEl.dataset.editId || "";
    const name = $("#schoolName").value.trim();
    const city = $("#schoolCity").value.trim();
    const contact = $("#schoolContact")?.value.trim() || "";
    const phone = $("#schoolPhone")?.value.trim() || "";
    const notes = $("#schoolNotes")?.value.trim() || "";

    if (!name || !city) {
      msgEl.textContent = tt(
        "mkSchoolValidationError",
        "Nama sekolah dan kota wajib diisi.",
      );
      msgEl.className = "mk-form-feedback error";
      return;
    }

    if (!window.lmsSupabase || !marketerProfile) return;

    const payload = {
      marketer_id: marketerProfile.id,
      name,
      city,
      contact_name: contact,
      phone,
      notes,
      status: "active",
    };

    let error;
    if (editId) {
      ({ error } = await window.lmsSupabase
        .from("marketer_schools")
        .update(payload)
        .eq("id", editId)
        .eq("marketer_id", marketerProfile.id));
    } else {
      ({ error } = await window.lmsSupabase
        .from("marketer_schools")
        .insert(payload));
    }

    if (error) {
      msgEl.textContent = error.message;
      msgEl.className = "mk-form-feedback error";
      return;
    }

    msgEl.textContent = tt("mkSchoolSaved", "Sekolah berhasil disimpan!");
    msgEl.className = "mk-form-feedback success";
    formEl.dataset.editId = "";
    formEl.style.display = "none";
    await loadSchools();
  }

  async function editSchool(id) {
    const school = schools.find((s) => s.id === id);
    if (!school) return;

    const formEl = document.getElementById("addSchoolForm");
    formEl.dataset.editId = id;
    formEl.style.display = "block";
    formEl.scrollIntoView({ behavior: "smooth", block: "start" });

    document.getElementById("schoolName").value = school.name || "";
    document.getElementById("schoolCity").value = school.city || "";
    document.getElementById("schoolContact").value = school.contact_name || "";
    document.getElementById("schoolPhone").value = school.phone || "";
    document.getElementById("schoolNotes").value = school.notes || "";
  }

  /* Section */
     4.  COMMISSION CALCULATOR (live)

  function initCalculator() {
    const studentsPresent = document.getElementById("claimStudentsPresent");
    const studentsEnrolled = document.getElementById("claimStudentsEnrolled");
    const programFee = document.getElementById("claimProgramFee");

    const fields = [studentsPresent, studentsEnrolled, programFee];
    fields.forEach((f) => {
      if (f) f.addEventListener("input", recalculate);
    });

    // Generate ref ID
    const refEl = document.getElementById("claimRefId");
    if (refEl) {
      const ts = Date.now().toString(36).toUpperCase();
      refEl.textContent = `ID: RA-COM-${ts}`;
      refEl.dataset.ref = `RA-COM-${ts}`;
    }
  }

  function recalculate() {
    const present = parseInt(
      document.getElementById("claimStudentsPresent")?.value || 0,
    );
    const enrolled = parseInt(
      document.getElementById("claimStudentsEnrolled")?.value || 0,
    );
    const fee = parseFloat(
      document.getElementById("claimProgramFee")?.value || 0,
    );

    const ACCESS_FEE = present >= 30 ? 350000 : 0;
    const COMMISSION_RATE = 0.1;
    const enrollComm = Math.round(fee * COMMISSION_RATE * enrolled);
    let bonus = 0;

    if (enrolled >= 10) bonus = 1500000;
    else if (enrolled >= 5) bonus = 500000;

    const total = ACCESS_FEE + enrollComm + bonus;

    // Update DOM
    const accessEl = document.getElementById("calcAccessFee");
    const enrollEl = document.getElementById("calcEnrollComm");
    const bonusEl = document.getElementById("calcBonus");
    const totalEl = document.getElementById("calcTotal");
    const formulaEl = document.getElementById("calcEnrollFormula");
    const bonusFormEl = document.getElementById("calcBonusFormula");

    if (accessEl) accessEl.textContent = fmt(ACCESS_FEE);
    if (enrollEl) enrollEl.textContent = fmt(enrollComm);
    if (bonusEl) bonusEl.textContent = fmt(bonus);
    if (totalEl) totalEl.textContent = fmt(total);
    if (formulaEl)
      formulaEl.textContent = `10% x ${fmt(fee)} x ${enrolled} siswa`;
    if (bonusFormEl) {
      if (enrolled >= 10)
        bonusFormEl.textContent = `${enrolled} siswa >= 10 -> Rp 1.500.000`;
      else if (enrolled >= 5)
        bonusFormEl.textContent = `${enrolled} siswa >= 5 -> Rp 500.000`;
      else
        bonusFormEl.textContent = tt(
          "mkCalcBonusFormulaNone",
          "Belum ada (min. 5 siswa)",
        );
    }
  }

  /* Section */
     5.  CLAIM FORM SUBMIT

  function initClaimForm() {
    initCalculator();

    const form = document.getElementById("claimForm");
    const resetBtn = document.getElementById("claimResetBtn");
    const msgEl = document.getElementById("claimFormMsg");

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        form.reset();
        recalculate();
        msgEl.textContent = "";
        msgEl.className = "mk-form-feedback";
      });
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const schoolId = document.getElementById("claimSchool")?.value;
        const presDate = document.getElementById("claimPresDate")?.value;
        const present = parseInt(
          document.getElementById("claimStudentsPresent")?.value || 0,
        );
        const enrolled = parseInt(
          document.getElementById("claimStudentsEnrolled")?.value || 0,
        );
        const fee = parseFloat(
          document.getElementById("claimProgramFee")?.value || 0,
        );
        const notes = document.getElementById("claimNotes")?.value.trim() || "";
        const consent = document.getElementById("claimConsent")?.checked;
        const refId = document.getElementById("claimRefId")?.dataset.ref || "";

        if (!schoolId || !presDate) {
          msgEl.textContent = tt(
            "mkClaimValidationSchool",
            "Pilih sekolah dan tanggal presentasi.",
          );
          msgEl.className = "mk-form-feedback error";
          return;
        }
        if (present < 1) {
          msgEl.textContent = tt(
            "mkClaimValidationStudents",
            "Isi jumlah siswa yang hadir.",
          );
          msgEl.className = "mk-form-feedback error";
          return;
        }
        if (!consent) {
          msgEl.textContent = tt(
            "mkClaimValidationConsent",
            "Harap centang persetujuan sebelum mengirim.",
          );
          msgEl.className = "mk-form-feedback error";
          return;
        }

        if (!window.lmsSupabase || !marketerProfile) return;

        // Calculate commission
        const accessFee = present >= 30 ? 350000 : 0;
        const enrollComm = Math.round(fee * 0.1 * enrolled);
        const bonus = enrolled >= 10 ? 1500000 : enrolled >= 5 ? 500000 : 0;
        const totalComm = accessFee + enrollComm + bonus;

        msgEl.textContent = tt("mkClaimSubmitting", "Mengirim klaim...");
        msgEl.className = "mk-form-feedback";

        const { error } = await window.lmsSupabase
          .from("marketer_claims")
          .insert({
            marketer_id: marketerProfile.id,
            school_id: schoolId,
            ref_id: refId,
            presentation_date: presDate,
            students_present: present,
            students_enrolled: enrolled,
            program_fee: fee,
            access_fee: accessFee,
            enrollment_comm: enrollComm,
            bonus: bonus,
            total_commission: totalComm,
            notes,
            status: "pending",
          });

        if (error) {
          msgEl.textContent = error.message;
          msgEl.className = "mk-form-feedback error";
          return;
        }

        msgEl.textContent = tt(
          "mkClaimSuccess",
          "Klaim berhasil diajukan! Menunggu verifikasi admin.",
        );
        msgEl.className = "mk-form-feedback success";
        form.reset();
        recalculate();
        await loadClaims();
      });
    }
  }

  /* Section */
     6.  CLAIMS / REPORTS (Supabase table: marketer_claims)

  async function loadClaims() {
    if (!window.lmsSupabase || !marketerProfile) return;

    const { data, error } = await window.lmsSupabase
      .from("marketer_claims")
      .select("*, marketer_schools(name, city)")
      .eq("marketer_id", marketerProfile.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      claims = data;
    }

    renderReportTable();
    renderActivityTable();
    updateStats();
    updateCounters();
  }

  function renderReportTable() {
    const tbody = document.getElementById("reportTableBody");
    const badge = document.getElementById("reportCountBadge");
    const navCount = document.getElementById("reportCount");

    const label =
      claims.length === 1
        ? `1 ${tt("mkClaimSingular", "klaim")}`
        : `${claims.length} ${tt("mkClaimPlural", "klaim")}`;

    if (badge) badge.textContent = label;
    if (navCount) navCount.textContent = claims.length;

    if (!tbody) return;

    if (claims.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="7">
          <div class="mk-empty">
            <span class="mk-empty-icon">&#128194;</span>
            <p>${tt("mkNoReports", "Belum ada klaim yang diajukan.")}</p>
          </div>
        </td></tr>`;
      return;
    }

    tbody.innerHTML = claims
      .map((c) => {
        const school = c.marketer_schools;
        const dateStr = c.presentation_date
          ? new Date(c.presentation_date).toLocaleDateString("id-ID")
          : "-";
        const statusClass =
          { paid: "paid", pending: "pending", rejected: "rejected" }[
            c.status
          ] || "pending";
        const statusLabel =
          {
            paid: tt("mkStatusPaid", "Dibayar"),
            pending: tt("mkStatusPending", "Menunggu"),
            rejected: tt("mkStatusRejected", "Ditolak"),
          }[c.status] || c.status;

        return `
        <tr>
          <td><code style="font-size:0.78rem;">${esc(c.ref_id || c.id?.slice(0, 8))}</code></td>
          <td>${dateStr}</td>
          <td>${esc(school?.name || "-")}</td>
          <td>${esc(c.students_enrolled || 0)}</td>
          <td><strong>${fmt(c.total_commission)}</strong></td>
          <td><span class="mk-badge ${statusClass}">${esc(statusLabel)}</span></td>
          <td>
            <button class="btn btn-secondary btn-sm"
              onclick="marketerDash.viewReport('${esc(c.id)}')"
              aria-label="${tt("mkViewReport", "Lihat")}">
              ${tt("mkViewReport", "Lihat")}
            </button>
          </td>
        </tr>`;
      })
      .join("");
  }

  function renderActivityTable() {
    const tbody = document.getElementById("activityTableBody");
    if (!tbody) return;

    // Show last 10 claims as activity
    const recent = claims.slice(0, 10);

    if (recent.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="5">
          <div class="mk-empty">
            <span class="mk-empty-icon">&#128237;</span>
            <p>${tt("mkNoActivity", "Belum ada aktivitas tercatat.")}</p>
          </div>
        </td></tr>`;
      return;
    }

    tbody.innerHTML = recent
      .map((c) => {
        const school = c.marketer_schools;
        const dateStr = c.presentation_date
          ? new Date(c.presentation_date).toLocaleDateString("id-ID")
          : "-";
        const statusClass =
          { paid: "paid", pending: "pending", rejected: "rejected" }[
            c.status
          ] || "pending";
        const statusLabel =
          {
            paid: tt("mkStatusPaid", "Dibayar"),
            pending: tt("mkStatusPending", "Menunggu"),
            rejected: tt("mkStatusRejected", "Ditolak"),
          }[c.status] || c.status;

        return `
        <tr>
          <td>${dateStr}</td>
          <td>${esc(school?.name || "-")}</td>
          <td>${tt("mkCommClaim", "Klaim Komisi")}</td>
          <td><strong>${fmt(c.total_commission)}</strong></td>
          <td><span class="mk-badge ${statusClass}">${esc(statusLabel)}</span></td>
        </tr>`;
      })
      .join("");
  }

  function updateStats() {
    const totalEarnings = claims
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + (c.total_commission || 0), 0);

    const pending = claims
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + (c.total_commission || 0), 0);

    const enrolled = claims.reduce(
      (sum, c) => sum + (c.students_enrolled || 0),
      0,
    );

    const statTE = document.getElementById("statTotalEarnings");
    const statPE = document.getElementById("statPending");
    const statEN = document.getElementById("statEnrolled");
    const statSC = document.getElementById("statSchools");

    if (statTE) statTE.textContent = fmt(totalEarnings);
    if (statPE) statPE.textContent = fmt(pending);
    if (statEN) statEN.textContent = enrolled;
    if (statSC) statSC.textContent = schools.length;
  }

  function updateCounters() {
    // update overview stat schools
    const statSC = document.getElementById("statSchools");
    if (statSC) statSC.textContent = schools.length;
  }

  /* View individual report detail */
  function viewReport(id) {
    const claim = claims.find((c) => c.id === id);
    if (!claim) return;

    const school = claim.marketer_schools;

    // Populate detail view
    const set = (elId, val) => {
      const el = document.getElementById(elId);
      if (el) el.textContent = val;
    };

    set("detailRefId", claim.ref_id || claim.id?.slice(0, 8));
    set(
      "detailDate",
      claim.presentation_date
        ? new Date(claim.presentation_date).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "-",
    );
    set("detailMarketer", marketerProfile?.full_name || "-");
    set("detailSchool", school?.name || "-");
    set(
      "detailPresDate",
      claim.presentation_date
        ? new Date(claim.presentation_date).toLocaleDateString("id-ID")
        : "-",
    );
    set(
      "detailStudents",
      `${claim.students_present || 0} / ${claim.students_enrolled || 0}`,
    );
    set("detailAccessFee", fmt(claim.access_fee));
    set("detailEnrollComm", fmt(claim.enrollment_comm));
    set("detailBonus", fmt(claim.bonus));
    set("detailTotal", fmt(claim.total_commission));

    const formulaEl = document.getElementById("detailEnrollFormula");
    if (formulaEl)
      formulaEl.textContent = `10% x ${fmt(claim.program_fee)} x ${claim.students_enrolled} siswa`;

    const statusPill = document.getElementById("detailStatusPill");
    if (statusPill) {
      statusPill.className = `mk-status-pill ${claim.status === "paid" ? "paid" : ""}`;
      statusPill.textContent =
        {
          paid: tt("mkStatusPaid", "Dibayar"),
          pending: tt("mkStatusPending", "Menunggu Verifikasi"),
          rejected: tt("mkStatusRejected", "Ditolak"),
        }[claim.status] || claim.status;
    }

    const notesEl = document.getElementById("detailNotes");
    if (notesEl) {
      notesEl.textContent = claim.notes
        ? `${tt("mkDetailNotes", "Catatan")}: ${claim.notes}`
        : "";
    }

    // Show detail, hide list
    document.getElementById("reportsList").style.display = "none";
    document.getElementById("reportDetail").style.display = "block";
  }

  function showReportsList() {
    const listEl = document.getElementById("reportsList");
    const detailEl = document.getElementById("reportDetail");
    if (listEl) listEl.style.display = "block";
    if (detailEl) detailEl.style.display = "none";
  }

  function initReports() {
    const backBtn = document.getElementById("backToReports");
    if (backBtn) backBtn.addEventListener("click", showReportsList);
  }

  /* 7. Init */
     7.  INIT

  async function init() {
    initTabs();
    initMobileNav();
    initSchoolForm();
    initClaimForm();
    initReports();

    await loadProfile();
    await loadSchools();
    await loadClaims();
  }

  // Guard.js sets up auth - run after DOMContentLoaded
  document.addEventListener("DOMContentLoaded", init);

  /* Expose public API (for inline onclick handlers) */
  window.marketerDash = {
    editSchool,
    viewReport,
  };
})();
