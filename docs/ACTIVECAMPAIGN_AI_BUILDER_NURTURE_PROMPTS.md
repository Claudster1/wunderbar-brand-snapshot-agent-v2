# ActiveCampaign AI Builder — Full Nurture Prompt Pack

Paste **one prompt at a time** into ActiveCampaign’s automation AI builder.
After each automation is generated: attach email copy, verify tag spelling (colons are literal), set the exit goal, then turn it on.

> **Builder note:** If the AI builder keeps returning the same automation ID regardless of name, start a **new AC builder conversation** and paste only the next Seq block. Do not paste multiple Seqs in one message.

## Account status (as of 2026-09-03)

**Live in AC**
| Automation | ID | Status |
|---|---|---|
| Post-Purchase Onboarding (Seq 4 access) | 29 | ✅ live — subject lines set |
| Seq 2 — Checkout Abandoned | 30 | ✅ live |
| Seq 7 — Blueprint → Blueprint+ | 31 | ✅ live |
| Seq 6 — Snapshot+ → Blueprint | 32 | ✅ live |
| Seq 5 — Report Ready | 33 | ✅ live |
| Seq 1 — Free Snapshot → Snapshot+ Upgrade | 34 | ✅ created — attach 5 email bodies, then activate |

Also confirmed: custom fields (IDs 69–70, 74, 144–147), purchase-access tags (277–281), tier tags (112–114).

**Still to build (next session order)**
1. Seq 9 — Diagnostic Paused Rescue ← **next recommended**
2. Seq 12 + 12b — Blueprint+ Activation Booking + Pre-call Priming
3. Seq 10 — Session No-Show Recovery
4. Seq 8 — Quarterly Refresh
5. Seq 3 — Coverage Gap Nudge
6. Seq 11A / 11B / 11C — Experience branches
7. Seq 13 — Services Interest
8. Seq 14 — Content Opt-In Welcome
9. Seq 15 — Brand Growth Series (7 emails; replaces old 10-email evergreen)
10. Seq 16 — Newsletter / It's Wunderbar
11. Seq 17 — Customer Retention / Brand Momentum
12. Seq 18 — Win-Back Lapsed Customers
13. Seq 19 — Services Cross-Sell Warm-Up
14. Seq 20 — Post-Expert Call
15. Seq 21 — Post-Strategy Activation Session
16. Seq 22 — Connect Form Inquiry

**Skip:** Seq 4 (covered by Post-Purchase Onboarding ID 29). Day 2/7/21 start nudges are **Resend**, not AC.

**Global rules for every automation**
- From: Claudine at Wunderbar Digital (`claudine@wunderbardigital.com`) unless noted as branded (`hello@wunderbardigital.com`).
- Prefer **tag triggers** over events.
- Exit immediately when the stated exit tag(s) are added.
- Do not email on `reminder:purchase-start-2d|7d|21d`.
- Merge tags: use AC forms without extra underscores (`%REPORTLINK%`, `%BRANDALIGNMENTSCORE%`, `%ACCESSCLAIMLINK%` / field `access_claim_link`, etc.).
- I will paste the email bodies into each Send step after you build the flow.

---

## Seq 1 — Free Snapshot → Snapshot+ Upgrade  (ID 34 — attach copy)

```
Create an automation named "Seq 1 — Free Snapshot → Snapshot+ Upgrade".
Trigger: when tag "purchased:snapshot" is added. Runs once per contact.
Also require / check for tag "intent:upgrade-snapshot-plus" if present; if they already have any paid purchased tag, do not enter.
Goal (exit): tag "purchased:snapshot-plus" OR "purchased:blueprint" OR "purchased:blueprint-plus" is added → exit immediately.
Steps:
1) Wait 1 hour; send Email 1 (results recap + Snapshot+ value + CTA).
2) Wait 2 days; send Email 2 (pillar education; conditional content by %PRIMARYPILLAR% — 5 blocks).
3) Wait 3 days; send Email 3 (proof / value).
4) Wait 4 days; send Email 4 (soft CTA).
5) Wait 5 days; send Email 5 (final reminder).
6) If still not purchased, apply tag "nurture:brand-education" (enters Seq 15 Brand Growth Series) and end.
Personalize with %FIRSTNAME%, %COMPANYNAME%, %BRANDALIGNMENTSCORE%, %PRIMARYPILLAR%, %WEAKESTPILLAR%, %TOPOPPORTUNITIES%, %REPORTLINK%, %UPGRADEPRODUCTURL%, %UPGRADEPRICE%.
Do not invent wait steps beyond those listed. I will paste the 5 email bodies.
```

