# ActiveCampaign Automation Specifications

> **Nurture Sequences 1–19**: See [NURTURE_IMPLEMENTATION_GUIDE.md](./NURTURE_IMPLEMENTATION_GUIDE.md) for complete triggers, tags, merge fields, timing, and build notes for all 19 nurture sequences. Production copy lives in the batch documents.
>
> **This file** covers: custom field reference, session/call automations (post-call follow-ups, no-show recovery), event reference, and tag reference.

---

## Table of Contents

1. [Custom Field Reference](#custom-field-reference)
2. [Nurture Sequence Overview](#nurture-sequence-overview)
3. [Talk to Expert — Post-Call Follow-up](#talk-to-expert--post-call-follow-up)
4. [Strategy Activation Session — Post-Session Follow-up](#strategy-activation-session--post-session-follow-up)
5. [Event Reference](#event-reference)
6. [Tag Quick Reference](#tag-quick-reference)
7. [Setup Checklist](#setup-checklist)

---

## Custom Field Reference

These fields are set on contacts automatically by the app and available for email personalization:

### Contact & Score Fields

| Field | Description | Example |
|---|---|---|
| `%FIRSTNAME%` | AC built-in first name | Sarah |
| `%COMPANY_NAME%` | Company/brand name | Acme Consulting |
| `%BRAND_ALIGNMENT_SCORE%` | Overall WunderBrand Score (0–100) | 72 |
| `%POSITIONING_SCORE%` | Positioning pillar score (0–20) | 14 |
| `%MESSAGING_SCORE%` | Messaging pillar score (0–20) | 12 |
| `%VISIBILITY_SCORE%` | Visibility pillar score (0–20) | 15 |
| `%CREDIBILITY_SCORE%` | Credibility pillar score (0–20) | 16 |
| `%CONVERSION_SCORE%` | Conversion pillar score (0–20) | 15 |
| `%PRIMARY_PILLAR%` | Weakest/primary pillar name | messaging |

### Product & Purchase Fields

| Field | Description | Example |
|---|---|---|
| `%PRODUCT_NAME%` | Display name of purchased product | WunderBrand Snapshot+™ |
| `%PRODUCT_KEY%` | Internal product key | snapshot_plus |
| `%PURCHASE_DATE%` | Date of purchase | 2026-01-26 |
| `%AMOUNT_PAID%` | Amount paid | $497 |
| `%UPGRADE_PRODUCT_NAME%` | Next tier product name | WunderBrand Blueprint™ |
| `%UPGRADE_PRODUCT_URL%` | URL to upgrade product page | https://wunderbardigital.com/brand-blueprint |

### Link Fields

| Field | Description | Used In |
|---|---|---|
| `%REPORT_LINK%` | Direct link to report/results | Seq 1, 3, 5, 12, 16, 17 |
| `%DASHBOARD_LINK%` | Link to dashboard | Seq 4, 8, 16, 17, 18 |
| `%START_DIAGNOSTIC_LINK%` | Link to start/resume diagnostic | Seq 4 |
| `%RESUME_LINK%` | Link to resume paused diagnostic | Seq 9 |
| `%EXPERIENCE_SURVEY_LINK%` | WunderBrand Experience Survey link | Seq 5 |
| `%UPGRADE_PRODUCT_URL%` | Link to purchase next tier | Seq 1, 3, 6, 7, 17 |
| `%SERVICES_URL%` | Link to services page | Seq 17, 18, 19 |
| `%REFRESH_ACTION_URL%` | Link to purchase quarterly refresh | Seq 17 |
| `%ABANDONED_PRODUCT_URL%` | Link back to checkout | Seq 2 |
| `%CONTENT_DOWNLOAD_LINK%` | Link to download lead magnet | Seq 14 |
| `%TESTIMONIAL_LINK%` | Link to submit testimonial | — |
| `%GOOGLE_REVIEW_URL%` | Google review URL | — |

### Experience Score Fields

| Field | Description | Example |
|---|---|---|
| `%EXPERIENCE_SCORE%` | WunderBrand Experience Score (0–10) | 9 |
| `%EXPERIENCE_CATEGORY%` | Promoter / Passive / Detractor | promoter |

### Abandoned Cart Fields

| Field | Description |
|---|---|
| `%ABANDONED_PRODUCT%` | Name of the product they abandoned |
| `%ABANDONED_PRODUCT_URL%` | Link back to checkout |

### Session/Call Fields

| Field | Type | Set By | Description |
|---|---|---|---|
| `last_call_type` | text | Calendly webhook, process-transcript | "Talk to an Expert" or "Strategy Activation Session" |
| `last_call_date` | text | Calendly webhook, process-transcript | Date of the call (YYYY-MM-DD) |
| `last_call_strategist` | text | process-transcript | Name of the team member on the call |
| `followup_subject` | text | followups (on approve) | AI-generated email subject line |
| `followup_body` | textarea | followups (on approve) | AI-generated email body (HTML) |
| `followup_session_type` | text | followups (on approve) | "Talk to an Expert" or "Strategy Activation Session" |
| `followup_sent_date` | text | followups (on approve) | Date the follow-up was sent |
| `last_noshow_type` | text | Calendly webhook | "Talk to an Expert" or "Strategy Activation Session" |
| `last_noshow_date` | text | Calendly webhook | Date of the no-show (YYYY-MM-DD) |

---

## Nurture Sequence Overview

All 19 nurture sequences are documented in [NURTURE_IMPLEMENTATION_GUIDE.md](./NURTURE_IMPLEMENTATION_GUIDE.md). Here is the sequence map for quick reference:

| # | Name | Trigger | Emails |
|---|------|---------|--------|
| 1 | Free Snapshot → Snapshot+ Upgrade | `purchased:snapshot` + `intent:upgrade-snapshot-plus` | 5 |
| 2 | Checkout Abandoned | `checkout:abandoned` + product tag | 3 |
| 3 | Coverage Gap Nudge | `snapshot:coverage-gap` | 2 |
| 4 | Purchase Welcome | Event `start_diagnostic` + `product_key` | 4 × 3 variants |
| 5 | Report Ready | `report:*-ready` tag | 3 × 3 variants |
| 6 | Snapshot+ → Blueprint Upgrade | `intent:upgrade-blueprint` | 4 |
| 7 | Blueprint → Blueprint+ Upgrade | `intent:upgrade-blueprint-plus` | 4 |
| 8 | Quarterly Refresh | `refresh:eligible` | 3 |
| 9 | Diagnostic Paused | `snapshot:paused` + `snapshot:resume-link-sent` | 3 |
| 10 | Session No-Show Recovery | `noshow:needs-followup` + no-show tag | 2 |
| 11 | Experience Score Follow-up | `experience:*` tag | 2 × 3 branches |
| 12 | Session Booking (B+) | `session:pending` + `report:blueprint-plus-ready` | 3 |
| 13 | Services Interest | `intent:services` | 2 |
| 14 | Content Opt-In Welcome | `content:opt-in` | 2 |
| 15 | Evergreen Education | Exits conversion sequences | 10 |
| 16 | It's Wunderbar Newsletter | `content:opted_in` | Ongoing |
| 17 | Customer Retention | 30d after report | 8 |
| 18 | Win-Back | 90d+ since report | 3 |
| 19 | Services Cross-Sell | 45d+ as customer + signal | 4 |

---

## Talk to Expert — Post-Call Follow-up

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
| 1 | **Send email**: uses `%FOLLOWUP_BODY%` and `%FOLLOWUP_SUBJECT%` |
| 2 | **Wait** 3 days |
| 3 | **If/Else**: Has tag `purchased:*`? |
| 4a | **Yes** → End |
| 4b | **No** → **Send email**: reference pain points, soft CTA |
| 5 | **Wait** 7 days |
| 6 | **If/Else**: Has tag `purchased:*`? |
| 7a | **Yes** → End |
| 7b | **No** → **Send email**: relevant resource/case study |
| 8 | Apply tag: `nurture:other-services` |

**Goal**: Contact purchases any product → exit automation

---

## Strategy Activation Session — Post-Session Follow-up

**Purpose**: After a Blueprint+ Strategy Activation Session, generate a comprehensive personalized follow-up from the Otter.ai transcript, queue it for review, and send once approved. This is a deliverable the customer paid for.

### How It Works (Technical Flow)

```
1. Blueprint+ customer books Strategy Activation Session via Calendly
   → Calendly webhook → POST /api/calendly/webhook
   → Tags: session:activation-scheduled, session:booked
   → Fields: last_call_type, last_call_date

2. Session happens, Otter.ai creates transcript
   → Otter.ai → Zapier → POST /api/session/process-transcript
   → session_type: "activation_session"
   → OpenAI generates comprehensive follow-up (30/60/90-day plan)
   → Stored in session_followups table (status: pending_review)
   → Tags: session:activation-completed, session:completed, followup:pending-review

3. Admin reviews and edits (premium content — take extra care)
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
| 1 | **Send email**: "Your Strategy Activation Recap" — `%FOLLOWUP_BODY%` / `%FOLLOWUP_SUBJECT%` |
| 2 | **Wait** 3 days |
| 3 | **Send email**: "How's your action plan going?" — check-in, 30-day priorities |
| 4 | **Wait** 14 days |
| 5 | **Send email**: "30-Day Check-in" — reference milestones, soft CTA for Managed Marketing |
| 6 | **Wait** 30 days |
| 7 | **Send email**: "60-Day Milestone" — celebrate progress, mention AI Consulting |
| 8 | **Wait** 30 days |
| 9 | **Send email**: "90-Day Strategy Review" — CTA for paid follow-up or Managed Marketing |
| 10 | Apply tag: `nurture:other-services` |

**Goal**: Contact books Managed Marketing or AI Consulting → exit automation

---

## Event Reference

Events fired by the app (use as automation triggers in AC):

| Event Name | When Fired | Key Fields |
|---|---|---|
| `free_report_ready` | Free Snapshot completed | `first_name`, `report_link`, `brand_alignment_score`, `weakest_pillar`, `upgrade_product_name`, `upgrade_price` |
| `report_ready` | Paid product completed | `first_name`, `product_name`, `report_link`, `experience_survey_link`, `purchase_date`, `amount_paid`, `refresh_price`, `upgrade_product_name`, `upgrade_price` |
| `start_diagnostic` | Purchase completed, diagnostic ready | `first_name`, `product_key`, `start_diagnostic_link` |
| `refresh_report_ready` | Quarterly refresh completed | `first_name`, `product_name`, `report_link`, `dashboard_link` |
| `checkout_abandoned` | Stripe checkout expired | `first_name`, `abandoned_product`, `abandoned_product_url`, `abandoned_product_price` |
| `assessment_paused` | User saves and exits diagnostic | `first_name`, `resume_link`, `product_tier` |
| `experience_survey_submitted` | WunderBrand Experience Survey completed | `experience_score`, `experience_category`, `experience_tier`, `testimonial_link`, `google_review_url` |
| `testimonial_submitted` | Testimonial submitted | Set via `/api/testimonial` route |
| `expert_call_booked` | Prospect booked Talk to Expert | Calendly webhook |
| `activation_session_booked` | B+ customer booked Strategy Session | Calendly webhook |
| `expert_call_followup_ready` | Admin approves post-call follow-up | Triggers post-call sequence |
| `activation_session_followup_ready` | Admin approves post-session follow-up | Triggers post-session sequence |
| `expert_call_no_show` | Prospect no-shows expert call | Calendly webhook |
| `activation_session_no_show` | Customer no-shows Strategy Session | Calendly webhook |

---

## Tag Quick Reference

| Category | Tags |
|---|---|
| **Purchase** | `purchased:snapshot`, `purchased:snapshot-plus`, `purchased:blueprint`, `purchased:blueprint-plus`, `purchased:snapshot-plus-refresh`, `purchased:blueprint-refresh`, `purchased:refunded` |
| **Intent / Upgrade** | `intent:upgrade-snapshot-plus`, `intent:upgrade-blueprint`, `intent:upgrade-blueprint-plus`, `intent:services`, `nurture:other-services` |
| **Report Ready** | `completed:snapshot`, `report:snapshot-ready`, `report:snapshot-plus-ready`, `report:blueprint-ready`, `report:blueprint-plus-ready` |
| **Checkout** | `checkout:initiated`, `checkout:abandoned`, `checkout:abandoned:snapshot_plus`, `checkout:abandoned:blueprint`, `checkout:abandoned:blueprint_plus` |
| **Payment** | `payment:failed` |
| **Behavior** | `snapshot:completed`, `snapshot:viewed-results`, `snapshot:return-visit`, `snapshot:clicked-upgrade`, `snapshot:coverage-gap`, `snapshot:paused`, `snapshot:resume-link-sent` |
| **Experience Score** | `experience:promoter`, `experience:passive`, `experience:detractor` |
| **Session** | `session:pending`, `session:activation-scheduled`, `session:activation-canceled`, `session:activation-no-show`, `session:activation-completed` |
| **Calls** | `call:expert-scheduled`, `call:expert-canceled`, `call:expert-no-show`, `call:expert-completed` |
| **Follow-up** | `followup:send`, `followup:pending-review`, `followup:sent-talk-to-expert`, `followup:sent-activation-session` |
| **Content** | `content:opt-in`, `content:opted_in`, `content:marketing_trends`, `content:ai_updates` |
| **Services** | `services:interested`, `services:managed_marketing`, `services:consulting`, `services:expert_call_requested`, `services:call-booked`, `services:client-active` |
| **Refresh** | `refresh:eligible`, `refresh:60-day-reminder`, `refresh:30-day-reminder`, `refresh:7-day-reminder`, `refresh:window-expired` |
| **No-Show** | `noshow:needs-followup`, `noshow:rescheduled` |
| **Retention** | `retention:at-risk` |
| **Lifecycle** | `lifecycle:lead`, `lifecycle:customer`, `lifecycle:advocate`, `lifecycle:at-risk`, `evergreen:complete` |
| **Onboarding** | `onboarding:snapshot`, `onboarding:snapshot-plus`, `onboarding:blueprint`, `onboarding:blueprint-plus` |
| **Support** | `support:new_request` |

---

## Setup Checklist

1. Create all custom fields in AC Settings → Fields (use [ACTIVECAMPAIGN_COMPLETE_SETUP.md](./ACTIVECAMPAIGN_COMPLETE_SETUP.md) for field IDs and env vars)
2. Create all tags in AC Settings → Tags (exact spelling required, including colons)
3. Set Stripe webhook in Stripe Dashboard → Developers → Webhooks
4. Set env vars: `ACTIVE_CAMPAIGN_API_URL`, `ACTIVE_CAMPAIGN_API_KEY`
5. Build all 19 nurture automations per [NURTURE_IMPLEMENTATION_GUIDE.md](./NURTURE_IMPLEMENTATION_GUIDE.md)
6. Build post-call and post-session follow-up automations (see above)
7. Set up Calendly webhook → `POST /api/calendly/webhook` — subscribe to `invitee.created`, `invitee.canceled`, `invitee.no_show` events (set `CALENDLY_WEBHOOK_SECRET`)
8. Set up Otter.ai → Zapier → `POST /api/session/process-transcript` (set `ZAPIER_WEBHOOK_SECRET`)
9. Set `ADMIN_API_KEY` for the follow-up review queue
10. Set `NEXT_PUBLIC_GOOGLE_REVIEW_URL` for the review CTA
11. Replace `CALENDLY_LINK` and `CALENDLY_SERVICES_LINK` placeholders in email copy with live URLs
12. Test each flow end-to-end with a test contact
