"use client";

import type { CSSProperties } from "react";

import type { ProductTier } from "@/components/ResultsTabNav";
import FoundationExtras from "@/components/FoundationExtras";
import PersonalizedGuidanceCard from "@/components/results/PersonalizedGuidanceCard";
import { ReportCallout } from "@/components/results/ReportDesignPrimitives";
import {
  ChannelMixHubVisual,
  JourneyMapVisual,
  MessagingSystemHubVisual,
  SpendRolesHubVisual,
  SwotVisual,
} from "@/components/results/StoryVisuals";
import TabPageWithSidebar from "@/components/results/TabPageWithSidebar";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_FOUNDATION_SUBHEAD_STYLE,
  SUITE_INSIGHT_CARD_BASE,
  SUITE_INSIGHT_CARD_MUTED,
  SUITE_INSIGHT_CARD_RAIL_LEFT,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_BUTTON,
  SUITE_RADIUS_MD,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";
import {
  StrategyAudienceProfilesLayout,
  StrategyBuyerPersonasLayout,
} from "@/components/strategy/AudienceAndIcpVisuals";
import StrategyPathwayVisual from "@/components/strategy/StrategyPathwayVisual";
import StrategyPlanNarrativePanels from "@/components/strategy/StrategyPlanNarrativePanels";
import { StrategyDomainSection, strategyDomainGradient } from "@/components/strategy/StrategyDomainSection";
import StrategyProseBody from "@/components/strategy/StrategyProseBody";
import { StrategicPrioritiesBarChart } from "@/components/results/charts/StrategicPrioritiesBarChart";
import {
  filterStrategySections,
  FOUNDATION_VOICE_EXPRESSION_ANCHOR_ID,
  showStrategyPlanNarrativePanels,
} from "@/components/results/tabConfig";
import { useResultsSuiteNav } from "@/components/results/ResultsSuiteNavContext";
import { getChatTierConfig } from "@/lib/chatTierConfig";
import { getSuiteProgressHint } from "@/lib/copy/resultsSuiteGuidance";
import { buildAudienceProfilesBody, buildCustomerProfilesDeepBody } from "@/lib/strategy/audienceNarrative";
import { buildStrategyNavMenuItems } from "@/lib/strategy/strategyNavMenu";
import { collectStrategyPlanSections, joinAsStrategyBullets } from "@/lib/strategy/strategyPlanExtract";
import StrategicOfferPortfolioLayout from "@/components/strategy/StrategicOfferPortfolioLayout";
import {
  buildStrategicOfferPlanBody,
  parseStrategicOfferViewModel,
  strategicOfferViewModelHasContent,
} from "@/lib/strategy/strategicOfferPlan";
import { parseBuyerJourneyStages, summarizeJourneyTile } from "@/lib/strategy/parseBuyerJourneyStages";
import { getJourneyMapTileChrome, journeyStageTitleColor } from "@/lib/strategy/journeyMapTileChrome";
import { extractCompetitiveLandscapePlayers } from "@/lib/strategy/competitiveLandscapePlayers";
import type { WorkbookSectionId } from "@/lib/workbookTypes";
import { SEMANTIC_DO, SEMANTIC_DONT } from "@/src/pdf/reportVisualTokens";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const MID_GRAY = SUITE_MUTED;
const BORDER = SUITE_BORDER;
const TEXT_BODY = SUITE_TEXT_PRIMARY;

const STRATEGY_INSET: CSSProperties = {
  padding: "14px 16px",
  borderRadius: SUITE_RADIUS_MD,
  background: "#FAFAFC",
  border: "1px solid rgba(0, 0, 0, 0.06)",
};

const STRATEGY_INSET_ACCENT: CSSProperties = {
  ...STRATEGY_INSET,
  background: "#F8F9FB",
  border: "1px solid rgba(0, 0, 0, 0.07)",
  borderLeft: `3px solid ${BLUE}`,
};

/** Nested cards inside Marketing strategy — same neutral inner language as narrative panels */
const STRATEGY_MARKETING_SUBCARD: CSSProperties = {
  padding: "16px 18px",
  borderRadius: SUITE_RADIUS_MD,
  background: "#FFFFFF",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
};

const STRATEGY_CARD_HEAD: CSSProperties = {
  ...SUITE_FOUNDATION_SUBHEAD_STYLE,
  margin: "0 0 12px",
  paddingBottom: 10,
  borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
  textTransform: "none",
};

const STRATEGY_MSG_SUBHEAD: CSSProperties = {
  ...SUITE_FOUNDATION_SUBHEAD_STYLE,
  margin: "0 0 8px",
  fontSize: 12,
  textTransform: "none",
};

/** In-card micro labels (Applying this topic → success metric, do / don’t) — Foundation blue subhead scale */
const STRATEGY_IMPL_SUBHEAD: CSSProperties = {
  ...SUITE_FOUNDATION_SUBHEAD_STYLE,
  margin: 0,
  fontSize: 12,
  textTransform: "none",
};

const STRATEGY_BODY_PARA: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: TEXT_BODY,
  lineHeight: 1.58,
  fontFamily: SUITE_FONT_UI,
};

const STRATEGY_LIST: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: TEXT_BODY,
  lineHeight: 1.55,
  fontFamily: SUITE_FONT_UI,
};

const JOURNEY_STAGE_BODY: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: TEXT_BODY,
  lineHeight: 1.58,
  fontFamily: SUITE_FONT_UI,
};

const WORKBOOK_BTN_STYLE: CSSProperties = {
  padding: "9px 16px",
  borderRadius: SUITE_RADIUS_BUTTON,
  border: `1px solid ${BORDER}`,
  background: "#FFFFFF",
  color: NAVY,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: SUITE_FONT_UI,
  flexShrink: 0,
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
};

const EXEC_NOTE_CARD: CSSProperties = {
  ...SUITE_INSIGHT_CARD_BASE,
  padding: "16px 18px",
};

const EXEC_HIGHLIGHT_CARD: CSSProperties = {
  ...SUITE_INSIGHT_CARD_BASE,
  ...SUITE_INSIGHT_CARD_RAIL_LEFT,
  padding: "14px 16px",
};

const EXEC_MUTED_CARD: CSSProperties = {
  ...SUITE_INSIGHT_CARD_MUTED,
  padding: "14px 16px",
};

/** Do / Don’t lists — green vs red (reserved for guidance pairs per report visual language). */
const EXEC_DO_GUIDANCE_CARD: CSSProperties = {
  padding: "14px 16px",
  borderRadius: 10,
  background: SEMANTIC_DO.bg,
  border: "1px solid rgba(5, 150, 105, 0.22)",
  borderLeft: `4px solid ${SEMANTIC_DO.border}`,
};

const EXEC_DONT_GUIDANCE_CARD: CSSProperties = {
  padding: "14px 16px",
  borderRadius: 10,
  background: SEMANTIC_DONT.bg,
  border: "1px solid rgba(239, 68, 68, 0.2)",
  borderLeft: `4px solid ${SEMANTIC_DONT.border}`,
};