---

## Seq 2 — Checkout Abandoned

```
Create an automation named "Seq 2 — Checkout Abandoned Recovery".
Trigger: when tag "checkout:abandoned" is added. Re-entry allowed.
Goal (exit): any tag starting with "purchased:" is added → exit immediately.
Steps:
1) Wait 30 minutes; send Email 1 (still interested? + product CTA).
2) Wait 1 day; send Email 2 (objection / reassurance; conditional by abandoned product: snapshot_plus / blueprint / blueprint_plus).
3) Wait 2 days; send Email 3 (final nudge).
4) If no purchase, apply tag "nurture:brand-education" and end.
Personalize with %FIRSTNAME%, %ABANDONEDPRODUCT%, %ABANDONEDPRODUCTURL%, %ABANDONEDPRODUCTPRICE%.
I will paste the 3 email bodies.
```

---

## Seq 3 — Coverage Gap Nudge

```
Create an automation named "Seq 3 — Coverage Gap Nudge".
Trigger: when tag "snapshot:coverage-gap" is added. Runs once per contact.
Goal (exit): tag "purchased:snapshot-plus" OR "purchased:blueprint" OR "purchased:blueprint-plus" → exit.
Steps:
1) Wait 4 hours; send Email 1 (what was missing + why Snapshot+ fills gaps).
2) Wait 3 days; if still no paid purchase tag, send Email 2 (short nudge + CTA).
3) End (contact may still be in Seq 1 — do not apply duplicate upgrade tags).
Personalize with %FIRSTNAME%, %PRIMARYPILLAR%, %REPORTLINK%, %UPGRADEPRODUCTURL%.
I will paste the 2 email bodies.
```

---

## Seq 4 — Purchase Welcome (SKIP if Post-Purchase Onboarding already live)

Only use this if you need a **tier-branched** welcome that still respects Resend ownership of day 2/7/21 start nudges:

```
Create or update automation "Seq 4 — Purchase Welcome (Access Only)".
Trigger: when tag "onboarding:awaiting-start" is added. Runs once per contact.
Goal (exit): tag "diagnostic:completed" is added OR "onboarding:awaiting-start" is removed.
Optional branch on entry by product tags: onboarding:snapshot-plus / onboarding:blueprint / onboarding:blueprint-plus for copy variants only.
Steps:
1) Send Email 1 immediately — welcome + reinforce purchase. Primary CTA URL = personalization field access_claim_link (fallback start_diagnostic_link). Also show dashboard_link and product_purchased.
2) Wait 4 days. If contact STILL has onboarding:awaiting-start, send Email 2 — tips only (how it works / checklist), same claim-link CTA. If not, end.
3) End.
CRITICAL: Do NOT send day-2, day-7, or day-21 "start now" reminders — the app Resend cron owns those.
Personalize with access_claim_link, start_diagnostic_link, dashboard_link, product_purchased, purchased_brand_name.
I will paste the email bodies.
```

---

## Seq 5 — Report Ready

