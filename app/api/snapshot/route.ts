// app/api/snapshot/route.ts
// ------------------------------------------------------
// Processes WunderBrand Snapshot™ responses
// Saves report skeleton to Supabase
// Returns reportId for redirect
// ------------------------------------------------------

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { calculateBrandSnapshotScores } from "@/lib/brandSnapshotEngine";
import { buildContextCoverageMap } from "@/lib/enrichment/coverage";
import { triggerUpgradeEmails } from "@/lib/triggerUpgradeEmails";
import { randomUUID } from "crypto";
import { getPrimaryPillar } from "@/lib/pillars/getPrimaryPillar";
import { fireACEvent, trackActiveCampaignSiteEvent } from "@/lib/fireACEvent";
import {
  addContactToList,
  applyActiveCampaignTags,
  removeActiveCampaignTags,
  setContactFields,
} from "@/lib/applyActiveCampaignTags";
import { apiGuard } from "@/lib/security/apiGuard";
import { AI_RATE_LIMIT } from "@/lib/security/rateLimit";
import { sanitizeString, isValidEmail } from "@/lib/security/inputValidation";
import {
  recordBenchmarkData,
  getFullBenchmarkReport,
  formatBenchmarkContext,
} from "@/lib/benchmarkCollector";
import { logger } from "@/lib/logger";
import { generateAIInsights } from "@/lib/ai/freeReportEnhancer";
import { inferLikelyArchetype } from "@/lib/archetype/likelyArchetype";
import { z } from "zod";
import { createCrmSyncLog } from "@/lib/crm/inbound";
import { snapshotAnswersRecordSchema } from "@/lib/snapshot/snapshotAnswersSchema";
import {
  normalizeIntakeTierForStorage,
  storedTierToProductTierField,
} from "@/lib/results/resolveReportProductTier";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://app.wunderbrand.ai";

function normalizeBusinessType(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  if (value.includes("service_b2b") || value.includes("b2b service")) return "service_b2b";
  if (value.includes("service_b2c") || value.includes("b2c service")) return "service_b2c";
  if (value.includes("retail")) return "retail";
  if (value.includes("ecommerce") || value.includes("e-commerce") || value.includes("product brand")) return "ecommerce";
  if (value.includes("saas") || value.includes("software") || value.includes("app")) return "saas";
  if (value.includes("local_service") || value.includes("local service")) return "local_service";
  return null;
}

function inferBusinessTypeFromAnswers(answers: Record<string, unknown>): string {
  const corpus = [
    answers.businessName,
    answers.industry,
    answers.what_you_do,
    answers.response_1,
    answers.response_2,
    answers.response_3,
  ]
    .filter((x): x is string => typeof x === "string")
    .join(" ")
    .toLowerCase();

  if (/\bsaas|software|app|subscription\b/.test(corpus)) return "saas";
  if (/\be-?commerce|shopify|amazon|dtc|product\b/.test(corpus)) return "ecommerce";
  if (/\bretail|storefront|restaurant|boutique|food|beverage\b/.test(corpus)) return "retail";
  if (/\blocal|dental|medical|legal|salon|studio|clinic|contractor|trade\b/.test(corpus)) return "local_service";
  if (/\bb2c|consumer|clients|customers\b/.test(corpus)) return "service_b2c";
  return "service_b2b";
}

function normalizeAnswers(answers: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...answers };
  const explicitBusinessType =
    normalizeBusinessType(answers.businessType) ||
    normalizeBusinessType(answers.business_type) ||
    normalizeBusinessType(answers.primaryRevenueModel);

  normalized.businessType = explicitBusinessType || inferBusinessTypeFromAnswers(answers);

  if (typeof answers.monthlyRevenueRange !== "string" && typeof answers.monthly_revenue_range === "string") {
    normalized.monthlyRevenueRange = answers.monthly_revenue_range;
  }
  if (typeof answers.averageTransactionValue !== "string" && typeof answers.average_transaction_value === "string") {
    normalized.averageTransactionValue = answers.average_transaction_value;
  }
  if (typeof answers.conversionRateEstimate !== "string" && typeof answers.conversion_rate_estimate === "string") {
    normalized.conversionRateEstimate = answers.conversion_rate_estimate;
  }
  if (typeof answers.monthlyMarketingBudget !== "string" && typeof answers.monthly_marketing_budget === "string") {
    normalized.monthlyMarketingBudget = answers.monthly_marketing_budget;
  }
  if (typeof answers.contentCreationCapacity !== "string" && typeof answers.content_creation_capacity === "string") {
    normalized.contentCreationCapacity = answers.content_creation_capacity;
  }

  return normalized;
}

function asStringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asStringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asBooleanOrNull(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function asStringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function buildSummary(
  scores: { brandAlignmentScore: number; pillarScores: Record<string, number> },
  insights: string[],
  companyName?: string | null
): string {
  const name = companyName ? `${companyName}'s ` : "Your ";
  const score = scores.brandAlignmentScore;
  if (score >= 70) {
    return `${name}brand shows strong alignment (${score}/100). The biggest opportunities are in the areas where the score suggests refinement—focusing there will compound your existing strengths.`;
  }
  if (score >= 50) {
    return `${name}brand has a solid foundation (${score}/100). Prioritizing the recommendations below will help clarify positioning, messaging, and conversion so you can grow with confidence.`;
  }
  return `${name}WunderBrand Score™ (${score}/100) highlights specific areas to strengthen. The recommendations below are tailored to your results and will help establish credibility and drive growth.`;
}

function buildOpportunitiesSummary(
  recommendations: string[],
  pillarScores: Record<string, number>
): string {
  const weakPillars = (Object.entries(pillarScores) as [string, number][])
    .filter(([, v]) => v < 14)
    .map(([k]) => k);
  if (weakPillars.length === 0) {
    return "Your five pillars are in good shape. Keep documenting what works and apply it consistently across channels.";
  }
  if (recommendations.length >= 2) {
    return `Your biggest opportunities are in ${weakPillars.slice(0, 2).join(" and ")}. Addressing these first will have the highest impact on how your brand is perceived and how well it converts.`;
  }
  return `Focusing on ${weakPillars[0]} will strengthen your overall brand alignment and help you show up more clearly to your ideal customers.`;
}

function buildUpgradeCta(
  primaryPillar: string,
  companyName?: string | null
): string {
  const pillarLabel = primaryPillar.charAt(0).toUpperCase() + primaryPillar.slice(1);
  const name = companyName ? ` For ${companyName}, ` : " ";
  return `Your top opportunity is ${pillarLabel}.${name}Your full results are ready to unlock in Snapshot+™. See Your Full Results — $497 to get a detailed roadmap, persona-aligned messaging, and actionable next steps.`;
}

function humanizeBusinessType(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v.includes("service_b2b")) return "B2B service";
  if (v.includes("service_b2c")) return "B2C service";
  if (v.includes("local_service")) return "local service";
  if (v.includes("ecommerce")) return "ecommerce";
  if (v.includes("saas")) return "SaaS";
  if (v.includes("retail")) return "retail";
  return null;
}

function buildPillarInsightsFromScores(
  pillarScores: Record<string, number>,
  options?: { companyName?: string | null; businessType?: string | null },
) {
  const subject = options?.companyName?.trim() || "your brand";
  const businessType = humanizeBusinessType(options?.businessType);
  const contextLead = businessType
    ? `For a ${businessType} business like ${subject}, `
    : `For ${subject}, `;
  const mk = (pillar: string, score: number) => {
    if (score >= 18) {
      return {
        strength: `${contextLead}${pillar} is a clear strength right now — the foundation is working.`,
        opportunity: `Keep tightening consistency so this pillar stays an advantage as ${subject} scales.`,
        action: `Document the 2–3 patterns that are working best in ${pillar} for ${subject}, and apply them everywhere you show up.`,
      };
    }
    if (score >= 14) {
      return {
        strength: `${contextLead}${pillar} has a solid baseline — you’re not starting from zero.`,
        opportunity: `A few focused refinements would make this pillar feel sharper and more intentional.`,
        action: `Choose one change in ${pillar} that removes confusion (headline, positioning line, CTA, proof point) and implement it this week.`,
      };
    }
    return {
      strength: `${contextLead}there’s meaningful upside in ${pillar} — improving this will lift the whole system.`,
      opportunity: `Right now this pillar likely creates friction or uncertainty for new customers.`,
      action: `Start with one high-impact fix in ${pillar} (clarify the offer, simplify the narrative, add proof, or improve CTAs) and measure the change.`,
    };
  };

  return {
    positioning: mk("positioning", pillarScores.positioning ?? 0),
    messaging: mk("messaging", pillarScores.messaging ?? 0),
    visibility: mk("visibility", pillarScores.visibility ?? 0),
    credibility: mk("credibility", pillarScores.credibility ?? 0),
    conversion: mk("conversion", pillarScores.conversion ?? 0),
  };
}

