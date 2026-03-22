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
};

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
  await page.addInitScript(() => {
    window.__SUPABASE_SDK_SRC__ =
      "/node_modules/@supabase/supabase-js/dist/umd/supabase.js";
  });
  await ensureStudentProvisioned(page);
}

async function ensureStudentProvisioned(page, student = liveUsers.student) {
  const authResponse = await page.request.post(
    `${liveConfig.supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      headers: {
        "Content-Type": "application/json",
        apikey: liveConfig.supabaseAnonKey,
        Authorization: `Bearer ${liveConfig.supabaseAnonKey}`,
      },
      data: {
        email: liveUsers.admin.email,
        password: liveUsers.admin.password,
      },
    }
  );

  const authBody = await authResponse.json().catch(() => ({}));
  const accessToken = authBody?.access_token;
  if (!authResponse.ok() || !accessToken) {
    throw new Error(
      `Unable to sign in as admin for provisioning: ${
        authBody?.error_description ||
        authBody?.message ||
        authBody?.msg ||
        `status ${authResponse.status()}`
      }`
    );
  }

  const createResponse = await page.request.post(
    `${liveConfig.supabaseUrl}/functions/v1/admin-create-user`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        apikey: liveConfig.supabaseAnonKey,
      },
      data: {
        full_name: "Student",
        email: student.email,
        role: "student",
        password: student.password,
      },
    }
  );

  const createBody = await createResponse.json().catch(() => ({}));
  if (!(createResponse.ok() || createResponse.status() === 409)) {
    throw new Error(
      `Unable to provision live student account (${createResponse.status()}): ${
        createBody.error || createBody.message || createBody.detail || "no response body"
      }`
    );
  }

  const profileResponse = await page.request.get(
    `${liveConfig.supabaseUrl}/rest/v1/profiles?select=id,role,email,full_name&email=eq.${encodeURIComponent(
      student.email
    )}`,
    {
      headers: {
        apikey: liveConfig.supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const profileData = await profileResponse.json().catch(() => []);
  const profile = Array.isArray(profileData) ? profileData[0] : null;

  if (!profile) {
    throw new Error(
      `Student auth user exists but profile row was not found for ${student.email}`
    );
  }

  if (profile.role !== "student") {
    const updateResponse = await page.request.patch(
      `${liveConfig.supabaseUrl}/rest/v1/profiles?id=eq.${profile.id}`,
      {
        headers: {
          "Content-Type": "application/json",
          apikey: liveConfig.supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          Prefer: "return=representation",
        },
        data: {
          role: "student",
          full_name: "Student",
          email: student.email,
        },
      }
    );

    if (!updateResponse.ok()) {
      const updateBody = await updateResponse.json().catch(() => ({}));
      throw new Error(
        `Unable to normalize student profile role (${updateResponse.status()}): ${
          updateBody.error || updateBody.message || updateBody.detail || "no response body"
        }`
      );
    }
  }
}

async function signIn(page, role, tabSelector = "#tab-lms") {
  const user = liveUsers[role];
  if (!user) {
    throw new Error(`Unknown live role: ${role}`);
  }

  const expectedRoute = dashboardRoutes[role];
  await page.goto("/pages/login.html", { waitUntil: "domcontentloaded" });

  if (tabSelector !== "#tab-lms") {
    await page.locator(tabSelector).click();
  }

  const emailField = page.locator("#loginFormLMS #lms-email");
  const passwordField = page.locator("#loginFormLMS #lms-password");
  const submitButton = page.locator("#loginFormLMS button[type='submit']");

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

async function findLiveQaLeftovers(page, { sinceIso, referenceIds = {} }) {
  return page.evaluate(
    async ({ sinceIso: since, referenceIds: refs }) => {
      const queryRows = async (table, columns) => {
        const { data, error } = await window.lmsSupabase
          .from(table)
          .select(columns)
          .gte("created_at", since)
          .order("created_at", { ascending: true });

        if (error) {
          throw new Error(`${table}: ${error.message}`);
        }

        return Array.isArray(data) ? data : [];
      };

      const qaText = (value) =>
        typeof value === "string" &&
        /^(qa[\s._-]|live submission from qa|live qa)/i.test(value.trim());

      const qaRow = (...fields) => fields.some(qaText);
      const leftovers = [];
      const add = (table, row, reason) => {
        leftovers.push({
          table,
          id: row.id ?? null,
          reason,
        });
      };

      const tables = {
        profiles: await queryRows(
          "profiles",
          "id, created_at, full_name, role, student_id, admin_id, email"
        ),
        courses: await queryRows(
          "courses",
          "id, created_at, title, slug, trainer_id"
        ),
        enrollments: await queryRows(
          "enrollments",
          "id, created_at, student_id, course_id, status"
        ),
        payments: await queryRows(
          "payments",
          "id, created_at, student_id, course_id, status, amount, currency"
        ),
        course_progress: await queryRows(
          "course_progress",
          "id, created_at, student_id, course_id, completion_percent"
        ),
        assignments: await queryRows(
          "assignments",
          "id, created_at, title, course_id, trainer_id"
        ),
        assignment_submissions: await queryRows(
          "assignment_submissions",
          "id, created_at, assignment_id, student_id, status, notes, file_urls"
        ),
        marketer_schools: await queryRows(
          "marketer_schools",
          "id, created_at, marketer_id, name, city"
        ),
        marketer_claims: await queryRows(
          "marketer_claims",
          "id, created_at, marketer_id, school_id, ref_id, status, notes"
        ),
      };

      const qaProfiles = tables.profiles.filter((row) =>
        qaRow(row.full_name, row.email, row.student_id, row.admin_id)
      );
      const qaCourses = tables.courses.filter((row) => qaRow(row.title, row.slug));
      const qaAssignments = tables.assignments.filter((row) =>
        qaRow(row.title)
      );
      const qaSchools = tables.marketer_schools.filter((row) =>
        qaRow(row.name)
      );
      const qaClaims = tables.marketer_claims.filter((row) =>
        qaRow(row.ref_id, row.notes)
      );
      const qaSubmissions = tables.assignment_submissions.filter((row) =>
        qaRow(
          row.notes,
          ...(Array.isArray(row.file_urls) ? row.file_urls : [])
        )
      );

      qaProfiles.forEach((row) => add("profiles", row, "QA-tagged profile data"));
      qaCourses.forEach((row) => add("courses", row, "QA-tagged course data"));
      qaAssignments.forEach((row) =>
        add("assignments", row, "QA-tagged assignment data")
      );
      qaSchools.forEach((row) =>
        add("marketer_schools", row, "QA-tagged marketer school data")
      );
      qaClaims.forEach((row) =>
        add("marketer_claims", row, "QA-tagged marketer claim data")
      );
      qaSubmissions.forEach((row) =>
        add("assignment_submissions", row, "QA-tagged submission data")
      );

      const profileIds = new Set(
        [
          refs.studentId,
          refs.adminId,
          refs.trainerId,
          refs.marketerId,
      ...qaProfiles.map((row) => row.id),
        ].filter(Boolean)
      );
      const courseIds = new Set(qaCourses.map((row) => row.id));
      const assignmentIds = new Set(qaAssignments.map((row) => row.id));
      const schoolIds = new Set(qaSchools.map((row) => row.id));

      tables.enrollments
        .filter(
          (row) => profileIds.has(row.student_id) || courseIds.has(row.course_id)
        )
        .forEach((row) =>
          add(
            "enrollments",
            row,
            "Enrollment tied to a QA live user or QA course"
          )
        );

      tables.payments
        .filter(
          (row) => profileIds.has(row.student_id) || courseIds.has(row.course_id)
        )
        .forEach((row) =>
          add(
            "payments",
            row,
            "Payment tied to a QA live user or QA course"
          )
        );

      tables.course_progress
        .filter(
          (row) => profileIds.has(row.student_id) || courseIds.has(row.course_id)
        )
        .forEach((row) =>
          add(
            "course_progress",
            row,
            "Course progress tied to a QA live user or QA course"
          )
        );

      tables.assignment_submissions
        .filter(
          (row) =>
            profileIds.has(row.student_id) || assignmentIds.has(row.assignment_id)
        )
        .forEach((row) =>
          add(
            "assignment_submissions",
            row,
            "Submission tied to a QA live user or QA assignment"
          )
        );

      if (schoolIds.size > 0) {
        tables.marketer_claims
          .filter((row) => schoolIds.has(row.school_id))
          .forEach((row) =>
            add(
              "marketer_claims",
              row,
              "Claim tied to a QA live school"
            )
          );
      }

      return leftovers;
    },
    { sinceIso, referenceIds }
  );
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
  findLiveQaLeftovers,
  ensureStudentProvisioned,
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
