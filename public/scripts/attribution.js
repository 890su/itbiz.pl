(() => {
  const consentKey = 'itbiz-consent-v2';
  const attributionKey = 'itbiz-attribution-v1';
  const campaignKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_id',
    'utm_content',
    'utm_term',
    'campaignid',
    'adgroupid',
    'matchtype',
    'device',
    'network',
  ];
  const clickKeys = ['gclid', 'wbraid', 'gbraid'];
  const consent = () => {
    try {
      const value = JSON.parse(localStorage.getItem(consentKey) || 'null');
      return value?.version === 2 ? value : {};
    } catch {
      return {};
    }
  };
  const token = (value) => {
    const text = String(value || '')
      .trim()
      .slice(0, 160);
    return /[@\r\n<>]/.test(text) || /(?:\+?\d[\s().-]*){7,}/.test(text) ? '' : text;
  };
  const capture = () => {
    const url = new URL(location.href);
    const result = {
      landing_page: /^\/[a-z0-9/_-]*$/i.test(url.pathname) ? url.pathname : '/',
      captured_at: new Date().toISOString(),
    };
    for (const key of campaignKeys) {
      const raw = url.searchParams.get(key) || '';
      const value =
        ['utm_id', 'campaignid', 'adgroupid'].includes(key) && /^\d{1,30}$/.test(raw)
          ? raw
          : token(raw);
      if (value) result[key] = value;
    }
    if (consent().advertising === true) {
      for (const key of clickKeys) {
        const value = url.searchParams.get(key) || '';
        if (/^[A-Za-z0-9_-]{1,256}$/.test(value)) result[key] = value;
      }
    }
    try {
      const referrer = new URL(document.referrer);
      if (referrer.hostname !== location.hostname)
        result.referrer_host = referrer.hostname;
    } catch {
      /* Direct visit. */
    }
    return result;
  };
  // Without consent metadata stays in memory on this page only. It is included
  // in a submitted enquiry, but creates no cross-page identifier or storage.
  let current = capture();
  const sync = () => {
    const choice = consent();
    const permitted = choice.analytics === true || choice.advertising === true;
    try {
      if (!permitted) {
        sessionStorage.removeItem(attributionKey);
        current = capture();
        return;
      }
      let saved = JSON.parse(sessionStorage.getItem(attributionKey) || 'null');
      if (!saved || Date.now() - saved.updated_at > 30 * 60_000) saved = null;
      const fresh = capture();
      // A new campaign supersedes an older session; internal navigation does not.
      const campaignVisit = [...campaignKeys, ...clickKeys].some((key) => fresh[key]);
      current = campaignVisit || !saved ? fresh : saved.data;
      if (choice.advertising !== true) for (const key of clickKeys) delete current[key];
      sessionStorage.setItem(
        attributionKey,
        JSON.stringify({ data: current, updated_at: Date.now() }),
      );
    } catch {
      current = capture();
    }
  };
  sync();
  window.addEventListener('itbiz:consent', sync);
  window.itbizMeasurement = {
    attribution: () => {
      const choice = consent();
      const result = {
        ...current,
        analytics_consent: choice.analytics === true ? 'granted' : 'denied',
        advertising_consent: choice.advertising === true ? 'granted' : 'denied',
      };
      if (choice.advertising !== true) for (const key of clickKeys) delete result[key];
      return result;
    },
    // Google receives only canonical paths and vetted campaign parameters.
    pageLocation: () => {
      const url = new URL(location.pathname, location.origin);
      const values = capture();
      for (const key of [...campaignKeys, ...clickKeys])
        if (values[key]) url.searchParams.set(key, values[key]);
      return url.href;
    },
    referrer: () => {
      try {
        return new URL(document.referrer).origin + '/';
      } catch {
        return '';
      }
    },
  };
})();
