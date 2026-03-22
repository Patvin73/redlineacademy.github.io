// @ts-check
require("dotenv").config({ path: ".env.playwright.live" });
const { defineConfig } = require("@playwright/test");

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

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required live QA env vars: ${missingEnvVars.join(", ")}`
  );
}

module.exports = defineConfig({
  testDir: "tests",
  workers: 1,
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: "http://127.0.0.1:8000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "live-core",
      testMatch: /live-(auth|write)\.spec\.js/,
    },
    {
      name: "live-audit",
      testMatch: /zz-live-cleanup-audit\.spec\.js/,
    },
  ],
});
