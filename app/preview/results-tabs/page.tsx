"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ResultsTabsShell from "@/components/results/ResultsTabsShell";
import { ResultsHeroSection } from "@/src/components/results/ResultsHeroSection";
import { PillarBreakdown } from "@/components/PillarBreakdown";
import FoundationBlueprintContent from "@/components/tabs/FoundationBlueprintContent";
import { ContextCoverageMeter } from "@/src/components/results/ContextCoverageMeter";
import type { PillarKey } from "@/src/types/pillars";
import { parseActivationPlanSectionId, parseResultsTabId } from "@/components/results/tabConfig";
import { isWorkbookSectionId } from "@/lib/workbookTypes";
import {
  previewActivationContent,
  previewActivationScheduleRows,
  previewActivationStrategicPriorities,
  previewAudiencePersonaDefinition,
  previewIcpConversionIntelligenceFramework,
  previewPaidMediaStrategy,
  previewPersonaDrivenSegmentation,
} from "@/app/preview/results-tabs/previewActivationMockData";

const pillarScores: Record<PillarKey, number> = {
  positioning: 16,
  messaging: 14,
  visibility: 11,
  credibility: 13,
  conversion: 12,
};

const pillarInsights: Record<PillarKey, string> = {
  positioning:
    "Positioning is clear internally, but external copy does not always reinforce the same promise.",
  messaging:
    "Core messages are solid, but proof points and outcomes are not consistently attached to each claim.",
  visibility:
    "You are active in key channels, but publication themes are fragmented and dilute authority signals.",
  credibility:
    "Trust signals exist, but they are not always visible at the moments prospects are deciding.",
  conversion:
    "Conversion paths are present, but nurture flow and CTA sequencing can improve lead quality and speed.",
};

const strategicPriorities = previewActivationStrategicPriorities;
const scheduleRows = previewActivationScheduleRows;

const diagnosticData = {
  companyName: "Acme Co",
  businessName: "Acme Co",
  reportId: "preview-results-tabs",
  userEmail: "preview@wunderbar.ai",
  resultsDeliveredAt: "2026-03-05T17:30:00.000Z",
  industry: "B2B Services",
  targetAudience: "Founder-led and growth-stage service businesses",
  secondaryAudience: "Marketing and growth operators responsible for campaign execution",
  tertiaryAudience: "Sales leaders and enablement stakeholders influencing final vendor selection",
  primaryArchetype: "The Sage",
  secondaryArchetype: "The Explorer",
  archetypeMeaning: "Insight-led positioning with practical exploration of better ways to grow.",
  archetypeIcon: "S",
  topStrengths: ["Strategic clarity", "Market insight", "Advisory credibility"],
  topGaps: ["Visibility consistency", "Proof density", "Nurture flow"],
  voiceAttributes: ["Clear", "Confident", "Insightful", "Practical"],
  productTier: "blueprint-plus",
  contextCoverage: 68,
  hasPriorityActions: true,
  wunderBrandScore: 72,
  pillarScores,
  pillarInsights,
  primaryPillar: "Visibility",
  upstreamPillar: "Messaging",
  strategicPriorities,
  scheduleRows,
  competitiveVulnerability: {
    severity: "medium" as const,
    summary: "Competitors with tighter publishing cadence can win awareness despite weaker offers.",
    implication: "Visibility inconsistency is creating avoidable share-of-voice loss in high-intent moments.",
    recommendation: "Consolidate weekly content into one pillar-led channel rhythm.",
  },
  marketingSpendEfficiency: {
    severity: "medium" as const,
    summary: "Spend is generating traffic, but conversion efficiency is uneven by channel.",
    implication: "Message-channel mismatch increases cost per qualified lead.",
    recommendation: "Map each campaign CTA to one message pillar and one audience intent stage.",
  },
  revenueImpactStatement:
    "Improving visibility and conversion alignment can raise qualified pipeline efficiency over the next 90 days.",
  brandHealthVerdict:
    "Acme Co has a strong strategic base but inconsistent external execution across key growth channels.",
  positioningMessagingFramework:
    "Use one category promise, three proof-backed message pillars, and channel-specific CTA sequencing.",
  topOpportunity:
    "Tighten visibility strategy around a single message architecture to compound authority and demand.",
  synthesisPoints: [
    { label: "What to protect", content: "Strong positioning clarity and advisory tone." },
    { label: "What to prioritize", content: "Visibility consistency and proof-led messaging." },
    { label: "What unlocks growth", content: "Aligned channel plan + refined conversion pathways." },
  ],
  pillarDependencyExplanation:
    "Visibility gains depend on tighter messaging discipline so every channel reinforces the same narrative.",
  paidMediaStrategy: previewPaidMediaStrategy,
  icpConversionIntelligenceFramework: previewIcpConversionIntelligenceFramework,
  personaDrivenSegmentation: previewPersonaDrivenSegmentation,
  audiencePersonaDefinition: previewAudiencePersonaDefinition,
  ...previewActivationContent,
  brandFoundation: {
    brandValues: [
      {
        name: "Strategic clarity before scale",
        description: "Campaigns and spend wait until positioning and message hierarchy match how Acme Co actually wins.",
        inAction: "Green-light paid media only after organic hook, paid primary text, and landing page agree on one storyline.",
        whyItMatters: "Founder-led teams burn budget when every channel tells a slightly different story.",
      },
      {
        name: "Proof over preference",
        description: "Claims scale only when evidence, mechanism, or observable outcomes back them.",
        inAction: "Every paid or organic case card lists before metric, lever pulled, and window of time—not adjectives.",
        whyItMatters: "B2B buyers in competitive services default to skepticism; proof is the trust shortcut.",
      },
      {
        name: "Execution ownership",
        description: "Each initiative has one accountable owner and a dated checkpoint.",
        inAction: "Weekly review names who unblocks the next step—not a list of departments.",
        whyItMatters: "Strategy without owners becomes slides; owners turn plans into shipped work.",
      },
    ],
  },
};

