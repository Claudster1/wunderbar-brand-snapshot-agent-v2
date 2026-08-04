// lib/health/probe.ts
// Shared dependency + smoke probes for /api/health and /api/cron/health-check.

import { randomUUID } from "crypto";
import { getAllFeatureFlags } from "@/lib/featureFlags";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  version: string;
  uptime: number;
  checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }>;
  featureFlags?: Record<string, boolean>;
}

const SUPABASE_TIMEOUT_MS = 1500;
const SMOKE_TIMEOUT_MS = 4000;

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), timeoutMs);
    }),
  ]);
}

/** Dependency checks (config + Supabase read). */
export async function computeDependencyHealth(startedAt: number): Promise<HealthCheckResult> {
  const checks: HealthCheckResult["checks"] = {};

  await Promise.all([
    (async () => {
      try {
        const start = Date.now();
        if (supabaseAdmin) {
          const { error } = await withTimeout(
            supabaseAdmin.from("brand_snapshot_reports").select("report_id").limit(1),
            SUPABASE_TIMEOUT_MS,
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
      const hasKey = !!process.env.OPENAI_API_KEY;
      checks.openai = { ok: hasKey };
      if (!hasKey) checks.openai.error = "API key not configured";
    })(),
    (async () => {
      const hasKey = !!process.env.STRIPE_SECRET_KEY;
      checks.stripe = { ok: hasKey };
      if (!hasKey) checks.stripe.error = "Secret key not configured";
    })(),
    (async () => {
      const hasTurnstile = !!process.env.TURNSTILE_SECRET_KEY;
      checks.turnstile = { ok: hasTurnstile };
      if (!hasTurnstile) checks.turnstile.error = "Secret key not configured";
    })(),
    (async () => {
      const hasApiClient =
        !!process.env.ACTIVE_CAMPAIGN_API_KEY && !!process.env.ACTIVE_CAMPAIGN_API_URL;
      const hasEventTracking =
        !!process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_KEY &&
        !!process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_ACTID;
      const hasWebhook =
        !!process.env.ACTIVECAMPAIGN_WEBHOOK_URL || !!process.env.ACTIVE_CAMPAIGN_WEBHOOK;
      const hasAC = hasApiClient || hasEventTracking || hasWebhook;
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
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    checks,
    featureFlags: getAllFeatureFlags(),
  };
}

/**
 * End-to-end write smoke: insert + delete a draft-shaped row.
 * Catches schema drift (e.g. missing context_coverage) that read checks miss.
 */
export async function runDraftPersistSmoke(): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  if (!supabaseAdmin) {
    return { ok: false, latencyMs: 0, error: "Not configured" };
  }

  const id = randomUUID();
  try {
    const { error: insertError } = await withTimeout(
      supabaseAdmin.from("brand_snapshot_reports").insert({
        id,
        report_id: id,
        brand_name: "HealthSmoke",
        brand_alignment_score: 0,
        pillar_scores: {},
        primary_pillar: "positioning",
        context_coverage: 0,
        snapshot_stage: "in_progress",
        status: "draft",
        last_step: "health-smoke",
        progress: {},
      } as any),
      SMOKE_TIMEOUT_MS,
    );

    if (insertError) {
      return {
        ok: false,
        latencyMs: Date.now() - start,
        error: insertError.message || "Insert failed",
      };
    }

    const { error: deleteError } = await withTimeout(
      supabaseAdmin.from("brand_snapshot_reports").delete().eq("id", id),
      SMOKE_TIMEOUT_MS,
    );

    if (deleteError) {
      return {
        ok: false,
        latencyMs: Date.now() - start,
        error: deleteError.message || "Cleanup failed",
      };
    }

    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    // Best-effort cleanup if insert succeeded then timed out on delete
    try {
      await supabaseAdmin.from("brand_snapshot_reports").delete().eq("id", id);
    } catch {
      /* ignore */
    }
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Smoke failed",
    };
  }
}

/** Full probe used by cron / deep health: dependencies + draft persist smoke. */
export async function computeDeepHealth(startedAt: number): Promise<HealthCheckResult> {
  const base = await computeDependencyHealth(startedAt);
  const smoke = await runDraftPersistSmoke();
  base.checks.draftPersist = {
    ok: smoke.ok,
    latencyMs: smoke.latencyMs,
    ...(smoke.error ? { error: smoke.error } : {}),
  };

  const allOk = Object.values(base.checks).every((c) => c.ok);
  const criticalOk =
    base.checks.supabase?.ok && base.checks.openai?.ok && base.checks.draftPersist?.ok;

  base.status = allOk ? "healthy" : criticalOk ? "degraded" : "unhealthy";
  base.timestamp = new Date().toISOString();
  return base;
}
