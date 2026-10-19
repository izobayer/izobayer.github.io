(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const nav = header?.querySelector('.nav');
  if (!nav) return;

  const mobile = window.matchMedia('(max-width: 700px)');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'menu-toggle';
  nav.id = 'primary-navigation';
  toggle.setAttribute('aria-controls', nav.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path class="menu-icon-open" d="M4 6h16M4 12h16M4 18h16"/><path class="menu-icon-close" d="m6 6 12 12M18 6 6 18"/></svg><span>Menu</span>';
  header.querySelector('.brand').before(toggle);
  header.classList.add('has-mobile-menu');

  function setOpen(open, restoreFocus = false) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('span').textContent = open ? 'Close' : 'Menu';
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobile.matches && nav.classList.contains('is-open')) {
      event.preventDefault();
      setOpen(false, true);
    }
  });
  nav.addEventListener('click', (event) => {
    if (mobile.matches && event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (mobile.matches && !header.contains(event.target)) setOpen(false);
  });
  mobile.addEventListener('change', () => {
    const restoreFocus = mobile.matches && nav.contains(document.activeElement);
    setOpen(false, restoreFocus);
  });
  window.addEventListener('pageshow', () => setOpen(false));
})();
