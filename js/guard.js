(function () {
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
    const expectedRole = document.body.dataset.lmsRole;
    if (!expectedRole) {
      return;
    }

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
    if (profile.role !== expectedRole) {
      const target = window.lmsAuth.getDashboardRouteByRole(profile.role);
      window.location.replace(target);
      return;
    }

    if (expectedRole === "student") {
      const nameEl = document.getElementById("studentName");
      const idEl = document.getElementById("studentId");
      const emailEl = document.getElementById("studentEmail");

      nameEl.textContent = profile.full_name || "-";
      idEl.textContent = profile.student_id || "-";
      emailEl.textContent = profile.email || user.email || "-";
    }

    if (expectedRole === "admin") {
      const nameEl = document.getElementById("adminName");
      const idEl = document.getElementById("adminId");
      const emailEl = document.getElementById("adminEmail");

      nameEl.textContent = profile.full_name || "-";
      idEl.textContent = profile.admin_id || "-";
      emailEl.textContent = profile.email || user.email || "-";

      const { data, error } = await window.lmsSupabase
        .from("profiles")
        .select("full_name, student_id, email")
        .eq("role", "student")
        .order("full_name", { ascending: true });

      const tableBody = document.getElementById("studentTableBody");
      if (error) {
        tableBody.innerHTML = `<tr><td colspan="3">${tt("lmsErrLoadStudents", "Gagal memuat data student.")}</td></tr>`;
      } else if (!data || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3">${tt("lmsNoStudents", "Belum ada student.")}</td></tr>`;
      } else {
        tableBody.innerHTML = data
          .map((item) => {
            return `<tr><td>${escapeHtml(item.full_name || "-")}</td><td>${escapeHtml(item.student_id || "-")}</td><td>${escapeHtml(item.email || "-")}</td></tr>`;
          })
          .join("");
      }
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        window.lmsAuth.signOut();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", loadDashboard);
})();
