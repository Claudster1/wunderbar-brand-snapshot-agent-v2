import type { WorkbookSectionId } from "@/lib/workbookTypes";

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
  const platformsToUse = (selectedPlatforms.length ? selectedPlatforms : candidatePlatforms.slice(0, 3))
    .map((item, index) => {
      const priority = index === 0 ? "Primary" : "Secondary";
      const cadence = index === 0 ? "3x/week" : "2x/week";
      return `- ${item.name} (${priority}, ${cadence}) - ${item.reason}`;
    })
    .join("\n");
  const personaSection = personaLines.length
    ? personaLines.map((line) => `- ${line}`).join("\n")
    : `- Primary audience: ${opts.audienceSummary}\n- Supporting audience: operators and stakeholders influencing final selection.`;

  return [
    "Social Media Plan",
    `Business context: ${opts.companyName} in ${opts.industry}.`,
    "",
    "1) Goals and objectives",
    `- Goal 1: Increase qualified social traffic from ${opts.audienceShort} by 25-35% in 90 days.`,
    `  KPI: Sessions from social + qualified lead actions. Target: sustained MoM growth tied to ${opts.firstPriority.toLowerCase()}.`,
    `- Goal 2: Improve engagement quality around ${opts.primaryPillar.toLowerCase()} themes.`,
    "  KPI: Save/share/comment quality, profile visits, and CTA clicks by post type.",
    `- Goal 3: Build conversion-ready demand for ${opts.secondPriority.toLowerCase()}.`,
    "  KPI: CTA click-through rate and downstream conversion by campaign theme.",
    "",
    "2) Audience definition (ICP and personas)",
    personaSection,
    "",
    "3) Platform strategy",
    platformsToUse,
    "- Platforms not in scope: deprioritize low-signal channels until core cadence is stable for 6-8 weeks.",
    "",
    "4) Content strategy",
    `- Pillar A (40%): ${opts.firstPriority}`,
    `- Pillar B (35%): ${opts.secondPriority}`,
    `- Pillar C (25%): ${opts.thirdPriority}`,
    `- Tone: clear, evidence-backed, practical. Avoid generic claims without proof tied to ${opts.primaryPillar.toLowerCase()}.`,
    "",
    "5) Weekly content sprint structure",
    "- Week rhythm: 3-5 posts total across priority channels.",
    "- Each post includes: Hook -> insight/proof -> one clear CTA.",
    "- Status flow: Draft -> Review -> Approved -> Scheduled -> Live.",
    "",
    "6) Community management",
    "- Comment SLA: within 4 business hours.",
    "- DM SLA: within 24 hours.",
    "- Escalate: product complaints, legal risk, media requests, or rapid negative spikes.",
    "",
    "7) Paid social alignment",
    "- Amplify only posts with strong organic engagement and CTA clicks.",
    "- Run persona-specific variants by stage (awareness, consideration, decision).",
    "- Budget split guideline: 70% proven message themes, 30% creative/testing.",
    "",
    "8) Analytics and reporting",
    "- Weekly: engagement quality, posting consistency, top CTA performance.",
    "- Monthly: traffic quality, conversion contribution, creative fatigue signals.",
    "- Quarterly: platform audit and resource reallocation.",
    "",
    "9) Governance and operations",
    "- Strategy owner: approves priorities and success checks.",
    "- Content owner: drafts and iterates assets.",
    "- Approver: final brand and compliance review before publish.",
    "- Review cadence: monthly performance review, quarterly strategy reset.",
    "",
    "10) 90-day rollout calendar (social + content)",
    "- Days 1–30 — Establish: lock pillar mix (40/35/25), ship 3 pillar “anchor” posts per week, test 2 hook formats per channel, stand up UTM + weekly metrics sheet.",
    "- Days 31–60 — Scale: double down on top 2 themes by saves/clicks; add one new format (carousel, short video, or thread); introduce light paid boost on best organic.",
    "- Days 61–90 — Optimize: cut bottom 25% of posts by engagement quality; run a month-long narrative arc tied to " +
      opts.secondPriority.toLowerCase() +
      "; document a repeatable monthly content kit.",
    "- Cadence target across 90 days: minimum 36–45 published assets across priority platforms (adjust for team size).",
    "",
    "11) Full-funnel alignment (social ↔ demand)",
    "- TOFU posts: pain, POV, and education — CTA to follow, save, or soft resource.",
    "- MOFU posts: proof, comparisons (ethical), customer moments — CTA to guide, webinar, or case.",
    "- BOFU posts: offer, urgency (truthful), implementation clarity — CTA to book, buy, or talk to sales.",
    "- Every month, ensure at least one post per funnel stage per primary platform.",
    "",
    opts.socialSeed || socialSignals
      ? `Channel intelligence source (from your report)\n${opts.socialSeed || socialSignals}`
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
  return [
    `Paid media execution plan — ${d.companyName}`,
    "",
    "1) Objectives (pick one primary per flight)",
    `- Awareness: reach ${d.audienceShort} with a clear problem/solution hook tied to ${d.firstPriority.toLowerCase()}.`,
    `- Consideration: drive engaged clicks to proof-rich landing experiences supporting ${d.secondPriority.toLowerCase()}.`,
    `- Conversion: capture intent with offer + CTA aligned to ${d.thirdPriority.toLowerCase()}.`,
    "",
    "2) Audience & targeting",
    `- Core ICP: ${d.audienceSummary}`,
    "- Build 2–3 ad sets: broad (interest/keyword), engaged (site visitors / engagers), and retargeting (7–30 day).",
    "- Exclude converters and low-quality placements; refresh exclusions monthly.",
    "",
    "3) Creative angles (run as distinct concepts, 2–3 per stage)",
    `- Angle A — Outcome: lead with measurable outcome language for ${p}.`,
    `- Angle B — Proof: testimonial, metric, or mini case framed for ${d.industry.toLowerCase()} buyers.`,
    `- Angle C — Contrast: vs. status quo or generic alternative (no competitor naming unless legally cleared).`,
    "",
    "4) Landing pages & post-click",
    `- Every ad goes to a dedicated landing path (not homepage) that repeats the ad promise in the headline.`,
    `- One primary CTA above the fold; secondary CTA only after proof block.`,
    `- Match ${d.secondPriority.toLowerCase()} on-page: same vocabulary as ads and email.`,
    "",
    "5) Budget & flight (starter pattern)",
    "- Week 1–2: 60% spend on creative learning (broad + engaged), 40% retargeting.",
    "- Week 3–4: shift 70% to winning angles + audiences; kill bottom 30% by CTR and CPL.",
    "- If spend is constrained: one channel only (e.g. Meta or LinkedIn) until CPA stabilizes.",
    "",
    "6) Measurement",
    "- Track: CTR, CPC, landing CTR, form/start rate, qualified lead rate, pipeline influence (if B2B).",
    "- Weekly: creative + audience leaderboard; pause anything 2× worse than account average after ~3k impressions.",
    "",
    "7) Guardrails",
    "- No new offers mid-flight without duplicating the ad set (keeps learning clean).",
    "- Brand: tone and claims must match your documented voice and ${p} positioning.",
    "",
    "When your Blueprint+ export includes paid media strategy, this block is replaced with that detailed playbook.",
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

function buildFullFunnelEmailLifecycleScaffold(d: ReturnType<typeof extractActivationDerivatives>): string {
  const a = d.audienceShort;
  const fp = d.firstPriority.toLowerCase();
  const sp = d.secondPriority.toLowerCase();
  const tp = d.thirdPriority.toLowerCase();
  return [
    "Email nurture — full funnel (scaffold)",
    "",
    "### Awareness (emails 1–2)",
    `- Email 1 — Subject: [Specific question about ${a}'s bottleneck]`,
    `  Purpose: Open with a recognizable pain; introduce your POV on ${fp} without a hard pitch.`,
    `- Email 2 — Subject: [Proof you understand their world]`,
    `  Purpose: One credible proof point or micro-story; bridge toward ${sp}.`,
    "",
    "### Consideration (emails 3–5)",
    "- Email 3 — Trust / risk objection; show governance, process, or safety.",
    "- Email 4 — Outcome proof: customer, metric, or before/after (specifics).",
    "- Email 5 — Decision criteria: how to evaluate options ethically; favor your methodology.",
    "",
    "### Decision (emails 6–7)",
    "- Email 6 — Offer clarity: deliverables, timeline, who it fits / who it does not.",
    "- Email 7 — Honest urgency (capacity, cohort, or seasonal) + single primary CTA.",
    "",
    "### Retention & re-engagement (email 8+)",
    `- Customers: new tips, roadmap, and upsell only when value is obvious.`,
    `- Cold leads: fresh POV on ${tp} with a low-friction re-entry CTA.`,
    "",
    "### 12-week operational rhythm",
    "- Weeks 1–4: up to 2 emails/week (education + proof).",
    "- Weeks 5–8: 1–2 emails/week (deeper cases + offer ramp).",
    "- Weeks 9–12: refresh underperforming subject lines; pause series lines below ~12% open after 3 sends.",
  ].join("\n");
}

function pickEmailLifecycleBody(
  diagnosticData: Record<string, unknown>,
  d: ReturnType<typeof extractActivationDerivatives>,
): string {
  const e = typeof d.channelPlans.email === "string" ? d.channelPlans.email.trim() : "";
  const scaffold = buildFullFunnelEmailLifecycleScaffold(d);
  const MIN_EMAIL_BEFORE_SCAFFOLD = 600;
  if (e.length >= MIN_EMAIL_BEFORE_SCAFFOLD) return e;
  if (e.length > 0) {
    return [e, "", "---", "", scaffold].join("\n");
  }
  if (isBlueprintPlusTier(diagnosticData)) {
    return [blueprintPlusEmptyBlockMessage(d.companyName, "Email lifecycle"), "", scaffold].join("\n");
  }
  return [
    `Lifecycle email plan focused on ${d.firstPriority.toLowerCase()} — use the sequence below as your default spine.`,
    "",
    scaffold,
  ].join("\n");
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
  if (a.length > 0) return a;
  if (isBlueprintPlusTier(diagnosticData)) {
    return blueprintPlusEmptyBlockMessage(d.companyName, "SEO & AI discovery");
  }
  return `Publish intent-mapped pages answering top ${d.industry.toLowerCase()} questions from ${d.audienceShort}, each tied to ${d.firstPriority.toLowerCase()} and a single conversion path.`;
}

function pickPrVisibilityBody(
  diagnosticData: Record<string, unknown>,
  d: ReturnType<typeof extractActivationDerivatives>,
): string {
  const pr =
    (typeof d.channelPlans.pr === "string" && d.channelPlans.pr.trim()) ||
    (typeof d.channelPlans.visibility === "string" && d.channelPlans.visibility.trim()) ||
    "";
  if (pr.length > 0) return pr;
  if (isBlueprintPlusTier(diagnosticData)) {
    return blueprintPlusEmptyBlockMessage(d.companyName, "PR & visibility");
  }
  return `Create quarterly PR hooks tied to measurable outcomes from ${d.thirdPriority.toLowerCase()}. Prioritize placements where ${d.audienceShort} already evaluates vendors and strategic partners.`;
}

function buildLeadMagnetSectionBody(
  diagnosticData: Record<string, unknown>,
  d: ReturnType<typeof extractActivationDerivatives>,
): string {
  const lm = typeof d.channelPlans["lead-magnet"] === "string" ? d.channelPlans["lead-magnet"].trim() : "";
  if (lm.length > 80) return lm;
  if (isBlueprintPlusTier(diagnosticData)) {
    return blueprintPlusEmptyBlockMessage(d.companyName, "Lead magnet & conversion");
  }
  return [
    `Lead magnet strategy for ${d.companyName}`,
    "",
    "1) Core objective",
    `- Use one lead magnet per priority segment to accelerate ${d.firstPriority.toLowerCase()} and support ${d.secondPriority.toLowerCase()}.`,
    "",
    "2) Segment-aligned recommendations",
    `- Segment 1 (${d.audienceShort}): Practical guide/checklist with immediate implementation steps.`,
    "- Segment 2 (operators/champions): Template pack or worksheet tied to execution workflows.",
    "- Segment 3 (decision stakeholders): Executive brief focused on risk reduction and measurable outcomes.",
    "",
    "3) Offer placeholders (fill before launch)",
    "- Working title: [Outcome-driven lead magnet title]",
    "- Promise: [What the reader gets in 10-15 minutes]",
    "- Format: [PDF guide | checklist | worksheet | mini playbook]",
    "- Primary CTA: [Download / Get the framework / Access the guide]",
    "- Delivery path: [Landing page -> form -> thank-you -> nurture email #1]",
    "",
    "4) Messaging matrix alignment",
    "- Primary message must match the segment's core belief from the matrix.",
    "- Supporting proof should reuse the same stats/case framing used across social, email, and paid.",
    "- Funnel stage mapping: Awareness magnet -> Consideration nurture -> Decision CTA.",
    "",
    "5) Nurture handoff",
    "- Email 1: Deliver asset + one implementation action.",
    "- Email 2: Add proof/case evidence tied to the same promise.",
    "- Email 3: Decision CTA mapped to activation offer or consult step.",
    "",
    "6) Success checks",
    "- Opt-in conversion rate by segment and channel source.",
    "- Nurture progression (open/click/step completion).",
    "- Downstream conversion from magnet to pipeline action.",
  ].join("\n");
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
  const thoughtBody = pickSocialThoughtLeadershipBody(diagnosticData, d);
  const paidBody = pickPaidAdsBody(diagnosticData, d);

  return [
    {
      id: "audience-segments",
      label: "Audience Segments & Journey Triggers",
      summary: activationSegmentPlansBody
        ? "ICP tiers, personas, and segment-level plays from your conversion intelligence."
        : "Who each campaign is for and what event should trigger outreach.",
      body:
        activationSegmentPlansBody ||
        (tierBp
          ? blueprintPlusEmptyBlockMessage(companyName, "Audience segments & triggers")
          : `Primary audience: ${audienceSummary}. Build segment-level trigger points (intent signal, engagement signal, buying-stage signal) and map each trigger to one campaign objective for ${companyName}.`),
      workbookSectionId: "audience-profile",
    },
    {
      id: "journey-orchestration",
      label: "Journey Orchestration",
      summary:
        typeof diagnosticData.buyerJourneySummary === "string" && diagnosticData.buyerJourneySummary.trim()
          ? "Stage-by-stage journey with persona-specific adaptations from your customer journey map."
          : "Stage-aware sequencing across channels and lifecycle touchpoints.",
      body: buyerJourneySummary,
      workbookSectionId: "buyer-journey-map",
    },
    {
      id: "competitive-motion-plan",
      label: "Competitive Motion Plan",
      summary:
        typeof diagnosticData.competitiveMatrixSummary === "string" && diagnosticData.competitiveMatrixSummary.trim()
          ? "Differentiation, whitespace, and competitive motion pulled from your positioning analysis."
          : "How campaigns and sales motion respond to competitive pressure.",
      body: competitiveMatrixSummary,
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
      body:
        activationRoadmapPlansBody ||
        (tierBp && scheduleRowsCount === 0
          ? blueprintPlusEmptyBlockMessage(companyName, "90-day roadmap")
          : scheduleRowsCount > 0
            ? `Current schedule has ${scheduleRowsCount} planned items. Phase 1: ${firstPriority}. Phase 2: ${secondPriority}. Phase 3: ${thirdPriority}. Review owners, due windows, and bottlenecks weekly.`
            : `Define a 30/60/90 plan: (30) ${firstPriority}, (60) ${secondPriority}, (90) ${thirdPriority}, each with owner, due date, dependency, and success check.`),
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
