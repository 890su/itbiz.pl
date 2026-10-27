import { afterEach, describe, expect, it, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import {
  deliverTelegramNotification,
  retryTelegramNotifications,
  sendTelegram,
  telegramText,
  type TelegramEnv,
  type TelegramLead,
} from '../worker/telegram';

const lead: TelegramLead = {
  request_id: '11111111-2222-4333-8444-555555555555',
  submitted_at: '2026-10-27T06:00:00Z',
  company_name: 'Test organisation',
  contact_name: 'Test Contact',
  nip: '5272714609',
  phone: null,
  email: 'test@example.org',
  service_id: 'cctv-emergency',
  message: 'Office cameras stopped recording. No passwords supplied.',
  locale: 'en',
  page_path: '/en/services/business-cctv-emergency/',
};

function setup(status = 'pending') {
  const db = new DatabaseSync(':memory:');
  for (const file of [
    '0001_create_contact_leads.sql',
    '0002_add_contact_lead_nip.sql',
    '0003_add_telegram_outbox.sql',
  ])
    db.exec(readFileSync(`migrations/${file}`, 'utf8'));
  db.prepare(
    `INSERT INTO contact_leads (request_id,submitted_at,purge_after,company_name,contact_name,nip,email,phone,service_id,message,locale,page_path,notification_status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    lead.request_id,
    lead.submitted_at,
    '2027-04-27',
    lead.company_name,
    lead.contact_name,
    lead.nip,
    lead.email,
    lead.phone,
    lead.service_id,
    lead.message,
    lead.locale,
    lead.page_path,
    status,
  );
  const adapter = {
    prepare(sql: string) {
      const statement = db.prepare(sql);
      return {
        bind(...values: (string | number | null)[]) {
          return {
            async run() {
              const result = statement.run(...values);
              return { meta: { changes: Number(result.changes) } };
            },
            async first() {
              return statement.get(...values) ?? null;
            },
            async all() {
              return { results: statement.all(...values) };
            },
          };
        },
      };
    },
  };
  const env: TelegramEnv = {
    TELEGRAM_RELAY_URL: 'https://naserwis.pl/api/itbiz-notification',
    TELEGRAM_RELAY_TOKEN: 'test-only',
    LEADS_DB: adapter as unknown as D1Database,
  };
  const row = () =>
    db
      .prepare(
        'SELECT notification_status,notification_attempts FROM contact_leads WHERE request_id=?',
      )
      .get(lead.request_id);
  return { db, env, row };
}
afterEach(() => vi.unstubAllGlobals());

describe('Telegram delivery and persistent retry queue', () => {
  it('labels the source, includes contact and scope, and bounds untrusted text', () => {
    const text = telegramText(lead);
    expect(text).toContain('ITBIZ.PL | Nowe zapytanie B2B');
    expect(text).toContain(lead.email);
    expect(text).toContain(`https://itbiz.pl${lead.page_path}`);
    expect(
      telegramText({
        ...lead,
        page_path: 'https://other.example',
        message: 'a'.repeat(8000),
      }).length,
    ).toBeLessThanOrEqual(4000);
    expect(telegramText({ ...lead, page_path: 'https://other.example' })).not.toContain(
      'https://other.example',
    );
  });

  it('requires an explicitly configured relay', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await sendTelegram(lead, {})).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('atomically claims a request once and does not resend a sent notification', async () => {
    const { db, env, row } = setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ accepted: true, requestId: lead.request_id }));
    vi.stubGlobal('fetch', fetchMock);
    const results = await Promise.all([
      deliverTelegramNotification(env, lead.request_id),
      deliverTelegramNotification(env, lead.request_id),
    ]);
    expect(results.sort()).toEqual([false, true]);
    expect(row()).toMatchObject({
      notification_status: 'sent',
      notification_attempts: 1,
    });
    await retryTelegramNotifications(env);
    expect(fetchMock).toHaveBeenCalledOnce();
    const body = JSON.parse(fetchMock.mock.calls[0]?.[1].body);
    expect(body.text).toContain('ITBIZ.PL');
    expect(body.requestId).toBe(lead.request_id);
    db.close();
  });

  it.each(['network', 'provider', 'wrong-id'])(
    'persists a %s failure and retries later',
    async (failure) => {
      const { db, env, row } = setup();
      const fetchMock = vi
        .fn()
        .mockImplementationOnce(async () => {
          if (failure === 'network') throw new TypeError('Offline');
          return failure === 'provider'
            ? new Response('', { status: 502 })
            : Response.json({ accepted: true, requestId: 'wrong' });
        })
        .mockResolvedValue(
          Response.json({ accepted: true, requestId: lead.request_id }),
        );
      vi.stubGlobal('fetch', fetchMock);
      expect(await deliverTelegramNotification(env, lead.request_id)).toBe(false);
      expect(row()).toMatchObject({
        notification_status: 'pending',
        notification_attempts: 1,
      });
      await retryTelegramNotifications(env);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      db.prepare('UPDATE contact_leads SET notification_last_attempt=?').run(
        '2000-01-01T00:00:00Z',
      );
      await retryTelegramNotifications(env);
      expect(row()).toMatchObject({
        notification_status: 'sent',
        notification_attempts: 2,
      });
      db.close();
    },
  );

  it('never bulk-forwards legacy enquiries', async () => {
    const { db, env } = setup('legacy');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await retryTelegramNotifications(env);
    expect(fetchMock).not.toHaveBeenCalled();
    db.close();
  });

  it('recovers an interrupted claim after five minutes', async () => {
    const { db, env, row } = setup('sending');
    db.prepare('UPDATE contact_leads SET notification_last_attempt=?').run(
      '2000-01-01T00:00:00Z',
    );
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ accepted: true, requestId: lead.request_id }),
        ),
    );
    await retryTelegramNotifications(env);
    expect(row()).toMatchObject({
      notification_status: 'sent',
      notification_attempts: 1,
    });
    db.close();
  });
});
