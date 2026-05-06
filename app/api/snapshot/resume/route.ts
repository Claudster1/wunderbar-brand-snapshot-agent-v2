// app/api/snapshot/resume/route.ts
// API route for resuming a draft snapshot or continuing after upgrade (prior answers on file).

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { findBrandSnapshotReportByPublicId } from "@/lib/brandSnapshotReportLookup";

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
      return NextResponse.json({ error: "Missing reportId parameter" }, { status: 400 });
    }
    if (!isValidUUID(reportId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const row = await findBrandSnapshotReportByPublicId(reportId);
    if (!row) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const r = row as {
      report_id?: string;
      id?: string;
      last_step?: string;
      progress?: { messages?: unknown } | null;
      full_report?: { answers?: unknown } | null;
      business_name?: string | null;
      brand_name?: string | null;
      user_email?: string | null;
    };

    const canonicalId = (typeof r.report_id === "string" && r.report_id.trim() ? r.report_id : null) || String(r.id ?? reportId);

    const progress = r.progress;
    const messages = progress?.messages;
    const hasTranscript = Array.isArray(messages) && messages.length > 0;

    const fullReport = r.full_report;
    const rawAnswers = fullReport && typeof fullReport === "object" ? fullReport.answers : null;
    const priorAnswers =
      rawAnswers && typeof rawAnswers === "object" && !Array.isArray(rawAnswers)
        ? (rawAnswers as Record<string, unknown>)
        : null;

    const continuationMode: "transcript" | "answers_only" =
      !hasTranscript && priorAnswers && Object.keys(priorAnswers).length > 0 ? "answers_only" : "transcript";

    return NextResponse.json({
      reportId: canonicalId,
      lastStep: r.last_step,
      progress,
      continuationMode,
      priorAnswers: continuationMode === "answers_only" ? priorAnswers : undefined,
      report: {
        business_name: r.business_name || r.brand_name,
        user_email: r.user_email,
      },
    });
  } catch (err: unknown) {
    logger.error("[Snapshot Resume API] Error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to load resume data" }, { status: 500 });
  }
}
