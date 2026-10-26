import { describe, expect, it } from 'vitest';
import { getCompact } from '../src/i18n/compact';
import { locales } from '../src/i18n/config';

describe('compact commercial copy', () => {
  it.each(locales)('has concise, complete localized labels in %s', (locale) => {
    const copy = getCompact(locale);
    expect(Object.keys(copy)).toHaveLength(10);
    for (const value of Object.values(copy)) {
      expect(value.trim().length).toBeGreaterThan(4);
      expect(value.split(/\s+/).length).toBeLessThan(26);
      expect(value).not.toMatch(/[—–]/u);
    }
  });
});
