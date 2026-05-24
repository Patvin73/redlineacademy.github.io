const { test, expect } = require("@playwright/test");

test.setTimeout(60000);

function makeLocalDateTime(daysFromNow, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function installSupabaseStub(page, role, options = {}) {
  const profiles = [
    {
      id: "e2e-admin",
      full_name: "E2E Admin",
      role: "admin",
      admin_id: "ADM-001",
      email: "admin@example.com",
      is_active: true,
      created_at: "2026-03-01T08:00:00.000Z"
    },
    {
      id: "e2e-trainer",
      full_name: "E2E Trainer",
      role: "trainer",
      admin_id: "TR-002",
      email: "trainer@example.com",
      is_active: false,
      created_at: "2026-03-02T08:00:00.000Z"
    },
    {
      id: "e2e-student-1",
      full_name: "Alpha Student",
      role: "student",
      student_id: "ST-001",
      email: "alpha@example.com",
      is_active: true,
      created_at: "2026-03-03T08:00:00.000Z"
    },
    {
      id: "e2e-student-2",
      full_name: "Bravo Student",
      role: "student",
      student_id: "ST-002",
      email: "bravo@example.com",
      is_active: true,
      created_at: "2026-03-04T08:00:00.000Z"
    }
  ];
  if (Array.isArray(options.extraProfiles)) {
    profiles.push(...options.extraProfiles);
  }

  const payments = [
    {
      id: "pay-1",
      amount: "120",
      currency: "IDR",
      payment_method: "card",
      status: "completed",
      paid_at: "2026-03-10T10:00:00.000Z",
      profiles: { full_name: "Alpha Student" },
      courses: { title: "Safety 101" }
    },
    {
      id: "pay-2",
      amount: "50",
      currency: "IDR",
      payment_method: "manual",
      status: "pending",
      paid_at: "2026-03-11T10:00:00.000Z",
      profiles: { full_name: "Bravo Student" },
      courses: { title: "Rigging Basics" }
    },
    {
      id: "pay-3",
      amount: "75",
      currency: "IDR",
      payment_method: "card",
      status: "failed",
      paid_at: "2026-03-12T10:00:00.000Z",
      profiles: { full_name: "Charlie Student" },
      courses: { title: "Care Fundamentals" }
    }
  ];

  const kpiRow = {
    trainer_id: role === "admin" ? "e2e-admin" : "e2e-trainer",
    total_students: 12,
    courses_created: 3,
    pending_grading: 2,
    avg_completion_percent: 76
  };

  const schedules = [
    {
      id: "event-1",
      title: "Trainer Live Session",
      event_type: "live_session",
      start_datetime: new Date(Date.now() + 86400000).toISOString(),
      end_datetime: new Date(Date.now() + 90000000).toISOString(),
      meeting_url: "https://example.com/trainer-live",
      trainer_id: "e2e-trainer",
      courses: { title: "Leadership Basics" }
    },
    {
      id: "event-2",
      title: "Admin Exam",
      event_type: "exam",
      start_datetime: new Date(Date.now() + 172800000).toISOString(),
      end_datetime: new Date(Date.now() + 176400000).toISOString(),
      meeting_url: "https://example.com/admin-exam",
      trainer_id: "e2e-admin",
      courses: { title: "Emergency Response" }
    }
  ];

  const assignmentSubmissions = [
    {
      id: "sub-1",
      student_id: "e2e-student-1",
      status: "submitted",
      submitted_at: "2026-03-10T10:00:00.000Z",
      grade: null,
      profiles: { id: "e2e-student-1", full_name: "Alpha Student" },
      assignments: { title: "Module 1 Quiz", trainer_id: kpiRow.trainer_id, pass_mark: 70 },
      notes: "Need detailed feedback",
      file_urls: ["https://example.com/assignment.pdf"]
    },
    {
      id: "sub-2",
      student_id: "e2e-student-2",
      status: "graded",
      submitted_at: "2026-03-09T10:00:00.000Z",
      grade: 88,
      profiles: { id: "e2e-student-2", full_name: "Bravo Student" },
      assignments: { title: "Final Quiz", trainer_id: kpiRow.trainer_id, pass_mark: 70 },
      notes: "",
      file_urls: []
    },
    {
      id: "sub-3",
      student_id: "e2e-student-1",
      status: "resubmit_required",
      submitted_at: "2026-03-08T10:00:00.000Z",
      grade: 45,
      profiles: { id: "e2e-student-1", full_name: "Alpha Student" },
      assignments: { title: "Case Study", trainer_id: kpiRow.trainer_id, pass_mark: 70 },
      notes: "Resubmit required",
      file_urls: []
    }
  ];

  const defaultMessages = [
    {
      id: "msg-1",
      sender_id: "e2e-student-1",
      recipient_id: "e2e-trainer",
      subject: "Question",
      body: "Need help with Module 2.",
      is_read: false,
      created_at: "2026-03-10T08:00:00.000Z",
      profiles: { full_name: "Alpha Student", avatar_url: null }
    },
    {
      id: "msg-2",
      sender_id: "e2e-student-2",
      recipient_id: "e2e-trainer",
      subject: "Thanks",
      body: "All good now.",
      is_read: true,
      created_at: "2026-03-09T08:00:00.000Z",
      profiles: { full_name: "Bravo Student", avatar_url: null }
    }
  ];

  const courses = [
    {
      id: "course-1",
      title: "Leadership Basics",
      status: "published",
      category_id: "communication",
      trainer_id: "e2e-trainer",
      thumbnail_url: "",
      created_at: "2026-03-01T08:00:00.000Z",
      categories: { name: "Communication" },
      profiles: { admin_id: "TR-002" }
    },
    {
      id: "course-2",
      title: "Emergency Response",
      status: "draft",
      category_id: "first-aid",
      trainer_id: "e2e-admin",
      thumbnail_url: "",
      created_at: "2026-03-02T08:00:00.000Z",
      categories: { name: "First Aid" },
      profiles: { admin_id: "ADM-001" }
    }
  ];

  const announcements = [
    {
      id: "ann-1",
      title: "Trainer Announcement",
      body: "Visible to the owning trainer.",
      target_role: "student",
      is_published: true,
      publish_at: "2026-03-10T08:00:00.000Z",
      expires_at: null,
      author_id: "e2e-trainer"
    },
    {
      id: "ann-2",
      title: "Admin Announcement",
      body: "Visible to admins.",
      target_role: "all",
      is_published: true,
      publish_at: "2026-03-11T08:00:00.000Z",
      expires_at: null,
      author_id: "e2e-admin"
    }
  ];
  const certificates = [{ id: "cert-1" }, { id: "cert-2" }];
  const lessons = options.lessons ? options.lessons.map((lesson) => ({ ...lesson })) : [];
  const enrollments = [
    {
      id: "enroll-1",
      student_id: "e2e-student-1",
      course_id: "course-1",
      status: "active",
      enrolled_at: "2026-03-05T08:00:00.000Z",
      courses: { id: "course-1", title: "Leadership Basics", trainer_id: "e2e-trainer" }
    },
    {
      id: "enroll-2",
      student_id: "e2e-student-2",
      course_id: "course-2",
      status: "active",
      enrolled_at: "2026-03-06T08:00:00.000Z",
      courses: { id: "course-2", title: "Emergency Response", trainer_id: "e2e-admin" }
    },
    {
      id: "enroll-3",
      student_id: "e2e-student-2",
      course_id: "course-1",
      status: "dropped",
      enrolled_at: "2026-03-07T08:00:00.000Z",
      courses: { id: "course-1", title: "Leadership Basics", trainer_id: "e2e-trainer" }
    }
  ];
  const atRiskStudents = options.atRiskFixture ? [
    {
      student_id: "e2e-student-1",
      full_name: "Alpha Student",
      email: "alpha@example.com",
      course_title: "Leadership Basics",
      completion_percent: 20,
      last_accessed_at: "2026-01-01T08:00:00.000Z",
      inactive_duration: 30
    }
  ] : [];

  if (options.studentFilterFixture) {
    profiles.push({
      id: "e2e-student-3",
      full_name: "Charlie Student",
      role: "student",
      student_id: "ST-003",
      email: "charlie@example.com",
      is_active: true,
      created_at: "2026-03-05T08:00:00.000Z"
    });
    enrollments[0].course_progress = [{ completion_percent: 35, last_accessed_at: new Date().toISOString() }];
    enrollments[1].status = "completed";
    enrollments[1].course_progress = [{ completion_percent: 100, last_accessed_at: "2026-03-06T08:00:00.000Z" }];
    enrollments.push({
      id: "enroll-4",
      student_id: "e2e-student-3",
      course_id: "course-1",
      status: "active",
      enrolled_at: "2026-03-08T08:00:00.000Z",
      courses: { id: "course-1", title: "Leadership Basics", trainer_id: "e2e-trainer" },
      course_progress: [{ completion_percent: 20, last_accessed_at: "2026-01-01T08:00:00.000Z" }]
    });
  }

  const activityLogs = options.activityFixture ? [
    {
      id: "activity-1",
      user_id: "e2e-student-1",
      action: "assignment_submitted",
      metadata: { assignment_title: "Module 1 Quiz" },
      created_at: "2026-03-12T10:00:00.000Z",
      profiles: { full_name: "Alpha Student" }
    },
    {
      id: "activity-2",
      user_id: "e2e-student-2",
      action: "lesson_completed",
      metadata: { lesson_title: "Emergency Basics" },
      created_at: "2026-03-11T10:00:00.000Z",
      profiles: { full_name: "Bravo Student" }
    }
  ] : [];

  const hasMessageFixture = Object.prototype.hasOwnProperty.call(options, "messages");

  const tableData = {
    profiles,
    payments,
    schedules,
    assignment_submissions: assignmentSubmissions,
    messages: hasMessageFixture ? options.messages : defaultMessages,
    announcements,
    certificates,
    v_trainer_dashboard: [kpiRow],
    v_students_at_risk: atRiskStudents,
    activity_logs: activityLogs,
    courses,
    lessons,
    enrollments,
    assignments: options.assignments || [],
    forum_posts: [],
    notifications: [],
    v_course_overview: options.courseOverview || []
  };

  const profile = profiles.find((p) => p.role === role) || profiles[0];

  const supabaseStub = `
    (() => {
      const tableData = ${JSON.stringify(tableData)};
      const storageFiles = ${JSON.stringify(options.storageFiles || {})};
      const storageStats = ${JSON.stringify(options.storageStats || null)};
      const uploadedFiles = [];
      const functionInvocations = [];
      const queryLog = [];
      const shouldFailOverviewTrainerId = ${JSON.stringify(Boolean(options.missingOverviewTrainerId))};
      const shouldFailAvatarProfileUpdate = ${JSON.stringify(Boolean(options.avatarProfileUpdateError))};
      const missingViews = ${JSON.stringify(options.missingViews || [])};
      const shouldLoadStoredMessages = ${JSON.stringify(!hasMessageFixture)};
      const storedMessages = window.localStorage.getItem("__e2eMessages");
      if (shouldLoadStoredMessages && storedMessages) {
        try { tableData.messages = JSON.parse(storedMessages); } catch {}
      }
      const currentUser = ${JSON.stringify({ id: profile.id, email: profile.email })};

      const getValue = (obj, path) => {
        if (!obj) return undefined;
        return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
      };

      const makeResponse = (rows) => ({
        data: rows,
        error: null,
        count: Array.isArray(rows) ? rows.length : 0
      });

      const applyOrFilter = (rows, expression) => {
        if (!expression) return rows;
        const conditions = String(expression)
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
          .map((part) => {
            const pieces = part.split(".");
            return {
              column: pieces[0],
              operator: pieces[1],
              value: pieces.slice(2).join(".")
            };
          });

        return rows.filter((row) =>
          conditions.some((condition) => {
            const rawValue = getValue(row, condition.column);
            const value = condition.column === "is_archived" && typeof rawValue === "undefined"
              ? false
              : rawValue;
            if (condition.operator === "eq") return String(value) === condition.value;
            if (condition.operator === "is" && condition.value === "null") {
              return rawValue === null || typeof rawValue === "undefined";
            }
            return false;
          })
        );
      };

      const createQuery = (table) => {
        const baseRows = Array.isArray(tableData[table]) ? tableData[table] : [];
        let rows = baseRows.slice();
        let limitValue = null;
        let pendingUpdate = null;
        let pendingDelete = false;
        let queryError = missingViews.includes(table)
          ? { code: "42P01", message: 'relation "' + table + '" does not exist' }
          : null;

        const toComparable = (value) => {
          if (!value) return value;
          const date = new Date(value);
          if (!Number.isNaN(date.getTime())) return date.getTime();
          return value;
        };

        const api = {
          select: () => api,
          eq: (col, val) => {
            if (table === "v_course_overview" && col === "trainer_id" && shouldFailOverviewTrainerId) {
              queryError = {
                code: "PGRST204",
                message: "Could not find the 'trainer_id' column of 'v_course_overview' in the schema cache"
              };
              return api;
            }
            rows = rows.filter((row) => {
              const value = col === "is_archived" && typeof getValue(row, col) === "undefined"
                ? false
                : getValue(row, col);
              if (typeof value === "undefined") return true;
              return value === val;
            });
            return api;
          },
          in: (col, vals) => {
            rows = rows.filter((row) => {
              const value = getValue(row, col);
              if (typeof value === "undefined") return true;
              return vals.includes(value);
            });
            return api;
          },
          or: (expression) => {
            rows = applyOrFilter(rows, expression);
            return api;
          },
          order: () => api,
          lt: (col, val) => {
            const target = toComparable(val);
            rows = rows.filter((row) => {
              const value = toComparable(getValue(row, col));
              if (typeof value === "undefined") return true;
              return value < target;
            });
            return api;
          },
          gte: (col, val) => {
            const target = toComparable(val);
            rows = rows.filter((row) => {
              const value = toComparable(getValue(row, col));
              if (typeof value === "undefined") return true;
              return value >= target;
            });
            return api;
          },
          limit: (n) => {
            limitValue = n;
            return api;
          },
          single: () => Promise.resolve({ data: rows[0] || null, error: null }),
          insert: (payload) => {
            const items = Array.isArray(payload) ? payload : [payload];
            items.forEach((item) => {
              if (!item.id) {
                item.id = table + "-e2e-" + Math.random().toString(36).slice(2, 8);
              }
              baseRows.push(item);
            });
            return api;
          },
          update: (payload) => {
            if (
              table === "profiles" &&
              payload &&
              Object.prototype.hasOwnProperty.call(payload, "avatar_url") &&
              shouldFailAvatarProfileUpdate
            ) {
              queryError = { message: "Avatar profile update failed" };
              return api;
            }
            pendingUpdate = payload;
            return api;
          },
          delete: () => {
            pendingDelete = true;
            return api;
          }
        };

        const applyPendingChanges = () => {
          if (pendingUpdate) {
            rows.forEach((row) => Object.assign(row, pendingUpdate));
            pendingUpdate = null;
          }
          if (pendingDelete) {
            rows.forEach((row) => {
              const idx = baseRows.indexOf(row);
              if (idx >= 0) baseRows.splice(idx, 1);
            });
            pendingDelete = false;
          }
        };
        api.then = (resolve) => {
          applyPendingChanges();
          const data = limitValue ? rows.slice(0, limitValue) : rows;
          return resolve(queryError ? { data: null, error: queryError, count: 0 } : makeResponse(data));
        };
        api.catch = (reject) => {
          applyPendingChanges();
          const data = limitValue ? rows.slice(0, limitValue) : rows;
          const response = queryError ? { data: null, error: queryError, count: 0 } : makeResponse(data);
          return Promise.resolve(response).catch(reject);
        };
        return api;
      };

      window.supabase = {
        createClient: () => ({
          auth: {
            getSession: async () => ({
              data: { session: { user: currentUser } },
              error: null
            }),
            getUser: async () => ({
              data: { user: currentUser },
              error: null
            }),
            signOut: async () => ({ error: null })
          },
          from: (table) => {
            queryLog.push(table);
            return createQuery(table);
          },
          functions: {
            invoke: async (name, options = {}) => {
              functionInvocations.push({ name, body: options.body || null });
              if (name === "get-storage-stats") {
                return storageStats
                  ? { data: storageStats, error: null }
                  : { data: null, error: { message: "Function not available" } };
              }
              return { data: { ok: true, email_sent: true }, error: null };
            }
          },
          storage: {
            from: (bucket) => ({
              list: async () => ({
                data: storageFiles[bucket] || [],
                error: null
              }),
              upload: async (path, file, options) => {
                uploadedFiles.push({ bucket, path, name: file.name, type: file.type, size: file.size, options });
                return { data: { path }, error: null };
              },
              getPublicUrl: (path) => ({
                data: { publicUrl: "https://storage.example.com/" + bucket + "/" + path }
              })
            })
          },
          channel: () => ({
            on: () => ({ subscribe: () => ({}) })
          })
        })
      };

      window.__e2eSetMessages = (msgs) => {
        tableData.messages = msgs;
        window.localStorage.setItem("__e2eMessages", JSON.stringify(msgs));
      };
      window.__e2eGetTableData = () => tableData;
      window.__e2eGetUploadedFiles = () => uploadedFiles;
      window.__e2eGetFunctionInvocations = () => functionInvocations;
      window.__e2eGetQueryLog = () => queryLog;
    })();
  `;

  await page.route("**/*supabase-js@2*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/javascript; charset=utf-8",
      body: supabaseStub
    });
  });
}

