import { supabaseServer } from "@/lib/supabase";

export async function saveSnapshotProgress(payload: {
  email: string;
  brandName: string;
  stage: string;
  primaryPillar?: string;
  score?: number;
}) {
  const supabase = supabaseServer();
  await (supabase.from("brand_snapshot_reports") as any).insert({
    user_email: payload.email,
    company_name: payload.brandName,
    snapshot_stage: payload.stage,
    primary_pillar: payload.primaryPillar ?? null,
    brand_alignment_score: payload.score ?? 0,
  });
}
