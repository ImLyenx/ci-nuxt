#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  . "$ROOT/.env"
  set +a
fi

: "${DATABASE_URL:?DATABASE_URL is not set (add it to .env)}"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT/db/init.sql"
