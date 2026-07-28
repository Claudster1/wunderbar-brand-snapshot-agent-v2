# ActiveCampaign Custom Field Mapping

This document lists all ActiveCampaign custom fields required for the WunderBrand Snapshot™ system.

## Required Custom Fields

Create these fields in ActiveCampaign and note their Field IDs for environment variables.

### Score Fields (Text Type)

| AC Field Name | Field Type | Merge Tag | Description |
|---------------|------------|-----------|-------------|
| WunderBrand Score™ | Text | `%BRANDALIGNMENTSCORE%` | User's overall score (0–100) |
| Positioning Pillar Score | Text | `%POSITIONINGSCORE%` | 0–20 (weighted) |
| Messaging Pillar Score | Text | `%MESSAGINGSCORE%` | 0–20 |
| Visibility Pillar Score | Text | `%VISIBILITYSCORE%` | 0–20 |
| Credibility Pillar Score | Text | `%CREDIBILITYSCORE%` | 0–20 |
| Conversion Pillar Score | Text | `%CONVERSIONSCORE%` | 0–20 |

### Insight Fields (Text Type)

| AC Field Name | Field Type | Merge Tag | Description |
|---------------|------------|-----------|-------------|
| Positioning Insight | Text | `%POSITIONING_INSIGHT%` | Personalized insight |
| Messaging Insight | Text | `%MESSAGING_INSIGHT%` | Personalized insight |
| Visibility Insight | Text | `%VISIBILITY_INSIGHT%` | Personalized insight |
| Credibility Insight | Text | `%CREDIBILITY_INSIGHT%` | Personalized insight |
| Conversion Insight | Text | `%CONVERSION_INSIGHT%` | Personalized insight |

### Recommendations & Opportunities (Long Text Type)

| AC Field Name | Field Type | Merge Tag | Description |
|---------------|------------|-----------|-------------|
| Top Opportunities | Long text | `%TOPOPPORTUNITIES%` | 3 opportunities (AI-generated) |
| Personalized Recommendations | Long text | `%PERSONALIZED_RECOMMENDATIONS%` | Tailored list |

### Upsell & Brand Info (Text/Long Text)

| AC Field Name | Field Type | Merge Tag | Description |
|---------------|------------|-----------|-------------|
| Snapshot+™ Upsell Block | Long text | `%SNAPSHOT_PLUS_PITCH%` | Dynamic pitch to upgrade |
| Brand URL | Text | `%BRAND_URL%` | Provided by user |
| Industry | Text | `%INDUSTRY%` | Provided |
| Company Name | Text | `%COMPANYNAME%` | Provided |
| Role Phrase | Text | `%ROLE_PHRASE%` | Personalized role description (e.g., "running and growing the business day-to-day") |

## Environment Variables

After creating fields in ActiveCampaign, add their Field IDs to your `.env.local`:

```bash
# Score Fields
AC_FIELD_BRAND_ALIGNMENT_SCORE=1
AC_FIELD_POSITIONING_SCORE=2
AC_FIELD_MESSAGING_SCORE=3
AC_FIELD_VISIBILITY_SCORE=4
AC_FIELD_CREDIBILITY_SCORE=5
AC_FIELD_CONVERSION_SCORE=6

# Insight Fields
AC_FIELD_POSITIONING_INSIGHT=7
AC_FIELD_MESSAGING_INSIGHT=8
AC_FIELD_VISIBILITY_INSIGHT=9
AC_FIELD_CREDIBILITY_INSIGHT=10
AC_FIELD_CONVERSION_INSIGHT=11

# Recommendations
AC_FIELD_TOP_OPPORTUNITIES=12
AC_FIELD_PERSONALIZED_RECOMMENDATIONS=13

# Upsell & Brand Info
AC_FIELD_SNAPSHOT_PLUS_PITCH=14
AC_FIELD_BRAND_URL=15
AC_FIELD_INDUSTRY=16
AC_FIELD_COMPANY_NAME=17
AC_FIELD_ROLE_PHRASE=18
```

## Usage in Email Templates

Use these merge tags in ActiveCampaign email templates:

```
Your WunderBrand Score™: %BRANDALIGNMENTSCORE%

Positioning Score: %POSITIONINGSCORE% / 20
%POSITIONING_INSIGHT%

Top Opportunities:
%TOPOPPORTUNITIES%

This report was designed to support you in %ROLE_PHRASE%.

%SNAPSHOT_PLUS_PITCH%
```

## Integration Flow

1. User completes WunderBrand Snapshot™
2. Scores and insights are calculated
3. Form submission populates hidden fields
4. ActiveCampaign receives data via API or form webhook
5. Email automation uses merge tags to display personalized content

