(() => {
  const init = (form) => {
    const message = form.elements.message;
    const topic = form.elements.serviceId;
    const details = form.querySelector('[data-enquiry-details]');
    const examples = form.querySelector('[data-enquiry-examples]');
    const list = form.querySelector('.enquiry-example-list');
    const all = form.querySelector('[data-examples-all]');
    if (!(message instanceof HTMLTextAreaElement) || !details || !examples || !list)
      return;

    const originals = [...list.children];
    // Two copies keep even short service lists scrollable for a complete loop.
    const clones = [...originals, ...originals].map((item) => {
      const clone = item.cloneNode(true);
      clone.tabIndex = -1;
      clone.setAttribute('aria-hidden', 'true');
      clone.dataset.exampleClone = '';
      list.append(clone);
      return clone;
    });
    let expanded = false;
    let visible = false;
    let frame = 0;
    let lastTime = 0;
    let offset = 0;
    let typingTimer = 0;
    let selectedText = '';
    let hoveredRow = null;
    let stopPositioning = () => {};
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const positionSelection = () => {
      stopPositioning();
      const box = form.closest('.lead-enquiry') || form;
      const controller = new AbortController();
      const options = { passive: true, signal: controller.signal };
      let positionFrame = 0;
      const position = () => {
        positionFrame = 0;
        const viewport = window.visualViewport;
        const viewportTop = viewport?.offsetTop || 0;
        let top = viewportTop + 12;
        let bottom = viewportTop + (viewport?.height || window.innerHeight) - 12;
        const header = document.querySelector('.mobile-bar');
        if (header?.getClientRects().length)
          top = Math.max(top, header.getBoundingClientRect().bottom + 12);
        for (const overlay of document.querySelectorAll(
          '.mobile-contact-bar, [data-consent-banner]',
        )) {
          if (
            overlay.getClientRects().length &&
            getComputedStyle(overlay).visibility !== 'hidden'
          )
            bottom = Math.min(bottom, overlay.getBoundingClientRect().top - 12);
        }
        const bounds = box.getBoundingClientRect();
        let delta = 0;
        if (bounds.height > bottom - top)
          delta = message.getBoundingClientRect().top - top;
        else if (bounds.top < top) delta = bounds.top - top;
        else if (bounds.bottom > bottom) delta = bounds.bottom - bottom;
        if (Math.abs(delta) > 1)
          window.scrollTo({
            top: window.scrollY + delta,
            behavior: reduced.matches ? 'instant' : 'smooth',
          });
      };
      const schedule = () => {
        cancelAnimationFrame(positionFrame);
        positionFrame = requestAnimationFrame(position);
      };
      const observer = 'ResizeObserver' in window ? new ResizeObserver(schedule) : null;
      const timeout = setTimeout(() => stopPositioning(), 1200);
      stopPositioning = () => {
        controller.abort();
        observer?.disconnect();
        clearTimeout(timeout);
        cancelAnimationFrame(positionFrame);
        stopPositioning = () => {};
      };
      // Follow the keyboard opening, then leave subsequent scrolling to the visitor.
      window.visualViewport?.addEventListener('resize', schedule, options);
      let viewportOffset = window.visualViewport?.offsetTop || 0;
      window.visualViewport?.addEventListener(
        'scroll',
        () => {
          const nextOffset = window.visualViewport.offsetTop;
          if (nextOffset !== viewportOffset) schedule();
          viewportOffset = nextOffset;
        },
        options,
      );
      window.addEventListener('resize', schedule, options);
      for (const event of ['pointerdown', 'touchmove', 'wheel', 'keydown'])
        window.addEventListener(event, () => stopPositioning(), options);
      observer?.observe(box);
      schedule();
    };
    let loopHeight = 0;
    const measureLoop = () => {
      loopHeight =
        clones[0] && originals[0] ? clones[0].offsetTop - originals[0].offsetTop : 0;
    };
    if ('ResizeObserver' in window) new ResizeObserver(measureLoop).observe(list);
    else window.addEventListener('resize', measureLoop);

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };
    const animate = (time) => {
      if (lastTime && loopHeight > 0)
        offset = (offset + Math.min(time - lastTime, 50) * 0.024) % loopHeight;
      lastTime = time;
      list.scrollTop = offset;
      frame = requestAnimationFrame(animate);
    };
    const updateMotion = () => {
      stop();
      clones.forEach((item) => (item.hidden = expanded || reduced.matches));
      if (reduced.matches) {
        offset = 0;
        list.scrollTop = 0;
      }
      measureLoop();
      if (
        visible &&
        !expanded &&
        !reduced.matches &&
        !examples.hidden &&
        !document.hidden &&
        !list.contains(document.activeElement)
      )
        frame = requestAnimationFrame(animate);
    };
    const reveal = () => {
      const hasMessage = message.value.trim().length > 0;
      if (hasMessage) details.hidden = false;
      examples.hidden = hasMessage || Boolean(typingTimer);
      updateMotion();
    };
    const cancelTyping = () => {
      stopPositioning();
      clearTimeout(typingTimer);
      typingTimer = 0;
      form.removeAttribute('data-typing-example');
    };
    const finishTyping = () => {
      if (!typingTimer) return;
      cancelTyping();
      message.value = selectedText;
      message.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const rowAtPoint = (event) => {
      const bounds = list.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        return null;
      return [...list.children].find((item) => {
        const row = item.getBoundingClientRect();
        return !item.hidden && event.clientY >= row.top && event.clientY <= row.bottom;
      });
    };
    const highlight = (row) => {
      hoveredRow?.classList.remove('is-hovered');
      hoveredRow = row;
      hoveredRow?.classList.add('is-hovered');
    };
    examples.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'mouse') highlight(rowAtPoint(event));
    });
    examples.addEventListener('pointerleave', () => highlight(null));
    examples.addEventListener('click', (event) => {
      const example =
        event.target.closest('[data-enquiry-example]') || rowAtPoint(event);
      if (!example) return;
      highlight(null);
      cancelTyping();
      selectedText = example.textContent.trim();
      if (
        example.dataset.serviceId &&
        (topic instanceof HTMLSelectElement || topic instanceof HTMLInputElement)
      ) {
        topic.value = example.dataset.serviceId;
        topic.dispatchEvent(new Event('change', { bubbles: true }));
      }
      details.hidden = false;
      examples.hidden = true;
      updateMotion();
      // Reserve the full text height before typing so the form does not keep growing.
      message.value = selectedText;
      message.style.height = 'auto';
      message.style.height = Math.max(112, message.scrollHeight) + 'px';
      if (reduced.matches) {
        message.dispatchEvent(new Event('input', { bubbles: true }));
        message.focus({ preventScroll: true });
        positionSelection();
        return;
      }
      message.value = '';
      form.setAttribute('data-typing-example', 'true');
      message.focus({ preventScroll: true });
      positionSelection();
      const characters = Array.from(selectedText);
      let length = 0;
      const typeNext = () => {
        message.value = characters.slice(0, ++length).join('');
        message.dispatchEvent(new Event('input', { bubbles: true }));
        message.setSelectionRange(message.value.length, message.value.length);
        if (length < characters.length) typingTimer = setTimeout(typeNext, 28);
        else cancelTyping();
      };
      typingTimer = setTimeout(typeNext, 28);
    });
    message.addEventListener('beforeinput', cancelTyping);
    message.addEventListener('keydown', (event) => {
      if (!['Tab', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key))
        cancelTyping();
    });
    message.addEventListener('pointerdown', cancelTyping);
    message.addEventListener('input', reveal);
    form.addEventListener('submit', finishTyping, true);
    all?.addEventListener('click', () => {
      expanded = !expanded;
      examples.classList.toggle('is-expanded', expanded);
      all.setAttribute('aria-expanded', String(expanded));
      all.textContent = expanded ? all.dataset.less : all.dataset.all;
      offset = 0;
      list.scrollTop = 0;
      updateMotion();
    });
    form.addEventListener('reset', () => {
      cancelTyping();
      const extras = form.querySelector('.enquiry-extras');
      if (extras) extras.open = false;
      queueMicrotask(() => {
        details.hidden = true;
        expanded = false;
        examples.classList.remove('is-expanded');
        all?.setAttribute('aria-expanded', 'false');
        if (all) all.textContent = all.dataset.all;
        message.style.height = '';
        offset = 0;
        reveal();
      });
    });
    document.addEventListener('visibilitychange', updateMotion);
    list.addEventListener('focusin', updateMotion);
    list.addEventListener('focusout', () => queueMicrotask(updateMotion));
    const updatePreference = () => {
      if (reduced.matches) finishTyping();
      updateMotion();
    };
    if (reduced.addEventListener) reduced.addEventListener('change', updatePreference);
    else reduced.addListener(updatePreference);
    window.addEventListener('pageshow', reveal);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        updateMotion();
      }).observe(list);
    } else visible = true;
    reveal();
  };
  document.querySelectorAll('[data-progressive-enquiry]').forEach(init);
})();
