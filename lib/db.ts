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
    .order("created_at", { ascending: false });

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

  const { error } = await supabase
    .from("snapshot_refinement_requests")
    .insert({
      report_id: payload.report_id?.toString() || "",
      pillar: payload.pillar?.toString() || null,
      note: payload.context?.toString() || "",
      status: "open",
      // Store scope and type in note or as metadata if needed
      // Note: You may want to add these fields to the database schema
    });

  if (error) {
    console.error("Error saving refinement request:", error);
    throw error;
  }
}

// TODO: Team member invitation removed - add back in future phase if needed

export async function saveProgress(sessionId: string, data: any) {
  const supabase = supabaseServer();

  await supabase.from("brand_snapshot_sessions").upsert({
    session_id: sessionId,
    payload: data,
    updated_at: new Date().toISOString(),
  });
}
