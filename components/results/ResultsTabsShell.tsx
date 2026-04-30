"use client";

import { ReactNode, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import LockedTabPrompt from "@/components/LockedTabPrompt";
import ResultsTabNav, { ProductTier, ResultsTab } from "@/components/ResultsTabNav";
import {
  filterActivationPlanSections,
  FOUNDATION_AUDIENCE_SUBSECTION_IDS_BY_TIER,
  TAB_DEFINITIONS,
  type ActivationPlanSectionId,
  isTabAvailable,
  normalizeProductTierString,
} from "@/components/results/tabConfig";
import CompactResultsHeader from "@/components/results/CompactResultsHeader";
import HowToUseBanner from "@/components/results/HowToUseBanner";
import { getSuiteTabIntro, TAB_SECTION_NAV_HINT_CHIPS_ONLY } from "@/lib/copy/resultsSuiteGuidance";
import { TabIntroGuidanceBlock } from "@/components/results/TabIntroGuidanceBlock";
import TabSectionMenu from "@/components/results/TabSectionMenu";
import { useActiveSectionInView } from "@/components/results/useActiveSectionInView";
import StrategyTab from "@/components/tabs/StrategyTab";
import BrandStandardsTab from "@/components/tabs/BrandStandardsTab";
import ActivationTab from "@/components/tabs/ActivationTab";
import WorkbookTab from "@/components/tabs/WorkbookTab";
import DownloadsTab, { buildDownloadsNavModel } from "@/components/tabs/DownloadsTab";
import { buildActivationNavMenuItems } from "@/lib/activation/activationTabNav";
import { STANDARDS_SUITE_NAV_ITEMS } from "@/lib/results/standardsSuiteNav";
import { buildStrategyNavMenuItems } from "@/lib/strategy/strategyNavMenu";
import { buildWorkbookNavMenuItems } from "@/lib/workbook/workbookNavMenu";
import type { Prompt } from "@/lib/promptPackData";
import type { ScheduleRow } from "@/components/ExecutionSchedule";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_ACCENT_HOVER,
  SUITE_RADIUS_BUTTON,
  SUITE_BG_PAGE,
  SUITE_CHIP_CARD_STYLE,
  SUITE_CONTENT_MAX_PX,
  SUITE_FONT_UI,
  SUITE_INTRO_BAND_STYLE,
  SUITE_INTRO_EYEBROW_TEXT_STYLE,
  SUITE_INTRO_GUIDANCE_TEXT_STYLE,
  SUITE_INTRO_TITLE_TEXT_STYLE,
  SUITE_SHADOW_CARD,
  SUITE_TAB_BODY_SHELL,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";
import type { NormalizedImagerySample } from "@/lib/brand/brandImageryNormalize";
import { mergeWorkbookMoodIntoDiagnostic, moodBoardSamplesFromCustomSections } from "@/lib/brand/moodBoardFromWorkbook";
import {
  WORKBOOK_SECTIONS,
  type WorkbookSectionId,
  type WorkbookState,
  type WorkbookVersion,
} from "@/lib/workbookTypes";
import { buildActivationPlanSectionsList } from "@/lib/activation/activationPlanModel";
import { WUNDERBAR_SUITE_LOCKED_TAB_URL } from "@/lib/wunderbarExternalUrls";
import { ResultsSuiteNavContext, type ResultsSuiteNav } from "@/components/results/ResultsSuiteNavContext";
import { ResultsWundyChat } from "@/app/results/components/ResultsWundyChat";
import SuiteWundyGuideBar from "@/components/results/SuiteWundyGuideBar";
import ResultsActivationRoutingCallout from "@/components/results/ResultsActivationRoutingCallout";
import ExecutionSuiteBridge from "@/components/results/ExecutionSuiteBridge";

const LOCKED_TAB_FEATURES: Record<
  Exclude<ResultsTab, "results">,
  { availableFrom: string; features: string[] }
> = {
  foundation: {
    availableFrom: "snapshot-plus",
    features: [
      "Brand platform foundation (positioning, messaging, voice, archetype)",
      "Audience and offer framing to guide strategic decisions",
      "Reusable narrative baseline before channel execution",
      "Clear handoff into Strategy and Activation planning",
    ],
  },
  strategy: {
    availableFrom: "snapshot-plus",
    features: [
      "Priorities ranked by diagnostic impact",
      "Messaging architecture and narrative decisions",
      "Channel strategy by section before activation",
      "Cross-functional strategy your team can align on",
    ],
  },
  standards: {
    availableFrom: "blueprint",
    features: [
      "Voice and tone guardrails with concrete do/don't examples",
      "Messaging claim and proof standards by channel",
      "Visual direction examples (color, hierarchy, layout)",
      "Publishing QA checklist for consistency",
    ],
  },
  activation: {
    availableFrom: "snapshot-plus",
    features: [
      "Strategic priorities ranked from your diagnostic",
      "Channel execution plans (email, social, SEO, paid, PR, journey, competitive motion)",
      "90-day roadmap and activation schedule when included",
    ],
  },
  workbook: {
    availableFrom: "snapshot-plus",
    features: [
      "Edit your positioning, messaging, and channel plans",
      "Prompt library: tier-matched AI prompts by section (separate from Activation plans)",
      "Paste and save AI outputs next to workbook sections",
      "Update your activation schedule as you implement",
      "Export versioned plans for your team",
    ],
  },
  downloads: {
    availableFrom: "snapshot",
    features: [
      "Snapshot report export at every tier",
      "Snapshot+ adds Executive Summary and Prompt Guide",
      "Blueprint adds strategy PDFs and activation schedule (.xlsx)",
      "Blueprint+ adds full packs, role packs, and Download all (.zip)",
    ],
  },
};

interface ResultsTabsShellProps {
  productTier: ProductTier;
  resultsContent: ReactNode;
  foundationContent: ReactNode;
  diagnosticData: Record<string, unknown>;
  /** Optional deep link from `/results?tab=…`. */
  initialActiveTab?: ResultsTab;
  /** Optional deep link from `/results?tab=workbook&workbookSection=…`. */
  initialWorkbookSectionId?: WorkbookSectionId | null;
  /** Optional deep link/source plan id for workbook editing. */
  initialActivationPlanId?: ActivationPlanSectionId;
  /** From `?activationFocus=` — read on the server (or preview client) so this shell does not call `useSearchParams`. */
  activationFocus?: string | null;
}

function resolveInitialActiveTab(tier: ProductTier, requested: ResultsTab | undefined): ResultsTab {
  if (!requested) return "results";
  const def = TAB_DEFINITIONS.find((t) => t.id === requested);
  if (!def || !isTabAvailable(def, tier)) return "results";
  return requested;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nonEmpty(value: string): string | null {
  return value.trim().length > 0 ? value.trim() : null;
}

function buildWorkbookSeedContent(
  diagnosticData: Record<string, unknown>,
  scheduleRows: ScheduleRow[],
): Record<WorkbookSectionId, string> {
  const sectionContent = {} as Record<WorkbookSectionId, string>;
  for (const section of WORKBOOK_SECTIONS) sectionContent[section.id] = "";

  const company = asString(diagnosticData.companyName) || asString(diagnosticData.businessName) || "Your Brand";
  const audience = asString(diagnosticData.targetAudience) || "Primary audience segment";
  const secondaryAudience =
    asString(diagnosticData.secondaryAudience) ||
    asString(diagnosticData.secondary_audience) ||
    `Adjacent operator audience supporting ${audience.toLowerCase()}`;
  const tertiaryAudience =
    asString(diagnosticData.tertiaryAudience) ||
    asString(diagnosticData.tertiary_audience) ||
    "Referral and internal stakeholder audience that influences final selection";
  const industry = asString(diagnosticData.industry) || "your market";
  const primaryPillar = asString(diagnosticData.primaryPillar) || "Messaging";
  const archetype = asString(diagnosticData.primaryArchetype);
  const secondaryArchetype = asString(diagnosticData.secondaryArchetype);
  const topOpportunity = asString(diagnosticData.topOpportunity);
  const brandVerdict = asString(diagnosticData.brandHealthVerdict);
  const positioning = asString(diagnosticData.positioningMessagingFramework);
  const pillarDependency = asString(diagnosticData.pillarDependencyExplanation);
  const revenueImpact = asString(diagnosticData.revenueImpactStatement);
  const strategicPriorities =
    (diagnosticData.strategicPriorities as Array<{ rank?: number; title?: string; pillar?: string }> | undefined) ??
    [];
  const voiceAttributes = Array.isArray(diagnosticData.voiceAttributes)
    ? diagnosticData.voiceAttributes.map((item) => String(item)).filter(Boolean)
    : [];
  const channelPlans = (diagnosticData.channelPlans as Record<string, string> | undefined) ?? {};
  const synthesisPoints =
    (diagnosticData.synthesisPoints as Array<{ label?: string; content?: string }> | undefined) ?? [];
  const competitiveVulnerability =
    (diagnosticData.competitiveVulnerability as
      | { summary?: string; implication?: string; recommendation?: string }
      | undefined) ?? {};

  const linesFromMap = Object.entries(channelPlans)
    .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    .map(([key, value]) => `${key.replace(/[_-]+/g, " ")}: ${value.trim()}`);

  const scheduleSummary = scheduleRows
    .slice(0, 8)
    .map(
      (row, index) =>
        `${index + 1}. Week ${row.week} — ${row.channel}: ${row.assetTopic} (CTA: ${row.primaryCta}, Owner: ${row.owner || "Assign owner"})`,
    )
    .join("\n");

  sectionContent["positioning-statement"] =
    nonEmpty(positioning) ||
    `${company} helps ${audience.toLowerCase()} improve ${primaryPillar.toLowerCase()} outcomes through a clear, proof-backed strategy and implementation plan.`;

  sectionContent["messaging-framework"] = [
    `Brand: ${company}`,
    `Primary Pillar: ${primaryPillar}`,
    nonEmpty(topOpportunity) ? `Primary Opportunity: ${topOpportunity}` : "",
    strategicPriorities.length
      ? "Priority Messaging Themes:\n" +
        strategicPriorities
          .slice(0, 3)
          .map((item, index) => `${index + 1}. ${item.title || "Priority"} (${item.pillar || "Brand"})`)
          .join("\n")
      : "",
    synthesisPoints.length
      ? "Strategic Synthesis:\n" +
        synthesisPoints
          .slice(0, 3)
          .map((point) => `- ${point.label || "Point"}: ${point.content || ""}`)
          .join("\n")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  sectionContent["voice-attributes"] = [
    voiceAttributes.length ? `Voice Attributes: ${voiceAttributes.join(", ")}` : "",
    nonEmpty(archetype) ? `Primary Archetype: ${archetype}` : "",
    nonEmpty(secondaryArchetype) ? `Secondary Archetype: ${secondaryArchetype}` : "",
    nonEmpty(pillarDependency) ? `Guidance: ${pillarDependency}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  sectionContent["brand-story"] = [
    nonEmpty(brandVerdict) ? `Current Brand Verdict: ${brandVerdict}` : "",
    nonEmpty(revenueImpact) ? `Commercial Impact: ${revenueImpact}` : "",
    nonEmpty(topOpportunity) ? `Narrative Priority: ${topOpportunity}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  sectionContent["audience-profile"] = [
    `Audience Hierarchy`,
    `Primary Audience (70-80% messaging weight): ${audience}`,
    `Secondary Audience (15-25% messaging weight): ${secondaryAudience}`,
    `Tertiary Audience (5-10% messaging weight): ${tertiaryAudience}`,
    `Industry Context: ${industry}`,
    `Primary Pillar Focus: ${primaryPillar}`,
    `Execution Rule: keep one core positioning promise while tailoring proof and channel emphasis by audience tier.`,
  ]
    .filter(Boolean)
    .join("\n");

  sectionContent["persona-atlas"] = [
    "Persona Tier 1: Primary Decision Maker",
    "Role: Economic buyer",
    `Primary job to be done (JTBD): Improve ${primaryPillar.toLowerCase()} performance in ${industry.toLowerCase()}`,
    `Core Frustration: ${topOpportunity || "Current strategy does not convert consistently."}`,
    `Messaging Angle: ${company} provides a practical, owner-ready implementation roadmap.`,
    "",
    "Persona Tier 2: Secondary Audience Operator",
    "Role: Functional champion",
    `Audience Segment: ${secondaryAudience}`,
    `Primary job to be done (JTBD): Execute plans without losing brand consistency for ${audience.toLowerCase()}`,
    "Core Frustration: Team execution and message consistency are misaligned.",
    `Messaging Angle: Clear sequence, reusable templates, and measurable weekly milestones.`,
    "",
    "Persona Tier 3: Tertiary Influencer",
    "Role: Cross-functional stakeholder",
    `Audience Segment: ${tertiaryAudience}`,
    "Primary job to be done (JTBD): Validate risk, return on investment (ROI) confidence, and implementation feasibility before approval.",
    "Core Frustration: Strategic proposals lack clear ownership and impact visibility.",
    `Messaging Angle: Emphasize proof architecture, governance model, and low-friction handoff to execution.`,
  ].join("\n");

  sectionContent["buyer-journey-map"] = [
    `Stage: Awareness\nPrimary Question: Why is ${company} underperforming despite active marketing?\nMessaging Focus: Clarify hidden cost and root cause.`,
    `Stage: Consideration\nPrimary Question: What is the lowest-risk path to improvement?\nMessaging Focus: Framework + proof + implementation steps.`,
    `Stage: Decision\nPrimary Question: Can this team execute in 90 days?\nMessaging Focus: Owner plan, milestones, and expected outcomes.`,
  ].join("\n\n");

  sectionContent["competitive-landscape-matrix"] = [
    "Competitor: Primary Alternative",
    `Their Headline Claim: Stronger ${primaryPillar.toLowerCase()} outcomes`,
    `Where ${company} Wins: Deeper strategic diagnosis + clearer activation sequence`,
    nonEmpty(competitiveVulnerability.summary || "")
      ? `Current Vulnerability: ${competitiveVulnerability.summary}`
      : "",
    nonEmpty(competitiveVulnerability.recommendation || "")
      ? `Counter-Positioning Move: ${competitiveVulnerability.recommendation}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  sectionContent["icp-conversion-intelligence"] = [
    `ICP Tier: Primary ICP`,
    `Primary Conversion Barrier: ${
      competitiveVulnerability.implication || "Unclear confidence in implementation feasibility."
    }`,
    `Decision Trigger: Practical proof + clear owner-ready rollout`,
    `Best Hook Type: Data-led insight + social proof`,
    `Channels to Prioritize: ${
      linesFromMap.length > 0 ? linesFromMap.slice(0, 3).map((line) => line.split(":")[0]).join(", ") : "Email, Search, LinkedIn"
    }`,
  ].join("\n");

  sectionContent["channel-notes"] = linesFromMap.length
    ? linesFromMap.join("\n")
    : `Email: Build nurture sequence tied to ${primaryPillar.toLowerCase()} objections.\nWebsite: Align core pages to one positioning promise.\nSocial: Publish weekly authority themes with one CTA per post.`;

  sectionContent["action-plan"] = scheduleSummary
    ? `90-Day Action Sequence\n${scheduleSummary}`
    : strategicPriorities
        .slice(0, 5)
        .map((item, index) => `${index + 1}. ${item.title || "Priority action"} (${item.pillar || "Brand"})`)
        .join("\n");

  sectionContent["performance-optimization"] = [
    "Performance & Optimization Review",
    `Review cadence: Monthly tactical review + quarterly strategic refresh for ${company}.`,
    "",
    "Channel snapshot",
    `Email: Track open quality, click-through, and conversion on ${primaryPillar.toLowerCase()} campaigns.`,
    "Social: Track qualified engagement, save/share quality, and CTA clicks by post type.",
    "Paid: Track CPL/CAC, creative fatigue, and segment-level conversion performance.",
    "SEO/Website: Track qualified organic traffic, landing page conversion, and stage progression.",
    "",
    "Top wins (max 3)",
    "1) [Document strongest channel or sequence gain]",
    "2) [Document strongest message/proof improvement]",
    "3) [Document strongest conversion improvement]",
    "",
    "Top misses (max 3)",
    "1) [Document underperforming channel or stage]",
    "2) [Document weak CTA or message mismatch]",
    "3) [Document execution bottleneck]",
    "",
    "Optimization decisions",
    "- Keep: [What continues unchanged]",
    "- Improve: [What changes next cycle]",
    "- Pause: [What to stop to reduce waste]",
    "",
    "Next 30-day priorities",
    "1) [Action] | Owner: [Name] | Due: [Date] | KPI: [Metric]",
    "2) [Action] | Owner: [Name] | Due: [Date] | KPI: [Metric]",
    "3) [Action] | Owner: [Name] | Due: [Date] | KPI: [Metric]",
  ].join("\n");

  sectionContent["prompt-outputs"] =
    `Use this section to paste your best generated outputs.\n\n` +
    `Start with: positioning rewrite, 3-message pillar drafts, voice do/don't table, and one 30-day activation brief for ${company}.`;

  return sectionContent;
}

function mergeSeedSectionContent(
  existing: Record<WorkbookSectionId, string>,
  seed: Record<WorkbookSectionId, string>,
): Record<WorkbookSectionId, string> {
  const merged = { ...existing };
  for (const section of WORKBOOK_SECTIONS) {
    if (!nonEmpty(merged[section.id]) && nonEmpty(seed[section.id] || "")) {
      merged[section.id] = seed[section.id];
    }
  }
  return merged;
}

type DocumentId =
  | "snapshot-report"
  | "executive-summary"
  | "brand-strategy"
  | "icp-conversion-snapshot"
  | "icp-conversion-intelligence-framework"
  | "brand-standards"
  | "brand-standards-internal"
  | "brand-standards-external"
  | "brand-standards-vendor-spec"
  | "sales-battle-cards"
  | "activation-plan"
  | "digital-marketing-strategy"
  | "competitive-intelligence-brief"
  | "activation-schedule"
  | "voice-checklist"
  | "brand-playbook"
  | "strategic-action-plan"
  | "one-page-messaging"
  | "prompt-guide"
  | "role-pack-leadership"
  | "role-pack-marketing"
  | "role-pack-sales"
  | "role-pack-design";

interface DocumentTileState {
  documentId: DocumentId;
  lastGeneratedAt?: string;
  needsRegeneration: boolean;
  lifecycleState?: "draft" | "in_review" | "published" | "stale" | "archived";
}

const INITIAL_DOCUMENT_STATES: DocumentTileState[] = [
  { documentId: "snapshot-report", needsRegeneration: false },
  { documentId: "executive-summary", needsRegeneration: false },
  { documentId: "prompt-guide", needsRegeneration: false },
  { documentId: "brand-strategy", needsRegeneration: false },
  { documentId: "icp-conversion-snapshot", needsRegeneration: false },
  { documentId: "icp-conversion-intelligence-framework", needsRegeneration: false },
  { documentId: "brand-standards-internal", needsRegeneration: false },
  { documentId: "brand-standards-external", needsRegeneration: false },
  { documentId: "brand-standards-vendor-spec", needsRegeneration: false },
  { documentId: "sales-battle-cards", needsRegeneration: false },
  { documentId: "one-page-messaging", needsRegeneration: false },
  { documentId: "voice-checklist", needsRegeneration: false },
  { documentId: "activation-plan", needsRegeneration: false },
  { documentId: "digital-marketing-strategy", needsRegeneration: false },
  { documentId: "competitive-intelligence-brief", needsRegeneration: false },
  { documentId: "activation-schedule", needsRegeneration: false },
  { documentId: "strategic-action-plan", needsRegeneration: false },
  { documentId: "brand-playbook", needsRegeneration: false },
  { documentId: "role-pack-leadership", needsRegeneration: false },
  { documentId: "role-pack-marketing", needsRegeneration: false },
  { documentId: "role-pack-sales", needsRegeneration: false },
  { documentId: "role-pack-design", needsRegeneration: false },
];

const SECTION_TO_DOCUMENTS: Record<string, DocumentId[]> = {
  "positioning-statement": [
    "executive-summary",
    "brand-strategy",
    "brand-playbook",
    "competitive-intelligence-brief",
    "role-pack-leadership",
    "role-pack-sales",
  ],
  "strategic-offer-context": [
    "brand-strategy",
    "activation-plan",
    "digital-marketing-strategy",
    "brand-playbook",
    "role-pack-marketing",
    "role-pack-sales",
  ],
  "messaging-framework": [
    "brand-strategy",
    "icp-conversion-snapshot",
    "icp-conversion-intelligence-framework",
    "brand-standards-internal",
    "brand-standards-external",
    "brand-standards-vendor-spec",
    "sales-battle-cards",
    "one-page-messaging",
    "brand-playbook",
    "role-pack-marketing",
    "role-pack-sales",
  ],
  "voice-attributes": [
    "brand-strategy",
    "brand-standards-internal",
    "brand-standards-external",
    "brand-standards-vendor-spec",
    "voice-checklist",
    "brand-playbook",
    "role-pack-marketing",
    "role-pack-design",
  ],
  "brand-story": ["executive-summary", "brand-playbook", "role-pack-leadership"],
  "audience-profile": ["brand-playbook", "role-pack-marketing", "role-pack-sales"],
  "persona-atlas": [
    "brand-strategy",
    "icp-conversion-snapshot",
    "brand-playbook",
    "digital-marketing-strategy",
    "activation-plan",
    "role-pack-marketing",
    "role-pack-sales",
  ],
  "buyer-journey-map": [
    "brand-strategy",
    "icp-conversion-snapshot",
    "brand-playbook",
    "digital-marketing-strategy",
    "activation-plan",
    "strategic-action-plan",
    "role-pack-marketing",
  ],
  "competitive-landscape-matrix": [
    "competitive-intelligence-brief",
    "sales-battle-cards",
    "brand-playbook",
    "role-pack-sales",
  ],
  "channel-notes": [
    "icp-conversion-intelligence-framework",
    "activation-plan",
    "digital-marketing-strategy",
    "brand-playbook",
    "role-pack-marketing",
  ],
  "mood-board": [
    "brand-standards-internal",
    "brand-standards-external",
    "brand-standards-vendor-spec",
    "role-pack-design",
  ],
  "action-plan": [
    "icp-conversion-intelligence-framework",
    "activation-plan",
    "digital-marketing-strategy",
    "competitive-intelligence-brief",
    "strategic-action-plan",
    "brand-playbook",
  ],
  "prompt-outputs": ["prompt-guide"],
  "icp-conversion-intelligence": [
    "icp-conversion-intelligence-framework",
    "activation-plan",
    "digital-marketing-strategy",
    "competitive-intelligence-brief",
    "sales-battle-cards",
    "role-pack-marketing",
    "role-pack-sales",
  ],
};

const FOUNDATION_MENU_ITEMS = [
  { id: "brand-story-proof", label: "Identity", icon: "ID" },
  { id: "positioning-platform", label: "Positioning", icon: "PO" },
  { id: "messaging-foundation", label: "Messaging", icon: "MS" },
  { id: "archetype-voice", label: "Voice & Expression", icon: "VE" },
  { id: "visual-direction", label: "Visual Identity", icon: "VI" },
  { id: "icp-persona-foundation", label: "ICP & Personas", icon: "IC" },
  { id: "foundation-90day", label: "90-Day Priorities", icon: "90" },
];

export default function ResultsTabsShell({
  productTier: productTierProp,
  resultsContent,
  foundationContent,
  diagnosticData,
  initialActiveTab,
  initialWorkbookSectionId,
  initialActivationPlanId,
  activationFocus: activationFocusProp,
}: ResultsTabsShellProps) {
  const productTier = normalizeProductTierString(String(productTierProp ?? "snapshot"));
  const [activeTab, setActiveTab] = useState<ResultsTab>(() =>
    resolveInitialActiveTab(productTier, initialActiveTab),
  );
  const [lockedTabContext, setLockedTabContext] = useState<{
    tabId: Exclude<ResultsTab, "results">;
    tabLabel: string;
    availableFrom: string;
  } | null>(null);
  const scheduleRows = (diagnosticData.scheduleRows as ScheduleRow[] | undefined) ?? [];
  const reportId = typeof diagnosticData.reportId === "string" ? diagnosticData.reportId : "";
  const userEmail = typeof diagnosticData.userEmail === "string" ? diagnosticData.userEmail : "";
  const isPreviewMode =
    reportId.startsWith("preview-") ||
    (reportId.includes("preview") && userEmail.toLowerCase().includes("preview"));
  const [workbookCustomSections, setWorkbookCustomSections] = useState<Record<string, unknown>>({});
  const diagnosticDataForStandards = useMemo(
    () => mergeWorkbookMoodIntoDiagnostic(diagnosticData, workbookCustomSections),
    [diagnosticData, workbookCustomSections],
  );
  const moodBoardSamplesPersisted = useMemo(
    () => moodBoardSamplesFromCustomSections(workbookCustomSections),
    [workbookCustomSections],
  );
  const [focusedWorkbookSectionId, setFocusedWorkbookSectionId] = useState<WorkbookSectionId | null>(
    () => initialWorkbookSectionId ?? null,
  );
  const [pendingActivationPlanId, setPendingActivationPlanId] =
    useState<ActivationPlanSectionId | null>(() => initialActivationPlanId ?? null);
  const [pendingFoundationSectionId, setPendingFoundationSectionId] = useState<string | null>(null);
  const [documentStates, setDocumentStates] =
    useState<DocumentTileState[]>(INITIAL_DOCUMENT_STATES);
  const productDisplayName =
    productTier === "snapshot"
      ? "WunderBrand Snapshot"
      : productTier === "snapshot-plus"
        ? "WunderBrand Snapshot+"
        : productTier === "blueprint"
          ? "WunderBrand Blueprint"
          : "WunderBrand Blueprint+";

  const suiteCompanyName = useMemo(() => {
    if (typeof diagnosticData.businessName === "string" && diagnosticData.businessName.trim())
      return diagnosticData.businessName.trim();
    if (typeof diagnosticData.companyName === "string" && diagnosticData.companyName.trim())
      return diagnosticData.companyName.trim();
    return undefined;
  }, [diagnosticData.businessName, diagnosticData.companyName]);

  const executionReportLabel = useMemo(() => suiteCompanyName ?? "Your report", [suiteCompanyName]);

  const introOpts = useMemo(() => ({ businessName: suiteCompanyName }), [suiteCompanyName]);

  const resultsTabIntro = useMemo(() => getSuiteTabIntro(productTier, "results", introOpts), [productTier, introOpts]);
  const foundationTabIntro = useMemo(
    () => getSuiteTabIntro(productTier, "foundation", introOpts),
    [productTier, introOpts],
  );
  const strategyTabIntro = useMemo(() => getSuiteTabIntro(productTier, "strategy", introOpts), [productTier, introOpts]);
  const standardsTabIntro = useMemo(
    () => getSuiteTabIntro(productTier, "standards", introOpts),
    [productTier, introOpts],
  );
  const activationTabIntro = useMemo(
    () => getSuiteTabIntro(productTier, "activation", introOpts),
    [productTier, introOpts],
  );
  const workbookTabIntro = useMemo(() => getSuiteTabIntro(productTier, "workbook", introOpts), [productTier, introOpts]);
  const downloadsTabIntro = useMemo(
    () => getSuiteTabIntro(productTier, "downloads", introOpts),
    [productTier, introOpts],
  );

  const foundationNavItems = useMemo(() => {
    const audienceIds = FOUNDATION_AUDIENCE_SUBSECTION_IDS_BY_TIER[productTier] ?? [];
    const hasAudienceSection = audienceIds.length > 0;
    if (hasAudienceSection) return FOUNDATION_MENU_ITEMS;
    return FOUNDATION_MENU_ITEMS.filter((item) => item.id !== "icp-persona-foundation");
  }, [productTier]);
  const foundationTabAvailable = useMemo(() => {
    const ft = TAB_DEFINITIONS.find((t) => t.id === "foundation");
    return ft ? isTabAvailable(ft, productTier) : false;
  }, [productTier]);
  const documentStateStorageKey = reportId
    ? `wb-document-states:${reportId}`
    : "wb-document-states";
  const workbookSeedContent = useMemo(
    () => buildWorkbookSeedContent(diagnosticData, scheduleRows),
    [diagnosticData, scheduleRows],
  );
  const [workbookState, setWorkbookState] = useState<WorkbookState>(() => {
    const sectionContent = {} as Record<WorkbookSectionId, string>;
    for (const section of WORKBOOK_SECTIONS) {
      sectionContent[section.id] = workbookSeedContent[section.id] || "";
    }
    return {
      sectionContent,
      versions: [],
    };
  });

  const searchParams = useSearchParams();
  const activationFocusQueryParam = searchParams.get("activationFocus");
  const activationFocusFromQuery =
    typeof activationFocusQueryParam === "string" && activationFocusQueryParam.trim()
      ? activationFocusQueryParam.trim()
      : null;
  /** Prefer live URL (client toggles) so chips + scroll spy match the table rows still mounted. */
  const activationFocusRaw =
    activationFocusFromQuery ??
    (typeof activationFocusProp === "string" && activationFocusProp.trim() ? activationFocusProp.trim() : null);

  const strategyNavItems = useMemo(
    () => buildStrategyNavMenuItems(productTier, diagnosticData),
    [productTier, diagnosticData],
  );
  const strategyNavKey = activeTab === "strategy" ? strategyNavItems.map((i) => i.id).join("\0") : "";
  const strategyShellActiveId = useActiveSectionInView(strategyNavKey);

  const standardsNavKey =
    activeTab === "standards" ? STANDARDS_SUITE_NAV_ITEMS.map((i) => i.id).join("\0") : "";
  const standardsShellActiveId = useActiveSectionInView(standardsNavKey);

  const workbookNavItemsForShell = useMemo(
    () => buildWorkbookNavMenuItems(productTier, workbookState.versions.length),
    [productTier, workbookState.versions.length],
  );
  const workbookNavKey = activeTab === "workbook" ? workbookNavItemsForShell.map((i) => i.id).join("\0") : "";
  const workbookShellActiveId = useActiveSectionInView(workbookNavKey);

  const downloadsNavForShell = useMemo(() => buildDownloadsNavModel(productTier), [productTier]);
  const downloadsNavKey =
    activeTab === "downloads" ? downloadsNavForShell.navItems.map((i) => i.id).join("\0") : "";
  const downloadsShellActiveId = useActiveSectionInView(downloadsNavKey);

  const activationNavItemsForShell = useMemo(
    () => buildActivationNavMenuItems(productTier, diagnosticData, scheduleRows, activationFocusRaw),
    [productTier, diagnosticData, scheduleRows, activationFocusRaw],
  );
  const activationNavKey =
    activeTab === "activation" ? activationNavItemsForShell.map((i) => i.id).join("\0") : "";
  const activationShellActiveId = useActiveSectionInView(activationNavKey);

  function handleAskWundy(prompt: Prompt) {
    window.dispatchEvent(
      new CustomEvent("wundy:ask", {
        detail: {
          message: `I'm looking at "${prompt.name}" in my Workbook Prompt library. Can you walk me through how to use it and what strong output looks like for my brand?`,
          autoSend: false,
        },
      }),
    );
  }

  function markDocumentsRegenerated(documentIds: DocumentId[]): void {
    const generatedAt = new Date().toISOString();
    setDocumentStates((previous) =>
      previous.map((state) =>
        documentIds.includes(state.documentId)
          ? { ...state, needsRegeneration: false, lastGeneratedAt: generatedAt, lifecycleState: "published" }
          : state,
      ),
    );
  }

  function getDocumentHref(documentId: DocumentId): string | null {
    if (!reportId) return null;
    const encodedReportId = encodeURIComponent(reportId);
    const encodedEmail = userEmail ? encodeURIComponent(userEmail) : "";
    const emailParam = encodedEmail ? `&email=${encodedEmail}` : "";

    const tierForBlueprint = productTier === "blueprint-plus" ? "blueprint-plus" : "blueprint";
    const blueprintHref = (type: string) =>
      `/api/blueprint/pdf?reportId=${encodedReportId}&type=${encodeURIComponent(type)}&tier=${tierForBlueprint}${emailParam}`;
    const previewHref = (type: string) =>
      `/api/preview/pdf?type=${encodeURIComponent(type)}&download=1`;

    if (isPreviewMode) {
      const previewTypeByDocument: Record<DocumentId, string> = {
        "snapshot-report": "snapshot-plus",
        "executive-summary": "executive",
        "prompt-guide": "prompts",
        "brand-strategy": "messaging",
        "icp-conversion-snapshot": "icp-conversion-snapshot",
        "icp-conversion-intelligence-framework": "icp-conversion-intelligence",
        "brand-standards": "brand-standards",
        "brand-standards-internal": "brand-standards",
        "brand-standards-external": "brand-standards",
        "brand-standards-vendor-spec": "brand-standards",
        "sales-battle-cards": "battle-cards",
        "activation-plan": "activation",
        "digital-marketing-strategy": "digital",
        "competitive-intelligence-brief": "competitive",
        "activation-schedule": "activation",
        "voice-checklist": "voice-checklist",
        "brand-playbook": productTier === "blueprint-plus" ? "blueprint-plus" : "blueprint",
        "strategic-action-plan": "activation",
        "one-page-messaging": "messaging",
        "role-pack-leadership": "executive",
        "role-pack-marketing": "digital",
        "role-pack-sales": "battle-cards",
        "role-pack-design": "brand-standards",
      };
      return previewHref(previewTypeByDocument[documentId]);
    }

    switch (documentId) {
      case "snapshot-report":
        return productTier === "snapshot"
          ? `/api/snapshot/pdf?id=${encodedReportId}`
          : `/api/snapshot-plus/pdf?id=${encodedReportId}`;
      case "executive-summary":
        return productTier === "blueprint" || productTier === "blueprint-plus"
          ? blueprintHref("executive")
          : `/api/snapshot-plus/pdf?id=${encodedReportId}&type=executive`;
      case "prompt-guide":
        return productTier === "blueprint" || productTier === "blueprint-plus"
          ? blueprintHref("prompts")
          : `/api/snapshot-plus/pdf?id=${encodedReportId}&type=prompts`;
      case "brand-strategy":
        return blueprintHref("messaging");
      case "icp-conversion-snapshot":
        return blueprintHref("icp-conversion-snapshot");
      case "icp-conversion-intelligence-framework":
        return blueprintHref("icp-conversion-intelligence");
      case "brand-standards":
        return blueprintHref("standards");
      case "brand-standards-internal":
        return blueprintHref("standards-internal");
      case "brand-standards-external":
        return blueprintHref("standards-external");
      case "brand-standards-vendor-spec":
        return blueprintHref("standards-vendor");
      case "sales-battle-cards":
        return blueprintHref("battle-cards");
      case "activation-plan":
        return blueprintHref("activation");
      case "digital-marketing-strategy":
        return blueprintHref("digital");
      case "competitive-intelligence-brief":
        return blueprintHref("competitive");
      case "activation-schedule":
        return `/api/results/activation-schedule?reportId=${encodedReportId}${emailParam}`;
      case "voice-checklist":
        return blueprintHref("voice-checklist");
      case "brand-playbook":
        return blueprintHref("complete");
      case "strategic-action-plan":
        return blueprintHref("activation");
      case "one-page-messaging":
        return blueprintHref("messaging");
      case "role-pack-leadership":
        return `/api/downloads/role-pack?reportId=${encodedReportId}&pack=leadership&tier=blueprint-plus${emailParam}`;
      case "role-pack-marketing":
        return `/api/downloads/role-pack?reportId=${encodedReportId}&pack=marketing&tier=blueprint-plus${emailParam}`;
      case "role-pack-sales":
        return `/api/downloads/role-pack?reportId=${encodedReportId}&pack=sales&tier=blueprint-plus${emailParam}`;
      case "role-pack-design":
        return `/api/downloads/role-pack?reportId=${encodedReportId}&pack=design&tier=blueprint-plus${emailParam}`;
      default:
        return null;
    }
  }

  function handleDownload(documentId: DocumentId): void {
    markDocumentsRegenerated([documentId]);
    const href = getDocumentHref(documentId);
    if (href && typeof window !== "undefined") {
      window.open(href, "_blank", "noopener,noreferrer");
    } else if (typeof window !== "undefined") {
      window.alert("This download is not available yet. Please use a valid report link and try again.");
    }
    openOrLockTab("downloads");
  }

  async function handleGenerate(documentId: DocumentId): Promise<void> {
    markDocumentsRegenerated([documentId]);
    const href = getDocumentHref(documentId);
    if (href && typeof window !== "undefined") {
      window.open(href, "_blank", "noopener,noreferrer");
    } else if (typeof window !== "undefined") {
      window.alert("This document cannot be generated yet. Please refresh from your report link.");
    }
    openOrLockTab("downloads");
  }

  function handleDownloadAll(): void {
    markDocumentsRegenerated(documentStates.map((state) => state.documentId));
    if (isPreviewMode && typeof window !== "undefined") {
      const type = productTier === "blueprint-plus" ? "blueprint-plus" : "blueprint";
      window.open(`/api/preview/pdf?type=${type}&download=1`, "_blank", "noopener,noreferrer");
      openOrLockTab("downloads");
      return;
    }
    if (reportId && productTier === "blueprint-plus" && typeof window !== "undefined") {
      const encodedReportId = encodeURIComponent(reportId);
      const encodedEmail = userEmail ? encodeURIComponent(userEmail) : "";
      const emailParam = encodedEmail ? `&email=${encodedEmail}` : "";
      window.open(
        `/api/downloads/bundle?reportId=${encodedReportId}&tier=blueprint-plus${emailParam}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
    openOrLockTab("downloads");
  }

  const resultsDeliveredAt = useMemo(() => {
    const raw = diagnosticData.resultsDeliveredAt;
    if (typeof raw === "string" && raw) return raw;
    return new Date().toISOString();
  }, [diagnosticData]);
  const workbookStorageKey = useMemo(() => {
    const reportId = diagnosticData.reportId;
    const email = diagnosticData.userEmail;
    if (typeof reportId !== "string" || !reportId) return null;
    if (typeof email !== "string" || !email) return `workbook-v2:${reportId}`;
    return `workbook-v2:${reportId}:${email.toLowerCase()}`;
  }, [diagnosticData]);

  useEffect(() => {
    if (!reportId || !userEmail) return;
    if (productTier !== "blueprint" && productTier !== "blueprint-plus") return;

    let mounted = true;
    (async () => {
      try {
        const response = await fetch(
          `/api/workbook?reportId=${encodeURIComponent(reportId)}&email=${encodeURIComponent(userEmail)}`,
        );
        if (!response.ok) return;
        const payload = await response.json();
        const workbook = payload?.workbook as Record<string, unknown> | undefined;
        if (!workbook || !mounted) return;

        const customSections =
          workbook.custom_sections && typeof workbook.custom_sections === "object"
            ? (workbook.custom_sections as Record<string, unknown>)
            : {};

        const persistedSections =
          customSections.workbook_tab_sections &&
          typeof customSections.workbook_tab_sections === "object"
            ? (customSections.workbook_tab_sections as Record<string, string>)
            : {};
        const persistedVersions =
          customSections.workbook_tab_versions &&
          Array.isArray(customSections.workbook_tab_versions)
            ? (customSections.workbook_tab_versions as WorkbookVersion[])
            : [];

        const sectionContent = {} as Record<WorkbookSectionId, string>;
        for (const section of WORKBOOK_SECTIONS) {
          sectionContent[section.id] = persistedSections[section.id] ?? "";
        }
        const mergedContent = mergeSeedSectionContent(sectionContent, workbookSeedContent);

        setWorkbookCustomSections(customSections);
        setWorkbookState({
          sectionContent: mergedContent,
          lastSavedAt:
            typeof workbook.updated_at === "string" && workbook.updated_at
              ? workbook.updated_at
              : undefined,
          versions: persistedVersions,
        });
      } catch {
        // Local fallback remains active if API fetch fails.
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productTier, reportId, userEmail, workbookSeedContent]);

  useEffect(() => {
    if (typeof window === "undefined" || !workbookStorageKey) return;
    try {
      const raw = window.localStorage.getItem(workbookStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as WorkbookState;
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.sectionContent &&
        typeof parsed.sectionContent === "object" &&
        Array.isArray(parsed.versions)
      ) {
        const seededContent = mergeSeedSectionContent(
          parsed.sectionContent as Record<WorkbookSectionId, string>,
          workbookSeedContent,
        );
        setWorkbookState({
          ...parsed,
          sectionContent: seededContent,
        });
      }
    } catch {
      // Ignore parse/storage failures.
    }
  }, [workbookStorageKey, workbookSeedContent]);

  useEffect(() => {
    if (typeof window === "undefined" || !workbookStorageKey) return;
    try {
      window.localStorage.setItem(workbookStorageKey, JSON.stringify(workbookState));
    } catch {
      // Ignore storage failures.
    }
  }, [workbookState, workbookStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(documentStateStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as DocumentTileState[];
      if (!Array.isArray(parsed)) return;
      const map = new Map(parsed.map((item) => [item.documentId, item]));
      setDocumentStates((current) =>
        current.map((item) => {
          const persisted = map.get(item.documentId);
          return persisted ? { ...item, ...persisted } : item;
        }),
      );
    } catch {
      // Ignore storage parse failures.
    }
  }, [documentStateStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(documentStateStorageKey, JSON.stringify(documentStates));
    } catch {
      // Ignore storage write failures.
    }
  }, [documentStates, documentStateStorageKey]);

  async function handleSaveSection(sectionId: string, content: string): Promise<void> {
    const currentPersistedSections =
      workbookCustomSections.workbook_tab_sections &&
      typeof workbookCustomSections.workbook_tab_sections === "object"
        ? (workbookCustomSections.workbook_tab_sections as Record<string, string>)
        : {};
    const nextCustomSections: Record<string, unknown> = {
      ...workbookCustomSections,
      workbook_tab_sections: {
        ...currentPersistedSections,
        [sectionId]: content,
      },
    };

    if (reportId && userEmail && (productTier === "blueprint" || productTier === "blueprint-plus")) {
      const response = await fetch("/api/workbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          email: userEmail,
          updates: { custom_sections: nextCustomSections },
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to persist workbook section");
      }
      setWorkbookCustomSections(nextCustomSections);
    }

    setWorkbookState((previous) => ({
      ...previous,
      sectionContent: {
        ...previous.sectionContent,
        [sectionId]: content,
      },
      lastSavedAt: new Date().toISOString(),
    }));
    const affectedDocumentIds = SECTION_TO_DOCUMENTS[sectionId] ?? [];
    if (affectedDocumentIds.length > 0) {
      setDocumentStates((previous) =>
        previous.map((state) =>
          affectedDocumentIds.includes(state.documentId)
            ? {
                ...state,
                needsRegeneration: true,
                lifecycleState:
                  state.lifecycleState === "published" || state.lifecycleState === "in_review"
                    ? "stale"
                    : "draft",
              }
            : state,
        ),
      );
    }
  }

  async function handleSaveMoodBoard(samples: NormalizedImagerySample[]): Promise<void> {
    const nextCustomSections: Record<string, unknown> = {
      ...workbookCustomSections,
      mood_board_image_samples: samples,
    };

    const shouldPersistApi =
      reportId &&
      userEmail &&
      (productTier === "blueprint" || productTier === "blueprint-plus") &&
      !isPreviewMode;

    if (shouldPersistApi) {
      const response = await fetch("/api/workbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          email: userEmail,
          updates: { custom_sections: nextCustomSections },
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to persist mood board");
      }
    }
    setWorkbookCustomSections(nextCustomSections);

    const affectedDocumentIds = SECTION_TO_DOCUMENTS["mood-board"] ?? [];
    if (affectedDocumentIds.length > 0) {
      setDocumentStates((previous) =>
        previous.map((state) =>
          affectedDocumentIds.includes(state.documentId)
            ? {
                ...state,
                needsRegeneration: true,
                lifecycleState:
                  state.lifecycleState === "published" || state.lifecycleState === "in_review"
                    ? "stale"
                    : "draft",
              }
            : state,
        ),
      );
    }
  }

  async function handleSaveVersion(label?: string): Promise<void> {
    const version: WorkbookVersion = {
      versionId: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      label,
      sectionSnapshots: { ...workbookState.sectionContent },
    };

    const currentPersistedVersions =
      workbookCustomSections.workbook_tab_versions &&
      Array.isArray(workbookCustomSections.workbook_tab_versions)
        ? (workbookCustomSections.workbook_tab_versions as WorkbookVersion[])
        : [];
    const nextVersions = [...currentPersistedVersions, version];
    const nextCustomSections: Record<string, unknown> = {
      ...workbookCustomSections,
      workbook_tab_sections: { ...workbookState.sectionContent },
      workbook_tab_versions: nextVersions,
    };

    if (reportId && userEmail && productTier === "blueprint-plus") {
      const response = await fetch("/api/workbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          email: userEmail,
          updates: { custom_sections: nextCustomSections },
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to persist workbook version");
      }
      setWorkbookCustomSections(nextCustomSections);
    }

    setWorkbookState((previous) => ({
      ...previous,
      versions: [...previous.versions, version],
    }));
  }

  async function handleRestoreVersion(version: WorkbookVersion): Promise<void> {
    const nextCustomSections: Record<string, unknown> = {
      ...workbookCustomSections,
      workbook_tab_sections: { ...version.sectionSnapshots },
    };
    if (reportId && userEmail && productTier === "blueprint-plus") {
      const response = await fetch("/api/workbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          email: userEmail,
          updates: { custom_sections: nextCustomSections },
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to persist workbook restore");
      }
      setWorkbookCustomSections(nextCustomSections);
    }

    setWorkbookState((previous) => ({
      ...previous,
      sectionContent: { ...version.sectionSnapshots },
    }));
  }

  function openOrLockTab(tabId: ResultsTab): void {
    const tab = TAB_DEFINITIONS.find((item) => item.id === tabId);
    if (!tab) return;
    if (isTabAvailable(tab, productTier)) {
      setLockedTabContext(null);
      setActiveTab(tabId);
      return;
    }
    if (tab.id === "results") return;
    setLockedTabContext({
      tabId: tab.id,
      tabLabel: tab.label,
      availableFrom: tab.availableFrom,
    });
  }

  const openFoundationSection = useCallback(
    (sectionDomId: string) => {
      if (!foundationTabAvailable) return;
      const id = sectionDomId.trim();
      if (!id) return;
      setLockedTabContext(null);
      setPendingFoundationSectionId(id);
      setActiveTab("foundation");
    },
    [foundationTabAvailable],
  );

  function jumpToWorkbookSection(sectionId: WorkbookSectionId, activationPlanId?: string): void {
    if (productTier === "snapshot") {
      openOrLockTab("workbook");
      return;
    }
    if (typeof activationPlanId === "string" && activationPlanId.trim()) {
      setPendingActivationPlanId(activationPlanId as ActivationPlanSectionId);
    }
    setFocusedWorkbookSectionId(sectionId);
    setLockedTabContext(null);
    setActiveTab("workbook");
  }

  useEffect(() => {
    if (!pendingActivationPlanId) return;
    const sections = filterActivationPlanSections(
      productTier,
      buildActivationPlanSectionsList(diagnosticData, scheduleRows.length),
    );
    const sourcePlan = sections.find((section) => section.id === pendingActivationPlanId);
    if (!sourcePlan) {
      setPendingActivationPlanId(null);
      return;
    }
    const marker = `Activation plan: ${sourcePlan.label}`;
    setWorkbookState((previous) => {
      const current = previous.sectionContent[sourcePlan.workbookSectionId] ?? "";
      if (current.includes(marker)) return previous;
      const seeded = current.trim()
        ? `${current.trim()}\n\n---\n\n${marker}\n${sourcePlan.body}`
        : `${marker}\n${sourcePlan.body}`;
      return {
        ...previous,
        sectionContent: {
          ...previous.sectionContent,
          [sourcePlan.workbookSectionId]: seeded,
        },
      };
    });
    setFocusedWorkbookSectionId(sourcePlan.workbookSectionId);
    setPendingActivationPlanId(null);
  }, [pendingActivationPlanId, productTier, diagnosticData, scheduleRows]);

  useEffect(() => {
    if (activeTab !== "foundation" || !pendingFoundationSectionId) return;
    const id = pendingFoundationSectionId;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setPendingFoundationSectionId(null);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [activeTab, pendingFoundationSectionId]);

  const handoffActions = useMemo(() => {
    const foundationTab = TAB_DEFINITIONS.find((t) => t.id === "foundation");
    const standardsTab = TAB_DEFINITIONS.find((t) => t.id === "standards");
    if (activeTab === "results") {
      if (foundationTab && isTabAvailable(foundationTab, productTier)) {
        return [{ id: "foundation" as ResultsTab, label: "Open Foundation Platform" }];
      }
      return [{ id: "downloads" as ResultsTab, label: "Download Your Report" }];
    }
    if (activeTab === "foundation") {
      return [{ id: "strategy" as ResultsTab, label: "Review Strategic Plan" }];
    }
    if (activeTab === "strategy") {
      if (standardsTab && isTabAvailable(standardsTab, productTier)) {
        return [{ id: "standards" as ResultsTab, label: "Open Brand Standards" }];
      }
      return [{ id: "activation" as ResultsTab, label: "Open Activation Plan" }];
    }
    if (activeTab === "standards") {
      return [{ id: "activation" as ResultsTab, label: "Open Activation Plan" }];
    }
    if (activeTab === "activation") {
      return [
        { id: "workbook" as ResultsTab, label: "Refine and Save in Workbook" },
        { id: "downloads" as ResultsTab, label: "Download Deliverables" },
      ];
    }
    if (activeTab === "workbook") {
      return [{ id: "downloads" as ResultsTab, label: "Export Final Deliverables" }];
    }
    if (activeTab === "downloads") {
      return [{ id: "activation" as ResultsTab, label: "Back to Activation Plan" }];
    }
    return [];
  }, [activeTab, productTier]);

  const suiteNavContextValue: ResultsSuiteNav = foundationTabAvailable
    ? { openTab: openOrLockTab, openFoundationSection }
    : { openTab: openOrLockTab };

  return (
    <ResultsSuiteNavContext.Provider value={suiteNavContextValue}>
    <div
      className="results-suite-root"
      style={{ backgroundColor: SUITE_BG_PAGE, minHeight: "100vh", fontFamily: SUITE_FONT_UI }}
    >
      <CompactResultsHeader
        productName={productDisplayName}
        companyName={
          typeof diagnosticData.companyName === "string" && diagnosticData.companyName
            ? diagnosticData.companyName
            : "Your Brand"
        }
        reportDateIso={
          typeof diagnosticData.resultsDeliveredAt === "string"
            ? diagnosticData.resultsDeliveredAt
            : undefined
        }
        onGoToDownloads={() => openOrLockTab("downloads")}
      />
      <ResultsTabNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setLockedTabContext(null);
          setActiveTab(tab);
        }}
        productTier={productTier}
        onLockedTabClick={(tab) => {
          if (tab.id === "results") return;
          setLockedTabContext({
            tabId: tab.id,
            tabLabel: tab.label,
            availableFrom: tab.availableFrom,
          });
        }}
      />
      {!lockedTabContext && (
        <HowToUseBanner productName={productDisplayName} productTier={productTier} />
      )}

      {lockedTabContext && (
        <LockedTabPrompt
          tabLabel={lockedTabContext.tabLabel}
          availableFrom={lockedTabContext.availableFrom}
          featuresPreview={LOCKED_TAB_FEATURES[lockedTabContext.tabId]?.features ?? []}
          seeWhatsIncludedUrl={WUNDERBAR_SUITE_LOCKED_TAB_URL}
          talkToExpertUrl="https://calendly.com/wunderbardigital/expert-call"
          onDismiss={() => {
            setLockedTabContext(null);
            setActiveTab("results");
          }}
        />
      )}

      {!lockedTabContext && activeTab === "results" && (
        <div className="results-tab-content" style={SUITE_TAB_BODY_SHELL}>
          <div style={SUITE_INTRO_BAND_STYLE}>
            <p style={SUITE_INTRO_EYEBROW_TEXT_STYLE}>
              {resultsTabIntro.eyebrow}
            </p>
            <h1 style={SUITE_INTRO_TITLE_TEXT_STYLE}>
              {resultsTabIntro.title}
            </h1>
            <TabIntroGuidanceBlock intro={resultsTabIntro} guidanceStyle={SUITE_INTRO_GUIDANCE_TEXT_STYLE} />
          </div>
          <ResultsActivationRoutingCallout
            productTier={productTier}
            onOpenActivation={() => openOrLockTab("activation")}
          />
          {resultsContent}
        </div>
      )}
      {!lockedTabContext && activeTab === "foundation" && (
        <div className="foundation-tab-content" style={SUITE_TAB_BODY_SHELL}>
          <div style={SUITE_INTRO_BAND_STYLE}>
            <p style={SUITE_INTRO_EYEBROW_TEXT_STYLE}>
              {foundationTabIntro.eyebrow}
            </p>
            <p style={SUITE_INTRO_TITLE_TEXT_STYLE}>
              {foundationTabIntro.title}
            </p>
            <TabIntroGuidanceBlock intro={foundationTabIntro} guidanceStyle={SUITE_INTRO_GUIDANCE_TEXT_STYLE} />
          </div>
          <div style={SUITE_CHIP_CARD_STYLE}>
            <TabSectionMenu
              title="Foundation"
              items={foundationNavItems}
              description={TAB_SECTION_NAV_HINT_CHIPS_ONLY}
              suiteChipCardEmbed
            />
          </div>
          {foundationContent}
        </div>
      )}
      {!lockedTabContext && activeTab === "strategy" && (
        <div className="strategy-tab-content" style={SUITE_TAB_BODY_SHELL}>
          <div style={SUITE_INTRO_BAND_STYLE}>
            <p style={SUITE_INTRO_EYEBROW_TEXT_STYLE}>{strategyTabIntro.eyebrow}</p>
            <p style={SUITE_INTRO_TITLE_TEXT_STYLE}>{strategyTabIntro.title}</p>
            <TabIntroGuidanceBlock intro={strategyTabIntro} guidanceStyle={SUITE_INTRO_GUIDANCE_TEXT_STYLE} />
          </div>
          <div style={SUITE_CHIP_CARD_STYLE}>
            <TabSectionMenu
              title="Strategy"
              items={strategyNavItems}
              description={TAB_SECTION_NAV_HINT_CHIPS_ONLY}
              suiteChipCardEmbed
              activeSectionId={strategyShellActiveId}
            />
          </div>
          <StrategyTab
            productTier={productTier}
            diagnosticData={diagnosticData}
            onEditInWorkbook={jumpToWorkbookSection}
            shellRendersSectionChips
            shellActiveSectionId={strategyShellActiveId}
          />
        </div>
      )}
      {!lockedTabContext && activeTab === "standards" && (
        <div className="standards-tab-content" style={SUITE_TAB_BODY_SHELL}>
          <div style={SUITE_INTRO_BAND_STYLE}>
            <p style={SUITE_INTRO_EYEBROW_TEXT_STYLE}>{standardsTabIntro.eyebrow}</p>
            <p style={SUITE_INTRO_TITLE_TEXT_STYLE}>{standardsTabIntro.title}</p>
            <TabIntroGuidanceBlock intro={standardsTabIntro} guidanceStyle={SUITE_INTRO_GUIDANCE_TEXT_STYLE} />
          </div>
          <div style={SUITE_CHIP_CARD_STYLE}>
            <TabSectionMenu
              title="Brand Standards"
              items={STANDARDS_SUITE_NAV_ITEMS}
              description={TAB_SECTION_NAV_HINT_CHIPS_ONLY}
              suiteChipCardEmbed
              activeSectionId={standardsShellActiveId}
            />
          </div>
          <BrandStandardsTab
            productTier={productTier}
            diagnosticData={diagnosticDataForStandards}
            onEditInWorkbook={jumpToWorkbookSection}
            shellRendersSectionChips
            shellActiveSectionId={standardsShellActiveId}
          />
        </div>
      )}
      {!lockedTabContext && activeTab === "activation" && (
        <div className="activation-tab-content" style={SUITE_TAB_BODY_SHELL}>
          <div style={SUITE_INTRO_BAND_STYLE}>
            <p style={SUITE_INTRO_EYEBROW_TEXT_STYLE}>{activationTabIntro.eyebrow}</p>
            <p style={SUITE_INTRO_TITLE_TEXT_STYLE}>{activationTabIntro.title}</p>
            <TabIntroGuidanceBlock intro={activationTabIntro} guidanceStyle={SUITE_INTRO_GUIDANCE_TEXT_STYLE} />
          </div>
          <div style={SUITE_CHIP_CARD_STYLE}>
            <TabSectionMenu
              title="Activation"
              items={activationNavItemsForShell}
              description={TAB_SECTION_NAV_HINT_CHIPS_ONLY}
              suiteChipCardEmbed
              activeSectionId={activationShellActiveId}
            />
          </div>
          <ExecutionSuiteBridge
            mode="activation"
            reportLabel={executionReportLabel}
            onSelectPlans={() => openOrLockTab("activation")}
            onSelectWorkbook={() => openOrLockTab("workbook")}
            onSelectDownloads={() => openOrLockTab("downloads")}
          />
          <Suspense fallback={<div style={{ padding: 28, fontSize: 14, color: "#64748B" }}>Loading activation…</div>}>
            <ActivationTab
              productTier={productTier}
              diagnosticData={diagnosticData}
              scheduleRows={scheduleRows}
              onExportSchedule={() => setActiveTab("downloads")}
              onEditInWorkbook={jumpToWorkbookSection}
              onOpenStrategyTab={() => {
                setLockedTabContext(null);
                setActiveTab("strategy");
              }}
              shellRendersSectionChips
              shellActiveSectionId={activationShellActiveId}
            />
          </Suspense>
        </div>
      )}
      {!lockedTabContext && activeTab === "workbook" && (
        <div className="workbook-tab-content" style={SUITE_TAB_BODY_SHELL}>
          <div style={SUITE_INTRO_BAND_STYLE}>
            <p style={SUITE_INTRO_EYEBROW_TEXT_STYLE}>{workbookTabIntro.eyebrow}</p>
            <p style={SUITE_INTRO_TITLE_TEXT_STYLE}>{workbookTabIntro.title}</p>
            <TabIntroGuidanceBlock intro={workbookTabIntro} guidanceStyle={SUITE_INTRO_GUIDANCE_TEXT_STYLE} />
          </div>
          <div style={SUITE_CHIP_CARD_STYLE}>
            <TabSectionMenu
              title="Workbook"
              items={workbookNavItemsForShell}
              description={TAB_SECTION_NAV_HINT_CHIPS_ONLY}
              suiteChipCardEmbed
              activeSectionId={workbookShellActiveId}
            />
          </div>
          <ExecutionSuiteBridge
            mode="workbook"
            reportLabel={executionReportLabel}
            onSelectPlans={() => openOrLockTab("activation")}
            onSelectWorkbook={() => openOrLockTab("workbook")}
            onSelectDownloads={() => openOrLockTab("downloads")}
          />
          <WorkbookTab
            productTier={productTier}
            diagnosticData={diagnosticData}
            workbookState={workbookState}
            resultsDeliveredAt={resultsDeliveredAt}
            focusedSectionId={focusedWorkbookSectionId}
            onFocusedSectionHandled={() => setFocusedWorkbookSectionId(null)}
            onSaveSection={handleSaveSection}
            onSaveMoodBoard={handleSaveMoodBoard}
            moodBoardSamples={moodBoardSamplesPersisted}
            onSaveVersion={handleSaveVersion}
            onRestoreVersion={handleRestoreVersion}
            onExportWorkbook={() => setActiveTab("downloads")}
            onAskWundy={handleAskWundy}
            shellRendersSectionChips
            shellActiveSectionId={workbookShellActiveId}
          />
        </div>
      )}
      {!lockedTabContext && activeTab === "downloads" && (
        <div className="downloads-tab-content" style={SUITE_TAB_BODY_SHELL}>
          <div style={SUITE_INTRO_BAND_STYLE}>
            <p style={SUITE_INTRO_EYEBROW_TEXT_STYLE}>{downloadsTabIntro.eyebrow}</p>
            <p style={SUITE_INTRO_TITLE_TEXT_STYLE}>{downloadsTabIntro.title}</p>
            <TabIntroGuidanceBlock intro={downloadsTabIntro} guidanceStyle={SUITE_INTRO_GUIDANCE_TEXT_STYLE} />
          </div>
          <div style={SUITE_CHIP_CARD_STYLE}>
            <TabSectionMenu
              title="Downloads"
              items={downloadsNavForShell.navItems}
              description={TAB_SECTION_NAV_HINT_CHIPS_ONLY}
              suiteChipCardEmbed
              activeSectionId={downloadsShellActiveId}
            />
          </div>
          <ExecutionSuiteBridge
            mode="downloads"
            reportLabel={executionReportLabel}
            onSelectPlans={() => openOrLockTab("activation")}
            onSelectWorkbook={() => openOrLockTab("workbook")}
            onSelectDownloads={() => openOrLockTab("downloads")}
          />
          <DownloadsTab
            productTier={productTier}
            documentStates={documentStates}
            onDownload={handleDownload}
            onGenerate={handleGenerate}
            onDownloadAll={
              productTier === "blueprint-plus" && !isPreviewMode ? handleDownloadAll : undefined
            }
            shellRendersSectionChips
            shellActiveSectionId={downloadsShellActiveId}
          />
        </div>
      )}
      {!lockedTabContext && handoffActions.length > 0 && (
        <div
          style={{
            maxWidth: SUITE_CONTENT_MAX_PX,
            margin: "8px auto 56px",
            padding: "0 min(24px, 4vw)",
            fontFamily: SUITE_FONT_UI,
          }}
        >
          <div
            style={{
              border: "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: 14,
              backgroundColor: "#FFFFFF",
              boxShadow: SUITE_SHADOW_CARD,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 13, color: SUITE_TEXT_PRIMARY, fontWeight: 600, letterSpacing: "-0.01em" }}>
              Next step
            </span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {handoffActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => openOrLockTab(action.id)}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = SUITE_ACCENT_HOVER;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = SUITE_ACCENT_BRIGHT;
                  }}
                  style={{
                    border: "none",
                    borderRadius: SUITE_RADIUS_BUTTON,
                    backgroundColor: SUITE_ACCENT_BRIGHT,
                    color: "#FFFFFF",
                    padding: "10px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: SUITE_FONT_UI,
                    letterSpacing: "-0.01em",
                    transition: "background-color 0.2s ease, transform 0.15s ease",
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ResultsWundyChat reportId={isPreviewMode ? "" : reportId} productTier={productTier} />
    </div>
    </ResultsSuiteNavContext.Provider>
  );
}
