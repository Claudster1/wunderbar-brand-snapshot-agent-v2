import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

type HistoryRow = {
  id?: string;
  report_id?: string;
  company_name?: string;
  business_name?: string;
  brand_alignment_score?: number;
  primary_pillar?: string;
  created_at?: string;
  user_email?: string;
};

export async function GET(req: Request) {
  // ─── Security: Rate limit ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "history", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");

  if (!userId && !email) return NextResponse.json([]);

  const supabase = supabaseServer();

  let query = supabase
    .from("brand_snapshot_reports")
    .select("id,report_id,company_name,business_name,brand_alignment_score,primary_pillar,created_at,user_email")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  } else if (email) {
    query = query.eq("user_email", email);
  }

  const { data } = await query;

  const rows = (data ?? []) as HistoryRow[];

  return NextResponse.json(
    rows.map((r) => ({
      id: r.report_id ?? r.id,
      businessName: r.business_name ?? r.company_name,
      brandAlignmentScore: r.brand_alignment_score,
      primaryPillar: r.primary_pillar,
      createdAt: r.created_at,
      completed: true,
    })),
    {
      headers: {
        "Cache-Control": "private, s-maxage=30, stale-while-revalidate=120",
      },
    }
  );
}
