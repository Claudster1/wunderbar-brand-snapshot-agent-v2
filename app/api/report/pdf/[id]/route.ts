// app/api/report/pdf/[id]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import ReportDocument from "@/components/pdf/ReportDocument";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const plus = url.searchParams.get("plus") === "1";

    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)!
    );

    const table = plus ? "brand_snapshot_plus_reports" : "brand_snapshot_reports";

    const { data: report, error } = await supabase
      .from(table)
      .select("*")
      .eq("report_id", id)
      .single();

    if (error || !report) {
      return NextResponse.json(
        { error: "Report not found." },
        { status: 404 }
      );
    }

    // Transform report data for PDF component
    const transformReportForPdf = (data: any, isPlus: boolean) => {
      if (isPlus) {
        // Snapshot+ report format
        return {
          userName: data.user_name || "User",
          businessName: data.business_name || data.company || "",
          brandAlignmentScore: data.brand_alignment_score || 0,
          pillarScores: data.pillar_scores || {},
          pillarInsights: data.pillar_insights || {},
          recommendations: Array.isArray(data.recommendations) 
            ? data.recommendations 
            : [],
          suggestedPalette: data.enriched_color_palette || data.color_palette || [],
          persona: data.enriched_persona || data.persona || "",
          archetype: data.enriched_archetype || data.archetype || "",
          brandVoice: data.enriched_voice || {},
          opportunitiesMap: data.opportunities_map || "",
          roadmap30: data.roadmap_30 || "",
          roadmap60: data.roadmap_60 || "",
          roadmap90: data.roadmap_90 || "",
          isPlus: true,
        };
      } else {
        // Standard report format
        return {
          userName: data.user_name || "User",
          businessName: data.company || data.business_name || "",
          brandAlignmentScore: data.brand_alignment_score || 0,
          pillarScores: data.pillar_scores || {},
          pillarInsights: data.pillar_insights || {},
          recommendations: Array.isArray(data.recommendations)
            ? data.recommendations
            : data.recommendations && typeof data.recommendations === 'object'
            ? Object.values(data.recommendations).filter((r: any) => typeof r === 'string')
            : [],
          suggestedPalette: data.color_palette || [],
          persona: data.persona || "",
          archetype: data.archetype || "",
          isPlus: false,
        };
      }
    };

    const pdfData = transformReportForPdf(report, plus);

    // Render PDF using renderToBuffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(ReportDocument, { ...pdfData, report, isPlus: plus })
    );

    const filename = plus
      ? `SnapshotPlus_Report_${id}.pdf`
      : `BrandSnapshot_Report_${id}.pdf`;

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF." },
      { status: 500 }
    );
  }
}

