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
    const content = document.querySelector('main');
    const footer = document.querySelector('.site-footer');
    const dock = document.querySelector('.mobile-contact-bar');
    const setOpen = (open, restoreFocus = true) => {
      menuButton.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      for (const element of [content, footer, dock]) if (element) element.inert = open;
      if (open) menu.querySelector('a, summary')?.focus({ preventScroll: true });
      else if (restoreFocus) menuButton.focus({ preventScroll: true });
    };
    menuButton.addEventListener('click', () => setOpen(menu.hidden));
    document.addEventListener('keydown', (event) => {
      if (menu.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key === 'Tab') {
        const items = [
          ...menuButton.closest('header').querySelectorAll('a, button, summary'),
        ].filter((el) => el.getClientRects().length && !el.closest('[inert]'));
        const first = items[0],
          last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    });
    menu.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
    });
    matchMedia('(min-width: 72rem)').addEventListener('change', (event) => {
      if (event.matches && !menu.hidden) setOpen(false, false);
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
