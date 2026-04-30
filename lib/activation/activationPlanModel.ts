import type { WorkbookSectionId } from "@/lib/workbookTypes";
import {
  type ActivationDevelopedContext,
  buildDevelopedAudiencePlan,
  buildDevelopedCompetitivePlan,
  buildDevelopedEmailPlan,
  buildDevelopedExecutionRoadmap,
  buildDevelopedJourneyPlan,
  buildDevelopedLeadMagnetPlan,
  buildDevelopedPaidCreativesPack,
  buildDevelopedPrPlan,
  buildDevelopedSeoAeoPlan,
  buildDevelopedThoughtLeadershipPack,
} from "@/lib/activation/activationDevelopedPlansCopy";

export type ActivationPlanSection = {
  id: string;
  label: string;
  summary: string;
  body: string;
  workbookSectionId: WorkbookSectionId;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function firstNWords(input: string, count: number): string {
  const words = input.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  return words.slice(0, count).join(" ");
}

function extractPersonaSummaries(diagnosticData: Record<string, unknown>): string[] {
  const out: string[] = [];
  const apd = asRecord(diagnosticData.audiencePersonaDefinition);
  if (apd) {
    for (const key of ["primaryICP", "secondaryICP"] as const) {
      const block = asRecord(apd[key]);
      if (!block) continue;
      const name =
        (typeof block.icpLabel === "string" && block.icpLabel.trim()) ||
        (typeof block.name === "string" && block.name.trim()) ||
        key;
      const summary =
        (typeof block.summary === "string" && block.summary.trim()) ||
        (typeof block.conversionPath === "string" && block.conversionPath.trim()) ||
        "";
      out.push(summary ? `${name}: ${summary}` : name);
    }
  }
  const bpe = asRecord(diagnosticData.buyerPersonaEcosystem);
  if (bpe) {
    const personas = Array.isArray(bpe.buyerPersonas) ? bpe.buyerPersonas : [];
    for (const raw of personas.slice(0, 3)) {
      const p = asRecord(raw);
      if (!p) continue;
      const name = typeof p.personaName === "string" ? p.personaName.trim() : "";
      if (!name) continue;
      const role = typeof p.role === "string" ? p.role.trim() : "";
      const angle = typeof p.messagingAngle === "string" ? p.messagingAngle.trim() : "";
      const line = [name, role && `(${role})`, angle && `- ${angle}`].filter(Boolean).join(" ");
      out.push(line);
    }
  }
  return [...new Set(out)].slice(0, 4);
}

function buildSocialMediaPlan(
  diagnosticData: Record<string, unknown>,
  opts: {
    companyName: string;
    industry: string;
    primaryPillar: string;
    firstPriority: string;
    secondPriority: string;
    thirdPriority: string;
    audienceSummary: string;
    audienceShort: string;
    socialSeed: string;
  },
): string {
  const personaLines = extractPersonaSummaries(diagnosticData);
  const channelPlans = (diagnosticData.channelPlans as Record<string, string> | undefined) ?? {};
  const socialSignals = [channelPlans.social, channelPlans.content]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join("\n\n");
  const platformHint = socialSignals.toLowerCase();
  const candidatePlatforms = [
    { name: "LinkedIn", reason: "B2B education, authority building, and demand capture." },
    { name: "Instagram", reason: "Storytelling, visual proof, and trust reinforcement." },
    { name: "YouTube", reason: "Searchable long-form explainers and proof-rich walkthroughs." },
    { name: "X / Twitter", reason: "Fast POV distribution and narrative testing." },
    { name: "TikTok", reason: "Short-form educational reach and top-of-funnel hooks." },
  ];
  const selectedPlatforms = candidatePlatforms.filter((item) =>
    platformHint.includes(item.name.toLowerCase().replace(" / ", " ").split(" ")[0]),
  );
  const platformsList = selectedPlatforms.length ? selectedPlatforms : candidatePlatforms.slice(0, 3);
  const personaSection = personaLines.length
    ? personaLines
        .map((line) => {
          const idx = line.indexOf(":");
          if (idx === -1) return line;
          const title = line.slice(0, idx).trim();
          const rest = line.slice(idx + 1).trim();
          return `**${title}**  \n${rest}`;
        })
        .join("\n\n")
    : `**Primary audience**  \n${opts.audienceSummary}\n\n**Supporting audience**  \nOperators and stakeholders who influence final selection.`;
  const platformBlocks = platformsList
    .map((item, index) => {
      const priority = index === 0 ? "Primary" : "Secondary";
      const cadence = index === 0 ? "3x/week" : "2x/week";
      return `### ${item.name} (${priority}, ${cadence})\n\n${item.reason}\n\nShip a mix of proof posts, POV threads, and one soft CTA per week on this channel.`;
    })
    .join("\n\n");

  return [
    "## Social media plan",
    "",
    `${opts.companyName} operates in **${opts.industry}**. This plan is written so you can lift lines into captions this week—then tune with your own proof and offers.`,
    "",
    "### Goals (90 days)",
    "",
    `**Qualified traffic from ${opts.audienceShort}** — Target roughly 25–35% more sessions from social that also trigger a qualified action (demo request, guide download, or pricing view). Tie progress to **${opts.firstPriority.toLowerCase()}** so growth is measured on outcomes, not vanity reach.`,
    "",
    `**Engagement quality on ${opts.primaryPillar.toLowerCase()}** — Prioritize saves, shares with commentary, and profile visits from people who match your ICP. You want fewer noisy likes and more “this is us” reactions.`,
    "",
    `**Conversion-ready demand for ${opts.secondPriority.toLowerCase()}** — Every week, at least one post should point to a single next step (resource, waitlist, or booking) with the same headline language you use on the landing page.`,
    "",
    "### Audience & personas",
    "",
    personaSection,
    "",
    "### Platform focus",
    "",
    platformBlocks,
    "",
    "Deprioritize channels that do not show ICP signal for six to eight weeks once your core cadence is stable.",
    "",
    "### Content pillars & tone",
    "",
    `**Pillar A (~40%) — ${opts.firstPriority}**  \nShort lessons, teardowns, and “here is how we think about it” posts.`,
    "",
    `**Pillar B (~35%) — ${opts.secondPriority}**  \nProof, timelines, and customer-shaped stories.`,
    "",
    `**Pillar C (~25%) — ${opts.thirdPriority}**  \nOffer-adjacent clarity: what happens after someone says yes.`,
    "",
    `Tone stays **clear, evidence-backed, and practical**. Skip empty superlatives; every bold claim should point to a metric, artifact, or customer moment tied to **${opts.primaryPillar.toLowerCase()}**.`,
    "",
    "### Sample posts you can paste and adapt",
    "",
    "**Post 1 — POV (LinkedIn or X)**",
    "",
    `Hook: Most ${opts.firstPriority.toLowerCase()} roadmaps fail in week three—not because teams lack ideas, but because the story on social, the landing page, and the first sales email disagree.`,
    "",
    `Body: If your ${opts.audienceShort} sees three different promises in three clicks, they stop believing any of them. Pick one outcome, one timeframe, and one proof point. Build this week’s content from that spine only.`,
    "",
    "CTA: Comment “map” if you want the one-page message alignment sketch we use with new clients.",
    "",
    "**Post 2 — Proof (carousel or thread)**",
    "",
    `Slide 1: Before — scattered metrics, no owner. Slide 2: Decision — one storyline for ${opts.secondPriority.toLowerCase()}. Slide 3: After — named window (e.g. 12 weeks) + what moved. Slide 4: CTA — same headline as your primary landing hero.`,
    "",
    "**Post 3 — Tactical checklist**",
    "",
    `Five checks before you scale spend on ${opts.thirdPriority.toLowerCase()}: (1) Hero matches ad promise. (2) First email repeats that promise in the subject. (3) Sales deck slide 1 uses the same words. (4) UTMs tell you which post drove the visit. (5) One weekly review fixes drift. Save this list for your standup.`,
    "",
    "### Weekly rhythm & workflow",
    "",
    "Publish **three to five** posts per week across priority channels. Each asset follows **Hook → insight or proof → one CTA**. Workflow: Draft → Review → Approved → Scheduled → Live. Block ninety minutes Monday for batching hooks; thirty minutes daily for replies.",
    "",
    "### Community & paid alignment",
    "",
    "Reply to comments within **four business hours**; DMs within **24 hours**. Escalate product complaints, legal risk, media requests, or sudden negative spikes to your comms lead immediately.",
    "",
    "Boost only posts that already earned strong organic saves or CTA clicks. Run **awareness, consideration, and decision** variants with the same core line—change the proof depth, not the promise. Split budget **70%** on proven themes, **30%** on deliberate creative tests.",
    "",
    "### Reporting & governance",
    "",
    "**Weekly:** engagement quality, posting streak, top CTA lines. **Monthly:** traffic quality, assisted conversions, creative fatigue. **Quarterly:** channel audit and resource shift.",
    "",
    "RACI: strategy owner signs priorities, content owner ships drafts, approver covers brand and compliance, monthly performance review and quarterly strategy reset on the calendar.",
    "",
    "### 90-day rollout (social + content)",
    "",
    "**Days 1–30 — Establish** — Lock the 40/35/25 pillar mix. Ship three anchor posts per week on your primary channel. Test two hook formats (story vs. checklist). Stand up UTMs and a simple weekly metrics sheet.",
    "",
    "**Days 31–60 — Scale** — Double down on the two themes with the best saves and clicks. Add one new format (carousel, short video, or thread). Put a light paid boost behind the top two organic winners only.",
    "",
    "**Days 61–90 — Optimize** — Cut the bottom quartile of posts by engagement quality. Run a month-long narrative arc on " +
      opts.secondPriority.toLowerCase() +
      ". Document a repeatable monthly content kit your team can clone.",
    "",
    "Cadence target: **36–45** published assets in ninety days across priority platforms (adjust for team size).",
    "",
    "### Full-funnel coverage",
    "",
    "Each month, ship at least **one top-of-funnel** post (pain + education, CTA to follow or soft resource), **one mid-funnel** post (proof, ethical comparison, customer moment, CTA to guide or webinar), and **one bottom-funnel** post (clear offer, truthful urgency, CTA to book or buy) on each primary platform.",
    "",
    opts.socialSeed || socialSignals
      ? `### Channel intelligence from your report\n\n${opts.socialSeed || socialSignals}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function extractActivationDerivatives(diagnosticData: Record<string, unknown>) {
  const companyName =
    typeof diagnosticData.companyName === "string" && diagnosticData.companyName
      ? diagnosticData.companyName
      : "Your Brand";
  const industry =
    typeof diagnosticData.industry === "string" && diagnosticData.industry
      ? diagnosticData.industry
      : "your market";
  const primaryPillar =
    typeof diagnosticData.primaryPillar === "string" && diagnosticData.primaryPillar
      ? diagnosticData.primaryPillar
      : "Messaging";
  const strategicPriorities = (
    (diagnosticData.strategicPriorities as Array<{ rank?: number; title?: string; pillar?: string }> | undefined) ??
    []
  )
    .slice(0, 3)
    .map((item, index) => ({
      rank: typeof item.rank === "number" ? item.rank : index + 1,
      title: typeof item.title === "string" ? item.title : `Priority ${index + 1}`,
      pillar: typeof item.pillar === "string" ? item.pillar : "Brand",
    }));
  const firstPriority =
    strategicPriorities[0]?.title || `Close highest-impact ${primaryPillar.toLowerCase()} gap`;
  const secondPriority =
    strategicPriorities[1]?.title || `Build repeatable ${primaryPillar.toLowerCase()} execution`;
  const thirdPriority =
    strategicPriorities[2]?.title || `Scale what converts with owner accountability`;
  const buyerJourneySummary =
    typeof diagnosticData.buyerJourneySummary === "string" && diagnosticData.buyerJourneySummary
      ? diagnosticData.buyerJourneySummary
      : `Use a staged plan from awareness to decision so each campaign has one stage-specific objective, proof asset, and conversion trigger.`;
  const competitiveMatrixSummary =
    typeof diagnosticData.competitiveMatrixSummary === "string" && diagnosticData.competitiveMatrixSummary
      ? diagnosticData.competitiveMatrixSummary
      : `Operationalize competitor-specific messaging: define where ${companyName} wins, what traps to avoid, and approved rebuttal language by stage.`;
  const channelPlans = (diagnosticData.channelPlans as Record<string, string> | undefined) ?? {};
  const activationSegmentPlansBody =
    typeof diagnosticData.activationSegmentPlansBody === "string"
      ? diagnosticData.activationSegmentPlansBody.trim()
      : "";
  const activationRoadmapPlansBody =
    typeof diagnosticData.activationRoadmapPlansBody === "string"
      ? diagnosticData.activationRoadmapPlansBody.trim()
      : "";
  const audienceSummary =
    typeof diagnosticData.targetAudience === "string"
      ? diagnosticData.targetAudience
      : "Audience grouping is inferred from your diagnostic inputs.";
  const audienceShort = firstNWords(audienceSummary, 10).toLowerCase() || "decision-makers";
  const spendContext =
    diagnosticData.spendRecommendationContext && typeof diagnosticData.spendRecommendationContext === "object"
      ? (diagnosticData.spendRecommendationContext as {
          budgetConstrainedPlan?: { focus?: string; allocation?: Array<{ channel?: string; percent?: number }> };
          growthRoadmap?: { scenarios?: Array<{ label?: string; monthlySpend?: number; expectedOutcome?: string }> };
          confidence?: string;
        })
      : null;
  const paidSpendSection = spendContext
    ? [
        spendContext.budgetConstrainedPlan?.focus || "",
        Array.isArray(spendContext.budgetConstrainedPlan?.allocation)
          ? `Allocation guidance: ${spendContext.budgetConstrainedPlan!.allocation!
              .map((a) => `${a.percent ?? 0}% ${String(a.channel || "channel").replace(/_/g, " ")}`)
              .join(", ")}.`
          : "",
        Array.isArray(spendContext.growthRoadmap?.scenarios)
          ? `Scenarios: ${spendContext.growthRoadmap!.scenarios!
              .map((s) => `${s.label}: ~$${(s.monthlySpend || 0).toLocaleString()}/mo (${s.expectedOutcome || "growth path"})`)
              .join(" | ")}.`
          : "",
        spendContext.confidence ? `Confidence level: ${spendContext.confidence}.` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";
  const socialMediaPlan = buildSocialMediaPlan(diagnosticData, {
    companyName,
    industry,
    primaryPillar,
    firstPriority,
    secondPriority,
    thirdPriority,
    audienceSummary,
    audienceShort,
    socialSeed:
      (typeof channelPlans.social === "string" && channelPlans.social.trim()) ||
      (typeof channelPlans.content === "string" && channelPlans.content.trim()) ||
      "",
  });

  return {
    companyName,
    industry,
    primaryPillar,
    strategicPriorities,
    firstPriority,
    secondPriority,
    thirdPriority,
    buyerJourneySummary,
    competitiveMatrixSummary,
    channelPlans,
    activationSegmentPlansBody,
    activationRoadmapPlansBody,
    audienceSummary,
    audienceShort,
    paidSpendSection,
    socialMediaPlan,
  };
}

function isBlueprintPlusTier(diagnosticData: Record<string, unknown>): boolean {
  return diagnosticData.productTier === "blueprint-plus";
}

function developedContextFromD(d: ReturnType<typeof extractActivationDerivatives>): ActivationDevelopedContext {
  return {
    companyName: d.companyName,
    industry: d.industry,
    primaryPillar: d.primaryPillar,
    firstPriority: d.firstPriority,
    secondPriority: d.secondPriority,
    thirdPriority: d.thirdPriority,
    audienceShort: d.audienceShort,
    audienceSummary: d.audienceSummary,
  };
}

/** When report/workbook copy is already long, keep it alone; otherwise append paste-ready developed pack. */
function appendDevelopedPack(report: string, pack: string, minCompleteChars: number): string {
  const trimmed = report.trim();
  if (trimmed.length >= minCompleteChars) return report;
  if (!pack.trim()) return report;
  const sep = "\n\n---\n\n";
  if (!trimmed.length) return pack;
  return `${trimmed}${sep}${pack}`;
}

function blueprintPlusEmptyBlockMessage(companyName: string, topic: string): string {
  return [
    `${topic} (${companyName})`,
    "",
    "This section had no populated content in your Blueprint+ export. If you expected channel copy here, regenerate the report or confirm your tier includes the full engine output.",
  ].join("\n");
}

const NINETY_DAY_SOCIAL_MARKER = /10\)\s*90-day|90-day rollout calendar|\bDays\s*1[–-]30\b/i;

function socialThoughtLeadershipNinetyDayAddendum(): string {
  return [
    "",
    "---",
    "",
    "90-day social rollout (add to your operating calendar if not already spelled out above)",
    "- Days 1–30 — Establish pillar mix, ~3 anchor posts per week, test 2 hook styles per channel, UTMs + weekly metrics.",
    "- Days 31–60 — Scale top themes by saves/clicks; add one new format (carousel, short video, or thread); light paid boost on winners.",
    "- Days 61–90 — Trim bottom quartile by engagement quality; run one month-long narrative arc; document a repeatable monthly kit.",
    "- Full-funnel mix each month: TOFU education, MOFU proof, BOFU offer posts on each priority platform.",
  ].join("\n");
}

function withNinetyDaySocialAppendix(body: string): string {
  if (!body.trim() || NINETY_DAY_SOCIAL_MARKER.test(body)) return body;
  return body + socialThoughtLeadershipNinetyDayAddendum();
}

/** Prefer real channel copy from the report; avoid generic templates when substantive content exists. */
function pickSocialThoughtLeadershipBody(
  diagnosticData: Record<string, unknown>,
  d: ReturnType<typeof extractActivationDerivatives>,
): string {
  const social = typeof d.channelPlans.social === "string" ? d.channelPlans.social.trim() : "";
  const content = typeof d.channelPlans.content === "string" ? d.channelPlans.content.trim() : "";
  if (social.length > 120) return withNinetyDaySocialAppendix(social);
  if (content.length > 120) return withNinetyDaySocialAppendix(content);
  if (isBlueprintPlusTier(diagnosticData)) {
    return blueprintPlusEmptyBlockMessage(d.companyName, "Social & thought leadership");
  }
  return d.socialMediaPlan;
}

/** One-line defaults from channelPlans were ~100 chars and wrongly counted as a "plan" (80-char bar). */
const PAID_ADS_SUBSTANTIVE_MIN_CHARS = 320;

function buildDefaultPaidAdsPlanBody(d: ReturnType<typeof extractActivationDerivatives>): string {
  const p = d.primaryPillar.toLowerCase();
  const ind = d.industry.toLowerCase();
  return [
    "## Paid media execution plan",
    "",
    `This is a **paste-ready starter flight** for **${d.companyName}**. When your Blueprint+ export includes a full paid media strategy, replace this block with that playbook.`,
    "",
    "### Flight objectives (pick one primary per two-week sprint)",
    "",
    `**Awareness** — Reach **${d.audienceShort}** with a crisp problem/solution hook tied to **${d.firstPriority.toLowerCase()}**. Success looks like efficient reach plus outbound clicks from accounts that match your ICP filters, not anonymous vanity traffic.`,
    "",
    `**Consideration** — Send engaged clicks to a proof-rich landing experience that advances **${d.secondPriority.toLowerCase()}**. The ad line and the H1 must be the same promise in different grammar.`,
    "",
    `**Conversion** — Capture intent with an offer and CTA aligned to **${d.thirdPriority.toLowerCase()}**. Use a dedicated short form or calendar path; do not drop cold traffic on a generic homepage.`,
    "",
    "### Audience & targeting",
    "",
    `**Core ICP (for media briefs)**  \n${d.audienceSummary}`,
    "",
    "Build **three ad sets** for learning: (1) broad interest or keyword stack, (2) engaged visitors and engagers from the last 30 days, (3) retargeting pool from the last 7–30 days with frequency caps. Exclude converters and known low-quality placements; refresh exclusions monthly.",
    "",
    "### Sample ads — awareness (Meta / LinkedIn static)",
    "",
    "**Headline**  \nStill funding campaigns that disagree with your homepage?",
    "",
    "**Primary text**  \n" +
      `If your ${d.audienceShort} clicks an ad that promises one outcome and lands on a hero that promises another, they bounce—and you pay for the lesson. ${d.companyName} helps teams lock one storyline across ads, landing, and first email in about two weeks. Read the one-page map before you scale spend.`,
    "",
    "**Description / link caption**  \nMessage alignment checklist — free one-pager.",
    "",
    "**CTA button**  \nDownload",
    "",
    "### Sample ads — consideration (retargeting)",
    "",
    "**Headline**  \nWhat moved in the first 12 weeks (named window)",
    "",
    "**Primary text**  \n" +
      `Teams in ${ind} use one proof cadence—not more campaigns—to earn trust. Here is the before/after on the metric we agreed mattered most, with the footnotes your procurement team asked for. Same vocabulary as your sales deck slide one.`,
    "",
    "**CTA button**  \nSee the proof",
    "",
    "### Sample ads — conversion (high intent)",
    "",
    "**Headline**  \nFirst 14 days: owner map + kickoff",
    "",
    "**Primary text**  \n" +
      `Book a 20-minute scope fit. You leave with three decisions made: storyline, metric window, and who owns each surface. No generic “strategy day”—just the path to ship **${d.thirdPriority.toLowerCase()}**.`,
    "",
    "**CTA button**  \nBook now",
    "",
    "### Landing & post-click",
    "",
    "Every ad goes to a **dedicated path** that repeats the ad promise in the **H1**. One primary CTA above the fold; add a secondary CTA only after a proof block. On-page copy for " +
      `**${d.secondPriority.toLowerCase()}** must reuse the same verbs and numbers as the ad and the follow-up email.`,
    "",
    "### Budget pattern (starter)",
    "",
    "**Weeks 1–2:** 60% on creative learning across broad + engaged, 40% on retargeting with tight caps. **Weeks 3–4:** shift 70% to the winning angles and audiences; pause the bottom 30% by CTR and CPL after roughly three thousand impressions per cell. If budget is tight, run **one channel** (Meta or LinkedIn) until CPA stabilizes.",
    "",
    "### Measurement & guardrails",
    "",
    "Track CTR, CPC, landing CTR, form or start rate, qualified lead rate, and pipeline influence for B2B. Weekly: creative and audience leaderboard. Pause anything roughly **2× worse** than account average after enough volume to judge.",
    "",
    `Do not change the offer mid-flight without **duplicating** the ad set. Tone and claims must match your documented voice and **${p}** positioning.`,
    "",
    "### Creative angles to rotate",
    "",
    `**Outcome** — Measurable language for ${p}. **Proof** — Testimonial, metric, or mini case for ${ind} buyers. **Contrast** — Versus the status quo or a generic alternative (avoid naming competitors unless legal approves).`,
  ].join("\n");
}

function pickPaidAdsBody(
  diagnosticData: Record<string, unknown>,
  d: ReturnType<typeof extractActivationDerivatives>,
): string {
  const ads = typeof d.channelPlans.ads === "string" ? d.channelPlans.ads.trim() : "";
  const campaigns = typeof d.channelPlans.campaigns === "string" ? d.channelPlans.campaigns.trim() : "";
  const merged = [ads, campaigns].filter(Boolean).join("\n\n").trim();

  if (merged.length >= PAID_ADS_SUBSTANTIVE_MIN_CHARS) {
    return merged;
  }
  if (ads.length >= PAID_ADS_SUBSTANTIVE_MIN_CHARS) return ads;
  if (campaigns.length >= PAID_ADS_SUBSTANTIVE_MIN_CHARS) return campaigns;

  const spend = d.paidSpendSection?.trim() ?? "";
  if (spend.length >= 120) {
    return [spend, "", buildDefaultPaidAdsPlanBody(d)].join("\n");
  }

  if (isBlueprintPlusTier(diagnosticData) && (ads.length > 0 || campaigns.length > 0)) {
    return [
      blueprintPlusEmptyBlockMessage(d.companyName, "Paid media (partial export)"),
      "",
      "Until the full paid strategy is regenerated, use this execution scaffold:",
      "",
      buildDefaultPaidAdsPlanBody(d),
    ].join("\n");
  }

  return buildDefaultPaidAdsPlanBody(d);
}

/** Pull email touches from ICP conversion intelligence when the engine populated them — grouped by ICP tier. */
function buildIcpEmailTouchesAppendix(diagnosticData: Record<string, unknown>): string {
  const raw = diagnosticData.icpConversionIntelligenceFramework;
  const fw = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
  if (!fw) return "";
  const mts = fw.multiTouchConversionSequence;
  if (!Array.isArray(mts)) return "";
  const byTier: string[] = [];

  for (const rawBlock of mts) {
    const b =
      rawBlock && typeof rawBlock === "object" && !Array.isArray(rawBlock)
        ? (rawBlock as Record<string, unknown>)
        : null;
    if (!b) continue;
    const icpTier = String(b.icpTier ?? "ICP").trim() || "ICP";
    const sequence = b.sequence;
    if (!Array.isArray(sequence)) continue;
    const emailChunks: string[] = [];

    for (const step of sequence) {
      const s = step && typeof step === "object" && !Array.isArray(step) ? (step as Record<string, unknown>) : null;
      if (!s) continue;
      const ch = String(s.channel ?? "").toLowerCase();
      if (!ch.includes("email")) continue;
      const title = String(s.touchType ?? "Email touch").trim();
      const orderLabel = typeof s.order === "number" ? `Step ${s.order}` : "Touch";
      const subj = String(s.headlineOrSubject ?? "").trim();
      const sub = String(s.subhead ?? "").trim();
      const body = String(s.primaryCopy ?? "").trim();
      const cta = String(s.cta ?? "").trim();
      const img = String(s.imagePrompt ?? "").trim();
      const vid = String(s.videoPrompt ?? "").trim();
      const lines: string[] = [`${title} · ${orderLabel}`, ""];
      if (subj) lines.push(`- **Subject line:** ${subj}`);
      if (sub) lines.push(`- **Preheader (inbox preview):** ${sub}`);
      if (body) {
        lines.push("- **Body (paste-ready):**", "", body);
      }
      if (cta) lines.push(`- **Primary CTA:** ${cta}`);
      if (img) lines.push(`- **Hero image prompt:** ${img}`);
      if (vid) lines.push(`- **Video prompt:** ${vid}`);
      if (typeof s.performanceRationale === "string" && s.performanceRationale.trim()) {
        lines.push(`- **Why it works:** ${String(s.performanceRationale).trim()}`);
      }
      if (lines.length > 1) emailChunks.push(lines.join("\n"));
    }

    if (emailChunks.length === 0) continue;
    byTier.push(
      [
        `## ICP: ${icpTier}`,
        "",
        "_Only **email** steps from this ICP’s multi-touch sequence appear here. Other channels (LinkedIn, etc.) stay in your PDF and Strategy views._",
        "",
        emailChunks.join("\n\n"),
      ].join("\n"),
    );
  }

  if (!byTier.length) return "";
  return [
    "## ICP-specific email touches (conversion intelligence)",
    "",
    "Organized **by ICP tier** (Primary, Secondary, …). Each **ICP:** section below is one tier. Within a tier, each block starts with the touch name, then **subject line** → **preheader** (inbox preview, not a second subject) → **body** → CTAs and prompts.",
    "",
    ...byTier,
  ].join("\n\n");
}

