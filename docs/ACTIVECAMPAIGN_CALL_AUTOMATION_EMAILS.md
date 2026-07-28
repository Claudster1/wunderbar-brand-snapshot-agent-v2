# WunderBrand → ActiveCampaign: Call & Consultation Email Copy

Ready-to-paste copy for the call/consultation automations wired to the Calendly webhook
(see `docs/ACTIVECAMPAIGN_AI_BUILDER_BRIEF.md` §4.9–4.11 for the automation structure).
**Status: DRAFT for review.** Nothing here is live until you build the automations in AC.

---

## Global setup (read first)

**Sender:** `Wunderbar Digital` · from `hello@wunderbardigital.com` · reply-to `claudine@wunderbardigital.com`
(keep all marketing sends on the company domain `wunderbardigital.com`, consistent with the auth emails).

**Calendly already sends** the booking confirmation, the Google Meet link, and time-of-meeting
reminders. These emails do **not** repeat logistics — they add value, build the relationship, and
(for sales calls) tee up the conversation. Don't duplicate "here's your meeting link."

**Merge tags & fallbacks** (set a default so nothing renders blank). ⚠️ These are the **exact**
personalization tags — AC strips underscores when generating them, and `%COMPANYNAME%` (not
`%COMPANY_NAME%`) is the field the app populates. Verified against the live AC account 2026-07-28:

| Tag | Meaning | Fallback default |
|---|---|---|
| `%FIRSTNAME%` | contact first name (native field) | `there` |
| `%COMPANYNAME%` | brand/company | `your brand` |
| `%BRANDALIGNMENTSCORE%` | WunderBrand Score (0–100) | *(omit if empty)* |
| `%PRIMARYPILLAR%` | focus pillar | *(omit if empty)* |
| `%WEAKESTPILLAR%` | top-opportunity pillar | *(omit if empty)* |
| `%TOPOPPORTUNITIES%` | prose summary of biggest opportunities | *(omit if empty)* |

> **Snapshot-data caveat:** Blueprint+ contacts (Automation A) always have snapshot fields.
> Managed-Marketing / AI-Consultation bookers (Automations B/C) may **not** have run a snapshot,
> so wrap any `%WEAKESTPILLAR%` / `%TOPOPPORTUNITIES%` usage in an AC **conditional content block**
> (`Show if weakest_pillar is not blank`) and provide the non-personalized version as the default.
>
> **Messaging principle for managed-services leads (B & C):** for anyone who hasn't completed a
> snapshot, **do not center the snapshot.** The focus is (1) getting them on the call and (2)
> understanding their business goals. The snapshot is mentioned only as an *optional* thing they can
> do before we talk — never a prerequisite, never the headline. For contacts who *have* snapshot data,
> a conditional block can reference their results as a bonus, but the goals-first framing stays.

**Free snapshot link (for the optional mention):** `https://app.wunderbrand.ai` *(confirm the exact
start URL you want to use)* — append `?utm_source=activecampaign&utm_medium=email&utm_campaign=<automation>`.

**Booking URLs** (append `?utm_source=activecampaign&utm_medium=email&utm_campaign=<automation>`):

| Event | URL |
|---|---|
| Blueprint+ Strategy Activation Session | `https://calendly.com/claudine-wunderbardigital/brand-blueprint-strategy-activation-session` |
| Managed Marketing Consultation | `https://calendly.com/claudine-wunderbardigital/talk-to-an-expert-managed-marketing-consultation` |
| Free AI Consultation | `https://calendly.com/claudine-wunderbardigital/free-ai-consultation-clone` ⚠️ *auto-generated slug — consider renaming in Calendly to `free-ai-consultation`* |
| Talk to an Expert | `https://calendly.com/claudine-wunderbardigital/talk-to-an-expert` |

---

# Automation A — Blueprint+ Strategy Activation: Book & Prime

**Trigger:** tag `session:pending` (added on Blueprint+ purchase).
**Exit/branch signal:** tag `session:activation-scheduled` → stop chasing, move to priming (A4).
**No-show branch:** tag `session:activation-no-show` → A5.
**Goal:** get them to book + attend the included 30-min session (where the strategist can introduce managed services).

