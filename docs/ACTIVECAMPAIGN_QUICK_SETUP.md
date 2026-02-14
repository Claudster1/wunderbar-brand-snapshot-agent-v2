# ActiveCampaign Quick Setup Reference

Quick reference guide for setting up the WunderBrand Snapshot™ automation.

## Step-by-Step Setup

### 1. Create Custom Fields

Go to **Settings → Fields** and create these fields:

**Score Fields (Text):**
- WunderBrand Score™
- Positioning Pillar Score
- Messaging Pillar Score
- Visibility Pillar Score
- Credibility Pillar Score
- Conversion Pillar Score

**Insight Fields (Text):**
- Positioning Insight
- Messaging Insight
- Visibility Insight
- Credibility Insight
- Conversion Insight

**Recommendation Fields (Long Text):**
- Top Opportunities
- Personalized Recommendations

**Upsell & Brand Info:**
- Snapshot+™ Upsell Block (Long Text)
- Brand URL (Text)
- Industry (Text)
- Company Name (Text)

### 2. Create Automation

1. Go to **Automations → Create Automation**
2. Name: "WunderBrand Snapshot™ Follow-Up Sequence"
3. **Start Trigger:** Tag added `brand_snapshot_completed`
4. **Runs:** Once per contact

### 3. Build Automation Flow

Add these steps in order:

```
1. Send Email 1 (Snapshot Summary)
   ↓
2. Wait: 1 day
   ↓
3. Send Email 2 (Deeper Insights)
   ↓
4. Wait: 1 day
   ↓
5. Send Email 3 (AI Tools)
   ↓
6. Wait: 2 days
   ↓
7. Send Email 4 (Check-in)
   ↓
8. Wait: 2 days
   ↓
9. IF/ELSE: Contact does NOT have tag "snapshot_plus_purchased"
   ↓
   10. Send Email 5 (Snapshot+ Upsell #1)
      ↓
   11. Wait: 3 days
      ↓
   12. IF/ELSE: Contact does NOT have tag "snapshot_plus_purchased"
      ↓
      13. Send Email 6 (Snapshot+ Education)
         ↓
      14. Wait: 3 days
         ↓
      15. IF/ELSE: Contact does NOT have tag "snapshot_plus_purchased"
         ↓
         16. Send Email 7 (Final Reminder)
   ELSE
      → End automation
```

### 4. Add Merge Tags to Emails

In each email template, use these merge tags:

- `%firstname%` - Contact's first name
- `%BRAND_ALIGNMENT_SCORE%` - Overall score
- `%POSITIONING_SCORE%`, `%MESSAGING_SCORE%`, etc. - Pillar scores
- `%POSITIONING_INSIGHT%`, `%MESSAGING_INSIGHT%`, etc. - Pillar insights
- `%WEAKEST_PILLAR%` - Lowest scoring pillar
- `%INDUSTRY%` - User's industry
- `%COMPANY_NAME%` - User's company
- `%TOP_OPPORTUNITIES%` - Top 3 opportunities
- `%PERSONALIZED_RECOMMENDATIONS%` - Full recommendations list
- `%SNAPSHOT_PLUS_PITCH%` - Dynamic upsell copy
- `%SNAPSHOT_PLUS_CHECKOUT_URL%` - Your checkout link

### 5. Set Up Purchase Exit

**Stripe Webhook → Zapier → ActiveCampaign**

When purchase is made:
1. Add tag: `snapshot_plus_purchased`
2. Automation will exit automatically (via IF/ELSE logic)

### 6. Test Automation

1. Create a test contact
2. Add tag `brand_snapshot_completed`
3. Verify emails send at correct intervals
4. Test purchase exit by adding `snapshot_plus_purchased` tag

## Email Template Locations

- Email 5: `docs/EMAIL_5_SNAPSHOT_PLUS_INVITATION.md`
- Email 6: `docs/EMAIL_6_SNAPSHOT_PLUS_EDUCATION.md`
- Email 7: `docs/EMAIL_7_FINAL_REMINDER.md`

## Troubleshooting

**Emails not sending?**
- Check that custom fields are created
- Verify merge tags match field names exactly
- Ensure automation is active

**Personalization not working?**
- Verify custom fields are populated when tag is added
- Check merge tag syntax (case-sensitive)
- Test with a contact that has all fields filled

**Purchase exit not working?**
- Verify `snapshot_plus_purchased` tag is added correctly
- Check IF/ELSE conditions in automation
- Ensure tag is added before next email sends

