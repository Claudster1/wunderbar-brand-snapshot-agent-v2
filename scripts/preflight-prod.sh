#!/usr/bin/env bash
# Preflight check before testing on app.wunderbrand.ai
#
# Compares your local `main` HEAD commit SHA with the SHA the live site is running
# (exposed by /api/health → `version`), so you never test against a stale deploy.
#
# Usage:
#   bash scripts/preflight-prod.sh                          # uses app.wunderbrand.ai
#   bash scripts/preflight-prod.sh https://preview.url      # any deployment URL
#   npm run preflight                                       # via npm script

set -u

URL="${1:-https://app.wunderbrand.ai}"
HEALTH_URL="${URL%/}/api/health"

bold()  { printf "\033[1m%s\033[0m\n" "$*"; }
ok()    { printf "  \033[32m✓\033[0m %s\n" "$*"; }
warn()  { printf "  \033[33m!\033[0m %s\n" "$*"; }
fail()  { printf "  \033[31m✗\033[0m %s\n" "$*"; }

bold "Preflight check → ${URL}"
echo

# 1) Local state ──────────────────────────────────────────────────────────────
LOCAL_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
LOCAL_MAIN_SHA=$(git rev-parse --short=7 origin/main 2>/dev/null || echo "?")
LOCAL_HEAD_SHA=$(git rev-parse --short=7 HEAD 2>/dev/null || echo "?")

bold "Local"
ok "branch          ${LOCAL_BRANCH}"
ok "HEAD            ${LOCAL_HEAD_SHA}"
ok "origin/main     ${LOCAL_MAIN_SHA}"
echo

# 2) Live deploy state ────────────────────────────────────────────────────────
bold "Live"
RESPONSE=$(curl -fsS -m 10 "${HEALTH_URL}?refresh=1" 2>/dev/null || true)
if [[ -z "${RESPONSE}" ]]; then
  fail "Could not reach ${HEALTH_URL} (network / DNS / 500). Wait a moment and re-run."
  exit 2
fi

parse_field() {
  printf "%s" "${RESPONSE}" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const j=JSON.parse(s);const path=process.argv[1].split('.');let v=j;for(const p of path){v=v?.[p]}console.log(v??'')}catch(e){console.log('')}})" "$1"
}

LIVE_SHA=$(parse_field "version" | cut -c1-7)
LIVE_STATUS=$(parse_field "status")
SUPABASE_OK=$(parse_field "checks.supabase.ok")
OPENAI_OK=$(parse_field "checks.openai.ok")
TURNSTILE_OK=$(parse_field "checks.turnstile.ok")
STRIPE_OK=$(parse_field "checks.stripe.ok")
AC_OK=$(parse_field "checks.activeCampaign.ok")

if [[ -z "${LIVE_SHA}" ]]; then
  warn "Live commit SHA unreadable from /api/health response."
else
  ok "deployed SHA    ${LIVE_SHA}"
fi

# Critical-for-snapshot dependencies (chat + save + report generation)
[[ "${SUPABASE_OK}" == "true" ]] && ok "supabase        ok" || fail "supabase        DOWN — snapshot save WILL fail"
[[ "${OPENAI_OK}"   == "true" ]] && ok "openai          ok" || fail "openai          DOWN — chat WILL fail"
[[ "${TURNSTILE_OK}" == "true" ]] && ok "turnstile       ok" || warn "turnstile       not configured (security feature)"

# Nice-to-have for full purchase / email tagging flow
[[ "${STRIPE_OK}" == "true" ]] && ok "stripe          ok" || warn "stripe          not configured (only matters for checkout)"
[[ "${AC_OK}"     == "true" ]] && ok "activeCampaign  ok" || warn "activeCampaign  not configured (only matters for email tags)"
echo

# 3) Verdict ──────────────────────────────────────────────────────────────────
bold "Verdict"
SHA_OK="no"
[[ "${LIVE_SHA}" == "${LOCAL_MAIN_SHA}" ]] && SHA_OK="yes"

CRITICAL_OK="no"
[[ "${SUPABASE_OK}" == "true" && "${OPENAI_OK}" == "true" ]] && CRITICAL_OK="yes"

if [[ "${SHA_OK}" == "yes" && "${CRITICAL_OK}" == "yes" ]]; then
  ok "Live site matches origin/main and critical dependencies are healthy."
  echo
  bold "Before you click around"
  echo "  • Hard refresh the page:   ⌘ Shift R   (or open Incognito)"
  echo "  • Or run:                  open -na 'Google Chrome' --args --incognito '${URL}'"
  echo "  • Already open? Close the tab fully (⌘ W) and reopen — sticky service workers serve stale JS."
  exit 0
fi

if [[ "${SHA_OK}" == "no" ]]; then
  fail "Live SHA (${LIVE_SHA}) does NOT match origin/main (${LOCAL_MAIN_SHA})."
  echo
  echo "  → Vercel deploy is still propagating, or the last merge didn't deploy."
  echo "    Wait 30–60s and re-run.  If it still mismatches:"
  echo "      gh run list --branch main --limit 3"
  echo "      gh api repos/Claudster1/wunderbar-brand-snapshot-agent-v2/commits/main/status \\"
  echo "        --jq '.statuses[] | {context, state, target_url}'"
fi

if [[ "${CRITICAL_OK}" == "no" ]]; then
  fail "A critical dependency for snapshot is down. Do not test yet."
fi

exit 1
