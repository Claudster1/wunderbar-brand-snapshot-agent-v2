// Shared helpers for admin regeneration of paid rows in `brand_snapshot_plus_reports`.

import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  generateAIReport,
  type AssessmentInput,
  type GeneratedReport,
} from "@/lib/ai/reportGeneration";
import { buildTierSignals } from "@/lib/signals/tierSignals";

export type PaidRegenerableTier = "snapshot_plus" | "blueprint" | "blueprint_plus";

export type PaidPlusRow = {
  report_id: string;
  base_snapshot_report_id: string | null;
  user_email: string | null;
  user_name: string | null;
  full_report: Record<string, unknown> | null;
};

export function isPaidRegenerableTier(t: string | null | undefined): t is PaidRegenerableTier {
  return t === "snapshot_plus" || t === "blueprint" || t === "blueprint_plus";
}

export function paidTierFromFullReport(
  fullReport: Record<string, unknown> | null | undefined,
): PaidRegenerableTier | null {
  const meta = fullReport?._meta as { tier?: string } | undefined;
  const t = meta?.tier;
  if (t === "blueprint_plus" || t === "blueprint-plus") return "blueprint_plus";
  if (t === "blueprint") return "blueprint";
  if (t === "snapshot_plus" || t === "snapshot-plus") return "snapshot_plus";
  return null;
}

export async function buildAssessmentInputForPaidRow(
  row: PaidPlusRow,
): Promise<{ ok: true; assessment: AssessmentInput } | { ok: false; reason: string }> {
  const assessmentData: AssessmentInput = {};
  const full = row.full_report;

  if (row.base_snapshot_report_id && supabaseAdmin) {
    const { data: baseReport } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .select("full_report, brand_alignment_score, pillar_scores, pillar_insights, recommendations, company_name, user_name, user_email")
      .eq("report_id", row.base_snapshot_report_id)
      .single();

    if (baseReport) {
      const br = baseReport as Record<string, unknown>;
      const baseAnswers = (br.full_report as { answers?: Record<string, string> } | undefined)?.answers || {};
      Object.assign(assessmentData, {
        ...baseAnswers,
        brandAlignmentScore: br.brand_alignment_score as number | undefined,
        pillarScores: br.pillar_scores as Record<string, number> | undefined,
        pillarInsights: br.pillar_insights as Record<string, string> | undefined,
        recommendations: br.recommendations as Record<string, string> | undefined,
        businessName: (br.company_name as string) || (baseAnswers as Record<string, string>).businessName,
        userName: (br.user_name as string) || (baseAnswers as Record<string, string>).userName,
        benchmarkContext: (br.full_report as { benchmarkContext?: string | null } | undefined)?.benchmarkContext ?? null,
      });
    }
  }

  const answersFromPlus =
    full && typeof full.answers === "object" && full.answers !== null && !Array.isArray(full.answers)
      ? (full.answers as Record<string, unknown>)
      : null;
  if (answersFromPlus && Object.keys(answersFromPlus).length > 0) {
    Object.assign(assessmentData, answersFromPlus);
  }

  if (row.user_name && !assessmentData.userName) {
    assessmentData.userName = row.user_name;
  }
  if (row.user_email) {
    (assessmentData as Record<string, unknown>).userEmail = row.user_email;
  }

  const frBusiness = typeof full?.businessName === "string" ? full.businessName.trim() : "";
  if (frBusiness && !assessmentData.businessName) {
    assessmentData.businessName = frBusiness;
  }

  if (!assessmentData.businessName && !assessmentData.userName) {
    return {
      ok: false,
      reason:
        "Missing business or user name: link a base snapshot (base_snapshot_report_id) or ensure full_report.answers / businessName exists.",
    };
  }

  return { ok: true, assessment: assessmentData };
}

function mergeMeta(
  previousMeta: Record<string, unknown>,
  tier: PaidRegenerableTier,
  generatedReport: GeneratedReport,
  adminUserId: string,
): Record<string, unknown> {
  return {
    ...previousMeta,
    tier,
    generatedAt: generatedReport.generatedAt,
    model: generatedReport.model,
    provider: generatedReport.provider,
    regeneratedAt: new Date().toISOString(),
    regeneratedByAdminUserId: adminUserId,
  };
}

export function composeRegeneratedFullReport(args: {
  tier: PaidRegenerableTier;
  generatedReport: GeneratedReport;
  tierSignals: Record<string, unknown>;
  row: PaidPlusRow;
  adminUserId: string;
}): Record<string, unknown> {
  const { tier, generatedReport, tierSignals, row, adminUserId } = args;
  const previousMeta =
    row.full_report && typeof row.full_report._meta === "object" && row.full_report._meta !== null
      ? (row.full_report._meta as Record<string, unknown>)
      : {};
  const c = generatedReport.content as Record<string, unknown>;

  if (tier === "snapshot_plus") {
    const content = c as Record<string, any>;
    return {
      ...generatedReport.content,
      ...tierSignals,
      snapshotReportId: row.base_snapshot_report_id,
      brandPersona: content.brandPersona ?? null,
      archetype: content.brandArchetypeSystem ?? null,
      colorPalette: content.visualVerbalSignals?.colorSwatches ?? null,
      messagingFramework: content.messagingPillars ?? null,
      recommendations: content.strategicActionPlan ?? null,
      _meta: mergeMeta(previousMeta, tier, generatedReport, adminUserId),
    };
  }

  return {
    ...generatedReport.content,
    ...tierSignals,
    _meta: mergeMeta(previousMeta, tier, generatedReport, adminUserId),
  };
}

export function topLevelRecommendationsForSnapshotPlus(full_report: Record<string, unknown>): unknown {
  const r = full_report.recommendations;
  return r ?? null;
}

export async function runPaidReportRegeneration(args: {
  row: PaidPlusRow;
  tier: PaidRegenerableTier;
  adminUserId: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const { row, tier, adminUserId } = args;
  const built = await buildAssessmentInputForPaidRow(row);
  if (!built.ok) {
    return { ok: false, message: built.reason };
  }

  try {
    const generatedReport = await generateAIReport(tier, built.assessment);
    const tierSignals = buildTierSignals(
      tier,
      built.assessment as Record<string, unknown>,
      (generatedReport.content as Record<string, unknown>) ?? {},
    );
    const full_report = composeRegeneratedFullReport({
      tier,
      generatedReport,
      tierSignals,
      row,
      adminUserId,
    });

    if (!supabaseAdmin) {
      return { ok: false, message: "Database not configured." };
    }

    const updatePayload: Record<string, unknown> = {
      full_report,
      updated_at: new Date().toISOString(),
    };

    if (tier === "snapshot_plus") {
      updatePayload.recommendations = topLevelRecommendationsForSnapshotPlus(full_report);
    }

    const { error: upErr } = await supabaseAdmin
      .from("brand_snapshot_plus_reports")
      .update(updatePayload as never)
      .eq("report_id", row.report_id);

    if (upErr) {
      return { ok: false, message: upErr.message };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: msg };
  }
}

export function filterRowsByTierParam(
  rows: PaidPlusRow[],
  tierParam: string | null,
): PaidPlusRow[] {
  if (!tierParam || !isPaidRegenerableTier(tierParam)) return rows;
  return rows.filter((r) => paidTierFromFullReport(r.full_report) === tierParam);
}
