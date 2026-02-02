# Stripe + ActiveCampaign Integration Checklist

Use this checklist to ensure all Stripe integrations and ActiveCampaign triggers are in place.

---

## 1. Environment variables

### Stripe (required for checkout + webhook)

| Variable | Used by | Notes |
|--------|--------|--------|
| `STRIPE_SECRET_KEY` | Checkout, webhook | From Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook only | From Stripe Dashboard → Webhooks → endpoint signing secret |
| `STRIPE_PRICE_SNAPSHOT_PLUS` | Checkout, webhook | Price ID for Snapshot+™ |
| `STRIPE_PRICE_BLUEPRINT` | Checkout, webhook | Price ID for Blueprint™ |
| `STRIPE_PRICE_BLUEPRINT_PLUS` | Checkout, webhook | Price ID for Blueprint+™ |
| `NEXT_PUBLIC_BASE_URL` | Checkout success/cancel URLs | e.g. `https://app.brandsnapshot.ai` |

### ActiveCampaign (required for webhook-triggered tags)

| Variable | Used by | Notes |
|--------|--------|--------|
| `ACTIVE_CAMPAIGN_API_URL` | `/api/activecampaign`, `applyActiveCampaignTags` | e.g. `https://YOUR-ACCOUNT.api-us1.com` |
| `ACTIVE_CAMPAIGN_API_KEY` | Same | API token from AC Settings → Developer |

**Note:** The Stripe webhook uses **the same** `ACTIVE_CAMPAIGN_API_URL` and `ACTIVE_CAMPAIGN_API_KEY` (via `lib/applyActiveCampaignTags.ts`) to apply/remove tags. No separate “webhook URL” is needed for purchase events; the app calls the AC API directly.

### Optional (for other AC automations)

| Variable | Used by | Notes |
|--------|--------|--------|
| `ACTIVE_CAMPAIGN_WEBHOOK` | coverage, analytics, snapshot route, etc. | External AC automation webhook URL if you use one |
| `ACTIVECAMPAIGN_WEBHOOK_URL` | `fireACEvent`, `sendToActiveCampaign` | Same idea; name differs in code |
| `AC_EVENT_WEBHOOK` | `track-upgrade` | Upgrade intent tracking |

---

## 2. Stripe Dashboard

- [ ] **Products & prices**  
  Snapshot+™, Blueprint™, Blueprint+™ created; price IDs copied into env.

- [ ] **Webhook endpoint**  
  - URL: `https://app.brandsnapshot.ai/api/stripe/webhook` (or your production URL).  
  - Event: **`checkout.session.completed`** (required).  
  - Signing secret copied into `STRIPE_WEBHOOK_SECRET`.

- [ ] **Checkout metadata**  
  The app sends `product_key` (and optionally `user_id`, `snapshot_id`) in session metadata. No extra Stripe product metadata is required for the webhook.

---

## 3. What the Stripe webhook does

When `checkout.session.completed` fires:

1. **Record purchase**  
   Inserts a row into `brand_snapshot_purchases` (email, session id, product SKU, amount, etc.).

2. **Grant access (if `user_id` in metadata)**  
   Calls `grantAccess(userId, productKey)` to update `user_purchases` (Snapshot+/Blueprint/Blueprint+ flags).

3. **ActiveCampaign tags (nurture flow)**  
   Purchasers are **removed** from the current product nurture and **added** to the next level.  

   - **Snapshot+ purchase**  
     - Remove: `intent:upgrade-snapshot-plus` (exit Snapshot+ nurture)  
     - Apply: `purchased:snapshot-plus`, `intent:upgrade-blueprint` (enter Blueprint nurture)  
   - **Blueprint purchase**  
     - Remove: `intent:upgrade-blueprint` (exit Blueprint nurture)  
     - Apply: `purchased:blueprint`, `intent:upgrade-blueprint-plus` (enter Blueprint+ nurture)  
   - **Blueprint+ purchase**  
     - Remove: `intent:upgrade-blueprint-plus` (exit Blueprint+ nurture)  
     - Apply: `purchased:blueprint-plus`, `nurture:other-services` (enter “other services” nurture: managed marketing, AI consulting)  

Tags are applied/removed via the **ActiveCampaign API** (same credentials as `/api/activecampaign`).

---

## 4. ActiveCampaign setup

### Tags to create in AC

Create these tags in ActiveCampaign (Settings → Tags) so the webhook can apply/remove them:

