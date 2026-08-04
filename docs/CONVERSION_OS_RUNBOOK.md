# Conversion OS Runbook

> **Purpose:** Machines handle volume and follow-up. Humans only take high-intent conversations.  
> **Last updated:** 2026-07-29  
> **Related:** `INTEGRATIONS_ACTION_CHECKLIST.md` · `ACTIVECAMPAIGN_AI_BUILDER_BRIEF.md` · `OTTER_ZAPIER_SETUP.md`

---

## 1. Operating principle

| System owns (always on) | Human owns (high intent only) |
|---|---|
| Snapshot nurture + upgrade emails (AC) | Booked Calendly calls |
| Abandoned-checkout email + SMS (opt-in) | Hot Quo SMS replies (“call me”, pricing) |
| Report-ready + education series (AC) | Approving Otter follow-up drafts (2–5 min) |
| No-show SMS rebook (app → Quo) | Closing Managed Marketing / AI Consulting |
| Inbound miss / after-hours triage (Sona) | Weekly funnel review |
| Pixels + remarketing audiences | — |

**Do not:** auto-SMS without opt-in · let Sona run strategy calls · dual-record booked calls (Otter only) · skip human approve on Otter follow-ups.

---

## 2. Tool map (who does what)

| Tool | Job | Conversion outcome |
|---|---|---|
| **App Snapshot** | Free diagnostic + lead | Intent + scores into AC |
| **Resend** | Instant results email | Reduce post-Snapshot drop-off |
| **ActiveCampaign** | Nurture + upsell + MQL drips | Paid tier climb + service bookings |
| **Stripe** | Checkout + abandon signal | Revenue + `checkout:abandoned` |
| **Quo SMS** | Results #1-fix, abandon, no-show texts | Speed-to-lead; human closes in inbox |
| **Sona (Quo)** | Inbound / missed / after-hours only | Qualify → Calendly or message |
| **Calendly** | Book expert / activation / services | Tags + Slack; pipeline for calls |
| **Otter** | Record + transcript booked calls | Source of truth for follow-up |
| **Zapier** | Otter → `POST /api/session/process-transcript` | Draft into review queue |
| **Review queue** | Approve personalized follow-up | AC sends close email with CTA |
| **Slack** | CRM / sales alerts | Same-day human response |
| **Meta / LI / GA4** | Consent-gated pixels + audiences | Retarget non-buyers; exclude purchasers |

```
Site / Ads → Snapshot → AC + SMS
                ↓
         Stripe / Calendly
                ↓
     Booked call (you) → Otter → Zapier → Review → AC email
Missed phone → Sona → Calendly / message → Slack if hot
```

---

## 3. Daily checklist (20–30 min)

Do in this order every business day:

1. **Slack** — Clear sales/CRM alerts (new purchase, booking, hot lead). Reply same day.
2. **Quo inbox** — Answer SMS replies. Priority: pricing / “call me” / Snapshot+ questions → book Calendly or send checkout link.
3. **Otter review queue** — List pending, edit if needed, approve + send within 24h of the call.
   ```bash
   curl -s -H "Authorization: Bearer $ADMIN_API_KEY" \
     "https://app.wunderbrand.ai/api/session/followups?status=pending_review"
   ```
4. **Calendly** — Confirm today’s calls; Otter recording on; Quo recording **off** for those meetings.
5. **Sona / missed calls** — Scan any Sona handoffs or voicemails; call back hot leads before noon.

**Weekly (30 min):** AC automation stats (open/click/exit) · Stripe funnel (initiate → pay) · Meta/LI audiences exclude `purchased:*`.

---

## 4. ActiveCampaign — exact build order

Automations **must be built in the AC UI** (API cannot create them). Use build packs in this order:

