import { NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { buildBlueprintPlus } from "@/src/engines/blueprintPlusEngine";
import { BlueprintPlusDocument } from "@/app/reports/BlueprintPlusDocument";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const blueprintPlus = buildBlueprintPlus(body);

    const pdfBuffer = await renderToBuffer(
      React.createElement(BlueprintPlusDocument, { data: blueprintPlus }) as any
    );

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="brand-blueprint-plus.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("[blueprint-plus] PDF generation failed:", err);
    return NextResponse.json(
      { error: "PDF generation failed", details: err?.message },
      { status: 500 }
    );
  }
}


