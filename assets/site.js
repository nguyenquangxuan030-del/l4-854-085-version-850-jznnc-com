(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  qsa('[data-card-filter]').forEach(function (bar) {
    var input = qs('.filter-input', bar);
    var year = qs('.filter-year', bar);
    var region = qs('.filter-region', bar);
    var type = qs('.filter-type', bar);
    var scope = bar.parentElement || document;
    var cards = qsa('.movie-card, .ranking-card', scope);

    function valueOf(el) {
      return el ? el.value.trim().toLowerCase() : '';
    }

    function apply() {
      var keyword = valueOf(input);
      var selectedYear = valueOf(year);
      var selectedRegion = valueOf(region);
      var selectedType = valueOf(type);
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var pass = true;
        if (keyword && text.indexOf(keyword) === -1) {
          pass = false;
        }
        if (selectedYear && String(card.getAttribute('data-year')).toLowerCase() !== selectedYear) {
          pass = false;
        }
        if (selectedRegion && String(card.getAttribute('data-region')).toLowerCase() !== selectedRegion) {
          pass = false;
        }
        if (selectedType && String(card.getAttribute('data-type')).toLowerCase() !== selectedType) {
          pass = false;
        }
        card.hidden = !pass;
      });
    }

    [input, year, region, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  });

  var searchRoot = qs('#searchResults');
  if (searchRoot && Array.isArray(window.MOVIE_INDEX)) {
    var searchInput = qs('#searchInput');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (searchInput) {
      searchInput.value = initial;
    }

    function escapeText(value) {
      return String(value || '').replace(/[&<>"]/g, function (ch) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[ch];
      });
    }

    function card(item) {
      return [
        '<article class="movie-card">',
        '<a class="poster" href="' + escapeText(item.url) + '">',
        '<img src="' + escapeText(item.cover) + '" alt="' + escapeText(item.title) + '" loading="lazy">',
        '<span class="poster-badge">' + escapeText(item.category) + '</span>',
        '<span class="poster-play">▶</span>',
        '</a>',
        '<div class="card-body">',
        '<h2><a href="' + escapeText(item.url) + '">' + escapeText(item.title) + '</a></h2>',
        '<p>' + escapeText(item.oneLine) + '</p>',
        '<div class="card-meta">',
        '<span>' + escapeText(item.year) + '</span>',
        '<span>' + escapeText(item.region) + '</span>',
        '<span>' + escapeText(item.rating) + '</span>',
        '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function render(query) {
      var keyword = String(query || '').trim().toLowerCase();
      var list = window.MOVIE_INDEX.filter(function (item) {
        if (!keyword) {
          return true;
        }
        return [item.title, item.region, item.year, item.type, item.genre, item.category, item.tags, item.oneLine].join(' ').toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 120);
      searchRoot.innerHTML = list.map(card).join('');
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        render(searchInput.value);
      });
    }
    render(initial);
  }
})();
