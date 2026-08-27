(() => {
  const storageKey = 'itbiz-consent-v2';
  const defaults = {
    necessary: true,
    analytics: false,
    advertising: false,
    version: 2,
  };
  const banner = document.querySelector('[data-consent-banner]');
  const dialog = document.querySelector('[data-consent-dialog]');
  const form = document.querySelector('[data-consent-form]');

  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || 'null');
      return value?.version === 2 ? { ...defaults, ...value } : null;
    } catch {
      return null;
    }
  };

  const save = (value) => {
    const consent = { ...defaults, ...value, updatedAt: new Date().toISOString() };
    try {
      localStorage.setItem(storageKey, JSON.stringify(consent));
    } catch {}
    if (banner instanceof HTMLElement) banner.hidden = true;
    if (dialog instanceof HTMLDialogElement && dialog.open) dialog.close();
    window.dispatchEvent(new CustomEvent('itbiz:consent', { detail: consent }));
  };

  const openSettings = () => {
    if (!(dialog instanceof HTMLDialogElement) || !(form instanceof HTMLFormElement))
      return;
    const consent = read() || defaults;
    form.elements.analytics.checked = consent.analytics;
    form.elements.advertising.checked = consent.advertising;
    dialog.showModal();
  };

  if (!read() && banner instanceof HTMLElement) banner.hidden = false;
  document
    .querySelector('[data-consent-reject]')
    ?.addEventListener('click', () => save(defaults));
  document
    .querySelector('[data-consent-accept]')
    ?.addEventListener('click', () => save({ analytics: true, advertising: true }));
  document
    .querySelector('[data-consent-customize]')
    ?.addEventListener('click', openSettings);
  document
    .querySelector('[data-consent-dialog-reject]')
    ?.addEventListener('click', () => save(defaults));
  document.querySelectorAll('[data-privacy-settings]').forEach((button) => {
    button.addEventListener('click', openSettings);
  });
  form?.addEventListener('submit', () => {
    save({
      analytics: form.elements.analytics.checked,
      advertising: form.elements.advertising.checked,
    });
  });
})();
