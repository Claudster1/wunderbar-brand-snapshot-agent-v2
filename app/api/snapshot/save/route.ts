// app/api/snapshot/save/route.ts
// API route to save Brand Snapshot reports

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      report_id,
      user_name,
      company_name,
      website,
      industry,
      brand_alignment_score,
      pillar_scores,
      insights,
      recommendations,
      summary,
      overall_interpretation,
      opportunities_summary,
      upgrade_cta,
    } = data;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    if (!report_id) {
      return NextResponse.json(
        { error: "Missing required field: report_id" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .insert({
        report_id,
        user_name: user_name || null,
        company_name: company_name || null,
        website: website || null,
        industry: industry || null,
        brand_alignment_score: brand_alignment_score || null,
        pillar_scores: pillar_scores || null,
        insights: insights || null,
        recommendations: recommendations || null,
        summary: summary || null,
        overall_interpretation: overall_interpretation || null,
        opportunities_summary: opportunities_summary || null,
        upgrade_cta: upgrade_cta || null,
      });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, report_id });
  } catch (err: any) {
    console.error("[Snapshot Save API] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save snapshot" },
      { status: 500 }
    );
  }
}

