// lib/ai/reportGeneration.ts
// ─────────────────────────────────────────────────────────────────
// AI-powered report generation service.
// Connects the report prompts to the AI abstraction layer.
//
// This module is the bridge between:
//   - Assessment data (collected by Wundy™)
//   - Report prompts (src/prompts/)
//   - AI providers (lib/ai/)
//   - API routes that save + serve reports
//
// ARCHITECTURE:
//   Free tier → deterministic scoring + AI-generated insights
//   Snapshot+ → single AI call with full prompt
//   Blueprint → single AI call with full prompt
//   Blueprint+ → multi-call pipeline (4 calls) to avoid truncation
// ─────────────────────────────────────────────────────────────────

import { completeWithFallback } from "@/lib/ai";
import type { UseCase } from "@/lib/ai/config";
import type { ChatMessage } from "@/lib/ai/types";
import { logger } from "@/lib/logger";
import { getAssetAnalyses, formatAssetContext } from "@/lib/assetAnalysis";
import { buildSpendRecommendationContext } from "@/lib/spendRecommendation";
import { ensurePaidMediaChannelsMinimum } from "@/lib/activation/paidMediaPlanFields";

// ─── Prompt imports ──────────────────────────────────────────────

import { brandSnapshotReportPrompt } from "@/src/prompts/brandSnapshotReportPrompt";
import { snapshotPlusEnginePrompt } from "@/src/prompts/snapshotPlusEnginePrompt";
import { blueprintEnginePrompt } from "@/src/prompts/blueprintEnginePrompt";
import { blueprintPlusReportPrompt } from "@/src/prompts/blueprintPlusReportPrompt";

// ─── Types ──────────────────────────────────────────────────────

export type ReportTier = "free" | "snapshot_plus" | "blueprint" | "blueprint_plus";

export interface AssessmentInput {
  userName?: string;
  businessName?: string;
  industry?: string;
  geographicScope?: string;
  audienceType?: string;
  website?: string;
  socials?: string[];
  hasBrandGuidelines?: boolean;
  brandConsistency?: string;
  currentCustomers?: string;
  idealCustomers?: string;
  idealDiffersFromCurrent?: boolean;
  /** Optional: third/parallel distinct segment (partners, second region, etc.) from Wundy follow-up 13b. */
  additionalDistinctSegmentsNote?: string | null;
  /** Next 2–4 week actions with current resources (Wundy 36H). */
  implementationPrioritiesNow?: string | null;
  /** Longer-term / when-budget priorities (Wundy 36H). */
  implementationPrioritiesScaling?: string | null;
  competitorNames?: string[];
  customerAcquisitionSource?: string[];
  offerClarity?: string;
  messagingClarity?: string;
  brandVoiceDescription?: string;
  writingPreferences?: string;
  missionStatement?: string;
  visionStatement?: string;
  coreValues?: string[];
  brandOriginStory?: string;
  guidelineDetails?: string;
  primaryGoals?: string[];
  biggestChallenge?: string;
  whatMakesYouDifferent?: string;
  hasTestimonials?: boolean;
  hasCaseStudies?: boolean;
  hasEmailList?: boolean;
  hasLeadMagnet?: boolean;
  /** When hasLeadMagnet, Wundy collects title/format/summary (+ optional URL) for optimization fidelity. */
  leadMagnetDetails?: {
    title?: string | null;
    format?: string | null;
    summary?: string | null;
    urlOrLocation?: string | null;
  } | null;
  hasClearCTA?: boolean;
  marketingChannels?: string[];
  visualConfidence?: string;
  brandPersonalityWords?: string[];
  keyTopicsAndThemes?: string;
  contentFormatPreferences?: string[];
  archetypeSignals?: {
    decisionStyle?: string;
    authoritySource?: string;
    riskOrientation?: string;
    customerExpectation?: string;
  };
  revenueRange?: string;
  previousBrandWork?: string;
  yearsInBusiness?: string;
  teamSize?: string;
  userRoleContext?: string;
  topAcquisitionChannel?: string;
  monthlyMarketingBudget?: "under_500" | "500_2000" | "2000_5000" | "5000_plus" | string;
  paidAdsBudgetBand?: "none" | "under_1000" | "1000_3000" | "3000_10000" | "10000_plus" | string;
  paidAdsPrimaryObjective?:
    | "lead_volume"
    | "sales_volume"
    | "cpl_efficiency"
    | "roas"
    | "pipeline_quality"
    | "awareness"
    | string;
  monthlyRevenueRange?: string;
  averageTransactionValue?: string;
  conversionRateEstimate?: string;
  // Scoring data (passed through from scoring engine)
  brandAlignmentScore?: number;
  pillarScores?: Record<string, number>;
  pillarInsights?: Record<string, string>;
  recommendations?: Record<string, string>;
  // Benchmark context (if available)
  benchmarkContext?: string | null;
  [key: string]: unknown;
}

