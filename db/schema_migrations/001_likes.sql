CREATE TABLE IF NOT EXISTS likes (
  pokemon_id INTEGER PRIMARY KEY CHECK (pokemon_id > 0),
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0)
);
