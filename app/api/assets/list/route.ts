// GET /api/assets/list?email=xxx&tier=yyy
// Returns uploaded assets for a user + tier, plus remaining upload slots.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const MAX_FILES: Record<string, number> = { blueprint: 3, "blueprint-plus": 10 };

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const tier = req.nextUrl.searchParams.get("tier");

  if (!email || !tier || !MAX_FILES[tier]) {
    return NextResponse.json({ error: "Missing email or valid tier" }, { status: 400 });
  }

  const sb = supabaseServer();
  const { data, error } = await sb
    .from("brand_asset_uploads")
    .select("id, file_name, file_type, file_size, asset_category, analysis, created_at")
    .eq("user_email", email.toLowerCase())
    .eq("tier", tier)
    .order("created_at", { ascending: true });

  if (error) {
    logger.error("[Asset List]", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Failed to fetch assets." }, { status: 500 });
  }

  return NextResponse.json({
    assets: data || [],
    maxFiles: MAX_FILES[tier],
    remaining: MAX_FILES[tier] - (data?.length ?? 0),
  });
}
