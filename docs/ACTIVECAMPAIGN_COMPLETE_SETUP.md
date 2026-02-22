# ActiveCampaign: Complete List of Fields, Tags & Merge Tags

Use this as your single checklist when adding everything to ActiveCampaign. After creating each item, copy its **Field ID** (for custom fields) into your `.env.local` as shown.

---

## 1. Custom fields to create

Create these in **Settings → Fields**. After creating each field, note its **Field ID** and set the matching `AC_FIELD_*` in `.env.local`.

### User / company

| Field name in AC | Type | Env variable | Merge tag (for emails) |
|------------------|------|--------------|------------------------|
| Company Name | Text | `AC_FIELD_COMPANY_NAME` | `%COMPANY_NAME%` |
| Industry | Text | `AC_FIELD_INDUSTRY` | `%INDUSTRY%` |
| Website | Text | `AC_FIELD_WEBSITE` | — |
| Role Phrase | Text | `AC_FIELD_ROLE_PHRASE` | `%ROLE_PHRASE%` |
| LinkedIn | Text | `AC_FIELD_LINKEDIN` | — |
| Instagram | Text | `AC_FIELD_INSTAGRAM` | — |
| Facebook | Text | `AC_FIELD_FACEBOOK` | — |
| Other Social | Text | `AC_FIELD_OTHER_SOCIAL` | — |

### Brand

| Field name in AC | Type | Env variable | Merge tag |
|------------------|------|--------------|-----------|
| What You Do | Long text | `AC_FIELD_WHAT_YOU_DO` | — |
| Who You Serve | Text | `AC_FIELD_WHO_YOU_SERVE` | — |
| Problem Solved | Text | `AC_FIELD_PROBLEM` | — |
| Brand Personality | Text | `AC_FIELD_PERSONALITY` | — |
| Differentiator | Text | `AC_FIELD_DIFFERENTIATOR` | — |
| Offer Clarity | Text | `AC_FIELD_OFFER_CLARITY` | — |
| Brand Confidence | Text | `AC_FIELD_BRAND_CONFIDENCE` | — |

### Marketing

| Field name in AC | Type | Env variable | Merge tag |
|------------------|------|--------------|-----------|
| Channels | Text | `AC_FIELD_CHANNELS` | — |
| Content Frequency | Text | `AC_FIELD_CONTENT_FREQUENCY` | — |
| Email Marketing | Text | `AC_FIELD_EMAIL_MARKETING` | — |
| Ads | Text | `AC_FIELD_ADS` | — |
| Offers | Text | `AC_FIELD_OFFERS` | — |
| Marketing Confidence | Text | `AC_FIELD_MARKETING_CONFIDENCE` | — |

### Visual

| Field name in AC | Type | Env variable | Merge tag |
|------------------|------|--------------|-----------|
| Has Logo | Text | `AC_FIELD_HAS_LOGO` | — |
| Visual Consistency | Text | `AC_FIELD_VISUAL_CONSISTENCY` | — |
| Visual Alignment | Text | `AC_FIELD_VISUAL_ALIGNMENT` | — |

### Credibility & conversion

| Field name in AC | Type | Env variable | Merge tag |
|------------------|------|--------------|-----------|
| Testimonials | Text | `AC_FIELD_TESTIMONIALS` | — |
| CTA Clarity | Text | `AC_FIELD_CTA_CLARITY` | — |

### Scores (Text or Number)

| Field name in AC | Type | Env variable | Merge tag |
|------------------|------|--------------|-----------|
| WunderBrand Score™ | Text | `AC_FIELD_BRAND_ALIGNMENT_SCORE` | `%BRAND_ALIGNMENT_SCORE%` |
| Positioning Score | Text | `AC_FIELD_POSITIONING_SCORE` | `%POSITIONING_SCORE%` |
| Messaging Score | Text | `AC_FIELD_MESSAGING_SCORE` | `%MESSAGING_SCORE%` |
| Visibility Score | Text | `AC_FIELD_VISIBILITY_SCORE` | `%VISIBILITY_SCORE%` |
| Credibility Score | Text | `AC_FIELD_CREDIBILITY_SCORE` | `%CREDIBILITY_SCORE%` |
| Conversion Score | Text | `AC_FIELD_CONVERSION_SCORE` | `%CONVERSION_SCORE%` |
| Primary Pillar | Text | `AC_FIELD_PRIMARY_PILLAR` | — |

