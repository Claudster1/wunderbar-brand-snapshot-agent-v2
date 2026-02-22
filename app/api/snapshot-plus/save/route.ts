import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const guard = apiGuard(req, { routeId: "snapshot-plus-save" });
  if (!guard.passed) return guard.errorResponse;

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
      logger.error("[snapshot-plus/save] Insert error", { error: error.message });
      return NextResponse.json(
        { error: "Database insert failed." },
        { status: 500 }
      );
    }

    // Register brand (non-blocking)
    const brandName = full_report?.businessName || full_report?.company_name || sanitizedUserName;
    if (sanitizedUserEmail && brandName) {
      import("@/lib/userBrands").then(({ registerBrand }) =>
        registerBrand({
          email: sanitizedUserEmail,
          brandName,
          industry: full_report?.industry ?? null,
          website: full_report?.website ?? null,
          score: brand_alignment_score ?? null,
          reportId: finalReportId,
          reportTier: full_report?._meta?.tier || "snapshot_plus",
        })
      ).catch(() => {});
    }

    return NextResponse.json(
      {
        success: true,
        report_id: data.report_id,
        id: data.id,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    logger.error("[snapshot-plus/save] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

