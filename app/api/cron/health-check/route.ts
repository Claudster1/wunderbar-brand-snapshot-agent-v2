// app/api/cron/health-check/route.ts
// Daily automated health check — runs via Vercel Cron.
// Checks all services and sends an alert if anything is degraded/down.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Verify this is called by Vercel Cron (not a random visitor)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const healthToken = process.env.HEALTH_CHECK_TOKEN;

    // Call the deep health check
    const headers: Record<string, string> = {};
    if (healthToken) headers["Authorization"] = `Bearer ${healthToken}`;

    const res = await fetch(`${baseUrl}/api/health?deep=1`, { headers });
    const health = await res.json();

    // If unhealthy, fire an alert
    if (health.status === "unhealthy" || health.status === "degraded") {
      await sendAlert(health);
    }

    // Log the check
    const { logger } = await import("@/lib/logger");
    logger.info("[Cron Health Check]", {
      status: health.status,
      checks: Object.fromEntries(
        Object.entries(health.checks || {}).map(([k, v]: [string, any]) => [k, v.ok ? "ok" : v.error || "failed"])
      ),
    });

    return NextResponse.json({
      checked: true,
      status: health.status,
      alerted: health.status !== "healthy",
    });
  } catch (err) {
    logger.error("[Cron Health Check] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}

async function sendAlert(health: Record<string, unknown>) {
  // Option 1: Slack webhook (if configured)
  const slackUrl = process.env.SLACK_ALERT_WEBHOOK;
  if (slackUrl) {
    try {
      const checks = (health.checks || {}) as Record<string, { ok: boolean; error?: string }>;
      const problems = Object.entries(checks)
        .filter(([, v]) => !v.ok)
        .map(([k, v]) => `• *${k}*: failed${v.error ? ` — ${v.error}` : ""}`)
        .join("\n");

      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `⚠️ *WunderBrand Health Alert*\nStatus: ${health.status}\n\n${problems}`,
        }),
      });
    } catch (err) {
      logger.error("[Alert] Slack notification failed", { error: err instanceof Error ? err.message : String(err) });
    }
  }

  // Option 2: ActiveCampaign event (always available)
  try {
    const { fireACEvent } = await import("@/lib/fireACEvent");
    await fireACEvent({
      email: process.env.ALERT_EMAIL || "team@wunderbardigital.com",
      eventName: "system_health_alert",
      tags: ["system:health-alert"],
      fields: {
        health_status: String(health.status),
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    // Best-effort
  }
}
