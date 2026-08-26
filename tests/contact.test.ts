import { describe, expect, it } from 'vitest';
import { validateContactPayload } from '../worker/contact';

const validPayload = {
  companyName: 'Przykładowa organizacja',
  contactName: 'Jan Kowalski',
  email: 'jan@example.org',
  phone: '',
  serviceId: 'office-wifi',
  message: 'W biurze występują okresowe przerwy w połączeniu Wi-Fi.',
  actingForBusiness: 'true',
  locale: 'pl',
  pagePath: '/uslugi/wifi-dla-biur/',
  website: '',
};

describe('validateContactPayload', () => {
  it('accepts a valid B2B request with email', () => {
    const result = validateContactPayload(validPayload);
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

  it('requires the business eligibility confirmation', () => {
    const result = validateContactPayload({
      ...validPayload,
      actingForBusiness: 'false',
    });
    expect(result).toMatchObject({ success: false });
  });

  it('keeps honeypot data for the handler to discard silently', () => {
    const result = validateContactPayload({ ...validPayload, website: 'spam.example' });
    expect(result.success && result.data.website).toBe('spam.example');
  });
});
