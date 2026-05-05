// lib/brandSnapshotReportLookup.ts
// Resolve brand_snapshot_reports rows by either public report_id or internal id (drafts).

import { supabaseServer } from "@/lib/supabase";

export async function findBrandSnapshotReportByPublicId(reportId: string) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("brand_snapshot_reports")
    .select("*")
    .or(`report_id.eq.${reportId},id.eq.${reportId}`)
    .maybeSingle();
  if (error) return null;
  return data;
}
