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
  const summary = form.querySelector('[data-validation-summary]');
  const fields = Array.from(form.querySelectorAll('[data-validation-message]'));
  const labels = {
    submit: form.dataset.submitLabel || 'Send',
    sending: form.dataset.sendingLabel || 'Sending…',
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

  const fieldMessage = (field) => {
    const value = field.value.trim();
    const invalid =
      field.name === 'contact'
        ? !value ||
          (value.includes('@')
            ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            : value.replace(/\D/g, '').length < 7)
        : field.name === 'message'
          ? value.length < 20
          : !value;
    return invalid ? field.dataset.validationMessage : '';
  };

  const validateField = (field) => {
    const message = fieldMessage(field);
    const error = document.getElementById(`${field.id}-error`);
    field.setCustomValidity(message);
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
    return !message;
  };

  const updateSummary = (focus = false) => {
    if (!(summary instanceof HTMLElement)) return;
    const list = summary.querySelector('ul');
    if (!list) return;
    list.replaceChildren();
    for (const field of fields) {
      if (field.getAttribute('aria-invalid') !== 'true') continue;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${field.id}`;
      link.textContent = field.dataset.validationMessage;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        field.focus();
      });
      item.append(link);
      list.append(item);
    }
    summary.hidden = !list.childElementCount;
    if (focus && !summary.hidden) summary.focus();
  };

  for (const field of fields) {
    field.addEventListener('blur', () => {
      validateField(field);
      if (summary && !summary.hidden) updateSummary();
    });
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true' && !fieldMessage(field)) {
        validateField(field);
        if (summary && !summary.hidden) updateSummary();
      }
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        validateField(field);
        if (summary && !summary.hidden) updateSummary();
      }
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit instanceof HTMLButtonElement && submit.disabled) return;
    const valid = fields.map(validateField).every(Boolean);
    updateSummary(!valid);
    if (!valid) {
      return;
    }
    loadTurnstile();
    const data = new FormData(form);

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
