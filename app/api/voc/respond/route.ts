// POST /api/voc/respond — Submit a VOC survey response (public, no auth)
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "voc-respond", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json();
    const { surveyToken, threeWords, differentiator, discoveryChannel, friendDescription, improvement, npsScore, chooseReason, elevatorDescription } = body;

    if (!surveyToken || !threeWords || !Array.isArray(threeWords) || threeWords.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = supabaseServer();

    // Look up the survey
    const { data: survey, error: surveyErr } = await (supabase.from("voc_surveys") as any)
      .select("id, status, max_responses")
      .eq("survey_token", surveyToken)
      .single();

    if (surveyErr || !survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    if (survey.status !== "active") {
      return NextResponse.json({ error: "This survey is no longer accepting responses" }, { status: 410 });
    }

    // Check response count
    const { count } = await (supabase.from("voc_responses") as any)
      .select("id", { count: "exact", head: true })
      .eq("survey_id", survey.id);

    if (count !== null && count >= survey.max_responses) {
      return NextResponse.json({ error: "This survey has reached its response limit" }, { status: 410 });
    }

    // Insert the response
    const { error: insertErr } = await (supabase.from("voc_responses") as any).insert({
      survey_id: survey.id,
      three_words: threeWords.slice(0, 5).map((w: string) => w.trim().slice(0, 50)),
      differentiator: differentiator?.slice(0, 500) ?? null,
      discovery_channel: discoveryChannel?.slice(0, 200) ?? null,
      friend_description: friendDescription?.slice(0, 500) ?? null,
      improvement: improvement?.slice(0, 500) ?? null,
      nps_score: typeof npsScore === "number" ? Math.min(10, Math.max(0, Math.round(npsScore))) : null,
      choose_reason: chooseReason?.slice(0, 500) ?? null,
      elevator_description: elevatorDescription?.slice(0, 500) ?? null,
    });

    if (insertErr) {
      console.error("[VOC Respond] Insert error:", insertErr);
      return NextResponse.json({ error: "Failed to save response" }, { status: 500 });
    }

    // Check if we've hit the analysis threshold (3+ responses)
    const newCount = (count ?? 0) + 1;

    return NextResponse.json({
      success: true,
      responseCount: newCount,
    });
  } catch (err: any) {
    console.error("[VOC Respond] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
