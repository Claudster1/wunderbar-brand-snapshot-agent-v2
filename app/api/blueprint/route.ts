import { NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { BlueprintDocument } from "@/app/reports/BlueprintDocument";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const pdfBuffer = await renderToBuffer(
      React.createElement(BlueprintDocument, { data: body }) as any
    );

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="brand-blueprint.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("[blueprint] PDF generation failed:", err);
    return NextResponse.json(
      { error: "PDF generation failed", details: err?.message },
      { status: 500 }
    );
  }
}


