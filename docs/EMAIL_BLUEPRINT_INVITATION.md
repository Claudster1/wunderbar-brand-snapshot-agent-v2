# Email: WunderBrand Blueprint™ Invitation

## Purpose
Upsell email that introduces Blueprint™ as the next step after Snapshot+™, positioning it as the system that turns clarity into actionable brand decisions.

## Timing
Recommended: 3-5 days after Snapshot+™ purchase, or 7-10 days after WunderBrand Snapshot™ completion (for users who haven't purchased Snapshot+™)

## ActiveCampaign Merge Tags
- `{{first_name}}` - User's first name

## Email Template

```
Subject: From clarity to a fully activated brand system

Hi {{first_name}},

Snapshot+™ gives clarity.
Blueprint™ turns that clarity into a fully activated brand system.

This is where positioning, messaging, and visibility stop being insights
and start guiding real decisions — consistently.

When you're ready to build on what you've already uncovered:
→ Explore WunderBrand Blueprint™

Best,  
Claudine
```

## ActiveCampaign Setup

1. **Trigger Options**:
   - Tag added: `snapshot_plus_purchased` (3-5 days delay) - For Snapshot+™ purchasers
   - OR: Tag added: `brand_snapshot_completed` (7-10 days delay) - For users who haven't purchased Snapshot+™
2. **Conditional**: Only send if user does NOT have tag: `blueprint_purchased`
3. **Personalization**: 
   - Use `%FIRST_NAME%` merge tag for first name

## Email Sequence Position

This email works well as:
- **EMAIL_4 or EMAIL_5**: Upsell to Blueprint™ after Snapshot+™ value has been established
- **Positioning**: Positions Blueprint™ as the natural evolution from insight to system
- **Tone**: Direct, confident, forward-looking

## Key Messaging

- **Progression**: Snapshot+™ (clarity) → Blueprint™ (system)
- **Transformation**: Insights become actionable decisions
- **Scope**: Positioning, messaging, visibility as core system elements
- **Benefit**: Consistency in brand decisions
- **CTA**: Low-pressure invitation ("when you're ready")

## Segmentation Options

Consider sending different versions based on:
- **Snapshot+™ purchasers**: Emphasize building on what they've already invested in
- **Snapshot-only users**: Position as the complete solution they haven't yet accessed
- **Primary pillar**: Could personalize based on their primary focus area
