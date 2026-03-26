// @ts-check
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  testIgnore: ["**/live-*.spec.js", "**/zz-live-cleanup-audit.spec.js"],
  workers: 1,
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000
  },
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: "http://127.0.0.1:8000",
    trace: "on-first-retry"
  }
});
