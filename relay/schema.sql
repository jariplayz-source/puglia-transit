CREATE TABLE IF NOT EXISTS messages (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT UNIQUE NOT NULL,
  topic TEXT NOT NULL,
  time INTEGER NOT NULL,
  message TEXT NOT NULL,
  att_name TEXT,
  att_size INTEGER
);
CREATE INDEX IF NOT EXISTS messages_topic_seq ON messages (topic, seq);
CREATE INDEX IF NOT EXISTS messages_time ON messages (time);
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  time INTEGER NOT NULL,
  name TEXT,
  data BLOB NOT NULL
);
CREATE INDEX IF NOT EXISTS files_time ON files (time);
