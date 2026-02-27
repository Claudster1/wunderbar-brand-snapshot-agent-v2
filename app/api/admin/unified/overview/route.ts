import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminSession";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ContactRow = {
  id: string;
  email: string | null;
  company_name: string | null;
};

type InquiryRow = {
  id: string;
  source: string;
  status: string;
  owner: string | null;
  contact_id: string | null;
  created_at: string;
  updated_at: string;
  first_response_at: string | null;
  resolved_at: string | null;
};

type TaskRow = {
  id: string;
  inquiry_id: string | null;
  contact_id: string | null;
  title: string;
  status: string;
  assigned_to: string | null;
  due_at: string | null;
  created_at: string;
  updated_at: string;
};

type ActivityRow = {
  id: string;
  inquiry_id: string | null;
  contact_id: string | null;
  activity_type: string;
  body: string | null;
  created_by: string | null;
  created_at: string;
};

type AnalyticsRow = {
  id: string;
  event_name: string;
  event_category: string;
  user_email: string | null;
  page_path: string | null;
  utm_source: string | null;
  ai_source: string | null;
  is_ai_referral: boolean | null;
  created_at: string;
};

type UnifiedEventRow = {
  source: string;
  source_event_id: string;
  event_type: string;
  direction: "inbound" | "outbound" | "neutral";
  channel: string;
  contact_id: string | null;
  inquiry_id: string | null;
  owner: string | null;
  account_key: string | null;
  user_email: string | null;
  occurred_at: string;
  metadata: Record<string, unknown>;
};

function getEmailDomain(email: string | null): string | null {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@")[1]?.trim().toLowerCase();
  return domain || null;
}

function getAccountKey(companyName: string | null, email: string | null): string | null {
  const company = companyName?.trim();
  if (company) return company.toLowerCase();
  return getEmailDomain(email);
}