test.describe("Admin and trainer dashboard", {
  tag: ["@lms", "@rbac"]
}, () => {
for (const role of ["admin", "trainer"]) {
test(`${role} profile avatar upload persists and keeps the crop fixed`, async ({ page }) => {
  await installSupabaseStub(page, role);
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#sidebarName")).toContainText(role === "admin" ? "E2E Admin" : "E2E Trainer");

  await page.locator(".ad-nav__item[data-section='profile']").click();
  await expect(page.locator("#section-profile")).toHaveClass(/active/);
  await page.locator("#adAvatarInput").setInputFiles({
    name: "avatar.png",
    mimeType: "image/png",
    buffer: Buffer.from("avatar-image")
  });

  await expect(page.locator("#adAvatarMsg")).toContainText("Photo updated");
  const profile = await page.evaluate((profileRole) => (
    window.__e2eGetTableData().profiles.find((item) => item.role === profileRole)
  ), role);
  expect(profile.avatar_url).toContain(`https://storage.example.com/avatars/avatars/${profile.id}.png?v=`);

  const avatarBox = await page.locator("#adProfileAvatar").boundingBox();
  expect(Math.round(avatarBox.width)).toBe(80);
  expect(Math.round(avatarBox.height)).toBe(80);
  await expect(page.locator("#adProfileAvatar img")).toHaveCSS("object-fit", "cover");
  await expect(page.locator("#adProfileAvatar img")).toHaveCSS("object-position", "50% 50%");
});
}

test("admin avatar upload reports profile persistence failure", async ({ page }) => {
  await installSupabaseStub(page, "admin", { avatarProfileUpdateError: true });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });
  await page.locator(".ad-nav__item[data-section='profile']").click();

  await page.locator("#adAvatarInput").setInputFiles({
    name: "avatar.png",
    mimeType: "image/png",
    buffer: Buffer.from("avatar-image")
  });

  await expect(page.locator("#adAvatarMsg")).toContainText("Upload failed");
  await expect(page.locator("#adProfileAvatar img")).toHaveCount(0);
  const profile = await page.evaluate(() => (
    window.__e2eGetTableData().profiles.find((item) => item.id === "e2e-admin")
  ));
  expect(profile.avatar_url).toBeUndefined();
});

