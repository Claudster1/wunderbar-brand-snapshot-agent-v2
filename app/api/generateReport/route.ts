// app/api/generateReport/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { v4 as uuidv4 } from "uuid";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ReportDocument } from "@/components/pdf/ReportDocument";

export async function POST(req: Request) {
  try {
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
      console.error("Upload Error:", uploadError);
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
      console.error("DB Error:", dbError);
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
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Server error", message: err?.message },
      { status: 500 }
    );
  }
}

