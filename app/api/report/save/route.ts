import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "report-save", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const body = await req.json();
    const { reportId, email, name, data } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    if (!reportId || !email || !name || !data) {
      return NextResponse.json(
        { error: "Missing required fields: reportId, email, name, or data" },
        { status: 400 }
      );
    }

  const { error } = await supabaseAdmin
    .from("brand_snapshot_reports")
    .insert({
      report_id: reportId,
      user_email: email,
      user_name: name,
      brand_alignment_score: data.brandAlignmentScore,
      pillar_scores: data.pillarScores,
      pillar_insights: data.pillarInsights,
      recommendations: data.recommendations,
      website_notes: data.websiteNotes ?? "",
      full_report: data
    });

    if (error) {
      logger.error("Supabase insert error", {
        error: error.message,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    logger.error("[Report Save API] Unexpected error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: err?.message || "Failed to save report" },
      { status: 500 }
    );
  }
}

