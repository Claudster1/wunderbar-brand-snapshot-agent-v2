// GET /api/admin/analytics?view=funnel|ai-traffic|attribution|events
// Admin-only endpoint serving analytics dashboard data from Supabase.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function isAuthorized(req: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  const auth = req.headers.get("authorization") || "";
  return auth.replace("Bearer ", "").trim() === ADMIN_API_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const view = url.searchParams.get("view") || "funnel";
  const days = Math.min(Number(url.searchParams.get("days")) || 30, 90);
  const since = new Date(Date.now() - days * 86400000).toISOString();

  try {
    if (view === "funnel") {
      return NextResponse.json(await getFunnelData(since));
    }
    if (view === "ai-traffic") {
      return NextResponse.json(await getAiTrafficData(since));
    }
    if (view === "attribution") {
      return NextResponse.json(await getAttributionData(since));
    }
    if (view === "events") {
      const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 500);
      return NextResponse.json(await getRecentEvents(since, limit));
    }

    return NextResponse.json({ error: "Unknown view" }, { status: 400 });
  } catch (err) {
    logger.error("[Admin Analytics]", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}

// ── Funnel data ──
async function getFunnelData(since: string) {
  const sb = supabaseAdmin!;

  // Count events by name for funnel stages
  const stages = [
    "SNAPSHOT_STARTED",
    "SNAPSHOT_COMPLETED",
    "RESULTS_VIEWED",
    "UPGRADE_CLICKED",
    "UPGRADE_NUDGE_CLICKED",
    "PDF_DOWNLOADED",
    "BLUEPRINT_STARTED",
    "BLUEPRINT_COMPLETED",
  ];

  const counts: Record<string, number> = {};
  for (const stage of stages) {
    const { count } = await sb
      .from("analytics_events" as any)
      .select("id", { count: "exact", head: true })
      .eq("event_name", stage)
      .gte("created_at", since);
    counts[stage] = count ?? 0;
  }

  // Also get unique users per stage (by anonymous_id)
  const uniqueCounts: Record<string, number> = {};
  for (const stage of stages) {
    const { data } = await sb
      .from("analytics_events" as any)
      .select("anonymous_id")
      .eq("event_name", stage)
      .gte("created_at", since);
    const unique = new Set((data as any[] || []).map((r: any) => r.anonymous_id).filter(Boolean));
    uniqueCounts[stage] = unique.size;
  }

  return { funnel: { totalEvents: counts, uniqueVisitors: uniqueCounts } };
}

// ── AI traffic data ──
async function getAiTrafficData(since: string) {
  const sb = supabaseAdmin!;

  // AI attributions
  const { data: aiSessions } = await sb
    .from("session_attribution" as any)
    .select("ai_source, user_email, report_id, landing_page, created_at")
    .eq("is_ai_referral", true)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(200);

  // Group by AI source
  const bySource: Record<string, number> = {};
  for (const row of (aiSessions as any[] || [])) {
    const src = row.ai_source || "unknown";
    bySource[src] = (bySource[src] || 0) + 1;
  }

  // Total attributions for comparison
  const { count: totalSessions } = await sb
    .from("session_attribution" as any)
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);

  // AI events that led to conversions
  const { data: aiConversions } = await sb
    .from("analytics_events" as any)
    .select("event_name, ai_source, user_email")
    .eq("is_ai_referral", true)
    .in("event_name", ["SNAPSHOT_COMPLETED", "UPGRADE_CLICKED", "BLUEPRINT_STARTED"])
    .gte("created_at", since);

  return {
    aiTraffic: {
      totalSessions: totalSessions ?? 0,
      aiSessions: (aiSessions as any[] || []).length,
      bySource,
      aiConversions: (aiConversions as any[] || []).length,
      recentAiVisitors: (aiSessions as any[] || []).slice(0, 20),
    },
  };
}

// ── Attribution / revenue data ──
async function getAttributionData(since: string) {
  const sb = supabaseAdmin!;

  // Top sources by session count
  const { data: sessions } = await sb
    .from("session_attribution" as any)
    .select("utm_source, utm_medium, utm_campaign, referrer_domain, is_ai_referral, ai_source, user_email, report_id")
    .gte("created_at", since)
    .limit(500);

  const rows = (sessions as any[] || []);

  // Group by source
  const bySource: Record<string, { count: number; withEmail: number; withReport: number }> = {};
  for (const row of rows) {
    const key = row.utm_source || row.referrer_domain || "(direct)";
    if (!bySource[key]) bySource[key] = { count: 0, withEmail: 0, withReport: 0 };
    bySource[key].count++;
    if (row.user_email) bySource[key].withEmail++;
    if (row.report_id) bySource[key].withReport++;
  }

  // Sort by count descending
  const sorted = Object.entries(bySource)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .map(([source, stats]) => ({ source, ...stats }));

  // UTM campaign breakdown
  const byCampaign: Record<string, number> = {};
  for (const row of rows) {
    if (row.utm_campaign) {
      byCampaign[row.utm_campaign] = (byCampaign[row.utm_campaign] || 0) + 1;
    }
  }

  return {
    attribution: {
      totalSessions: rows.length,
      topSources: sorted,
      byCampaign,
    },
  };
}

// ── Recent events feed ──
async function getRecentEvents(since: string, limit: number) {
  const sb = supabaseAdmin!;

  const { data } = await sb
    .from("analytics_events" as any)
    .select("id, event_name, event_category, user_email, anonymous_id, is_ai_referral, ai_source, utm_source, ab_test_id, ab_variant, page_path, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { events: data || [] };
}
