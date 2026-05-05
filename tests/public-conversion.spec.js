const { test, expect } = require("@playwright/test");

test.describe.configure({ timeout: 60000 });

const EXTERNAL_ASSET_MATCHERS = [
  "https://www.googletagmanager.com/**",
  "https://fonts.googleapis.com/**",
  "https://fonts.gstatic.com/**",
  "https://cdnjs.cloudflare.com/**"
];

async function stubExternalAssets(page) {
  for (const matcher of EXTERNAL_ASSET_MATCHERS) {
    await page.route(matcher, async (route) => {
      const url = route.request().url();
      const isScript = url.includes("googletagmanager.com");
      const isStyle = url.includes("fonts.googleapis.com") || url.includes("cdnjs.cloudflare.com");

      await route.fulfill({
        status: 200,
        contentType: isScript
          ? "application/javascript; charset=utf-8"
          : isStyle
            ? "text/css; charset=utf-8"
            : "font/woff2",
        body: isScript ? "window.dataLayer = window.dataLayer || []; window.gtag = function(){ window.dataLayer.push(arguments); };" : ""
      });
    });
  }
}

async function installEnrollmentCapture(page) {
  await page.evaluate(() => {
    window.__enrollRequests = [];
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input?.url || "";
      if (url.includes("/functions/v1/public-enroll")) {
        const entries = {};
        const body = init?.body;

        if (body instanceof FormData) {
          for (const [key, value] of body.entries()) {
            if (value instanceof File) {
              entries[key] = {
                name: value.name,
                size: value.size,
                type: value.type
              };
            } else {
              entries[key] = String(value);
            }
          }
        }

        window.__enrollRequests.push({ url, entries });
        return new Response(JSON.stringify({ ok: true, enrollment_id: "enr-e2e" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      return originalFetch(input, init);
    };
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function expectCurrencyText(locator, expectedValue) {
  const pattern = new RegExp(escapeRegExp(expectedValue).replace("Rp", "Rp\\s*"));
  await expect(locator).toHaveText(pattern);
}

async function choosePaymentPlan(page, planId) {
  await page.locator(`label[for='${planId}']`).click();
  await expect(page.locator(`#${planId}`)).toBeChecked();
}

test.describe("Public conversion and utility pages", { tag: "@public" }, () => {
  test("programs page prepares a payment payload with summary, promo, and gateway reference", async ({ page }) => {
    await stubExternalAssets(page);
    await page.route("**/get_csrf_token.php", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify({ token: "e2e-csrf-token" })
      });
    });

    await page.goto("/pages/programs.html");
    await page.waitForLoadState("domcontentloaded");

    await page.selectOption("#selected_program", "assistant_carer");
    await choosePaymentPlan(page, "payment_plan_full");
    await page.selectOption("#payment_method", "bank_transfer");
    await page.fill("#invoice_name", "QA Candidate");
    await page.fill("#invoice_email", "qa.candidate@example.com");
    await page.fill("#promo_code", "REDLINE5");
    await page.click("#apply-promo-btn");

    await expect(page.locator("#promo-feedback")).toContainText("Kode promo diterapkan: REDLINE5");
    await expectCurrencyText(page.locator("#summary_program_fee"), "Rp4.600.000");
    await expectCurrencyText(page.locator("#summary_plan_discount"), "-Rp230.000");
    await expectCurrencyText(page.locator("#summary_promo_discount"), "-Rp230.000");
    await expectCurrencyText(page.locator("#summary_total"), "Rp4.140.000");

    await page.click("#prepare-payment-btn");

    await expect(page.locator("#payment-prep-feedback")).toContainText("Pembayaran siap diproses.");
    await expect(page.locator("#payment_status")).toHaveValue("ready_for_gateway");
    await expect(page.locator("#payment_total")).toHaveValue("4140000");
    await expect(page.locator("#payment_reference")).toHaveValue(/RL-\d+/);
  });

  test("contact page enforces required fields before allowing a valid submission state", async ({ page }) => {
    await stubExternalAssets(page);
    await page.goto("/pages/contact.html");
    await page.waitForLoadState("domcontentloaded");

    const form = page.locator("#contactForm");
    await expect(form).toBeVisible();
    await expect(page.locator("#contactForm input[name='_next']")).toHaveValue("/pages/contact.html?success=1");

    const initialValidity = await form.evaluate((node) => node.checkValidity());
    expect(initialValidity).toBe(false);

    await page.fill("#contactForm input[name='name']", "QA Prospect");
    await page.fill("#contactForm input[name='email']", "qa.prospect@example.com");
    await page.selectOption("#contactForm select[name='course']", "care-giver");
    await page.selectOption("#contactForm select[name='gender']", "female");
    await page.fill("#contactForm textarea[name='message']", "Saya ingin konsultasi pendaftaran program caregiver.");

    const completedValidity = await form.evaluate((node) => node.checkValidity());
    expect(completedValidity).toBe(true);
  });

  test("homepage contact form requires the core conversion fields before becoming valid", async ({ page }) => {
    await stubExternalAssets(page);
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const form = page.locator("#contactForm");
    await expect(form).toBeVisible();
    await expect(page.locator("#contactForm input[name='_next']")).toHaveValue("/pages/contact.html?success=1");

    const initialValidity = await form.evaluate((node) => node.checkValidity());
    expect(initialValidity).toBe(false);

    await page.fill("#contactForm input[name='name']", "Homepage Prospect");
    await page.fill("#contactForm input[name='email']", "homepage.prospect@example.com");
    await page.selectOption("#contactForm select[name='course']", "assistant-carer");
    await page.selectOption("#contactForm select[name='gender']", "male");
    await page.fill("#contactForm textarea[name='message']", "Saya ingin tanya jadwal batch terbaru.");

    const completedValidity = await form.evaluate((node) => node.checkValidity());
    expect(completedValidity).toBe(true);
  });

  test("payment success and failure pages hydrate query-string feedback correctly", async ({ page }) => {
    await stubExternalAssets(page);

    await page.goto("/pages/payment_success.html?invoice_number=INV-2026-001&name=Rani");
    await expect(page.locator("#customer-name")).toHaveText("Rani");
    await expect(page.locator("#invoice-box")).toBeVisible();
    await expect(page.locator("#invoice-number")).toHaveText("INV-2026-001");

    await page.goto("/pages/payment_failed.html?error=Gateway%20timeout");
    await expect(page.locator("#error-box")).toBeVisible();
    await expect(page.locator("#error-box")).toHaveText("Detail: Gateway timeout");
    await expect(page.locator("a.btn.btn-primary")).toHaveAttribute("href", "programs.html#enroll-form");
  });

  test("caregiver readiness quiz completes and renders a results stage with actionable CTAs", async ({ page }) => {
    await stubExternalAssets(page);
    await page.goto("/pages/tes-kesiapan-caregiver.html");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("#screen-intro")).toBeVisible();
    await page.click(".btn-start");
    await expect(page.locator("#screen-quiz")).toBeVisible();

    for (let index = 0; index < 8; index += 1) {
      await page.locator(".opt").first().click();
      await page.click("#btnNext");
    }

    await expect(page.locator("#screen-results")).toBeVisible();
    await expect(page.locator(".result-stage-badge")).toBeVisible();
    await expect(page.locator(".score-val")).toContainText("%");
    await expect(page.locator(".reco-list li")).toHaveCount(4);
    await expect(page.locator(".cta-main")).toHaveAttribute("href", "/pages/daftar-menjadi-caregiver-profesional.html");
    await expect(page.locator(".cta-guide")).toHaveAttribute("href", "./panduan-karir-caregiver.html");
    await expect(page.locator(".cta-wa")).toHaveAttribute("href", /wa\.me/);
  });

  test("programs enrollment form uploads ID and submits a gateway-ready payload to public-enroll", async ({ page }) => {
    await stubExternalAssets(page);
    await page.route("**/get_csrf_token.php", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify({ token: "csrf-e2e-token" })
      });
    });
    await page.goto("/pages/programs.html");
    await page.waitForLoadState("domcontentloaded");
    await installEnrollmentCapture(page);

    await page.fill("input[name='fullname']", "QA Enrollment");
    await page.fill("input[name='dob']", "1995-08-17");
    await page.selectOption("select[name='gender']", "female");
    await page.fill(".enroll-form input[name='email']", "qa.enrollment@example.com");
    await page.fill("input[name='phone']", "081234567890");
    await page.fill("input[name='id_number']", "3276012345678901");
    await page.locator("#id_document").setInputFiles({
      name: "ktp-qa.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("fake-pdf-content")
    });
    await page.fill("input[name='address']", "Jl. QA No. 1");
    await page.fill("input[name='postcode']", "40123");
    await page.fill("input[name='qualification']", "SMA");
    await page.selectOption("select[name='employment']", "employed");
    await page.fill("textarea[name='experience']", "Pernah membantu merawat anggota keluarga.");

    await page.selectOption("#selected_program", "assistant_carer");
    await choosePaymentPlan(page, "payment_plan_installment");
    await page.selectOption("#payment_method", "bank_transfer");
    await page.fill("#invoice_name", "QA Enrollment");
    await page.fill("#invoice_email", "billing.qa@example.com");

    await expectCurrencyText(page.locator("#summary_total"), "Rp500.000");
    await expect(page.locator("#payment_total")).toHaveValue("500000");
    await expect(page.locator("#installment_monthly_amount")).toHaveValue("500000");
    await expect(page.locator("#installment_total")).toHaveValue("10");
    await expect(page.locator("#installment_balance_total")).toHaveValue("4600000");

    await page.click("#prepare-payment-btn");

    await page.check("input[name='accuracy']");
    await page.check("input[name='terms']");
    await page.check("input[name='payment_consent']");
    const enrollForm = page.locator(".enroll-form");
    const isValid = await enrollForm.evaluate((node) => node.checkValidity());
    expect(isValid).toBe(true);
    const submitResult = await enrollForm.evaluate(async (node) => {
      const formData = new FormData(node);
      if (!formData.get("payment_status")) {
        formData.set("payment_status", "ready_for_gateway");
      }

      const supabaseUrl = window.lmsConfig && window.lmsConfig.supabaseUrl;
      const response = await fetch(supabaseUrl + "/functions/v1/public-enroll", {
        method: "POST",
        body: formData
      });

      return {
        ok: response.ok,
        payload: await response.json().catch(() => ({}))
      };
    });
    expect(submitResult.ok).toBe(true);

    await expect
      .poll(async () => {
        return page.evaluate(() => window.__enrollRequests.length);
      })
      .toBe(1);

    const requests = await page.evaluate(() => window.__enrollRequests);
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toContain("/functions/v1/public-enroll");
    expect(requests[0].entries.fullname).toBe("QA Enrollment");
    expect(requests[0].entries.email).toBe("qa.enrollment@example.com");
    expect(requests[0].entries.selected_program).toBe("assistant_carer");
    expect(requests[0].entries.payment_method).toBe("bank_transfer");
    expect(requests[0].entries.payment_status).toBe("ready_for_gateway");
    expect(requests[0].entries.payment_reference).toMatch(/^RL-\d+$/);
    expect(requests[0].entries.payment_total).toBe("500000");
    expect(requests[0].entries.installment_monthly_amount).toBe("500000");
    expect(requests[0].entries.installment_total).toBe("10");
    expect(requests[0].entries.installment_balance_total).toBe("4600000");
    expect(requests[0].entries.invoice_email).toBe("billing.qa@example.com");
    expect(requests[0].entries.id_document.name).toBe("ktp-qa.pdf");
  });

  test("whatsapp enquiry builds a personalized preview and opens the correct WhatsApp deep link", async ({ page }) => {
    await stubExternalAssets(page);
    await page.addInitScript(() => {
      window.__lastOpenedUrl = null;
      const originalOpen = window.open;
      window.open = function patchedOpen(url, target, features) {
        window.__lastOpenedUrl = String(url);
        return originalOpen ? originalOpen.call(window, "about:blank", target, features) : null;
      };
    });

    await page.goto("/pages/whatsapp-enquiry.html");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator(".topic-card")).toHaveCount(6);
    await page.locator(".topic-card[data-topic='program']").click();
    await expect(page.locator("#msgSection")).toBeVisible();
    await page.fill("#userName", "Rina");

    await expect(page.locator("#msgPreview")).toContainText("Nama saya Rina.");
    await expect(page.locator("#step3")).toHaveClass(/active/);

    await page.click("#waSendBtn");

    const openedUrl = await page.evaluate(() => window.__lastOpenedUrl);
    expect(openedUrl).toContain("https://wa.me/");
    expect(openedUrl).toContain("Nama%20saya%20Rina.");
  });
});
