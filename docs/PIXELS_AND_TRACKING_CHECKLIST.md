# Marketing Pixels & Conversion Tracking — Setup Checklist

Single source of truth for turning on and verifying ad-platform tracking across the **app**
(`app.wunderbrand.ai`) and the **marketing site** (`wunderbardigital.com`).

**Principle:** one Meta pixel + one LinkedIn tag + one GA4 property shared across **both** properties, so
the marketing-site → app funnel stays stitched. Distinguish the two by **domain/hostname** and the
`wb_source` event parameter — not by using separate IDs.

---

## Reference — IDs

| Thing | Value | Notes |
|---|---|---|
| Meta Pixel / dataset | `1594953932260984` | "Wunderbar Digital Web" dataset. Live in app. |
| LinkedIn Insight Tag partner ID | `9695948` | Live in app. Account currently "on hold" (billing/verification). |
| GA4 measurement ID | `G-HFNS3KRBKH` | Analytics category. In app; **not yet on marketing site**. |
| Google Ads ID | _pending_ | `AW-…` — blocked on advertiser verification (D&B or individual ID). |
| LinkedIn Lead conversion ID | _pending_ | Create in Campaign Manager → send to eng. |
| LinkedIn Purchase conversion ID | _pending_ | Create in Campaign Manager → send to eng. |

App env vars (Vercel + `.env.local`): `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`,
`NEXT_PUBLIC_LINKEDIN_PARTNER_ID`, `NEXT_PUBLIC_LINKEDIN_LEAD_CONVERSION_ID`,
`NEXT_PUBLIC_LINKEDIN_PURCHASE_CONVERSION_ID`.

---

## Status — done in code / app

- [x] Meta Pixel live in app (consent-gated, marketing category).
- [x] LinkedIn Insight Tag live in app (consent-gated).
- [x] Google Ads re-categorized as a **Marketing** cookie (was mis-filed under Analytics).
- [x] Conversion funnel firing: **StartTrial** (diagnostic start) → **Lead** (snapshot email capture)
      → **InitiateCheckout** (upgrade CTA) → **Purchase** (with tier key `content_ids`/`item_id`).
- [x] Every Meta/GA event tagged `wb_source="app"` for app-vs-site segmentation.
- [x] All marketing pixels gated behind the "Marketing" consent category (off by default).
- [x] App outbound links + SMS/email links carry `utm_source=wunderbrand_app`.

---

## Open — YOUR dashboard / site / CRM tasks

### 1. Google Ads — reactivate, then send the `AW-` ID
- [ ] Complete **advertiser verification**: Dun & Bradstreet (D-U-N-S) **or** switch to individual
      verification (government ID). Confirm business name/address matches records; add a billing method.
