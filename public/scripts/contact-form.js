(() => {
  const form = document.querySelector('[data-lead-form]');
  if (!(form instanceof HTMLFormElement)) return;

  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('button[type="submit"]');
  const labels = {
    submit: form.dataset.submitLabel || 'Send',
    sending: form.dataset.sendingLabel || 'Sending…',
    missingContact: form.dataset.missingContact || 'Provide an email or phone.',
    genericError: form.dataset.genericError || 'The request could not be sent.',
    success: form.dataset.successLabel || 'Request accepted.',
    preview: form.dataset.previewLabel || 'Preview: request not stored.',
    request: form.dataset.requestLabel || 'Reference',
  };

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
      showStatus(labels.missingContact, 'error');
      form.querySelector('#email')?.focus();
      return;
    }

    if (submit instanceof HTMLButtonElement) {
      submit.disabled = true;
      submit.textContent = labels.sending;
    }
    showStatus(labels.sending, 'progress');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || labels.genericError);
      }
      form.reset();
      showStatus(
        `${payload.preview ? labels.preview : labels.success} ${labels.request}: ${payload.requestId}.`,
        'success',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : labels.genericError;
      showStatus(message, 'error');
    } finally {
      if (submit instanceof HTMLButtonElement) {
        submit.disabled = false;
        submit.textContent = labels.submit;
      }
      if (window.turnstile) window.turnstile.reset();
    }
  });
})();
