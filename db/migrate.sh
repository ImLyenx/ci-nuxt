#!/usr/bin/env bash
# Applies db/schema_migrations/NNN_name.sql in order to DATABASE_URL (read from
# .env). Applied versions are recorded in the schema_migrations table, so each
# file runs once; each one runs in its own transaction.
set -euo pipefail
shopt -s nullglob

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  . "$ROOT/.env"
  set +a
fi

: "${DATABASE_URL:?DATABASE_URL is not set (add it to .env)}"

run() { psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q "$@"; }

# client_min_messages hides "already exists, skipping" notices
run -c "SET client_min_messages TO warning;
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
)"

applied="$(run -At -c 'SELECT version FROM schema_migrations')"

for file in "$ROOT"/db/schema_migrations/[0-9][0-9][0-9]_*.sql; do
  version="$(basename "$file" .sql)"
  if grep -qxF "$version" <<<"$applied"; then
    continue
  fi

  echo "applying $version"
  run --single-transaction -c 'SET LOCAL client_min_messages TO warning' \
    -f "$file" \
    -c "INSERT INTO schema_migrations (version) VALUES ('$version')"
done

echo "database is up to date"
