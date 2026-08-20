// POST /api/snapshot/ensure-access-session
// Re-issue verified session for an already email-unlocked Snapshot report.
// Used so Export/PDF works on return visits without forcing OTP.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isResultsEmailUnlocked } from "@/lib/results/resultsEmailUnlock";
import {
  createSessionToken,
  sessionCookieOptions,
  VERIFIED_SESSION_COOKIE,
} from "@/lib/auth/session";

function describeError(err: unknown): string {
  if (!err) return "unknown error";
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = await apiGuard(req, {
    routeId: "snapshot-ensure-access-session",
    rateLimit: GENERAL_RATE_LIMIT,
  });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = (await req.json().catch(() => ({}))) as {
      reportId?: string;
      email?: string;
    };
    const reportId = typeof body.reportId === "string" ? body.reportId.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!reportId || !email.includes("@")) {
      return NextResponse.json({ error: "Report and email are required." }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    async function loadReport(idColumn: "id" | "report_id") {
      const { data } = await supabaseAdmin!
        .from("brand_snapshot_reports")
        .select("user_email, full_report, report_id")
        .eq(idColumn, reportId)
        .maybeSingle();
      return data as
        | { user_email?: string | null; full_report?: unknown; report_id?: string }
        | null;
    }

    const report = (await loadReport("report_id")) ?? (await loadReport("id"));
    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const owner = (report.user_email || "").trim().toLowerCase();
    if (!owner || owner !== email) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!isResultsEmailUnlocked(report)) {
      return NextResponse.json({ error: "Results not unlocked yet." }, { status: 403 });
    }

    const token = createSessionToken(email);
    if (!token) {
      return NextResponse.json({ error: "Could not create session." }, { status: 503 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(VERIFIED_SESSION_COOKIE, token, sessionCookieOptions());
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (err) {
    logger.error("[Ensure Access Session]", { error: describeError(err) });
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