| Tag | When it’s applied |
|-----|--------------------|
| `purchased:snapshot-plus` | Applied when they buy Snapshot+™ |
| `purchased:blueprint` | Applied when they buy Blueprint™ |
| `purchased:blueprint-plus` | Applied when they buy Blueprint+™ |
| `intent:upgrade-snapshot-plus` | In Snapshot+ nurture; removed when they purchase Snapshot+ |
| `intent:upgrade-blueprint` | In Blueprint nurture; applied after Snapshot+ purchase, removed when they purchase Blueprint |
| `intent:upgrade-blueprint-plus` | Optional; removed when they purchase Blueprint+ |
| `nurture:other-services` | In "other services" nurture (managed marketing, AI consulting); **applied** when they purchase Blueprint+ |

### Nurture sequence flow

1. **Snapshot+ nurture** — Trigger: Tag added `intent:upgrade-snapshot-plus`. When they **purchase Snapshot+**: that tag is **removed** (exit sequence); `purchased:snapshot-plus` and `intent:upgrade-blueprint` are **added** (enter Blueprint nurture).
2. **Blueprint nurture** — Trigger: Tag added `intent:upgrade-blueprint`. When they **purchase Blueprint**: that tag is **removed**; `purchased:blueprint` and `intent:upgrade-blueprint-plus` are **added** (enter Blueprint+ nurture).
3. **Blueprint+ nurture** — Trigger: Tag added `intent:upgrade-blueprint-plus`. When they **purchase Blueprint+**: that tag is **removed**; `purchased:blueprint-plus` and `nurture:other-services` are **added** (enter other-services nurture).
4. **Other services nurture** (managed marketing, AI consulting) — Trigger: Tag added `nurture:other-services`. Use this automation to promote managed marketing and AI consulting (no product upsell).

### Automations to build in AC

- **Tag added: `purchased:snapshot-plus`**  
  → Send “Welcome to Snapshot+”, link to report/dashboard, etc.

- **Tag added: `purchased:blueprint`**  
  → Send Blueprint onboarding / next steps.

- **Tag added: `purchased:blueprint-plus`**  
  → Send Blueprint+ onboarding / next steps.

- **Tag added: `intent:upgrade-blueprint`**  
  → Blueprint nurture sequence (for Snapshot+ purchasers).

- **Tag added: `intent:upgrade-blueprint-plus`**  
  → Blueprint+ nurture sequence (for Blueprint purchasers).

- **Tag added: `nurture:other-services`**  
  → Nurture for managed marketing and AI consulting (for Blueprint+ purchasers only).

- **Tag added: `brand_snapshot_completed`** (from Brand Snapshot flow, not Stripe)  
  → Send report email with `%BRANDSNAPSHOTREPORTLINK%` CTA.

---

## 5. Checkout flow (app → Stripe)

- **Route:** `POST /api/checkout`  
- **Body:** `{ productKey, userId?, metadata? }`  
- **Metadata sent to Stripe:**  
  `product_key` (required), `user_id` (optional), plus any `metadata` you pass.  

So:

- [ ] All CTAs that start checkout use `productKey`: `snapshot_plus` | `blueprint` | `blueprint_plus`.
- [ ] If the user is logged in, pass `userId` so the webhook can call `grantAccess`.

---

## 6. Database

- [ ] **`brand_snapshot_purchases`**  
  Migration applied (e.g. `database/migration_brand_snapshot_purchases.sql`).  
  Used by the webhook to record every purchase and by `/api/purchase/lookup` if you use it.

- [ ] **`user_purchases`** (optional)  
  Used by `grantAccess` when `user_id` is in Stripe metadata.  
  If you don’t use `user_purchases`, the webhook will still record in `brand_snapshot_purchases` and apply AC tags; only `grantAccess` will be skipped when `user_id` is missing.

---

## 7. Quick test

1. **Stripe**  
   - Run a test checkout (test card `4242 4242 4242 4242`) for one product.  
   - In Stripe Dashboard → Developers → Webhooks → your endpoint → “Recent deliveries”, confirm `checkout.session.completed` is sent and returns 200.

2. **Database**  
   - Check `brand_snapshot_purchases` for a new row with the test email and correct `product_sku`.

3. **ActiveCampaign**  
   - Find the contact by email; confirm the correct `purchased:*` tag was added (and optional `intent:*` removed).

---

## 8. Summary

| Item | Status |
|------|--------|
| Stripe env vars (secret, webhook secret, price IDs, base URL) | |
| AC env vars (API URL, API key) for webhook tag apply/remove | |
| Stripe webhook endpoint + `checkout.session.completed` | |
| AC tags created (`purchased:*`, optional `intent:*`) | |
| Checkout sends `product_key` (+ optional `user_id`) | |
| `brand_snapshot_purchases` migration applied | |
| Optional: `user_purchases` + `grantAccess` when `user_id` present | |
| Test purchase → DB row + AC tag | |

Once these are in place, Stripe and ActiveCampaign are wired: every successful checkout is recorded and the right AC tags are applied so you can trigger automations (welcome emails, next steps, etc.).
