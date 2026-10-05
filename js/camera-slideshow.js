(() => {
  const root = document.querySelector('.camera-slideshow');
  const image = document.querySelector('#camera-photo');
  const play = document.querySelector('#camera-play');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const previousImage = image.cloneNode();
  previousImage.removeAttribute('id');
  previousImage.alt = '';
  previousImage.setAttribute('aria-hidden', 'true');
  previousImage.className = 'camera-fade-layer';
  image.after(previousImage);
  const loadedPhotos = cameraPhotos.map(photo => {
    const preload = new Image();
    preload.src = photo.src;
    return preload.decode().then(() => preload).catch(() => null);
  });
  let request = 0;
  let fade;
  let index = 0;
  let timer;
  let playing = !reducedMotion;
  async function show(next) {
    index = (next + cameraPhotos.length) % cameraPhotos.length;
    const selected = index;
    const token = ++request;
    const loaded = await loadedPhotos[selected];
    if (token !== request || !loaded) return;
    fade?.cancel();
    previousImage.src = image.src;
    image.src = cameraPhotos[selected].src;
    image.alt = cameraPhotos[selected].alt;
    document.querySelector('#camera-count').textContent = `${selected + 1} / ${cameraPhotos.length}`;
    if (!reducedMotion && previousImage.src !== image.src) {
      fade = previousImage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 650, easing: 'ease-in-out' });
    }
  }
  function sync() {
    clearInterval(timer);
    play.textContent = playing ? 'Pause' : 'Play';
    play.setAttribute('aria-pressed', String(playing));
    if (playing && !document.hidden && !root.matches(':hover') && !root.contains(document.activeElement)) {
      timer = setInterval(() => show(index + 1), 3000);
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
