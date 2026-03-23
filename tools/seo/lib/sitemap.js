const fs = require('fs');
const path = require('path');

function ensureDirectory(filepath) {
  const dir = path.dirname(filepath);
  fs.mkdirSync(dir, { recursive: true });
}

function parseExistingUrls(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((entry) => entry[1]);
}

function updateSitemap({ rootDir, generatedUrls, lastmod }) {
  const sitemapPath = path.join(rootDir, 'sitemap.xml');
  const existing = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
  const existingUrls = existing ? parseExistingUrls(existing) : [];
  const allUrls = Array.from(new Set([...existingUrls, ...generatedUrls])).sort();

  const xmlRows = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  allUrls.forEach((url) => {
    const priority = generatedUrls.includes(url) ? '0.7' : '0.6';
    xmlRows.push('  <url>');
    xmlRows.push(`    <loc>${url}</loc>`);
    xmlRows.push(`    <lastmod>${lastmod}</lastmod>`);
    xmlRows.push('    <changefreq>monthly</changefreq>');
    xmlRows.push(`    <priority>${priority}</priority>`);
    xmlRows.push('  </url>');
  });
  xmlRows.push('</urlset>');

  ensureDirectory(sitemapPath);
  fs.writeFileSync(sitemapPath, `${xmlRows.join('\n')}\n`, 'utf8');
}

module.exports = {
  updateSitemap,
};
