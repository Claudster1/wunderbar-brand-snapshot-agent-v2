import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// ⛑️ Always use service-role key for server-side writes
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      user_email,
      user_name,
      brand_alignment_score,
      pillar_scores,
      pillar_insights,
      recommendations,
      website_notes,
      full_report,
      report_id, // Optional: if not provided, generate one
      base_snapshot_report_id, // Optional: link to base snapshot
    } = body;

    // 🧪 Basic validation
    if (!user_email) {
      return NextResponse.json(
        { error: "Missing required field: user_email" },
        { status: 400 }
      );
    }

    // Generate report_id if not provided
    const finalReportId = report_id || randomUUID();

    // 🎯 Insert into Supabase table
    const { data, error } = await supabase
      .from("brand_snapshot_plus_reports")
      .insert([
        {
          report_id: finalReportId,
          user_email,
          user_name: user_name ?? null,
          brand_alignment_score,
          pillar_scores,
          pillar_insights,
          recommendations,
          website_notes,
          full_report,
          base_snapshot_report_id: base_snapshot_report_id ?? null,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Insert error:", error);
      return NextResponse.json(
        { error: "Database insert failed", details: error.message },
        { status: 500 }
      );
    }

    // 🎉 Success — return the created report ID
    return NextResponse.json(
      {
        success: true,
        report_id: data.report_id, // The report_id field (not the UUID id)
        id: data.id, // The UUID primary key
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ API error:", err);
    return NextResponse.json(
      { error: "Unexpected server error", details: err.message },
      { status: 500 }
    );
  }
}

