/**
 * Paste-ready expansions for every Activation tab plan when report/workbook copy is short or empty.
 * Each pack includes concrete headlines/subjects, image prompts, and CTAs where relevant.
 */
import { buildDevelopedEmailLifecyclePlan } from "@/lib/activation/emailLifecycleDevelopedCopy";

export type ActivationDevelopedContext = {
  companyName: string;
  industry: string;
  primaryPillar: string;
  firstPriority: string;
  secondPriority: string;
  thirdPriority: string;
  audienceShort: string;
  audienceSummary: string;
};

export function buildDevelopedEmailPlan(ctx: ActivationDevelopedContext): string {
  return buildDevelopedEmailLifecyclePlan({
    companyName: ctx.companyName,
    industry: ctx.industry,
    primaryPillar: ctx.primaryPillar,
    firstPriority: ctx.firstPriority,
    secondPriority: ctx.secondPriority,
    thirdPriority: ctx.thirdPriority,
    audienceShort: ctx.audienceShort,
  });
}

export function buildDevelopedSeoAeoPlan(ctx: ActivationDevelopedContext): string {
  const cn = ctx.companyName;
  const ind = ctx.industry.toLowerCase();
  const aud = ctx.audienceShort;
  const p1 = ctx.firstPriority.toLowerCase();
  const pillar = ctx.primaryPillar.toLowerCase();
  return [
    "## Developed SEO / AEO page pack (briefs + prompts + CTAs)",
    "",
    "### Pillar page A — intent: “how to fix message-channel drift”",
    `- **H1:** How ${cn} aligns ads, landing, and first email without a rebrand`,
    `- **Meta description:** For ${aud}: one storyline, one metric, 14-day owner map—${p1} first.`,
    `- **Hero image prompt:** 16:9 hero: single laptop with three aligned panels (ad, LP, email) showing matching headline text; navy/sky palette; no competitor logos.`,
    `- **Body outline:** Problem (3 sentences) → mechanism diagram → proof strip → FAQ block (AEO) → single CTA.`,
    `- **Primary CTA:** Download the alignment sketch`,
    `- **Secondary CTA:** Book a 20-minute scope fit`,
    "",
    "### Supporting page B — intent: “${ind} vendor evaluation criteria”",
    `- **H1:** A five-criteria scorecard for ${ind} buyers`,
    `- **Meta description:** Honest fit language + what ${cn} does in weeks 1–2.`,
    `- **Hero image prompt:** Checklist illustration, large type, accessible contrast, brand colors only.`,
    `- **Body outline:** Criteria list → red flags → how you run proof → CTA to PDF.`,
    `- **Primary CTA:** Save the scorecard`,
    "",
    "### Supporting page C — intent: “proof + timeline”",
    `- **H1:** What moves in the first 12 weeks (and how we measure it)`,
    `- **Meta description:** Named metric window + ${pillar} proof cadence.`,
    `- **Hero image prompt:** Before/after chart anonymized; footnote with metric definition.`,
    `- **Body outline:** Timeline → owners → risks → FAQ → CTA.`,
    `- **Primary CTA:** Read the proof one-pager`,
    "",
    "### AEO (AI discovery) blocks (paste under each H2)",
    "- 40–60 word direct answer first, then detail.",
    "- Add `FAQPage` structured data in production.",
    "- One question per H2; no stacked unrelated FAQs.",
    "",
    "### Internal links (minimum)",
    "- Pillar A → B, A → C, B → C, all → primary conversion page.",
  ].join("\n");
}

