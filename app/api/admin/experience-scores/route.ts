// GET /api/admin/experience-scores?view=overview|by-tier|responses|testimonials
// Admin-only endpoint for WunderBrand Experience Score™ dashboard data.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function isAuthorized(req: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  const auth = req.headers.get("authorization") || "";
  return auth.replace("Bearer ", "").trim() === ADMIN_API_KEY;
}

function categorize(score: number): "promoter" | "passive" | "detractor" {
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

const TIER_LABELS: Record<string, string> = {
  snapshot: "WunderBrand Snapshot™",
  snapshot_plus: "Snapshot+",
  blueprint: "WunderBrand Blueprint™",
  blueprint_plus: "Blueprint+",
};

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const view = url.searchParams.get("view") || "overview";
  const days = Math.min(Number(url.searchParams.get("days")) || 90, 365);
  const since = new Date(Date.now() - days * 86400000).toISOString();

  try {
    if (view === "overview") {
      return NextResponse.json(await getOverview(since));
    }
    if (view === "by-tier") {
      return NextResponse.json(await getByTier(since));
    }
    if (view === "responses") {
      const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
      return NextResponse.json(await getRecentResponses(since, limit));
    }
    if (view === "testimonials") {
      const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 100);
      return NextResponse.json(await getTestimonials(since, limit));
    }
    if (view === "trend") {
      return NextResponse.json(await getMonthlyTrend());
    }

    return NextResponse.json({ error: "Unknown view" }, { status: 400 });
  } catch (err) {
    logger.error("[Admin Experience Scores]", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}

async function getOverview(since: string) {
  const sb = supabaseAdmin!;

  const { data: rows, error } = await (sb
    .from("experience_survey_responses" as any)
    .select("score, product_tier, created_at")
    .gte("created_at", since) as any);

  if (error) throw error;
  const all = (rows || []) as Array<{ score: number; product_tier: string; created_at: string }>;

  const total = all.length;
  if (total === 0) {
    return {
      overview: {
        totalResponses: 0,
        averageScore: 0,
        netScore: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        promoterPct: 0,
        passivePct: 0,
        detractorPct: 0,
      },
    };
  }

  const sum = all.reduce((s, r) => s + r.score, 0);
  const avg = sum / total;

  let promoters = 0, passives = 0, detractors = 0;
  for (const r of all) {
    const cat = categorize(r.score);
    if (cat === "promoter") promoters++;
    else if (cat === "passive") passives++;
    else detractors++;
  }

  const promoterPct = Math.round((promoters / total) * 100);
  const passivePct = Math.round((passives / total) * 100);
  const detractorPct = Math.round((detractors / total) * 100);
  const netScore = promoterPct - detractorPct;

  return {
    overview: {
      totalResponses: total,
      averageScore: Math.round(avg * 10) / 10,
      netScore,
      promoters,
      passives,
      detractors,
      promoterPct,
      passivePct,
      detractorPct,
    },
  };
}

async function getByTier(since: string) {
  const sb = supabaseAdmin!;

  const { data: rows, error } = await (sb
    .from("experience_survey_responses" as any)
    .select("score, product_tier")
    .gte("created_at", since) as any);

  if (error) throw error;
  const all = (rows || []) as Array<{ score: number; product_tier: string }>;

  const tiers: Record<string, { scores: number[]; promoters: number; passives: number; detractors: number }> = {};

  for (const r of all) {
    const t = r.product_tier;
    if (!tiers[t]) tiers[t] = { scores: [], promoters: 0, passives: 0, detractors: 0 };
    tiers[t].scores.push(r.score);
    const cat = categorize(r.score);
    tiers[t][`${cat}s`]++;
  }

  const byTier = Object.entries(tiers).map(([tier, data]) => {
    const count = data.scores.length;
    const avg = data.scores.reduce((s, v) => s + v, 0) / count;
    const promoterPct = Math.round((data.promoters / count) * 100);
    const detractorPct = Math.round((data.detractors / count) * 100);
    return {
      tier,
      label: TIER_LABELS[tier] || tier,
      count,
      averageScore: Math.round(avg * 10) / 10,
      netScore: promoterPct - detractorPct,
      promoters: data.promoters,
      passives: data.passives,
      detractors: data.detractors,
    };
  });

  byTier.sort((a, b) => b.count - a.count);

  return { byTier };
}

async function getRecentResponses(since: string, limit: number) {
  const sb = supabaseAdmin!;

  const { data: rows, error } = await (sb
    .from("experience_survey_responses" as any)
    .select("id, report_id, user_email, product_tier, score, reason, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(limit) as any);

  if (error) throw error;

  const responses = (rows || []).map((r: any) => ({
    ...r,
    category: categorize(r.score),
    tierLabel: TIER_LABELS[r.product_tier] || r.product_tier,
  }));

  return { responses };
}

async function getTestimonials(since: string, limit: number) {
  const sb = supabaseAdmin!;

  const { data: rows, error } = await (sb
    .from("testimonials" as any)
    .select("id, user_email, product_tier, experience_score, testimonial, display_name, company_name, role_title, permission_to_publish, case_study_interest, status, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(limit) as any);

  if (error) throw error;

  return {
    testimonials: (rows || []).map((r: any) => ({
      ...r,
      tierLabel: TIER_LABELS[r.product_tier] || r.product_tier,
    })),
  };
}

async function getMonthlyTrend() {
  const sb = supabaseAdmin!;

  const sixMonthsAgo = new Date(Date.now() - 180 * 86400000).toISOString();

  const { data: rows, error } = await (sb
    .from("experience_survey_responses" as any)
    .select("score, created_at")
    .gte("created_at", sixMonthsAgo)
    .order("created_at", { ascending: true }) as any);

  if (error) throw error;
  const all = (rows || []) as Array<{ score: number; created_at: string }>;

  const buckets: Record<string, number[]> = {};
  for (const r of all) {
    const month = r.created_at.slice(0, 7);
    if (!buckets[month]) buckets[month] = [];
    buckets[month].push(r.score);
  }

  const trend = Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, scores]) => {
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      const promoters = scores.filter((s) => s >= 9).length;
      const detractors = scores.filter((s) => s <= 6).length;
      const pPct = Math.round((promoters / scores.length) * 100);
      const dPct = Math.round((detractors / scores.length) * 100);
      return {
        month,
        averageScore: Math.round(avg * 10) / 10,
        netScore: pPct - dPct,
        count: scores.length,
      };
    });

  return { trend };
}
