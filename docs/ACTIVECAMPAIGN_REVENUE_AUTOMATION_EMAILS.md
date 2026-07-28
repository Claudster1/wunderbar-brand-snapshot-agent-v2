# WunderBrand → ActiveCampaign: Revenue Automation Email Copy

Ready-to-paste, **personalized + score-segmented** copy for the three highest-ROI revenue automations:

- **4.1** — Free Snapshot → Snapshot+ upgrade nurture (highest impact)
- **4.2** — Abandoned checkout recovery
- **4.8** — Report Ready (paid report delivery)

**Status: DRAFT for review.** Shared setup (sender, reply-to, domain) is the same as
`docs/ACTIVECAMPAIGN_CALL_AUTOMATION_EMAILS.md` → *Global setup*.

---

## Merge tags (verified 2026-07-28)

⚠️ AC **strips underscores** when it generates a field's personalization tag. Use these exact tokens —
the underscored versions (e.g. `%WEAKEST_PILLAR%`) render **blank**. Full table in
`docs/ACTIVECAMPAIGN_AI_BUILDER_BRIEF.md`.

| Purpose | Tag | Purpose | Tag |
|---|---|---|---|
| First name | `%FIRSTNAME%` | Report link | `%REPORTLINK%` |
| Company | `%COMPANYNAME%` | Dashboard | `%DASHBOARDLINK%` |
| Score (0–100) | `%BRANDALIGNMENTSCORE%` | Product bought | `%PRODUCTPURCHASED%` |
| Focus pillar | `%PRIMARYPILLAR%` | Upgrade name | `%UPGRADEPRODUCTNAME%` |
| Weakest pillar | `%WEAKESTPILLAR%` | Upgrade URL | `%UPGRADEPRODUCTURL%` |
| Top opportunities | `%TOPOPPORTUNITIES%` | Upgrade price | `%UPGRADEPRICE%` |
| Experience survey | `%EXPERIENCESURVEYLINK%` | Abandoned product | `%ABANDONEDPRODUCT%` |
| Pillar scores | `%POSITIONINGSCORE%` … `%CONVERSIONSCORE%` | Abandoned URL / price | `%ABANDONEDPRODUCTURL%` / `%ABANDONEDPRODUCTPRICE%` |

Set a **fallback default** on every tag so nothing renders blank.

---

## Score segmentation (the biggest conversion lever)

The same email performs far better when the framing matches the reader's reality. Build **three
conditional content variants** in AC keyed off `%BRANDALIGNMENTSCORE%`, and use the matching **opening
line** (subject + first sentence). The body can stay shared.

| Segment | Condition | Emotional hook | Framing |
|---|---|---|---|
| 🔴 **Low (0–59)** | score < 60 | urgency / "money is leaking" | "here's what's costing you growth, and how to fix it" |
| 🟡 **Mid (60–79)** | 60 ≤ score < 80 | momentum / "you're close" | "you've got a solid base — here's the gap to great" |
| 🟢 **High (80–100)** | score ≥ 80 | ambition / "protect & scale" | "strong brand — here's how to compound and defend it" |

> In AC: create a conditional content block per segment and paste the matching **Subject option** and
> **Opening** below. If your ESP can't do conditional *subject lines*, pick the mid-tier subject as the
> default (it reads well for all three) and keep the conditional block for the opening paragraph.

---

# Automation 4.1 — Free Snapshot → Snapshot+ Upgrade Nurture ⭐

**Trigger:** tag `purchased:snapshot` (applied on free snapshot completion).
**Exit goals:** tag `purchased:snapshot-plus` (or any higher tier) → stop. Also exit on
`intent:upgrade-*` converting to a purchase.
**Cadence:** 5 emails over ~10 days. Every send uses the score-segmented opener.

### Score-segmented openers (reuse across the sequence)

**Subject options**
- 🔴 Low: `Your brand is leaving growth on the table, %FIRSTNAME%`
- 🟡 Mid: `You're closer than you think, %FIRSTNAME% — here's the gap`
- 🟢 High: `Strong brand, %FIRSTNAME% — now let's make it compound`

**Opening line**
- 🔴 Low: `Your WunderBrand Score™ came back at %BRANDALIGNMENTSCORE%/100 — which means there's real, recoverable growth sitting in your brand right now.`
- 🟡 Mid: `A WunderBrand Score™ of %BRANDALIGNMENTSCORE%/100 says you've built a solid foundation — the difference between good and great is a few focused moves.`
- 🟢 High: `%BRANDALIGNMENTSCORE%/100 is a genuinely strong WunderBrand Score™. The goal now shifts from fixing to compounding and defending your lead.`

---

### E1 — Immediate: your results + the one thing to fix first

**Subject:** *(use segmented subject above)*
**Preview:** Your biggest opportunity is %WEAKESTPILLAR%.

