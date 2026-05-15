# Internal Preview Links

Use this doc as the source of truth for testing report UI and sample-data previews.

## Policy

- `/preview/*` routes are for internal testing and design review.
- Production app domain (`app.wunderbrand.ai`) should not serve preview routes by default.
- Team should use Vercel Preview deployment URLs (or localhost) for sample-report links.

## Environment Guard

- Env var: `ENABLE_PREVIEW_ROUTES`
- Production default: `false`
- Behavior:
  - `VERCEL_ENV=production` and `ENABLE_PREVIEW_ROUTES!=true` -> `/preview/*` rewrites to `preview-unavailable` (404)
  - Preview deployments and localhost are unaffected

## Where to Test

- Local (`npm run dev` or `npm run dev:preview`): `http://localhost:3010/preview` (port is pinned to avoid conflicts with other apps on 3000)
- Vercel Preview (current known):
  - `https://wunderbar-brand-snapshot-agent-v2-c05lpna2r.vercel.app/preview`

## Common Preview Routes

Append these to localhost or your branch's Vercel Preview base URL:

- `/preview`
- `/preview/results-tabs`
- `/preview/results`
- `/preview/snapshot-plus`
- `/preview/blueprint`
- `/preview/blueprint-plus`
- `/preview/report`
- `/preview/results-tabs?tab=activation`
- `/preview/results-tabs/activation/paid-ads`
- `/preview/pdf`

## If You Need Previews on Production Temporarily

1. Set `ENABLE_PREVIEW_ROUTES=true` in Vercel Production env.
2. Redeploy production.
3. Revert to `false` when done and redeploy.