export interface GeneratedReport {
  tier: ReportTier;
  content: Record<string, unknown>;
  generatedAt: string;
  model: string;
  provider: string;
}

// ─── Tier → Use Case mapping ─────────────────────────────────────

const TIER_USE_CASE: Record<ReportTier, UseCase> = {
  free: "report_free",
  snapshot_plus: "report_snapshot_plus",
  blueprint: "report_blueprint",
  blueprint_plus: "report_blueprint_plus",
};

// ─── Tier → Prompt mapping ───────────────────────────────────────

const TIER_PROMPT: Record<ReportTier, string> = {
  free: brandSnapshotReportPrompt,
  snapshot_plus: snapshotPlusEnginePrompt,
  blueprint: blueprintEnginePrompt,
  blueprint_plus: blueprintPlusReportPrompt,
};

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Sanitize and format assessment data as a clean JSON string for the AI.
 * Removes nullish values and internal fields the AI doesn't need.
 */
function formatInputForAI(input: AssessmentInput): string {
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    // Skip internal/meta fields
    if (key.startsWith("_") || key === "servicesInterest" || key === "expertConversation" || key === "contentOptIn") {
      continue;
    }
    // Skip null/undefined but keep false/0/empty string
    if (value === null || value === undefined) continue;
    // Skip empty arrays
    if (Array.isArray(value) && value.length === 0) continue;
    cleaned[key] = value;
  }

  // Deterministic budget guidance context to ground channel recommendations.
  if (!("spendRecommendationContext" in cleaned)) {
    cleaned.spendRecommendationContext = buildSpendRecommendationContext(
      cleaned as Record<string, unknown>,
    );
  }

  return JSON.stringify(cleaned, null, 2);
}

function attachSpendContext(
  content: Record<string, unknown>,
  input: AssessmentInput,
): Record<string, unknown> {
  const spendContext = buildSpendRecommendationContext(input as Record<string, unknown>);

  const patched = { ...content, spendRecommendationContext: spendContext } as Record<string, unknown>;

  const conversionStrategy = patched.conversionStrategy;
  if (conversionStrategy && typeof conversionStrategy === "object" && !Array.isArray(conversionStrategy)) {
    patched.conversionStrategy = {
      ...(conversionStrategy as Record<string, unknown>),
      spendAlignmentPlan: {
        currentBudgetPlan: spendContext.budgetConstrainedPlan,
        growthRoadmap: spendContext.growthRoadmap,
        confidence: spendContext.confidence,
      },
    };
  }

  const paidMediaStrategy = patched.paidMediaStrategy;
  if (paidMediaStrategy && typeof paidMediaStrategy === "object" && !Array.isArray(paidMediaStrategy)) {
    patched.paidMediaStrategy = ensurePaidMediaChannelsMinimum({
      ...(paidMediaStrategy as Record<string, unknown>),
      budgetScenarios: spendContext.growthRoadmap.scenarios,
      allocationGuidance: spendContext.budgetConstrainedPlan.allocation,
    });
  }

  return patched;
}

type LooseRecord = Record<string, unknown>;

function asRecord(value: unknown): LooseRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as LooseRecord;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

