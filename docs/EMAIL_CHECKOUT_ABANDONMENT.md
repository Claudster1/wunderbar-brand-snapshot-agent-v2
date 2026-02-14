# Checkout Abandonment Recovery Email Sequence

## Overview

When a user starts checkout but doesn't complete payment, Stripe fires a `checkout.session.expired` event. Our webhook catches this and:

1. Applies AC tags: `checkout:abandoned`, `checkout:abandoned:{product_key}`
2. Fires AC event: `checkout_abandoned` with `abandoned_product` and `abandoned_product_key` fields

We also fire `checkout_initiated` when checkout begins, so you can track initiation→completion rates.

---

## ActiveCampaign Automation Setup

### Trigger
- **Start trigger:** Contact receives tag `checkout:abandoned`
- **Wait condition:** Wait 1 hour, then check if contact has tag `purchased:snapshot-plus` (or `purchased:blueprint` / `purchased:blueprint_plus`). If they do, exit the automation (they completed the purchase).

### Email 1 — "Still thinking it over?" (1 hour after abandonment)

**Subject:** Still thinking it over? Here's what's waiting for you.
**Preview text:** Your Brand {ProductName} is one click away.

**Body:**

> Hi {firstName},
>
> I noticed you started exploring **{ProductName}** but didn't finish checking out. No pressure — just wanted to make sure nothing went wrong.
>
> Here's a quick reminder of what you'll get:
>
> **{Product-specific bullet points — pulled from comparison chart}**
>
> Your WunderBrand Snapshot™ results are still saved, and your {ProductName} report will be generated instantly after purchase.
>
> [Complete Your Purchase →] (link to checkout with email pre-filled)
>
> Questions? Reply to this email or [Talk to an Expert](https://wunderbardigital.com/talk-to-an-expert?utm_source=abandonment_email&utm_medium=email&utm_campaign=checkout_recovery&utm_content=email_1_talk_expert).
>
> — The Wunderbar Digital Team

---

### Email 2 — "What held you back?" (24 hours after abandonment)

**Subject:** Honest question: what held you back?
**Preview text:** We'd love to know — and help if we can.

**Body:**

> Hi {firstName},
>
> Yesterday you were exploring **{ProductName}** — and I'm curious what made you pause.
>
> Was it:
> - **Price?** Your {ProductName} delivers the same strategic depth as a $5,000–$15,000 agency engagement — at a fraction of the cost.
> - **Timing?** Your results don't expire. Purchase when you're ready and your report generates instantly.
> - **Uncertainty?** The free WunderBrand Snapshot™ gives you a real taste of the depth. If you found that valuable, {ProductName} goes significantly deeper.
>
> If you'd rather talk it through, our team is happy to help — no pressure, no pitch.
>
> [Talk to an Expert →](https://wunderbardigital.com/talk-to-an-expert?utm_source=abandonment_email&utm_medium=email&utm_campaign=checkout_recovery&utm_content=email_2_talk_expert)
>
> [Complete Your Purchase →] (link to checkout)
>
> — Claudine Waters, Founder of Wunderbar Digital

---

### Email 3 — "Your results are still waiting" (72 hours after abandonment)

**Subject:** Your brand diagnostic results are still waiting
**Preview text:** Don't let your insights go to waste.

**Body:**

> Hi {firstName},
>
> Just a final note — your WunderBrand Snapshot™ results are still saved, and your **{ProductName}** report is ready to generate the moment you're ready.
>
> A few things to keep in mind:
>
> ✅ **One-time purchase** — no subscriptions, no hidden fees
> ✅ **Instant delivery** — your report generates immediately
> ✅ **Built on 25+ years of expertise** — the same frameworks behind $10K+ consulting engagements
>
> [Get Your {ProductName} →] (link to checkout)
>
> If the timing isn't right, that's completely fine. Your free WunderBrand Snapshot™ is a complete diagnostic on its own.
>
> — The Wunderbar Digital Team

---

## AC Tags Reference

| Tag | Meaning |
|-----|---------|
| `checkout:initiated` | User started checkout (clicked "Buy") |
| `checkout:abandoned` | Checkout session expired without payment |
| `checkout:abandoned:snapshot_plus` | Abandoned Snapshot+ checkout |
| `checkout:abandoned:blueprint` | Abandoned Blueprint checkout |
| `checkout:abandoned:blueprint_plus` | Abandoned Blueprint+ checkout |
| `purchased:{product}` | Completed purchase (use to exit automation) |

## AC Events Reference

| Event | Fields |
|-------|--------|
| `checkout_initiated` | `checkout_product`, `checkout_session_id` |
| `checkout_abandoned` | `abandoned_product`, `abandoned_product_key` |

## Stripe Webhook Setup

Make sure `checkout.session.expired` is enabled in your Stripe webhook settings:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Click "..." → Update details
4. Under "Events to send," ensure `checkout.session.expired` is checked
5. Save

## Notes

- The `checkout.session.expired` event fires when a Stripe Checkout session expires (default: 24 hours after creation)
- We also fire `checkout_initiated` at session creation time for tracking
- The abandonment automation should always check for purchase completion before sending emails
- Emails should respect unsubscribe preferences
