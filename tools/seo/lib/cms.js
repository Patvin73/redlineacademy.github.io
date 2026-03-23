const fs = require('fs');
const path = require('path');

function escapeCsvValue(value) {
  const raw = String(value ?? '');
  if (!/[",\n]/.test(raw)) return raw;
  return `"${raw.replace(/"/g, '""')}"`;
}

function stripToMainContent(html) {
  const match = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return match ? match[1].trim() : html;
}

function exportWordPressCsv({ rootDir, pages }) {
  const outputPath = path.join(rootDir, 'output', 'seo-wordpress.csv');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const headers = [
    'post_title',
    'post_name',
    'focus_keyword',
    'meta_description',
    'post_status',
    'post_type',
    'post_content_html',
  ];

  const rows = [headers.join(',')];
  pages.forEach((page) => {
    rows.push(
      [
        page.model.seoTitle,
        page.model.slug,
        page.model.keyword,
        page.model.metaDescription,
        'draft',
        'page',
        stripToMainContent(page.html),
      ]
        .map(escapeCsvValue)
        .join(',')
    );
  });

  fs.writeFileSync(outputPath, `${rows.join('\n')}\n`, 'utf8');
  return outputPath;
}

module.exports = {
  exportWordPressCsv,
};
