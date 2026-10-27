export interface TelegramEnv {
  TELEGRAM_RELAY_URL?: string;
  TELEGRAM_RELAY_TOKEN?: string;
  LEADS_DB?: D1Database;
}

export interface TelegramLead {
  request_id: string;
  submitted_at: string;
  company_name: string;
  contact_name: string;
  nip: string | null;
  email: string | null;
  phone: string | null;
  service_id: string;
  message: string;
  locale: string;
  page_path: string;
}

export const telegramConfigured = (env: TelegramEnv) =>
  Boolean(env.TELEGRAM_RELAY_URL && env.TELEGRAM_RELAY_TOKEN);

export function telegramText(lead: TelegramLead): string {
  let page = 'https://itbiz.pl/';
  try {
    const candidate = new URL(lead.page_path, page);
    if (candidate.origin === 'https://itbiz.pl') page = candidate.href;
  } catch {
    /* Keep the canonical home URL for malformed input. */
  }
  return [
    'ITBIZ.PL | Nowe zapytanie B2B',
    `ID: ${lead.request_id}`,
    `Data: ${lead.submitted_at}`,
    `Język: ${lead.locale.toUpperCase()}`,
    lead.contact_name && `Kontakt: ${lead.contact_name}`,
    lead.company_name && `Firma: ${lead.company_name}`,
    lead.nip && `NIP: ${lead.nip}`,
    lead.phone && `Telefon: ${lead.phone}`,
    lead.email && `E-mail: ${lead.email}`,
    `Usługa: ${lead.service_id}`,
    `Strona: ${page}`,
    '',
    lead.message,
  ]
    .filter((line) => line !== null)
    .join('\n')
    .slice(0, 4000);
}

export async function sendTelegram(
  lead: TelegramLead,
  env: TelegramEnv,
): Promise<boolean> {
  if (!env.TELEGRAM_RELAY_URL || !env.TELEGRAM_RELAY_TOKEN) return false;
  try {
    const response = await fetch(env.TELEGRAM_RELAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.TELEGRAM_RELAY_TOKEN}`,
      },
      body: JSON.stringify({ requestId: lead.request_id, text: telegramText(lead) }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as {
      accepted?: boolean;
      requestId?: string;
    };
    return result.accepted === true && result.requestId === lead.request_id;
  } catch {
    // Credentials and customer data must not enter error logs.
    return false;
  }
}

export async function deliverTelegramNotification(
  env: TelegramEnv,
  requestId: string,
): Promise<boolean> {
  if (!env.LEADS_DB || !telegramConfigured(env)) return false;
  const now = new Date().toISOString();
  const stale = new Date(Date.now() - 5 * 60_000).toISOString();
  try {
    const claim = await env.LEADS_DB.prepare(
      `UPDATE contact_leads
      SET notification_status = 'sending', notification_attempts = notification_attempts + 1, notification_last_attempt = ?
      WHERE request_id = ? AND (notification_status = 'pending' OR (notification_status = 'sending' AND notification_last_attempt <= ?))`,
    )
      .bind(now, requestId, stale)
      .run();
    if (claim.meta.changes !== 1) return false;
    const lead = await env.LEADS_DB.prepare(
      `SELECT request_id, submitted_at, company_name, contact_name, nip, email, phone, service_id, message, locale, page_path
      FROM contact_leads WHERE request_id = ?`,
    )
      .bind(requestId)
      .first<TelegramLead>();
    const sent = Boolean(lead && (await sendTelegram(lead, env)));
    await env.LEADS_DB.prepare(
      `UPDATE contact_leads SET notification_status = ?, notification_sent_at = ? WHERE request_id = ?`,
    )
      .bind(sent ? 'sent' : 'pending', sent ? now : null, requestId)
      .run();
    return sent;
  } catch {
    // A stale 'sending' claim becomes retryable automatically.
    return false;
  }
}

export async function retryTelegramNotifications(env: TelegramEnv): Promise<void> {
  if (!env.LEADS_DB || !telegramConfigured(env)) return;
  const stale = new Date(Date.now() - 5 * 60_000).toISOString();
  const queued = await env.LEADS_DB.prepare(
    `SELECT request_id FROM contact_leads
    WHERE (notification_status = 'pending' AND (notification_last_attempt IS NULL OR notification_last_attempt <= ?))
       OR (notification_status = 'sending' AND notification_last_attempt <= ?)
    ORDER BY submitted_at LIMIT 10`,
  )
    .bind(stale, stale)
    .all<{ request_id: string }>();
  for (const lead of queued.results)
    await deliverTelegramNotification(env, lead.request_id);
}
