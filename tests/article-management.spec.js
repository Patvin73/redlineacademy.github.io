const { test, expect } = require("@playwright/test");

test.describe.configure({ timeout: 60000 });

const SDK_ROUTE_MATCHERS = [
  "**/npm/@supabase/supabase-js@2*",
  "**/dist/umd/supabase.js*"
];

const EXTERNAL_ASSET_MATCHERS = [
  "https://www.googletagmanager.com/**",
  "https://fonts.googleapis.com/**",
  "https://fonts.gstatic.com/**",
  "https://cdnjs.cloudflare.com/**"
];

const ADMIN_USER = {
  id: "admin-e2e",
  email: "admin-e2e@example.com"
};

const ADMIN_PROFILE = {
  id: "admin-e2e",
  full_name: "E2E Admin",
  role: "admin",
  admin_id: "ADM-E2E",
  email: "admin-e2e@example.com"
};

function buildSupabaseSdkStub() {
  return `
    (() => {
      const ARTICLE_KEY = "__e2eArticles";
      const profiles = [${JSON.stringify(ADMIN_PROFILE)}];
      const currentUser = ${JSON.stringify(ADMIN_USER)};

      const readArticles = () => {
        try {
          const raw = window.localStorage.getItem(ARTICLE_KEY);
          const parsed = raw ? JSON.parse(raw) : [];
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          return [];
        }
      };

      const writeArticles = (articles) => {
        window.localStorage.setItem(ARTICLE_KEY, JSON.stringify(articles));
      };

      const getValue = (row, key) => {
        if (!row) return undefined;
        return String(key || "")
          .split(".")
          .reduce((acc, part) => (acc == null ? acc : acc[part]), row);
      };

      const toComparable = (value) => {
        if (value == null) return value;
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) return date.getTime();
        return value;
      };

      const applySelectResult = (rows, singleMode) => {
        const data = singleMode ? rows[0] || null : rows;
        return Promise.resolve({
          data,
          error: null,
          count: Array.isArray(rows) ? rows.length : data ? 1 : 0
        });
      };

      const createQuery = (table) => {
        const getTableRows = () => {
          if (table === "articles") return readArticles();
          if (table === "profiles") return profiles.slice();
          return [];
        };

        let rows = getTableRows();
        let op = "select";
        let pendingUpsert = null;
        let singleMode = false;

        const api = {
          select: () => {
            op = "select";
            return api;
          },
          eq: (col, val) => {
            rows = rows.filter((row) => {
              const value = getValue(row, col);
              if (typeof value === "undefined") return true;
              return value === val;
            });
            return api;
          },
          order: (col, options = {}) => {
            const ascending = options.ascending !== false;
            rows = rows.slice().sort((leftRow, rightRow) => {
              const left = toComparable(getValue(leftRow, col));
              const right = toComparable(getValue(rightRow, col));
              if (left === right) return 0;
              if (left == null) return 1;
              if (right == null) return -1;
              return ascending ? (left > right ? 1 : -1) : (left < right ? 1 : -1);
            });
            return api;
          },
          maybeSingle: () => {
            singleMode = true;
            return applySelectResult(rows, true);
          },
          single: () => {
            singleMode = true;
            if (op === "upsert") {
              return Promise.resolve({ data: pendingUpsert, error: null });
            }
            return applySelectResult(rows, true);
          },
          upsert: (payload) => {
            op = "upsert";
            const record = { ...payload };
            const articles = readArticles();
            const index = articles.findIndex((article) => article.id === record.id);
            const now = new Date().toISOString();

            if (index >= 0) {
              const existing = articles[index];
              const next = {
                ...existing,
                ...record,
                created_at: existing.created_at || now,
                updated_at: now
              };
              articles[index] = next;
              pendingUpsert = next;
            } else {
              const next = {
                ...record,
                created_at: now,
                updated_at: now
              };
              articles.unshift(next);
              pendingUpsert = next;
            }

            writeArticles(articles);
            rows = [pendingUpsert];
            return api;
          },
          delete: () => {
            op = "delete";
            return api;
          },
          then: (resolve, reject) => {
            let result;
            if (op === "delete") {
              const currentRows = readArticles();
              const deleteIds = new Set(rows.map((row) => row.id));
              const nextRows = currentRows.filter((row) => !deleteIds.has(row.id));
              writeArticles(nextRows);
              result = Promise.resolve({ data: null, error: null, count: deleteIds.size });
            } else if (op === "upsert") {
              result = Promise.resolve({ data: [pendingUpsert], error: null, count: pendingUpsert ? 1 : 0 });
            } else {
              result = applySelectResult(rows, singleMode);
            }

            return result.then(resolve, reject);
          },
          catch: (reject) => api.then((value) => value, reject)
        };

        return api;
      };

      window.supabase = {
        createClient: () => ({
          auth: {
            getSession: async () => ({
              data: {
                session: {
                  user: currentUser,
                  expires_at: Math.floor(Date.now() / 1000) + 3600
                }
              },
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
          }),
          storage: {
            from: () => ({
              upload: async () => ({ error: null }),
              getPublicUrl: (path) => ({ data: { publicUrl: "https://example.com/" + path } })
            })
          }
        })
      };
    })();
  `;
}

