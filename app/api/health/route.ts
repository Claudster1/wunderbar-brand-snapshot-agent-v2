// app/api/health/route.ts
// Health check endpoint for uptime monitoring (UptimeRobot, etc.) and ops.
//
// Modes:
//   GET /api/health?scope=liveness  — fast 200 for high-frequency uptime pings
//   GET /api/health                 — dependency checks (cached ~5s)
//   GET /api/health?smoke=1         — dependencies + draft persist write smoke
//   GET /api/health?deep=1          — alias of smoke=1 (cron / legacy)

import { NextResponse } from "next/server";
import {
  computeDeepHealth,
  computeDependencyHealth,
  type HealthCheckResult,
} from "@/lib/health/probe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const startTime = Date.now();
const HEALTH_CACHE_TTL_MS = 5000;
let cachedHealth: HealthCheckResult | null = null;
let cachedAt = 0;
let inflightHealth: Promise<HealthCheckResult> | null = null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");
  const forceRefresh = searchParams.get("refresh") === "1";
  const wantSmoke =
    searchParams.get("smoke") === "1" || searchParams.get("deep") === "1";

  // Fast liveness mode for UptimeRobot / load testing (no dependency hits).
  if (scope === "liveness") {
    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - startTime) / 1000),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Health-Scope": "liveness",
        },
      },
    );
  }

  // Smoke/deep is never cached — always fresh write probe.
  if (wantSmoke) {
    const health = await computeDeepHealth(startTime);
    return NextResponse.json(health, {
      status: health.status === "unhealthy" ? 503 : 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Health-Scope": "smoke",
      },
    });
  }

  const now = Date.now();
  if (!forceRefresh && cachedHealth && now - cachedAt < HEALTH_CACHE_TTL_MS) {
    return NextResponse.json(cachedHealth, {
      status: cachedHealth.status === "unhealthy" ? 503 : 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Health-Cache": "HIT",
      },
    });
  }

  if (!inflightHealth) {
    inflightHealth = computeDependencyHealth(startTime).finally(() => {
      inflightHealth = null;
    });
  }

  const health = await inflightHealth;
  cachedHealth = health;
  cachedAt = now;

  return NextResponse.json(health, {
    status: health.status === "unhealthy" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Health-Cache": "MISS",
    },
  });
}
