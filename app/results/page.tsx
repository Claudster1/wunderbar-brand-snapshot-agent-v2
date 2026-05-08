// app/results/page.tsx
// Next.js page: accepts searchParams (e.g. reportId). With no reportId, prompts to complete a snapshot or redirect.

import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import nextDynamic from "next/dynamic";
import { ResultsHeroSection } from "@/src/components/results/ResultsHeroSection";
import { ResultsUpgradeCTA } from "@/components/results/ResultsUpgradeCTA";
import { ReportTierUpgradeCTAs } from "@/components/results/ReportTierUpgradeCTAs";
import { SuiteCTA } from "@/src/components/results/SuiteCTA";
import { ResultsPageViewTracker } from "@/components/results/ResultsPageViewTracker";
import { ImplementationIntro } from "@/components/SnapshotPlus/ImplementationIntro";
import TabSectionMenu from "@/components/results/TabSectionMenu";
import { ResultsBlockSkeleton } from "@/components/results/ResultsBlockSkeleton";
import { ContextCoveragePlaceholder } from "@/components/results/ContextCoveragePlaceholder";
import { getPrimaryPillar } from "@/lib/upgrade/primaryPillar";
import { PillarKey } from "@/src/types/pillars";
import type { UserRoleContext } from "@/src/types/snapshot";
import { HumanAssistCTA } from "@/app/results/components/HumanAssistCTA";
import { FoundationLockedPreview } from "@/app/results/components/FoundationLockedPreview";
import ResultsTabsShell from "@/components/results/ResultsTabsShell";
import {
  parseActivationPlanSectionId,
  parseResultsTabId,
  type ProductTier as ResultsTabTier,
} from "@/components/results/tabConfig";
import { isWorkbookSectionId } from "@/lib/workbookTypes";
import { wunderBrandScoreFromPillars } from "@/lib/wunderBrandScoreDisplay";
import FoundationBlueprintContent from "@/components/tabs/FoundationBlueprintContent";
import FoundationExtras from "@/components/FoundationExtras";
import { safeFetchJson } from "@/lib/resilience/safeFetch";
import { getArchetypeIcon, getArchetypeMeaning } from "@/lib/archetype/likelyArchetype";
import { buildActivationDiagnostics } from "@/lib/results/buildActivationDiagnostics";
import { buildResultsTabNavItems } from "@/lib/results/buildResultsTabNavItems";
import { normalizeBrandImageryDirection } from "@/lib/brand/brandImageryNormalize";
import { TAB_SECTION_NAV_HINT_CHIPS_ONLY } from "@/lib/copy/resultsSuiteGuidance";
import { resolveRuntimeBaseUrlForServerFetch } from "@/lib/server/runtimeBaseUrl";
import { SUITE_CHIP_CARD_STYLE, SUITE_SECTION_KICKER_CLASS } from "@/components/results/suiteBrandTokens";
import { SnapshotResultsLeadEmail } from "@/app/results/components/SnapshotResultsLeadEmail";
import { getChatTierConfig, type ChatTier } from "@/lib/chatTierConfig";

const PillarBreakdown = nextDynamic(
  () => import("@/components/PillarBreakdown").then((m) => ({ default: m.PillarBreakdown })),
  { loading: () => <ResultsBlockSkeleton label="Loading pillar analysis" /> },
);

const ContextCoverageMeter = nextDynamic(
  () => import("@/src/components/results/ContextCoverageMeter").then((m) => ({ default: m.ContextCoverageMeter })),
  { loading: () => <ResultsBlockSkeleton label="Loading context coverage" /> },
);

const ResultsSuiteVisualSummary = nextDynamic(
  () =>
    import("@/components/results/charts/ResultsSuiteVisualSummary").then((m) => ({
      default: m.ResultsSuiteVisualSummary,
    })),
  { loading: () => <ResultsBlockSkeleton label="Loading charts" /> },
);

const LockedResultsPreview = nextDynamic(
  () => import("@/app/results/components/LockedResultsPreview").then((m) => ({ default: m.LockedResultsPreview })),
  { loading: () => <ResultsBlockSkeleton label="Loading Snapshot+ preview" /> },
);

