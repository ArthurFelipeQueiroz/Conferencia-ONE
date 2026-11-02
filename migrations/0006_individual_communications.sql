-- Confirmações individuais: um estado para cada inscrição, mesmo com telefone compartilhado.
-- A tabela antiga, por telefone, é mantida para histórico e não participa desta fila.
CREATE TABLE IF NOT EXISTS communication_individual (
  participant_id INTEGER PRIMARY KEY REFERENCES participants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_sent' CHECK(status IN ('not_sent','sent','skipped','failed')),
  sent_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by INTEGER REFERENCES staff_users(id),
  note TEXT
);
CREATE INDEX IF NOT EXISTS idx_communication_individual_status ON communication_individual(status);
