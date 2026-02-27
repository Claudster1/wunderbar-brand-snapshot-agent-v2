import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function isAuthorized(req: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  const auth = req.headers.get("authorization") || "";
  return auth.replace("Bearer ", "").trim() === ADMIN_API_KEY;
}

function parseOwnerOptionsFromEnv(): string[] {
  const raw = process.env.CRM_OWNER_SLACK_MAP_JSON?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.keys(parsed)
      .map((key) => key.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const source = url.searchParams.get("source");
  const owner = (url.searchParams.get("owner") || "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

  let query = supabaseAdmin
    .from("crm_inquiries")
    .select(
      `
      id,
      source,
      status,
      priority,
      subject,
      message,
      transcript,
      owner,
      first_response_at,
      resolved_at,
      last_activity_at,
      created_at,
      updated_at,
      crm_contacts (
        id,
        email,
        phone,
        full_name,
        company_name
      )
    `,
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== "all") query = query.eq("status", status);
  if (source && source !== "all") query = query.eq("source", source);
  if (owner && owner !== "all") {
    if (owner === "unassigned") query = query.or("owner.is.null,owner.eq.\"\"");
    else query = query.eq("owner", owner);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to fetch inquiries." }, { status: 500 });
  }

  const [newRes, inProgressRes, responded7dRes, staleRes, overdueTasksRes] = await Promise.all([
    supabaseAdmin.from("crm_inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabaseAdmin
      .from("crm_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabaseAdmin
      .from("crm_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "responded")
      .gte("updated_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabaseAdmin
      .from("crm_inquiries")
      .select("id", { count: "exact", head: true })
      .in("status", ["new", "in_progress"])
      .lt("last_activity_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabaseAdmin
      .from("crm_tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .lt("due_at", new Date().toISOString()),
  ]);

  const newCount = newRes.count ?? 0;
  const inProgressCount = inProgressRes.count ?? 0;

  const summary = {
    total_open: newCount + inProgressCount,
    new_count: newCount,
    in_progress_count: inProgressCount,
    responded_7d: responded7dRes.count ?? 0,
    stale_count: staleRes.count ?? 0,
    overdue_tasks: overdueTasksRes.count ?? 0,
  };

  const ownerOptions = Array.from(
    new Set([
      ...parseOwnerOptionsFromEnv(),
      ...((data || [])
        .map((inquiry) => inquiry.owner)
        .filter((value): value is string => !!value && value.trim().length > 0)),
    ]),
  ).sort((a, b) => a.localeCompare(b));

  return NextResponse.json({
    inquiries: data || [],
    count: data?.length || 0,
    summary,
    analytics: summary,
    ownerOptions,
  });
}
