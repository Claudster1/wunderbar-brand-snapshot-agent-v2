// app/api/health/route.ts
// Health check endpoint for uptime monitoring services.
// Returns status of critical dependencies (Supabase, OpenAI, Stripe).
// Use this URL in UptimeRobot, Better Uptime, Pingdom, etc.

import { NextResponse } from "next/server";
import { getAllFeatureFlags } from "@/lib/featureFlags";

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

export async function GET() {
  const checks: HealthCheck["checks"] = {};

  // ─── Check Supabase ───
  try {
    const start = Date.now();
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("brand_snapshot_reports")
        .select("report_id")
        .limit(1);
      checks.supabase = { ok: !error, latencyMs: Date.now() - start };
      if (error) checks.supabase.error = "Query failed";
    } else {
      checks.supabase = { ok: false, error: "Not configured" };
    }
  } catch {
    checks.supabase = { ok: false, error: "Connection failed" };
  }

  // ─── Check OpenAI reachability ───
  try {
    const start = Date.now();
    const hasKey = !!process.env.OPENAI_API_KEY;
    checks.openai = { ok: hasKey, latencyMs: Date.now() - start };
    if (!hasKey) checks.openai.error = "API key not configured";
  } catch {
    checks.openai = { ok: false, error: "Check failed" };
  }

  // ─── Check Stripe ───
  try {
    const hasKey = !!process.env.STRIPE_SECRET_KEY;
    checks.stripe = { ok: hasKey };
    if (!hasKey) checks.stripe.error = "Secret key not configured";
  } catch {
    checks.stripe = { ok: false, error: "Check failed" };
  }

  // ─── Check Turnstile ───
  const hasTurnstile = !!process.env.TURNSTILE_SECRET_KEY;
  checks.turnstile = { ok: hasTurnstile };
  if (!hasTurnstile) checks.turnstile.error = "Secret key not configured";

  // ─── Check ActiveCampaign ───
  const hasAC = !!process.env.ACTIVECAMPAIGN_API_KEY || !!process.env.ACTIVE_CAMPAIGN_WEBHOOK;
  checks.activeCampaign = { ok: hasAC };
  if (!hasAC) checks.activeCampaign.error = "Not configured";

  // ─── Determine overall status ───
  const allOk = Object.values(checks).every((c) => c.ok);
  const criticalOk = checks.supabase?.ok && checks.openai?.ok;

  const health: HealthCheck = {
    status: allOk ? "healthy" : criticalOk ? "degraded" : "unhealthy",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
    featureFlags: getAllFeatureFlags(),
  };

  return NextResponse.json(health, {
    status: health.status === "unhealthy" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
