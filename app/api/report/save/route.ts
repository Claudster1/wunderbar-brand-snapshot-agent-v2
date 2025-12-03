import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reportId, email, name, data } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    if (!reportId || !email || !name || !data) {
      return NextResponse.json(
        { error: "Missing required fields: reportId, email, name, or data" },
        { status: 400 }
      );
    }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase admin client not configured" },
      { status: 500 }
    );
  }

  const { error } = await supabaseAdmin
    .from("brand_snapshot_reports")
    .insert({
      report_id: reportId,
      user_email: email,
      user_name: name,
      brand_alignment_score: data.brandAlignmentScore,
      pillar_scores: data.pillarScores,
      pillar_insights: data.pillarInsights,
      recommendations: data.recommendations,
      website_notes: data.websiteNotes ?? "",
      full_report: data
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[Report Save API] Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save report" },
      { status: 500 }
    );
  }
}

