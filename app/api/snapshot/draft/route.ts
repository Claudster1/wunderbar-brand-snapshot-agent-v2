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

    const body = await req.json().catch(() => ({}));
    const userEmail = body.userEmail;

    // Use server-side UUID generation
    const reportId = randomUUID();
    const supabase = supabaseServer();
    
    const { data, error } = await supabase
      .from("brand_snapshot_reports")
      .insert({
        id: reportId,
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
      logger.error("[Snapshot Draft API] Error", {
        error: error.message,
      });
      return NextResponse.json(
        { error: "Failed to create draft report", details: error.message },
        { status: 500 }
      );
    }

    const row = data as { id?: string; report_id?: string } | null;
    return NextResponse.json({ reportId: row?.report_id ?? row?.id ?? reportId });
  } catch (err: any) {
    logger.error("[Snapshot Draft API] Error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to create draft report" },
      { status: 500 }
    );
  }
}