---

### A1 — Immediate (session ready to book)

**Subject:** Your Blueprint+ strategy session is included, %FIRSTNAME% — let's use it
**Preview:** 30 minutes with a strategist to turn your report into a plan.

Hi %FIRSTNAME%,

Congratulations on your WunderBrand Blueprint+™ — you now have the full picture of where %COMPANYNAME% stands and what to do next.

Your Blueprint+ includes something the report alone can't give you: **a complimentary 30-minute Strategy Activation Session** with a strategist from our team. It's not a sales call — it's a working session where we:

- walk through your results together so nothing gets lost in translation,
- prioritize the two or three highest-impact moves for %COMPANYNAME%, and
- answer whatever's on your mind about executing.

*Show if weakest_pillar is not blank →* Given your biggest opportunity is **%WEAKESTPILLAR%**, this is exactly the kind of thing we'll map out together.

Sessions fill up, and your diagnostic is freshest right now — I'd grab a time this week.

**→ Book your strategy session** (button → Blueprint+ activation URL)

Talk soon,
The Wunderbar Digital team

---

### A2 — +3 days, if `session:activation-scheduled` NOT present

**Subject:** Don't leave your strategy session on the table, %FIRSTNAME%
**Preview:** It's included with Blueprint+ — and it's where the plan gets real.

Hi %FIRSTNAME%,

Quick nudge: your Blueprint+ **Strategy Activation Session** is still unclaimed.

Most people tell us the same thing afterward — that 30 minutes with a strategist did more than hours of re-reading the report, because we help you decide *what to do first* and *why*. The report tells you where you stand; the session turns it into momentum.

A few things we can cover:
- the fastest path to lift your weakest pillar,
- what to ignore for now (just as important), and
- how to sequence the next 90 days.

**→ Claim your session** (button → Blueprint+ activation URL)

Talk soon,
The Wunderbar Digital team

---

### A3 — +4 days, if still not scheduled (last nudge)

**Subject:** Last call on your included strategy session
**Preview:** Your diagnostic is freshest now — let's put it to work.

Hi %FIRSTNAME%,

I'll stop nudging after this one 🙂

Your Blueprint+ **Strategy Activation Session** is still available, and it's genuinely the highest-leverage 30 minutes you can spend with your report. The longer you wait, the colder the data gets and the harder it is to act on.

If now isn't the moment, no problem — the link stays valid, and you can book whenever you're ready.

**→ Book whenever works for you** (button → Blueprint+ activation URL)

To your brand,
The Wunderbar Digital team

---

### A4 — Priming (trigger: `session:activation-scheduled`)

**Subject:** You're booked, %FIRSTNAME% — let's make it count
**Preview:** Two quick questions so we can hit the ground running.

Hi %FIRSTNAME%,

Great — your Strategy Activation Session is on the calendar. (Calendly sent your link and reminders separately.)

To make our 30 minutes as useful as possible, it helps to know where your head's at. Just hit reply with a line or two on:

1. **What would make this a win for you?** (a decision, a plan, clarity on one thing…)
2. **Who's executing on your side** — you, a team, an agency, or still figuring that out?

*Show if top_opportunities is not blank →* I've also got your results in front of me. Based on your diagnostic: %TOPOPPORTUNITIES% — we'll dig into these live.

Come as you are — no prep or homework required. See you soon.

The Wunderbar Digital team

---

### A5 — No-show (trigger: `session:activation-no-show`)

**Subject:** Missed you, %FIRSTNAME% — let's find a better time
**Preview:** Your strategy session is still yours. Grab a new slot.

Hi %FIRSTNAME%,

Looks like we missed each other — life happens. Your Blueprint+ **Strategy Activation Session** is still included and waiting whenever you're ready.

It only takes a moment to pick a new time:

**→ Rebook your session** (button → Blueprint+ activation URL)

Hope to see you soon,
The Wunderbar Digital team

---

# Automation B — Managed Marketing Consultation: Sales Assist 💰