```
Create an automation named "Seq 5 — Report Ready".
Trigger: when any of these tags is added: "report:snapshot-plus-ready", "report:blueprint-ready", "report:blueprint-plus-ready". Runs once per contact per tag if possible; otherwise once.
Goal: runs to completion (no early exit required), but suppress duplicate sends if already completed this automation.
Steps:
1) Send Email 1 immediately (your report is ready + %REPORTLINK%).
2) Wait 3 days; send Email 2 (key finding + experience survey %EXPERIENCESURVEYLINK%).
3) Wait 4 days; send Email 3 (next steps / soft next-tier or session CTA via %UPGRADEPRODUCTURL% where relevant).
Branch email copy by which report:*-ready tag they have (3 variants: Snapshot+, Blueprint, Blueprint+).
Personalize with %FIRSTNAME%, %BRANDALIGNMENTSCORE%, %PRIMARYPILLAR%, %REPORTLINK%, %EXPERIENCESURVEYLINK%, %PRODUCTPURCHASED%, %UPGRADEPRODUCTURL%.
I will paste the email bodies for each variant.
```

---

## Seq 6 — Snapshot+ → Blueprint Upgrade

```
Create an automation named "Seq 6 — Snapshot+ → Blueprint Upgrade".
Trigger: when tag "intent:upgrade-blueprint" is added. Runs once per contact.
Goal (exit): tag "purchased:blueprint" OR "purchased:blueprint-plus" → exit immediately.
Steps:
1) Wait 7 days; send Email 1 (what Blueprint unlocks + upgrade credit).
2) Wait 7 days; send Email 2 (pillar-specific value; 5 conditional blocks by %PRIMARYPILLAR%).
3) Wait 7 days; send Email 3 (proof / ROI).
4) Wait 9 days; send Email 4 (final upgrade CTA).
5) If no purchase, apply tag "nurture:brand-education" and end.
Personalize with %FIRSTNAME%, %COMPANYNAME%, %PRIMARYPILLAR%, %UPGRADEPRODUCTNAME%, %UPGRADEPRODUCTURL%, %UPGRADEPRICE%.
I will paste the 4 email bodies.
```

---

## Seq 7 — Blueprint → Blueprint+ Upgrade

```
Create an automation named "Seq 7 — Blueprint → Blueprint+ Upgrade".
Trigger: when tag "intent:upgrade-blueprint-plus" is added. Runs once per contact.
Goal (exit): tag "purchased:blueprint-plus" → exit immediately.
Steps:
1) Wait 7 days; send Email 1 (Strategy Activation Session + what B+ adds).
2) Wait 7 days; send Email 2 (implementation depth / workbook value).
3) Wait 7 days; send Email 3 (proof / ROI).
4) Wait 9 days; send Email 4 (final upgrade CTA).
5) If no purchase, apply tag "nurture:brand-education" and end.
Personalize with %FIRSTNAME%, %COMPANYNAME%, %UPGRADEPRODUCTNAME%, %UPGRADEPRODUCTURL%, %UPGRADEPRICE%.
I will paste the 4 email bodies.
```

---

## Seq 8 — Quarterly Refresh

```
Create an automation named "Seq 8 — Quarterly Refresh".
Trigger: when tag "refresh:eligible" is added. Runs once per eligibility cycle; allow re-entry when tag is re-applied later.
Goal (exit): tag "purchased:snapshot-plus-refresh" OR "purchased:blueprint-refresh" OR any new report:*-ready → exit.
Steps:
1) Wait 75 days from entry (or send Email 1 immediately if your ops prefer tag timing to mean "already due"); preferred: wait 75 days then Email 1.
2) Wait 7 days; send Email 2 (reminder).
3) Wait 7 days; send Email 3 (last call before window closes).
Personalize with %FIRSTNAME%, %BRANDALIGNMENTSCORE%, %PRIMARYPILLAR%, %DASHBOARDLINK%, %REFRESHPRICE%, %REFRESHTYPE%, %REPORTLINK%.
I will paste the 3 email bodies.
```

---

## Seq 9 — Diagnostic Paused  ← NEXT

```
Create an automation named "Seq 9 — Diagnostic Paused Rescue".
Trigger: when tag "snapshot:paused" is added AND contact has "snapshot:resume-link-sent". Runs once per pause episode; re-entry allowed.
Goal (exit): tag "completed:snapshot" OR any "report:*-ready" OR "diagnostic:completed" → exit.
Steps:
1) Wait 24 hours; send Email 1 (resume CTA with %RESUMELINK%).
2) Wait 3 days; if still paused, send Email 2.
3) Wait 6 days; if still paused, send Email 3 (final resume nudge).
Personalize with %FIRSTNAME%, %RESUMELINK%, %PRODUCTKEY%, %DASHBOARDLINK%.
I will paste the 3 email bodies.
```