- [ ] Once reactivated: **Tools → Data manager → Google tag** → copy `AW-XXXXXXXXX` → **send to eng**.
- Dashboard: [ads.google.com](https://ads.google.com)

### 2. LinkedIn — create 2 conversions, send the IDs (and clear the hold)
- [ ] Resolve the account **"on hold"** status (Billing + Account settings).
- [ ] **Measure → Conversion tracking → Create conversion** (Insight Tag / event-specific):
  - [ ] "Snapshot Lead" (type: Lead) → copy conversion ID
  - [ ] "Purchase" (type: Purchase, with value) → copy conversion ID
- [ ] **Send both IDs to eng** → they go in `NEXT_PUBLIC_LINKEDIN_LEAD_CONVERSION_ID` /
      `_PURCHASE_CONVERSION_ID` (code already calls `lintrk`).
- Dashboard: [Campaign Manager](https://www.linkedin.com/campaignmanager)

### 3. GA4 — cross-domain + add to marketing site
- [ ] **Admin → Data streams →** (web stream `G-HFNS3KRBKH`) **→ Configure tag settings → Configure your
      domains** → add `app.wunderbrand.ai` **and** `wunderbardigital.com` (+ `www`). Keep ONE stream.
- [ ] Add the **same GA4 tag** (`G-HFNS3KRBKH`) to the marketing site (consent-gated — see §5).
- [ ] View app vs site via the **Hostname** dimension.
- Dashboard: [analytics.google.com](https://analytics.google.com)

### 4. Meta — custom conversions
- [ ] **Custom Conversions → Create** on dataset `1594953932260984`:
  - [ ] "App – Snapshot Lead": event **Lead**, rule URL contains `app.wunderbrand.ai` (or `wb_source = app`)
  - [ ] "App – Purchase": event **Purchase**, rule URL contains `app.wunderbrand.ai/checkout/success`; set value
- Dashboard: [Events Manager](https://business.facebook.com/events_manager)

### 5. Marketing site — install pixels (consent-gated)
The site is static HTML with a consent banner storing `localStorage["cookie_consent_v1"]` (`{marketing:true}`)
and buttons `#wb-accept-btn` / `#wb-save-prefs`. **Do not** put pixels in `<head>` — use the consent-gated
loader (fires only after Marketing is accepted). Fill in IDs and paste once before `</body>` (or in
`/javascript/main.js`). See the loader script provided in chat; IDs: Meta `1594953932260984`,
LinkedIn `9695948` (+ GA4 `G-HFNS3KRBKH` if adding analytics there).
- [ ] Install Meta Pixel (consent-gated)
- [ ] Install LinkedIn Insight Tag (consent-gated)
- [ ] Install GA4 (consent-gated, analytics) — required for cross-domain in §3

### 6. Privacy Policy — publish updates (once pixels are live)
On `wunderbardigital.com/privacy-policy`:
- [ ] **Marketing cookies row**: replace "No marketing cookies are currently active…" with the live tools
      (Meta Pixel + LinkedIn Insight Tag; add Google Ads when live).
- [ ] **"Do we sell your data?"** box: update to disclose "sharing" for cross-context behavioral advertising
      when marketing consent is given (opt-out via banner / Do Not Sell/Share link).
- [ ] **CCPA/CPRA** section: same update.
- [ ] Bump the **Effective Date**.
- [ ] (Accuracy) Reconcile the **GA4** line with what's actually running on the site.

### 7. Messaging Terms (SMS) — publish on /terms-of-service
- [ ] Paste the SMS/Text Messaging Terms draft (provided in chat), including the line: *phone calls are
      placed manually by our team — no autodialer or prerecorded messages.*
- [ ] The app's "Messaging Terms" opt-in link points to `/terms-of-service`.

### 8. Verify pixels are firing
- [ ] Install **Meta Pixel Helper** + **LinkedIn Insight Tag Helper** Chrome extensions.
- [ ] On the app: **accept Marketing cookies** → confirm both light up with IDs `1594953932260984` /
      `9695948` and a PageView; complete a snapshot → one `Lead`; buy → `Purchase` with `content_ids`.

### 9. Upsell remarketing audiences (CRM — the real upsell engine)
Build **Custom Audiences / Customer Match** from ActiveCampaign `purchased:{tier}` tags (source of truth for
entitlement), with exclusions:
- [ ] `purchased:snapshot-plus` minus `purchased:blueprint` → Blueprint upsell
- [ ] `purchased:blueprint` minus `purchased:blueprint-plus` → Blueprint+ upsell
- [ ] any `purchased:*` → Managed Marketing / AI Consulting
- [ ] `services:managed_marketing` / `services:consulting` interest tags → warm service audiences

---

## Open — ENG (waiting on you)

- [ ] Set `NEXT_PUBLIC_GOOGLE_ADS_ID` when the `AW-` ID arrives → redeploy.
- [ ] Set `NEXT_PUBLIC_LINKEDIN_LEAD_CONVERSION_ID` + `_PURCHASE_CONVERSION_ID` when the LinkedIn IDs arrive
      → redeploy.
