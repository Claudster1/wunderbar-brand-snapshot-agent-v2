# Domain Migration Guide: app.brandsnapshot.ai → app.wunderbrand.ai

Complete step-by-step instructions for migrating the WunderBrand Suite™ app from `app.brandsnapshot.ai` to `app.wunderbrand.ai`.

---

## Pre-Migration Checklist

Before starting, confirm you have access to:

- [ ] GoDaddy account (domain registrar for `wunderbrand.ai`)
- [ ] GoDaddy account (domain registrar for `brandsnapshot.ai` — for redirect setup)
- [ ] Vercel dashboard (project: wunderbar-brand-snapshot-agent-v2)
- [ ] Stripe dashboard (webhook endpoints)
- [ ] Supabase dashboard (Auth redirect URLs)
- [ ] ActiveCampaign dashboard (link URLs in automations/emails)
- [ ] Google Search Console (if configured)

---

## Step 1: GoDaddy — Configure DNS for wunderbrand.ai

### 1a. Add the CNAME record for app.wunderbrand.ai

1. Log in to [GoDaddy](https://dcc.godaddy.com/)
2. Go to **My Products** → find `wunderbrand.ai` → **DNS** (or **Manage DNS**)
3. Click **Add Record**
4. Configure:

| Field | Value |
|---|---|
| **Type** | CNAME |
| **Name** | `app` |
| **Value** | `cname.vercel-dns.com` |
| **TTL** | 600 (10 minutes) — can increase to 3600 after verified |

5. Click **Save**

### 1b. Verify the record was created

```bash
# Run this in your terminal after saving (may take 5–10 minutes to propagate)
dig app.wunderbrand.ai CNAME +short
# Expected output: cname.vercel-dns.com.
```

Or use [dnschecker.org](https://dnschecker.org/#CNAME/app.wunderbrand.ai) to check global propagation.

---

## Step 2: Vercel — Add the New Domain

### 2a. Add domain to the project

1. Go to your [Vercel project dashboard](https://vercel.com/)
2. Navigate to **Settings** → **Domains**
3. In the domain input field, type: `app.wunderbrand.ai`
4. Click **Add**
5. Vercel will check DNS — once GoDaddy's CNAME propagates, you'll see a green **Valid Configuration** checkmark
6. Vercel automatically provisions a free SSL certificate (Let's Encrypt) — this happens within minutes

### 2b. Set as production domain (if applicable)

If `app.brandsnapshot.ai` was the production domain:

1. On the **Domains** page, find `app.wunderbrand.ai`
2. Click the **⋯** menu → **Set as Production Domain**
3. This ensures all production traffic routes to the new domain

### 2c. Keep the old domain temporarily (for redirects)

**Do NOT remove `app.brandsnapshot.ai` yet.** Keep it for redirect handling (Step 5).

---

## Step 3: Vercel — Update Environment Variables

### 3a. Update NEXT_PUBLIC_BASE_URL

1. Go to **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_BASE_URL`
3. Update the value for each environment:

| Environment | Value |
|---|---|
| **Production** | `https://app.wunderbrand.ai` |
| **Preview** | `https://app.wunderbrand.ai` (or leave as Vercel preview URL) |
| **Development** | `http://localhost:3000` |

4. Click **Save**

### 3b. Update NEXT_PUBLIC_APP_URL (if set separately)

If you have a separate `NEXT_PUBLIC_APP_URL` variable, update it the same way:

| Environment | Value |
|---|---|
| **Production** | `https://app.wunderbrand.ai` |

### 3c. Redeploy

After updating environment variables:

1. Go to the **Deployments** tab
2. Find the latest production deployment
3. Click **⋯** → **Redeploy**
4. Wait for the deployment to complete
5. Verify: visit `https://app.wunderbrand.ai` — the site should load

---

## Step 4: Stripe — Update Webhook Endpoints

### 4a. Add new webhook endpoint

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Configure:

| Field | Value |
|---|---|
| **Endpoint URL** | `https://app.wunderbrand.ai/api/stripe/webhook` |
| **Listen to** | Events on your account |
| **Events** | Select the same events as your existing endpoint (typically: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`) |

5. Click **Add endpoint**
6. Copy the new **Signing Secret** (starts with `whsec_`)

### 4b. Update Vercel environment variable

1. Go to Vercel → **Settings** → **Environment Variables**
2. Update `STRIPE_WEBHOOK_SECRET` with the new signing secret from step 4a
3. Save and redeploy

### 4c. Test the webhook

1. In Stripe Dashboard → **Webhooks** → click your new endpoint
2. Click **Send test webhook**
3. Select `checkout.session.completed`
4. Verify it shows a successful response (HTTP 200)

### 4d. Disable the old webhook (after verification)

Once the new webhook is confirmed working:

1. Go to **Webhooks** → find the old `app.brandsnapshot.ai` endpoint
2. Click **⋯** → **Disable** (don't delete yet — keep as backup for 30 days)

---

## Step 5: Set Up Redirects from Old Domain

### Option A: Vercel Redirects (Recommended)

Add redirects in `vercel.json` at the project root:

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "app.brandsnapshot.ai"
        }
      ],
      "destination": "https://app.wunderbrand.ai/$1",
      "permanent": true
    }
  ]
}
```

This tells Vercel: any request hitting `app.brandsnapshot.ai/*` gets a 308 permanent redirect to `app.wunderbrand.ai/*`, preserving the path.

**Important:** Keep `app.brandsnapshot.ai` as a domain in your Vercel project (Step 2c) so Vercel can serve the redirect.

### Option B: GoDaddy Forwarding (if you remove the old domain from Vercel)

1. Log in to GoDaddy → **DNS** for `brandsnapshot.ai`
2. Go to **Forwarding** → **Domain**
3. Add a subdomain forward:
   - **Subdomain:** `app`
   - **Forward to:** `https://app.wunderbrand.ai`
   - **Forward type:** Permanent (301)
   - **Forward with:** Include path (masking off)

**Recommendation:** Use Option A (Vercel redirects). It's faster, more reliable, and handles HTTPS properly.

---

## Step 6: Supabase — Update Auth Settings

### 6a. Update redirect URLs

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard/)
2. Go to your project → **Authentication** → **URL Configuration**
3. In **Site URL**, update to: `https://app.wunderbrand.ai`
4. In **Redirect URLs**, add: `https://app.wunderbrand.ai/**`
5. Keep the old URL (`https://app.brandsnapshot.ai/**`) for 30 days during transition
6. Click **Save**

### 6b. Update CORS (if configured)

If you have custom CORS settings in Supabase:

1. Go to **Settings** → **API**
2. Under **Additional Redirect URLs** or CORS config
3. Add `https://app.wunderbrand.ai`

---

## Step 7: ActiveCampaign — Update Links

### 7a. Update automation email links

1. Log in to ActiveCampaign
2. Go to **Automations**
3. For each automation that sends emails with app links:
   - Find any hardcoded `app.brandsnapshot.ai` URLs
   - Replace with `app.wunderbrand.ai`
   - Common places: report links, CTA buttons, footer links

### 7b. Update site tracking domain (if configured)

1. Go to **Settings** → **Tracking** → **Site Tracking**
2. If `app.brandsnapshot.ai` is listed as a tracked domain, add `app.wunderbrand.ai`
3. Keep both during transition

### 7c. Update custom fields

If any custom fields store the app domain:

1. Go to **Lists** → **Manage Fields**
2. Check for fields like `report_link` that might have the old domain
3. Note: If report links are generated dynamically using `NEXT_PUBLIC_BASE_URL`, they'll automatically use the new domain after the env var update

---

## Step 8: Google Search Console & Analytics (if applicable)

### 8a. Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Click **Add Property** → enter `https://app.wunderbrand.ai`
3. Verify ownership via DNS TXT record or HTML file
4. Submit the sitemap: `https://app.wunderbrand.ai/sitemap.xml`
5. Keep the old property active — Google will see the 308 redirects and transfer ranking signals

### 8b. Google Analytics / Tag Manager

If you have GA4 or GTM:

1. Update the data stream URL to `app.wunderbrand.ai`
2. Or add `app.wunderbrand.ai` as an additional domain in your data stream
3. Update any cross-domain tracking configuration

---

## Step 9: Content Security Policy Update

The CSP headers in `next.config.js` may need updating if the old domain was referenced. Currently, the `frame-ancestors` directive references `wunderbardigital.com` (not the app domain), so no change is needed. But verify:

```javascript
// next.config.js — verify these don't reference brandsnapshot.ai
"frame-ancestors https://www.wunderbardigital.com https://wunderbardigital.com",
```

If the parent marketing site at `wunderbardigital.com` embeds the app in an iframe, no CSP change is needed (it already references the correct parent domain).

---

## Step 10: Post-Migration Verification

### Immediate checks (do these right after migration)

- [ ] `https://app.wunderbrand.ai` loads correctly
- [ ] `https://app.wunderbrand.ai/api/stripe/webhook` — Stripe test webhook returns 200
- [ ] `https://app.brandsnapshot.ai` redirects to `https://app.wunderbrand.ai` (same path preserved)
- [ ] Start a new WunderBrand Snapshot™ assessment — verify Wundy™ chat works
- [ ] Complete an assessment — verify report generates
- [ ] Download a PDF — verify it renders
- [ ] OG images load: `https://app.wunderbrand.ai/api/og/snapshot`
- [ ] Stripe checkout: test a purchase flow (use Stripe test mode if available)
- [ ] Report links in emails point to `app.wunderbrand.ai`

### SSL verification

```bash
# Verify SSL certificate is valid
curl -vI https://app.wunderbrand.ai 2>&1 | grep "SSL certificate\|subject:\|issuer:\|expire"

# Or use browser: click the lock icon → Certificate → verify it's valid for app.wunderbrand.ai
```

### DNS verification

```bash
# Verify CNAME is correct
dig app.wunderbrand.ai CNAME +short
# Expected: cname.vercel-dns.com.

# Verify old domain still resolves (for redirects)
dig app.brandsnapshot.ai +short

# Full connectivity test
curl -sI https://app.wunderbrand.ai | head -5
# Expected: HTTP/2 200

curl -sI https://app.brandsnapshot.ai | head -5
# Expected: HTTP/2 308 (redirect)
```

---

## Step 11: Cleanup (30 Days After Migration)

After 30 days with no issues:

- [ ] Remove `app.brandsnapshot.ai` redirect URLs from Supabase Auth
- [ ] Delete old Stripe webhook endpoint (the disabled one)
- [ ] Remove old domain from Google Search Console (optional — Google handles this)
- [ ] Optionally remove `app.brandsnapshot.ai` from Vercel (only if you no longer want to serve redirects from Vercel — GoDaddy forwarding can take over)
- [ ] Update GoDaddy TTL for the CNAME to 3600 (1 hour) for caching efficiency

---

## Timeline

| Phase | Duration | What Happens |
|---|---|---|
| **DNS propagation** | 5–60 minutes | CNAME record goes live globally |
| **SSL provisioning** | 1–5 minutes | Vercel auto-provisions Let's Encrypt cert |
| **Dual-domain period** | 30 days | Both domains work (old redirects to new) |
| **Cleanup** | After 30 days | Remove old domain references |

---

## Summary of All Changes

| Service | What to Update | Old Value | New Value |
|---|---|---|---|
| **GoDaddy (wunderbrand.ai)** | DNS CNAME record | — | `app` → `cname.vercel-dns.com` |
| **Vercel** | Add domain | — | `app.wunderbrand.ai` |
| **Vercel** | Environment variable | `https://app.brandsnapshot.ai` | `https://app.wunderbrand.ai` |
| **Vercel** | Redirect config | — | `vercel.json` redirect rule |
| **Stripe** | Webhook endpoint | `app.brandsnapshot.ai/api/stripe/webhook` | `app.wunderbrand.ai/api/stripe/webhook` |
| **Stripe** | Webhook secret | Old `whsec_` value | New `whsec_` value |
| **Supabase** | Site URL | `app.brandsnapshot.ai` | `app.wunderbrand.ai` |
| **Supabase** | Redirect URLs | Add `app.wunderbrand.ai/**` | Keep old for 30 days |
| **ActiveCampaign** | Email links | `app.brandsnapshot.ai` | `app.wunderbrand.ai` |
| **Codebase** | `.env.local` | `app.brandsnapshot.ai` | `app.wunderbrand.ai` ✅ (already done) |
| **Codebase** | Source files | All `brandsnapshot.ai` refs | `wunderbrand.ai` ✅ (already done) |

---

## Rollback Plan

If something goes wrong:

1. In Vercel → **Settings** → **Domains** → set `app.brandsnapshot.ai` back as production domain
2. Revert `NEXT_PUBLIC_BASE_URL` to `https://app.brandsnapshot.ai`
3. Re-enable the old Stripe webhook endpoint
4. Redeploy

No data loss is possible — this is purely a domain/routing change.
