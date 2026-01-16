# Email: Brand Snapshot+™ Follow-up

## Purpose
Follow-up email sent after user reviews their Brand Snapshot™ results, highlighting their primary pillar and introducing Snapshot+™.

## Timing
Recommended: 1-2 days after Brand Snapshot™ completion

## ActiveCampaign Merge Tags
- `{{first_name}}` - User's first name
- `{{primary_pillar}}` - Primary focus pillar (e.g., "Positioning", "Messaging", "Visibility", "Credibility", "Conversion")

## Email Template

```
Subject: Your primary focus area: {{primary_pillar}}

Hi {{first_name}},

When you reviewed your Brand Snapshot™, one pillar stood out as your primary focus area:
{{primary_pillar}}

That's usually where small, intentional shifts create the biggest downstream impact.

If you'd like a clearer plan for strengthening that area — without redoing everything —
Brand Snapshot+™ expands on your results with deeper insight and prioritized next steps.

→ View your personalized Snapshot+™

Best,  
Claudine  
Wunderbar Digital
```

## ActiveCampaign Setup

1. **Trigger**: Tag added: `brand_snapshot_completed`
2. **Timing**: 1-2 days after trigger
3. **Conditional**: Only send if user does NOT have tag: `snapshot_plus_purchased`
4. **Personalization**: 
   - Use `%FIRST_NAME%` merge tag for first name
   - Use custom field for `%PRIMARY_PILLAR%` (set during Brand Snapshot completion)

## Custom Field Required

- **Primary Pillar** (Text field) - Stores the user's primary focus pillar from their Brand Snapshot™
