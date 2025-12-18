import { NextResponse } from "next/server";
import { buildBlueprint } from "@/src/engine/blueprintEngine";
import { BlueprintDocument } from "@/app/reports/BlueprintDocument";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

export async function POST(req: Request) {
  const body = await req.json();
  const blueprint = buildBlueprint(body);

  // NOTE: This file is `.ts`, so we use createElement (JSX requires `.tsx`).
  const pdf = await renderToBuffer(
    React.createElement(BlueprintDocument, { data: blueprint }) as any
  );

  return new NextResponse(pdf as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="brand-blueprint.pdf"',
    },
  });
}


