// app/api/snapshot/pdf/route.ts
// API route to generate and download WunderBrand Snapshot™ PDFs

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generatePdfResponseFromReport } from "@/src/pdf/generatePdf";

const SAMPLE_SNAPSHOT_PDF_REPORTS: Record<string, any> = {
  "sample-ecommerce": {
    report_id: "sample-ecommerce",
    company_name: "Lumen & Co.",
    user_name: "Casey",
    user_email: "sample@wunderbar.ai",
    brand_alignment_score: 58,
    pillar_scores: {
      positioning: 61,
      messaging: 57,
      visibility: 62,
      credibility: 55,
      conversion: 52,
    },
    pillar_insights: {
      positioning:
        "Your visual identity is distinctive and recognizable, but your unique value is not explicit enough in product copy.",
      messaging:
        "Tone is on-brand and consistent, while product pages still need clearer problem-solution framing.",
      visibility:
        "Organic and social traffic volume is healthy, but channel mix is not prioritized by conversion quality.",
      credibility:
        "Customer sentiment is positive, but trust signals are buried below the fold on key pages.",
      conversion:
        "Cart initiation is acceptable, but checkout friction and weak urgency cues reduce completion rate.",
    },
    recommendations: {
      positioning: "Clarify your differentiation at the top of each high-intent product page.",
      messaging: "Lead with customer outcomes before feature detail blocks.",
      visibility: "Prioritize two channels by profitability rather than reach.",
      credibility: "Move reviews and proof badges higher in the purchase journey.",
      conversion: "Reduce checkout friction and tighten urgency language.",
    },
    full_report: {
      answers: {
        businessType: "ecommerce",
        likelyArchetype: "Creator",
        monthlyMarketingBudget: "5000_plus",
        monthlyRevenueRange: "50k_150k",
        revenueRange: "1M-5M",
        averageTransactionValue: "95",
        conversionRateEstimate: "2.3%",
      },
    },
  },
  "sample-service-b2b": {
    report_id: "sample-service-b2b",
    company_name: "Northlight Advisory",
    user_name: "Jordan",
    user_email: "sample@wunderbar.ai",
    brand_alignment_score: 63,
    pillar_scores: {
      positioning: 59,
      messaging: 66,
      visibility: 54,
      credibility: 72,
      conversion: 64,
    },
    pillar_insights: {
      positioning:
        "Your offer is differentiated deeper in the funnel, but top-of-funnel clarity needs to be stronger.",
      messaging:
        "Your narrative is outcome-oriented, while several pages still read feature-first.",
      visibility:
        "Referral quality is strong, but search and LinkedIn discovery are under-leveraged.",
      credibility:
        "Case-study proof is strong, but trust signals are not consistently front-loaded.",
      conversion:
        "Qualified conversion is healthy, but visitors drop pre-booking due to weak next-step clarity.",
    },
    recommendations: {
      positioning: "Make your buyer-problem framing explicit above the fold.",
      messaging: "Standardize problem-first copy patterns across core pages.",
      visibility: "Build a weekly authority content cadence for search and LinkedIn.",
      credibility: "Surface proof earlier on high-intent conversion pages.",
      conversion: "Simplify to a single primary booking path per page.",
    },
    full_report: {
      answers: {
        businessType: "service_b2b",
        likelyArchetype: "Sage",
        monthlyMarketingBudget: "2000_5000",
        monthlyRevenueRange: "20k_50k",
        revenueRange: "500k-1M",
        averageTransactionValue: "3500",
        conversionRateEstimate: "14%",
      },
    },
  },
};

export async function GET(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "snapshot-pdf", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    const sampleReport = SAMPLE_SNAPSHOT_PDF_REPORTS[id];
    if (sampleReport) {
      return generatePdfResponseFromReport(sampleReport, "snapshot", `Brand-Snapshot-${id}.pdf`);
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

    return generatePdfResponseFromReport(report, "snapshot", `Brand-Snapshot-${id}.pdf`);
  } catch (err: any) {
    logger.error("[Snapshot PDF API] Unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: err?.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

