const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const sharedStyle = `
    <style>
      /* Editorial Redesign */
      .article-page {
        --editorial-bg: #f6f1ea;
        --editorial-surface: rgba(255, 252, 247, 0.88);
        --editorial-line: rgba(24, 20, 17, 0.08);
        --editorial-text: #181411;
        --editorial-muted: #6a6159;
        --editorial-accent: #b42318;
        --editorial-accent-soft: #fce7dd;
        --editorial-shadow: 0 24px 60px rgba(35, 22, 14, 0.12);
        background:
          radial-gradient(circle at top, rgba(183, 47, 31, 0.1), transparent 28%),
          linear-gradient(180deg, #f5efe8, #f7f4ef);
        color: var(--editorial-text);
      }
      .article-page .section-padding { padding-top: 0; }
      .article-page .article-shell { display: block; }
      .article-page .article-hero {
        min-height: 88vh; margin: 0 calc(50% - 50vw) 2rem; border-radius: 0; overflow: clip; background: transparent; box-shadow: none;
      }
      .article-page .article-hero::before {
        content: ""; position: absolute; inset: 0; z-index: 1;
        background: linear-gradient(180deg, rgba(15,13,12,.2), rgba(15,13,12,.82)), linear-gradient(130deg, rgba(98,27,18,.78), rgba(16,16,16,.18));
      }
      .article-page .article-hero__inner {
        position: relative; z-index: 2; display: grid; grid-template-columns: 1fr; align-content: end; min-height: 88vh; max-width: 1120px; margin: 0 auto; padding: 7rem 1.25rem 2.75rem;
      }
      .article-page .article-hero__visual { position: absolute; inset: 0; }
      .article-page .article-hero__image-wrap, .article-page .article-hero__image { width: 100%; height: 100%; border: 0; border-radius: 0; }
      .article-page .article-hero__image-wrap::after { display: none; }
      .article-page .article-hero__image { object-fit: cover; }
      .article-page .article-hero__inner > div:first-child { position: relative; max-width: 760px; }
      .article-page .article-hero__eyebrow, .article-page .article-highlights .article-highlight {
        border-color: rgba(255,255,255,.18); background: rgba(255,255,255,.1); backdrop-filter: blur(14px);
      }
      .article-page .article-hero__title {
        max-width: 11ch; margin-top: 1rem; font-family: "Bricolage Grotesque", sans-serif; font-size: clamp(2.8rem, 7vw, 5.5rem); line-height: .95; letter-spacing: -.05em;
      }
      .article-page .article-hero__intro { font-size: 1.08rem; color: rgba(255,255,255,.84); }
      .article-page .article-highlights { display: flex; flex-wrap: wrap; gap: .8rem; margin-top: 1.25rem; grid-template-columns: none; }
      .article-page .article-highlight { width: auto; padding: .75rem .95rem; border-radius: 999px; }
      .article-page .article-highlight__label, .article-page .article-highlight__value { color: #fff; }
      .reading-progress { position: fixed; inset: 0 auto auto 0; z-index: 300; width: 100%; height: 4px; background: rgba(24,20,17,.08); }
      .reading-progress__bar { width: 0; height: 100%; background: linear-gradient(90deg, #b42318, #ff7a59); }
      .article-author-chip {
        display: flex; align-items: center; gap: .85rem; margin-top: 1.4rem; padding: .9rem 1rem; width: min(320px, 100%); border-radius: 22px; background: rgba(12,11,10,.46); border: 1px solid rgba(255,255,255,.12); backdrop-filter: blur(16px);
      }
      .article-author-chip img { width: 52px; height: 52px; border-radius: 16px; }
      .article-author-chip__eyebrow { color: rgba(255,255,255,.66); font-size: .82rem; }
      .article-author-chip__name { display: block; color: #fff; font-weight: 700; }
      .article-page .article-magazine {
        display: grid; grid-template-columns: minmax(0,.7fr) minmax(280px,.3fr); gap: 2rem; max-width: 1120px; margin: 0 auto; padding: 0 1.25rem;
      }
      .article-page .article-sidebar { position: sticky; top: 92px; align-self: start; }
      .article-page .article-section-card, .article-page .article-sidebar-card, .article-page .article-footer-card {
        background: var(--editorial-surface); border: 1px solid var(--editorial-line); border-radius: 30px; box-shadow: var(--editorial-shadow); backdrop-filter: blur(14px);
      }
      .article-page .article-section-card { margin-bottom: 1.35rem; padding: 2rem; }
      .article-page .article-section-card__title {
        margin-bottom: 1rem; font-family: "Bricolage Grotesque", sans-serif; font-size: clamp(1.7rem, 3.2vw, 2.4rem); line-height: 1; color: var(--editorial-text);
      }
      .article-page .article-section-card__text, .article-page .article-prose p, .article-page .article-prose li, .article-page .article-section-card li, .article-page .article-section-card ol li {
        font-size: 17px; line-height: 1.82; color: var(--editorial-muted);
      }
      .article-page .article-lead { margin-bottom: 1.25rem; font-size: 1.24rem; font-weight: 700; line-height: 1.7; color: var(--editorial-text); }
      .article-page .article-inline-highlight { background: linear-gradient(transparent 32%, #fde1d2 32%); color: #6c1f15; font-weight: 700; }
      .article-page .article-inline-media__frame, .article-page .article-figure img { overflow: hidden; border-radius: 24px; }
      .article-page .article-inline-media__image, .article-page .article-figure img { width: 100%; aspect-ratio: 16/9; object-fit: cover; transition: transform 220ms ease; }
      .article-page .article-inline-media__image:hover, .article-page .article-figure img:hover { transform: scale(1.03); }
      .article-page .article-figure { margin: 1.5rem 0 0; }
      .article-page .article-figure figcaption { margin-top: .65rem; color: var(--editorial-muted); font-size: .9rem; }
      .article-page .article-quote-strip { margin-bottom: 1.35rem; padding: 1.5rem 1.6rem; border-left: 4px solid var(--editorial-accent); border-radius: 0 30px 30px 0; background: linear-gradient(135deg, #fff4ec, #fffaf7); }
      .article-page .article-quote-strip blockquote { margin: 0; font-family: "Bricolage Grotesque", sans-serif; font-size: clamp(1.4rem, 2.8vw, 2rem); line-height: 1.18; color: #6b2117; }
      .article-page .article-stat-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; margin: 1.5rem 0; }
      .article-page .article-stat-card { padding: 1.15rem; border-radius: 22px; background: linear-gradient(180deg, #fff, #fff7f2); border: 1px solid rgba(180,35,24,.12); }
      .article-page .article-stat-card strong { display: block; font-family: "Bricolage Grotesque", sans-serif; font-size: 2rem; line-height: 1; }
      .article-page .article-stat-card span { display: block; margin-top: .45rem; color: var(--editorial-muted); font-size: .92rem; }
      .article-page .article-sidebar-card { padding: 1.2rem; margin-bottom: 1rem; }
      .article-page .article-sidebar-card h3 { margin: 0 0 .9rem; font-family: "Bricolage Grotesque", sans-serif; font-size: 1.08rem; }
      .article-page .article-toc { display: grid; gap: .55rem; }
      .article-page .article-toc a, .article-page .article-share button, .article-page .article-share a {
        display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: .78rem .9rem; border: 1px solid var(--editorial-line); border-radius: 16px; background: #fff; color: var(--editorial-muted); transition: 180ms ease;
      }
      .article-page .article-toc a:hover, .article-page .article-toc a.active, .article-page .article-share button:hover, .article-page .article-share a:hover {
        border-color: var(--editorial-accent); color: var(--editorial-accent); background: var(--editorial-accent-soft);
      }
      .article-page .article-related-item { display: grid; grid-template-columns: 84px 1fr; gap: .8rem; align-items: center; padding: .35rem 0; }
      .article-page .article-related-item img { width: 84px; height: 64px; border-radius: 14px; object-fit: cover; }
      .article-page .article-related-item strong { font-size: .95rem; line-height: 1.35; }
      .article-page .article-share { display: grid; gap: .7rem; }
      .article-page .article-footer { display: grid; gap: 1.2rem; margin-top: .4rem; }
      .article-page .article-footer-card { padding: 1.5rem; }
      .article-page .article-tags { display: flex; flex-wrap: wrap; gap: .6rem; }
      .article-page .article-tags span { padding: .5rem .8rem; border-radius: 999px; background: var(--editorial-accent-soft); color: #6b2117; font-size: .9rem; }
      .article-page .article-bio { display: grid; grid-template-columns: 88px 1fr; gap: 1rem; align-items: center; }
      .article-page .article-bio img { width: 88px; height: 88px; border-radius: 28px; }
      .article-page .article-bio h3, .article-page .article-up-next h3 { margin: 0 0 .35rem; font-family: "Bricolage Grotesque", sans-serif; }
      .article-page .article-bio-links { display: flex; gap: .75rem; margin-top: .75rem; }
      .article-page .article-bio-links a { color: var(--editorial-accent); }
      .article-page .article-up-next { overflow: hidden; padding: 0; }
      .article-page .article-up-next img { width: 100%; aspect-ratio: 16/8; object-fit: cover; }
      .article-page .article-up-next__content { padding: 1.4rem; }
      .article-page .article-up-next__eyebrow { color: var(--editorial-accent); font-size: .82rem; text-transform: uppercase; letter-spacing: .08em; }
      .article-page .editorial-fade { opacity: 0; transform: translateY(24px); transition: opacity 480ms ease, transform 480ms ease; }
      .article-page .editorial-fade.is-visible { opacity: 1; transform: translateY(0); }
      @media (max-width: 980px) {
        .article-page .article-hero, .article-page .article-hero__inner { min-height: auto; }
        .article-page .article-magazine, .article-page .article-stat-grid { grid-template-columns: 1fr; }
        .article-page .article-sidebar { position: static; }
      }
      @media (max-width: 768px) {
        .article-page .article-section-card { padding: 1.35rem; }
        .article-page .article-bio, .article-page .article-stat-grid { grid-template-columns: 1fr; }
      }
    </style>`;

