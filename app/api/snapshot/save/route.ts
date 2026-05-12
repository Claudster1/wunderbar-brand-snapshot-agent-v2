// app/api/snapshot/save/route.ts
// API route to save WunderBrand Snapshot™ reports

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  // ─── Security: Rate limit + request size ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "snapshot-save", rateLimit: GENERAL_RATE_LIMIT, maxBodySize: 200_000 });
  if (!guard.passed) return guard.errorResponse;

  try {
    const data = await req.json();

    const {
      report_id,
      user_name,
      company_name,
      website,
      industry,
      brand_alignment_score,
      pillar_scores,
      insights,
      recommendations,
      summary,
      overall_interpretation,
      opportunities_summary,
      upgrade_cta,
    } = data;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    if (!report_id) {
      return NextResponse.json(
        { error: "Missing required field: report_id" },
        { status: 400 }
      );
    }

    // Schema notes (mirrors app/api/snapshot/route.ts):
    //   • Canonical brand column is `brand_name`, not `company_name` (PGRST204 otherwise).
    //   • `summary`, `overall_interpretation`, `opportunities_summary`, `upgrade_cta`,
    //     `website`, `industry`, `insights` are NOT top-level columns in production — nest
    //     them inside `full_report` so the insert succeeds without a Supabase migration.
    const { error } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .insert({
        report_id,
        user_name: user_name || null,
        brand_name: company_name || null,
        brand_alignment_score: brand_alignment_score || null,
        pillar_scores: pillar_scores || null,
        recommendations: recommendations || null,
        full_report: {
          website: website || null,
          industry: industry || null,
          insights: insights || null,
          summary: summary || null,
          overall_interpretation: overall_interpretation || null,
          opportunities_summary: opportunities_summary || null,
          upgrade_cta: upgrade_cta || null,
        },
      });

    if (error) {
      logger.error("Supabase insert error", { error: error.message });
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, report_id });
  } catch (err: any) {
    logger.error("[Snapshot Save API] Unexpected error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save snapshot" },
      { status: 500 }
    );
  }
}

