// app/api/save-report/route.ts
// API route to save Brand Snapshot report and return redirect URL

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateReport, type ReportData } from "@/src/services/reportGenerator";

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

    // Generate full report using reportGenerator
    const reportData: ReportData = {
      brandAlignmentScore,
      pillarScores,
      userContext: userContext || {},
    };

    const fullReport = generateReport(reportData);

    // Generate unique report ID
    const reportId = crypto.randomUUID();

    // Prepare insights object (use provided or generated)
    const insights = pillarInsights || {
      positioning: fullReport.pillars.positioning.insight,
      messaging: fullReport.pillars.messaging.insight,
      visibility: fullReport.pillars.visibility.insight,
      credibility: fullReport.pillars.credibility.insight,
      conversion: fullReport.pillars.conversion.insight,
    };

    // Save to database
    const { error: insertError } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .insert({
        report_id: reportId,
        user_name: userName || null,
        email: email || null,
        company: company || null,
        brand_alignment_score: brandAlignmentScore,
        pillar_scores: pillarScores,
        pillar_insights: insights,
        recommendations: recommendations || (fullReport.opportunitiesSummary ? [fullReport.opportunitiesSummary] : []),
        website_notes: websiteNotes || null,
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

