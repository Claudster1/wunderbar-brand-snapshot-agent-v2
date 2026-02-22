// app/api/snapshot/progress/route.ts
// API route for saving and loading snapshot progress

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { saveSnapshotProgress } from "@/lib/saveSnapshotProgress";
import { loadSnapshotProgress } from "@/lib/loadSnapshotProgress";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reportId, lastStep, progress } = body;

    if (!reportId || !lastStep) {
      return NextResponse.json(
        { error: "Missing required fields: reportId, lastStep" },
        { status: 400 }
      );
    }

    await saveSnapshotProgress({
      reportId,
      lastStep,
      progress: progress || {},
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    logger.error("[Snapshot Progress API] Error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "snapshot-progress", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { error: "Missing reportId parameter" },
        { status: 400 }
      );
    }

    const data = await loadSnapshotProgress(reportId);

    return NextResponse.json({ data });
  } catch (err: any) {
    logger.error("[Snapshot Progress API] Error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to load progress" },
      { status: 500 }
    );
  }
}
