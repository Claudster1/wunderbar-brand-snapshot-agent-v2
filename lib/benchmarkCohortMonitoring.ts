import { supabaseAdmin } from "@/lib/supabase-admin";
import { BENCHMARK_MIN_PEER_SAMPLE_SIZE } from "@/lib/benchmarkCollector";

export type TripleSegmentRow = {
  key: string;
  n: number;
  publicReady: boolean;
};

export type IndustryTopRow = {
  industry: string;
  n: number;
};

export type BenchmarkCohortMonitoringPayload = {
  source: "rpc" | "scan_fallback";
  minSampleSizeForPublicPeerStats: number;
  totalRows: number;
  byAudience: Record<string, number>;
  byRevenue: Record<string, number>;
  byGeo: Record<string, number>;
  byAudienceRevenue: Record<string, number>;
  tripleSegments: TripleSegmentRow[];
  tripleSummary: {
    segmentCount: number;
    readyForPublicPeerStats: number;
    thinCohorts: number;
  };
  industryTop: IndustryTopRow[];
  warning?: string;
};

function emptyPayload(warning: string): BenchmarkCohortMonitoringPayload {
  return {
    source: "scan_fallback",
    minSampleSizeForPublicPeerStats: BENCHMARK_MIN_PEER_SAMPLE_SIZE,
    totalRows: 0,
    byAudience: {},
    byRevenue: {},
    byGeo: {},
    byAudienceRevenue: {},
    tripleSegments: [],
    tripleSummary: { segmentCount: 0, readyForPublicPeerStats: 0, thinCohorts: 0 },
    industryTop: [],
    warning,
  };
}

function parseRpcPayload(raw: unknown): BenchmarkCohortMonitoringPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const tripleSegments = Array.isArray(o.tripleSegments)
    ? (o.tripleSegments as TripleSegmentRow[]).filter(
        (r) => r && typeof r.key === "string" && typeof r.n === "number"
      )
    : [];
  const industryTop = Array.isArray(o.industryTop)
    ? (o.industryTop as IndustryTopRow[]).filter(
        (r) => r && typeof r.industry === "string" && typeof r.n === "number"
      )
    : [];
  const ts = o.tripleSummary;
  const tripleSummary =
    ts && typeof ts === "object"
      ? {
          segmentCount: Number((ts as any).segmentCount) || 0,
          readyForPublicPeerStats: Number((ts as any).readyForPublicPeerStats) || 0,
          thinCohorts: Number((ts as any).thinCohorts) || 0,
        }
      : { segmentCount: 0, readyForPublicPeerStats: 0, thinCohorts: 0 };

  return {
    source: "rpc",
    minSampleSizeForPublicPeerStats: BENCHMARK_MIN_PEER_SAMPLE_SIZE,
    totalRows: Number(o.totalRows) || 0,
    byAudience: (o.byAudience as Record<string, number>) || {},
    byRevenue: (o.byRevenue as Record<string, number>) || {},
    byGeo: (o.byGeo as Record<string, number>) || {},
    byAudienceRevenue: (o.byAudienceRevenue as Record<string, number>) || {},
    tripleSegments,
    tripleSummary,
    industryTop,
  };
}

/**
 * Accurate cohort counts via DB function `benchmark_cohort_monitoring_snapshot`.
 * If the migration has not been applied, returns a payload with `warning` set (and empty rollups).
 */
export async function getBenchmarkCohortMonitoringSnapshot(): Promise<BenchmarkCohortMonitoringPayload> {
  if (!supabaseAdmin) {
    return emptyPayload("Supabase service role is not configured.");
  }

  const { data, error } = await supabaseAdmin.rpc("benchmark_cohort_monitoring_snapshot");

  if (error) {
    const msg =
      error.message?.includes("function") || error.code === "42883"
        ? "Database function missing. Run database/migration_benchmark_cohort_monitoring.sql in Supabase."
        : error.message || "RPC failed.";
    return { ...emptyPayload(msg), warning: msg };
  }

  const parsed = parseRpcPayload(data);
  if (!parsed) {
    return emptyPayload("Unexpected RPC response shape.");
  }
  return parsed;
}
