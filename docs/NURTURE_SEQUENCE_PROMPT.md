# WunderBrand Nurture Sequence — Full Content Brief for Claude

Copy and paste everything below this line into Claude to generate all email copy.

---

## PROMPT STARTS HERE

You are writing the complete email nurture sequences for **WunderBrand** (by Wunderbar Digital). These emails will be built in ActiveCampaign (AC) and triggered by tags and events sent from the WunderBrand app.

Your job is to write every email for every sequence listed below — complete with subject lines, preview text, and full body copy — ready to paste into ActiveCampaign.

---

## BRAND VOICE & TONE

- **Premium, clear, approachable, human, consulting-level** — never gimmicky, never salesy
- Think: trusted guide who's been through this before, not a marketer trying to close
- Warm but direct. Confident but not arrogant. Encouraging but not patronizing.
- Never make anyone feel behind, inadequate, or pressured
- Use "you" and "your" — speak directly to the reader
- Short paragraphs, scannable, no walls of text
- Every email should feel like it was written by a person who genuinely cares about their business

**Never say:**
- "Assessment" — use **"diagnostic"** instead
- "Test" or "quiz"
- "Hurry" or "act now" or "limited time" (unless genuinely true, like a 30-day session window)
- "Don't miss out" or "You're missing out"
- Anything that implies they've done something wrong or are behind

**Always say:**
- **"Diagnostic"** (not assessment)
- **"WunderBrand Score™"** (with ™)
- **"Wundy™"** (with ™, the brand mascot/guide)
- **"Pillars"** when referring to the five brand dimensions
- Product names exactly: **WunderBrand Snapshot™** (free), **WunderBrand Snapshot+™** ($497), **WunderBrand Blueprint™** ($997), **WunderBrand Blueprint+™** ($1,997)

**Trademark usage:**
- Use ™ on first mention in each email, then drop it for readability
- Product names are always capitalized

---

## PRODUCT SUITE

| Product | Price | What It Delivers |
|---------|-------|-----------------|
| **WunderBrand Snapshot™** | Free | WunderBrand Score, 5-pillar analysis, top-level insights, 1 primary pillar identified |
| **WunderBrand Snapshot+™** | $497 | Everything in Snapshot + deeper pillar analysis, persona-aligned messaging, strategic recommendations, Foundational Prompt Pack (8 AI prompts) |
| **WunderBrand Blueprint™** | $997 | Everything in Snapshot+ + brand archetype, messaging framework, Interactive Brand Workbook, Brand Standards PDF export |
| **WunderBrand Blueprint+™** | $1,997 | Everything in Blueprint + advanced audience segmentation, Messaging Matrix, Campaign Architecture, AEO strategy, Advanced Prompt Library, complimentary 30-min Strategy Activation Session |
| **Snapshot+ Quarterly Refresh** | $47 | Re-run the Snapshot+ diagnostic to track progress |
| **Blueprint Quarterly Refresh** | $97 | Re-run the Blueprint diagnostic to track progress |

**The Five Pillars:** Positioning, Messaging, Visibility, Credibility, Conversion

**How it works:** Users have a conversation with Wundy (the AI guide), answer questions about their business, and receive results instantly when the conversation is complete. The diagnostic typically takes 15–20 minutes (free Snapshot) to 25–35 minutes (Blueprint+), depending on tier. Progress saves automatically. No prep required.

**Services:** Wunderbar Digital also offers managed marketing and consulting services (human-led). These are separate from the self-service product suite.

---

## ACTIVECAMPAIGN MERGE FIELDS

Use these exact merge field names in the copy. In ActiveCampaign, these will be mapped to custom fields or personalization tags.

### Contact Fields
- `%FIRSTNAME%` — First name (may not always be available; write fallback copy)
- `%COMPANY_NAME%` — Company/brand name
- `%EMAIL%` — Email address

### Score & Pillar Fields
- `%BRAND_ALIGNMENT_SCORE%` — Overall WunderBrand Score (0–100)
- `%POSITIONING_SCORE%` — Positioning pillar score (0–20)
- `%MESSAGING_SCORE%` — Messaging pillar score (0–20)
- `%VISIBILITY_SCORE%` — Visibility pillar score (0–20)
- `%CREDIBILITY_SCORE%` — Credibility pillar score (0–20)
- `%CONVERSION_SCORE%` — Conversion pillar score (0–20)
- `%PRIMARY_PILLAR%` — The weakest/primary pillar (e.g., "positioning", "messaging")
- `%WEAKEST_PILLAR%` — Same as primary pillar (used in some contexts)

