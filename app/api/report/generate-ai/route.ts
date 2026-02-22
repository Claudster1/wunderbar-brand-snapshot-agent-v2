// app/api/report/generate-ai/route.ts
// ─────────────────────────────────────────────────────────────────
// AI-powered report generation endpoint.
//
// POST /api/report/generate-ai
// Body: { tier, assessmentData, snapshotReportId? }
//
// This is the single entry point for generating AI-powered reports
// for all paid tiers. The free tier continues to use deterministic
// scoring via /api/snapshot, but this route can also generate
// AI-enhanced free reports when requested.
//
// Flow:
// 1. Validate inputs + check security
// 2. Fetch base snapshot data (if upgrading from a previous tier)
// 3. Call generateAIReport() with the appropriate tier prompt
// 4. Save the generated report to the appropriate Supabase table
// 5. Return the report_id for redirect
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { generateAIReport } from "@/lib/ai/reportGeneration";
import type { ReportTier, AssessmentInput } from "@/lib/ai/reportGeneration";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";
import { featureGuard, FEATURES } from "@/lib/featureFlags";

export const dynamic = "force-dynamic";

// Max generation time: Blueprint+ can take 3-4 minutes with multi-call pipeline
export const maxDuration = 300; // 5 minutes (Vercel Pro/Enterprise)

const VALID_TIERS: ReportTier[] = ["free", "snapshot_plus", "blueprint", "blueprint_plus"];

