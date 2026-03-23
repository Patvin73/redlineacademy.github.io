function normalizeTokens(text) {
  return (text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter(Boolean);
}

function similarityScore(a, b) {
  const aSet = new Set(normalizeTokens(a));
  const bSet = new Set(normalizeTokens(b));
  if (aSet.size === 0 || bSet.size === 0) return 0;

  let overlap = 0;
  aSet.forEach((token) => {
    if (bSet.has(token)) overlap += 1;
  });

  return overlap / new Set([...aSet, ...bSet]).size;
}

function buildRelatedLinks(currentPage, allPages, maxLinks = 3) {
  return allPages
    .filter((page) => page.slug !== currentPage.slug)
    .map((page) => ({
      score: similarityScore(currentPage.keyword, page.keyword),
      href: `${page.slug}.html`,
      label: page.headingTitle,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxLinks);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildRelatedLinks,
    similarityScore,
  };
} else {
  window.internalLinks = {
    buildRelatedLinks,
    similarityScore,
  };
}