function buildScript(config, metaKey) {
  return `
    <script>
      window.editorialConfig = ${JSON.stringify(config)};
      (function () {
        const config = window.editorialConfig;
        const pageMeta = window.pageTranslations || {};
        const langButtons = document.querySelectorAll(".lang-btn");
        const langBlocks = document.querySelectorAll("[data-lang-block]");
        const readingBar = document.getElementById("readingBar");

        function moveHighlightsIntoHero() {
          const hero = document.querySelector(".article-hero__inner > div:first-child");
          const highlights = document.querySelector(".article-highlights");
          if (hero && highlights && !hero.contains(highlights)) hero.appendChild(highlights);
        }

        function injectAuthorChip() {
          const heroContent = document.querySelector(".article-hero__inner > div:first-child");
          if (!heroContent || heroContent.querySelector(".article-author-chip")) return;
          const chip = document.createElement("div");
          chip.className = "article-author-chip";
          chip.innerHTML = '<img src="../assets/images/redlinelogo.png" alt="Redline Academy Editorial Team"><div><div class="article-author-chip__eyebrow" data-copy-role></div><span class="article-author-chip__name">' + config.author.name + '</span><div class="article-author-chip__eyebrow">Caregiver pathway research</div></div>';
          heroContent.appendChild(chip);
        }

        function slugify(text, fallback) {
          return (text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) || fallback;
        }

        function injectFigure(section, figureConfig, lang) {
          if (!section || !figureConfig || section.querySelector(".article-figure")) return;
          const figure = document.createElement("figure");
          figure.className = "article-figure";
          figure.innerHTML = '<img src="' + figureConfig.src + '" alt="' + figureConfig.alt + '"><figcaption>' + (lang === "id" ? figureConfig.captionId : figureConfig.captionEn) + '</figcaption>';
          section.appendChild(figure);
        }

        function injectStatCards(section) {
          if (!section || section.querySelector(".article-stat-grid")) return;
          const grid = document.createElement("div");
          grid.className = "article-stat-grid";
          grid.innerHTML = config.stats.map((item) => '<div class="article-stat-card"><strong>' + item.value + '</strong><span>' + item.label + '</span></div>').join("");
          const title = section.querySelector(".article-section-card__title");
          if (title) title.insertAdjacentElement("afterend", grid);
        }

        function buildMagazineLayout(block, lang) {
          if (!block || block.dataset.editorialReady === "true") return;
          const sections = Array.from(block.children);
          const wrapper = document.createElement("div");
          wrapper.className = "article-magazine";
          const main = document.createElement("div");
          main.className = "article-main";
          const sidebar = document.createElement("aside");
          sidebar.className = "article-sidebar";
          sidebar.innerHTML = '<section class="article-sidebar-card editorial-fade"><h3>' + (lang === "id" ? "Daftar Isi" : "Table of Contents") + '</h3><nav class="article-toc"></nav></section><section class="article-sidebar-card editorial-fade"><h3>' + (lang === "id" ? "Artikel Terkait" : "Related Articles") + '</h3><div class="article-related"></div></section><section class="article-sidebar-card editorial-fade"><h3>' + (lang === "id" ? "Bagikan" : "Share") + '</h3><div class="article-share"><a href="https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href) + '" target="_blank" rel="noreferrer">Twitter</a><a href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.href) + '" target="_blank" rel="noreferrer">LinkedIn</a><button type="button" class="article-copy-link">Copy Link</button></div></section>';
          const toc = sidebar.querySelector(".article-toc");
          const related = sidebar.querySelector(".article-related");

          config.related.forEach((item) => {
            const anchor = document.createElement("a");
            anchor.className = "article-related-item";
            anchor.href = item.href;
            anchor.innerHTML = '<img src="' + item.image + '" alt="' + item.title + '"><strong>' + item.title + '</strong>';
            related.appendChild(anchor);
          });

          sections.forEach((section, index) => {
            const title = section.querySelector(".article-section-card__title");
            if (title && !section.id) section.id = slugify(title.textContent, 'section-' + (index + 1));
            section.classList.add("editorial-fade");
            if (index === 0) {
              const firstParagraph = section.querySelector("p");
              if (firstParagraph) firstParagraph.classList.add("article-lead");
            }
            const paragraphs = section.querySelectorAll("p");
            if (paragraphs.length > 1) {
              paragraphs[1].innerHTML = paragraphs[1].innerHTML.replace(/credential/gi, '<span class="article-inline-highlight">credential</span>');
            }
            if (config.statSection === index) injectStatCards(section);
            if (!section.querySelector("img") && config.figures[index]) injectFigure(section, config.figures[index], lang);
            if (title) {
              const link = document.createElement("a");
              link.href = '#' + section.id;
              link.textContent = title.textContent;
              toc.appendChild(link);
            }
            main.appendChild(section);
          });

          const footer = document.createElement("div");
          footer.className = "article-footer editorial-fade";
          footer.innerHTML = '<section class="article-footer-card"><h3>' + (lang === "id" ? "Tag Artikel" : "Article Tags") + '</h3><div class="article-tags">' + config.tags.map((tag) => '<span>' + tag + '</span>').join("") + '</div></section><section class="article-footer-card article-bio"><img src="../assets/images/redlinelogo.png" alt="Redline Academy team"><div><h3>' + config.author.name + '</h3><p>' + (lang === "id" ? config.author.bioId : config.author.bioEn) + '</p><div class="article-bio-links"><a href="https://redlineacademy.com.au" target="_blank" rel="noreferrer">Website</a><a href="contact.html">Contact</a><a href="blog.html">Blog</a></div></div></section><a class="article-footer-card article-up-next" href="' + config.upNext.href + '"><img src="' + config.upNext.image + '" alt="Up next article"><div class="article-up-next__content"><div class="article-up-next__eyebrow">' + (lang === "id" ? "Artikel Berikutnya" : "Up Next") + '</div><h3>' + (lang === "id" ? config.upNext.titleId : config.upNext.titleEn) + '</h3><p>' + (lang === "id" ? config.upNext.bodyId : config.upNext.bodyEn) + '</p></div></a>';
          main.appendChild(footer);
          wrapper.appendChild(main);
          wrapper.appendChild(sidebar);
          block.appendChild(wrapper);
          block.dataset.editorialReady = "true";

          const copyButton = sidebar.querySelector(".article-copy-link");
          if (copyButton) {
            copyButton.addEventListener("click", async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                copyButton.textContent = "Copied";
                setTimeout(() => { copyButton.textContent = "Copy Link"; }, 1200);
              } catch (error) {}
            });
          }
        }

        function updateLanguage(lang) {
          langBlocks.forEach((block) => { block.hidden = block.dataset.langBlock !== lang; });
          langButtons.forEach((button) => { button.classList.toggle("active", button.dataset.lang === lang); });
          const copyRole = document.querySelector("[data-copy-role]");
          if (copyRole) copyRole.textContent = lang === "id" ? config.author.roleId : config.author.roleEn;
          const metaMap = pageMeta[lang];
          if (metaMap) {
            document.title = metaMap['${metaKey}MetaTitle'];
            document.querySelector('meta[name="description"]').setAttribute("content", metaMap['${metaKey}MetaDescription']);
            document.querySelector('meta[property="og:title"]').setAttribute("content", metaMap['${metaKey}MetaTitle']);
            document.querySelector('meta[property="og:description"]').setAttribute("content", metaMap['${metaKey}MetaDescription']);
            document.querySelector('meta[name="twitter:title"]').setAttribute("content", metaMap['${metaKey}MetaTitle']);
            document.querySelector('meta[name="twitter:description"]').setAttribute("content", metaMap['${metaKey}MetaDescription']);
          }
        }

        function updateReadingBar() {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
          readingBar.style.width = Math.min(progress, 100) + "%";
        }

        function observeFade() {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); });
          }, { threshold: 0.15 });
          document.querySelectorAll(".editorial-fade").forEach((node) => observer.observe(node));
        }

        moveHighlightsIntoHero();
        injectAuthorChip();
        buildMagazineLayout(document.querySelector('[data-lang-block="id"]'), "id");
        buildMagazineLayout(document.querySelector('[data-lang-block="en"]'), "en");
        updateLanguage(localStorage.getItem("language") || "id");
        langButtons.forEach((button) => {
          button.addEventListener("click", () => {
            localStorage.setItem("language", button.dataset.lang);
            updateLanguage(button.dataset.lang);
          });
        });
        const menuToggle = document.querySelector(".menu-toggle");
        const nav = document.querySelector("header nav");
        if (menuToggle && nav) menuToggle.addEventListener("click", () => nav.classList.toggle("active"));
        window.addEventListener("scroll", updateReadingBar);
        updateReadingBar();
        observeFade();
      })();
    </script>`;
}

