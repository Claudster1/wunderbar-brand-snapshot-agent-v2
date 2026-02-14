// app/api/reports/[id]/route.ts
// API route to get a report by ID

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(request, { routeId: "report-by-id", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const { isValidUUID } = await import("@/lib/security/inputValidation");
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing report ID" },
        { status: 400 }
      );
    }
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .select("*")
      .eq("report_id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // ─── Authorization: verify email matches report owner ───
    const { checkReportAccess, getUserEmailFromRequest } = await import("@/lib/reportAccess");
    const userEmail = getUserEmailFromRequest(request);
    const access = checkReportAccess(userEmail, data.user_email);
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[Reports Get API] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to get report" },
      { status: 500 }
    );
  }
}

