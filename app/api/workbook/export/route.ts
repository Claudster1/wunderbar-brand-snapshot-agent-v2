// GET /api/workbook/export?reportId=xxx&email=xxx
// Generates and streams a Brand Standards Guide PDF from the Brand Workbook.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { BrandStandardsDocument } from "@/src/pdf/documents/BrandStandardsDocument";

export const runtime = "nodejs";
export const maxDuration = 30;

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

  try {
    // Fetch workbook
    const { data: workbook, error } = await supabaseAdmin
      .from("brand_workbook")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (error || !workbook) {
      return NextResponse.json({ error: "Workbook not found." }, { status: 404 });
    }

    // Verify ownership
    if (workbook.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    // Render PDF
    const buffer = await renderToBuffer(
      React.createElement(BrandStandardsDocument, { data: workbook })
    );

    // Track export
    await supabaseAdmin
      .from("brand_workbook")
      .update({
        last_exported_at: new Date().toISOString(),
        export_count: (workbook.export_count || 0) + 1,
      })
      .eq("report_id", reportId);

    const filename = `${(workbook.business_name || "Brand").replace(/[^a-zA-Z0-9]/g, "_")}_Brand_Standards_Guide.pdf`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    logger.error("[Workbook Export] PDF generation failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "PDF generation failed." }, { status: 500 });
  }
}