---

## Seq 10 — Session No-Show Recovery

```
Create an automation named "Seq 10 — Session No-Show Recovery".
Trigger: when tag "noshow:needs-followup" is added. Runs once per no-show; re-entry allowed.
Branch by no-show type tags: "call:expert-no-show" vs "session:activation-no-show" (and services no-show tags if present) to pick the correct Calendly link.
Goal (exit): tag "call:expert-scheduled" OR "session:activation-scheduled" OR "noshow:rescheduled" → exit.
Steps:
1) Wait 1 hour; send Email 1 (easy rebook — no salutation, direct body).
2) Wait 3 days; if still not rescheduled, send Email 2 (final rebook).
3) End — no further automated follow-up.
Personalize sparingly; prefer Calendly links by branch. I will paste the 2 email bodies.
```

---

## Seq 11 — Experience Score Follow-up

```
Create three automations (or one with three branches) for experience score follow-up.

Automation A "Seq 11A — Experience Promoter":
Trigger: tag "experience:promoter". Runs once.
Steps: Email 1 immediate (testimonial ask); wait 5 days; Email 2 (referral ask); end.
Merge: %FIRSTNAME%, %TESTIMONIALLINK%, %GOOGLEREVIEWURL%.

Automation B "Seq 11B — Experience Passive":
Trigger: tag "experience:passive". Runs once.
Steps: Email 1 immediate (feedback ask); wait 7 days; Email 2 (soft upgrade / next step); end.
Merge: %FIRSTNAME%, %UPGRADEPRODUCTURL%.

Automation C "Seq 11C — Experience Detractor":
Trigger: tag "experience:detractor". Runs once.
Steps: Email 1 immediate (direct founder outreach — no salutation); wait 5 days; Email 2 (follow-up / listen); end.
CRITICAL: Do NOT enter this contact into upgrade sequences while experience:detractor is present.
Merge: %FIRSTNAME%.

I will paste the email bodies for each branch.
```

---

## Seq 12 — Blueprint+ Strategy Activation Booking

```
Create an automation named "Seq 12 — Blueprint+ Activation Session Booking".
Trigger: when tag "session:pending" is added (typically with Blueprint+ / report:blueprint-plus-ready). Runs once.
Goal (exit): tag "session:activation-scheduled" OR "session:booked" → exit booking reminders.
Steps (not yet booked):
1) Wait 3 days after entry (or after report:blueprint-plus-ready if you can condition); send Email 1 (book your complimentary session + Calendly link).
2) Wait 7 days; if still no session:activation-scheduled, send Email 2.
3) Wait 10 days; if still not scheduled, send Email 3 (last nudge); then remove or archive session:pending if desired; end.

Also create companion automation "Seq 12b — Activation Pre-call Priming":
Trigger: tag "session:activation-scheduled".
Steps: send prep email immediately with %WEAKESTPILLAR% and %TOPOPPORTUNITIES%; end.

Calendly: https://calendly.com/claudine-wunderbardigital/brand-blueprint-strategy-activation-session
Personalize with %FIRSTNAME%, %REPORTLINK%, %WEAKESTPILLAR%, %TOPOPPORTUNITIES%.
I will paste the email bodies.
```

---

## Seq 13 — Services Interest

```
Create an automation named "Seq 13 — Services Interest".
Trigger: when tag "intent:services" OR "services:interested" is added. Runs once.
Goal (exit): tag "services:call-booked" OR "mql:managed-marketing" OR "mql:ai-consulting" OR "services:client-active" → exit.
Steps:
1) Wait 1 hour; send Email 1 (how we help + book a discovery call).
2) Wait 4 days; if goal not met, send Email 2 (soft case / fit check + CTA).
3) End (optional handoff to Seq 15 / brand education if no booking).
Personalize with %FIRSTNAME%, %SERVICESURL%, %COMPANYNAME%.
Use live Calendly services link in CTAs. I will paste the 2 email bodies.
```

