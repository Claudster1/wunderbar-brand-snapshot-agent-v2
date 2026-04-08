// lib/pdf/renderReportPDF.ts
// Server-side PDF rendering helper (React-PDF -> Buffer)
// Uses the modern unified src/pdf generation pipeline.

import { generatePdfFromReport } from "@/src/pdf/generatePdf";

type AnyReport = Record<string, any>;

export async function renderReportPDF(report: AnyReport, isPlus: boolean) {
  return generatePdfFromReport(report, isPlus ? "snapshot-plus" : "snapshot");
}


