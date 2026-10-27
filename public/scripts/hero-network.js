(() => {
  for (const layer of document.querySelectorAll('[data-hero-network]')) {
    const hero = layer.closest('.network-hero');
    if (!hero || !('IntersectionObserver' in window)) continue;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      const editing = Boolean(document.activeElement?.closest('[data-lead-form]'));
      const enquiryOpen =
        document.querySelector('[data-enquiry-dialog]')?.open === true;
      hero.dataset.motionRunning = String(
        visible && !document.hidden && !reduced.matches && !editing && !enquiryOpen,
      );
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      update();
    });
    observer.observe(hero);
    if (reduced.addEventListener) reduced.addEventListener('change', update);
    else reduced.addListener(update);
    document.addEventListener('visibilitychange', update);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', () => queueMicrotask(update));
  }
})();
