#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-3010}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESTART_DELAY_SECONDS="${RESTART_DELAY_SECONDS:-2}"
DEV_ENGINE="${NEXT_DEV_ENGINE:-webpack}"

cd "${ROOT_DIR}"

echo ""
echo "=== Watching preview dev server on port ${PORT} ==="
echo "Auto-restarts when Next.js exits."
echo "Dev engine: ${DEV_ENGINE}"
echo "Press Ctrl+C to stop."
echo ""

while true; do
  echo "Starting Next.js preview server..."
  if [[ "${DEV_ENGINE}" == "turbopack" ]]; then
    npx --yes next dev -p "${PORT}" || true
  else
    npx --yes next dev --webpack -p "${PORT}" || true
  fi

  echo ""
  echo "Preview server exited. Restarting in ${RESTART_DELAY_SECONDS}s..."
  sleep "${RESTART_DELAY_SECONDS}"
done
