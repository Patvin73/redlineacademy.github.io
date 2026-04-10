(function () {
  function initBlogHub() {
    const grid = document.getElementById("blogHubGrid");
    if (!grid) return;

    const searchInput = document.getElementById("blogHubSearch");
    const filterButtons = Array.from(document.querySelectorAll(".blog-hub-filter"));
    const cards = Array.from(grid.querySelectorAll(".blog-hub-library-card"));
    const countNode = document.getElementById("blogHubResultCount");

    const state = {
      type: "all",
      difficulty: "all",
      query: "",
    };

    function updateFilterURL() {
      const params = new URLSearchParams();

      if (state.type !== "all") {
        params.set("format", state.type);
      }

      if (state.difficulty !== "all") {
        params.set("level", state.difficulty);
      }

      history.replaceState(
        {},
        "",
        params.toString() ? `?${params}` : location.pathname
      );
    }

    function updateCards() {
      const query = state.query.trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach((card) => {
        const type = card.dataset.type || "";
        const difficulty = card.dataset.difficulty || "";
        const search = (card.dataset.search || "").toLowerCase();

        const matchesType = state.type === "all" || type === state.type;
        const matchesDifficulty =
          state.difficulty === "all" || difficulty === state.difficulty;
        const matchesQuery = !query || search.includes(query);
        const visible = matchesType && matchesDifficulty && matchesQuery;

        card.classList.toggle("is-hidden", !visible);
        if (visible) visibleCount += 1;
      });

      if (countNode) {
        countNode.textContent = String(visibleCount);
      }
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const { group, value } = button.dataset;
        if (!group || !value) return;

        state[group] = value;

        filterButtons
          .filter((item) => item.dataset.group === group)
          .forEach((item) => item.classList.toggle("is-active", item === button));

        updateFilterURL();
        updateCards();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.query = searchInput.value;
        updateCards();
      });
    }

    const params = new URLSearchParams(location.search);
    state.type = params.get("format") || "all";
    state.difficulty = params.get("level") || "all";

    filterButtons.forEach((button) => {
      const { group, value } = button.dataset;
      if (!group || !value) return;

      button.classList.toggle("is-active", state[group] === value);
    });

    updateCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBlogHub);
  } else {
    initBlogHub();
  }
})();
