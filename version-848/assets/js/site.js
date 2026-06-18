var SitePlayer = {
  attach: function(videoId, mediaUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }
    var root = video.closest("[data-player-root]");
    var control = root ? root.querySelector("[data-play-control]") : null;
    var started = false;

    function hideControl() {
      if (control) {
        control.classList.add("is-hidden");
      }
    }

    function loadAndPlay() {
      if (started) {
        video.play().catch(function() {});
        hideControl();
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
        video.play().catch(function() {});
      } else if (window.Hls) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
      } else {
        video.src = mediaUrl;
        video.play().catch(function() {});
      }
      hideControl();
    }

    if (control) {
      control.addEventListener("click", loadAndPlay);
    }
    video.addEventListener("click", function() {
      if (video.paused) {
        loadAndPlay();
      }
    });
    video.addEventListener("play", hideControl);
  }
};

(function() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-nav-menu]");
  if (toggle && menu) {
    toggle.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        showSlide(i);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function(panel) {
    var container = panel.parentElement;
    var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
    var search = panel.querySelector("[data-search-input]");
    var yearSelect = panel.querySelector("[data-year-filter]");
    var regionSelect = panel.querySelector("[data-region-filter]");
    var message = document.createElement("div");
    message.className = "no-results";
    message.textContent = "未找到匹配内容";

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      values.forEach(function(value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    var years = [];
    var regions = [];
    cards.forEach(function(card) {
      var year = (card.getAttribute("data-year") || "").trim();
      var region = (card.getAttribute("data-region") || "").trim();
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      if (region && regions.indexOf(region) === -1) {
        regions.push(region);
      }
    });
    years.sort(function(a, b) {
      return b.localeCompare(a, "zh-Hans-CN");
    });
    regions.sort(function(a, b) {
      return a.localeCompare(b, "zh-Hans-CN");
    });
    fillSelect(yearSelect, years);
    fillSelect(regionSelect, regions);

    function applyFilters() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var yearValue = yearSelect ? yearSelect.value : "";
      var regionValue = regionSelect ? regionSelect.value : "";
      var visible = 0;

      cards.forEach(function(card) {
        var text = (card.getAttribute("data-title") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (yearValue && cardYear !== yearValue) {
          ok = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      var grid = container.querySelector(".movie-grid");
      if (grid) {
        if (!visible) {
          if (!message.parentElement) {
            grid.appendChild(message);
          }
        } else if (message.parentElement) {
          message.parentElement.removeChild(message);
        }
      }
    }

    if (search) {
      search.addEventListener("input", applyFilters);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilters);
    }
    if (regionSelect) {
      regionSelect.addEventListener("change", applyFilters);
    }
  });
})();
