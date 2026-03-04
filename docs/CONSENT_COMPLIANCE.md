# Consent Compliance Runbook

This runbook defines how consent is captured and propagated for marketing communications while keeping transactional delivery uninterrupted.

## Goals

- Keep transactional messages reliable.
- Capture explicit, channel-specific marketing consent.
- Preserve a strong customer experience with optional preferences.
- Support CAN-SPAM and SMS opt-out handling workflows.

## Security Note (Webhook Configuration)

- ActiveCampaign webhook URLs must be configured as server-only environment variables:
  - `ACTIVE_CAMPAIGN_WEBHOOK` or `ACTIVECAMPAIGN_WEBHOOK_URL`
- Do **not** expose ActiveCampaign webhook endpoints in `NEXT_PUBLIC_*` variables.
- Browser-originated tracking should go through server API routes (proxy pattern), which then forward to ActiveCampaign.

## Current Consent Fields

Use these booleans in app and marketing-site submissions:

- `sms_opted_in`
- `email_marketing_opted_in`
- `phone_mobile` (for SMS destination, E.164 preferred, example: `+16575003620`)

## ActiveCampaign Tag + Field Mapping

### SMS Marketing

- Tags:
  - Apply: `sms:opted-in`
  - Remove: `sms:opted-out`
- Fields:
  - `sms_opted_in = "true"`
  - `sms_optin_source = "<source>"`
  - `phone_mobile = "+1..."`

### Email Marketing

- Tags:
  - Apply: `email:marketing-opted-in`
  - Remove: `email:marketing-opted-out`
- Fields:
  - `email_marketing_opted_in = "true"`
  - `email_marketing_optin_source = "<source>"`

## Capture Points (App)

- `components/security/EmailVerificationGate.tsx`
- `components/pricing/PricingCard.tsx`
- `components/UpgradeButton.tsx`
- `components/UpgradeCTA.tsx`

Consent values are also stored locally so users do not need to re-enter preferences repeatedly:

- `wb_sms_opted_in`
- `wb_email_marketing_opted_in`

## Backend Ingestion and Propagation

- Verification sync:
  - `app/api/verify-email/send/route.ts`
- Checkout metadata:
  - `app/api/checkout/route.ts`
  - `app/api/stripe/createCheckout/route.ts`
  - `app/api/stripe/create-checkout-session/route.ts`
- Purchase webhook sync:
  - `app/api/stripe/webhook/route.ts`
- Connect-form ingestion:
  - `app/api/inbound/connect/route.ts`

## One-Click AC Provisioning (Admin API)

Use the admin endpoint to provision/verify required consent tags and fields in ActiveCampaign:

- `GET /api/admin/activecampaign/consent` (readiness + required list)
- `POST /api/admin/activecampaign/consent` (create/ensure tags + fields)

This route requires an authenticated admin session.

### Quick run steps

1. Sign in to the app as admin.
2. Open this URL in your browser:
   - `/api/admin/activecampaign/consent`
3. Then run the provision call from browser console:

```js
fetch("/api/admin/activecampaign/consent", { method: "POST" })
  .then((r) => r.json())
  .then(console.log);
```

4. Verify response includes `ok: true` and IDs for each required tag/field.

## One-Click ActiveCampaign Provisioning

A secure admin API endpoint can create/verify all required consent tags and fields:

- `GET /api/admin/activecampaign/consent` -> verify only
- `POST /api/admin/activecampaign/consent` -> create missing assets, then verify

Requirements:

- You must be logged in as an app admin.
- `ACTIVE_CAMPAIGN_API_URL` and `ACTIVE_CAMPAIGN_API_KEY` must be set.

How to run quickly (from browser console while logged into admin):

```js
fetch("/api/admin/activecampaign/consent", { method: "POST" })
  .then((r) => r.json())
  .then(console.log);
```

Expected result:

- `ok: true`
- no missing items in `missingFields` and `missingTags`

## Marketing Site Connect Form Payload (Copy/Paste)

Submit this server-to-server to `POST https://app.wunderbrand.ai/api/inbound/connect`:

```json
{
  "email": "person@company.com",
  "name": "Jane Doe",
  "companyName": "Acme Co",
  "message": "I want help with our brand strategy.",
  "source": "connect_form",
  "externalRef": "wf_2026_01_26_abc123",
  "utm_source": "wunderbardigital",
  "utm_medium": "website",
  "utm_campaign": "talk_to_an_expert",
  "sms_opted_in": true,
  "email_marketing_opted_in": true,
  "phone_mobile": "+16575003620"
}
```

### Minimal Variant (no SMS consent)

```json
{
  "email": "person@company.com",
  "name": "Jane Doe",
  "message": "Please contact me.",
  "source": "connect_form",
  "sms_opted_in": false,
  "email_marketing_opted_in": true
}
```

## UX and Compliance Notes

- Keep both consent checkboxes unchecked by default.
- Use separate checkboxes for SMS and email marketing consent.
- Do not block transactional flows when consent-sync calls fail.
- Keep opt-out language visible near consent controls:
  - SMS: "Message and data rates may apply. Reply STOP to opt out."
  - Email: "You can unsubscribe anytime."

## Zapier Guardrails (Recommended)

