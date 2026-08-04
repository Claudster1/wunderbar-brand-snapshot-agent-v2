# Integrations — Action Checklist

Living status of every integration and the remaining manual (dashboard) actions.
Last verified: **2026-07-28**.

**Conversion operating system (daily checklist + AC/Quo/Otter settings):** [`CONVERSION_OS_RUNBOOK.md`](./CONVERSION_OS_RUNBOOK.md)

Legend: ✅ done · 🟡 needs a dashboard action · ⚪ optional / nice-to-have

---

## Uptime & always-on health

| Layer | Cadence | URL / job | Notes |
|---|---|---|---|
| **UptimeRobot** (external) | every 5 min | `https://app.wunderbrand.ai/api/health?scope=liveness` | Keyword/HTTP 200 monitor. Alert email/SMS in UptimeRobot. |
| **Vercel cron** (in-app) | every 15 min | `/api/cron/health-check` | Dependencies + **draft persist smoke**; Slack via `SLACK_ALERT_WEBHOOK` on degraded/unhealthy. Requires **Vercel Pro** (Hobby only allows daily crons). |
| Deep manual probe | on demand | `https://app.wunderbrand.ai/api/health?smoke=1` | Returns 503 if draft write/schema fails. |

**UptimeRobot setup (if not already):**
1. Add HTTP(s) monitor → liveness URL above  
2. Interval: 5 minutes  
3. Alert contacts: your email / Slack  
4. Optional second monitor on `?smoke=1` every 15–30 min (slower; catches DB schema drift)

---

## What's now handled in code (done)

| Item | Status | Notes |
|---|---|---|
| **"Email me my snapshot" delivery** | ✅ | `/api/snapshot/lead-email` now sends the results link via **Resend** the moment a user captures email. Previously the page unlocked but no email was ever sent. Also sets `report_link` on the AC contact. |
| **Slack outbound webhooks** | ✅ | Sales / CRM / Alert / Support all returned HTTP 200 on a live test ping; all `SLACK_*` vars present in all Vercel envs. |
| **Non-snapshot service interest → nurture** | ✅ | New `POST /api/services/interest` applies `services:managed_marketing` / `services:consulting` for leads who never did a snapshot (entry to Automations E & F). |
| **Automation F (AI consulting pre-booking)** | ✅ | Copy + build pack added to `ACTIVECAMPAIGN_CALL_AUTOMATION_EMAILS.md`. |
| **Stale `AC_FIELD_*` env vars** | ✅ | Removed 35 from `.env.local` + the 1 in Vercel. App syncs AC fields by title now (auto-creates missing). |
| **Report-ready / lifecycle triggers** | ✅ | Rewired to Contacts API + Event Tracking (legacy webhook is dead in prod). |
| **Merge tags in all docs** | ✅ | Corrected to AC's underscore-stripped perstags. |

---

## Email deliverability / DNS — ✅ verified

| Record | Result |
|---|---|
| Root SPF (`wunderbardigital.com`) | `v=spf1 include:emsd1.com include:_spf.google.com ~all` — **ActiveCampaign (emsd1) authorized** ✅ |
| DMARC (`_dmarc.wunderbardigital.com`) | `p=quarantine; rua/ruf=dmarc@…; fo=1` ✅ |
| Resend SPF (`send.mail.wunderbardigital.com`) | `v=spf1 include:amazonses.com ~all` ✅ |
| Resend MX (`send.mail…`) | `feedback-smtp.us-east-1.amazonses.com` ✅ |
| Resend DKIM (`resend._domainkey.mail…`) | present ✅ |

**No DNS action required.** Transactional (Resend) and marketing (AC) both authenticate and align under DMARC.

---

## Remaining manual actions (dashboards)

### 1. 🟡 Build the ActiveCampaign automations
The **copy + AI-builder prompts are all written**. Nothing sends until the automations exist in AC.
Build in this order (see `docs/ACTIVECAMPAIGN_AI_BUILDER_BRIEF.md` §1 index):
1. Free Snapshot → Snapshot+ upgrade — `purchased:snapshot`
2. Abandoned checkout — `checkout:abandoned`
3. Report Ready — `report:*-ready`
4. Brand Education series — `nurture:brand-education`
5. Managed Marketing MQL — `mql:managed-marketing`
6. Managed Marketing pre-booking — `services:managed_marketing`
7. Free AI Consultation MQL — `mql:ai-consulting`
8. AI Consulting pre-booking — `services:consulting`
9. Blueprint+ Strategy Activation — `session:pending`
10. Talk-to-an-Expert follow-up — `call:expert-scheduled`
11. Cancellation recovery — any `*:canceled`

