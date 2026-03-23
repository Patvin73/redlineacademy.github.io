const { siteConfig } = require('./meta.config');

function nowIso() {
  return new Date().toISOString();
}

function buildSchemas({ model, canonicalUrl }) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: model.seoTitle,
    description: model.metaDescription,
    inLanguage: siteConfig.defaultLocale,
    datePublished: nowIso(),
    dateModified: nowIso(),
    mainEntityOfPage: canonicalUrl,
    author: {
      '@type': 'Organization',
      name: siteConfig.siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.siteUrl}/assets/images/redlinelogo.png`,
      },
    },
  };

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: model.headingTitle,
    description: model.metaDescription,
    provider: {
      '@type': 'Organization',
      name: siteConfig.siteName,
      sameAs: `${siteConfig.siteUrl}/`,
    },
    inLanguage: ['id', 'en'],
    availableLanguage: ['id', 'en'],
    educationalCredentialAwarded: 'Sertifikat Pelatihan Caregiver',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: model.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return [articleSchema, courseSchema, faqSchema];
}

function toSchemaScripts(schemas) {
  return schemas
    .map((schema) => `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`)
    .join('\n');
}

module.exports = {
  buildSchemas,
  toSchemaScripts,
};
