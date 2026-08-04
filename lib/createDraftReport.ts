// lib/createDraftReport.ts
// Function to create a draft snapshot report for progress tracking

import { supabaseServer } from "./supabase";
import { logger } from "./logger";

export async function createDraftReport(userEmail?: string): Promise<string> {
  const supabase = supabaseServer();

  const reportId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const fullRow = {
    id: reportId,
    report_id: reportId,
    user_email: userEmail || null,
    brand_name: "Draft",
    brand_alignment_score: 0,
    pillar_scores: {} as Record<string, unknown>,
    primary_pillar: "positioning",
    context_coverage: 0,
    snapshot_stage: "in_progress",
    status: "draft",
    last_step: "start",
    progress: {} as Record<string, unknown>,
  };

  const minimalRow = {
    id: reportId,
    report_id: reportId,
    user_email: userEmail || null,
    brand_name: "Draft",
    brand_alignment_score: 0,
    pillar_scores: {} as Record<string, unknown>,
    full_report: {
      snapshot_stage: "in_progress",
      status: "draft",
      last_step: "start",
      progress: {},
      primary_pillar: "positioning",
      context_coverage: 0,
    },
  };

  let { data, error } = await supabase
    .from("brand_snapshot_reports")
    .insert(fullRow as any)
    .select("id")
    .single();

  if (error?.code === "PGRST204") {
    logger.warn("[createDraftReport] Schema missing columns; retrying minimal insert", {
      error: error.message,
    });
    ({ data, error } = await supabase
      .from("brand_snapshot_reports")
      .insert(minimalRow as any)
      .select("id")
      .single());
  }

  if (error) {
    logger.error("[createDraftReport] Error creating draft report", {
      error: error.message,
      code: error.code,
    });
    throw error;
  }

  const row = data as { id?: string; report_id?: string } | null;
  return row?.report_id ?? row?.id ?? reportId;
}