### Insights (Long text for longer content)

| Field name in AC | Type | Env variable | Merge tag |
|------------------|------|--------------|-----------|
| Positioning Insight | Long text | `AC_FIELD_POSITIONING_INSIGHT` | `%POSITIONING_INSIGHT%` |
| Messaging Insight | Long text | `AC_FIELD_MESSAGING_INSIGHT` | `%MESSAGING_INSIGHT%` |
| Visibility Insight | Long text | `AC_FIELD_VISIBILITY_INSIGHT` | `%VISIBILITY_INSIGHT%` |
| Credibility Insight | Long text | `AC_FIELD_CREDIBILITY_INSIGHT` | `%CREDIBILITY_INSIGHT%` |
| Conversion Insight | Long text | `AC_FIELD_CONVERSION_INSIGHT` | `%CONVERSION_INSIGHT%` |

### Recommendations & opportunities

| Field name in AC | Type | Env variable | Merge tag |
|------------------|------|--------------|-----------|
| Top Opportunities | Long text | `AC_FIELD_TOP_OPPORTUNITIES` | `%TOP_OPPORTUNITIES%` |
| Personalized Recommendations | Long text | `AC_FIELD_PERSONALIZED_RECOMMENDATIONS` | `%PERSONALIZED_RECOMMENDATIONS%` |
| Website Notes | Long text | `AC_FIELD_WEBSITE_NOTES` | — |

### Report & upsell

| Field name in AC | Type | Env variable | Merge tag |
|------------------|------|--------------|-----------|
| **WunderBrand Snapshot™ Report Link** | Text | `AC_FIELD_REPORT_LINK` | **`%BRANDSNAPSHOTREPORTLINK%`** |
| Snapshot+ Upsell Block | Long text | `AC_FIELD_SNAPSHOT_PLUS_PITCH` | `%SNAPSHOT_PLUS_PITCH%` |
| Brand URL | Text | `AC_FIELD_BRAND_URL` | `%BRAND_URL%` |

### Snapshot+ (optional)

| Field name in AC | Type | Env variable | Merge tag |
|------------------|------|--------------|-----------|
| Persona | Text | `AC_FIELD_PERSONA` | — |
| Archetype | Text | `AC_FIELD_ARCHETYPE` | — |
| Color Palette | Long text | `AC_FIELD_COLOR_PALETTE` | — |
| Color Meaning 1 | Text | `AC_FIELD_COLOR_MEANING_1` | — |
| Color Meaning 2 | Text | `AC_FIELD_COLOR_MEANING_2` | — |
| Color Meaning 3 | Text | `AC_FIELD_COLOR_MEANING_3` | — |

---

## 2. Tags to create

Create these in **Settings → Tags**. Names must match **exactly** (including colons and lowercase).

### WunderBrand Snapshot™ completion (applied by `/api/activecampaign`)

| Tag name | When applied |
|----------|--------------|
| `brand_snapshot_completed` | When user completes WunderBrand Snapshot™ |
| `brand_snapshot_high_score` | Score ≥ 80 |
| `brand_snapshot_mid_score` | Score 60–79 |
| `brand_snapshot_low_score` | Score &lt; 60 |
| `brand_snapshot_opt_in` | User opted in to email |
| `brand_snapshot_no_opt_in` | User did not opt in |

### Pillar score & insight tags (for personalized, educational emails)

Applied when the user completes WunderBrand Snapshot™. Use these to segment and personalize emails by exact scores and situation.

**Per-pillar score tier** (score 0–20: low 0–9, mid 10–14, high 15–20). Create all 15 tags:

