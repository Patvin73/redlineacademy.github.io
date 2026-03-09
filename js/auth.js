(function () {
  /* ============================================================
     REDLINE ACADEMY — AUTH MODULE
     Mendukung role: student | admin | trainer | marketer | staff

     CATATAN: getProfile() hanya memilih kolom yang ada di schema
     default. Kolom opsional (marketer_id, dll.) hanya tersedia
     setelah menjalankan SUPABASE_MARKETER_SETUP.sql — jangan
     tambahkan ke query ini sebelum migrasi dijalankan.
  ============================================================ */

  const roleRoutes = {
    student:  "./dashboard-student.html",
    admin:    "./dashboard-admin.html",
    trainer:  "./dashboard-admin.html",
    marketer: "./dashboard-marketer.html",
    staff:    "./dashboard-marketer.html",
  };

  const tt = (key, fallback) => (typeof t === "function" ? t(key) : fallback);

  function getClient() {
    if (!window.lmsSupabase) {
      throw new Error("Client Supabase tidak tersedia.");
    }
    return window.lmsSupabase;
  }

  async function getSessionUser() {
    const supabase = getClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session ? data.session.user : null;
  }

  /**
   * getProfile — ambil profil dari tabel profiles.
   * Hanya kolom yang sudah ada di schema default yang di-select.
   */
  async function getProfile(userId) {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, student_id, admin_id, email")
      .eq("id", userId)
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, profile: data };
  }

  function getDashboardRouteByRole(role) {
    return roleRoutes[role] || "./login.html";
  }

  /**
   * signIn — masuk dengan email + password.
   * @param {string}        email
   * @param {string}        password
   * @param {string[]|null} allowedRoles  Batasi role yang boleh login
   *   lewat form ini. null/undefined = semua role diterima
   *   (backwards-compatible dengan kode lama).
   */
  async function signIn(email, password, allowedRoles) {
    try {
      const supabase = getClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          ok: false,
          error:
            error.message ||
            tt("lmsErrInvalidCredentials", "Email atau password tidak valid."),
        };
      }
      if (!data.user) {
        return {
          ok: false,
          error: tt(
            "lmsErrInvalidCredentials",
            "Email atau password tidak valid."
          ),
        };
      }

      const profileRes = await getProfile(data.user.id);
      if (!profileRes.ok) {
        return {
          ok: false,
          error:
            profileRes.error ||
            tt("lmsErrProfileNotFound", "Profil tidak ditemukan."),
        };
      }

      const role = profileRes.profile.role;

      // Validasi role terhadap allowedRoles jika diberikan
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(role)) {
          // Sign out agar sesi tidak tersimpan untuk portal yang salah
          await supabase.auth.signOut();
          return {
            ok: false,
            error: tt(
              "lmsErrWrongRoleForPortal",
              "Akun ini tidak memiliki akses ke portal ini. Gunakan form login yang sesuai."
            ),
          };
        }
      }

      return {
        ok: true,
        redirectTo: getDashboardRouteByRole(role),
      };
    } catch (err) {
      return {
        ok: false,
        error: err.message || tt("lmsErrLoginFailed", "Login gagal."),
      };
    }
  }

  async function signOut() {
    const supabase = getClient();
    await supabase.auth.signOut();
    window.location.replace("./login.html");
  }

  async function redirectIfLoggedIn() {
    const user = await getSessionUser();
    if (!user) return;

    const profileRes = await getProfile(user.id);
    if (!profileRes.ok) return;

    const target = getDashboardRouteByRole(profileRes.profile.role);
    const currentPage = window.location.pathname.split("/").pop() || "";
    if (target.endsWith(currentPage)) return;

    window.location.replace(target);
  }

  window.lmsAuth = {
    getSessionUser,
    getProfile,
    signIn,
    signOut,
    redirectIfLoggedIn,
    getDashboardRouteByRole,
  };
})();