### Product & Purchase Fields
- `%PRODUCT_NAME%` — Display name of purchased product (e.g., "WunderBrand Snapshot+™")
- `%PRODUCT_KEY%` — Internal key (e.g., "snapshot_plus", "blueprint")
- `%PURCHASE_DATE%` — Date of purchase
- `%AMOUNT_PAID%` — Amount paid

### Links
- `%REPORT_LINK%` — Direct link to their report/results
- `%REPORT_ID%` — Report identifier
- `%DASHBOARD_LINK%` — Link to their dashboard
- `%START_DIAGNOSTIC_LINK%` — Link to start/resume diagnostic
- `%RESUME_LINK%` — Link to resume a paused diagnostic
- `%EXPERIENCE_SURVEY_LINK%` — Link to WunderBrand Experience Survey
- `%UPGRADE_PRODUCT_URL%` — Link to purchase the next tier
- `%SERVICES_URL%` — Link to services page
- `%REFRESH_ACTION_URL%` — Link to purchase a quarterly refresh
- `%CONTENT_DOWNLOAD_LINK%` — Link to download lead magnet / content resource
- `%TESTIMONIAL_LINK%` — Link to submit a testimonial
- `%GOOGLE_REVIEW_URL%` — Link to leave a Google review

### Upgrade Fields
- `%UPGRADE_PRODUCT_NAME%` — Name of the next tier up
- `%UPGRADE_PRICE%` — Price of the next tier

### Abandoned Cart Fields
- `%ABANDONED_PRODUCT%` — Name of the product they abandoned
- `%ABANDONED_PRODUCT_URL%` — Link back to checkout
- `%ABANDONED_PRODUCT_PRICE%` — Price of the abandoned product

### Refresh Fields
- `%REFRESH_BRAND_NAME%` — Brand name for refresh context
- `%REFRESH_TIER%` — Tier being refreshed
- `%REFRESH_DAYS_REMAINING%` — Days left in refresh window
- `%REFRESH_WINDOW_END%` — Date refresh window closes
- `%REFRESH_PRICE%` — Price of the refresh

### Session Fields
- `%SESSION_TYPE%` — Type of session (e.g., "talk_to_expert", "activation_session")
- `%SCHEDULED_DATE%` — Date of scheduled session
- `%NOSHOW_DATE%` — Date of missed session

### Email Content Fields (for purchase welcome)
- `%TIME_ESTIMATE%` — Estimated diagnostic time (e.g., "15–20 minutes")
- `%UPLOAD_LIMIT%` — Number of files allowed (e.g., "3", "10")
- `%CHECKLIST_SUMMARY%` — Summary of what to have handy

### Experience Score Fields
- `%EXPERIENCE_SCORE%` — WunderBrand Experience Score given (0–10)
- `%EXPERIENCE_CATEGORY%` — "promoter", "passive", or "detractor"

---

## ACTIVECAMPAIGN TAGS REFERENCE

These tags are already being sent from the app. Use them as trigger and exit conditions.

### Purchase Tags
- `purchased:snapshot` — Free snapshot completed
- `purchased:snapshot-plus` — Snapshot+ purchased
- `purchased:blueprint` — Blueprint purchased
- `purchased:blueprint-plus` — Blueprint+ purchased
- `purchased:snapshot-plus-refresh` — Snapshot+ refresh purchased
- `purchased:blueprint-refresh` — Blueprint refresh purchased
- `purchased:refunded` — Purchase refunded

### Intent / Upgrade Tags
- `intent:upgrade-snapshot-plus` — Applied after free snapshot; removed when S+ purchased
- `intent:upgrade-blueprint` — Applied after S+ purchase; removed when Blueprint purchased
- `intent:upgrade-blueprint-plus` — Applied after Blueprint purchase; removed when B+ purchased
- `nurture:other-services` — Applied after B+ purchase (cross-sell services)

### Onboarding Tags
- `onboarding:snapshot` — Free snapshot onboarding
- `onboarding:snapshot-plus` — S+ onboarding
- `onboarding:blueprint` — Blueprint onboarding
- `onboarding:blueprint-plus` — B+ onboarding

### Report Ready Tags
- `completed:snapshot` — Free snapshot report saved
- `report:snapshot-ready` — Free report ready
- `report:snapshot-plus-ready` — Snapshot+ report ready
- `report:blueprint-ready` — Blueprint report ready
- `report:blueprint-plus-ready` — Blueprint+ report ready

### Checkout Tags
- `checkout:initiated` — Checkout session created
- `checkout:abandoned` — Checkout expired without payment
- `checkout:abandoned:snapshot_plus` — Abandoned S+ checkout
- `checkout:abandoned:blueprint` — Abandoned Blueprint checkout
- `checkout:abandoned:blueprint_plus` — Abandoned B+ checkout

