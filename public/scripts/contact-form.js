(() => {
  let sdkPromise;
  const loadSdk = (src) => {
    if (window.turnstile) return Promise.resolve();
    if (!sdkPromise)
      sdkPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.referrerPolicy = 'strict-origin-when-cross-origin';
        script.onload = () =>
          window.turnstile ? resolve() : reject(new Error('Verification unavailable'));
        script.onerror = () => {
          sdkPromise = undefined;
          script.remove();
          reject(new Error('Verification unavailable'));
        };
        document.head.append(script);
      });
    return sdkPromise;
  };
  const init = (form) => {
    let widgetId;
    let verificationFailed = false;
    let loadingWidget;
    const container = form.querySelector('.cf-turnstile');
    const loadTurnstile = () => {
      if (!container || widgetId !== undefined || loadingWidget) return loadingWidget;
      verificationFailed = false;
      loadingWidget = loadSdk(form.dataset.turnstileSrc)
        .then(() => {
          widgetId = window.turnstile.render(container, {
            sitekey: container.dataset.sitekey,
            action: container.dataset.action,
            language: container.dataset.language,
            size: container.dataset.size,
            appearance: container.dataset.appearance,
            theme: container.dataset.theme,
            'error-callback': () => {
              verificationFailed = true;
            },
            callback: () => {
              verificationFailed = false;
            },
          });
        })
        .catch(() => {
          verificationFailed = true;
        })
        .finally(() => {
          loadingWidget = undefined;
        });
      return loadingWidget;
    };
    form.addEventListener('focusin', loadTurnstile);

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
      verifying: form.dataset.verifyingLabel,
      verificationError: form.dataset.verificationError,
    };

    const showStatus = (message, state) => {
      if (!(status instanceof HTMLElement)) return;
      status.textContent = message;
      status.dataset.state = state;
      status.focus?.();
    };

    const waitForVerification = () =>
      new Promise((resolve, reject) => {
        const deadline = Date.now() + 45000;
        const check = () => {
          if (form.querySelector('[name="cf-turnstile-response"]')?.value) resolve();
          else if (verificationFailed || Date.now() >= deadline)
            reject(new Error(labels.verificationError || labels.genericError));
          else setTimeout(check, 100);
        };
        check();
      });

    form.addEventListener('reset', () => {
      const extras = form.querySelector('.enquiry-extras');
      if (extras) extras.open = false;
    });
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
      const error = document.getElementById(
        field.dataset.validationTarget || `${field.id}-error`,
      );
      field.setCustomValidity(message);
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
      if (error) {
        if (error.hasAttribute('data-field-guidance'))
          error.classList.toggle('field-error', Boolean(message));
        else {
          error.textContent = message;
          error.hidden = !message;
        }
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

      if (submit instanceof HTMLButtonElement) {
        submit.disabled = true;
        submit.textContent = labels.sending;
      }
      showStatus(labels.verifying, 'progress');

      try {
        await waitForVerification();
        // The visitor may edit the enquiry while verification is in progress.
        if (!fields.map(validateField).every(Boolean)) {
          updateSummary(true);
          if (status) status.textContent = '';
          return;
        }
        showStatus(labels.sending, 'progress');
        const data = new FormData(form);
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
        showStatus(payload.preview ? labels.preview : labels.success, 'success');
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
        if (window.turnstile && widgetId !== undefined)
          window.turnstile.reset(widgetId);
      }
    });
  };
  document.querySelectorAll('[data-lead-form]').forEach(init);
})();
