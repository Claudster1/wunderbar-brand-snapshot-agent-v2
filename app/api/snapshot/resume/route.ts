// app/api/snapshot/resume/route.ts
// API route for resuming a draft snapshot

import { NextResponse } from "next/server";
import { loadSnapshotProgress } from "@/lib/loadSnapshotProgress";
import { supabaseServer } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { error: "Missing reportId parameter" },
        { status: 400 }
      );
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
    const { data: report, error } = await supabase
      .from("brand_snapshot_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (error || !report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      reportId,
      lastStep: progressData.last_step,
      progress: progressData.progress,
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
