import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('../worker/contact', () => ({
  handleContact: vi.fn(),
  purgeExpiredLeads: vi.fn(),
}));
vi.mock('../worker/telegram', () => ({
  retryTelegramNotifications: vi.fn().mockResolvedValue(undefined),
}));

import worker from '../worker/index';
import { handleContact } from '../worker/contact';
import { retryTelegramNotifications } from '../worker/telegram';

beforeEach(() => vi.clearAllMocks());

it.each([201, 202, 400, 503])(
  'only an accepted production enquiry wakes the existing retry queue (%s)',
  async (status) => {
    const response = new Response(null, { status });
    vi.mocked(handleContact).mockResolvedValueOnce(response);
    const waitUntil = vi.fn();
    const env = { ENVIRONMENT: 'production', ASSETS: {} as Fetcher };
    expect(
      await worker.fetch(
        new Request('https://itbiz.pl/api/contact', { method: 'POST' }),
        env,
        { waitUntil } as unknown as ExecutionContext,
      ),
    ).toBe(response);
    expect(waitUntil).toHaveBeenCalledTimes(status === 201 ? 1 : 0);
    expect(retryTelegramNotifications).toHaveBeenCalledTimes(status === 201 ? 1 : 0);
  },
);
