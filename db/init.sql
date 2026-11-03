CREATE TABLE IF NOT EXISTS wishlist (
  pokemon_id INTEGER PRIMARY KEY CHECK (pokemon_id > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
