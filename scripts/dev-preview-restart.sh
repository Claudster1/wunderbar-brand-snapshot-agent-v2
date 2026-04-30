#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-3010}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo ""
echo "=== Restarting preview dev server on port ${PORT} ==="

PIDS="$(lsof -tiTCP:"${PORT}" -sTCP:LISTEN || true)"
if [[ -n "${PIDS}" ]]; then
  echo "Stopping process(es) on port ${PORT}: ${PIDS}"
  kill -9 ${PIDS}
  sleep 1
fi

echo "Starting Next.js preview server..."
exec npx --yes next dev -p "${PORT}"
