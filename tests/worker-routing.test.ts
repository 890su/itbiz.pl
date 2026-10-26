import { describe, expect, it, vi } from 'vitest';
import worker from '../worker/index';

const assets = {
  fetch: vi.fn(async () => new Response('asset', { status: 200 })),
};

describe('Worker routing', () => {
  it.each(['http://itbiz.pl', 'http://www.itbiz.pl'])(
    'redirects %s to HTTPS in one step without dropping the query',
    async (origin) => {
      const response = await worker.fetch(
        new Request(`${origin}/uslugi/?utm_source=test`),
        { ASSETS: assets } as never,
      );
      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe(
        'https://itbiz.pl/uslugi/?utm_source=test',
      );
    },
  );

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

  it('declares UTF-8 for HTML while preserving the body and asset headers', async () => {
    const response = await worker.fetch(new Request('https://itbiz.pl/'), {
      ASSETS: {
        fetch: async () =>
          new Response('Łączność dla firm', {
            headers: { 'Content-Type': 'text/html', ETag: 'test-asset' },
          }),
      },
    } as never);

    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(response.headers.get('etag')).toBe('test-asset');
    expect(await response.text()).toBe('Łączność dla firm');
  });

  it('preserves non-HTML asset MIME types', async () => {
    const response = await worker.fetch(
      new Request('https://itbiz.pl/scripts/hero-network.js'),
      {
        ASSETS: {
          fetch: async () =>
            new Response('/* script */', {
              headers: { 'Content-Type': 'application/javascript' },
            }),
        },
      } as never,
    );

    expect(response.headers.get('content-type')).toBe('application/javascript');
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
