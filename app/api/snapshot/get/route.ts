// app/api/snapshot/get/route.ts
// API route to get WunderBrand Snapshot™ reports

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";
import { checkReportAccess, getUserEmailFromRequest } from "@/lib/reportAccess";

type SampleReport = {
  report_id: string;
  company_name: string;
  user_name: string;
  user_email: string;
  email_verified: boolean;
  brand_alignment_score: number;
  pillar_scores: Record<"positioning" | "messaging" | "visibility" | "credibility" | "conversion", number>;
  pillar_insights: Record<string, { strength: string; opportunity: string }>;
  recommendations: string[];
  summary: string;
  opportunities_summary: string;
  upgrade_cta: string;
  full_report: {
    answers: Record<string, string>;
  };
  created_at: string;
};

const SAMPLE_REPORTS: Record<string, SampleReport> = {
  "sample-service-b2b": {
    report_id: "sample-service-b2b",
    company_name: "Northlight Advisory",
    user_name: "Jordan",
    user_email: "sample@wunderbar.ai",
    email_verified: true,
    brand_alignment_score: 63,
    pillar_scores: {
      positioning: 59,
      messaging: 66,
      visibility: 54,
      credibility: 72,
      conversion: 64,
    },
    pillar_insights: {
      positioning: {
        strength: "Your offer is differentiated once prospects get into a call.",
        opportunity: "The differentiation is not explicit enough in top-of-funnel touchpoints.",
      },
      messaging: {
        strength: "Your core narrative is clear and outcome-oriented.",
        opportunity: "Some pages still read feature-first instead of buyer-problem-first.",
      },
      visibility: {
        strength: "Referral traffic quality is strong.",
        opportunity: "Search and LinkedIn discovery are under-leveraged.",
      },
      credibility: {
        strength: "Case-study proof and testimonials build trust quickly.",
        opportunity: "Proof isn't consistently surfaced on high-intent pages.",
      },
      conversion: {
        strength: "Discovery call conversion from qualified leads is healthy.",
        opportunity: "Too many visitors drop before booking due to weak next-step clarity.",
      },
    },
    recommendations: [
      "Strengthen above-the-fold positioning with a buyer-problem headline.",
      "Publish one proof-led authority asset per week.",
      "Tighten CTA flow to a single high-intent booking path.",
    ],
    summary:
      "Your brand foundation is strong, but visibility and top-of-funnel positioning are constraining growth.",
    opportunities_summary:
      "Highest leverage: improve discovery and sharpen first-contact narrative to increase qualified pipeline.",
    upgrade_cta: "See Your Full Results — $497",
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
    created_at: "2026-01-26T00:00:00.000Z",
  },
  "sample-ecommerce": {
    report_id: "sample-ecommerce",
    company_name: "Lumen & Co.",
    user_name: "Casey",
    user_email: "sample@wunderbar.ai",
    email_verified: true,
    brand_alignment_score: 58,
    pillar_scores: {
      positioning: 61,
      messaging: 57,
      visibility: 62,
      credibility: 55,
      conversion: 52,
    },
    pillar_insights: {
      positioning: {
        strength: "Your visual identity is distinctive and recognizable.",
        opportunity: "Your unique value versus competitors is not explicit enough in product copy.",
      },
      messaging: {
        strength: "Tone is on-brand and consistent.",
        opportunity: "Product pages need clearer problem-solution framing.",
      },
      visibility: {
        strength: "Organic and social traffic volume is healthy.",
        opportunity: "Channel mix is broad but not prioritized by conversion quality.",
      },
      credibility: {
        strength: "Existing customer sentiment is positive.",
        opportunity: "Trust signals are buried below the fold on key pages.",
      },
      conversion: {
        strength: "Cart initiation rate is acceptable.",
        opportunity: "Checkout friction and weak urgency cues are reducing completion rate.",
      },
    },
    recommendations: [
      "Reframe product pages around customer outcomes and objections.",
      "Surface trust signals earlier in the path to purchase.",
      "Prioritize two channels by profitability, not just traffic volume.",
    ],
    summary:
      "You have demand, but conversion friction is suppressing revenue efficiency.",
    opportunities_summary:
      "Highest leverage: reduce checkout drop-off and improve trust/clarity on decision pages.",
    upgrade_cta: "See Your Full Results — $497",
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
    created_at: "2026-01-26T00:00:00.000Z",
  },
};

export async function GET(req: Request) {
  // ─── Security: Rate limit ───
  const guard = apiGuard(req, { routeId: "snapshot-get", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    const sampleReport = SAMPLE_REPORTS[id];
    if (sampleReport) {
      return NextResponse.json(sampleReport, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    // Fetch only the columns the results page needs (avoid SELECT *)
    const { data, error } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .select("report_id, company_name, product_tier, brand_alignment_score, pillar_scores, pillar_insights, recommendations, summary, opportunities_summary, upgrade_cta, full_report, user_name, user_email, email_verified, created_at")
      .eq("report_id", id)
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // ─── Authorization: verify email matches report owner ───
    const userEmail = getUserEmailFromRequest(req);
    const access = checkReportAccess(userEmail, (data as any).user_email);
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // ─── Enforcement: email must be verified before report data is served ───
    // If this report has gone through the verification flow (has a non-null email_verified column)
    // and is NOT yet verified, block access.
    if ((data as any).email_verified === false) {
      return NextResponse.json(
        { error: "Email not yet verified. Please complete verification to view your results." },
        { status: 403 }
      );
    }

    // Transform so the results page always receives expected keys
    const out: Record<string, unknown> = { ...data };
    if (!out.company_name && (data as any).company) {
      out.company_name = (data as any).company;
    }
    if (!out.insights && (data as any).pillar_insights) {
      out.insights = (data as any).pillar_insights;
    }
    // Cache report data for 60 seconds (revalidate in background)
    return NextResponse.json(out, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err: unknown) {
    logger.error("[Snapshot Get API] Unexpected error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Failed to load report. Please try again." },
      { status: 500 }
    );
  }
}

