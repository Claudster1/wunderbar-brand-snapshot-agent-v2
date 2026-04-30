// app/api/health/route.ts
// Health check endpoint for uptime monitoring services.
// Returns status of critical dependencies (Supabase, OpenAI, Stripe).
// Use this URL in UptimeRobot, Better Uptime, Pingdom, etc.

import { NextResponse } from "next/server";
import { getAllFeatureFlags } from "@/lib/featureFlags";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }>;
  featureFlags?: Record<string, boolean>;
}

const startTime = Date.now();
const HEALTH_CACHE_TTL_MS = 5000;
const SUPABASE_TIMEOUT_MS = 1500;
let cachedHealth: HealthCheck | null = null;
let cachedAt = 0;
let inflightHealth: Promise<HealthCheck> | null = null;

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), timeoutMs);
    }),
  ]);
}

async function computeHealth(now: number): Promise<HealthCheck> {
  const checks: HealthCheck["checks"] = {};

  await Promise.all([
    (async () => {
      try {
        const start = Date.now();
        if (supabaseAdmin) {
          const { error } = await withTimeout(
            supabaseAdmin
              .from("brand_snapshot_reports")
              .select("report_id")
              .limit(1),
            SUPABASE_TIMEOUT_MS
          );
          checks.supabase = { ok: !error, latencyMs: Date.now() - start };
          if (error) checks.supabase.error = "Query failed";
        } else {
          checks.supabase = { ok: false, error: "Not configured" };
        }
      } catch {
        checks.supabase = { ok: false, error: "Connection failed" };
      }
    })(),
    (async () => {
      try {
        const start = Date.now();
        const hasKey = !!process.env.OPENAI_API_KEY;
        checks.openai = { ok: hasKey, latencyMs: Date.now() - start };
        if (!hasKey) checks.openai.error = "API key not configured";
      } catch {
        checks.openai = { ok: false, error: "Check failed" };
      }
    })(),
    (async () => {
      try {
        const hasKey = !!process.env.STRIPE_SECRET_KEY;
        checks.stripe = { ok: hasKey };
        if (!hasKey) checks.stripe.error = "Secret key not configured";
      } catch {
        checks.stripe = { ok: false, error: "Check failed" };
      }
    })(),
    (async () => {
      const hasTurnstile = !!process.env.TURNSTILE_SECRET_KEY;
      checks.turnstile = { ok: hasTurnstile };
      if (!hasTurnstile) checks.turnstile.error = "Secret key not configured";
    })(),
    (async () => {
      const hasAC = !!process.env.ACTIVECAMPAIGN_API_KEY || !!process.env.ACTIVE_CAMPAIGN_WEBHOOK;
      checks.activeCampaign = { ok: hasAC };
      if (!hasAC) checks.activeCampaign.error = "Not configured";
    })(),
  ]);

  const allOk = Object.values(checks).every((c) => c.ok);
  const criticalOk = checks.supabase?.ok && checks.openai?.ok;

  return {
    status: allOk ? "healthy" : criticalOk ? "degraded" : "unhealthy",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
    featureFlags: getAllFeatureFlags(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");
  const forceRefresh = searchParams.get("refresh") === "1";

  // Fast liveness mode for high-frequency probes and load testing.
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
      }
    );
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
    inflightHealth = computeHealth(now).finally(() => {
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
