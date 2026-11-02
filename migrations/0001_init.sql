PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS staff_users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT NOT NULL UNIQUE COLLATE NOCASE,
 password_hash TEXT NOT NULL,
 salt TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('admin','reception','gifts')),
 active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY,
 user_id INTEGER NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS participants (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 source_row INTEGER NOT NULL UNIQUE CHECK(source_row>=2),
 registered_at TEXT,
 full_name TEXT NOT NULL,
 normalized_name TEXT NOT NULL,
 guardian_name TEXT,
 contact TEXT NOT NULL,
 contact_digits TEXT NOT NULL,
 age_raw TEXT,
 age INTEGER CHECK(age BETWEEN 1 AND 110),
 active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
 duplicate_status TEXT NOT NULL DEFAULT 'clear' CHECK(duplicate_status IN ('clear','needs_review','distinct','void')),
 review_note TEXT,
 church TEXT,
 shirt_requested INTEGER NOT NULL DEFAULT 0 CHECK(shirt_requested IN (0,1)),
 shirt_size TEXT CHECK(shirt_size IN ('PP','P','M','G','GG') OR shirt_size IS NULL),
 previous_attendance TEXT,
 media_consent INTEGER NOT NULL DEFAULT 0 CHECK(media_consent IN (0,1)),
 payment_raw TEXT,
 shirt_payment_status TEXT NOT NULL DEFAULT 'unverified' CHECK(shirt_payment_status IN ('unverified','confirmed','waived')),
 prize_rank INTEGER UNIQUE,
 prize_eligible INTEGER NOT NULL DEFAULT 0 CHECK(prize_eligible IN (0,1)),
 ticket_token TEXT NOT NULL UNIQUE,
 authorization_status TEXT NOT NULL DEFAULT 'pending' CHECK(authorization_status IN ('pending','approved','rejected')),
 authorization_note TEXT,
 authorization_by INTEGER REFERENCES staff_users(id),
 authorization_at TEXT,
 arrival_at TEXT,
 checkin_at TEXT,
 checkin_by INTEGER REFERENCES staff_users(id),
 checkin_note TEXT,
 prize_delivered_at TEXT,
 prize_delivered_by INTEGER REFERENCES staff_users(id),
 shirt_delivered_at TEXT,
 shirt_delivered_size TEXT CHECK(shirt_delivered_size IN ('PP','P','M','G','GG') OR shirt_delivered_size IS NULL),
 shirt_delivered_by INTEGER REFERENCES staff_users(id),
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 CHECK (shirt_requested=1 OR shirt_size IS NULL),
 CHECK (prize_eligible=0 OR (age BETWEEN 12 AND 17 AND prize_rank BETWEEN 1 AND 50))
);
CREATE INDEX IF NOT EXISTS idx_participants_name ON participants(normalized_name);
CREATE INDEX IF NOT EXISTS idx_participants_contact ON participants(contact_digits);
CREATE INDEX IF NOT EXISTS idx_participants_arrival ON participants(arrival_at,checkin_at);
CREATE TABLE IF NOT EXISTS shirt_stock (
 size TEXT PRIMARY KEY CHECK(size IN ('PP','P','M','G','GG')),
 total_qty INTEGER NOT NULL DEFAULT 0 CHECK(total_qty>=0),
 delivered_qty INTEGER NOT NULL DEFAULT 0 CHECK(delivered_qty>=0 AND delivered_qty<=total_qty),
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO shirt_stock(size) VALUES ('PP'),('P'),('M'),('G'),('GG');
CREATE TABLE IF NOT EXISTS audit_log (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 action TEXT NOT NULL,
 participant_id INTEGER REFERENCES participants(id),
 actor_id INTEGER REFERENCES staff_users(id),
 details TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
CREATE TABLE IF NOT EXISTS event_config (
 key TEXT PRIMARY KEY,
 value TEXT NOT NULL
);
INSERT OR IGNORE INTO event_config(key,value) VALUES ('prizes_locked','0');
CREATE TABLE IF NOT EXISTS rate_limits (
 key TEXT PRIMARY KEY,
 window_start INTEGER NOT NULL,
 attempts INTEGER NOT NULL CHECK(attempts>=0)
);
CREATE TRIGGER IF NOT EXISTS lock_prize_ranking BEFORE UPDATE OF source_row,age,active,duplicate_status,prize_rank,prize_eligible ON participants
WHEN (SELECT value FROM event_config WHERE key='prizes_locked')='1'
BEGIN SELECT RAISE(ABORT,'premiation ranking is immutable after closing'); END;
CREATE TRIGGER IF NOT EXISTS guarded_prize_delivery BEFORE UPDATE OF prize_delivered_at ON participants
WHEN NEW.prize_delivered_at IS NOT NULL AND OLD.prize_delivered_at IS NULL
BEGIN
 SELECT RAISE(ABORT,'prize list not finalized') WHERE (SELECT value FROM event_config WHERE key='prizes_locked')<>'1';
 SELECT RAISE(ABORT,'not eligible for prize') WHERE OLD.prize_eligible=0 OR OLD.active=0;
 SELECT RAISE(ABORT,'check-in required for prize') WHERE OLD.checkin_at IS NULL;
END;
CREATE TRIGGER IF NOT EXISTS guarded_shirt_delivery BEFORE UPDATE OF shirt_delivered_at ON participants
WHEN NEW.shirt_delivered_at IS NOT NULL AND OLD.shirt_delivered_at IS NULL
BEGIN
 SELECT RAISE(ABORT,'shirt not requested') WHERE OLD.shirt_requested=0;
 SELECT RAISE(ABORT,'shirt payment not confirmed') WHERE OLD.shirt_payment_status NOT IN ('confirmed','waived');
 SELECT RAISE(ABORT,'check-in required for shirt') WHERE OLD.checkin_at IS NULL;
 SELECT RAISE(ABORT,'shirt size unavailable') WHERE NOT EXISTS(SELECT 1 FROM shirt_stock WHERE size=NEW.shirt_delivered_size AND total_qty>delivered_qty);
 UPDATE shirt_stock SET delivered_qty=delivered_qty+1,updated_at=datetime('now') WHERE size=NEW.shirt_delivered_size AND total_qty>delivered_qty;
END;
CREATE TRIGGER IF NOT EXISTS no_prize_undo BEFORE UPDATE OF prize_delivered_at ON participants
WHEN OLD.prize_delivered_at IS NOT NULL AND NEW.prize_delivered_at IS NULL
BEGIN SELECT RAISE(ABORT,'prize delivery cannot be undone automatically'); END;
CREATE TRIGGER IF NOT EXISTS no_shirt_undo BEFORE UPDATE OF shirt_delivered_at ON participants
WHEN OLD.shirt_delivered_at IS NOT NULL AND NEW.shirt_delivered_at IS NULL
BEGIN SELECT RAISE(ABORT,'shirt delivery cannot be undone automatically'); END;