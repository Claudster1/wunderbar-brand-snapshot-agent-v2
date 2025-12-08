// app/api/save-report/route.ts
// API route to save Brand Snapshot report and return redirect URL

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateScores } from "@/src/lib/brandSnapshotEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extract data from request
    const {
      brandAlignmentScore,
      pillarScores,
      pillarInsights,
      userContext,
      userName,
      email,
      company,
      websiteNotes,
      recommendations,
    } = body;

    if (!brandAlignmentScore || !pillarScores) {
      return NextResponse.json(
        { error: "Missing required fields: brandAlignmentScore, pillarScores" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    // Use centralized engine to calculate scores and generate insights
    const engineResults = calculateScores(pillarScores);

    // Generate unique report ID
    const reportId = crypto.randomUUID();

    // Prepare insights object (use provided or generated from engine)
    const insights = pillarInsights || {
      positioning: engineResults.pillarInsights.positioning.opportunity,
      messaging: engineResults.pillarInsights.messaging.opportunity,
      visibility: engineResults.pillarInsights.visibility.opportunity,
      credibility: engineResults.pillarInsights.credibility.opportunity,
      conversion: engineResults.pillarInsights.conversion.opportunity,
    };

    // Save to database with full dynamic results
    const { error: insertError } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .insert({
        report_id: reportId,
        user_name: userName || null,
        email: email || null,
        company: company || null,
        brand_alignment_score: engineResults.brandAlignmentScore,
        pillar_scores: engineResults.pillarScores,
        pillar_insights: engineResults.pillarInsights, // Full insights with strength, opportunity, action
        recommendations: recommendations || [engineResults.opportunities.map(o => `${o.pillar}: ${o.score}/20`).join(', ')],
        website_notes: websiteNotes || null,
        weakest_pillar: engineResults.weakestPillar.pillar,
        strengths: engineResults.strengths,
        snapshot_upsell: engineResults.snapshotUpsell,
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // Return report ID and redirect URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const redirectUrl = `${baseUrl}/report/${reportId}`;

    return NextResponse.json({
      reportId,
      redirectUrl,
      success: true,
    });
  } catch (err: any) {
    console.error("[Save Report API] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save report" },
      { status: 500 }
    );
  }
}

