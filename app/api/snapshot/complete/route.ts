// app/api/snapshot/complete/route.ts
// API route to mark snapshot as completed

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "snapshot-complete", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const { isValidUUID } = await import("@/lib/security/inputValidation");
    const body = await req.json();
    const { reportId, status = "completed" } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: "Missing reportId" },
        { status: 400 }
      );
    }
    if (!isValidUUID(reportId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const supabase = supabaseServer();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase
      .from("brand_snapshot_reports") as any)
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("report_id", reportId);

    if (error) {
      console.error("[Snapshot Complete API] Error:", error);
      return NextResponse.json(
        { error: "Failed to update report status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Snapshot Complete API] Error:", err);
    return NextResponse.json(
      { error: "Failed to complete snapshot" },
      { status: 500 }
    );
  }
}
