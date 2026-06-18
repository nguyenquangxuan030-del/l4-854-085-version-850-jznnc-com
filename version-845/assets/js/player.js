(function () {
  const streamUrl = window.__vod_stream;
  const video = document.getElementById('movie-player');
  const layer = document.querySelector('[data-player-layer]');
  const startButton = document.querySelector('[data-player-start]');
  let initialized = false;
  let hlsInstance = null;

  function prepare() {
    if (!video || !streamUrl || initialized) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    initialized = true;
  }

  function play() {
    if (!video) {
      return;
    }
    prepare();
    if (layer) {
      layer.classList.add('is-hidden');
    }
    video.setAttribute('controls', 'controls');
    const action = video.play();
    if (action && action.catch) {
      action.catch(function () {});
    }
  }

  if (startButton) {
    startButton.addEventListener('click', function (event) {
      event.stopPropagation();
      play();
    });
  }

  if (layer) {
    layer.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
