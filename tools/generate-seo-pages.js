#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const { buildCanonicalUrl } = require('../seo/canonical');
const { buildRelatedLinks } = require('../scripts/internal-links');
const { exportWordPressCsv } = require('./seo/lib/cms');
const { buildPageModel } = require('./seo/lib/generator');
const { loadKeywordRows, resolveInputPath } = require('./seo/lib/io');
const { updateSitemap } = require('./seo/lib/sitemap');
const { renderHtml } = require('./seo/lib/template');

function parseArgs(argv) {
  const args = {
    outputDir: 'pages',
    siteUrl: 'https://redlineacademy.com.au',
    overwrite: false,
    updateSitemap: false,
    dryRun: false,
    cmsExport: '',
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--input') {
      args.input = next;
      i += 1;
    } else if (arg === '--output-dir') {
      args.outputDir = next;
      i += 1;
    } else if (arg === '--site-url') {
      args.siteUrl = next.replace(/\/$/, '');
      i += 1;
    } else if (arg === '--overwrite') {
      args.overwrite = true;
    } else if (arg === '--update-sitemap') {
      args.updateSitemap = true;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--cms-export') {
      args.cmsExport = next;
      i += 1;
    } else if (arg === '--help') {
      printHelp();
      process.exit(0);
    }
  }
  return args;
}

function printHelp() {
  console.log(`
SEO Content Pipeline

Usage:
  node tools/generate-seo-pages.js --input data/seo-keywords.sample.json [options]

Options:
  --output-dir pages            Output directory (default: pages)
  --site-url https://...        Canonical base URL (default: https://redlineacademy.com.au)
  --overwrite                   Overwrite existing page if slug already exists
  --update-sitemap              Merge generated URLs into sitemap.xml
  --cms-export wordpress-csv    Optional CMS export file (current: wordpress-csv)
  --dry-run                     Preview output without writing files
  --help                        Show this message
`);
}

function createPipelineReport({ created, skipped, cmsOutput, outputDir }) {
  return {
    generatedAt: new Date().toISOString(),
    outputDir,
    createdCount: created.length,
    skippedCount: skipped.length,
    created,
    skipped,
    cmsOutput: cmsOutput || null,
  };
}

function main() {
  const args = parseArgs(process.argv);
  const inputPath = resolveInputPath(args.input);
  const rootDir = process.cwd();
  const outputDir = path.resolve(rootDir, args.outputDir);
  const keywordRows = loadKeywordRows(inputPath);
  const models = keywordRows.map((row) => buildPageModel(row));

  const created = [];
  const skipped = [];
  const generatedPages = [];
  const generatedUrls = [];

  fs.mkdirSync(outputDir, { recursive: true });

  models.forEach((model) => {
    const relativeOutput = `${model.slug}.html`;
    const absOutput = path.join(outputDir, relativeOutput);
    const pageExists = fs.existsSync(absOutput);

    if (pageExists && !args.overwrite) {
      skipped.push({ slug: model.slug, reason: 'exists', file: absOutput });
      return;
    }

    const relatedLinks = buildRelatedLinks(model, models, 3);
    const canonicalUrl = buildCanonicalUrl({
      siteUrl: args.siteUrl,
      outputDir: args.outputDir,
      slug: model.slug,
    });
    const html = renderHtml({
      model,
      canonicalUrl,
      relatedLinks,
      rootPrefix: '../',
    });

    if (!args.dryRun) {
      fs.writeFileSync(absOutput, html, 'utf8');
    }

    created.push({
      slug: model.slug,
      keyword: model.keyword,
      file: absOutput,
    });

    generatedPages.push({ model, html, file: absOutput });
    generatedUrls.push(canonicalUrl);
  });

  if (args.updateSitemap && !args.dryRun && generatedUrls.length > 0) {
    updateSitemap({
      rootDir,
      generatedUrls,
      lastmod: new Date().toISOString().slice(0, 10),
    });
  }

  let cmsOutput = '';
  if (args.cmsExport === 'wordpress-csv' && !args.dryRun && generatedPages.length > 0) {
    cmsOutput = exportWordPressCsv({ rootDir, pages: generatedPages });
  }

  const report = createPipelineReport({
    created,
    skipped,
    cmsOutput,
    outputDir,
  });

  if (!args.dryRun) {
    const reportPath = path.join(rootDir, 'output', 'seo-generation-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  console.log(
    JSON.stringify(
      {
        input: inputPath,
        createdCount: created.length,
        skippedCount: skipped.length,
        updateSitemap: args.updateSitemap,
        cmsExport: args.cmsExport || null,
      },
      null,
      2
    )
  );
}

main();
