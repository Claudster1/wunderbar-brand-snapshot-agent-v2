import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(request, { routeId: "report-get", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const { isValidUUID } = await import("@/lib/security/inputValidation");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("brand_snapshot_reports")
      .select("*")
      .eq("report_id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // ─── Authorization: verify email matches report owner ───
    const { checkReportAccess, getUserEmailFromRequest } = await import("@/lib/reportAccess");
    const userEmail = getUserEmailFromRequest(request);
    const access = checkReportAccess(userEmail, (data as any).user_email);
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json((data as any).full_report || data, { status: 200 });
  } catch (err: any) {
    logger.error("[Report Get API] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: err?.message || "Failed to get report" },
      { status: 500 }
    );
  }
}

