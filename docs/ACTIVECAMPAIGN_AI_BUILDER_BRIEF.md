# WunderBrand → ActiveCampaign Automation Build Brief

> **Audience:** the ActiveCampaign **AI automation builder** (or a human marketer).
> **Purpose:** turn the signals the app already emits into revenue-producing automations.
> **Verified:** 2026-07-28, cross-checked against the live code (`app/api/**`, `lib/**`)
> and the live AC account (`wunderbardigital.api-us1.com`).

This brief is authoritative for **what actually fires in production today**. Where it
disagrees with older docs (`ACTIVECAMPAIGN_AUTOMATIONS.md`,
`NURTURE_IMPLEMENTATION_GUIDE.md`), trust this file — it was reconciled against the code.
Use the older docs for the *email copy* (they're good); use this file for the *triggers*.

---

## 0. Can the automations be built via API?

**No.** ActiveCampaign's public API (v3) is effectively **read-only for automations** — you can
list automations and add a contact to an existing automation by ID, but you **cannot create the
automation graph (triggers, waits, conditions, emails) programmatically.** Automations must be
built in the AC UI or via the **AC AI builder**. That's why this document exists: paste the
per-automation prompts in §4 into the AI builder, then attach the email copy.

What *is* automatable via API (and already done by the app): creating/updating contacts,
applying/removing tags, setting custom fields, subscribing to lists, and recording site events.

---

## 1. How to use this with the AC AI builder

For each automation in §4:
1. Copy the **"AI builder prompt"** block into the AC automation AI builder.
2. When it generates the flow, attach the referenced **email copy** (see `docs/EMAIL_*.md`).
3. Set the **entry trigger** exactly as specified (tag spelling incl. colons is literal).
4. Set the **exit goal** so contacts leave when they convert.
5. Turn it **on** and run the §6 test.

### Build packs (easiest path — prompt + copy co-located)

For the automations we've written finished copy for, each automation section in the copy docs now has a
**"🔧 Build in AC"** block (AI-builder prompt + exact Send-step order + on-entry actions) right above its
email bodies — so you build each one from a single place, no flipping. Recommended build order:

| # | Automation | Trigger | Build pack (copy doc) |
|---|---|---|---|
| 1 | Free Snapshot → Snapshot+ upgrade ⭐ | `purchased:snapshot` | `ACTIVECAMPAIGN_REVENUE_AUTOMATION_EMAILS.md` → 4.1 |
| 2 | Abandoned checkout ⭐ | `checkout:abandoned` | `…REVENUE…` → 4.2 |
| 3 | Report Ready | `report:*-ready` | `…REVENUE…` → 4.8 |
| 4 | Brand Education series | `nurture:brand-education` | `ACTIVECAMPAIGN_BRAND_EDUCATION_NURTURE.md` |
| 5 | Managed Marketing MQL 💰 | `mql:managed-marketing` | `ACTIVECAMPAIGN_CALL_AUTOMATION_EMAILS.md` → B |
| 6 | Managed Marketing pre-booking 💰 | `services:managed_marketing` | `…CALL…` → E |
| 7 | Free AI Consultation MQL 💰 | `mql:ai-consulting` | `…CALL…` → C |
| 8 | AI Consulting pre-booking 💰 | `services:consulting` | `…CALL…` → F |
| 9 | Blueprint+ Strategy Activation | `session:pending` | `…CALL…` → A |
| 10 | Talk to an Expert follow-up | `call:expert-scheduled` | `…CALL…` → D |
| 11 | Cancellation recovery | any `*:canceled` | `…CALL…` → Shared |

> Non-snapshot leads enter #6 / #8 via `POST /api/services/interest` (see `…CALL…` → "Services interest endpoint").

---

## 2. ⚠️ Production signal reality check (READ FIRST)

The app emits signals through **three** different mechanisms. Only two are wired in production
right now:

| Mechanism | Env required | Prod status | Use for triggers? |
|---|---|---|---|
| **Contacts API** — tags, fields, list subscribe (`applyActiveCampaignTags`, `setContactFields`) | `ACTIVE_CAMPAIGN_API_KEY` + `_API_URL` | ✅ **LIVE** | ✅ Yes — trigger on **tags** |
| **Event Tracking** — site events (`trackActiveCampaignSiteEvent`) | `ACTIVE_CAMPAIGN_EVENT_TRACKING_KEY` + `_ACTID` | ✅ **LIVE** | ✅ Yes — trigger on **"event is recorded"** |
| **Legacy JSON webhook** — `fireACEvent()` | `ACTIVE_CAMPAIGN_WEBHOOK` | ❌ **OFF (unset)** | ❌ No — **these events do not fire** |

### What this means

**✅ Fires today (safe to build on):**

| Signal | Type | Emitted by |
|---|---|---|
| `snapshot:lead-email-captured` *(if applied via API)* | tag | lead capture |
| `snapshot_completed` | **event** (Event Tracking) | free snapshot generated |
| `purchased:snapshot` + `services:*`, `content:*`, `snapshot:business-type:*`, `snapshot:signal-missing:*` | tags | free snapshot generated |
| `purchased:snapshot-plus` / `purchased:blueprint` / `purchased:blueprint-plus` | tags | paid purchase |
| `intent:upgrade-blueprint` / `intent:upgrade-blueprint-plus` / `nurture:other-services` | tags | paid purchase |
| `onboarding:snapshot-plus` / `onboarding:blueprint` / `onboarding:blueprint-plus` | tags | paid purchase |
| `refresh:eligible` | tag | paid purchase |
| `session:pending` | tag | Blueprint+ purchase |
| `email:marketing-opted-in` / `-opted-out` / `-pending`, `content:*` | tags | opt-in choices |
| `checkout:abandoned` + `checkout:abandoned:{product_key}` | tags | checkout expired |

**✅ Now also fires (as of the 2026-07-28 "Option A" fix):**

The remaining `fireACEvent()`-only signals were rewired to the API + Event-Tracking path, so they
no longer depend on `ACTIVE_CAMPAIGN_WEBHOOK`:

| Signal | Type | How it fires now |
|---|---|---|
| **`report:{tier}-ready`** | tag | applied via Contacts API on purchase — **safe to trigger on** |
| `purchase_complete` | event | recorded via Event Tracking |
| `report_ready` | event | recorded via Event Tracking (`eventdata` = report link) |
| `refresh_report_ready` | event | recorded via Event Tracking |
| `snapshot_lead_capture` | event | recorded via Event Tracking (tag + list already applied via API) |
| `assessment_paused` | event + tags | tags applied via API + recorded via Event Tracking |

**📅 Calendly booking signals (as of 2026-07-28 — requires `CALENDLY_WEBHOOK_SECRET` + a registered subscription).** Each Calendly event type maps to its own session type with distinct tags/events, so sales calls can trigger sales workflows:

| Calendly event type | Booked tags | Booked event | Cancel tag | No-show tag |
|---|---|---|---|---|
| Brand Blueprint+ Strategy Activation Session | `session:activation-scheduled`, `session:booked` | `activation_session_booked` | `session:activation-canceled` | `session:activation-no-show` |
| **Talk to an Expert - Managed Marketing Consultation** | `services:managed-marketing-scheduled`, **`mql:managed-marketing`** | `managed_marketing_consult_booked` | `services:managed-marketing-canceled` | `services:managed-marketing-no-show` |
| **Free AI Consultation** | `services:ai-consulting-scheduled`, **`mql:ai-consulting`** | `ai_consulting_consult_booked` | `services:ai-consulting-canceled` | `services:ai-consulting-no-show` |
| Talk to an Expert (general) | `call:expert-scheduled` | `expert_call_booked` | `call:expert-canceled` | `call:expert-no-show` |

> All no-shows also get `noshow:needs-followup`. Booked tags are applied via the Contacts API and
> events recorded via Event Tracking — safe to trigger on. Fields `last_call_type` / `last_call_date`
> (and `last_noshow_type` / `last_noshow_date`) are set on the contact.

> The legacy JSON-webhook blocks were left in place (harmless no-ops unless
> `ACTIVE_CAMPAIGN_WEBHOOK` is ever set), so there's no double-send risk today.

**Recommendation:** prefer **tag-based** triggers where a tag exists (most reliable); use
"event is recorded" triggers for `snapshot_completed`, `report_ready`, etc. where you need the event.

---

## 3. Fields available for personalization

The app syncs these to the contact via the Contacts API (title-matched — the account already has
all of them). Full reference: `docs/ACTIVECAMPAIGN_AUTOMATIONS.md` §"Custom Field Reference".

> ⚠️ **Merge-tag gotcha (verified against the live AC account on 2026-07-28):** AC derives a field's
> personalization tag by uppercasing the title and **removing underscores** (spaces become underscores,
> but existing underscores are stripped). So `weakest_pillar` → `%WEAKESTPILLAR%` (NOT `%WEAKEST_PILLAR%`).
> Using the underscored form renders **blank**. Also beware: the account has **two** company fields —
> `Company Name` (`%COMPANY_NAME%`, id 4, *not written by the app*) and `company_name`
> (`%COMPANYNAME%`, id 117, *the one the app populates*). Always use `%COMPANYNAME%`.

**Verified merge tags** (field title → exact tag; these are the ones the app populates):

| Field (title) | Merge tag | Field (title) | Merge tag |
|---|---|---|---|
| `company_name` | `%COMPANYNAME%` | `report_link` | `%REPORTLINK%` |
| `brand_alignment_score` | `%BRANDALIGNMENTSCORE%` | `dashboard_link` | `%DASHBOARDLINK%` |
| `primary_pillar` | `%PRIMARYPILLAR%` | `resume_link` | `%RESUMELINK%` |
| `weakest_pillar` | `%WEAKESTPILLAR%` | `experience_survey_link` | `%EXPERIENCESURVEYLINK%` |
| `top_opportunities` | `%TOPOPPORTUNITIES%` | `product_purchased` | `%PRODUCTPURCHASED%` |
| `positioning_score` | `%POSITIONINGSCORE%` | `amount_paid` | `%AMOUNTPAID%` |
| `messaging_score` | `%MESSAGINGSCORE%` | `upgrade_product_name` | `%UPGRADEPRODUCTNAME%` |
| `visibility_score` | `%VISIBILITYSCORE%` | `upgrade_product_url` | `%UPGRADEPRODUCTURL%` |
| `credibility_score` | `%CREDIBILITYSCORE%` | `upgrade_price` | `%UPGRADEPRICE%` |
| `conversion_score` | `%CONVERSIONSCORE%` | `abandoned_product` | `%ABANDONEDPRODUCT%` |
| `business_type` | `%BUSINESSTYPE%` | `abandoned_product_url` | `%ABANDONEDPRODUCTURL%` |
| `refresh_price` | `%REFRESHPRICE%` | `abandoned_product_price` | `%ABANDONEDPRODUCTPRICE%` |
| `refresh_type` | `%REFRESHTYPE%` | first name (native) | `%FIRSTNAME%` |

*(`setContactFields` auto-creates any missing field as of the 2026-07-28 hardening, so new titles no longer drop silently — but the merge tag still won't resolve until at least one contact has been written with that field, so prefer the verified tags above.)*

> **Hyper-personalization (as of 2026-07-28):** `weakest_pillar` (the contact's top-opportunity
> pillar) and `top_opportunities` (a prose summary of their biggest opportunities, generated from
> their actual results) are now synced. Use `%TOPOPPORTUNITIES%` in upsell emails to quote the
> brand's real opportunities instead of generic per-pillar copy.
>
> Note: `report_link` / `report_id` / `dashboard_link` are populated on the free snapshot as of
> the 2026-07-28 fix. Purchase flows also set `report_link`, `product_purchased`, `amount_paid`, etc.

---

## 4. Priority launch automations

Ordered by revenue impact. Each is designed to trigger on a **tag that fires today** (§2).

### 4.1 — Free Snapshot → Snapshot+ upgrade nurture  ⭐ highest impact
- **Goal:** convert free snapshot leads to a paid tier ($497 Snapshot+ / $997 Blueprint).
- **Entry trigger:** tag `purchased:snapshot` is added. *(live)*
- **Exit goal:** any `purchased:snapshot-plus`/`blueprint`/`blueprint-plus` tag → remove from flow.
- **Personalization:** lead with `%PRIMARYPILLAR%` (their focus area) and `%BRANDALIGNMENTSCORE%`; quote `%TOPOPPORTUNITIES%`; CTA to `%UPGRADEPRODUCTURL%`.
- **Score segmentation (biggest conversion lever):** build three conditional-content variants keyed off
  `%BRANDALIGNMENTSCORE%` — 🔴 <60 (urgency / "money leaking"), 🟡 60–79 (momentum / "you're close"),
  🟢 ≥80 (ambition / "protect & scale"). Match the subject + opening line to the segment.
- **Copy source (recommended):** `docs/ACTIVECAMPAIGN_REVENUE_AUTOMATION_EMAILS.md` → Automation 4.1
  (personalized + score-segmented, verified merge tags). *(Legacy drafts: `EMAIL_5_SNAPSHOT_PLUS_INVITATION.md` et al. — note these use the old underscored merge tags and need the same fix before use.)*
- **Hyper-personalized snippet (drop into Email 1):**
  > Your WunderBrand Score™ is **%BRANDALIGNMENTSCORE%/100**, and your biggest opportunity right now is **%WEAKESTPILLAR%**. Based on your results: %TOPOPPORTUNITIES% — Snapshot+™ turns these into a step-by-step roadmap. [See your full results →](%UPGRADEPRODUCTURL%)
- **Flow:** Email 1 (immediate, results recap + what Snapshot+ adds) → wait 2d → Email 2 (education: what the weakest pillar is costing them) → wait 3d → Email 3 (value/proof) → wait 3d → Email 4 (soft CTA) → wait 4d → Email 5 (final reminder / scarcity).

**AI builder prompt:**
```
Create an automation named "Free Snapshot → Snapshot+ Upgrade".
Trigger: when the tag "purchased:snapshot" is added to a contact. Runs once per contact.
Goal (exit): contact is added any tag matching "purchased:snapshot-plus", "purchased:blueprint",
or "purchased:blueprint-plus" → they exit immediately.
Steps: send Email 1 now; wait 2 days; send Email 2; wait 3 days; send Email 3; wait 3 days;
send Email 4; wait 4 days; send Email 5; then end.
Personalize with %PRIMARYPILLAR%, %BRANDALIGNMENTSCORE%, %REPORTLINK%, %UPGRADEPRODUCTURL%,
%UPGRADEPRICE%. I will paste the 5 email bodies for each Send step.
```

### 4.2 — Abandoned checkout recovery  ⭐ high impact
- **Goal:** recover started-but-unpaid checkouts.
- **Entry trigger:** tag `checkout:abandoned` is added. *(live)*
- **Exit goal:** any `purchased:*` tag added.
- **Personalization:** `%ABANDONEDPRODUCT%`, `%ABANDONEDPRODUCTPRICE%`, CTA `%ABANDONEDPRODUCTURL%`.
- **Copy source (recommended):** `docs/ACTIVECAMPAIGN_REVENUE_AUTOMATION_EMAILS.md` → Automation 4.2. *(Legacy: `docs/EMAIL_CHECKOUT_ABANDONMENT.md`.)*
- **Flow:** Email 1 (1 hour later, "still interested?") → wait 1d → Email 2 (handle objection / reassurance) → wait 2d → Email 3 (final nudge, optional urgency).

**AI builder prompt:**
```
Create an automation named "Abandoned Checkout Recovery".
Trigger: when the tag "checkout:abandoned" is added. Runs once per contact; re-entry allowed.
Goal (exit): any tag starting with "purchased:" is added → exit.
Steps: wait 1 hour; send Email 1; wait 1 day; send Email 2; wait 2 days; send Email 3; end.
Personalize with %ABANDONEDPRODUCT%, %ABANDONEDPRODUCTPRICE%, %ABANDONEDPRODUCTURL%.
```

### 4.3 — Post-purchase onboarding / welcome
- **Goal:** activate the buyer, deliver next steps, reduce refunds.
- **Entry trigger:** tag `onboarding:snapshot-plus` (build one per tier, or a single flow entered by
  any `onboarding:*` tag with tier branching). *(live)*
- **Exit goal:** none (transactional); or refund tag `purchase:refunded`.
- **Personalization:** `%PRODUCTPURCHASED%`, `%DASHBOARDLINK%`, `%REPORTLINK%`.
- **Copy source:** `docs/EMAIL_BLUEPRINT_INVITATION.md` and product pages for tier specifics.
- **Flow:** Email 1 (immediate welcome + how to start/access) → wait 2d → Email 2 (get-the-most-out-of-it tips) → wait 5d → Email 3 (check-in + surface next tier).

**AI builder prompt:**
```
Create an automation named "Post-Purchase Onboarding".
Trigger: when any tag matching "onboarding:snapshot-plus", "onboarding:blueprint", or
"onboarding:blueprint-plus" is added. Runs once per contact.
Branch on the tier tag to swap product-specific copy.
Steps: send welcome Email 1 now; wait 2 days; send Email 2 (tips); wait 5 days; send Email 3
(check-in + next-tier CTA using %UPGRADEPRODUCTNAME% / %UPGRADEPRODUCTURL%); end.
Personalize with %PRODUCTPURCHASED%, %DASHBOARDLINK%, %REPORTLINK%.
```

### 4.4 — Upgrade ladder (Snapshot+ → Blueprint → Blueprint+)
- **Goal:** move customers up the $497 → $997 → $1,997 ladder (upgrade credits apply).
- **Entry trigger:** tag `intent:upgrade-blueprint` or `intent:upgrade-blueprint-plus`. *(live — applied at purchase)*
- **Exit goal:** the corresponding `purchased:*` tag for the target tier.
- **Personalization:** `%UPGRADEPRODUCTNAME%`, `%UPGRADEPRICE%`, `%UPGRADEPRODUCTURL%`.
- **Flow:** wait 3d after purchase → Email 1 (what the next tier unlocks + credit) → wait 5d → Email 2 (proof/ROI) → wait 7d → Email 3 (offer/limited credit reminder).

**AI builder prompt:**
```
Create an automation named "Upgrade Ladder".
Trigger: when the tag "intent:upgrade-blueprint" OR "intent:upgrade-blueprint-plus" is added.
Goal (exit): the matching "purchased:blueprint" / "purchased:blueprint-plus" tag is added.
Steps: wait 3 days; send Email 1; wait 5 days; send Email 2; wait 7 days; send Email 3; end.
Personalize with %UPGRADEPRODUCTNAME%, %UPGRADEPRICE%, %UPGRADEPRODUCTURL%.
```

### 4.5 — Refund / payment-failed recovery
- **Goal:** win back refunds and recover failed payments.
- **Entry trigger:** tag `payment:failed` (recover) or `purchase:refunded` (win-back). *(payment:failed & refund tags applied via API)*
- **Flow (payment:failed):** Email 1 (payment issue, retry link) → wait 1d → Email 2 (help/assist).
- **Flow (refunded):** wait 3d → Email 1 (feedback ask + soft door-open).

**AI builder prompt:**
```
Create two automations: "Payment Failed Recovery" (trigger tag "payment:failed": send retry email
now, wait 1 day, send help email) and "Refund Win-Back" (trigger tag "purchase:refunded": wait 3
days, send a feedback + re-engagement email).
```

### 4.6 — Quarterly refresh reminders
- **Goal:** drive $47/$97 quarterly refresh revenue.
- **Entry trigger:** tag `refresh:eligible` (applied at purchase). *(live)* The app's refresh-reminder
  cron also manages `refresh:60-day-reminder` / `30-day` / `7-day` timing if you prefer time-based.
- **Personalization:** `%REFRESHPRICE%`, `%REFRESHTYPE%`, `%REPORTLINK%`.
- **Flow:** wait ~75–90 days → Email 1 (your brand has moved — refresh) → wait 7d → Email 2 (reminder) → wait 7d → Email 3 (last call before window closes).

**AI builder prompt:**
```
Create an automation named "Quarterly Refresh Reminder".
Trigger: when the tag "refresh:eligible" is added.
Steps: wait 75 days; send Email 1; wait 7 days; send Email 2; wait 7 days; send Email 3; end.
Goal (exit): a refresh purchase tag ("purchased:snapshot-plus-refresh" / "purchased:blueprint-refresh").
Personalize with %REFRESHPRICE%, %REFRESHTYPE%, %REPORTLINK%.
```

### 4.7 — Content opt-in welcome / newsletter
- **Goal:** nurture non-buyers who opted into content; stay top-of-mind.
- **Entry trigger:** tag `content:opted_in` (and topic tags `content:marketing_trends` / `content:ai_updates`). *(live)*
- **Flow:** Email 1 (welcome + best resource) → wait 4d → Email 2 (topic-relevant value) → hand off to ongoing newsletter.

**AI builder prompt:**
```
Create an automation named "Content Opt-In Welcome".
Trigger: when the tag "content:opted_in" is added. Branch on "content:marketing_trends" vs
"content:ai_updates" for topic-specific copy.
Steps: send welcome Email 1 now; wait 4 days; send Email 2; then add tag "nurture:newsletter" and end.
```

### 4.8 — Report Ready (paid report delivery)
- **Goal:** deliver the finished report and drive the experience survey + next-tier CTA.
- **Entry trigger:** tag `report:snapshot-plus-ready` / `report:blueprint-ready` / `report:blueprint-plus-ready`. *(live as of the 2026-07-28 fix — applied via API)* You can also trigger on the `report_ready` **event**.
- **Personalization:** `%REPORTLINK%`, `%PRODUCTPURCHASED%`, `%EXPERIENCESURVEYLINK%`, `%UPGRADEPRODUCTURL%`.
- **Copy source (recommended):** `docs/ACTIVECAMPAIGN_REVENUE_AUTOMATION_EMAILS.md` → Automation 4.8.
- **Flow:** Email 1 (immediate — "your report is ready", link) → wait 2d → Email 2 (highlight a key finding + experience survey) → wait 5d → Email 3 (next-tier CTA).

**AI builder prompt:**
```
Create an automation named "Report Ready".
Trigger: when any tag matching "report:snapshot-plus-ready", "report:blueprint-ready", or
"report:blueprint-plus-ready" is added. Runs once per contact.
Steps: send Email 1 now (report link); wait 2 days; send Email 2 (key finding + %EXPERIENCESURVEYLINK%);
wait 5 days; send Email 3 (next tier via %UPGRADEPRODUCTURL%); end.
Personalize with %REPORTLINK%, %PRODUCTPURCHASED%, %EXPERIENCESURVEYLINK%, %UPGRADEPRODUCTURL%.
```

### 4.9 — Blueprint+ Strategy Activation Session: booking + priming
- **Goal:** get Blueprint+ buyers to **book and attend** their included 30-min session (this is where the strategist pitches managed services), and prime them so the call converts.
- **Entry trigger:** tag `session:pending` (added on Blueprint+ purchase) OR `report:blueprint-plus-ready`.
- **Booking exit signal:** tag `session:activation-scheduled` (Calendly `invitee.created`) → move to the priming branch; stop reminders.
- **Flow (not-yet-booked branch):** Email 1 (immediate — "your complimentary strategy session is ready", scheduling link) → wait 3d if no `session:activation-scheduled` → Email 2 (value of the session) → wait 4d → Email 3 (last nudge).
- **Flow (booked / priming branch, trigger `session:activation-scheduled`):** send a "make the most of your session" email that surfaces `%WEAKESTPILLAR%` + `%TOPOPPORTUNITIES%` and asks 1–2 qualifying questions (biggest goal this quarter, internal capacity to execute?). This raises show-rate and hands the strategist a warm lead.
- **No-show branch:** trigger `session:activation-no-show` → 1 re-book email.
- **Scheduling link:** `https://calendly.com/claudine-wunderbardigital/brand-blueprint-strategy-activation-session`

**AI builder prompt:**
```
Create an automation named "Blueprint+ Activation Session — Book & Prime".
Trigger: when the tag "session:pending" is added.
Steps: send Email 1 now (scheduling link). Wait 3 days. If tag "session:activation-scheduled"
is NOT present, send Email 2; wait 4 days; if still not scheduled, send Email 3; end.
Create a second automation "Activation Session — Pre-call Priming":
Trigger: when the tag "session:activation-scheduled" is added. Send a prep email personalized with
%WEAKESTPILLAR% and %TOPOPPORTUNITIES%; end.
```

### 4.10 — Managed Marketing Consultation (hot MQL → sales)  💰
- **Goal:** a booking here is a bottom-of-funnel managed-services lead — get sales to it fast and warm them for the call. The **sale stays human**; the automation only supports it.
- **Entry trigger:** tag `mql:managed-marketing` (Calendly "Talk to an Expert - Managed Marketing Consultation" booked).
- **Suppression:** on entry, **remove the contact from all product-nurture flows** (they're past that) via an "exit goal" / tag check.
- **Flow:** Email 1 (immediate — confirmation + what to bring, personalized with `%TOPOPPORTUNITIES%`) → internal: notify sales owner (Slack disposition prompt already fires via the webhook; also add the contact to a "Managed Marketing — Sales" list for the owner digest). Post-call follow-up handled by the strategist / a short proposal sequence.
- **No-show branch:** trigger `services:managed-marketing-no-show` → sales-priority re-book email (not the generic drip).

**AI builder prompt:**
```
Create an automation named "Managed Marketing Consult — Sales Assist".
Trigger: when the tag "mql:managed-marketing" is added.
Steps: remove from product-nurture automations; add to list "Managed Marketing — Sales";
send Email 1 now (confirmation + prep, personalized with %TOPOPPORTUNITIES%); end.
Create "Managed Marketing — No-show Rebook": trigger tag "services:managed-marketing-no-show";
send 1 re-book email; end.
```

### 4.11 — Free AI Consultation (hot MQL → AI consulting)  💰
- **Goal:** same shape as 4.10 for the AI consulting line.
- **Entry trigger:** tag `mql:ai-consulting` (Calendly "Free AI Consultation" booked).
- **Flow:** suppress product nurture; add to list "AI Consulting — Sales"; Email 1 (confirmation + prep); human follow-up. No-show → `services:ai-consulting-no-show` re-book email.

**AI builder prompt:**
```
Create an automation named "AI Consulting Consult — Sales Assist".
Trigger: when the tag "mql:ai-consulting" is added.
Steps: remove from product-nurture automations; add to list "AI Consulting — Sales";
send Email 1 now (confirmation + prep); end.
Create "AI Consulting — No-show Rebook": trigger tag "services:ai-consulting-no-show";
send 1 re-book email; end.
```

### 4.12 — Managed Marketing pre-booking interest nurture  💰
- **Goal:** get interested-but-not-booked contacts to book the Managed Marketing consultation. Goals-first;
  the snapshot is an optional aside only.
- **Entry trigger:** tag `services:managed_marketing` (already applied to snapshot-completers who choose
  managed marketing; for non-snapshot leads, apply the same tag on a tracked CTA — not yet wired).
- **Exit goal:** tag `mql:managed-marketing` (they booked → Automation 4.10 takes over); also exit on any
  `purchased:*` paid tag.
- **Flow:** 3 emails (immediate / +3d / +6d), each a soft "book the call" focused on their business goals.
  Copy: `docs/ACTIVECAMPAIGN_CALL_AUTOMATION_EMAILS.md` → **Automation E**.

**AI builder prompt:**
```
Create an automation named "Managed Marketing — Pre-Booking Nurture".
Trigger: when the tag "services:managed_marketing" is added.
Exit goal: tag "mql:managed-marketing" is added (also exit if any tag starting "purchased:" is added).
Steps: Email 1 now; wait 3 days; if goal not met, Email 2; wait 3 days; if goal not met, Email 3; end.
```

### 4.13 — Brand Education series ("The Brand Growth Series")  📚
- **Goal:** trust + usefulness (NOT conversion). Teach why brand drives growth and retention; earn the
  right to sell elsewhere in the funnel. Soft snapshot/reply CTAs only.
- **Entry trigger:** tag `nurture:brand-education` (apply on snapshot lead capture for non-buyers, and on
  newsletter/education opt-ins).
- **Cadence:** 7 evergreen lessons, one every 5–7 days. E1 frames it; E2–E6 = one pillar each
  (Positioning, Messaging, Visibility, Credibility, Conversion); E7 = retention/advocacy + softest ask.
- **Suppression:** pause while a contact is in an active call/booking sequence (has `session:pending` /
  `mql:*`); **exit** on any `purchased:*` tag (move to onboarding/retention).
- **Copy:** `docs/ACTIVECAMPAIGN_BRAND_EDUCATION_NURTURE.md`.

**AI builder prompt:**
```
Create an automation named "Brand Growth Series (Education)".
Trigger: when the tag "nurture:brand-education" is added.
Exit: if any tag starting with "purchased:" is added, remove from this automation.
Steps: send Education Email 1 now; wait 7 days; send Email 2; ... repeat through Email 7 (7-day waits); end.
Before each send, if the contact has tag "session:pending" or any "mql:" tag, wait 1 day, then continue.
```

---

## 5. Segments worth creating (for broadcasts)

- **Hot leads:** has `purchased:snapshot`, no `purchased:snapshot-plus/blueprint/blueprint-plus`,
  `brand_alignment_score` < 60.
- **By focus area:** `primary_pillar` = messaging / positioning / etc. (targeted tips).
- **Services-interested:** has `services:interested` / `services:managed_marketing` / `services:consulting`.
- **Customers:** any `purchased:*` paid tag (retention + cross-sell).
- **Refresh-due:** `refresh:eligible` older than 75 days (if not using the automation timing).

---

## 6. QA / test plan

1. Create a test contact; apply each entry tag manually in AC and confirm the automation starts.
2. For `snapshot_completed`, confirm Event Tracking is receiving events
   (AC → Reports → Event Tracking) after a real free snapshot.
3. Run one real low-value purchase (or Stripe test) end-to-end and confirm:
   `purchased:*`, `onboarding:*`, `refresh:eligible`, `intent:upgrade-*` tags all appear, and
   contact fields (`product_name`, `amount_paid`, `report_link`) populate.
4. Confirm exit goals actually remove converters from nurture flows (no double-emailing buyers).
5. Verify all sends come from **Wunderbar Digital** on `wunderbardigital.com`.

---

## 7. Related docs

- `docs/ACTIVECAMPAIGN_AUTOMATIONS.md` — field/tag/event reference + session/call flows.
- `docs/NURTURE_IMPLEMENTATION_GUIDE.md` — the full 19-sequence catalog (copy + timing).
- `docs/EMAIL_*.md` — ready email copy for the automations above.
- `docs/ACTIVECAMPAIGN_COMPLETE_SETUP.md` — field creation reference.

> ⚠️ The numeric `AC_FIELD_*` env vars in older setup docs are **stale** (the account was rebuilt to
> title-matched fields). The app now syncs fields by **title**, so those numeric IDs are ignored —
> do not rely on them.