Hi %FIRSTNAME%,

*(segmented opening line here)*

Here's the headline from your snapshot: your biggest opportunity is **%WEAKESTPILLAR%**.

*Show if top_opportunities is not blank →* Based on your actual results:
> %TOPOPPORTUNITIES%

Your free Snapshot shows you *where* you stand across the five pillars — Positioning, Messaging, Visibility, Credibility, and Conversion. What it doesn't give you is the **step-by-step plan** to close the gaps.

That's exactly what **%UPGRADEPRODUCTNAME%** does: it turns your diagnostic into a prioritized roadmap you can actually execute (or hand to your team).

**→ See what %UPGRADEPRODUCTNAME% unlocks** (button → %UPGRADEPRODUCTURL%)

Talk soon,
Claudine — Wunderbar Digital

*P.S. Your results are saved here anytime:* %REPORTLINK%

---

### E2 — +2 days: go deep on the weakest pillar

**Subject:** Why %WEAKESTPILLAR% is where I'd start, %FIRSTNAME%
**Preview:** The fastest win hiding in your results.

Hi %FIRSTNAME%,

Of the five brand pillars, your snapshot flagged **%WEAKESTPILLAR%** as your biggest opportunity — and that's good news, because it's usually the fastest lever to pull.

When %WEAKESTPILLAR% is weak, it quietly taxes everything downstream: you work harder for the same result, and your other strengths don't get the credit they deserve.

%UPGRADEPRODUCTNAME% maps out exactly how to strengthen %WEAKESTPILLAR% for %COMPANYNAME% — specific moves, in priority order, no guesswork.

**→ Get your roadmap** (button → %UPGRADEPRODUCTURL%)

Best,
Claudine — Wunderbar Digital

---

### E3 — +4 days: what you actually get (proof)

**Subject:** What's inside %UPGRADEPRODUCTNAME%
**Preview:** From "here's your score" to "here's your plan."

Hi %FIRSTNAME%,

Quick look at what %UPGRADEPRODUCTNAME% gives you beyond the free snapshot:

- A **prioritized action plan** across all five pillars — what to fix first, second, third.
- Specific, %COMPANYNAME%-level recommendations (not generic best-practice checklists).
- The detail you can hand to a designer, a marketer, or a freelancer and say *"do this."*

Founders tell us the value is having the **decisions made** — no more staring at a score wondering what to actually do Monday morning.

**→ Turn your score into a plan** (button → %UPGRADEPRODUCTURL%)

Best,
Claudine — Wunderbar Digital

*Show if brand_alignment_score < 60 →* P.S. At %BRANDALIGNMENTSCORE%/100 the upside is significant — this is the highest-leverage thing you can do for %COMPANYNAME% this month.

---

### E4 — +7 days: handle the hesitation

**Subject:** "Can't I just figure this out myself?"
**Preview:** You can. Here's the honest trade-off.

Hi %FIRSTNAME%,

Fair question — you *could* work through your brand gaps on your own. Some founders do.

The trade-off is time and certainty. %UPGRADEPRODUCTNAME% is built to save you weeks of trial-and-error by telling you **exactly** what to prioritize for %COMPANYNAME% and why — based on your real diagnostic, not a template.

If the roadmap saves you even one wrong turn, it's paid for itself.

**→ See your roadmap (%UPGRADEPRICE%)** (button → %UPGRADEPRODUCTURL%)

Best,
Claudine — Wunderbar Digital

---

### E5 — +10 days: last nudge

**Subject:** Before you close this tab, %FIRSTNAME%
**Preview:** Your results are ready to become a plan.

Hi %FIRSTNAME%,

I'll leave the upgrade here for now. Your snapshot already did the hard part — it found where %COMPANYNAME%'s biggest opportunity is (**%WEAKESTPILLAR%**). %UPGRADEPRODUCTNAME% just turns that into the plan.

**→ Upgrade to %UPGRADEPRODUCTNAME%** (button → %UPGRADEPRODUCTURL%)

If now's not the time, no worries — you'll keep getting useful brand ideas from me either way.

Best,
Claudine — Wunderbar Digital

*P.S. Your free results stay here:* %REPORTLINK%

---

# Automation 4.2 — Abandoned Checkout Recovery ⭐

**Trigger:** the abandoned-checkout signal (Stripe webhook sets `%ABANDONEDPRODUCT%`,
`%ABANDONEDPRODUCTURL%`, `%ABANDONEDPRODUCTPRICE%` and the abandonment tag/event).
**Exit goal:** the matching `purchased:*` tag (they completed) → stop immediately.
**Cadence:** 3 emails over ~3 days. Speed matters most here — send E1 fast.

### E1 — +1 hour: you're one step away

**Subject:** You're one step from your %ABANDONEDPRODUCT%, %FIRSTNAME%
**Preview:** Your checkout is still waiting.