### Payment Tags
- `payment:failed` — Invoice payment failed

### Behavior Tags
- `snapshot:completed` — Snapshot completed
- `snapshot:viewed-results` — Viewed results page
- `snapshot:return-visit` — Return visit to results
- `snapshot:clicked-upgrade` — Clicked upgrade CTA
- `snapshot:coverage-gap` — Coverage < 70–80%
- `snapshot:paused` — Saved and exited mid-diagnostic
- `snapshot:resume-link-sent` — Resume link emailed

### Services Interest Tags
- `intent:services` — Services interest signal (triggers Sequence 13)
- `services:interested` — Expressed interest in services
- `services:managed_marketing` — Interested in managed marketing
- `services:consulting` — Interested in consulting
- `services:expert_call_requested` — Wants expert call
- `services:call-booked` — Services discovery call booked
- `services:client-active` — Active managed services client

### Content Opt-in Tags
- `content:opt-in` — Opted in to content (form submit — triggers Sequence 14)
- `content:opted_in` — Confirmed opted in (applied after Sequence 14 completes — triggers Sequence 16)
- `content:marketing_trends` — Interested in marketing trends
- `content:ai_updates` — Interested in AI updates

### Session Tags
- `call:expert-scheduled` — Expert call booked
- `call:expert-canceled` — Expert call canceled
- `call:expert-no-show` — Expert call no-show
- `call:expert-completed` — Expert call completed
- `session:activation-scheduled` — Activation session booked
- `session:activation-canceled` — Activation session canceled
- `session:activation-no-show` — Activation session no-show
- `session:activation-completed` — Activation session completed
- `session:pending` — Activation session pending (B+ purchase)

### Experience Score Tags
- `experience:promoter` — Experience Score 9–10
- `experience:passive` — Experience Score 7–8
- `experience:detractor` — Experience Score 0–6

### Refresh Tags
- `refresh:eligible` — Eligible for quarterly refresh
- `refresh:60-day-reminder` — 60 days until window closes
- `refresh:30-day-reminder` — 30 days left
- `refresh:7-day-reminder` — 7 days left
- `refresh:window-expired` — Refresh window closed

### Follow-up Tags
- `followup:send` — Trigger tag for AC to send follow-up email
- `followup:pending-review` — Follow-up awaiting admin review

### Lifecycle Tags
- `evergreen:complete` — Completed Sequence 15 or 17 without conversion

### Other Tags
- `noshow:needs-followup` — No-show needs follow-up
- `retention:at-risk` — At-risk customer (Experience Score detractor)
- `support:new_request` — New support request

---

## SEQUENCES TO WRITE

For each sequence, write:
1. **Subject line** (compelling, not clickbait)
2. **Preview text** (the snippet shown in inbox after subject line, ~90 chars)
3. **Full body copy** (HTML-friendly but write as plain text with formatting notes like [Button: Text → URL])
4. **Notes for AC build** (trigger tag, exit condition, wait time before next email)

---

### SEQUENCE 1: Free Snapshot → Snapshot+ Upgrade
**Trigger:** Tag `purchased:snapshot` + `intent:upgrade-snapshot-plus`
**Exit:** Tag `purchased:snapshot-plus`
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** `%FIRSTNAME%`, `%COMPANY_NAME%`, `%BRAND_ALIGNMENT_SCORE%`, `%PRIMARY_PILLAR%`, `%POSITIONING_SCORE%`, `%MESSAGING_SCORE%`, `%VISIBILITY_SCORE%`, `%CREDIBILITY_SCORE%`, `%CONVERSION_SCORE%`, `%REPORT_LINK%`, `%UPGRADE_PRODUCT_URL%`

**Email 1** — Send: +1 hour after trigger
Theme: Your WunderBrand Score is %BRAND_ALIGNMENT_SCORE% — here's what it means. Recap their score, highlight weakest pillar, tease what Snapshot+ reveals.

**Email 2** — Send: +2 days
Theme: What your %PRIMARY_PILLAR% score actually means. Dynamic content: 5 conditional blocks (one per pillar) explaining real business impact of a low score.

**Email 3** — Send: +5 days
Theme: 3 things your free results can't tell you. Persona-aligned messaging, Foundational Prompt Pack, specific "why" behind each score.

**Email 4** — Send: +9 days
Theme: What brand clarity actually looks like. The clarity problem framing — strategy that makes every marketing effort work harder.

**Email 5** — Send: +14 days
Theme: Your results are there when you're ready. Soft close — no pressure. Mention upgrade credit if applicable.