/**
 * Strategy must always expose a full-year thematic plan for Blueprint tiers.
 * If AI returns partial rows (or only Q1), fill/normalize to Q1..Q4.
 */
function ensureQuarterlyContentCalendar(content: LooseRecord, businessName: string): void {
  const existing = asRecord(content.contentCalendarFramework) ?? {};
  const inputThemes = Array.isArray(existing.monthlyThemes) ? existing.monthlyThemes : [];
  const themeByQuarter = new Map<string, LooseRecord>();

  for (const raw of inputThemes) {
    const row = asRecord(raw);
    if (!row) continue;
    const month = asString(row.month).toUpperCase();
    if (month.startsWith("Q1")) themeByQuarter.set("Q1", row);
    else if (month.startsWith("Q2")) themeByQuarter.set("Q2", row);
    else if (month.startsWith("Q3")) themeByQuarter.set("Q3", row);
    else if (month.startsWith("Q4")) themeByQuarter.set("Q4", row);
  }

  const defaults: Record<string, LooseRecord> = {
    Q1: {
      month: "Q1",
      theme: "Positioning clarity and strategic alignment",
      contentPillarFocus: "Messaging foundation",
      keyTopics: [`What ${businessName} stands for`, "Audience pain points", "Differentiated value proposition"],
    },
    Q2: {
      month: "Q2",
      theme: "Proof and credibility expansion",
      contentPillarFocus: "Credibility and trust",
      keyTopics: ["Case-study proof", "Authority signals", "Objection-handling narratives"],
    },
    Q3: {
      month: "Q3",
      theme: "Demand capture and conversion efficiency",
      contentPillarFocus: "Conversion and offer strength",
      keyTopics: ["Offer-led campaigns", "Landing-page conversion patterns", "CTA sequencing by stage"],
    },
    Q4: {
      month: "Q4",
      theme: "Optimization, retention, and next-cycle planning",
      contentPillarFocus: "Growth governance",
      keyTopics: ["Quarterly review findings", "Scale/stop decisions", "Next-year strategic priorities"],
    },
  };

  const monthlyThemes = ["Q1", "Q2", "Q3", "Q4"].map((quarter) => {
    const source = themeByQuarter.get(quarter) ?? defaults[quarter]!;
    const topics = asStringArray(source.keyTopics);
    return {
      month: quarter,
      theme: asString(source.theme) || asString(defaults[quarter]!.theme),
      contentPillarFocus:
        asString(source.contentPillarFocus) || asString(defaults[quarter]!.contentPillarFocus),
      keyTopics: topics.length > 0 ? topics.slice(0, 4) : asStringArray(defaults[quarter]!.keyTopics),
    };
  });

  const weekly = asRecord(existing.weeklyStructure);
  const weeklyDays = Array.isArray(weekly?.days) ? weekly?.days : [];
  const normalizedDays = weeklyDays
    .map((raw) => asRecord(raw))
    .filter((row): row is LooseRecord => Boolean(row))
    .slice(0, 5)
    .map((row, idx) => ({
      day: asString(row.day) || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][idx]!,
      contentType: asString(row.contentType) || "Channel-native brand content",
      platform: asString(row.platform) || "Primary distribution channel",
      contentPillar: asString(row.contentPillar) || monthlyThemes[Math.min(idx, monthlyThemes.length - 1)]!.contentPillarFocus,
      exampleTopic:
        asString(row.exampleTopic) ||
        (monthlyThemes[Math.min(idx, monthlyThemes.length - 1)]!.keyTopics[0] ?? "Quarterly strategic priority"),
    }));

  content.contentCalendarFramework = {
    overview:
      asString(existing.overview) ||
      `Quarterly content system for ${businessName}: one strategic theme per quarter with weekly activation rhythm.`,
    conversion_intelligence_reference: existing.conversion_intelligence_reference,
    monthlyThemes,
    weeklyStructure: {
      description:
        asString(weekly?.description) ||
        "Run a weekly cadence that advances the active quarter theme and reinforces one message spine across channels.",
      days:
        normalizedDays.length > 0
          ? normalizedDays
          : [
              { day: "Monday", contentType: "Theme anchor", platform: "Website/Blog", contentPillar: monthlyThemes[0]!.contentPillarFocus, exampleTopic: monthlyThemes[0]!.keyTopics[0] ?? "Q1 priority" },
              { day: "Tuesday", contentType: "Proof asset", platform: "Social", contentPillar: monthlyThemes[1]!.contentPillarFocus, exampleTopic: monthlyThemes[1]!.keyTopics[0] ?? "Q2 priority" },
              { day: "Wednesday", contentType: "Nurture touch", platform: "Email", contentPillar: monthlyThemes[2]!.contentPillarFocus, exampleTopic: monthlyThemes[2]!.keyTopics[0] ?? "Q3 priority" },
              { day: "Thursday", contentType: "Conversion push", platform: "Landing page / campaign", contentPillar: monthlyThemes[2]!.contentPillarFocus, exampleTopic: monthlyThemes[2]!.keyTopics[1] ?? "Q3 conversion" },
              { day: "Friday", contentType: "Review + optimization", platform: "Internal ops", contentPillar: monthlyThemes[3]!.contentPillarFocus, exampleTopic: monthlyThemes[3]!.keyTopics[0] ?? "Q4 review" },
            ],
    },
    batchingStrategy:
      asString(existing.batchingStrategy) ||
      "Batch one core strategic asset per week, then repurpose into social, email, and sales-support slices.",
    repurposingPlaybook:
      asString(existing.repurposingPlaybook) ||
      "Turn each anchor asset into: one email, two social variants, one sales enablement snippet, and one conversion-page update.",
  };
}

