// lib/pdf/renderReportPDF.ts
// Server-side PDF rendering helper (React-PDF -> Buffer)

import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import ReportDocument from "@/components/pdf/ReportDocument";

type AnyReport = Record<string, any>;

function transformForReportDocument(report: AnyReport, isPlus: boolean) {
  const r = report?.full_report || report || {};

  const pillarScores =
    r.pillar_scores ||
    r.pillarScores ||
    report?.pillar_scores ||
    report?.pillarScores ||
    {};

  const pillarInsights =
    r.pillar_insights ||
    r.pillarInsights ||
    report?.pillar_insights ||
    report?.pillarInsights ||
    {};

  const recommendationsRaw =
    r.recommendations || report?.recommendations || [];
  const recommendations = Array.isArray(recommendationsRaw)
    ? recommendationsRaw
    : recommendationsRaw && typeof recommendationsRaw === "object"
      ? Object.values(recommendationsRaw).filter((v) => typeof v === "string")
      : [];

  const suggestedPalette =
    r.color_palette ||
    r.colorPalette ||
    report?.color_palette ||
    report?.enriched_color_palette ||
    [];

  return {
    userName: r.user_name || report?.user_name || report?.userName || "User",
    businessName:
      r.company ||
      r.business_name ||
      report?.company ||
      report?.business_name ||
      "",
    brandAlignmentScore:
      r.brand_alignment_score ||
      r.brandAlignmentScore ||
      report?.brand_alignment_score ||
      0,
    pillarScores,
    pillarInsights,
    recommendations,
    suggestedPalette,
    isPlus,
    report,
  };
}

export async function renderReportPDF(report: AnyReport, isPlus: boolean) {
  const props = transformForReportDocument(report, isPlus);
  const pdfBuffer = await renderToBuffer(
    React.createElement(ReportDocument, props) as any
  );
  return pdfBuffer;
}


