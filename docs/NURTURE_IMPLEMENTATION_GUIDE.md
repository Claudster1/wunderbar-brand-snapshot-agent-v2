# WunderBrand Nurture Sequences — Implementation Guide

> Single source of truth for building all 19 nurture automations in ActiveCampaign.
> Production copy lives in the batch documents. This guide covers triggers, tags, merge fields, timing, and build notes.

---

## Sequence Map

| # | Name | Trigger | Emails | Exit Condition |
|---|------|---------|--------|----------------|
| 1 | Free Snapshot → Snapshot+ Upgrade | `purchased:snapshot` + `intent:upgrade-snapshot-plus` | 5 | `purchased:snapshot-plus` |
| 2 | Checkout Abandoned | `checkout:abandoned` + product tag | 3 | Any `purchased:*` for that product |
| 3 | Coverage Gap Nudge | `snapshot:coverage-gap` | 2 | `purchased:snapshot-plus` |
| 4 | Purchase Welcome — Start Your Diagnostic | Event `start_diagnostic` with `product_key` | 4 per variant (S+/B/B+) | `report:*-ready` tag |
| 5 | Report Ready — Here Are Your Results | `report:*-ready` tag | 3 per variant (S+/B/B+) | Runs to completion |
| 6 | Snapshot+ → Blueprint Upgrade | `intent:upgrade-blueprint` | 4 | `purchased:blueprint` |
| 7 | Blueprint → Blueprint+ Upgrade | `intent:upgrade-blueprint-plus` | 4 | `purchased:blueprint-plus` |
| 8 | Quarterly Refresh | `refresh:eligible` (90 days after report) | 3 | New diagnostic or purchase |
| 9 | Diagnostic Paused — Save & Exit | `snapshot:paused` + `snapshot:resume-link-sent` | 3 | `completed:snapshot` or `report:*-ready` |
| 10 | Session No-Show Recovery | `noshow:needs-followup` + no-show tag | 2 | Rescheduled (`call:expert-scheduled` or `session:activation-scheduled`) |
| 11 | Experience Score Follow-up | `experience:promoter` / `passive` / `detractor` | 2 per branch (3 branches) | Runs to completion |
| 12 | Blueprint+ Strategy Activation Session Booking | `session:pending` + `report:blueprint-plus-ready` | 3 | `session:activation-scheduled` |
| 13 | Services Interest — Managed Marketing | `intent:services` | 2 | `services:call-booked` or `services:client-active` |
| 14 | Content Opt-In Welcome | `content:opt-in` | 2 | Runs to completion → Seq 15 |
| 15 | Evergreen Education | Exits Seq 1/2/3/6/7 without conversion, or Seq 14 completes | 10 | Any `purchased:*` |
| 16 | It's Wunderbar — The Newsletter | `content:opted_in` (after Seq 14/15) | Ongoing (4 samples) | Unsubscribe |
| 17 | Customer Retention — Brand Momentum Series | 30 days after `report:*-ready`, no active upgrade seq | 8 | `purchased:*` / `services:expert_call_requested` / `call:expert-scheduled` |
| 18 | Win-Back — Lapsed Customers | 90+ days since report, no refresh, no engagement | 3 | `purchased:*` / `snapshot:viewed-results` / `call:expert-scheduled` |
| 19 | Services Warm-Up — Cross-Sell | 45+ days as customer + signal tag | 4 | `call:expert-scheduled` or manual removal |

---

## Sequence Flow

```
Free Snapshot → Seq 1 (upgrade to S+) → [converts] → Seq 4 (welcome) → Seq 5 (report ready) → Seq 6 (upgrade to B)
                                        → [no convert] → Seq 15 (evergreen education) → Seq 16 (newsletter)

Paid Purchase → Seq 4 (welcome) → Seq 5 (report ready) → Seq 6/7 (upgrade)
                                                          → Seq 11 (experience survey follow-up)
                                                          → Seq 8 (quarterly refresh, 90 days)
                                                          → Seq 17 (retention, 30 days)

Blueprint+ → Seq 12 (session booking) → Seq 19 (services cross-sell)

Abandoned Cart → Seq 2 → [no convert] → Seq 15

Coverage Gap → Seq 3 → [no convert] → Seq 1 or Seq 15

Paused Diagnostic → Seq 9

No-Show → Seq 10

Lapsed (90+ days) → Seq 18 → [no convert] → Seq 15

Content Opt-in → Seq 14 → Seq 15 → Seq 16
```