function ensureActivationChannelCompleteness(content: LooseRecord): void {
  const email = asRecord(content.emailMarketingFramework) ?? {};
  const welcomeSequence = asRecord(email.welcomeSequence) ?? {};
  const welcomeEmails = Array.isArray(welcomeSequence.emails) ? welcomeSequence.emails : [];
  if (welcomeEmails.length < 4) {
    welcomeSequence.emails = [
      { timing: "Immediately", subject: "Welcome + strategic promise", purpose: "Frame value", keyMessage: "Set expectations and explain the primary outcome this program delivers." },
      { timing: "Day 2", subject: "Diagnostic insight + proof", purpose: "Build trust", keyMessage: "Share one concrete insight and a proof point tied to buyer pains." },
      { timing: "Day 5", subject: "How to apply this now", purpose: "Activation", keyMessage: "Provide one practical move the buyer can execute this week." },
      { timing: "Day 8", subject: "Next best step", purpose: "Conversion", keyMessage: "Offer the next-step CTA aligned to the same macro conversion goal." },
    ];
  }
  content.emailMarketingFramework = {
    ...email,
    overview: asString(email.overview) || "Email converts strategic intent into nurture and conversion momentum.",
    welcomeSequence: {
      ...welcomeSequence,
      description: asString(welcomeSequence.description) || "Four-email onboarding sequence from orientation to conversion.",
      emails: (Array.isArray(welcomeSequence.emails) ? welcomeSequence.emails : []).slice(0, 6),
    },
  };

  const social = asRecord(content.socialMediaStrategy) ?? {};
  const platforms = Array.isArray(social.platforms) ? social.platforms : [];
  if (platforms.length === 0) {
    social.platforms = [
      { platform: "LinkedIn", whyThisPlatform: "B2B authority and demand capture", audienceOnPlatform: "Economic buyers and operators", contentStrategy: "Proof-led thought leadership + clear CTA handoffs", postingFrequency: "3x weekly", contentMix: "50% education, 30% proof, 20% offer", examplePosts: ["Outcome story with metric + mechanism", "Common leak and fix", "Offer-linked insight post"], kpiToTrack: "Qualified leads from social" },
      { platform: "Email/Newsletter amplification", whyThisPlatform: "Owned distribution", audienceOnPlatform: "Warm prospects and current customers", contentStrategy: "Reinforce campaign message spine weekly", postingFrequency: "1x weekly", contentMix: "70% education, 30% conversion", examplePosts: ["Weekly insight with CTA", "Proof summary with next step"], kpiToTrack: "Click-through to conversion pages" },
    ];
  }
  content.socialMediaStrategy = {
    ...social,
    overview: asString(social.overview) || "Platform plan aligned to one conversion spine and offer narrative.",
    platforms: (Array.isArray(social.platforms) ? social.platforms : []).slice(0, 4),
  };

  const channelSections: Array<[keyof LooseRecord, string]> = [
    ["seoStrategy", "SEO plan with prioritized keywords, page targets, and conversion intent mapping."],
    ["aeoStrategy", "AEO plan with entity signals, citation-friendly content structure, and FAQ priorities."],
    ["thoughtLeadershipStrategy", "Thought leadership plan with owned content, media angles, and distribution cadence."],
  ];
  for (const [key, fallback] of channelSections) {
    const section = asRecord(content[key]) ?? {};
    content[key] = {
      ...section,
      overview: asString(section.overview) || fallback,
    };
  }

  const paid = asRecord(content.paidMediaStrategy);
  if (paid) {
    content.paidMediaStrategy = ensurePaidMediaChannelsMinimum(paid);
  }
}

