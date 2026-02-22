// app/api/pdf/[id]/route.ts
// Secure PDF generation route
// - Generates PDF buffer (free or plus via ?plus=1)
// - Optionally uploads to Supabase Storage (via ?upload=1) and returns URL

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { renderReportPDF } from "@/lib/pdf/renderReportPDF";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const plus = url.searchParams.get("plus") === "1";
    const upload = url.searchParams.get("upload") === "1";

    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    const supabase = supabaseServer();

    const table = plus ? "brand_snapshot_plus_reports" : "brand_snapshot_reports";

    const { data: report, error } = await supabase
      .from(table as any)
      .select("*")
      .eq("report_id", id)
      .single();

    if (error || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Generate PDF buffer
    const pdfBuffer = await renderReportPDF(report, plus);

    // If upload requested: upload and return URL JSON
    if (upload) {
      const bucket = process.env.REPORT_STORAGE_BUCKET || "brand-snapshot-reports";
      const fileName = `reports/${id}${plus ? "-plus" : ""}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        logger.error("[PDF Upload] Error", { error: uploadError.message });
        return NextResponse.json(
          { error: "Failed to upload PDF" },
          { status: 500 }
        );
      }

      // Prefer public URL if bucket is public; otherwise provide a signed URL.
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const publicUrl = publicUrlData?.publicUrl;

      let signedUrl: string | null = null;
      try {
        const { data: signed } = await supabase.storage
          .from(bucket)
          .createSignedUrl(fileName, 60 * 60 * 24 * 7);
        signedUrl = signed?.signedUrl || null;
      } catch {
        // ignore
      }

      return NextResponse.json({ url: publicUrl, signedUrl });
    }

    const filename = plus
      ? `SnapshotPlus_Report_${id}.pdf`
      : `BrandSnapshot_Report_${id}.pdf`;

    // Default: return PDF download
    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    logger.error("[PDF API] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: err?.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