function buildPillarRecommendationsFromScores(
  pillarScores: Record<string, number>,
  options?: { companyName?: string | null; businessType?: string | null },
): Record<string, string> {
  const subject = options?.companyName?.trim() || "your brand";
  const businessType = humanizeBusinessType(options?.businessType);
  const contextLead = businessType
    ? `For a ${businessType} business like ${subject}, `
    : `For ${subject}, `;
  const mk = (pillar: string, score: number): string => {
    if (score >= 18) {
      return `${contextLead}protect ${pillar} as a strength by codifying what is already working and replicating it across channels.`;
    }
    if (score >= 14) {
      return `${contextLead}prioritize one focused ${pillar} refinement this sprint to tighten clarity and reduce buyer friction.`;
    }
    return `${contextLead}treat ${pillar} as an immediate priority and ship one high-impact fix this week before layering new tactics.`;
  };
  return {
    positioning: mk("positioning", pillarScores.positioning ?? 0),
    messaging: mk("messaging", pillarScores.messaging ?? 0),
    visibility: mk("visibility", pillarScores.visibility ?? 0),
    credibility: mk("credibility", pillarScores.credibility ?? 0),
    conversion: mk("conversion", pillarScores.conversion ?? 0),
  };
}

function extractNumericTokens(values: Array<string | null | undefined>): Set<string> {
  const out = new Set<string>();
  const rx = /(\$?\d+(?:\.\d+)?%?)/g;
  for (const value of values) {
    if (!value) continue;
    const matches = value.match(rx) || [];
    for (const m of matches) out.add(m.toLowerCase());
  }
  return out;
}

function extractContextTokens(values: Array<string | null | undefined>): Set<string> {
  const out = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    const parts = value
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, " ")
      .split(/\s+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 4);
    for (const token of parts) out.add(token);
  }
  return out;
}

function hasUnsupportedQuantitativeClaim(text: string, allowedTokens: Set<string>): boolean {
  const matches = text.match(/(\$?\d+(?:\.\d+)?%?)/g) || [];
  if (matches.length === 0) return false;
  return matches.some((m) => !allowedTokens.has(m.toLowerCase()));
}

function hasGroundingReference(text: string, contextTokens: Set<string>): boolean {
  if (contextTokens.size === 0) return true;
  const normalized = text.toLowerCase();
  for (const token of contextTokens) {
    if (normalized.includes(token)) return true;
  }
  return false;
}

function normalizeAiMap(
  aiMap: Record<string, string> | null,
  fallbackMap: Record<string, string>,
  allowedNumericTokens: Set<string>,
  requiredContextTokens: Set<string>,
): Record<string, string> {
  const pillars = ["positioning", "messaging", "visibility", "credibility", "conversion"] as const;
  const normalized: Record<string, string> = {};
  for (const pillar of pillars) {
    const candidate = aiMap?.[pillar];
    if (!candidate || typeof candidate !== "string") {
      normalized[pillar] = fallbackMap[pillar];
      continue;
    }
    const cleaned = candidate.trim();
    if (
      !cleaned ||
      hasUnsupportedQuantitativeClaim(cleaned, allowedNumericTokens) ||
      !hasGroundingReference(cleaned, requiredContextTokens)
    ) {
      normalized[pillar] = fallbackMap[pillar];
      continue;
    }
    normalized[pillar] = cleaned;
  }
  return normalized;
}

function flattenInsightMap(
  input: Record<string, { strength?: string; opportunity?: string; action?: string }>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [pillar, value] of Object.entries(input || {})) {
    const parts = [value?.strength, value?.opportunity, value?.action].filter(
      (part): part is string => typeof part === "string" && part.trim().length > 0,
    );
    out[pillar] = parts.join(" ").trim();
  }
  return out;
}

