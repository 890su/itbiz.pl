(() => {
  const googleAdsId = 'AW-18394870871';
  const measurementId = 'G-W0H7D3FKJD';
  const leadConversion = googleAdsId + '/WpLcCOaejeMcENforcNE';
  const storageKey = 'itbiz-consent-v2';
  const production = ['itbiz.pl', 'www.itbiz.pl'].includes(location.hostname);
  let loaded = false;
  let analyticsConfigured = false;
  let adsConfigured = false;
  const sentLeads = new Set();
  const sentAdsLeads = new Set();
  const startedForms = new WeakSet();

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  });
  window.gtag('set', 'ads_data_redaction', true);
  window.gtag('set', 'allow_ad_personalization_signals', false);
  const readConsent = () => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || 'null');
      return value?.version === 2 ? value : {};
    } catch {
      return {};
    }
  };
  const safePage = () => ({
    page_location:
      window.itbizMeasurement?.pageLocation() || location.origin + location.pathname,
    page_referrer: window.itbizMeasurement?.referrer() || '',
  });
  const loadGoogleTag = (id) => {
    if (loaded || !production) return;
    loaded = true;
    window.gtag('js', new Date());
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    script.dataset.googleAdsTag = id;
    document.head.append(script);
  };
  const applyConsent = (consent) => {
    const analytics = consent?.analytics === true;
    const advertising = consent?.advertising === true;
    window['ga-disable-' + measurementId] = !analytics;
    window.gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: advertising ? 'granted' : 'denied',
      ad_user_data: advertising ? 'granted' : 'denied',
      ad_personalization: 'denied',
    });
    if (!production) return;
    window.gtag('set', safePage());
    if (analytics) {
      loadGoogleTag(measurementId);
      if (!analyticsConfigured) {
        analyticsConfigured = true;
        window.gtag('config', measurementId, {
          ...safePage(),
          site_brand: 'ITBIZ',
          send_page_view: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          cookie_flags: 'SameSite=Lax;Secure',
        });
      }
    }
    if (advertising) {
      loadGoogleTag(googleAdsId);
      if (!adsConfigured) {
        adsConfigured = true;
        window.gtag('config', googleAdsId, {
          ...safePage(),
          allow_ad_personalization_signals: false,
        });
      }
    }
  };
  const track = (name, parameters = {}) => {
    if (!production || readConsent().analytics !== true) return;
    applyConsent(readConsent());
    window.gtag('event', name, {
      send_to: measurementId,
      ...safePage(),
      site_brand: 'ITBIZ',
      language: document.documentElement.lang,
      ...parameters,
    });
  };
  const formContext = (form) => ({
    form_id: form.dataset.formId === 'modal' ? 'modal' : 'inline',
    service_id: form.querySelector('[name="serviceId"]')?.value || 'other',
  });
  applyConsent(readConsent());
  window.addEventListener('itbiz:consent', (event) => applyConsent(event.detail));
  window.addEventListener('itbiz:b2b-lead-submit', (event) => {
    const detail = event.detail || {};
    const id = String(detail.requestId || '');
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))
      return;
    const consent = readConsent();
    if (consent.analytics === true && !sentLeads.has(id)) {
      sentLeads.add(id);
      track('generate_lead', {
        request_id: id,
        service_id: detail.serviceId || 'other',
        form_id: detail.formId === 'modal' ? 'modal' : 'inline',
        method: 'website_form',
      });
    }
    if (production && consent.advertising === true && !sentAdsLeads.has(id)) {
      sentAdsLeads.add(id);
      applyConsent(consent);
      window.gtag('event', 'conversion', {
        send_to: leadConversion,
        value: 1,
        currency: 'PLN',
        transaction_id: id,
        ...safePage(),
      });
    }
  });
  document.addEventListener('input', (event) => {
    const form = event.target.closest?.('[data-lead-form]');
    if (!form || startedForms.has(form) || readConsent().analytics !== true) return;
    startedForms.add(form);
    track('lead_form_start', formContext(form));
  });
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    let name;
    const href = link.getAttribute('href') || '';
    if (/^tel:/i.test(href)) name = 'phone_click';
    else if (/^mailto:/i.test(href)) name = 'email_click';
    else {
      try {
        const host = new URL(href, location.href).hostname;
        if (host === 'wa.me' || host.endsWith('.whatsapp.com')) name = 'whatsapp_click';
        if (host === 't.me' || host === 'telegram.me') name = 'telegram_click';
      } catch {
        return;
      }
    }
    if (name)
      track(name, {
        placement: link.closest('dialog')
          ? 'modal'
          : link.closest('header')
            ? 'header'
            : link.closest('footer')
              ? 'footer'
              : 'page',
      });
  });
})();
