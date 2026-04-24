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
  const AUTH_REQUEST_TIMEOUT_MS = 15000;

  const tt = (key, fallback) => (typeof t === "function" ? t(key) : fallback);

  async function waitForSupabaseClient(timeoutMs = 12000) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      if (window.lmsSupabase) {
        return window.lmsSupabase;
      }

      if (window.__lmsSupabaseInitError__) {
        throw window.__lmsSupabaseInitError__;
      }

      if (window.__lmsSupabaseReady__) {
        return window.__lmsSupabaseReady__;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }

    throw new Error("Client Supabase tidak tersedia.");
  }

  async function getClient() {
    const client = await waitForSupabaseClient();
    if (!client) {
      throw new Error("Client Supabase tidak tersedia.");
    }
    return client;
  }

  async function getSessionUser() {
    const supabase = await getClient();
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
    const supabase = await getClient();
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

  function createTimeoutPromise(timeoutMs, message) {
    let timerId = null;
    const promise = new Promise((_, reject) => {
      timerId = window.setTimeout(() => {
        reject(new Error(message));
      }, timeoutMs);
    });

    return {
      promise,
      clear() {
        if (timerId !== null) {
          window.clearTimeout(timerId);
          timerId = null;
        }
      },
    };
  }

  async function runWithTimeout(taskFactory, timeoutMs, timeoutMessage) {
    const timeout = createTimeoutPromise(timeoutMs, timeoutMessage);

    try {
      return await Promise.race([Promise.resolve().then(taskFactory), timeout.promise]);
    } finally {
      timeout.clear();
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
      const supabase = await getClient();
      const supabaseUrl = window.lmsConfig?.supabaseUrl;
      const supabaseAnonKey = window.lmsConfig?.supabaseAnonKey;

      if (!supabaseUrl || !supabaseAnonKey) {
        return {
          ok: false,
          error: tt("lmsErrLoginFailed", "Login gagal."),
        };
      }

      const fetchController = typeof AbortController === "function" ? new AbortController() : null;
      const fetchTimeout = window.setTimeout(() => {
        if (fetchController) {
          fetchController.abort();
        }
      }, AUTH_REQUEST_TIMEOUT_MS);

      let response;
      try {
        response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
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
          signal: fetchController ? fetchController.signal : undefined,
        });
      } catch (error) {
        if (error && error.name === "AbortError") {
          return {
            ok: false,
            error: tt("lmsErrLoginFailed", "Login gagal.") + " Request timed out.",
          };
        }
        throw error;
      } finally {
        window.clearTimeout(fetchTimeout);
      }

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

      const { error: sessionError } = await runWithTimeout(
        () =>
          supabase.auth.setSession({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
          }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Pengaturan sesi login melebihi batas waktu."
      );

      if (sessionError) {
        return {
          ok: false,
          error: sessionError.message || tt("lmsErrLoginFailed", "Login gagal."),
        };
      }

      const profileRes = await runWithTimeout(
        () => getProfile(tokenData.user.id),
        AUTH_REQUEST_TIMEOUT_MS,
        "Pengambilan profil melebihi batas waktu."
      );
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

      const result = {
        ok: true,
        role,
        redirectTo: getDashboardRouteByRole(role),
      };
      return result;
    } catch (err) {
      console.error("[SIGNIN] unexpected error", err);
      return {
        ok: false,
        error: err.message || tt("lmsErrLoginFailed", "Login gagal."),
      };
    }
  }

  async function signOut() {
    const supabase = await getClient();
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
