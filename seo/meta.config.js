const path = require('path');
const siteConfig = require('./site.config.json');

function buildPageMeta({ model, canonicalUrl }) {
  return {
    title: model.seoTitle,
    description: model.metaDescription,
    robots: siteConfig.robotsIndexable,
    canonical: canonicalUrl,
    og: {
      type: 'article',
      title: model.seoTitle,
      description: model.metaDescription,
      url: canonicalUrl,
      image: siteConfig.defaultOgImage,
      siteName: siteConfig.siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: model.seoTitle,
      description: model.metaDescription,
      image: siteConfig.defaultOgImage,
    },
  };
}

function toMetaTags(meta) {
  return [
    `<title>${meta.title}</title>`,
    `<meta name="description" content="${meta.description}" />`,
    `<meta name="robots" content="${meta.robots}" />`,
    `<link rel="canonical" href="${meta.canonical}" />`,
    `<meta property="og:type" content="${meta.og.type}" />`,
    `<meta property="og:title" content="${meta.og.title}" />`,
    `<meta property="og:description" content="${meta.og.description}" />`,
    `<meta property="og:url" content="${meta.og.url}" />`,
    `<meta property="og:image" content="${meta.og.image}" />`,
    `<meta property="og:site_name" content="${meta.og.siteName}" />`,
    `<meta name="twitter:card" content="${meta.twitter.card}" />`,
    `<meta name="twitter:title" content="${meta.twitter.title}" />`,
    `<meta name="twitter:description" content="${meta.twitter.description}" />`,
    `<meta name="twitter:image" content="${meta.twitter.image}" />`,
  ].join('\n    ');
}

function outputPathFromSlug(outputDir, slug) {
  return path.join(outputDir, `${slug}.html`);
}

module.exports = {
  buildPageMeta,
  outputPathFromSlug,
  siteConfig,
  toMetaTags,
};