export function buildDevelopedAudiencePlan(ctx: ActivationDevelopedContext): string {
  const cn = ctx.companyName;
  const aud = ctx.audienceShort;
  const p1 = ctx.firstPriority.toLowerCase();
  return [
    "## Developed audience & trigger pack",
    "",
    "### Segment A — High intent (site + pricing)",
    "- **Who:** Visitors with 2+ pricing or services views in 7 days.",
    "- **Trigger rule:** Enroll in 3-email proof branch; pause if booked.",
    "- **Entry CTA (banner):** “See the 12-week plan outline”",
    "- **Hero image prompt:** 1200×400 site banner: single headline line + doc thumbnail, navy #021859 bar, sky #07B0F2 CTA pill.",
    "",
    "### Segment B — Education-first (guide, blog depth)",
    "- **Who:** 3+ blog/guide reads, no pricing view.",
    "- **Trigger rule:** Weekly nurture; one asset per email; no mixed CTAs.",
    `- **Primary CTA:** “Get the ${p1} checklist”`,
    `- **Image prompt (email hero):** 600×400 checklist mockup on desk, shallow depth of field, ${cn} wordmark corner.`,
    "",
    "### Segment C — Cold re-entry (dormant 45+ days)",
    "- **Who:** List members with no open 45 days.",
    "- **Trigger rule:** One POV + one proof strip; max 1 resend.",
    `- **Subject:** “Still fixing ${p1} for ${aud}?”`,
    "- **Primary CTA:** “Open the 2-minute recap”",
    "",
    "### Sales handoff (shared)",
    "- **Signal:** Reply with budget/timeline OR demo request.",
    "- **CTA for SDR:** “Book 20-minute scope fit” with owner map attached.",
  ].join("\n");
}

export function buildDevelopedJourneyPlan(ctx: ActivationDevelopedContext): string {
  const cn = ctx.companyName;
  const p1 = ctx.firstPriority.toLowerCase();
  return [
    "## Developed journey orchestration (touch-level)",
    "",
    "### Awareness — paid social touch",
    "- **Headline:** Same clicks. Cleaner story. One metric.",
    "- **Primary copy (≤90 words):** Hook on message-channel drift → one stat → CTA to ungated map.",
    "- **Image prompt:** 1080×1080 split: noisy dashboard vs calm laptop with aligned headlines.",
    "- **CTA:** Read the one-page map",
    "",
    "### Consideration — landing + retarget",
    `- **H1 (must match ad):** How ${cn} locks ${p1} in 14 days`,
    "- **Above-fold CTA:** Download owner map",
    "- **Hero image prompt:** 16:9 product/team photo + overlay H1 max 12 words; WCAG AA contrast.",
    "",
    "### Decision — sales-enabled email",
    "- **Subject:** Scope fit for {{company}} — three decisions, 20 minutes",
    "- **Body:** Slide outline recap + calendar link (paste from your CRM).",
    "- **CTA:** Pick a time",
    "",
    "### Retention — customer newsletter",
    "- **Subject:** One chart: what moved this month",
    "- **Image prompt:** Single KPI tile + sparkline, brand colors.",
    "- **CTA:** Open the pulse",
  ].join("\n");
}

export function buildDevelopedCompetitivePlan(ctx: ActivationDevelopedContext): string {
  const cn = ctx.companyName;
  const ind = ctx.industry.toLowerCase();
  return [
    "## Developed competitive motion (assets + prompts + CTAs)",
    "",
    "### Battle card — “vs. generic agency”",
    `- **One-liner:** ${cn} ships owner-ready execution, not slide-only strategy.`,
    "- **Proof block:** Named metric window + role-specific example (replace with real data).",
    `- **Image prompt (PDF cover):** 8.5×11 minimal: title + 3 bullets + ${cn} bar; no competitor logos.`,
    "- **CTA on card:** “Send this card to procurement”",
    "",
    "### Landing comparison module",
    `- **H2:** How teams in ${ind} evaluate partners without RFP theater`,
    "- **Hero image prompt:** 1200×628 checklist graphic; five criteria with icons.",
    "- **Primary CTA:** Save the scorecard",
    "",
    "### Sales talk-track (90 seconds)",
    "- **Beat 1:** Acknowledge alternative they named.",
    "- **Beat 2:** Reframe to risk they care about (time, budget, proof).",
    "- **Beat 3:** Offer proof asset + single next step CTA.",
  ].join("\n");
}

