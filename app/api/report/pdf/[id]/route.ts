// app/api/report/pdf/[id]/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import { generatePdfResponseFromReport } from "@/src/pdf/generatePdf";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "report-pdf-by-id", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const { isValidUUID } = await import("@/lib/security/inputValidation");
    const { id } = await params;
    const url = new URL(req.url);
    const plus = url.searchParams.get("plus") === "1";

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const table = plus ? "brand_snapshot_plus_reports" : "brand_snapshot_reports";

    const { data: report, error } = await supabaseAdmin
      .from(table)
      .select("*")
      .eq("report_id", id)
      .single();

    if (error || !report) {
      return NextResponse.json(
        { error: "Report not found." },
        { status: 404 }
      );
    }

    return generatePdfResponseFromReport(
      report,
      plus ? "snapshot-plus" : "snapshot",
      plus ? `SnapshotPlus_Report_${id}.pdf` : `BrandSnapshot_Report_${id}.pdf`
    );
  } catch (err: any) {
    logger.error("PDF generation error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Failed to generate PDF." },
      { status: 500 }
    );
  }
}