---

## Sequence Details

### SEQUENCE 1: Free Snapshot → Snapshot+ Upgrade
- **Trigger:** Tags `purchased:snapshot` + `intent:upgrade-snapshot-plus`
- **Timing:** Email 1 at +1 hour, Email 2 at +2 days, Email 3 at +5 days, Email 4 at +9 days, Email 5 at +14 days
- **Exit:** `purchased:snapshot-plus`
- **Sender:** All emails: Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
- **Merge fields:** `%FIRSTNAME%`, `%COMPANY_NAME%`, `%BRAND_ALIGNMENT_SCORE%`, `%POSITIONING_SCORE%`, `%MESSAGING_SCORE%`, `%VISIBILITY_SCORE%`, `%CREDIBILITY_SCORE%`, `%CONVERSION_SCORE%`, `%PRIMARY_PILLAR%`, `%REPORT_LINK%`, `%UPGRADE_PRODUCT_URL%`
- **Dynamic content:** Email 2 uses 5 conditional blocks keyed to `%PRIMARY_PILLAR%` value
- **On exit without conversion:** Move to Sequence 15 (Evergreen Education)
- **Salutation fallback:** Hi there,

### SEQUENCE 2: Checkout Abandoned
- **Trigger:** Tag `checkout:abandoned` + product-specific tag
- **Timing:** Email 1 at +30 min, Email 2 at +24 hours, Email 3 at +3 days
- **Exit:** Any `purchased:*` tag for the abandoned product
- **Sender:** Emails 1–2: Claudine | claudine@. Email 3: Wunderbar Digital | support@wunderbardigital.com
- **Merge fields:** `%FIRSTNAME%`, `%ABANDONED_PRODUCT%`, `%ABANDONED_PRODUCT_URL%`
- **Dynamic content:** Email 2 uses conditional block keyed to `product_key` (snapshot_plus/blueprint/blueprint_plus)
- **On exit without conversion:** Move to Sequence 15
- **Salutation fallback:** Hi there,

### SEQUENCE 3: Coverage Gap Nudge
- **Trigger:** Tag `snapshot:coverage-gap`
- **Timing:** Email 1 at +4 hours, Email 2 at +3 days
- **Exit:** `purchased:snapshot-plus`
- **Sender:** All: Claudine | claudine@ | Founder template
- **Merge fields:** `%FIRSTNAME%`, `%PRIMARY_PILLAR%`, `%REPORT_LINK%`, `%UPGRADE_PRODUCT_URL%`
- **Note:** Runs alongside Sequence 1 — ensure no duplicate sends on same day
- **On exit without conversion:** Contact continues in Seq 1 if active, else Seq 15
- **Salutation fallback:** Hi there,

### SEQUENCE 4: Purchase Welcome — Start Your Diagnostic
- **Trigger:** Event `start_diagnostic` with `product_key` = snapshot_plus | blueprint | blueprint_plus
- **Timing:** Email 1 immediate, Email 2 at +2 days, Email 3 at +5 days, Email 4 at +10 days
- **Exit:** Product-specific `report:*-ready` tag
- **Variants:** 3 (Snapshot+, Blueprint, Blueprint+)
- **Sender:** Emails 1–3: Wunderbar Digital | hello@ | Branded. Email 4: Claudine | claudine@ | Founder
- **Merge fields:** `%FIRSTNAME%`, `%START_DIAGNOSTIC_LINK%`, `%DASHBOARD_LINK%`
- **Key differences by variant:**
  - Snapshot+: 15–20 min, no uploads, Foundational Prompt Pack
  - Blueprint: 20–25 min, up to 3 uploads, Interactive Brand Workbook, Brand Standards PDF
  - Blueprint+: 25–35 min, up to 10 uploads, Strategy Activation Session mentioned
- **Note:** Blueprint+ Seq 12 triggers 3 days after report ready
- **Salutation fallback:** Hi there,

