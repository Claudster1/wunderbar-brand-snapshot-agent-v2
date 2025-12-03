// app/api/report/save/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured. Please set SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const reportData = await req.json();

    // Validate required fields
    if (!reportData.user?.email) {
      return NextResponse.json(
        { error: "Missing required field: user.email" },
        { status: 400 }
      );
    }

    // Generate a unique report ID if not provided
    const reportId = reportData.reportId || `report-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Prepare data for Supabase
    const { data, error } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .insert({
        report_id: reportId,
        user_name: reportData.user?.firstName 
          ? `${reportData.user.firstName} ${reportData.user.lastName || ''}`.trim()
          : reportData.userName || 'Unknown',
        email: reportData.user.email,
        company_name: reportData.user?.companyName || null,
        industry: reportData.user?.industry || null,
        brand_alignment_score: reportData.scores?.brandAlignmentScore || 0,
        pillar_scores: reportData.scores || {},
        pillar_insights: reportData.fullReport || {},
        recommendations: reportData.fullReport?.recommendations || [],
        website_notes: reportData.fullReport?.websiteNotes || null,
        summary: reportData.summary || null,
        opt_in: reportData.optIn || false,
        full_report: reportData, // Store complete JSON for flexibility
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[Report Save API] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save report", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reportId: reportId,
      id: data.id,
      message: "Report saved successfully",
    });
  } catch (err: any) {
    console.error("[Report Save API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to save report", message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

