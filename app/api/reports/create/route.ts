// app/api/reports/create/route.ts
// API route to create a new WunderBrand Snapshot™ report

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import { generateReport, type ReportData } from "@/src/services/reportGenerator";

export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "reports-create", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const body = await req.json();
    const { userId, report } = body;

    if (!report || !report.brandAlignmentScore) {
      return NextResponse.json(
        { error: "Missing required report data" },
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
      brandAlignmentScore: report.brandAlignmentScore,
      pillarScores: report.pillarScores || {},
      userContext: report.userContext || {},
    };

    const fullReport = generateReport(reportData);

    // Generate unique report ID
    const report_id = crypto.randomUUID();

    // Prepare insights object
    const insights = report.insights || {
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
        report_id,
        user_name: report.userName || null,
        user_email: report.userEmail || null,
        brand_alignment_score: report.brandAlignmentScore,
        pillar_scores: report.pillarScores || {},
        insights,
        recommendations: report.recommendations || [],
        website_notes: report.websiteNotes || null,
        summary: fullReport.summary,
        overall_interpretation: fullReport.overallInterpretation,
        opportunities_summary: fullReport.opportunitiesSummary,
        upgrade_cta: fullReport.upgradeCTA,
      });

    if (insertError) {
      logger.error("Supabase insert error", {
        error: insertError.message,
      });
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ reportId: report_id, success: true });
  } catch (err: any) {
    logger.error("[Reports Create API] Error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: err?.message || "Failed to create report" },
      { status: 500 }
    );
  }
}

