(function () {
  /* ============================================================
     REDLINE ACADEMY — AUTH MODULE
     Mendukung role: student | admin | trainer | marketer
     Staff adalah alias staging-only untuk marketer.

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
    if (error || !data?.session) return null;

    const session = data.session;
    if (isSessionExpired(session)) {
      await invalidateSession(supabase);
      return null;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      if (shouldInvalidateSession(userError?.message)) {
        await invalidateSession(supabase);
      }
      return null;
    }

    if (session.user?.id && userData.user.id !== session.user.id) {
      await invalidateSession(supabase);
      return null;
    }

    return userData.user;
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

  function isSessionExpired(session) {
    if (!session) return false;
    const expiresAt = Number(session.expires_at);
    if (!Number.isFinite(expiresAt) || expiresAt <= 0) return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return expiresAt <= nowSeconds;
  }

  function shouldInvalidateSession(errorMessage) {
    const message = String(errorMessage || "");
    return /invalid|expired|jwt|session missing|refresh token|unauthorized|not authenticated/i.test(
      message
    );
  }

  async function invalidateSession(supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Best-effort cleanup. Route guards will still redirect on null session.
    }
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
      const supabaseUrl = window.lmsConfig?.supabaseUrl;
      const supabaseAnonKey = window.lmsConfig?.supabaseAnonKey;

      if (!supabaseUrl || !supabaseAnonKey) {
        return {
          ok: false,
          error: tt("lmsErrLoginFailed", "Login gagal."),
        };
      }

      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const tokenData = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          ok: false,
          error:
            tokenData.error_description ||
            tokenData.msg ||
            tokenData.message ||
            tt("lmsErrInvalidCredentials", "Email atau password tidak valid."),
        };
      }

      if (!tokenData.user?.id || !tokenData.access_token || !tokenData.refresh_token) {
        return {
          ok: false,
          error: tt(
            "lmsErrInvalidCredentials",
            "Email atau password tidak valid."
          ),
        };
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
      });

      if (sessionError) {
        return {
          ok: false,
          error: sessionError.message || tt("lmsErrLoginFailed", "Login gagal."),
        };
      }

      const profileRes = await getProfile(tokenData.user.id);
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
