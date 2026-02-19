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

  return JSON.stringify(cleaned, null, 2);
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

  const content = parseAIJsonResponse(response.content);

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
    description: "Brand Strategy & Personas (Sections 15-25: Blueprint Overview, Brand Foundation, Audience Persona Definition, Buyer Persona Ecosystem, Archetype Activation, Messaging System, Messaging Pillars, Content Pillars, Visual Direction, Conversion Strategy, Execution Prompt Pack)",
    outputKeys: [
      "blueprintOverview", "brandFoundation", "audiencePersonaDefinition",
      "buyerPersonaEcosystem", "brandArchetypeActivation", "messagingSystem",
      "messagingPillars", "contentPillars", "visualDirection",
      "conversionStrategy", "executionPromptPack",
    ],
  },
  {
    name: "advanced",
    description: "Advanced Strategy (Sections 26-37, 51: Strategic Overview, Persona-Driven Segmentation, Advanced Messaging Matrix, Brand Architecture, Campaign Strategy, Advanced Prompt Library, Measurement & Optimization, Brand Consistency Checklist, Competitive Positioning, Strategic Trade-Offs, 90-Day Roadmap, Brand Health Scorecard, Measurement & KPI Framework)",
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
    description: "Execution & Implementation (Sections 38-55: Taglines, Brand Story, Customer Journey Map, SEO Strategy, AEO Strategy, Email Marketing Strategy, Social Media Strategy, Content Calendar, SWOT Analysis, Brand Glossary, Company Description, Value & Pricing Framework, Sales Conversation Guide, Brand Strategy Rollout Guide, Brand Imagery & Photography Direction, Asset Optimization Playbook if assets provided, Brand Standards Guide Content)",
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
 * Splits the 53 sections into 4 sequential AI calls for quality.
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
    content: mergedContent,
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
