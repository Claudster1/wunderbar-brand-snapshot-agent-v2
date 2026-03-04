// lib/generateSnapshotPdf.ts
// PDF generation utility for WunderBrand Snapshot™ reports.
// Uses the centralized PDF pipeline for parity with /api/pdf?type=snapshot.

import { generatePdfFromReport } from "@/src/pdf/generatePdf";

export async function generateSnapshotPdf(report: any): Promise<Buffer> {
  try {
    return await generatePdfFromReport(report, "snapshot");
  } catch (error) {
    console.error("[PDF Generation] Error:", error);
    throw new Error("Failed to generate PDF");
  }
}

