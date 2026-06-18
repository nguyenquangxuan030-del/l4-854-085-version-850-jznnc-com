(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initHeader() {
    var header = qs('.site-header');
    if (!header) {
      return;
    }

    var update = function () {
      if (window.scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initMobileNav() {
    var toggle = qs('[data-mobile-toggle]');
    var nav = qs('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
    });

    qsa('a', nav).forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    if (slides.length <= 1) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    play();
  }

  function initScrollers() {
    qsa('[data-scroll-target]').forEach(function (button) {
      button.addEventListener('click', function () {
        var targetId = button.getAttribute('data-scroll-target');
        var direction = button.getAttribute('data-scroll-direction') || 'right';
        var target = qs('#' + targetId);
        if (!target) {
          return;
        }
        var amount = Math.min(460, Math.max(280, target.clientWidth * 0.72));
        target.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
      });
    });
  }

  function normalize(text) {
    return (text || '').toString().toLowerCase().trim();
  }

  function initListingFilters() {
    var panels = qsa('[data-filter-panel]');

    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute('data-filter-panel');
      var scope = qs(scopeSelector);
      if (!scope) {
        return;
      }

      var cards = qsa('[data-movie-card]', scope);
      var keyword = qs('[data-filter-keyword]', panel);
      var region = qs('[data-filter-region]', panel);
      var type = qs('[data-filter-type]', panel);
      var year = qs('[data-filter-year]', panel);
      var summary = qs('[data-filter-summary]');
      var empty = qs('[data-empty-state]');

      function matches(card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));

        var keywordValue = keyword ? normalize(keyword.value) : '';
        var regionValue = region ? region.value : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';

        if (keywordValue && haystack.indexOf(keywordValue) === -1) {
          return false;
        }

        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          return false;
        }

        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          return false;
        }

        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          return false;
        }

        return true;
      }

      function apply() {
        var count = 0;
        cards.forEach(function (card) {
          var visible = matches(card);
          card.style.display = visible ? '' : 'none';
          if (visible) {
            count += 1;
          }
        });

        if (summary) {
          summary.textContent = '当前显示 ' + count + ' 部影片，共 ' + cards.length + ' 部';
        }

        if (empty) {
          empty.classList.toggle('is-visible', count === 0);
        }
      }

      [keyword, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && keyword) {
        keyword.value = query;
      }

      apply();
    });
  }

  function initSiteSearch() {
    qsa('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input', form);
        var value = input ? input.value.trim() : '';
        var base = form.getAttribute('data-search-target') || 'movies.html';
        var joiner = base.indexOf('?') >= 0 ? '&' : '?';
        window.location.href = value ? base + joiner + 'q=' + encodeURIComponent(value) : base;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initMobileNav();
    initHero();
    initScrollers();
    initListingFilters();
    initSiteSearch();
  });
})();
