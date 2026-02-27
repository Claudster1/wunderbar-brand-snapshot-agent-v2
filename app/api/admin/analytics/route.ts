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
    if (view === "crm") {
      return NextResponse.json(await getCrmData(since));
    }

    return NextResponse.json({ error: "Unknown view" }, { status: 400 });
  } catch (err) {
    logger.error("[Admin Analytics]", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
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

// ── CRM ops analytics ──
async function getCrmData(since: string) {
  const sb = supabaseAdmin!;

  const [{ data: inquiries }, { data: tasks }] = await Promise.all([
    sb
      .from("crm_inquiries")
      .select("id, source, status, owner, created_at, first_response_at, last_activity_at")
      .gte("created_at", since)
      .limit(2000),
    sb
      .from("crm_tasks")
      .select("id, status, due_at, assigned_to, inquiry_id")
      .gte("created_at", since)
      .limit(3000),
  ]);

  const inquiryRows = (inquiries as Array<{
    id: string;
    source: string | null;
    status: string;
    owner: string | null;
    created_at: string;
    first_response_at: string | null;
    last_activity_at: string | null;
  }> | null) || [];

  const taskRows = (tasks as Array<{
    id: string;
    status: string;
    due_at: string | null;
    assigned_to: string | null;
    inquiry_id: string | null;
  }> | null) || [];

  const totals = {
    open: 0,
    new: 0,
    inProgress: 0,
    responded: 0,
    closed: 0,
  };

  const sourceMap: Record<
    string,
    { source: string; total: number; responded: number; closed: number; open: number }
  > = {};

  const responseHours: number[] = [];
  let respondedWithFirstResponse = 0;
  let slaBreaches = 0;

  for (const inquiry of inquiryRows) {
    if (inquiry.status === "new") {
      totals.new += 1;
      totals.open += 1;
    } else if (inquiry.status === "in_progress") {
      totals.inProgress += 1;
      totals.open += 1;
    } else if (inquiry.status === "responded") {
      totals.responded += 1;
    } else if (inquiry.status === "closed") {
      totals.closed += 1;
    }

    const sourceKey = inquiry.source || "unknown";
    if (!sourceMap[sourceKey]) {
      sourceMap[sourceKey] = {
        source: sourceKey,
        total: 0,
        responded: 0,
        closed: 0,
        open: 0,
      };
    }
    sourceMap[sourceKey].total += 1;
    if (inquiry.status === "responded") sourceMap[sourceKey].responded += 1;
    if (inquiry.status === "closed") sourceMap[sourceKey].closed += 1;
    if (inquiry.status === "new" || inquiry.status === "in_progress") sourceMap[sourceKey].open += 1;

    if (inquiry.first_response_at) {
      const hours =
        (new Date(inquiry.first_response_at).getTime() -
          new Date(inquiry.created_at).getTime()) /
        (1000 * 60 * 60);
      if (Number.isFinite(hours) && hours >= 0) {
        responseHours.push(hours);
        respondedWithFirstResponse += 1;
        if (hours > 24) slaBreaches += 1;
      }
    } else if (inquiry.status === "new" || inquiry.status === "in_progress") {
      // Open inquiries older than 24h with no first response count as SLA breaches.
      const openHours =
        (Date.now() - new Date(inquiry.created_at).getTime()) / (1000 * 60 * 60);
      if (openHours > 24) slaBreaches += 1;
    }
  }

  const ownerMap: Record<
    string,
    { owner: string; openInquiries: number; inProgressInquiries: number; overdueTasks: number }
  > = {};

  for (const inquiry of inquiryRows) {
    const owner = (inquiry.owner || "unassigned").trim() || "unassigned";
    if (!ownerMap[owner]) {
      ownerMap[owner] = {
        owner,
        openInquiries: 0,
        inProgressInquiries: 0,
        overdueTasks: 0,
      };
    }
    if (inquiry.status === "new" || inquiry.status === "in_progress") ownerMap[owner].openInquiries += 1;
    if (inquiry.status === "in_progress") ownerMap[owner].inProgressInquiries += 1;
  }

  for (const task of taskRows) {
    const owner = (task.assigned_to || "unassigned").trim() || "unassigned";
    if (!ownerMap[owner]) {
      ownerMap[owner] = {
        owner,
        openInquiries: 0,
        inProgressInquiries: 0,
        overdueTasks: 0,
      };
    }
    if (
      task.status === "open" &&
      task.due_at &&
      new Date(task.due_at).getTime() < Date.now()
    ) {
      ownerMap[owner].overdueTasks += 1;
    }
  }

  const sourceBreakdown = Object.values(sourceMap).sort((a, b) => b.total - a.total);
  const ownerWorkload = Object.values(ownerMap).sort(
    (a, b) =>
      b.openInquiries +
      b.inProgressInquiries +
      b.overdueTasks -
      (a.openInquiries + a.inProgressInquiries + a.overdueTasks),
  );

  const medianFirstResponseHours = median(responseHours);
  const evaluatedForSla = Math.max(
    respondedWithFirstResponse +
      inquiryRows.filter((i) => !i.first_response_at && (i.status === "new" || i.status === "in_progress")).length,
    1,
  );
  const slaBreachRate = (slaBreaches / evaluatedForSla) * 100;

  return {
    crm: {
      totals,
      responseMetrics: {
        respondedWithFirstResponse,
        medianFirstResponseHours,
        slaBreaches,
        slaBreachRate,
      },
      sourceBreakdown,
      ownerWorkload,
    },
  };
}
