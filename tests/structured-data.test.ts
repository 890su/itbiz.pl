import { describe, expect, it } from 'vitest';
import { serializeStructuredData } from '../src/lib/structured-data';

describe('structured data serialization', () => {
  it('preserves translated content without allowing a script tag to terminate', () => {
    const value = { name: 'Usługa <script></script> "Варшава" & Київ' };
    const result = serializeStructuredData(value);
    expect(result).not.toContain('<');
    expect(JSON.parse(result)).toEqual(value);
  });
});
