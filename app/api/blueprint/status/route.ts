import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getWorkbookEditability, shouldAutoFinalize } from "@/lib/workbookAccess";

export const runtime = "nodejs";

/**
 * GET /api/blueprint/status?reportId=xxx&email=xxx
 * Returns the workbook's tier, finalization state, and editability info.
 * Also triggers lazy auto-finalization if the 14-day window has elapsed.
 */
export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const reportId = url.searchParams.get("reportId");
  const email = url.searchParams.get("email");

  if (!reportId || !email) {
    return NextResponse.json({ error: "reportId and email are required." }, { status: 400 });
  }

  const { data: workbook } = await supabaseAdmin
    .from("brand_workbook")
    .select("id, email, product_tier, created_at, finalized_at")
    .eq("report_id", reportId)
    .single();

  if (!workbook) {
    return NextResponse.json({ error: "Workbook not found." }, { status: 404 });
  }

  if (workbook.email?.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  // Lazy auto-finalize: if Blueprint tier and review window expired
  if (shouldAutoFinalize({
    productTier: workbook.product_tier,
    createdAt: workbook.created_at,
    finalizedAt: workbook.finalized_at,
  })) {
    const now = new Date().toISOString();
    await supabaseAdmin
      .from("brand_workbook")
      .update({ finalized_at: now, updated_at: now })
      .eq("id", workbook.id);

    workbook.finalized_at = now;
  }

  const editability = getWorkbookEditability({
    productTier: workbook.product_tier,
    createdAt: workbook.created_at,
    finalizedAt: workbook.finalized_at,
  });

  return NextResponse.json({
    reportId,
    tier: editability.tier,
    canEdit: editability.canEdit,
    isFinalized: editability.isFinalized,
    reviewDaysRemaining: editability.reviewDaysRemaining,
    reviewWindowExpired: editability.reviewWindowExpired,
    reason: editability.reason,
    finalizedAt: workbook.finalized_at,
    createdAt: workbook.created_at,
  });
}