---

## Seq 14 — Content Opt-In Welcome

```
Create an automation named "Seq 14 — Content Opt-In Welcome".
Trigger: when tag "content:opt-in" OR "content:opted_in" is added (prefer content:opt-in for entry). Runs once.
Goal: runs to completion.
Steps:
1) Send Email 1 immediately (welcome + best resource / %CONTENT_DOWNLOAD_LINK% if set).
2) Wait 2 days; send Email 2 (more value); apply tag "content:opted_in" if not already present; apply "nurture:brand-education" to enter Seq 15; end.
Branch lightly on content:marketing_trends vs content:ai_updates when present.
Personalize with %FIRSTNAME%, %CONTENT_DOWNLOAD_LINK%.
I will paste the 2 email bodies.
```

---

## Seq 15 — Brand Growth Series (Education)

> **Canonical Seq 15.** Use the 7-email Brand Growth Series (`docs/ACTIVECAMPAIGN_BRAND_EDUCATION_NURTURE.md`).
> Do **not** also build the older 10-email “Evergreen Education” drip on `nurture:brand-education` (duplicate track).
> The 10-email curriculum is deferred; if revived later, give it a **different** entry tag.

```
Create an automation named "Seq 15 — Brand Growth Series".
Trigger: when tag "nurture:brand-education" is added (also allow manual enrollment). Runs once.
Goal (exit): if any tag starting with "purchased:" is added → remove from this automation immediately.
Also pause/skip while contact has "session:pending" or any "mql:" tag (wait 1 day, then continue).
Steps: send Email 1 now; wait 7 days; send Email 2; wait 7 days; send Email 3; wait 7 days; send Email 4; wait 7 days; send Email 5; wait 7 days; send Email 6; wait 7 days; send Email 7; apply tag "evergreen:complete"; end.
Topics in order (teach-first, soft CTA only — one ask per email, usually in P.S.):
1) Brand isn't your logo — it's your growth engine
2) Positioning
3) Messaging
4) Visibility
5) Credibility
6) Conversion
7) Retention / advocacy + softest next step
Soft CTAs rotate: free Snapshot (app.wunderbrand.ai), reply with a question, late-series optional calendar.
Personalize with %FIRSTNAME%, %COMPANYNAME% (optional snapshot fields %WEAKESTPILLAR%, %BRANDALIGNMENTSCORE% only inside conditionals with non-personalized fallbacks).
I will paste the 7 email bodies from ACTIVECAMPAIGN_BRAND_EDUCATION_NURTURE.md.
```

---

## Seq 16 — Newsletter (It's Wunderbar)

```
Create a campaign/automation setup named "Seq 16 — It's Wunderbar Newsletter".
This is an ongoing 2x/month broadcast, not a short drip.
Entry: contacts with tag "content:opted_in".
Exit: unsubscribe only.
Build:
1) A list or segment: has content:opted_in, not unsubscribed.
2) A reusable campaign template with 4 sections: Lead Story, Try This Now (AI prompt), One Thing Worth Reading, From the WunderBrand System (conditional by product_key / purchased tier).
3) Schedule cadence: twice per month from Wunderbar Digital / hello@wunderbardigital.com.
Personalize with %FIRSTNAME%, %DASHBOARDLINK%, %REPORTLINK%.
I will paste sample issue copy for the first 4 sends.
```

---

## Seq 17 — Customer Retention (Brand Momentum)

