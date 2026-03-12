#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-3010}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESTART_DELAY_SECONDS="${RESTART_DELAY_SECONDS:-2}"

cd "${ROOT_DIR}"

echo ""
echo "=== Watching preview dev server on port ${PORT} ==="
echo "Auto-restarts when Next.js exits."
echo "Press Ctrl+C to stop."
echo ""

while true; do
  echo "Starting Next.js preview server..."
  npx --yes next dev -p "${PORT}" || true

  echo ""
  echo "Preview server exited. Restarting in ${RESTART_DELAY_SECONDS}s..."
  sleep "${RESTART_DELAY_SECONDS}"
done
