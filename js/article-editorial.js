(function () {
  const pageRoot = document.querySelector("main.article-page");
  if (!pageRoot) return;

  const pageMeta = window.pageTranslations || {};
  const config = window.articleEditorialConfig || {};
  const langButtons = document.querySelectorAll(".lang-btn");
  const langBlocks = document.querySelectorAll("[data-lang-block]");

  function normalizeNumberedCards() {
    const listItems = document.querySelectorAll(
      ".article-list li, .article-prose ol li, .article-section-card > ol li",
    );

    listItems.forEach((item, index) => {
      if (item.querySelector(".article-card-index")) return;

      const strong = item.querySelector("strong");
      const rawHtml = item.innerHTML.trim();
      const number = item.matches(".article-prose ol li, .article-section-card > ol li")
        ? String(index + 1).padStart(2, "0")
        : String(index + 1);

      if (strong) {
        const strongHtml = strong.outerHTML;
        const bodyHtml = rawHtml.replace(strongHtml, "").trim();
        item.innerHTML = `
          <span class="article-card-index" aria-hidden="true">${number}</span>
          ${strongHtml}
          ${bodyHtml ? `<p class="article-card-body">${bodyHtml}</p>` : ""}
        `;
      } else {
        item.innerHTML = `
          <span class="article-card-index" aria-hidden="true">${number}</span>
          <p class="article-card-body">${rawHtml}</p>
        `;
      }
    });

    const explicitNumberCards = document.querySelectorAll(
      ".article-check-card, .article-stage-card",
    );

    explicitNumberCards.forEach((card) => {
      const strong = card.querySelector("strong");
      if (!strong) return;

      const hasLeadingNumber = /^(\d+)[\.\)]\s*/.test(strong.textContent.trim());
      card.classList.toggle("has-leading-number", hasLeadingNumber);
    });
  }

  function updateLanguage(lang) {
    const currentLang = lang === "en" ? "en" : "id";

    langBlocks.forEach((block) => {
      block.hidden = block.dataset.langBlock !== currentLang;
    });

    langButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === currentLang);
    });

    const metaPrefix = config.metaPrefix;
    const metaMap = pageMeta[currentLang];
    if (!metaPrefix || !metaMap) return;

    const title = metaMap[`${metaPrefix}MetaTitle`];
    const description = metaMap[`${metaPrefix}MetaDescription`];

    if (title) {
      document.title = title;

      const ogTitle = document.querySelector('meta[property="og:title"]');
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (ogTitle) ogTitle.setAttribute("content", title);
      if (twitterTitle) twitterTitle.setAttribute("content", title);
    }

    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');

      if (metaDescription) metaDescription.setAttribute("content", description);
      if (ogDescription) ogDescription.setAttribute("content", description);
      if (twitterDescription) twitterDescription.setAttribute("content", description);
    }
  }

  function init() {
    normalizeNumberedCards();
    updateLanguage(localStorage.getItem("language") || "id");

    langButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextLang = button.dataset.lang || "id";
        localStorage.setItem("language", nextLang);
        window.dispatchEvent(new CustomEvent("languagechange", { detail: { lang: nextLang } }));
        setTimeout(() => updateLanguage(nextLang), 0);
      });
    });

    window.addEventListener("languagechange", (event) => {
      updateLanguage(event.detail?.lang || localStorage.getItem("language") || "id");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
