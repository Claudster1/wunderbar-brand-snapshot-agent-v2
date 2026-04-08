// app/api/report/pdf/route.tsx
// API route to generate PDF for WunderBrand Snapshot™ reports
// Supports both GET (with reportId) and POST (with inline data)

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import { generatePdfResponseFromReport } from "@/src/pdf/generatePdf";

/**
 * GET handler - Fetch report from Supabase by reportId
 */
export async function GET(request: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(request, { routeId: "report-pdf", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

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
      logger.error("Supabase error", { error: error instanceof Error ? error.message : String(error) });
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

    return generatePdfResponseFromReport(
      data,
      "snapshot",
      `BrandSnapshotReport-${reportId}.pdf`
    );
  } catch (err: unknown) {
    logger.error("PDF generation error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "PDF generation failed." },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Accept inline payload (scores, insights, recommendations, metadata)
 */
export async function POST(request: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(request, { routeId: "report-pdf", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

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
        logger.error("Supabase error", { error: error instanceof Error ? error.message : String(error) });
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

    return generatePdfResponseFromReport(finalData, "snapshot", "BrandSnapshotReport.pdf");
  } catch (err: unknown) {
    logger.error("PDF generation error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "PDF generation failed." },
      { status: 500 }
    );
  }
}

