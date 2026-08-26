import { describe, expect, it } from 'vitest';
import { validateContactPayload } from '../worker/contact';

const validPayload = {
  companyName: 'Przykładowa organizacja',
  nip: '525-00-08-573',
  contactName: 'Jan Kowalski',
  email: 'jan@example.org',
  phone: '',
  serviceId: 'office-wifi',
  message: 'W biurze występują okresowe przerwy w połączeniu Wi-Fi.',
  locale: 'pl',
  pagePath: '/uslugi/wifi-dla-biur/',
  website: '',
};

describe('validateContactPayload', () => {
  it('accepts a valid business request with email', () => {
    const result = validateContactPayload(validPayload);
    expect(result.success).toBe(true);
  });

  it.each(['ru', 'en', 'uk'])('accepts the %s locale', (locale) => {
    const result = validateContactPayload({ ...validPayload, locale });
    expect(result.success).toBe(true);
  });

  it('requires at least one contact method', () => {
    const result = validateContactPayload({ ...validPayload, email: '', phone: '' });
    expect(result).toMatchObject({ success: false });
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
});