function ensureBlueprintExecutionCompleteness(
  tier: ReportTier,
  content: Record<string, unknown>,
  input: AssessmentInput,
): Record<string, unknown> {
  if (tier !== "blueprint" && tier !== "blueprint_plus") return content;
  const next = { ...content } as LooseRecord;
  const businessName = asString(input.businessName) || "this brand";
  ensureQuarterlyContentCalendar(next, businessName);
  ensureActivationChannelCompleteness(next);
  return next;
}

/**
 * Parse the AI response as JSON.
 * Handles common AI quirks: markdown code fences, trailing text after JSON.
 */
function parseAIJsonResponse(content: string): Record<string, unknown> {
  let text = content.trim();

  // Strip markdown code fences
  if (text.startsWith("```json")) {
    text = text.slice(7);
  } else if (text.startsWith("```")) {
    text = text.slice(3);
  }
  if (text.endsWith("```")) {
    text = text.slice(0, -3);
  }
  text = text.trim();

  // Find the outermost JSON object
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("AI response does not contain a JSON object");
  }

  const jsonStr = text.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonStr);
  } catch (parseErr) {
    logger.error("[ReportGen] JSON parse failed", {
      error: parseErr instanceof Error ? parseErr.message : String(parseErr),
      contentLength: content.length,
      firstChars: content.slice(0, 200),
    });
    throw new Error("Failed to parse AI response as JSON");
  }
}

// ─── Single-call generation ──────────────────────────────────────

/**
 * Generate a report using a single AI call.
 * Used for Free, Snapshot+, and Blueprint tiers.
 */
