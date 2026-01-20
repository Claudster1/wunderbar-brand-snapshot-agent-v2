// app/api/snapshot/route.ts
// ------------------------------------------------------
// Processes Brand Snapshot™ responses
// Saves report skeleton to Supabase
// Returns reportId for redirect
// ------------------------------------------------------

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { calculateBrandSnapshotScores } from "@/lib/brandSnapshotEngine";
import { buildContextCoverageMap } from "@/lib/enrichment/coverage";
import { triggerUpgradeEmails } from "@/lib/triggerUpgradeEmails";
import { randomUUID } from "crypto";
import { getPrimaryPillar } from "@/lib/pillars/getPrimaryPillar";

export const dynamic = "force-dynamic";

function buildPillarInsightsFromScores(pillarScores: Record<string, number>) {
  const mk = (pillar: string, score: number) => {
    if (score >= 18) {
      return {
        strength: `Your ${pillar} is a clear strength right now — the foundation is working.`,
        opportunity: `Keep tightening consistency so this pillar stays an advantage as you scale.`,
        action: `Document the 2–3 patterns that are working best in ${pillar}, and apply them everywhere you show up.`,
      };
    }
    if (score >= 14) {
      return {
        strength: `Your ${pillar} has a solid baseline — you’re not starting from zero.`,
        opportunity: `A few focused refinements would make this pillar feel sharper and more intentional.`,
        action: `Choose one change in ${pillar} that removes confusion (headline, positioning line, CTA, proof point) and implement it this week.`,
      };
    }
    return {
      strength: `There’s meaningful upside in your ${pillar} — improving this will lift the whole system.`,
      opportunity: `Right now this pillar likely creates friction or uncertainty for new customers.`,
      action: `Start with one high-impact fix in ${pillar} (clarify the offer, simplify the narrative, add proof, or improve CTAs) and measure the change.`,
    };
  };

  return {
    positioning: mk("positioning", pillarScores.positioning ?? 0),
    messaging: mk("messaging", pillarScores.messaging ?? 0),
    visibility: mk("visibility", pillarScores.visibility ?? 0),
    credibility: mk("credibility", pillarScores.credibility ?? 0),
    conversion: mk("conversion", pillarScores.conversion ?? 0),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const snapshotInput = body.answers || {};
    const scores = calculateBrandSnapshotScores(snapshotInput);
    const supabase = supabaseServer();

    // Use report_id (string) as the public identifier everywhere in the app
    const report_id = randomUUID();

    const pillar_insights =
      body.pillar_insights ||
      buildPillarInsightsFromScores(scores.pillarScores as any);

    const { data, error } = await supabase
      .from("brand_snapshot_reports")
      .insert({
        report_id,
        user_email: body.email?.toLowerCase() ?? null,
        user_name: body.name ?? null,
        brand_alignment_score: scores.brandAlignmentScore,
        pillar_scores: scores.pillarScores,
        pillar_insights,
        recommendations: scores.recommendations,
        full_report: {
          answers: body.answers || {},
          scores,
          insights: scores.insights,
        },
      } as any)
      .select("report_id")
      .single();

    if (error || !data) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to save snapshot" },
        { status: 500 }
      );
    }

    const userEmail = body.email?.toLowerCase?.();
    if (userEmail && process.env.ACTIVE_CAMPAIGN_WEBHOOK) {
      const coverage = buildContextCoverageMap(snapshotInput);

      const primaryPillar = getPrimaryPillar(scores.pillarScores as any);

      await triggerUpgradeEmails({
        email: userEmail,
        coverage,
        primaryPillar,
      });
    }

    return NextResponse.json({ reportId: (data as any).report_id });
  } catch (err: any) {
    console.error("[Snapshot API] Error:", err);
    return NextResponse.json(
      { error: "Failed to process snapshot" },
      { status: 500 }
    );
  }
}


