// lib/getUserSnapshots.ts
// Function to get user's Brand Snapshots

import { supabaseServer } from "./supabase";

export async function getUserSnapshots() {
  const supabase = supabaseServer();

  const { data } = await supabase
    .from("brand_snapshot_reports")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}