export async function POST(req: Request) {
  // ─── Kill switch ──────────────────────────────────────────
  if (!featureGuard(FEATURES.AI_INSIGHTS, "report-generate-ai")) {
    return NextResponse.json(
      { error: "AI report generation is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  // ─── Security ─────────────────────────────────────────────
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AI_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, {
    routeId: "report-generate-ai",
    rateLimit: AI_RATE_LIMIT,
    maxBodySize: 500_000, // Allow larger bodies for assessment data
  });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json();

    // ─── Validate tier ────────────────────────────────────────
    const tier = body.tier as ReportTier;
    if (!tier || !VALID_TIERS.includes(tier)) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${VALID_TIERS.join(", ")}` },
        { status: 400 }
      );
    }

    // ─── Input validation & sanitization ─────────────────────
    const { sanitizeString, isValidEmail } = await import("@/lib/security/inputValidation");

    const rawEmail = body.email ?? body.assessmentData?.email;
    if (rawEmail && !isValidEmail(rawEmail)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // ─── Build assessment input ──────────────────────────────
    let assessmentData: AssessmentInput = body.assessmentData || {};

    // If a base snapshot report ID is provided, fetch the original assessment data
    const snapshotReportId = body.snapshotReportId;
    if (snapshotReportId) {
      const supabase = supabaseServer();
      const { data: baseReport } = await (supabase
        .from("brand_snapshot_reports") as any)
        .select("full_report, brand_alignment_score, pillar_scores, pillar_insights, recommendations, company_name, user_name, user_email")
        .eq("report_id", snapshotReportId)
        .single();

      if (baseReport) {
        const br = baseReport as Record<string, any>;
        // Merge base snapshot data with any additional assessment data
        const baseAnswers = br.full_report?.answers || {};
        assessmentData = {
          ...baseAnswers,
          ...assessmentData,
          // Always use the base report scores
          brandAlignmentScore: br.brand_alignment_score,
          pillarScores: br.pillar_scores as Record<string, number>,
          pillarInsights: br.pillar_insights as Record<string, string>,
          recommendations: br.recommendations as Record<string, string>,
          // Carry forward user info
          businessName: assessmentData.businessName || br.company_name,
          userName: assessmentData.userName || br.user_name,
          // Benchmark context if available
          benchmarkContext: br.full_report?.benchmarkContext || null,
        };
      }
    }

    // Sanitize key text fields
    if (assessmentData.businessName) {
      assessmentData.businessName = sanitizeString(assessmentData.businessName as string);
    }
    if (assessmentData.userName) {
      assessmentData.userName = sanitizeString(assessmentData.userName as string);
    }

    // Validate minimum data
    if (!assessmentData.businessName && !assessmentData.userName) {
      return NextResponse.json(
        { error: "Assessment data must include at least businessName or userName." },
        { status: 400 }
      );
    }

    logger.info("[Report Generate AI] Starting", {
      tier,
      businessName: assessmentData.businessName,
      hasBaseSnapshot: !!snapshotReportId,
    });

    // ─── Generate the report ─────────────────────────────────
    const generatedReport = await generateAIReport(tier, assessmentData);

    // ─── Save to database ────────────────────────────────────
    const supabase = supabaseServer();
    const report_id = randomUUID();
    const email = rawEmail ? sanitizeString(rawEmail).toLowerCase() : null;
    const userName = assessmentData.userName
      ? sanitizeString(assessmentData.userName as string)
      : null;

    if (tier === "free") {
      // Save to brand_snapshot_reports (same table as deterministic scoring)
      const { error } = await supabase
        .from("brand_snapshot_reports")
        .insert({
          report_id,
          user_email: email,
          user_name: userName,
          company_name: assessmentData.businessName || null,
          brand_alignment_score: (generatedReport.content.executiveSummary as any)?.brandAlignmentScore ?? assessmentData.brandAlignmentScore ?? 0,
          pillar_scores: (generatedReport.content.pillarScores as any) ?? assessmentData.pillarScores ?? {},
          pillar_insights: generatedReport.content.brandAlignmentOverview ?? {},
          recommendations: (generatedReport.content.immediateActions as any) ?? [],
          summary: (generatedReport.content.executiveSummary as any)?.overview ?? "",
          full_report: {
            ...generatedReport.content,
            _meta: {
              tier,
              generatedAt: generatedReport.generatedAt,
              model: generatedReport.model,
              provider: generatedReport.provider,
            },
          },
        } as any)
        .select("report_id")
        .single();

      if (error) {
        logger.error("[Report Generate AI] DB save failed", { tier, error: error.message });
        return NextResponse.json({ error: "Failed to save report." }, { status: 500 });
      }
    } else if (tier === "snapshot_plus") {
      // Save to brand_snapshot_plus_reports
      const { error } = await supabase
        .from("brand_snapshot_plus_reports")
        .insert({
          report_id,
          base_snapshot_report_id: snapshotReportId || null,
          user_email: email,
          user_name: userName,
          full_report: {
            ...generatedReport.content,
            _meta: {
              tier,
              generatedAt: generatedReport.generatedAt,
              model: generatedReport.model,
              provider: generatedReport.provider,
            },
          },
        } as any)
        .select("report_id")
        .single();

      if (error) {
        logger.error("[Report Generate AI] DB save failed", { tier, error: error.message });
        return NextResponse.json({ error: "Failed to save report." }, { status: 500 });
      }
    } else {
      // Blueprint and Blueprint+ — save to brand_snapshot_plus_reports
      // (same table, differentiated by tier in _meta)
      const { error } = await supabase
        .from("brand_snapshot_plus_reports")
        .insert({
          report_id,
          base_snapshot_report_id: snapshotReportId || null,
          user_email: email,
          user_name: userName,
          full_report: {
            ...generatedReport.content,
            _meta: {
              tier,
              generatedAt: generatedReport.generatedAt,
              model: generatedReport.model,
              provider: generatedReport.provider,
            },
          },
        } as any)
        .select("report_id")
        .single();

      if (error) {
        logger.error("[Report Generate AI] DB save failed", { tier, error: error.message });
        return NextResponse.json({ error: "Failed to save report." }, { status: 500 });
      }
    }

    // Register brand (non-blocking)
    const brandName = assessmentData.businessName as string | undefined;
    if (email && brandName) {
      import("@/lib/userBrands").then(({ registerBrand }) =>
        registerBrand({
          email,
          brandName,
          industry: (assessmentData.industry as string) ?? null,
          website: (assessmentData.website as string) ?? null,
          score: (generatedReport.content.executiveSummary as any)?.brandAlignmentScore ??
                 (assessmentData.brandAlignmentScore as number) ?? null,
          reportId: report_id,
          reportTier: tier === "free" ? "snapshot" : tier,
        })
      ).catch(() => {});
    }

    logger.info("[Report Generate AI] Success", {
      tier,
      report_id,
      businessName: assessmentData.businessName,
      model: generatedReport.model,
    });

    return NextResponse.json({
      reportId: report_id,
      tier,
      generatedAt: generatedReport.generatedAt,
      model: generatedReport.model,
      provider: generatedReport.provider,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("[Report Generate AI] Error", { error: msg });
    return NextResponse.json(
      { error: "Report generation failed. Please try again." },
      { status: 500 }
    );
  }
}