function buildEmailLifecycleHowToReadMarkdown(): string {
  return [
    "## How to read this email plan",
    "",
    "Up to **three layers** appear in this view (use the **On This page** chips to jump). They are independent sources — not three subject lines for one email.",
    "",
    "1. **Report notes** — Email channel copy from your export when the engine filled `channelPlans.email`.",
    "2. **ICP-specific touches** — From your conversion intelligence, **grouped by ICP tier**. Only email-channel steps are listed.",
    "3. **Starter nurture sequence** — Paste-ready lifecycle emails (`## Email 1 …` onward). Each block is **one** email: **subject line** → **preheader** (the short inbox preview line; **not** a second subject) → body → image prompt → CTAs.",
    "",
    "### Where to edit and export",
    "- **Update copy:** **Workbook** → Channel notes (and version history). Regenerate the report when you want a full engine rewrite from inputs.",
    "- **All activation sections at once:** **Download activation pack (.md)** on this tab.",
    "- **PDFs and bundles:** **Downloads** tab.",
    "- **Single plan PDF:** open **Open plan** for a channel, then **Download plan (PDF)** on that page.",
  ].join("\n");
}

function pickEmailLifecycleBody(
  diagnosticData: Record<string, unknown>,
  d: ReturnType<typeof extractActivationDerivatives>,
): string {
  const e = typeof d.channelPlans.email === "string" ? d.channelPlans.email.trim() : "";
  const developed = buildDevelopedEmailPlan(developedContextFromD(d));
  const icpAppendix = buildIcpEmailTouchesAppendix(diagnosticData);
  const guide = buildEmailLifecycleHowToReadMarkdown();
  /** If the report already shipped a very long email playbook, avoid duplicating the developed pack. */
  const REPORT_EMAIL_COMPLETE_MIN = 2800;
  if (e.length >= REPORT_EMAIL_COMPLETE_MIN) {
    return [guide, e, icpAppendix].filter((x) => x.trim().length > 0).join("\n\n---\n\n");
  }

  const fragments: string[] = [guide];

  if (isBlueprintPlusTier(diagnosticData) && e.length === 0) {
    fragments.push(
      [
        "## Generation notes",
        "",
        blueprintPlusEmptyBlockMessage(d.companyName, "Email lifecycle"),
        "",
        "_The starter sequence below is generated so you still leave with paste-ready copy; regenerate the report if you expected populated channel notes._",
      ].join("\n"),
    );
  } else if (e.length === 0 && !isBlueprintPlusTier(diagnosticData)) {
    fragments.push(
      [
        "## Context",
        "",
        `Lifecycle email plan focused on ${d.firstPriority.toLowerCase()} — starter copy follows.`,
      ].join("\n"),
    );
  }

  if (e.length > 0) {
    fragments.push(`## From your report (channelPlans.email)\n\n${e}`);
  }
  if (icpAppendix.trim()) fragments.push(icpAppendix);
  if (developed.trim()) fragments.push(developed);

  return fragments.filter((x) => x.trim().length > 0).join("\n\n---\n\n");
}

