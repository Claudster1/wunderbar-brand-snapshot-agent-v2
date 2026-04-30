import type { ProductTier } from "@/components/ResultsTabNav";
import type { TabSectionMenuItem } from "@/components/results/TabSectionMenu";
import { filterStrategySections, showStrategyPlanNarrativePanels } from "@/components/results/tabConfig";
import { buildAudienceProfilesBody, buildCustomerProfilesDeepBody } from "@/lib/strategy/audienceNarrative";
import { collectStrategyPlanSections, joinAsStrategyBullets } from "@/lib/strategy/strategyPlanExtract";
import { buildStrategicOfferPlanBody } from "@/lib/strategy/strategicOfferPlan";
import type { WorkbookSectionId } from "@/lib/workbookTypes";

function asRecordLoose(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function formatMessagingSystemBody(ms: Record<string, unknown> | null, fallback: string): string {
  if (!ms) return fallback;
  const core = typeof ms.coreMessage === "string" ? ms.coreMessage.trim() : "";
  const sup = Array.isArray(ms.supportingMessages)
    ? ms.supportingMessages.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    : [];
  const proof = Array.isArray(ms.proofPoints)
    ? ms.proofPoints.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    : [];
  if (!core && sup.length === 0 && proof.length === 0) return fallback;
  const parts: string[] = [];
  if (core) parts.push(`Core message\n${core}`);
  if (sup.length) parts.push(`Supporting messages\n${sup.map((s) => `• ${s}`).join("\n")}`);
  if (proof.length) parts.push(`Proof points\n${proof.map((s) => `• ${s}`).join("\n")}`);
  return parts.join("\n\n");
}

function firstNWords(input: string, count: number): string {
  const words = input.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  return words.slice(0, count).join(" ");
}

/**
 * Section jump targets for the Strategy tab — shared by `ResultsTabsShell` (chips) and `StrategyTab` (sidebar + body).
 * Must stay in sync with panel ids rendered in `StrategyTab`.
 */
export function buildStrategyNavMenuItems(
  productTier: ProductTier,
  diagnosticData: Record<string, unknown>,
): TabSectionMenuItem[] {
  const positioningMessaging =
    typeof diagnosticData.positioningMessagingFramework === "string"
      ? diagnosticData.positioningMessagingFramework
      : typeof diagnosticData.topOpportunity === "string"
        ? diagnosticData.topOpportunity
        : "";
  const topOpportunity =
    typeof diagnosticData.topOpportunity === "string" ? diagnosticData.topOpportunity : "";
  const targetAudience =
    typeof diagnosticData.targetAudience === "string" ? diagnosticData.targetAudience : "";
  const audienceShort = firstNWords(targetAudience, 8).toLowerCase() || "decision-makers";
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
  const topStrength =
    Array.isArray(diagnosticData.topStrengths) && diagnosticData.topStrengths.length > 0
      ? String(diagnosticData.topStrengths[0])
      : "strategic clarity";
  const topGap =
    Array.isArray(diagnosticData.topGaps) && diagnosticData.topGaps.length > 0
      ? String(diagnosticData.topGaps[0])
      : "message consistency";
  const channelPlans =
    (diagnosticData.channelPlans as Record<string, string> | undefined) ?? {};
  const topStrengths =
    Array.isArray(diagnosticData.topStrengths) && diagnosticData.topStrengths.length > 0
      ? diagnosticData.topStrengths.slice(0, 3).map((item) => String(item))
      : [topStrength, "Positioning clarity", "Strategic direction"];
  const topGaps =
    Array.isArray(diagnosticData.topGaps) && diagnosticData.topGaps.length > 0
      ? diagnosticData.topGaps.slice(0, 3).map((item) => String(item))
      : [topGap, "Proof density", "Channel consistency"];
  const personaAtlasSummary =
    typeof diagnosticData.personaAtlasSummary === "string" && diagnosticData.personaAtlasSummary
      ? diagnosticData.personaAtlasSummary
      : `${companyName} should define a primary customer profile for ${audienceShort}, plus 1-2 secondary buyer roles. For each: capture jobs-to-be-done, top objections, decision criteria, and preferred channels.`;
  const buyerJourneySummary =
    typeof diagnosticData.buyerJourneySummary === "string" && diagnosticData.buyerJourneySummary
      ? diagnosticData.buyerJourneySummary
      : `Map the journey from awareness to decision for ${audienceShort}. For each stage, define core question, required proof, channel touchpoint, and stage-exit next step.`;
  const competitiveMatrixSummary =
    typeof diagnosticData.competitiveMatrixSummary === "string" &&
    diagnosticData.competitiveMatrixSummary
      ? diagnosticData.competitiveMatrixSummary
      : `Track top alternatives in ${industry}, their strongest claim, and where ${companyName} wins. Use one clear displacement narrative tied to ${primaryPillar.toLowerCase()} outcomes.`;
  const channelStrategySummary =
    typeof diagnosticData.channelStrategySummary === "string"
      ? diagnosticData.channelStrategySummary
      : typeof diagnosticData.pillarDependencyExplanation === "string"
        ? diagnosticData.pillarDependencyExplanation
        : "";
  const strategicPriorities = (
    (diagnosticData.strategicPriorities as Array<{ rank?: number; title?: string; pillar?: string }> | undefined) ??
    []
  )
    .slice(0, 5)
    .map((item, index) => ({
      rank: typeof item.rank === "number" ? item.rank : index + 1,
      title: typeof item.title === "string" ? item.title : "Priority",
      pillar: typeof item.pillar === "string" ? item.pillar : "Brand",
    }));
  const bf = asRecordLoose(diagnosticData.brandFoundation);
  const ex = asRecordLoose(diagnosticData.executiveSummary);
  const sao = asRecordLoose(diagnosticData.strategicAlignmentOverview);
  const ms = asRecordLoose(diagnosticData.messagingSystem);
  const positioningFromReport =
    typeof bf?.positioningStatement === "string" ? bf.positioningStatement.trim() : "";
  const differentiationFromReport =
    typeof bf?.differentiationNarrative === "string" ? bf.differentiationNarrative.trim() : "";
  const brandPromiseFromReport = typeof bf?.brandPromise === "string" ? bf.brandPromise.trim() : "";
  const executiveSynthesis = typeof ex?.synthesis === "string" ? ex.synthesis.trim() : "";
  const executiveDiagnosis = typeof ex?.diagnosis === "string" ? ex.diagnosis.trim() : "";
  const systemSummary = typeof sao?.summary === "string" ? sao.summary.trim() : "";
  const messagingSystemFormatted = ms ? formatMessagingSystemBody(ms, "") : "";
  const hasReportStrategyCore = Boolean(
    executiveSynthesis ||
      executiveDiagnosis ||
      systemSummary ||
      positioningFromReport ||
      differentiationFromReport ||
      brandPromiseFromReport ||
      messagingSystemFormatted,
  );
  const fallbackStrategyNarrative =
    typeof positioningMessaging === "string" && positioningMessaging.trim()
      ? positioningMessaging.trim()
      : "";
  const showMarketingStrategyHero = hasReportStrategyCore || Boolean(fallbackStrategyNarrative);

  const firstPriority = strategicPriorities[0]?.title || `Improve ${topGap.toLowerCase()}`;
  const secondPriority =
    strategicPriorities[1]?.title || `Scale ${topStrength.toLowerCase()} across channels`;
  const channelDirection = [
    channelPlans.email,
    channelPlans["content-seo"],
    channelPlans.social,
    channelPlans.website,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .slice(0, 2)
    .join(" ");
  const spendContext =
    diagnosticData.spendRecommendationContext &&
    typeof diagnosticData.spendRecommendationContext === "object"
      ? (diagnosticData.spendRecommendationContext as {
          currentMonthlySpend?: number;
          budgetConstrainedPlan?: { focus?: string; allocation?: Array<{ channel?: string; percent?: number }> };
          growthRoadmap?: { phases?: Array<{ phase?: string; monthlySpend?: number; milestone?: string }> };
          confidence?: string;
        })
      : null;
  const spendPlanSummary = spendContext
    ? joinAsStrategyBullets(
        spendContext.budgetConstrainedPlan?.focus || "Align channel strategy to current spend before scaling.",
        Array.isArray(spendContext.budgetConstrainedPlan?.allocation)
          ? `Current allocation: ${spendContext.budgetConstrainedPlan!.allocation!
              .map((a) => `${a.percent ?? 0}% ${String(a.channel || "channel").replace(/_/g, " ")}`)
              .join(", ")}.`
          : "",
        Array.isArray(spendContext.growthRoadmap?.phases)
          ? `Phased roadmap: ${spendContext.growthRoadmap!.phases!
              .map((p) => `${String(p.phase || "").replace("_", " ")} ~$${(p.monthlySpend || 0).toLocaleString()}`)
              .join(" → ")}.`
          : "",
        spendContext.confidence ? `Confidence: ${spendContext.confidence}.` : "",
      )
    : "";

  const archetype = typeof diagnosticData.primaryArchetype === "string" ? diagnosticData.primaryArchetype : "";
  const secondaryArchetypeNav =
    typeof diagnosticData.secondaryArchetype === "string" ? diagnosticData.secondaryArchetype : "";

  const strategySections: Array<{
    id: string;
    label: string;
    summary: string;
    body: string;
    workbookSectionId: WorkbookSectionId;
  }> = [
    {
      id: "positioning",
      label: "Positioning Statement",
      summary: "Your market position and differentiation baseline.",
      body:
        [positioningFromReport, differentiationFromReport].filter(Boolean).join("\n\n") ||
        positioningMessaging ||
        `${companyName} should position around ${primaryPillar.toLowerCase()} leadership for ${audienceShort}. Emphasize your edge in ${topStrength.toLowerCase()} while directly resolving ${topGap.toLowerCase()} in ${industry}.`,
      workbookSectionId: "positioning-statement",
    },
    {
      id: "strategic-offer",
      label: "Strategic offer & portfolio",
      summary:
        "What you sell, the buyer job, scope, success signals, and channel alignment—shared by Blueprint and Blueprint+; feeds Activation execution.",
      body: (() => {
        const built = buildStrategicOfferPlanBody(diagnosticData as Record<string, unknown>);
        if (built) return built;
        if (productTier === "blueprint" || productTier === "blueprint-plus") {
          return `Your Blueprint deliverable should include a **strategicOfferContext** block. If empty, regenerate the report or edit in Workbook (Strategic offer & portfolio).`;
        }
        return "";
      })(),
      workbookSectionId: "strategic-offer-context",
    },
    {
      id: "messaging-pillars",
      label: "Messaging Pillars",
      summary: "Core claims and proof points to repeat across channels.",
      body: formatMessagingSystemBody(
        ms,
        positioningMessaging ||
          `Build 3-5 pillars anchored on ${primaryPillar.toLowerCase()}. For ${companyName}, each pillar should include a clear claim, one proof artifact, and one outcome statement tied to ${firstPriority.toLowerCase()}.`,
      ),
      workbookSectionId: "messaging-framework",
    },
    {
      id: "archetype-voice",
      label: "Archetype & Voice System",
      summary:
        "Planning lens only—the full archetype story, toggle, and voice applications live on Foundation (Voice & Expression).",
      body: (() => {
        const label = [archetype, secondaryArchetypeNav].filter(Boolean).join(" + ");
        const named = label ? `Your suite labels this pattern as ${label}. ` : "";
        return (
          `${named}For go-to-market (GTM) and Activation, treat archetype and voice as fixed inputs: briefs should say “stay on the Foundation definition,” not reinterpret the archetype per channel.\n\n` +
          `Open Foundation → Voice & Expression for the canonical copy, primary/secondary behavior, and channel-specific voice examples—then use “Applying this topic” on Strategy for planning checks only.`
        );
      })(),
      workbookSectionId: "voice-attributes",
    },
    {
      id: "icp-personas",
      label: "Audience Profiles",
      summary:
        "Snapshot answers plus ideal customer profile (ICP) depth from your deliverable—segments, pains, objections, and transition plan when present.",
      body: buildAudienceProfilesBody({
        companyName,
        industry,
        audienceShort,
        targetAudience,
        diagnostic: diagnosticData as Record<string, unknown>,
      }),
      workbookSectionId: "audience-profile",
    },
    {
      id: "persona-atlas",
      label: "Customer Profiles",
      summary: "Role-level buyer personas—motivations, objections, channels, and sample message hooks from your report.",
      body: buildCustomerProfilesDeepBody({
        personaAtlasSummary,
        buyerPersonas: diagnosticData.buyerPersonas,
        companyName,
        audienceShort,
      }),
      workbookSectionId: "persona-atlas",
    },
    {
      id: "buyer-journey-map",
      label: "Customer Decision Journey",
      summary:
        "Stage-by-stage strategy (Aware → Consider → Decide → handoff). When your copy uses those labels, the map and narrative stay in sync.",
      body: buyerJourneySummary,
      workbookSectionId: "buyer-journey-map",
    },
    {
      id: "competitive-matrix",
      label: "Competitive Landscape Matrix",
      summary: "Competitive claims, overlap, and counter-positioning strategy.",
      body: competitiveMatrixSummary,
      workbookSectionId: "competitive-landscape-matrix",
    },
    {
      id: "channel-strategy",
      label: "Channel Strategy",
      summary:
        "Strategic channel roles and message fit—detailed channel plans, sequences, and assets are on Activation.",
      body:
        channelStrategySummary ||
        channelDirection ||
        `Activate ${primaryPillar.toLowerCase()} through a defined channel mix: email for follow-up, SEO/AI search for intent capture, social for authority, and site conversion pages for pipeline movement.`,
      workbookSectionId: "channel-notes",
    },
    {
      id: "spend-roadmap",
      label: "Budget-Aligned Spend Roadmap",
      summary: "Current-budget plan plus a phased path to hit growth goals.",
      body:
        spendPlanSummary ||
        `Allocate current spend by channel role first (demand capture, follow-up, conversion), then scale in 30/60/90-day phases tied to success check unlocks. Increase budget only when conversion efficiency and pipeline quality are stable.`,
      workbookSectionId: "channel-notes",
    },
    {
      id: "execution-priorities",
      label: "Strategic Priorities",
      summary: "Ordered strategic bets—what to prove first so activation and spend follow the same story.",
      body:
        strategicPriorities.length > 0
          ? strategicPriorities
              .map((item) => `${item.rank}. ${item.title} (${item.pillar})`)
              .join("\n")
          : topOpportunity ||
            `1. ${firstPriority}\n2. ${secondPriority}\n3. Convert ${primaryPillar.toLowerCase()} direction into owner-assigned 90-day execution milestones.`,
      workbookSectionId: "action-plan",
    },
  ];
  const strategySectionsVisible = filterStrategySections(productTier, strategySections);
  const strategyPlanSections = showStrategyPlanNarrativePanels(productTier)
    ? collectStrategyPlanSections(diagnosticData as Record<string, unknown>)
    : [];
  return [
    ...(showMarketingStrategyHero ? [{ id: "strategy-marketing-core", label: "Marketing Strategy" }] : []),
    ...strategyPlanSections.map((s) => ({ id: s.id, label: s.label })),
    ...strategySectionsVisible.map((section) => ({
      id: `strategy-${section.id}`,
      label: section.label,
    })),
  ];
}
