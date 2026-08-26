(() => {
  const panel = document.querySelector('[data-service-filter-panel]');
  const grid = document.querySelector('[data-filterable-service-grid]');
  if (!(panel instanceof HTMLElement) || !(grid instanceof HTMLElement)) return;

  const buttons = [...panel.querySelectorAll('[data-service-filter]')].filter(
    (button) => button instanceof HTMLButtonElement,
  );
  const cards = [...grid.querySelectorAll('[data-service-card]')].filter(
    (card) => card instanceof HTMLElement,
  );
  const status = panel.querySelector('[data-service-filter-status]');
  const validFilters = new Set(buttons.map((button) => button.dataset.serviceFilter));

  const statusText = (visible) => {
    const template = visible === 1 ? panel.dataset.countOne : panel.dataset.countMany;
    return (template || '{visible} / {total}')
      .replace('{visible}', String(visible))
      .replace('{total}', String(cards.length));
  };

  const applyFilter = (filter, updateHistory = false) => {
    const selected = validFilters.has(filter) ? filter : 'all';
    let visible = 0;

    for (const card of cards) {
      const topics = (card.dataset.serviceFilters || '').split(' ');
      const matches = selected === 'all' || topics.includes(selected);
      card.hidden = !matches;
      if (matches) visible += 1;
    }

    for (const button of buttons) {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.serviceFilter === selected),
      );
    }

    if (status instanceof HTMLElement) status.textContent = statusText(visible);

    if (updateHistory) {
      const url = new URL(window.location.href);
      if (selected === 'all') url.searchParams.delete('temat');
      else url.searchParams.set('temat', selected);
      history.pushState({ serviceFilter: selected }, '', url);
    }
  };

  for (const button of buttons) {
    button.addEventListener('click', () => {
      applyFilter(button.dataset.serviceFilter || 'all', true);
    });
  }

  window.addEventListener('popstate', () => {
    applyFilter(new URL(window.location.href).searchParams.get('temat') || 'all');
  });

  panel.hidden = false;
  applyFilter(new URL(window.location.href).searchParams.get('temat') || 'all');
})();
