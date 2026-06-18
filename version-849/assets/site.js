(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
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
        };

        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        restart();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var section = panel.closest('section');
        var grid = section ? section.querySelector('[data-filter-grid]') : null;
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];
        var keywordInput = panel.querySelector('[data-filter-keyword]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var resetButton = panel.querySelector('[data-filter-reset]');
        var empty = section ? section.querySelector('[data-filter-empty]') : null;

        var applyFilter = function () {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !year || card.getAttribute('data-year') === year;
                var matchType = !type || card.getAttribute('data-type') === type;
                var match = matchKeyword && matchYear && matchType;

                card.hidden = !match;

                if (match) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        [keywordInput, yearSelect, typeSelect].forEach(function (input) {
            if (input) {
                input.addEventListener('input', applyFilter);
                input.addEventListener('change', applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (keywordInput) {
                    keywordInput.value = '';
                }

                if (yearSelect) {
                    yearSelect.value = '';
                }

                if (typeSelect) {
                    typeSelect.value = '';
                }

                applyFilter();
            });
        }
    });
}());