| # | Automation | Trigger tag | Build pack |
|---|---|---|---|
| 1 ⭐ | Free Snapshot → Snapshot+ | `purchased:snapshot` | `ACTIVECAMPAIGN_REVENUE_AUTOMATION_EMAILS.md` → 4.1 |
| 2 ⭐ | Abandoned checkout | `checkout:abandoned` | …REVENUE… → 4.2 |
| 3 | Report Ready | `report:*-ready` | …REVENUE… → 4.8 |
| 4 | Brand Education | `nurture:brand-education` | `ACTIVECAMPAIGN_BRAND_EDUCATION_NURTURE.md` |
| 5 💰 | Managed Marketing MQL | `mql:managed-marketing` | `ACTIVECAMPAIGN_CALL_AUTOMATION_EMAILS.md` → B |
| 6 💰 | MM pre-booking | `services:managed_marketing` | …CALL… → E |
| 7 💰 | AI Consulting MQL | `mql:ai-consulting` | …CALL… → C |
| 8 💰 | AI pre-booking | `services:consulting` | …CALL… → F |
| 9 | Blueprint+ Activation | `session:pending` | …CALL… → A |
| 10 | Talk to Expert follow-up | `call:expert-scheduled` | …CALL… → D |
| 11 | Cancellation recovery | any `*:canceled` | …CALL… → Shared |

**Rules for every automation:**
- Entry trigger = **tag** spelling exactly as above (colons matter).
- Exit goal = purchase of next tier **or** relevant booking tag (so converters stop getting nurture).
- Full prompts: `ACTIVECAMPAIGN_AI_BUILDER_BRIEF.md`.

**Calendly booking links (paste into emails):**

| Event | URL |
|---|---|
| Talk to an Expert | `https://calendly.com/claudine-wunderbardigital/talk-to-an-expert` |
| Strategy Activation | `https://calendly.com/claudine-wunderbardigital/brand-blueprint-strategy-activation-session` |
| Managed Marketing | `https://calendly.com/claudine-wunderbardigital/talk-to-an-expert-managed-marketing-consultation` |
| Free AI Consultation | `https://calendly.com/claudine-wunderbardigital/free-ai-consultation-clone` |

---

## 5. Quo + Sona — exact settings

### Go-live (dashboard)
1. Confirm sending number + complete **A2P 10DLC** (required or API returns 400).
2. Set in Vercel (all envs) + `.env.local`: `QUO_API_KEY`, `QUO_FROM_NUMBER` (E.164).
3. Redeploy. Smoke: results-page SMS opt-in → text arrives → reply lands in Quo inbox.

### App-automated SMS (already coded — opt-in gated)
| Trigger | When | Consent |
|---|---|---|
| Results #1-fix walkthrough | Results opt-in CTA | `sms:opted-in` + `phone_mobile` |
| Abandoned checkout | Stripe `checkout.session.expired` | Same opt-in only |
| Calendly no-show | `invitee_no_show.created` | Booking number or stored opt-in |

### Snippets (human reply speed)
Save in Quo for one-tap replies:

| Name | When | Draft |
|---|---|---|
| Book expert | Hot reply | “Happy to dig in live — grab a time here: [Talk to an Expert Calendly]. Bring your Snapshot if you have it.” |
| Snapshot+ link | Price / “what’s next” | “Snapshot+ unlocks the full action plan on top of your free results — checkout: [app Snapshot+ URL]. Questions? Reply here.” |
| Rebook | Soft no-show | “Sorry we missed you — reopen a slot whenever you’re ready: [same Calendly as booked].” |
| STOP ack | Opt-out | “You’re unsubscribed from texts. Email Claudine if you need anything.” |

### Auto-replies
| Scenario | Behavior |
|---|---|
| Missed call (business hours) | Text back within minutes if possible; else auto-SMS: “Sorry we missed you — text us here or book: [Calendly].” |
| After hours / weekend | **Sona** answers |