**Trigger:** tag `mql:managed-marketing` (Calendly "Talk to an Expert – Managed Marketing Consultation" booked).
**On entry:** remove from product-nurture automations; add to list **"Managed Marketing — Sales"**.
**No-show branch:** tag `services:managed-marketing-no-show` → B2.
**Goal:** the sale is human — these emails just raise show-rate and warm the lead for the strategist.
**Focus (per your direction):** center the **call** and their **business goals**, not the snapshot. The
snapshot is an *optional* aside for non-snapshot contacts only (see B1).

> **Pre-booking interest:** these emails fire once someone *books*. To nurture people who are interested
> but **haven't booked yet**, see **Automation E** below.

---

### B1 — Immediate (confirmation + prep)

**Subject:** Looking forward to talking marketing, %FIRSTNAME%
**Preview:** A few things to think about before we meet.

Hi %FIRSTNAME%,

Thanks for booking a Managed Marketing consultation — I'm genuinely looking forward to it. (Your meeting details and link are in Calendly's confirmation.)

This is a working conversation about **your business**, not a pitch. The more I understand about where you're headed, the more useful our time will be. Before we talk, it helps to have a rough sense of:

- **Where you want %COMPANYNAME% to be in 6–12 months** — revenue, growth, a launch, a new market…
- **What's working in your marketing today, and where you feel stuck or stretched thin**
- **Who's doing the work now** — and what you'd love to take off your plate

Come with those in mind and we'll map out what a done-for-you approach could look like for you.

*Show if weakest_pillar is not blank (bonus, only for contacts with a snapshot on file) →* I've also reviewed your WunderBrand results, so I've got a head start — your biggest opportunity looks like **%WEAKESTPILLAR%**, and we'll fold that into the conversation.

*Show if weakest_pillar IS blank (optional aside, non-snapshot contacts) →* Totally optional: if you'd like us both to have a quick data point going in, you can run our free 5-minute WunderBrand Snapshot beforehand. It's not required for our call — we'll focus on your goals either way. [Take the free snapshot →](https://app.wunderbrand.ai)

If anything changes, you can reschedule from your confirmation email. See you soon.

Best,
Claudine & the Wunderbar Digital team

---

### B2 — No-show (trigger: `services:managed-marketing-no-show`)

**Subject:** Sorry we missed you, %FIRSTNAME% — still happy to talk
**Preview:** Grab a new time whenever it suits you.

Hi %FIRSTNAME%,

We had a Managed Marketing consultation on the calendar but didn't connect — totally understand, schedules get away from all of us.

If you're still exploring how a partner could take marketing off your plate and drive results, I'd love to pick it back up. Here's my calendar:

**→ Find a new time** (button → Managed Marketing URL)

And if the timing just isn't right, a quick reply telling me so is genuinely helpful.

Best,
Claudine — Wunderbar Digital

---

### B3 — Post-call follow-up (optional; send manually or 1 day after call)

**Subject:** Recap + next steps for %COMPANYNAME%
**Preview:** What we discussed, and how we'd approach it.

Hi %FIRSTNAME%,

Great talking with you about %COMPANYNAME%. As promised, a quick recap of what we covered and where I think the biggest, fastest wins are:

- **[Priority 1 — fill in from call]**
- **[Priority 2 — fill in from call]**
- **[Priority 3 — fill in from call]**

If it's useful, I'll put together a short proposal for how our team would run this with you — scope, timeline, and investment. Just reply "send it" and I'll get it over.

No pressure either way — happy to be a resource whenever the timing's right.

Best,
Claudine — Wunderbar Digital

---

# Automation C — Free AI Consultation: Sales Assist 💰

