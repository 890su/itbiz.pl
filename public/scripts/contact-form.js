(() => {
  const form = document.querySelector('[data-lead-form]');
  if (!(form instanceof HTMLFormElement)) return;

  let turnstileRequested = false;
  const loadTurnstile = () => {
    if (turnstileRequested || !form.querySelector('.cf-turnstile')) return;
    turnstileRequested = true;
    const script = document.createElement('script');
    script.src = form.dataset.turnstileSrc;
    script.async = true;
    script.referrerPolicy = 'strict-origin-when-cross-origin';
    script.onerror = () => {
      turnstileRequested = false;
      script.remove();
    };
    document.head.append(script);
  };
  form.addEventListener('focusin', loadTurnstile);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadTurnstile();
          observer.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(form);
  } else {
    loadTurnstile();
  }

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
    if (submit instanceof HTMLButtonElement && submit.disabled) return;
    loadTurnstile();
    const data = new FormData(form);
    const contact = String(data.get('contact') || '').trim();

    if (!form.reportValidity()) return;
    if (!contact) {
      showStatus(labels.missingContact, 'error');
      form.querySelector('#contactMethod')?.focus();
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
      if (!payload.preview) {
        window.dispatchEvent(
          new CustomEvent('itbiz:b2b-lead-submit', {
            detail: { requestId: payload.requestId },
          }),
        );
      }
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
