// GET /api/admin/benchmark-cohorts
// Internal-only: anonymized cohort sample sizes from benchmark_data (no PII).

import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminSession";
import { getBenchmarkCohortMonitoringSnapshot } from "@/lib/benchmarkCohortMonitoring";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const payload = await getBenchmarkCohortMonitoringSnapshot();
    return NextResponse.json(payload);
  } catch (err) {
    logger.error("[Admin benchmark cohorts]", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to load cohort stats" }, { status: 500 });
  }
}
