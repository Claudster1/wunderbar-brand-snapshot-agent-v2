#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3010}"

echo ""
echo "=== Dev Server Restart Helper ==="
echo "Repo: ${ROOT_DIR}"
echo "Port: ${PORT}"
echo ""

if [[ ! -f "$ROOT_DIR/package.json" ]]; then
  echo "package.json not found at repo root."
  exit 1
fi

if ! command -v lsof >/dev/null 2>&1; then
  echo "lsof is required but not installed."
  exit 1
fi

PIDS="$(lsof -t -nP -iTCP:"$PORT" -sTCP:LISTEN || true)"
if [[ -n "$PIDS" ]]; then
  echo "Stopping existing process(es) on :$PORT -> $PIDS"
  # shellcheck disable=SC2086
  kill -9 $PIDS
  sleep 1
else
  echo "No existing process found on :$PORT"
fi

echo "Starting preview server on :$PORT..."
exec npm --prefix "$ROOT_DIR" run dev:preview
