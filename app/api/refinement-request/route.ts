// app/api/refinement-request/route.ts

import { NextResponse } from "next/server";
import { saveRefinementRequest } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.formData();

  const payload = {
    type: "refinement",
    scope: body.get("scope") || "pillar",
    report_id: body.get("reportId"),
    pillar: body.get("pillar"),
    context: body.get("context")
  };

  await saveRefinementRequest(payload);

  return NextResponse.redirect("/dashboard/history");
}
