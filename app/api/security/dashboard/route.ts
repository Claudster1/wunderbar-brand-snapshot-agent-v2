// app/api/security/dashboard/route.ts
// Returns a summary of recent security events for monitoring dashboards.
// Protected: requires ADMIN_API_KEY header to access.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // ─── Auth: require admin API key ───
  const adminKey = process.env.ADMIN_API_KEY;
  const provided = req.headers.get("x-admin-key") || new URL(req.url).searchParams.get("key");

  if (!adminKey || provided !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Last 24 hours summary by event type
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: events } = await (supabaseAdmin as any)
      .from("security_events")
      .select("event_type, ip_address, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);

    const eventList = (events || []) as Array<{
      event_type: string;
      ip_address: string | null;
      created_at: string;
    }>;

    // Count by event type
    const byType: Record<string, number> = {};
    const byIp: Record<string, number> = {};
    for (const e of eventList) {
      byType[e.event_type] = (byType[e.event_type] || 0) + 1;
      if (e.ip_address) {
        byIp[e.ip_address] = (byIp[e.ip_address] || 0) + 1;
      }
    }

    // Top offending IPs
    const topIps = Object.entries(byIp)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    // Recent reports count
    const { count: reportsToday } = await (supabaseAdmin as any)
      .from("brand_snapshot_reports")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);

    const { count: verifiedToday } = await (supabaseAdmin as any)
      .from("brand_snapshot_reports")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since)
      .eq("email_verified", true);

    return NextResponse.json({
      period: "last_24h",
      since,
      security: {
        totalEvents: eventList.length,
        byType,
        topIps,
        mostRecent: eventList.slice(0, 5).map((e) => ({
          type: e.event_type,
          ip: e.ip_address,
          at: e.created_at,
        })),
      },
      usage: {
        reportsCreated: reportsToday || 0,
        reportsVerified: verifiedToday || 0,
      },
    });
  } catch (err) {
    logger.error("[Security Dashboard] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
