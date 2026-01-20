import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json([]);

  const supabase = supabaseServer();

  const { data } = await supabase
    .from("brand_snapshot_reports")
    .select("id,business_name,brand_alignment_score,primary_pillar,created_at,completed")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return NextResponse.json(
    data?.map((r) => ({
      id: r.id,
      businessName: r.business_name,
      brandAlignmentScore: r.brand_alignment_score,
      primaryPillar: r.primary_pillar,
      createdAt: r.created_at,
      completed: r.completed,
    })) ?? []
  );
}
