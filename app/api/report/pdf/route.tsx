// app/api/report/pdf/route.tsx

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { renderToBuffer } from "@react-pdf/renderer";
import BrandSnapshotPDF from "@/components/BrandSnapshotPDF";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch report data from Supabase
    const { data, error } = await supabase
      .from("brand_snapshot_reports")
      .select("*")
      .eq("report_id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Transform the data to match PDF component expectations
    const reportData = data.full_report || data;
    const transformedData = {
      userName:
        reportData.user?.firstName && reportData.user?.lastName
          ? `${reportData.user.firstName} ${reportData.user.lastName}`.trim()
          : reportData.user?.firstName || "User",
      brandAlignmentScore:
        reportData.brandAlignmentScore ||
        reportData.scores?.brandAlignmentScore ||
        0,
      pillarScores: reportData.pillarScores || {
        positioning: reportData.scores?.positioning || 0,
        messaging: reportData.scores?.messaging || 0,
        visibility: reportData.scores?.visibility || 0,
        credibility: reportData.scores?.credibility || 0,
        conversion: reportData.scores?.conversion || 0,
      },
      pillarInsights: reportData.pillarInsights || {
        positioning: reportData.fullReport?.positioningInsight || "",
        messaging: reportData.fullReport?.messagingInsight || "",
        visibility: reportData.fullReport?.visibilityInsight || "",
        credibility: reportData.fullReport?.credibilityInsight || "",
        conversion: reportData.fullReport?.conversionInsight || "",
      },
      recommendations:
        reportData.recommendations ||
        reportData.fullReport?.recommendations ||
        [],
      websiteNotes:
        reportData.websiteNotes || reportData.fullReport?.websiteNotes || null,
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <BrandSnapshotPDF data={transformedData} />
    );

    // Return PDF as response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="brand-snapshot-${id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("[PDF API] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF", message: err?.message },
      { status: 500 }
    );
  }
}

