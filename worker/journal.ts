export interface JournalEnv {
  LEADS_DB?: D1Database;
  JOURNAL_WEBHOOK_URL?: string;
  JOURNAL_WEBHOOK_SECRET?: string;
}

export interface JournalLead {
  site_brand: 'ITBIZ' | 'NaSerwis';
  request_id: string;
  submitted_at: string;
  contact_name: string;
  phone: string;
  email: string;
  service_id: string;
  message: string;
  locale: string;
  page_path: string;
  attribution: Record<string, string>;
}

export function journalStatement(
  db: D1Database,
  lead: JournalLead,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO lead_journal
    (site_brand, request_id, submitted_at, payload_json, purge_after)
    VALUES (?, ?, ?, ?, ?) ON CONFLICT(site_brand, request_id) DO NOTHING`,
    )
    .bind(
      lead.site_brand,
      lead.request_id,
      lead.submitted_at,
      JSON.stringify(lead),
      new Date(Date.parse(lead.submitted_at) + 180 * 86400000).toISOString(),
    );
}

export async function journalSignature(
  secret: string,
  message: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

export async function retryJournal(env: JournalEnv): Promise<void> {
  if (!env.LEADS_DB || !env.JOURNAL_WEBHOOK_URL || !env.JOURNAL_WEBHOOK_SECRET) return;
  const now = new Date().toISOString();
  const stale = new Date(Date.now() - 5 * 60000).toISOString();
  const pending = await env.LEADS_DB.prepare(
    `SELECT site_brand, request_id, payload_json FROM lead_journal
    WHERE delivered_at IS NULL AND (delivery_last_attempt IS NULL OR delivery_last_attempt <= ?)
    ORDER BY submitted_at LIMIT 10`,
  )
    .bind(stale)
    .all<{ site_brand: string; request_id: string; payload_json: string }>();
  for (const lead of pending.results) {
    const claim = await env.LEADS_DB.prepare(
      `UPDATE lead_journal
      SET delivery_status = 'sending', delivery_attempts = delivery_attempts + 1, delivery_last_attempt = ?
      WHERE site_brand = ? AND request_id = ? AND delivered_at IS NULL
        AND (delivery_last_attempt IS NULL OR delivery_last_attempt <= ?)`,
    )
      .bind(now, lead.site_brand, lead.request_id, stale)
      .run();
    if (claim.meta.changes !== 1) continue;
    let delivered = false;
    try {
      const timestamp = String(Date.now());
      const signature = await journalSignature(
        env.JOURNAL_WEBHOOK_SECRET,
        timestamp + '.' + lead.payload_json,
      );
      const response = await fetch(env.JOURNAL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp, payload: lead.payload_json, signature }),
        signal: AbortSignal.timeout(15000),
      });
      const result = (await response.json()) as {
        accepted?: boolean;
        request_id?: string;
        site_brand?: string;
      };
      delivered =
        response.ok &&
        result.accepted === true &&
        result.request_id === lead.request_id &&
        result.site_brand === lead.site_brand;
    } catch {
      /* Keep queued; never log customer data or the webhook credential. */
    }
    await env.LEADS_DB.prepare(
      `UPDATE lead_journal SET delivery_status = ?, delivered_at = ?
      WHERE site_brand = ? AND request_id = ?`,
    )
      .bind(
        delivered ? 'sent' : 'pending',
        delivered ? now : null,
        lead.site_brand,
        lead.request_id,
      )
      .run();
  }
}

export async function purgeJournal(env: JournalEnv): Promise<void> {
  if (env.LEADS_DB)
    await env.LEADS_DB.prepare('DELETE FROM lead_journal WHERE purge_after <= ?')
      .bind(new Date().toISOString())
      .run();
}