```
Create an automation named "Seq 17 — Customer Retention / Brand Momentum".
Trigger: when any report:*-ready tag is added, then wait 30 days before Email 1 — OR trigger on a dedicated tag "retention:start" if you prefer manual/cron enrollment. Skip entry if contact is currently in Seq 6 or Seq 7 (has intent:upgrade-blueprint or intent:upgrade-blueprint-plus and is mid-upgrade).
Goal (exit): new paid purchased:* OR services:expert_call_requested OR call:expert-scheduled OR mql:* → exit.
Steps:
1) At +30 days: Email 1 implementation check-in.
2) Every 14 days: Emails 2–6 (pillar action, prompt pack reminder, refresh teaser, services intro, referral).
3) Then Email 7 (+14d) upgrade education (suppress for Blueprint+ / purchased:blueprint-plus).
4) Then Email 8 (+21d) AI + brand documentation.
5) Apply evergreen:complete; if refresh:eligible present, they may also be in Seq 8.
Personalize with %FIRSTNAME%, %COMPANYNAME%, %PRIMARYPILLAR%, %REPORTLINK%, %DASHBOARDLINK%, %REFRESH_ACTION_URL%, %SERVICESURL%, %PRODUCTPURCHASED%, %UPGRADEPRODUCTNAME%, %UPGRADEPRODUCTURL%.
I will paste the 8 email bodies.
```

---

## Seq 18 — Win-Back

```
Create an automation named "Seq 18 — Win-Back Lapsed Customers".
Trigger: prefer a tag "retention:at-risk" or "lifecycle:at-risk" when applied (ops/cron). If building time-based only: enter contacts 90+ days after last report:*-ready with no refresh and low engagement.
Goal (exit): any purchased:* OR snapshot:viewed-results OR call:expert-scheduled → exit.
Steps:
1) Email 1 day 0 (it's been a while).
2) Wait 7 days; Email 2 (pillar-specific re-engagement; 5 blocks by %PRIMARYPILLAR%).
3) Wait 7 days; Email 3 (final soft CTA / services or refresh).
4) If no exit, apply nurture:brand-education and end.
Personalize with %FIRSTNAME%, %COMPANYNAME%, %PRIMARYPILLAR%, %SERVICESURL%, %DASHBOARDLINK%.
I will paste the 3 email bodies.
```

---

## Seq 19 — Services Cross-Sell Warm-Up

```
Create an automation named "Seq 19 — Services Cross-Sell Warm-Up".
Trigger: when tag "nurture:other-services" OR "services:interested" is added for an existing customer (has any paid purchased:*). Runs once.
Goal (exit): call:expert-scheduled OR mql:managed-marketing OR mql:ai-consulting OR services:client-active → exit.
Steps:
1) Send Email 1 now (services fit / outcomes).
2) Wait 10 days; Email 2.
3) Wait 10 days; Email 3.
4) Wait 10 days; Email 4 (final soft CTA); end with no further automation.
Personalize with %FIRSTNAME%, %COMPANYNAME%, %PRIMARYPILLAR%, %SERVICESURL%.
I will paste the 4 email bodies.
```

---

## Seq 20 — Post-Expert Call

```
Create an automation named "Seq 20 — Post-Expert Call".
Trigger: when tag "call:expert-completed" is added. Prefer also using event/expert follow-up ready if you send AI-approved %FOLLOWUPBODY% first.
Goal (exit): services:client-active → exit to client onboarding only.
Branch:
A) If services:client-active already present: send short onboarding/orientation series (1–2 emails) then end.
B) If not converted: 
1) Send Email 1 at +2 hours (recap / thank you / next step) — if followup_body fields exist, use %FOLLOWUPSUBJECT% / %FOLLOWUPBODY% for Email 1 when approved.
2) Wait 3 days; Email 2 (fit / pathways).
3) Wait 5 days; Email 3 (soft proof).
4) Wait 8 days; Email 4 (final low-pressure CTA); apply nurture:other-services or nurture:brand-education; end.
Personalize with %FIRSTNAME%, %COMPANYNAME%, %SERVICESURL%, %FOLLOWUPSUBJECT%, %FOLLOWUPBODY%.
I will paste the email bodies.
```

---

## Seq 21 — Post-Strategy Activation Session