**On exit without conversion:** Move to Sequence 15 (Evergreen Education).

---

### SEQUENCE 2: Checkout Abandoned
**Trigger:** Tag `checkout:abandoned` + product-specific tag
**Exit:** Any `purchased:*` tag for that product
**Sender:** Emails 1–2: Claudine | claudine@wunderbardigital.com | Founder. Email 3: Wunderbar Digital | support@wunderbardigital.com | Founder
**Available fields:** `%FIRSTNAME%`, `%ABANDONED_PRODUCT%`, `%ABANDONED_PRODUCT_URL%`

**Email 1** — Send: +30 minutes
Theme: Still thinking it over? No rush. Leave the checkout link.

**Email 2** — Send: +24 hours
Theme: What you'll walk away with. Dynamic content block keyed to product_key showing tier-specific deliverables, collaborator framing, and AI prompt pack value.

**Email 3** — Send: +3 days
Theme: Have questions? We're here. Last note — link to support and checkout.

**On exit without conversion:** Move to Sequence 15 (Evergreen Education).

---

### SEQUENCE 3: Coverage Gap Nudge
**Trigger:** Tag `snapshot:coverage-gap`
**Exit:** Tag `purchased:snapshot-plus`
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** `%FIRSTNAME%`, `%PRIMARY_PILLAR%`, `%REPORT_LINK%`, `%UPGRADE_PRODUCT_URL%`

**Email 1** — Send: +4 hours
Theme: Your results could be sharper. Doctor analogy — half the test results vs. full picture. Explain what diagnostic coverage means and how Snapshot+ sharpens results.

**Email 2** — Send: +3 days
Theme: Specific beats directional — every time. What changes when coverage is complete: persona messaging, prompt pack calibration, collaborator briefs.

**Note:** Runs alongside Sequence 1 — ensure no duplicate sends on same day.
**On exit without conversion:** Contact continues in Sequence 1 if active, or moves to Sequence 15.

---

### SEQUENCE 4: Purchase Welcome — Start Your Diagnostic
**Trigger:** Event `start_diagnostic` with `product_key` = snapshot_plus | blueprint | blueprint_plus
**Exit:** Product-specific `report:*-ready` tag
**Sender:** Emails 1–3: Wunderbar Digital | hello@wunderbardigital.com | Branded. Email 4: Claudine | claudine@wunderbardigital.com | Founder
**Available fields:** `%FIRSTNAME%`, `%START_DIAGNOSTIC_LINK%`, `%DASHBOARD_LINK%`

Write 3 tier-specific variants (Snapshot+, Blueprint, Blueprint+). Key differences:
- **Snapshot+**: 15–20 min, no uploads, Foundational Prompt Pack (8 AI prompts)
- **Blueprint**: 20–25 min, up to 3 uploads, Interactive Brand Workbook, Brand Standards PDF
- **Blueprint+**: 25–35 min, up to 10 uploads, Strategy Activation Session, Messaging Matrix, Campaign Architecture, AEO strategy, Advanced Prompt Library

**Email 1** — Send: Immediate
Theme: You're in — welcome. What you've unlocked (tier-specific list). Intro to Wundy conversation. Prep guidance. Start link.

**Email 2** — Send: +2 days (only if diagnostic not started)
Theme: Ready when you are. Quick reminder of deliverables. Progress saves automatically. Start link.

**Email 3** — Send: +5 days (only if diagnostic not started)
Theme: Before you start — a simple checklist. Things to have in mind (business description, ideal customer, differentiator, current channels). Start link.

**Email 4** — Send: +10 days (only if diagnostic not started)
Theme: Checking in personally (from Claudine). No further automated follow-up after this. Dashboard link.

**Note:** Blueprint+ variant notes that Sequence 12 (Session Booking) triggers 3 days after report.

---

### SEQUENCE 5: Report Ready — Here Are Your Results
**Trigger:** Tag `report:snapshot-plus-ready` / `report:blueprint-ready` / `report:blueprint-plus-ready`
**Exit:** Runs to completion
**Sender:** Email 1: Wunderbar Digital | hello@ | Branded. Emails 2–3: Claudine | claudine@ | Founder
**Available fields:** `%FIRSTNAME%`, `%BRAND_ALIGNMENT_SCORE%`, all pillar scores, `%PRIMARY_PILLAR%`, `%REPORT_LINK%`, `%EXPERIENCE_SURVEY_LINK%`