- Send marketing SMS only when:
  - `sms:opted-in` tag is present, and
  - `phone_mobile` exists.
- Send marketing email only when:
  - `email:marketing-opted-in` tag is present.
- Add quiet-hours/timezone filtering for SMS (8am-9pm local).
- Always include unsubscribe/opt-out instructions in outbound campaigns.

## Zapier Build Checklist (AC Form -> App Inbound API)

Use this when your marketing form is hosted in ActiveCampaign.

1. Create a Zap
   - Trigger app: ActiveCampaign
   - Trigger event: New form submission (or tag added for form intent)

2. Add a Filter step
   - Continue if:
     - email exists OR phone exists
   - Optional stricter rule:
     - if `sms_opted_in = true`, require `phone_mobile` not empty

3. Add a Formatter step for booleans (recommended)
   - Convert AC checkbox/tag values into true booleans:
     - `sms_opted_in_bool`: true/false
     - `email_marketing_opted_in_bool`: true/false
   - Avoid string values `"true"` / `"false"` in JSON

4. Add Webhooks by Zapier action
   - Event: POST
   - URL: `https://app.wunderbrand.ai/api/inbound/connect`
   - Headers:
     - `Content-Type: application/json`
     - `x-inbound-secret: <INBOUND_WEBHOOK_SECRET>` (if configured)

5. Set Request Body (raw JSON)
   - Map fields as follows:
     - `email` <- AC contact email
     - `phone` <- AC phone
     - `phone_mobile` <- AC custom mobile field
     - `name` <- AC full name (or first + last)
     - `companyName` <- AC organization/company field
     - `message` <- AC form message/notes field
     - `source` <- `"connect_form"`
     - `externalRef` <- AC submission ID (stable dedupe key)
     - `utm_source` <- AC hidden field
     - `utm_medium` <- AC hidden field
     - `utm_campaign` <- AC hidden field
     - `sms_opted_in` <- `sms_opted_in_bool`
     - `email_marketing_opted_in` <- `email_marketing_opted_in_bool`

6. Add error handling
   - Turn on Zapier auto-replay/retry
   - Add Slack/email alert on repeated webhook failures

7. Test with 3 cases
   - Case A: no opt-ins
   - Case B: email marketing only
   - Case C: SMS + email marketing with valid `phone_mobile`

8. Verify in systems
   - App API response: `ok: true`
   - CRM inbox receives inquiry
   - ActiveCampaign contact reflects expected tags/fields:
     - `sms:opted-in` / `sms:opted-out`
     - `email:marketing-opted-in` / `email:marketing-opted-out`
     - `sms_opted_in`, `email_marketing_opted_in`, `phone_mobile`

## One-Click ActiveCampaign Provisioning

You can provision required consent tags/fields from the app admin API.

- Endpoint: `POST /api/admin/ac/provision-consent`
- Auth: Admin session required (same auth as other `/api/admin/*` routes)
- Behavior: Idempotent (safe to run multiple times)

### Required AC Objects

- Tags:
  - `sms:opted-in`
  - `sms:opted-out`
  - `email:marketing-opted-in`
  - `email:marketing-opted-out`
  - `snapshot:business-type:service_b2b`
  - `snapshot:business-type:service_b2c`
  - `snapshot:business-type:retail`
  - `snapshot:business-type:ecommerce`
  - `snapshot:business-type:saas`
  - `snapshot:business-type:local_service`
  - `snapshot:signal-missing:conversion-rate`
  - `snapshot:signal-missing:revenue-baseline`
- Fields:
  - `sms_opted_in`
  - `sms_optin_source`
  - `phone_mobile`
  - `email_marketing_opted_in`
  - `email_marketing_optin_source`

### Strategy-v3 Diagnostic Signal Objects (also provisioned)

These support segmentation/automation based on the new inference-and-confirm + signal extraction model:

- Tags:
  - `snapshot:business-type:service_b2b`
  - `snapshot:business-type:service_b2c`
  - `snapshot:business-type:retail`
  - `snapshot:business-type:ecommerce`
  - `snapshot:business-type:saas`
  - `snapshot:business-type:local_service`
  - `snapshot:signal-missing:conversion-rate`
  - `snapshot:signal-missing:revenue-baseline`
- Fields:
  - `snapshot_business_type`
  - `snapshot_primary_revenue_driver`
  - `snapshot_monthly_revenue_range`
  - `snapshot_average_transaction_value`
  - `snapshot_conversion_rate_estimate`
  - `snapshot_primary_acquisition_channel`
  - `snapshot_monthly_marketing_budget`
  - `snapshot_content_creation_capacity`
  - `snapshot_business_type`
  - `snapshot_primary_revenue_driver`
  - `snapshot_monthly_revenue_range`
  - `snapshot_average_transaction_value`
  - `snapshot_conversion_rate_estimate`
  - `snapshot_primary_acquisition_channel`
  - `snapshot_monthly_marketing_budget`
  - `snapshot_content_creation_capacity`

### How to run (quickest)

1. Log into admin in the app (`/admin-login`).
2. Open browser devtools on the app domain.
3. Run:

```js
fetch("/api/admin/ac/provision-consent", { method: "POST" })
  .then((r) => r.json().then((body) => ({ status: r.status, body })))
  .then(console.log);
```

4. Confirm response has `ok: true`.