```
Create an automation named "Seq 21 — Post-Strategy Activation Session".
Trigger: when tag "session:activation-completed" is added.
Goal (exit): services:client-active → exit.
Steps:
1) Wait 1 day; send Email 1 (implementation momentum; after manual/AI recap if using followup fields).
2) Wait 7 days; Email 2 (check-in on 30-day priorities).
3) Wait 7 days; Email 3 (progress + soft managed marketing CTA if experience:promoter or services intent tags present; else educational).
4) Wait 16 days; Email 4 (90-day review / services or retention handoff); apply nurture:other-services if still relevant; end.
Personalize with %FIRSTNAME%, %COMPANYNAME%, %REPORTLINK%, %SERVICESURL%, %FOLLOWUPSUBJECT%, %FOLLOWUPBODY%.
I will paste the 4 email bodies.
```

---

## Seq 22 — Connect Form / General Inquiry

```
Create an automation named "Seq 22 — Connect Form Inquiry".
Trigger: when tag "inquiry:connect-form" is added. On entry also ensure inquiry:pending-response is present if your form applies it.
Goal (exit): tag "inquiry:responded" → move to confirmation branch then stop.
Steps:
1) Send Email 1 immediately (branded confirmation from Wunderbar Digital / hello@).
2) Wait 2 days; if inquiry:responded is present, send short "we replied" expectation email and end; if NOT present, send Email 2 (gentle founder follow-up).
3) Wait 4 days; if still no inquiry:responded, send Email 3 (final gentle bump); end.
When team replies manually, apply inquiry:responded and remove inquiry:pending-response.
Personalize with %FIRSTNAME%, %COMPANYNAME%, %SERVICESURL%.
I will paste the 3 email bodies.
```

---

---

## Full account audit prompt (existing + missing)

Paste into a **new** AC AI builder / chat session. Ask it to audit only — do not create duplicates unless a gap is confirmed.