| Tag name | When applied |
|----------|--------------|
| `pillar:positioning_low` | Positioning score 0–9 |
| `pillar:positioning_mid` | Positioning score 10–14 |
| `pillar:positioning_high` | Positioning score 15–20 |
| `pillar:messaging_low` | Messaging score 0–9 |
| `pillar:messaging_mid` | Messaging score 10–14 |
| `pillar:messaging_high` | Messaging score 15–20 |
| `pillar:visibility_low` | Visibility score 0–9 |
| `pillar:visibility_mid` | Visibility score 10–14 |
| `pillar:visibility_high` | Visibility score 15–20 |
| `pillar:credibility_low` | Credibility score 0–9 |
| `pillar:credibility_mid` | Credibility score 10–14 |
| `pillar:credibility_high` | Credibility score 15–20 |
| `pillar:conversion_low` | Conversion score 0–9 |
| `pillar:conversion_mid` | Conversion score 10–14 |
| `pillar:conversion_high` | Conversion score 15–20 |

**Weakest pillar** (the pillar with their lowest score). Create all 5 tags:

| Tag name | When applied |
|----------|--------------|
| `weakest_pillar:positioning` | Positioning is their lowest-scoring pillar |
| `weakest_pillar:messaging` | Messaging is their lowest-scoring pillar |
| `weakest_pillar:visibility` | Visibility is their lowest-scoring pillar |
| `weakest_pillar:credibility` | Credibility is their lowest-scoring pillar |
| `weakest_pillar:conversion` | Conversion is their lowest-scoring pillar |

### Stripe purchases & upgrade intent (applied/removed by Stripe webhook)

| Tag name | When applied | When removed |
|----------|--------------|--------------|
| `purchased:snapshot` | Free snapshot completed | — |
| `purchased:snapshot-plus` | After Snapshot+™ purchase | — |
| `purchased:blueprint` | After Blueprint™ purchase | — |
| `purchased:blueprint-plus` | After Blueprint+™ purchase | — |
| `purchased:refunded` | Purchase refunded | — |
| `intent:upgrade-snapshot-plus` | After free snapshot (enter S+ nurture) | When they purchase Snapshot+ |
| `intent:upgrade-blueprint` | After Snapshot+ purchase (enter Blueprint nurture) | When they purchase Blueprint |
| `intent:upgrade-blueprint-plus` | After Blueprint purchase (enter Blueprint+ nurture) | When they purchase Blueprint+ |
| `intent:services` | Services interest signal (triggers Seq 13) | — |
| `nurture:other-services` | After Blueprint+ purchase (cross-sell services) | — |

### Content & services tags

| Tag name | When applied |
|----------|--------------|
| `content:opt-in` | Form submit from lead magnet / blog / content download (triggers Seq 14) |
| `content:opted_in` | After Seq 14 completes (triggers Seq 16 newsletter) |
| `services:interested` | Expressed interest in services |
| `services:call-booked` | Services discovery call booked |
| `services:client-active` | Active managed services client |

### Lifecycle tags

| Tag name | When applied |
|----------|--------------|
| `evergreen:complete` | Completed Seq 15 or 17 without conversion |

### Behavior tags (used by other app routes)

| Tag name | When used |
|----------|-----------|
| `snapshot:viewed-results` | Results page view (analytics) |
| `snapshot:return-visit` | Return visit (analytics) |
| `snapshot:clicked-upgrade` | Clicked upgrade CTA |
| `snapshot:completed` | Snapshot completed (analytics) |
| `snapshot:coverage-gap` | Context coverage &lt; 80% |
| `snapshot:paused` | User saved and exited mid-diagnostic |
| `snapshot:resume-link-sent` | Resume link emailed |

---

## 3. Merge tags for email templates

Use these in **email content** (campaigns/automations). ActiveCampaign generates merge tags from the **Field Title** (or perstag); the app uses the Report Link field title **Brand_Snapshot_Report_Link**, which typically becomes `%BRANDSNAPSHOTREPORTLINK%`.

