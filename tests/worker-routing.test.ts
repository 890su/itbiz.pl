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
});
