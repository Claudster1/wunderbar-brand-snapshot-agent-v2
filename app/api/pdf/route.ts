// app/api/pdf/route.ts
// Unified PDF generation API route
// Supports all document types: snapshot, snapshot-plus, blueprint, blueprint-plus
// Can generate from report ID or inline data

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import {
  generatePdfResponseFromReport,
  generatePdfResponse,
  type PDFDocumentType,
} from "@/src/pdf/generatePdf";

export const dynamic = "force-dynamic";

/**
 * GET /api/pdf
 * 
 * Query parameters:
 * - id: Report ID (required if not using inline data)
 * - type: Document type - "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus" (default: "snapshot")
 * - upload: "1" to upload to Supabase Storage and return URL (optional)
 * 
 * Examples:
 * - /api/pdf?id=abc123&type=snapshot
 * - /api/pdf?id=abc123&type=snapshot-plus&upload=1
 * - /api/pdf?id=abc123&type=blueprint
 */
export async function GET(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "pdf", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const url = new URL(req.url);
    const reportId = url.searchParams.get("id");
    const documentType = (url.searchParams.get("type") || "snapshot") as PDFDocumentType;
    const upload = url.searchParams.get("upload") === "1";

    // Validate document type
    const validTypes: PDFDocumentType[] = ["snapshot", "snapshot-plus", "blueprint", "blueprint-plus"];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: `Invalid document type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // If no report ID, return error (inline data should use POST)
    if (!reportId) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Determine table based on document type
    let table: string;
    switch (documentType) {
      case "snapshot":
        table = "brand_snapshot_reports";
        break;
      case "snapshot-plus":
        table = "brand_snapshot_plus_reports";
        break;
      case "blueprint":
        table = "brand_blueprint_results";
        break;
      case "blueprint-plus":
        table = "brand_blueprint_plus_reports";
        break;
      default:
        table = "brand_snapshot_reports";
    }

    // Fetch report from database
    const { data: report, error } = await supabase
      .from(table as any)
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (error || !report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Generate filename
    const filename = getFilename(reportId, documentType);

    // Generate PDF response
    const pdfResponse = await generatePdfResponseFromReport(
      report,
      documentType,
      filename
    );

    // If upload requested: upload to Supabase Storage and return URL
    if (upload) {
      const pdfBuffer = await pdfResponse.arrayBuffer();
      const buffer = Buffer.from(pdfBuffer);

      const bucket = process.env.REPORT_STORAGE_BUCKET || "brand-snapshot-reports";
      const fileName = `reports/${reportId}-${documentType}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        console.error("[PDF Upload] Error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload PDF" },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      const publicUrl = publicUrlData?.publicUrl;

      // Try to get signed URL as fallback
      let signedUrl: string | null = null;
      try {
        const { data: signed } = await supabase.storage
          .from(bucket)
          .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days
        signedUrl = signed?.signedUrl || null;
      } catch {
        // ignore
      }

      return NextResponse.json({
        url: publicUrl,
        signedUrl,
        filename: fileName,
      });
    }

    // Return PDF download
    return pdfResponse;
  } catch (err: any) {
    console.error("[PDF API] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pdf
 * 
 * Accepts inline data to generate PDF without database lookup
 * 
 * Body:
 * {
 *   type: "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus",
 *   data: { ... } // Document-specific props
 *   filename?: string // Optional custom filename
 * }
 */
export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "pdf", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const body = await req.json();
    const { type, data, filename } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Missing required field: type" },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Missing required field: data" },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes: PDFDocumentType[] = ["snapshot", "snapshot-plus", "blueprint", "blueprint-plus"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid document type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate PDF response
    const pdfResponse = await generatePdfResponse({
      documentType: type,
      data,
      filename: filename || getFilename("report", type),
    });

    return pdfResponse;
  } catch (err: any) {
    console.error("[PDF API] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to generate filename based on document type
 */
function getFilename(reportId: string, documentType: PDFDocumentType): string {
  const typeNames: Record<PDFDocumentType, string> = {
    snapshot: "BrandSnapshot",
    "snapshot-plus": "SnapshotPlus",
    blueprint: "BrandBlueprint",
    "blueprint-plus": "BrandBlueprintPlus",
  };

  return `${typeNames[documentType]}_Report_${reportId}.pdf`;
}
