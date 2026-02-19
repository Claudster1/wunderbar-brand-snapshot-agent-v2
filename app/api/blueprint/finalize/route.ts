import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getWorkbookEditability } from "@/lib/workbookAccess";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  try {
    const { reportId, email } = await req.json();

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

    if (workbook.finalized_at) {
      return NextResponse.json({ error: "Already finalized.", finalized_at: workbook.finalized_at }, { status: 409 });
    }

    const editability = getWorkbookEditability({
      productTier: workbook.product_tier,
      createdAt: workbook.created_at,
      finalizedAt: workbook.finalized_at,
    });

    if (editability.tier === "blueprint_plus") {
      return NextResponse.json({ error: "Blueprint+ workbooks don't require finalization." }, { status: 400 });
    }

    const now = new Date().toISOString();

    const { error: updateErr } = await supabaseAdmin
      .from("brand_workbook")
      .update({ finalized_at: now, updated_at: now })
      .eq("report_id", reportId);

    if (updateErr) {
      logger.error("[Finalize] Update failed", { error: updateErr.message });
      return NextResponse.json({ error: "Failed to finalize." }, { status: 500 });
    }

    logger.info("[Finalize] Workbook finalized", { reportId, email: email.toLowerCase() });

    return NextResponse.json({ success: true, finalized_at: now });
  } catch (err) {
    logger.error("[Finalize] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Finalization failed." }, { status: 500 });
  }
}
