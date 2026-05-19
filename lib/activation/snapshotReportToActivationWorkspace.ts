import { buildActivationDiagnostics } from "@/lib/results/buildActivationDiagnostics";
import { normalizeBrandImageryDirection } from "@/lib/brand/brandImageryNormalize";
import { ensurePaidMediaChannelsMinimum } from "@/lib/activation/paidMediaPlanFields";
import { getArchetypeIcon, getArchetypeMeaning } from "@/lib/archetype/likelyArchetype";
import { getPrimaryPillar } from "@/lib/upgrade/primaryPillar";
import type { ProductTier } from "@/components/results/tabConfig";
import {
  resolveStoredProductTier,
  storedTierToTabTier,
  type StoredProductTier,
} from "@/lib/results/resolveReportProductTier";
import type { PillarKey } from "@/src/types/pillars";

/** Matches ExecutionSchedule row shape without importing a client module. */
export type ActivationScheduleRow = {
  week: number;
  channel: string;
  contentType: string;
  assetTopic: string;
  messagePillar: string;
  funnelStage: string;
  primaryCta: string;
  owner: string;
  status: "Not Started" | "In Progress" | "Done" | "Skipped";
  dueDate?: string;
};

function extractStringArray(...candidates: unknown[]): string[] {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const values = candidate.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
      if (values.length > 0) return values;
    }
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate
        .split(/[,\n]/)
        .map((value) => value.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function toTitleLabel(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function extractLikelyArchetype(report: Record<string, unknown>, answers: Record<string, unknown>): string | null {
  const candidates: unknown[] = [
    report.likely_archetype,
    report.brand_archetype,
    report.archetype,
    report.primary_archetype,
    answers.likelyArchetype,
    answers.brandArchetype,
    answers.archetype,
    answers.primaryArchetype,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return null;
}

function getUpstreamPillar(pillarScores: Record<PillarKey, number>, primaryPillar: PillarKey): PillarKey {
  const ordered = (Object.entries(pillarScores) as Array<[PillarKey, number]>)
    .sort((a, b) => a[1] - b[1])
    .map(([pillar]) => pillar);
  return ordered.find((pillar) => pillar !== primaryPillar) ?? primaryPillar;
}

/**
 * Builds Activation-tab diagnostic input + schedule rows from a snapshot/get payload.
 * Used by the standalone activation plan page; mirrors app/results/page.tsx essentials.
 */
export function snapshotReportToActivationWorkspace(
  report: unknown,
  reportIdFallback: string,
): {
  diagnosticData: Record<string, unknown>;
  scheduleRows: ActivationScheduleRow[];
  productTier: ProductTier;
} | null {
  if (!report || typeof report !== "object") return null;
  const r = report as Record<string, unknown>;
  const pillarScores = (r.pillar_scores || r.pillarScores || {}) as Record<PillarKey, number>;
  const rawRecommendations = r.recommendations;
  const recommendationsList = Array.isArray(rawRecommendations)
    ? rawRecommendations
    : rawRecommendations && typeof rawRecommendations === "object"
      ? (Object.values(rawRecommendations).filter((x): x is string => typeof x === "string") as string[])
      : [];

  const dataBusinessName = (r.company_name || r.company || "Your brand") as string;
  const dataReportId = (r.report_id || reportIdFallback) as string;
  const userEmail = (typeof r.user_email === "string" ? r.user_email : typeof r.email === "string" ? r.email : "") as string;

  const primaryResult = getPrimaryPillar(pillarScores);
  const primaryPillar =
    primaryResult.type === "tie"
      ? primaryResult.pillars?.[0] ?? primaryResult.pillar
      : primaryResult.pillar;
  const primaryPillarStr = (primaryPillar ?? "positioning") as PillarKey;

  const storedTier = resolveStoredProductTier(r);
  const productTier = storedTierToTabTier(storedTier);

  const reportAnswers = (r.full_report && typeof r.full_report === "object"
    ? (r.full_report as { answers?: Record<string, unknown> }).answers
    : r.answers) as Record<string, unknown> | undefined;
  const answers = reportAnswers ?? {};

  const likelyArchetype = extractLikelyArchetype(r, answers);
  const archetypeMeaning = getArchetypeMeaning(likelyArchetype);
  const archetypeIcon = getArchetypeIcon(likelyArchetype);

  const topStrengths = extractStringArray(
    r.top_strengths,
    r.strengths,
    (r.full_report as { top_strengths?: unknown } | undefined)?.top_strengths,
  ).slice(0, 3);
  const topGaps = extractStringArray(
    r.top_gaps,
    r.gaps,
    (r.full_report as { top_gaps?: unknown } | undefined)?.top_gaps,
  ).slice(0, 3);
  const voiceAttributes = extractStringArray(
    r.voice_attributes,
    (r.full_report as { voice_attributes?: unknown } | undefined)?.voice_attributes,
    answers.voiceAttributes,
  ).slice(0, 4);

  const targetAudience =
    typeof answers.targetAudience === "string"
      ? answers.targetAudience
      : typeof answers.primaryAudience === "string"
        ? answers.primaryAudience
        : "Your highest-fit audience segment";

  const industry =
    typeof answers.industry === "string"
      ? answers.industry
      : typeof answers.businessType === "string"
        ? answers.businessType
        : "Your market category";

  const strategicPriorities = recommendationsList.slice(0, 3).map((item, index) => ({
    rank: index + 1,
    title: item.length > 72 ? `${item.slice(0, 69)}...` : item,
    why: item,
    pillar: toTitleLabel(primaryPillarStr),
    effort: index === 0 ? "Medium" : index === 1 ? "Medium" : "High",
    dependency: index === 1 ? toTitleLabel(primaryPillarStr) : undefined,
  }));

  const defaultChannels = [
    "Website",
    "Social",
    "Email",
    "SEO",
    "Sales",
    "Content",
    "Website",
    "Social",
    "Email",
    "SEO",
    "Content",
    "Sales",
  ];
  const scheduleRows: ActivationScheduleRow[] = defaultChannels.map((channel, index) => ({
    week: Math.floor(index / 3) + 1,
    channel,
    contentType: channel === "Email" ? "Sequence" : channel === "SEO" ? "Article" : "Post",
    assetTopic:
      recommendationsList[index % Math.max(recommendationsList.length, 1)] ?? `Priority activation item ${index + 1}`,
    messagePillar: toTitleLabel(primaryPillarStr),
    funnelStage: index % 2 === 0 ? "Problem-Aware" : "Solution-Aware",
    primaryCta: "Book Strategy Call",
    owner: "",
    status: "Not Started" as const,
    dueDate: `Week ${Math.floor(index / 3) + 1}`,
  }));

  const upstreamPillar = getUpstreamPillar(pillarScores, primaryPillarStr);
  const primaryRecommendation =
    recommendationsList[0] ?? "Align your top-of-funnel narrative to the strongest audience need.";
  const competitiveSeverity =
    pillarScores[primaryPillarStr] >= 70 ? "low" : pillarScores[primaryPillarStr] >= 55 ? "medium" : "high";
  const spendEfficiencySeverity =
    (pillarScores.visibility ?? 0) >= 70 ? "low" : (pillarScores.visibility ?? 0) >= 55 ? "medium" : "high";

  const fullReport = r.full_report as Record<string, unknown> | undefined;
  const brandFoundation =
    (r.brandFoundation as Record<string, unknown> | undefined) ??
    (fullReport?.brandFoundation as Record<string, unknown> | undefined);

  const defaultChannelPlans: Record<string, string> = {
    positioning:
      "Clarify your core positioning statement and align all outward-facing language to that promise before scaling channel activity.",
    messaging:
      "Build a three-pillar message system and map each campaign message back to one pillar to avoid drift.",
    "voice-copy":
      "Document voice attributes, on-brand language, and tone shifts by channel so copy remains consistent across contributors.",
    email:
      "Run sequence-driven email with one narrative thread per campaign, not disconnected sends.",
    social:
      "Publish around recurring content pillars with consistent hooks and CTA patterns tied to audience pain points.",
    website:
      "Audit key pages for positioning clarity, message alignment, and conversion intent. Rewrite highest-traffic sections first.",
    "content-seo":
      "Prioritize authority content that supports both discoverability and conversion while reflecting your archetype voice.",
    "lead-gen":
      "Create value-first conversion assets that bridge awareness to action through one clear promise and next step.",
    "strategic-planning":
      "Sequence work over 90 days: quick wins first, then foundation upgrades, then growth initiatives.",
    "persona-messaging":
      "Adapt emphasis by persona while preserving a consistent brand voice and strategic through-line.",
    "full-funnel":
      "Map messaging by buyer stage so awareness, nurture, and conversion content reinforce each other.",
    campaigns:
      "Build repeatable campaign systems for launch, quarterly planning, and advocacy to improve consistency and speed.",
    "advanced-strategy":
      "Use competitive and portfolio strategy prompts to protect positioning while scaling to new opportunities.",
  };

  const activationDx = buildActivationDiagnostics(fullReport, dataBusinessName);
  const channelPlans: Record<string, string> = { ...defaultChannelPlans };
  for (const [key, value] of Object.entries(activationDx.channelPlans)) {
    if (typeof value === "string" && value.trim()) channelPlans[key] = value;
  }

  const brandAlignmentScore = (r.brand_alignment_score ?? 0) as number;

  const diagnosticData: Record<string, unknown> = {
    companyName: dataBusinessName,
    reportId: dataReportId,
    userEmail,
    resultsDeliveredAt: (typeof r.created_at === "string" && r.created_at) || new Date().toISOString(),
    industry,
    targetAudience,
    primaryArchetype: likelyArchetype ?? "Archetype pending",
    archetypeMeaning: archetypeMeaning ?? "",
    archetypeIcon: archetypeIcon ?? "",
    topStrengths,
    topGaps,
    voiceAttributes,
    productTier,
    wunderBrandScore: brandAlignmentScore,
    pillarScores,
    primaryPillar: primaryPillarStr.charAt(0).toUpperCase() + primaryPillarStr.slice(1),
    upstreamPillar: upstreamPillar.charAt(0).toUpperCase() + upstreamPillar.slice(1),
    competitiveVulnerability: {
      severity: competitiveSeverity,
      summary: `Competitive pressure is concentrated around your ${primaryPillarStr} activation layer.`,
      implication:
        "Competitors with clearer language and stronger repetition can win attention even when your offer is stronger.",
      recommendation: primaryRecommendation,
    },
    marketingSpendEfficiency: {
      severity: spendEfficiencySeverity,
      summary: "Your current brand alignment is influencing how efficiently spend converts to qualified demand.",
      implication:
        "When positioning and visibility are misaligned, acquisition cost rises because your message attracts weaker-fit traffic.",
      recommendation:
        recommendationsList[1] ??
        "Prioritize one message pillar per channel and align CTA language to that pillar for the next 30 days.",
    },
    strategicPriorities,
    channelPlans,
    scheduleRows,
    brandFoundation,
    hasPriorityActions: recommendationsList.length > 0,
    ...(activationDx.personaIcpBanner ? { activationPersonaIcpBanner: activationDx.personaIcpBanner } : {}),
    ...(activationDx.audienceSegmentsBody ? { activationSegmentPlansBody: activationDx.audienceSegmentsBody } : {}),
    ...(activationDx.executionRoadmapBody ? { activationRoadmapPlansBody: activationDx.executionRoadmapBody } : {}),
    ...(activationDx.buyerJourneySummary ? { buyerJourneySummary: activationDx.buyerJourneySummary } : {}),
    ...(activationDx.competitiveMatrixSummary ? { competitiveMatrixSummary: activationDx.competitiveMatrixSummary } : {}),
  };

  if (Array.isArray(fullReport?.buyerPersonas) && fullReport.buyerPersonas.length > 0) {
    diagnosticData.buyerPersonas = fullReport.buyerPersonas;
  } else {
    const bpe = fullReport?.buyerPersonaEcosystem as { buyerPersonas?: unknown[] } | undefined;
    if (Array.isArray(bpe?.buyerPersonas) && bpe.buyerPersonas.length > 0) {
      diagnosticData.buyerPersonas = bpe.buyerPersonas;
    }
  }

  const spendRaw = fullReport?.spendRecommendationContext ?? fullReport?.spend_recommendation_context;
  if (spendRaw && typeof spendRaw === "object") {
    diagnosticData.spendRecommendationContext = spendRaw;
  }

  const paidRaw = fullReport?.paidMediaStrategy;
  if (paidRaw && typeof paidRaw === "object" && !Array.isArray(paidRaw)) {
    diagnosticData.paidMediaStrategy = ensurePaidMediaChannelsMinimum(paidRaw as Record<string, unknown>);
  }

  const icpRaw = fullReport?.icpConversionIntelligenceFramework;
  if (icpRaw && typeof icpRaw === "object" && !Array.isArray(icpRaw)) {
    diagnosticData.icpConversionIntelligenceFramework = icpRaw;
  }
  const personaSegRaw = fullReport?.personaDrivenSegmentation;
  if (personaSegRaw && typeof personaSegRaw === "object" && !Array.isArray(personaSegRaw)) {
    diagnosticData.personaDrivenSegmentation = personaSegRaw;
  }
  const audienceDefRaw = fullReport?.audiencePersonaDefinition;
  if (audienceDefRaw && typeof audienceDefRaw === "object" && !Array.isArray(audienceDefRaw)) {
    diagnosticData.audiencePersonaDefinition = audienceDefRaw;
  }

  const normalizedImagery = normalizeBrandImageryDirection(
    fullReport?.brandImageryDirection ?? fullReport?.brand_imagery_direction,
  );
  if (normalizedImagery) {
    diagnosticData.brandImageryDirection = normalizedImagery;
    diagnosticData.brand_imagery_direction = normalizedImagery;
  }

  const brandStandardsGuide = fullReport?.brandStandardsGuide;
  if (brandStandardsGuide && typeof brandStandardsGuide === "object" && !Array.isArray(brandStandardsGuide)) {
    diagnosticData.brandStandardsGuide = brandStandardsGuide;
  }

  if (Array.isArray(fullReport?.icpGoToMarketPlans) && fullReport.icpGoToMarketPlans.length > 0) {
    diagnosticData.icpGoToMarketPlans = fullReport.icpGoToMarketPlans;
  }

  return { diagnosticData, scheduleRows, productTier };
}
