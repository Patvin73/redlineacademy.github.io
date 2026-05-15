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
  const lessons = [];
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
    forum_posts: [],
    notifications: [],
    v_course_overview: options.courseOverview || []
  };

  const profile = profiles.find((p) => p.role === role) || profiles[0];

  const supabaseStub = `
    (() => {
      const tableData = ${JSON.stringify(tableData)};
      const uploadedFiles = [];
      const functionInvocations = [];
      const shouldFailOverviewTrainerId = ${JSON.stringify(Boolean(options.missingOverviewTrainerId))};
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

      const createQuery = (table) => {
        const baseRows = Array.isArray(tableData[table]) ? tableData[table] : [];
        let rows = baseRows.slice();
        let limitValue = null;
        let pendingUpdate = null;
        let pendingDelete = false;
        let queryError = null;

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
              const value = getValue(row, col);
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
          or: () => api,
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
          from: (table) => createQuery(table),
          functions: {
            invoke: async (name, options = {}) => {
              functionInvocations.push({ name, body: options.body || null });
              return { data: { ok: true, email_sent: true }, error: null };
            }
          },
          storage: {
            from: (bucket) => ({
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

  const toggleBtn = rows.first().locator("button[data-action='toggle-active']");
  await expect(toggleBtn).toHaveText("Suspend");
  await toggleBtn.scrollIntoViewIfNeeded();
  await toggleBtn.click({ force: true });
  await expect(toggleBtn).toHaveText("Activate");
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
  await expect(page.locator("#adMsgRecipient")).toHaveValue("e2e-student-1");
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
  await expect(page.locator(".ad-inbox-item.unread")).toHaveCount(1);
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
});

test("trainer can compose a system message to an enrolled student", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#sidebarRoleBadge")).toHaveText("Trainer");

  await page.locator(".ad-nav__item[data-section='messages']").click();
  await page.locator("#adNewMsgBtn").click();

  await expect(page.locator("#adMsgComposeForm")).toBeVisible();
  await expect(page.locator("#adMsgViewEmpty")).toBeHidden();
  await expect(page.locator("#adMsgDetail")).toBeHidden();

  const recipients = await page.locator("#adMsgRecipient option").allTextContents();
  expect(recipients).toContain("Alpha Student");
  expect(recipients).not.toContain("Bravo Student");

  await page.selectOption("#adMsgRecipient", "e2e-student-1");
  await page.fill("#adMsgBody", "Please review Module 2.");
  await page.locator("#adSendMsgBtn").click();

  await expect(page.locator("#adMsgComposeMsg")).toContainText(/Message sent\.|Pesan terkirim\./);
  const sentMessages = await page.evaluate(() => window.__e2eGetTableData().messages);
  const sentMessage = sentMessages.find((msg) =>
    msg.sender_id === "e2e-trainer" &&
    msg.recipient_id === "e2e-student-1" &&
    msg.body === "Please review Module 2."
  );
  expect(sentMessage).toEqual(expect.objectContaining({
      sender_id: "e2e-trainer",
      recipient_id: "e2e-student-1",
      body: "Please review Module 2."
  }));
  const emailInvocations = await page.evaluate(() => window.__e2eGetFunctionInvocations());
  expect(emailInvocations).toEqual(expect.arrayContaining([
    { name: "send-message-email", body: { message_id: sentMessage.id } }
  ]));
});

test("admin composer lists all other users and cancel hides the form", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#sidebarRoleBadge")).toHaveText("Admin");

  await page.locator(".ad-nav__item[data-section='messages']").click();
  await page.locator("#adNewMsgBtn").click();

  await expect(page.locator("#adMsgComposeForm")).toBeVisible();
  const recipients = await page.locator("#adMsgRecipient option").allTextContents();
  expect(recipients).toContain("E2E Trainer");
  expect(recipients).toContain("Alpha Student");
  expect(recipients).toContain("Bravo Student");
  expect(recipients).not.toContain("E2E Admin");

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

  page.once("dialog", (dialog) => dialog.accept());
  await announcementItem.locator(".ad-icon-btn--danger").click();
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
  await installSupabaseStub(page, "admin");
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

  await expect(page.locator("#storageDB")).toContainText("/ 500 MB");
  await expect(page.locator("#storageFiles")).toContainText("/ 1 GB");
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
  page.once("dialog", (dialog) => dialog.accept());
  await targetRow.locator("[data-action='delete']").click();

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

