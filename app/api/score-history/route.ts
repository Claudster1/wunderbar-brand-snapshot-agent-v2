// GET /api/score-history?email=xxx — Returns score history for the trend chart
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "score-history", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ history: [] });
  }

  try {
    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("brand_snapshot_reports")
      .select("report_id, brand_alignment_score, pillar_scores, company_name, brand_name, created_at")
      .eq("user_email", email.toLowerCase())
      .order("created_at", { ascending: true });

    if (error) {
      logger.error("[Score History] Query error", { error: error.message });
      return NextResponse.json({ history: [] });
    }

    const history = (data ?? []).map((row: Record<string, unknown>) => ({
      reportId: row.report_id as string,
      brandAlignmentScore: row.brand_alignment_score as number | null,
      pillarScores: row.pillar_scores as Record<string, number> | null,
      brandName: (row.brand_name ?? row.company_name) as string | null,
      createdAt: row.created_at as string,
    }));

    return NextResponse.json(
      { history },
      {
        headers: {
          "Cache-Control": "private, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("[Score History] Unexpected error", { error: msg });
    return NextResponse.json({ history: [] });
  }
}
