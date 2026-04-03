/* ============================================================
   ARTICLE EDITORIAL  —  v2.0  |  Redline Academy
   Enhanced JS: reading progress, scroll animations,
   language switching, numbered cards, and UX polish.
   ============================================================ */

(function () {
  "use strict";

  const pageRoot = document.querySelector("main.article-page");
  if (!pageRoot) return;

  const pageMeta  = window.pageTranslations    || {};
  const config    = window.articleEditorialConfig || {};
  const langBtns  = document.querySelectorAll(".lang-btn");
  const langBlocks= document.querySelectorAll("[data-lang-block]");

  /* ── 1. NORMALIZE NUMBERED CARDS ───────────────────────── */
  /*
   * Transforms bare <li> content into:
   *   <span class="article-card-index">01</span>
   *   <strong>Title</strong>
   *   <p class="article-card-body">Body</p>
   */
  function normalizeNumberedCards() {
    const listItems = document.querySelectorAll(
      ".article-list li, .article-prose ol li, .article-section-card > ol li"
    );

    listItems.forEach((item, index) => {
      if (item.querySelector(".article-card-index")) return;  // already done

      const strong  = item.querySelector("strong");
      const rawHtml = item.innerHTML.trim();
      const isOrdered = item.matches(
        ".article-prose ol li, .article-section-card > ol li"
      );
      const number = isOrdered
        ? String(index + 1).padStart(2, "0")
        : String(index + 1);

      if (strong) {
        const strongHtml = strong.outerHTML;
        const bodyHtml   = rawHtml.replace(strongHtml, "").trim();
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

    /* Mark check/stage cards that start with a digit */
    document.querySelectorAll(".article-check-card, .article-stage-card")
      .forEach((card) => {
        const strong = card.querySelector("strong");
        if (!strong) return;
        const hasNum = /^(\d+)[\.\)]\s*/.test(strong.textContent.trim());
        card.classList.toggle("has-leading-number", hasNum);
      });
  }

  /* ── 2. READING PROGRESS BAR ────────────────────────────── */
  function initReadingProgress() {
    const bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-label", "Reading progress");
    bar.setAttribute("aria-valuenow", "0");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.innerHTML = '<div class="reading-progress__bar"></div>';
    document.body.prepend(bar);

    const fill = bar.querySelector(".reading-progress__bar");

    function onScroll() {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct  = docH > 0 ? Math.min(100, (window.scrollY / docH) * 100) : 0;
      fill.style.width = `${pct}%`;
      bar.setAttribute("aria-valuenow", Math.round(pct));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initialise
  }

  /* ── 3. SCROLL FADE ANIMATIONS ─────────────────────────── */
  function initScrollAnimations() {
    const targets = pageRoot.querySelectorAll(
      ".article-section-card, .article-quote-strip, .article-highlights, " +
      ".article-hero-follow-image, .article-stat-grid"
    );

    if (!("IntersectionObserver" in window)) {
      // Fallback: just show everything
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    targets.forEach((el) => el.classList.add("editorial-fade"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ── 4. LANGUAGE SWITCHING ──────────────────────────────── */
  function applyLanguage(lang) {
    const current = lang === "en" ? "en" : "id";

    langBlocks.forEach((block) => {
      block.hidden = block.dataset.langBlock !== current;
    });

    langBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === current);
    });

    /* Update meta title / description */
    const prefix  = config.metaPrefix;
    const metaMap = pageMeta[current];
    if (!prefix || !metaMap) return;

    const title = metaMap[`${prefix}MetaTitle`];
    const desc  = metaMap[`${prefix}MetaDescription`];

    if (title) {
      document.title = title;
      document.querySelector('meta[property="og:title"]')
        ?.setAttribute("content", title);
      document.querySelector('meta[name="twitter:title"]')
        ?.setAttribute("content", title);
    }

    if (desc) {
      document.querySelector('meta[name="description"]')
        ?.setAttribute("content", desc);
      document.querySelector('meta[property="og:description"]')
        ?.setAttribute("content", desc);
      document.querySelector('meta[name="twitter:description"]')
        ?.setAttribute("content", desc);
    }
  }

  /* ── 5. SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────── */
  function initSmoothScroll() {
    pageRoot.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ── 6. IMAGE LAZY-LOAD REVEAL ──────────────────────────── */
  function initImageReveal() {
    const imgs = pageRoot.querySelectorAll(
      ".article-inline-media__image, .article-hero__image"
    );

    imgs.forEach((img) => {
      if (img.complete) return;
      img.style.opacity = "0";
      img.style.transition = "opacity 0.45s ease";
      img.addEventListener("load", () => {
        img.style.opacity = "1";
      }, { once: true });
    });
  }

  /* ── 7. AUTO-EXPAND FIRST FAQ ───────────────────────────── */
  function initFaqDefaults() {
    /* The first FAQ in each grid is marked [open] in HTML already.
       This ensures keyboard-accessible behaviour is consistent. */
    pageRoot.querySelectorAll(".article-faq-card summary").forEach((summary) => {
      summary.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          summary.closest("details").toggleAttribute("open");
        }
      });
    });
  }

  /* ── 8. COPY-LINK BUTTON (sidebar share) ────────────────── */
  function initCopyLink() {
    const copyBtns = pageRoot.querySelectorAll("[data-action='copy-link']");
    copyBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        navigator.clipboard?.writeText(window.location.href).then(() => {
          const orig = btn.textContent;
          btn.textContent = "✓ Copied!";
          setTimeout(() => { btn.textContent = orig; }, 2000);
        });
      });
    });
  }

  /* ── 9. DYNAMIC STAT COUNTER ANIMATION ─────────────────── */
  function initStatCounters() {
    const statCards = pageRoot.querySelectorAll(".article-stat-card strong");
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);

          const el   = entry.target;
          const text = el.textContent.trim();
          // Only animate pure numbers; skip things like "4 pilar", "2 jalur"
          const num  = parseFloat(text.replace(/[^0-9.]/g, ""));
          if (!isNaN(num) && text.replace(/[^0-9.]/g, "") === text) {
            let start = 0;
            const duration = 900;
            const step = 16;
            const increment = (num / (duration / step));
            const timer = setInterval(() => {
              start = Math.min(start + increment, num);
              el.textContent = Number.isInteger(num)
                ? Math.round(start).toLocaleString()
                : start.toFixed(1);
              if (start >= num) clearInterval(timer);
            }, step);
          }
        });
      },
      { threshold: 0.6 }
    );

    statCards.forEach((el) => observer.observe(el));
  }

  /* ── 10. ACTIVE TOC HIGHLIGHT ───────────────────────────── */
  function initToc() {
    const tocLinks = pageRoot.querySelectorAll(".article-toc a[href^='#']");
    if (!tocLinks.length) return;

    const sectionIds = Array.from(tocLinks)
      .map((a) => a.getAttribute("href").slice(1))
      .filter(Boolean);

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    function onScroll() {
      const scrollMid = window.scrollY + window.innerHeight / 3;
      let activeId = sections[0].id;

      sections.forEach((s) => {
        if (s.offsetTop <= scrollMid) activeId = s.id;
      });

      tocLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${activeId}`
        );
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── INIT ───────────────────────────────────────────────── */
  function init() {
    normalizeNumberedCards();
    initReadingProgress();
    initScrollAnimations();
    initSmoothScroll();
    initImageReveal();
    initFaqDefaults();
    initCopyLink();
    initStatCounters();
    initToc();

    /* Language wiring */
    const savedLang = localStorage.getItem("language") || "id";
    applyLanguage(savedLang);

    langBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.dataset.lang || "id";
        localStorage.setItem("language", next);
        window.dispatchEvent(
          new CustomEvent("languagechange", { detail: { lang: next } })
        );
        setTimeout(() => applyLanguage(next), 0);
      });
    });

    window.addEventListener("languagechange", (e) => {
      applyLanguage(e.detail?.lang || localStorage.getItem("language") || "id");
    });
  }

  /* Defer until DOM is ready */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
