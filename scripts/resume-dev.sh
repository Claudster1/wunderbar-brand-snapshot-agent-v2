#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_FILE="$ROOT_DIR/docs/WORKSTREAM_STATE.md"
MODE="${1:-quick}"

echo ""
echo "=== WunderBrand Resume Runner ==="
echo "Mode: ${MODE}"
echo "Repo: ${ROOT_DIR}"
echo ""

if [[ ! -f "$ROOT_DIR/package.json" ]]; then
  echo "Run this from the repository root."
  exit 1
fi

if [[ ! -d "$ROOT_DIR/node_modules" ]]; then
  echo "Dependencies not installed. Run: npm install"
  exit 1
fi

echo "1) Current git status"
git -C "$ROOT_DIR" status --short
echo ""

if [[ -f "$STATE_FILE" ]]; then
  echo "2) Workstream state (top section)"
  sed -n '1,140p' "$STATE_FILE"
  echo ""
else
  echo "2) Workstream state missing at $STATE_FILE"
  echo ""
fi

echo "3) PDF parity checks"
npm --prefix "$ROOT_DIR" run check:pdf-parity
echo ""

echo "4) Focused lint checks for active workstream"
npx eslint \
  "$ROOT_DIR/app/results" \
  "$ROOT_DIR/app/api/snapshot" \
  "$ROOT_DIR/app/admin/unified" \
  "$ROOT_DIR/src/pdf" \
  "$ROOT_DIR/components/SnapshotPdfTemplate.tsx" \
  --ext .ts,.tsx
echo ""

if [[ "$MODE" == "--full" || "$MODE" == "full" ]]; then
  echo "5) Typecheck"
  npm --prefix "$ROOT_DIR" run typecheck
  echo ""

  echo "6) Test suite"
  npm --prefix "$ROOT_DIR" run test
  echo ""
fi

echo "Resume checks complete."
echo "Continue from 'Next Tasks (Priority Queue)' in docs/WORKSTREAM_STATE.md."
