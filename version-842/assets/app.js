(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function syncHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuButton && mobileNav && header) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      header.classList.toggle('is-open');
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        header.classList.remove('is-open');
      });
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('.horizontal-scroller').forEach(function (scroller) {
    var parent = scroller.closest('.scroller-wrap');
    if (!parent) {
      return;
    }
    var left = parent.querySelector('[data-scroll-left]');
    var right = parent.querySelector('[data-scroll-right]');
    var move = function (direction) {
      scroller.scrollBy({ left: direction * 420, behavior: 'smooth' });
    };
    if (left) {
      left.addEventListener('click', function () { move(-1); });
    }
    if (right) {
      right.addEventListener('click', function () { move(1); });
    }
  });

  document.querySelectorAll('.filter-panel').forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var scopeSelector = panel.getAttribute('data-scope');
    var scope = scopeSelector ? document.querySelector(scopeSelector) : panel.parentElement;
    var items = scope ? Array.prototype.slice.call(scope.querySelectorAll('.search-item')) : [];
    var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
    var activeChip = '';

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var chip = normalize(activeChip);
      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute('data-title'),
          item.getAttribute('data-keywords'),
          item.textContent
        ].join(' '));
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var chipMatch = !chip || haystack.indexOf(chip) !== -1;
        item.classList.toggle('is-hidden-by-filter', !(queryMatch && chipMatch));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chipButton) {
      chipButton.addEventListener('click', function () {
        activeChip = chipButton.getAttribute('data-filter-value') || '';
        chips.forEach(function (button) {
          button.classList.toggle('is-active', button === chipButton);
        });
        applyFilter();
      });
    });
  });

  var scrollButton = document.createElement('button');
  scrollButton.className = 'scroll-top';
  scrollButton.type = 'button';
  scrollButton.textContent = '↑';
  document.body.appendChild(scrollButton);

  function syncScrollButton() {
    if (window.scrollY > 520) {
      scrollButton.classList.add('is-visible');
    } else {
      scrollButton.classList.remove('is-visible');
    }
  }

  scrollButton.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', syncScrollButton, { passive: true });
  syncScrollButton();
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById('moviePlayer');
  var overlay = document.querySelector('.player-overlay');
  var startButton = document.querySelector('.player-start-button');
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function prepare() {
    if (video.dataset.ready === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    video.dataset.ready = 'true';
  }

  function beginPlayback() {
    prepare();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', beginPlayback);
  }

  if (startButton) {
    startButton.addEventListener('click', function (event) {
      event.stopPropagation();
      beginPlayback();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      beginPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
