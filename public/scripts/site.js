(() => {
  const root = document.documentElement;

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const current = root.dataset.theme;
      const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
      const next =
        current === 'dark' || (current === 'auto' && systemDark) ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem('itbiz-theme', next);
      } catch {}
    });
  });

  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('#mobile-menu');
  if (menuButton instanceof HTMLButtonElement && menu instanceof HTMLElement) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
      menuButton.focus();
    };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
      if (!open) menu.querySelector('a')?.focus();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !menu.hidden) {
        event.preventDefault();
        closeMenu();
      }
    });
    menu.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a')) closeMenu();
    });
  }
})();

(() => {
  const dialog = document.querySelector('[data-enquiry-dialog]');
  if (!(dialog instanceof HTMLDialogElement)) return;
  let opener;
  document.querySelectorAll('[data-enquiry-open]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      opener = trigger.closest('#mobile-menu')
        ? document.querySelector('[data-menu-toggle]')
        : trigger;
      dialog.showModal();
      dialog.querySelector('textarea')?.focus({ preventScroll: true });
    });
  });
  dialog
    .querySelector('[data-enquiry-close]')
    ?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
})();