async function installSdkStub(page) {
  const stub = buildSupabaseSdkStub();
  for (const matcher of SDK_ROUTE_MATCHERS) {
    await page.route(matcher, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript; charset=utf-8",
        body: stub
      });
    });
  }

  for (const matcher of EXTERNAL_ASSET_MATCHERS) {
    await page.route(matcher, async (route) => {
      await route.fulfill({ status: 204, body: "" });
    });
  }
}

async function seedAdminSession(page, initialArticles = []) {
  await page.addInitScript(
    ({ user, articles }) => {
      window.localStorage.setItem(
        "lms_user",
        JSON.stringify({
          id: user.id,
          name: "E2E Admin",
          role: "admin",
          email: user.email
        })
      );
      if (window.localStorage.getItem("__e2eArticles") == null) {
        window.localStorage.setItem("__e2eArticles", JSON.stringify(articles));
      }
      window.confirm = () => true;
      window.alert = () => {};
    },
    { user: ADMIN_USER, articles: initialArticles }
  );
}

async function openEditor(page) {
  await page.goto("/pages/create-article.html");
  await expect(page.locator("#editorModeLabel")).toContainText("Buat Artikel Baru");
}

async function fillArticleForm(page, article) {
  await page.locator("#artTitle").fill(article.title);
  await expect(page.locator("#artSlug")).toHaveValue(article.slug);
  await page.locator("#artExcerpt").fill(article.excerpt);
  await page.locator("#artBadge").fill(article.badge);
  await page.locator("#artType").selectOption(article.type);
  await page.locator("#artDifficulty").selectOption(article.difficulty);
  await page.locator("#artReadTime").fill(String(article.readTime));
  await page.locator("#artCategory").fill(article.category);
  await page.locator("#artImageUrl").fill(article.imageUrl);
  await page.locator("#artMetaDesc").fill(article.metaDesc);
  await page.locator("#artContent").fill(article.content);
}

async function switchToListTab(page) {
  await page.locator("#tab-list").click();
  await expect(page.locator("#panel-list")).toHaveClass(/active/);
}

function makeArticle(overrides = {}) {
  return {
    title: "E2E Artikel Caregiver",
    slug: "e2e-artikel-caregiver",
    excerpt: "Ringkasan artikel E2E untuk menguji alur publish artikel dari admin.",
    badge: "Artikel",
    type: "article",
    difficulty: "beginner",
    readTime: 6,
    category: "caregiver, e2e",
    imageUrl: "https://example.com/e2e-article.jpg",
    metaDesc: "Meta description artikel E2E untuk regression test.",
    content: "<p>Isi artikel E2E yang dipakai untuk menguji alur kelola artikel.</p>",
    ...overrides
  };
}