test("dashboard admin renders core sections", { tag: "@critical" }, async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#adSidebar")).toBeVisible();
  await expect(page.locator("#adMain")).toBeVisible();
  await expect(page.locator(".ad-kpi-grid")).toBeVisible();

  await expect(page.locator("#kpiTotalStudents")).toBeVisible();
  await expect(page.locator("#kpiActiveCourses")).toBeVisible();
  await expect(page.locator("#kpiPendingGrading")).toBeVisible();
  await expect(page.locator("#kpiCompletionRate")).toBeVisible();
});

test("admin warns when a required database view is missing", async ({ page }) => {
  await installSupabaseStub(page, "admin", { missingViews: ["v_course_overview"] });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".ad-main").getByText('Database view "v_course_overview" belum dibuat')).toBeVisible();
});

test("trainer does not check admin-only required views", async ({ page }) => {
  await installSupabaseStub(page, "trainer", { missingViews: ["v_students_at_risk", "v_course_overview"] });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".ad-main").getByText("Database view")).toHaveCount(0);
  await expect.poll(async () => page.evaluate(() => window.__e2eGetQueryLog())).not.toContain("v_students_at_risk");
  await expect.poll(async () => page.evaluate(() => window.__e2eGetQueryLog())).not.toContain("v_course_overview");
});

test("admin KPI cards navigate to their target sections and count published courses only", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#welcomeName")).toHaveText("E2E Admin", { timeout: 30000 });
  await expect(page.locator("#kpiActiveCourses")).toHaveText("1");

  const kpiRoutes = [
    { cardId: "kpiTotalStudents", section: "students" },
    { cardId: "kpiActiveCourses", section: "courses" },
    { cardId: "kpiPendingGrading", section: "grading" },
    { cardId: "kpiCompletionRate", section: "reports" },
  ];

  for (const { cardId, section } of kpiRoutes) {
    await page.locator(".ad-nav__item[data-section='home']").click();
    const card = page.locator(`.ad-kpi-card:has(#${cardId})`);
    await expect(card).toHaveAttribute("role", "button");
    await expect(card).toHaveAttribute("tabindex", "0");
    await card.click();
    await expect(page.locator(`#section-${section}`)).toHaveClass(/active/);
  }

  await page.locator(".ad-nav__item[data-section='home']").click();
  await page.locator(".ad-kpi-card:has(#kpiCompletionRate)").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#section-reports")).toHaveClass(/active/);
});

test("trainer course reports filter by trainer id instead of trainer name", async ({ page }) => {
  await installSupabaseStub(page, "trainer", {
    courseOverview: [
      {
        course_id: "course-owned",
        trainer_id: "e2e-trainer",
        trainer_name: "Trainer Renamed",
        title: "Owned Report Course",
        total_enrolled: 3,
        total_completed: 2,
        completion_rate_pct: 67,
        certificates_issued: 1
      },
      {
        course_id: "course-name-match",
        trainer_id: "e2e-admin",
        trainer_name: "E2E Trainer",
        title: "Name Match Only",
        total_enrolled: 5,
        total_completed: 5,
        completion_rate_pct: 100,
        certificates_issued: 5
      }
    ]
  });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='reports']").click();
  await expect(page.locator("#section-reports")).toHaveClass(/active/);
  await expect(page.locator("#courseOverviewBody")).toContainText("Owned Report Course");
  await expect(page.locator("#courseOverviewBody")).not.toContainText("Name Match Only");
});

test("trainer course reports fall back to trainer name when overview view lacks trainer id", async ({ page }) => {
  await installSupabaseStub(page, "trainer", {
    missingOverviewTrainerId: true,
    courseOverview: [
      {
        course_id: "course-legacy-match",
        trainer_name: "E2E Trainer",
        title: "Legacy Trainer Report",
        total_enrolled: 2,
        total_completed: 1,
        completion_rate_pct: 50,
        certificates_issued: 0
      },
      {
        course_id: "course-legacy-other",
        trainer_name: "E2E Admin",
        title: "Other Legacy Report",
        total_enrolled: 4,
        total_completed: 4,
        completion_rate_pct: 100,
        certificates_issued: 4
      }
    ]
  });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='reports']").click();
  await expect(page.locator("#section-reports")).toHaveClass(/active/);
  await expect(page.locator("#courseOverviewBody")).toContainText("Legacy Trainer Report");
  await expect(page.locator("#courseOverviewBody")).not.toContainText("Other Legacy Report");
});

test("at-risk student actions open the students section", async ({ page }) => {
  await installSupabaseStub(page, "admin", { atRiskFixture: true });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  const riskRow = page.locator("#atRiskTableBody tr.ad-risk-row", { hasText: "Alpha Student" });
  await expect(riskRow).toBeVisible();

  await page.locator("[data-i18n='lmsViewAll']").click();
  await expect(page.locator("#section-students")).toHaveClass(/active/);

  await page.locator(".ad-nav__item[data-section='home']").click();
  await riskRow.locator(".ad-table-user__name").click();
  await expect(page.locator("#section-students")).toHaveClass(/active/);

  await page.locator(".ad-nav__item[data-section='home']").click();
  await riskRow.locator(".ad-risk-view-btn").click();
  await expect(page.locator("#section-students")).toHaveClass(/active/);
});

