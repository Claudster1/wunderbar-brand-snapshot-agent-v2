# Domain Migration Status: app.brandsnapshot.ai → app.wunderbrand.ai

> Full migration instructions: [docs/DOMAIN_MIGRATION_GUIDE.md](./docs/DOMAIN_MIGRATION_GUIDE.md)

## Codebase Status

- [x] All source code references updated from `brandsnapshot.ai` to `wunderbrand.ai`
- [x] `.env.local` updated: `NEXT_PUBLIC_BASE_URL=https://app.wunderbrand.ai`
- [x] `vercel.json` redirect configured (old domain → new domain, 308 permanent)
- [x] All hardcoded fallback URLs in API routes use `app.wunderbrand.ai`

## External Services — Action Required

- [ ] **GoDaddy:** Add CNAME record `app` → `cname.vercel-dns.com` on `wunderbrand.ai`
- [ ] **Vercel:** Add `app.wunderbrand.ai` domain + update `NEXT_PUBLIC_BASE_URL` env var + redeploy
- [ ] **Stripe:** Create new webhook endpoint at `https://app.wunderbrand.ai/api/stripe/webhook` + update signing secret
- [ ] **Supabase:** Update Site URL and Redirect URLs in Auth settings
- [ ] **ActiveCampaign:** Update email template links from old domain to new domain

## Post-Migration Verification

- [ ] `https://app.wunderbrand.ai` loads correctly
- [ ] `https://app.brandsnapshot.ai` redirects to new domain
- [ ] Stripe webhook test returns 200
- [ ] Assessment flow works end-to-end
- [ ] Report PDF downloads work
- [ ] OG images render
- [ ] Email report links point to new domain
