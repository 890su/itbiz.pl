import { describe, expect, it, vi } from 'vitest';
import worker from '../worker/index';

const assets = {
  fetch: vi.fn(async () => new Response('asset', { status: 200 })),
};

describe('Worker routing', () => {
  it('redirects www GET requests to the apex domain', async () => {
    const response = await worker.fetch(
      new Request('https://www.itbiz.pl/en/services/?from=www'),
      { ASSETS: assets } as never,
    );

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(
      'https://itbiz.pl/en/services/?from=www',
    );
  });

  it('delegates apex page requests to static assets', async () => {
    const response = await worker.fetch(new Request('https://itbiz.pl/en/'), {
      ASSETS: assets,
    } as never);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('asset');
  });

  it('returns private connection data without cache storage', async () => {
    const request = new Request('https://itbiz.pl/api/network', {
      headers: { 'CF-Connecting-IP': '198.51.100.10' },
    });
    Object.defineProperty(request, 'cf', {
      value: { asn: 64500, asOrganization: 'Example Business ISP', colo: 'WAW' },
    });
    const response = await worker.fetch(request, { ASSETS: assets } as never);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toMatchObject({
      ip: '198.51.100.10',
      ipVersion: 'IPv4',
      provider: 'Example Business ISP',
      edge: 'WAW',
    });
  });

  it('caps the explicit download probe at 256 KiB', async () => {
    const response = await worker.fetch(
      new Request('https://itbiz.pl/api/network-probe?bytes=9000000'),
      { ASSETS: assets } as never,
    );
    expect((await response.arrayBuffer()).byteLength).toBe(262_144);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
