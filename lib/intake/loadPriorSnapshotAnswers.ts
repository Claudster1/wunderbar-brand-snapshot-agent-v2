import { supabaseAdmin } from "@/lib/supabase-admin";

export const CONTINUATION_REPORT_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Load structured intake JSON from a prior diagnostic on the same report. */
export async function loadPriorSnapshotAnswers(
  reportId: string,
): Promise<Record<string, unknown> | null> {
  if (!CONTINUATION_REPORT_UUID_RE.test(reportId) || !supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("brand_snapshot_reports")
    .select("full_report")
    .or(`report_id.eq.${reportId},id.eq.${reportId}`)
    .maybeSingle();
  if (error || !data?.full_report || typeof data.full_report !== "object") return null;
  const answers = (data.full_report as { answers?: unknown }).answers;
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return null;
  return answers as Record<string, unknown>;
}

export function serializePriorAnswersForPrompt(answers: Record<string, unknown>): string {
  const max = 14_000;
  try {
    const s = JSON.stringify(answers);
    return s.length <= max ? s : `${s.slice(0, max)}…[truncated]`;
  } catch {
    return "{}";
  }
}
