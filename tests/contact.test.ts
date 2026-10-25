import { describe, expect, it } from 'vitest';
import { validateContactPayload } from '../worker/contact';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const validPayload = {
  companyName: 'Przykładowa organizacja',
  contactName: 'Jan Kowalski',
  contact: 'jan@example.org',
  serviceId: 'office-wifi',
  message: 'W biurze występują okresowe przerwy w połączeniu Wi-Fi.',
  locale: 'pl',
  pagePath: '/uslugi/wifi-dla-biur/',
  website: '',
};

describe('validateContactPayload', () => {
  const advertisedServiceIds = [
    ...new Set(
      readdirSync(resolve('src/content/services'), { recursive: true })
        .filter((name) => String(name).endsWith('.md'))
        .map(
          (name) =>
            readFileSync(resolve('src/content/services', String(name)), 'utf8').match(
              /^serviceId: (.+)$/m,
            )?.[1],
        ),
    ),
  ];
  it.each(advertisedServiceIds)('accepts the published service %s', (serviceId) => {
    expect(serviceId).toBeTruthy();
    expect(validateContactPayload({ ...validPayload, serviceId }).success).toBe(true);
  });

  it('accepts a valid request with a combined email contact', () => {
    const result = validateContactPayload(validPayload);
    expect(result.success && result.data.email).toBe('jan@example.org');
  });

  it.each(['ru', 'en', 'uk'])('accepts the %s locale', (locale) => {
    const result = validateContactPayload({ ...validPayload, locale });
    expect(result.success).toBe(true);
  });

  it('requires at least one contact method', () => {
    const result = validateContactPayload({ ...validPayload, contact: '' });
    expect(result).toMatchObject({ success: false });
  });

  it('accepts a combined phone contact and an omitted organisation', () => {
    const result = validateContactPayload({
      ...validPayload,
      companyName: '',
      contact: '+48 573 012 321',
    });
    expect(result.success && result.data.phone).toBe('+48 573 012 321');
  });

  it('rejects an unknown service id', () => {
    const result = validateContactPayload({
      ...validPayload,
      serviceId: 'private-laptop',
    });
    expect(result).toMatchObject({ success: false });
  });

  it('accepts a landing-page service and normalises NIP', () => {
    const result = validateContactPayload({
      ...validPayload,
      companyName: '525-00-08-573',
      serviceId: 'network-emergency',
    });
    expect(result.success && result.data.nip).toBe('5250008573');
  });

  it('rejects an invalid NIP format when the optional field is used', () => {
    const result = validateContactPayload({ ...validPayload, nip: '1234' });
    expect(result).toMatchObject({ success: false });
  });

  it('keeps honeypot data for the handler to discard silently', () => {
    const result = validateContactPayload({ ...validPayload, website: 'spam.example' });
    expect(result.success && result.data.website).toBe('spam.example');
  });

  it.each(['pl', 'ru', 'en', 'uk'] as const)(
    'retains progressive enquiry context in the stored message in %s',
    (locale) => {
      const result = validateContactPayload({
        ...validPayload,
        locale,
        requestType: 'broken',
        urgency: 'soon',
        address: 'Warszawa, biuro testowe',
      });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.message).toContain(validPayload.message);
      expect(result.data.message).toContain('Warszawa, biuro testowe');
      expect(result.data.message.split('\n')).toHaveLength(5);
    },
  );

  it('ignores unknown option values and still validates the original description', () => {
    const result = validateContactPayload({
      ...validPayload,
      requestType: 'constructor',
      urgency: 'unknown',
    });
    expect(result.success && result.data.message).toBe(validPayload.message);
    expect(
      validateContactPayload({
        ...validPayload,
        message: 'Short',
        address: 'A'.repeat(300),
      }).success,
    ).toBe(false);
  });
});
