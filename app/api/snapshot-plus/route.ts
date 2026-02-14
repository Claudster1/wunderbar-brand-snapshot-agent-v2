// app/api/snapshot-plus/route.ts
// ------------------------------------------------------
// Snapshot+™ report generator + saver
// 1. Fetches base snapshot assessment data
// 2. Generates AI-powered Snapshot+ report
// 3. Saves to brand_snapshot_plus_reports
// 4. Returns plusReportId for redirect
// ------------------------------------------------------

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { generateAIReport } from "@/lib/ai/reportGeneration";
import type { AssessmentInput } from "@/lib/ai/reportGeneration";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // 2 minutes for Snapshot+ generation

export async function POST(req: Request) {
  try {
    // ─── Security ───
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { AI_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "snapshot-plus-generate", rateLimit: AI_RATE_LIMIT, maxBodySize: 300_000 });
    if (!guard.passed) return guard.errorResponse;

    const body = await req.json();

    // ─── Input validation & sanitization ───
    const { sanitizeString, isValidEmail } = await import("@/lib/security/inputValidation");
    const rawEmail = body.email ?? body.user_email;
    if (rawEmail != null && String(rawEmail).trim() !== "" && !isValidEmail(rawEmail)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const supabase = supabaseServer();
    const report_id = randomUUID();
    const base_snapshot_report_id = body.snapshotReportId || body.base_snapshot_report_id || null;

    // ─── Fetch base snapshot data ───
    let assessmentData: AssessmentInput = {};

    if (base_snapshot_report_id) {
      const { data: baseReport } = await (supabase
        .from("brand_snapshot_reports") as any)
        .select("full_report, brand_alignment_score, pillar_scores, pillar_insights, recommendations, company_name, user_name, user_email")
        .eq("report_id", base_snapshot_report_id)
        .single();

      if (baseReport) {
        const br = baseReport as Record<string, any>;
        const baseAnswers = br.full_report?.answers || {};
        assessmentData = {
          ...baseAnswers,
          brandAlignmentScore: br.brand_alignment_score,
          pillarScores: br.pillar_scores as Record<string, number>,
          pillarInsights: br.pillar_insights as Record<string, string>,
          recommendations: br.recommendations as Record<string, string>,
          businessName: br.company_name || baseAnswers.businessName,
          userName: br.user_name || baseAnswers.userName,
          benchmarkContext: br.full_report?.benchmarkContext || null,
        };
      }
    }

    // Merge any additional data provided in the request body
    if (body.assessmentData) {
      assessmentData = { ...assessmentData, ...body.assessmentData };
    }
    // Also accept top-level fields for backward compatibility
    if (body.businessName) assessmentData.businessName = sanitizeString(body.businessName);
    if (body.userName || body.name) assessmentData.userName = sanitizeString(body.userName || body.name);

    if (!assessmentData.businessName && !assessmentData.userName) {
      return NextResponse.json(
        { error: "Missing business or user name." },
        { status: 400 }
      );
    }

    logger.info("[Snapshot+ API] Starting AI generation", {
      businessName: assessmentData.businessName,
      hasBaseSnapshot: !!base_snapshot_report_id,
    });

    // ─── Generate AI report ───
    const generatedReport = await generateAIReport("snapshot_plus", assessmentData);

    // ─── Save to database ───
    const email = rawEmail ? sanitizeString(rawEmail).toLowerCase() : null;
    const userName = assessmentData.userName ? sanitizeString(assessmentData.userName as string) : null;

    const full_report = {
      ...generatedReport.content,
      // Legacy fields for backward compatibility with existing rendering
      snapshotReportId: base_snapshot_report_id,
      brandPersona: (generatedReport.content as any).brandPersona ?? null,
      archetype: (generatedReport.content as any).brandArchetypeSystem ?? null,
      colorPalette: (generatedReport.content as any).visualVerbalSignals?.colorSwatches ?? null,
      messagingFramework: (generatedReport.content as any).messagingPillars ?? null,
      recommendations: (generatedReport.content as any).strategicActionPlan ?? null,
      _meta: {
        tier: "snapshot_plus",
        generatedAt: generatedReport.generatedAt,
        model: generatedReport.model,
        provider: generatedReport.provider,
      },
    };

    const { data, error } = await supabase
      .from("brand_snapshot_plus_reports")
      .insert({
        report_id,
        base_snapshot_report_id,
        user_email: email,
        user_name: userName,
        recommendations: (generatedReport.content as any).strategicActionPlan ?? null,
        full_report,
      } as any)
      .select("report_id")
      .single();

    if (error || !data) {
      logger.error("[Snapshot+ API] DB save failed", { error: error?.message });
      return NextResponse.json(
        { error: "Snapshot+™ generation failed." },
        { status: 500 }
      );
    }

    logger.info("[Snapshot+ API] Report saved", {
      report_id,
      businessName: assessmentData.businessName,
      model: generatedReport.model,
    });

    return NextResponse.json({
      plusReportId: (data as any).report_id,
      tier: "snapshot_plus",
      generatedAt: generatedReport.generatedAt,
    });
  } catch (err: any) {
    logger.error("[Snapshot+ API] Error:", { error: err?.message ?? String(err) });
    return NextResponse.json(
      { error: "Snapshot+™ generation failed. Please try again." },
      { status: 500 }
    );
  }
}
