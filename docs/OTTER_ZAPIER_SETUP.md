# Otter.ai + Zapier Integration Setup

Automatically process call transcripts and generate personalized follow-up emails after **Talk to an Expert** calls and **Strategy Activation Sessions**.

---

## Overview

```
Otter.ai  →  Zapier  →  Your App  →  OpenAI  →  Review Queue  →  ActiveCampaign  →  Email
         transcript     /api/session/    generates    admin edits/     triggers       follow-up
         webhook        process-         follow-up    approves         automation     email
                        transcript       content
```

---

## Prerequisites

- Otter.ai Pro, Business, or Enterprise plan (required for Zapier integration)
- Zapier account (free tier works for low volume)
- Your app deployed with these env vars set:
  - `OPENAI_API_KEY`
  - `ADMIN_API_KEY` (you choose this — used to authenticate admin API calls)
  - `ZAPIER_WEBHOOK_SECRET` (you choose this — Zapier sends it with each request)
  - `ACTIVE_CAMPAIGN_API_URL`
  - `ACTIVE_CAMPAIGN_API_KEY`

---

## Step 1: Set Environment Variables

Add to your `.env.local` (and Vercel environment variables):

```bash
# Admin API key for the review queue (generate a strong random string)
ADMIN_API_KEY=your-secure-admin-api-key-here

# Zapier webhook secret (generate a strong random string)
ZAPIER_WEBHOOK_SECRET=your-zapier-secret-here

# Calendly webhook secret (optional, for booking notifications)
CALENDLY_WEBHOOK_SECRET=your-calendly-secret-here
```

---

## Step 2: Connect Otter.ai to Zapier

1. Go to [Zapier](https://zapier.com) and create a new Zap
2. **Trigger**: Choose "Otter.ai" as the app
3. **Event**: Select "New Transcript"
4. **Connect your Otter.ai account**:
   - In Otter.ai, go to **Settings → Apps → Zapier**
   - Generate an API key
   - Paste it into Zapier when prompted

---

## Step 3: Create the Zapier Webhook Action

1. **Action**: Choose "Webhooks by Zapier"
2. **Event**: Select "POST"
3. **Configure**:

| Setting | Value |
|---------|-------|
| **URL** | `https://app.wunderbrand.ai/api/session/process-transcript` |
| **Payload Type** | JSON |
| **Headers** | `x-zapier-secret`: `your-zapier-secret-here` |

4. **Data fields** (map from Otter.ai trigger):

| Field | Map to | Notes |
|-------|--------|-------|
| `contact_email` | Otter → Participant emails | Use the client's email (not your team's) |
| `contact_name` | Otter → Participant names | The client's name |
| `session_type` | (static value) | `talk_to_expert` or `activation_session` |
| `transcript` | Otter → Full Transcript | The complete transcript text |
| `transcript_summary` | Otter → Summary | Otter's auto-generated summary |
| `team_member_name` | (static or Otter host name) | Your team member's name |
| `source` | (static) | `otter_zapier` |

### Handling Two Session Types

You have two options:

**Option A: Two separate Zaps** (simpler)
- Zap 1: Otter meetings that are "Talk to Expert" → `session_type: "talk_to_expert"`
- Zap 2: Otter meetings that are "Activation Sessions" → `session_type: "activation_session"`
- Use Otter's meeting title or a filter step to distinguish

**Option B: Single Zap with a Filter** (more elegant)
- Add a **Filter** step after the Otter trigger
- If meeting title contains "expert" or "consultation" → set `session_type: "talk_to_expert"`
- If meeting title contains "activation" or "blueprint" → set `session_type: "activation_session"`
- Use Zapier's **Formatter** step to set the value dynamically

---

## Step 4: Set Up Calendly Webhook (Optional but Recommended)

This tags contacts in ActiveCampaign when they book, before the call even happens.

