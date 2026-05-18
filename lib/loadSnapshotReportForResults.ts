/**
 * Server-side report load for `/results` — reads Supabase directly instead of
 * self-fetching `/api/snapshot/get`, which can fail when `NEXT_PUBLIC_BASE_URL`
 * points at a different host than the running app.
 */

import { supabaseAdmin } from "@/lib/supabase-admin";

export type SnapshotReportRow = Record<string, unknown>;

const REPORT_SELECT =
  "report_id, company_name:brand_name, brand_alignment_score, pillar_scores, pillar_insights, recommendations, full_report, user_name, user_email, created_at";

function transformReportRow(data: Record<string, unknown>): SnapshotReportRow {
  const out: SnapshotReportRow = { ...data };
  if (!out.company_name && (data as { company?: string }).company) {
    out.company_name = (data as { company?: string }).company;
  }
  if (!out.insights && data.pillar_insights) {
    out.insights = data.pillar_insights;
  }
  const fullReport = data.full_report as Record<string, unknown> | null;
  if (fullReport && typeof fullReport === "object") {
    if (out.summary == null && typeof fullReport.summary === "string") {
      out.summary = fullReport.summary;
    }
    if (out.opportunities_summary == null && typeof fullReport.opportunities_summary === "string") {
      out.opportunities_summary = fullReport.opportunities_summary;
    }
    if (out.upgrade_cta == null && typeof fullReport.upgrade_cta === "string") {
      out.upgrade_cta = fullReport.upgrade_cta;
    }
    if (out.product_tier == null && typeof fullReport.product_tier === "string") {
      out.product_tier = fullReport.product_tier;
    }
  }
  if (out.product_tier == null) {
    out.product_tier = "snapshot";
  }
  return out;
}

/** Load a scored snapshot report by public `report_id` (or legacy `id`). */
export async function loadSnapshotReportForResults(
  reportId: string,
): Promise<SnapshotReportRow | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("brand_snapshot_reports")
    .select(REPORT_SELECT)
    .eq("report_id", reportId)
    .maybeSingle();

  if (!error && data) {
    return transformReportRow(data as Record<string, unknown>);
  }

  const { data: byId, error: byIdError } = await supabaseAdmin
    .from("brand_snapshot_reports")
    .select(REPORT_SELECT)
    .eq("id", reportId)
    .maybeSingle();

  if (byIdError || !byId) return null;
  return transformReportRow(byId as Record<string, unknown>);
}

/** Brief retry for the race right after finalize redirect. */
export async function loadSnapshotReportForResultsWithRetry(
  reportId: string,
  options?: { attempts?: number; delayMs?: number },
): Promise<SnapshotReportRow | null> {
  const attempts = options?.attempts ?? 4;
  const delayMs = options?.delayMs ?? 400;
  for (let i = 0; i < attempts; i++) {
    const row = await loadSnapshotReportForResults(reportId);
    if (row && typeof row.brand_alignment_score === "number") {
      return row;
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return null;
}
