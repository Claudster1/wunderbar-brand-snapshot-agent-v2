// app/api/snapshot/pdf/route.ts
// API route to generate and download Brand Snapshot PDFs

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateSnapshotPdf } from "@/lib/generateSnapshotPdf";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    // Fetch report from database
    const { data: report, error } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .select("*")
      .eq("report_id", id)
      .single();

    if (error || !report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateSnapshotPdf(report);

    // Return PDF as response (cast to any to handle Buffer type)
    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Brand-Snapshot-${id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("[Snapshot PDF API] Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

