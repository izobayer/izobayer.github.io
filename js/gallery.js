(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const cards = [...document.querySelectorAll('.album-card')];
  const grid = $('.album-grid');
  const dialog = $('.gallery-dialog');
  const stage = $('.viewer-stage');
  const fullscreenTarget = $('.viewer-shell');
  const image = $('.dialog-image');
  const thumbs = $('#album-thumbnails');
  const status = $('#cover-status');
  const storageKey = 'zobayer-gallery-covers';
  let savedCovers = {};
  let currentId = '';
  let currentIndex = 0;
  let slideshow = null;
  let opener = null;
  let previousOverflow = '';
  let touchStart = null;
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) savedCovers = stored;
  } catch (_) { /* Browsing works without storage. */ }

  const metadata = new Map();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateValue = (text) => {
    const match = text.match(/(?:(\d{1,2})\s+)?([A-Za-z]+)\s+(\d{4})/);
    const yearOnly = text.match(/\b(20\d{2})\b/);
    return match ? Date.UTC(+match[3], months.indexOf(match[2]), +(match[1] || 1)) : (yearOnly ? Date.UTC(+yearOnly[1], 0, 1) : 0);
  };
  cards.forEach((card) => {
    const album = albums[card.dataset.album];
    const cover = card.querySelector('img');
    card.dataset.defaultCover = cover.getAttribute('src');
    card.dataset.defaultAlt = cover.alt;
    const year = album.meta.match(/\b(20\d{2})\b/)?.[1] || '';
    metadata.set(card, { year, date: dateValue(album.meta), text: `${album.title} ${album.meta} ${album.detail}`.toLowerCase() });
    const index = savedCovers[card.dataset.album];
    if (Number.isInteger(index) && album.images[index]) {
      cover.src = album.images[index].src;
      cover.alt = album.images[index].alt;
    }
  });
  function restoreCover(card) {
    const album = albums[card.dataset.album];
    const index = savedCovers[card.dataset.album];
    const cover = Number.isInteger(index) ? album.images[index] : null;
    card.querySelector('img').src = cover?.src || card.dataset.defaultCover;
    card.querySelector('img').alt = cover?.alt || card.dataset.defaultAlt;
  }
  [...cards].sort((a, b) => {
    const first = metadata.get(a).date, second = metadata.get(b).date;
    if (!first || !second) return Number(!first) - Number(!second);
    return second - first;
  }).forEach(card => grid.append(card));

  function stopSlideshow() {
    if (slideshow) clearInterval(slideshow);
    slideshow = null;
    $('#slideshow-toggle').textContent = 'Play slideshow';
    $('#slideshow-toggle').setAttribute('aria-pressed', 'false');
  }
  function zoom(reset = false) {
    const active = reset ? false : !stage.classList.contains('is-zoomed');
    stage.classList.toggle('is-zoomed', active);
    $('#zoom-photo').textContent = active ? 'Zoom out' : 'Zoom in';
    $('#zoom-photo').setAttribute('aria-pressed', String(active));
    stage.scrollTop = stage.scrollLeft = 0;
    if (active) stopSlideshow();
  }
  function setPhoto(index) {
    const album = albums[currentId];
    currentIndex = (index + album.images.length) % album.images.length;
    const photo = album.images[currentIndex];
    zoom(true);
    $('.viewer-error').hidden = true;
    image.src = photo.src; image.alt = photo.alt;
    $('#dialog-caption').textContent = photo.caption;
    $('#slide-status').textContent = `${currentIndex + 1} / ${album.images.length}`;
    $('#download-photo').href = photo.src;
    $('#download-photo').download = photo.src.split('/').pop();
    const single = album.images.length < 2;
    $('#previous-photo').disabled = $('#next-photo').disabled = single;
    $('#slideshow-toggle').hidden = single;
    [...thumbs.children].forEach((button, i) => {
      button.classList.toggle('is-selected', i === currentIndex);
      button.setAttribute('aria-pressed', String(i === currentIndex));
    });
    const selected = thumbs.children[currentIndex];
    if (selected) {
      const left = selected.getBoundingClientRect().left - thumbs.getBoundingClientRect().left + thumbs.scrollLeft;
      thumbs.scrollTo({ left: Math.max(0, left - 8), behavior: 'auto' });
    }
    status.textContent = '';
  }
  function navigate(direction) { stopSlideshow(); setPhoto(currentIndex + direction); }
  function openAlbum(card, requestedIndex) {
    if (dialog.open) {
      dialog.addEventListener('close', () => openAlbum(card, requestedIndex), { once: true });
      dialog.close();
      return;
    }
    cards.forEach(restoreCover);
    stopSlideshow();
    currentId = card.dataset.album;
    opener = card;
    const album = albums[currentId];
    $('#dialog-title').textContent = album.title;
    $('#dialog-meta').textContent = album.meta;
    $('#dialog-detail').textContent = album.detail;
    thumbs.replaceChildren();
    album.images.forEach((photo, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'album-thumbnail';
      button.setAttribute('aria-label', `View photograph ${index + 1}: ${photo.caption}`);
      const thumbnail = document.createElement('img');
      thumbnail.src = photo.src; thumbnail.alt = photo.alt; thumbnail.loading = 'lazy';
      button.append(thumbnail);
      button.addEventListener('click', () => { stopSlideshow(); setPhoto(index); });
      thumbs.append(button);
    });
    const preferred = requestedIndex ?? savedCovers[currentId];
    const start = Number.isInteger(preferred) && album.images[preferred] ? preferred : 0;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    setPhoto(start);
    $('.dialog-close').focus();
  }
  cards.forEach((card) => {
    card.addEventListener('click', () => openAlbum(card));
  });
  $('#previous-photo').addEventListener('click', () => navigate(-1));
  $('#next-photo').addEventListener('click', () => navigate(1));
  $('#zoom-photo').addEventListener('click', () => zoom());
  image.addEventListener('error', () => { $('.viewer-error').hidden = false; stopSlideshow(); });
  $('#slideshow-toggle').addEventListener('click', () => {
    if (slideshow) return stopSlideshow();
    zoom(true);
    $('#slideshow-toggle').textContent = 'Pause slideshow';
    $('#slideshow-toggle').setAttribute('aria-pressed', 'true');
    slideshow = setInterval(() => setPhoto(currentIndex + 1), 4500);
  });
  $('#set-cover').addEventListener('click', () => {
    savedCovers[currentId] = currentIndex;
    restoreCover(opener);
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedCovers));
      status.textContent = 'Album cover saved in this browser.';
    } catch (_) { status.textContent = 'Cover selected for this visit; this browser cannot save it.'; }
  });
  $('#share-photo').addEventListener('click', async () => {
    const url = new URL(location.href);
    url.hash = `album=${encodeURIComponent(currentId)}&photo=${currentIndex + 1}`;
    try { await navigator.clipboard.writeText(url.href); status.textContent = 'Photo link copied.'; }
    catch (_) { status.textContent = `Photo link: ${url.href}`; }
  });
  $('#fullscreen-photo').hidden = !fullscreenTarget.requestFullscreen || !document.fullscreenEnabled;
  $('#fullscreen-photo').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await fullscreenTarget.requestFullscreen();
    } catch (_) { status.textContent = 'Fullscreen is unavailable in this browser.'; }
  });
  document.addEventListener('fullscreenchange', () => {
    $('#fullscreen-photo').textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
  });
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('cancel', (event) => {
    if (stage.classList.contains('is-zoomed')) { event.preventDefault(); zoom(true); }
  });
  dialog.addEventListener('close', () => {
    stopSlideshow(); zoom(true);
    document.body.style.overflow = previousOverflow;
    if (document.fullscreenElement === fullscreenTarget) document.exitFullscreen().catch(() => {});
    opener?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); navigate(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); stopSlideshow(); setPhoto(event.key === 'Home' ? 0 : albums[currentId].images.length - 1);
    }
  });
  stage.addEventListener('pointerdown', (event) => {
    touchStart = event.pointerType === 'touch' ? { x: event.clientX, y: event.clientY } : null;
  });
  stage.addEventListener('pointerup', (event) => {
    if (touchStart && !stage.classList.contains('is-zoomed')) {
      const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
      if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy)) navigate(dx < 0 ? 1 : -1);
    }
    touchStart = null;
  });
  stage.addEventListener('pointercancel', () => { touchStart = null; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopSlideshow(); cards.forEach(restoreCover); }
  });
  function openSharedPhoto() {
    const params = new URLSearchParams(location.hash.slice(1));
    const legacyStudentAlbums = { 'students-farewell-2026': 1, 'ma-students-2024': 2 };
    const requestedId = params.get('album');
    const offset = legacyStudentAlbums[requestedId];
    const id = offset === undefined ? requestedId : 'with-students';
    const card = cards.find((item) => item.dataset.album === id);
    if (!card) return;
    const photo = Number(params.get('photo') || 1) - 1 + (offset || 0);
    openAlbum(card, Number.isInteger(photo) ? photo : 0);
  }
  window.addEventListener('hashchange', openSharedPhoto);
  openSharedPhoto();
})();
