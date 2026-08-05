// GET /api/admin/pnl?days=30
// AI spend (estimated) vs Stripe revenue vs snapshot volume for unit economics / P&L.

import { NextRequest, NextResponse } from "next/server";
import { computePnLSummary } from "@/lib/admin/computePnL";
import { requireAdminApi } from "@/lib/auth/adminSession";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return auth.response;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 30, 1), 90);

  try {
    const summary = await computePnLSummary(days);
    return NextResponse.json(summary);
  } catch (err) {
    logger.error("[Admin PnL]", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}
