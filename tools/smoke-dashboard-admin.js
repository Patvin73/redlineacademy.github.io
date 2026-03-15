const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "pages", "dashboard-admin.html");
const html = fs.readFileSync(filePath, "utf8");

const checks = [
  { name: "Sidebar container", needle: "id=\"adSidebar\"" },
  { name: "Main container", needle: "id=\"adMain\"" },
  { name: "KPI grid", needle: "class=\"ad-kpi-grid\"" },
  { name: "KPI total students", needle: "id=\"kpiTotalStudents\"" },
  { name: "KPI active courses", needle: "id=\"kpiActiveCourses\"" },
  { name: "KPI pending grading", needle: "id=\"kpiPendingGrading\"" },
  { name: "KPI completion rate", needle: "id=\"kpiCompletionRate\"" }
];

const missing = checks.filter((check) => !html.includes(check.needle));

if (missing.length > 0) {
  console.error("SMOKE FAIL: dashboard-admin missing required markup.");
  missing.forEach((check) => {
    console.error(`- Missing: ${check.name} (${check.needle})`);
  });
  process.exit(1);
}

console.log("SMOKE PASS: dashboard-admin required markup found.");