test("admin can open Users section and toggle active", { tag: "@critical" }, async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='users']").click();
  await expect(page.locator("#section-users")).toHaveClass(/active/);

  const rows = page.locator("#userTableBody tr.ad-user-row");
  await expect(rows).toHaveCount(4);
  await expect(rows.first().locator("select[data-action='change-role']")).toHaveCount(0);

  const trainerRow = rows.filter({ hasText: "E2E Trainer" });
  const roleSelect = trainerRow.locator("select[data-action='change-role']");
  await expect(roleSelect).toHaveValue("trainer");

  const toggleBtn = rows.first().locator("button[data-action='toggle-active']");
  await expect(toggleBtn).toHaveText("Suspend");
  await toggleBtn.scrollIntoViewIfNeeded();
  await toggleBtn.click({ force: true });
  await expect(toggleBtn).toHaveText("Activate");

  await roleSelect.selectOption("admin");
  const confirmModal = page.getByRole("dialog");
  await expect(confirmModal).toContainText("Change role to admin? This affects their access.");
  await confirmModal.getByRole("button", { name: "Hapus" }).click();
  await expect(trainerRow.locator("td").nth(2)).toHaveText("admin");
  await expect(roleSelect).toHaveValue("admin");
  await expect.poll(async () => page.evaluate(() => (
    window.__e2eGetTableData().profiles.find((item) => item.id === "e2e-trainer").role
  ))).toBe("admin");
});

test("admin sees enrollments totals", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='enrollments']").click();
  await expect(page.locator("#section-enrollments")).toHaveClass(/active/);

  await expect(page.locator("#payTotal")).toHaveText("3");
  await expect(page.locator("#payPending")).toHaveText("1");
  await expect(page.locator("#payRevenue")).toHaveText("Rp\u00a0120");
});

test("trainer hides admin-only sections", { tag: "@critical" }, async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator("body.ad-body")).toHaveClass(/is-trainer/);
  await expect(page.locator(".ad-nav__item[data-section='users']")).toBeHidden();
  await expect(page.locator(".ad-nav__item[data-section='enrollments']")).toBeHidden();
  await expect(page.locator(".ad-nav__item[data-section='announcements']")).toBeHidden();
  await expect(page.locator(".ad-nav__item[data-section='settings']")).toBeHidden();
});

test("trainer sees KPI values and role badge", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#sidebarRoleBadge")).toHaveText("Trainer");
  await expect(page.locator("#welcomeRoleSub")).toContainText("Trainer");

  await expect(page.locator("#kpiTotalStudents")).toHaveText("12");
  await expect(page.locator("#kpiActiveCourses")).toHaveText("3");
  await expect(page.locator("#kpiPendingGrading")).toHaveText("2");
  await expect(page.locator("#kpiCompletionRate")).toHaveText("76%");
});

test("admin sees registered students even without enrollments", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='students']").click();
  await expect(page.locator("#section-students")).toHaveClass(/active/);

  const rows = page.locator("#studentTableBody tr.ad-student-row");
  await expect(rows).toHaveCount(2);
  await expect(page.locator("#studentTableBody")).toContainText("Alpha Student");
  await expect(page.locator("#studentTableBody")).toContainText("Bravo Student");
});

test("trainer sees registered students even without course enrollments", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='students']").click();
  await expect(page.locator("#section-students")).toHaveClass(/active/);

  const rows = page.locator("#studentTableBody tr.ad-student-row");
  await expect(rows).toHaveCount(2);
  await expect(page.locator("#studentTableBody")).toContainText("Alpha Student");
  await expect(page.locator("#studentTableBody")).toContainText("Bravo Student");
});

test("admin can filter student table by status tabs", async ({ page }) => {
  await installSupabaseStub(page, "admin", { studentFilterFixture: true });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='students']").click();
  await expect(page.locator("#section-students")).toHaveClass(/active/);

  const visibleRows = page.locator("#studentTableBody tr.ad-student-row:visible");
  await expect(visibleRows).toHaveCount(3);

  await page.locator("#section-students .ad-filter-tab[data-filter='active']").click();
  await expect(visibleRows).toHaveCount(1);
  await expect(visibleRows).toContainText("Alpha Student");

  await page.locator("#section-students .ad-filter-tab[data-filter='completed']").click();
  await expect(visibleRows).toHaveCount(1);
  await expect(visibleRows).toContainText("Bravo Student");

  await page.locator("#section-students .ad-filter-tab[data-filter='at_risk']").click();
  await expect(visibleRows).toHaveCount(1);
  await expect(visibleRows).toContainText("Charlie Student");

  await page.locator("#section-students .ad-filter-tab[data-filter='all']").click();
  await expect(visibleRows).toHaveCount(3);
});

test("student message action opens compose with selected recipient", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#sidebarName")).toHaveText("E2E Admin");

  await page.locator(".ad-nav__item[data-section='students']").click();
  await expect(page.locator("#section-students")).toHaveClass(/active/);
  await expect(page.locator("#studentTableBody")).toContainText("Alpha Student");

  await page
    .locator("#studentTableBody tr.ad-student-row", { hasText: "Alpha Student" })
    .locator("[data-student-id='e2e-student-1']")
    .click();

  await expect(page.locator("#section-messages")).toHaveClass(/active/);
  await expect(page.locator("#adMsgComposeForm")).toBeVisible();
  await expect(page.locator("#adMsgDetail")).toBeHidden();
  await expect(page.locator("#adMsgRecipient")).toHaveValues(["e2e-student-1"]);
  await expect(page.locator("#adMsgRecipientSummary")).toHaveText("Alpha Student");
  await page.locator("#adMsgRecipientToggle").click();
  await expect(
    page.locator("#adMsgRecipientPanel label", { hasText: "Alpha Student" }).locator("input")
  ).toBeChecked();
});

test("trainer can open grading submission and save grade", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#sidebarName")).toHaveText("E2E Trainer");

  await page.locator(".ad-nav__item[data-section='grading']").click();
  await expect(page.locator("#section-grading")).toHaveClass(/active/);

  const firstSubmission = page.locator(".ad-submission-item").first();
  await expect(firstSubmission).toBeVisible();
  await firstSubmission.click();

  await expect(page.locator("#gradingForm")).toBeVisible();
  await page.fill("#gradeScore", "85");
  await expect(page.locator("#gradeResult")).toContainText("PASS");
  await page.fill("#gradeFeedback", "Good work.");
  await page.click("#saveGradeBtn");

  await expect(page.locator("#gradingMsg")).toContainText("Saved");
  const notifications = await page.evaluate(() => window.__e2eGetTableData().notifications);
  expect(notifications).toEqual(expect.arrayContaining([
    expect.objectContaining({
      user_id: "e2e-student-1",
      type: "assignment_graded",
      title: 'Your assignment "Module 1 Quiz" has been graded: 85% (PASS)',
      is_read: false
    })
  ]));
});

test("trainer assignment form rejects past deadlines", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#sidebarName")).toHaveText("E2E Trainer");
  await page.locator(".ad-nav__item[data-section='grading']").click();
  await page.click("#createAssignmentBtn");

  await expect(page.locator("#assignmentFormCard")).toBeVisible();
  await expect(page.locator("#atCourse option[value='course-1']")).toHaveText("Leadership Basics");
  await expect(page.locator("#atDueAt")).toHaveAttribute("min", /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
  const initialAssignments = await page.evaluate(() => window.__e2eGetTableData().assignments.length);

  await page.fill("#atTitle", "Past Deadline Assignment");
  await page.selectOption("#atCourse", "course-1");
  await page.fill("#atDueAt", makeLocalDateTime(-1, 9));
  await page.click("#saveAssignmentBtn");

  await expect(page.locator("#assignmentFormMsg")).toContainText("Deadline harus di masa mendatang.");
  await expect(page.locator("#assignmentFormCard")).toBeVisible();
  const assignments = await page.evaluate(() => window.__e2eGetTableData().assignments);
  expect(assignments).toHaveLength(initialAssignments);
  expect(assignments).not.toEqual(expect.arrayContaining([
    expect.objectContaining({ title: "Past Deadline Assignment" })
  ]));
});

test("trainer can create schedule event", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='schedule']").click();
  await expect(page.locator("#section-schedule")).toHaveClass(/active/);

  await page.click("#createEventBtn");
  await expect(page.locator("#eventFormCard")).toBeVisible();
  await expect(page.locator("#evCourse option")).toHaveCount(2);
  await expect(page.locator("#evCourse option[value='']")).toHaveText("All Enrolled Students");
  await expect(page.locator("#evCourse option[value='course-1']")).toHaveText("Leadership Basics");
  await expect(page.locator("#evCourse option[value='course-2']")).toHaveCount(0);

  await page.fill("#evTitle", "E2E Trainer Event");
  await page.fill("#evStart", makeLocalDateTime(2, 10));
  await page.fill("#evEnd", makeLocalDateTime(2, 11));
  await page.selectOption("#evCourse", "course-1");

  await page.click("#saveEventBtn");
  await expect(page.locator("#eventMsg")).toContainText("Event created");

  await expect(page.locator(".ad-event-row__title", { hasText: "E2E Trainer Event" })).toBeVisible();
  const schedules = await page.evaluate(() => window.__e2eGetTableData().schedules);
  expect(schedules.at(-1)).toMatchObject({ course_id: "course-1" });
});

