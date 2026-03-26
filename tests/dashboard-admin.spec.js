const { test, expect } = require("@playwright/test");

test.setTimeout(60000);

function makeLocalDateTime(daysFromNow, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function installSupabaseStub(page, role) {
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
      currency: "AUD",
      payment_method: "card",
      status: "completed",
      paid_at: "2026-03-10T10:00:00.000Z",
      profiles: { full_name: "Alpha Student" },
      courses: { title: "Safety 101" }
    },
    {
      id: "pay-2",
      amount: "50",
      currency: "AUD",
      payment_method: "manual",
      status: "pending",
      paid_at: "2026-03-11T10:00:00.000Z",
      profiles: { full_name: "Bravo Student" },
      courses: { title: "Rigging Basics" }
    },
    {
      id: "pay-3",
      amount: "75",
      currency: "AUD",
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

  const schedules = [];

  const assignmentSubmissions = [
    {
      id: "sub-1",
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
      subject: "Question",
      body: "Need help with Module 2.",
      is_read: false,
      created_at: "2026-03-10T08:00:00.000Z",
      profiles: { full_name: "Alpha Student", avatar_url: null }
    },
    {
      id: "msg-2",
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
      thumbnail_url: "",
      created_at: "2026-03-01T08:00:00.000Z",
      categories: { name: "Communication" }
    },
    {
      id: "course-2",
      title: "Emergency Response",
      status: "draft",
      category_id: "first-aid",
      thumbnail_url: "",
      created_at: "2026-03-02T08:00:00.000Z",
      categories: { name: "First Aid" }
    }
  ];

  const announcements = [];
  const certificates = [{ id: "cert-1" }, { id: "cert-2" }];

  const tableData = {
    profiles,
    payments,
    schedules,
    assignment_submissions: assignmentSubmissions,
    messages: defaultMessages,
    announcements,
    certificates,
    v_trainer_dashboard: [kpiRow],
    v_students_at_risk: [],
    activity_logs: [],
    courses,
    enrollments: [],
    forum_posts: [],
    notifications: [],
    v_course_overview: []
  };

  const profile = profiles.find((p) => p.role === role) || profiles[0];

  const supabaseStub = `
    (() => {
      const tableData = ${JSON.stringify(tableData)};
      const storedMessages = window.localStorage.getItem("__e2eMessages");
      if (storedMessages) {
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

        const toComparable = (value) => {
          if (!value) return value;
          const date = new Date(value);
          if (!Number.isNaN(date.getTime())) return date.getTime();
          return value;
        };

        const api = {
          select: () => api,
          eq: (col, val) => {
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
            rows.forEach((row) => Object.assign(row, payload));
            return api;
          },
          delete: () => {
            rows.forEach((row) => {
              const idx = baseRows.indexOf(row);
              if (idx >= 0) baseRows.splice(idx, 1);
            });
            return api;
          }
        };

        api.then = (resolve) => {
          const data = limitValue ? rows.slice(0, limitValue) : rows;
          return resolve(makeResponse(data));
        };
        api.catch = (reject) => Promise.resolve(makeResponse(rows)).catch(reject);
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
          channel: () => ({
            on: () => ({ subscribe: () => ({}) })
          })
        })
      };

      window.__e2eSetMessages = (msgs) => {
        tableData.messages = msgs;
        window.localStorage.setItem("__e2eMessages", JSON.stringify(msgs));
      };
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
  await expect(page.locator("#payRevenue")).toHaveText("AU$120,00");
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
});

test("trainer can create schedule event", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='schedule']").click();
  await expect(page.locator("#section-schedule")).toHaveClass(/active/);

  await page.click("#createEventBtn");
  await expect(page.locator("#eventFormCard")).toBeVisible();

  await page.fill("#evTitle", "E2E Trainer Event");
  await page.fill("#evStart", makeLocalDateTime(2, 10));
  await page.fill("#evEnd", makeLocalDateTime(2, 11));

  await page.click("#saveEventBtn");
  await expect(page.locator("#eventMsg")).toContainText("Event created");

  await expect(page.locator(".ad-event-row__title", { hasText: "E2E Trainer Event" })).toBeVisible();
});

test("trainer sees unread messages badge", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='messages']").click();
  await expect(page.locator("#section-messages")).toHaveClass(/active/);

  await expect(page.locator("#adMsgBadge")).toHaveText("1");
  await expect(page.locator(".ad-inbox-item.unread")).toHaveCount(1);
});

test("trainer can mark message as read (simulated)", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='messages']").click();
  await expect(page.locator("#section-messages")).toHaveClass(/active/);
  await expect(page.locator("#adMsgBadge")).toHaveText("1");

  await page.evaluate(() => {
    const msgs = [
      {
        id: "msg-1",
        subject: "Question",
        body: "Need help with Module 2.",
        is_read: true,
        created_at: "2026-03-10T08:00:00.000Z",
        profiles: { full_name: "Alpha Student", avatar_url: null }
      }
    ];
    if (window.__e2eSetMessages) window.__e2eSetMessages(msgs);
  });

  await page.reload();
  await page.locator(".ad-nav__item[data-section='messages']").click();
  await expect(page.locator("#adMsgBadge")).toBeHidden();
});

test("trainer sees empty state when no messages", async ({ page }) => {
  await installSupabaseStub(page, "trainer");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.evaluate(() => {
    if (window.__e2eSetMessages) window.__e2eSetMessages([]);
  });

  await page.reload();
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

test("admin can publish and delete announcement", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='announcements']").click();
  await expect(page.locator("#section-announcements")).toHaveClass(/active/);

  await page.click("#createAnnouncementBtn");
  await expect(page.locator("#announcementFormCard")).toBeVisible();

  await page.fill("#anTitle", "E2E Announcement");
  await page.fill("#anBody", "This is an automated admin announcement.");
  await page.click("#saveAnnouncementBtn");

  await expect(page.locator("#annMsg")).toContainText("Announcement published");
  const announcementItem = page.locator(".ad-announcement-item", { hasText: "E2E Announcement" });
  await expect(announcementItem).toBeVisible();

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

test("admin sees reports revenue metrics", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

  await page.locator(".ad-nav__item[data-section='reports']").click();
  await expect(page.locator("#section-reports")).toHaveClass(/active/);

  await expect(page.locator("#metricRevenue")).toHaveText("$120.00");
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
  await page.goto("/pages/dashboard-admin.html", { waitUntil: "domcontentloaded" });

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
  await expect(page.locator("#enrollmentTableBody")).toContainText("AU$120,00");
  await expect(page.locator("#enrollmentTableBody")).toContainText("AU$50,00");
  await expect(page.locator("#enrollmentTableBody")).toContainText("AU$75,00");
});

});

