// lib/db.ts
// Database query utilities

import { supabaseServer } from "./supabase";

export interface UserReport {
  id: string;
  brand_name: string;
  brand_alignment_score: number;
  created_at: string;
  has_snapshot_plus: boolean;
}

export async function getUserReports() {
  const supabase = supabaseServer();

  const { data } = await supabase
    .from("brand_snapshot_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return data || [];
}

export async function saveRefinementRequest(payload: {
  type: string;
  scope: string;
  report_id: FormDataEntryValue | null;
  pillar?: FormDataEntryValue | null;
  context?: FormDataEntryValue | null;
}) {
  const supabase = supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("snapshot_refinement_requests") as any).insert({
    report_id: payload.report_id?.toString() || "",
    pillar: payload.pillar?.toString() || null,
    note: payload.context?.toString() || "",
    status: "open",
  });

  if (error) {
    console.error("Error saving refinement request:", error);
    throw error;
  }
}

// TODO: Team member invitation removed - add back in future phase if needed

export async function saveProgress(sessionId: string, data: any) {
  const supabase = supabaseServer();

  await (supabase.from("brand_snapshot_sessions") as any).upsert({
    session_id: sessionId,
    payload: data,
    updated_at: new Date().toISOString(),
  });
}

export async function upsertSnapshotReportSummary({
  snapshotId,
  brandName,
  score,
}: {
  snapshotId: string;
  brandName: string;
  score: number;
}) {
  const supabase = supabaseServer();

  await (supabase.from("brand_snapshot_reports") as any).upsert({
    id: snapshotId,
    brand_name: brandName,
    brand_alignment_score: score,
    has_snapshot_plus: false,
  });
}