### SEQUENCE 5: Report Ready — Here Are Your Results
- **Trigger:** Product-specific `report:*-ready` tag
- **Timing:** Email 1 immediate, Email 2 at +3 days, Email 3 at +7 days
- **Exit:** Runs to completion
- **Variants:** 3 (Snapshot+, Blueprint, Blueprint+)
- **Sender:** Email 1: Wunderbar Digital | hello@ | Branded. Emails 2–3: Claudine | claudine@ | Founder
- **Merge fields:** `%FIRSTNAME%`, `%BRAND_ALIGNMENT_SCORE%`, `%POSITIONING_SCORE%`, `%MESSAGING_SCORE%`, `%VISIBILITY_SCORE%`, `%CREDIBILITY_SCORE%`, `%CONVERSION_SCORE%`, `%PRIMARY_PILLAR%`, `%REPORT_LINK%`, `%EXPERIENCE_SURVEY_LINK%`
- **Triggers downstream:** Seq 6/7 (upgrade), Seq 11 (experience survey follow-up)
- **Salutation fallback:** Hi there,

### SEQUENCE 6: Snapshot+ → Blueprint Upgrade
- **Trigger:** Tag `intent:upgrade-blueprint` (applied when S+ purchased)
- **Timing:** Email 1 at +7 days after report ready, Email 2 at +14d, Email 3 at +21d, Email 4 at +30d
- **Exit:** `purchased:blueprint`
- **Sender:** All: Claudine | claudine@ | Founder template
- **Merge fields:** `%FIRSTNAME%`, `%COMPANY_NAME%`, `%PRIMARY_PILLAR%`, `%UPGRADE_PRODUCT_URL%`
- **Dynamic content:** Email 2 uses 5 conditional blocks keyed to `%PRIMARY_PILLAR%`
- **On exit without conversion:** Move to Sequence 15
- **Salutation fallback:** Hi there,

### SEQUENCE 7: Blueprint → Blueprint+ Upgrade
- **Trigger:** Tag `intent:upgrade-blueprint-plus` (applied when Blueprint purchased)
- **Timing:** Email 1 at +7 days after report ready, Email 2 at +14d, Email 3 at +21d, Email 4 at +30d
- **Exit:** `purchased:blueprint-plus`
- **Sender:** All: Claudine | claudine@ | Founder template
- **Merge fields:** `%FIRSTNAME%`, `%COMPANY_NAME%`, `%UPGRADE_PRODUCT_URL%`
- **On exit without conversion:** Move to Sequence 15
- **Salutation fallback:** Hi there,

### SEQUENCE 8: Quarterly Refresh
- **Trigger:** Tag `refresh:eligible` (applied automatically 90 days after `report:*-ready`)
- **Timing:** Email 1 immediate, Email 2 at +7 days, Email 3 at +21 days
- **Exit:** New `purchased:*` tag or new diagnostic started
- **Sender:** All: Claudine | claudine@ | Founder template
- **Merge fields:** `%FIRSTNAME%`, `%BRAND_ALIGNMENT_SCORE%`, `%PRIMARY_PILLAR%`, `%DASHBOARD_LINK%`
- **Note:** Score/pillar merge fields pull from most recent diagnostic. Re-apply `refresh:eligible` 90 days later if no action.
- **Salutation fallback:** Hi there,

### SEQUENCE 9: Diagnostic Paused — Save & Exit
- **Trigger:** Tags `snapshot:paused` + `snapshot:resume-link-sent`
- **Timing:** Email 1 at +24 hours, Email 2 at +4 days, Email 3 at +10 days
- **Exit:** `completed:snapshot` or any `report:*-ready`
- **Sender:** All: Claudine | claudine@ | Founder template
- **Merge fields:** `%FIRSTNAME%`, `%RESUME_LINK%`, `%PRODUCT_KEY%`
- **Note:** Applies across all products — resume link should be product-aware
- **Salutation fallback:** Hi there,

