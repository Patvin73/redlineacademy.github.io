const fs = require('fs');
const path = require('path');

const { buildPageMeta, toMetaTags } = require('../../../seo/meta.config');
const { buildSchemas, toSchemaScripts } = require('../../../seo/schema.config');
const { escapeHtml } = require('./text');

const COMPONENTS_DIR = path.resolve(__dirname, '../../../components');
const PAGE_LAYOUT = fs.readFileSync(path.join(COMPONENTS_DIR, 'page-layout.html'), 'utf8');
const HEADER_TEMPLATE = fs.readFileSync(path.join(COMPONENTS_DIR, 'site-header.html'), 'utf8');
const FOOTER_TEMPLATE = fs.readFileSync(path.join(COMPONENTS_DIR, 'site-footer.html'), 'utf8');

function withRootPrefix(template, rootPrefix) {
  return template.replace(/\{\{ROOT_PREFIX\}\}/g, rootPrefix);
}

function renderSections(model) {
  return model.sections
    .map(
      (section) => `
      <section class="section-padding">
        <div class="container">
          <h2>${escapeHtml(section.h2)}</h2>
          ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n          ')}
          ${section.h3
            .map(
              (subsection) => `
          <h3>${escapeHtml(subsection.title)}</h3>
          <ul>
            ${subsection.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('\n            ')}
          </ul>`
            )
            .join('\n          ')}
        </div>
      </section>`
    )
    .join('\n');
}

function renderRelatedLinks(links) {
  if (!links.length) return '';
  return `
      <section class="section-padding" aria-labelledby="related-pages-title">
        <div class="container">
          <h2 id="related-pages-title">Halaman Terkait</h2>
          <ul>
            ${links
              .map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`)
              .join('\n            ')}
          </ul>
        </div>
      </section>`;
}

function renderFaq(model) {
  return `
      <section class="section-padding" aria-labelledby="faq-title">
        <div class="container">
          <h2 id="faq-title">FAQ ${escapeHtml(model.keyword)}</h2>
          ${model.faq
            .map(
              (item) => `
          <article class="card">
            <div class="card-body">
              <h3>${escapeHtml(item.question)}</h3>
              <p>${escapeHtml(item.answer)}</p>
            </div>
          </article>`
            )
            .join('\n          ')}
        </div>
      </section>`;
}

function renderContent({ model, relatedLinks }) {
  const sectionsHtml = renderSections(model);
  const faqHtml = renderFaq(model);
  const relatedHtml = renderRelatedLinks(relatedLinks);

  return `
      <section class="section-padding">
        <div class="container">
          <h1>${escapeHtml(model.headingTitle)}</h1>
          <p>${escapeHtml(model.intro)}</p>
          <p>
            Fokus kata kunci: <strong>${escapeHtml(model.keyword)}</strong> |
            Intent: <strong>${escapeHtml(model.searchIntent)}</strong> |
            Lokasi: <strong>${escapeHtml(model.location)}</strong>
          </p>
        </div>
      </section>
${sectionsHtml}
${faqHtml}
${relatedHtml}
      <section class="section-padding">
        <div class="container">
          <h2>Siap Mulai Karier Caregiver?</h2>
          <p>Hubungi tim Redline Academy untuk konsultasi program dan jalur belajar yang sesuai kebutuhan Anda.</p>
          <a class="btn btn-primary" href="contact.html">Konsultasi Sekarang</a>
        </div>
      </section>`;
}

function renderHtml({ model, canonicalUrl, relatedLinks, rootPrefix = '../' }) {
  const pageMeta = buildPageMeta({ model, canonicalUrl });
  const metaTags = toMetaTags(pageMeta);
  const schemaScripts = toSchemaScripts(buildSchemas({ model, canonicalUrl }));

  return PAGE_LAYOUT.replace('{{META_TAGS}}', metaTags)
    .replace('{{SCHEMA_SCRIPTS}}', schemaScripts)
    .replace('{{HEADER}}', withRootPrefix(HEADER_TEMPLATE, rootPrefix))
    .replace('{{FOOTER}}', withRootPrefix(FOOTER_TEMPLATE, rootPrefix))
    .replace('{{CONTENT}}', renderContent({ model, relatedLinks }))
    .replace(/\{\{ROOT_PREFIX\}\}/g, rootPrefix);
}

module.exports = {
  renderHtml,
};
