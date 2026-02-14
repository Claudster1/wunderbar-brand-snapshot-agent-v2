// app/api/snapshot/get/route.ts
// API route to get WunderBrand Snapshot™ reports

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";
import { checkReportAccess, getUserEmailFromRequest } from "@/lib/reportAccess";

export async function GET(req: Request) {
  // ─── Security: Rate limit ───
  const guard = apiGuard(req, { routeId: "snapshot-get", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    // Fetch only the columns the results page needs (avoid SELECT *)
    const { data, error } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .select("report_id, company_name, brand_alignment_score, pillar_scores, pillar_insights, recommendations, summary, opportunities_summary, upgrade_cta, full_report, user_name, user_email, created_at")
      .eq("report_id", id)
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // ─── Authorization: verify email matches report owner ───
    const userEmail = getUserEmailFromRequest(req);
    const access = checkReportAccess(userEmail, (data as any).user_email);
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Transform so the results page always receives expected keys
    const out: Record<string, unknown> = { ...data };
    if (!out.company_name && (data as any).company) {
      out.company_name = (data as any).company;
    }
    if (!out.insights && (data as any).pillar_insights) {
      out.insights = (data as any).pillar_insights;
    }
    // Cache report data for 60 seconds (revalidate in background)
    return NextResponse.json(out, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err: any) {
    console.error("[Snapshot Get API] Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to get snapshot" },
      { status: 500 }
    );
  }
}

