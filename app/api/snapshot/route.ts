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
import { fireACEvent } from "@/lib/fireACEvent";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://app.brandsnapshot.ai";

function buildSummary(
  scores: { brandAlignmentScore: number; pillarScores: Record<string, number> },
  insights: string[],
  companyName?: string | null
): string {
  const name = companyName ? `${companyName}'s ` : "Your ";
  const score = scores.brandAlignmentScore;
  if (score >= 70) {
    return `${name}brand shows strong alignment (${score}/100). The biggest opportunities are in the areas where the score suggests refinement—focusing there will compound your existing strengths.`;
  }
  if (score >= 50) {
    return `${name}brand has a solid foundation (${score}/100). Prioritizing the recommendations below will help clarify positioning, messaging, and conversion so you can grow with confidence.`;
  }
  return `${name}Brand Alignment Score™ (${score}/100) highlights specific areas to strengthen. The recommendations below are tailored to your results and will help establish credibility and drive growth.`;
}

function buildOpportunitiesSummary(
  recommendations: string[],
  pillarScores: Record<string, number>
): string {
  const weakPillars = (Object.entries(pillarScores) as [string, number][])
    .filter(([, v]) => v < 14)
    .map(([k]) => k);
  if (weakPillars.length === 0) {
    return "Your five pillars are in good shape. Keep documenting what works and apply it consistently across channels.";
  }
  if (recommendations.length >= 2) {
    return `Your biggest opportunities are in ${weakPillars.slice(0, 2).join(" and ")}. Addressing these first will have the highest impact on how your brand is perceived and how well it converts.`;
  }
  return `Focusing on ${weakPillars[0]} will strengthen your overall brand alignment and help you show up more clearly to your ideal customers.`;
}