### SEQUENCE 10: Session No-Show Recovery
- **Trigger:** Tag `noshow:needs-followup` + `call:expert-no-show` or `session:activation-no-show`
- **Timing:** Email 1 at +1 hour, Email 2 at +3 days
- **Exit:** New `call:expert-scheduled` or `session:activation-scheduled` tag
- **Sender:** All: Claudine | claudine@ | Founder template
- **Merge fields:** (none — no salutation, no merge fields in body)
- **Salutation:** None — open directly with body copy
- **Closing:** Warmly, / Claudine — no title line
- **Note:** AC conditional shows correct Calendly link based on session_type field
- **No further follow-up after Email 2**

### SEQUENCE 11: Experience Score Follow-up
- **Trigger:** Tags `experience:promoter` / `experience:passive` / `experience:detractor`
- **3 branches, 2 emails each:**
  - **Branch A (Promoter 9–10):** Email 1 immediate, Email 2 at +5 days. Testimonial ask → referral ask.
  - **Branch B (Passive 7–8):** Email 1 immediate, Email 2 at +7 days. Feedback ask → upgrade nudge.
  - **Branch C (Detractor 0–6):** Email 1 immediate, Email 2 at +5 days. Direct outreach → follow-up.
- **Exit:** Runs to completion per branch
- **Sender:** All: Claudine | claudine@ | Founder template
- **Merge fields:** `%FIRSTNAME%`
- **Branch C special:** No salutation. Closing: "Your experience matters — and I want to understand it better."
- **Suppression:** Do NOT trigger upgrade sequences for `experience:detractor` contacts
- **Salutation fallback:** Hi there, (Branches A & B only)

### SEQUENCE 12: Blueprint+ Strategy Activation Session Booking
- **Trigger:** 3 days after `report:blueprint-plus-ready` AND tag `session:pending` active
- **Timing:** Email 1 at +3 days, Email 2 at +10 days, Email 3 at +20 days
- **Exit:** `session:activation-scheduled`
- **Sender:** All: Claudine | claudine@ | Founder template
- **Merge fields:** `%FIRSTNAME%`, `%REPORT_LINK%`
- **Closing:** "Looking forward to it," (special for this sequence)
- **Note:** Replace CALENDLY_LINK with live Calendly URL. After no booking: archive `session:pending` — window expired.
- **Salutation:** "Hi %FIRSTNAME% —" (Email 1) / fallback: "Hi there —"

### SEQUENCE 13: Services Interest — Managed Marketing
- **Trigger:** Tag `intent:services`
- **Timing:** Email 1 at +1 hour, Email 2 at +4 days
- **Exit:** `services:call-booked` or `services:client-active`
- **Sender:** All: Claudine | claudine@ | Founder template
- **Merge fields:** `%FIRSTNAME%`
- **Note:** Replace CALENDLY_SERVICES_LINK with live Calendly URL. No further follow-up → move to Seq 15 or manual follow-up.
- **Salutation fallback:** Hi there,

### SEQUENCE 14: Content Opt-In Welcome
- **Trigger:** Tag `content:opt-in`
- **Timing:** Email 1 immediate, Email 2 at +2 days
- **Exit:** Runs to completion → move to Seq 15 (Evergreen Education)
- **Sender:** Email 1: Wunderbar Digital | hello@ | Branded. Email 2: Claudine | claudine@ | Founder
- **Merge fields:** `%FIRSTNAME%`, `%CONTENT_DOWNLOAD_LINK%`
- **Note:** On Email 2 completion, apply `content:opted_in` tag (triggers Seq 16 newsletter)
- **Salutation fallback:** Hi there,

### SEQUENCE 15: Evergreen Education
- **Trigger:** Contact exits Seq 1/2/3/6/7 without conversion, Seq 14 completes, or manually enrolled
- **Timing:** Email 1 immediate, then every 12 days (Emails 2–9), Email 10 at +14 days after Email 9
- **Exit:** Any `purchased:*` tag
- **Sender:** All: Claudine | claudine@ | Founder template
- **10 emails:**
  1. Why brands don't convert
  2. Brand consistency
  3. Positioning
  4. Messaging
  5. Visibility
  6. Credibility
  7. Conversion
  8. AI + brand voice
  9. Brand archetypes
  10. The five pillars as a system
- **Merge fields:** `%FIRSTNAME%`
- **After Email 10:** Move to Seq 16 (Newsletter) or tag as `evergreen:complete`
- **Salutation fallback:** Hi there,

