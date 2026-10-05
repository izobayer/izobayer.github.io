(() => {
  const root = document.querySelector('.camera-slideshow');
  const image = document.querySelector('#camera-photo');
  const play = document.querySelector('#camera-play');
  let index = 0;
  let timer;
  let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(next) {
    index = (next + cameraPhotos.length) % cameraPhotos.length;
    image.src = cameraPhotos[index].src;
    image.alt = cameraPhotos[index].alt;
    document.querySelector('#camera-count').textContent = `${index + 1} / ${cameraPhotos.length}`;
    const preload = new Image();
    preload.src = cameraPhotos[(index + 1) % cameraPhotos.length].src;
  }
  function sync() {
    clearInterval(timer);
    play.textContent = playing ? 'Pause' : 'Play';
    play.setAttribute('aria-pressed', String(playing));
    if (playing && !document.hidden && !root.matches(':hover') && !root.contains(document.activeElement)) {
      timer = setInterval(() => show(index + 1), 5000);
    }
  }
  play.addEventListener('click', () => { playing = !playing; sync(); });
  document.querySelector('#camera-previous').addEventListener('click', () => { show(index - 1); sync(); });
  document.querySelector('#camera-next').addEventListener('click', () => { show(index + 1); sync(); });
  root.addEventListener('mouseenter', sync);
  root.addEventListener('mouseleave', sync);
  root.addEventListener('focusin', sync);
  root.addEventListener('focusout', () => setTimeout(sync));
  document.addEventListener('visibilitychange', sync);
  show(0);
  sync();
})();
