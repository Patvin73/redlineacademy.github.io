(function () {
  const roleRoutes = {
    student: "./dashboard-student.html",
    admin: "./dashboard-admin.html",
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
    if (error) {
      return null;
    }
    return data.session ? data.session.user : null;
  }

  async function getProfile(userId) {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, student_id, admin_id, email")
      .eq("id", userId)
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, profile: data };
  }

  function getDashboardRouteByRole(role) {
    return roleRoutes[role] || "./login.html";
  }

  async function signIn(email, password) {
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
            "Email atau password tidak valid.",
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

      return {
        ok: true,
        redirectTo: getDashboardRouteByRole(profileRes.profile.role),
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || tt("lmsErrLoginFailed", "Login gagal."),
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
    if (!user) {
      return;
    }

    const profileRes = await getProfile(user.id);
    if (!profileRes.ok) {
      return;
    }

    const target = getDashboardRouteByRole(profileRes.profile.role);
    const currentPage = window.location.pathname.split("/").pop() || "";
    if (target.endsWith(currentPage)) {
      return;
    }

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
