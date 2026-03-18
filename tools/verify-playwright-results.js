const fs = require("fs");

function countSkipped(node) {
  let skipped = 0;

  for (const testCase of node.tests || []) {
    for (const result of testCase.results || []) {
      if (result.status === "skipped") {
        skipped += 1;
      }
    }
  }

  for (const childSuite of node.suites || []) {
    skipped += countSkipped(childSuite);
  }

  return skipped;
}

function main() {
  const reportPath = process.argv[2];

  if (!reportPath) {
    console.error("Usage: node tools/verify-playwright-results.js <report.json>");
    process.exit(1);
  }

  const raw = fs.readFileSync(reportPath);
  const text =
    raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe
      ? raw.toString("utf16le")
      : raw.toString("utf8").replace(/^\uFEFF/, "");

  let report;
  try {
    report = JSON.parse(text);
  } catch (error) {
    console.error(`Unable to read Playwright report at ${reportPath}`);
    console.error(error.message);
    process.exit(1);
  }

  const skippedFromTree = countSkipped(report);
  const skippedFromStats =
    report.stats && typeof report.stats.skipped === "number"
      ? report.stats.skipped
      : 0;
  const skipped = Math.max(skippedFromTree, skippedFromStats);

  if (skipped > 0) {
    console.error(
      `Playwright report contains ${skipped} skipped test(s). Skips are not allowed in CI.`
    );
    process.exit(1);
  }
}

main();