interface StrategyTabProps {
  productTier: ProductTier;
  diagnosticData: Record<string, unknown>;
  onEditInWorkbook: (sectionId: WorkbookSectionId) => void;
  /** Set when `ResultsTabsShell` renders section chips above this tab (Foundation-style). */
  shellRendersSectionChips?: boolean;
  shellActiveSectionId?: string | null;
}

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

/** Spokes for MessagingSystemHubVisual — needs ≥3 nodes; uses pillar fallbacks when lists are thin. */
function buildMessagingSystemHubNodes(
  ms: Record<string, unknown>,
  primaryPillar: string,
): Array<{ label: string; sub: string }> | null {
  /** Soft cap only for absurd lengths — hub UI wraps; avoid mid-word chop when possible */
  const softCap = (s: string, max: number) => {
    const t = s.trim();
    if (!t) return "";
    if (t.length <= max) return t;
    const slice = t.slice(0, max);
    const lastSpace = slice.lastIndexOf(" ");
    const cut = lastSpace > max * 0.5 ? slice.slice(0, lastSpace) : slice.trimEnd();
    return `${cut}…`;
  };
  const sup = Array.isArray(ms.supportingMessages)
    ? ms.supportingMessages.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    : [];
  const proof = Array.isArray(ms.proofPoints)
    ? ms.proofPoints.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    : [];
  const out: Array<{ label: string; sub: string }> = [];
  for (const s of sup.slice(0, 5)) {
    const label = softCap(s, 220);
    if (label) out.push({ label, sub: "Supporting line" });
  }
  for (const p of proof) {
    if (out.length >= 6) break;
    const label = softCap(p, 220);
    if (label) out.push({ label, sub: "Proof point" });
  }
  const pillarLine = softCap(primaryPillar, 120);
  const fallbacks: Array<{ label: string; sub: string }> = [];
  if (pillarLine) fallbacks.push({ label: pillarLine, sub: "Lead pillar" });
  fallbacks.push(
    { label: "Proof in-market", sub: "Evidence buyers feel" },
    { label: "Channel fit", sub: "Format per touchpoint" },
    { label: "Next step clarity", sub: "One CTA per touch" },
  );
  for (const f of fallbacks) {
    if (out.length >= 3) break;
    if (!out.some((o) => o.label === f.label)) out.push(f);
  }
  if (out.length < 3) return null;
  return out.slice(0, 6);
}

function firstNWords(input: string, count: number): string {
  const words = input.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  return words.slice(0, count).join(" ");
}