function pickSeoAeoBody(
  diagnosticData: Record<string, unknown>,
  d: ReturnType<typeof extractActivationDerivatives>,
): string {
  const a =
    (typeof d.channelPlans["content-seo"] === "string" && d.channelPlans["content-seo"].trim()) ||
    (typeof d.channelPlans.seo === "string" && d.channelPlans.seo.trim()) ||
    (typeof d.channelPlans.aeo === "string" && d.channelPlans.aeo.trim()) ||
    "";
  const developed = buildDevelopedSeoAeoPlan(developedContextFromD(d));
  const SEO_COMPLETE_MIN = 2200;
  if (a.length >= SEO_COMPLETE_MIN) return a;
  if (a.length > 0) {
    return [a, developed].join("\n\n---\n\n");
  }
  if (isBlueprintPlusTier(diagnosticData)) {
    return [blueprintPlusEmptyBlockMessage(d.companyName, "SEO & AI discovery"), "", developed].join("\n\n");
  }
  return [
    `Publish intent-mapped pages answering top ${d.industry.toLowerCase()} questions from ${d.audienceShort}, each tied to ${d.firstPriority.toLowerCase()} and a single conversion path.`,
    "",
    developed,
  ].join("\n\n");
}

const PR_VISIBILITY_COMPLETE_MIN_CHARS = 2000;

