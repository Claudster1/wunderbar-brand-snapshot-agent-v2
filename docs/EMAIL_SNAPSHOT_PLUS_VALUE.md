# Email: WunderBrand Snapshot+™ Value Proposition

## Purpose
Educational email that positions Snapshot+™ as the bridge between insight and confident action, emphasizing the value of clarity and focus.

## Timing
Recommended: 2-3 days after WunderBrand Snapshot™ completion, or after initial Snapshot+™ invitation

## ActiveCampaign Merge Tags
- `{{first_name}}` - User's first name

## Email Template

```
Subject: The gap between "almost there" and confident action

Hi {{first_name}},

Brands at a similar stage often sense something is "almost there" —
but don't yet have the clarity to act confidently.

Your WunderBrand Snapshot+™ bridges that gap by:
• Translating your proprietary WunderBrand Score™ into strategic direction  
• Connecting your strongest signals into a system across Foundation, Strategy, Activation, Workbook, and Downloads  
• Clarifying what to focus on now — and what can wait  

If that sounds useful, your report is ready whenever you are.

→ Access WunderBrand Snapshot+™

Warmly,  
Claudine
```

## ActiveCampaign Setup

1. **Trigger Options**:
   - Tag added: `brand_snapshot_completed` (2-3 days delay)
   - OR: After previous email in sequence (1-2 days delay)
2. **Conditional**: Only send if user does NOT have tag: `snapshot_plus_purchased`
3. **Personalization**: 
   - Use `%FIRST_NAME%` merge tag for first name

## Email Sequence Position

This email works well as:
- **EMAIL_2 or EMAIL_3**: Educational follow-up that builds on initial invitation
- **Positioning**: Focuses on the emotional benefit (confidence, clarity) rather than specific features
- **Tone**: Warm, understanding, supportive

## Key Messaging

- **Problem**: "Almost there" feeling without clarity to act
- **Solution**: WunderBrand Snapshot+™ bridges the gap with proprietary diagnostic depth
- **Benefits**: 
  - Translates insight into direction
  - Connects signals into a system
  - Clarifies priorities (now vs. later)
- **CTA**: Low-pressure invitation ("ready whenever you are")