async function generateSingleCall(
  tier: ReportTier,
  input: AssessmentInput
): Promise<GeneratedReport> {
  const useCase = TIER_USE_CASE[tier];
  const systemPrompt = TIER_PROMPT[tier];
  const inputJson = formatInputForAI(input);

  // Build the user message with the assessment data
  let userMessage = `Here is the structured brand assessment data for this report:\n\n${inputJson}`;

  // Append benchmark context if available
  if (input.benchmarkContext) {
    userMessage += `\n\n--- BENCHMARK DATA ---\n${input.benchmarkContext}`;
  }

  // Append uploaded asset analysis for Blueprint/Blueprint+ tiers
  if ((tier === "blueprint" || tier === "blueprint_plus") && input.businessName) {
    try {
      const tierKey = tier === "blueprint_plus" ? "blueprint-plus" : "blueprint";
      const email = (input as Record<string, unknown>).userEmail as string
        || (input as Record<string, unknown>).email as string;
      if (email) {
        const brandCtx = {
          pillarScores: input.pillarScores,
          businessName: input.businessName,
          brandVoice: input.brandVoiceDescription,
        };
        const assetSummary = await getAssetAnalyses(email, tierKey, brandCtx);
        if (assetSummary && assetSummary.analyzedAssets > 0) {
          userMessage += `\n\n${formatAssetContext(assetSummary, tierKey)}`;
          logger.info("[ReportGen] Appended asset analysis context", {
            tier,
            assetCount: assetSummary.analyzedAssets,
          });
        }
      }
    } catch (assetErr) {
      logger.warn("[ReportGen] Failed to fetch asset analyses", {
        error: assetErr instanceof Error ? assetErr.message : String(assetErr),
      });
    }
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  logger.info("[ReportGen] Starting generation", {
    tier,
    useCase,
    businessName: input.businessName,
    inputLength: inputJson.length,
  });

  const startTime = Date.now();

  const response = await completeWithFallback(useCase, { messages });

  const elapsed = Date.now() - startTime;
  logger.info("[ReportGen] Generation complete", {
    tier,
    elapsed: `${elapsed}ms`,
    provider: response.provider,
    model: response.model,
    contentLength: response.content?.length ?? 0,
  });

  if (!response.content) {
    throw new Error(`AI returned empty content for ${tier} report`);
  }

  const content = attachSpendContext(
    ensureBlueprintExecutionCompleteness(tier, parseAIJsonResponse(response.content), input),
    input,
  );

  return {
    tier,
    content,
    generatedAt: new Date().toISOString(),
    model: response.model,
    provider: response.provider,
  };
}

// ─── Multi-call pipeline for Blueprint+ ──────────────────────────

/**
 * Blueprint+ section groups for multi-call generation.
 * Each group is a separate AI call to stay within token limits
 * and maintain quality across all 48 sections.
 */
const BLUEPRINT_PLUS_SECTION_GROUPS = [
  {
    name: "foundation",
    description: "Foundation & Diagnostics (Sections 1-14: Executive Summary, Priority Diagnosis, Pillar Deep Dives, Context Coverage, Strategic Alignment, Archetypes, Brand Persona, Visual/Verbal Signals, Action Plan, Visibility, Audience Clarity, Prompt Pack, Guardrails, What's Next)",
    outputKeys: [
      "executiveSummary", "priorityDiagnosis", "pillarDeepDives",
      "contextCoverage", "strategicAlignmentOverview", "brandArchetypeSystem",
      "brandPersona", "visualVerbalSignals", "strategicActionPlan",
      "visibilityDiscovery", "audienceClarity", "foundationalPromptPack",
      "executionGuardrails", "whatsNextUnlocks",
    ],
  },
  {
    name: "strategy",
    description:
      "Brand Strategy & Personas (Sections 15-26: Blueprint Overview, Brand Foundation, Audience Persona Definition, Buyer Persona Ecosystem, Archetype Activation, Messaging System, Messaging Pillars, Content Pillars, Visual Direction, Conversion Strategy, Strategic Offer & Portfolio strategicOfferContext, Execution Prompt Pack)",
    outputKeys: [
      "blueprintOverview", "brandFoundation", "audiencePersonaDefinition",
      "buyerPersonaEcosystem", "brandArchetypeActivation", "messagingSystem",
      "messagingPillars", "contentPillars", "visualDirection",
      "conversionStrategy", "strategicOfferContext", "icpGoToMarketPlans", "executionPromptPack",
    ],
  },
  {
    name: "advanced",
    description: "Advanced Strategy (Sections 27-38, 52: Strategic Overview, Persona-Driven Segmentation, Advanced Messaging Matrix, Brand Architecture, Campaign Strategy, Advanced Prompt Library, Measurement & Optimization, Brand Consistency Checklist, Competitive Positioning, Strategic Trade-Offs, 90-Day Roadmap, Brand Health Scorecard, Measurement & KPI Framework)",
    outputKeys: [
      "strategicOverview", "personaDrivenSegmentation",
      "advancedMessagingMatrix", "brandArchitectureExpansion",
      "campaignContentStrategy", "advancedPromptLibrary",
      "measurementOptimization", "brandConsistencyChecklist",
      "competitivePositioning", "strategicTradeOffs",
      "ninetyDayRoadmap", "brandHealthScorecard",
      "measurementFramework",
    ],
  },
  {
    name: "execution",
    description: "Execution & Implementation (Sections 39-56: Taglines, Brand Story, Customer Journey Map, SEO Strategy, AEO Strategy, Email Marketing Strategy, Social Media Strategy, Content Calendar, SWOT Analysis, Brand Glossary, Company Description, Value & Pricing Framework, Sales Conversation Guide, Brand Strategy Rollout Guide, Brand Imagery & Photography Direction, Asset Optimization Playbook if assets provided, Brand Standards Guide Content)",
    outputKeys: [
      "taglineRecommendations", "brandStory", "customerJourneyMap",
      "seoStrategy", "aeoStrategy", "emailMarketingFramework",
      "socialMediaStrategy", "contentCalendarFramework",
      "swotAnalysis", "brandGlossary", "companyDescription",
      "valuePricingFramework", "salesConversationGuide",
      "brandStrategyRollout", "brandImageryDirection",
      "assetOptimizationPlaybook", "brandStandardsGuide",
    ],
  },
];

/**
 * Generate a Blueprint+ report using a multi-call pipeline.
 * Splits the Blueprint+ surface into 4 sequential AI calls for quality.
 */
async function generateBlueprintPlusMultiCall(
  input: AssessmentInput
): Promise<GeneratedReport> {
  const systemPrompt = TIER_PROMPT.blueprint_plus;
  const inputJson = formatInputForAI(input);
  const useCase = TIER_USE_CASE.blueprint_plus;

  let benchmarkSection = "";
  if (input.benchmarkContext) {
    benchmarkSection = `\n\n--- BENCHMARK DATA ---\n${input.benchmarkContext}`;
  }

  // Append uploaded asset analysis context with brand context for pillar-aligned recs
  let assetSection = "";
  try {
    const email = (input as Record<string, unknown>).userEmail as string
      || (input as Record<string, unknown>).email as string;
    if (email) {
      const brandCtx = {
        pillarScores: input.pillarScores,
        businessName: input.businessName,
        brandVoice: input.brandVoiceDescription,
      };
      const assetSummary = await getAssetAnalyses(email, "blueprint-plus", brandCtx);
      if (assetSummary && assetSummary.analyzedAssets > 0) {
        assetSection = `\n\n${formatAssetContext(assetSummary, "blueprint-plus")}`;
        logger.info("[ReportGen] Blueprint+ multi-call: appended asset context", {
          assetCount: assetSummary.analyzedAssets,
        });
      }
    }
  } catch (assetErr) {
    logger.warn("[ReportGen] Blueprint+ multi-call: asset fetch failed", {
      error: assetErr instanceof Error ? assetErr.message : String(assetErr),
    });
  }

  const mergedContent: Record<string, unknown> = {};
  let lastProvider = "";
  let lastModel = "";
  const startTime = Date.now();

  logger.info("[ReportGen] Starting Blueprint+ multi-call pipeline", {
    businessName: input.businessName,
    groups: BLUEPRINT_PLUS_SECTION_GROUPS.length,
  });

  for (let i = 0; i < BLUEPRINT_PLUS_SECTION_GROUPS.length; i++) {
    const group = BLUEPRINT_PLUS_SECTION_GROUPS[i];
    const groupStart = Date.now();

    // Build context: the full prompt + instruction to only generate specific sections
    const sectionInstruction = `
IMPORTANT: This is call ${i + 1} of ${BLUEPRINT_PLUS_SECTION_GROUPS.length} for this report.
Generate ONLY the following sections: ${group.description}

Return a JSON object containing ONLY these top-level keys:
${group.outputKeys.map((k) => `- "${k}"`).join("\n")}

${i > 0 ? `\nFor context, here is what was generated in previous calls (use this for consistency but do NOT repeat it):\n${JSON.stringify(mergedContent, null, 0).slice(0, 4000)}...\n` : ""}

Do NOT include any other sections. Return ONLY valid JSON with the keys listed above.`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Here is the structured brand assessment data:\n\n${inputJson}${benchmarkSection}${assetSection}\n\n${sectionInstruction}`,
      },
    ];

    logger.info(`[ReportGen] Blueprint+ call ${i + 1}/${BLUEPRINT_PLUS_SECTION_GROUPS.length}: ${group.name}`, {
      expectedKeys: group.outputKeys.length,
    });

    const response = await completeWithFallback(useCase, { messages });

    if (!response.content) {
      throw new Error(`AI returned empty content for Blueprint+ group: ${group.name}`);
    }

    const groupContent = parseAIJsonResponse(response.content);

    // Merge into combined output
    for (const key of group.outputKeys) {
      if (groupContent[key] !== undefined) {
        mergedContent[key] = groupContent[key];
      }
    }

    lastProvider = response.provider;
    lastModel = response.model;

    const groupElapsed = Date.now() - groupStart;
    logger.info(`[ReportGen] Blueprint+ call ${i + 1} complete`, {
      group: group.name,
      elapsed: `${groupElapsed}ms`,
      keysReceived: Object.keys(groupContent).length,
      keysExpected: group.outputKeys.length,
    });
  }

  const totalElapsed = Date.now() - startTime;
  logger.info("[ReportGen] Blueprint+ pipeline complete", {
    totalElapsed: `${totalElapsed}ms`,
    totalKeys: Object.keys(mergedContent).length,
  });

  return {
    tier: "blueprint_plus",
    content: attachSpendContext(
      ensureBlueprintExecutionCompleteness("blueprint_plus", mergedContent, input),
      input,
    ),
    generatedAt: new Date().toISOString(),
    model: lastModel,
    provider: lastProvider,
  };
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Generate a report for any tier.
 *
 * @param tier - The product tier ("free" | "snapshot_plus" | "blueprint" | "blueprint_plus")
 * @param input - The assessment data collected from the user
 * @returns GeneratedReport with the full structured JSON content
 *
 * @example
 * const report = await generateAIReport("snapshot_plus", assessmentData);
 * // report.content contains the full Snapshot+ report JSON
 */
export async function generateAIReport(
  tier: ReportTier,
  input: AssessmentInput
): Promise<GeneratedReport> {
  // Validate minimum required data
  if (!input.businessName && !input.userName) {
    throw new Error("Assessment data must include at least businessName or userName");
  }

  try {
    if (tier === "blueprint_plus") {
      return await generateBlueprintPlusMultiCall(input);
    }
    return await generateSingleCall(tier, input);
  } catch (err) {
    logger.error("[ReportGen] Generation failed", {
      tier,
      businessName: input.businessName,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/**
 * Generate only specific sections of a report (for partial regeneration or upgrades).
 * Useful when a user upgrades from Snapshot+ to Blueprint — we can generate
 * only the new Blueprint sections using the existing Snapshot+ data as context.
 */
export async function generateReportSections(
  useCase: UseCase,
  systemPrompt: string,
  input: AssessmentInput,
  sectionKeys: string[],
  existingContext?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const inputJson = formatInputForAI(input);

  let userMessage = `Here is the structured brand assessment data:\n\n${inputJson}`;

  if (input.benchmarkContext) {
    userMessage += `\n\n--- BENCHMARK DATA ---\n${input.benchmarkContext}`;
  }

  userMessage += `\n\nGenerate ONLY these sections:\n${sectionKeys.map((k) => `- "${k}"`).join("\n")}`;

  if (existingContext) {
    userMessage += `\n\nExisting report context for reference:\n${JSON.stringify(existingContext, null, 0).slice(0, 6000)}`;
  }

  userMessage += "\n\nReturn ONLY valid JSON with the keys listed above.";

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const response = await completeWithFallback(useCase, { messages });

  if (!response.content) {
    throw new Error("AI returned empty content for section generation");
  }

  return parseAIJsonResponse(response.content);
}