### Sona job brief (inbound / miss / after-hours only)
**Do:**
- Greet as Wunderbar Digital / WunderBrand.
- Answer FAQ: free Snapshot vs paid tiers; what a Talk to an Expert call is.
- Always offer a next step: Snapshot link (`app.wunderbrand.ai`) **or** Calendly Talk to an Expert.
- Capture name + email + reason for calling; leave a clear message for the team.

**Do not:**
- Run strategy / diagnostic calls.
- Quote custom retainers or close Managed Marketing / AI Consulting.
- Pressure-sell Blueprint+ on a cold inbound — **book or Snapshot only**.

**Escalate to human:** caller asks for Claudine, pricing for services, or “call me back today.”

---

## 6. Otter + Zapier — exact settings

Full steps: `OTTER_ZAPIER_SETUP.md`.

| Setting | Value |
|---|---|
| Zap trigger | Otter → New Transcript |
| Zap action | Webhooks by Zapier → POST |
| URL | `https://app.wunderbrand.ai/api/session/process-transcript` |
| Header | `x-zapier-secret: <ZAPIER_WEBHOOK_SECRET>` |
| `session_type` | `talk_to_expert` or `activation_session` (filter by meeting title) |
| Env vars | `ZAPIER_WEBHOOK_SECRET`, `ADMIN_API_KEY`, `OPENAI_API_KEY`, AC keys |

**Calendly webhook:** `https://app.wunderbrand.ai/api/calendly/webhook`  
Events: `invitee.created`, `invitee.canceled`, `invitee_no_show.created` (no-show SMS).

**Call hygiene:** Otter records booked strategy/expert calls. Quo/Sona = SMS + inbound triage only — do not also record the same Calendly call in Quo.

**SLA:** Approve follow-up within **24 hours** of the call. Every approved email must end with one clear CTA (upgrade checkout **or** services Calendly).

---

## 7. Offer map on the call (keep it simple)

| Where they are | Push |
|---|---|
| Free Snapshot only | **Snapshot+** — “what to do next” |
| Snapshot+ done | **Blueprint** — system / brand ops |
| Blueprint+ / serious ops | **Managed Marketing** or **AI Consulting** Calendly |
| Confused / research mode | Book **Talk to an Expert** (don’t discount live) |

---

## 8. Stand-up order (first 30 days)

| Day | Action | Done when |
|---|---|---|
| 1 | AC automations **#1–3** on | Test contact exits on purchase |
| 2 | Quo A2P + env vars + results SMS smoke | Text in inbox |
| 3 | Otter → Zapier → review queue smoke | Draft appears; approve sends |
| 4 | Calendly webhook + book/cancel/no-show smoke | Tags + SMS as expected |
| 5 | **Stripe checkout smoke (test mode, then live)** | Paid + abandon paths proven (see §9) |
| 6 | Sona after-hours + missed-call auto-reply | Inbound captured overnight |
| 7 | Meta audiences from purchasers; exclude buyers | Ads not wasting spend |
| 8+ | AC automations **#4–11** | Full ladder live |

Status of dashboard work: `INTEGRATIONS_ACTION_CHECKLIST.md`.

---

## 9. Smoke tests (copy/paste)

| Flow | How |
|---|---|
| Snapshot → email | Complete free Snapshot → Resend results link + AC `purchased:snapshot` |
| SMS #1 fix | Opt in on results → Quo text with weakest pillar |
| **Stripe pay (test)** | Snapshot+ checkout → `4242…` → success + AC `purchased:snapshot-plus` + report access |
| **Stripe abandon (test)** | Start checkout → expire session → AC `checkout:abandoned` (+ SMS if opted in) |
| Book / no-show | Book Calendly test → cancel or mark no-show → tag + rebook SMS |
| Otter follow-up | Record short test call → Zap fires → approve via API → AC email |
| CRM smoke | `GET /api/admin/crm/smoke` (admin auth) |

---

## 10. One-line north star

**AC + Quo SMS do the volume; Sona catches missed phone; Calendly books warm intent; Otter turns every call into a tailored close email; you only talk to people who raised their hand.**
