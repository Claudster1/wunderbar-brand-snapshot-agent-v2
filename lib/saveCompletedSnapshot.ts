// lib/saveCompletedSnapshot.ts
// Function to mark a snapshot as completed and save final data

import { supabaseServer } from "./supabase";
import { withRetry } from "./supabase/withRetry";

interface SaveCompletedSnapshotPayload {
  id: string;
  brandAlignmentScore: number;
  pillarScores: Record<string, number>;
  primaryPillar: string;
  contextCoverage: number;
}

export async function saveCompletedSnapshot(
  payload: SaveCompletedSnapshotPayload
) {
  const supabase = supabaseServer();

  return withRetry(
    async () =>
      await (supabase.from("brand_snapshot_reports") as any)
        .update({
          snapshot_stage: "completed",
          brand_alignment_score: payload.brandAlignmentScore,
          pillar_scores: payload.pillarScores,
          primary_pillar: payload.primaryPillar,
          context_coverage: payload.contextCoverage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payload.id),
    "saveCompletedSnapshot"
  );
}