1. Go to [Calendly → Integrations → Webhooks](https://calendly.com/integrations)
2. **Or** use Zapier: Calendly trigger → Webhooks POST
3. **Webhook URL**: `https://app.wunderbrand.ai/api/calendly/webhook`
4. **Events to subscribe**: `invitee.created`, `invitee.canceled`

### If using Zapier for Calendly:

| Setting | Value |
|---------|-------|
| **URL** | `https://app.wunderbrand.ai/api/calendly/webhook` |
| **Payload** | Pass through the full Calendly payload |

The app automatically detects session type from the Calendly event type name (matches on "expert", "consultation", "activation", "blueprint").

---

## Step 5: Review and Approve Follow-ups

After a transcript is processed, it appears in the review queue. Use the API to manage it:

### List pending follow-ups

```bash
curl -s \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  "https://app.wunderbrand.ai/api/session/followups?status=pending_review" | jq
```

### View full detail (including transcript)

```bash
curl -s \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  "https://app.wunderbrand.ai/api/session/followups/FOLLOWUP_ID" | jq
```

### Edit the generated content

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "FOLLOWUP_ID",
    "action": "edit",
    "final_subject": "Your edited subject line",
    "final_body": "<p>Your edited email body...</p>"
  }' \
  "https://app.wunderbrand.ai/api/session/followups"
```

### Regenerate with AI (get a fresh version)

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "FOLLOWUP_ID",
    "action": "regenerate"
  }' \
  "https://app.wunderbrand.ai/api/session/followups"
```

### Approve and send

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "FOLLOWUP_ID",
    "action": "approve",
    "reviewed_by": "your-name"
  }' \
  "https://app.wunderbrand.ai/api/session/followups"
```

This will:
1. Save the final content
2. Push it to ActiveCampaign as custom fields
3. Fire the AC event to trigger the follow-up email automation
4. Mark the follow-up as "sent"

### Reject (if not usable)

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "FOLLOWUP_ID",
    "action": "reject",
    "reviewer_notes": "Reason for rejection"
  }' \
  "https://app.wunderbrand.ai/api/session/followups"
```

---

## Step 6: Build the AC Automations

See [ACTIVECAMPAIGN_AUTOMATIONS.md](./ACTIVECAMPAIGN_AUTOMATIONS.md) for full specs:

- **#15 — Talk to Expert Post-Call Follow-up**: Triggered by `expert_call_followup_ready` event
- **#16 — Strategy Activation Session Follow-up**: Triggered by `activation_session_followup_ready` event

Key: The email body uses `%FOLLOWUP_BODY%` — this is the AI-generated (and admin-reviewed) HTML content stored as a custom field.

---

## Step 7: Run the Setup Script

If you haven't already, run the setup script to create the new tags and fields in AC:

```bash
ACTIVE_CAMPAIGN_API_KEY=your-key ACTIVE_CAMPAIGN_API_URL=https://your-account.api-us1.com npx tsx scripts/setup-activecampaign.ts
```

---

## Database Migration

Run the migration to create the `session_followups` table:

```sql
-- Copy contents of database/migration_session_followups.sql
-- and run in your Supabase SQL editor
```

---

## Testing

1. **Test the transcript endpoint manually**:

```bash
curl -s -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_email": "test@example.com",
    "contact_name": "Jane",
    "session_type": "talk_to_expert",
    "transcript": "This is a test transcript of a call between Jane and our strategist. Jane runs a boutique design agency and is struggling with brand positioning...",
    "team_member_name": "Sarah"
  }' \
  "https://app.wunderbrand.ai/api/session/process-transcript"
```

2. **Check the review queue** and verify the AI-generated content
3. **Approve it** and verify the AC event fires
4. **Set up your Zapier Zap** with a test Otter.ai transcript
5. **End-to-end test**: Record a test call in Otter, let Zapier fire, review, approve, verify email

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Zapier says 401 | Check `ZAPIER_WEBHOOK_SECRET` matches in both Zapier and your env |
| AI generation fails | Check `OPENAI_API_KEY` is set, transcript is > 50 chars |
| AC tagging fails | Check `ACTIVE_CAMPAIGN_API_URL` and `ACTIVE_CAMPAIGN_API_KEY` |
| Email not sent after approve | Build the AC automation triggered by the event name |
| Wrong session type | Check your Otter meeting titles match the detection logic |
