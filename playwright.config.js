// @ts-check
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  testIgnore: ["**/live-*.spec.js"],
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000
  },
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: "http://127.0.0.1:8000",
    trace: "on-first-retry"
  },
  webServer: {
    command: "node tools/static-server.js",
    url: "http://127.0.0.1:8000",
    reuseExistingServer: true,
    timeout: 30 * 1000
  }
});