function pickPrVisibilityBody(
  diagnosticData: Record<string, unknown>,
  d: ReturnType<typeof extractActivationDerivatives>,
): string {
  const pr =
    (typeof d.channelPlans.pr === "string" && d.channelPlans.pr.trim()) ||
    (typeof d.channelPlans.visibility === "string" && d.channelPlans.visibility.trim()) ||
    "";
  const developed = buildDevelopedPrPlan(developedContextFromD(d));
  if (pr.length >= PR_VISIBILITY_COMPLETE_MIN_CHARS) return pr;
  if (pr.length > 0) return appendDevelopedPack(pr, developed, PR_VISIBILITY_COMPLETE_MIN_CHARS);
  if (isBlueprintPlusTier(diagnosticData)) {
    return appendDevelopedPack(
      blueprintPlusEmptyBlockMessage(d.companyName, "PR & visibility"),
      developed,
      PR_VISIBILITY_COMPLETE_MIN_CHARS,
    );
  }
  const baseline = `Create quarterly PR hooks tied to measurable outcomes from ${d.thirdPriority.toLowerCase()}. Prioritize placements where ${d.audienceShort} already evaluates vendors and strategic partners.`;
  return appendDevelopedPack(baseline, developed, PR_VISIBILITY_COMPLETE_MIN_CHARS);
}