### SEQUENCE 16: It's Wunderbar — The Newsletter
- **Trigger:** Tag `content:opted_in` (applied after Seq 14 completes)
- **Cadence:** 2x/month — ongoing broadcast
- **Exit:** Unsubscribe only
- **Sender:** All: Wunderbar Digital | hello@ | Branded template
- **4 sections per issue:** Lead Story, Try This Now (AI prompt), One Thing Worth Reading, From the WunderBrand System (conditional)
- **Merge fields:** `%FIRSTNAME%`, `%DASHBOARD_LINK%`, `%REPORT_LINK%`
- **Dynamic content:** Section 4 uses 4 conditional blocks keyed to `product_key` (snapshot/snapshot_plus/blueprint/blueprint_plus)
- **4 sample issues provided.** Continue on same cadence after.
- **Editorial rules:** Verify all external sources before scheduling. No fabricated references. Skip Section 4 when connection to WunderBrand would feel forced.
- **Salutation:** Hi %FIRSTNAME%, | Fallback: Hi there,

### SEQUENCE 17: Customer Retention — Brand Momentum Series
- **Trigger:** 30 days after any `report:*-ready` AND not in an active upgrade sequence
- **Timing:** Email 1 at +30 days, Emails 2–6 every 14 days, Email 7 at +14 days, Email 8 at +21 days
- **Exit:** `purchased:*` | `services:expert_call_requested` | `call:expert-scheduled`
- **Sender:** All: Claudine | claudine@ | Founder template
- **8 emails:**
  1. Implementation check-in (merge: `%FIRSTNAME%`, `%COMPANY_NAME%`, `%PRIMARY_PILLAR%`, `%REPORT_LINK%`)
  2. Pillar-specific action (dynamic content by `%PRIMARY_PILLAR%`, merge: `%BRAND_ALIGNMENT_SCORE%`)
  3. Prompt pack reminder (merge: `%DASHBOARD_LINK%`)
  4. Refresh teaser (merge: `%COMPANY_NAME%`, `%PRIMARY_PILLAR%`, `%REFRESH_ACTION_URL%`)
  5. Services intro (merge: `%COMPANY_NAME%`, `%SERVICES_URL%`) — CTA click applies `services:interested` → triggers Seq 19
  6. Referral ask
  7. Upgrade education (dynamic by tier, merge: `%PRODUCT_NAME%`, `%UPGRADE_PRODUCT_NAME%`, `%UPGRADE_PRODUCT_URL%`) — suppress for Blueprint+ contacts
  8. AI + brand documentation (merge: `%COMPANY_NAME%`, `%SERVICES_URL%`)
- **After Email 8 with no exit:** Tag `evergreen:complete`. Check if `refresh:eligible` → trigger Seq 8.
- **Salutation fallback:** Hi there,

### SEQUENCE 18: Win-Back — Lapsed Customers
- **Trigger:** 90+ days since last `report:*-ready` AND no refresh AND no engagement in 60+ days
- **Timing:** Email 1 at day 90, Email 2 at +7 days, Email 3 at +14 days
- **Exit:** `purchased:*` | `snapshot:viewed-results` | `call:expert-scheduled`
- **Sender:** All: Claudine | claudine@ | Founder template
- **Merge fields:** `%FIRSTNAME%`, `%COMPANY_NAME%`, `%PRIMARY_PILLAR%`, `%SERVICES_URL%`, `%DASHBOARD_LINK%`
- **Dynamic content:** Email 2 uses 5 conditional blocks keyed to `%PRIMARY_PILLAR%`
- **Salutation:** "Hi %FIRSTNAME% — it's been a while." (Emails 1–2) / Standard for Email 3
- **On exit without conversion:** Move to Sequence 15
- **Salutation fallback:** Hi there — it's been a while. (Emails 1–2)

### SEQUENCE 19: Services Warm-Up — Cross-Sell
- **Trigger:** 45+ days as customer AND any of: `services:interested` | `nurture:other-services` | score < 50 | `experience:promoter`
- **Timing:** Email 1 at trigger, Email 2 at +10 days, Email 3 at +20 days, Email 4 at +30 days
- **Exit:** `call:expert-scheduled` | manual removal
- **Sender:** All: Claudine | claudine@ | Founder template
- **Merge fields:** `%FIRSTNAME%`, `%COMPANY_NAME%`, `%PRIMARY_PILLAR%`, `%SERVICES_URL%`
- **After Email 4 with no conversion:** No further automated follow-up. Remove from sequence.
- **Salutation fallback:** Hi there,

