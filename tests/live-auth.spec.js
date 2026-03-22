const { test, expect } = require("@playwright/test");
const { ensureStudentProvisioned } = require("./support/live-qa");

const liveConfig = {
  supabaseUrl: process.env.PLAYWRIGHT_LIVE_SUPABASE_URL,
  supabaseAnonKey: process.env.PLAYWRIGHT_LIVE_SUPABASE_ANON_KEY,
};

const liveUsers = {
  student: {
    email: process.env.PLAYWRIGHT_LIVE_STUDENT_EMAIL,
    password: process.env.PLAYWRIGHT_LIVE_STUDENT_PASSWORD,
  },
  admin: {
    email: process.env.PLAYWRIGHT_LIVE_ADMIN_EMAIL,
    password: process.env.PLAYWRIGHT_LIVE_ADMIN_PASSWORD,
  },
  trainer: {
    email: process.env.PLAYWRIGHT_LIVE_TRAINER_EMAIL,
    password: process.env.PLAYWRIGHT_LIVE_TRAINER_PASSWORD,
  },
  marketer: {
    email: process.env.PLAYWRIGHT_LIVE_MARKETER_EMAIL,
    password: process.env.PLAYWRIGHT_LIVE_MARKETER_PASSWORD,
  },
};

const studentRunToken = `${Date.now().toString(36)}${Math.random()
  .toString(36)
  .slice(2, 8)}`;
liveUsers.student.email = `student.${studentRunToken}@example.com`;

const dashboardRoutes = {
  student: "/pages/dashboard-student.html",
  admin: "/pages/dashboard-admin.html",
  trainer: "/pages/dashboard-admin.html",
  marketer: "/pages/dashboard-marketer.html",
};

