import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import { getWorkbookEditability } from "@/lib/workbookAccess";
import { fireACEvent } from "@/lib/fireACEvent";

export const runtime = "nodejs";

function recomputeReportSections(workbook: Record<string, any>) {
  const current = workbook.custom_sections || {};
  const reportSections = current.report_sections || {};
  const strategic = current.strategic || {};
  const messagingPillars = Array.isArray(workbook.messaging_pillars) ? workbook.messaging_pillars : [];
  const topPillars = messagingPillars
    .slice(0, 3)
    .map((p: any) => String(p?.title || "").trim())
    .filter(Boolean)
    .join(", ");

  const swotLine = [
    strategic.swot_strengths ? `Strengths: ${String(strategic.swot_strengths).split("\n")[0]}` : "",
    strategic.swot_weaknesses ? `Weaknesses: ${String(strategic.swot_weaknesses).split("\n")[0]}` : "",
    strategic.swot_opportunities ? `Opportunities: ${String(strategic.swot_opportunities).split("\n")[0]}` : "",
    strategic.swot_threats ? `Threats: ${String(strategic.swot_threats).split("\n")[0]}` : "",
  ].filter(Boolean).join(" | ");
  const journeyMap = String(reportSections.journey_map || "").trim();
  const searchPlan = String(reportSections.seo_aeo || "").trim();
  const competitiveAngle =
    String(reportSections.competitive_positioning || "").trim() ||
    String(workbook.competitive_differentiation || "").trim();
  const audience =
    String(workbook.primary_audience?.description || "").trim() ||
    "primary buyer persona";
  const contentTypeChannelPlanFallback = [
    `Audience focus: ${audience}.`,
    "Where buyers look: search (SEO/AEO), social thought leadership, and nurture email.",
    "Content types by stage: awareness insights, consideration proof stories, decision offer content.",
    journeyMap ? `Journey map alignment: ${journeyMap}` : "",
    searchPlan ? `Search intent guide: ${searchPlan}` : "",
    competitiveAngle ? `Competitive angle: ${competitiveAngle}` : "",
    "Cadence starter: LinkedIn 3x/week, Instagram 2x/week, Email 1x/week, Search brief 1x/week.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    ...reportSections,
    executive_summary:
      reportSections.executive_summary ||
      `${workbook.business_name || "This brand"} currently scores ${workbook.brand_alignment_score || 0}/100. Priority focus: ${workbook.primary_pillar || "positioning"}.`,
    score_analysis:
      reportSections.score_analysis ||
      `Current alignment score is ${workbook.brand_alignment_score || 0}. Increase consistency across messaging, proof, and conversion narratives to improve results.`,
    pillar_results:
      reportSections.pillar_results ||
      `Pillar outputs now reflect updated workbook entries for positioning, messaging, voice, audience, and differentiators.`,
    strategic_signals:
      reportSections.strategic_signals ||
      (swotLine || "Strategic signals refreshed from workbook edits."),
    competitive_positioning:
      reportSections.competitive_positioning ||
      (workbook.competitive_differentiation || "Competitive positioning refreshed from workbook data."),
    journey_map:
      reportSections.journey_map ||
      `Journey copy should stay aligned from awareness through advocacy with one clear CTA narrative per stage.`,
    seo_aeo:
      reportSections.seo_aeo ||
      `SEO and AEO themes should map to updated messaging pillars and audience language.`,
    conversion_strategy:
      reportSections.conversion_strategy ||
      `Conversion copy should prioritize clarity first, then proof, then a single action.`,
    email_framework:
      reportSections.email_framework ||
      `Email framework should mirror brand voice and emphasize actionable outcomes.`,
    social_strategy:
      reportSections.social_strategy ||
      `Social strategy should reinforce the archetype and pillar system weekly.`,
    content_type_channel_plan:
      reportSections.content_type_channel_plan ||
      contentTypeChannelPlanFallback,
    implementation_action_plan:
      reportSections.implementation_action_plan ||
      `30 days: finalize positioning and publish proof-backed core page copy.\n\n60 days: launch email and social campaigns aligned to messaging pillars (${topPillars || "Core Value, Proof, Differentiation"}).\n\n90 days: optimize channel performance and document execution guardrails for ongoing scale.`,
  };
}

export async function POST(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const guard = apiGuard(req, { routeId: "workbook-recompute" });
  if (!guard.passed) return guard.errorResponse;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  try {
    const { reportId, email } = await req.json();
    if (!reportId || !email) {
      return NextResponse.json({ error: "reportId and email are required." }, { status: 400 });
    }

    const { data: workbook } = await supabaseAdmin
      .from("brand_workbook")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (!workbook) {
      return NextResponse.json({ error: "Workbook not found." }, { status: 404 });
    }
    if (workbook.email?.toLowerCase() !== String(email).toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const editability = getWorkbookEditability({
      productTier: workbook.product_tier,
      createdAt: workbook.created_at,
      finalizedAt: workbook.finalized_at,
    });
    if (!editability.canEdit) {
      return NextResponse.json({ error: "Workbook is read-only.", reason: editability.reason }, { status: 403 });
    }

    const recomputedSections = recomputeReportSections(workbook);
    const customSections = {
      ...(workbook.custom_sections || {}),
      report_sections: recomputedSections,
      recomputed_at: new Date().toISOString(),
    };

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("brand_workbook")
      .update({
        custom_sections: customSections,
        updated_at: new Date().toISOString(),
      })
      .eq("report_id", reportId)
      .select("*")
      .single();

    if (updateErr) {
      logger.error("[Workbook Recompute] Update failed", { error: updateErr.message });
      return NextResponse.json({ error: "Failed to recompute." }, { status: 500 });
    }

    // Non-blocking nurture trigger: let ActiveCampaign send "updated version ready"
    // and Blueprint+ strategy/session nudges after meaningful workbook updates.
    try {
      const normalizedEmail = String(email).toLowerCase();
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        "https://app.wunderbrand.ai";
      const tierSlug = String(workbook.product_tier || "blueprint_plus").replace(/_/g, "-");
      const reportLink = `${baseUrl}/report/${encodeURIComponent(reportId)}`;
      const workbookLink = `${baseUrl}/workbook?reportId=${encodeURIComponent(reportId)}&email=${encodeURIComponent(normalizedEmail)}`;
      const strategyActivationLink =
        "https://calendly.com/wunderbardigital/brand-strategy-activation" +
        "?utm_source=wunderbrand_app&utm_medium=email&utm_campaign=workbook_updated" +
        "&utm_content=strategy_activation";

      const eventTags = [
        "workbook:updated",
        `workbook:updated:${tierSlug}`,
        ...(tierSlug === "blueprint-plus" ? ["session:pending", "nurture:other-services"] : []),
      ];

      await fireACEvent({
        email: normalizedEmail,
        eventName: "workbook_recomputed",
        tags: eventTags,
        fields: {
          report_id: String(reportId),
          product_tier: tierSlug,
          report_link: reportLink,
          workbook_link: workbookLink,
          strategy_activation_link: strategyActivationLink,
          workbook_updated_at: customSections.recomputed_at,
        },
      });
    } catch (acErr) {
      logger.warn("[Workbook Recompute] AC event failed", {
        error: acErr instanceof Error ? acErr.message : String(acErr),
      });
    }

    return NextResponse.json({ success: true, workbook: updated, recomputedSections });
  } catch (err) {
    logger.error("[Workbook Recompute] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to recompute." }, { status: 500 });
  }
}