---

## Complete Merge Field Reference

### Contact Fields
| Merge Field | Description | Used In |
|---|---|---|
| `%FIRSTNAME%` | First name | All sequences |
| `%COMPANY_NAME%` | Company/brand name | Seq 1, 3, 6, 7, 17, 18, 19 |
| `%EMAIL%` | Email address | System use |

### Score & Pillar Fields
| Merge Field | Description | Used In |
|---|---|---|
| `%BRAND_ALIGNMENT_SCORE%` | Overall WunderBrand Score (0–100) | Seq 1, 5, 8, 17 |
| `%POSITIONING_SCORE%` | Positioning pillar score (0–20) | Seq 1, 5 |
| `%MESSAGING_SCORE%` | Messaging pillar score (0–20) | Seq 1, 5 |
| `%VISIBILITY_SCORE%` | Visibility pillar score (0–20) | Seq 1, 5 |
| `%CREDIBILITY_SCORE%` | Credibility pillar score (0–20) | Seq 1, 5 |
| `%CONVERSION_SCORE%` | Conversion pillar score (0–20) | Seq 1, 5 |
| `%PRIMARY_PILLAR%` | Weakest/primary pillar name | Seq 1, 3, 5, 6, 8, 17, 18, 19 |

### Link Fields
| Merge Field | Description | Used In |
|---|---|---|
| `%REPORT_LINK%` | Direct link to report/results | Seq 1, 3, 5, 12, 16, 17 |
| `%DASHBOARD_LINK%` | Link to dashboard | Seq 4, 8, 16, 17, 18 |
| `%START_DIAGNOSTIC_LINK%` | Link to start/resume diagnostic | Seq 4 |
| `%RESUME_LINK%` | Link to resume paused diagnostic | Seq 9 |
| `%EXPERIENCE_SURVEY_LINK%` | Link to WunderBrand Experience Survey | Seq 5 |
| `%UPGRADE_PRODUCT_URL%` | Link to purchase next tier | Seq 1, 3, 6, 7, 17 |
| `%SERVICES_URL%` | Link to services page | Seq 17, 18, 19 |
| `%REFRESH_ACTION_URL%` | Link to purchase quarterly refresh | Seq 17 |
| `%ABANDONED_PRODUCT_URL%` | Link back to checkout | Seq 2 |
| `%CONTENT_DOWNLOAD_LINK%` | Link to download lead magnet | Seq 14 |

### Product Fields
| Merge Field | Description | Used In |
|---|---|---|
| `%PRODUCT_NAME%` | Display name of current product | Seq 17 |
| `%PRODUCT_KEY%` | Internal product key | Seq 9 |
| `%UPGRADE_PRODUCT_NAME%` | Next tier product name | Seq 17 |
| `%ABANDONED_PRODUCT%` | Abandoned product name | Seq 2 |

---

## Complete Tag Reference

### Purchase Tags
| Tag | Applied When | Removed When |
|---|---|---|
| `purchased:snapshot` | Free snapshot completed | — |
| `purchased:snapshot-plus` | Snapshot+ purchased | — |
| `purchased:blueprint` | Blueprint purchased | — |
| `purchased:blueprint-plus` | Blueprint+ purchased | — |

### Intent / Upgrade Tags
| Tag | Applied When | Removed When |
|---|---|---|
| `intent:upgrade-snapshot-plus` | After free snapshot | When S+ purchased |
| `intent:upgrade-blueprint` | After S+ purchase | When Blueprint purchased |
| `intent:upgrade-blueprint-plus` | After Blueprint purchase | When B+ purchased |
| `intent:services` | Services interest signal | — |
| `nurture:other-services` | After B+ purchase | — |

### Report Ready Tags
| Tag | Applied When |
|---|---|
| `completed:snapshot` | Free snapshot saved |
| `report:snapshot-plus-ready` | S+ report ready |
| `report:blueprint-ready` | Blueprint report ready |
| `report:blueprint-plus-ready` | B+ report ready |

