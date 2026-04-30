# Release Readiness Checklist

Use this checklist before merging to `main` and before production deploy.

## 1) Code Health Gates

- [ ] Install dependencies
  - `npm ci`
- [ ] Lint passes
  - `npm run lint`
- [ ] Typecheck passes
  - `npm run typecheck`
- [ ] Build passes
  - `npm run build`
- [ ] Tests pass
  - `npm run test`

## 2) Security & Config

- [ ] Public-webhook env guard passes
  - `npm run guard:webhook-public-env`
- [ ] CSP includes required domains for production assets:
  - `plausible.io`
  - `cdnjs.cloudflare.com`
  - analytics domains in `next.config.js`
- [ ] No secrets committed to repo (spot-check `.env*`, tokens, keys)
- [ ] Stripe keys and webhook secret configured in deployment env
- [ ] Turnstile keys configured in deployment env

## 3) Performance Gates

- [ ] Standard performance gate passes (PR-level)
  - `npm run stress:compare:ci`
- [ ] Strict performance gate passes (release/main-level)
  - `npm run stress:compare:ci:strict`
- [ ] Stress artifacts reviewed in CI:
  - `stress-results.txt`
  - `stress-server.log`

Reference: `docs/STRESS_TESTING.md`

## 4) UI/UX Smoke Checks

### Header
- [ ] Desktop header: logo + nav + single CTA (`Talk to an Expert`)
- [ ] Desktop dropdowns render correctly:
  - WunderBrand Suite
  - Services
- [ ] Mobile hamburger on right opens/closes panel
- [ ] Mobile menu links + CTA work

### Footer
- [ ] Social icon strip appears above global footer
- [ ] Social icons visible (YouTube, X, TikTok, LinkedIn, Facebook, Instagram)
- [ ] Footer columns present:
  - Company / Products / Services / Resources / Legal
- [ ] Footer `Talk to an Expert` points to Calendly URL

## 5) Report/Preview Smoke

- [ ] Preview pages load without runtime crash:
  - `/preview/snapshot-plus`
  - `/preview/blueprint`
  - `/preview/blueprint-plus`
  - `/preview/results`
- [ ] Strategic Signals headings visible on all required previews:
  - Competitive Vulnerability Signal
  - Marketing Spend Efficiency Signal
  - Revenue Impact Statement
- [ ] No hydration mismatch error in console
- [ ] No CSP blocked-request errors in console

## 6) API/Operational Smoke

- [ ] Health endpoint responds
  - `/api/health`
- [ ] Liveness endpoint responds
  - `/api/health?scope=liveness`
- [ ] Admin/protected operational routes tested in target environment

## 7) Deployment Validation

- [ ] Deploy succeeds in hosting provider
- [ ] Post-deploy smoke on live URL:
  - home/access page render
  - header/footer render
  - one API health call
  - one critical user flow step
- [ ] Observability signals reviewed:
  - error logs
  - performance metrics
  - webhook/event delivery logs

## 8) Go/No-Go

- [ ] All required checks green
- [ ] Known issues documented with owner + ETA
- [ ] Rollback plan confirmed
- [ ] Release approved
