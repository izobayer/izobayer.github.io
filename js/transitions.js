(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  if (reducedMotion) return;

  root.classList.add('motion-enabled');

  const revealTargets = [
    '.masthead',
    '.page-intro',
    '.section',
    '.research-heading',
    '.research-stats',
    '.research-filters',
    '.research-card',
    '.infrastructure-grid article'
  ];

  const reveal = () => {
    const targets = document.querySelectorAll(revealTargets.join(','));
    targets.forEach((target, index) => {
      target.classList.add('reveal');
      target.style.setProperty('--reveal-delay', String(Math.min(index * 45, 240)) + 'ms');
    });

    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal-visible');
        activeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });

    targets.forEach(target => observer.observe(target));
  };

  window.addEventListener('DOMContentLoaded', () => {
    reveal();
    requestAnimationFrame(() => root.classList.add('motion-ready'));
  });

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname && destination.hash) return;

    event.preventDefault();
    root.classList.add('is-leaving');
    window.setTimeout(() => { window.location.href = destination.href; }, 220);
  });
})();