### Checkout Tags
| Tag | Applied When |
|---|---|
| `checkout:abandoned` | Checkout expired without payment |

### Behavior Tags
| Tag | Applied When |
|---|---|
| `snapshot:coverage-gap` | Coverage < 70–80% |
| `snapshot:paused` | Saved and exited mid-diagnostic |
| `snapshot:resume-link-sent` | Resume link emailed |
| `snapshot:viewed-results` | Viewed results page |

### Experience Score Tags
| Tag | Applied When |
|---|---|
| `experience:promoter` | Score 9–10 |
| `experience:passive` | Score 7–8 |
| `experience:detractor` | Score 0–6 |

### Session Tags
| Tag | Applied When |
|---|---|
| `session:pending` | B+ purchased (session available) |
| `session:activation-scheduled` | Session booked |
| `session:activation-no-show` | Session no-show |
| `session:activation-completed` | Session completed |
| `call:expert-scheduled` | Expert call booked |
| `call:expert-no-show` | Expert call no-show |
| `noshow:needs-followup` | Any no-show |

### Content Tags
| Tag | Applied When |
|---|---|
| `content:opt-in` | Opted in to content (form submit) |
| `content:opted_in` | Confirmed opted in (after Seq 14) |

### Services Tags
| Tag | Applied When |
|---|---|
| `services:interested` | Expressed interest in services |
| `services:call-booked` | Services call booked |
| `services:client-active` | Active services client |
| `services:expert_call_requested` | Requested expert call |

### Refresh Tags
| Tag | Applied When |
|---|---|
| `refresh:eligible` | 90 days after report ready |

### Lifecycle Tags
| Tag | Applied When |
|---|---|
| `evergreen:complete` | Completed Seq 15 or 17 without conversion |

---

## Sender Identity Reference

| Template | From Name | From Email |
|---|---|---|
| **Branded** | Wunderbar Digital | hello@wunderbardigital.com |
| **Founder** | Claudine at Wunderbar Digital | claudine@wunderbardigital.com |
| **Support** | Wunderbar Digital | support@wunderbardigital.com |

---

## Dynamic Content Blocks

These emails require conditional content blocks built in ActiveCampaign:

| Sequence | Email | Keyed To | # Blocks |
|---|---|---|---|
| Seq 1 | Email 2 | `%PRIMARY_PILLAR%` | 5 (one per pillar) |
| Seq 2 | Email 2 | `product_key` | 3 (S+/B/B+) |
| Seq 6 | Email 2 | `%PRIMARY_PILLAR%` | 5 |
| Seq 16 | Issues 1, 3, 4 | `product_key` | 4 (snapshot/S+/B/B+) |
| Seq 17 | Email 2 | `%PRIMARY_PILLAR%` | 5 |
| Seq 17 | Email 7 | `product_key` | 2 (S+/B only, suppress B+) |
| Seq 18 | Email 2 | `%PRIMARY_PILLAR%` | 5 |

---

## Placeholders to Replace Before Building

| Placeholder | Replace With |
|---|---|
| `CALENDLY_LINK` | Live Calendly URL for Strategy Activation Session |
| `CALENDLY_SERVICES_LINK` | Live Calendly URL for services discovery calls |
| `wunderbrand.ai` | Live URL for free snapshot start page |

---

## Build Order (Recommended)

1. **Foundation sequences first:** Seq 4 (welcome), Seq 5 (report ready), Seq 9 (paused)
2. **Upgrade sequences:** Seq 1 (free→S+), Seq 6 (S+→B), Seq 7 (B→B+)
3. **Recovery sequences:** Seq 2 (abandoned cart), Seq 3 (coverage gap), Seq 10 (no-show)
4. **Post-report sequences:** Seq 11 (experience follow-up), Seq 12 (session booking)
5. **Retention sequences:** Seq 17 (retention), Seq 8 (refresh), Seq 18 (win-back)
6. **Content sequences:** Seq 14 (opt-in), Seq 15 (evergreen), Seq 16 (newsletter)
7. **Services sequences:** Seq 13 (services interest), Seq 19 (cross-sell)