test("trainer sees unread messages badge", async ({ page }) => {
  await installSupabaseStub(page, "trainer", {
    messages: [
      {
        id: "msg-inbox-unread",
        sender_id: "e2e-student-1",
        recipient_id: "e2e-trainer",
        subject: "Question",
        body: "Need help with Module 2.",
        is_read: false,
        created_at: "2026-03-10T08:00:00.000Z",
        profiles: { full_name: "Alpha Student", avatar_url: null }
      },
      {
        id: "msg-sent-unread",
        sender_id: "e2e-trainer",
        recipient_id: "e2e-student-1",
        subject: "Follow up",
        body: "Please review Module 2.",
        is_read: false,
        created_at: "2026-03-09T08:00:00.000Z",
        profiles: { full_name: "E2E Trainer", avatar_url: null }
      }
    ]
  });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='messages']").click();
  await expect(page.locator("#section-messages")).toHaveClass(/active/);

  await expect(page.locator("#adMsgBadge")).toHaveText("1");
  await expect(page.locator("#adNotifDot")).toBeVisible();
  await expect(page.locator(".ad-inbox-item.unread")).toHaveCount(1);

  await page.locator("#adNotifBtn").click();
  await expect(page.locator("#adNotifList")).toContainText("Question");
  await expect(page.locator("#adNotifList")).toContainText("Need help with Module 2.");
  await page.locator("#adMarkAllRead").click();
  await expect(page.locator("#adMsgBadge")).toBeHidden();
  await expect(page.locator("#adNotifDot")).toBeHidden();

  const messages = await page.evaluate(() => window.__e2eGetTableData().messages);
  expect(messages.find((msg) => msg.id === "msg-inbox-unread")).toEqual(expect.objectContaining({
    is_read: true,
    recipient_id: "e2e-trainer"
  }));
});

test("trainer can open message detail", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#sidebarRoleBadge")).toHaveText("Trainer");

  await page.locator(".ad-nav__item[data-section='messages']").click();
  await expect(page.locator("#section-messages")).toHaveClass(/active/);

  await page.locator(".ad-inbox-item", { hasText: "Need help with Module 2." }).click();
  await expect(page.locator("#adMsgViewEmpty")).toBeHidden();
  await expect(page.locator("#adMsgDetail")).toBeVisible();
  await expect(page.locator("#adMsgDetail")).toContainText("Need help with Module 2.");
  await expect(page.locator("#adMsgDetail")).toContainText("Reply");
  await expect(page.locator("#adMsgDetail")).toContainText("Archive");
  await expect(page.locator("#adMsgDetail")).toContainText("Delete");

  await page.locator("[data-ad-msg-reply]").click();
  await expect(page.locator("#adMsgComposeForm")).toBeVisible();
  await expect(page.locator("#adMsgSubject")).toHaveValue("Re: Question");
  await expect(page.locator("#adMsgRecipient")).toHaveValues(["e2e-student-1"]);
  await page.locator("#adCancelMsgBtn").click();

  await page.locator(".ad-inbox-item", { hasText: "Need help with Module 2." }).click();
  await page.locator("[data-ad-msg-archive]").click();
  await expect.poll(async () => {
    const messages = await page.evaluate(() => window.__e2eGetTableData().messages);
    return messages.find((msg) => msg.id === "msg-1")?.is_archived;
  }).toBe(true);
  await expect(page.locator(".ad-inbox-item", { hasText: "Need help with Module 2." })).toHaveCount(0);
  await page.locator("[data-message-view='archive']").click();
  await expect(page.locator(".ad-inbox-item", { hasText: "Question" })).toHaveCount(1);
  await page.locator(".ad-inbox-item", { hasText: "Question" }).click();
  await expect(page.locator("#adMsgDetail")).toContainText("Restore");
  await page.locator("[data-ad-msg-restore]").click();
  await expect.poll(async () => {
    const messages = await page.evaluate(() => window.__e2eGetTableData().messages);
    return messages.find((msg) => msg.id === "msg-1")?.is_archived;
  }).toBeFalsy();

  await page.locator("[data-message-view='inbox']").click();
  await page.locator(".ad-inbox-item", { hasText: "Question" }).click();
  await page.locator("[data-ad-msg-delete-inbox]").click();
  const messages = await page.evaluate(() => window.__e2eGetTableData().messages);
  expect(messages.some((msg) => msg.id === "msg-1")).toBe(false);
});

test("trainer can compose a system message to multiple recipients across roles", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#sidebarRoleBadge")).toHaveText("Trainer");

  await page.locator(".ad-nav__item[data-section='messages']").click();
  await page.locator("#adNewMsgBtn").click();

  await expect(page.locator("#adMsgComposeForm")).toBeVisible();
  await expect(page.locator("#adMsgViewEmpty")).toBeHidden();
  await expect(page.locator("#adMsgDetail")).toBeHidden();

  const recipients = await page.locator("#adMsgRecipient option").allTextContents();
  expect(recipients).toContain("E2E Admin");
  expect(recipients).toContain("Alpha Student");
  expect(recipients).toContain("Bravo Student");
  expect(recipients).not.toContain("E2E Trainer");

  await page.locator("#adMsgRecipientToggle").click();
  await page.locator("#adMsgRecipientPanel label", { hasText: "Alpha Student" }).locator("input").check();
  await page.locator("#adMsgRecipientPanel label", { hasText: "E2E Admin" }).locator("input").check();
  await expect(page.locator("#adMsgRecipientSummary")).toHaveText(/2 (recipients selected|penerima dipilih)/);
  await page.fill("#adMsgSubject", "Module 2 review");
  await page.fill("#adMsgBody", "Please review Module 2.");
  await page.locator("#adSendMsgBtn").click();

  await expect(page.locator("#adMsgComposeMsg")).toContainText(/Message sent\.|Pesan terkirim\./);
  const sentMessages = await page.evaluate(() => window.__e2eGetTableData().messages);
  const sentMessagesForRecipients = sentMessages.filter((msg) =>
    msg.sender_id === "e2e-trainer" &&
    msg.subject === "Module 2 review" &&
    msg.body === "Please review Module 2."
  );
  expect(sentMessagesForRecipients).toEqual(expect.arrayContaining([
    expect.objectContaining({
      sender_id: "e2e-trainer",
      recipient_id: "e2e-student-1",
      subject: "Module 2 review",
      body: "Please review Module 2."
    }),
    expect.objectContaining({
      sender_id: "e2e-trainer",
      recipient_id: "e2e-admin",
      subject: "Module 2 review",
      body: "Please review Module 2."
    })
  ]));
  await expect(page.locator("#adMsgSubject")).toHaveValue("");
  const emailInvocations = await page.evaluate(() => window.__e2eGetFunctionInvocations());
  sentMessagesForRecipients.forEach((message) => {
    expect(emailInvocations).toEqual(expect.arrayContaining([
      { name: "send-message-email", body: { message_id: message.id } }
    ]));
  });

  await expect(page.locator(".ad-inbox-item", { hasText: "Module 2 review" })).toHaveCount(1);
  await page.locator(".ad-inbox-item", { hasText: "Module 2 review" }).click();
  await expect(page.locator("#adMsgDetail")).toContainText("Sent to 2 recipients");
  await expect(page.locator("#adMsgDetail")).toContainText("Alpha Student");
  await expect(page.locator("#adMsgDetail")).toContainText("E2E Admin");
  await expect(page.locator("#adMsgDetail")).toContainText("Please review Module 2.");
});

