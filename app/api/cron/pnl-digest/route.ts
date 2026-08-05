// Weekly Slack P&L digest — revenue, AI spend (est.), conversions, unit economics.
// Schedule: Mondays 13:00 UTC (~6am PT) via vercel.json.

import { NextRequest, NextResponse } from "next/server";
import { computePnLSummary, formatPnLSlackDigest } from "@/lib/admin/computePnL";
import { logger } from "@/lib/logger";
import { allowMissingSecret } from "@/lib/security/requireSecret";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function verifyCronAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return allowMissingSecret();
  return req.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 7, 1), 90);
  const dryRun = url.searchParams.get("dryRun") === "1";

  try {
    const summary = await computePnLSummary(days);
    const appBaseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
      process.env.NEXTAUTH_URL?.trim() ||
      "https://app.wunderbrand.ai";

    const payload = formatPnLSlackDigest(summary, appBaseUrl);
    const slackUrl = process.env.SLACK_ALERT_WEBHOOK;

    if (!slackUrl) {
      logger.warn("[PnL Digest] SLACK_ALERT_WEBHOOK not set");
      return NextResponse.json({
        sent: false,
        reason: "SLACK_ALERT_WEBHOOK not configured",
        summary: summary.overview,
      });
    }

    if (dryRun) {
      return NextResponse.json({
        sent: false,
        dryRun: true,
        preview: payload.text,
        summary: summary.overview,
      });
    }

    const res = await fetch(slackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logger.error("[PnL Digest] Slack post failed", { status: res.status, body: body.slice(0, 200) });
      return NextResponse.json({ sent: false, error: "Slack post failed" }, { status: 502 });
    }

    logger.info("[PnL Digest] Sent", {
      days,
      revenueUsd: summary.overview.revenueUsd,
      aiCostUsd: summary.overview.aiCostUsd,
      paidConversions: summary.overview.paidConversions,
    });

    return NextResponse.json({
      sent: true,
      days,
      overview: summary.overview,
    });
  } catch (err) {
    logger.error("[PnL Digest] Error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Digest failed" }, { status: 500 });
  }
}
