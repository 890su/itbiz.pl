import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createHmac } from 'node:crypto';
import vm from 'node:vm';
import { afterEach, expect, it, vi } from 'vitest';
import { journalStatement, retryJournal, type JournalLead } from '../worker/journal';

const lead: JournalLead = {
  site_brand: 'ITBIZ',
  request_id: 'a1234567-1234-4234-8234-123456789abc',
  submitted_at: '2026-10-31T09:00:00.000Z',
  contact_name: 'Test',
  phone: '+48500100200',
  email: '',
  service_id: 'office-wifi',
  message: '=HYPERLINK("https://invalid.example")',
  locale: 'pl',
  page_path: '/kontakt/',
  attribution: { utm_source: 'chatgpt.com', form_id: 'modal' },
};

function database() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync('migrations/0005_shared_lead_journal.sql', 'utf8'));
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
            async all() {
              return { results: statement.all(...values) };
            },
          };
        },
      };
    },
  } as unknown as D1Database;
  return { db, adapter };
}
afterEach(() => vi.unstubAllGlobals());

it('keeps one queued request per brand and retries a failed delivery without duplicate claims', async () => {
  const { db, adapter } = database();
  await journalStatement(adapter, lead).run();
  await journalStatement(adapter, lead).run();
  expect(db.prepare('SELECT COUNT(*) AS count FROM lead_journal').get()).toMatchObject({
    count: 1,
  });
  const send = vi
    .fn()
    .mockRejectedValueOnce(new Error('Offline'))
    .mockImplementation(async (_url, init) => {
      const envelope = JSON.parse(init.body);
      expect(envelope.signature).toBe(
        createHmac('sha256', 'test-secret')
          .update(envelope.timestamp + '.' + envelope.payload)
          .digest('hex'),
      );
      return Response.json({
        accepted: true,
        request_id: lead.request_id,
        site_brand: lead.site_brand,
      });
    });
  vi.stubGlobal('fetch', send);
  const env = {
    LEADS_DB: adapter,
    JOURNAL_WEBHOOK_URL: 'https://example.invalid',
    JOURNAL_WEBHOOK_SECRET: 'test-secret',
  };
  await retryJournal(env);
  expect(db.prepare('SELECT delivery_status FROM lead_journal').get()).toMatchObject({
    delivery_status: 'pending',
  });
  db.exec("UPDATE lead_journal SET delivery_last_attempt = '2000-01-01'");
  await Promise.all([retryJournal(env), retryJournal(env)]);
  expect(send).toHaveBeenCalledTimes(2);
  expect(
    db.prepare('SELECT delivery_status,delivery_attempts FROM lead_journal').get(),
  ).toMatchObject({ delivery_status: 'sent', delivery_attempts: 2 });
  await retryJournal(env);
  expect(send).toHaveBeenCalledTimes(2);
  db.close();
});

it('writes a signed enquiry once, protects formulas and never overwrites a manual payment', () => {
  const matrix: any[][] = Array.from({ length: 500 }, () => Array(16).fill(''));
  const sheet = {
    getSheetId: () => 667178360,
    getRange(row: number | string, column = 1, height = 1, width = 1) {
      return {
        getValue: () => (row === 'P9' ? 'Сайт' : ''),
        getValues: () => matrix,
        getFormula: () => '=IF(A10="","","check")',
        setValues(values: any[][]) {
          for (let r = 0; r < height; r++)
            for (let c = 0; c < width; c++)
              matrix[Number(row) - 10 + r]![column - 1 + c] = values[r]![c];
        },
        setNumberFormat() {},
      };
    },
  };
  const context: any = {
    Date,
    JSON,
    Number,
    String,
    Object,
    Array,
    Math,
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: () => 'test-secret' }),
    },
    Utilities: {
      computeHmacSha256Signature: (message: string, secret: string) =>
        Array.from(createHmac('sha256', secret).update(message).digest()),
    },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (text: string) => ({ setMimeType: () => JSON.parse(text) }),
    },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    SpreadsheetApp: { openById: () => ({ getSheets: () => [sheet] }) },
  };
  vm.createContext(context);
  vm.runInContext(readFileSync('integrations/lead-journal/Code.gs', 'utf8'), context);
  const payload = JSON.stringify(lead);
  const timestamp = String(Date.now());
  const signature = createHmac('sha256', 'test-secret')
    .update(timestamp + '.' + payload)
    .digest('hex');
  const event = {
    postData: { contents: JSON.stringify({ timestamp, payload, signature }) },
  };
  expect(context.doPost(event)).toMatchObject({
    accepted: true,
    request_id: lead.request_id,
  });
  expect(matrix[0]![5]).toBe('ChatGPT');
  expect(matrix[0]![14]).toBe("'" + lead.message);
  expect(matrix[0]![15]).toBe('ITBIZ');
  expect(matrix[0]![13]).toBe('=IF(A10="","","check")');
  matrix[0]![8] = 'Оплачено';
  matrix[0]![10] = 250;
  expect(context.doPost(event).accepted).toBe(true);
  expect(matrix[0]![10]).toBe(250);
  expect(matrix.filter((row) => row[3])).toHaveLength(1);
  expect(
    context.doPost({
      postData: {
        contents: JSON.stringify({ timestamp, payload, signature: 'invalid' }),
      },
    }).accepted,
  ).toBe(false);
  expect(context.doGet().accepted).toBe(false);
});
