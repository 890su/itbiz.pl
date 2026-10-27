-- Existing enquiries are deliberately excluded from automatic forwarding.
ALTER TABLE contact_leads ADD COLUMN notification_status TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE contact_leads ADD COLUMN notification_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contact_leads ADD COLUMN notification_last_attempt TEXT;
ALTER TABLE contact_leads ADD COLUMN notification_sent_at TEXT;

CREATE INDEX contact_leads_notification_queue
  ON contact_leads (notification_status, notification_last_attempt);
