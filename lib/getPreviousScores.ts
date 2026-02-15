// lib/getPreviousScores.ts
// Fetches the most recent prior report for a given email,
// so a refresh report can include "vs previous" comparison data.

import { supabaseServer } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export type PreviousScoreData = {
  reportId: string;
  brandAlignmentScore: number | null;
  pillarScores: Record<string, number> | null;
  createdAt: string;
  brandName: string | null;
};

/**
 * Get the most recent completed report for a user (by email),
 * excluding the current report being generated.
 *
 * Returns null if no prior report exists.
 */
export async function getPreviousScores(
  email: string,
  excludeReportId?: string
): Promise<PreviousScoreData | null> {
  if (!email) return null;

  try {
    const supabase = supabaseServer();

    let query = supabase
      .from("brand_snapshot_reports")
      .select("report_id, brand_alignment_score, pillar_scores, created_at, brand_name, company_name")
      .eq("user_email", email.toLowerCase())
      .order("created_at", { ascending: false })
      .limit(2); // Get 2 in case we need to skip current

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return null;
    }

    // Find the most recent report that isn't the one being generated
    const rows = data as Array<Record<string, unknown>>;
    const previous = rows.find(
      (r) => r.report_id !== excludeReportId
    );

    if (!previous) return null;

    return {
      reportId: previous.report_id as string,
      brandAlignmentScore: previous.brand_alignment_score as number | null,
      pillarScores: previous.pillar_scores as Record<string, number> | null,
      createdAt: previous.created_at as string,
      brandName: (previous.brand_name ?? previous.company_name) as string | null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("[getPreviousScores] Error", { error: msg });
    return null;
  }
}

/**
 * Format previous scores as a prompt fragment to inject into report generation.
 * Returns an empty string if no prior data exists.
 */
export function formatPreviousScoresForPrompt(prev: PreviousScoreData | null): string {
  if (!prev || prev.brandAlignmentScore == null) return "";

  const date = new Date(prev.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  let fragment = `
---------------------------------------------------------------------
QUARTERLY COMPARISON DATA (Previous Diagnostic: ${date})
---------------------------------------------------------------------
This is a REFRESH diagnostic. The customer has completed a prior diagnostic.
Include a "Progress Since Last Diagnostic" section in the report comparing current vs. previous scores.

Previous WunderBrand Score™: ${prev.brandAlignmentScore}/100
`;

  if (prev.pillarScores && typeof prev.pillarScores === "object") {
    fragment += `Previous Pillar Scores:\n`;
    for (const [pillar, score] of Object.entries(prev.pillarScores)) {
      fragment += `  - ${pillar}: ${score}/100\n`;
    }
  }

  fragment += `
For each pillar, note whether the score improved, declined, or stayed the same.
For significant changes (+/- 10 points), explain what likely drove the change based on the diagnostic answers.
Frame improvements positively ("Your Messaging pillar jumped 12 points — your updated website copy is working").
Frame declines constructively ("Your Visibility score dipped 8 points — this often happens when businesses focus heavily on one area and reduce activity in another").

Include a summary table at the top of the report:
| Pillar | Previous | Current | Change |
`;

  return fragment;
}
