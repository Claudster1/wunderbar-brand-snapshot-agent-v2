// app/api/snapshot-plus/route.ts
// ------------------------------------------------------
// Snapshot+™ report saver (expanded payload)
// Saves to brand_snapshot_plus_reports
// Returns plusReportId (report_id) for redirect
// ------------------------------------------------------

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = supabaseServer();

    const report_id = randomUUID();

    const base_snapshot_report_id =
      body.snapshotReportId || body.base_snapshot_report_id || null;

    // Store everything in full_report so we don't depend on optional columns
    const full_report = {
      snapshotReportId: body.snapshotReportId,
      brandPersona: body.brandPersona,
      archetype: body.archetype,
      colorPalette: body.colorPalette,
      messagingFramework: body.messagingFramework,
      recommendations: body.recommendations,
      pdf_url: null,
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("brand_snapshot_plus_reports")
      .insert({
        report_id,
        base_snapshot_report_id,
        // Optional “common” columns (added by migration in this repo)
        user_email: body.email?.toLowerCase?.() ?? body.user_email ?? null,
        user_name: body.name ?? body.user_name ?? null,
        recommendations: body.recommendations ?? null,
        full_report,
        // pdf_url is handled by /api/pdf/[id]?plus=1&upload=1
      } as any)
      .select("report_id")
      .single();

    if (error || !data) {
      console.error(error);
      return NextResponse.json(
        { error: "Snapshot+™ generation failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({ plusReportId: (data as any).report_id });
  } catch (err: any) {
    console.error("[Snapshot+ API] Error:", err);
    return NextResponse.json(
      { error: "Snapshot+™ generation failed." },
      { status: 500 }
    );
  }
}


