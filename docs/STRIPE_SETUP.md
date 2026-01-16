# Stripe Checkout Setup Guide

This guide explains how to set up Stripe Checkout for the Brand Snapshot Suite™ products.

## Prerequisites

1. **Stripe Account**: Create an account at [stripe.com](https://stripe.com)
2. **Stripe Products**: Create products in your Stripe Dashboard for:
   - Brand Snapshot+™ ($149)
   - Brand Snapshot Blueprint™ ($499)
   - Brand Snapshot Blueprint+™ ($999)

## Step 1: Install Stripe Package

```bash
npm install stripe
```

## Step 2: Create Products in Stripe Dashboard

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Click "Add product" for each product:

### Brand Snapshot+™
- **Name**: Brand Snapshot+™
- **Description**: A personalized deep-dive report with prioritized clarity improvements and AI-ready prompts.
- **Price**: $149.00 USD (one-time)
- **Copy the Price ID** (starts with `price_...`)

### Brand Snapshot Blueprint™
- **Name**: Brand Snapshot Blueprint™
- **Description**: A complete brand foundation — messaging, narrative, voice, and direction.
- **Price**: $499.00 USD (one-time)
- **Copy the Price ID** (starts with `price_...`)

### Brand Snapshot Blueprint+™
- **Name**: Brand Snapshot Blueprint+™
- **Description**: Your advanced strategic brand system — segmentation, matrices, campaign starters, and orchestration.
- **Price**: $999.00 USD (one-time)
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

## Step 5: Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PRICE_SNAPSHOT_PLUS=price_xxx
STRIPE_PRICE_BLUEPRINT=price_xxx
STRIPE_PRICE_BLUEPRINT_PLUS=price_xxx

# Your deployed app URL (used for Checkout redirect URLs)
NEXT_PUBLIC_APP_URL=https://your-app-domain.com

# Optional later (webhooks)
# STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Note**: 
- For testing, use `sk_test_...` keys
- For production, use `sk_live_...` keys
- Replace `xxx` with your actual values from Stripe Dashboard

## Step 6: Test Mode vs Live Mode

### Test Mode
- Use test API keys (start with `sk_test_...` and `pk_test_...`)
- Use test card: `4242 4242 4242 4242`
- Any future expiry date, any CVC
- Test webhook events in Stripe Dashboard

### Live Mode
- Switch to live API keys (start with `sk_live_...` and `pk_live_...`)
- Update environment variables
- Real payments will be processed

## Step 7: Verify Setup

1. Start your development server: `npm run dev`
2. Navigate to `/brand-snapshot-suite`
3. Click "Get Brand Snapshot+™ →" on any paid product
4. You should be redirected to Stripe Checkout
5. Use test card `4242 4242 4242 4242` to complete a test purchase
6. You should be redirected to `/checkout/success`

## Troubleshooting

### "Invalid product SKU" error
- Check that `STRIPE_PRICE_SNAPSHOT_PLUS`, `STRIPE_PRICE_BLUEPRINT`, and `STRIPE_PRICE_BLUEPRINT_PLUS` are set in `.env.local`
- Verify the price IDs match your Stripe Dashboard

### "Stripe price ID not configured" error
- Ensure the environment variable for that product is set
- Check that the price ID is correct (starts with `price_...`)

### Redirect not working
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
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
   - Update `status` field to `'refunded'`
   - Revoke access to reports if needed

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For app-specific issues:
- Check the API route logs: `/app/api/checkout/route.ts`
- Verify environment variables are loaded correctly
