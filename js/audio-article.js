(function () {
  function initAudioArticle() {
    const audio = document.getElementById("episodeAudio");
    if (!audio) return;

    const sourceNode = audio.querySelector("source");
    const downloadLink = document.querySelector("[data-audio-download]");
    const playButton = document.querySelector('[data-action="play"]');
    const backButton = document.querySelector('[data-action="backward"]');
    const forwardButton = document.querySelector('[data-action="forward"]');
    const seek = document.getElementById("audioSeek");
    const currentTimeNode = document.getElementById("audioCurrentTime");
    const durationNode = document.getElementById("audioDuration");
    const speedButtons = Array.from(
      document.querySelectorAll(".audio-article-speed__btn"),
    );
    const transcriptGroups = Array.from(
      document.querySelectorAll("[data-transcript-lang]"),
    );

    function getTranscriptButtons() {
      return Array.from(
        document.querySelectorAll(
          '[data-transcript-lang]:not([hidden]) .audio-article-transcript__item',
        ),
      );
    }

    function formatTime(value) {
      if (!Number.isFinite(value)) return "--:--";
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60);
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function updateTimeline() {
      currentTimeNode.textContent = formatTime(audio.currentTime);

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        const progress = (audio.currentTime / audio.duration) * 100;
        seek.value = String(progress);
        durationNode.textContent = formatTime(audio.duration);
      }

      let activeButton = null;
      getTranscriptButtons().forEach((button) => {
        const time = Number(button.dataset.time || 0);
        if (audio.currentTime >= time) activeButton = button;
      });

      getTranscriptButtons().forEach((button) =>
        button.classList.toggle("is-active", button === activeButton),
      );
    }

    function updatePlayButton() {
      if (!playButton) return;
      const playLabel =
        typeof window.t === "function" ? window.t("audioPlayLabel") : "Play";
      const pauseLabel =
        typeof window.t === "function" ? window.t("audioPauseLabel") : "Pause";
      playButton.textContent = audio.paused ? playLabel : pauseLabel;
    }

    function applyLanguageVariant(lang, options = {}) {
      const normalizedLang = lang === "en" ? "en" : "id";
      const nextSrc =
        normalizedLang === "en" && audio.dataset.srcEn
          ? audio.dataset.srcEn
          : audio.dataset.srcId;

      transcriptGroups.forEach((group) => {
        group.hidden = group.dataset.transcriptLang !== normalizedLang;
      });

      if (downloadLink && nextSrc) {
        downloadLink.setAttribute("href", nextSrc);
      }

      if (audio.dataset.activeSrc === nextSrc || !nextSrc) {
        updateTimeline();
        updatePlayButton();
        return;
      }

      audio.pause();
      audio.dataset.activeSrc = nextSrc;

      if (sourceNode) {
        sourceNode.src = nextSrc;
        audio.load();
      } else {
        audio.src = nextSrc;
      }

      if (options.resetTime !== false) {
        audio.currentTime = 0;
      }

      seek.value = "0";
      currentTimeNode.textContent = "00:00";
      durationNode.textContent = "--:--";
      updateTimeline();
      updatePlayButton();
    }

    if (playButton) {
      playButton.addEventListener("click", async () => {
        if (audio.paused) {
          try {
            await audio.play();
          } catch (error) {
            console.warn("Audio playback failed:", error);
          }
        } else {
          audio.pause();
        }
        updatePlayButton();
      });
    }

    if (backButton) {
      backButton.addEventListener("click", () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
      });
    }

    if (forwardButton) {
      forwardButton.addEventListener("click", () => {
        const duration = Number.isFinite(audio.duration) ? audio.duration : audio.currentTime + 15;
        audio.currentTime = Math.min(duration, audio.currentTime + 15);
      });
    }

    seek.addEventListener("input", () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      audio.currentTime = (Number(seek.value) / 100) * audio.duration;
    });

    speedButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const speed = Number(button.dataset.speed || 1);
        audio.playbackRate = speed;
        speedButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      });
    });

    transcriptGroups.forEach((group) => {
      group.addEventListener("click", async (event) => {
        const button = event.target.closest(".audio-article-transcript__item");
        if (!button) return;

        audio.currentTime = Number(button.dataset.time || 0);
        updateTimeline();

        if (audio.paused) {
          try {
            await audio.play();
          } catch (error) {
            console.warn("Audio playback failed:", error);
          }
        }

        updatePlayButton();
      });
    });

    audio.addEventListener("loadedmetadata", updateTimeline);
    audio.addEventListener("timeupdate", updateTimeline);
    audio.addEventListener("play", updatePlayButton);
    audio.addEventListener("pause", updatePlayButton);

    applyLanguageVariant(localStorage.getItem("language") || "id", {
      resetTime: false,
    });
    document.addEventListener("languagechange", (event) => {
      applyLanguageVariant(event.detail?.lang || "id");
    });

    updateTimeline();
    updatePlayButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAudioArticle);
  } else {
    initAudioArticle();
  }
})();