async function buildUnifiedEvents(since: string): Promise<UnifiedEventRow[]> {
  const sb = supabaseAdmin!;
  const [{ data: contacts }, { data: inquiries }, { data: tasks }, { data: activities }, { data: analytics }] = await Promise.all([
    sb.from("crm_contacts").select("id, email, company_name"),
    sb
      .from("crm_inquiries")
      .select("id, source, status, owner, contact_id, created_at, updated_at, first_response_at, resolved_at")
      .gte("created_at", since)
      .limit(5000),
    sb
      .from("crm_tasks")
      .select("id, inquiry_id, contact_id, title, status, assigned_to, due_at, created_at, updated_at")
      .gte("created_at", since)
      .limit(5000),
    sb
      .from("crm_activities")
      .select("id, inquiry_id, contact_id, activity_type, body, created_by, created_at")
      .gte("created_at", since)
      .limit(5000),
    sb
      .from("analytics_events" as never)
      .select("id, event_name, event_category, user_email, page_path, utm_source, ai_source, is_ai_referral, created_at")
      .gte("created_at", since)
      .limit(5000),
  ]);

  const contactMap = new Map<string, ContactRow>(
    ((contacts as ContactRow[] | null) || []).map((row) => [row.id, row]),
  );

  const events: UnifiedEventRow[] = [];
  const inquiryRows = (inquiries as InquiryRow[] | null) || [];
  const taskRows = (tasks as TaskRow[] | null) || [];
  const activityRows = (activities as ActivityRow[] | null) || [];
  const analyticsRows = (analytics as AnalyticsRow[] | null) || [];

  for (const row of inquiryRows) {
    const contact = row.contact_id ? contactMap.get(row.contact_id) : null;
    const userEmail = contact?.email || null;
    const accountKey = getAccountKey(contact?.company_name || null, userEmail);
    events.push({
      source: "crm_inquiry",
      source_event_id: `${row.id}:created`,
      event_type: "inquiry_created",
      direction: "inbound",
      channel: row.source || "unknown",
      contact_id: row.contact_id,
      inquiry_id: row.id,
      owner: row.owner,
      account_key: accountKey,
      user_email: userEmail,
      occurred_at: row.created_at,
      metadata: { status: row.status },
    });

    if (row.first_response_at) {
      const responseHours =
        (new Date(row.first_response_at).getTime() - new Date(row.created_at).getTime()) /
        (1000 * 60 * 60);
      events.push({
        source: "crm_inquiry",
        source_event_id: `${row.id}:first_response`,
        event_type: "inquiry_responded",
        direction: "outbound",
        channel: "workflow",
        contact_id: row.contact_id,
        inquiry_id: row.id,
        owner: row.owner,
        account_key: accountKey,
        user_email: userEmail,
        occurred_at: row.first_response_at,
        metadata: { response_hours: Number.isFinite(responseHours) ? responseHours : null },
      });
    }

    if (row.resolved_at) {
      events.push({
        source: "crm_inquiry",
        source_event_id: `${row.id}:resolved`,
        event_type: "inquiry_closed",
        direction: "neutral",
        channel: "workflow",
        contact_id: row.contact_id,
        inquiry_id: row.id,
        owner: row.owner,
        account_key: accountKey,
        user_email: userEmail,
        occurred_at: row.resolved_at,
        metadata: {},
      });
    }
  }

  for (const row of taskRows) {
    const contact = row.contact_id ? contactMap.get(row.contact_id) : null;
    const userEmail = contact?.email || null;
    const accountKey = getAccountKey(contact?.company_name || null, userEmail);
    events.push({
      source: "crm_task",
      source_event_id: `${row.id}:created`,
      event_type: "task_created",
      direction: "neutral",
      channel: "workflow",
      contact_id: row.contact_id,
      inquiry_id: row.inquiry_id,
      owner: row.assigned_to,
      account_key: accountKey,
      user_email: userEmail,
      occurred_at: row.created_at,
      metadata: { title: row.title, status: row.status, due_at: row.due_at },
    });

    if (row.status === "done" || row.status === "cancelled") {
      events.push({
        source: "crm_task",
        source_event_id: `${row.id}:${row.status}`,
        event_type: row.status === "done" ? "task_completed" : "task_cancelled",
        direction: row.status === "done" ? "outbound" : "neutral",
        channel: "workflow",
        contact_id: row.contact_id,
        inquiry_id: row.inquiry_id,
        owner: row.assigned_to,
        account_key: accountKey,
        user_email: userEmail,
        occurred_at: row.updated_at,
        metadata: { title: row.title },
      });
    }
  }

  for (const row of activityRows) {
    const contact = row.contact_id ? contactMap.get(row.contact_id) : null;
    const userEmail = contact?.email || null;
    const accountKey = getAccountKey(contact?.company_name || null, userEmail);
    const direction: "inbound" | "outbound" | "neutral" = /email|reply|sent|called|follow/i.test(row.activity_type)
      ? "outbound"
      : "neutral";
    events.push({
      source: "crm_activity",
      source_event_id: row.id,
      event_type: row.activity_type || "activity_logged",
      direction,
      channel: "activity",
      contact_id: row.contact_id,
      inquiry_id: row.inquiry_id,
      owner: row.created_by,
      account_key: accountKey,
      user_email: userEmail,
      occurred_at: row.created_at,
      metadata: { body: row.body },
    });
  }

  for (const row of analyticsRows) {
    const accountKey = getAccountKey(null, row.user_email);
    events.push({
      source: "analytics_event",
      source_event_id: row.id,
      event_type: row.event_name,
      direction: "neutral",
      channel: "web",
      contact_id: null,
      inquiry_id: null,
      owner: null,
      account_key: accountKey,
      user_email: row.user_email,
      occurred_at: row.created_at,
      metadata: {
        category: row.event_category,
        page_path: row.page_path,
        utm_source: row.utm_source,
        ai_source: row.ai_source,
        is_ai_referral: row.is_ai_referral,
      },
    });
  }

  return events;
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return auth.response;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as { days?: number };
  const days = Math.min(Math.max(Number(body.days) || 30, 1), 365);
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const events = await buildUnifiedEvents(since);
  if (events.length === 0) {
    return NextResponse.json({ synced: 0, since, message: "No events to sync." });
  }

  const { error } = await supabaseAdmin
    .from("crm_events")
    .upsert(events, { onConflict: "source,source_event_id" });
  if (error) {
    return NextResponse.json({ error: "Failed to sync unified events." }, { status: 500 });
  }

  return NextResponse.json({ synced: events.length, since });
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return auth.response;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 30, 1), 365);
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("crm_events")
    .select("id, event_type, direction, channel, owner, account_key, user_email, contact_id, occurred_at, metadata")
    .gte("occurred_at", since)
    .order("occurred_at", { ascending: false })
    .limit(4000);

  if (error) {
    return NextResponse.json({ error: "Failed to load unified overview." }, { status: 500 });
  }

  const events = data || [];
  const last24h = events.filter((row) => row.occurred_at >= since24h);
  const inbound24h = last24h.filter((row) => row.direction === "inbound").length;
  const outbound24h = last24h.filter((row) => row.direction === "outbound").length;
  const web24h = last24h.filter((row) => row.channel === "web").length;
  const uniqueContacts30d = new Set(
    events
      .map((row) => row.contact_id || row.user_email)
      .filter((value): value is string => typeof value === "string" && value.length > 0),
  ).size;
  const engagedAccounts30d = Object.values(
    events.reduce<Record<string, number>>((acc, row) => {
      const key = (row.account_key || "").trim().toLowerCase();
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  ).filter((count) => count >= 3).length;

  const responseHours = events
    .filter((row) => row.event_type === "inquiry_responded")
    .map((row) => Number((row.metadata as { response_hours?: number })?.response_hours))
    .filter((value) => Number.isFinite(value) && value >= 0);
  responseHours.sort((a, b) => a - b);
  const responseMedian =
    responseHours.length === 0
      ? 0
      : responseHours.length % 2 === 0
        ? (responseHours[responseHours.length / 2 - 1] + responseHours[responseHours.length / 2]) / 2
        : responseHours[Math.floor(responseHours.length / 2)];

  const ownerActivity = Object.values(
    events.reduce<Record<string, { owner: string; total: number; inbound: number; outbound: number }>>(
      (acc, row) => {
        const owner = (row.owner || "unassigned").trim() || "unassigned";
        if (!acc[owner]) acc[owner] = { owner, total: 0, inbound: 0, outbound: 0 };
        acc[owner].total += 1;
        if (row.direction === "inbound") acc[owner].inbound += 1;
        if (row.direction === "outbound") acc[owner].outbound += 1;
        return acc;
      },
      {},
    ),
  )
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return NextResponse.json({
    overview: {
      totals: {
        events24h: last24h.length,
        inbound24h,
        outbound24h,
        web24h,
        uniqueContacts30d,
        engagedAccounts30d,
      },
      pipeline: {
        inboundCreated30d: events.filter((row) => row.event_type === "inquiry_created").length,
        outboundTouches30d: events.filter((row) => row.direction === "outbound").length,
        webHighIntent30d: events.filter((row) =>
          ["UPGRADE_CLICKED", "RESULTS_VIEWED", "SNAPSHOT_COMPLETED", "BLUEPRINT_STARTED", "BLUEPRINT_COMPLETED"].includes(row.event_type),
        ).length,
        medianFirstResponseHours30d: responseMedian,
      },
      ownerActivity,
      recent: events.slice(0, 30),
    },
  });
}
