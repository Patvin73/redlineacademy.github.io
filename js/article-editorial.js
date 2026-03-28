(function () {
  const body = document.body;
  if (!body || !body.classList.contains("article-page")) return;

  const config = window.articleEditorialConfig;
  if (!config) return;

  const pageMeta = window.pageTranslations || {};
  const langButtons = document.querySelectorAll(".lang-btn");
  const langBlocks = document.querySelectorAll("[data-lang-block]");

  function ensureProgressBar() {
    if (document.querySelector(".reading-progress")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "reading-progress";
    wrapper.innerHTML = '<div class="reading-progress__bar" id="readingBar"></div>';
    document.body.prepend(wrapper);
  }

  function getReadingBar() {
    return document.getElementById("readingBar");
  }

  function placeHighlightsInHero() {
    const highlights = document.querySelector(".article-highlights");
    const heroInner = document.querySelector(".article-hero__inner");
    if (!highlights || !heroInner) return;
    if (!heroInner.contains(highlights)) {
      heroInner.appendChild(highlights);
    }
  }

  function injectAuthorChip() {
    const heroContent = document.querySelector(".article-hero__inner > div:first-child");
    if (!heroContent || heroContent.querySelector(".article-author-chip")) return;

    const chip = document.createElement("div");
    chip.className = "article-author-chip";
    chip.innerHTML =
      '<img src="../assets/images/redlinelogo.png" alt="Redline Academy Editorial Team">' +
      "<div>" +
      '<div class="article-author-chip__eyebrow" data-copy-role></div>' +
      `<span class="article-author-chip__name">${config.author.name}</span>` +
      '<div class="article-author-chip__eyebrow">Caregiver pathway research</div>' +
      "</div>";
    heroContent.appendChild(chip);
  }

  function slugify(text, fallback) {
    return (
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || fallback
    );
  }

  function injectFigure(section, figureConfig, lang) {
    if (!section || !figureConfig || section.querySelector(".article-figure")) return;
    const figure = document.createElement("figure");
    figure.className = "article-figure article-media-block";
    figure.innerHTML =
      `<img src="${figureConfig.src}" alt="${figureConfig.alt}" loading="lazy" decoding="async">` +
      `<figcaption>${lang === "id" ? figureConfig.captionId : figureConfig.captionEn}</figcaption>`;
    section.appendChild(figure);
  }

  function decorateSectionMedia(section, mediaIndex) {
    if (!section) return mediaIndex;

    const mediaNodes = Array.from(
      section.querySelectorAll(":scope > .article-inline-media, :scope > .article-figure"),
    );

    if (!mediaNodes.length) return mediaIndex;

    mediaNodes.forEach((mediaNode) => {
      mediaNode.classList.add("article-media-block");
      mediaNode.classList.add("article-media-block--full", "article-image--full");

      mediaIndex += 1;
    });

    return mediaIndex;
  }

  function injectStatCards(section, lang) {
    if (!section || section.querySelector(".article-stat-grid")) return;
    const grid = document.createElement("div");
    grid.className = "article-stat-grid";
    grid.innerHTML = config.stats
      .map(
        (item) =>
          `<div class="article-stat-card"><strong>${item.value}</strong><span>${
            lang === "id" ? item.labelId || item.label : item.labelEn || item.label
          }</span></div>`,
      )
      .join("");

    const title = section.querySelector(".article-section-card__title");
    if (title) title.insertAdjacentElement("afterend", grid);
  }

  function decorateRelatedLinks(section) {
    const relatedLinks = section.querySelector(".article-related-links");
    if (!relatedLinks) return;
    relatedLinks.querySelectorAll("a").forEach((anchor, index) => {
      if (anchor.querySelector("span")) return;
      const label = document.createElement("span");
      label.textContent = `${index + 1}`;
      anchor.prepend(label);
    });
  }

  function buildSidebar(lang) {
    const sidebar = document.createElement("aside");
    sidebar.className = "article-sidebar";
    sidebar.innerHTML =
      `<section class="article-sidebar-card editorial-fade">
        <h3>${lang === "id" ? "Daftar Isi" : "Table of Contents"}</h3>
        <nav class="article-toc"></nav>
      </section>
      <section class="article-sidebar-card editorial-fade">
        <h3>${lang === "id" ? "Artikel Terkait" : "Related Articles"}</h3>
        <div class="article-related"></div>
      </section>
      <section class="article-sidebar-card editorial-fade">
        <h3>${lang === "id" ? "Bagikan" : "Share"}</h3>
        <div class="article-share">
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}" target="_blank" rel="noreferrer">Twitter</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" target="_blank" rel="noreferrer">LinkedIn</a>
          <button type="button" class="article-copy-link">Copy Link</button>
        </div>
      </section>`;
    return sidebar;
  }

  function populateSidebar(sidebar) {
    const related = sidebar.querySelector(".article-related");
    config.related.forEach((item) => {
      const anchor = document.createElement("a");
      anchor.className = "article-related-item";
      anchor.href = item.href;
      anchor.innerHTML = `<img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async"><strong>${item.title}</strong>`;
      related.appendChild(anchor);
    });

    const copyButton = sidebar.querySelector(".article-copy-link");
    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          copyButton.textContent = "Copied";
          setTimeout(() => {
            copyButton.textContent = "Copy Link";
          }, 1200);
        } catch (error) {
          copyButton.textContent = "Copy failed";
        }
      });
    }
  }

  function buildFooter(lang) {
    const footer = document.createElement("div");
    footer.className = "article-footer editorial-fade";
    footer.innerHTML =
      `<section class="article-footer-card">
        <h3>${lang === "id" ? "Tag Artikel" : "Article Tags"}</h3>
        <div class="article-tags">${config.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
      </section>
      <section class="article-footer-card article-bio">
        <img src="../assets/images/redlinelogo.png" alt="Redline Academy team" loading="lazy" decoding="async">
        <div>
          <h3>${config.author.name}</h3>
          <p>${lang === "id" ? config.author.bioId : config.author.bioEn}</p>
          <div class="article-bio-links">
            <a href="https://redlineacademy.com.au" target="_blank" rel="noreferrer">Website</a>
            <a href="contact.html">Contact</a>
            <a href="blog.html">Blog</a>
          </div>
        </div>
      </section>
      <a class="article-footer-card article-up-next" href="${config.upNext.href}">
        <img src="${config.upNext.image}" alt="Up next article" loading="lazy" decoding="async">
        <div class="article-up-next__content">
          <div class="article-up-next__eyebrow">${lang === "id" ? "Artikel Berikutnya" : "Up Next"}</div>
          <h3>${lang === "id" ? config.upNext.titleId : config.upNext.titleEn}</h3>
          <p>${lang === "id" ? config.upNext.bodyId : config.upNext.bodyEn}</p>
        </div>
      </a>`;
    return footer;
  }

  function buildMagazineLayout(block, lang) {
    if (!block || block.dataset.editorialReady === "true") return;

    const sections = Array.from(block.children);
    const wrapper = document.createElement("div");
    wrapper.className = "article-magazine";

    const main = document.createElement("div");
    main.className = "article-main";

    const sidebar = buildSidebar(lang);
    const toc = sidebar.querySelector(".article-toc");

    let mediaIndex = 0;

    sections.forEach((section, index) => {
      const title = section.querySelector(".article-section-card__title");
      if (title && !section.id) {
        section.id = slugify(title.textContent, `section-${index + 1}`);
      }

      section.classList.add("editorial-fade");

      if (index === 0) {
        const firstParagraph = section.querySelector("p");
        if (firstParagraph) firstParagraph.classList.add("article-lead");
      }

      const paragraphs = section.querySelectorAll("p");
      if (paragraphs.length > 1) {
        paragraphs[1].innerHTML = paragraphs[1].innerHTML.replace(
          /credential/gi,
          '<span class="article-inline-highlight">credential</span>',
        );
      }

      if (config.statSection === index) injectStatCards(section, lang);
      if (!section.querySelector("img") && config.figures && config.figures[index]) {
        injectFigure(section, config.figures[index], lang);
      }
      mediaIndex = decorateSectionMedia(section, mediaIndex);

      if (title) {
        const link = document.createElement("a");
        link.href = `#${section.id}`;
        link.dataset.num = String(index + 1).padStart(2, "0");
        link.textContent = title.textContent;
        toc.appendChild(link);
      }

      decorateRelatedLinks(section);
      main.appendChild(section);
    });

    main.appendChild(buildFooter(lang));
    wrapper.appendChild(main);
    wrapper.appendChild(sidebar);
    populateSidebar(sidebar);

    block.appendChild(wrapper);
    block.dataset.editorialReady = "true";
  }

  function updateLanguage(lang) {
    langBlocks.forEach((block) => {
      block.hidden = block.dataset.langBlock !== lang;
    });
    langButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === lang);
    });

    const copyRole = document.querySelector("[data-copy-role]");
    if (copyRole) {
      copyRole.textContent = lang === "id" ? config.author.roleId : config.author.roleEn;
    }

    const metaMap = pageMeta[lang];
    const metaPrefix = config.metaPrefix;
    if (metaMap && metaPrefix) {
      document.title = metaMap[`${metaPrefix}MetaTitle`];
      document.querySelector('meta[name="description"]').setAttribute("content", metaMap[`${metaPrefix}MetaDescription`]);
      document.querySelector('meta[property="og:title"]').setAttribute("content", metaMap[`${metaPrefix}MetaTitle`]);
      document.querySelector('meta[property="og:description"]').setAttribute("content", metaMap[`${metaPrefix}MetaDescription`]);
      document.querySelector('meta[name="twitter:title"]').setAttribute("content", metaMap[`${metaPrefix}MetaTitle`]);
      document.querySelector('meta[name="twitter:description"]').setAttribute("content", metaMap[`${metaPrefix}MetaDescription`]);
    }
  }

  function updateReadingBar() {
    const readingBar = getReadingBar();
    if (!readingBar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    readingBar.style.width = `${Math.min(progress, 100)}%`;
  }

  function updateActiveToc() {
    const activeSections = document.querySelectorAll(".article-main .article-section-card[id]");
    let activeId = "";
    activeSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom >= 120) activeId = section.id;
    });

    document.querySelectorAll(".article-toc a").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
  }

  function observeFade() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15 },
    );

    document.querySelectorAll(".editorial-fade").forEach((node) => observer.observe(node));
  }

  function init() {
    ensureProgressBar();
    placeHighlightsInHero();
    injectAuthorChip();
    buildMagazineLayout(document.querySelector('[data-lang-block="id"]'), "id");
    buildMagazineLayout(document.querySelector('[data-lang-block="en"]'), "en");

    const savedLanguage = localStorage.getItem("language") || "id";
    updateLanguage(savedLanguage);

    langButtons.forEach((button) => {
      button.addEventListener("click", () => {
        localStorage.setItem("language", button.dataset.lang);
        setTimeout(() => updateLanguage(button.dataset.lang), 0);
      });
    });

    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");
    if (menuToggle && nav) {
      menuToggle.addEventListener("click", () => nav.classList.toggle("active"));
    }

    window.addEventListener("scroll", () => {
      updateReadingBar();
      updateActiveToc();
    });

    updateReadingBar();
    updateActiveToc();
    observeFade();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