const pages = [
  {
    file: "pages/kursus-caregiver-bersertifikat.html",
    metaKey: "kursus",
    config: {
      author: {
        roleId: "Ditulis oleh",
        roleEn: "Written by",
        name: "Redline Academy Editorial Team",
        bioId: "Tim editorial Redline Academy menulis tentang caregiver training, credential architecture, dan career pathways untuk membantu pembaca memahami nilai sebuah credential.",
        bioEn: "The Redline Academy editorial team writes about caregiver training, credential architecture, and career pathways to help readers understand credential value."
      },
      tags: ["kursus caregiver bersertifikat", "credential research", "australian nmf", "micro credential"],
      stats: [
        { value: "60 detik", label: "Verifikasi credential digital yang lebih meyakinkan employer" },
        { value: "2 jalur", label: "Recognition pathway: internasional dan domestik" },
        { value: "1 gap", label: "Recognition gap yang ingin ditutup oleh credential design" }
      ],
      statSection: 1,
      upNext: {
        href: "lembaga-pelatihan-caregiver.html",
        image: "../assets/images/elder_support-optimized.jpg",
        titleId: "Lembaga Pelatihan Caregiver: 7 Hal yang Harus Kamu Periksa Sebelum Mendaftar",
        titleEn: "Caregiver Training Institution: 7 Things You Should Check Before Enrolling",
        bodyId: "Setelah paham credential, langkah berikutnya adalah membandingkan kualitas institusi secara lebih cerdas.",
        bodyEn: "Once the credential is clear, the next step is comparing institution quality more intelligently."
      },
      related: [
        { href: "pelatihan-caregiver-indonesia.html", image: "../assets/images/assistant_carer-optimized.jpg", title: "Pelatihan Caregiver Indonesia" },
        { href: "lembaga-pelatihan-caregiver.html", image: "../assets/images/elder_support-optimized.jpg", title: "Lembaga Pelatihan Caregiver" },
        { href: "daftar-menjadi-caregiver-profesional.html", image: "../assets/images/care_and_love-optimized.jpg", title: "Daftar Menjadi Caregiver Profesional" }
      ],
      figures: {
        0: { src: "https://source.unsplash.com/800x450/?certificate,caregiver", alt: "Credential caregiver", captionId: "Credential yang kuat harus menjelaskan capability, assessment, dan konteks learning outcomes.", captionEn: "A strong credential should explain capability, assessment, and learning outcomes clearly." }
      }
    }
  },
  {
    file: "pages/lembaga-pelatihan-caregiver.html",
    metaKey: "lembaga",
    config: {
      author: {
        roleId: "Ditulis oleh",
        roleEn: "Written by",
        name: "Redline Academy Editorial Team",
        bioId: "Tim editorial Redline Academy menulis untuk membantu calon peserta membandingkan lembaga, credential, dan pathway karier dengan lebih kritis.",
        bioEn: "The Redline Academy editorial team helps prospective learners compare institutions, credentials, and career pathways more critically."
      },
      tags: ["lembaga pelatihan caregiver", "institution comparison", "caregiver credential", "career support"],
      stats: [
        { value: "7 poin", label: "Checklist inti sebelum mendaftar ke lembaga mana pun" },
        { value: "1 keputusan", label: "Pilihan institusi yang membentuk nilai credential jangka panjang" },
        { value: "0 asumsi", label: "Semua calon peserta perlu verifikasi, bukan sekadar percaya promosi" }
      ],
      statSection: 1,
      upNext: {
        href: "daftar-menjadi-caregiver-profesional.html",
        image: "../assets/images/care_and_love-optimized.jpg",
        titleId: "Daftar Menjadi Caregiver Profesional: Panduan Langkah demi Langkah",
        titleEn: "Apply to Become a Professional Caregiver: Step-by-Step Guide",
        bodyId: "Kalau institusinya sudah jelas, sekarang saatnya masuk ke langkah pendaftaran yang paling realistis.",
        bodyEn: "Once the institution is clear, it is time to move into the most practical enrolment steps."
      },
      related: [
        { href: "pelatihan-caregiver-indonesia.html", image: "../assets/images/assistant_carer-optimized.jpg", title: "Pelatihan Caregiver Indonesia" },
        { href: "kursus-caregiver-bersertifikat.html", image: "../assets/images/caregiver-optimized.jpg", title: "Kursus Caregiver Bersertifikat" },
        { href: "daftar-menjadi-caregiver-profesional.html", image: "../assets/images/care_and_love-optimized.jpg", title: "Daftar Menjadi Caregiver Profesional" }
      ],
      figures: {
        0: { src: "https://source.unsplash.com/800x450/?caregiver,school", alt: "Lembaga caregiver", captionId: "Pilihan lembaga bukan hanya soal belajar, tetapi juga tentang bagaimana credential dibawa ke pasar kerja.", captionEn: "Choosing an institution is not only about learning, but about how the credential travels into the job market." }
      }
    }
  },
  {
    file: "pages/daftar-menjadi-caregiver-profesional.html",
    metaKey: "daftar",
    config: {
      author: {
        roleId: "Ditulis oleh",
        roleEn: "Written by",
        name: "Redline Academy Editorial Team",
        bioId: "Tim editorial Redline Academy membantu calon peserta memahami langkah nyata menuju karier caregiver profesional, dari kesiapan hingga enrolment.",
        bioEn: "The Redline Academy editorial team helps future learners understand the practical steps into a professional caregiver career, from readiness to enrolment."
      },
      tags: ["daftar caregiver profesional", "ready to enrol", "caregiver career", "program pathway"],
      stats: [
        { value: "4 langkah", label: "Kerangka pendaftaran yang dibuat lebih mudah dipahami" },
        { value: "24 jam", label: "Estimasi respons orientasi awal dari tim program" },
        { value: "stackable", label: "Credential bisa dilanjutkan ke tier berikutnya kapan saja" }
      ],
      statSection: 1,
      upNext: {
        href: "pelatihan-caregiver-indonesia.html",
        image: "../assets/images/assistant_carer-optimized.jpg",
        titleId: "Pelatihan Caregiver Indonesia: Mengapa Standar Australia Mengubah Segalanya",
        titleEn: "Caregiver Training in Indonesia: Why Australian Standards Change Everything",
        bodyId: "Butuh kembali ke gambaran besar? Mulai lagi dari halaman discovery untuk melihat cluster artikel secara utuh.",
        bodyEn: "Need to step back into the bigger picture? Return to the discovery page and review the full article cluster."
      },
      related: [
        { href: "pelatihan-caregiver-indonesia.html", image: "../assets/images/assistant_carer-optimized.jpg", title: "Pelatihan Caregiver Indonesia" },
        { href: "kursus-caregiver-bersertifikat.html", image: "../assets/images/caregiver-optimized.jpg", title: "Kursus Caregiver Bersertifikat" },
        { href: "lembaga-pelatihan-caregiver.html", image: "../assets/images/elder_support-optimized.jpg", title: "Lembaga Pelatihan Caregiver" }
      ],
      figures: {
        0: { src: "https://source.unsplash.com/800x450/?caregiver,application", alt: "Pendaftaran caregiver", captionId: "Keputusan mendaftar menjadi lebih mudah ketika program, credential, dan institusi sudah dipahami lebih dulu.", captionEn: "The enrolment decision becomes easier once the program, credential, and institution are already understood." }
      }
    }
  }
];

for (const page of pages) {
  const filePath = path.join(root, page.file);
  let source = fs.readFileSync(filePath, "utf8");

  if (!source.includes("/* Editorial Redesign */")) {
    source = source.replace(/<script type="application\/ld\+json">/, `${sharedStyle}\n    <script type="application/ld+json">`);
  }

  if (!source.includes('class="reading-progress"')) {
    source = source.replace(/<body([^>]*)>/, '<body$1>\n    <div class="reading-progress"><div class="reading-progress__bar" id="readingBar"></div></div>');
  }

  source = source.replace(
    /<script src="\.\.\/js\/script\.js" defer><\/script>/,
    buildScript(page.config, page.metaKey)
  );

  fs.writeFileSync(filePath, source, "utf8");
}

console.log("Injected editorial redesign into article pages.");
