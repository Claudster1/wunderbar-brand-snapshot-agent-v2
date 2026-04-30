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
  const p2 = ctx.secondPriority.toLowerCase();
  const aud = ctx.audienceShort;
  return [
    "## Developed lead magnet expansions",
    "",
    "Use these **after** your core kit, landing, and nurture are live. They extend the same storyline without inventing a second promise.",
    "",
    "### Retargeting ad — opened kit, no meeting booked",
    "",
    "**Headline**  \nYou downloaded the map—want the walkthrough?",
    "",
    "**Primary text**  \n" +
      `Most ${aud} teams get value from page two of the ${p1} kit in under ten minutes. If you would rather watch than read, hit reply on the thank-you email with “loom” and we will send a private walkthrough. If you are ready to assign owners, book twenty minutes and we will lock the metric window together.`,
    "",
    "**CTA**  \nBook a scope fit",
    "",
    "### LinkedIn DM (to engaged downloaders)",
    "",
    `Hi {{first}}—saw you grabbed the ${p1} alignment kit. Page two is the fastest win: fill the owner map in pencil before you show it to leadership. If you want a second pair of eyes, happy to record a two-minute Loom on your actual headline stack—no pitch, just specificity.`,
    "",
    "### Webinar invite email (optional motion)",
    "",
    `**Subject**  \nLive working session: ${p1} without another rebrand`,
    "",
    "**Body**  \n" +
      `We are running a thirty-minute working session for ${aud} on how ${cn} aligns ads, landing, and first email in fourteen days. Bring your current hero line—we will stress-test it against your nurture subject lines live. Seats capped so we can answer questions.`,
    "",
    "**CTA**  \nSave my seat",
    "",
    "### Partner / co-mark one-liner (for newsletters)",
    "",
    `**Blurb**  \n${cn} published a practical kit for teams stuck translating ${p1} into ${p2}. It is free, no agency pitch—just the owner map and checklist their operators asked for.`,
    "",
    "### Cover & hero prompts (design handoff)",
    "",
    `**PDF cover (8.5×11)**  \nBold title “${p1} alignment kit,” subhead “For ${aud},” navy bar #021859, sky accent #07B0F2, no stock handshake imagery.`,
    "",
    "**Landing hero (16:9)**  \nLaptop with PDF cover floating at slight angle, soft shadow, single CTA pill, plenty of breathing room for mobile crop.",
    "",
    "**Email hero (600×400)**  \nSame PDF mockup on desk, shallow depth of field, ${cn} wordmark corner only.",
  ].join("\n");
}

export function buildDevelopedPaidCreativesPack(ctx: ActivationDevelopedContext): string {
  const cn = ctx.companyName;
  const p1 = ctx.firstPriority.toLowerCase();
  const p2 = ctx.secondPriority.toLowerCase();
  const aud = ctx.audienceShort;
  return [
    "## Developed paid creative pack",
    "",
    "Each block is **paste-ready** for Meta, LinkedIn, or Microsoft Ads static placements. Swap in your real metrics and legal-approved claims.",
    "",
    "### Angle A — Diagnosis (LinkedIn / Meta 1200×627)",
    "",
    "**Headline**  \nStill funding campaigns that disagree with your homepage?",
    "",
    "**Primary text**  \n" +
      `Your ${aud} does not fail because the ads are “bad.” They fail because the ad promises one outcome, the landing hero promises another, and the first automated email introduces a third. ${cn} fixes that drift in about two weeks with a single owner map. Read the one-page version before you scale spend on ${p1}.`,
    "",
    `**Image brief**  \nSplit layout: left side noisy dashboard and crossed messages; right side calm laptop with one aligned headline repeated in ad, LP, and email. ${cn} palette only; readable at fifty percent zoom.`,
    "",
    "**CTA button**  \nRead the map",
    "",
    "### Angle B — Proof (retargeting 1080×1080)",
    "",
    "**Headline**  \nWhat moved in the first twelve weeks (named window)",
    "",
    "**Primary text**  \n" +
      `Here is the before-and-after your team asked for: same metric definition in the footnote, same storyline as slide one in sales. Proof is tied to ${p2} so procurement and operators see the same story. Open the PDF and forward it internally if you need alignment.`,
    "",
    "**Image brief**  \nSingle chart with sparkline, anonymized logos, footnote with metric definition, high contrast for small screens.",
    "",
    "**CTA button**  \nSee proof",
    "",
    "### Angle C — Offer (decision-stage)",
    "",
    "**Headline**  \nFirst fourteen days: owner map + kickoff",
    "",
    "**Primary text**  \n" +
      `Book twenty minutes with ${cn}. You will leave with three decisions made: the storyline, the metric window, and who owns each customer-facing surface. If we are not a fit, you still keep the framing—no generic pitch deck.`,
    "",
    "**Image brief**  \nCalendar tile plus stacked checklist, single focal point, lots of white space.",
    "",
    "**CTA button**  \nBook scope fit",
    "",
    "### Google Ads RSA set (adapt headlines into your account)",
    "",
    [
      "**Headline options**",
      `H1: ${cn} | ${p1} alignment`,
      `H2: For ${aud}`,
      "H3: Book a 20-minute scope fit",
      "H4: One metric · 14-day plan",
      "H5: Stop message drift",
    ].join("  \n"),
    "",
    `**Descriptions**  \nD1: Proof-led execution—no fluff decks. Same headline language on ads and landing.  \nD2: Lock ${p1} across ads, LP, and email. Named owners in two weeks.`,
    "",
    "**Final URL**  \nMust land on a page whose **H1 echoes Angle C** so Quality Score and human trust stay aligned.",
  ].join("\n");
}

