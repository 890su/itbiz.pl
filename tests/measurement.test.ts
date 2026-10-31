import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import { cleanAttribution } from '../worker/attribution';

function browser(
  choice: Record<string, unknown> = {},
  url = 'https://itbiz.pl/?utm_source=google&utm_medium=cpc',
) {
  const listeners: Record<string, (event: any) => void> = {};
  const domListeners: Record<string, (event: any) => void> = {};
  const local = new Map([
    ['itbiz-consent-v2', JSON.stringify({ version: 2, ...choice })],
  ]);
  const session = new Map<string, string>();
  const scripts: any[] = [];
  const context: any = {
    URL,
    Date,
    Set,
    WeakSet,
    location: new URL(url),
    localStorage: { getItem: (key: string) => local.get(key) },
    sessionStorage: {
      getItem: (key: string) => session.get(key),
      setItem: (key: string, value: string) => session.set(key, value),
      removeItem: (key: string) => session.delete(key),
    },
    document: {
      referrer: 'https://www.google.com/search?q=private@example.com',
      documentElement: { lang: 'pl' },
      createElement: () => ({ dataset: {} }),
      head: { append: (script: any) => scripts.push(script) },
      addEventListener: (name: string, cb: (event: any) => void) => {
        domListeners[name] = cb;
      },
    },
    addEventListener: (name: string, cb: (event: any) => void) => {
      const previous = listeners[name];
      listeners[name] = (event) => {
        previous?.(event);
        cb(event);
      };
    },
  };
  context.window = context;
  vm.createContext(context);
  for (const script of ['attribution.js', 'google-ads.js'])
    vm.runInContext(readFileSync(`public/scripts/${script}`, 'utf8'), context);
  const commands = () =>
    context.dataLayer.map((args: any) => Array.from(args) as any[]);
  const events = (name: string) =>
    commands().filter((args: any[]) => args[0] === 'event' && args[1] === name);
  return {
    context,
    listeners,
    domListeners,
    local,
    session,
    scripts,
    commands,
    events,
  };
}

const requestId = 'a1234567-1234-4234-8234-123456789abc';
const lead = {
  detail: {
    requestId,
    serviceId: 'office-wifi',
    formId: 'modal',
    contact: 'private@example.com',
  },
};

describe('consent and lead measurement', () => {
  it('creates no Google request or attribution storage before consent', () => {
    const b = browser();
    b.listeners['itbiz:b2b-lead-submit']!(lead);
    expect(b.scripts).toHaveLength(0);
    expect(b.session.size).toBe(0);
    expect(b.events('generate_lead')).toHaveLength(0);
    expect(b.events('conversion')).toHaveLength(0);
    expect(b.context.itbizMeasurement.attribution().utm_source).toBe('google');
  });

  it('analytics-only consent loads one tag, records one lead and sends no Ads conversion', () => {
    const b = browser({ analytics: true });
    b.listeners['itbiz:b2b-lead-submit']!(lead);
    b.listeners['itbiz:b2b-lead-submit']!(lead);
    expect(b.scripts).toHaveLength(1);
    expect(b.events('generate_lead')).toHaveLength(1);
    expect(b.events('generate_lead')[0][2]).toMatchObject({
      request_id: requestId,
      form_id: 'modal',
      site_brand: 'ITBIZ',
    });
    expect(b.events('conversion')).toHaveLength(0);
    expect(JSON.stringify(b.commands())).not.toContain('private@example.com');
  });

  it('ad-only consent preserves the existing conversion without adding a GA4 lead', () => {
    const b = browser({ advertising: true });
    b.listeners['itbiz:b2b-lead-submit']!(lead);
    b.listeners['itbiz:b2b-lead-submit']!(lead);
    expect(b.events('generate_lead')).toHaveLength(0);
    expect(b.events('conversion')).toHaveLength(1);
    expect(b.events('conversion')[0][2].transaction_id).toBe(requestId);
    expect(
      b
        .commands()
        .filter((c: any[]) => c[0] === 'consent')
        .every((c: any[]) => c[2].ad_personalization === 'denied'),
    ).toBe(true);
  });

  it('rejects invalid IDs and stops tracking and clears session metadata after withdrawal', () => {
    const b = browser({ analytics: true, advertising: true });
    b.listeners['itbiz:b2b-lead-submit']!({ detail: { requestId: 'spam' } });
    expect(b.events('generate_lead')).toHaveLength(0);
    b.local.set(
      'itbiz-consent-v2',
      JSON.stringify({ version: 2, analytics: false, advertising: false }),
    );
    b.listeners['itbiz:consent']!({ detail: { analytics: false, advertising: false } });
    b.listeners['itbiz:b2b-lead-submit']!(lead);
    expect(b.events('generate_lead')).toHaveLength(0);
    expect(b.context['ga-disable-G-W0H7D3FKJD']).toBe(true);
    expect(b.session.size).toBe(0);
  });

  it('sanitises page metadata and captures click IDs only with ad consent', () => {
    const url =
      'https://itbiz.pl/?email=private@example.com&phone=48500100200&utm_source=chatgpt.com&gclid=opaque_click_id#private';
    const b = browser({ analytics: true }, url);
    expect(b.context.itbizMeasurement.pageLocation()).toBe(
      'https://itbiz.pl/?utm_source=chatgpt.com',
    );
    expect(b.context.itbizMeasurement.attribution().gclid).toBeUndefined();
    expect(b.context.itbizMeasurement.attribution().referrer_host).toBe(
      'www.google.com',
    );
    expect(
      browser({ advertising: true }, url).context.itbizMeasurement.attribution().gclid,
    ).toBe('opaque_click_id');
  });

  it('counts phone intent without sending the dialled number or pretending it is a completed call', () => {
    const b = browser({ analytics: true });
    const link = { getAttribute: () => 'tel:+48500100200', closest: () => null };
    b.domListeners.click!({ target: { closest: () => link } });
    expect(b.events('phone_click')).toHaveLength(1);
    expect(b.events('generate_lead')).toHaveLength(0);
    expect(JSON.stringify(b.commands())).not.toContain('48500100200');
  });
});

describe('server attribution boundary', () => {
  it('drops arbitrary fields, contact data, URL queries and click IDs without ad consent', () => {
    expect(
      cleanAttribution({
        utm_source: 'chatgpt.com',
        email: 'private@example.com',
        utm_term: 'private@example.com',
        landing_page: '/kontakt/?email=private@example.com',
        gclid: 'opaque_click_id',
      }),
    ).toEqual({
      utm_source: 'chatgpt.com',
      analytics_consent: 'denied',
      landing_page: '/kontakt/',
    });
  });
  it('accepts allowlisted campaign metadata and explicit advertising consent', () => {
    expect(
      cleanAttribution(
        JSON.stringify({
          utm_source: 'google',
          advertising_consent: 'granted',
          gclid: 'opaque_click_id',
          form_id: 'modal',
        }),
      ),
    ).toMatchObject({
      utm_source: 'google',
      gclid: 'opaque_click_id',
      form_id: 'modal',
    });
    expect(cleanAttribution('{broken')).toEqual({});
  });
});
