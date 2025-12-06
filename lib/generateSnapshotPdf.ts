// lib/generateSnapshotPdf.ts
// PDF generation utility for Brand Snapshot reports

import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import SnapshotPdfTemplate from "@/components/SnapshotPdfTemplate";

export async function generateSnapshotPdf(report: any): Promise<Buffer> {
  try {
    const pdfBuffer = await renderToBuffer(
      React.createElement(SnapshotPdfTemplate, { report })
    );
    return pdfBuffer;
  } catch (error) {
    console.error("[PDF Generation] Error:", error);
    throw new Error("Failed to generate PDF");
  }
}

