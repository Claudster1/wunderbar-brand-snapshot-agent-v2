#!/usr/bin/env bash
set -euo pipefail

STATE_FILE="docs/WORKSTREAM_STATE.md"

if [ ! -f "$STATE_FILE" ]; then
  echo "Missing $STATE_FILE"
  exit 1
fi

if [ ! -f "package.json" ]; then
  echo "Run this from the repository root."
  exit 1
fi

STAMP="$(date '+%Y-%m-%d %H:%M:%S %Z')"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
SHORT_STATUS="$(git status --short || true)"

{
  echo ""
  echo "## Resume Snapshot — ${STAMP}"
  echo ""
  echo "- Branch: \`${BRANCH}\`"
  echo "- Quick resume: \`npm run resume:dev\`"
  echo "- Full resume: \`npm run resume:dev:full\`"
  echo "- Continue from: **Next Tasks (Priority Queue)**"
  echo ""
  echo "### Git Status"
  echo '```'
  if [ -n "${SHORT_STATUS}" ]; then
    echo "${SHORT_STATUS}"
  else
    echo "(clean)"
  fi
  echo '```'
} >> "$STATE_FILE"

echo "Snapshot written to ${STATE_FILE}"
#!/usr/bin/env bash
set -euo pipefail

SNAPSHOT_FILE="docs/WORKSTREAM_SNAPSHOTS.md"
STATE_FILE="docs/WORKSTREAM_STATE.md"
NOW="$(date -u +"%Y-%m-%d %H:%M:%S UTC")"

if [ ! -f "package.json" ]; then
  echo "Run this from the repository root."
  exit 1
fi

if [ ! -f "${SNAPSHOT_FILE}" ]; then
  {
    echo "# Workstream Snapshots"
    echo ""
    echo "Auto-generated checkpoints for crash recovery."
    echo ""
  } > "${SNAPSHOT_FILE}"
fi

{
  echo "## Snapshot — ${NOW}"
  echo ""
  echo "### Git Status"
  echo '```'
  git status --short
  echo '```'
  echo ""
  echo "### Last 5 Commits"
  echo '```'
  git log -5 --oneline
  echo '```'
  echo ""
  if [ -f "${STATE_FILE}" ]; then
    echo "### Current Objective (from WORKSTREAM_STATE)"
    echo '```'
    awk '/^## Current Objective/{flag=1;next}/^## /{if(flag) exit}flag' "${STATE_FILE}"
    echo '```'
    echo ""
    echo "### Next Tasks (from WORKSTREAM_STATE)"
    echo '```'
    awk '/^## Next Tasks/{flag=1;next}/^## /{if(flag) exit}flag' "${STATE_FILE}"
    echo '```'
    echo ""
  fi
} >> "${SNAPSHOT_FILE}"

echo "Wrote checkpoint to ${SNAPSHOT_FILE}"
