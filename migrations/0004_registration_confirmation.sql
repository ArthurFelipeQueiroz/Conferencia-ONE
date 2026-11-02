-- Pre-event registration confirmation and participant profile.
-- Profiles are operational labels; existing registrations are initialized from age
-- and can be corrected by an administrator without changing the source spreadsheet.
ALTER TABLE participants ADD COLUMN registration_type TEXT NOT NULL DEFAULT 'other'
  CHECK(registration_type IN ('adolescent','adult_guardian','team','other'));
ALTER TABLE participants ADD COLUMN registration_confirmed_at TEXT;

UPDATE participants
SET registration_type = CASE
  WHEN age BETWEEN 12 AND 17 THEN 'adolescent'
  WHEN age >= 18 THEN 'adult_guardian'
  ELSE 'other'
END;

CREATE INDEX IF NOT EXISTS idx_participants_registration_type ON participants(registration_type);
CREATE INDEX IF NOT EXISTS idx_participants_registration_confirmed ON participants(registration_confirmed_at);
