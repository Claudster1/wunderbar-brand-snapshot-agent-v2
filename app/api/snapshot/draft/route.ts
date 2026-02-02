// app/api/snapshot/draft/route.ts
// API route to create a draft snapshot report

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userEmail = body.userEmail;

    // Use server-side UUID generation
    const reportId = randomUUID();
    const supabase = supabaseServer();
    
    const { data, error } = await supabase
      .from("brand_snapshot_reports")
      .insert({
        id: reportId,
        user_email: userEmail || null,
        brand_name: "Draft",
        brand_alignment_score: 0,
        pillar_scores: {} as any,
        primary_pillar: "positioning",
        context_coverage: 0,
        snapshot_stage: "in_progress",
        status: "draft",
        last_step: "start",
        progress: {} as any,
      } as any)
      .select("id")
      .single();

    if (error) {
      console.error("[Snapshot Draft API] Error:", error);
      return NextResponse.json(
        { error: "Failed to create draft report", details: error.message },
        { status: 500 }
      );
    }

    const row = data as { id?: string; report_id?: string } | null;
    return NextResponse.json({ reportId: row?.report_id ?? row?.id ?? reportId });
  } catch (err: any) {
    console.error("[Snapshot Draft API] Error:", err);
    return NextResponse.json(
      { error: "Failed to create draft report" },
      { status: 500 }
    );
  }
}
