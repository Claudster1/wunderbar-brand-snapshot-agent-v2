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

> The legacy JSON-webhook blocks were left in place (harmless no-ops unless
> `ACTIVE_CAMPAIGN_WEBHOOK` is ever set), so there's no double-send risk today.

**Recommendation:** prefer **tag-based** triggers where a tag exists (most reliable); use
"event is recorded" triggers for `snapshot_completed`, `report_ready`, etc. where you need the event.

---

## 3. Fields available for personalization

The app syncs these to the contact via the Contacts API (title-matched — the account already has
all of them). Full reference: `docs/ACTIVECAMPAIGN_AUTOMATIONS.md` §"Custom Field Reference".

Highlights you'll use most (merge tags are `%FIELD_TITLE_UPPERCASED%`):
`company_name`, `report_link`, `report_id`, `dashboard_link`, `brand_alignment_score`,
`positioning_score`, `messaging_score`, `visibility_score`, `credibility_score`,
`conversion_score`, `primary_pillar`, **`weakest_pillar`**, **`top_opportunities`**,
`experience_survey_link`, `business_type`,
`product_name`, `product_key`, `purchase_date`, `amount_paid`, `upgrade_product_name`,
`upgrade_product_url`, `upgrade_price`, `abandoned_product`, `abandoned_product_url`,
`abandoned_product_price`, `refresh_price`, `refresh_type`.

> **Hyper-personalization (as of 2026-07-28):** `weakest_pillar` (the contact's top-opportunity
> pillar) and `top_opportunities` (a prose summary of their biggest opportunities, generated from
> their actual results) are now synced. Use `%TOP_OPPORTUNITIES%` in upsell emails to quote the
> brand's real opportunities instead of generic per-pillar copy.
>
> Note: `report_link` / `report_id` / `dashboard_link` are populated on the free snapshot as of
> the 2026-07-28 fix. Purchase flows also set `report_link`, `product_name`, `amount_paid`, etc.

---

## 4. Priority launch automations

Ordered by revenue impact. Each is designed to trigger on a **tag that fires today** (§2).

### 4.1 — Free Snapshot → Snapshot+ upgrade nurture  ⭐ highest impact
- **Goal:** convert free snapshot leads to a paid tier ($497 Snapshot+ / $997 Blueprint).
- **Entry trigger:** tag `purchased:snapshot` is added. *(live)*
- **Exit goal:** any `purchased:snapshot-plus`/`blueprint`/`blueprint-plus` tag → remove from flow.
- **Personalization:** lead with `%PRIMARY_PILLAR%` (their focus area) and `%BRAND_ALIGNMENT_SCORE%`; quote `%TOP_OPPORTUNITIES%`; CTA to `%UPGRADE_PRODUCT_URL%`.
- **Copy source:** `docs/EMAIL_5_SNAPSHOT_PLUS_INVITATION.md`, `EMAIL_6_SNAPSHOT_PLUS_EDUCATION.md`, `EMAIL_SNAPSHOT_PLUS_VALUE.md`, `EMAIL_SNAPSHOT_PLUS_FOLLOWUP.md`, `EMAIL_7_FINAL_REMINDER.md`.
- **Hyper-personalized snippet (drop into Email 1):**
  > Your WunderBrand Score™ is **%BRAND_ALIGNMENT_SCORE%/100**, and your biggest opportunity right now is **%WEAKEST_PILLAR%**. Based on your results: %TOP_OPPORTUNITIES% — Snapshot+™ turns these into a step-by-step roadmap. [See your full results →](%UPGRADE_PRODUCT_URL%)
- **Flow:** Email 1 (immediate, results recap + what Snapshot+ adds) → wait 2d → Email 2 (education: what the weakest pillar is costing them) → wait 3d → Email 3 (value/proof) → wait 3d → Email 4 (soft CTA) → wait 4d → Email 5 (final reminder / scarcity).

**AI builder prompt:**
```
Create an automation named "Free Snapshot → Snapshot+ Upgrade".
Trigger: when the tag "purchased:snapshot" is added to a contact. Runs once per contact.
Goal (exit): contact is added any tag matching "purchased:snapshot-plus", "purchased:blueprint",
or "purchased:blueprint-plus" → they exit immediately.
Steps: send Email 1 now; wait 2 days; send Email 2; wait 3 days; send Email 3; wait 3 days;
send Email 4; wait 4 days; send Email 5; then end.
Personalize with %PRIMARY_PILLAR%, %BRAND_ALIGNMENT_SCORE%, %REPORT_LINK%, %UPGRADE_PRODUCT_URL%,
%UPGRADE_PRICE%. I will paste the 5 email bodies for each Send step.
```

### 4.2 — Abandoned checkout recovery  ⭐ high impact
- **Goal:** recover started-but-unpaid checkouts.
- **Entry trigger:** tag `checkout:abandoned` is added. *(live)*
- **Exit goal:** any `purchased:*` tag added.
- **Personalization:** `%ABANDONED_PRODUCT%`, `%ABANDONED_PRODUCT_PRICE%`, CTA `%ABANDONED_PRODUCT_URL%`.
- **Copy source:** `docs/EMAIL_CHECKOUT_ABANDONMENT.md`.
- **Flow:** Email 1 (1 hour later, "still interested?") → wait 1d → Email 2 (handle objection / reassurance) → wait 2d → Email 3 (final nudge, optional urgency).

