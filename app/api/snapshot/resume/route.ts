// app/api/snapshot/resume/route.ts
// API route for resuming a draft snapshot

import { NextResponse } from "next/server";
import { loadSnapshotProgress } from "@/lib/loadSnapshotProgress";
import { supabaseServer } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "snapshot-resume", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const { isValidUUID } = await import("@/lib/security/inputValidation");
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { error: "Missing reportId parameter" },
        { status: 400 }
      );
    }
    if (!isValidUUID(reportId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Load progress data
    const progressData = await loadSnapshotProgress(reportId);

    if (!progressData) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Also get full report data for context
    const supabase = supabaseServer();
    const { data: reportRow, error } = await supabase
      .from("brand_snapshot_reports")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (error || !reportRow) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const report = reportRow as { business_name?: string; brand_name?: string; user_email?: string };
    const progress = progressData as { last_step?: string; progress?: unknown };

    return NextResponse.json({
      reportId,
      lastStep: progress.last_step,
      progress: progress.progress,
      report: {
        business_name: report.business_name || report.brand_name,
        user_email: report.user_email,
      },
    });
  } catch (err: any) {
    console.error("[Snapshot Resume API] Error:", err);
    return NextResponse.json(
      { error: "Failed to load resume data" },
      { status: 500 }
    );
  }
}
