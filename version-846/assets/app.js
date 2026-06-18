(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    document.querySelectorAll(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });

    setupHero();
    setupFilters();
  });

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (slides.length > 0) {
      show(0);
      restart();
    }
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var searchInput = scope.querySelector("[data-filter-search]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-field]"));
      var container = scope.parentElement || document;
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
      var empty = container.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (searchInput && query) {
        searchInput.value = query;
      }

      function apply() {
        var keyword = normalize(searchInput ? searchInput.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var matched = true;
          var text = normalize(card.getAttribute("data-search"));

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }

          selects.forEach(function (select) {
            var field = select.getAttribute("data-filter-field");
            var value = normalize(select.value);
            var cardValue = normalize(card.getAttribute("data-" + field));

            if (value && cardValue !== value) {
              matched = false;
            }
          });

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", apply);
      }

      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });

      apply();
    });
  }

  window.initMoviePlayer = function (videoId, coverId, messageId, streamUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var message = document.getElementById(messageId);
    var loaded = false;
    var hlsInstance = null;

    if (!video || !cover || !streamUrl) {
      return;
    }

    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.classList.add("show");
      }
    }

    function attach() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("视频暂时无法加载，请稍后再试");
          }
        });
      } else {
        showMessage("视频暂时无法加载，请稍后再试");
      }
    }

    function play() {
      attach();
      cover.classList.add("is-hidden");
      video.controls = true;
      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          video.controls = true;
        });
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
