// app/api/cron/health-check/route.ts
// Always-on health probe via Vercel Cron (every 15 minutes).
// Runs dependency checks + draft-persist smoke + AI smokes; Slack-alerts on degraded/unhealthy.
//
// Pair with UptimeRobot on /api/health?scope=liveness for external 5-minute uptime.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { allowMissingSecret } from "@/lib/security/requireSecret";
import { computeDeepHealth, type HealthCheckResult } from "@/lib/health/probe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** AI smokes + per-provider probes can take a while when providers are slow/failing. */
export const maxDuration = 120;

const processStartedAt = Date.now();

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (!allowMissingSecret()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // In-process probe (avoids NEXT_PUBLIC_BASE_URL / self-fetch flakiness).
    const health = await computeDeepHealth(processStartedAt);

    const alerted = health.status === "unhealthy" || health.status === "degraded";
    if (alerted) {
      await sendAlert(health);
    }

    logger.info("[Cron Health Check]", {
      status: health.status,
      checks: Object.fromEntries(
        Object.entries(health.checks || {}).map(([k, v]) => [
          k,
          v.ok ? "ok" : v.error || "failed",
        ]),
      ),
    });

    return NextResponse.json({
      checked: true,
      status: health.status,
      alerted,
      checks: health.checks,
    });
  } catch (err) {
    logger.error("[Cron Health Check] Error", {
      error: err instanceof Error ? err.message : String(err),
    });
    try {
      await sendAlert({
        status: "unhealthy",
        checks: {
          cron: {
            ok: false,
            error: err instanceof Error ? err.message : "Health check failed",
          },
        },
      });
    } catch {
      /* best-effort */
    }
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}

async function sendAlert(
  health: Pick<HealthCheckResult, "status" | "checks"> | Record<string, unknown>,
) {
  const slackUrl = process.env.SLACK_ALERT_WEBHOOK;
  if (slackUrl) {
    try {
      const checks = (health.checks || {}) as Record<
        string,
        { ok: boolean; error?: string }
      >;
      const problems = Object.entries(checks)
        .filter(([, v]) => !v.ok)
        .map(([k, v]) => `• *${k}*: failed${v.error ? ` — ${v.error}` : ""}`)
        .join("\n");

      const aiBothDown =
        checks.assessmentChat && !checks.assessmentChat.ok
          ? "\n\n🚨 *Assessment chat primary + fallback both failed* — users will see connection errors."
          : "";

      const billing =
        checks.aiBilling && !checks.aiBilling.ok
          ? `\n\n💳 *AI billing / quota*\n${checks.aiBilling.error || "Provider reported insufficient credits."}\n→ OpenAI: https://platform.openai.com/settings/organization/billing\n→ Anthropic: https://console.anthropic.com/settings/billing\n→ Gemini: https://aistudio.google.com/`
          : "";

      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `⚠️ *WunderBrand Health Alert*\nStatus: ${String(health.status)}\n\n${problems || "• Unknown failure"}${aiBothDown}${billing}`,
        }),
      });
    } catch (err) {
      logger.error("[Alert] Slack notification failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

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
