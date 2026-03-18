/** @type {import("jest").Config} */
module.exports = {
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "/tests/.*\\.spec\\.js$"]
};
