#!/bin/sh
set -eu

DB_PATH="${SQLITE_PATH:-/data/app.db}"
CONFIG_PATH="/etc/litestream.yml"

mkdir -p "$(dirname "$DB_PATH")"

echo "[entrypoint] restoring sqlite from S3 replica..."
if ! litestream restore -config "$CONFIG_PATH" "$DB_PATH"; then
  echo "[entrypoint] ERROR: restore failed or replica does not exist."
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "[entrypoint] ERROR: sqlite file not found after restore: $DB_PATH"
  exit 1
fi

echo "[entrypoint] restore completed: $DB_PATH"
exec litestream replicate -config "$CONFIG_PATH" -exec "node index.js"
