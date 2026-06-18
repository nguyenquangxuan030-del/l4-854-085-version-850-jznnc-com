(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length > 1) {
            var index = 0;
            var show = function (next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        var filterInput = document.querySelector("[data-card-filter]");
        if (filterInput) {
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
            filterInput.addEventListener("input", function () {
                var keyword = filterInput.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre")
                    ].join(" ").toLowerCase();
                    card.style.display = text.indexOf(keyword) >= 0 ? "" : "none";
                });
            });
        }

        var searchForm = document.querySelector("[data-search-form]");
        if (searchForm) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = searchForm.querySelector("input");
                var query = input ? input.value.trim() : "";
                if (query) {
                    window.location.href = "search.html?q=" + encodeURIComponent(query);
                }
            });
        }

        var results = document.querySelector("[data-search-results]");
        var queryInput = document.querySelector("[data-search-input]");
        if (results && queryInput && Array.isArray(window.SEARCH_MOVIES)) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            queryInput.value = initial;

            var render = function () {
                var keyword = queryInput.value.trim().toLowerCase();
                var list = window.SEARCH_MOVIES.filter(function (item) {
                    var text = [item.title, item.year, item.region, item.genre, item.type, item.tags].join(" ").toLowerCase();
                    return !keyword || text.indexOf(keyword) >= 0;
                }).slice(0, 90);

                if (!list.length) {
                    results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
                    return;
                }

                results.innerHTML = list.map(function (item) {
                    return [
                        '<article class="movie-card">',
                        '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
                        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                        '<span class="poster-glow"></span>',
                        '</a>',
                        '<div class="movie-card-body">',
                        '<div class="tag-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
                        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
                        '<p>' + escapeHtml(item.one) + '</p>',
                        '<div class="meta-line">' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</div>',
                        '</div>',
                        '</article>'
                    ].join("");
                }).join("");
            };

            queryInput.addEventListener("input", render);
            render();
        }
    });

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.setupMoviePlayer = function (videoId, source, buttonSelector) {
        var video = document.getElementById(videoId);
        var button = document.querySelector(buttonSelector);
        if (!video) {
            return;
        }

        var started = false;
        var hlsInstance = null;

        function attachSource() {
            if (started) {
                return;
            }
            started = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function play() {
            attachSource();
            if (button) {
                button.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (!started) {
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
