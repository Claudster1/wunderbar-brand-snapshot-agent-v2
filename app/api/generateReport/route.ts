// app/api/generateReport/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import { v4 as uuidv4 } from "uuid";
import React from "react";

export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "generate-report", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const data = await req.json();
    const {
      userName,
      businessName,
      brandAlignmentScore,
      pillarScores,
      pillarInsights,
      recommendations,
      suggestedPalette,
    } = data;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    // -----------------------------------------------------
    // 1. Generate unique report ID
    // -----------------------------------------------------
    const reportId = uuidv4();
    const fileName = `reports/${reportId}.pdf`;

    // -----------------------------------------------------
    // 2. Render PDF to a buffer
    // -----------------------------------------------------
    const { renderToBuffer } = await import("@react-pdf/renderer");
    const { ReportDocument } = await import("@/components/pdf/ReportDocument");
    const pdfBuffer = await renderToBuffer(
      React.createElement(ReportDocument, {
        userName,
        businessName,
        brandAlignmentScore,
        pillarScores,
        pillarInsights,
        recommendations,
        suggestedPalette,
      }) as any
    );

    // -----------------------------------------------------
    // 3. Store PDF in Supabase Storage
    // -----------------------------------------------------
    const { error: uploadError } = await supabaseAdmin.storage
      .from("brand-snapshot-reports")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      logger.error("Upload Error", { error: uploadError instanceof Error ? uploadError.message : String(uploadError) });
      return NextResponse.json(
        { error: "Failed to upload PDF" },
        { status: 500 }
      );
    }

    const { data: signedUrlData } = await supabaseAdmin.storage
      .from("brand-snapshot-reports")
      .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days

    // -----------------------------------------------------
    // 4. Save structured report metadata in Supabase
    // -----------------------------------------------------
    const { error: dbError } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .insert({
        report_id: reportId,
        user_name: userName,
        email: null,
        company: businessName,
        brand_alignment_score: brandAlignmentScore,
        pillar_scores: pillarScores,
        pillar_insights: pillarInsights,
        recommendations: recommendations,
        color_palette: suggestedPalette,
        full_report: {
          userName,
          businessName,
          brandAlignmentScore,
          pillarScores,
          pillarInsights,
          recommendations,
          suggestedPalette,
        },
        pdf_url: signedUrlData?.signedUrl || null,
      });

    if (dbError) {
      logger.error("DB Error", { error: dbError instanceof Error ? dbError.message : String(dbError) });
      return NextResponse.json(
        { error: "Failed to save report" },
        { status: 500 }
      );
    }

    // -----------------------------------------------------
    // 5. Return report ID + PDF URL to frontend
    // -----------------------------------------------------
    return NextResponse.json({
      reportId,
      pdfUrl: signedUrlData?.signedUrl,
    });
  } catch (err: any) {
    logger.error("API Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Server error", message: err?.message },
      { status: 500 }
    );
  }
}

