function buildCanonicalUrl({ siteUrl, outputDir, slug }) {
  const base = siteUrl.replace(/\/$/, '');
  const dir = outputDir.replace(/^\.?\//, '').replace(/\/$/, '');
  return `${base}/${dir}/${slug}.html`;
}

module.exports = {
  buildCanonicalUrl,
};
