const { test, expect } = require("@playwright/test");

function buildProfiles() {
  return [
    {
      id: "student-qa-1",
      full_name: "QA Student",
      role: "student",
      student_id: "ST-QA-001",
      email: "qa.student@example.com",
      admin_id: null,
    },
    {
      id: "admin-qa-1",
      full_name: "QA Admin",
      role: "admin",
      student_id: null,
      email: "qa.admin@example.com",
      admin_id: "AD-QA-001",
    },
    {
      id: "trainer-qa-1",
      full_name: "QA Trainer",
      role: "trainer",
      student_id: null,
      email: "qa.trainer@example.com",
      admin_id: "TR-QA-001",
    },
    {
      id: "marketer-qa-1",
      full_name: "QA Marketer",
      role: "marketer",
      student_id: null,
      email: "qa.marketer@example.com",
      admin_id: null,
    },
    {
      id: "staff-qa-1",
      full_name: "QA Staff",
      role: "staff",
      student_id: null,
      email: "qa.staff@example.com",
      admin_id: null,
    },
  ];
}

function buildSessionState(mode, currentUser) {
  const now = Math.floor(Date.now() / 1000);
  const session = {
    access_token: `${mode}-${currentUser.id}-token`,
    expires_at: mode === "expired" ? now - 60 : now + 3600,
    expires_in: mode === "expired" ? -60 : 3600,
    token_type: "bearer",
    user: currentUser,
  };

  return {
    session: mode === "forced-logout" ? null : session,
    user: mode === "forced-logout" ? null : currentUser,
    signOutCalls: 0,
    getUserError: mode === "forged" ? "JWT signature invalid" : null,
  };
}

function buildSupabaseStub({ storageKey, profiles, initialState }) {
  return `
    (() => {
      const storageKey = ${JSON.stringify(storageKey)};
      const profiles = ${JSON.stringify(profiles)};
      const initialState = ${JSON.stringify(initialState)};

      const readState = () => {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return { ...initialState };
        try {
          const parsed = JSON.parse(raw);
          return {
            ...initialState,
            ...parsed
          };
        } catch (err) {
          return { ...initialState };
        }
      };

      const writeState = (state) => {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
        window.__QA_AUTH_STATE__ = state;
      };

      writeState(readState());

      const getValue = (obj, path) => {
        if (!obj) return undefined;
        return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
      };

      const makeResponse = (rows) => ({
        data: rows,
        error: null,
        count: Array.isArray(rows) ? rows.length : 0
      });

      const toComparable = (value) => {
        if (!value) return value;
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) return date.getTime();
        return value;
      };

      const createQuery = (table) => {
        const baseRows = Array.isArray(table === "profiles" ? profiles : []) ? (table === "profiles" ? profiles : []) : [];
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
          maybeSingle: () => Promise.resolve({ data: rows[0] || null, error: null }),
          insert: (payload) => {
            const items = Array.isArray(payload) ? payload : [payload];
            items.forEach((item) => {
              if (!item.id) {
                item.id = table + "-qa-" + Math.random().toString(36).slice(2, 10);
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
            getSession: async () => {
              const state = readState();
              return {
                data: { session: state.session },
                error: null
              };
            },
            getUser: async () => {
              const state = readState();
              if (state.getUserError) {
                return {
                  data: { user: null },
                  error: { message: state.getUserError }
                };
              }
              return {
                data: { user: state.user },
                error: null
              };
            },
            signOut: async () => {
              const state = readState();
              state.session = null;
              state.user = null;
              state.signOutCalls += 1;
              writeState(state);
              return { error: null };
            }
          },
          from: (table) => createQuery(table),
          channel: () => ({
            on: () => ({ subscribe: () => ({}) })
          }),
          storage: {
            from: () => ({
              upload: async () => ({ error: null }),
              getPublicUrl: () => ({ data: { publicUrl: "" } })
            })
          }
        })
      };
    })();
  `;
}

async function installSessionStub(page, { mode, currentUser, profiles }) {
  const storageKey = `__qa_auth_state_${mode}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const initialState = buildSessionState(mode, currentUser);
  const stub = buildSupabaseStub({ storageKey, profiles, initialState });

  await page.addInitScript((key) => {
    window.__QA_AUTH_STATE_KEY__ = key;
  }, storageKey);

  await page.route("**/*supabase-js@2*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/javascript; charset=utf-8",
      body: stub,
    });
  });

  return storageKey;
}

async function getAuthState(page, storageKey) {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, storageKey);
}

async function expectLoginPageReady(page) {
  await expect(page).toHaveURL(/\/pages\/login\.html$/);
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("#loginFormLMS")).toBeVisible();
}

test.describe("Session edge cases", { tag: ["@auth", "@rbac", "@critical"] }, () => {
  test("expired session redirects to login and clears the stale session", async ({ page }) => {
    const profiles = buildProfiles();
    const storageKey = await installSessionStub(page, {
      mode: "expired",
      currentUser: profiles[0],
      profiles,
    });

    await page.goto("/pages/dashboard-student.html", {
      waitUntil: "domcontentloaded",
    });

    await expectLoginPageReady(page);

    const authState = await getAuthState(page, storageKey);
    expect(authState?.signOutCalls).toBe(1);
  });

  test("forged token behavior redirects to login instead of rendering protected content", async ({ page }) => {
    const profiles = buildProfiles();
    const storageKey = await installSessionStub(page, {
      mode: "forged",
      currentUser: profiles[0],
      profiles,
    });

    await page.goto("/pages/dashboard-student.html", {
      waitUntil: "domcontentloaded",
    });

    await expectLoginPageReady(page);

    const authState = await getAuthState(page, storageKey);
    expect(authState?.signOutCalls).toBe(1);
  });

  test("forced logout clears the session before the next protected visit", async ({ page }) => {
    const profiles = buildProfiles();
    const storageKey = await installSessionStub(page, {
      mode: "valid",
      currentUser: profiles[1],
      profiles,
    });

    await page.goto("/pages/dashboard-admin.html", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForURL(/\/pages\/dashboard-admin\.html$/);

    await page.evaluate((key) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const state = JSON.parse(raw);
      state.session = null;
      state.user = null;
      window.localStorage.setItem(key, JSON.stringify(state));
    }, storageKey);

    await page.goto("/pages/dashboard-admin.html", {
      waitUntil: "domcontentloaded",
    });

    await expect(page).toHaveURL(/\/pages\/login\.html$/);
    await expect(page.locator("#loginFormLMS")).toBeVisible();
  });
});
