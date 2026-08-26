CREATE TABLE IF NOT EXISTS contact_leads (
  request_id TEXT PRIMARY KEY,
  submitted_at TEXT NOT NULL,
  purge_after TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  service_id TEXT NOT NULL,
  message TEXT NOT NULL,
  locale TEXT NOT NULL,
  page_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS contact_leads_purge_after
  ON contact_leads (purge_after);

CREATE INDEX IF NOT EXISTS contact_leads_status_submitted
  ON contact_leads (status, submitted_at DESC);
