CREATE TABLE lead_journal (
  site_brand TEXT NOT NULL,
  request_id TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  delivery_attempts INTEGER NOT NULL DEFAULT 0,
  delivery_last_attempt TEXT,
  delivered_at TEXT,
  purge_after TEXT NOT NULL,
  PRIMARY KEY (site_brand, request_id)
);
CREATE INDEX idx_lead_journal_delivery ON lead_journal(delivery_status, delivery_last_attempt);
