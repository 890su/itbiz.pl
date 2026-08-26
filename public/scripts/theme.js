(() => {
  try {
    const saved = localStorage.getItem('itbiz-theme');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.dataset.theme = saved;
    }
  } catch {}
})();
