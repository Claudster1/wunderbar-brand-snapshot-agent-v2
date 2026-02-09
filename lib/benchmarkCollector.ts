// lib/benchmarkCollector.ts
// Collects anonymized benchmark data from every completed assessment.
// NO PII is stored — only scores and demographic segments.
// This builds a proprietary benchmark database over time.

import { supabaseServer } from "@/lib/supabase";

interface BenchmarkInput {
  // Scores
  brandAlignmentScore: number;
  pillarScores: {
    positioning?: number;
    messaging?: number;
    visibility?: number;
    credibility?: number;
    conversion?: number;
  };
  primaryPillar?: string | null;

  // Anonymized segmentation (extracted from assessment answers)
  industry?: string | null;
  audienceType?: string | null; // B2B, B2C, both
  geographicScope?: string | null; // local, regional, national, global
  revenueRange?: string | null;
  teamSize?: string | null;
  yearsInBusiness?: string | null;
  hasBrandGuidelines?: boolean | null;
  hasWebsite?: boolean | null;
  previousBrandWork?: string | null;
}

/**
 * Silently records anonymized benchmark data.
 * Non-blocking — failures are logged but never surface to the user.
 */
export async function recordBenchmarkData(input: BenchmarkInput): Promise<void> {
  try {
    const supabase = supabaseServer();

    // Normalize revenue range to match DB constraint
    const normalizeRevenue = (raw?: string | null): string | null => {
      if (!raw) return null;
      const lower = raw.toLowerCase().replace(/\s/g, "");
      if (lower.includes("pre")) return "pre-revenue";
      if (lower.includes("under") || lower.includes("<100")) return "under_100k";
      if (lower.includes("100k") && lower.includes("500k")) return "100k-500k";
      if (lower.includes("500k") && lower.includes("1m")) return "500k-1M";
      if (lower.includes("1m") && lower.includes("5m")) return "1M-5M";
      if (lower.includes("5m") || lower.includes("5m+")) return "5M+";
      return raw.slice(0, 50); // Fallback — store raw but truncated
    };

    // Normalize audience type
    const normalizeAudience = (raw?: string | null): string | null => {
      if (!raw) return null;
      const lower = raw.toLowerCase();
      if (lower === "b2b") return "B2B";
      if (lower === "b2c") return "B2C";
      if (lower === "both") return "both";
      return null;
    };

    // Normalize geographic scope
    const normalizeGeo = (raw?: string | null): string | null => {
      if (!raw) return null;
      const lower = raw.toLowerCase();
      if (lower.includes("local")) return "local";
      if (lower.includes("regional")) return "regional";
      if (lower.includes("national")) return "national";
      if (lower.includes("global") || lower.includes("international")) return "global";
      return null;
    };

    await (supabase.from("benchmark_data") as any).insert({
      brand_alignment_score: input.brandAlignmentScore,
      positioning_score: input.pillarScores.positioning ?? 0,
      messaging_score: input.pillarScores.messaging ?? 0,
      visibility_score: input.pillarScores.visibility ?? 0,
      credibility_score: input.pillarScores.credibility ?? 0,
      conversion_score: input.pillarScores.conversion ?? 0,
      primary_pillar: input.primaryPillar ?? null,
      industry: input.industry?.slice(0, 100) ?? null,
      audience_type: normalizeAudience(input.audienceType),
      geographic_scope: normalizeGeo(input.geographicScope),
      revenue_range: normalizeRevenue(input.revenueRange),
      team_size: input.teamSize?.slice(0, 50) ?? null,
      years_in_business: input.yearsInBusiness?.slice(0, 50) ?? null,
      has_brand_guidelines: input.hasBrandGuidelines ?? null,
      has_website: input.hasWebsite ?? null,
      previous_brand_work: input.previousBrandWork ?? null,
    });
  } catch (err) {
    // Non-blocking — never fail the assessment because of benchmark collection
    console.warn("[BenchmarkCollector] Failed to record benchmark data:", err);
  }
}

/**
 * Query benchmark percentile for a given score within a segment.
 * Returns null if insufficient data (< 20 data points in segment).
 */
export async function getBenchmarkPercentile(params: {
  score: number;
  industry?: string;
  audienceType?: string;
  revenueRange?: string;
}): Promise<{ percentile: number; sampleSize: number; avgScore: number } | null> {
  try {
    const supabase = supabaseServer();

    let query = (supabase.from("benchmark_data") as any)
      .select("brand_alignment_score");

    // Apply segment filters if provided
    if (params.industry) {
      query = query.ilike("industry", `%${params.industry}%`);
    }
    if (params.audienceType) {
      query = query.eq("audience_type", params.audienceType);
    }
    if (params.revenueRange) {
      query = query.eq("revenue_range", params.revenueRange);
    }

    const { data, error } = await query;

    if (error || !data || data.length < 20) {
      // Not enough data for meaningful percentile
      return null;
    }

    const scores = data.map((d: any) => d.brand_alignment_score).sort((a: number, b: number) => a - b);
    const below = scores.filter((s: number) => s < params.score).length;
    const percentile = Math.round((below / scores.length) * 100);
    const avgScore = Math.round(scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length);

    return {
      percentile,
      sampleSize: scores.length,
      avgScore,
    };
  } catch (err) {
    console.warn("[BenchmarkCollector] Failed to query percentile:", err);
    return null;
  }
}
