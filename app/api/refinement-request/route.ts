// app/api/refinement-request/route.ts

import { NextResponse } from "next/server";
import { saveRefinementRequest } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";

export async function POST(req: Request) {
  const guard = apiGuard(req, { routeId: "refinement-request", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.formData();

    const scopeRaw = body.get("scope");
    const payload = {
      type: "refinement",
      scope: typeof scopeRaw === "string" ? scopeRaw : "pillar",
      report_id: body.get("reportId"),
      pillar: body.get("pillar"),
      context: body.get("context"),
    };

    await saveRefinementRequest(payload);

    return NextResponse.redirect("/dashboard/history");
  } catch (err) {
    logger.error("[Refinement Request] Failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to save refinement request" },
      { status: 500 }
    );
  }
}