test("sent message history can edit, delete one recipient, and archive", async ({ page }) => {
  await installSupabaseStub(page, "trainer", {
    messages: [
      {
        id: "sent-batch-1",
        sender_id: "e2e-trainer",
        recipient_id: "e2e-student-1",
        subject: "Batch note",
        body: "Original body",
        is_read: true,
        created_at: "2026-03-10T08:00:00.000Z",
        profiles: { full_name: "E2E Trainer", avatar_url: null }
      },
      {
        id: "sent-batch-2",
        sender_id: "e2e-trainer",
        recipient_id: "e2e-admin",
        subject: "Batch note",
        body: "Original body",
        is_read: true,
        created_at: "2026-03-10T08:00:00.000Z",
        profiles: { full_name: "E2E Trainer", avatar_url: null }
      }
    ]
  });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#sidebarRoleBadge")).toHaveText("Trainer");

  await page.locator(".ad-nav__item[data-section='messages']").click();
  await page.locator("[data-message-view='history']").click();
  await expect(page.locator(".ad-inbox-item", { hasText: "Batch note" })).toHaveCount(1);
  await page.locator(".ad-inbox-item", { hasText: "Batch note" }).click();
  await expect(page.locator("#adMsgDetail")).toContainText("Sent to 2 recipients");

  await page.locator("[data-ad-msg-edit]").click();
  await page.fill("#adMsgEditSubject", "Updated batch note");
  await page.fill("#adMsgEditBody", "Updated body");
  await page.locator(".ad-message-edit-form button[type='submit']").click();
  await expect(page.locator(".ad-inbox-item", { hasText: "Updated batch note" })).toHaveCount(1);
  const editedMessages = await page.evaluate(() => window.__e2eGetTableData().messages);
  expect(editedMessages.filter((msg) => msg.subject === "Updated batch note")).toHaveLength(2);

  await page.locator(".ad-inbox-item", { hasText: "Updated batch note" }).click();
  await page.locator("[data-ad-msg-delete-one='sent-batch-2']").click();
  const afterDeleteOne = await page.evaluate(() => window.__e2eGetTableData().messages);
  expect(afterDeleteOne.some((msg) => msg.id === "sent-batch-2")).toBe(false);
  expect(afterDeleteOne.some((msg) => msg.id === "sent-batch-1")).toBe(true);

  await page.locator(".ad-inbox-item", { hasText: "Updated batch note" }).click();
  await page.locator("[data-ad-msg-archive]").click();
  await expect(page.locator(".ad-inbox-item", { hasText: "Updated batch note" })).toHaveCount(0);

  await page.locator("[data-message-view='archive']").click();
  await expect(page.locator(".ad-inbox-item", { hasText: "Updated batch note" })).toHaveCount(1);
  await page.locator(".ad-inbox-item", { hasText: "Updated batch note" }).click();
  await expect(page.locator("#adMsgDetail")).toContainText("Restore");
  await page.locator("[data-ad-msg-restore]").click();
  await expect(page.locator(".ad-inbox-item", { hasText: "Updated batch note" })).toHaveCount(0);

  await page.locator("[data-message-view='history']").click();
  await expect(page.locator(".ad-inbox-item", { hasText: "Updated batch note" })).toHaveCount(1);
});

test("message composer caps selected recipients at 50", async ({ page }) => {
  const extraProfiles = Array.from({ length: 51 }, (_, index) => ({
    id: `extra-recipient-${index + 1}`,
    full_name: `Extra Recipient ${index + 1}`,
    role: index % 2 === 0 ? "student" : "trainer",
    email: `extra-${index + 1}@example.com`,
    is_active: true,
    created_at: "2026-03-05T08:00:00.000Z"
  }));

  await installSupabaseStub(page, "admin", { extraProfiles });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#sidebarRoleBadge")).toHaveText("Admin");

  await page.locator(".ad-nav__item[data-section='messages']").click();
  await page.locator("#adNewMsgBtn").click();
  await page.locator("#adMsgRecipientToggle").click();
  const checkboxes = page.locator("#adMsgRecipientPanel input[type='checkbox']");
  for (let i = 0; i < extraProfiles.length; i += 1) {
    await checkboxes.nth(i).click();
  }

  await expect(page.locator("#adMsgComposeMsg")).toContainText(/50/);
  const selectedCount = await page.locator("#adMsgRecipient").evaluate((select) =>
    Array.from(select.selectedOptions).filter((option) => option.value).length
  );
  expect(selectedCount).toBe(50);
});

test("admin composer lists all other users and cancel hides the form", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#sidebarRoleBadge")).toHaveText("Admin");

  await page.locator(".ad-nav__item[data-section='messages']").click();
  await page.locator("#adNewMsgBtn").click();

  await expect(page.locator("#adMsgComposeForm")).toBeVisible();
  await page.locator("#adMsgRecipientToggle").click();
  const recipients = await page.locator("#adMsgRecipient option").allTextContents();
  expect(recipients).toContain("E2E Trainer");
  expect(recipients).toContain("Alpha Student");
  expect(recipients).toContain("Bravo Student");
  expect(recipients).not.toContain("E2E Admin");
  await expect(page.locator("#adMsgRecipientPanel")).toContainText("E2E Trainer");
  await expect(page.locator("#adMsgRecipientPanel")).toContainText("Alpha Student");

  await page.locator("#adCancelMsgBtn").click();
  await expect(page.locator("#adMsgComposeForm")).toBeHidden();
});

test("trainer marks inbox message as read when opened", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='messages']").click();
  await expect(page.locator("#section-messages")).toHaveClass(/active/);
  await expect(page.locator("#adMsgBadge")).toHaveText("1");

  await page.locator(".ad-inbox-item", { hasText: "Need help with Module 2." }).click();
  await expect(page.locator("#adMsgBadge")).toBeHidden();
  await expect(page.locator("#adNotifDot")).toBeHidden();
  await expect(page.locator(".ad-inbox-item", { hasText: "Need help with Module 2." })).not.toHaveClass(/unread/);

  const messages = await page.evaluate(() => window.__e2eGetTableData().messages);
  expect(messages.find((msg) => msg.id === "msg-1")).toEqual(expect.objectContaining({
    is_read: true,
    recipient_id: "e2e-trainer"
  }));
  expect(messages.find((msg) => msg.id === "msg-1").read_at).toEqual(expect.any(String));
});

test("trainer sees empty state when no messages", async ({ page }) => {
  await installSupabaseStub(page, "trainer", { messages: [] });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });
  await page.locator(".ad-nav__item[data-section='messages']").click();
  await expect(page.locator("#section-messages")).toHaveClass(/active/);
  await expect(page.locator("#adInboxEmpty")).toBeVisible();
  await expect(page.locator(".ad-inbox-item")).toHaveCount(0);
  await expect(page.locator("#adMsgBadge")).toBeHidden();
  await expect(page.locator("#adNotifDot")).toBeHidden();
});

test("trainer can filter grading tabs (submitted/graded/all)", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='grading']").click();
  await expect(page.locator("#section-grading")).toHaveClass(/active/);

  await expect(page.locator(".ad-submission-item")).toHaveCount(1);
  await expect(page.locator(".ad-submission-item__assignment")).toContainText("Module 1 Quiz");

  await page.locator("#section-grading .ad-filter-tab[data-filter='graded']").click();
  await expect(page.locator(".ad-submission-item")).toHaveCount(1);
  await expect(page.locator(".ad-submission-item__assignment")).toContainText("Final Quiz");

  await page.locator("#section-grading .ad-filter-tab[data-filter='all']").click();
  await expect(page.locator(".ad-submission-item")).toHaveCount(3);
  await expect(page.locator(".ad-tag", { hasText: "Resubmit" })).toBeVisible();
});

test("trainer keeps active grading filter after saving a grade", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='grading']").click();
  await expect(page.locator("#section-grading")).toHaveClass(/active/);

  await page.locator("#section-grading .ad-filter-tab[data-filter='graded']").click();
  await expect(page.locator(".ad-submission-item")).toHaveCount(1);
  await expect(page.locator(".ad-submission-item__assignment")).toContainText("Final Quiz");

  await page.locator(".ad-submission-item").first().click();
  await page.fill("#gradeScore", "90");
  await page.click("#saveGradeBtn");
  await expect(page.locator("#gradingMsg")).toContainText("Saved");

  await page.waitForTimeout(1700);
  await expect(page.locator("#section-grading .ad-filter-tab[data-filter='graded']")).toHaveClass(/active/);
  await expect(page.locator(".ad-submission-item")).toHaveCount(1);
  await expect(page.locator(".ad-submission-item__assignment")).toContainText("Final Quiz");
});

test("trainer can request resubmit from grading panel", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='grading']").click();
  await expect(page.locator("#section-grading")).toHaveClass(/active/);

  const firstSubmission = page.locator(".ad-submission-item").first();
  await expect(firstSubmission).toBeVisible();
  await firstSubmission.click();

  await expect(page.locator("#gradingForm")).toBeVisible();
  await page.click("#reqResubmitBtn");
  await expect(page.locator("#gradingMsg")).toContainText("Saved");
});

