/**
 * Paste-ready expansions for every Activation tab plan when report/workbook copy is short or empty.
 * Each pack includes concrete headlines/subjects, image prompts, and CTAs where relevant.
 */
import { buildDevelopedEmailLifecyclePlan } from "@/lib/activation/emailLifecycleDevelopedCopy";
import {
  optionalWalkthroughBodyLine,
  optionalWalkthroughDmLine,
} from "@/lib/activation/formatAgnosticRecommendations";

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
    "## Start here — website & search pages",
    "",
    "**Step 1 — Pick the main page** to publish first (story consistency).",
    "",
    "**Step 2 — Add the two support pages** (partner checklist + proof timeline).",
    "",
    "**Step 3 — Add short FAQ answers** under each big question so Google and AI tools can quote you clearly.",
    "",
    "Think of these as page blueprints. Copy the headlines and outlines into your site or brief a writer. SEO = showing up in Google. AEO = writing clear answers so AI tools can quote you accurately.",
    "",
    "### Main page — “keep the story consistent”",
    `- **Page title (H1):** How ${cn} keeps ads, website, and email saying the same thing`,
    `- **Search snippet:** For ${aud}: one story, one number that matters, a 14-day owner map — start with ${p1}.`,
    `- **Image idea:** Laptop showing three matching panels (ad, page, email) with the same headline. Navy / sky palette. No competitor logos.`,
    `- **Page outline:** Problem (3 short sentences) → how it works → proof → FAQ → one next step.`,
    `- **Main next step:** Download the alignment sketch`,
    `- **Optional second step:** Book a 20-minute fit call`,
    "",
    "### Support page — “how to choose a ${ind} partner”",
    `- **Page title (H1):** Five plain questions for ${ind} buyers`,
    `- **Search snippet:** Honest fit language + what ${cn} does in the first two weeks.`,
    `- **Image idea:** Simple checklist, large type, easy-to-read contrast, brand colors only.`,
    `- **Page outline:** Criteria → red flags → how you show proof → next step to PDF.`,
    `- **Main next step:** Save the scorecard`,
    "",
    "### Support page — “proof + timeline”",
    `- **Page title (H1):** What can move in the first 12 weeks (and how we measure it)`,
    `- **Search snippet:** Named timeframe + ${pillar} proof you can check.`,
    `- **Image idea:** Before/after chart with names blurred; footnote that defines the number.`,
    `- **Page outline:** Timeline → owners → risks → FAQ → next step.`,
    `- **Main next step:** Read the one-page proof summary`,
    "",
    "### Short AI-friendly answers (paste under each big question heading)",
    "- Lead with a 40–60 word direct answer, then add detail.",
    "- One question per heading — do not stack unrelated FAQs.",
    "- Ask your web person to add FAQ structured data when you go live.",
    "",
    "### Link these pages together",
    "- Main page → both support pages; support pages → each other; all three → your main contact or offer page.",
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
    `- **One-liner:** ${cn} ships work your team can run, not slide-only strategy.`,
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
      `Most ${aud} teams get value from page two of the ${p1} kit in under ten minutes. ${optionalWalkthroughBodyLine(2)} If you are ready to assign owners, book twenty minutes and we will lock the metric window together.`,
    "",
    "**CTA**  \nBook a scope fit",
    "",
    "### LinkedIn DM (to engaged downloaders)",
    "",
    `Hi {{first}}—saw you grabbed the ${p1} alignment kit. Page two is the fastest win: fill the owner map in pencil before you show it to leadership. ${optionalWalkthroughDmLine()}`,
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
    "## Start here — paid ad starters",
    "",
    "**Step 1 — Pick one angle** (mismatch, proof, or clear next step).",
    "",
    "**Step 2 — Paste** that block into Meta, LinkedIn, or Microsoft Ads.",
    "",
    "**Step 3 — Send clicks** to a page whose headline matches the ad.",
    "",
    "Each block is ready for Meta, LinkedIn, or Microsoft Ads. Swap in your real numbers and any claims your legal team has approved.",
    "",
    "### Angle A — Spot the mismatch (LinkedIn / Meta)",
    "",
    "**Headline**  \nStill running ads that disagree with your homepage?",
    "",
    "**Primary text**  \n" +
      `Your ${aud} does not bounce because the ads are “bad.” They bounce when the ad promises one result, the website says something else, and the first email adds a third idea. ${cn} helps fix that in about two weeks with a simple owner map. Read the one-page version before you spend more on ${p1}.`,
    "",
    `**Image idea**  \nSplit layout: messy mixed messages on the left; calm laptop with one matching headline on the right. ${cn} colors only; still readable when small.`,
    "",
    "**Button**  \nRead the map",
    "",
    "### Angle B — Show proof (people who already clicked)",
    "",
    "**Headline**  \nWhat changed in the first twelve weeks",
    "",
    "**Primary text**  \n" +
      `Here is the before-and-after teams ask for: same number defined in the footnote, same story as slide one in sales. Proof ties to ${p2} so finance and operators see one story. Open the PDF and forward it if you need alignment.`,
    "",
    "**Image idea**  \nOne chart, blurred logos, footnote that defines the number, high contrast for phones.",
    "",
    "**Button**  \nSee proof",
    "",
    "### Angle C — Clear next step",
    "",
    "**Headline**  \nFirst fourteen days: owner map + kickoff",
    "",
    "**Primary text**  \n" +
      `Book twenty minutes with ${cn}. You will leave with three decisions: the story, the number that matters, and who owns each customer-facing page or email. If we are not a fit, you still keep the framing — no generic pitch deck.`,
    "",
    "**Image idea**  \nCalendar tile plus a short checklist, one focal point, lots of white space.",
    "",
    "**Button**  \nBook a fit call",
    "",
    "### Google Ads headlines (adapt in your account)",
    "",
    [
      "**Headline options**",
      `H1: ${cn} | ${p1} alignment`,
      `H2: For ${aud}`,
      "H3: Book a 20-minute fit call",
      "H4: One metric · 14-day plan",
      "H5: Stop mixed messages",
    ].join("  \n"),
    "",
    `**Descriptions**  \nD1: Practical plan — same headline on the ad and the landing page.  \nD2: Align ${p1} across ads, page, and email. Named owners in two weeks.`,
    "",
    "**Landing page tip**  \nSend people to a page whose main headline matches Angle C so the click feels honest.",
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
    `Pick one outcome, one metric window, and one proof point for the week. Build every surface from that message only—hero, nurture subject line, paid headline. If you want the one-page map we use with teams who are tired of debating slides, comment “map” and I will send it.`,
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