Write 3 tier-specific variants. Key differences for "what to do first":
- **Snapshot+**: Open Foundational Prompt Pack first, then %PRIMARY_PILLAR% section. Also triggers Seq 6 (upgrade) with 7-day wait.
- **Blueprint**: Open Interactive Brand Workbook, start with %PRIMARY_PILLAR%. Also triggers Seq 7 (upgrade) with 7-day wait.
- **Blueprint+**: Open %PRIMARY_PILLAR% breakdown and Messaging Matrix. Also triggers Seq 12 (session booking) — Claudine email goes 3 days later.

**Email 1** — Send: Immediate
Theme: Results are ready. Full score breakdown (overall + 5 pillar scores). Primary area of opportunity. Link to full results. "Where to start" guidance by tier.

**Email 2** — Send: +3 days
Theme: How to get the most out of your results. Tier-specific first steps and activation advice. From Claudine.

**Email 3** — Send: +7 days
Theme: How are you using your results? Light check-in. Experience Survey link. Soft mention of next tier. From Claudine.
**Note:** WunderBrand Experience Survey response triggers Sequence 11.

---

### SEQUENCE 6: Snapshot+ → Blueprint Upgrade
**Trigger:** Tag `intent:upgrade-blueprint` (applied when S+ purchased)
**Exit:** Tag `purchased:blueprint`
**Timing:** Begins 7 days after `report:snapshot-plus-ready`
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** `%FIRSTNAME%`, `%COMPANY_NAME%`, `%PRIMARY_PILLAR%`, `%UPGRADE_PRODUCT_URL%`

**Email 1** — Send: +7 days after report ready
Theme: You've seen the score — now build the strategy. What Blueprint adds: brand archetype, messaging framework, workbook, Brand Standards PDF.

**Email 2** — Send: +14 days
Theme: What Blueprint does specifically for your %PRIMARY_PILLAR% score. Dynamic content: 5 conditional blocks, pillar-specific workbook sections.

**Email 3** — Send: +21 days
Theme: One document. Every collaborator on-brand from day one. Brand Standards PDF + messaging framework as collaboration tools.

**Email 4** — Send: +30 days
Theme: Your brand is already evolving — is your strategy keeping up? Last note. Foundation you keep, build on, and share.

**On exit without conversion:** Move to Sequence 15 (Evergreen Education).

---

### SEQUENCE 7: Blueprint → Blueprint+ Upgrade
**Trigger:** Tag `intent:upgrade-blueprint-plus` (applied when Blueprint purchased)
**Exit:** Tag `purchased:blueprint-plus`
**Timing:** Begins 7 days after `report:blueprint-ready`
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** `%FIRSTNAME%`, `%COMPANY_NAME%`, `%UPGRADE_PRODUCT_URL%`

**Email 1** — Send: +7 days after report ready
Theme: Your Blueprint is a foundation — Blueprint+ makes it a growth engine. What Blueprint+ adds: audience segmentation, Messaging Matrix, Campaign Architecture, AEO, Advanced Prompt Library, Strategy Activation Session.

**Email 2** — Send: +14 days
Theme: Why your AI output doesn't sound like your brand — and how to fix it. Advanced Prompt Library as brand-wide AI consistency tool for teams and collaborators.

**Email 3** — Send: +21 days
Theme: The one thing that separates Blueprint+ from every other brand tool. Strategy Activation Session: focused strategy conversation, not onboarding or sales.

**Email 4** — Send: +30 days
Theme: Last note on Blueprint+ — and a thought on timing. Brand consistency compounds; inconsistency compounds too.

**On exit without conversion:** Move to Sequence 15 (Evergreen Education).

---

### SEQUENCE 8: Quarterly Refresh
**Trigger:** Tag `refresh:eligible` (applied automatically 90 days after `report:*-ready`)
**Exit:** New `purchased:*` tag or new diagnostic started
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** `%FIRSTNAME%`, `%BRAND_ALIGNMENT_SCORE%`, `%PRIMARY_PILLAR%`, `%DASHBOARD_LINK%`

**Email 1** — Send: Immediate on `refresh:eligible`
Theme: Your WunderBrand Score is 90 days old — has anything changed? Original score was X, primary opportunity was Y. What a refresh diagnostic gives you.

**Email 2** — Send: +7 days
Theme: The brands that measure progress pull ahead. Quarterly refresh as a living system. Updated AI prompts, updated collaborator briefs.

**Email 3** — Send: +21 days
Theme: Last nudge on your quarterly refresh. Dashboard link. No further follow-up.

**Note:** Score and pillar merge fields pull from most recent diagnostic. Re-apply `refresh:eligible` 90 days later if no action.

---

