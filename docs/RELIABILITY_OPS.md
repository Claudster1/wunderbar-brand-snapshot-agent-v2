# Reliability ops checklist

Keep intake and wrap-up up when providers or Vercel blip. Pair with [`INTEGRATIONS_ACTION_CHECKLIST.md`](./INTEGRATIONS_ACTION_CHECKLIST.md).

## External uptime (every 5 min)

1. [UptimeRobot](https://uptimerobot.com/) (or equivalent) → HTTP(s) monitor  
2. URL: `https://app.wunderbrand.ai/api/health?scope=liveness`  
3. Interval: **5 minutes**  
4. Alert: email + SMS (and Slack if available)  
5. Optional: second monitor on `?smoke=1` every 15–30 min (slower; catches DB/AI smoke failures)

**QC:** open the liveness URL → expect HTTP 200 and `"status":"healthy"` (or `"ok":true` depending on shape). Confirm the monitor is **Up** in the dashboard.

## AI billing (prevents total chat outage)

Dashboard alerts beat the 15-minute cron:

| Provider | Action |
|---|---|
| **OpenAI** | [Billing](https://platform.openai.com/settings/organization/billing) → auto-recharge + low-balance email |
| **Anthropic** | [Billing](https://console.anthropic.com/settings/billing) → auto-reload / low-balance alerts |
| **Gemini** | Cloud / AI Studio billing budget for the key behind `GOOGLE_API_KEY` / `GEMINI_API_KEY` |

In-app: Vercel cron `/api/cron/health-check` every 15m Slack-alerts via `SLACK_ALERT_WEBHOOK` when `aiBilling` or assessment primary+fallback fail.

**Kill switch when both providers are down:** set Vercel env `FEATURE_FLAG_AI_INTAKE=false` → chat/finalize return 503 with a clear message. Re-enable after credits restore.

## Sentry alert rules

Sentry DSN is already wired (`NEXT_PUBLIC_SENTRY_DSN`). In [Sentry Alerts](https://sentry.io/alerts/):

1. **Spike in errors** — Issue alerts when event volume rises vs baseline (prod environment).  
2. **New issue** — notify on first-seen in `production`.  
3. **Filter (optional)** — high priority on messages containing `brand-snapshot`, `complete-from-transcript`, `aiBilling`, or `Assessment chat`.

Route notifications to the same Slack/email as health cron.

## Region + distributed rate limits

- Vercel `regions: ["iad1"]` pins functions near typical US East Supabase/AI latency.  
- Optional Upstash Redis for cross-isolate rate limits (chat/finalize): set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`. Without them, in-memory limits still apply (per isolate).

## Quick QC commands

```bash
# Liveness (prod)
curl -sS "https://app.wunderbrand.ai/api/health?scope=liveness" | head -c 400

# Local / preview
curl -sS "http://localhost:3010/api/health?scope=liveness" | head -c 400

# Feature flags snapshot (includes ai_intake)
curl -sS "https://app.wunderbrand.ai/api/health" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);console.log(j.status,j.featureFlags||j.checks);})"
```
