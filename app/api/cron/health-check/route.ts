// app/api/cron/health-check/route.ts
// Daily automated health check — runs via Vercel Cron.
// Checks all services and sends an alert if anything is degraded/down.

import { NextResponse } from "next/server";

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
      services: Object.fromEntries(
        Object.entries(health.services || {}).map(([k, v]: [string, any]) => [k, v.status])
      ),
    });

    return NextResponse.json({
      checked: true,
      status: health.status,
      alerted: health.status !== "healthy",
    });
  } catch (err) {
    console.error("[Cron Health Check] Error:", err);
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}

async function sendAlert(health: Record<string, unknown>) {
  // Option 1: Slack webhook (if configured)
  const slackUrl = process.env.SLACK_ALERT_WEBHOOK;
  if (slackUrl) {
    try {
      const services = health.services as Record<string, { status: string; message?: string }>;
      const problems = Object.entries(services)
        .filter(([, v]) => v.status !== "ok")
        .map(([k, v]) => `• *${k}*: ${v.status}${v.message ? ` — ${v.message}` : ""}`)
        .join("\n");

      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `⚠️ *WunderBrand Health Alert*\nStatus: ${health.status}\n\n${problems}`,
        }),
      });
    } catch (err) {
      console.error("[Alert] Slack notification failed:", err);
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
