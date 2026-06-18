(function () {
  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var stream = shell.getAttribute('data-stream');
    var started = false;

    function reveal() {
      if (overlay) {
        overlay.hidden = true;
      }
    }

    function restore() {
      if (overlay) {
        overlay.hidden = false;
      }
      started = false;
    }

    function play() {
      if (!video || !stream) {
        return;
      }
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      reveal();
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(restore);
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        shell.hls = hls;
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(stream);
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(restore);
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            restore();
          }
        });
        return;
      }
      video.src = stream;
      video.play().catch(restore);
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          play();
        }
      });
    }
  }

  document.querySelectorAll('.player-shell').forEach(startPlayer);
})();
