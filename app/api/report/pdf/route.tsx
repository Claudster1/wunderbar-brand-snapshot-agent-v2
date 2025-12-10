// app/api/report/pdf/route.tsx
// API route to generate PDF for Brand Snapshot reports
// Supports both GET (with reportId) and POST (with inline data)

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import BrandSnapshotPDF from "@/components/BrandSnapshotPDF";

/**
 * Transform database report format to PDF component format
 */
function transformReportData(data: any) {
  const reportData = data.full_report || data;
  
  // Extract pillar scores
  const pillarScores = reportData.pillar_scores || reportData.pillarScores || {
    positioning: reportData.scores?.positioning || 0,
    messaging: reportData.scores?.messaging || 0,
    visibility: reportData.scores?.visibility || 0,
    credibility: reportData.scores?.credibility || 0,
    conversion: reportData.scores?.conversion || 0,
  };

  // Extract pillar insights - handle both old (string) and new (object) formats
  const pillarInsights: Record<string, any> = {};
  const insightsSource = reportData.pillar_insights || reportData.pillarInsights || {};
  
  Object.keys(pillarScores).forEach((pillar) => {
    const insightData = insightsSource[pillar];
    if (typeof insightData === 'string') {
      pillarInsights[pillar] = insightData;
    } else if (insightData && typeof insightData === 'object') {
      pillarInsights[pillar] = insightData;
    } else {
      pillarInsights[pillar] = "No insight available.";
    }
  });

  // Extract color palette
  const colorPalette = reportData.color_palette || reportData.colorPalette || reportData.recommendedPalette || [];

  return {
    user: reportData.user_name || reportData.userName || reportData.user || null,
    userName: reportData.user_name || reportData.userName || "User",
    brandAlignmentScore: reportData.brand_alignment_score || reportData.brandAlignmentScore || 0,
    pillarScores,
    pillarInsights,
    recommendedPalette: colorPalette,
    color_palette: colorPalette,
    colorPalette: colorPalette,
    recommendations: reportData.recommendations || [],
    metadata: reportData.metadata || {},
  };
}

/**
 * GET handler - Fetch report from Supabase by reportId
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("reportId") || searchParams.get("id");

  if (!reportId) {
    return NextResponse.json(
      { error: "Missing report ID. Provide ?reportId=xxx or ?id=xxx" },
      { status: 400 }
    );
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch report data from Supabase
    const { data, error } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Unable to fetch report." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Transform data for PDF component
    const transformedData = transformReportData(data);

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(BrandSnapshotPDF, { reportData: transformedData }) as any
    );

    // Return PDF as response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="BrandSnapshotReport-${reportId}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "PDF generation failed.", message: err?.message },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Accept inline payload (scores, insights, recommendations, metadata)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportId, scores, insights, recommendations, metadata, pillarScores, pillarInsights, colorPalette, recommendedPalette } = body;

    let reportData = null;

    // ---------- 1. Load from Supabase (if a reportId is provided) ----------
    if (reportId && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("brand_snapshot_reports")
        .select("*")
        .eq("report_id", reportId)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        // Continue with inline data if Supabase fetch fails
      } else {
        reportData = data;
      }
    }

    // ---------- 2. Or accept inline payload (scores, insights, etc.) ----------
    const finalData = reportData || {
      brand_alignment_score: scores?.brandAlignmentScore || scores || 0,
      pillar_scores: pillarScores || scores?.pillarScores || {},
      pillar_insights: pillarInsights || insights || {},
      recommendations: recommendations || [],
      color_palette: colorPalette || recommendedPalette || [],
      metadata: metadata || {},
    };

    if (!finalData) {
      return NextResponse.json(
        { error: "No report data found." },
        { status: 400 }
      );
    }

    // Transform data for PDF component
    const transformedData = transformReportData(finalData);

    // ---------- 3. Generate PDF Buffer ----------
    const pdfBuffer = await renderToBuffer(
      React.createElement(BrandSnapshotPDF, { reportData: transformedData }) as any
    );

    // ---------- 4. Return PDF buffer ----------
    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="BrandSnapshotReport.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "PDF generation failed.", message: err?.message },
      { status: 500 }
    );
  }
}

