const { randomUUID } = require("crypto");

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
  staff: {
    email: process.env.PLAYWRIGHT_LIVE_STAFF_EMAIL,
    password: process.env.PLAYWRIGHT_LIVE_STAFF_PASSWORD,
  },
};

const dashboardRoutes = {
  student: "/pages/dashboard-student.html",
  admin: "/pages/dashboard-admin.html",
  trainer: "/pages/dashboard-admin.html",
  marketer: "/pages/dashboard-marketer.html",
  staff: "/pages/dashboard-marketer.html",
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
  "PLAYWRIGHT_LIVE_STAFF_EMAIL",
  "PLAYWRIGHT_LIVE_STAFF_PASSWORD",
];

function assertLiveEnv() {
  const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);
  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required live QA env vars: ${missingEnvVars.join(", ")}`
    );
  }
}

function runKey(label) {
  return `${label}-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

async function installLiveSupabaseConfig(page) {
  await page.addInitScript((config) => {
    window.__LMS_SUPABASE_CONFIG__ = config;
  }, liveConfig);
}

async function signIn(page, role, tabSelector = "#tab-lms") {
  const user = liveUsers[role];
  if (!user) {
    throw new Error(`Unknown live role: ${role}`);
  }

  const expectedRoute = dashboardRoutes[role];
  await page.goto("/pages/login.html");
  await page.waitForLoadState("domcontentloaded");

  if (tabSelector !== "#tab-lms") {
    await page.locator(tabSelector).click();
  }

  const isLmsRole =
    role === "student" || role === "admin" || role === "trainer";
  const emailField = isLmsRole
    ? page.locator("#loginFormLMS #lms-email")
    : page.locator("#loginFormStaff #staff-email");
  const passwordField = isLmsRole
    ? page.locator("#loginFormLMS #lms-password")
    : page.locator("#loginFormStaff #staff-password");
  const submitButton = isLmsRole
    ? page.locator("#loginFormLMS button[type='submit']")
    : page.locator("#loginFormStaff button[type='submit']");

  await emailField.fill(user.email);
  await passwordField.fill(user.password);
  await Promise.all([
    page.waitForURL(`**${expectedRoute}`),
    submitButton.click(),
  ]);
}

async function openProtectedRouteWithoutAuth(page, route) {
  await page.goto(route);
  await page.waitForURL("**/pages/login.html");
}

async function getCurrentUser(page) {
  return page.evaluate(async () => {
    const { data, error } = await window.lmsSupabase.auth.getUser();
    return {
      user: data?.user || null,
      error: error?.message || null,
    };
  });
}

async function getProfileByEmail(page, email) {
  return page.evaluate(async (targetEmail) => {
    const { data, error } = await window.lmsSupabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("email", targetEmail)
      .single();

    return {
      data,
      error: error?.message || null,
    };
  }, email);
}

async function ensureCleanupQueue(page) {
  await page.evaluate(() => {
    window.__QA_LIVE_CLEANUP_QUEUE__ = Array.isArray(
      window.__QA_LIVE_CLEANUP_QUEUE__
    )
      ? window.__QA_LIVE_CLEANUP_QUEUE__
      : [];
  });
}

async function registerCleanup(page, entry) {
  await ensureCleanupQueue(page);
  await page.evaluate((item) => {
    window.__QA_LIVE_CLEANUP_QUEUE__.push(item);
  }, entry);
}

async function registerRowCleanup(page, table, rowOrId) {
  const id =
    typeof rowOrId === "string" ? rowOrId : rowOrId && rowOrId.id ? rowOrId.id : null;
  if (!id) return;
  await registerCleanup(page, { table, filters: { id } });
}

async function cleanupLiveData(page) {
  const queue = await page.evaluate(() => {
    const items = Array.isArray(window.__QA_LIVE_CLEANUP_QUEUE__)
      ? window.__QA_LIVE_CLEANUP_QUEUE__.slice()
      : [];
    window.__QA_LIVE_CLEANUP_QUEUE__ = [];
    return items;
  });

  for (const item of queue.reverse()) {
    await page.evaluate(async ({ tableName, where }) => {
      if (!window.lmsSupabase) return;

      let query = window.lmsSupabase.from(tableName).delete();
      for (const [column, value] of Object.entries(where)) {
        query = query.eq(column, value);
      }

      await query;
    }, { tableName: item.table, where: item.filters });
  }
}

async function insertRow(page, table, payload, select = "id") {
  return page.evaluate(
    async ({ tableName, row, selectClause }) => {
      const query = window.lmsSupabase.from(tableName).insert(row);
      const { data, error } = await query.select(selectClause).single();
      return {
        data,
        error: error?.message || null,
        code: error?.code || null,
      };
    },
    { tableName: table, row: payload, selectClause: select }
  );
}

async function trackedInsertRow(page, table, payload, select = "id") {
  const result = await insertRow(page, table, payload, select);
  if (result.data?.id) {
    await registerRowCleanup(page, table, result.data.id);
  }
  return result;
}

async function updateRow(page, table, updates, filters, select = "id") {
  return page.evaluate(
    async ({ tableName, patch, where, selectClause }) => {
      let query = window.lmsSupabase.from(tableName).update(patch);
      for (const [column, value] of Object.entries(where)) {
        query = query.eq(column, value);
      }
      const { data, error } = await query.select(selectClause).single();
      return {
        data,
        error: error?.message || null,
        code: error?.code || null,
      };
    },
    { tableName: table, patch: updates, where: filters, selectClause: select }
  );
}

async function deleteRow(page, table, filters, select = "id") {
  return page.evaluate(
    async ({ tableName, where, selectClause }) => {
      let query = window.lmsSupabase.from(tableName).delete();
      for (const [column, value] of Object.entries(where)) {
        query = query.eq(column, value);
      }
      const { data, error } = await query.select(selectClause).single();
      return {
        data,
        error: error?.message || null,
        code: error?.code || null,
      };
    },
    { tableName: table, where: filters, selectClause: select }
  );
}

function expectRlsDenied(result, context) {
  expect(result.error, `${context}: expected an RLS error`).toBeTruthy();
  expect(
    result.error,
    `${context}: expected an RLS-style error message`
  ).toMatch(
    /row level security|row-level security|permission denied|violates row|insufficient privilege/i
  );
}

module.exports = {
  assertLiveEnv,
  cleanupLiveData,
  dashboardRoutes,
  deleteRow,
  ensureCleanupQueue,
  expectRlsDenied,
  getCurrentUser,
  getProfileByEmail,
  installLiveSupabaseConfig,
  insertRow,
  liveConfig,
  liveUsers,
  openProtectedRouteWithoutAuth,
  registerCleanup,
  registerRowCleanup,
  runKey,
  signIn,
  trackedInsertRow,
  updateRow,
};