const requiredEnvVars = [
  "PLAYWRIGHT_LIVE_SUPABASE_URL",
  "PLAYWRIGHT_LIVE_SUPABASE_ANON_KEY",
  "PLAYWRIGHT_LIVE_STUDENT_EMAIL",
  "PLAYWRIGHT_LIVE_STUDENT_PASSWORD",
  "PLAYWRIGHT_LIVE_ADMIN_EMAIL",
  "PLAYWRIGHT_LIVE_ADMIN_PASSWORD",
  "PLAYWRIGHT_LIVE_TRAINER_EMAIL",
  "PLAYWRIGHT_LIVE_TRAINER_PASSWORD",
  "PLAYWRIGHT_LIVE_MARKETER_EMAIL",
  "PLAYWRIGHT_LIVE_MARKETER_PASSWORD",
];

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);
let liveStudentProvisionPromise = null;

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required live QA env vars: ${missingEnvVars.join(", ")}`
  );
}

async function installLiveSupabaseConfig(page) {
  await page.addInitScript((config) => {
    window.__LMS_SUPABASE_CONFIG__ = config;
  }, liveConfig);
  if (!liveStudentProvisionPromise) {
    liveStudentProvisionPromise = ensureStudentProvisioned(page, liveUsers.student).catch((err) => {
      liveStudentProvisionPromise = null;
      throw err;
    });
  }
  await liveStudentProvisionPromise;
}

async function signIn(page, role, tabSelector = "#tab-lms") {
  const user = liveUsers[role];
  const expectedRoute = dashboardRoutes[role];

  await page.context().clearCookies();
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
  }).catch(() => {});

  if (role === "student") {
    liveStudentProvisionPromise = null;
    await ensureStudentProvisioned(page, liveUsers.student);
  }

  await page.goto("/pages/login.html", { waitUntil: "domcontentloaded" });

  if (tabSelector !== "#tab-lms") {
    await page.locator(tabSelector).click();
  }

  const emailField =
    role === "student" || role === "admin" || role === "trainer"
      ? page.locator("#loginFormLMS #lms-email")
      : page.locator("#loginFormStaff #staff-email");
  const passwordField =
    role === "student" || role === "admin" || role === "trainer"
      ? page.locator("#loginFormLMS #lms-password")
      : page.locator("#loginFormStaff #staff-password");
  const submitButton =
    role === "student" || role === "admin" || role === "trainer"
      ? page.locator("#loginFormLMS button[type='submit']")
      : page.locator("#loginFormStaff button[type='submit']");

  await emailField.fill(user.email);
  await passwordField.fill(user.password);
  await Promise.all([
    page.waitForURL(`**${expectedRoute}`, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    }),
    submitButton.click(),
  ]);
}

async function openProtectedRouteWithoutAuth(page, route) {
  await page.goto(route);
  await page.waitForURL("**/pages/login.html");
}

test.describe("Live Supabase auth and RBAC", {
  tag: ["@critical", "@auth", "@rbac", "@supabase"]
}, () => {
  test.setTimeout(120000);

  test.beforeEach(() => {
    const runToken = `${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    liveUsers.student.email = `student.${runToken}@example.com`;
    liveStudentProvisionPromise = null;
  });

  test("student can log in, see profile data, and log out", async ({ page }) => {
    await installLiveSupabaseConfig(page);
    await signIn(page, "student");

    await expect(page.locator("#studentName")).not.toHaveText("-");
    await expect(page.locator("#studentEmail")).not.toHaveText("-");

    await page.evaluate(async () => {
      await window.lmsAuth.signOut();
    });
    await page.waitForURL("**/pages/login.html", {
      waitUntil: "domcontentloaded",
    });
  });

  test("student is redirected away from the admin dashboard", async ({
    page,
  }) => {
    await installLiveSupabaseConfig(page);
    await signIn(page, "student");

    await page.goto("/pages/dashboard-admin.html");
    await page.waitForURL("**/pages/dashboard-student.html");
  });

  test("admin can log in and reach the admin dashboard", async ({ page }) => {
    await installLiveSupabaseConfig(page);
    await signIn(page, "admin");

    await expect(page.locator("#adminName")).not.toHaveText("-");
    await expect(page.locator("#adminEmail")).not.toHaveText("-");
  });

  test("trainer can log in and land on the admin dashboard shell", async ({
    page,
  }) => {
    await installLiveSupabaseConfig(page);
    await signIn(page, "trainer");

    await expect(page.locator("#adminName")).not.toHaveText("-");
  });

  test("marketer role reaches the marketer portal", async ({ page }) => {
    await installLiveSupabaseConfig(page);
    await signIn(page, "marketer", "#tab-staff");

    await expect(page.locator("#marketerName")).not.toHaveText("-", { timeout: 60000 });
    await expect(page.locator("#marketerRole")).toContainText("Marketer");
  });

  test("protected routes redirect unauthenticated visitors to login", async ({
    page,
  }) => {
    await openProtectedRouteWithoutAuth(page, "/pages/dashboard-student.html");
    await openProtectedRouteWithoutAuth(page, "/pages/dashboard-admin.html");
    await openProtectedRouteWithoutAuth(page, "/pages/dashboard-marketer.html");
  });

  test("student cannot escalate their profile role through the live client", async ({
    page,
  }) => {
    await installLiveSupabaseConfig(page);
    await signIn(page, "student");

    const attempt = await page.evaluate(async () => {
      const { data: userData, error: userError } =
        await window.lmsSupabase.auth.getUser();
      if (userError || !userData?.user) {
        return {
          error: userError?.message || "Unable to resolve current user.",
          currentRole: null,
        };
      }

      const userId = userData.user.id;
      const updateResult = await window.lmsSupabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userId)
        .select("id, role")
        .single();

      const rereadResult = await window.lmsSupabase
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .single();

      return {
        updateError: updateResult.error?.message || null,
        currentRole: rereadResult.data?.role || null,
      };
    });

    expect(attempt.currentRole).toBe("student");
    expect(
      attempt.updateError,
      "Role escalation must be blocked by Supabase RLS / trigger guards."
    ).toBeTruthy();
  });

  test("student cannot read admin profiles through RLS", async ({ page }) => {
    await installLiveSupabaseConfig(page);
    await signIn(page, "student");

    const result = await page.evaluate(async () => {
      const response = await window.lmsSupabase
        .from("profiles")
        .select("id, role")
        .eq("role", "admin");

      return {
        error: response.error?.message || null,
        rowCount: Array.isArray(response.data) ? response.data.length : 0,
      };
    });

    expect(result.rowCount).toBe(0);
    expect(result.error).toBeNull();
  });
});