### SEQUENCE 9: Diagnostic Paused — Save & Exit
**Trigger:** Tags `snapshot:paused` + `snapshot:resume-link-sent`
**Exit:** Tag `completed:snapshot` or any `report:*-ready`
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** `%FIRSTNAME%`, `%RESUME_LINK%`, `%PRODUCT_KEY%`

**Email 1** — Send: +24 hours
Theme: Pick up where you left off. Everything is where you left it. Resume link.

**Email 2** — Send: +4 days
Theme: Still saved. Still waiting. Wundy picks up the conversation.

**Email 3** — Send: +10 days
Theme: Last nudge — your diagnostic is still here. No further automated follow-up.

**Note:** Applies across all products — resume link should be product-aware.

---

### SEQUENCE 10: Session No-Show Recovery
**Trigger:** Tag `noshow:needs-followup` + (`call:expert-no-show` or `session:activation-no-show`)
**Exit:** New `call:expert-scheduled` or `session:activation-scheduled` tag
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** (none — no merge fields in body)

**Salutation:** None — open directly with body copy
**Closing:** Warmly, / Claudine — no title line

**Email 1** — Send: +1 hour
Theme: We missed you today — no worries at all. No explanation needed. Reschedule link. AC conditional shows correct Calendly link based on session_type.

**Email 2** — Send: +3 days
Theme: Your session is still available. No pressure. Reschedule link.

**No further automated follow-up after Email 2.**

---

### SEQUENCE 11: Experience Score Follow-up
**Trigger:** Tags `experience:promoter`, `experience:passive`, or `experience:detractor`
**Exit:** Runs to completion per branch
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** `%FIRSTNAME%`

**3 branches, 2 emails each:**

**Branch A — Promoter (Score 9–10):**
- Email 1 — Send: Immediate. Theme: That means a lot — thank you. Testimonial request (ask them to reply).
- Email 2 — Send: +5 days. Theme: Know someone who could use this? Referral ask with wunderbrand.ai link.

**Branch B — Passive (Score 7–8):**
- Email 1 — Send: Immediate. Theme: Thank you for honest feedback. Ask what didn't quite land — reply to this email.
- Email 2 — Send: +7 days. Theme: One thing that might close the gap. Diagnostic coverage explanation + tier-appropriate upgrade path (AC conditional by `purchased:*` tag).

**Branch C — Detractor (Score 0–6):**
- Email 1 — Send: Immediate. No salutation. Theme: Thanks for being honest. What specifically missed the mark? Reply directly.
- Email 2 — Send: +5 days (if no reply). No salutation. Theme: Still here if you want to share more. No scripts, no auto-responses.
- Closing: "Your experience matters — and I want to understand it better."
- Suppression: Do NOT trigger any upgrade sequences for `experience:detractor` contacts.
- If escalation needed: loop in support@wunderbardigital.com.

---

### SEQUENCE 12: Blueprint+ Strategy Activation Session Booking
**Trigger:** 3 days after tag `report:blueprint-plus-ready` AND tag `session:pending` active
**Exit:** Tag `session:activation-scheduled`
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Closing exception:** "Looking forward to it," / Claudine / Founder, Wunderbar Digital
**Available fields:** `%FIRSTNAME%`, `%REPORT_LINK%`

**Email 1** — Send: +3 days after report ready
Theme: Let's book your Strategy Activation Session. 30-minute working session: look at results together, identify 2–3 highest-leverage actions, map to business priorities. Not a sales call. Sessions must be booked within 30 days.

**Email 2** — Send: +10 days (if not booked)
Theme: Your Strategy Activation Session is still available. The step that turns results into an action plan.

**Email 3** — Send: +20 days (if not booked)
Theme: 10 days left to book. 30-day window closes soon. Mention Brand Standards PDF, prompt library, Messaging Matrix activation.

**Note:** Replace CALENDLY_LINK with live Calendly URL. After no booking: archive `session:pending` — window expired.

---

### SEQUENCE 13: Services Interest — Managed Marketing
**Trigger:** Tag `intent:services`
**Exit:** Tag `services:call-booked` or `services:client-active`
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** `%FIRSTNAME%`

**Email 1** — Send: +1 hour after `intent:services` tag
Theme: You were looking at our managed services — let's talk. What we do, who it's for ($3,500/month retainer). Strategic extension of your team, not a production house. Calendly link.

**Email 2** — Send: +4 days (if no call booked)
Theme: What working together actually looks like. Demand generation plan, content strategy, campaign execution, regular check-ins. What it isn't: content mill, social management, ads-only. Calendly link.

**No further automated follow-up after Email 2 — move to manual follow-up or Sequence 15.**
**Note:** Replace CALENDLY_SERVICES_LINK with live Calendly URL.

