/** NaSerwis + ITBIZ operational journal. No contact data is sent to Analytics. */
const JOURNAL_SPREADSHEET_ID = '1dIQoakrgPfLYzEyIUFL6fNXSV68HnAwyW3ks8CMJdbw';
const JOURNAL_SHEET_ID = 667178360;

function initializeJournal() {
  const properties = PropertiesService.getScriptProperties();
  if (properties.getProperty('JOURNAL_SECRET')) throw new Error('Already initialized');
  const secret = Utilities.getUuid() + Utilities.getUuid();
  properties.setProperty('JOURNAL_SECRET', secret);
  const spreadsheet = SpreadsheetApp.openById(JOURNAL_SPREADSHEET_ID);
  const config =
    spreadsheet.getSheetByName('_SyncConfig') || spreadsheet.insertSheet('_SyncConfig');
  config.getRange('A1').setValue(secret);
  config.hideSheet();
  // The setup client transfers A1 to Cloudflare secrets and then clears A1.
  // The permanent copy remains in Script Properties, not in the spreadsheet.
}

function doGet() {
  return jsonReply({ accepted: false });
}

function doPost(event) {
  const reject = () => jsonReply({ accepted: false });
  try {
    const raw = (event && event.postData && event.postData.contents) || '';
    if (!raw || raw.length > 30000) return reject();
    const envelope = JSON.parse(raw);
    const timestamp = String(envelope.timestamp || '');
    if (
      !/^\d{13}$/.test(timestamp) ||
      Math.abs(Date.now() - Number(timestamp)) > 300000
    )
      return reject();
    if (typeof envelope.payload !== 'string' || envelope.payload.length > 22000)
      return reject();
    const secret =
      PropertiesService.getScriptProperties().getProperty('JOURNAL_SECRET');
    if (!secret) return reject();
    const signature = Utilities.computeHmacSha256Signature(
      timestamp + '.' + envelope.payload,
      secret,
    )
      .map((byte) => ((byte + 256) % 256).toString(16).padStart(2, '0'))
      .join('');
    if (!sameSignature(signature, String(envelope.signature || ''))) return reject();
    const lead = JSON.parse(envelope.payload);
    if (
      !['NaSerwis', 'ITBIZ'].includes(lead.site_brand) ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
        lead.request_id || '',
      ) ||
      !Number.isFinite(Date.parse(lead.submitted_at))
    )
      return reject();
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(20000)) return reject();
    try {
      insertLead(lead);
    } finally {
      lock.releaseLock();
    }
    return jsonReply({
      accepted: true,
      request_id: lead.request_id,
      site_brand: lead.site_brand,
    });
  } catch {
    return reject();
  }
}

function sameSignature(expected, actual) {
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index++)
    difference |= expected.charCodeAt(index) ^ actual.charCodeAt(index);
  return difference === 0;
}

function jsonReply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function safeCell(value, maxLength) {
  const text = String(value || '').slice(0, maxLength || 4000);
  return /^[\s]*[=+\-@]/.test(text) ? "'" + text : text;
}

function classifySource(attribution) {
  const source = String(attribution.utm_source || '').toLowerCase();
  const medium = String(attribution.utm_medium || '').toLowerCase();
  const referrer = String(attribution.referrer_host || '').toLowerCase();
  const tagged = Object.keys(attribution).some(
    (key) => /^utm_/.test(key) && attribution[key],
  );
  const click = attribution.gclid || attribution.wbraid || attribution.gbraid;
  const evidence =
    tagged || click ? 'UTM / click ID' : referrer ? 'Referrer' : 'Не установлено';
  if (click || (source === 'google' && /^(cpc|ppc|paidsearch)$/.test(medium)))
    return ['Google Ads', evidence];
  if (source.includes('chatgpt') || referrer === 'chatgpt.com')
    return ['ChatGPT', evidence];
  if (
    (source === 'google' && medium === 'organic') ||
    (!source && /(^|\.)google\.[a-z.]+$/.test(referrer))
  )
    return ['Google органика', evidence];
  if (source.includes('itbiz') || referrer === 'itbiz.pl') return ['ITBIZ', evidence];
  return [tagged || referrer ? 'Другое' : 'Неизвестно', evidence];
}

function classifyService(lead) {
  const service = String(lead.service_id || '').toLowerCase();
  if (service.includes('wifi')) return 'Wi-Fi';
  if (/lan|rj45|network/.test(service)) return 'LAN / RJ45';
  if (/cctv|monitoring/.test(service)) return 'CCTV';
  return lead.site_brand === 'ITBIZ' ? 'IT для организаций' : 'Другое';
}

function insertLead(lead) {
  const spreadsheet = SpreadsheetApp.openById(JOURNAL_SPREADSHEET_ID);
  const sheet = spreadsheet
    .getSheets()
    .find((item) => item.getSheetId() === JOURNAL_SHEET_ID);
  if (!sheet || sheet.getRange('P9').getValue() !== 'Сайт')
    throw new Error('Journal schema mismatch');
  const rows = sheet.getRange(10, 1, 500, 16).getValues();
  // Historical unlabelled rows belong to NaSerwis. Never alter a matched row:
  // its result, payments and the owner's notes are authoritative.
  if (
    rows.some(
      (row) =>
        String(row[3]) === lead.request_id &&
        String(row[15] || 'NaSerwis') === lead.site_brand,
    )
  )
    return;
  const index = rows.findIndex((row) =>
    row.every((value, column) => column === 13 || value === ''),
  );
  if (index < 0) throw new Error('Journal capacity reached');
  const target = index + 10;
  const attribution = lead.attribution || {};
  const source = classifySource(attribution);
  const notes = [
    'Автоматически с ' +
      lead.site_brand +
      '. ID для сопоставления с generate_lead: ITBIZ — request_id, NaSerwis — transaction_id.',
    'Форма: ' + (attribution.form_id || 'website') + '; язык: ' + lead.locale + '.',
    'Время в A — время приёма сервером; E заполняется только после проверки GA4.',
    'Страница: ' + lead.page_path,
    ...Object.keys(attribution).map((key) => key + ': ' + attribution[key]),
  ].join('\n');
  const contact = [lead.contact_name, lead.phone, lead.email]
    .filter(Boolean)
    .join('\n');
  sheet
    .getRange(target, 1, 1, 16)
    .setValues([
      [
        new Date(lead.submitted_at),
        'Форма',
        safeCell(contact, 500),
        lead.request_id,
        '',
        source[0],
        source[1],
        classifyService(lead),
        'Новое',
        '',
        '',
        '',
        safeCell(notes, 8000),
        sheet.getRange(target, 14).getFormula(),
        safeCell(lead.message, 8000),
        lead.site_brand,
      ],
    ]);
  sheet.getRange(target, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
}
