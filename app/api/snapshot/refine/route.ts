// app/api/snapshot/refine/route.ts
// API route for saving refined/updated scores after a refinement conversation.
// Stores previous scores in score_history for version tracking.

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      reportId,
      previousScores,
      updatedScores,
      refinementContext,
      messages,
    } = body;

    if (!reportId || !updatedScores) {
      return NextResponse.json(
        { error: "Missing required fields: reportId, updatedScores" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 1. Load the existing report to get current score_history
    const { data: existing, error: fetchError } = await supabase
      .from("brand_snapshot_reports")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (fetchError || !existing) {
      console.error("[Refine API] Report not found:", fetchError);
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Cast to a usable type
    const report = existing as Record<string, unknown>;

    // 2. Build the score history entry
    const historyEntry = {
      timestamp: new Date().toISOString(),
      brandAlignmentScore:
        previousScores?.brandAlignmentScore ??
        report.brand_alignment_score,
      pillarScores:
        previousScores?.pillarScores ?? report.pillar_scores,
      source: "refinement",
    };

    // Append to existing history (or create new array)
    const existingHistory = report.score_history || [];
    const scoreHistory = [
      ...(Array.isArray(existingHistory) ? existingHistory : []),
      historyEntry,
    ];

    // 3. Calculate the new brand alignment score as average of pillar scores
    const pillarValues = Object.values(
      updatedScores.pillarScores || {}
    ) as number[];
    const newBrandAlignmentScore =
      pillarValues.length > 0
        ? Math.round(
            (pillarValues.reduce((a: number, b: number) => a + b, 0) /
              pillarValues.length) *
              5
          )
        : updatedScores.brandAlignmentScore;

    // 4. Update the report with new scores and history
    const updatePayload = {
      brand_alignment_score: newBrandAlignmentScore,
      pillar_scores: updatedScores.pillarScores,
      pillar_insights: updatedScores.pillarInsights || report.pillar_insights,
      recommendations: updatedScores.recommendations || report.recommendations,
      score_history: scoreHistory,
      last_refined_at: new Date().toISOString(),
      refinement_count: ((report.refinement_count as number) || 0) + 1,
      updated_at: new Date().toISOString(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase
      .from("brand_snapshot_reports") as any)
      .update(updatePayload)
      .eq("report_id", reportId);

    if (updateError) {
      console.error("[Refine API] Update failed:", updateError);
      return NextResponse.json(
        { error: "Failed to update report", details: updateError.message },
        { status: 500 }
      );
    }

    // 5. Save the refinement conversation for reference
    try {
      await (supabase.from("brand_snapshot_refinements") as unknown as { insert: (data: Record<string, unknown>) => Promise<unknown> }).insert({
        snapshot_report_id: reportId,
        user_email: report.email || report.user_email || "unknown",
        pillar: refinementContext?.areasRefined?.[0] || "general",
        additional_context: JSON.stringify({
          messages: messages?.slice(-10) || [],
          refinementContext,
        }),
        status: "completed",
        completed_at: new Date().toISOString(),
      });
    } catch {
      // Non-critical — refinement history is nice-to-have
      console.warn("[Refine API] Could not save refinement history");
    }

    return NextResponse.json({
      success: true,
      previousScore: previousScores?.brandAlignmentScore ?? report.brand_alignment_score,
      newScore: newBrandAlignmentScore,
      scoreDelta: newBrandAlignmentScore - ((previousScores?.brandAlignmentScore ?? report.brand_alignment_score) as number),
      refinementCount: ((report.refinement_count as number) || 0) + 1,
    });
  } catch (err: unknown) {
    console.error("[Refine API] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to save refinement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
