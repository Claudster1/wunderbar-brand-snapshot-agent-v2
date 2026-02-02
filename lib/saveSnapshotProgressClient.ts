import { supabase } from "@/lib/supabase";

export async function saveSnapshotProgress(payload: {
  email: string;
  brandName: string;
  stage: string;
  primaryPillar?: string;
  score?: number;
}) {
  await supabase.from("brand_snapshots").insert({
    user_email: payload.email,
    brand_name: payload.brandName,
    stage: payload.stage,
    primary_pillar: payload.primaryPillar,
    brand_alignment_score: payload.score,
  });
}
