(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var activeIndex = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(activeIndex + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(activeIndex - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(activeIndex + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupCardFilter() {
    var input = document.querySelector("[data-card-filter]");
    var list = document.querySelector("[data-card-list]");
    var empty = document.querySelector("[data-no-filter-results]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      var visibleCount = 0;
      cards.forEach(function (card) {
        var matched = !keyword || (card.dataset.search || "").indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    var heading = document.querySelector("[data-search-heading]");
    var empty = document.querySelector("[data-empty-search]");
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!results || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var currentQuery = params.get("q") || "";
    input.value = currentQuery;

    function createCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        "<article class=\"movie-card\" data-movie-card>",
        "  <a class=\"poster-link\" href=\"./" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
        "    <img src=\"./" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "  </a>",
        "  <div class=\"card-body\">",
        "    <div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
        "    <h3><a href=\"./" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
        "    <p>" + escapeHtml(movie.oneLine) + "</p>",
        "    <div class=\"card-tags\">" + tags + "</div>",
        "  </div>",
        "</article>"
      ].join("\n");
    }

    function render(query) {
      var keyword = query.trim().toLowerCase();
      var matched = data.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return (movie.searchText || "").indexOf(keyword) !== -1;
      });

      results.innerHTML = matched.map(createCard).join("\n");
      if (heading) {
        heading.textContent = keyword ? "搜索结果" : "全部推荐";
      }
      if (empty) {
        empty.hidden = matched.length !== 0;
      }
    }

    render(currentQuery);
  }

  function setupVideoPlayer() {
    var video = document.querySelector("[data-m3u8]");
    if (!video) {
      return;
    }
    var source = video.getAttribute("data-m3u8");
    var shell = video.closest(".video-shell");
    var startButton = shell ? shell.querySelector(".player-start") : null;
    var hlsInstance = null;

    function bindSource() {
      if (!source) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      bindSource();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (startButton) {
      startButton.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });

    video.addEventListener("pause", function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove("is-playing");
      }
    });

    video.addEventListener("error", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });

    bindSource();
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCardFilter();
    setupSearchPage();
    setupVideoPlayer();
  });
})();
