import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleContact, type ContactEnv } from '../worker/contact';

const request = () =>
  new Request('https://itbiz.pl/api/contact', {
    method: 'POST',
    headers: { Origin: 'https://itbiz.pl', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contact: 'test@example.org',
      serviceId: 'cctv-emergency',
      locale: 'pl',
      message: 'Kontrolny test firmowej instalacji monitoringu.',
      pagePath: '/uslugi/awaria-monitoringu-w-firmie/',
      'cf-turnstile-response': 'test-token',
    }),
  });
const database = () => {
  const run = vi.fn().mockResolvedValue({ success: true });
  const bind = vi.fn().mockReturnValue({ run });
  const prepare = vi.fn().mockReturnValue({ bind });
  const batch = vi.fn(async (statements: { run: () => Promise<unknown> }[]) =>
    Promise.all(statements.map((statement) => statement.run())),
  );
  return { run, bind, prepare, batch };
};
afterEach(() => vi.unstubAllGlobals());

describe('production contact delivery', () => {
  it.each(['network', 'json', 'http', 'hostname', 'action'])(
    'keeps failed %s verification out of storage and returns a localized error',
    async (failure) => {
      const db = database();
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          if (failure === 'network') throw new TypeError('Connection unavailable');
          if (failure === 'json') return new Response('invalid JSON');
          if (failure === 'http') return new Response('', { status: 503 });
          return Response.json({
            success: true,
            hostname: failure === 'hostname' ? 'other.example' : 'itbiz.pl',
            action: failure === 'action' ? 'other' : 'contact',
          });
        }),
      );
      const response = await handleContact(request(), {
        ENVIRONMENT: 'production',
        TURNSTILE_SECRET_KEY: 'test-secret',
        LEADS_DB: db,
      } as unknown as ContactEnv);
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        message: expect.stringContaining('Weryfikacja'),
      });
      expect(db.run).not.toHaveBeenCalled();
    },
  );

  it('acknowledges a verified enquiry only after successful storage', async () => {
    const db = database();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ success: true, hostname: 'itbiz.pl', action: 'contact' }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const response = await handleContact(request(), {
      ENVIRONMENT: 'production',
      TURNSTILE_SECRET_KEY: 'test-secret',
      LEADS_DB: db,
    } as unknown as ContactEnv);
    expect(response.status).toBe(201);
    const result = (await response.json()) as { requestId: string };
    expect(result.requestId).toBe(response.headers.get('X-Request-ID'));
    expect(db.batch).toHaveBeenCalledOnce();
    expect(db.run).toHaveBeenCalledTimes(2);
    expect(db.bind.mock.calls[0]).toContain(result.requestId);
    expect(db.bind.mock.calls[0]).toContain('test@example.org');
    expect(db.bind.mock.calls[0]).toContain('cctv-emergency');
    expect(fetchMock.mock.calls[0]?.[1].signal).toBeInstanceOf(AbortSignal);
  });

  it('returns an error when no delivery channel accepted the enquiry', async () => {
    const db = database();
    db.run.mockRejectedValue(new Error('Database unavailable'));
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ success: true, hostname: 'itbiz.pl', action: 'contact' }),
        ),
    );
    const response = await handleContact(request(), {
      ENVIRONMENT: 'production',
      TURNSTILE_SECRET_KEY: 'test-secret',
      LEADS_DB: db,
    } as unknown as ContactEnv);
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      message: expect.stringContaining('Nie udało się zapisać'),
    });
  });
});
