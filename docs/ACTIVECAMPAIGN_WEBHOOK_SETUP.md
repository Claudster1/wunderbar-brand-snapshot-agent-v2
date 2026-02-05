# ActiveCampaign Webhook URL – Do You Need It?

## Short answer

**No.** The app runs and reports render **without** the webhook URL. You only need it if you want to **send events into ActiveCampaign** (e.g. “results page viewed”, “upgrade CTA clicked”, snapshot completion payloads) for automations, tagging, or reporting.

---

## When you DON’T need it

- **Reports and preview:** `/results?reportId=...`, `/preview/results`, and `/brand-snapshot/results/[id]` all work.
- **Snapshot flow:** Users can complete a Brand Snapshot and see results.
- **Checkout and Stripe:** Stripe webhook and purchase flows use the **ActiveCampaign API** (API URL + API key), not this webhook URL.

So: **no webhook URL = app works; you just won’t send these events to ActiveCampaign.**

---

## When you DO need it

Set **`ACTIVECAMPAIGN_WEBHOOK_URL`** (and optionally `NEXT_PUBLIC_ACTIVECAMPAIGN_WEBHOOK_URL` for client-side events) if you want:

| What | Where it’s used | Purpose |
|------|------------------|---------|
| **Results page view** | `ResultsPageViewTracker` | Track when someone views their report (e.g. tag, automation). |
| **Upgrade CTA shown / clicked** | `ResultsUpgradeCTA`, `RecommendationCard` | Track Snapshot+ CTA impressions and clicks. |
| **Snapshot completion payload** | `sendToActiveCampaign` (e.g. from snapshot/API flow) | Send score, primary pillar, stage, etc. to AC for automations. |
| **Upgrade click (Blueprint, etc.)** | `trackUpgradeClick` | Track upgrade button clicks by product. |

If you don’t need these events in ActiveCampaign, you can leave the webhook URL unset.

---

## Step-by-step: Get the webhook URL and set env

### 1. Create a webhook in ActiveCampaign

You have two common options.

#### Option A: Automation webhook (recommended)

1. Log in to **ActiveCampaign**.
2. Go to **Automations** → **Create Automation** (or use an existing one).
3. **Start** the automation with the trigger **“Webhook”**.
4. Name the webhook (e.g. “Brand Snapshot events”).
5. **Copy the Webhook URL** ActiveCampaign shows (e.g. `https://YOUR-ACCOUNT.api-us1.com/admin/api.php?api_key=...&api_action=...` or the automation webhook URL AC provides).

If your plan doesn’t expose “Webhook” as a trigger, use Option B or an HTTP Request / Custom Action that receives POSTs from your app.

#### Option B: External service or custom endpoint

If you prefer not to use an AC automation webhook:

1. Use a service that accepts HTTP POST (e.g. Zapier, Make, or your own server).
2. Configure that service to receive the JSON payload and then call the ActiveCampaign API (or apply tags, add to list, etc.).
3. Use that endpoint’s URL as `ACTIVECAMPAIGN_WEBHOOK_URL`.

The app sends a JSON body like:

```json
{
  "event": "snapshot_results_viewed",
  "email": "user@example.com",
  "tags": ["snapshot:viewed-results"],
  "fields": {
    "brand_name": "Acme",
    "primary_pillar": "positioning",
    "brand_stage": "scaling",
    "snapshot_score": 72,
    "context_coverage": 75,
    "return_visit": 0
  }
}
```

Exact shape varies by event; see `lib/fireACEvent.ts` and call sites for `event`, `tags`, and `fields`.

---

### 2. Set environment variables

**Server-only (recommended for security):**

- **Local:** In the project root, create or edit `.env.local`:

```bash
ACTIVECAMPAIGN_WEBHOOK_URL=https://YOUR-WEBHOOK-URL-HERE
```

- **Vercel (or your host):** In the project’s Environment Variables, add:

| Name | Value | Environment |
|------|--------|-------------|
| `ACTIVECAMPAIGN_WEBHOOK_URL` | Your full webhook URL | Production (and Preview if you want) |

**Client-side events (optional):**

Events that run in the browser (e.g. results page view, upgrade CTA shown/clicked) need a URL they can call. Options:

- **A) Public URL (simplest, less secure):** Expose the same URL to the client:

```bash
NEXT_PUBLIC_ACTIVECAMPAIGN_WEBHOOK_URL=https://YOUR-WEBHOOK-URL-HERE
```

The code checks `ACTIVECAMPAIGN_WEBHOOK_URL` first, then `NEXT_PUBLIC_ACTIVECAMPAIGN_WEBHOOK_URL`. So you can set only the server one, or both if you want client events.

- **B) API proxy (more secure):** Add an API route (e.g. `/api/track-event`) that accepts the event payload and calls `fireACEvent` (and thus uses server-only `ACTIVECAMPAIGN_WEBHOOK_URL`). Then point the client at `/api/track-event` instead of the webhook URL. (That route is not implemented in this repo yet.)

---

### 3. Restart the app

- **Local:** Restart the Next.js dev server after changing `.env.local`.
- **Vercel:** Redeploy after changing env vars (or rely on automatic deploy if env is already set).

---

## What else you need to do

1. **In ActiveCampaign**
   - If you use an **Automation** webhook: in that automation, add actions (e.g. “Apply tag”, “Add to list”, “Update custom field”) based on the JSON your app sends (`event`, `tags`, `fields`).
   - If you use an **external service**: map the incoming JSON to AC API calls (e.g. add contact, apply tags, update fields).

2. **Tags / fields**
   - Create any tags you use (e.g. `snapshot:viewed-results`, `snapshot:clicked-upgrade`) in AC so automations can use them.
   - If you send custom fields, create matching custom fields in AC and map them in your automation or integration.

3. **Other ActiveCampaign setup**
   - For **contact/field sync** and **Stripe purchase tagging**, use the main AC **API URL + API key** (see `ACTIVECAMPAIGN_SETUP.md` and `docs/STRIPE_ACTIVECAMPAIGN_CHECKLIST.md`). The webhook URL is **in addition** to that, for event-driven automations.

---

## Summary

| Goal | What to set |
|------|-------------|
| App and reports work | Nothing (webhook optional). |
| Server-side events (e.g. snapshot completion) to AC | `ACTIVECAMPAIGN_WEBHOOK_URL` in `.env.local` and production. |
| Client-side events (results view, CTA clicks) to AC | Same URL in `NEXT_PUBLIC_ACTIVECAMPAIGN_WEBHOOK_URL` **or** an API proxy that uses `ACTIVECAMPAIGN_WEBHOOK_URL`. |
| Full event tracking | Webhook URL in AC (Automation or external endpoint) + env vars above + automations/actions in AC. |

No webhook URL is required for the app to work; add it only when you want these events in ActiveCampaign.
