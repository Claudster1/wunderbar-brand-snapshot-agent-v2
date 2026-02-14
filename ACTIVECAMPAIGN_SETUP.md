# ActiveCampaign Integration Setup Guide

This guide will help you set up the ActiveCampaign integration for the WunderBrand Snapshot™ agent.

## Step 1: Get Your ActiveCampaign API Credentials

1. Log in to your ActiveCampaign account
2. Go to **Settings** → **Developer**
3. Copy your **API URL** (e.g., `https://YOUR-ACCOUNT.api-us1.com`)
4. Copy your **API Token**

## Step 2: Set Environment Variables

Add these to your `.env.local` file (and Vercel environment variables):

```bash
ACTIVE_CAMPAIGN_API_KEY=your_api_token_here
ACTIVE_CAMPAIGN_API_URL=https://YOUR-ACCOUNT.api-us1.com
```

## Step 3: Create Custom Fields in ActiveCampaign

You need to create custom fields in ActiveCampaign for all the data Wundy™ collects. Here's the recommended list:

### User/Company Fields
- Company Name (Text)
- Industry (Text)
- Website (Text)
- LinkedIn URL (Text)
- Instagram URL (Text)
- Facebook URL (Text)
- Other Social Links (Text - JSON array)

### Brand Fields
- What You Do (Textarea)
- Who You Serve (Text)
- Problem Solved (Text)
- Brand Personality (Text)
- Differentiator (Text)
- Offer Clarity (Text)
- Brand Confidence (Text)

### Marketing Fields
- Marketing Channels (Text)
- Content Frequency (Text)
- Email Marketing (Text)
- Running Ads (Text)
- Lead Generation Offers (Text)
- Marketing Confidence (Text)

### Visual Brand Fields
- Has Logo (Text)
- Visual Consistency (Text)
- Visual Alignment (Text)

### Credibility & Conversion Fields
- Testimonials (Text)
- CTA Clarity (Text)

### Score Fields (Number fields)
- Positioning Score (Number)
- Messaging Score (Number)
- Visibility Score (Number)
- Credibility Score (Number)
- Conversion Score (Number)
- WunderBrand Score™ (Number)

## Step 4: Get Custom Field IDs

After creating the fields:

1. Go to **Settings** → **Fields**
2. Click on each custom field
3. Copy the **Field ID** (numeric ID)
4. Add them to your `.env.local` file:

```bash
AC_FIELD_COMPANY_NAME=1
AC_FIELD_INDUSTRY=2
AC_FIELD_WEBSITE=3
AC_FIELD_LINKEDIN=4
AC_FIELD_INSTAGRAM=5
AC_FIELD_FACEBOOK=6
AC_FIELD_OTHER_SOCIAL=7
AC_FIELD_WHAT_YOU_DO=8
AC_FIELD_WHO_YOU_SERVE=9
AC_FIELD_PROBLEM=10
AC_FIELD_PERSONALITY=11
AC_FIELD_DIFFERENTIATOR=12
AC_FIELD_OFFER_CLARITY=13
AC_FIELD_BRAND_CONFIDENCE=14
AC_FIELD_CHANNELS=15
AC_FIELD_CONTENT_FREQUENCY=16
AC_FIELD_EMAIL_MARKETING=17
AC_FIELD_ADS=18
AC_FIELD_OFFERS=19
AC_FIELD_MARKETING_CONFIDENCE=20
AC_FIELD_HAS_LOGO=21
AC_FIELD_VISUAL_CONSISTENCY=22
AC_FIELD_VISUAL_ALIGNMENT=23
AC_FIELD_TESTIMONIALS=24
AC_FIELD_CTA_CLARITY=25
AC_FIELD_POSITIONING_SCORE=26
AC_FIELD_MESSAGING_SCORE=27
AC_FIELD_VISIBILITY_SCORE=28
AC_FIELD_CREDIBILITY_SCORE=29
AC_FIELD_CONVERSION_SCORE=30
AC_FIELD_ALIGNMENT_SCORE=31
```

**Note:** Replace the numbers above with your actual field IDs.

## Step 5: Create Tags in ActiveCampaign

Create these tags in ActiveCampaign (they'll be applied automatically):

- `brand_snapshot_completed`
- `brand_snapshot_high_score` (for scores ≥ 80)
- `brand_snapshot_mid_score` (for scores 60-79)
- `brand_snapshot_low_score` (for scores < 60)
- `brand_snapshot_opt_in`
- `brand_snapshot_no_opt_in`

## Step 6: How It Works

1. Wundy™ completes the conversation and generates the final JSON
2. Your front-end calls `/api/activecampaign` with the Wundy™ JSON
3. The API maps the data to ActiveCampaign format
4. Creates or updates the contact in ActiveCampaign
5. Applies appropriate tags based on scores and opt-in status

## Step 7: Testing

To test the integration:

1. Complete a WunderBrand Snapshot™ conversation
2. When Wundy™ outputs the final JSON, send it to `/api/activecampaign`
3. Check your ActiveCampaign account to verify:
   - Contact was created/updated
   - All custom fields are populated
   - Tags are applied correctly

## API Usage Example

```typescript
const wundyJson = {
  user: { /* ... */ },
  brand: { /* ... */ },
  // ... rest of Wundy™'s JSON output
};

const response = await fetch('/api/activecampaign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(wundyJson),
});

const result = await response.json();
```

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **404 Not Found**: Verify your API URL is correct
- **Field errors**: Ensure all custom field IDs are correct in environment variables
- **Tag errors**: Tags must exist in ActiveCampaign before they can be applied

## Next Steps

After setup, you can:
- Create automation workflows in ActiveCampaign based on tags
- Set up email sequences for different score ranges
- Build reports using the custom field data

