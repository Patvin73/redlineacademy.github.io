const { test, expect } = require("@playwright/test");

async function installGuestSupabaseStub(page) {
  const supabaseStub = `
    (() => {
      window.supabase = {
        createClient: () => ({
          auth: {
            getSession: async () => ({
              data: { session: null },
              error: null
            }),
            getUser: async () => ({
              data: { user: null },
              error: null
            }),
            signOut: async () => ({ error: null }),
            setSession: async () => ({ data: {}, error: null })
          },
          from: () => ({
            select() { return this; },
            eq() { return this; },
            single: async () => ({ data: null, error: null })
          }),
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
      body: supabaseStub,
    });
  });
}

test.describe("Login page i18n", () => {
  test("language switcher updates login labels and placeholders", async ({ page }) => {
    await installGuestSupabaseStub(page);

    await page.addInitScript(() => {
      localStorage.removeItem("language");
    });

    await page.goto("/pages/login.html");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    await expect(page.locator("h1[data-i18n='lmsLoginTitle']")).toHaveText("Login LMS");
    await expect(page.locator("#tabLabelLMS")).toHaveText("Login LMS");
    await expect(page.locator("#staffPanelSubtitle")).toHaveText(
      "Masuk ke portal komisi & manajemen pemasaran."
    );
    await expect(page.locator("#lms-email")).toHaveAttribute("placeholder", "Email Anda");
    await expect(page.locator("#lms-password")).toHaveAttribute(
      "placeholder",
      "Masukkan password Anda"
    );

    await page.locator(".lang-btn[data-lang='en']").click();

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1[data-i18n='lmsLoginTitle']")).toHaveText("LMS Login");
    await expect(page.locator("#tabLabelLMS")).toHaveText("LMS Login");
    await expect(page.locator("#tabLabelStaff")).toHaveText("Marketer Portal");
    await expect(page.locator("#staffPanelSubtitle")).toHaveText(
      "Sign in to the commission & marketing management portal."
    );
    await expect(page.locator("#staffLoginBtn")).toHaveText("Sign In to Portal");
    await expect(page.locator("#lms-email")).toHaveAttribute("placeholder", "Your Email");
    await expect(page.locator("#lms-password")).toHaveAttribute(
      "placeholder",
      "Enter your password"
    );
    await expect(page.locator("#staff-email")).toHaveAttribute("placeholder", "Your Email");
    await expect(page.locator("#staff-password")).toHaveAttribute(
      "placeholder",
      "Enter your password"
    );

    await expect.poll(async () => page.evaluate(() => localStorage.getItem("language"))).toBe(
      "en"
    );
  });
});
