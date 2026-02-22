// lib/benchmarkCollector.ts
// Collects anonymized benchmark data from every completed assessment.
// NO PII is stored — only scores and demographic segments.
// This builds a proprietary benchmark database over time.

import { supabaseServer } from "@/lib/supabase";

// ─── In-Memory Cache ──────────────────────────────────────────
// Benchmark data changes slowly (only when new assessments complete),
// so caching results for 10 minutes eliminates redundant DB queries.
const BENCHMARK_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_ENTRIES = 50;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const benchmarkCache = new Map<string, CacheEntry<any>>();

function getCachedResult<T>(key: string): T | null {
  const entry = benchmarkCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    benchmarkCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCachedResult<T>(key: string, data: T): void {
  // Evict expired entries if cache is getting large
  if (benchmarkCache.size >= MAX_CACHE_ENTRIES) {
    const now = Date.now();
    for (const [k, v] of benchmarkCache) {
      if (v.expiresAt < now) benchmarkCache.delete(k);
    }
    // If still at limit, remove oldest
    if (benchmarkCache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = benchmarkCache.keys().next().value;
      if (firstKey) benchmarkCache.delete(firstKey);
    }
  }
  benchmarkCache.set(key, { data, expiresAt: Date.now() + BENCHMARK_CACHE_TTL_MS });
}

function buildCacheKey(prefix: string, params: Record<string, any>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v != null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `${prefix}:${parts}`;
}

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
 * Returns null if insufficient data (< MIN_SAMPLE_SIZE data points in segment).
 */
const MIN_SAMPLE_SIZE = 20;

export async function getBenchmarkPercentile(params: {
  score: number;
  industry?: string;
  audienceType?: string;
  revenueRange?: string;
}): Promise<{ percentile: number; sampleSize: number; avgScore: number } | null> {
  const cacheKey = buildCacheKey("overall", {
    score: params.score,
    industry: params.industry,
    audienceType: params.audienceType,
    revenueRange: params.revenueRange,
  });
  const cached = getCachedResult<{ percentile: number; sampleSize: number; avgScore: number } | null>(cacheKey);
  if (cached !== null) return cached;

  try {
    const supabase = supabaseServer();

    let query = (supabase.from("benchmark_data") as any)
      .select("brand_alignment_score");

    if (params.industry) {
      query = query.ilike("industry", `%${params.industry}%`);
    }
    if (params.audienceType) {
      query = query.eq("audience_type", params.audienceType);
    }
    if (params.revenueRange) {
      query = query.eq("revenue_range", params.revenueRange);
    }

    const { data, error } = await query.limit(5000);

    if (error || !data || data.length < MIN_SAMPLE_SIZE) {
      // Not enough data for meaningful percentile
      return null;
    }

    const scores = data.map((d: any) => d.brand_alignment_score).sort((a: number, b: number) => a - b);
    const below = scores.filter((s: number) => s < params.score).length;
    const percentile = Math.round((below / scores.length) * 100);
    const avgScore = Math.round(scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length);

    const result = { percentile, sampleSize: scores.length, avgScore };
    setCachedResult(cacheKey, result);
    return result;
  } catch (err) {
    console.warn("[BenchmarkCollector] Failed to query percentile:", err);
    return null;
  }
}

// ─── Per-Pillar Benchmark Queries ───

type PillarName = "positioning" | "messaging" | "visibility" | "credibility" | "conversion";

const PILLAR_COLUMNS: Record<PillarName, string> = {
  positioning: "positioning_score",
  messaging: "messaging_score",
  visibility: "visibility_score",
  credibility: "credibility_score",
  conversion: "conversion_score",
};

export interface PillarBenchmark {
  pillar: PillarName;
  percentile: number;
  sampleSize: number;
  avgScore: number;
  medianScore: number;
}

/**
 * Get benchmark data for a specific pillar within a segment.
 * Returns null if insufficient data.
 */
export async function getPillarBenchmark(params: {
  pillar: PillarName;
  score: number;
  industry?: string;
  audienceType?: string;
  revenueRange?: string;
}): Promise<PillarBenchmark | null> {
  const cacheKey = buildCacheKey(`pillar:${params.pillar}`, {
    score: params.score,
    industry: params.industry,
    audienceType: params.audienceType,
    revenueRange: params.revenueRange,
  });
  const cached = getCachedResult<PillarBenchmark | null>(cacheKey);
  if (cached !== null) return cached;

  try {
    const supabase = supabaseServer();
    const column = PILLAR_COLUMNS[params.pillar];

    let query = (supabase.from("benchmark_data") as any).select(column);

    if (params.industry) {
      query = query.ilike("industry", `%${params.industry}%`);
    }
    if (params.audienceType) {
      query = query.eq("audience_type", params.audienceType);
    }
    if (params.revenueRange) {
      query = query.eq("revenue_range", params.revenueRange);
    }

    const { data, error } = await query.limit(5000);

    if (error || !data || data.length < MIN_SAMPLE_SIZE) {
      return null;
    }

    const scores = data
      .map((d: any) => d[column])
      .filter((s: any) => typeof s === "number")
      .sort((a: number, b: number) => a - b);

    if (scores.length < MIN_SAMPLE_SIZE) return null;

    const below = scores.filter((s: number) => s < params.score).length;
    const percentile = Math.round((below / scores.length) * 100);
    const avgScore = Math.round(
      scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length
    );
    const medianScore = scores[Math.floor(scores.length / 2)];

    const result: PillarBenchmark = {
      pillar: params.pillar,
      percentile,
      sampleSize: scores.length,
      avgScore,
      medianScore,
    };
    setCachedResult(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`[BenchmarkCollector] Failed to query ${params.pillar} benchmark:`, err);
    return null;
  }
}

// ─── Full Benchmark Report ───

export interface BenchmarkReport {
  /** Overall WunderBrand Score™ benchmark (null if insufficient data) */
  overall: { percentile: number; sampleSize: number; avgScore: number } | null;
  /** Per-pillar benchmarks (only pillars with sufficient data are included) */
  pillars: PillarBenchmark[];
  /** Whether real peer data is available (true) or AI-informed estimates are used (false) */
  hasRealData: boolean;
  /** Segment description used for the query */
  segmentDescription: string;
}

/**
 * Get a complete benchmark report for a brand's scores.
 * Used by paid report generators to include industry context.
 *
 * If insufficient real data exists, returns hasRealData: false so the
 * report can fall back to AI-informed directional benchmarks.
 */
export async function getFullBenchmarkReport(params: {
  brandAlignmentScore: number;
  pillarScores: Record<PillarName, number>;
  industry?: string;
  audienceType?: string;
  revenueRange?: string;
}): Promise<BenchmarkReport> {
  const segmentParts: string[] = [];
  if (params.audienceType) segmentParts.push(params.audienceType);
  if (params.industry) segmentParts.push(params.industry);
  if (params.revenueRange) segmentParts.push(params.revenueRange);
  const segmentDescription = segmentParts.length > 0
    ? segmentParts.join(" · ")
    : "all industries";

  const overall = await getBenchmarkPercentile({
    score: params.brandAlignmentScore,
    industry: params.industry,
    audienceType: params.audienceType,
    revenueRange: params.revenueRange,
  });

  const pillarResults = await Promise.all(
    (Object.keys(PILLAR_COLUMNS) as PillarName[]).map((pillar) =>
      getPillarBenchmark({
        pillar,
        score: params.pillarScores[pillar],
        industry: params.industry,
        audienceType: params.audienceType,
        revenueRange: params.revenueRange,
      })
    )
  );

  const pillars = pillarResults.filter((p): p is PillarBenchmark => p !== null);
  const hasRealData = overall !== null || pillars.length > 0;

  return {
    overall,
    pillars,
    hasRealData,
    segmentDescription,
  };
}

/**
 * Format benchmark data into a context string for AI report prompts.
 * Returns an empty string if no real data is available (AI falls back to
 * its own industry knowledge).
 */
export function formatBenchmarkContext(report: BenchmarkReport): string {
  if (!report.hasRealData) {
    return "BENCHMARK DATA: No peer benchmark data available yet for this segment. Use AI-informed directional industry context based on your training knowledge. Frame as 'Based on typical patterns in [industry]...' rather than citing specific percentiles.";
  }

  const lines: string[] = [
    `BENCHMARK DATA (real peer data from ${report.overall?.sampleSize ?? report.pillars[0]?.sampleSize ?? 0} assessments in segment: ${report.segmentDescription}):`,
  ];

  if (report.overall) {
    lines.push(
      `- Overall WunderBrand Score™: ${report.overall.percentile}th percentile (segment avg: ${report.overall.avgScore}/100, sample: ${report.overall.sampleSize})`
    );
  }

  for (const p of report.pillars) {
    lines.push(
      `- ${p.pillar}: ${p.percentile}th percentile (segment avg: ${p.avgScore}/20, median: ${p.medianScore}/20, sample: ${p.sampleSize})`
    );
  }

  lines.push(
    "",
    "Use these real benchmarks in your analysis. Reference the percentile ranking and how the brand compares to its peer segment. Frame insights around where they lead and where they lag relative to actual peers."
  );

  return lines.join("\n");
}
