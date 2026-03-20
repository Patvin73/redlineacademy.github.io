const fs = require("fs");
const path = require("path");

const registryPath = path.join(__dirname, "..", "qa", "coverage-registry.json");

function loadRegistry() {
  const raw = fs.readFileSync(registryPath, "utf8");
  return JSON.parse(raw);
}

function cell(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value)
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|");
}

function table(headers, rows) {
  const normalizedRows = rows.map((row) => row.map(cell));
  const widths = headers.map((header, index) =>
    Math.max(
      String(header).length,
      ...normalizedRows.map((row) => row[index].length)
    )
  );

  const renderRow = (row) =>
    `| ${row.map((value, index) => value.padEnd(widths[index])).join(" | ")} |`;

  const headerRow = renderRow(headers.map(String));
  const divider = `| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`;
  const body = normalizedRows.map(renderRow).join("\n");

  return [headerRow, divider, body].filter(Boolean).join("\n");
}

function flattenFeatures(registry) {
  return registry.groups.flatMap((group) =>
    group.features.map((feature) => ({
      group: group.name,
      ...feature,
    }))
  );
}

function renderCoverage(registry) {
  const rows = flattenFeatures(registry).map((feature) => [
    feature.group,
    feature.name,
    feature.risk,
    feature.coverage,
    feature.tests,
    feature.gap,
  ]);

  return [
    "# QA Coverage Map",
    "",
    table(["Group", "Feature", "Risk", "Coverage", "Tests", "Gap"], rows),
  ].join("\n");
}

function renderRisk(registry) {
  const rows = flattenFeatures(registry).map((feature) => [
    feature.group,
    feature.name,
    feature.risk,
    feature.coverage,
    feature.gap,
  ]);

  return [
    "# QA Risk Matrix",
    "",
    table(["Group", "Feature", "Risk", "Coverage", "Gap"], rows),
  ].join("\n");
}

function renderTags(registry) {
  const rows = registry.recommendedTags.map((tag) => [tag.tag, tag.meaning]);

  return [
    "# Recommended Test Tags",
    "",
    table(["Tag", "Meaning"], rows),
  ].join("\n");
}

function renderTiers(registry) {
  const rows = registry.tiers.map((tier) => [
    tier.name,
    tier.command,
    tier.scope,
    tier.config,
  ]);

  return [
    "# CI Test Tiers",
    "",
    table(["Tier", "Command", "Scope", "Config"], rows),
  ].join("\n");
}

function renderReport(registry) {
  const coverageCount = flattenFeatures(registry).length;
  const covered = flattenFeatures(registry).filter(
    (feature) => feature.coverage === "covered"
  ).length;
  const partial = flattenFeatures(registry).filter(
    (feature) => feature.coverage === "partial"
  ).length;
  const missing = flattenFeatures(registry).filter(
    (feature) => feature.coverage === "missing"
  ).length;

  return [
    `# QA Observability Report`,
    "",
    `Generated on: ${registry.generatedOn}`,
    `Features mapped: ${coverageCount}`,
    `Covered: ${covered} | Partial: ${partial} | Missing: ${missing}`,
    "",
    renderCoverage(registry),
    "",
    renderRisk(registry),
    "",
    renderTags(registry),
    "",
    renderTiers(registry),
  ].join("\n");
}

function main() {
  const registry = loadRegistry();
  const mode = (process.argv[2] || "report").toLowerCase();

  if (mode === "report") {
    process.stdout.write(renderReport(registry));
    return;
  }

  if (mode === "coverage") {
    process.stdout.write(renderCoverage(registry));
    return;
  }

  if (mode === "risk") {
    process.stdout.write(renderRisk(registry));
    return;
  }

  if (mode === "tags") {
    process.stdout.write(renderTags(registry));
    return;
  }

  if (mode === "tiers") {
    process.stdout.write(renderTiers(registry));
    return;
  }

  console.error(
    "Usage: node tools/qa-observability.js [report|coverage|risk|tags|tiers]"
  );
  process.exit(1);
}

main();
