(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));

    shells.forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-cover');
        var streamUrl = shell.getAttribute('data-stream');
        var playerReady = false;
        var hlsInstance = null;

        var prepare = function () {
            if (playerReady || !video || !streamUrl) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }

            playerReady = true;
        };

        var play = function () {
            prepare();
            shell.classList.add('is-playing');
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        };

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                play();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });

            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