test("trainer can filter resubmit_required items", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='grading']").click();
  await expect(page.locator("#section-grading")).toHaveClass(/active/);

  await page.locator("#section-grading .ad-filter-tab[data-filter='resubmit_required']").click();
  await expect(page.locator(".ad-submission-item")).toHaveCount(1);
  await expect(page.locator(".ad-submission-item__assignment")).toContainText("Case Study");
});

test("trainer can use course builder tabs and save draft", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='courses']").click();
  await expect(page.locator("#section-courses")).toHaveClass(/active/);

  await page.click("#createCourseBtn");
  await expect(page.locator("#courseBuilderPanel")).toBeVisible();

  await page.click(".ad-builder-tab[data-tab='modules']");
  await expect(page.locator("#builderTab-modules")).toHaveClass(/active/);

  const modules = page.locator(".ad-module-item");
  const initialCount = await modules.count();
  await page.click("#addModuleBtn");
  await expect(modules).toHaveCount(initialCount + 1);

  await page.click(".ad-builder-tab[data-tab='settings']");
  await expect(page.locator("#builderTab-settings")).toHaveClass(/active/);

  await page.click(".ad-builder-tab[data-tab='info']");
  await expect(page.locator("#builderTab-info")).toHaveClass(/active/);

  await page.fill("#cbTitle", "E2E Draft Course");
  await page.fill("#cbDesc", "Draft course for automated test.");
  await page.selectOption("#cbCategory", "communication");
  await page.fill("#cbDuration", "4");

  await page.click("#saveDraftBtn");
  await expect(page.locator("#builderMsg")).toContainText("Course saved");

  await expect(page.locator(".ad-course-row__title", { hasText: "E2E Draft Course" })).toBeVisible();
});

test("trainer can upload lesson material and save it with course lessons", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='courses']").click();
  await page.click("#createCourseBtn");
  await page.fill("#cbTitle", "Course With Materials");
  await page.click(".ad-builder-tab[data-tab='modules']");

  const lesson = page.locator("#builderTab-modules .ad-lesson-item").first();
  await lesson.locator(".ad-input--grow").fill("Lesson PDF");
  await lesson.locator(".ad-lesson-type").selectOption("pdf");
  await lesson.locator(".ad-material-input").setInputFiles({
    name: "lesson.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 test lesson")
  });

  await expect(lesson.locator(".ad-material-file")).toHaveText("lesson.pdf");
  await page.click("#saveDraftBtn");
  await expect(page.locator("#builderMsg")).toContainText("Course saved");

  const uploadedFiles = await page.evaluate(() => window.__e2eGetUploadedFiles());
  expect(uploadedFiles).toHaveLength(1);
  expect(uploadedFiles[0]).toMatchObject({
    bucket: "course-materials",
    name: "lesson.pdf"
  });

  const lessons = await page.evaluate(() => window.__e2eGetTableData().lessons);
  expect(lessons).toHaveLength(1);
  expect(lessons[0]).toMatchObject({
    title: "Lesson PDF",
    material_type: "pdf",
    material_path: expect.stringContaining("lesson-1-pdf"),
    module_order: 1,
    lesson_order: 1
  });
});

test("trainer sees only owned courses with creator IDs", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='courses']").click();
  await expect(page.locator("#section-courses")).toHaveClass(/active/);

  const rows = page.locator("#adminCourseList .ad-course-row:not(.ad-skeleton-row)");
  await expect(rows).toHaveCount(1);
  await expect(page.locator("#adminCourseList")).toContainText("Leadership Basics");
  await expect(page.locator("#adminCourseList")).not.toContainText("Emergency Response");
  await expect(page.locator("#adminCourseList")).toContainText("Creator ID: TR-002");
  await expect(page.locator("#adminCourseList")).not.toContainText("Creator ID: ADM-001");

  await expect(page.locator(".ad-course-row", { hasText: "Leadership Basics" }).locator("[data-action='edit']")).toBeVisible();
  await expect(page.locator(".ad-course-row", { hasText: "Emergency Response" }).locator("[data-action='edit']")).toHaveCount(0);
});

test("admin sees all courses with creator IDs", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='courses']").click();
  await expect(page.locator("#section-courses")).toHaveClass(/active/);

  const rows = page.locator("#adminCourseList .ad-course-row:not(.ad-skeleton-row)");
  await expect(rows).toHaveCount(2);
  await expect(page.locator("#adminCourseList")).toContainText("Leadership Basics");
  await expect(page.locator("#adminCourseList")).toContainText("Emergency Response");
  await expect(page.locator("#adminCourseList")).toContainText("Creator ID: TR-002");
  await expect(page.locator("#adminCourseList")).toContainText("Creator ID: ADM-001");
  await expect(rows.locator("[data-action='edit']")).toHaveCount(2);
});

test("admin sees all upcoming events and trainer sees only owned events", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='schedule']").click();
  await expect(page.locator("#section-schedule")).toHaveClass(/active/);
  await expect(page.locator("#adminEventsList")).toContainText("Trainer Live Session");
  await expect(page.locator("#adminEventsList")).toContainText("Admin Exam");

  await installSupabaseStub(page, "trainer");
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".ad-nav__item[data-section='schedule']").click();
  await expect(page.locator("#section-schedule")).toHaveClass(/active/);
  await expect(page.locator("#adminEventsList")).toContainText("Trainer Live Session");
  await expect(page.locator("#adminEventsList")).not.toContainText("Admin Exam");
});

test("admin sees all announcements regardless of author", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='announcements']").click();
  await expect(page.locator("#section-announcements")).toHaveClass(/active/);

  await expect(page.locator("#announcementsList")).toContainText("Trainer Announcement");
  await expect(page.locator("#announcementsList")).toContainText("Admin Announcement");
});

test("trainer can open course builder edit flow", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='courses']").click();
  await expect(page.locator("#section-courses")).toHaveClass(/active/);

  const courseRow = page.locator(".ad-course-row", { hasText: "Leadership Basics" });
  await expect(courseRow).toBeVisible();
  await courseRow.locator("[data-action='edit']").click();

  await expect(page.locator("#courseBuilderPanel")).toBeVisible();
  await expect(page.locator("#builderTitle")).toHaveText("Edit Course");
});

test("trainer can edit existing course lessons without reuploading materials", async ({ page }) => {
  await installSupabaseStub(page, "trainer", {
    lessons: [
      {
        id: "lesson-1",
        course_id: "course-1",
        title: "Orientation Video",
        material_type: "video",
        module_title: "Orientation",
        module_order: 1,
        lesson_order: 1,
        material_url: "https://storage.example.com/course-materials/courses/course-1/module-1/orientation.mp4"
      },
      {
        id: "lesson-2",
        course_id: "course-1",
        title: "Care Guide",
        material_type: "pdf",
        module_title: "Care Materials",
        module_order: 2,
        lesson_order: 2,
        material_url: "https://storage.example.com/course-materials/courses/course-1/module-2/care-guide.pdf"
      }
    ]
  });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='courses']").click();
  const courseRow = page.locator(".ad-course-row", { hasText: "Leadership Basics" });
  await courseRow.locator("[data-action='edit']").click();
  await page.click(".ad-builder-tab[data-tab='modules']");

  const modules = page.locator("#builderModulesList .ad-module-item");
  await expect(modules).toHaveCount(2);
  await expect(modules.nth(0).locator(".ad-module-item__header input")).toHaveValue("Orientation");
  await expect(modules.nth(0).locator(".ad-input--grow")).toHaveValue("Orientation Video");
  await expect(modules.nth(0).locator(".ad-material-file")).toHaveText("orientation.mp4");
  await expect(modules.nth(1).locator(".ad-module-item__header input")).toHaveValue("Care Materials");
  await expect(modules.nth(1).locator(".ad-input--grow")).toHaveValue("Care Guide");
  await expect(modules.nth(1).locator(".ad-material-file")).toHaveText("care-guide.pdf");

  await page.click("#saveDraftBtn");
  await expect(page.locator("#builderMsg")).toContainText("Course saved");

  const uploadedFiles = await page.evaluate(() => window.__e2eGetUploadedFiles());
  expect(uploadedFiles).toHaveLength(0);
  const lessons = await page.evaluate(() => window.__e2eGetTableData().lessons);
  expect(lessons).toHaveLength(2);
  expect(lessons.map((lesson) => lesson.material_url)).toEqual([
    "https://storage.example.com/course-materials/courses/course-1/module-1/orientation.mp4",
    "https://storage.example.com/course-materials/courses/course-1/module-2/care-guide.pdf"
  ]);
});

