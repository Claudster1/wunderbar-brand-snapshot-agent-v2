# ActiveCampaign Automation Specifications

Complete specs for every nurture automation. Build these in the AC visual editor using tags and custom fields created by the setup script.

> **Setup**: Run `npx tsx scripts/setup-activecampaign.ts` first to create all tags and custom fields.

---

## Table of Contents

1. [Free Snapshot Nurture](#1-free-snapshot-nurture--upgrade-to-snapshot)
2. [Paid Onboarding — Snapshot+](#2-paid-onboarding--snapshot)
3. [Paid Onboarding — Blueprint](#3-paid-onboarding--blueprint)
4. [Paid Onboarding — Blueprint+](#4-paid-onboarding--blueprint)
5. [Abandoned Cart Recovery](#5-abandoned-cart-recovery)
6. [Quarterly Refresh Reminder](#6-quarterly-refresh-reminder)
7. [NPS Survey Follow-up](#7-nps-survey-follow-up)
8. [Promoter → Review & Testimonial](#8-promoter--review--testimonial)
9. [Detractor → Win-back / Retention](#9-detractor--win-back--retention)
10. [Save & Resume](#10-save--resume)
11. [Blueprint+ Strategy Session Reminder](#11-blueprint-strategy-session-reminder)
12. [Cross-sell — Services](#12-cross-sell--services)
13. [Referral Campaign](#13-referral-campaign)
14. [Annual Re-engagement](#14-annual-re-engagement)
15. [Talk to Expert — Post-Call Follow-up](#15-talk-to-expert--post-call-follow-up)
16. [Strategy Activation Session — Post-Session Follow-up](#16-strategy-activation-session--post-session-follow-up)

---

## Custom Field Reference

These fields are set on contacts automatically by the app and available for email personalization:

| Field | Description | Example |
|---|---|---|
| `%FIRSTNAME%` | AC built-in first name | Sarah |
| `%first_name_custom%` | Fallback first name | Sarah |
| `%product_purchased%` | Display name of purchased product | WunderBrand Snapshot+™ |
| `%product_key%` | Internal product key | snapshot_plus |
| `%report_link%` | URL to view their report | https://app.wunderbrand.ai/report/abc123 |
| `%dashboard_link%` | URL to their dashboard | https://app.wunderbrand.ai/dashboard |
| `%nps_survey_link%` | URL to NPS survey | https://app.wunderbrand.ai/nps?... |
| `%purchase_date%` | Date of purchase | 2026-01-26 |
| `%amount_paid%` | Amount paid | $497 |
| `%brand_alignment_score%` | Their overall score | 72 |
| `%weakest_pillar%` | Their weakest brand pillar | visibility |
| `%upgrade_product_name%` | Next tier product name | WunderBrand Blueprint™ |
| `%upgrade_product_url%` | URL to upgrade product page | https://wunderbardigital.com/brand-blueprint |
| `%upgrade_price%` | Price of upgrade | $997 |
| `%refresh_price%` | Quarterly refresh price | $47 |
| `%refresh_type%` | Free or paid refresh | paid |
| `%abandoned_product%` | Abandoned product name | WunderBrand Snapshot+™ |
| `%abandoned_product_url%` | URL to abandoned product page | https://wunderbardigital.com/brand-snapshot-plus |
| `%abandoned_product_price%` | Abandoned product price | $497 |
| `%resume_link%` | URL to resume saved diagnostic | https://app.wunderbrand.ai/?resume=abc123 |
| `%nps_score%` | NPS score (0-10) | 9 |
| `%nps_category%` | Promoter / Passive / Detractor | promoter |
| `%testimonial_link%` | Link to submit testimonial | https://app.wunderbrand.ai/nps?step=testimonial |
| `%google_review_url%` | Google review URL | https://g.page/... |
| `%services_url%` | Managed services page | https://wunderbardigital.com/talk-to-an-expert |

---

## 1. Free Snapshot Nurture → Upgrade to Snapshot+

**Trigger**: Tag `completed:snapshot` is added
**Goal**: Convert free users to Snapshot+ ($497)

| Step | Action | Details |
|---|---|---|
| 1 | **Email: "Your WunderBrand Snapshot™ results are ready"** | Use `%FIRSTNAME%`, `%report_link%`, `%brand_alignment_score%`, `%weakest_pillar%`. Show score, highlight weakest pillar, link to results. |
| 2 | Wait 2 days | — |
| 3 | **Email: "What your %weakest_pillar% score means"** | Educational content about their weakest pillar. Soft CTA to Snapshot+: `%upgrade_product_url%`. |
| 4 | Wait 3 days | — |
| 5 | **If/Else**: Has tag `purchased:snapshot-plus`? | **Yes** → End. **No** → Continue. |
| 6 | **Email: "Go deeper with %upgrade_product_name%"** | Show what Snapshot+ includes vs. free. Use `%upgrade_price%` and `%upgrade_product_url%`. |
| 7 | Wait 5 days | — |
| 8 | **If/Else**: Has tag `purchased:snapshot-plus`? | **Yes** → End. **No** → Continue. |
| 9 | **Email: "Last chance — exclusive Snapshot+ offer"** | Limited-time discount or bonus. Apply tag `nurture:snapshot-plus:final` for tracking. |
| 10 | Wait 14 days | — |
| 11 | **If/Else**: Has tag `purchased:snapshot-plus`? | **Yes** → End. **No** → Add tag `lifecycle:lead` and move to dormant list. |

**Exit conditions**: Contact purchases Snapshot+ (tag `purchased:snapshot-plus`), or 30 days elapse.

---

## 2. Paid Onboarding — Snapshot+

**Trigger**: Tag `onboarding:snapshot-plus` is added
**Goal**: Deliver value, collect NPS, nurture toward Blueprint

| Step | Action | Details |
|---|---|---|
| 1 | **Email: "Welcome! Your %product_purchased% results are ready"** | Use `%FIRSTNAME%`, `%report_link%`. Explain what they'll find, how to use it. |
| 2 | Wait 2 days | — |
| 3 | **Email: "How to get the most from your Snapshot+"** | Tips on using their results. Link to `%dashboard_link%`. |
| 4 | Wait 2 days | — |
| 5 | **Email: "Your NPS survey"** | Send `%nps_survey_link%`. Brief ask: "How likely are you to recommend?" |
| 6 | Wait 7 days | — |
| 7 | **If/Else**: Has tag `purchased:blueprint`? | **Yes** → End. **No** → Continue. |
| 8 | **Email: "Ready to go deeper? Introducing %upgrade_product_name%"** | Show Blueprint value. Use `%upgrade_product_url%`, `%upgrade_price%`. |
| 9 | Wait 7 days | — |
| 10 | **Email: "Your brand strategy roadmap awaits"** | Case study or value proof. Final upgrade nudge. |

**Exit conditions**: Contact purchases Blueprint (tag `purchased:blueprint`).

---

## 3. Paid Onboarding — Blueprint

**Trigger**: Tag `onboarding:blueprint` is added
**Goal**: Deliver value, collect NPS, nurture toward Blueprint+

| Step | Action | Details |
|---|---|---|
| 1 | **Email: "Welcome! Your %product_purchased% is ready"** | Use `%FIRSTNAME%`, `%report_link%`. Walk through what's included. |
| 2 | Wait 2 days | — |
| 3 | **Email: "Implementing your Blueprint: where to start"** | Actionable first steps based on their results. |
| 4 | Wait 2 days | — |
| 5 | **Email: "Your NPS survey"** | Send `%nps_survey_link%`. |
| 6 | Wait 7 days | — |
| 7 | **If/Else**: Has tag `purchased:blueprint-plus`? | **Yes** → End. **No** → Continue. |
| 8 | **Email: "Level up with %upgrade_product_name%"** | Highlight Blueprint+ extras (strategy session, advanced prompts). Use `%upgrade_product_url%`, `%upgrade_price%`. |
| 9 | Wait 7 days | — |
| 10 | **Email: "Get expert guidance with Blueprint+"** | Emphasize the strategy activation session. Final upgrade CTA. |

**Exit conditions**: Contact purchases Blueprint+ (tag `purchased:blueprint-plus`).

---

## 4. Paid Onboarding — Blueprint+

**Trigger**: Tag `onboarding:blueprint-plus` is added
**Goal**: Maximize engagement, book strategy session, collect NPS, nurture to services

| Step | Action | Details |
|---|---|---|
| 1 | **Email: "Welcome! Your %product_purchased% is ready"** | Use `%FIRSTNAME%`, `%report_link%`. Highlight strategy session. |
| 2 | Wait 1 day | — |
| 3 | **If/Else**: Has tag `session:booked`? | **Yes** → Skip to step 6. **No** → Continue. |
| 4 | **Email: "Don't forget to book your strategy session"** | Booking link/instructions. Urgency. |
| 5 | Wait 3 days | — |
| 6 | **Email: "Getting the most from your Blueprint+"** | Implementation tips. Link to `%dashboard_link%`. |
| 7 | Wait 3 days | — |
| 8 | **Email: "Your NPS survey"** | Send `%nps_survey_link%`. |
| 9 | Wait 14 days | — |
| 10 | **Email: "Ready for the next step? Our managed services"** | Introduce managed marketing / AI consulting. Use `%services_url%`. |

**Exit conditions**: 30 days complete (lifecycle continues with services nurture).

---

## 5. Abandoned Cart Recovery

**Trigger**: Tag `checkout:abandoned` is added
**Goal**: Recover the sale

| Step | Action | Details |
|---|---|---|
| 1 | Wait 1 hour | — |
| 2 | **If/Else**: Has tag `purchased:snapshot-plus` OR `purchased:blueprint` OR `purchased:blueprint-plus`? | **Yes** → End (they completed purchase). **No** → Continue. |
| 3 | **Email: "You left something behind"** | Use `%FIRSTNAME%`, `%abandoned_product%`, `%abandoned_product_price%`. Soft reminder with product benefits. |
| 4 | Wait 1 day | — |
| 5 | **If/Else**: Has any purchased tag? | **Yes** → End. **No** → Continue. |
| 6 | **Email: "Still thinking about %abandoned_product%?"** | Address common objections. Social proof / testimonials. Link to `%abandoned_product_url%`. |
| 7 | Wait 2 days | — |
| 8 | **If/Else**: Has any purchased tag? | **Yes** → End. **No** → Continue. |
| 9 | **Email: "Last chance — exclusive offer"** | Limited-time discount or bonus for `%abandoned_product%`. |
| 10 | Remove tag `checkout:abandoned` | Clean up. |

**Exit conditions**: Contact completes purchase, or 4 days elapse.

---

## 6. Quarterly Refresh Reminder

**Trigger**: Tag `refresh:eligible` is added
**Goal**: Drive repeat purchases every 90 days

| Step | Action | Details |
|---|---|---|
| 1 | Wait 80 days | — |
| 2 | **Email: "Time for your quarterly brand refresh"** | Use `%FIRSTNAME%`, `%product_purchased%`. Explain why refreshing matters. Include `%refresh_price%` (or "free" for Blueprint+). |
| 3 | Wait 5 days | — |
| 4 | **If/Else**: Has tag `purchased:snapshot-plus-refresh` OR `purchased:blueprint-refresh`? | **Yes** → End. **No** → Continue. |
| 5 | **Email: "Your brand has evolved — has your strategy?"** | More urgency. Market changes since their last diagnostic. |
| 6 | Wait 5 days | — |
| 7 | **Email: "Final reminder: refresh your brand diagnostic"** | Last touch. Show comparison opportunity (new vs. old scores). |
| 8 | Go to step 1 | Loop: restarts the 90-day cycle. |

**Note**: Blueprint+ users have free refreshes — the email should say "complimentary" not a price.

---

## 7. NPS Survey Follow-up

**Trigger**: Event `nps_submitted`
**Goal**: Act on feedback

| Step | Action | Details |
|---|---|---|
| 1 | **If/Else**: `%nps_category%` = "promoter" | **Yes** → Go to [Automation 8](#8-promoter--review--testimonial). **No** → Continue. |
| 2 | **If/Else**: `%nps_category%` = "detractor" | **Yes** → Go to [Automation 9](#9-detractor--win-back--retention). **No** → Continue (passive). |
| 3 | **Email: "Thanks for your feedback"** | For passives. Ask what would make it a 9 or 10. Offer to help. |

---

## 8. Promoter → Review & Testimonial

**Trigger**: Tag `review:eligible` is added
**Goal**: Capture social proof

| Step | Action | Details |
|---|---|---|
| 1 | Wait 1 day | — |
| 2 | **Email: "We're thrilled you love it! Would you share?"** | Ask for Google review (`%google_review_url%`). Offer testimonial opportunity (`%testimonial_link%`). |
| 3 | Wait 3 days | — |
| 4 | **If/Else**: Has tag `testimonial:submitted`? | **Yes** → Send thank you email. **No** → Continue. |
| 5 | **Email: "Quick reminder — your review means the world"** | Gentle nudge. Emphasize it takes 30 seconds. |
| 6 | Wait 7 days | — |
| 7 | **If/Else**: Has tag `case-study:interested`? | **Yes** → Notify team (internal notification). Add to case study pipeline list. |

---

## 9. Detractor → Win-back / Retention

**Trigger**: Tag `retention:at-risk` is added
**Goal**: Recover relationship, understand issues

| Step | Action | Details |
|---|---|---|
| 1 | **Internal notification** | Alert team via Slack or email about at-risk customer. |
| 2 | Wait 1 day | — |
| 3 | **Email: "We'd love to make this right"** | Personal-feeling email from founder. Ask what went wrong. Offer to help. |
| 4 | Wait 3 days | — |
| 5 | **Email: "Here's how we can improve your experience"** | Share resources. Offer 1:1 call via `%services_url%`. |

---

## 10. Save & Resume

**Trigger**: Event `assessment_paused`
**Goal**: Bring user back to complete the diagnostic

| Step | Action | Details |
|---|---|---|
| 1 | **Email: "Pick up where you left off"** | Use `%FIRSTNAME%`, `%resume_link%`. Brief, clear, single CTA. |
| 2 | Wait 1 day | — |
| 3 | **If/Else**: Has tag `completed:snapshot` OR any `purchased:*` tag? | **Yes** → End. **No** → Continue. |
| 4 | **Email: "Your brand diagnostic is waiting"** | Remind them what they'll get. Use `%resume_link%`. |
| 5 | Wait 3 days | — |
| 6 | **If/Else**: Has any completion/purchase tag? | **Yes** → End. **No** → Continue. |
| 7 | **Email: "Last reminder — complete your WunderBrand Snapshot™"** | Final nudge. Results take 15 minutes. |

---

## 11. Blueprint+ Strategy Session Reminder

**Trigger**: Tag `session:pending` is added
**Goal**: Get them to book and attend their strategy session

| Step | Action | Details |
|---|---|---|
| 1 | Wait 2 days | — |
| 2 | **If/Else**: Has tag `session:booked`? | **Yes** → End. **No** → Continue. |
| 3 | **Email: "Your strategy activation session is included!"** | Use `%FIRSTNAME%`. Explain value. Provide booking link. |
| 4 | Wait 3 days | — |
| 5 | **If/Else**: Has tag `session:booked`? | **Yes** → End. **No** → Continue. |
| 6 | **Email: "Don't miss your complimentary strategy session"** | Urgency: sessions are limited. |
| 7 | Wait 5 days | — |
| 8 | **Email: "Final reminder — book your strategy session"** | Last chance before session availability expires. |

---

## 12. Cross-sell — Services

**Trigger**: Tag `nurture:other-services` is added
**Goal**: Convert Blueprint+ buyers into managed services clients

| Step | Action | Details |
|---|---|---|
| 1 | Wait 21 days | (After they've had time with their Blueprint+) |
| 2 | **Email: "Ready to implement your Blueprint?"** | Introduce managed marketing services. Use `%services_url%`. |
| 3 | Wait 7 days | — |
| 4 | **Email: "How our clients are implementing their Blueprints"** | Case study / success story. |
| 5 | Wait 7 days | — |
| 6 | **Email: "Let's talk about your brand implementation"** | Direct CTA to book a call. Use `%services_url%`. |

---

## 13. Referral Campaign

**Trigger**: Tag `lifecycle:advocate` is added (apply manually or after promoter + testimonial)
**Goal**: Generate referrals

| Step | Action | Details |
|---|---|---|
| 1 | **Email: "Share the love — refer a colleague"** | Referral link/code. Explain what the referred person gets. |
| 2 | Wait 30 days | — |
| 3 | **Email: "Know someone who needs a brand checkup?"** | Gentle re-ask. |

**Note**: Apply `lifecycle:advocate` tag manually or create a rule: has `nps:promoter` AND `testimonial:submitted`.

---

## 14. Annual Re-engagement

**Trigger**: Date-based — 11 months after `%purchase_date%`
**Goal**: Bring dormant customers back

| Step | Action | Details |
|---|---|---|
| 1 | **Email: "It's been a year — how has your brand evolved?"** | Use `%FIRSTNAME%`, `%product_purchased%`. Offer a re-diagnostic at a loyalty discount. |
| 2 | Wait 7 days | — |
| 3 | **Email: "New features since your last visit"** | Highlight new products or improvements. |
| 4 | Wait 7 days | — |
| 5 | **Email: "Your brand deserves a fresh look"** | Final re-engagement CTA. |

---

## Event Reference

Events fired by the app (use as automation triggers in AC):

| Event Name | When Fired | Key Fields |
|---|---|---|
| `free_report_ready` | Free Snapshot completed | `first_name`, `report_link`, `brand_alignment_score`, `weakest_pillar`, `upgrade_product_name`, `upgrade_price` |
| `report_ready` | Paid product completed | `first_name`, `product_name`, `report_link`, `nps_survey_link`, `purchase_date`, `amount_paid`, `refresh_price`, `upgrade_product_name`, `upgrade_price` |
| `refresh_report_ready` | Quarterly refresh completed | `first_name`, `product_name`, `report_link`, `dashboard_link` |
| `checkout_abandoned` | Stripe checkout expired | `first_name`, `abandoned_product`, `abandoned_product_url`, `abandoned_product_price` |
| `assessment_paused` | User saves and exits diagnostic | `first_name`, `resume_link`, `product_tier` |
| `nps_submitted` | NPS survey completed | `nps_score`, `nps_category`, `nps_tier`, `testimonial_link`, `google_review_url` |
| `testimonial_submitted` | Testimonial submitted | Set via `/api/testimonial` route |

---

## Tag Quick Reference

| Category | Tags |
|---|---|
| **Purchase** | `purchased:snapshot-plus`, `purchased:blueprint`, `purchased:blueprint-plus`, `purchased:snapshot-plus-refresh`, `purchased:blueprint-refresh` |
| **Onboarding** | `onboarding:snapshot`, `onboarding:snapshot-plus`, `onboarding:blueprint`, `onboarding:blueprint-plus` |
| **Completion** | `completed:snapshot` |
| **Upgrade Intent** | `intent:upgrade-snapshot-plus`, `intent:upgrade-blueprint`, `intent:upgrade-blueprint-plus` |
| **Refresh** | `refresh:eligible`, `refresh:snapshot-plus-ready`, `refresh:blueprint-ready` |
| **Session** | `session:pending`, `session:booked`, `session:completed` |
| **Abandonment** | `checkout:abandoned`, `checkout:abandoned:snapshot_plus`, `checkout:abandoned:blueprint`, `checkout:abandoned:blueprint_plus` |
| **NPS** | `nps:promoter`, `nps:passive`, `nps:detractor` + tier variants |
| **Reviews** | `review:eligible`, `testimonial:eligible`, `testimonial:submitted`, `testimonial:publishable`, `case-study:interested` |
| **Retention** | `retention:at-risk` |
| **Cross-sell** | `nurture:other-services` |
| **Lifecycle** | `lifecycle:lead`, `lifecycle:customer`, `lifecycle:advocate`, `lifecycle:at-risk` |
| **Resume** | `snapshot:paused`, `snapshot:resume-link-sent` |
| **Calls/Sessions** | `call:expert-completed`, `call:expert-scheduled`, `session:activation-completed`, `session:activation-scheduled`, `followup:pending-review`, `followup:sent-talk-to-expert`, `followup:sent-activation-session` |

---

## 15. Talk to Expert — Post-Call Follow-up

**Purpose**: After a "Talk to an Expert" consultation call, automatically generate a personalized follow-up email from the Otter.ai transcript, queue it for human review, and send it once approved.

### How It Works (Technical Flow)

```
1. Prospect books "Talk to an Expert" via Calendly
   → Calendly webhook → POST /api/calendly/webhook
   → Tags: call:expert-scheduled
   → Fields: last_call_type, last_call_date

2. Call happens, Otter.ai creates transcript
   → Otter.ai → Zapier → POST /api/session/process-transcript
   → OpenAI generates personalized follow-up email
   → Stored in session_followups table (status: pending_review)
   → Tags: call:expert-completed, followup:pending-review

3. Admin reviews in the review queue
   → GET /api/session/followups (list pending)
   → GET /api/session/followups/[id] (view detail + transcript)
   → PATCH /api/session/followups (action: edit — save edits)
   → PATCH /api/session/followups (action: regenerate — re-run AI)
   → PATCH /api/session/followups (action: approve — send via AC)

4. On approval:
   → Tags: followup:sent-talk-to-expert
   → Fields: followup_subject, followup_body, followup_sent_date
   → Event: expert_call_followup_ready → triggers AC automation
```

### ActiveCampaign Automation

**Trigger**: Event `expert_call_followup_ready`

| Step | Action |
|------|--------|
| 1 | **Send email**: "Post-Call Follow-up" — uses `%FOLLOWUP_BODY%` for the personalized content and `%FOLLOWUP_SUBJECT%` as the subject line |
| 2 | **Wait** 3 days |
| 3 | **If/Else**: Has tag `purchased:*`? |
| 4a | **Yes** → End (they bought something) |
| 4b | **No** → **Send email**: "Quick follow-up" — reference their specific pain points from the call, soft CTA to book or purchase |
| 5 | **Wait** 7 days |
| 6 | **If/Else**: Has tag `purchased:*`? |
| 7a | **Yes** → End |
| 7b | **No** → **Send email**: "Thought of you" — share a relevant resource/case study, mention their specific situation |
| 8 | Apply tag: `nurture:other-services` (enters services cross-sell if not purchased within 10 days) |

**Personalization fields**:
- `%FIRST_NAME_CUSTOM%` — their first name
- `%FOLLOWUP_SUBJECT%` — AI-generated subject line
- `%FOLLOWUP_BODY%` — AI-generated email body (HTML)
- `%LAST_CALL_STRATEGIST%` — who they spoke with
- `%LAST_CALL_DATE%` — when the call happened

**Goal**: Contact purchases any product → exit automation

**Exit conditions**: Purchases any product, or completes the 3-email sequence

---

## 16. Strategy Activation Session — Post-Session Follow-up

**Purpose**: After a Blueprint+ Strategy Activation Session, generate a comprehensive personalized follow-up (this is a deliverable the customer paid for) from the Otter.ai transcript, queue it for review, and send once approved.

### How It Works (Technical Flow)

```
1. Blueprint+ customer books Strategy Activation Session via Calendly
   → Calendly webhook → POST /api/calendly/webhook
   → Tags: session:activation-scheduled, session:booked
   → Fields: last_call_type, last_call_date

2. Session happens, Otter.ai creates transcript
   → Otter.ai → Zapier → POST /api/session/process-transcript
   → session_type: "activation_session"
   → OpenAI generates comprehensive follow-up (30/60/90-day plan, action items, prompt recommendations)
   → Stored in session_followups table (status: pending_review)
   → Tags: session:activation-completed, session:completed, followup:pending-review

3. Admin reviews and edits (this is premium content — take extra care)
   → Same review queue as Talk to Expert
   → PATCH /api/session/followups (action: edit, regenerate, or approve)

4. On approval:
   → Tags: followup:sent-activation-session
   → Fields: followup_subject, followup_body, followup_session_type, followup_sent_date
   → Event: activation_session_followup_ready → triggers AC automation
```

### ActiveCampaign Automation

**Trigger**: Event `activation_session_followup_ready`

| Step | Action |
|------|--------|
| 1 | **Send email**: "Your Strategy Activation Recap" — uses `%FOLLOWUP_BODY%` for the full personalized deliverable. Subject: `%FOLLOWUP_SUBJECT%`. This is the primary deliverable email. |
| 2 | **Wait** 3 days |
| 3 | **Send email**: "How's your action plan going?" — check-in, offer to clarify anything from the session, remind them of their first 30-day priorities |
| 4 | **Wait** 14 days |
| 5 | **Send email**: "30-Day Check-in" — reference their 30-day milestones from the action plan, ask how it's going, soft CTA for Managed Marketing if they need execution help |
| 6 | **Wait** 30 days |
| 7 | **Send email**: "60-Day Milestone" — celebrate progress, reference their 60-day goals, mention AI Consulting if they're implementing AI recommendations |
| 8 | **Wait** 30 days |
| 9 | **Send email**: "90-Day Strategy Review" — congratulate on completing the initial plan, CTA to book a paid follow-up session or explore Managed Marketing |
| 10 | Apply tag: `nurture:other-services` |

**Personalization fields**:
- `%FIRST_NAME_CUSTOM%` — their first name
- `%FOLLOWUP_SUBJECT%` — AI-generated subject line
- `%FOLLOWUP_BODY%` — AI-generated comprehensive follow-up (HTML)
- `%LAST_CALL_STRATEGIST%` — the strategist who ran the session
- `%LAST_CALL_DATE%` — session date
- `%PRODUCT_PURCHASED%` — "WunderBrand Blueprint+™"

**Goal**: Contact books Managed Marketing or AI Consulting → exit automation

**Exit conditions**: Purchases services package, or completes the 5-email sequence

---

## New Custom Fields (Calls/Sessions)

These are set automatically by the app when processing transcripts:

| Field | Type | Set By | Description |
|-------|------|--------|-------------|
| `last_call_type` | text | Calendly webhook, process-transcript | "Talk to an Expert" or "Strategy Activation Session" |
| `last_call_date` | text | Calendly webhook, process-transcript | Date of the call (YYYY-MM-DD) |
| `last_call_strategist` | text | process-transcript | Name of the team member on the call |
| `followup_subject` | text | followups (on approve) | AI-generated email subject line |
| `followup_body` | textarea | followups (on approve) | AI-generated email body (HTML) |
| `followup_session_type` | text | followups (on approve) | "Talk to an Expert" or "Strategy Activation Session" |
| `followup_sent_date` | text | followups (on approve) | Date the follow-up was sent |

## New Events (Calls/Sessions)

| Event | Fired By | Purpose |
|-------|----------|---------|
| `expert_call_booked` | Calendly webhook | Prospect booked a Talk to Expert call |
| `activation_session_booked` | Calendly webhook | Blueprint+ customer booked their session |
| `expert_call_followup_ready` | Admin approves follow-up | Triggers the post-call email sequence |
| `activation_session_followup_ready` | Admin approves follow-up | Triggers the post-session email sequence |

---

## Setup Checklist

1. Run `npx tsx scripts/setup-activecampaign.ts` to create all tags + fields
2. Build each automation above in the AC visual builder
3. Set the Stripe webhook in Stripe Dashboard → Developers → Webhooks
4. Set env vars: `ACTIVE_CAMPAIGN_API_URL`, `ACTIVE_CAMPAIGN_API_KEY`, `ACTIVECAMPAIGN_WEBHOOK_URL`
5. Test each flow end-to-end with a test contact
6. Set `NEXT_PUBLIC_GOOGLE_REVIEW_URL` for the review CTA
7. Optional: Set `SLACK_SALES_WEBHOOK_URL` for purchase notifications
8. **NEW**: Set up Calendly webhook → `POST /api/calendly/webhook` (set `CALENDLY_WEBHOOK_SECRET`)
9. **NEW**: Set up Otter.ai → Zapier → `POST /api/session/process-transcript` (set `ZAPIER_WEBHOOK_SECRET`)
10. **NEW**: Set `ADMIN_API_KEY` for the follow-up review queue API
