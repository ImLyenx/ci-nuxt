-- one like per pokemon per visitor: rows instead of a counter. existing
-- counts can't be attributed to visitors, so they're dropped
DROP TABLE likes;

CREATE TABLE likes (
  pokemon_id INTEGER NOT NULL CHECK (pokemon_id > 0),
  visitor_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pokemon_id, visitor_id)
);
