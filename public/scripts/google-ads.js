(() => {
  const googleAdsId = 'AW-18394870871';
  const leadConversion = `${googleAdsId}/WpLcCOaejeMcENforcNE`;
  const storageKey = 'itbiz-consent-v2';

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

  const readConsent = () => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || 'null');
      return value?.version === 2 ? value : null;
    } catch {
      return null;
    }
  };

  const loadGoogleTag = () => {
    if (document.querySelector('[data-google-ads-tag]')) return;

    window.gtag('js', new Date());
    window.gtag('config', googleAdsId);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
    script.dataset.googleAdsTag = googleAdsId;
    document.head.append(script);
  };

  const applyConsent = (consent) => {
    const analyticsGranted = consent?.analytics === true;
    const advertisingGranted = consent?.advertising === true;

    window.gtag('consent', 'update', {
      analytics_storage: analyticsGranted ? 'granted' : 'denied',
      ad_storage: advertisingGranted ? 'granted' : 'denied',
      ad_user_data: advertisingGranted ? 'granted' : 'denied',
      ad_personalization: advertisingGranted ? 'granted' : 'denied',
    });

    if (advertisingGranted) loadGoogleTag();
  };

  applyConsent(readConsent());
  window.addEventListener('itbiz:consent', (event) => applyConsent(event.detail));
  window.addEventListener('itbiz:b2b-lead-submit', (event) => {
    const consent = readConsent();
    if (consent?.advertising !== true) return;

    loadGoogleTag();
    window.gtag('event', 'conversion', {
      send_to: leadConversion,
      value: 1,
      currency: 'PLN',
      transaction_id: String(event.detail?.requestId || ''),
    });
  });
})();
