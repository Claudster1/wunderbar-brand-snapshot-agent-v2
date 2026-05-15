// app/api/snapshot/draft/route.ts
// API route to create a draft snapshot report

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "snapshot-draft", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const { sanitizeString, isValidEmail } = await import("@/lib/security/inputValidation");

    const body = await req.json().catch(() => ({}));
    const rawEmail = body.userEmail ? sanitizeString(body.userEmail) : null;
    const userEmail = rawEmail && isValidEmail(rawEmail) ? rawEmail.toLowerCase() : null;

    // Use server-side UUID generation
    const reportId = randomUUID();
    const supabase = supabaseServer();
    
    const { data, error } = await supabase
      .from("brand_snapshot_reports")
      .insert({
        id: reportId,
        report_id: reportId,
        user_email: userEmail || null,
        brand_name: "Draft",
        brand_alignment_score: 0,
        pillar_scores: {} as any,
        primary_pillar: "positioning",
        context_coverage: 0,
        snapshot_stage: "in_progress",
        status: "draft",
        last_step: "start",
        progress: {} as any,
      } as any)
      .select("id")
      .single();

    if (error) {
      logger.error("[Snapshot Draft API] Supabase insert error", {
        error: error.message,
        code: error.code,
        details: error.details,
      });
      // Graceful fallback for local/offline environments:
      // keep the chat flow usable even if persistence is temporarily unavailable.
      return NextResponse.json({
        reportId,
        persisted: false,
        warning: "Draft persistence temporarily unavailable",
      });
    }

    const row = data as { id?: string; report_id?: string } | null;
    return NextResponse.json({ reportId: row?.report_id ?? row?.id ?? reportId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const cause =
      err instanceof Error && err.cause instanceof Error
        ? err.cause.message
        : err instanceof Error && err.cause && typeof err.cause === "object" && "code" in err.cause
          ? String((err.cause as { code?: string }).code)
          : undefined;
    logger.error("[Snapshot Draft API] Uncaught (often Supabase network/TLS)", {
      error: message,
      ...(cause ? { cause } : {}),
    });
    // Graceful fallback for transient network/Supabase failures.
    return NextResponse.json({
      reportId: randomUUID(),
      persisted: false,
      warning: "Draft persistence temporarily unavailable",
    });
  }
}
