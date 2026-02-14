# Stripe Checkout Setup Guide

This guide explains how to set up Stripe Checkout for the WunderBrand Suite™ products.

## Prerequisites

1. **Stripe Account**: Create an account at [stripe.com](https://stripe.com)
2. **Stripe Products**: Create products in your Stripe Dashboard for:
   - WunderBrand Snapshot+™ ($497)
   - WunderBrand Blueprint™ ($997)
   - WunderBrand Blueprint+™ ($1,997)

## Step 1: Install Stripe Package

```bash
npm install stripe
```

## Step 2: Create Products in Stripe Dashboard

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Click "Add product" for each product:

### WunderBrand Snapshot+™
- **Name**: WunderBrand Snapshot+™
- **Description**: Strategic recommendations with deep pillar analysis, brand persona, messaging pillars, 90-day roadmap, and 8 calibrated AI prompts.
- **Price**: $497.00 USD (one-time)
- **Copy the Price ID** (starts with `price_...`)

### WunderBrand Blueprint™
- **Name**: WunderBrand Blueprint™
- **Description**: Complete brand operating system with positioning, messaging frameworks, buyer personas, competitive analysis, and 16 AI prompts.
- **Price**: $997.00 USD (one-time)
- **Copy the Price ID** (starts with `price_...`)

### WunderBrand Blueprint+™
- **Name**: WunderBrand Blueprint+™
- **Description**: Full strategic brand playbook with implementation guides, templates, 28 AI prompts, and a complimentary 30-minute Strategy Activation Session.
- **Price**: $1,997.00 USD (one-time)
- **Copy the Price ID** (starts with `price_...`)

## Step 3: Get Stripe API Keys

1. Go to [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret key** (starts with `sk_...`)
3. Copy your **Publishable key** (starts with `pk_...`) - optional, only needed if using Stripe Elements

## Step 4: Set Up Webhook (Phase 2 - Purchase Recording)

The webhook handler is ready at `/app/api/stripe/webhook/route.ts`. Set it up to record purchases:

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed` (required - records purchases)
   - `charge.refunded` (optional - updates status on refunds)
5. Click "Add endpoint"
6. Copy the **Webhook signing secret** (starts with `whsec_...`)
7. Add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

**For local testing**, use Stripe CLI:
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/stripe/webhook
# This will output a webhook secret starting with whsec_test_...
```

The webhook handler will:
- Record purchases in `brand_snapshot_purchases` table
- Extract customer email, product SKU, and payment details
- Mark purchases as `paid` with `fulfilled: false`
- Handle refunds by updating status to `refunded`

## Step 5: Create Upgrade Coupons

When a customer upgrades from a lower tier, the system automatically deducts their previous purchase. Create these coupons in Stripe:

1. Go to [Stripe Dashboard → Coupons](https://dashboard.stripe.com/coupons)
2. Click **"+ New"** for each coupon below:

### Coupon 1: Snapshot+ Credit ($497)
- **Name:** `WunderBrand Snapshot+™ Upgrade Credit`
- **ID:** `SNAPSHOT_PLUS_CREDIT` (custom ID — click "Add custom ID")
- **Type:** Amount off → `$497.00 USD`
- **Duration:** Once
- **Max redemptions:** Leave blank
- **Applies to:** All products

### Coupon 2: Blueprint Credit ($997)
- **Name:** `WunderBrand Blueprint™ Upgrade Credit`
- **ID:** `BLUEPRINT_CREDIT`
- **Type:** Amount off → `$997.00 USD`
- **Duration:** Once

### Coupon 3: Full Suite Credit ($1,494)
- **Name:** `Snapshot+ & Blueprint Upgrade Credit`
- **ID:** `SNAPSHOT_PLUS_BLUEPRINT_CREDIT`
- **Type:** Amount off → `$1,494.00 USD`
- **Duration:** Once

**Upgrade paths:**
| From → To | Coupon Applied | Customer Pays |
|---|---|---|
| Snapshot+ ($497) → Blueprint ($997) | SNAPSHOT_PLUS_CREDIT | **$500** |
| Snapshot+ ($497) → Blueprint+ ($1,997) | SNAPSHOT_PLUS_CREDIT | **$1,500** |
| Blueprint ($997) → Blueprint+ ($1,997) | BLUEPRINT_CREDIT | **$1,000** |
| Snapshot+ + Blueprint → Blueprint+ | SNAPSHOT_PLUS_BLUEPRINT_CREDIT | **$503** |

The system automatically detects prior purchases by email and applies the correct coupon at checkout.

## Step 6: Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PRICE_SNAPSHOT_PLUS=price_xxx
STRIPE_PRICE_BLUEPRINT=price_xxx
STRIPE_PRICE_BLUEPRINT_PLUS=price_xxx

# Stripe Upgrade Coupons (coupon IDs from Step 5)
STRIPE_COUPON_SNAPSHOT_PLUS_CREDIT=SNAPSHOT_PLUS_CREDIT
STRIPE_COUPON_BLUEPRINT_CREDIT=BLUEPRINT_CREDIT
STRIPE_COUPON_FULL_SUITE_CREDIT=SNAPSHOT_PLUS_BLUEPRINT_CREDIT

# Your deployed app URL (used for Checkout redirect URLs)
NEXT_PUBLIC_BASE_URL=https://your-app-domain.com

# Webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Note**: 
- For testing, use `sk_test_...` keys
- For production, use `sk_live_...` keys
- Replace `xxx` with your actual values from Stripe Dashboard
- Coupon IDs must match exactly what you set in Stripe Dashboard

## Step 7: Test Mode vs Live Mode

### Test Mode
- Use test API keys (start with `sk_test_...` and `pk_test_...`)
- Use test card: `4242 4242 4242 4242`
- Any future expiry date, any CVC
- Test webhook events in Stripe Dashboard

### Live Mode
- Switch to live API keys (start with `sk_live_...` and `pk_live_...`)
- Update environment variables
- Real payments will be processed

## Step 8: Verify Setup

1. Start your development server: `npm run dev`
2. Navigate to `/brand-snapshot-suite`
3. Click "Get WunderBrand Snapshot+™ →" on any paid product
4. You should be redirected to Stripe Checkout
5. Use test card `4242 4242 4242 4242` to complete a test purchase
6. You should be redirected to `/checkout/success`

### Test Upgrade Flow
7. After a successful Snapshot+ test purchase, click "Explore WunderBrand Blueprint™ →"
8. Verify the checkout page shows the $497 upgrade credit applied
9. The customer should see $500 (not $997) as the amount due

## Troubleshooting

### "Invalid product SKU" error
- Check that `STRIPE_PRICE_SNAPSHOT_PLUS`, `STRIPE_PRICE_BLUEPRINT`, and `STRIPE_PRICE_BLUEPRINT_PLUS` are set in `.env.local`
- Verify the price IDs match your Stripe Dashboard

### "Stripe price ID not configured" error
- Ensure the environment variable for that product is set
- Check that the price ID is correct (starts with `price_...`)

### Redirect not working
- Verify `NEXT_PUBLIC_BASE_URL` is set correctly
- Check that the URL matches your deployed domain

### Checkout session not found
- This usually means the session expired (default: 24 hours)
- Try creating a new checkout session

## Next Steps (Phase 2)

### Database Migration

Run the migration to create the purchases table:

```bash
# In Supabase SQL Editor or via psql
psql -h your-db-host -U postgres -d your-db-name -f database/migration_brand_snapshot_purchases.sql
```

Or copy the SQL from `database/migration_brand_snapshot_purchases.sql` into your Supabase SQL Editor.

### Phase 2 Tasks

1. **Set up Stripe webhooks** to record purchases
   - Create `/app/api/webhooks/stripe/route.ts`
   - Listen for `checkout.session.completed` event
   - Insert records into `brand_snapshot_purchases` table

2. **Store purchase records** in `brand_snapshot_purchases` table
   - Table schema is ready (see migration file)
   - Tracks: email, Stripe session ID, product SKU, status, fulfillment

3. **Provision access to reports** based on purchases
   - Check `brand_snapshot_purchases` table before showing paid reports
   - Link purchases to generated reports via `report_id` field

4. **Send confirmation emails** with report links
   - After purchase is recorded, send email with report access
   - Include PDF download link in `pdf_url` field

5. **Handle refunds** (if needed)
   - Update `status` field to `'refunded'`// app/results/page.tsx

import { PillarResults } from "@/components/results/PillarResults";
import { BrandScoreGauge } from "@/components/results/BrandScoreGauge";
import { SnapshotUpgradeCTA } from "@/components/results/SnapshotUpgradeCTA";
import { SuiteCTA } from "@/components/results/SuiteCTA";
import { calculatePrimaryPillar } from "@/lib/scoring/primaryPillar";

export default function ResultsPage({ data }: { data: BrandSnapshotResult }) {
  const primaryPillar = calculatePrimaryPillar(data.pillarScores);
  const stage = data.stage; // inferred by engine

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      {/* 1. WunderBrand Score™ */}
      <BrandScoreGauge score={data.brandAlignmentScore} />

      {/* 2–3. Pillars */}
      <PillarResults
        pillarScores={data.pillarScores}
        pillarInsights={data.pillarInsights}
        primaryPillar={primaryPillar}
        stage={stage}
        businessName={data.businessName}
      />

      {/* 4. Snapshot+ CTA */}
      <SnapshotUpgradeCTA
        primaryPillar={primaryPillar}
        stage={stage}
        businessName={data.businessName}
      />

      {/* 5. Secondary CTA */}
      <SuiteCTA />
    </main>
  );
}

   - Revoke access to reports if needed

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For app-specific issues:
- Check the API route logs: `/app/api/checkout/route.ts`
- Verify environment variables are loaded correctly
