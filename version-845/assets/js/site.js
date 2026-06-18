(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        startTimer();
      });
    }

    show(0);
    startTimer();
  }

  const allCards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));
  const chips = Array.from(document.querySelectorAll('[data-filter-value]'));
  let activeFilter = '';

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function applyFilter() {
    const terms = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean);

    allCards.forEach(function (card) {
      const text = cardText(card);
      const termMatch = terms.length === 0 || terms.some(function (term) {
        return text.indexOf(term) !== -1;
      });
      const chipMatch = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(termMatch && chipMatch));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeFilter = chip.getAttribute('data-filter-value') || '';
      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      applyFilter();
    });
  });

  Array.from(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('[data-search-input]');
      if (allCards.length) {
        applyFilter();
      } else if (input && input.value.trim()) {
        window.location.href = './index.html?keyword=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  const params = new URLSearchParams(window.location.search);
  const keyword = params.get('keyword');
  if (keyword && searchInputs.length) {
    searchInputs.forEach(function (input) {
      input.value = keyword;
    });
    applyFilter();
  }
})();
