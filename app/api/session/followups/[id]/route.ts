// GET /api/session/followups/[id] — Get full detail for a single follow-up (includes transcript)
//
// Requires ADMIN_API_KEY in the Authorization header.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get("authorization") || "";
  const apiKey = authHeader.replace("Bearer ", "").trim();

  if (!ADMIN_API_KEY || apiKey !== ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const { id } = params;

  const { data, error } = await supabaseAdmin
    .from("session_followups")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Follow-up not found." }, { status: 404 });
  }

  return NextResponse.json({ followup: data });
}