| Use in emails | Merge tag |
|---------------|-----------|
| Report link (CTA URL) | **`%BRANDSNAPSHOTREPORTLINK%`** |
| Overall score | `%BRAND_ALIGNMENT_SCORE%` |
| Pillar scores | `%POSITIONING_SCORE%`, `%MESSAGING_SCORE%`, `%VISIBILITY_SCORE%`, `%CREDIBILITY_SCORE%`, `%CONVERSION_SCORE%` |
| Pillar insights | `%POSITIONING_INSIGHT%`, `%MESSAGING_INSIGHT%`, etc. |
| Top opportunities | `%TOP_OPPORTUNITIES%` |
| Role phrase | `%ROLE_PHRASE%` |
| Snapshot+ upsell copy | `%SNAPSHOT_PLUS_PITCH%` |
| Company / brand | `%COMPANY_NAME%`, `%INDUSTRY%`, `%BRAND_URL%` |
| Content download | `%CONTENT_DOWNLOAD_LINK%` |
| Experience survey | `%EXPERIENCE_SURVEY_LINK%` |
| Services page | `%SERVICES_URL%` |
| Refresh action | `%REFRESH_ACTION_URL%` |

**CTA link example:**  
`<a href="%BRANDSNAPSHOTREPORTLINK%">View your report</a>`

---

## 3b. Using pillar scores and insights for personalized, educational emails

Scores and insights are stored as **custom fields** (merge tags below). The **tags** above let you branch automations and send the right education per pillar and score tier.

### Merge tags for pillar personalization

| What to show | Merge tag |
|--------------|-----------|
| Overall score | `%BRAND_ALIGNMENT_SCORE%` |
| Positioning score (0–20) | `%POSITIONING_SCORE%` |
| Positioning insight (personalized copy) | `%POSITIONING_INSIGHT%` |
| Messaging score | `%MESSAGING_SCORE%` |
| Messaging insight | `%MESSAGING_INSIGHT%` |
| Visibility score | `%VISIBILITY_SCORE%` |
| Visibility insight | `%VISIBILITY_INSIGHT%` |
| Credibility score | `%CREDIBILITY_SCORE%` |
| Credibility insight | `%CREDIBILITY_INSIGHT%` |
| Conversion score | `%CONVERSION_SCORE%` |
| Conversion insight | `%CONVERSION_INSIGHT%` |
| Primary/weakest pillar name | `%PRIMARY_PILLAR%` (if you create this field) |
| Top opportunities (bulleted) | `%TOP_OPPORTUNITIES%` |
| Role phrase | `%ROLE_PHRASE%` |

### How to use tags + merge tags in the funnel

1. **Weakest-pillar focus**  
   - Trigger: Tag is added → `weakest_pillar:positioning` (repeat for messaging, visibility, credibility, conversion).  
   - In the email: Use that pillar’s insight and score, e.g. “Your Positioning score is %POSITIONING_SCORE% / 20. Here’s what that means for you: %POSITIONING_INSIGHT%” and link to report.  
   - Do the same for each pillar so everyone gets content tailored to their biggest opportunity.

2. **Score-tier education**  
   - Trigger: e.g. Tag is added → `pillar:positioning_low`.  
   - Send education specific to “low positioning” (e.g. clarity on offer, audience, differentiation).  
   - Use `%POSITIONING_INSIGHT%` and `%POSITIONING_SCORE%` in the body so the email reflects their exact situation.

3. **Multi-pillar flows**  
   - Use combinations: e.g. `brand_snapshot_completed` + `weakest_pillar:visibility` + `pillar:visibility_low` to send a “Visibility deep-dive” email only to people whose biggest gap is visibility and whose visibility score is low.  
   - In the email, use `%VISIBILITY_SCORE%`, `%VISIBILITY_INSIGHT%`, and `%TOP_OPPORTUNITIES%` so the email adds value and educates as they move through the funnel.

4. **Report CTA in every email**  
   - Always include the report link: `%BRANDSNAPSHOTREPORTLINK%` so they can revisit their scores and insights.

---

## 4. Env vars summary

After creating fields, set each Field ID in `.env.local` (and in Vercel for production):

