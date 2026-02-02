// lib/createDraftReport.ts
// Function to create a draft snapshot report for progress tracking

import { supabaseServer } from "./supabase";

export async function createDraftReport(userEmail?: string): Promise<string> {
  const supabase = supabaseServer();
  
  // Generate UUID on client/server side
  const reportId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
  const { data, error } = await supabase
    .from("brand_snapshot_reports")
    .insert({
      id: reportId,
      user_email: userEmail || null,
      brand_name: "Draft", // Will be updated when we know the business name
      brand_alignment_score: 0,
      pillar_scores: {} as any,
      primary_pillar: "positioning",
      context_coverage: 0,
      snapshot_stage: "in_progress", // Legacy field
      status: "draft", // New field
      last_step: "start",
      progress: {} as any,
    } as any)
    .select("id")
    .single();

  if (error) {
    console.error("Error creating draft report:", error);
    throw error;
  }

  const row = data as { id?: string; report_id?: string } | null;
  return row?.report_id ?? row?.id ?? reportId;
}
