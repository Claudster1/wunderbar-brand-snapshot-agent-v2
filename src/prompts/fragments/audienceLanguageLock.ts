/**
 * Shared audience / consumer-vertical language lock for scoring + paid report engines.
 * Keep this the single source of truth so Snapshot / Snapshot+ / Blueprint stay aligned.
 */

export const audienceLanguageLockFragment = `
AUDIENCE LANGUAGE LOCK (CRITICAL — apply to every insight, recommendation, example, and financialImpact line):

Detect consumer-facing context when ANY of these are true:
• audienceType is B2C (or both with consumer-dominant marketing)
• businessType is local_service, service_b2c, retail, or ecommerce
• industry / offer text clearly indicates a consumer vertical pack below

When consumer-facing, NEVER default to: "prospects," "decision-makers," "sales cycle," "pipeline," "ICP," "SQL," "ABM," or LinkedIn-first channel advice — unless the business is clearly B2B professional services / SaaS selling to other businesses.

Prefer plain customer nouns: clients, guests, shoppers, patients, members, homeowners — match the vertical.

CONSUMER VERTICAL PACKS (pick the closest; do not invent jargon):
• beauty_wellness — salon, spa, nails, medspa, barber, beauty: clients, bookings, reviews, Instagram/Google, before/after proof, rebooking
• hospitality — restaurant, café, hotel, bar: guests, covers/ticket, foot traffic, Maps/Instagram, reserve/order CTA, repeat visits
• fashion_retail — apparel, boutique, fashion brand (store and/or online): shoppers, style/fit, lookbooks/UGC, Instagram/TikTok, drops, try-on / returns clarity
• home_services — HVAC, plumbing, cleaning, landscaping, trades: homeowners, estimates/bookings, Google/reviews, trust + reliability, call/book CTA
• consumer_professional — consumer financial advisory, insurance, tax, consumer legal, residential real estate: clients, clarity/trust, credentials, education content, consult/book — NOT beauty/Instagram-first framing
• health_clinic — dental, chiro, physio, veterinary, outpatient clinic: patients/clients, appointments, reviews, local search, care + outcomes proof
• dtc_product — product / ecommerce brands: shoppers, AOV, cart/checkout trust, product discovery, email/SMS retention

B2B professional / SaaS: buyers/clients, LinkedIn/email, case studies, buying cycle language OK when evidence supports it.

Both audiences: name the dual audience; weight vocabulary toward the marketing-dominant side when provided; otherwise stay plain and avoid B2B jargon for local/consumer-heavy models.

FINANCIAL IMPACT LANGUAGE:
• Consumer verticals → bookings, show rate, average ticket/order, repeat rate, review volume, foot traffic, AOV, opt-in rate
• B2B / SaaS → CAC, close rate, buying-cycle length, deal size, retention, referral quality
Never force sales-cycle / deal-size framing onto a salon, restaurant, boutique, or consumer advisor.
`.trim();
