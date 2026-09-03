// GET /api/cron/purchase-start-reminders
// Daily: nudge paid buyers who have not completed their diagnostic (day 2 / 7 / 21).

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { allowMissingSecret } from "@/lib/security/requireSecret";
import { runPurchaseStartReminders } from "@/lib/purchases/runPurchaseStartReminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function verifyCronAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return allowMissingSecret();
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runPurchaseStartReminders();
    const sent = results.reduce((n, r) => n + r.sent, 0);
    const errors = results.reduce((n, r) => n + r.errors, 0);
    logger.info("[Purchase Start Reminders] Cron complete", { sent, errors, results });
    return NextResponse.json({ ok: true, sent, errors, results });
  } catch (err) {
    logger.error("[Purchase Start Reminders] Cron failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Reminder cron failed" }, { status: 500 });
  }
}