**AI builder prompt:**
```
Create an automation named "Abandoned Checkout Recovery".
Trigger: when the tag "checkout:abandoned" is added. Runs once per contact; re-entry allowed.
Goal (exit): any tag starting with "purchased:" is added → exit.
Steps: wait 1 hour; send Email 1; wait 1 day; send Email 2; wait 2 days; send Email 3; end.
Personalize with %ABANDONED_PRODUCT%, %ABANDONED_PRODUCT_PRICE%, %ABANDONED_PRODUCT_URL%.
```

### 4.3 — Post-purchase onboarding / welcome
- **Goal:** activate the buyer, deliver next steps, reduce refunds.
- **Entry trigger:** tag `onboarding:snapshot-plus` (build one per tier, or a single flow entered by
  any `onboarding:*` tag with tier branching). *(live)*
- **Exit goal:** none (transactional); or refund tag `purchase:refunded`.
- **Personalization:** `%PRODUCT_NAME%`, `%DASHBOARD_LINK%`, `%REPORT_LINK%`.
- **Copy source:** `docs/EMAIL_BLUEPRINT_INVITATION.md` and product pages for tier specifics.
- **Flow:** Email 1 (immediate welcome + how to start/access) → wait 2d → Email 2 (get-the-most-out-of-it tips) → wait 5d → Email 3 (check-in + surface next tier).

**AI builder prompt:**
```
Create an automation named "Post-Purchase Onboarding".
Trigger: when any tag matching "onboarding:snapshot-plus", "onboarding:blueprint", or
"onboarding:blueprint-plus" is added. Runs once per contact.
Branch on the tier tag to swap product-specific copy.
Steps: send welcome Email 1 now; wait 2 days; send Email 2 (tips); wait 5 days; send Email 3
(check-in + next-tier CTA using %UPGRADE_PRODUCT_NAME% / %UPGRADE_PRODUCT_URL%); end.
Personalize with %PRODUCT_NAME%, %DASHBOARD_LINK%, %REPORT_LINK%.
```

### 4.4 — Upgrade ladder (Snapshot+ → Blueprint → Blueprint+)
- **Goal:** move customers up the $497 → $997 → $1,997 ladder (upgrade credits apply).
- **Entry trigger:** tag `intent:upgrade-blueprint` or `intent:upgrade-blueprint-plus`. *(live — applied at purchase)*
- **Exit goal:** the corresponding `purchased:*` tag for the target tier.
- **Personalization:** `%UPGRADE_PRODUCT_NAME%`, `%UPGRADE_PRICE%`, `%UPGRADE_PRODUCT_URL%`.
- **Flow:** wait 3d after purchase → Email 1 (what the next tier unlocks + credit) → wait 5d → Email 2 (proof/ROI) → wait 7d → Email 3 (offer/limited credit reminder).

**AI builder prompt:**
```
Create an automation named "Upgrade Ladder".
Trigger: when the tag "intent:upgrade-blueprint" OR "intent:upgrade-blueprint-plus" is added.
Goal (exit): the matching "purchased:blueprint" / "purchased:blueprint-plus" tag is added.
Steps: wait 3 days; send Email 1; wait 5 days; send Email 2; wait 7 days; send Email 3; end.
Personalize with %UPGRADE_PRODUCT_NAME%, %UPGRADE_PRICE%, %UPGRADE_PRODUCT_URL%.
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
- **Personalization:** `%REFRESH_PRICE%`, `%REFRESH_TYPE%`, `%REPORT_LINK%`.
- **Flow:** wait ~75–90 days → Email 1 (your brand has moved — refresh) → wait 7d → Email 2 (reminder) → wait 7d → Email 3 (last call before window closes).

**AI builder prompt:**
```
Create an automation named "Quarterly Refresh Reminder".
Trigger: when the tag "refresh:eligible" is added.
Steps: wait 75 days; send Email 1; wait 7 days; send Email 2; wait 7 days; send Email 3; end.
Goal (exit): a refresh purchase tag ("purchased:snapshot-plus-refresh" / "purchased:blueprint-refresh").
Personalize with %REFRESH_PRICE%, %REFRESH_TYPE%, %REPORT_LINK%.
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
- **Personalization:** `%REPORT_LINK%`, `%PRODUCT_NAME%`, `%EXPERIENCE_SURVEY_LINK%`, `%UPGRADE_PRODUCT_URL%`.
- **Flow:** Email 1 (immediate — "your report is ready", link) → wait 2d → Email 2 (highlight a key finding + experience survey) → wait 5d → Email 3 (next-tier CTA).

**AI builder prompt:**
```
Create an automation named "Report Ready".
Trigger: when any tag matching "report:snapshot-plus-ready", "report:blueprint-ready", or
"report:blueprint-plus-ready" is added. Runs once per contact.
Steps: send Email 1 now (report link); wait 2 days; send Email 2 (key finding + %EXPERIENCE_SURVEY_LINK%);
wait 5 days; send Email 3 (next tier via %UPGRADE_PRODUCT_URL%); end.
Personalize with %REPORT_LINK%, %PRODUCT_NAME%, %EXPERIENCE_SURVEY_LINK%, %UPGRADE_PRODUCT_URL%.
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
