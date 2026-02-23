// GET /api/cron/cleanup
// Weekly cron job to purge stale data:
//   1. Shared links expired 30+ days ago
//   2. Abandoned snapshot drafts older than 90 days (never completed)
//   3. Expired refresh entitlements older than 1 year
//
// Runs via Vercel Cron, authenticated by CRON_SECRET.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function verifyCronAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { task: string; deleted: number; error?: string }[] = [];

  let supabase: any = null;
  try {
    const mod = await import("@/lib/supabase-admin");
    supabase = mod.supabaseAdmin;
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  // ─── 1. Expired shared links (30+ days past expiry) ────────
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const { data, error } = await (supabase
      .from("shared_links" as any)
      .delete()
      .or(`is_revoked.eq.true,expires_at.lt.${cutoff.toISOString()}`)
      .select("id") as any);

    if (error) throw error;
    const count = data?.length ?? 0;
    results.push({ task: "expired_shared_links", deleted: count });
    if (count > 0) logger.info("[Cleanup] Purged expired shared links", { count });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ task: "expired_shared_links", deleted: 0, error: msg });
    logger.error("[Cleanup] Shared links cleanup failed", { error: msg });
  }

  // ─── 2. Abandoned snapshot drafts (90+ days, never completed) ───
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const { data, error } = await (supabase
      .from("brand_snapshot_reports")
      .delete()
      .eq("snapshot_stage", "in_progress")
      .lt("created_at", cutoff.toISOString())
      .is("brand_alignment_score", null)
      .select("id") as any);

    if (error) throw error;
    const count = data?.length ?? 0;
    results.push({ task: "abandoned_drafts", deleted: count });
    if (count > 0) logger.info("[Cleanup] Purged abandoned drafts", { count });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ task: "abandoned_drafts", deleted: 0, error: msg });
    logger.error("[Cleanup] Abandoned drafts cleanup failed", { error: msg });
  }

  // ─── 3. Expired refresh entitlements (1+ year past expiry) ──
  try {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);

    const { data, error } = await (supabase
      .from("refresh_entitlements" as any)
      .delete()
      .eq("status", "expired")
      .lt("window_end", cutoff.toISOString())
      .select("id") as any);

    if (error) throw error;
    const count = data?.length ?? 0;
    results.push({ task: "expired_entitlements", deleted: count });
    if (count > 0) logger.info("[Cleanup] Purged old expired entitlements", { count });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ task: "expired_entitlements", deleted: 0, error: msg });
    logger.error("[Cleanup] Entitlements cleanup failed", { error: msg });
  }

  const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
  const hasErrors = results.some((r) => r.error);

  logger.info("[Cleanup] Cron complete", { results, totalDeleted });

  return NextResponse.json({
    ok: !hasErrors,
    totalDeleted,
    results,
    timestamp: new Date().toISOString(),
  });
}