export function buildDevelopedThoughtLeadershipPack(ctx: ActivationDevelopedContext): string {
  const cn = ctx.companyName;
  const p1 = ctx.firstPriority.toLowerCase();
  const p2 = ctx.secondPriority.toLowerCase();
  return [
    "## Developed social / authority pack",
    "",
    `Three **full drafts** you can paste into LinkedIn or adapt for X. Tone matches a founder or practice lead at **${cn}**.`,
    "",
    "### Monday — POV post (LinkedIn-length)",
    "",
    `Most ${p1} programs do not die from lack of talent. They die in translation: marketing ships one story, product hears another, and sales improvises a third. Your buyer feels the mismatch in two clicks and quietly moves on.`,
    "",
    `Pick one outcome, one metric window, and one proof point for the week. Build every surface from that spine only—hero, nurture subject line, paid headline. If you want the one-page map we use with teams who are tired of debating slides, comment “map” and I will send it.`,
    "",
    "**X / thread opener (under 280 characters)**  \n" +
      `${p1} fails in week three when your ad, LP, and email disagree. Same week: pick one promise. Comment “map” for the one-pager.`,
    "",
    "**Image card prompt**  \n1080×1080 bold type card: navy background, one word highlighted in sky, max twelve words total.",
    "",
    "### Wednesday — Proof carousel (slide copy)",
    "",
    "**Slide 1**  \nBefore: three headlines, three metrics, no owner.",
    "",
    `**Slide 2**  \nDecision: we locked one storyline for ${p2}.`,
    "",
    "**Slide 3**  \nAfter: twelve-week window, named metric in the footnote, same words on slide one of sales.",
    "",
    "**Slide 4**  \nCTA: Link in bio → alignment kit (same H1 as landing).",
    "",
    "**Designer note**  \n1080×1080 per slide, high contrast, no competitor logos.",
    "",
    "### Friday — Tactical checklist post",
    "",
    `Five checks before you scale ${p2}: (1) Hero matches the best-performing ad line. (2) First nurture subject repeats that line. (3) Sales deck slide one uses the same verbs. (4) UTMs tell you which post drove the visit. (5) One Friday review fixes drift before Monday spend.`,
    "",
    "Save this for your weekly standup. If you want the printable version, say “checklist” in the comments.",
    "",
    "**Image prompt**  \nNumbered checklist graphic 1–5, plenty of padding, accessible contrast.",
    "",
    "### Short video script (15 seconds, optional Reels / Shorts)",
    "",
    "**0–2s on-screen text**  \nYour ads and landing page disagree.",
    "",
    "**3–10s voiceover**  \n" +
      `Show a screen recording: two tabs open with different headlines; close one; type the unified line into a doc labeled ${cn} owner map.`,
    "",
    "**11–15s end card**  \nBold: Get the checklist — link in bio. Captions burned in for silent viewing.",
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
