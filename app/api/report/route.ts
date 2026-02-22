import { NextResponse } from "next/server";
import React from "react";
import { logger } from "@/lib/logger";
import { ReportDocument } from "@/app/reports/ReportDocument";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const guard = apiGuard(req, { routeId: "report-pdf", maxBodySize: 500_000 });
  if (!guard.passed) return guard.errorResponse;

  try {
    const data = await req.json();

    const { renderToBuffer } = await import("@react-pdf/renderer");

    const pdfBuffer = await renderToBuffer(
      React.createElement(ReportDocument, { data }) as any
    );

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="snapshot-plus.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err: unknown) {
    logger.error("[/api/report] PDF generation failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "PDF generation failed. Please try again." },
      { status: 500 }
    );
  }
}
