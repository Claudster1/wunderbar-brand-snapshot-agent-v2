// lib/getUserSnapshots.ts
// Function to get user's Brand Snapshots

import { supabaseServer } from "./supabase";

export type SnapshotHistoryRow = {
  id: string;
  report_id?: string;
  brand_name?: string;
  brand_alignment_score?: number;
  primary_pillar?: string;
  context_coverage?: number;
  snapshot_stage?: string;
};

export async function getUserSnapshots(): Promise<SnapshotHistoryRow[]> {
  const supabase = supabaseServer();

  const { data } = await supabase
    .from("brand_snapshot_reports")
    .select("id, report_id, company_name, brand_name, brand_alignment_score, primary_pillar, context_coverage, snapshot_stage")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: (r.report_id ?? r.id) as string,
    report_id: r.report_id as string | undefined,
    brand_name: (r.brand_name ?? r.company_name) as string | undefined,
    brand_alignment_score: r.brand_alignment_score as number | undefined,
    primary_pillar: r.primary_pillar as string | undefined,
    context_coverage: r.context_coverage as number | undefined,
    snapshot_stage: r.snapshot_stage as string | undefined,
  }));
}
