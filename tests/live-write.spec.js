const { test, expect } = require("@playwright/test");

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

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required live QA env vars: ${missingEnvVars.join(", ")}`
  );
}

function runKey(label) {
  return `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const cleanupQueue = [];

function trackCleanup(tableName, filters) {
  cleanupQueue.push({ tableName, filters });
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

  const expectedRoute =
    role === "student"
      ? "/pages/dashboard-student.html"
      : role === "marketer" || role === "staff"
      ? "/pages/dashboard-marketer.html"
      : "/pages/dashboard-admin.html";

  await page.goto("/pages/login.html");
  await page.waitForLoadState("domcontentloaded");

  if (tabSelector !== "#tab-lms") {
    await page.locator(tabSelector).click();
  }

  const isLmsRole = role === "student" || role === "admin" || role === "trainer";
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

async function insertRow(page, table, payload, select = "id") {
  const result = await page.evaluate(
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

  if (result.data?.id) {
    trackCleanup(table, { id: result.data.id });
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

async function cleanupLiveData(page) {
  while (cleanupQueue.length > 0) {
    const { tableName, filters } = cleanupQueue.pop();
    await page.evaluate(
      async ({ table, where }) => {
        let query = window.lmsSupabase.from(table).delete();
        for (const [column, value] of Object.entries(where)) {
          query = query.eq(column, value);
        }
        await query;
      },
      { table: tableName, where: filters }
    );
  }
}

function expectRlsDenied(result, context) {
  expect(result.error, `${context}: expected an RLS error`).toBeTruthy();
  expect(result.error, `${context}: expected an RLS-style error message`).toMatch(
    /row level security|row-level security|permission denied|violates row|insufficient privilege/i
  );
}

test.describe.serial("Live Supabase write workflows", {
  tag: ["@critical", "@auth", "@rbac", "@lms", "@marketer", "@supabase"],
}, () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    cleanupQueue.length = 0;
    await installLiveSupabaseConfig(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupLiveData(page);
  });

  test("admin payment workflow persists enrollment and course progress", async ({ page }) => {
    await signIn(page, "admin");

    const admin = await getCurrentUser(page);
    expect(admin.error).toBeNull();
    expect(admin.user?.id).toBeTruthy();

    const student = await getProfileByEmail(page, liveUsers.student.email);
    expect(student.error).toBeNull();
    expect(student.data?.id).toBeTruthy();

    const courseTitle = `QA Live Course ${runKey("admin")}`;
    const course = await insertRow(
      page,
      "courses",
      {
        trainer_id: admin.user.id,
        title: courseTitle,
        slug: runKey("course"),
        description: "Live QA admin course",
        level: "beginner",
        enrollment_type: "paid",
        price: 199.0,
        status: "published",
      },
      "id, title, trainer_id, slug"
    );
    expect(course.error).toBeNull();
    expect(course.data?.id).toBeTruthy();

    await page.goto("/pages/dashboard-admin.html");
    await page.waitForLoadState("domcontentloaded");
    await page.locator(".ad-nav__item[data-section='enrollments']").click();
    await expect(page.locator("#section-enrollments")).toHaveClass(/active/);

    await page.locator("#recordPaymentBtn").click();
    await expect(page.locator("#recordPaymentModal")).toBeVisible();

    await page.selectOption("#paymentStudent", { value: student.data.id });
    await page.selectOption("#paymentCourse", { value: course.data.id });
    await page.fill("#paymentAmount", "199");
    await page.selectOption("#paymentCurrency", "AUD");
    await page.selectOption("#paymentPlan", "full");
    await page.selectOption("#paymentStatus", "completed");
    await page.locator("#recordPaymentSubmit").click();

    await expect(page.locator("#recordPaymentMessage")).toContainText("Payment saved.");

    const persistence = await page.evaluate(
      async ({ studentId, courseId }) => {
        const [paymentResult, enrollmentResult, progressResult] = await Promise.all([
          window.lmsSupabase
            .from("payments")
            .select("id, student_id, course_id, status, amount")
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .maybeSingle(),
          window.lmsSupabase
            .from("enrollments")
            .select("id, student_id, course_id, status")
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .maybeSingle(),
          window.lmsSupabase
            .from("course_progress")
            .select("id, student_id, course_id, completion_percent")
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .maybeSingle(),
        ]);

        return {
          payment: {
            data: paymentResult.data || null,
            error: paymentResult.error?.message || null,
          },
          enrollment: {
            data: enrollmentResult.data || null,
            error: enrollmentResult.error?.message || null,
          },
          progress: {
            data: progressResult.data || null,
            error: progressResult.error?.message || null,
          },
        };
      },
      { studentId: student.data.id, courseId: course.data.id }
    );

    expect(persistence.payment.error).toBeNull();
    expect(persistence.enrollment.error).toBeNull();
    expect(persistence.progress.error).toBeNull();
    expect(persistence.payment.data).toBeTruthy();
    expect(persistence.enrollment.data).toBeTruthy();
    expect(persistence.progress.data).toBeTruthy();
    expect(persistence.progress.data.completion_percent).toBe(0);

    trackCleanup("payments", { id: persistence.payment.data.id });
    trackCleanup("enrollments", { id: persistence.enrollment.data.id });
    trackCleanup("course_progress", { id: persistence.progress.data.id });

    const staffProgress = await updateRow(
      page,
      "course_progress",
      { completion_percent: 45, lessons_completed: 2 },
      { student_id: student.data.id, course_id: course.data.id },
      "id, completion_percent, lessons_completed"
    );
    expect(staffProgress.error).toBeNull();
    expect(staffProgress.data?.completion_percent).toBe(45);

    await signIn(page, "student");
    await page.goto("/pages/dashboard-student.html");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#courseGrid")).toContainText(courseTitle);
    await expect(page.locator("#courseGrid")).toContainText("45%");
  });

  test("student submission writes succeed and unauthorized write/delete attempts fail", async ({ page }) => {
    await signIn(page, "trainer");

    const trainer = await getCurrentUser(page);
    expect(trainer.error).toBeNull();

    const courseTitle = `QA Student Write ${runKey("course")}`;
    const course = await insertRow(
      page,
      "courses",
      {
        trainer_id: trainer.user.id,
        title: courseTitle,
        slug: runKey("student-course"),
        description: "Live QA student write course",
        level: "beginner",
        enrollment_type: "open",
        price: 0,
        status: "published",
      },
      "id, title, trainer_id"
    );
    expect(course.error).toBeNull();

    const assignment = await insertRow(
      page,
      "assignments",
      {
        course_id: course.data.id,
        trainer_id: trainer.user.id,
        title: `QA Assignment ${runKey("assignment")}`,
        pass_mark: 70,
      },
      "id, course_id, trainer_id, title"
    );
    expect(assignment.error).toBeNull();

    await signIn(page, "student");
    const student = await getCurrentUser(page);
    expect(student.error).toBeNull();

    const allowedSubmission = await insertRow(
      page,
      "assignment_submissions",
      {
        assignment_id: assignment.data.id,
        student_id: student.user.id,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        notes: "Live submission from QA",
        file_urls: ["https://example.com/live-qa-submission.pdf"],
      },
      "id, assignment_id, student_id, status"
    );
    expect(allowedSubmission.error).toBeNull();
    expect(allowedSubmission.data?.status).toBe("submitted");

    const deniedSubmissionUpdate = await updateRow(
      page,
      "assignment_submissions",
      { status: "graded" },
      { id: allowedSubmission.data.id },
      "id"
    );
    expectRlsDenied(deniedSubmissionUpdate, "student update own submission");

    const deniedSubmissionDelete = await deleteRow(
      page,
      "assignment_submissions",
      { id: allowedSubmission.data.id },
      "id"
    );
    expectRlsDenied(deniedSubmissionDelete, "student delete own submission");

    const deniedProgressInsert = await insertRow(
      page,
      "course_progress",
      {
        student_id: student.user.id,
        course_id: course.data.id,
        completion_percent: 50,
        lessons_completed: 1,
      },
      "id"
    );
    expectRlsDenied(deniedProgressInsert, "student insert course progress");

    const deniedCourseDelete = await deleteRow(
      page,
      "courses",
      { id: course.data.id },
      "id"
    );
    expectRlsDenied(deniedCourseDelete, "student delete course");
  });

  test("trainer course writes persist with trainer ownership", async ({ page }) => {
    await signIn(page, "trainer");

    const trainer = await getCurrentUser(page);
    expect(trainer.error).toBeNull();
    expect(trainer.user?.id).toBeTruthy();

    const course = await insertRow(
      page,
      "courses",
      {
        trainer_id: trainer.user.id,
        title: `QA Trainer Course ${runKey("trainer")}`,
        slug: runKey("trainer-course"),
        description: "Trainer-owned live QA course",
        level: "intermediate",
        enrollment_type: "open",
        price: 0,
        status: "draft",
      },
      "id, title, trainer_id, status"
    );
    expect(course.error).toBeNull();
    expect(course.data?.trainer_id).toBe(trainer.user.id);

    const updated = await updateRow(
      page,
      "courses",
      {
        title: `${course.data.title} (Updated)`,
        status: "published",
      },
      { id: course.data.id },
      "id, title, trainer_id, status"
    );
    expect(updated.error).toBeNull();
    expect(updated.data?.trainer_id).toBe(trainer.user.id);
    expect(updated.data?.status).toBe("published");

    const deleted = await deleteRow(
      page,
      "courses",
      { id: course.data.id },
      "id"
    );
    expect(deleted.error).toBeNull();
    expect(deleted.data?.id).toBe(course.data.id);
  });

  test("marketer claim writes persist and approval writes stay admin-only", async ({ page }) => {
    await signIn(page, "marketer", "#tab-staff");

    const marketer = await getCurrentUser(page);
    expect(marketer.error).toBeNull();
    expect(marketer.user?.id).toBeTruthy();

    const school = await insertRow(
      page,
      "marketer_schools",
      {
        marketer_id: marketer.user.id,
        name: `QA School ${runKey("school")}`,
        city: "Sydney",
        contact_name: "QA Contact",
        phone: "+61 400 000 000",
        notes: "Isolated QA school",
        status: "active",
      },
      "id, marketer_id, name, city"
    );
    expect(school.error).toBeNull();
    expect(school.data?.marketer_id).toBe(marketer.user.id);

    const claim = await insertRow(
      page,
      "marketer_claims",
      {
        marketer_id: marketer.user.id,
        school_id: school.data.id,
        ref_id: `QA-CLM-${runKey("claim").toUpperCase().replace(/[^A-Z0-9-]/g, "")}`,
        presentation_date: new Date().toISOString().slice(0, 10),
        students_present: 24,
        students_enrolled: 11,
        program_fee: 8900000,
        access_fee: 1000000,
        enrollment_comm: 1200000,
        bonus: 500000,
        notes: "Live QA claim",
        status: "pending",
      },
      "id, marketer_id, school_id, ref_id, status"
    );
    expect(claim.error).toBeNull();
    expect(claim.data?.status).toBe("pending");

    const deniedClaimUpdate = await updateRow(
      page,
      "marketer_claims",
      { status: "verified" },
      { id: claim.data.id },
      "id"
    );
    expectRlsDenied(deniedClaimUpdate, "marketer update claim status");

    const deniedClaimDelete = await deleteRow(
      page,
      "marketer_claims",
      { id: claim.data.id },
      "id"
    );
    expectRlsDenied(deniedClaimDelete, "marketer delete claim");

    await signIn(page, "admin");
    const adminApproved = await updateRow(
      page,
      "marketer_claims",
      { status: "verified" },
      { id: claim.data.id },
      "id, status"
    );
    expect(adminApproved.error).toBeNull();
    expect(adminApproved.data?.status).toBe("verified");
  });
});
