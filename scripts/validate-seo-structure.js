#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const htmlFiles = ['index.html', 'test-lang.html']
  .map((file) => path.join(root, file))
  .concat(
    fs
      .readdirSync(path.join(root, 'pages'))
      .filter((file) => file.endsWith('.html'))
      .map((file) => path.join(root, 'pages', file))
  );

const issues = [];

function resolveLink(filePath, href) {
  const cleanHref = href.split('#')[0].split('?')[0];
  if (!cleanHref) return null;
  if (/^(https?:|mailto:|tel:|javascript:)/i.test(cleanHref)) return null;
  return path.resolve(path.dirname(filePath), cleanHref);
}

function checkPage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relative = path.relative(root, filePath);

  const h1Count = (content.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) {
    issues.push(`${relative}: expected exactly 1 <h1>, found ${h1Count}`);
  }

  const descTags = content.match(/<meta\s+name=["']description["'][^>]*>/gi) || [];
  if (descTags.length > 1) {
    issues.push(`${relative}: duplicate meta description (${descTags.length})`);
  }

  const canonicalTags = content.match(/<link\s+rel=["']canonical["'][^>]*>/gi) || [];
  if (canonicalTags.length > 1) {
    issues.push(`${relative}: duplicate canonical tags (${canonicalTags.length})`);
  }

  const headingLevels = [...content.matchAll(/<h([1-6])\b/gi)].map((entry) => Number(entry[1]));
  for (let i = 1; i < headingLevels.length; i += 1) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      issues.push(
        `${relative}: heading jump from h${headingLevels[i - 1]} to h${headingLevels[i]}`
      );
      break;
    }
  }

  [...content.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].forEach((entry) => {
    const href = entry[1];
    const resolved = resolveLink(filePath, href);
    if (resolved && !fs.existsSync(resolved)) {
      issues.push(`${relative}: broken local link "${href}"`);
    }
  });
}

htmlFiles.forEach(checkPage);

if (issues.length > 0) {
console.error(['SEO structure validation failed:', ...issues.map((item) => `- ${item}`)].join('\n'));
  process.exit(1);
}

console.log(`SEO structure validation passed. Files checked: ${htmlFiles.length}`);
