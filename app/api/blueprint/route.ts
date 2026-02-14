// app/api/blueprint/route.ts
// ------------------------------------------------------
// WunderBrand Blueprint™ report generator
// 1. Fetches base snapshot assessment data
// 2. Generates AI-powered Blueprint report
// 3. Saves to brand_snapshot_plus_reports (with tier: blueprint)
// 4. Returns reportId for redirect
//
// Also supports POST with ?format=pdf to generate and return a PDF.
// ------------------------------------------------------

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { generateAIReport } from "@/lib/ai/reportGeneration";
import type { AssessmentInput } from "@/lib/ai/reportGeneration";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 180; // 3 minutes for Blueprint generation

export async function POST(req: Request) {
  try {
    // ─── Security ───
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { AI_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "blueprint-generate", rateLimit: AI_RATE_LIMIT, maxBodySize: 500_000 });
    if (!guard.passed) return guard.errorResponse;

    const body = await req.json();
    const url = new URL(req.url);
    const format = url.searchParams.get("format");

    // ─── Input validation & sanitization ───
    const { sanitizeString, isValidEmail } = await import("@/lib/security/inputValidation");
    const rawEmail = body.email ?? body.user_email;
    if (rawEmail && !isValidEmail(rawEmail)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const supabase = supabaseServer();
    const report_id = randomUUID();
    const base_snapshot_report_id = body.snapshotReportId || body.base_snapshot_report_id || null;

    // ─── Build assessment data ───
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

    // Merge additional data
    if (body.assessmentData) {
      assessmentData = { ...assessmentData, ...body.assessmentData };
    }
    if (body.businessName) assessmentData.businessName = sanitizeString(body.businessName);
    if (body.userName) assessmentData.userName = sanitizeString(body.userName);

    if (!assessmentData.businessName && !assessmentData.userName) {
      return NextResponse.json(
        { error: "Missing business or user name." },
        { status: 400 }
      );
    }

    logger.info("[Blueprint API] Starting AI generation", {
      businessName: assessmentData.businessName,
      hasBaseSnapshot: !!base_snapshot_report_id,
    });

    // ─── Generate AI report ───
    const generatedReport = await generateAIReport("blueprint", assessmentData);

    // ─── Save to database ───
    const email = rawEmail ? sanitizeString(rawEmail).toLowerCase() : null;
    const userName = assessmentData.userName ? sanitizeString(assessmentData.userName as string) : null;

    const full_report = {
      ...generatedReport.content,
      _meta: {
        tier: "blueprint",
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
        full_report,
      } as any)
      .select("report_id")
      .single();

    if (error || !data) {
      logger.error("[Blueprint API] DB save failed", { error: error?.message });
      return NextResponse.json(
        { error: "Blueprint™ generation failed." },
        { status: 500 }
      );
    }

    logger.info("[Blueprint API] Report saved", {
      report_id,
      businessName: assessmentData.businessName,
      model: generatedReport.model,
    });

    // ─── If PDF format requested, generate and return PDF ───
    if (format === "pdf") {
      try {
        const React = (await import("react")).default;
        const { renderToBuffer } = await import("@react-pdf/renderer");
        const { BlueprintDocument } = await import("@/app/reports/BlueprintDocument");

        const pdfBuffer = await renderToBuffer(
          React.createElement(BlueprintDocument, { data: generatedReport.content }) as any
        );

        return new NextResponse(pdfBuffer as any, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="brand-blueprint.pdf"',
          },
        });
      } catch (pdfErr) {
        logger.error("[Blueprint API] PDF generation failed", {
          error: pdfErr instanceof Error ? pdfErr.message : String(pdfErr),
        });
        // Still return the report ID even if PDF fails
      }
    }

    return NextResponse.json({
      reportId: (data as any).report_id,
      tier: "blueprint",
      generatedAt: generatedReport.generatedAt,
    });
  } catch (err: any) {
    logger.error("[Blueprint API] Error:", { error: err?.message ?? String(err) });
    return NextResponse.json(
      { error: "Blueprint™ generation failed. Please try again." },
      { status: 500 }
    );
  }
}
