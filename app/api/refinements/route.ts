// app/api/refinements/route.ts
// API route for creating snapshot refinement requests

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "refinements", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const body = await req.json();

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("snapshot_refinement_requests")
      .insert(body)
      .select()
      .single();

    if (error) {
      logger.error("Error inserting refinement request", {
        error: error.message,
      });
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    logger.error("Error in refinements API", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
