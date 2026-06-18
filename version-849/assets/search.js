(function () {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var formInput = document.querySelector('.search-page-form input[name="q"]');
    var title = document.querySelector('[data-search-title]');
    var note = document.querySelector('[data-search-note]');
    var results = document.querySelector('[data-search-results]');
    var movies = window.SITE_MOVIES || [];

    if (formInput) {
        formInput.value = query;
    }

    var createCard = function (movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '<a href="' + escapeHtml(movie.href) + '" class="card-link" aria-label="观看' + escapeHtml(movie.title) + '">',
            '<div class="card-media">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="card-category">' + escapeHtml(movie.category) + '</span>',
            '<span class="card-play">▶</span>',
            '</div>',
            '<div class="card-body">',
            '<h3>' + escapeHtml(movie.title) + '</h3>',
            '<p>' + escapeHtml(movie.summary) + '</p>',
            '<div class="card-tags">' + tags + '</div>',
            '<div class="card-meta">',
            '<span>' + escapeHtml(movie.region) + '</span>',
            '<span>' + escapeHtml(movie.type) + '</span>',
            '<span>' + escapeHtml(movie.year) + '</span>',
            '</div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    };

    var normalize = function (value) {
        return String(value || '').toLowerCase();
    };

    var matched = [];

    if (query) {
        var lowerQuery = normalize(query);
        matched = movies.filter(function (movie) {
            var text = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                movie.summary,
                (movie.tags || []).join(' ')
            ].join(' ');

            return normalize(text).indexOf(lowerQuery) !== -1;
        }).slice(0, 120);

        if (title) {
            title.textContent = '“' + query + '”的搜索结果';
        }

        if (note) {
            note.textContent = matched.length ? '以下影片与关键词相关。' : '暂未找到匹配内容。';
        }
    } else {
        matched = movies.slice(0, 36);
    }

    if (results) {
        results.innerHTML = matched.map(createCard).join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}());
