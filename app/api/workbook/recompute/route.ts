import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import { getWorkbookEditability } from "@/lib/workbookAccess";
import { fireACEvent } from "@/lib/fireACEvent";
import { optimizeSectionsForDelivery } from "@/lib/personalizationOptimizer";

export const runtime = "nodejs";

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function pickFirstText(...values: unknown[]): string {
  for (const value of values) {
    const text = asText(value);
    if (text) return text;
  }
  return "";
}

function isTemplateLike(value: string, businessName: string): boolean {
  const text = value.trim();
  if (!text) return true;
  if (text.includes("This brand") || text.includes("your business") || text.includes("primary buyer persona")) {
    return true;
  }
  if (text.includes("refreshed from workbook")) return true;
  if (businessName && !text.toLowerCase().includes(businessName.toLowerCase()) && text.length < 200) return true;
  return false;
}

function keepOrRegenerate(current: unknown, fallback: string, businessName: string): string {
  const existing = asText(current);
  if (!existing) return fallback;
  return isTemplateLike(existing, businessName) ? fallback : existing;
}

function recomputeReportSections(workbook: Record<string, any>) {
  const current = workbook.custom_sections || {};
  const reportSections = current.report_sections || {};
  const strategic = current.strategic || {};
  const messagingPillars = Array.isArray(workbook.messaging_pillars) ? workbook.messaging_pillars : [];
  const businessName = asText(workbook.business_name) || "This brand";
  const primaryPillar = asText(workbook.primary_pillar) || "messaging";
  const score = Number(workbook.brand_alignment_score || 0);
  const positioning = asText(workbook.positioning_statement);
  const uvp = asText(workbook.unique_value_proposition);
  const differentiation = asText(workbook.competitive_differentiation);
  const tone = asText(workbook.tone_guidelines);
  const audiencePrimary = pickFirstText(
    workbook.primary_audience?.description,
    typeof workbook.primary_audience === "string" ? workbook.primary_audience : "",
    workbook.secondary_audience?.description
  );
  const audience = audiencePrimary || "high-fit buyers";
  const keyDifferentiators = Array.isArray(workbook.key_differentiators)
    ? workbook.key_differentiators
        .map((item: any) => pickFirstText(item?.differentiator, item?.name, item?.summary))
        .filter(Boolean)
    : [];
  const topDifferentiator = keyDifferentiators[0] || differentiation || uvp || positioning;
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
  const contentTypeChannelPlanFallback = [
    `Audience focus: ${audience}.`,
    `Primary conversion message: ${topDifferentiator || `${businessName} solves a high-cost problem with a clear, differentiated approach`}.`,
    "Where buyers look: search (SEO/AEO), social authority content, and nurture email.",
    "Content types by stage: awareness insight content, consideration proof stories, decision offer content.",
    journeyMap ? `Journey map alignment: ${journeyMap}` : "",
    searchPlan ? `Search intent guide: ${searchPlan}` : "",
    competitiveAngle ? `Competitive angle: ${competitiveAngle}` : "",
    "Cadence starter: one authority asset, one proof asset, and one CTA-focused conversion asset each week.",
  ]
    .filter(Boolean)
    .join("\n");
  const strategicSummaryLine =
    swotLine ||
    `${businessName} should protect strengths while closing gaps that block ${primaryPillar.toLowerCase()} performance.`;
  const conversionPriority = pickFirstText(
    reportSections.conversion_strategy,
    uvp,
    topDifferentiator,
    `Lead with differentiated value, immediately support with proof, and close with one clear CTA.`
  );
  const defaultRef = "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Primary ICP;funnelStage=Consideration;matrixCell=primary-icp:consideration:proof-led-asset";

  return {
    ...reportSections,
    executive_summary: keepOrRegenerate(
      reportSections.executive_summary,
      `${businessName} currently scores ${score}/100 on the proprietary WunderBrand Score algorithm. Priority focus is ${primaryPillar}. The fastest path to conversion lift is consistent ${primaryPillar.toLowerCase()} execution for ${audience}.`,
      businessName
    ),
    score_analysis: keepOrRegenerate(
      reportSections.score_analysis,
      `The WunderBrand Score algorithm evaluates positioning, messaging, visibility, credibility, and conversion as one system. ${businessName} should use this as an operating dashboard: improve one weak pillar, then measure downstream conversion impact weekly.`,
      businessName
    ),
    pillar_results: keepOrRegenerate(
      reportSections.pillar_results,
      `${businessName}'s pillar outputs now reflect updated positioning, messaging, voice, audience, and differentiator inputs. Strongest leverage comes from aligning ${topPillars || "core messaging pillars"} to channel-specific proof and CTA language.`,
      businessName
    ),
    strategic_signals: keepOrRegenerate(
      reportSections.strategic_signals,
      strategicSummaryLine,
      businessName
    ),
    competitive_positioning: keepOrRegenerate(
      reportSections.competitive_positioning,
      topDifferentiator
        ? `${businessName} should own a clear market narrative around: ${topDifferentiator}. This claim needs repeated proof across website, sales, and email assets.`
        : `${businessName} should tighten competitive positioning with one defensible promise, one proof pattern, and one disqualifier for poor-fit buyers.`,
      businessName
    ),
    journey_map: keepOrRegenerate(
      reportSections.journey_map,
      `${businessName} should align journey messaging from awareness to advocacy: problem framing first, proof in consideration, and one low-friction CTA per stage for ${audience}.`,
      businessName
    ),
    seo_aeo: keepOrRegenerate(
      reportSections.seo_aeo,
      `SEO/AEO content for ${businessName} should mirror buyer language from ${audience} and target high-intent queries tied to ${topPillars || "your core messaging system"}. Each page needs one explicit conversion path.`,
      businessName
    ),
    conversion_strategy: keepOrRegenerate(
      reportSections.conversion_strategy,
      `${businessName}'s conversion framework: clarity first, proof second, action third. Use one primary CTA, one secondary lower-friction CTA, and objection-aware copy tied to ${conversionPriority}.`,
      businessName
    ),
    email_framework: keepOrRegenerate(
      reportSections.email_framework,
      `${businessName}'s email flow should move buyers from insight to decision: welcome (positioning), nurture (proof + objections), and conversion (offer + CTA) with voice consistency: ${tone || "clear, specific, and confident"}.`,
      businessName
    ),
    social_strategy: keepOrRegenerate(
      reportSections.social_strategy,
      `${businessName}'s social strategy should publish weekly authority and proof content mapped to ${topPillars || "messaging pillars"}, then route qualified intent to focused landing pages.`,
      businessName
    ),
    icp_conversion_intelligence_overview: keepOrRegenerate(
      reportSections.icp_conversion_intelligence_overview,
      `${businessName}'s ICP Conversion Intelligence Framework should define ICP-tier conversion behavior, hook-type performance, channel conversion mechanics, multi-touch sequencing, and stage-transition signals.`,
      businessName
    ),
    content_strategy_conversion_intelligence_reference: keepOrRegenerate(
      reportSections.content_strategy_conversion_intelligence_reference,
      defaultRef,
      businessName
    ),
    email_nurture_conversion_intelligence_reference: keepOrRegenerate(
      reportSections.email_nurture_conversion_intelligence_reference,
      defaultRef,
      businessName
    ),
    paid_media_conversion_intelligence_reference: keepOrRegenerate(
      reportSections.paid_media_conversion_intelligence_reference,
      "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Secondary ICP;funnelStage=Consideration;matrixCell=secondary-icp:consideration:paid-offer-asset",
      businessName
    ),
    social_media_conversion_intelligence_reference: keepOrRegenerate(
      reportSections.social_media_conversion_intelligence_reference,
      "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Primary ICP;funnelStage=Aware;matrixCell=primary-icp:aware:insight-social-post",
      businessName
    ),
    sales_enablement_conversion_intelligence_reference: keepOrRegenerate(
      reportSections.sales_enablement_conversion_intelligence_reference,
      "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Secondary ICP;funnelStage=Decision;matrixCell=secondary-icp:decision:sales-proof-sequence",
      businessName
    ),
    thought_leadership_conversion_intelligence_reference: keepOrRegenerate(
      reportSections.thought_leadership_conversion_intelligence_reference,
      "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Primary ICP;funnelStage=Consideration;matrixCell=primary-icp:consideration:thought-leadership-asset",
      businessName
    ),
    content_type_channel_plan: keepOrRegenerate(
      reportSections.content_type_channel_plan,
      contentTypeChannelPlanFallback,
      businessName
    ),
    implementation_action_plan: keepOrRegenerate(
      reportSections.implementation_action_plan,
      `30 days: finalize ${businessName}'s conversion narrative and publish proof-backed core page copy.\n\n60 days: launch email and social campaigns aligned to messaging pillars (${topPillars || "Core Value, Proof, Differentiation"}) with one CTA per asset.\n\n90 days: optimize channel performance using conversion and pipeline KPIs, then lock execution guardrails for ongoing scale.`,
      businessName
    ),
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
    const optimized = optimizeSectionsForDelivery(recomputedSections, {
      businessName: asText(workbook.business_name),
      audience: pickFirstText(
        workbook.primary_audience?.description,
        typeof workbook.primary_audience === "string" ? workbook.primary_audience : "",
        workbook.secondary_audience?.description
      ),
      differentiator: pickFirstText(
        workbook.competitive_differentiation,
        workbook.unique_value_proposition,
        workbook.positioning_statement
      ),
      primaryPillar: asText(workbook.primary_pillar) || "messaging",
    });
    const customSections = {
      ...(workbook.custom_sections || {}),
      report_sections: optimized.optimizedSections,
      personalization_quality: {
        scope: "recompute",
        optimized_at: new Date().toISOString(),
        changed_keys: optimized.changedKeys,
        overall_score: optimized.quality.overallScore,
        failed_sections: optimized.quality.failedSections,
      },
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
        "https://calendly.com/claudine-wunderbardigital/brand-blueprint-strategy-activation-session" +
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

    return NextResponse.json({
      success: true,
      workbook: updated,
      recomputedSections: optimized.optimizedSections,
      personalizationQuality: optimized.quality,
    });
  } catch (err) {
    logger.error("[Workbook Recompute] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to recompute." }, { status: 500 });
  }
}

