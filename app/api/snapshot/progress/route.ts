// app/api/snapshot/progress/route.ts
// API route for saving and loading snapshot progress

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { saveSnapshotProgress } from "@/lib/saveSnapshotProgress";

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

    const { findBrandSnapshotReportByPublicId } = await import("@/lib/brandSnapshotReportLookup");
    const row = await findBrandSnapshotReportByPublicId(reportId);
    if (!row) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const ownerEmail = (row as { user_email?: string | null }).user_email;
    const canonicalId =
      (typeof (row as { report_id?: string }).report_id === "string" &&
      (row as { report_id: string }).report_id.trim()
        ? (row as { report_id: string }).report_id
        : null) || reportId;

    const { authorizeReportRead } = await import("@/lib/reportAccess");
    const access = await authorizeReportRead({
      req,
      reportId: canonicalId,
      reportOwnerEmail: ownerEmail,
    });
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const data = {
      last_step: (row as { last_step?: string }).last_step,
      progress: (row as { progress?: unknown }).progress,
    };

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