function buildLeadMagnetSectionBody(
  diagnosticData: Record<string, unknown>,
  d: ReturnType<typeof extractActivationDerivatives>,
): string {
  const lm = typeof d.channelPlans["lead-magnet"] === "string" ? d.channelPlans["lead-magnet"].trim() : "";
  if (lm.length > 80) return lm;
  const developed = buildDevelopedLeadMagnetPlan(developedContextFromD(d));
  const cn = d.companyName;
  const p1 = d.firstPriority.toLowerCase();
  const p2 = d.secondPriority.toLowerCase();
  const aud = d.audienceShort;
  const scaffold = [
    "## Lead magnet strategy",
    "",
    `**${cn}** uses one flagship asset per priority segment so you can accelerate **${p1}** and support **${p2}** without inventing a new promise every week.`,
    "",
    "### Core offer — alignment kit (PDF)",
    "",
    `**Working title**  \nThe 14-day owner map + ${p1} checklist`,
    "",
    "**Promise (use on the landing page)**  \nIn about twelve minutes, your reader sees three fixes they can ship this month without a rebrand—plus who owns each surface.",
    "",
    "**Format**  \nPDF, eight to twelve pages, plus a one-page worksheet they can print.",
    "",
    "### Segment versions (same spine, different opening page)",
    "",
    `**${aud} (practitioners)** — Lead with a practical guide: step-by-step checks, screenshots or diagrams, and one implementation action in the conclusion.`,
    "",
    "**Operators and champions** — Ship a template pack or worksheet that mirrors how work already happens in their tools (calendar, CRM, or project board).",
    "",
    "**Executive stakeholders** — Add a two-page executive brief up front: risk removed, decision criteria, and the single metric window you will report against.",
    "",
    "### Landing page copy (paste-ready)",
    "",
    `**H1**  \nDownload the ${p1} alignment kit`,
    "",
    `**Subhead**  \nBuilt for ${aud}: one storyline across ad, landing page, and first email—without another “strategy offsite.”`,
    "",
    "**Body (short)**  \nYou will get the owner map, the message-channel checklist, and the proof strip your sales team can reuse in slide one. We never ask for more than work email + company; instant delivery after opt-in.",
    "",
    "**Primary button**  \nDownload the kit",
    "",
    "**Secondary link**  \nBook a 20-minute scope fit",
    "",
    "### Thank-you + nurture (paste-ready)",
    "",
    "**Email 1 — instant delivery**  \nSubject: Your kit + the one move we would make first  \nPreheader: The checklist is attached—start with item one today.  \nBody: Thanks for downloading the alignment kit. Open the PDF to page two and complete the owner map in pencil first; it keeps the conversation honest. If you want a two-minute Loom walkthrough, reply with the word “loom” and we will send one.  \nCTA button: Open the kit",
    "",
    "**Email 2 — day 3**  \nSubject: The proof block your peers asked for  \nBody: Here is the anonymized before/after we discussed in the kit, with the footnote on how we counted the metric. Same storyline as your ad team is testing—use it on the landing page hero this week.  \nCTA: Read the proof one-pager",
    "",
    "**Email 3 — day 7**  \nSubject: Ready for a scope fit?  \nBody: If the checklist surfaced a gap you cannot close internally, book twenty minutes. We will confirm the metric window, assign owners, and show you the kickoff agenda—no generic pitch deck.  \nCTA: Pick a time",
    "",
    "### Messaging alignment & success checks",
    "",
    "Primary magnet message must match the segment belief row in your messaging matrix; reuse the same stats and case framing in social, paid, and nurture. Map the asset to funnel stage: **awareness** magnet → **consideration** nurture → **decision** CTA.",
    "",
    "Measure opt-in rate by segment and channel, nurture progression (opens, clicks, worksheet completion), and downstream pipeline actions tied to this asset.",
  ].join("\n");
  const base = isBlueprintPlusTier(diagnosticData)
    ? blueprintPlusEmptyBlockMessage(d.companyName, "Lead magnet & conversion")
    : scaffold;
  return appendDevelopedPack(base, developed, 4000);
}

