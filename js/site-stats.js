(() => {
  'use strict';
  const script = document.currentScript;
  const url = new URL('../data/site-stats.json', script.src);
  const footer = document.querySelector('footer');
  if (!footer) return;

  const dayInZone = (date, timeZone) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(date);
    const value = (type) => parts.find((part) => part.type === type).value;
    return `${value('year')}-${value('month')}-${value('day')}`;
  };

  fetch(url, { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error('Stats unavailable');
      return response.json();
    })
    .then((data) => {
      if (data.status !== 'ready') return;
      if (!['todayVisitors', 'todayViews', 'totalViews'].every(
        (key) => Number.isSafeInteger(data[key]) && data[key] >= 0,
      )) throw new Error('Invalid stats');
      const updated = new Date(data.updatedAt);
      if (!Number.isFinite(updated.getTime()) || data.todayViews > data.totalViews) {
        throw new Error('Invalid stats');
      }
      const render = () => {
        footer.querySelector('.site-stats')?.remove();
        const today = dayInZone(new Date(), data.timeZone);
        const isToday = data.date === today;
        const section = document.createElement('section');
        section.className = 'site-stats';
        section.setAttribute('aria-label', 'Website visits');
        const list = document.createElement('dl');
        const bangla = document.documentElement.lang.startsWith('bn');
        const locale = bangla ? 'bn-BD' : 'en-US';
        const number = new Intl.NumberFormat(locale);
        const labels = bangla
          ? ['আজকের দর্শক', 'আজকের পেজ ভিউ', 'মোট পেজ ভিউ']
          : ["Today's visitors", "Today's page views", 'Total page views'];
        const values = [isToday ? data.todayVisitors : null, isToday ? data.todayViews : null, data.totalViews];
        labels.forEach((label, index) => {
          const item = document.createElement('div');
          const term = document.createElement('dt');
          const value = document.createElement('dd');
          term.textContent = label;
          value.textContent = values[index] === null ? '—' : number.format(values[index]);
          item.append(term, value);
          list.append(item);
        });
        const note = document.createElement('p');
        const when = new Intl.DateTimeFormat(locale, {
          timeZone: data.timeZone, dateStyle: 'medium', timeStyle: 'short',
        }).format(updated);
        note.textContent = bangla
          ? `Google Analytics · সর্বশেষ হালনাগাদ: ${when}`
          : `Google Analytics · Updated ${when}`;
        section.append(list, note);
        footer.append(section);
      };
      render();
      new MutationObserver(render).observe(document.documentElement, {
        attributes: true, attributeFilter: ['lang'],
      });
    })
    .catch(() => { /* Keep the footer usable when counts cannot be loaded. */ });
})();
