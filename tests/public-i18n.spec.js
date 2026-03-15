const { test, expect } = require("@playwright/test");

function collectTranslationWarnings(page) {
  const warnings = [];
  page.on("console", (msg) => {
    if (msg.type() !== "warning") return;
    const text = msg.text();
    if (text.includes("Translation missing for key:")) {
      warnings.push(text);
    }
  });
  return warnings;
}

async function installSupabaseStub(page, role = "admin") {
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
    }
  ];

  const payments = [];
  const kpiRow = {
    trainer_id: role === "admin" ? "e2e-admin" : "e2e-trainer",
    total_students: 0,
    courses_created: 0,
    pending_grading: 0,
    avg_completion_percent: 0
  };

  const tableData = {
    profiles,
    payments,
    schedules: [],
    assignment_submissions: [],
    messages: [],
    announcements: [],
    certificates: [],
    v_trainer_dashboard: [kpiRow],
    v_students_at_risk: [],
    activity_logs: [],
    courses: [],
    enrollments: [],
    forum_posts: [],
    notifications: [],
    v_course_overview: []
  };

  const profile = profiles.find((p) => p.role === role) || profiles[0];

  const supabaseStub = `
    (() => {
      const tableData = ${JSON.stringify(tableData)};
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
          lt: () => api,
          gte: () => api,
          limit: (n) => {
            limitValue = n;
            return api;
          },
          single: () => Promise.resolve({ data: rows[0] || null, error: null }),
          insert: () => api,
          update: () => api,
          delete: () => api
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

test("blog and legal pages have no missing i18n keys", async ({ page }) => {
  const warnings = collectTranslationWarnings(page);

  await page.goto("/pages/blog.html");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(200);
  await expect(warnings, "No translation warnings on blog page").toHaveLength(0);

  await page.goto("/pages/legal.html");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(200);
  await expect(warnings, "No translation warnings on legal page").toHaveLength(0);
});

test("dashboard admin has no missing i18n keys", async ({ page }) => {
  await installSupabaseStub(page, "admin");
  const warnings = collectTranslationWarnings(page);

  await page.goto("/pages/dashboard-admin.html");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(400);

  await expect(warnings, "No translation warnings on dashboard admin").toHaveLength(0);
});