export function buildDevelopedLeadMagnetPlan(ctx: ActivationDevelopedContext): string {
  const cn = ctx.companyName;
  const p1 = ctx.firstPriority.toLowerCase();
  const aud = ctx.audienceShort;
  return [
    "## Developed lead magnet (offer + landing + nurture)",
    "",
    `### Asset: “${cn} — ${p1} alignment kit” (PDF)`,
    "- **Working title:** The 14-day owner map + message-channel checklist",
    "- **Promise:** In 12 minutes: three fixes you can ship without a rebrand.",
    "- **Format:** PDF (8–12 pages) + optional worksheet page.",
    `- **Cover image prompt:** Clean 8.5×11 cover: bold title, subhead for ${aud}, navy/sky, no stock handshake.`,
    "",
    "### Landing page",
    `- **H1:** Download the ${p1} alignment kit`,
    `- **Subhead:** Built for ${aud}—one CTA, one proof strip.`,
    "- **Hero image prompt:** 16:9 laptop + PDF cover floating; soft shadow.",
    "- **Primary CTA (button):** Download the kit",
    "- **Secondary:** Book a 20-minute scope fit",
    "",
    "### Thank-you + nurture",
    "- **Email 1 (instant):** Deliver PDF + “do this first” checklist item.",
    "- **Subject:** Your kit + the one move we’d make first",
    "- **Image prompt (email):** 600×400 same PDF mockup.",
    "- **CTA:** Reply “loom” for walkthrough (optional).",
    "",
    "### Email 2 (day 3)",
    "- **Subject:** The proof block your peers asked for",
    "- **Body:** Short case frame + link to same metric definition.",
    "- **CTA:** See the proof one-pager",
    "",
    "### Email 3 (day 7)",
    "- **Subject:** Ready for a scope fit?",
    "- **CTA:** Book 20 minutes",
  ].join("\n");
}

export function buildDevelopedPaidCreativesPack(ctx: ActivationDevelopedContext): string {
  const cn = ctx.companyName;
  const p1 = ctx.firstPriority.toLowerCase();
  const aud = ctx.audienceShort;
  return [
    "## Developed paid creative pack (angles + prompts + CTAs)",
    "",
    "### Angle A — Diagnosis (LinkedIn / Meta static)",
    "- **Headline:** Still funding campaigns that disagree with your homepage?",
    "- **Body (primary text ≤150 words):** Pain → mechanism teaser → CTA.",
    `- **Image prompt:** 1200×627 split layout; left clutter right calm; ${cn} colors; legible at 50% zoom.`,
    "- **CTA:** Read the one-page map",
    "",
    "### Angle B — Proof (retargeting)",
    "- **Headline:** What moved in 12 weeks (named window)",
    "- **Image prompt:** 1080×1080 chart + footnote; anonymize logos.",
    "- **CTA:** Open the proof PDF",
    "",
    "### Angle C — Offer (decision)",
    "- **Headline:** First 14 days — owner map + kickoff",
    "- **Image prompt:** Calendar + checklist stack; single focal point.",
    "- **CTA:** Book scope fit",
    "",
    "### RSA pair (Google Ads — adapt)",
    `- **H1:** ${cn} | ${p1} alignment`,
    `- **H2:** For ${aud}`,
    "- **H3:** Book a 20-minute scope fit",
    "- **Descriptions:** D1: Proof-led; no fluff. D2: One metric; 14-day plan.",
    "- **Final URL CTA path:** Landing H1 must echo Angle C headline.",
  ].join("\n");
}

