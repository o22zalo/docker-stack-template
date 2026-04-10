#!/bin/sh
set -eu

DB_PATH="${SQLITE_PATH:-${DATA_DIR:-/var/lib/omniroute}/omniroute.db}"
CONFIG_PATH="/etc/litestream.yml"

mkdir -p "$(dirname "$DB_PATH")"

echo "[entrypoint] restoring OmniRoute sqlite from Supabase S3..."
if ! litestream restore -config "$CONFIG_PATH" "$DB_PATH"; then
  echo "[entrypoint] ERROR: cannot restore sqlite from replica (missing object or invalid credentials)."
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "[entrypoint] ERROR: restored file not found: $DB_PATH"
  exit 1
fi

echo "[entrypoint] restore completed: $DB_PATH"
exec litestream replicate -config "$CONFIG_PATH" -exec "node run-standalone.mjs"
