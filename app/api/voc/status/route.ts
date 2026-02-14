// GET /api/voc/status?reportId=xxx — Check VOC survey status for a report
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const guard = apiGuard(req, { routeId: "voc-status", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const reportId = req.nextUrl.searchParams.get("reportId");
  if (!reportId) {
    return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
  }

  try {
    const supabase = supabaseServer();

    // Get survey for this report
    const { data: survey } = await (supabase.from("voc_surveys") as any)
      .select("id, survey_token, status, created_at, analysis_generated_at")
      .eq("report_id", reportId)
      .single();

    if (!survey) {
      return NextResponse.json({ hasSurvey: false });
    }

    // Count responses + get analysis in parallel (both depend on survey.id)
    const [countResult, analysisResult] = await Promise.all([
      (supabase.from("voc_responses") as any)
        .select("id", { count: "exact", head: true })
        .eq("survey_id", survey.id),
      (supabase.from("voc_analysis") as any)
        .select("nps_score, nps_category, top_words, perception_summary, alignment_gaps, strengths_customers_see, blind_spots, response_count")
        .eq("survey_id", survey.id)
        .single(),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://app.wunderbrand.ai";

    return NextResponse.json({
      hasSurvey: true,
      surveyUrl: `${baseUrl}/survey/${survey.survey_token}`,
      surveyToken: survey.survey_token,
      status: survey.status,
      responseCount: countResult.count ?? 0,
      analysisReady: !!analysisResult.data,
      analysis: analysisResult.data ?? null,
    });
  } catch (err: any) {
    logger.error("[VOC Status] Error", { error: err?.message ?? String(err) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
