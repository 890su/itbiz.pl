import { describe, expect, it } from 'vitest';
import { getExperience, serviceJourneys } from '../src/i18n/experience';
import { getRoute, locales, routeTranslations } from '../src/i18n/config';

describe('localized client experience', () => {
  it.each(locales)('has complete service names and usable routes in %s', (locale) => {
    const copy = getExperience(locale);
    const serviceKeys = Object.keys(routeTranslations).filter((key) =>
      key.startsWith('service.'),
    );
    expect(Object.keys(copy.serviceNames)).toEqual(expect.arrayContaining(serviceKeys));
    expect(Object.keys(copy.serviceNames)).toHaveLength(12);
    expect(copy.groups).toHaveLength(serviceJourneys.length);
    expect(copy.cctv.nodes).toHaveLength(4);
    expect(copy.sampleRows).toHaveLength(3);
    for (const key of serviceJourneys.flat()) {
      expect(copy.serviceNames[key].length).toBeGreaterThan(4);
      expect(getRoute(locale, key)).not.toBe(getRoute(locale, 'services'));
    }
    expect(JSON.stringify(copy)).not.toMatch(/[—–]/u);
  });
});
