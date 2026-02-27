// GET  /api/admin/followups?status=pending_review&limit=50
// List session follow-ups for the admin review dashboard.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdminApi } from "@/lib/auth/adminSession";

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return auth.response;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "pending_review";
  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);

  let query = supabaseAdmin
    .from("session_followups")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ followups: data || [], count: data?.length || 0 });
}