Copy sources: `ACTIVECAMPAIGN_REVENUE_AUTOMATION_EMAILS.md`, `ACTIVECAMPAIGN_CALL_AUTOMATION_EMAILS.md`, `ACTIVECAMPAIGN_BRAND_EDUCATION_NURTURE.md`.

### 2. 🟡 Decide the consent model
`MARKETING_CONFIRM_SECRET` is **unset in prod → single opt-in** (contacts are enrolled on email capture).
- Keep single opt-in → no action.
- Switch to double opt-in → set `MARKETING_CONFIRM_SECRET` in Vercel and the confirm flow activates.

### 3. ⚪ Sales lists for Automations B/C (optional)
Automations B (Managed Marketing MQL) and C (AI Consulting MQL) trigger on **tags**, so lists aren't
required. If you want list-based reporting/segmentation, create "Managed Marketing — Sales" and
"AI Consulting — Sales" lists in AC. Main leads list `AC_LIST_BRAND_SNAPSHOT_LEADS` is already set.

### 4. 🟡 Ad-platform conversion tracking
Meta Pixel / Google Ads / LinkedIn IDs are placeholders — conversions aren't attributed until real IDs
are added. Add the real pixel/tag IDs (and push any `NEXT_PUBLIC_*` values to Vercel) when running paid.

### 5. ⚪ Point a lead form at `/api/services/interest`
The backend is live. To capture **non-snapshot** managed-marketing / AI interest, wire any in-app
"Talk to us" form to `POST /api/services/interest` with `{ email, service, source, turnstileToken }`.
(External `wunderbardigital.com` CTAs can alternatively use an AC link-click trigger.)

### 6. ⚪ Slack interactivity (CRM action buttons)
Outbound messages are confirmed. Interactive buttons (Slack → app) use `SLACK_SIGNING_SECRET` (present).
Confirm the Slack app's **Interactivity Request URL** points to `https://app.wunderbrand.ai/api/slack/crm-actions`.

### 7. ⚪ Prod parity spot-check
Run `/api/admin/crm/smoke` to confirm AC contact/tag/field/event writes succeed end-to-end in prod.

---

## Quo (OpenPhone) SMS — opt-in outreach

**Built in code (done):**
- `lib/sms/quo.ts` — native Quo sender (`POST https://api.quo.com/v1/messages`), fail-safe when unconfigured.
- Results-page **SMS opt-in beside the upgrade CTA** ("Want a 2-min text walkthrough of your #1 fix?") → `POST /api/sms/results-optin`, which records SMS consent in AC (`sms:opted-in`, `sms:results-optin`, `intent:sms-walkthrough`, `phone_mobile`) and **immediately texts the user their #1 growth lever** (weakest pillar, derived server-side) — the automated hot-lead first-touch; a human replies from the Quo shared inbox to close.

**🟡 To go live (dashboard):**
1. In Quo: create/confirm the sending number and complete **A2P 10DLC registration** (Quo manages it; sends fail with a 400 "A2P Registration Not Approved" until done).
2. Get an **API key** (Quo → Settings → API) and note the sending number in E.164.
3. Add to Vercel (all envs) + `.env.local`:
   - `QUO_API_KEY=<key>`
   - `QUO_FROM_NUMBER=<+1E164 or PN id>`
4. Redeploy. Test: opt in on a results page → confirm the text arrives and the reply lands in the Quo inbox.

**Also wired (same sender):**
- **Abandoned-checkout SMS nudge** — Stripe `checkout.session.expired` → texts the recovery link, **opt-in only** (only contacts with `sms:opted-in` + stored `phone_mobile`; never cold).
- **Calendly no-show recovery SMS** — `invitee_no_show.created` → texts a rebooking link. Uses the number the invitee gave for the booking (meeting-related consent), falling back to a stored SMS opt-in.

All three SMS flows go live the moment `QUO_API_KEY` + `QUO_FROM_NUMBER` are set and A2P is approved; until then they're safe no-ops.