test("trainer sees empty activity feed state", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#sidebarName")).toHaveText("E2E Trainer");
  await expect(page.locator("#adActivityEmpty")).toBeVisible();
  await expect(page.locator(".ad-activity-item")).toHaveCount(0);
});

test("admin activity feed is not limited to admin-owned courses", async ({ page }) => {
  await installSupabaseStub(page, "admin", { activityFixture: true });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#sidebarName")).toHaveText("E2E Admin");
  await expect(page.locator("#adActivityEmpty")).toBeHidden();
  await expect(page.locator(".ad-activity-item")).toHaveCount(2);
  await expect(page.locator("#adActivityList")).toContainText("Alpha Student");
  await expect(page.locator("#adActivityList")).toContainText("Bravo Student");
});

test("admin can publish and delete announcement", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='announcements']").click();
  await expect(page.locator("#section-announcements")).toHaveClass(/active/);

  await page.click("#createAnnouncementBtn");
  await expect(page.locator("#announcementFormCard")).toBeVisible();
  await expect(page.locator("#anCourse option")).toHaveCount(3);
  await expect(page.locator("#anCourse option[value='']")).toHaveText("All Courses (Global)");
  await expect(page.locator("#anCourse option[value='course-1']")).toHaveText("Leadership Basics");
  await expect(page.locator("#anCourse option[value='course-2']")).toHaveText("Emergency Response");

  await page.fill("#anTitle", "E2E Announcement");
  await page.fill("#anBody", "This is an automated admin announcement.");
  await page.selectOption("#anCourse", "course-2");
  await page.click("#saveAnnouncementBtn");

  await expect(page.locator("#annMsg")).toContainText("Announcement published");
  const announcementItem = page.locator(".ad-announcement-item", { hasText: "E2E Announcement" });
  await expect(announcementItem).toBeVisible();
  const announcements = await page.evaluate(() => window.__e2eGetTableData().announcements);
  expect(announcements.at(-1)).toMatchObject({ course_id: "course-2" });

  await announcementItem.locator(".ad-icon-btn--danger").click();
  const confirmModal = page.getByRole("dialog");
  await expect(confirmModal).toContainText("Delete this announcement?");
  await confirmModal.getByRole("button", { name: "Hapus" }).click();
  await expect(announcementItem).toBeHidden();
});

test("admin can schedule announcement in the future", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='announcements']").click();
  await expect(page.locator("#section-announcements")).toHaveClass(/active/);

  await page.click("#createAnnouncementBtn");
  await expect(page.locator("#announcementFormCard")).toBeVisible();

  await page.fill("#anTitle", "E2E Scheduled Announcement");
  await page.fill("#anBody", "Scheduled announcement for testing.");
  await page.fill("#anPublishAt", makeLocalDateTime(2, 10));
  await page.click("#saveAnnouncementBtn");

  const scheduledItem = page.locator(".ad-announcement-item", { hasText: "E2E Scheduled Announcement" });
  await expect(scheduledItem).toBeVisible();
  await expect(scheduledItem.locator(".ad-tag", { hasText: "Scheduled" })).toBeVisible();
});

test("admin sees reports analytics metrics", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='reports']").click();
  await expect(page.locator("#section-reports")).toHaveClass(/active/);

  await expect(page.locator("#metricAvgScore")).toHaveText("88%");
  await expect(page.locator("#metricDropout")).toHaveText("33.3%");
  await expect(page.locator("#metricRevenue")).toHaveText("Rp\u00a0120");
  await expect(page.locator("#metricCerts")).toHaveText("2");
});

test("admin settings tab supports branding and email changes", async ({ page }) => {
  await installSupabaseStub(page, "admin", {
    storageStats: { db_size_mb: 125, files_size_mb: 512 }
  });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='settings']").click();
  await expect(page.locator("#section-settings")).toHaveClass(/active/);

  await page.fill("#settPlatformName", "E2E Academy");
  await page.selectOption("#settDefaultTimezone", "Asia/Jakarta");
  await page.selectOption("#settDefaultLang", "en");
  await page.click("#saveBrandingBtn");

  await expect(page.locator("#settPlatformName")).toHaveValue("E2E Academy");
  await expect(page.locator("#settDefaultTimezone")).toHaveValue("Asia/Jakarta");
  await expect(page.locator("#settDefaultLang")).toHaveValue("en");

  const emailReminder = page.locator("#emailReminder");
  await expect(emailReminder).toBeChecked();
  await emailReminder.uncheck();
  await page.click("#saveEmailSettingsBtn");
  await expect(emailReminder).not.toBeChecked();

  await expect(page.locator("#storageDB")).toHaveText("125.0 MB / 500.0 MB");
  await expect(page.locator("#storageFiles")).toHaveText("512.0 MB / 0.98 GB");
  await expect(page.locator("#storageDBBar")).toHaveAttribute("style", /width:\s*25%/);
  await expect(page.locator("#storageFilesBar")).toHaveAttribute("style", /width:\s*51%/);
});

test("admin settings storage monitor falls back to row and bucket estimates", async ({ page }) => {
  await installSupabaseStub(page, "admin", {
    storageFiles: {
      avatars: [
        { name: "admin.png", metadata: { size: 1048576 } }
      ],
      "course-materials": [
        { name: "guide.pdf", metadata: { size: 2097152 } }
      ],
      "assignment-submissions": []
    }
  });
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='settings']").click();

  await expect(page.locator("#storageDB")).toHaveText(/ MB \/ 500\.0 MB$/);
  await expect(page.locator("#storageDB")).not.toHaveText("— / 500 MB");
  await expect(page.locator("#storageFiles")).toHaveText("3.0 MB / 0.98 GB");
  await expect(page.locator("#storageFilesBar")).toHaveAttribute("style", /width:\s*0%/);
  await expect(page.locator("#storageNote")).toHaveText(
    "Estimated from row counts · File storage from bucket listing"
  );
});

test("admin can delete a course from the list", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html");
  await expect(page.locator("#sidebarName")).toHaveText("E2E Admin");

  await page.locator(".ad-nav__item[data-section='courses']").click();
  await expect(page.locator("#section-courses")).toHaveClass(/active/);

  const courseRows = page.locator(".ad-course-row");
  await expect(courseRows).toHaveCount(2);

  const targetRow = page.locator(".ad-course-row", { hasText: "Emergency Response" });
  await targetRow.locator("[data-action='delete']").click();
  const confirmModal = page.getByRole("dialog");
  await expect(confirmModal).toContainText("Delete this course?");
  await confirmModal.getByRole("button", { name: "Hapus" }).click();

  await expect(targetRow).toHaveCount(0);
  await expect(courseRows).toHaveCount(1);
});

test("admin can filter users by role tabs", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='users']").click();
  await expect(page.locator("#section-users")).toHaveClass(/active/);

  const allTab = page.locator("#section-users .ad-filter-tab[data-filter='all']");
  const trainerTab = page.locator("#section-users .ad-filter-tab[data-filter='trainer']");
  const adminTab = page.locator("#section-users .ad-filter-tab[data-filter='admin']");

  await expect(allTab).toHaveClass(/active/);

  await trainerTab.click();
  await expect(trainerTab).toHaveClass(/active/);

  await adminTab.click();
  await expect(adminTab).toHaveClass(/active/);

  await allTab.click();
  await expect(allTab).toHaveClass(/active/);
});

test("admin enrollments table renders status tags", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='enrollments']").click();
  await expect(page.locator("#section-enrollments")).toHaveClass(/active/);

  await expect(page.locator(".ad-tag", { hasText: "Paid" })).toHaveCount(1);
  await expect(page.locator(".ad-tag", { hasText: "Pending" })).toHaveCount(1);
  await expect(page.locator(".ad-tag", { hasText: "Failed" })).toHaveCount(1);

  await expect(page.locator("#enrollmentTableBody tr.ad-enroll-row")).toHaveCount(3);
  await expect(page.locator("#enrollmentTableBody")).toContainText("Rp\u00a0120");
  await expect(page.locator("#enrollmentTableBody")).toContainText("Rp\u00a050");
  await expect(page.locator("#enrollmentTableBody")).toContainText("Rp\u00a075");
});

});

