// lib/loadSnapshotProgress.ts
// Function to load snapshot progress from database

import { supabaseServer } from "@/lib/supabase";

export async function loadSnapshotProgress(reportId: string) {
  const supabase = supabaseServer();

  const { data } = await supabase
    .from("brand_snapshot_reports")
    .select("last_step, progress")
    .eq("id", reportId)
    .single();

  return data;
}
