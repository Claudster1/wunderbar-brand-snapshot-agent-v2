import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ReportDocument } from "@/app/reports/ReportDocument";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const data = await req.json();

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
  } catch (err: any) {
    console.error("[/api/report] PDF generation failed:", err);
    return NextResponse.json(
      { error: "PDF generation failed", details: err?.message },
      { status: 500 }
    );
  }
}


