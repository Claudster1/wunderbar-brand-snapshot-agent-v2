# Wundy™ Marketing Chat Widget — Setup Guide

## Overview

The Wundy™ marketing widget embeds a floating chat bubble on your marketing website (wunderbardigital.com). Visitors can ask Wundy about branding concepts, your products, pricing, and services — all powered by the same AI infrastructure that runs the diagnostic app.

## Architecture

```
Marketing Site (Showit)          Your App (Vercel)
┌───────────────────┐           ┌───────────────────┐
│  wundy-widget.js  │──POST───▶│ /api/chat/marketing│
│  (chat UI)        │◀──JSON───│ (CORS-enabled)     │
└───────────────────┘           │                    │
                                │ wundyMarketingPrompt│
                                │ + AI fallback chain │
                                └───────────────────┘
```

## Step 1: Environment Variables

Add these to your Vercel project (or `.env.local`):

```env
# Required: Comma-separated list of allowed origins
MARKETING_WIDGET_ORIGINS=https://wunderbardigital.com,https://www.wunderbardigital.com

# Optional: API key for widget authentication (recommended for production)
MARKETING_WIDGET_API_KEY=your-secret-key-here
```

To generate an API key:
```bash
openssl rand -hex 32
```

## Step 2: Embed on Showit

In Showit, go to **Site Settings → Custom Code → Footer Code** and paste:

```html
<script
  src="https://app.wunderbrand.ai/wundy-widget.js"
  data-api="https://app.wunderbrand.ai/api/chat/marketing"
  data-key="YOUR_WIDGET_API_KEY"
  defer
></script>
```

Replace:
- `app.wunderbrand.ai` with your actual Vercel domain
- `YOUR_WIDGET_API_KEY` with the key from Step 1 (omit `data-key` entirely if you didn't set one)

### Optional Attributes

| Attribute | Default | Description |
|---|---|---|
| `data-position` | `right` | Chat bubble position: `right` or `left` |
| `data-greeting` | (see below) | Custom greeting message |
| `data-accent` | `#07B0F2` | Accent color (links, highlights) |

Default greeting:
> Hi, I'm Wundy — your brand guide. Ask me anything about branding, our diagnostics, or how Wunderbar Digital can help.

### Custom Greeting Example

```html
<script
  src="https://app.wunderbrand.ai/wundy-widget.js"
  data-api="https://app.wunderbrand.ai/api/chat/marketing"
  data-key="YOUR_WIDGET_API_KEY"
  data-greeting="Hey there! I'm Wundy, your brand guide. Curious about your brand health? Ask me anything."
  data-position="right"
  defer
></script>
```

## Step 3: Verify

1. Visit your marketing site
2. Look for the chat bubble in the bottom-right corner (navy circle with chat icon)
3. Click it — the panel opens with Wundy's greeting
4. Send a message — it should respond within 2–5 seconds
5. Test a few scenarios:
   - "What is WunderBrand Suite?" (product info)
   - "How much does it cost?" (pricing)
   - "Can you help with my marketing?" (services)
   - "I want to start a diagnostic" (links to product page)

## How It Works

### Security
- **CORS**: Only requests from allowed origins are accepted
- **API Key**: Optional `X-Widget-Key` header for authentication
- **Rate Limiting**: 20 requests per minute per IP
- **Input Sanitization**: All user input is sanitized server-side
- **Message Limit**: Conversations capped at 40 messages

### AI Routing
The widget uses the `wundy_marketing` use case, which routes to `gpt-4o-mini` with Gemini fallback — same quality as in-app Wundy, cost-optimized for volume.

### UTM Tracking
All links in Wundy's responses use `utm_source=marketing_widget` and `utm_medium=chat_widget`, so you can track marketing widget conversions separately from in-app Wundy conversations in your analytics.

### Style Isolation
The widget uses Shadow DOM, so its styles won't conflict with your marketing site's CSS (and vice versa).

## Customization

### Changing the Greeting
Update the `data-greeting` attribute on the script tag. No code changes needed.

### Updating Knowledge Base
The widget pulls from `src/prompts/wundyMarketingPrompt.ts`, which imports and extends `wundyGuidePrompt.ts`. To add business information:

1. **General knowledge** (shared with in-app Wundy): Edit `src/prompts/wundyGuidePrompt.ts`
2. **Marketing-only context**: Edit `src/prompts/wundyMarketingPrompt.ts`

### Changing Colors
The navy/blue brand tokens are hardcoded in the widget JS for zero-dependency operation. To change them, edit `public/wundy-widget.js` directly.

## Files

| File | Purpose |
|---|---|
| `public/wundy-widget.js` | Self-contained widget (JS + CSS, no dependencies) |
| `app/api/chat/marketing/route.ts` | CORS-enabled API endpoint |
| `src/prompts/wundyMarketingPrompt.ts` | Marketing-specific system prompt |
| `lib/ai/config.ts` | AI model routing (`wundy_marketing` use case) |

## Troubleshooting

| Issue | Fix |
|---|---|
| Widget doesn't appear | Check browser console for errors. Verify the `data-api` URL is correct. |
| CORS error in console | Add your marketing site URL to `MARKETING_WIDGET_ORIGINS` env var. |
| 401 Unauthorized | Check that `data-key` matches `MARKETING_WIDGET_API_KEY` env var. |
| 429 Too Many Requests | Rate limit hit (20/min per IP). Wait and retry. |
| Slow responses | AI latency is typically 2–5s. Check Vercel function logs for timeout errors. |
| Links open in widget | All links have `target="_blank"` — they should open in a new tab. |