export function buildActivationPlanSectionsList(
  diagnosticData: Record<string, unknown>,
  scheduleRowsCount: number,
): ActivationPlanSection[] {
  const d = extractActivationDerivatives(diagnosticData);
  const {
    companyName,
    industry,
    primaryPillar,
    firstPriority,
    secondPriority,
    thirdPriority,
    buyerJourneySummary,
    competitiveMatrixSummary,
    channelPlans,
    activationSegmentPlansBody,
    activationRoadmapPlansBody,
    audienceSummary,
    audienceShort,
  } = d;

  const tierBp = isBlueprintPlusTier(diagnosticData);
  const ctx = developedContextFromD(d);
  const thoughtBody = appendDevelopedPack(
    pickSocialThoughtLeadershipBody(diagnosticData, d),
    buildDevelopedThoughtLeadershipPack(ctx),
    2600,
  );
  const paidBody = appendDevelopedPack(
    pickPaidAdsBody(diagnosticData, d),
    buildDevelopedPaidCreativesPack(ctx),
    4200,
  );

  const audienceBase =
    activationSegmentPlansBody ||
    (tierBp
      ? blueprintPlusEmptyBlockMessage(companyName, "Audience segments & triggers")
      : `Primary audience: ${audienceSummary}. Build segment-level trigger points (intent signal, engagement signal, buying-stage signal) and map each trigger to one campaign objective for ${companyName}.`);
  const audienceBody = appendDevelopedPack(audienceBase, buildDevelopedAudiencePlan(ctx), 2600);
  const journeyBody = appendDevelopedPack(buyerJourneySummary, buildDevelopedJourneyPlan(ctx), 2400);
  const competitiveBody = appendDevelopedPack(
    competitiveMatrixSummary,
    buildDevelopedCompetitivePlan(ctx),
    2600,
  );
  const roadmapBase =
    activationRoadmapPlansBody ||
    (tierBp && scheduleRowsCount === 0
      ? blueprintPlusEmptyBlockMessage(companyName, "90-day roadmap")
      : scheduleRowsCount > 0
        ? `Current schedule has ${scheduleRowsCount} planned items. Phase 1: ${firstPriority}. Phase 2: ${secondPriority}. Phase 3: ${thirdPriority}. Review owners, due windows, and bottlenecks weekly.`
        : `Define a 30/60/90 plan: (30) ${firstPriority}, (60) ${secondPriority}, (90) ${thirdPriority}, each with owner, due date, dependency, and success check.`);
  const executionBody = appendDevelopedPack(roadmapBase, buildDevelopedExecutionRoadmap(ctx), 2200);

  return [
    {
      id: "audience-segments",
      label: "Audience Segments & Journey Triggers",
      summary: activationSegmentPlansBody
        ? "ICP tiers, personas, and segment-level plays from your conversion intelligence."
        : "Who each campaign is for and what event should trigger outreach.",
      body: audienceBody,
      workbookSectionId: "audience-profile",
    },
    {
      id: "journey-orchestration",
      label: "Journey Orchestration",
      summary:
        typeof diagnosticData.buyerJourneySummary === "string" && diagnosticData.buyerJourneySummary.trim()
          ? "Stage-by-stage journey with persona-specific adaptations from your customer journey map."
          : "Stage-aware sequencing across channels and lifecycle touchpoints.",
      body: journeyBody,
      workbookSectionId: "buyer-journey-map",
    },
    {
      id: "competitive-motion-plan",
      label: "Competitive Motion Plan",
      summary:
        typeof diagnosticData.competitiveMatrixSummary === "string" && diagnosticData.competitiveMatrixSummary.trim()
          ? "Differentiation, whitespace, and competitive motion pulled from your positioning analysis."
          : "How campaigns and sales motion respond to competitive pressure.",
      body: competitiveBody,
      workbookSectionId: "competitive-landscape-matrix",
    },
    {
      id: "lead-magnet-planning",
      label: "Lead Magnet Planning",
      summary:
        typeof channelPlans["lead-magnet"] === "string" && channelPlans["lead-magnet"].length > 80
          ? "CTA hierarchy, persona lead magnets, and conversion matrix from your Blueprint+ conversion strategy."
          : tierBp
            ? "Lead capture path from your conversion strategy (or regenerate if this export is empty)."
            : "Conversion asset plan linking ICP intent to offer, CTA, and nurture entry.",
      body: buildLeadMagnetSectionBody(diagnosticData, d),
      workbookSectionId: "channel-notes",
    },
    {
      id: "email-lifecycle",
      label: "Email Lifecycle Plan",
      summary:
        typeof channelPlans.email === "string" && channelPlans.email.length > 120
          ? "Welcome, nurture, and re-engagement sequences with subject lines and CTAs from your email framework."
          : "Campaign sequencing by stage (welcome, follow-up, conversion, re-engagement).",
      body: pickEmailLifecycleBody(diagnosticData, d),
      workbookSectionId: "channel-notes",
    },
    {
      id: "seo-aeo",
      label: "Search & AI Discovery Plan",
      summary:
        (typeof channelPlans["content-seo"] === "string" && channelPlans["content-seo"].length > 120) ||
        (typeof channelPlans.seo === "string" && channelPlans.seo.length > 120)
          ? "Keyword/page targets plus AI-discovery (AEO) priorities from your SEO + AEO strategy."
          : "Topic clusters, search-intent mapping, and visibility in search and AI results.",
      body: pickSeoAeoBody(diagnosticData, d),
      workbookSectionId: "channel-notes",
    },
    {
      id: "paid-ads",
      label: "Paid Ads Plan",
      summary:
        (typeof channelPlans.ads === "string" && channelPlans.ads.length > 80) ||
        (typeof channelPlans.campaigns === "string" && channelPlans.campaigns.length > 80)
          ? "Channel objectives, creative angles, and budget scenarios from your paid media strategy."
          : "Audience-targeted campaigns, message tests, and landing-page flow.",
      body:
        paidBody ||
        `Test 2-3 ad angles around ${primaryPillar.toLowerCase()} outcomes. Route clicks to dedicated landing pages aligned to ${secondPriority.toLowerCase()} with stage-specific next step language.`,
      workbookSectionId: "channel-notes",
    },
    {
      id: "thought-leadership",
      label: "Thought Leadership Plan",
      summary:
        (typeof channelPlans.social === "string" && channelPlans.social.length > 120) ||
        (typeof channelPlans.content === "string" && channelPlans.content.length > 120)
          ? "Social & content calendar from your report: platforms, example posts, and themes."
          : "Social media plan: channel scope, content system, publishing cadence, and governance.",
      body:
        thoughtBody ||
        `Build a social plan around ${firstPriority.toLowerCase()} and ${secondPriority.toLowerCase()}, using ICP-aware channels and one measurable CTA per post.`,
      workbookSectionId: "channel-notes",
    },
    {
      id: "pr-plan",
      label: "PR & Visibility Plan",
      summary:
        (typeof channelPlans.pr === "string" && channelPlans.pr.length > 80) ||
        (typeof channelPlans.visibility === "string" && channelPlans.visibility.length > 80)
          ? "Media angles, hooks, and speaking lines from your thought leadership & PR plan."
          : "Narrative hooks, media motions, and credibility amplification moments.",
      body: pickPrVisibilityBody(diagnosticData, d),
      workbookSectionId: "channel-notes",
    },
    {
      id: "execution-roadmap",
      label: "90-Day Execution Roadmap",
      summary: "Phased weeks, tasks, and deliverables from your 90-day roadmap.",
      body: executionBody,
      workbookSectionId: "action-plan",
    },
  ];
}

export const ACTIVATION_SECTION_ICON_TOKEN: Record<string, string> = {
  "audience-segments": "audience",
  "journey-orchestration": "journey",
  "competitive-motion-plan": "competitive",
  "lead-magnet-planning": "messaging",
  "email-lifecycle": "email",
  "seo-aeo": "seo",
  "paid-ads": "paid",
  "thought-leadership": "thought",
  "pr-plan": "pr",
  "execution-roadmap": "roadmap",
};

export const ACTIVATION_SECTION_THEME: Record<string, { tint: string }> = {
  "audience-segments": { tint: "#F7FBFF" },
  "journey-orchestration": { tint: "#F0F9FF" },
  "competitive-motion-plan": { tint: "#F8FAFC" },
  "lead-magnet-planning": { tint: "#F7FBFF" },
  "email-lifecycle": { tint: "#F5F9FF" },
  "seo-aeo": { tint: "#F0F9FF" },
  "paid-ads": { tint: "#F8FBFF" },
  "thought-leadership": { tint: "#F5F8FF" },
  "pr-plan": { tint: "#F7FBFF" },
  "execution-roadmap": { tint: "#F3FAFC" },
};
