(function () {
  var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
  var hlsLoader = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
      return hlsLoader;
    }

    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = HLS_CDN;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('HLS library failed to load'));
      };
      document.head.appendChild(script);
    });

    return hlsLoader;
  }

  function canPlayNativeHls(video) {
    return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
  }

  function setStatus(shell, message) {
    var status = shell.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message || '';
    }
  }

  function initPlayer(shell) {
    var video = shell.querySelector('video[data-m3u8]');
    var button = shell.querySelector('[data-player-button]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-m3u8');
    var initialized = false;

    function attachSource() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;
      setStatus(shell, '正在初始化播放源…');

      if (!source) {
        setStatus(shell, '当前影片没有可用播放源');
        return Promise.resolve();
      }

      if (canPlayNativeHls(video)) {
        video.src = source;
        setStatus(shell, '播放源已就绪');
        return Promise.resolve();
      }

      return loadHlsLibrary()
        .then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              setStatus(shell, '播放源已就绪');
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus(shell, '视频加载失败，请稍后重试');
              }
            });
            shell._hls = hls;
          } else {
            video.src = source;
            setStatus(shell, '浏览器将尝试直接播放 M3U8 源');
          }
        })
        .catch(function () {
          video.src = source;
          setStatus(shell, 'HLS 库加载失败，浏览器将尝试直接播放');
        });
    }

    function playOrPause() {
      attachSource().then(function () {
        if (video.paused) {
          var result = video.play();
          if (result && typeof result.catch === 'function') {
            result.catch(function () {
              setStatus(shell, '请再次点击播放按钮开始播放');
            });
          }
        } else {
          video.pause();
        }
      });
    }

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      setStatus(shell, '正在播放');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
      setStatus(shell, '已暂停');
    });

    video.addEventListener('loadedmetadata', function () {
      setStatus(shell, '播放源已就绪');
    });

    video.addEventListener('error', function () {
      setStatus(shell, '视频加载失败，请检查网络或播放源');
    });

    video.addEventListener('click', playOrPause);

    if (button) {
      button.addEventListener('click', playOrPause);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]')).forEach(initPlayer);
  });
})();
