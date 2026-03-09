(function () {
  /* ============================================================
     REDLINE ACADEMY — GUARD MODULE
     Melindungi halaman dashboard dari akses tidak sah.
     Mendukung role: student | admin | trainer | marketer | staff
  ============================================================ */

  const tt = (key, fallback) =>
    typeof t === "function" ? t(key) : fallback;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  async function loadDashboard() {
    const expectedRoleRaw = document.body.dataset.lmsRole;
    if (!expectedRoleRaw) return;

    const allowedRoles = expectedRoleRaw
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    const user = await window.lmsAuth.getSessionUser();
    if (!user) {
      window.location.replace("./login.html");
      return;
    }

    const profileRes = await window.lmsAuth.getProfile(user.id);
    if (!profileRes.ok) {
      window.location.replace("./login.html");
      return;
    }

    const profile = profileRes.profile;

    if (!allowedRoles.includes(profile.role)) {
      const target = window.lmsAuth.getDashboardRouteByRole(profile.role);
      const currentPage = window.location.pathname.split("/").pop() || "";
      if (target.endsWith(currentPage)) return;
      window.location.replace(target);
      return;
    }

    // ── Role classes on body ──
    document.body.classList.toggle("is-admin",    profile.role === "admin");
    document.body.classList.toggle("is-trainer",  profile.role === "trainer");
    document.body.classList.toggle("is-student",  profile.role === "student");
    document.body.classList.toggle("is-marketer", profile.role === "marketer");
    document.body.classList.toggle("is-staff",    profile.role === "staff");

    // ── STUDENT dashboard ──
    if (profile.role === "student") {
      const nameEl  = document.getElementById("studentName");
      const idEl    = document.getElementById("studentId");
      const emailEl = document.getElementById("studentEmail");

      if (nameEl)  nameEl.textContent  = profile.full_name  || "-";
      if (idEl)    idEl.textContent    = profile.student_id || "-";
      if (emailEl) emailEl.textContent = profile.email || user.email || "-";
    }

    // ── ADMIN / TRAINER dashboard ──
    if (profile.role === "admin" || profile.role === "trainer") {
      const nameEl  = document.getElementById("adminName");
      const idEl    = document.getElementById("adminId");
      const emailEl = document.getElementById("adminEmail");

      if (nameEl)  nameEl.textContent  = profile.full_name || "-";
      if (idEl)    idEl.textContent    = profile.admin_id  || "-";
      if (emailEl) emailEl.textContent = profile.email || user.email || "-";

      if (profile.role === "admin") {
        const { data, error } = await window.lmsSupabase
          .from("profiles")
          .select("full_name, student_id, email")
          .eq("role", "student")
          .order("full_name", { ascending: true });

        const tableBody = document.getElementById("studentTableBody");
        if (tableBody) {
          if (error) {
            tableBody.innerHTML = `<tr><td colspan="3">${tt(
              "lmsErrLoadStudents", "Gagal memuat data student."
            )}</td></tr>`;
          } else if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3">${tt(
              "lmsNoStudents", "Belum ada student."
            )}</td></tr>`;
          } else {
            tableBody.innerHTML = data
              .map((item) =>
                `<tr>
                  <td>${escapeHtml(item.full_name  || "-")}</td>
                  <td>${escapeHtml(item.student_id || "-")}</td>
                  <td>${escapeHtml(item.email      || "-")}</td>
                </tr>`
              )
              .join("");
          }
        }
      }
    }

    // ── MARKETER / STAFF dashboard ──
    // Profile population is handled by dashboard-marketer.js
    // Guard only verifies role; the JS module does the rest.

    // ── Shared: logout button ──
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        window.lmsAuth.signOut();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", loadDashboard);
})();