Hi %FIRSTNAME%,

Looks like you started checking out for **%ABANDONEDPRODUCT%** but didn't finish — totally happens. Your spot is still saved.

**→ Complete your order (%ABANDONEDPRODUCTPRICE%)** (button → %ABANDONEDPRODUCTURL%)

If something got in the way — a question, a hiccup at checkout — just reply and I'll help personally.

Best,
Claudine — Wunderbar Digital

---

### E2 — +1 day: remove the doubt (proof)

**Subject:** Is %ABANDONEDPRODUCT% worth it? Here's the honest answer
**Preview:** What you get, and what happens if you wait.

Hi %FIRSTNAME%,

If you paused on **%ABANDONEDPRODUCT%**, you're probably weighing whether it's worth it. Straight answer:

- It turns your brand diagnostic into a **clear, prioritized plan** for %COMPANYNAME%.
- It's built from *your* results — specific, not generic.
- Founders consistently tell us the value is having the decisions made for them.

The cost of waiting is staying stuck on the same questions another month.

**→ Pick up where you left off** (button → %ABANDONEDPRODUCTURL%)

Best,
Claudine — Wunderbar Digital

---

### E3 — +3 days: last call

**Subject:** Closing this out, %FIRSTNAME%
**Preview:** Your %ABANDONEDPRODUCT% checkout is about to expire.

Hi %FIRSTNAME%,

Last note on this — your **%ABANDONEDPRODUCT%** order is still open, but I don't want to keep nudging.

If you're in, here's the link one more time:

**→ Complete your order (%ABANDONEDPRODUCTPRICE%)** (button → %ABANDONEDPRODUCTURL%)

And if the timing's just not right, no problem at all — reply and tell me, and I'll close the loop.

Best,
Claudine — Wunderbar Digital

---

# Automation 4.8 — Report Ready (Paid Report Delivery)

**Trigger:** tag `report:{tier}-ready` / the `report_ready` event (fires on paid report generation).
**Exit goal:** none needed (transactional-ish delivery + light follow-up); exits naturally at end.
**Cadence:** 3 emails over ~1 week. E1 is the delivery; E2/E3 add value and tee up the next tier.

### E1 — Immediate: your report is ready

**Subject:** Your %PRODUCTPURCHASED% is ready, %FIRSTNAME% 🎉
**Preview:** Everything's inside — here's your link.

Hi %FIRSTNAME%,

Your **%PRODUCTPURCHASED%** for %COMPANYNAME% is ready.

**→ Open your report** (button → %REPORTLINK%)

A tip: don't just skim it. Start with your biggest opportunity — **%WEAKESTPILLAR%** — and pick the *first* recommendation to act on this week. Momentum beats perfection.

You can always find it again in your dashboard: %DASHBOARDLINK%

Enjoy digging in,
Claudine — Wunderbar Digital

---

### E2 — +2 days: the one finding to act on

**Subject:** The first move I'd make for %COMPANYNAME%
**Preview:** Don't let a good report gather dust.

Hi %FIRSTNAME%,

Reports are only worth what you do with them. So here's the nudge: pick **one** thing from your %PRODUCTPURCHASED% and ship it this week.

If you're not sure where to start, start with **%WEAKESTPILLAR%** — it's your highest-leverage gap.

**→ Reopen your report** (button → %REPORTLINK%)

And I'd genuinely love to know what you thought — it takes 60 seconds: %EXPERIENCESURVEYLINK%

Best,
Claudine — Wunderbar Digital

---

### E3 — +5 days: the natural next step

**Subject:** Ready for the next level, %FIRSTNAME%?
**Preview:** Where %COMPANYNAME% goes from here.

Hi %FIRSTNAME%,

Hope your %PRODUCTPURCHASED% has been useful. When you're ready to go deeper, the next tier picks up right where this one leaves off — more depth, more done-for-you, less guesswork.

**→ See what's next** (button → %UPGRADEPRODUCTURL%)

No rush. Either way, I'll keep sending you ideas worth your time.

Best,
Claudine — Wunderbar Digital

---

## Build notes

- **Set fallbacks** on every merge tag (empty personalization looks worse than none).
- **Score conditional blocks:** build once as a saved conditional content snippet and reuse across 4.1.
- **Exit goals are critical:** a buyer who keeps getting "complete your purchase" emails churns trust.
  Wire the matching `purchased:*` exit on 4.1 and 4.2.
- **Speed on 4.2:** the first abandoned-checkout email should fire within an hour; conversion decays fast.
- **One ask per email**, UTMs on every link (`utm_source=activecampaign&utm_medium=email&utm_campaign=<automation>`).
- **Deliverability:** the reply invitations (E1 of 4.2, E2 of 4.8) are intentional — replies lift inbox placement.