const resultsContent = (
  <div className="space-y-12 md:space-y-14">
    <section id="results-overview" className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
      <p className="text-[14px] font-bold uppercase tracking-wide text-brand-blue mb-2">Results</p>
      <h2 className="bs-h3 mb-2">Diagnostic Results</h2>
      <p className="bs-body-sm text-brand-muted max-w-3xl">
        This tab is your diagnostic readout: score, pillars, findings, and priority opportunities.
        Use it to understand what the data says before moving into foundation and strategic planning tabs.
      </p>
    </section>

    <ResultsHeroSection
      score={72}
      primaryPillar="visibility"
      hasSnapshotPlus
      userRoleContext="founder"
    />

    <PillarBreakdown
      pillars={pillarScores}
      insights={pillarInsights}
      businessName="Acme Co"
      stage="scaling"
    />

    <section id="priority-actions" className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
      <p className="text-[14px] font-bold uppercase tracking-wide text-brand-blue mb-2">Priority Actions</p>
      <h3 className="bs-h3 mb-2">What to focus on next</h3>
      <div className="space-y-2">
        <p className="bs-body-sm text-brand-midnight">
          1. Align homepage and core offer pages to one positioning statement and three proof-backed
          messaging pillars.
        </p>
        <p className="bs-body-sm text-brand-midnight">
          2. Rebuild channel cadence around weekly visibility themes tied to audience intent stages.
        </p>
        <p className="bs-body-sm text-brand-midnight">
          3. Surface testimonials, case studies, and outcome proof where buying decisions happen.
        </p>
        <p className="bs-body-sm text-brand-midnight">
          4. Tighten CTA sequencing from awareness to conversion across email and website touchpoints.
        </p>
      </div>
    </section>

    <div id="context-coverage">
      <ContextCoverageMeter
        coveragePercent={68}
        areas={[
          { name: "Business Fundamentals", percent: 82, status: "strong" },
          { name: "Audience & Positioning", percent: 75, status: "strong" },
          { name: "Competitive Context", percent: 56, status: "moderate" },
          { name: "Conversion Inputs", percent: 48, status: "moderate" },
          { name: "Proof Assets", percent: 32, status: "limited" },
        ]}
        contextGaps={[
          "Specific competitor messaging examples were limited.",
          "Conversion-path metrics were directional rather than exact.",
          "Proof artifacts (case-study details, quantified outcomes) were incomplete.",
        ]}
      />
    </div>

    <section id="foundation-overview" className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border" style={{ borderLeft: "4px solid #07B0F2", background: "linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%)" }}>
      <p className="text-[14px] font-bold uppercase tracking-wide text-brand-blue mb-2">
        Implementation Readiness
      </p>
      <p className="bs-body-sm text-brand-muted max-w-3xl">
        Use the next tabs to move from analysis into strategy decisions, channel activation plans,
        workbook refinements, and downloadable team-ready deliverables.
      </p>
    </section>
  </div>
);

const foundationContent = (
  <FoundationBlueprintContent
    businessName={diagnosticData.businessName}
    targetAudience={diagnosticData.targetAudience}
    industry={diagnosticData.industry}
    primaryPillar={diagnosticData.primaryPillar}
    primaryArchetype={diagnosticData.primaryArchetype}
    secondaryArchetype={diagnosticData.secondaryArchetype}
    diagnosticData={diagnosticData}
  />
);

export default function PreviewResultsTabsPage() {
  const searchParams = useSearchParams();
  const initialActiveTab = parseResultsTabId(searchParams.get("tab") ?? undefined);
  const initialActivationPlanId = parseActivationPlanSectionId(searchParams.get("activationPlanId") ?? undefined);
  const workbookSectionRaw = searchParams.get("workbookSection") ?? undefined;
  const initialWorkbookSectionId = isWorkbookSectionId(workbookSectionRaw) ? workbookSectionRaw : undefined;

  return (
    <main className="min-h-screen font-brand" style={{ backgroundColor: "#F5F7FA" }}>
      <ResultsTabsShell
        productTier="blueprint-plus"
        resultsContent={resultsContent}
        foundationContent={foundationContent}
        diagnosticData={diagnosticData}
        initialActiveTab={initialActiveTab}
        initialWorkbookSectionId={initialWorkbookSectionId}
        initialActivationPlanId={initialActivationPlanId}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px 28px" }}>
        <p style={{ fontSize: 12, color: "#5A6B7E", margin: 0 }}>
          Preview mode with mock data.{" "}
          <Link href="/preview" style={{ color: "#021859", textDecoration: "underline", fontWeight: 700 }}>
            Back to all previews
          </Link>
        </p>
      </div>
    </main>
  );
}