```bash
# Required for AC API + Stripe webhook tags
ACTIVE_CAMPAIGN_API_URL=https://YOUR-ACCOUNT.api-us1.com
ACTIVE_CAMPAIGN_API_KEY=your_api_token

# Report link (required for email CTAs)
AC_FIELD_REPORT_LINK=54

# User/company
AC_FIELD_COMPANY_NAME=4
AC_FIELD_INDUSTRY=5
AC_FIELD_WEBSITE=6
AC_FIELD_ROLE_PHRASE=...
AC_FIELD_LINKEDIN=...
AC_FIELD_INSTAGRAM=...
AC_FIELD_FACEBOOK=...
AC_FIELD_OTHER_SOCIAL=...

# Brand
AC_FIELD_WHAT_YOU_DO=17
AC_FIELD_WHO_YOU_SERVE=18
AC_FIELD_PROBLEM=19
AC_FIELD_PERSONALITY=20
AC_FIELD_DIFFERENTIATOR=21
AC_FIELD_OFFER_CLARITY=22
AC_FIELD_BRAND_CONFIDENCE=23

# Marketing
AC_FIELD_CHANNELS=24
AC_FIELD_CONTENT_FREQUENCY=25
AC_FIELD_EMAIL_MARKETING=26
AC_FIELD_ADS=27
AC_FIELD_OFFERS=28
AC_FIELD_MARKETING_CONFIDENCE=29

# Visual
AC_FIELD_HAS_LOGO=30
AC_FIELD_VISUAL_CONSISTENCY=31
AC_FIELD_VISUAL_ALIGNMENT=32

# Credibility & conversion
AC_FIELD_TESTIMONIALS=34
AC_FIELD_CTA_CLARITY=35

# Scores
AC_FIELD_POSITIONING_SCORE=36
AC_FIELD_MESSAGING_SCORE=37
AC_FIELD_VISIBILITY_SCORE=38
AC_FIELD_CREDIBILITY_SCORE=39
AC_FIELD_CONVERSION_SCORE=40
AC_FIELD_BRAND_ALIGNMENT_SCORE=41
AC_FIELD_PRIMARY_PILLAR=...

# Insights
AC_FIELD_POSITIONING_INSIGHT=42
AC_FIELD_MESSAGING_INSIGHT=43
AC_FIELD_VISIBILITY_INSIGHT=44
AC_FIELD_CREDIBILITY_INSIGHT=45
AC_FIELD_CONVERSION_INSIGHT=46

# Recommendations
AC_FIELD_TOP_OPPORTUNITIES=47
AC_FIELD_WEBSITE_NOTES=48
AC_FIELD_PERSONALIZED_RECOMMENDATIONS=...

# Report & upsell
AC_FIELD_SNAPSHOT_PLUS_PITCH=...
AC_FIELD_BRAND_URL=...

# Snapshot+ (optional)
AC_FIELD_PERSONA=...
AC_FIELD_ARCHETYPE=...
AC_FIELD_COLOR_PALETTE=...
AC_FIELD_COLOR_MEANING_1=...
AC_FIELD_COLOR_MEANING_2=...
AC_FIELD_COLOR_MEANING_3=...
```

Replace `...` and numbers with your actual Field IDs from ActiveCampaign.

---

## 5. Quick checklist

- [ ] All **custom fields** above created; Field IDs in `.env.local` (and Vercel).
- [ ] All **tags** above created (exact spelling), including:
  - `brand_snapshot_*`, `purchased:*`, `intent:*`, `nurture:other-services`
  - **Pillar tags:** `pillar:positioning_low/mid/high` (and same for messaging, visibility, credibility, conversion)
  - **Weakest pillar:** `weakest_pillar:positioning`, `weakest_pillar:messaging`, etc.
- [ ] **Report link** field created and `AC_FIELD_REPORT_LINK` set (used for email CTAs).
- [ ] Email templates use **`%BRANDSNAPSHOTREPORTLINK%`** for the report CTA.
- [ ] Pillar personalization: emails use **pillar merge tags** (`%POSITIONING_SCORE%`, `%POSITIONING_INSIGHT%`, etc.) and **pillar/weakest-pillar tags** to branch flows.
- [ ] **Content/Services tags** created: `content:opt-in`, `content:opted_in`, `intent:services`, `services:call-booked`, `services:client-active`
- [ ] **Lifecycle tag** created: `evergreen:complete`
- [ ] Automations use the correct triggers — see [NURTURE_IMPLEMENTATION_GUIDE.md](./NURTURE_IMPLEMENTATION_GUIDE.md) for the complete reference for all 19 sequences.