---

### SEQUENCE 14: Content Opt-In Welcome
**Trigger:** Tag `content:opt-in` (applied on form submit from lead magnet, blog, or content download)
**Exit:** Runs to completion — contact moves to Sequence 15 (Evergreen Education)
**Sender:** Email 1: Wunderbar Digital | hello@wunderbardigital.com | Branded. Email 2: Claudine | claudine@wunderbardigital.com | Founder
**Available fields:** `%FIRSTNAME%`, `%CONTENT_DOWNLOAD_LINK%`

**Email 1** — Send: Immediate
Theme: Here's what you came for. Download link. Set expectations on what to expect from us (occasional emails, brand strategy, AI tools, no spam). CTA to free WunderBrand Snapshot.

**Email 2** — Send: +2 days
Theme: A bit about who we are. Claudine intro — 25 years, WunderBrand story. CTA to free Snapshot.

**After Email 2:** Apply `content:opted_in` tag → triggers Sequence 16 (Newsletter). Move to Sequence 15.

---

### SEQUENCE 15: Evergreen Education
**Trigger:** Contact exits Seq 1/2/3/6/7 without conversion, Seq 14 completes, or manually enrolled
**Exit:** Any `purchased:*` tag
**Cadence:** Every 12 days (Emails 1–9), +14 days for Email 10
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** `%FIRSTNAME%`
**Soft CTA in each email — never the primary purpose. Each email stands alone.**

**Email 1** — The real reason most brands don't convert. Clarity problem framing. 3 things brands skip.
**Email 2** — Why brand consistency is harder than it looks. Documentation as fix. Messaging framework, brand standards, prompt templates.
**Email 3** — What positioning actually means. Practical definition. Common mistakes: positioning to everyone, on features, only in your head.
**Email 4** — The messaging mistake that makes good brands invisible. Speaking to specific person, reflecting your voice, answering the real question.
**Email 5** — Visibility without strategy is just noise. Where your clients actually go. Their language vs. yours. AEO mention.
**Email 6** — Credibility signals: what buyers look for before they say yes. Social proof, authority, consistency, specificity, accessibility.
**Email 7** — Where most sales are actually lost. Conversion leaks before the call. Weak CTAs, unclear value, missing proof, friction.
**Email 8** — How to use AI for brand content without losing your voice. Brand foundation as AI brief. Share with collaborators.
**Email 9** — Brand archetypes: why they matter more than you think. Decision-making lens, not personality quiz. Sage/Champion/Guide/Maker.
**Email 10** — The brand strategy question worth sitting with. "If someone encountered your brand today, would they get a clear picture?" Final email with honest invitation.

**After Email 10:** Move to Sequence 16 (Newsletter) or tag as `evergreen:complete`.

---

### SEQUENCE 16: It's Wunderbar — The Newsletter
**Trigger:** Tag `content:opted_in` (applied after Seq 14 completes)
**Exit:** Unsubscribe only
**Cadence:** 2x/month — ongoing broadcast, no fixed exit
**All issues:** Wunderbar Digital | hello@wunderbardigital.com | Branded template
**Content pillars:** AI tools for brand building | Marketing strategy for SMBs | Brand pattern recognition | WunderBrand product updates
**Available fields:** `%FIRSTNAME%`, `%DASHBOARD_LINK%`, `%REPORT_LINK%`

**Template structure (locked):**
- Section 1 — Lead Story [200–250 words]. One insight in Claudine's voice. Observation-based.
- Section 2 — Try This Now [80–110 words]. Copy-paste AI prompt. Setup line + adaptation note.
- Section 3 — One Thing Worth Reading [60–80 words]. Real, verifiable external reference with 2–3 sentence take. Must be linkable. If no strong source, skip.
- Section 4 — From the WunderBrand System [50–70 words, conditional]. Only when lead story naturally connects to WunderBrand. 4 conditional blocks keyed to product_key (snapshot/snapshot_plus/blueprint/blueprint_plus). Skip when forced.
- Footer: Unsubscribe | View in browser | wunderbrand.ai | © Wunderbar Digital

**Voice:** Claudine first person. Curated-expert feel. Observations over declarations. Never preachy. Never padded with statistics we cannot attribute.

4 sample issues provided. Continue on same cadence and template after.

**Editorial rules:** Verify all external sources/links before scheduling. If a source cannot be confirmed live, rewrite as observation-based or skip Section 3.

---

