-- Generate a random server-side salt within D1. No application secret is committed.
INSERT OR IGNORE INTO event_config(key,value) VALUES ('rate_limit_salt',lower(hex(randomblob(32))));