export default function StrategyTab({
  productTier,
  diagnosticData,
  onEditInWorkbook,
  shellRendersSectionChips = false,
  shellActiveSectionId = null,
}: StrategyTabProps) {
  const isFree = productTier === "snapshot";
  const suiteNav = useResultsSuiteNav();
  const openFoundationSection = suiteNav?.openFoundationSection;
  const archetype = typeof diagnosticData.primaryArchetype === "string" ? diagnosticData.primaryArchetype : "";
  const secondaryArchetype =
    typeof diagnosticData.secondaryArchetype === "string" ? diagnosticData.secondaryArchetype : "";
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
  const reportIdForPersonas =
    typeof diagnosticData.reportId === "string" && diagnosticData.reportId.trim()
      ? diagnosticData.reportId.trim()
      : undefined;
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
  const namedCompetitorsForMatrix = extractCompetitiveLandscapePlayers(
    diagnosticData as Record<string, unknown>,
  ).map((p) => ({
    name: p.name,
    ...(p.narrative ? { narrative: p.narrative } : {}),
  }));
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
  const executivePrimaryFocus =
    typeof ex?.primaryFocusArea === "string" ? ex.primaryFocusArea.trim() : "";
  const executiveSecondaryFocus =
    typeof ex?.secondaryFocusArea === "string" ? ex.secondaryFocusArea.trim() : "";
  const systemSummary =
    typeof sao?.summary === "string" ? sao.summary.trim() : "";
  const reinforcementsRaw = Array.isArray(sao?.reinforcements) ? sao.reinforcements : [];
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

  const defaultJourneyMapStages = [
    { label: "Aware", focus: `Surface ${primaryPillar.toLowerCase()} insight for ${audienceShort}.` },
    { label: "Consider", focus: "Deliver framework and proof aligned to top objections." },
    { label: "Decide", focus: `Present implementation plan tied to ${firstPriority.toLowerCase()}.` },
    { label: "Commit", focus: "Provide owner timeline and clear conversion action." },
  ];

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
        "What you sell (product, service, or program), the buyer job, scope boundaries, success signals, and how channels should reinforce the same offer—jobs to be done (JTBD) and outcome-oriented framing for go-to-market (GTM) and Activation.",
      body: (() => {
        const built = buildStrategicOfferPlanBody(diagnosticData as Record<string, unknown>);
        if (built) return built;
        if (productTier === "blueprint" || productTier === "blueprint-plus") {
          return `Your Blueprint deliverable should include a **strategicOfferContext** block: primary offer, buyer job statement, pains and outcomes, in-scope vs out-of-scope promises, leading signals to review, channel alignment, and the riskiest assumption to validate. If this area is empty, regenerate your Blueprint report or capture the offer in Workbook (Strategic offer & portfolio).`;
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
        const label = [archetype, secondaryArchetype].filter(Boolean).join(" + ");
        const named = label ? `Your suite labels this pattern as ${label}. ` : "";
        return (
          `${named}For go-to-market (GTM) and Activation, treat archetype and voice as fixed inputs: briefs should say “stay on the Foundation definition,” not reinterpret the archetype per channel.\n\n` +
          `Open Foundation → Voice & Expression for the canonical copy, primary/secondary behavior, and channel-specific voice examples—then use “Applying this topic” below for planning checks only.`
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
          ? [
              "These are sequenced strategic bets—each should reinforce the same buyer story and proof path before you scale channels or spend.",
              strategicPriorities.map((item) => `${item.rank}. ${item.title} (${item.pillar})`).join("\n"),
            ].join("\n\n")
          : topOpportunity ||
            `1. ${firstPriority}\n2. ${secondPriority}\n3. Convert ${primaryPillar.toLowerCase()} direction into owner-assigned 90-day execution milestones.`,
      workbookSectionId: "action-plan",
    },
  ];
  const strategySectionsVisible = filterStrategySections(productTier, strategySections);
  const strategicOfferVm = parseStrategicOfferViewModel(diagnosticData as Record<string, unknown>);
  const strategicOfferUseVisualLayout =
    strategicOfferVm !== null && strategicOfferViewModelHasContent(strategicOfferVm);
  const strategyPlanSections = showStrategyPlanNarrativePanels(productTier)
    ? collectStrategyPlanSections(diagnosticData as Record<string, unknown>)
    : [];
  const strategyMenuItems = buildStrategyNavMenuItems(productTier, diagnosticData);
  const marketingBlockCount = showMarketingStrategyHero ? 1 : 0;
  const narrativeBlockCount = strategyPlanSections.length;
  const domainBlockCount = strategySectionsVisible.length;
  const sectionGuidance: Record<
    string,
    { doText: string; dontText: string; example: string; title: string }
  > = {
    positioning: {
      title: "Positioning checklist",
      doText: `Say clearly why ${companyName} is the right fit for ${audienceShort}. Tie it to one main promise about ${primaryPillar.toLowerCase()}.`,
      dontText: "List services without saying what makes you different.",
      example: `${companyName} helps ${audienceShort} fix ${topGap.toLowerCase()} with a ${primaryPillar.toLowerCase()} plan that turns into real leads and revenue.`,
    },
    "strategic-offer": {
      title: "Offer clarity",
      doText:
        "Treat the offer as a product decision: name it, define the job it wins, and list what is in and out of scope before you scale campaigns.",
      dontText: "Let each channel invent a different promise or bundle that operations cannot deliver.",
      example:
        "Primary offer: a fixed-scope implementation package for growth-stage teams—sold on outcomes per week, not open-ended hours—so marketing, sales, and delivery all quote the same thing.",
    },
    "messaging-pillars": {
      title: "Messaging usage",
      doText: "Give each campaign one main idea, one proof point, and one clear next step.",
      dontText: "Mix several promises in one block with no proof.",
      example: `Pillar: ${primaryPillar}. Claim: faster decision confidence. Proof: diagnostic findings + implementation roadmap. Next step: Review your 90-day activation sequence.`,
    },
    "archetype-voice": {
      title: "Voice quality controls",
      doText: "Write in short, confident sentences. Tell people what to do next.",
      dontText: "Use fancy words that sound good but do not help someone decide.",
      example: `Instead of "we transform brands," use "we prioritize ${firstPriority.toLowerCase()} first so teams can execute with less friction."`,
    },
    "icp-personas": {
      title: "Audience specificity",
      doText:
        "Name primary buyers, secondary or adjacent audiences (partners, ops, procurement), and influencers. Note what each needs to believe before they act.",
      dontText: "Treat everyone the same with one generic button or offer.",
      example: `Best-fit customer: ${audienceShort}. Trigger: stalled growth. Top worry: execution confidence. Proof they need: clear phased roadmap + who owns each step.`,
    },
    "persona-atlas": {
      title: "Persona depth",
      doText: "For each role, write the job they need done, what blocks them, and what proof they need.",
      dontText: "Use only age and title with no story about how they buy.",
      example: `Each profile lists role, what success looks like, what triggered the search, proof needed before a call, and the best next step.`,
    },
    "buyer-journey-map": {
      title: "Journey sequencing",
      doText: "For each step, pick one goal, one message, and one next step.",
      dontText: "Ask for a big commitment in the first touch before you have earned trust.",
      example: `Early: show the problem. Middle: show your method + proof. Late: show the plan, timeline, and owner.`,
    },
    "competitive-matrix": {
      title: "Competitive framing",
      doText: `Show how ${companyName} wins on real results and reliable follow-through.`,
      dontText: "Say you are faster or better with no proof.",
      example: `One line you can use: "Where others stop at ideas, ${companyName} ships owner-ready work tied to 90-day milestones."`,
    },
    "channel-strategy": {
      title: "Channel discipline",
      doText: "Give each channel one job and one simple way to know if it works.",
      dontText: "Post the same copy everywhere with no change for where the reader is in the journey.",
      example: `Email: follow up and build trust. Social: show authority. Website: make the next step obvious. Search: answer what people are already looking for.`,
    },
    "spend-roadmap": {
      title: "Spend alignment",
      doText: "Raise budget only after you see steady quality leads and clear results.",
      dontText: "Pour money into ads before your message and landing pages convert well.",
      example: `First: steady results on current spend. Then: grow the channels that bring the best qualified leads.`,
    },
    "execution-priorities": {
      title: "Priority management",
      doText: "Pick order by what must happen first and what moves the business most.",
      dontText: "Run many projects at once with no clear owner.",
      example: `Suggested order for ${companyName}: 1) ${firstPriority} 2) ${secondPriority} 3) weekly check-ins with owners until it ships.`,
    },
  };
  const expandedContent: Record<
    string,
    {
      whyItMatters: string;
      /** Optional parallel read for cross-functional briefings—does not replace tactical steps below. */
      parallelPlainRead: string;
      actions: string[];
      successMetric: string;
      risk: string;
    }
  > = {
    positioning: {
      whyItMatters:
        "Clear positioning helps people understand fit fast. That drives more sign-ups and shorter sales cycles.",
      parallelPlainRead:
        "One crisp line on who you help, what outcome you own, and what proof makes that believable—before you tune channels or spend.",
      actions: [
        "Pick one main category and one clear difference. Use both on your main pages.",
        "Rewrite your homepage hero and service opener with the same simple line.",
        "Show the line to five people outside your team. Fix anything they do not get in one read.",
      ],
      successMetric: "A new visitor can say what makes you different in one short sentence.",
      risk: "If you stay vague, clearer competitors will win the first impression.",
    },
    "strategic-offer": {
      whyItMatters:
        "Marketing plans fail when the offer is fuzzy—channels amplify confusion, not demand. Naming the job, the offer, and scope keeps Strategy and Activation aligned.",
      parallelPlainRead:
        "Write down what someone is hiring you to do, what they get, what you will not promise, and one or two early signals that show it is working—before you scale spend.",
      actions: [
        "Confirm the primary offer name and one-line pitch everyone will repeat.",
        "List in-scope vs out-of-scope so sales and marketing do not over-promise.",
        "Pick two leading signals (not vanity metrics) to review on a fixed cadence.",
      ],
      successMetric: "Every channel brief names the same primary offer and job-to-be-done.",
      risk: "If the offer drifts by channel, conversion and trust erode even with strong creative.",
    },
    "messaging-pillars": {
      whyItMatters:
        "Pillars turn strategy into repeatable messages your whole team can reuse.",
      parallelPlainRead:
        "Each customer-facing message should carry one main promise, one proof point, and one obvious next step—so campaigns stay aligned without sounding robotic.",
      actions: [
        "Write 3–5 pillars. Each has one claim, one proof, and one outcome.",
        "Match each live campaign to one pillar. Remove mixed messages.",
        "Save proof snippets sales, email, and web can paste in.",
      ],
      successMetric: "Every big piece of content maps to one pillar and one clear next step.",
      risk: "Without pillars, messages drift and results get weaker over time.",
    },
    "archetype-voice": {
      whyItMatters:
        "A steady voice builds trust. People decide faster when you sound like one brand—and when every brief points at the same Foundation definition.",
      parallelPlainRead:
        "Use Foundation as the source of truth for how the archetype reads; keep Strategy for how you operationalize that voice inside campaigns and handoffs.",
      actions: [
        "List words to use, words to skip, and tone by channel.",
        "Check voice on high-impact pages before they go live.",
        "Train the team with examples tied to today’s priorities.",
      ],
      successMetric: "Copy feels like the same brand across channels with few edits.",
      risk: "Mixed tone hurts trust even when the strategy is strong.",
    },
    "icp-personas": {
      whyItMatters:
        "When you know your best-fit customer, you attract stronger leads and waste less budget.",
      parallelPlainRead:
        "Write down who “good fit” is, what each stakeholder worries about, and what proof they need before they move—so sales and marketing argue less about lead quality.",
      actions: [
        "Name the buyer, influencer, and blocker for your main customer type.",
        "List top objections and what proof each person needs.",
        "Match next steps to how ready they are to buy.",
      ],
      successMetric: "More qualified leads and fewer “bad fit” sales calls.",
      risk: "Broad targeting raises cost and fills the pipeline with weak leads.",
    },
    "persona-atlas": {
      whyItMatters: "Rich profiles turn guesses into clear messages and channel picks.",
      parallelPlainRead:
        "For each role: the job they are trying to get done, what triggered the search, and what would make them say yes—then keep those cards where briefs are written.",
      actions: [
        "For each role, write the job to be done, trigger, worry, and proof that closes doubt.",
        "Tag campaigns by profile so you can see what works.",
        "Refresh profiles each quarter from sales and delivery notes.",
      ],
      successMetric: "Targeted campaigns beat generic ones on lead quality.",
      risk: "Stale profiles lead to wrong messages and wasted work.",
    },
    "buyer-journey-map": {
      whyItMatters: "A clear journey connects early education to the final yes.",
      parallelPlainRead:
        "Each stage gets one goal, one message, and one handoff so momentum does not die between interest and purchase.",
      actions: [
        "For each step, set one goal, one content type, and one next step.",
        "Set rules for when marketing passes a lead to sales.",
        "Track simple signals that show someone moved to the next step.",
      ],
      successMetric: "Fewer people drop off between follow-up and decision.",
      risk: "Gaps between steps slow deals and lose revenue.",
    },
    "competitive-matrix": {
      whyItMatters:
        "When buyers compare options, clear answers protect your price and win rate.",
      parallelPlainRead:
        "Have calm, specific answers when alternatives come up—credible proof and scope clarity beat empty superlatives when procurement gets involved.",
      actions: [
        "List top alternatives, their strongest claim, and your counter in plain words.",
        "Write short replies to common objections by profile and stage.",
        "Put comparison proof on sales pages and late-stage assets.",
      ],
      successMetric: "You win more deals when a competitor is named. Less pressure to discount.",
      risk: "If you stay silent, buyers pick what feels safer.",
    },
    "channel-strategy": {
      whyItMatters: "Each channel works best when it matches what the reader needs right now.",
      parallelPlainRead:
        "Give every channel one job and one score to watch; keep the same core story while the format fits the place. Use Strategy for framing—Activation for week-by-week channel plans, sequences, and ship-ready assets.",
      actions: [
        "Give each channel one job and one simple score to watch.",
        "Plan content by stage, not by how many posts you can ship.",
        "Review results monthly by channel job.",
      ],
      successMetric: "You can see how each channel helps move leads forward.",
      risk: "Random posting raises spend without clear impact.",
    },
    "spend-roadmap": {
      whyItMatters: "Growing spend with care keeps results strong and risk low.",
      parallelPlainRead:
        "Increase budget only when lead quality and conversion are steady—scale what is already working before you open new experiments.",
      actions: [
        "Lock in results on the best channels first.",
        "Write rules for when it is safe to spend more.",
        "Plan 30/60/90 day spend with expected outcomes in plain numbers.",
      ],
      successMetric: "Higher spend only happens when leads and revenue move the right way.",
      risk: "Scaling too early wastes money on weak pages and messages.",
    },
    "execution-priorities": {
      whyItMatters: "Order matters. Good sequencing turns plans into shipped work.",
      parallelPlainRead:
        "Sequence beats volume: finish the few items that unlock revenue and proof before you add parallel initiatives.",
      actions: [
        "Rank work by what must happen first and what moves the business most.",
        "Give each item an owner, due date, and success check.",
        "Meet weekly to remove blockers.",
      ],
      successMetric: "Top priorities finish on time and key numbers improve within 90 days.",
      risk: "Too many parallel projects dilutes focus and slows results.",
    },
  };
  const doDontGuidance: Record<string, { do: string[]; dont: string[] }> = {
    positioning: {
      do: [
        "Use one simple category line on your site, deck, and outreach.",
        "Start with the buyer’s problem and the outcome they want.",
        "Show one proof point near the top of the page.",
      ],
      dont: [
        "Don't change your positioning line in every channel.",
        "Don't stack several offers in the main hero.",
        "Don't use empty words like “innovative” with no proof.",
      ],
    },
    "strategic-offer": {
      do: [
        "Name the primary offer and the buyer job in plain language the whole team can repeat.",
        "Keep scope tight—say what you will not do as clearly as what you will.",
        "Tie each major channel to one role in moving someone toward that offer.",
      ],
      dont: [
        "Don't let every campaign invent a new promise that the product or service cannot support.",
        "Don't skip substitutes—buyers always compare; name the alternatives.",
        "Don't list twelve KPIs—pick a few leading signals you will actually review.",
      ],
    },
    "messaging-pillars": {
      do: [
        "Use one pillar per asset to avoid mixed intent.",
        "Include one claim, one proof, and one clear next step in each message block.",
        "Create reusable examples for sales, web, and email.",
      ],
      dont: [
        "Don't publish a pillar claim with no proof.",
        "Don't ask for a sale in the same block where you are still introducing the problem.",
        "Don't tweak channel copy until the base pillar wording is stable.",
      ],
    },
    "archetype-voice": {
      do: [
        "Keep tone confident, practical, and specific.",
        "Use short, decision-oriented language in high-intent moments.",
        "Use the same patterns for openers, transitions, and next steps.",
      ],
      dont: [
        "Don't use vague brand language on pages where people decide.",
        "Don't sound like a different brand on social vs sales.",
        "Don't use hype with no detail on how you deliver.",
      ],
    },
    "icp-personas": {
      do: [
        "Separate primary buyer, influencer, and blocker roles.",
        "Capture objections and proof needs by role.",
        "Match next steps to how ready they are to buy.",
      ],
      dont: [
        "Don't treat every inbound lead as the same segment.",
        "Don't guess what buyers want without talking to sales.",
        "Don't use one offer for every stage of the journey.",
      ],
    },
    "persona-atlas": {
      do: [
        "For each profile, write the job to be done and what triggered the search.",
        "Note preferred channels and content types.",
        "Update profiles each quarter with real call notes.",
      ],
      dont: [
        "Don't stop at age and job title.",
        "Don't skip worries and objections.",
        "Don't lose old versions when you update a profile.",
      ],
    },
    "buyer-journey-map": {
      do: [
        "Give each step one goal and one clear next step.",
        "Say what proof they need to move forward.",
        "Track simple signals that show progress.",
      ],
      dont: [
        "Don't skip the middle steps where people compare options.",
        "Don't send unqualified leads to sales.",
        "Don't reuse the same asset for every step.",
      ],
    },
    "competitive-matrix": {
      do: [
        "Write short replies you can use when a competitor comes up.",
        "Say where you win and where you are weaker.",
        "Add comparison proof to late-stage pages and decks.",
      ],
      dont: [
        "Don't attack competitors with fear tactics.",
        "Don't state claims you cannot prove.",
        "Don't leave sales without approved wording.",
      ],
    },
    "channel-strategy": {
      do: [
        "Give each channel one job and one simple score to watch.",
        "Match format to the channel while keeping the same core story.",
        "Review channel results monthly by role in the journey.",
      ],
      dont: [
        "Don't paste identical copy across every channel.",
        "Don't chase likes if your goal is sales.",
        "Don't open a new channel if you cannot staff it.",
      ],
    },
    "spend-roadmap": {
      do: [
        "Raise budget only after leads and conversions look steady.",
        "Plan spend in phases with simple targets you can check.",
        "Put more money into channels that bring the best-fit leads.",
      ],
      dont: [
        "Don't spend more to fix weak messaging or landing pages.",
        "Don't judge paid ads only by clicks if your goal is sales.",
        "Don't split the budget across too many small tests at once.",
      ],
    },
    "execution-priorities": {
      do: [
        "Give each priority an owner, due date, and simple success check.",
        "Meet weekly to clear blockers.",
        "Order work by what must finish first, not only what feels urgent.",
      ],
      dont: [
        "Don't launch every project at the same time.",
        "Don't count planning as done until work ships.",
        "Don't hide who needs what from another team to move forward.",
      ],
    },
  };

  const suiteProgressHint = getSuiteProgressHint(productTier, "strategy");
  const purchasedProductName = getChatTierConfig(productTier).productName;
  const showBrandStandardsPath =
    productTier === "blueprint" || productTier === "blueprint-plus";

  return (
    <TabPageWithSidebar
      navTitle="Strategy"
      navItems={strategyMenuItems}
      shellRendersSectionChips={shellRendersSectionChips}
      shellActiveSectionId={shellActiveSectionId}
    >
      <div className="min-w-0 w-full max-w-full space-y-10 md:space-y-12" style={{ fontFamily: SUITE_FONT_UI }}>
      <div
        style={{
          ...SUITE_INSIGHT_CARD_BASE,
          ...SUITE_INSIGHT_CARD_RAIL_LEFT,
          padding: "22px 22px 24px",
          boxShadow: SUITE_SHADOW_CARD,
        }}
      >
        <div className="max-w-3xl">
          <p
            style={{
              ...SUITE_FOUNDATION_SUBHEAD_STYLE,
              margin: 0,
              fontSize: 12,
              letterSpacing: "0.08em",
            }}
          >
            Strategic marketing plan
          </p>
          <h2 className="bs-h3 mt-2 text-brand-navy">{companyName}</h2>
          {suiteProgressHint ? (
            <p
              style={{
                margin: "14px 0 0",
                maxWidth: "62ch",
                fontSize: 14,
                lineHeight: 1.55,
                color: MID_GRAY,
                fontWeight: 400,
              }}
            >
              {suiteProgressHint}
            </p>
          ) : null}

          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
            <StrategyPathwayVisual
              showBrandStandards={showBrandStandardsPath}
              activationStepSub={
                productTier === "blueprint-plus" ? "Content & execution plans" : "Run the plan"
              }
              pathSupplement={
                productTier === "blueprint-plus"
                  ? "At this tier, ship-ready plays and exports live under Activation once strategy is set—the path above is the order we recommend."
                  : productTier === "blueprint"
                    ? "Blueprint+ adds deeper Activation assets and export packs; both Blueprint tiers share the same Strategy coverage in this tab."
                    : null
              }
            />
            <div style={STRATEGY_INSET}>
              <p style={{ ...STRATEGY_CARD_HEAD, borderBottomColor: "rgba(7, 176, 242, 0.12)" }}>
                How Foundation, Strategy, and Activation fit
              </p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.58, color: TEXT_BODY, fontFamily: SUITE_FONT_UI }}>
                <strong style={{ color: NAVY }}>Foundation</strong> is the brand foundation—positioning, messaging pillars,
                personas, voice, and how the story fits together. <strong style={{ color: NAVY }}>Strategy</strong> is the plan
                on top of that: which audiences to prioritize, tactics, channels, spend, and sequencing.{" "}
                <strong style={{ color: NAVY }}>Activation</strong>{" "}
                {productTier === "blueprint-plus"
                  ? "is where Blueprint+ puts the plan into ship-ready form: actual content, channel execution plans, timelines, and prompts—everything included at this tier."
                  : productTier === "blueprint"
                    ? "is structured execution on Blueprint—channel plans, roadmaps, and schedules your team runs from Workbook. Blueprint+ is the same Strategy (including what you sell) with heavier ship-ready content inside Activation."
                    : "is tactical execution of the plan—what to run, who owns it, and when."}{" "}
                Where Strategy touches the same bedrock as Foundation (for example archetype and voice), we link to the
                Foundation section instead of pasting the full story twice.
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              paddingTop: 20,
              borderTop: "1px solid rgba(7, 176, 242, 0.14)",
            }}
          >
            <p style={{ ...STRATEGY_CARD_HEAD, marginBottom: 12, paddingBottom: 0, borderBottom: "none" }}>
              Using this tab
            </p>
            <p className="text-sm leading-relaxed text-brand-muted sm:text-[15px]" style={{ margin: 0 }}>
              This tab is your go-to-market plan: who to win first, how they decide, where to show up, how budget should move,
              and what to tackle before everything else.
              {productTier === "blueprint" || productTier === "blueprint-plus" ? (
                <>
                  {" "}
                  Blueprint and Blueprint+ both anchor this plan to{" "}
                  <strong style={{ color: NAVY }}>what you sell</strong>—products or services—so GTM stays revenue-aware.
                </>
              ) : null}{" "}
              When your product includes them, you will also see outcomes, web conversion, content rhythm, proof, and
              sales–marketing alignment.{" "}
              {productTier === "blueprint-plus"
                ? "On Blueprint+, Activation is the full execution pack—paste-ready content, channel plans, schedules, and prompts. Line-by-line edits in Workbook; PDFs and bundles under Downloads."
                : productTier === "blueprint"
                  ? "On Blueprint, Activation is structured execution (plans and schedules); Blueprint+ adds more ship-ready copy and richer export packs—same Strategy depth on both tiers."
                  : "Channel playbooks and timelines live under Activation; line-by-line edits in Workbook; PDFs and bundles under Downloads."}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-[15px]" style={{ marginBottom: 0 }}>
              In each topic panel, expand &ldquo;Applying this topic&rdquo; when you want 90-day moves, success metrics, and
              do / don&apos;t guardrails. Keep it closed while you are still aligning on strategy.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-[15px]" style={{ marginBottom: 0 }}>
              Use the Downloads tab for PDFs and other exports included in {purchasedProductName}.
            </p>
          </div>
        </div>
      </div>

      {showMarketingStrategyHero ? (
        <StrategyDomainSection
          id="strategy-marketing-core"
          sectionNumber="01"
          eyebrow="Marketing"
          title="Marketing Strategy"
          intro="How diagnosis and direction connect before you dive into audience, journey, and channels—the thread that should stay consistent with your Foundation pillars and personas."
          gradient={strategyDomainGradient(0)}
        >
          {hasReportStrategyCore ? (
            <div style={{ display: "grid", gap: 20, marginTop: 4 }}>
              {executiveSynthesis || executiveDiagnosis ? (
                <div style={STRATEGY_INSET_ACCENT}>
                  <p style={STRATEGY_CARD_HEAD}>Executive synthesis</p>
                  {executiveSynthesis ? (
                    <p style={{ ...STRATEGY_BODY_PARA, marginTop: 0 }}>{executiveSynthesis}</p>
                  ) : null}
                  {executiveDiagnosis ? (
                    <p style={{ ...STRATEGY_BODY_PARA, marginTop: executiveSynthesis ? 12 : 0 }}>
                      <strong style={{ color: NAVY }}>Diagnosis: </strong>
                      {executiveDiagnosis}
                    </p>
                  ) : null}
                  {executivePrimaryFocus || executiveSecondaryFocus ? (
                    <p style={{ margin: "10px 0 0", fontSize: 13, color: MID_GRAY, lineHeight: 1.55 }}>
                      {executivePrimaryFocus ? (
                        <>
                          <strong style={{ color: NAVY }}>Primary focus: </strong>
                          {executivePrimaryFocus}
                        </>
                      ) : null}
                      {executivePrimaryFocus && executiveSecondaryFocus ? " · " : null}
                      {executiveSecondaryFocus ? (
                        <>
                          <strong style={{ color: NAVY }}>Secondary: </strong>
                          {executiveSecondaryFocus}
                        </>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {systemSummary ? (
                <div style={STRATEGY_MARKETING_SUBCARD}>
                  <p style={STRATEGY_CARD_HEAD}>How the brand system fits together</p>
                  <p style={STRATEGY_BODY_PARA}>{systemSummary}</p>
                  {reinforcementsRaw.length > 0 ? (
                    <ul className="strategy-suite-ul" style={{ ...STRATEGY_LIST, marginTop: 14 }}>
                      {reinforcementsRaw.slice(0, 5).map((raw, i) => {
                        const row = asRecordLoose(raw);
                        const pillars = typeof row?.pillars === "string" ? row.pillars : "";
                        const insight = typeof row?.insight === "string" ? row.insight : "";
                        if (!insight) return null;
                        return (
                          <li key={`ref-${i}`}>
                            {pillars ? <strong style={{ color: NAVY }}>{pillars}: </strong> : null}
                            {insight}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              ) : null}
              {brandPromiseFromReport ? (
                <div style={STRATEGY_MARKETING_SUBCARD}>
                  <p style={STRATEGY_CARD_HEAD}>Brand promise</p>
                  <p style={STRATEGY_BODY_PARA}>{brandPromiseFromReport}</p>
                </div>
              ) : null}
              {positioningFromReport || differentiationFromReport ? (
                <div style={STRATEGY_MARKETING_SUBCARD}>
                  <p style={STRATEGY_CARD_HEAD}>Positioning & differentiation</p>
                  {positioningFromReport ? <p style={STRATEGY_BODY_PARA}>{positioningFromReport}</p> : null}
                  {differentiationFromReport ? (
                    <p style={{ ...STRATEGY_BODY_PARA, marginTop: positioningFromReport ? 14 : 0 }}>{differentiationFromReport}</p>
                  ) : null}
                </div>
              ) : null}
              {messagingSystemFormatted ? (
                <div style={STRATEGY_MARKETING_SUBCARD}>
                  <p style={STRATEGY_CARD_HEAD}>Messaging system</p>
                  {ms ? (() => {
                    const hubNodes = buildMessagingSystemHubNodes(ms, primaryPillar);
                    const hubLine =
                      (typeof ms.coreMessage === "string" && ms.coreMessage.trim()) ||
                      primaryPillar ||
                      companyName;
                    return hubNodes ? (
                      <div style={{ marginBottom: 18 }}>
                        <MessagingSystemHubVisual hubLabel={hubLine} nodes={hubNodes} />
                      </div>
                    ) : null;
                  })() : null}
                  {ms ? (
                    <div style={{ display: "grid", gap: 18 }}>
                      {typeof ms.coreMessage === "string" && ms.coreMessage.trim() ? (
                        <div>
                          <p style={STRATEGY_MSG_SUBHEAD}>Core message</p>
                          <p style={STRATEGY_BODY_PARA}>{ms.coreMessage.trim()}</p>
                        </div>
                      ) : null}
                      {Array.isArray(ms.supportingMessages) &&
                      ms.supportingMessages.filter((x): x is string => typeof x === "string" && x.trim().length > 0).length >
                        0 ? (
                        <div>
                          <p style={STRATEGY_MSG_SUBHEAD}>Supporting messages</p>
                          <ul className="strategy-suite-ul" style={STRATEGY_LIST}>
                            {ms.supportingMessages
                              .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
                              .map((s) => (
                                <li key={s}>
                                  {s}
                                </li>
                              ))}
                          </ul>
                        </div>
                      ) : null}
                      {Array.isArray(ms.proofPoints) &&
                      ms.proofPoints.filter((x): x is string => typeof x === "string" && x.trim().length > 0).length > 0 ? (
                        <div>
                          <p style={STRATEGY_MSG_SUBHEAD}>Proof points</p>
                          <ul className="strategy-suite-ul" style={STRATEGY_LIST}>
                            {ms.proofPoints
                              .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
                              .map((s) => (
                                <li key={s}>
                                  {s}
                                </li>
                              ))}
                          </ul>
                        </div>
                      ) : null}
                      {!(
                        (typeof ms.coreMessage === "string" && ms.coreMessage.trim()) ||
                        (Array.isArray(ms.supportingMessages) &&
                          ms.supportingMessages.some((x) => typeof x === "string" && x.trim().length > 0)) ||
                        (Array.isArray(ms.proofPoints) && ms.proofPoints.some((x) => typeof x === "string" && x.trim().length > 0))
                      ) ? (
                        <StrategyProseBody text={messagingSystemFormatted} paragraphStyle={STRATEGY_BODY_PARA} />
                      ) : null}
                    </div>
                  ) : (
                    <StrategyProseBody text={messagingSystemFormatted} paragraphStyle={STRATEGY_BODY_PARA} />
                  )}
                  {ms && Array.isArray(ms.whatNotToSay) && ms.whatNotToSay.length > 0 ? (
                    <div
                      style={{
                        marginTop: 20,
                        paddingTop: 18,
                        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      <p style={{ ...STRATEGY_MSG_SUBHEAD, marginBottom: 10 }}>Phrases to avoid</p>
                      <ul
                        className="strategy-suite-ul strategy-suite-ul--muted"
                        style={{
                          ...STRATEGY_LIST,
                          color: MID_GRAY,
                          fontSize: 14,
                          lineHeight: 1.55,
                        }}
                      >
                        {ms.whatNotToSay
                          .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
                          .slice(0, 8)
                          .map((line) => (
                            <li key={line}>
                              {line}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <ReportCallout label="Strategy narrative" accentColor={BLUE}>
              <p style={{ margin: 0, fontSize: 15, color: TEXT_BODY, lineHeight: 1.58, fontFamily: SUITE_FONT_UI }}>
                {fallbackStrategyNarrative}
              </p>
              <p style={{ margin: "10px 0 0", fontSize: 14, color: MID_GRAY, lineHeight: 1.55, fontFamily: SUITE_FONT_UI }}>
                When your product includes the full strategic narrative, executive synthesis, positioning, differentiation,
                and a structured messaging system appear here automatically. Until then, use the topic panels below and your
                Workbook to deepen each thread.
              </p>
            </ReportCallout>
          )}
        </StrategyDomainSection>
      ) : null}

      <StrategyPlanNarrativePanels
        sections={strategyPlanSections}
        firstOrdinal={marketingBlockCount + 1}
        firstGradientIndex={marketingBlockCount}
      />

      {strategySectionsVisible.length > 0 ? (
        <div className="flex flex-col gap-10 md:gap-12">
          <div className="max-w-3xl">
            <p className="text-[14px] font-semibold tracking-[0.08em] text-brand-blue">Reference panels</p>
            <h3 className="bs-h3 mt-2 text-brand-navy">Strategy by domain</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted sm:text-base">
              Use these panels for one slice of the plan at a time—audience, journey, channels, spend, and priorities. Audience
              and customer sections use labeled cards and grids so you can scan by segment instead of one long block. Activation
              is where the plan turns into channel-specific execution.
            </p>
          </div>
          {strategySectionsVisible.map((section, di) => {
          const journeyParsed =
            section.id === "buyer-journey-map" ? parseBuyerJourneyStages(section.body) : null;
          const domainOrdinal = marketingBlockCount + narrativeBlockCount + di + 1;
          const domainGradientIndex = marketingBlockCount + narrativeBlockCount + di;

          return (
          <StrategyDomainSection
            key={section.id}
            id={`strategy-${section.id}`}
            sectionNumber={String(domainOrdinal).padStart(2, "0")}
            eyebrow="Topic"
            title={section.label}
            intro={section.summary}
            gradient={strategyDomainGradient(domainGradientIndex)}
            headerAside={
              <button
                type="button"
                className="strategy-workbook-btn"
                onClick={() => onEditInWorkbook(section.workbookSectionId)}
                style={WORKBOOK_BTN_STYLE}
              >
                Edit in Workbook
              </button>
            }
          >
            <div>
            {section.id === "icp-personas" ? (
              <StrategyAudienceProfilesLayout
                diagnostic={diagnosticData as Record<string, unknown>}
                companyName={companyName}
                industry={industry}
                audienceShort={audienceShort}
                targetAudience={targetAudience}
                fallbackBody={section.body}
              />
            ) : null}
            {section.id === "persona-atlas" ? (
              <StrategyBuyerPersonasLayout
                buyerPersonas={diagnosticData.buyerPersonas}
                summaryText={personaAtlasSummary}
                fallbackBody={section.body}
                reportId={reportIdForPersonas}
                companyName={companyName}
                diagnostic={diagnosticData as Record<string, unknown>}
                primaryPillar={primaryPillar}
                topGap={topGaps[0] ?? topGap}
              />
            ) : null}
            {section.id === "spend-roadmap" ? <SpendRolesHubVisual hubLabel={companyName} /> : null}
            {section.id === "execution-priorities" && strategicPriorities.length > 0 ? (
              <StrategicPrioritiesBarChart items={strategicPriorities} />
            ) : null}
            {!(
              (section.id === "buyer-journey-map" && journeyParsed) ||
              section.id === "archetype-voice" ||
              section.id === "icp-personas" ||
              section.id === "persona-atlas" ||
              section.id === "channel-strategy" ||
              section.id === "strategic-offer"
            ) ? (
              <StrategyProseBody
                text={section.body}
                paragraphStyle={{
                  margin: 0,
                  fontSize: 15,
                  color: TEXT_BODY,
                  lineHeight: 1.58,
                  fontFamily: SUITE_FONT_UI,
                  whiteSpace: "pre-line",
                }}
              />
            ) : null}
            {section.id === "strategic-offer" && strategicOfferUseVisualLayout && strategicOfferVm ? (
              <StrategicOfferPortfolioLayout model={strategicOfferVm} />
            ) : null}
            {section.id === "strategic-offer" && !strategicOfferUseVisualLayout ? (
              <StrategyProseBody
                text={section.body}
                paragraphStyle={{
                  margin: 0,
                  fontSize: 15,
                  color: TEXT_BODY,
                  lineHeight: 1.58,
                  fontFamily: SUITE_FONT_UI,
                  whiteSpace: "pre-line",
                }}
              />
            ) : null}
            {section.id === "archetype-voice" ? (
              <div>
                <StrategyProseBody
                  text={section.body}
                  paragraphStyle={{
                    margin: 0,
                    fontSize: 15,
                    color: TEXT_BODY,
                    lineHeight: 1.58,
                    fontFamily: SUITE_FONT_UI,
                    whiteSpace: "pre-line",
                  }}
                />
                {openFoundationSection ? (
                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className="strategy-workbook-btn"
                      onClick={() => openFoundationSection(FOUNDATION_VOICE_EXPRESSION_ANCHOR_ID)}
                      style={{
                        ...WORKBOOK_BTN_STYLE,
                        borderColor: BLUE,
                        color: NAVY,
                      }}
                    >
                      Open Foundation → Voice &amp; Expression
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
            {section.id === "buyer-journey-map" ? (
              <JourneyMapVisual
                title="Journey at a glance"
                caption={
                  journeyParsed
                    ? "Each tile matches a stage below—the summary here, the full strategic thought under each eyebrow."
                    : undefined
                }
                stages={
                  journeyParsed
                    ? journeyParsed.map((s) => ({
                        label: s.label,
                        focus: summarizeJourneyTile(s.narrative),
                      }))
                    : defaultJourneyMapStages
                }
              />
            ) : null}
            {section.id === "buyer-journey-map" && journeyParsed ? (
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
                {journeyParsed.map((stage, i) => {
                  const chrome = getJourneyMapTileChrome(stage.label, i);
                  return (
                    <div
                      key={`${stage.key}-${i}`}
                      style={{
                        borderRadius: SUITE_RADIUS_MD,
                        border: `1px solid ${chrome.border}`,
                        background: `linear-gradient(145deg, ${chrome.bgFrom} 0%, ${chrome.bgTo} 100%)`,
                        boxShadow: `0 4px 16px ${chrome.leftRail}24`,
                        padding: "16px 18px",
                        borderTopWidth: 3,
                        borderTopStyle: "solid",
                        borderTopColor: chrome.leftRail,
                        borderLeftWidth: 4,
                        borderLeftStyle: "solid",
                        borderLeftColor: chrome.leftRail,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <span
                          style={{
                            flexShrink: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            borderRadius: "999px",
                            fontSize: 13,
                            fontWeight: 800,
                            color: "#FFFFFF",
                            background: chrome.numberBg,
                            fontFamily: SUITE_FONT_UI,
                          }}
                          aria-hidden
                        >
                          {i + 1}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p
                            style={{
                              margin: "0 0 6px",
                              fontSize: 13,
                              fontWeight: 800,
                              letterSpacing: "0.04em",
                              color: journeyStageTitleColor(chrome),
                              fontFamily: SUITE_FONT_UI,
                            }}
                          >
                            {stage.label}
                          </p>
                          <p
                            style={{
                              margin: "0 0 10px",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              color: MID_GRAY,
                              fontFamily: SUITE_FONT_UI,
                            }}
                          >
                            {chrome.cue}
                          </p>
                          <p style={JOURNEY_STAGE_BODY}>{stage.narrative}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
            {section.id === "channel-strategy" ? (
              <div>
                <ReportCallout label="Strategy vs Activation" accentColor={BLUE}>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, fontFamily: SUITE_FONT_UI }}>
                    This topic is <strong style={{ color: NAVY }}>strategic framing</strong>: which channel types own which
                    jobs in the buyer story. Your operational plan—calendars, sequences, channel-specific copy, and
                    checklists—lives on the <strong style={{ color: NAVY }}>Activation</strong> tab.
                  </p>
                </ReportCallout>
                <ChannelMixHubVisual hubLabel={companyName} />
                <div style={{ marginTop: 18 }}>
                  <StrategyProseBody
                    text={section.body}
                    paragraphStyle={{
                      margin: 0,
                      fontSize: 15,
                      color: TEXT_BODY,
                      lineHeight: 1.58,
                      fontFamily: SUITE_FONT_UI,
                      whiteSpace: "pre-line",
                    }}
                  />
                </div>
                {suiteNav ? (
                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className="strategy-workbook-btn"
                      onClick={() => suiteNav.openTab("activation")}
                      style={{
                        ...WORKBOOK_BTN_STYLE,
                        borderColor: BLUE,
                        color: NAVY,
                      }}
                    >
                      Open Activation → channel plans
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
            {section.id === "competitive-matrix" && (
              <SwotVisual
                namedCompetitors={namedCompetitorsForMatrix}
                strengths={topStrengths}
                weaknesses={topGaps}
                opportunities={[
                  `Scale ${primaryPillar.toLowerCase()} messaging consistency.`,
                  `Operationalize ${firstPriority.toLowerCase()} across channels.`,
                ]}
                threats={
                  namedCompetitorsForMatrix.length > 0
                    ? [
                        `Your positioning map names: ${namedCompetitorsForMatrix.map((c) => c.name).join(", ")}. They win when buyers see sharper proof or a clearer path to value.`,
                        "Message dilution from inconsistent execution makes displacement harder against any named alternative.",
                      ]
                    : [
                        "Competitors with clearer proof architecture.",
                        "Message dilution from inconsistent execution.",
                      ]
                }
              />
            )}
            {(expandedContent[section.id] || sectionGuidance[section.id] || doDontGuidance[section.id]) && (
              <details className="strategy-impl-details" style={{ marginTop: 16, fontFamily: SUITE_FONT_UI }}>
                <summary className="strategy-impl-summary">
                  <span className="strategy-impl-summary-label">Applying this topic</span>
                </summary>
                <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                  {expandedContent[section.id] ? (
                    <>
                      <ReportCallout label="Why this matters" accentColor={BLUE}>
                        {expandedContent[section.id].whyItMatters}
                      </ReportCallout>
                      <ReportCallout label="Same intent, broader wording" accentColor={BLUE}>
                        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, fontFamily: SUITE_FONT_UI }}>
                          {expandedContent[section.id].parallelPlainRead}
                        </p>
                        <p
                          style={{
                            margin: "10px 0 0",
                            fontSize: 13,
                            color: MID_GRAY,
                            lineHeight: 1.5,
                            fontFamily: SUITE_FONT_UI,
                          }}
                        >
                          Optional when you brief founders, finance, or vendors. Your marketing lead can still rely on
                          the numbered actions and metrics below.
                        </p>
                      </ReportCallout>
                      <div style={EXEC_NOTE_CARD}>
                        <p style={{ ...STRATEGY_IMPL_SUBHEAD, margin: "0 0 8px" }}>90-day actions</p>
                        <ol className="m-0 list-decimal space-y-1.5 pl-4 text-sm leading-relaxed text-brand-midnight sm:text-[15px]">
                          {expandedContent[section.id].actions.map((action, index) => (
                            <li
                              key={`${section.id}-action-${index}`}
                              style={{ fontFamily: SUITE_FONT_UI, color: TEXT_BODY, lineHeight: 1.55 }}
                            >
                              {action}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={EXEC_HIGHLIGHT_CARD}>
                          <p style={STRATEGY_IMPL_SUBHEAD}>Success metric</p>
                          <p style={{ margin: "6px 0 0", fontSize: 14, color: TEXT_BODY, lineHeight: 1.5, fontFamily: SUITE_FONT_UI }}>
                            {expandedContent[section.id].successMetric}
                          </p>
                        </div>
                        <div style={EXEC_MUTED_CARD}>
                          <p style={STRATEGY_IMPL_SUBHEAD}>Risk if ignored</p>
                          <p style={{ margin: "6px 0 0", fontSize: 14, color: MID_GRAY, lineHeight: 1.5, fontFamily: SUITE_FONT_UI }}>
                            {expandedContent[section.id].risk}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : null}
                  {sectionGuidance[section.id] ? (
                    <ReportCallout label="Strategic application" accentColor={BLUE}>
                      <PersonalizedGuidanceCard
                        title={sectionGuidance[section.id].title}
                        doText={sectionGuidance[section.id].doText}
                        dontText={sectionGuidance[section.id].dontText}
                        example={sectionGuidance[section.id].example}
                      />
                    </ReportCallout>
                  ) : null}
                  {doDontGuidance[section.id] ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={EXEC_DO_GUIDANCE_CARD}>
                        <p style={{ ...STRATEGY_IMPL_SUBHEAD, color: SEMANTIC_DO.label }}>Do</p>
                        <ul
                          className="strategy-suite-ul m-0 mt-2 text-sm leading-relaxed sm:text-[15px]"
                          style={{ fontFamily: SUITE_FONT_UI, color: SEMANTIC_DO.text }}
                        >
                          {doDontGuidance[section.id].do.map((item, index) => (
                            <li key={`${section.id}-do-${index}`} className="leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div style={EXEC_DONT_GUIDANCE_CARD}>
                        <p style={{ ...STRATEGY_IMPL_SUBHEAD, color: SEMANTIC_DONT.label }}>Don&apos;t</p>
                        <ul
                          className="strategy-suite-ul m-0 mt-2 text-sm leading-relaxed sm:text-[15px]"
                          style={{ fontFamily: SUITE_FONT_UI, color: SEMANTIC_DONT.text }}
                        >
                          {doDontGuidance[section.id].dont.map((item, index) => (
                            <li key={`${section.id}-dont-${index}`} className="leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>
              </details>
            )}
            </div>
          </StrategyDomainSection>
          );
        })}
        </div>
      ) : null}

      <FoundationExtras slot="signals" data={diagnosticData as any} />

      <FoundationExtras slot="revenueImpact" data={diagnosticData as any} />

      <FoundationExtras slot="synthesis" data={diagnosticData as any} />
      </div>
    </TabPageWithSidebar>
  );
}
