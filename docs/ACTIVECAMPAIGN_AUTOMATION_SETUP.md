# ActiveCampaign Automation Setup Guide

Complete setup instructions for the Brand Snapshot™ email sequence.

## Automation Trigger

**Trigger Options:**
1. **Tag is added:** `brand_snapshot_completed` (Recommended)
2. **Form submission:** Brand Snapshot Report Request form

**Settings:**
- **Runs:** Once per contact
- **Trigger:** When tag is added OR form is submitted

## Email Sequence Timing

| Email # | Timing | Purpose |
|---------|--------|---------|
| 1 | Immediately | Deliver summary results |
| 2 | +1 day | Expand insights + interpret results |
| 3 | +2 days | AI tools tailored to their weakest pillar |
| 4 | +4 days | Supportive check-in |
| 5 | +6 days | Introduction to Snapshot+™ (upsell #1) |
| 6 | +9 days | Educational deep dive + benefits (upsell #2) |
| 7 | +12 days | Final reminder + light urgency |

## Automation Flow Structure

```
START
  ↓
Send Email 1 (Snapshot Summary)
  ↓
Wait 1 day
  ↓
Send Email 2 (Deeper Insights)
  ↓
Wait 1 day
  ↓
Send Email 3 (AI Tools)
  ↓
Wait 2 days
  ↓
Send Email 4 (Check-in)
  ↓
Wait 2 days
  ↓
IF contact does NOT have tag: snapshot_plus_purchased
  ↓
  Send Email 5 (Snapshot+ Upsell #1)
  ↓
  Wait 3 days
  ↓
  IF contact does NOT have tag: snapshot_plus_purchased
    ↓
    Send Email 6 (Snapshot+ Education)
    ↓
    Wait 3 days
    ↓
    IF contact does NOT have tag: snapshot_plus_purchased
      ↓
      Send Email 7 (Final Reminder)
ELSE
  → End automation
```

## Conditional Personalization Fields

Use these merge tags in emails:

| Field | AC Merge Tag | Description |
|-------|--------------|-------------|
| Brand Alignment Score™ | `%BRAND_ALIGNMENT_SCORE%` | Overall score (0-100) |
| Positioning Score | `%POSITIONING_SCORE%` | 0-20 |
| Messaging Score | `%MESSAGING_SCORE%` | 0-20 |
| Visibility Score | `%VISIBILITY_SCORE%` | 0-20 |
| Credibility Score | `%CREDIBILITY_SCORE%` | 0-20 |
| Conversion Score | `%CONVERSION_SCORE%` | 0-20 |
| Weakest Pillar | `%WEAKEST_PILLAR%` | Lowest scoring pillar |
| Industry | `%INDUSTRY%` | User's industry |
| Company Name | `%COMPANY_NAME%` | User's company |

## Purchase Exit Logic

**Stripe Webhook → Zapier → ActiveCampaign**

When `snapshot_plus_purchased` tag is added:
- Exit automation immediately
- Prevents redundant upsell emails

## Upgrade Nudge Click Automation

**Trigger:** Webhook event = `UPGRADE_NUDGE_CLICKED`

```
START
  ↓
Apply tag: viewed-upgrade-[pillar]
  ↓
Wait 1 day
  ↓
IF contact does NOT have tag: snapshot_plus_purchased
  ↓
  Send pillar-specific Snapshot+™ upgrade email
  ↓
  Wait 2 days
  ↓
  IF contact does NOT have tag: snapshot_plus_purchased
    ↓
    Send Blueprint™ upsell email
ELSE
  → End automation
```

**Notes:**
- Use the `viewed-upgrade-[pillar]` tag (e.g., `viewed-upgrade-positioning`) for segmentation.
- Ensure purchase tagging happens before the 1-day and 3-day checks.

## Email Templates

See separate files:
- `EMAIL_5_SNAPSHOT_PLUS_INVITATION.md`
- `EMAIL_6_SNAPSHOT_PLUS_EDUCATION.md`
- `EMAIL_7_FINAL_REMINDER.md`

