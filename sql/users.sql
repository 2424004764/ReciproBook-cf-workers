CREATE TABLE IF NOT EXISTS users (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  openid    TEXT NOT NULL UNIQUE,
  source    TEXT NOT NULL DEFAULT '',
  last_login_at TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_openid ON users (openid);
