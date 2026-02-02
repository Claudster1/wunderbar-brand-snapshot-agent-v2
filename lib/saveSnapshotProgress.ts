// lib/saveSnapshotProgress.ts
// Function to save snapshot progress to database

import { supabaseServer } from "@/lib/supabase";

export async function saveSnapshotProgress({
  reportId,
  lastStep,
  progress,
}: {
  reportId: string;
  lastStep: string;
  progress: Record<string, any>;
}) {
  const supabase = supabaseServer();

  await (supabase.from("brand_snapshot_reports") as any).update({
      last_step: lastStep,
      progress,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId);
}