export function buildDevelopedThoughtLeadershipPack(ctx: ActivationDevelopedContext): string {
  const cn = ctx.companyName;
  const p1 = ctx.firstPriority.toLowerCase();
  const p2 = ctx.secondPriority.toLowerCase();
  return [
    "## Developed social / authority pack (posts + prompts + CTAs)",
    "",
    "### Mon — POV (problem framing)",
    `- **Hook:** Most ${p1} programs fail on translation—not talent.`,
    "- **Post body (≤280 chars for X / ≤1300 LinkedIn):** 3 sentences + one question.",
    "- **Image / card prompt:** 1080×1080 bold text card; navy background; sky highlight on one word.",
    "- **CTA:** Comment “map” for the one-pager",
    "",
    "### Wed — Proof",
    "- **Hook:** Before / after (one metric, named window).",
    "- **Carousel prompt:** 1080×1080 slides: Problem → Mechanism → Result → CTA slide; high contrast.",
    "- **CTA:** Link in bio → alignment kit",
    "",
    "### Fri — Tactical",
    `- **Hook:** 5 checks before you scale ${p2}.`,
    "- **Image prompt:** Checklist graphic; numbered 1–5.",
    "- **CTA:** Save this post / subscribe",
    "",
    "### Short video (optional Reels/Shorts)",
    "- **Prompt:** 15s: hook text 0–2s, screen walk 3–10s, CTA card 11–15s; captions burned-in.",
    "- **CTA on end card:** Get the checklist",
  ].join("\n");
}

export function buildDevelopedPrPlan(ctx: ActivationDevelopedContext): string {
  const cn = ctx.companyName;
  const ind = ctx.industry.toLowerCase();
  const p3 = ctx.thirdPriority.toLowerCase();
  return [
    "## Developed PR & visibility pack",
    "",
    "### Quarterly story angle",
    `- **Pitch subject:** Why ${ind} teams stall after traction—and the ${p3} fix they skip`,
    "- **Outlet targets:** Practitioner newsletters, operator podcasts, vertical trades (replace with your list).",
    "",
    "### Press release hero image prompt",
    `- **1200×630:** Quote pull + one stat callout + ${cn} wordmark; no sensational imagery.`,
    "",
    "### Spokesperson quote (paste-ready)",
    `- “We are seeing buyers reward teams who ship one proof cadence tied to ${p3}—not more campaigns.” — [Name], ${cn}`,
    "",
    "### CTA for readers",
    "- **Primary:** Read the methodology one-pager",
    "- **Secondary:** Book a briefing for editorial",
    "",
    "### Follow-up asset (sales)",
    "- **One-pager PDF cover prompt:** Same stat + timeline graphic; navy header.",
  ].join("\n");
}

export function buildDevelopedExecutionRoadmap(ctx: ActivationDevelopedContext): string {
  const cn = ctx.companyName;
  const p1 = ctx.firstPriority.toLowerCase();
  const p2 = ctx.secondPriority.toLowerCase();
  const p3 = ctx.thirdPriority.toLowerCase();
  return [
    "## Developed 90-day execution roadmap (weeks + CTAs)",
    "",
    "### Days 1–30 — Lock",
    "- **Outcome:** One storyline on hero, first nurture email, first sales deck slide.",
    "- **Owner checklist CTA:** “Sign off in weekly standup”",
    "- **Dashboard image prompt:** 16:9 Notion/Sheets screenshot mock: three rows Done/In progress/Blocked.",
    "",
    "### Days 31–60 — Proof",
    "- **Outcome:** Case snippet set + comparison module live.",
    "- **CTA:** Publish proof blog + retarget same headline",
    "",
    "### Days 61–90 — Scale",
    `- **Outcome:** Kill bottom quartile creatives; double down on ${p2}.`,
    "- **CTA:** Reallocate spend doc + one leadership email",
    "",
    "### Weekly ritual (recurring)",
    "- **Monday:** Priorities + blockers (15 min).",
    "- **Thursday:** Metrics + creative leaderboard (20 min).",
    "- **CTA:** Log decisions in single source of truth",
    "",
    "### Success gates",
    `- **30d:** ${p1} live on three surfaces.`,
    `- **60d:** Proof CTR + nurture progression up vs baseline.`,
    `- **90d:** ${p3} metric moved per charter.`,
    "",
    "### Stakeholder email (paste-ready)",
    `- **Subject:** ${cn} — 90-day activation: week {week} update`,
    "- **Body:** 4 bullets: shipped, learning, risk, one ask.",
    "- **CTA:** Reply with approval or blocker",
  ].join("\n");
}
