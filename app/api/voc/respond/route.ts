// POST /api/voc/respond — Submit a VOC survey response (public, no auth)
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "voc-respond", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json();
    const { surveyToken, threeWords, differentiator, discoveryChannel, friendDescription, improvement, experienceScore, chooseReason, elevatorDescription } = body;

    if (!surveyToken || !threeWords || !Array.isArray(threeWords) || threeWords.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { sanitizeString } = await import("@/lib/security/inputValidation");
    const sanitizedThreeWords = threeWords.slice(0, 5).map((w: unknown) => sanitizeString(w).slice(0, 50));
    const sanitizedDifferentiator = differentiator != null ? sanitizeString(differentiator).slice(0, 500) : null;
    const sanitizedDiscoveryChannel = discoveryChannel != null ? sanitizeString(discoveryChannel).slice(0, 200) : null;
    const sanitizedFriendDescription = friendDescription != null ? sanitizeString(friendDescription).slice(0, 500) : null;
    const sanitizedImprovement = improvement != null ? sanitizeString(improvement).slice(0, 500) : null;
    const sanitizedChooseReason = chooseReason != null ? sanitizeString(chooseReason).slice(0, 500) : null;
    const sanitizedElevatorDescription = elevatorDescription != null ? sanitizeString(elevatorDescription).slice(0, 500) : null;

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
      three_words: sanitizedThreeWords,
      differentiator: sanitizedDifferentiator,
      discovery_channel: sanitizedDiscoveryChannel,
      friend_description: sanitizedFriendDescription,
      improvement: sanitizedImprovement,
      experience_score: typeof experienceScore === "number" ? Math.min(10, Math.max(0, Math.round(experienceScore))) : null,
      choose_reason: sanitizedChooseReason,
      elevator_description: sanitizedElevatorDescription,
    });

    if (insertErr) {
      logger.error("[VOC Respond] Insert error", { error: insertErr instanceof Error ? insertErr.message : String(insertErr) });
      return NextResponse.json({ error: "Failed to save response" }, { status: 500 });
    }

    // Check if we've hit the analysis threshold (3+ responses)
    const newCount = (count ?? 0) + 1;

    return NextResponse.json({
      success: true,
      responseCount: newCount,
    });
  } catch (err: any) {
    logger.error("[VOC Respond] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
