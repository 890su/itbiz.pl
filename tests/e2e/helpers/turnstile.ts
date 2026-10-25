export function mockTurnstile({ delay = 0, interactive = false, manual = false } = {}) {
  return `(() => {
    const render = () => document.querySelectorAll('.cf-turnstile').forEach(container => {
      let input = container.querySelector('[name="cf-turnstile-response"]');
      if (!input) { input = document.createElement('input'); input.type = 'hidden'; input.name = 'cf-turnstile-response'; container.append(input); }
      input.value = '';
      let widget = container.querySelector('[data-test-widget]');
      if (!widget) { widget = document.createElement('div'); widget.dataset.testWidget = ''; container.append(widget); }
      const visible = container.dataset.appearance !== 'interaction-only' || ${interactive};
      widget.style.width = visible ? (container.dataset.size === 'compact' ? '150px' : '300px') : '0px';
      widget.style.height = visible ? (container.dataset.size === 'compact' ? '140px' : '65px') : '0px';
      const complete = () => { input.value = 'test-turnstile-token'; };
      if (${manual}) window.completeTestVerification = complete;
      else setTimeout(complete, ${delay});
    });
    window.turnstile = { reset: render };
    render();
  })();`;
}