```
You are auditing the WunderBrand ActiveCampaign account. Do NOT create new automations yet unless a gap is confirmed and I explicitly approve. Return a structured audit report.

## Inventory already in account (ID → expected role)

| ID | Expected Seq / Name | Expected trigger (primary) | Expected exit / notes |
|----|---------------------|----------------------------|------------------------|
| 29 | Post-Purchase Onboarding (Seq 4 access) | onboarding:awaiting-start | diagnostic:completed OR onboarding:awaiting-start removed. CTA = access_claim_link. MUST NOT send day-2/7/21 start nudges (Resend owns those). |
| 30 | Seq 2 Checkout Abandoned Recovery | checkout:abandoned | any purchased:* |
| 31 | Seq 7 Blueprint → Blueprint+ Upgrade | intent:upgrade-blueprint-plus | purchased:blueprint-plus |
| 32 | Seq 6 Snapshot+ → Blueprint Upgrade | intent:upgrade-blueprint | purchased:blueprint OR purchased:blueprint-plus |
| 33 | Seq 5 Report Ready | report:snapshot-plus-ready OR report:blueprint-ready OR report:blueprint-plus-ready | runs to completion |
| 34 | Seq 1 Free Snapshot → Snapshot+ Upgrade | purchased:snapshot | purchased:snapshot-plus / blueprint / blueprint-plus |
| 35 | Seq 9 Diagnostic Paused Rescue | snapshot:paused (+ snapshot:resume-link-sent) | completed:snapshot OR report:*-ready OR diagnostic:completed |
| 36 | Seq 12 Blueprint+ Activation Session Booking | session:pending | session:activation-scheduled OR session:booked |
| 37 | Seq 12b Activation Pre-call Priming | session:activation-scheduled | single prep email |
| 38 | Seq 10 Session No-Show Recovery | noshow:needs-followup | call:expert-scheduled OR session:activation-scheduled OR noshow:rescheduled |
| 39 | Seq 3 Coverage Gap Nudge | snapshot:coverage-gap | any paid purchased:* |
| 40 | Seq 11A Experience Promoter | experience:promoter | runs to completion |
| 41 | Seq 11B Experience Passive | experience:passive | runs to completion |
| 42 | Seq 11C Experience Detractor | experience:detractor | runs to completion; MUST NOT push upgrade sequences |
| 43 | Seq 13 Services Interest | intent:services OR services:interested | services:call-booked OR mql:* OR services:client-active |
| 44 | Seq 14 Content Opt-In Welcome | content:opt-in (or content:opted_in) | apply content:opted_in + nurture:brand-education |
| 45 | Seq 15 Brand Growth Series | nurture:brand-education | paid purchased:* ; MUST be exactly 7 emails @ 7-day waits; rename if still "Evergreen Education"; delete emails 8–10 if present; end with evergreen:complete |
| 46 | Seq 16 It's Wunderbar Newsletter | content:opted_in segment/list | unsubscribe only; 2x/month broadcast template |
| 47 | Seq 8 Quarterly Refresh | refresh:eligible | purchased:*-refresh OR new report:*-ready |
| 48 | Seq 17 Customer Retention / Brand Momentum | report:*-ready (+30d) or retention:start | new purchased:* / services:expert_call_requested / call:expert-scheduled / mql:* |
| 49 | Seq 18 Win-Back Lapsed Customers | retention:at-risk OR lifecycle:at-risk | purchased:* / snapshot:viewed-results / call:expert-scheduled |
| 50 | Seq 19 Services Cross-Sell Warm-Up | nurture:other-services OR services:interested (customers) | call:expert-scheduled / mql:* / services:client-active |
| 51 | Seq 20 Post-Expert Call | call:expert-completed | services:client-active |
| 52 | Seq 21 Post-Strategy Activation Session | session:activation-completed | services:client-active |
| 53 | Seq 22 Connect Form Inquiry | inquiry:connect-form | inquiry:responded |

## Audit each ID 29–53 for

1. Name matches expected Seq (flag mismatches, especially ID 45).
2. Trigger tag spelling exact (colons literal).
3. Exit goals present and correct (no converters left in upgrade drips).
4. Active / inactive status.
5. Send-step count vs expected (especially Seq 15 = 7 only).
6. Whether email bodies look like placeholders vs real copy.
7. Merge tags present where expected (access_claim_link / REPORTLINK / RESUMELINK / Calendly links, etc.).
8. Dangerous overlaps / double-email risks (e.g. Seq 13 vs services pre-booking; Seq 15 vs any second education drip on nurture:brand-education; Post-Purchase duplicating Resend day-2/7/21).
9. Reminder tags reminder:purchase-start-2d|7d|21d must NOT trigger email automations.

## Also search account for these MISSING / optional automations

Report FOUND (with ID) or MISSING for each:

A) Managed Marketing Consult — Sales Assist — trigger mql:managed-marketing
B) Managed Marketing — No-show Rebook — trigger services:managed-marketing-no-show
C) AI Consulting Consult — Sales Assist — trigger mql:ai-consulting
D) AI Consulting — No-show Rebook — trigger services:ai-consulting-no-show
E) Managed Marketing — Pre-Booking Nurture — trigger services:managed_marketing (note overlap check vs Seq 13 ID 43)
F) AI Consulting — Pre-Booking Nurture — trigger services:consulting
G) Cancellation Recovery — triggers *:canceled (session:activation-canceled, services:managed-marketing-canceled, services:ai-consulting-canceled, call:expert-canceled)
H) Payment Failed Recovery — trigger payment:failed
I) Refund Win-Back — trigger purchase:refunded OR purchased:refunded
J) Talk to an Expert pre-call priming — trigger call:expert-scheduled (if separate from Seq 20)

## Output format

1. **Summary scorecard** — OK / Needs fix / Missing counts
2. **Per-automation table** — ID | Name | Status | Trigger OK? | Exit OK? | Copy OK? | Issues
3. **Missing automations list** — prioritized (P0 sales MQL, P1 cancel/no-show, P2 payment/refund)
4. **Fix list** — exact rename/repair actions for existing IDs (do not auto-apply yet)
5. **Create list** — prompts needed next (one automation at a time)

Do not create or modify anything until I approve the fix/create list.
```