test.describe("admin article management", () => {
  test.beforeEach(async ({ page }) => {
    await installSdkStub(page);
  });

  test("admin can save draft, publish, edit, and delete article from the manager", async ({ page }) => {
    await seedAdminSession(page);
    const article = makeArticle();

    await openEditor(page);
    await fillArticleForm(page, article);

    await page.locator("#btnSaveDraft").click();
    await expect(page.locator("#caToastText")).toContainText("Draft berhasil disimpan");
    await expect(page.locator("#currentStatusBadge")).toContainText("Draft");

    await switchToListTab(page);
    const row = page.locator("#articleListEl .ca-article-item").filter({ hasText: article.title });
    await expect(row).toContainText("Draft");
    await expect(row.getByRole("button", { name: "Publish" })).toBeVisible();

    await row.getByRole("button", { name: "Edit" }).click();
    await expect(page.locator("#editorModeLabel")).toContainText("Edit Artikel");
    await page.locator("#artExcerpt").fill("Ringkasan artikel E2E yang sudah diperbarui sebelum publish.");
    await page.locator("#btnPublish").click();

    await expect(page.locator("#caToastText")).toContainText("Artikel berhasil dipublikasikan");
    await expect(page.locator("#currentStatusBadge")).toContainText("Published");

    await switchToListTab(page);
    const publishedRow = page.locator("#articleListEl .ca-article-item").filter({ hasText: article.title });
    await expect(publishedRow).toContainText("Published");
    await expect(publishedRow.getByRole("link", { name: "Lihat" })).toHaveAttribute(
      "href",
      /article-view\.html\?slug=e2e-artikel-caregiver/
    );

    await publishedRow.getByRole("button", { name: "Hapus" }).click();
    await expect(page.locator("#caToastText")).toContainText("Artikel berhasil dihapus");
    await expect(page.locator("#articleListEl")).not.toContainText(article.title);
  });

  test("admin can quick-publish a draft from the article list", async ({ page }) => {
    await seedAdminSession(page);
    const article = makeArticle({
      title: "Quick Publish Artikel E2E",
      slug: "quick-publish-artikel-e2e"
    });

    await openEditor(page);
    await fillArticleForm(page, article);
    await page.locator("#btnSaveDraft").click();
    await expect(page.locator("#caToastText")).toContainText("Draft berhasil disimpan");

    await switchToListTab(page);
    const row = page.locator("#articleListEl .ca-article-item").filter({ hasText: article.title });
    await row.getByRole("button", { name: "Publish" }).click();

    await expect(page.locator("#caToastText")).toContainText("Artikel berhasil dipublikasikan");
    await expect(row).toContainText("Published");
    await expect(row.getByRole("link", { name: "Lihat" })).toHaveAttribute(
      "href",
      /article-view\.html\?slug=quick-publish-artikel-e2e/
    );
  });

  test("published articles appear on index.html and blog.html", async ({ page }) => {
    await seedAdminSession(page);
    const article = makeArticle({
      title: "Artikel Publik E2E",
      slug: "artikel-publik-e2e",
      excerpt: "Artikel ini harus muncul di index dan blog setelah dipublikasikan."
    });

    await openEditor(page);
    await fillArticleForm(page, article);
    await page.locator("#btnPublish").click();
    await expect(page.locator("#caToastText")).toContainText("Artikel berhasil dipublikasikan");

    await page.goto("/index.html");
    await expect.soft(page.locator("#rl-dynamic-articles")).toContainText(article.title);
    await expect.soft(page.locator("#rl-dynamic-articles")).toContainText(article.excerpt);

    await page.goto("/pages/blog.html");
    await expect.soft(page.locator("#rl-blog-dynamic-articles")).toContainText(article.title);
    await expect.soft(page.locator("#rl-blog-dynamic-articles")).toContainText(article.excerpt);
  });
});
