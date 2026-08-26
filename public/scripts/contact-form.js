(() => {
  const form = document.querySelector('[data-lead-form]');
  if (!(form instanceof HTMLFormElement)) return;

  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('button[type="submit"]');

  const showStatus = (message, state) => {
    if (!(status instanceof HTMLElement)) return;
    status.textContent = message;
    status.dataset.state = state;
    status.focus?.();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const phone = String(data.get('phone') || '').trim();

    if (!form.reportValidity()) return;
    if (!email && !phone) {
      showStatus('Podaj e-mail służbowy lub numer telefonu.', 'error');
      form.querySelector('#email')?.focus();
      return;
    }

    if (submit instanceof HTMLButtonElement) {
      submit.disabled = true;
      submit.textContent = 'Wysyłanie…';
    }
    showStatus('Wysyłamy zapytanie…', 'progress');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          payload.message ||
            'Nie udało się wysłać zapytania. Sprawdź dane i spróbuj ponownie.',
        );
      }
      form.reset();
      showStatus(
        payload.preview
          ? `Tryb preview: walidacja zakończona. Zapytanie nie zostało dostarczone. Numer: ${payload.requestId}.`
          : `Zapytanie zostało przyjęte. Numer: ${payload.requestId}.`,
        'success',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nie udało się wysłać zapytania.';
      showStatus(message, 'error');
    } finally {
      if (submit instanceof HTMLButtonElement) {
        submit.disabled = false;
        submit.textContent = 'Wyślij zapytanie B2B';
      }
      if (window.turnstile) window.turnstile.reset();
    }
  });
})();