**Trigger:** tag `mql:ai-consulting` (Calendly "Free AI Consultation" booked).
**On entry:** remove from product-nurture automations; add to list **"AI Consulting — Sales"**.
**No-show branch:** tag `services:ai-consulting-no-show` → C2.
**Focus:** the call and their business goals / AI use-cases — not the snapshot (the brand snapshot is a
weak fit here anyway, so C1 doesn't mention it).

---

### C1 — Immediate (confirmation + prep)

**Subject:** Your AI consultation is set, %FIRSTNAME%
**Preview:** A couple of things to bring so we can go deep.

Hi %FIRSTNAME%,

Thanks for booking a Free AI Consultation — excited to dig in. (Calendly sent your meeting link and reminders.)

To make our time count, it helps to come with:

- **One or two workflows or decisions** you think AI could speed up or improve,
- **What you've already tried** (tools, experiments, dead ends), and
- **Where you'd feel the biggest impact** if it worked — time saved, cost, quality, scale.

This is a practical session: we'll look at what's realistic for %COMPANYNAME% right now versus what's hype, and where to start.

See you soon,
Claudine & the Wunderbar Digital team

---

### C2 — No-show (trigger: `services:ai-consulting-no-show`)

**Subject:** Missed you, %FIRSTNAME% — your AI consult is still open
**Preview:** Pick a new time whenever you're ready.

Hi %FIRSTNAME%,

We had your Free AI Consultation booked but didn't connect — no worries at all. The offer stands whenever you'd like to explore where AI can create real leverage for %COMPANYNAME%.

**→ Grab a new time** (button → AI Consultation URL)

Or just reply and tell me what you're trying to solve — happy to point you in the right direction either way.

Best,
Claudine — Wunderbar Digital

---

# Automation D — Talk to an Expert (general): Follow-up

**Trigger:** tag `call:expert-scheduled`.
**No-show branch:** tag `call:expert-no-show` → D2.
**Note:** keep this light — general bookers may be pre-purchase or just exploring.

---

### D1 — Immediate (what to expect)

**Subject:** You're on the calendar, %FIRSTNAME%
**Preview:** Here's how to get the most out of our chat.

Hi %FIRSTNAME%,

Thanks for booking time with us — looking forward to it. (Your link and reminders are in Calendly's confirmation.)

Come with whatever's top of mind for %COMPANYNAME% — a question, a challenge, or just "where should I focus first?" We'll keep it useful and jargon-free, and point you to the right next step whether or not that's ever working with us.

See you soon,
The Wunderbar Digital team

---

### D2 — No-show (trigger: `call:expert-no-show`)

**Subject:** Missed you — want to find another time?
**Preview:** No worries — here's the calendar.

Hi %FIRSTNAME%,

We didn't connect for our chat — no problem at all. If it's still helpful, grab whatever time works:

**→ Rebook** (button → Talk to an Expert URL)

Or reply with your question and we'll do our best to help right here.

The Wunderbar Digital team

---

# Automation E — Managed Marketing: Pre-Booking Interest Nurture 💰

Goals-first sequence for people who are **interested in managed marketing but haven't booked a call yet.**
The single job of every email: **get them on the call.** Business goals lead; the snapshot is an optional
aside only.

**Trigger:** tag `services:managed_marketing`.
- ✅ **Already fires today** for snapshot-completers who chose "managed marketing" as a services interest
  (`app/api/snapshot/route.ts`). These contacts *have* snapshot data → the conditional bonus block shows.
- ➕ **For non-snapshot leads** (e.g. someone clicks a "Managed Marketing" CTA without doing a snapshot):
  we need to apply this same tag on that action. Today the "Managed Marketing" links point to the external
  marketing site (`wunderbardigital.com/managed-marketing`), so nothing tags them. Options: (a) an AC
  **link-click** trigger on managed-marketing links in existing emails, or (b) a small tracked
  CTA/endpoint in-app that applies `services:managed_marketing`. *(I can wire option (b) — say the word.)*

**Exit goal:** tag `mql:managed-marketing` (they booked) → remove from this flow; **Automation B** takes over.
**Also exit on:** any `purchased:*` paid tag (don't sell services to someone mid-product-purchase — use judgment).

---

### E1 — Immediate

**Subject:** Want a partner to run your marketing, %FIRSTNAME%?
**Preview:** Let's talk about where you want %COMPANYNAME% to go.

Hi %FIRSTNAME%,

You mentioned you're interested in help with your marketing — I'd love to learn more about %COMPANYNAME% and where you want to take it.

The best next step is a short, no-pressure call. It's a working conversation about **your goals**, not a pitch. Come with a rough sense of:

- **Where you want to be in 6–12 months** — revenue, growth, a launch, a new market…
- **What's working today, and what feels stuck or stretched too thin**
- **What you'd love to hand off** so you can focus on running the business

From there, I'll tell you honestly whether (and how) a done-for-you approach makes sense for you.

**→ Book your free consultation** (button → Managed Marketing URL)

Talk soon,
Claudine — Wunderbar Digital

*Show if weakest_pillar is not blank (bonus, snapshot contacts) →* P.S. I've got your WunderBrand results on hand, so we can jump straight to the good stuff — your biggest opportunity looks like **%WEAKESTPILLAR%**.

*Show if weakest_pillar IS blank (optional aside, non-snapshot) →* P.S. Totally optional — if you'd like a quick data point before we talk, our free 5-minute WunderBrand Snapshot scores your brand across five pillars. Not required; the call is the important part. [Take the free snapshot →](https://app.wunderbrand.ai)

---

### E2 — +3 days, if `mql:managed-marketing` NOT present

**Subject:** What working with us actually looks like
**Preview:** A quick picture — then let's talk about your goals.

Hi %FIRSTNAME%,

Wanted to follow up on exploring managed marketing for %COMPANYNAME%.

When clients bring us in, it usually sounds like one of these:

- *"We know what we should be doing, we just don't have the time or team to do it well."*
- *"We're getting some results but they're inconsistent, and we can't tell what's actually working."*
- *"We want to grow faster than our current setup can handle."*

If any of those ring true, a quick call is the fastest way to figure out the right move — and there's no obligation. We'll start with your goals and work backward.

**→ Grab a time that works** (button → Managed Marketing URL)

Best,
Claudine — Wunderbar Digital

---

### E3 — +6 days, if still not booked (soft last nudge)

**Subject:** Still here whenever you're ready, %FIRSTNAME%
**Preview:** No pressure — just an open invitation.

Hi %FIRSTNAME%,

I'll leave this here for now: if you're weighing whether a marketing partner could help %COMPANYNAME% grow, I'm happy to talk it through — even if you're just gathering perspective.

No pitch, no obligation. Just 20 minutes on your goals and an honest take.

**→ Book whenever it suits you** (button → Managed Marketing URL)

And if now's not the time, a one-line reply telling me so is genuinely helpful — I'll get out of your inbox.

Best,
Claudine — Wunderbar Digital

---

> **AI-consulting equivalent (optional):** the same structure works for AI consulting — trigger on
> `services:consulting`, exit on `mql:ai-consulting`, swap the booking URL and the "run your marketing"
> framing for AI use-cases. Say the word and I'll add it as Automation F.

---

# Shared — Cancellation recovery (optional)

**Trigger:** any `*:canceled` tag (`session:activation-canceled`, `services:managed-marketing-canceled`, `services:ai-consulting-canceled`, `call:expert-canceled`).
**Send:** once, ~1 hour after cancel. Keep it warm and low-pressure.

**Subject:** No problem, %FIRSTNAME% — the door's open
**Preview:** Rebook whenever the timing's better.

Hi %FIRSTNAME%,

Saw you had to cancel — completely understand. Whenever the timing's better, you're always welcome to grab a new time. Nothing's lost.

**→ Rebook when you're ready** (button → the matching event URL)

And if something wasn't quite right, a quick reply helps us do better.

The Wunderbar Digital team

---

## Build notes for ActiveCampaign

1. **Suppression (B & C):** first step of each MQL automation should *remove the contact from the
   product-nurture automations* and add the appropriate `Managed Marketing — Sales` /
   `AI Consulting — Sales` list, so sales leads don't also get upgrade drips.
2. **Conditional blocks:** use "Show if `weakest_pillar` is not blank" around any snapshot-personalized
   line in B1 (and anywhere else) so non-snapshot bookers see the clean default.
3. **Exit goals:** for Automation A, exit on `session:activation-scheduled` (stops A2/A3);
   for B/C, an actual purchase/engagement tag can end the sequence.
4. **Reply-to:** set reply-to to a monitored human inbox (`claudine@wunderbardigital.com`) — the sales
   emails explicitly invite replies.
5. **UTMs:** append `?utm_source=activecampaign&utm_medium=email&utm_campaign=<automation-name>` to every
   booking button so Calendly bookings are attributable back to the automation.