const snapshotBodySchema = z.object({
  email: z.string().email().optional().nullable(),
  name: z.string().max(200).optional().nullable(),
  companyName: z.string().max(200).optional().nullable(),
  businessName: z.string().max(200).optional().nullable(),
  brandName: z.string().max(200).optional().nullable(),
  answers: snapshotAnswersRecordSchema,
  pillar_insights: z.unknown().optional(),
  productTier: z.string().max(40).optional().nullable(),
});

export async function POST(req: Request) {
  // ─── Security: Rate limit + request size ───
  const guard = apiGuard(req, { routeId: "snapshot", rateLimit: AI_RATE_LIMIT, maxBodySize: 200_000 });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json();

    // ─── Schema validation ───
    const parsed = snapshotBodySchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid request body.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // ─── Input validation & sanitization ───
    if (body.email != null && String(body.email).trim() !== "" && !isValidEmail(body.email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (body.name != null) body.name = sanitizeString(body.name);
    if (body.companyName != null) body.companyName = sanitizeString(body.companyName);
    if (body.businessName != null) body.businessName = sanitizeString(body.businessName);
    if (body.brandName != null) body.brandName = sanitizeString(body.brandName);

    const snapshotInput = normalizeAnswers((body.answers || {}) as Record<string, unknown>);
    const archetypeInference = inferLikelyArchetype(snapshotInput);
    if (archetypeInference.likelyArchetype) {
      snapshotInput.likelyArchetype = archetypeInference.likelyArchetype;
    }
    const scores = calculateBrandSnapshotScores(snapshotInput);
    const supabase = supabaseServer();

    // Use report_id (string) as the public identifier everywhere in the app
    const report_id = randomUUID();

    const companyName =
      body.companyName || body.businessName || body.brandName || null;
    const businessType = asStringOrNull(snapshotInput.businessType);
    const primaryResult = getPrimaryPillar(scores.pillarScores as any, {
      businessType: asStringOrNull(snapshotInput.businessType),
    });
    const primaryPillar =
      primaryResult.type === "tie"
        ? primaryResult.pillars?.[0] ?? primaryResult.pillar
        : primaryResult.pillar;

    const summary = buildSummary(
      scores,
      scores.insights,
      companyName
    );
    const opportunities_summary = buildOpportunitiesSummary(
      scores.recommendations,
      scores.pillarScores as Record<string, number>
    );
    const upgrade_cta = buildUpgradeCta(primaryPillar ?? "positioning", companyName);

    // ─── Benchmarks: Collection + Query in parallel (non-blocking) ───
    let benchmarkContext: string | null = null;
    try {
      const [, benchmarkReport] = await Promise.all([
        // Fire-and-forget: record this assessment's data
        recordBenchmarkData({
          brandAlignmentScore: scores.brandAlignmentScore,
          pillarScores: scores.pillarScores as any,
          primaryPillar,
          industry: asStringOrNull(snapshotInput.industry),
          audienceType: asStringOrNull(snapshotInput.audienceType),
          geographicScope: asStringOrNull(snapshotInput.geographicScope),
          revenueRange: asStringOrNull(snapshotInput.revenueRange),
          teamSize: asStringOrNull(snapshotInput.teamSize),
          yearsInBusiness: asStringOrNull(snapshotInput.yearsInBusiness),
          hasBrandGuidelines: asBooleanOrNull(snapshotInput.hasBrandGuidelines),
          hasWebsite: Boolean(asStringOrNull(snapshotInput.website)),
          previousBrandWork: asStringOrNull(snapshotInput.previousBrandWork),
        }).catch(() => {}),
        // Query peer benchmarks for the report
        getFullBenchmarkReport({
          brandAlignmentScore: scores.brandAlignmentScore,
          pillarScores: scores.pillarScores as any,
          industry: asStringOrUndefined(snapshotInput.industry),
          audienceType: asStringOrUndefined(snapshotInput.audienceType),
          revenueRange: asStringOrUndefined(snapshotInput.revenueRange),
        }).catch(() => null),
      ]);

      if (benchmarkReport) {
        benchmarkContext = formatBenchmarkContext(benchmarkReport);
      }
    } catch (benchErr) {
      logger.warn("[Snapshot API] Benchmark operations failed (non-blocking)", { error: benchErr instanceof Error ? benchErr.message : String(benchErr) });
    }

    // ─── AI-Enhanced Insights (non-blocking) ───
    // Try to generate AI-powered personalized insights.
    // If AI call succeeds within timeout, use those instead of generic templates.
    // If AI call fails or times out, fall back to deterministic insights.
    let aiInsights: Record<string, string> | null = null;
    let aiRecommendations: Record<string, string> | null = null;
    try {
      const aiResult = await generateAIInsights({
        ...snapshotInput,
        businessName: companyName ?? undefined,
        brandAlignmentScore: scores.brandAlignmentScore,
        pillarScores: scores.pillarScores as Record<string, number>,
        benchmarkContext: benchmarkContext ?? undefined,
      });
      if (aiResult) {
        aiInsights = aiResult.pillarInsights ?? null;
        aiRecommendations = aiResult.recommendations ?? null;
        logger.info("[Snapshot API] AI insights generated successfully", {
          model: aiResult.model,
          businessName: companyName,
        });
      }
    } catch (aiErr) {
      logger.warn("[Snapshot API] AI insights failed (using fallback)", {
        error: aiErr instanceof Error ? aiErr.message : String(aiErr),
      });
    }

    // Enforce no-hallucination guardrails:
    // - Reject AI text with quantitative claims not present in captured signals.
    // - Fallback to deterministic, company-contextualized text per pillar.
    const fallbackInsightsByPillar = buildPillarInsightsFromScores(scores.pillarScores as any, {
      companyName,
      businessType,
    });
    const fallbackRecommendationsByPillar = buildPillarRecommendationsFromScores(
      scores.pillarScores as any,
      { companyName, businessType },
    );
    const allowedNumericTokens = extractNumericTokens([
      asStringOrNull(snapshotInput.monthlyRevenueRange),
      asStringOrNull(snapshotInput.revenueRange),
      asStringOrNull(snapshotInput.averageTransactionValue),
      asStringOrNull(snapshotInput.conversionRateEstimate),
      asStringOrNull(snapshotInput.monthlyMarketingBudget),
      String(scores.brandAlignmentScore),
      String(scores.pillarScores.positioning ?? 0),
      String(scores.pillarScores.messaging ?? 0),
      String(scores.pillarScores.visibility ?? 0),
      String(scores.pillarScores.credibility ?? 0),
      String(scores.pillarScores.conversion ?? 0),
    ]);
    const requiredContextTokens = extractContextTokens([
      companyName,
      asStringOrNull(snapshotInput.industry),
      asStringOrNull(snapshotInput.businessType),
      asStringOrNull(snapshotInput.audienceType),
      asStringOrNull(snapshotInput.primaryAcquisitionChannel),
      asStringOrNull(snapshotInput.biggestChallenge),
      asStringOrNull(snapshotInput.currentCustomers),
      asStringOrNull(snapshotInput.idealCustomers),
    ]);
    const finalInsights = normalizeAiMap(
      aiInsights,
      flattenInsightMap(fallbackInsightsByPillar),
      allowedNumericTokens,
      requiredContextTokens,
    );
    const finalRecommendations = normalizeAiMap(
      aiRecommendations,
      fallbackRecommendationsByPillar,
      allowedNumericTokens,
      requiredContextTokens,
    );

    const reportTier = normalizeIntakeTierForStorage(body.productTier);
    const reportTierField = storedTierToProductTierField(reportTier);

    // ─── Save Report ───
    // Schema notes:
    //   • Canonical brand column is `brand_name` (see migration_brand_snapshot_reports.sql +
    //     migration_add_user_brands.sql). Writing to legacy `company_name` produces PGRST204.
    //   • `summary`, `opportunities_summary`, `upgrade_cta` are NOT present in the production
    //     schema (only in the local schema.sql seed), so they're nested inside `full_report`
    //     and re-hoisted by the get route. This keeps the API response shape unchanged without
    //     requiring a Supabase migration to unblock saves.
    const { data, error } = await supabase
      .from("brand_snapshot_reports")
      .insert({
        report_id,
        user_email: body.email?.toLowerCase() ?? null,
        user_name: body.name ?? null,
        brand_name: companyName,
        brand_alignment_score: scores.brandAlignmentScore,
        pillar_scores: scores.pillarScores,
        pillar_insights: finalInsights,
        recommendations: finalRecommendations,
        full_report: {
          answers: snapshotInput,
          scores,
          insights: scores.insights,
          aiEnhanced: !!aiInsights,
          archetypeInference,
          servicesInterest: snapshotInput.servicesInterest ?? null,
          expertConversation: snapshotInput.expertConversation ?? null,
          contentOptIn: snapshotInput.contentOptIn ?? null,
          benchmarkContext: benchmarkContext ?? null,
          summary,
          opportunities_summary,
          upgrade_cta,
          product_tier: reportTierField,
          _meta: {
            tier: reportTier,
            generatedAt: new Date().toISOString(),
          },
        },
      } as any)
      .select("report_id")
      .single();

    if (error || !data) {
      const pgCode = (error as { code?: string } | undefined)?.code;
      const pgDetails = (error as { details?: string } | undefined)?.details;
      const pgHint = (error as { hint?: string } | undefined)?.hint;
      // Surface the underlying Postgres error to logs so we can diagnose schema / RLS issues, but
      // keep the client message generic — never leak DB hints to end users.
      logger.error("[Snapshot API] Failed to save", {
        error: error?.message,
        code: pgCode,
        details: pgDetails,
        hint: pgHint,
        report_id,
      });
      // Postgres SQLSTATE codes (e.g. 23502 not-null, 42703 missing column, 42501 RLS denial) are
      // public-knowledge categories — including them in the response lets the chat surface a
      // self-explanatory "Save failed: <code>" so the user / on-call can act without guessing.
      // The full error message is only returned when the caller opts in via the debug header.
      const debugRequested = req.headers.get("x-snapshot-debug") === "1";
      return NextResponse.json(
        {
          error: "We couldn't save your snapshot. Please try again in a moment.",
          errorCode: pgCode || "unknown",
          ...(debugRequested
            ? {
                errorDiagnostic: error?.message?.slice(0, 240),
                errorDetails: pgDetails?.slice(0, 240),
                errorHint: pgHint?.slice(0, 240),
              }
            : {}),
        },
        { status: 500 },
      );
    }

    // Register brand in user_brands (non-blocking)
    const userEmail = body.email?.toLowerCase?.();
    if (userEmail && companyName) {
      import("@/lib/userBrands").then(({ registerBrand }) =>
        registerBrand({
          email: userEmail,
          brandName: companyName!,
          industry: asStringOrNull(snapshotInput.industry),
          website: asStringOrNull(snapshotInput.website),
          score: scores.brandAlignmentScore,
          reportId: report_id,
          reportTier,
        })
      ).catch(() => {});
    }

    const hasAcWebhook =
      Boolean(process.env.ACTIVE_CAMPAIGN_WEBHOOK) ||
      Boolean(process.env.ACTIVECAMPAIGN_WEBHOOK_URL);
    const hasAcApi = Boolean(process.env.ACTIVE_CAMPAIGN_API_URL) && Boolean(process.env.ACTIVE_CAMPAIGN_API_KEY);

    if (userEmail && (hasAcWebhook || hasAcApi)) {
      const coverage = buildContextCoverageMap(snapshotInput);
      const businessTypeForAc = asStringOrNull(snapshotInput.businessType);
      const monthlyRevenueRangeForAc = asStringOrNull(snapshotInput.monthlyRevenueRange);
      const annualRevenueRangeForAc = asStringOrNull(snapshotInput.revenueRange);
      const averageTransactionValueForAc = asStringOrNull(snapshotInput.averageTransactionValue);
      const conversionRateEstimateForAc = asStringOrNull(snapshotInput.conversionRateEstimate);
      const primaryAcquisitionChannelForAc = asStringOrNull(snapshotInput.primaryAcquisitionChannel);
      const monthlyMarketingBudgetForAc = asStringOrNull(snapshotInput.monthlyMarketingBudget);
      const contentCreationCapacityForAc = asStringOrNull(snapshotInput.contentCreationCapacity);
      const primaryRevenueDriverForAc = asStringOrNull(snapshotInput.primaryRevenueDriver);

      const reportLink = `${BASE_URL}/brand-snapshot/results/${report_id}`;
      const acFields: Record<string, string | number> = {
        company_name: companyName ?? "",
        brand_alignment_score: scores.brandAlignmentScore,
        positioning_score: scores.pillarScores.positioning ?? 0,
        messaging_score: scores.pillarScores.messaging ?? 0,
        visibility_score: scores.pillarScores.visibility ?? 0,
        credibility_score: scores.pillarScores.credibility ?? 0,
        conversion_score: scores.pillarScores.conversion ?? 0,
        primary_pillar: primaryPillar ?? "positioning",
        experience_survey_link: `${BASE_URL}/experience-survey?tier=snapshot&reportId=${encodeURIComponent(report_id)}&email=${encodeURIComponent(userEmail)}`,
        experience_tier: "snapshot",
        business_type: asStringOrEmpty(businessTypeForAc),
        monthly_revenue_range: asStringOrEmpty(monthlyRevenueRangeForAc),
        average_transaction_value: asStringOrEmpty(averageTransactionValueForAc),
        conversion_rate_estimate: asStringOrEmpty(conversionRateEstimateForAc),
        primary_acquisition_channel: asStringOrEmpty(primaryAcquisitionChannelForAc),
        monthly_marketing_budget: asStringOrEmpty(monthlyMarketingBudgetForAc),
        content_creation_capacity: asStringOrEmpty(contentCreationCapacityForAc),
      };
      if (process.env.AC_FIELD_REPORT_LINK) {
        acFields[process.env.AC_FIELD_REPORT_LINK] = reportLink;
      }

      // Build AC tags — include services interest signals from assessment
      const acTags: string[] = ["purchased:snapshot"];

      const servicesInterest = snapshotInput.servicesInterest;
      if (servicesInterest && servicesInterest !== "not_now") {
        acTags.push("services:interested");
        if (servicesInterest === "managed_marketing") {
          acTags.push("services:managed_marketing");
        } else if (servicesInterest === "consulting") {
          acTags.push("services:consulting");
        } else if (servicesInterest === "both") {
          acTags.push("services:managed_marketing", "services:consulting");
        }
      }

      if (snapshotInput.expertConversation === true) {
        acTags.push("services:expert_call_requested");
      }

      // Content opt-in signals for newsletter/list segmentation
      const contentOptIn = snapshotInput.contentOptIn;
      if (contentOptIn && contentOptIn !== "no_thanks") {
        acTags.push("content:opted_in");
        if (contentOptIn === "marketing_trends") {
          acTags.push("content:marketing_trends");
        } else if (contentOptIn === "ai_updates") {
          acTags.push("content:ai_updates");
        } else if (contentOptIn === "both") {
          acTags.push("content:marketing_trends", "content:ai_updates");
        }
      }

      if (businessTypeForAc) {
        acTags.push(`snapshot:business-type:${businessTypeForAc}`);
      }
      const missingRevenueBaseline =
        !monthlyRevenueRangeForAc && !annualRevenueRangeForAc && !averageTransactionValueForAc;
      if (!conversionRateEstimateForAc) {
        acTags.push("snapshot:signal-missing:conversion-rate");
      }
      if (missingRevenueBaseline) {
        acTags.push("snapshot:signal-missing:revenue-baseline");
      }

      const removeSignalTags: string[] = [];
      if (conversionRateEstimateForAc) {
        removeSignalTags.push("snapshot:signal-missing:conversion-rate");
      }
      if (!missingRevenueBaseline) {
        removeSignalTags.push("snapshot:signal-missing:revenue-baseline");
      }

      const useAcEventTracking = Boolean(
        process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_KEY && process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_ACTID,
      );

      // AC: sync contact via API, then either Event Tracking (trackcmp.net/event) for automation
      // triggers, or fall back to the legacy generic webhook JSON (fireACEvent).
      // See https://developers.activecampaign.com/reference/track-event
      Promise.all([
        triggerUpgradeEmails({
          email: userEmail,
          coverage,
          primaryPillar,
        }).catch((err) => logger.warn("[Snapshot API] Upgrade emails failed", { error: err instanceof Error ? err.message : String(err) })),
        (async () => {
          const directFields: Record<string, string> = {
            snapshot_business_type: businessTypeForAc ?? "",
            snapshot_primary_revenue_driver: primaryRevenueDriverForAc ?? "",
            snapshot_monthly_revenue_range: monthlyRevenueRangeForAc ?? annualRevenueRangeForAc ?? "",
            snapshot_average_transaction_value: averageTransactionValueForAc ?? "",
            snapshot_conversion_rate_estimate: conversionRateEstimateForAc ?? "",
            snapshot_primary_acquisition_channel: primaryAcquisitionChannelForAc ?? "",
            snapshot_monthly_marketing_budget: monthlyMarketingBudgetForAc ?? "",
            snapshot_content_creation_capacity: contentCreationCapacityForAc ?? "",
          };

          const directTags: string[] = [];
          if (businessTypeForAc) {
            directTags.push(`snapshot:business-type:${businessTypeForAc}`);
          }
          if (!conversionRateEstimateForAc) {
            directTags.push("snapshot:signal-missing:conversion-rate");
          }
          if (missingRevenueBaseline) {
            directTags.push("snapshot:signal-missing:revenue-baseline");
          }

          const acFieldsStrings: Record<string, string> = Object.fromEntries(
            Object.entries(acFields).map(([k, v]) => [k, typeof v === "number" ? String(v) : String(v)]),
          );
          const mergedContactFields: Record<string, string> = { ...acFieldsStrings, ...directFields };

          if (hasAcApi) {
            try {
              await applyActiveCampaignTags({ email: userEmail, tags: acTags });
              await Promise.all([
                directTags.length > 0
                  ? applyActiveCampaignTags({ email: userEmail, tags: directTags })
                  : Promise.resolve(),
                removeSignalTags.length > 0
                  ? removeActiveCampaignTags({ email: userEmail, tags: removeSignalTags })
                  : Promise.resolve(),
                setContactFields({ email: userEmail, fields: mergedContactFields }),
                process.env.AC_LIST_BRAND_SNAPSHOT_LEADS
                  ? addContactToList({
                      email: userEmail,
                      listId: process.env.AC_LIST_BRAND_SNAPSHOT_LEADS,
                    })
                  : Promise.resolve(),
              ]);

              await createCrmSyncLog({
                status: "success",
                eventType: "ac.snapshot.strategy_signals",
                payload: {
                  email: userEmail,
                  report_id,
                  business_type: businessTypeForAc,
                  missing_conversion_rate: !conversionRateEstimateForAc,
                  missing_revenue_baseline: missingRevenueBaseline,
                },
              });

              if (useAcEventTracking) {
                const tracked = await trackActiveCampaignSiteEvent({
                  email: userEmail,
                  eventName: "snapshot_completed",
                  eventData: reportLink,
                });
                if (!tracked) {
                  logger.warn("[Snapshot API] AC Event Tracking (snapshot_completed) did not return success");
                  if (hasAcWebhook) {
                    await fireACEvent({
                      email: userEmail,
                      eventName: "snapshot_completed",
                      tags: acTags,
                      fields: acFields,
                    });
                  }
                }
              } else if (hasAcWebhook) {
                await fireACEvent({
                  email: userEmail,
                  eventName: "snapshot_completed",
                  tags: acTags,
                  fields: acFields,
                });
              }
            } catch (err) {
              await createCrmSyncLog({
                status: "failed",
                eventType: "ac.snapshot.strategy_signals",
                errorMessage: err instanceof Error ? err.message : String(err),
                payload: {
                  email: userEmail,
                  report_id,
                },
              });
              throw err;
            }
          } else if (hasAcWebhook) {
            await fireACEvent({
              email: userEmail,
              eventName: "snapshot_completed",
              tags: acTags,
              fields: acFields,
            });
          }
        })().catch((err) =>
          logger.warn("[Snapshot API] AC sync / event failed", {
            error: err instanceof Error ? err.message : String(err),
          }),
        ),
      ]);
    }

    return NextResponse.json({
      reportId: (data as any).report_id,
      brandAlignmentScore: scores.brandAlignmentScore,
      pillarScores: scores.pillarScores,
      primaryPillar: primaryPillar ?? null,
    });
  } catch (err: any) {
    logger.error("[Snapshot API] Error", { error: err?.message ?? String(err) });
    return NextResponse.json(
      { error: "Failed to process snapshot" },
      { status: 500 }
    );
  }
}