### SEQUENCE 17: Customer Retention — Brand Momentum Series
**Trigger:** 30 days after any `report:*-ready` tag AND not in an active upgrade sequence
**Exit:** `purchased:*` | `services:expert_call_requested` | `call:expert-scheduled`
**Cadence:** Emails 1–6 every 14 days, Email 7 at +14d, Email 8 at +21d
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** `%FIRSTNAME%`, `%COMPANY_NAME%`, `%PRODUCT_NAME%`, `%PRIMARY_PILLAR%`, `%BRAND_ALIGNMENT_SCORE%`, `%REPORT_LINK%`, `%DASHBOARD_LINK%`, `%UPGRADE_PRODUCT_NAME%`, `%UPGRADE_PRODUCT_URL%`, `%SERVICES_URL%`, `%REFRESH_ACTION_URL%`

**Email 1** — A month in — is your brand actually moving? Check-in on implementation by pillar focus area.
**Email 2** — Your %PRIMARY_PILLAR% score was %BRAND_ALIGNMENT_SCORE% — one thing to do this week. Dynamic content: 5 conditional blocks with pillar-specific actions.
**Email 3** — Your prompt pack isn't a one-time thing. Brand's AI brief. Share with team and collaborators.
**Email 4** — Your brand has changed since your last diagnostic. Refresh teaser. Updated score, recommendations, prompt pack.
**Email 5** — When brand strategy needs a human. Managed marketing services intro ($3,500/month). CTA click applies `services:interested` → triggers Seq 19.
**Email 6** — Know anyone building a brand right now? Referral ask. wunderbrand.ai link.
**Email 7** — What the next step unlocks for %COMPANY_NAME%. Dynamic content by current tier (S+→B or B→B+). Suppress for Blueprint+ contacts.
**Email 8** — Why documented brands win in AI-powered search. AEO angle. Link to services.

**After Email 8 with no exit:** Tag `evergreen:complete`. Check if `refresh:eligible` → trigger Seq 8.

---

### SEQUENCE 18: Win-Back — Lapsed Customers
**Trigger:** 90+ days since last `report:*-ready` AND no refresh AND no email engagement in 60+ days
**Exit:** `purchased:*` | `snapshot:viewed-results` | `call:expert-scheduled`
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** `%FIRSTNAME%`, `%COMPANY_NAME%`, `%PRIMARY_PILLAR%`, `%SERVICES_URL%`, `%DASHBOARD_LINK%`
**Salutation exception:** "Hi %FIRSTNAME% — it's been a while." (Emails 1–2) / Standard for Email 3

**Email 1** — Your brand has evolved since we last talked. Original score as baseline. Two options: refresh diagnostic or conversation with team.
**Email 2** — +7 days: What's shifted in %PRIMARY_PILLAR% since your last diagnostic. Dynamic content: 5 conditional blocks with pillar-specific market observations.
**Email 3** — +14 days: Still here when you're ready. Dashboard link. Soft close.

**On exit without conversion:** Move to Sequence 15 (Evergreen Education).

---

### SEQUENCE 19: Services Warm-Up — Cross-Sell
**Trigger:** 45+ days as customer AND any of: `services:interested` | `nurture:other-services` | score < 50 | `experience:promoter`
**Exit:** `call:expert-scheduled` | manual removal
**All emails:** Claudine at Wunderbar Digital | claudine@wunderbardigital.com | Founder template
**Available fields:** `%FIRSTNAME%`, `%COMPANY_NAME%`, `%PRIMARY_PILLAR%`, `%SERVICES_URL%`

**Email 1** — Your diagnostic told you what to fix — we can help you fix it. Managed marketing intro. Not a vendor, a strategic partner. $3,500/month retainer.
**Email 2** — +10 days: What a managed engagement actually looks like. Start with WunderBrand data, build demand generation plan, content/campaign execution, performance tracking. Not a content mill, not social management, not ads-only.
**Email 3** — +20 days: Strategy doesn't have to be a solo project. Expert call as honest conversation about fit. Reference WunderBrand score and %PRIMARY_PILLAR%.
**Email 4** — +30 days: Your brand deserves more than a dashboard. Final soft close. No further automated follow-up.

---

## OUTPUT FORMAT

For each email, provide:

```
---
SEQUENCE [#]: [Name]
EMAIL [#] of [total]
Send: [timing]
---

SUBJECT: [subject line]
PREVIEW: [preview text, ~90 chars]

[Full body copy with formatting notes]

[Button: CTA Text → %MERGE_FIELD_URL%]

[Signature/footer direction]

---
AC BUILD NOTES:
- Trigger: [tag or event]
- Wait: [time before this email]
- Exit condition: [tag that removes them from sequence]
- If no conversion after final email: [what happens next]
---
```

Write every email for every sequence. Do not summarize or skip any. This is production copy.
