import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";

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

    const { sanitizeString, isValidEmail } = await import("@/lib/security/inputValidation");
    if (!isValidEmail(user_email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }
    const sanitizedUserEmail = sanitizeString(user_email);
    const sanitizedUserName = user_name != null ? sanitizeString(user_name) : null;
    const sanitizedWebsiteNotes = website_notes != null ? sanitizeString(website_notes) : null;

    // Generate report_id if not provided
    const finalReportId = report_id || randomUUID();

    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // 🎯 Insert into Supabase table
    const { data, error } = await supabase
      .from("brand_snapshot_plus_reports")
      .insert([
        {
          report_id: finalReportId,
          user_email: sanitizedUserEmail,
          user_name: sanitizedUserName,
          brand_alignment_score,
          pillar_scores,
          pillar_insights,
          recommendations,
          website_notes: sanitizedWebsiteNotes,
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

