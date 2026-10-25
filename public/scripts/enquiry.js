(() => {
  const form = document.querySelector('[data-progressive-enquiry]');
  if (!(form instanceof HTMLFormElement)) return;
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

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  };
  const animate = (time) => {
    const height = clones[0]?.offsetTop - originals[0]?.offsetTop;
    if (lastTime && height > 0)
      offset = (offset + Math.min(time - lastTime, 50) * 0.024) % height;
    lastTime = time;
    list.scrollTop = offset;
    frame = requestAnimationFrame(animate);
  };
  const updateMotion = () => {
    stop();
    clones.forEach((item) => (item.hidden = expanded));
    // Match NaSerwis: automatic motion continues through hover and touch.
    // The owner explicitly requested this motion even with reduced motion.
    if (visible && !expanded && !examples.hidden && !document.hidden)
      frame = requestAnimationFrame(animate);
  };
  const reveal = () => {
    const hasMessage = message.value.trim().length > 0;
    if (hasMessage) details.hidden = false;
    examples.hidden = hasMessage || Boolean(typingTimer);
    updateMotion();
  };
  const cancelTyping = () => {
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
    const example = event.target.closest('[data-enquiry-example]') || rowAtPoint(event);
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
    message.value = '';
    form.setAttribute('data-typing-example', 'true');
    message.focus({ preventScroll: true });
    const characters = Array.from(selectedText);
    let length = 0;
    const typeNext = () => {
      message.value = characters.slice(0, ++length).join('');
      message.dispatchEvent(new Event('input', { bubbles: true }));
      message.style.height = 'auto';
      message.style.height = Math.max(112, message.scrollHeight) + 'px';
      message.setSelectionRange(message.value.length, message.value.length);
      if (length < characters.length) typingTimer = setTimeout(typeNext, 28);
      else cancelTyping();
    };
    typingTimer = setTimeout(typeNext, 28);
  });
  message.addEventListener('beforeinput', cancelTyping);
  message.addEventListener('keydown', (event) => {
    if (!['Tab', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) cancelTyping();
  });
  message.addEventListener('pointerdown', cancelTyping);
  message.addEventListener('input', reveal);
  const hint = form.querySelector('.enquiry-hint');
  let hintTimer = 0;
  const hideHint = () => {
    clearTimeout(hintTimer);
    if (hint) hint.hidden = true;
  };
  const scheduleHint = () => {
    hideHint();
    if (hint && document.activeElement === message) {
      hintTimer = setTimeout(() => {
        hint.hidden = false;
      }, 1000);
    }
  };
  for (const event of ['focus', 'input', 'pointermove', 'click'])
    message.addEventListener(event, scheduleHint);
  message.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideHint();
    else scheduleHint();
  });
  message.addEventListener('blur', hideHint);
  message.addEventListener('pointerleave', (event) => {
    if (!hint?.contains(event.relatedTarget)) hideHint();
  });
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
    hideHint();
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
  window.addEventListener('pageshow', reveal);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      updateMotion();
    }).observe(list);
  } else visible = true;
  reveal();
})();
