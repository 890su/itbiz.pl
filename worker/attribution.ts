export type LeadAttribution = Record<string, string>;

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
const safeToken = (value: unknown, max = 160): string => {
  if (typeof value !== 'string') return '';
  const text = value.trim().slice(0, max);
  // Only campaign metadata belongs here, never free-form contact details.
  return /[@\r\n<>]/.test(text) || /(?:\+?\d[\s().-]*){7,}/.test(text) ? '' : text;
};

export function cleanAttribution(raw: unknown): LeadAttribution {
  let input: Record<string, unknown>;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw.slice(0, 6000)) : raw;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    input = parsed as Record<string, unknown>;
  } catch {
    return {};
  }
  const result: LeadAttribution = {};
  for (const key of campaignKeys) {
    const raw = input[key];
    const value =
      ['utm_id', 'campaignid', 'adgroupid'].includes(key) &&
      typeof raw === 'string' &&
      /^\d{1,30}$/.test(raw)
        ? raw
        : safeToken(raw);
    if (value) result[key] = value;
  }
  // Advertising identifiers are accepted only with an explicit ad-consent flag.
  if (input.advertising_consent === 'granted') {
    result.advertising_consent = 'granted';
    for (const key of clickKeys) {
      const value = typeof input[key] === 'string' ? (input[key] as string) : '';
      if (/^[A-Za-z0-9_-]{1,256}$/.test(value)) result[key] = value;
    }
  }
  result.analytics_consent =
    input.analytics_consent === 'granted' ? 'granted' : 'denied';
  if (typeof input.landing_page === 'string') {
    try {
      const url = new URL(input.landing_page, 'https://itbiz.pl');
      if (url.origin === 'https://itbiz.pl' && /^\/[a-z0-9/_-]*$/i.test(url.pathname))
        result.landing_page = url.pathname.slice(0, 300);
    } catch {
      /* Discard malformed paths. */
    }
  }
  if (
    typeof input.referrer_host === 'string' &&
    /^[a-z0-9.-]{1,200}$/i.test(input.referrer_host)
  )
    result.referrer_host = input.referrer_host.toLowerCase();
  if (
    typeof input.captured_at === 'string' &&
    /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(input.captured_at)
  )
    result.captured_at = input.captured_at.slice(0, 30);
  if (['inline', 'modal'].includes(String(input.form_id)))
    result.form_id = String(input.form_id);
  return result;
}

export function attributionText(attribution: LeadAttribution): string {
  return Object.entries(attribution)
    .filter(([key]) => !key.endsWith('_consent'))
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}