interface BrandSnapshotResult {
  businessName: string;
  brandAlignmentScore: number; // 0-100
  pillarScores: Record<PillarKey, number>;
  pillarInsights: Record<PillarKey, string>;
  stage: "early" | "scaling" | "growing";
  contextCoverage?: number; // 0-100, optional
  contextCoverageDetails?: {
    overallPercent: number;
    areas: Array<{ name: string; percent: number; status?: string }>;
    contextGaps: string[];
  };
  userRoleContext?: string; // optional user role context
  userEmail?: string; // optional user email for access check
  reportId: string;
  user?: {
    hasSnapshotPlus: boolean;
    hasBlueprint: boolean;
    hasBlueprintPlus: boolean;
  };
}

interface ResultsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

type BudgetBand = "under_500" | "500_2000" | "2000_5000" | "5000_plus";
type ProductTier = "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";
type SignalSeverity = "low" | "medium" | "high";

function asBudgetBand(value: unknown): BudgetBand | null {
  return value === "under_500" ||
    value === "500_2000" ||
    value === "2000_5000" ||
    value === "5000_plus"
    ? value
    : null;
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

function extractStringArray(...candidates: unknown[]): string[] {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const values = candidate.filter(
        (value): value is string => typeof value === "string" && value.trim().length > 0,
      );
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

function resolveProductTier(report: Record<string, unknown>): ProductTier {
  const metaTier = (report.full_report as { _meta?: { tier?: string } } | undefined)?._meta?.tier;
  if (metaTier === "blueprint_plus" || metaTier === "blueprint-plus") return "blueprint_plus";
  if (metaTier === "blueprint") return "blueprint";
  if (metaTier === "snapshot_plus" || metaTier === "snapshot-plus") return "snapshot_plus";

  const productTier = typeof report.product_tier === "string" ? report.product_tier : "";
  if (productTier === "blueprint_plus" || productTier === "blueprint-plus") return "blueprint_plus";
  if (productTier === "blueprint") return "blueprint";
  if (productTier === "snapshot_plus" || productTier === "snapshot-plus") return "snapshot_plus";

  const user = (report.user ?? {}) as Record<string, unknown>;
  if (user.hasBlueprintPlus === true || user.has_blueprint_plus === true) return "blueprint_plus";
  if (user.hasBlueprint === true || user.has_blueprint === true) return "blueprint";
  if (user.hasSnapshotPlus === true || user.has_snapshot_plus === true) return "snapshot_plus";
  return "snapshot";
}

function getUpstreamPillar(
  pillarScores: Record<PillarKey, number>,
  primaryPillar: PillarKey
): PillarKey {
  const ordered = (Object.entries(pillarScores) as Array<[PillarKey, number]>)
    .sort((a, b) => a[1] - b[1])
    .map(([pillar]) => pillar);
  return ordered.find((pillar) => pillar !== primaryPillar) ?? primaryPillar;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const raw = searchParams != null ? await searchParams : undefined;
  const resolved = raw ?? {};
  const reportId = (typeof resolved.reportId === "string" ? resolved.reportId : resolved.reportId?.[0])
    ?? (typeof resolved.id === "string" ? resolved.id : resolved.id?.[0]);
  const initialResultsTab = parseResultsTabId(resolved.tab);
  const initialActivationPlanId = parseActivationPlanSectionId(resolved.activationPlanId);
  const workbookSectionRaw =
    typeof resolved.workbookSection === "string"
      ? resolved.workbookSection
      : Array.isArray(resolved.workbookSection)
        ? resolved.workbookSection[0]
        : undefined;
  const initialWorkbookSectionId = isWorkbookSectionId(workbookSectionRaw) ? workbookSectionRaw : undefined;

  const activationFocusRaw =
    typeof resolved.activationFocus === "string"
      ? resolved.activationFocus
      : Array.isArray(resolved.activationFocus)
        ? resolved.activationFocus[0]
        : undefined;
  const activationFocusFromUrl =
    typeof activationFocusRaw === "string" && activationFocusRaw.trim() ? activationFocusRaw.trim() : undefined;

  if (reportId && reportId.startsWith("preview-")) {
    redirect("/preview/results-tabs");
  }

  // No reportId: redirect to brand-snapshot results entry or show prompt
  if (!reportId || reportId === "preview-mock") {
    return (
      <main className="min-h-screen bg-brand-bg font-brand flex flex-col items-center justify-center px-4 py-16">
        <div className="bs-container-narrow max-w-[700px] mx-auto text-center">
          <h1 className="bs-h1 mb-3">Your results</h1>
          <p className="bs-body mb-6 text-brand-midnight">
            Complete a WunderBrand Snapshot™ to see your results here, or open your results from the link we sent you.
          </p>
          <Link href="/brand-snapshot" className="btn-primary">
            Start WunderBrand Snapshot™
          </Link>
        </div>
      </main>
    );
  }

  // Fetch report and render full results (server component)
  const baseUrl = await resolveRuntimeBaseUrlForServerFetch();
  const reportResponse = await safeFetchJson<any>(
    `${baseUrl}/api/snapshot/get?id=${encodeURIComponent(reportId)}`,
    { cache: "no-store", retries: 2, timeoutMs: 7000 },
  );
  if (!reportResponse.ok || !reportResponse.data) {
    return (
      <main className="min-h-screen bg-brand-bg font-brand flex flex-col items-center justify-center px-4 py-16">
        <div className="bs-container-narrow max-w-[700px] mx-auto text-center">
          <h1 className="bs-h1 mb-3">Results not found</h1>
          <p className="bs-body mb-6 text-brand-midnight">These results may have been removed or the link is incorrect.</p>
          <Link href="/brand-snapshot" className="text-brand-blue font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded">Start a new WunderBrand Snapshot™</Link>
        </div>
      </main>
    );
  }

  const report = reportResponse.data as any;
  const pillarScores = (report.pillar_scores || report.pillarScores || {}) as Record<PillarKey, number>;
  const pillarInsightsRaw = report.pillar_insights || report.insights || {};
  const rawRecommendations = report.recommendations;
  const recommendationsList = Array.isArray(rawRecommendations)
    ? rawRecommendations
    : rawRecommendations && typeof rawRecommendations === "object"
      ? (Object.values(rawRecommendations).filter(
          (r): r is string => typeof r === "string"
        ) as string[])
      : [];
  const pillarInsights: Record<PillarKey, string> = {} as Record<PillarKey, string>;
  for (const key of ["positioning", "messaging", "visibility", "credibility", "conversion"] as PillarKey[]) {
    const v = pillarInsightsRaw[key];
    pillarInsights[key] = typeof v === "string" ? v : (v && typeof v === "object" && "strength" in v)
      ? [v.strength, v.opportunity].filter(Boolean).join(" ")
      : "No insight available.";
  }

  const rawContextCoverage =
    report.contextCoverage ||
    report.context_coverage ||
    report.full_report?.contextCoverage ||
    report.full_report?.context_coverage;
  const contextCoverageDetails =
    rawContextCoverage &&
    typeof rawContextCoverage === "object" &&
    !Array.isArray(rawContextCoverage) &&
    typeof rawContextCoverage.overallPercent === "number"
      ? {
          overallPercent: rawContextCoverage.overallPercent,
          areas: Array.isArray(rawContextCoverage.areas) ? rawContextCoverage.areas : [],
          contextGaps: Array.isArray(rawContextCoverage.contextGaps)
            ? rawContextCoverage.contextGaps
            : [],
        }
      : undefined;
  const contextCoveragePercent =
    contextCoverageDetails?.overallPercent ??
    (typeof rawContextCoverage === "number" ? rawContextCoverage : undefined);

  const data: BrandSnapshotResult = {
    businessName: report.company_name || report.company || "Your brand",
    brandAlignmentScore: wunderBrandScoreFromPillars(report),
    pillarScores,
    pillarInsights,
    stage: (report.snapshot_stage || report.stage || "early") as "early" | "scaling" | "growing",
    contextCoverage: contextCoveragePercent,
    contextCoverageDetails,
    userRoleContext: report.user_role_context,
    userEmail: report.user_email ?? report.email,
    reportId: report.report_id || reportId,
    user: report.user
      ? {
          hasSnapshotPlus: !!(report.user.hasSnapshotPlus || report.user.has_snapshot_plus),
          hasBlueprint: !!(report.user.hasBlueprint || report.user.has_blueprint),
          hasBlueprintPlus: !!(report.user.hasBlueprintPlus || report.user.has_blueprint_plus),
        }
      : undefined,
  };

  const primaryResult = getPrimaryPillar(data.pillarScores);
  const primaryPillar =
    primaryResult.type === "tie"
      ? primaryResult.pillars?.[0] ?? primaryResult.pillar
      : primaryResult.pillar;
  const primaryPillarStr = (primaryPillar ?? "positioning") as PillarKey;
  const productTier = resolveProductTier(report as Record<string, unknown>);
  const hasSnapshotPlusAccess = productTier !== "snapshot";
  const reportAnswers = (report.full_report?.answers ?? report.answers ?? {}) as Record<string, unknown>;
  const businessType =
    typeof reportAnswers.businessType === "string" ? reportAnswers.businessType : null;
  const monthlyMarketingBudget = asBudgetBand(reportAnswers.monthlyMarketingBudget);
  const monthlyRevenueRange =
    typeof reportAnswers.monthlyRevenueRange === "string"
      ? reportAnswers.monthlyRevenueRange
      : null;
  const annualRevenueRange =
    typeof reportAnswers.revenueRange === "string" ? reportAnswers.revenueRange : null;
  const averageTransactionValue =
    typeof reportAnswers.averageTransactionValue === "string"
      ? reportAnswers.averageTransactionValue
      : null;
  const conversionRateEstimate =
    typeof reportAnswers.conversionRateEstimate === "string"
      ? reportAnswers.conversionRateEstimate
      : null;
  const likelyArchetype = extractLikelyArchetype(report as Record<string, unknown>, reportAnswers);
  const secondaryArchetype = (() => {
    const candidates: unknown[] = [
      report.secondary_archetype,
      (report.full_report as { secondary_archetype?: unknown } | undefined)?.secondary_archetype,
      reportAnswers.secondaryArchetype,
      reportAnswers.secondary_archetype,
    ];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    }
    return null;
  })();
  const secondaryArchetypeMeaning = secondaryArchetype ? getArchetypeMeaning(secondaryArchetype) : null;
  const topStrengths = extractStringArray(
    report.top_strengths,
    report.strengths,
    (report.full_report as { top_strengths?: unknown } | undefined)?.top_strengths,
  ).slice(0, 3);
  const topGaps = extractStringArray(
    report.top_gaps,
    report.gaps,
    (report.full_report as { top_gaps?: unknown } | undefined)?.top_gaps,
  ).slice(0, 3);
  const voiceAttributes = extractStringArray(
    report.voice_attributes,
    (report.full_report as { voice_attributes?: unknown } | undefined)?.voice_attributes,
    reportAnswers.voiceAttributes,
  ).slice(0, 4);
  const targetAudience =
    typeof reportAnswers.targetAudience === "string"
      ? reportAnswers.targetAudience
      : typeof reportAnswers.primaryAudience === "string"
        ? reportAnswers.primaryAudience
        : "Your highest-fit audience segment";
  const secondaryAudience = (() => {
    const candidates: unknown[] = [
      report.secondary_audience,
      (report.full_report as { secondary_audience?: unknown } | undefined)?.secondary_audience,
      reportAnswers.secondaryAudience,
      reportAnswers.secondary_audience,
      (report.enrichment as { secondaryAudience?: unknown } | undefined)?.secondaryAudience,
    ];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    }
    return "";
  })();
  const tertiaryAudience = (() => {
    const candidates: unknown[] = [
      report.tertiary_audience,
      (report.full_report as { tertiary_audience?: unknown } | undefined)?.tertiary_audience,
      reportAnswers.tertiaryAudience,
      reportAnswers.tertiary_audience,
      (report.enrichment as { tertiaryAudience?: unknown } | undefined)?.tertiaryAudience,
    ];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    }
    return "";
  })();
  const industry =
    typeof reportAnswers.industry === "string"
      ? reportAnswers.industry
      : typeof reportAnswers.businessType === "string"
        ? reportAnswers.businessType
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
  const scheduleRows = defaultChannels.map((channel, index) => ({
    week: Math.floor(index / 3) + 1,
    channel,
    contentType: channel === "Email" ? "Sequence" : channel === "SEO" ? "Article" : "Post",
    assetTopic: recommendationsList[index % Math.max(recommendationsList.length, 1)] ?? `Priority activation item ${index + 1}`,
    messagePillar: toTitleLabel(primaryPillarStr),
    funnelStage: index % 2 === 0 ? "Problem-Aware" : "Solution-Aware",
    primaryCta: "Book Strategy Call",
    owner: "",
    status: "Not Started" as const,
    dueDate: `Week ${Math.floor(index / 3) + 1}`,
  }));

  const archetypeMeaning = getArchetypeMeaning(likelyArchetype);
  const archetypeIcon = getArchetypeIcon(likelyArchetype);
  const tabTier: ResultsTabTier =
    productTier === "snapshot_plus"
      ? "snapshot-plus"
      : productTier === "blueprint_plus"
        ? "blueprint-plus"
        : productTier;
  const showSnapshotLeadEmail =
    (productTier === "snapshot" || productTier === "snapshot_plus") &&
    !(typeof data.userEmail === "string" && data.userEmail.trim());
  const snapshotLeadChatTier: ChatTier = productTier === "snapshot_plus" ? "snapshot-plus" : "snapshot";
  const snapshotLeadProductName = getChatTierConfig(snapshotLeadChatTier).productName;
  const snapshotLeadFirstNameHint =
    typeof reportAnswers.userName === "string" && reportAnswers.userName.trim()
      ? reportAnswers.userName.trim().split(/\s+/)[0]
      : undefined;
  const upstreamPillar = getUpstreamPillar(data.pillarScores, primaryPillarStr);
  const primaryRecommendation = recommendationsList[0] ?? "Align your top-of-funnel narrative to the strongest audience need.";
  const competitiveSeverity: SignalSeverity =
    data.pillarScores[primaryPillarStr] >= 70
      ? "low"
      : data.pillarScores[primaryPillarStr] >= 55
        ? "medium"
        : "high";
  const spendEfficiencySeverity: SignalSeverity =
    (data.pillarScores.visibility ?? 0) >= 70
      ? "low"
      : (data.pillarScores.visibility ?? 0) >= 55
        ? "medium"
        : "high";
  const fullReport = report.full_report as Record<string, unknown> | undefined;
  const brandFoundation =
    (report.brandFoundation as Record<string, unknown> | undefined) ??
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
  const activationDx = buildActivationDiagnostics(fullReport, data.businessName);
  const channelPlans: Record<string, string> = { ...defaultChannelPlans };
  for (const [key, value] of Object.entries(activationDx.channelPlans)) {
    if (typeof value === "string" && value.trim()) channelPlans[key] = value;
  }

  const diagnosticData = {
    companyName: data.businessName,
    ...(businessType ? { businessType } : {}),
    reportId: data.reportId,
    userEmail: data.userEmail ?? "",
    resultsDeliveredAt:
      (typeof report.created_at === "string" && report.created_at) || new Date().toISOString(),
    industry,
    targetAudience,
    secondaryAudience,
    tertiaryAudience,
    primaryArchetype: likelyArchetype ?? "Archetype pending",
    secondaryArchetype: secondaryArchetype ?? "Secondary archetype pending",
    archetypeMeaning: archetypeMeaning ?? "",
    archetypeIcon: archetypeIcon ?? "",
    topStrengths,
    topGaps,
    voiceAttributes,
    businessName: data.businessName,
    productTier: tabTier,
    wunderBrandScore: data.brandAlignmentScore,
    pillarScores: data.pillarScores,
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
    revenueImpactStatement:
      `${data.businessName} currently has a WunderBrand Score™ of ${data.brandAlignmentScore}. ` +
      `Improving ${primaryPillarStr} alignment can increase conversion quality and reduce wasted marketing spend.`,
    brandHealthVerdict:
      `${data.businessName} is currently ${data.brandAlignmentScore >= 75 ? "strong" : data.brandAlignmentScore >= 60 ? "good" : "developing"} but inconsistent across key brand touchpoints.`,
    positioningMessagingFramework:
      recommendationsList[0] ??
      "Use one clear positioning promise and reinforce it with consistent message pillars across homepage, email, social, and sales narratives.",
    topOpportunity:
      recommendationsList[0] ??
      "Sharpen your highest-leverage message and apply it consistently across homepage, email, and social touchpoints.",
    synthesisPoints: [
      {
        label: "What to protect",
        content:
          recommendationsList[0] ??
          "Protect the message elements that already create immediate audience clarity and trust.",
      },
      {
        label: "What to prioritize",
        content:
          recommendationsList[1] ??
          "Prioritize the weakest high-impact pillar first so downstream activation improves faster.",
      },
      {
        label: "What unlocks growth",
        content:
          recommendationsList[2] ??
          "Consistent message-to-channel alignment creates compounding visibility, credibility, and conversion momentum.",
      },
    ],
    pillarDependencyExplanation:
      `Improving ${primaryPillarStr} depends on strengthening ${upstreamPillar} first, because upstream clarity determines how well downstream messaging performs.`,
    strategicPriorities,
    channelPlans,
    scheduleRows,
    brandFoundation,
    contextCoverage: data.contextCoverage,
    hasPriorityActions: recommendationsList.length > 0,
    ...(activationDx.personaIcpBanner ? { activationPersonaIcpBanner: activationDx.personaIcpBanner } : {}),
    ...(activationDx.audienceSegmentsBody ? { activationSegmentPlansBody: activationDx.audienceSegmentsBody } : {}),
    ...(activationDx.executionRoadmapBody ? { activationRoadmapPlansBody: activationDx.executionRoadmapBody } : {}),
    ...(activationDx.buyerJourneySummary ? { buyerJourneySummary: activationDx.buyerJourneySummary } : {}),
    ...(activationDx.competitiveMatrixSummary ? { competitiveMatrixSummary: activationDx.competitiveMatrixSummary } : {}),
    ...(fullReport?.paidMediaStrategy &&
    typeof fullReport.paidMediaStrategy === "object" &&
    !Array.isArray(fullReport.paidMediaStrategy)
      ? { paidMediaStrategy: fullReport.paidMediaStrategy }
      : {}),
    ...(fullReport?.icpConversionIntelligenceFramework &&
    typeof fullReport.icpConversionIntelligenceFramework === "object" &&
    !Array.isArray(fullReport.icpConversionIntelligenceFramework)
      ? { icpConversionIntelligenceFramework: fullReport.icpConversionIntelligenceFramework }
      : {}),
    ...(fullReport?.personaDrivenSegmentation &&
    typeof fullReport.personaDrivenSegmentation === "object" &&
    !Array.isArray(fullReport.personaDrivenSegmentation)
      ? { personaDrivenSegmentation: fullReport.personaDrivenSegmentation }
      : {}),
    ...(fullReport?.audiencePersonaDefinition &&
    typeof fullReport.audiencePersonaDefinition === "object" &&
    !Array.isArray(fullReport.audiencePersonaDefinition)
      ? { audiencePersonaDefinition: fullReport.audiencePersonaDefinition }
      : {}),
    ...(() => {
      const norm = normalizeBrandImageryDirection(
        fullReport?.brandImageryDirection ?? fullReport?.brand_imagery_direction,
      );
      const bsg = fullReport?.brandStandardsGuide;
      const extra: Record<string, unknown> = {};
      if (norm) {
        extra.brandImageryDirection = norm;
        extra.brand_imagery_direction = norm;
      }
      if (bsg && typeof bsg === "object" && !Array.isArray(bsg)) {
        extra.brandStandardsGuide = bsg;
      }
      return extra;
    })(),
    ...(() => {
      const fr = fullReport;
      if (!fr || typeof fr !== "object") return {};
      const direct = Array.isArray(fr.buyerPersonas) ? fr.buyerPersonas : null;
      const bpe = fr.buyerPersonaEcosystem as { buyerPersonas?: unknown[] } | undefined;
      const nested = Array.isArray(bpe?.buyerPersonas) ? bpe.buyerPersonas : null;
      const list = direct && direct.length > 0 ? direct : nested && nested.length > 0 ? nested : null;
      return list ? { buyerPersonas: list } : {};
    })(),
    ...(() => {
      const fr = fullReport;
      if (!fr || typeof fr !== "object") return {};
      const row = fr as Record<string, unknown>;
      const pick = (key: string): Record<string, unknown> => {
        const v = row[key];
        return v && typeof v === "object" && !Array.isArray(v) ? { [key]: v } : {};
      };
      const cp = row.contentPillars;
      const contentPillars = Array.isArray(cp) && cp.length > 0 ? { contentPillars: cp } : {};
      return {
        ...pick("executiveSummary"),
        ...pick("strategicAlignmentOverview"),
        ...pick("messagingSystem"),
        ...pick("measurementFramework"),
        ...pick("brandHealthScorecard"),
        ...pick("conversionStrategy"),
        ...pick("websiteCopyDirection"),
        ...pick("credibilityStrategy"),
        ...pick("salesConversationGuide"),
        ...pick("contentCalendarFramework"),
        ...pick("audiencePersonas"),
        ...(Array.isArray(row.icpGoToMarketPlans) && row.icpGoToMarketPlans.length > 0
          ? { icpGoToMarketPlans: row.icpGoToMarketPlans }
          : {}),
        ...pick("competitivePositioning"),
        ...contentPillars,
      };
    })(),
  };

  const resultsNavItems = buildResultsTabNavItems({ hasSnapshotPlusAccess });

  const resultsContent = (
    <div className="space-y-16 md:space-y-20">
      <ResultsPageViewTracker
        brandAlignmentScore={data.brandAlignmentScore}
        primaryPillar={primaryPillarStr}
        reportId={data.reportId}
        brandName={data.businessName}
        stage={data.stage}
        contextCoverage={data.contextCoverage}
        email={data.userEmail}
      />
      <div style={SUITE_CHIP_CARD_STYLE}>
        <TabSectionMenu
          title="On this page"
          items={resultsNavItems}
          description={TAB_SECTION_NAV_HINT_CHIPS_ONLY}
          suiteChipCardEmbed
        />
      </div>
      <section id="results-overview" className="scroll-mt-28">
        <ResultsHeroSection
          score={data.brandAlignmentScore}
          primaryPillar={primaryPillarStr}
          hasSnapshotPlus={hasSnapshotPlusAccess}
          userRoleContext={data.userRoleContext as UserRoleContext | undefined}
          executiveContext={{
            businessName: data.businessName,
            stage: data.stage,
            pillarScores: data.pillarScores,
            primaryPillar: primaryPillarStr,
            recommendationPreview: recommendationsList.slice(0, 3),
          }}
        />
      </section>

      {showSnapshotLeadEmail ? (
        <div id="email-results" className="scroll-mt-28 px-4 sm:px-0">
          <SnapshotResultsLeadEmail
            reportId={data.reportId}
            productTier={snapshotLeadChatTier === "snapshot-plus" ? "snapshot-plus" : "snapshot"}
            productName={snapshotLeadProductName}
            {...(snapshotLeadFirstNameHint ? { firstNameHint: snapshotLeadFirstNameHint } : {})}
          />
        </div>
      ) : null}

      <ResultsSuiteVisualSummary pillars={data.pillarScores} />

      {!hasSnapshotPlusAccess && (
        <div id="diagnostic-signals" className="scroll-mt-28">
          <FoundationExtras slot="signals" data={diagnosticData} />
        </div>
      )}
      <div id="pillar-analysis" className="scroll-mt-28">
        <PillarBreakdown
          pillars={data.pillarScores}
          insights={pillarInsightsRaw}
          businessName={data.businessName}
          stage={data.stage}
        />
      </div>

      <section
        id="priority-actions"
        className="scroll-mt-28 rounded-2xl border-2 border-brand-blue/20 bg-gradient-to-b from-white to-[#f4f9ff] p-6 sm:p-8 shadow-[0_6px_24px_rgba(2,24,89,0.06)]"
      >
        <div className="mb-7 pb-6 border-b border-brand-border/70 sm:mb-8">
          <p className={`${SUITE_SECTION_KICKER_CLASS} mb-4`}>Opportunities</p>
          <h2 className="bs-h3 mb-1">Priority Actions</h2>
          <p className="bs-body-sm text-brand-muted max-w-2xl m-0">
            Concrete moves derived from your diagnostic — distinct from pillar scores above.
          </p>
        </div>
        {recommendationsList.length > 0 ? (
          <ol
            className="list-none m-0 p-0 space-y-4"
            aria-label="Ranked priority actions from your diagnostic, up to five items"
          >
            {recommendationsList.slice(0, 5).map((item, idx) => (
              <li
                key={`${idx}-${item.slice(0, 30)}`}
                className="flex gap-4 items-start rounded-xl border border-brand-border/60 bg-white/90 p-4 sm:p-5 shadow-sm"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-brand-blue text-white text-sm font-bold tabular-nums shadow-sm"
                  aria-hidden
                >
                  {idx + 1}
                </span>
                <p className="bs-body-sm text-brand-midnight leading-relaxed m-0 pt-1">{item}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="bs-body-sm text-brand-muted m-0 max-w-2xl leading-relaxed">
            No ranked priority actions were returned for this report. Use the pillar analysis and your
            WunderBrand Score™ above to prioritize next steps, or complete the snapshot again with richer
            inputs if guidance still feels thin.
          </p>
        )}
      </section>

      {!hasSnapshotPlusAccess && (
        <section id="archetype" className="bs-card rounded-xl p-6 sm:p-7 border border-brand-border scroll-mt-28">
          <FoundationExtras slot="archetypeLocked" data={diagnosticData} />
        </section>
      )}

      {!hasSnapshotPlusAccess && (
        <div id="snapshot-plus-preview" className="space-y-16 md:space-y-20 scroll-mt-28">
          <FoundationLockedPreview likelyArchetype={likelyArchetype} />
          <LockedResultsPreview
            primaryPillar={primaryPillarStr}
            pillarScores={data.pillarScores}
            businessType={businessType}
            businessName={data.businessName}
            reportId={data.reportId}
            email={data.userEmail}
            likelyArchetype={likelyArchetype}
            archetypeMeaning={archetypeMeaning}
            archetypeIcon={archetypeIcon}
          />
        </div>
      )}

      <div id="context-coverage" className="scroll-mt-28">
        {data.contextCoverage !== undefined ? (
          <ContextCoverageMeter
            coveragePercent={data.contextCoverage}
            areas={data.contextCoverageDetails?.areas}
            contextGaps={data.contextCoverageDetails?.contextGaps}
          />
        ) : (
          <ContextCoveragePlaceholder />
        )}
      </div>

      <div id="implementation" className="scroll-mt-28">
        <ImplementationIntro variant={hasSnapshotPlusAccess ? "compact" : "default"} />
      </div>

      {!hasSnapshotPlusAccess && <SuiteCTA />}

      <div id="next-steps" className="space-y-8 md:space-y-10 scroll-mt-28">
        <div className="rounded-xl border border-brand-border bg-white p-6 sm:p-7">
          <p className={`${SUITE_SECTION_KICKER_CLASS} m-0 mb-2`}>Upgrade paths</p>
          <ReportTierUpgradeCTAs
            tier={tabTier}
            utmSource="results_page"
            downloadsHref={`/results?reportId=${encodeURIComponent(data.reportId)}&tab=downloads`}
            suppressSnapshotPlusPrimary={tabTier === "snapshot"}
          />
        </div>
        <HumanAssistCTA
          source="results_page"
          reportId={data.reportId}
          email={data.userEmail}
          businessName={data.businessName}
          businessType={businessType}
          primaryPillar={primaryPillarStr}
          brandAlignmentScore={data.brandAlignmentScore}
        />
        <ResultsUpgradeCTA
          primaryPillar={primaryPillarStr}
          stage={data.stage}
          hasPurchasedPlus={hasSnapshotPlusAccess}
          email={data.userEmail}
          reportId={data.reportId}
        />
      </div>
    </div>
  );

  const foundationContent = (
    <FoundationBlueprintContent
      businessName={data.businessName}
      targetAudience={targetAudience}
      industry={industry}
      primaryPillar={primaryPillarStr}
      primaryArchetype={likelyArchetype}
      secondaryArchetype={secondaryArchetype}
      diagnosticData={diagnosticData}
    />
  );

  return (
    <main className="min-h-screen font-brand" style={{ backgroundColor: "#F5F7FA" }}>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-brand-muted">
            Loading results…
          </div>
        }
      >
        <ResultsTabsShell
          key={[
            data.reportId,
            initialResultsTab ?? "_",
            initialWorkbookSectionId ?? "_",
            initialActivationPlanId ?? "_",
          ].join("|")}
          productTier={tabTier}
          resultsContent={resultsContent}
          foundationContent={foundationContent}
          diagnosticData={diagnosticData}
          initialActiveTab={initialResultsTab}
          initialWorkbookSectionId={initialWorkbookSectionId}
          initialActivationPlanId={initialActivationPlanId}
          activationFocus={activationFocusFromUrl}
        />
      </Suspense>
    </main>
  );
}
