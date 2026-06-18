(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var resultLabel = document.querySelector('[data-result-label]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var empty = document.querySelector('.search-empty');
  var queryInput = document.querySelector('[data-query-input]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function updateFilter(value) {
    var keyword = normalize(value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-keywords') || card.textContent);
      var matched = !keyword || text.indexOf(keyword) !== -1;
      card.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }

    if (resultLabel) {
      resultLabel.textContent = keyword ? '找到 ' + visible + ' 部匹配影片' : '输入关键词查看匹配影片';
    }
  }

  if (filterInput) {
    if (queryInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';

      if (q) {
        filterInput.value = q;
      }
    }

    updateFilter(filterInput.value);

    filterInput.addEventListener('input', function () {
      updateFilter(filterInput.value);
    });
  }

  var hlsLoader = null;

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    if (!hlsLoader) {
      hlsLoader = document.createElement('script');
      hlsLoader.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      hlsLoader.async = true;
      document.head.appendChild(hlsLoader);
    }

    hlsLoader.addEventListener('load', callback, { once: true });
    hlsLoader.addEventListener('error', callback, { once: true });
  }

  function prepareVideo(player, done) {
    var video = player.querySelector('video');
    var src = player.getAttribute('data-hls');
    var errorBox = player.querySelector('.player-error');

    if (!video || !src) {
      if (errorBox) {
        errorBox.classList.add('show');
      }
      return;
    }

    if (video.getAttribute('data-ready') === '1') {
      done(video);
      return;
    }

    function markReady() {
      video.setAttribute('data-ready', '1');
      done(video);
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      markReady();
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
        markReady();
      } else if (errorBox) {
        errorBox.classList.add('show');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');

    function start() {
      prepareVideo(player, function (readyVideo) {
        if (overlay) {
          overlay.classList.add('hidden');
        }

        var playResult = readyVideo.play();

        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== '1') {
          start();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
    }
  });
})();
