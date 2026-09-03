# ActiveCampaign — Purchase Access & Start Reminders

Operator checklist for the **post-purchase access** flow that ships with the app
(Resend confirmation + 90-day claim link + day 2/7/21 start reminders).

The app already writes tags/fields. You configure AC automations to **use** them
(and avoid duplicate “start now” emails).

---

## What the app sends (already live in code)

### On paid purchase (`checkout.session.completed`)

| Kind | Value |
|------|--------|
| Tags | `purchased:{tier}`, `onboarding:{tier}`, **`onboarding:awaiting-start`**, upgrade intent tags, `refresh:eligible`, … |
| Fields | `product_purchased`, `product_key`, **`access_claim_link`**, **`start_diagnostic_link`** (same URL), `dashboard_link`, `purchased_brand_name`, copy fields, … |
| Events | `purchase_complete`, **`start_diagnostic`**, `report_ready` (site event + optional JSON webhook) |
| Email | **Resend** transactional confirmation (does not require AC) |

`access_claim_link` / `start_diagnostic_link` are the **90-day one-click claim URL**
(`https://app.wunderbrand.ai/api/access/claim?token=…`).

### On incomplete purchase (cron, if still `fulfilled=false`)

| Day | Tag | Event | Email |
|-----|-----|-------|-------|
| ~2 | `reminder:purchase-start-2d` | `purchase_start_reminder_2d` | Resend nudge |
| ~7 | `reminder:purchase-start-7d` | `purchase_start_reminder_7d` | Resend nudge |
| ~21 | `reminder:purchase-start-21d` | `purchase_start_reminder_21d` | Resend nudge |

### On diagnostic complete (`/api/snapshot/complete`)

| Kind | Value |
|------|--------|
| Remove tags | `onboarding:awaiting-start`, `reminder:purchase-start-2d`, `reminder:purchase-start-7d`, `reminder:purchase-start-21d` |
| Apply tag | **`diagnostic:completed`** |
| Events | `diagnostic_completed` (JSON webhook + site event) |

---

## AC Dashboard — do this once

### 1) Confirm custom fields exist

Settings → Fields. Titles must match exactly (app auto-creates missing ones on first write, but verify):

- `access_claim_link`
- `start_diagnostic_link`
- `dashboard_link`
- `product_purchased`
- `product_key`
- `purchased_brand_name`
- `email_button_label` (optional)

In email templates, use the personalization dropdown for those fields
(e.g. `%ACCESS_CLAIM_LINK%` / whatever AC shows for `access_claim_link`).

### 2) Confirm tags exist

Settings → Tags (exact spelling):

- `onboarding:awaiting-start`
- `diagnostic:completed`
- `reminder:purchase-start-2d`
- `reminder:purchase-start-7d`
- `reminder:purchase-start-21d`
- existing `onboarding:snapshot-plus` / `onboarding:blueprint` / `onboarding:blueprint-plus`

### 3) Update “Post-Purchase Onboarding” automation

**Goal:** welcome + access CTA only. **Do not** build wait-2d / wait-7d “start now”
emails in AC — the **app Resend cron** owns those (avoids double emails).

**Recommended flow:**

1. **Trigger:** Tag added `onboarding:awaiting-start`  
   *(or keep tier `onboarding:snapshot-plus|blueprint|blueprint-plus` and branch)*
2. **Goal (exit):** Tag added `diagnostic:completed`  
   *(also exit if `onboarding:awaiting-start` is removed)*
3. **Email 1 (immediate):** Welcome + primary CTA = **`%ACCESS_CLAIM_LINK%`**  
   (fallback `%START_DIAGNOSTIC_LINK%` / `%DASHBOARD_LINK%`)
4. **Optional Email 2 (tips only):** Wait 3–4 days **IF** contact still has
   `onboarding:awaiting-start` — education only, still CTA to claim link.  
   **Do not** say “last chance” (day-21 Resend covers urgency).
5. End / jump to upgrade ladder only after `diagnostic:completed` if desired.

**AI builder prompt (paste into AC):**

```
Update automation "Post-Purchase Onboarding".
Trigger: tag "onboarding:awaiting-start" is added (runs once per contact).
Goal / exit: tag "diagnostic:completed" is added OR tag "onboarding:awaiting-start" is removed.
Steps:
1) Send Email 1 immediately — welcome + reinforce purchase. Primary button URL =
   personalization field access_claim_link (fallback start_diagnostic_link).
   Also show dashboard_link and product_purchased.
2) Wait 4 days. Condition: contact STILL has tag onboarding:awaiting-start.
   If yes, send Email 2 — short tips only (checklist / how it works), same claim-link CTA.
   If no (completed), end.
3) End. Do NOT send day-2/day-7/day-21 "start now" reminders — the app sends those via Resend.
```

### 4) Reminder tags (optional — scoring / CRM only)

Because Resend already sends the reminder emails:

- **Do not** create automations that send email on
  `reminder:purchase-start-2d|7d|21d` (duplicate).
- **Optional:** on those tags → add a deal note, increase lead score, or Slack notify sales.

If you prefer AC-branded reminder copy instead of Resend later, turn off the app cron
emails first, then trigger AC from those tags.

### 5) Completion handoff

Automation **“Diagnostic Completed”** (optional):

- Trigger: tag `diagnostic:completed` **or** event `diagnostic_completed`
- Send “your results / next steps” if not already covered by `report_ready`
- Enter upgrade ladder / Blueprint+ session booking as appropriate

---

## Smoke test

1. Test purchase (or tag a test contact with `onboarding:awaiting-start` + set `access_claim_link`).
2. Confirm Email 1 uses the claim URL (opens `/api/access/claim` → paid chat).
3. Complete diagnostic → tag flips to `diagnostic:completed`; awaiting-start + reminder tags removed; onboarding automation exits.
4. Leave a test purchase unfulfilled → after cron windows, Resend reminders fire and reminder tags appear (no AC duplicate email).

---

## Related docs

- [ACTIVECAMPAIGN_AI_BUILDER_BRIEF.md](./ACTIVECAMPAIGN_AI_BUILDER_BRIEF.md) §4.3
- [STRIPE_ACTIVECAMPAIGN_CHECKLIST.md](./STRIPE_ACTIVECAMPAIGN_CHECKLIST.md)
- [ACTIVECAMPAIGN_AUTOMATIONS.md](./ACTIVECAMPAIGN_AUTOMATIONS.md)
