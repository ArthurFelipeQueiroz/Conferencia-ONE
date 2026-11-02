-- Operational communication tracking by unique registration phone.
-- Participant details remain private in D1; only authenticated administrators can manage the queue.
CREATE TABLE IF NOT EXISTS communication_status (
  contact_digits TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'not_sent' CHECK(status IN ('not_sent','sent','skipped','failed')),
  sent_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by INTEGER REFERENCES staff_users(id),
  note TEXT
);
CREATE INDEX IF NOT EXISTS idx_communication_status_status ON communication_status(status);
