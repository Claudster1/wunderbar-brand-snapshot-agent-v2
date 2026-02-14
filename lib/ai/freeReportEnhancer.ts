// lib/ai/freeReportEnhancer.ts
// ─────────────────────────────────────────────────────────────────
// AI-enhanced insights for the free WunderBrand Snapshot™ tier.
//
// Instead of hardcoded template strings like "Your positioning is a
// clear strength right now," this module generates personalized,
// business-specific insights using the scoring engine prompt.
//
// Key design decisions:
// - Uses the same scoring prompt format as the deterministic engine
// - Has a 15-second timeout — if AI doesn't respond, the caller
//   falls back to deterministic templates
// - Uses the cheapest model (gpt-4o-mini) to keep costs near zero
// - Results are personalized: reference business name, industry,
//   B2B/B2C context, and specific assessment data
// ─────────────────────────────────────────────────────────────────

import { completeWithFallback } from "@/lib/ai";
import type { ChatMessage } from "@/lib/ai/types";
import { scoringEnginePrompt } from "@/src/prompts/scoringEnginePrompt";
import { logger } from "@/lib/logger";

interface FreeInsightInput {
  businessName?: string;
  industry?: string;
  audienceType?: string;
  geographicScope?: string;
  revenueRange?: string;
  previousBrandWork?: string;
  biggestChallenge?: string;
  competitorNames?: string[];
  currentCustomers?: string;
  idealCustomers?: string;
  idealDiffersFromCurrent?: boolean;
  hasTestimonials?: boolean;
  hasCaseStudies?: boolean;
  hasEmailList?: boolean;
  hasLeadMagnet?: boolean;
  hasClearCTA?: boolean;
  marketingChannels?: string[];
  brandAlignmentScore?: number;
  pillarScores?: Record<string, number>;
  benchmarkContext?: string;
  [key: string]: unknown;
}

interface AIInsightResult {
  pillarInsights: Record<string, string>;
  recommendations: Record<string, string>;
  model: string;
}

/**
 * Generate AI-enhanced insights for the free WunderBrand Snapshot™ tier.
 *
 * Returns personalized pillar insights and recommendations that reference
 * the business by name, acknowledge their industry context, and provide
 * actionable guidance instead of generic template text.
 *
 * Has a 20-second hard timeout — returns null if AI doesn't respond in time.
 */
export async function generateAIInsights(
  input: FreeInsightInput
): Promise<AIInsightResult | null> {
  // Build the input JSON matching the scoring engine's expected format
  const cleanedInput: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) continue;
    if (key.startsWith("_")) continue;
    cleanedInput[key] = value;
  }

  const inputJson = JSON.stringify(cleanedInput, null, 2);

  let benchmarkSection = "";
  if (input.benchmarkContext) {
    benchmarkSection = `\n\nBENCHMARK DATA:\n${input.benchmarkContext}`;
  }

  const messages: ChatMessage[] = [
    { role: "system", content: scoringEnginePrompt },
    {
      role: "user",
      content: `Generate scoring insights and recommendations for this brand assessment. Return ONLY valid JSON matching the output structure specified in the system prompt.\n\n${inputJson}${benchmarkSection}`,
    },
  ];

  // Race against a 20-second timeout
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), 20_000);
  });

  try {
    const result = await Promise.race([
      completeWithFallback("report_free", { messages }),
      timeoutPromise,
    ]);

    if (!result || typeof result !== "object" || !("content" in result)) {
      logger.warn("[FreeReportEnhancer] AI call timed out or returned null");
      return null;
    }

    const response = result;
    if (!response.content) return null;

    // Parse the JSON response
    let text = response.content.trim();
    if (text.startsWith("```json")) text = text.slice(7);
    if (text.startsWith("```")) text = text.slice(3);
    if (text.endsWith("```")) text = text.slice(0, -3);
    text = text.trim();

    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) return null;

    const parsed = JSON.parse(text.slice(firstBrace, lastBrace + 1));

    // Extract and validate the fields we need
    const pillarInsights: Record<string, string> = {};
    const recommendations: Record<string, string> = {};

    const pillars = ["positioning", "messaging", "visibility", "credibility", "conversion"];
    for (const pillar of pillars) {
      // Insights
      if (parsed.pillarInsights?.[pillar] && typeof parsed.pillarInsights[pillar] === "string") {
        pillarInsights[pillar] = parsed.pillarInsights[pillar];
      }
      // Recommendations
      if (parsed.recommendations?.[pillar] && typeof parsed.recommendations[pillar] === "string") {
        recommendations[pillar] = parsed.recommendations[pillar];
      }
    }

    // Only return if we got meaningful content for at least 3 pillars
    const insightCount = Object.keys(pillarInsights).length;
    if (insightCount < 3) {
      logger.warn("[FreeReportEnhancer] Insufficient AI insights", { insightCount });
      return null;
    }

    return {
      pillarInsights,
      recommendations,
      model: response.model,
    };
  } catch (err) {
    logger.warn("[FreeReportEnhancer] AI generation failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
