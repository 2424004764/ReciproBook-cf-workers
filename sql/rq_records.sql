CREATE TABLE IF NOT EXISTS rq_records (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL,
  contact_name TEXT NOT NULL,
  amount       REAL NOT NULL,
  direction    TEXT NOT NULL CHECK(direction IN ('in', 'out')),
  type         TEXT NOT NULL DEFAULT '红包',
  event_time   INTEGER NOT NULL,
  occasion     TEXT DEFAULT '',
  remark       TEXT DEFAULT '',
  create_time  INTEGER NOT NULL,
  update_time  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_records_user_id      ON rq_records (user_id);
CREATE INDEX IF NOT EXISTS idx_records_direction    ON rq_records (user_id, direction);
CREATE INDEX IF NOT EXISTS idx_records_event_time   ON rq_records (user_id, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_records_contact_name ON rq_records (user_id, contact_name);
