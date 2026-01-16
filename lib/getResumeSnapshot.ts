// lib/getResumeSnapshot.ts
// Function to retrieve in-progress snapshot for resuming

import { supabaseServer } from "./supabase";

export async function getResumeSnapshot(userEmail: string) {
  const supabase = supabaseServer();
  
  const { data } = await supabase
    .from("brand_snapshot_reports")
    .select("*")
    .eq("user_email", userEmail)
    .eq("snapshot_stage", "in_progress")
    .limit(1)
    .single();

  return data;
}
