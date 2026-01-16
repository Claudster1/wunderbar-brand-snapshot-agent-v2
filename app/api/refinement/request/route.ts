// app/api/refinement/request/route.ts
import { supabaseServer } from "@/lib/supabaseServer";
import { generateRefinement } from "@/lib/refinementEngine";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      snapshotReportId,
      userEmail,
      pillar,
      additionalContext,
      supportingUrls,
    } = body;

    if (!snapshotReportId || !pillar || !additionalContext) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const refinement = await generateRefinement({
      snapshotReportId,
      pillar,
      additionalContext,
      supportingUrls,
    });

    // Ensure we store the report_id (TEXT), not UUID
    // If snapshotReportId is UUID, we need to fetch the report_id first
    let reportIdToStore = snapshotReportId;
    
    // Check if it's a UUID - if so, fetch the report_id
    const uuidMatch = snapshotReportId.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    if (uuidMatch) {
      const { data: reportData } = await supabaseServer()
        .from("brand_snapshot_reports")
        .select("report_id")
        .eq("id", snapshotReportId)
        .single();
      if (reportData?.report_id) {
        reportIdToStore = reportData.report_id;
      }
    }

    const { error } = await supabaseServer()
      .from("brand_snapshot_refinements")
      .insert({
        snapshot_report_id: reportIdToStore,
        user_email: userEmail,
        pillar,
        additional_context: additionalContext,
        supporting_urls: supportingUrls || [],
        refined_insight: refinement.insight,
        refined_recommendations: refinement.recommendations,
        status: "completed",
        completed_at: new Date().toISOString(),
      });

    if (error) {
      console.error("[Refinement] Database error:", error);
      return NextResponse.json(
        { error: "Failed to save refinement" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Refinement] Error:", err);
    return NextResponse.json(
      { error: "Failed to process refinement request" },
      { status: 500 }
    );
  }
}