function buildUpgradeCta(
  primaryPillar: string,
  companyName?: string | null
): string {
  const pillarLabel = primaryPillar.charAt(0).toUpperCase() + primaryPillar.slice(1);
  const name = companyName ? ` For ${companyName}, ` : " ";
  return `Your top opportunity is ${pillarLabel}.${name}Snapshot+™ gives you a detailed roadmap, persona-aligned messaging, and actionable next steps so you can improve this pillar and your overall score.`;
}

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
  // ─── Security: Rate limit + request size ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AI_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "snapshot", rateLimit: AI_RATE_LIMIT, maxBodySize: 200_000 });
  if (!guard.passed) return guard.errorResponse;

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

    const companyName =
      body.companyName || body.businessName || body.brandName || null;
    const primaryResult = getPrimaryPillar(scores.pillarScores as any);
    const primaryPillar =
      primaryResult.type === "tie"
        ? primaryResult.pillars?.[0] ?? primaryResult.pillar
        : primaryResult.pillar;

    const summary = buildSummary(
      scores,
      scores.insights,
      companyName
    );
    const opportunities_summary = buildOpportunitiesSummary(
      scores.recommendations,
      scores.pillarScores as Record<string, number>
    );
    const upgrade_cta = buildUpgradeCta(primaryPillar ?? "positioning", companyName);

    // ─── Benchmark Collection (anonymized, non-blocking) ───
    try {
      const { recordBenchmarkData } = await import("@/lib/benchmarkCollector");
      await recordBenchmarkData({
        brandAlignmentScore: scores.brandAlignmentScore,
        pillarScores: scores.pillarScores as any,
        primaryPillar,
        industry: snapshotInput.industry ?? null,
        audienceType: snapshotInput.audienceType ?? null,
        geographicScope: snapshotInput.geographicScope ?? null,
        revenueRange: snapshotInput.revenueRange ?? null,
        teamSize: snapshotInput.teamSize ?? null,
        yearsInBusiness: snapshotInput.yearsInBusiness ?? null,
        hasBrandGuidelines: snapshotInput.hasBrandGuidelines ?? null,
        hasWebsite: !!snapshotInput.website,
        previousBrandWork: snapshotInput.previousBrandWork ?? null,
      });
    } catch (benchErr) {
      console.warn("[Snapshot API] Benchmark collection failed (non-blocking):", benchErr);
    }

    // ─── Benchmark Query: Fetch peer data for paid reports (non-blocking) ───
    let benchmarkContext: string | null = null;
    try {
      const { getFullBenchmarkReport, formatBenchmarkContext } = await import("@/lib/benchmarkCollector");
      const benchmarkReport = await getFullBenchmarkReport({
        brandAlignmentScore: scores.brandAlignmentScore,
        pillarScores: scores.pillarScores as any,
        industry: snapshotInput.industry ?? undefined,
        audienceType: snapshotInput.audienceType ?? undefined,
        revenueRange: snapshotInput.revenueRange ?? undefined,
      });
      benchmarkContext = formatBenchmarkContext(benchmarkReport);
    } catch (benchQueryErr) {
      console.warn("[Snapshot API] Benchmark query failed (non-blocking):", benchQueryErr);
    }

    // ─── Save Report ───
    const { data, error } = await supabase
      .from("brand_snapshot_reports")
      .insert({
        report_id,
        user_email: body.email?.toLowerCase() ?? null,
        user_name: body.name ?? null,
        company_name: companyName,
        brand_alignment_score: scores.brandAlignmentScore,
        pillar_scores: scores.pillarScores,
        pillar_insights,
        recommendations: scores.recommendations,
        summary,
        opportunities_summary,
        upgrade_cta,
        full_report: {
          answers: body.answers || {},
          scores,
          insights: scores.insights,
          servicesInterest: snapshotInput.servicesInterest ?? null,
          expertConversation: snapshotInput.expertConversation ?? null,
          contentOptIn: snapshotInput.contentOptIn ?? null,
          benchmarkContext: benchmarkContext ?? null,
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

      const reportLink = `${BASE_URL}/brand-snapshot/results/${report_id}`;
      const acFields: Record<string, string | number> = {
        company_name: companyName ?? "",
        brand_alignment_score: scores.brandAlignmentScore,
        positioning_score: scores.pillarScores.positioning ?? 0,
        messaging_score: scores.pillarScores.messaging ?? 0,
        visibility_score: scores.pillarScores.visibility ?? 0,
        credibility_score: scores.pillarScores.credibility ?? 0,
        conversion_score: scores.pillarScores.conversion ?? 0,
        primary_pillar: primaryPillar ?? "positioning",
      };
      if (process.env.AC_FIELD_REPORT_LINK) {
        acFields[process.env.AC_FIELD_REPORT_LINK] = reportLink;
      }

      // Build AC tags — include services interest signals from assessment
      const acTags: string[] = ["purchased:snapshot"];

      const servicesInterest = snapshotInput.servicesInterest;
      if (servicesInterest && servicesInterest !== "not_now") {
        acTags.push("services:interested");
        if (servicesInterest === "managed_marketing") {
          acTags.push("services:managed_marketing");
        } else if (servicesInterest === "consulting") {
          acTags.push("services:consulting");
        } else if (servicesInterest === "both") {
          acTags.push("services:managed_marketing", "services:consulting");
        }
      }

      if (snapshotInput.expertConversation === true) {
        acTags.push("services:expert_call_requested");
      }

      // Content opt-in signals for newsletter/list segmentation
      const contentOptIn = snapshotInput.contentOptIn;
      if (contentOptIn && contentOptIn !== "no_thanks") {
        acTags.push("content:opted_in");
        if (contentOptIn === "marketing_trends") {
          acTags.push("content:marketing_trends");
        } else if (contentOptIn === "ai_updates") {
          acTags.push("content:ai_updates");
        } else if (contentOptIn === "both") {
          acTags.push("content:marketing_trends", "content:ai_updates");
        }
      }

      await fireACEvent({
        email: userEmail,
        eventName: "snapshot_completed",
        tags: acTags,
        fields: acFields,
      });

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


