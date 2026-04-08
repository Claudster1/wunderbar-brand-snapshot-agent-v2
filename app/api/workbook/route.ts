// GET  /api/workbook?reportId=xxx  — Fetch workbook (auto-creates from report if missing)
// PATCH /api/workbook               — Save edits to a workbook section

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import { getWorkbookEditability, shouldAutoFinalize } from "@/lib/workbookAccess";
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

function listToText(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((v) => {
      if (typeof v === "string") return v.trim();
      if (v && typeof v === "object") {
        const obj = v as Record<string, unknown>;
        return pickFirstText(
          obj.title,
          obj.name,
          obj.label,
          obj.summary,
          obj.description,
          obj.text
        );
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function buildStrategicSections(engineResults: Record<string, any>): Record<string, string> {
  const swot = engineResults?.swotAnalysis || engineResults?.swot || {};
  const strategicSignals = engineResults?.strategicSignals || {};

  return {
    swot_overview: pickFirstText(swot.summary, strategicSignals.summary),
    swot_strengths: listToText(swot.strengths),
    swot_weaknesses: listToText(swot.weaknesses),
    swot_opportunities: listToText(swot.opportunities),
    swot_threats: listToText(swot.threats),
  };
}

function buildInitialReportSections(
  engineResults: Record<string, any>,
  businessName: string
): Record<string, string> {
  const exec = engineResults?.executiveSummary || {};
  const strategicSignals = engineResults?.strategicSignals || {};
  const positioning = engineResults?.competitivePositioning || {};
  const journey = engineResults?.customerJourneyMap || {};
  const visibility = engineResults?.visibilityAndDiscovery || {};
  const conversion = engineResults?.conversionOptimization || {};
  const social = engineResults?.socialMediaStrategy || {};
  const companyDescription = engineResults?.companyDescription || {};
  const strategicActionPlan = Array.isArray(engineResults?.strategicActionPlan)
    ? engineResults.strategicActionPlan
    : [];
  const actionPlanSummary = strategicActionPlan
    .slice(0, 5)
    .map((item: any, idx: number) => {
      const action = pickFirstText(item?.action, item?.title, item?.focus);
      const outcome = pickFirstText(item?.outcome, item?.why, item?.impact);
      const howTo = Array.isArray(item?.howTo) ? item.howTo.filter(Boolean).slice(0, 2).join("; ") : "";
      const parts = [
        `${idx + 1}. ${action || `Priority action ${idx + 1}`}`,
        outcome ? `Outcome: ${outcome}` : "",
        howTo ? `Steps: ${howTo}` : "",
      ].filter(Boolean);
      return parts.join(" | ");
    })
    .filter(Boolean)
    .join("\n\n");
  const contentTypes = Array.isArray(engineResults?.contentPillars)
    ? engineResults.contentPillars
        .slice(0, 4)
        .map((cp: any) => pickFirstText(cp?.name, cp?.title))
        .filter(Boolean)
        .join(", ")
    : "";
  const competitiveAngle = pickFirstText(
    positioning?.differentiationSummary,
    engineResults?.competitivePositioning?.strategicWhitespace
  );
  const journeySummary = pickFirstText(journey.overview, journey.summary);
  const searchSummary = pickFirstText(visibility.searchStrategy, visibility.aeoStrategy);
  const audienceSummary = pickFirstText(
    engineResults?.audienceClarity?.audienceSignals?.primaryAudience,
    engineResults?.audiencePersonaDefinition?.primaryICP?.summary,
    engineResults?.audiencePersonaDefinition?.primaryICP?.name,
    engineResults?.brandPersona?.personaSummary
  );
  const offerSummary = pickFirstText(
    engineResults?.valuePropositionStatement?.statement,
    engineResults?.brandFoundation?.brandPromise,
    companyDescription?.oneLiner
  );
  const conversionFocus = pickFirstText(
    conversion?.primaryRecommendation,
    conversion?.overview,
    engineResults?.websiteCopyDirection?.homepage?.heroCtaButton
  );
  const company = businessName || "This brand";
  const defaultRefPrimary = "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Primary ICP;funnelStage=Consideration;matrixCell=primary-icp:consideration:proof-led-asset";
  const defaultRefSecondary = "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Secondary ICP;funnelStage=Decision;matrixCell=secondary-icp:decision:offer-page";
  const contentTypeChannelPlan = [
    audienceSummary ? `Audience to convert: ${audienceSummary}` : "",
    offerSummary ? `Offer narrative to reinforce: ${offerSummary}` : "",
    "Where buyers look: search (SEO/AEO), thought leadership social, and nurture email.",
    contentTypes ? `Priority content types: ${contentTypes}.` : "",
    journeySummary ? `Journey mapping: ${journeySummary}` : "",
    searchSummary ? `Search intent guide: ${searchSummary}` : "",
    competitiveAngle ? `Competitive angle: ${competitiveAngle}` : "",
    conversionFocus ? `Conversion emphasis: ${conversionFocus}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    company_description: pickFirstText(
      companyDescription.shortDescription,
      companyDescription.fullBoilerplate,
      companyDescription.oneLiner,
      engineResults?.brandStory?.elevatorPitch
    ),
    executive_summary: pickFirstText(
      exec.synthesis,
      exec.diagnosis,
      `${company} has a clear strategic direction; the highest-value next move is to tighten cross-channel consistency so audience trust converts into pipeline and revenue.`
    ),
    score_analysis: pickFirstText(
      exec.industryBenchmark,
      `${company}'s WunderBrand Score should be used as an operating signal across positioning, messaging, visibility, credibility, and conversion to prioritize highest-impact execution.`
    ),
    pillar_results: pickFirstText(
      listToText(engineResults?.contentPillars),
      listToText(engineResults?.messagingPillars)
    ),
    strategic_signals: pickFirstText(strategicSignals.narrative, strategicSignals.summary),
    competitive_positioning: pickFirstText(positioning.positioningSummary, positioning.differentiationSummary),
    journey_map: pickFirstText(journey.overview, journey.summary),
    seo_aeo: pickFirstText(visibility.searchStrategy, visibility.aeoStrategy),
    conversion_strategy: pickFirstText(
      conversion.overview,
      conversion.primaryRecommendation,
      `${company} should run a single primary CTA path per page, pair it with immediate proof, and use objection-aware copy for the next best action.`
    ),
    email_framework: pickFirstText(
      engineResults?.emailMarketingFramework?.overview,
      `${company} should run a conversion-oriented lifecycle sequence: welcome (positioning), nurture (proof), offer (CTA), and re-engagement (new insight + action).`
    ),
    social_strategy: pickFirstText(
      social.overview,
      `${company} should publish weekly pillar-aligned thought leadership and proof content that moves the audience from attention to intent.`
    ),
    icp_conversion_intelligence_overview: pickFirstText(
      engineResults?.icpConversionIntelligenceFramework?.overview,
      `${company}'s conversion intelligence framework should map ICP-tier behavior, hook performance, channel mechanics, and stage-specific conversion triggers.`
    ),
    content_strategy_conversion_intelligence_reference: pickFirstText(
      engineResults?.contentCalendarFramework?.conversion_intelligence_reference?.matrixCell,
      defaultRefPrimary
    ),
    email_nurture_conversion_intelligence_reference: pickFirstText(
      engineResults?.emailMarketingFramework?.conversion_intelligence_reference?.matrixCell,
      defaultRefPrimary
    ),
    paid_media_conversion_intelligence_reference: pickFirstText(
      engineResults?.paidMediaStrategy?.conversion_intelligence_reference?.matrixCell,
      defaultRefSecondary
    ),
    social_media_conversion_intelligence_reference: pickFirstText(
      engineResults?.socialMediaStrategy?.conversion_intelligence_reference?.matrixCell,
      defaultRefPrimary
    ),
    sales_enablement_conversion_intelligence_reference: pickFirstText(
      engineResults?.salesConversationGuide?.conversion_intelligence_reference?.matrixCell,
      defaultRefSecondary
    ),
    thought_leadership_conversion_intelligence_reference: pickFirstText(
      engineResults?.thoughtLeadershipStrategy?.conversion_intelligence_reference?.matrixCell,
      defaultRefPrimary
    ),
    content_type_channel_plan: contentTypeChannelPlan,
    implementation_action_plan: actionPlanSummary,
  };
}

function buildArchetypeOutputs(engineResults: Record<string, any>): Record<string, string> {
  const archetype = engineResults?.brandArchetypeSystem?.primary || engineResults?.archetype || {};
  const persona = engineResults?.brandPersona || {};
  const voiceSummary = pickFirstText(
    engineResults?.visualVerbalSignals?.voiceSummary,
    persona?.communicationStyle?.tone
  );
  const contentPillars = listToText(engineResults?.contentPillars);

  return {
    messaging_translation: pickFirstText(
      archetype?.howToApply?.messaging,
      archetype?.application,
      voiceSummary
    ),
    visual_translation: pickFirstText(
      archetype?.howToApply?.visuals,
      engineResults?.visualDirection?.visualStyleSummary,
      engineResults?.brandImageryDirection?.photographyStyleDirection
    ),
    content_translation: pickFirstText(
      archetype?.howToApply?.content,
      contentPillars,
      engineResults?.socialMediaStrategy?.overview
    ),
  };
}

function buildInitialWorkbookFromEngineData(params: {
  reportId: string;
  email: string;
  tier: string;
  businessName: string;
  engineResults: Record<string, any>;
}) {
  const { reportId, email, tier, businessName, engineResults } = params;
  const pillarScores = engineResults.pillarScores || {};
  const pillarInsights = engineResults.pillarInsights || {};
  const visualVerbalSignals = engineResults.visualVerbalSignals || {};
  const companyDescription = engineResults.companyDescription || {};
  const strategicSections = buildStrategicSections(engineResults);
  const reportSections = buildInitialReportSections(engineResults, businessName);
  const archetypeOutputs = buildArchetypeOutputs(engineResults);
  const brandAlignmentScore =
    engineResults.brandAlignmentScore ||
    engineResults.executiveSummary?.brandAlignmentScore ||
    0;
  const archetype = engineResults.archetype || engineResults.brandArchetype || engineResults.brandArchetypeSystem?.primary || {};
  const primaryPillar = engineResults.primaryPillar || engineResults.weakestPillar?.pillar || "";
  const audienceSeed = pickFirstText(
    engineResults?.audienceClarity?.audienceSignals?.primaryAudience,
    engineResults?.audiencePersonaDefinition?.primaryICP?.summary,
    engineResults?.brandPersona?.personaSummary
  );
  const differentiatorSeed = pickFirstText(
    engineResults?.competitivePositioning?.differentiationSummary,
    engineResults?.brandFoundation?.brandPromise,
    engineResults?.valuePropositionStatement?.statement
  );
  const optimized = optimizeSectionsForDelivery(reportSections, {
    businessName,
    audience: audienceSeed,
    differentiator: differentiatorSeed,
    primaryPillar: primaryPillar || "messaging",
  });

  return {
    report_id: reportId,
    email: email.toLowerCase(),
    business_name: businessName || "",
    product_tier: tier,
    brand_alignment_score: brandAlignmentScore,
    pillar_scores: pillarScores,
    primary_pillar: primaryPillar,

    // Positioning
    positioning_statement:
      extractFromInsights(pillarInsights, "positioning", "recommendation") ||
      engineResults.brandFoundation?.brandPurpose ||
      "",
    unique_value_proposition:
      extractFromInsights(pillarInsights, "positioning", "insight") ||
      engineResults.brandFoundation?.brandPromise ||
      "",
    competitive_differentiation:
      extractFromInsights(pillarInsights, "positioning", "concreteExample") ||
      engineResults.competitivePositioning?.differentiationSummary ||
      "",

    // Elevator pitches
    elevator_pitch_30s: pickFirstText(
      companyDescription.oneLiner,
      engineResults.brandStory?.elevatorPitch,
      engineResults.brandFoundation?.positioningStatement
    ),
    elevator_pitch_60s: pickFirstText(
      companyDescription.shortDescription,
      companyDescription.fullBoilerplate
    ),
    elevator_pitch_email: pickFirstText(
      companyDescription.proposalIntro,
      companyDescription.industrySpecific
    ),

    // Messaging
    messaging_pillars: buildMessagingPillars(engineResults, pillarInsights),

    // Voice
    brand_voice_attributes: extractVoiceAttributes(pillarInsights, engineResults),
    tone_guidelines: pickFirstText(
      visualVerbalSignals?.toneGuidelines,
      visualVerbalSignals?.voiceSummary,
      engineResults?.brandPersona?.communicationStyle?.tone
    ),
    voice_dos: Array.isArray(engineResults?.brandPersona?.doAndDont?.do)
      ? engineResults.brandPersona.doAndDont.do
          .map((item: any) => pickFirstText(item?.guideline, item?.example))
          .filter(Boolean)
      : [],
    voice_donts: Array.isArray(engineResults?.brandPersona?.doAndDont?.dont)
      ? engineResults.brandPersona.doAndDont.dont
          .map((item: any) => pickFirstText(item?.guideline, item?.example))
          .filter(Boolean)
      : [],
    sample_rewrites: [],

    // Audience
    primary_audience: extractAudienceProfile(engineResults),
    secondary_audience: extractSecondaryAudienceProfile(engineResults),

    // Differentiators
    key_differentiators: extractDifferentiators(engineResults, pillarInsights),

    // Archetype
    brand_archetype: archetype.name || archetype.archetype || "",
    archetype_description: archetype.description || "",
    archetype_application: archetype.application || archetype.howToApply || "",
    custom_sections: {
      strategic: strategicSections,
      archetype_outputs: archetypeOutputs,
      report_sections: optimized.optimizedSections,
      personalization_quality: {
        scope: "seeded",
        optimized_at: new Date().toISOString(),
        changed_keys: optimized.changedKeys,
        overall_score: optimized.quality.overallScore,
        failed_sections: optimized.quality.failedSections,
      },
    },
  };
}

function isBlank(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("description" in obj && typeof obj.description === "string") {
      return obj.description.trim().length === 0;
    }
    return Object.keys(obj).length === 0;
  }
  return false;
}

function mergeMissingWorkbookFields(existing: Record<string, any>, seeded: Record<string, any>) {
  const merged: Record<string, any> = { ...existing };
  const fillableKeys = [
    "positioning_statement",
    "unique_value_proposition",
    "competitive_differentiation",
    "elevator_pitch_30s",
    "elevator_pitch_60s",
    "elevator_pitch_email",
    "messaging_pillars",
    "brand_voice_attributes",
    "tone_guidelines",
    "voice_dos",
    "voice_donts",
    "primary_audience",
    "secondary_audience",
    "key_differentiators",
    "archetype_description",
    "archetype_application",
  ] as const;

  for (const key of fillableKeys) {
    if (isBlank(merged[key]) && !isBlank(seeded[key])) {
      merged[key] = seeded[key];
    }
  }

  const existingCustom = (merged.custom_sections && typeof merged.custom_sections === "object")
    ? merged.custom_sections
    : {};
  const seededCustom = (seeded.custom_sections && typeof seeded.custom_sections === "object")
    ? seeded.custom_sections
    : {};
  const existingStrategic = existingCustom.strategic && typeof existingCustom.strategic === "object" ? existingCustom.strategic : {};
  const seededStrategic = seededCustom.strategic && typeof seededCustom.strategic === "object" ? seededCustom.strategic : {};
  const existingReportSections = existingCustom.report_sections && typeof existingCustom.report_sections === "object" ? existingCustom.report_sections : {};
  const seededReportSections = seededCustom.report_sections && typeof seededCustom.report_sections === "object" ? seededCustom.report_sections : {};
  const existingArchetypeOutputs = existingCustom.archetype_outputs && typeof existingCustom.archetype_outputs === "object"
    ? existingCustom.archetype_outputs
    : {};
  const seededArchetypeOutputs = seededCustom.archetype_outputs && typeof seededCustom.archetype_outputs === "object"
    ? seededCustom.archetype_outputs
    : {};

  const mergedStrategic = { ...existingStrategic };
  for (const key of Object.keys(seededStrategic)) {
    if (isBlank(mergedStrategic[key]) && !isBlank(seededStrategic[key])) {
      mergedStrategic[key] = seededStrategic[key];
    }
  }

  const mergedReportSections = { ...existingReportSections };
  for (const key of Object.keys(seededReportSections)) {
    if (isBlank(mergedReportSections[key]) && !isBlank(seededReportSections[key])) {
      mergedReportSections[key] = seededReportSections[key];
    }
  }

  const mergedArchetypeOutputs = { ...existingArchetypeOutputs };
  for (const key of Object.keys(seededArchetypeOutputs)) {
    if (isBlank(mergedArchetypeOutputs[key]) && !isBlank(seededArchetypeOutputs[key])) {
      mergedArchetypeOutputs[key] = seededArchetypeOutputs[key];
    }
  }

  merged.custom_sections = {
    ...existingCustom,
    strategic: mergedStrategic,
    archetype_outputs: mergedArchetypeOutputs,
    report_sections: mergedReportSections,
  };

  const changed = JSON.stringify(merged) !== JSON.stringify(existing);
  return { merged, changed };
}

function buildSampleWorkbook(reportId: string, email: string) {
  const tier = reportId.includes("blueprint-plus") ? "blueprint_plus" : "blueprint";
  return {
    report_id: reportId,
    email: email.toLowerCase(),
    business_name: "Sample Brand",
    product_tier: tier,
    brand_alignment_score: 72,
    pillar_scores: {},
    primary_pillar: "credibility",
    positioning_statement: "We help B2B teams align strategy with measurable growth.",
    unique_value_proposition: "Strategy depth with execution-ready outputs.",
    competitive_differentiation: "Proof-first brand systems for modern discovery and conversion.",
    elevator_pitch_30s: "We turn brand complexity into clear market momentum.",
    elevator_pitch_60s: "We diagnose and align positioning, messaging, visibility, credibility, and conversion so teams execute with consistency.",
    elevator_pitch_email: "Quick intro: we combine diagnostics with implementation-focused brand strategy.",
    messaging_pillars: [
      {
        title: "Operational Clarity",
        description: "Translate strategy into plain-language outcomes leaders can act on quickly.",
        proof_points: ["Use one core promise per asset", "Lead with decision-ready outcomes"],
      },
      {
        title: "Credible Proof",
        description: "Support claims with specific evidence, examples, and measurable wins.",
        proof_points: ["Cite concrete case outcomes", "Pair every promise with proof"],
      },
      {
        title: "Execution Confidence",
        description: "Show teams exactly how to apply the strategy across channels and stakeholders.",
        proof_points: ["Define channel-specific usage", "Provide reusable message patterns"],
      },
    ],
    brand_voice_attributes: ["Confident", "Clear", "Supportive"],
    tone_guidelines: "Lead with outcomes, avoid hype, stay precise.",
    primary_audience: { description: "B2B founders and marketing leaders." },
    secondary_audience: { description: "Sales and customer success leaders." },
    key_differentiators: [{ differentiator: "Strategy + implementation continuity." }],
    brand_archetype: "The Sage",
    archetype_description: "Expert, practical guidance.",
    archetype_application: "Use across narrative, education, and sales assets.",
    custom_sections: {
      strategic: {
        swot_overview: "Sample SWOT summary.",
        swot_strengths: "Strategic clarity\nStructured methodology",
        swot_weaknesses: "Inconsistent proof placement",
        swot_opportunities: "SEO + AEO authority growth",
        swot_threats: "Specialized competitors",
      },
      archetype_outputs: {
        messaging_translation: "Lead with insight, then practical next steps. Keep language precise, credible, and calm.",
        visual_translation: "Use clean structure, restrained color, and evidence-led visuals that reinforce clarity over hype.",
        content_translation: "Prioritize educational frameworks, proof-backed examples, and recurring thought-leadership angles.",
      },
      report_sections: {
        company_description:
          "Sample Brand helps growth-stage teams clarify brand strategy and execute with consistent, proof-backed messaging across channels.",
        implementation_action_plan:
          "30 days: finalize messaging foundation and publish conversion-ready homepage updates.\n\n60 days: launch 3-email nurture sequence and weekly social cadence tied to top messaging pillars.\n\n90 days: optimize based on performance data, document guardrails, and scale highest-performing channel assets.",
        executive_summary:
          "Sample Brand has a strong strategic foundation but needs tighter cross-channel consistency to turn clarity into sustained pipeline momentum.",
        score_analysis:
          "Current score reflects solid positioning and message quality, with the biggest upside in proof visibility and conversion flow consistency.",
        pillar_results:
          "Positioning and messaging are directionally strong; visibility, credibility, and conversion improve when proof-backed language is applied consistently.",
        strategic_signals:
          "The highest-leverage signal is proof placement: when evidence appears earlier in the buyer journey, trust and conversion efficiency rise together.",
        competitive_positioning:
          "Sample Brand differentiates through a diagnostic-led approach that translates strategy into practical execution for B2B teams.",
        journey_map:
          "Journey stages should align around one narrative: clear problem framing at awareness, proof in consideration, and low-friction CTA at decision.",
        seo_aeo:
          "Prioritize high-intent queries around brand strategy diagnostics and implementation, then reinforce with answer-focused proof snippets.",
        conversion_strategy:
          "Use one primary CTA per page, paired with immediate proof and a lower-friction secondary option for earlier-stage buyers.",
        content_type_channel_plan:
          "Where buyers look: search (SEO/AEO), LinkedIn thought leadership, and nurture email.\nPriority content types: educational frameworks, proof stories, conversion offers.\nJourney mapping: awareness insight content → consideration proof content → decision offer content.\nCompetitive angle: lead with diagnostic clarity and execution depth, not generic branding claims.",
        email_framework:
          "Email should follow the same brand voice: concise, insight-first, and proof-backed with clear next steps.",
        social_strategy:
          "Publish pillar-aligned weekly content cadence with one thought-leadership asset and one proof asset per cycle.",
        icp_conversion_intelligence_overview:
          "Map ICP-specific conversion behavior from first touch to sales handoff. Use this framework as the performance backbone for email, social, paid, thought leadership, and sales enablement execution.",
        content_strategy_conversion_intelligence_reference:
          "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Primary ICP;funnelStage=Aware;matrixCell=primary-icp:aware:authority-article",
        email_nurture_conversion_intelligence_reference:
          "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Primary ICP;funnelStage=Consideration;matrixCell=primary-icp:consideration:nurture-proof-email",
        paid_media_conversion_intelligence_reference:
          "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Secondary ICP;funnelStage=Consideration;matrixCell=secondary-icp:consideration:paid-case-study-cta",
        social_media_conversion_intelligence_reference:
          "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Primary ICP;funnelStage=Aware;matrixCell=primary-icp:aware:insight-social-post",
        sales_enablement_conversion_intelligence_reference:
          "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Secondary ICP;funnelStage=Decision;matrixCell=secondary-icp:decision:sales-proof-deck",
        thought_leadership_conversion_intelligence_reference:
          "type=ref;framework=icp_conversion_intelligence_framework;icpTier=Primary ICP;funnelStage=Consideration;matrixCell=primary-icp:consideration:thought-leadership-brief",
      },
    },
  };
}

// ─── GET: Fetch or auto-create workbook ───
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const reportId = url.searchParams.get("reportId");
  const rawEmail = url.searchParams.get("email");
  const isSampleMode =
    reportId === "preview" || reportId?.startsWith("sample-") || reportId?.startsWith("preview-");
  const email = rawEmail || (isSampleMode ? "preview@wunderbar.ai" : null);

  if (!reportId) {
    return NextResponse.json({ error: "reportId is required." }, { status: 400 });
  }

  // Preview/sample mode: return editable local workbook shape without DB dependency.
  if (isSampleMode) {
    const workbook = buildSampleWorkbook(reportId, email ?? "preview@wunderbar.ai");
    const editability = getWorkbookEditability({
      productTier: workbook.product_tier,
      createdAt: new Date().toISOString(),
      finalizedAt: null,
    });
    return NextResponse.json({ workbook, editability, isSample: true });
  }

  if (!email) {
    return NextResponse.json({ error: "email is required." }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  // Check if workbook already exists
  const { data: existing } = await supabaseAdmin
    .from("brand_workbook")
    .select("*")
    .eq("report_id", reportId)
    .single();

  if (existing) {
    let hydratedWorkbook = existing;

    // Backfill legacy/incomplete workbooks so all sections are populated from report data.
    const needsHydration =
      isBlank(existing.positioning_statement) ||
      isBlank(existing.elevator_pitch_30s) ||
      isBlank(existing.tone_guidelines) ||
      isBlank(existing.primary_audience) ||
      isBlank(existing.key_differentiators) ||
      isBlank(existing.custom_sections?.strategic) ||
      isBlank(existing.custom_sections?.report_sections);

    if (needsHydration) {
      try {
        let sourceTier = existing.product_tier || "blueprint-plus";
        let sourceBusinessName = existing.business_name || "";
        let sourceEngineResults: Record<string, any> = {};

        const { data: snapshotReport } = await supabaseAdmin
          .from("brand_snapshot_reports")
          .select("tier, product_tier, business_name, businessName, engine_results, results")
          .eq("report_id", reportId)
          .eq("email_verified", true)
          .single() as { data: any };

        if (snapshotReport) {
          sourceTier = snapshotReport.tier || snapshotReport.product_tier || sourceTier;
          sourceBusinessName = snapshotReport.business_name || snapshotReport.businessName || sourceBusinessName;
          sourceEngineResults = snapshotReport.engine_results || snapshotReport.results || {};
        } else {
          const { data: blueprintReport } = await supabaseAdmin
            .from("blueprint_reports")
            .select("company_name, tier, report_data")
            .or(`id.eq.${reportId},report_id.eq.${reportId}`)
            .order("created_at", { ascending: false })
            .limit(1)
            .single() as { data: any };

          if (blueprintReport) {
            sourceTier = blueprintReport.tier || sourceTier;
            sourceBusinessName = blueprintReport.company_name || sourceBusinessName;
            sourceEngineResults = blueprintReport.report_data || {};
          } else {
            const { data: blueprintPlusReport } = await supabaseAdmin
              .from("brand_blueprint_plus_reports")
              .select("full_report")
              .eq("report_id", reportId)
              .single() as { data: any };

            if (blueprintPlusReport) {
              sourceTier = "blueprint-plus";
              sourceEngineResults = blueprintPlusReport.full_report || {};
            }
          }
        }

        if (sourceEngineResults && Object.keys(sourceEngineResults).length > 0) {
          const seeded = buildInitialWorkbookFromEngineData({
            reportId,
            email,
            tier: sourceTier,
            businessName: sourceBusinessName,
            engineResults: sourceEngineResults,
          });

          const { merged, changed } = mergeMissingWorkbookFields(existing, seeded);
          if (changed) {
            hydratedWorkbook = merged;
            await supabaseAdmin
              .from("brand_workbook")
              .update({ ...merged, updated_at: new Date().toISOString() })
              .eq("report_id", reportId);
          }
        }
      } catch (hydrationErr) {
        logger.warn("[Workbook] Hydration skipped", {
          reportId,
          error: hydrationErr instanceof Error ? hydrationErr.message : String(hydrationErr),
        });
      }
    }

    // Lazy auto-finalize for Blueprint tier if review window expired
    if (shouldAutoFinalize({
      productTier: hydratedWorkbook.product_tier,
      createdAt: hydratedWorkbook.created_at,
      finalizedAt: hydratedWorkbook.finalized_at,
    })) {
      const now = new Date().toISOString();
      await supabaseAdmin
        .from("brand_workbook")
        .update({ finalized_at: now, updated_at: now })
        .eq("report_id", reportId);
      hydratedWorkbook.finalized_at = now;
    }

    const editability = getWorkbookEditability({
      productTier: hydratedWorkbook.product_tier,
      createdAt: hydratedWorkbook.created_at,
      finalizedAt: hydratedWorkbook.finalized_at,
    });

    return NextResponse.json({ workbook: hydratedWorkbook, editability });
  }

  // Auto-create from the diagnostic report
  try {
    const { data: snapshotReport } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .select("*")
      .eq("report_id", reportId)
      .eq("email_verified", true)
      .single() as { data: any };

    let sourceTier = "snapshot";
    let sourceBusinessName = "";
    let sourceEmail = "";
    let sourceEngineResults: Record<string, any> = {};

    if (snapshotReport) {
      sourceTier = snapshotReport.tier || snapshotReport.product_tier || "snapshot";
      sourceBusinessName = snapshotReport.business_name || snapshotReport.businessName || "";
      sourceEmail = snapshotReport.email || snapshotReport.user_email || "";
      sourceEngineResults = snapshotReport.engine_results || snapshotReport.results || {};
    } else {
      // Fallback 1: blueprint_reports (Blueprint / Blueprint+)
      const { data: blueprintReport } = await supabaseAdmin
        .from("blueprint_reports")
        .select("id, report_id, user_email, company_name, tier, report_data")
        .or(`id.eq.${reportId},report_id.eq.${reportId}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single() as { data: any };

      if (blueprintReport) {
        sourceTier = blueprintReport.tier || "blueprint-plus";
        sourceBusinessName = blueprintReport.company_name || "";
        sourceEmail = blueprintReport.user_email || "";
        sourceEngineResults = blueprintReport.report_data || {};
      } else {
        // Fallback 2: brand_blueprint_plus_reports
        const { data: blueprintPlusReport } = await supabaseAdmin
          .from("brand_blueprint_plus_reports")
          .select("report_id, user_email, full_report")
          .eq("report_id", reportId)
          .single() as { data: any };

        if (blueprintPlusReport) {
          sourceTier = "blueprint-plus";
          sourceBusinessName = blueprintPlusReport.full_report?.businessName || "";
          sourceEmail = blueprintPlusReport.user_email || "";
          sourceEngineResults = blueprintPlusReport.full_report || {};
        }
      }
    }

    if (!sourceEngineResults || Object.keys(sourceEngineResults).length === 0) {
      return NextResponse.json({ error: "Report not found or not verified." }, { status: 404 });
    }

    // Verify email matches
    if (sourceEmail && sourceEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    // Check tier — workbook is Blueprint+ only (or Blueprint for limited version)
    const tier = sourceTier;
    if (!["blueprint_plus", "blueprint-plus", "blueprint", "blueprint_plus_paid"].includes(tier)) {
      return NextResponse.json({
        error: "The Brand Workbook is available for WunderBrand Blueprint™ and Blueprint+™ customers.",
      }, { status: 403 });
    }

    const workbook = buildInitialWorkbookFromEngineData({
      reportId,
      email,
      tier,
      businessName: sourceBusinessName,
      engineResults: sourceEngineResults,
    });

    const { data: created, error: insertErr } = await supabaseAdmin
      .from("brand_workbook")
      .insert(workbook)
      .select("*")
      .single();

    if (insertErr) {
      logger.error("[Workbook] Create failed", { error: insertErr.message });
      return NextResponse.json({ error: "Failed to create workbook." }, { status: 500 });
    }

    const editability = getWorkbookEditability({
      productTier: tier,
      createdAt: created.created_at,
      finalizedAt: null,
    });

    return NextResponse.json({ workbook: created, isNew: true, editability });
  } catch (err) {
    logger.error("[Workbook] Auto-create error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to load workbook." }, { status: 500 });
  }
}

/** Deep-merge custom_sections so partial PATCH cannot drop workbook_tab_versions or other tabs. */
function mergeWorkbookCustomSections(
  existing: Record<string, unknown> | null | undefined,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  const base = existing && typeof existing === "object" ? { ...existing } : {};
  const next: Record<string, unknown> = { ...base, ...incoming };
  const baseTab =
    base.workbook_tab_sections && typeof base.workbook_tab_sections === "object"
      ? { ...(base.workbook_tab_sections as Record<string, string>) }
      : {};
  const incTab =
    incoming.workbook_tab_sections && typeof incoming.workbook_tab_sections === "object"
      ? (incoming.workbook_tab_sections as Record<string, string>)
      : {};
  if (Object.keys(incTab).length > 0) {
    next.workbook_tab_sections = { ...baseTab, ...incTab };
  }
  if (!Array.isArray(incoming.workbook_tab_versions) && Array.isArray(base.workbook_tab_versions)) {
    next.workbook_tab_versions = base.workbook_tab_versions;
  }
  return next;
}

// ─── PATCH: Save edits ───
export async function PATCH(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const guard = apiGuard(req, { routeId: "workbook-save" });
  if (!guard.passed) return guard.errorResponse;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { reportId, email, updates } = body;

    if (!reportId || !email || !updates || typeof updates !== "object") {
      return NextResponse.json({ error: "reportId, email, and updates are required." }, { status: 400 });
    }

    // Verify ownership and check editability
    const { data: workbook } = await supabaseAdmin
      .from("brand_workbook")
      .select("id, email, product_tier, created_at, finalized_at, custom_sections")
      .eq("report_id", reportId)
      .single();

    if (!workbook) {
      return NextResponse.json({ error: "Workbook not found." }, { status: 404 });
    }
    if (workbook.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const editability = getWorkbookEditability({
      productTier: workbook.product_tier,
      createdAt: workbook.created_at,
      finalizedAt: workbook.finalized_at,
    });

    if (!editability.canEdit) {
      return NextResponse.json({
        error: "This workbook is read-only.",
        reason: editability.reason,
        isFinalized: editability.isFinalized,
      }, { status: 403 });
    }

    // Whitelist of editable fields
    const EDITABLE_FIELDS = [
      "positioning_statement", "unique_value_proposition", "competitive_differentiation",
      "elevator_pitch_30s", "elevator_pitch_60s", "elevator_pitch_email",
      "messaging_pillars",
      "brand_voice_attributes", "tone_guidelines", "voice_dos", "voice_donts", "sample_rewrites",
      "primary_audience", "secondary_audience",
      "key_differentiators",
      "custom_sections", "business_name",
      "brand_standards_data",
    ];

    const safeUpdates: Record<string, unknown> = {};
    for (const key of EDITABLE_FIELDS) {
      if (key in updates) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    if (safeUpdates.custom_sections && typeof safeUpdates.custom_sections === "object") {
      safeUpdates.custom_sections = mergeWorkbookCustomSections(
        workbook.custom_sections as Record<string, unknown> | undefined,
        safeUpdates.custom_sections as Record<string, unknown>,
      );
    }

    safeUpdates.updated_at = new Date().toISOString();

    const { error: updateErr } = await supabaseAdmin
      .from("brand_workbook")
      .update(safeUpdates)
      .eq("report_id", reportId);

    if (updateErr) {
      logger.error("[Workbook] Update failed", { error: updateErr.message });
      return NextResponse.json({ error: "Failed to save." }, { status: 500 });
    }

    return NextResponse.json({ success: true, updatedFields: Object.keys(safeUpdates) });
  } catch (err) {
    logger.error("[Workbook] PATCH error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
}

// ─── Helper: Extract text from pillar insights ───
function extractFromInsights(
  insights: Record<string, any>,
  pillar: string,
  field: string
): string {
  const pillarData = insights[pillar];
  if (!pillarData) return "";
  if (typeof pillarData === "string") return "";
  return pillarData[field] || "";
}

// ─── Helper: Build messaging pillars from insights ───
function buildMessagingPillars(engineResults: Record<string, any>, insights: Record<string, any>): Array<{
  title: string;
  description: string;
  proof_points: string[];
}> {
  const candidateLists: unknown[] = [
    engineResults?.messagingPillars,
    engineResults?.messaging_pillars,
    engineResults?.messagingFramework?.messagingPillars,
    engineResults?.messagingFramework?.pillars,
    engineResults?.messaging_framework?.messaging_pillars,
    engineResults?.messaging_framework?.pillars,
    engineResults?.brandMessaging?.messagingPillars,
    engineResults?.brandMessaging?.pillars,
    engineResults?.brand_messaging?.messaging_pillars,
    engineResults?.brand_messaging?.pillars,
  ];

  const rawPillars = candidateLists.find((v) => Array.isArray(v) && v.length > 0) as Array<any> | undefined;
  if (Array.isArray(rawPillars) && rawPillars.length > 0) {
    const normalized = rawPillars
      .map((pillar: any, idx: number) => {
        if (typeof pillar === "string") {
          return {
            title: `Messaging Pillar ${idx + 1}`,
            description: pillar.trim(),
            proof_points: [] as string[],
          };
        }
        const title =
          pillar?.name ||
          pillar?.title ||
          pillar?.pillar ||
          `Messaging Pillar ${idx + 1}`;
        const description =
          pillar?.whatItCommunicates ||
          pillar?.description ||
          pillar?.summary ||
          pillar?.exampleMessage ||
          pillar?.whyItMatters ||
          pillar?.detail ||
          "";
        const proofPoints = Array.isArray(pillar?.proofPoints)
          ? pillar.proofPoints
          : Array.isArray(pillar?.proof_points)
            ? pillar.proof_points
            : [];
        return {
          title: String(title).trim(),
          description: String(description).trim(),
          proof_points: proofPoints.map((p: any) => String(p).trim()).filter(Boolean),
        };
      })
      .filter((p) => p.title || p.description || p.proof_points.length > 0);
    if (normalized.length > 0) return normalized;
  }

  const messagingInsight = insights?.messaging;
  if (messagingInsight && typeof messagingInsight === "object") {
    const fallback = [
      messagingInsight.insight,
      messagingInsight.recommendation,
      ...(Array.isArray(messagingInsight.actionItems) ? messagingInsight.actionItems : []),
    ]
      .map((v: any) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean)
      .slice(0, 4)
      .map((text, idx) => ({
        title: `Messaging Pillar ${idx + 1}`,
        description: text,
        proof_points: [] as string[],
      }));
    if (fallback.length > 0) return fallback;
  }

  return [];
}

// ─── Helper: Extract voice attributes ───
function extractVoiceAttributes(insights: Record<string, any>, results: Record<string, any>): string[] {
  const messaging = insights.messaging;
  if (messaging?.voiceAttributes && Array.isArray(messaging.voiceAttributes)) {
    return messaging.voiceAttributes;
  }
  if (Array.isArray(results?.visualVerbalSignals?.voiceTraits)) {
    return results.visualVerbalSignals.voiceTraits.map((v: any) => String(v).trim()).filter(Boolean);
  }
  return [];
}

// ─── Helper: Extract audience profile ───
function extractAudienceProfile(results: Record<string, any>): Record<string, unknown> | null {
  const target = results.targetAudience || results.targetAudienceProfile || results.target_audience;
  if (target) {
    return typeof target === "string"
      ? { description: target, pain_points: [], decision_triggers: [] }
      : target;
  }
  const firstSegment = Array.isArray(results?.audienceSignals?.segments)
    ? results.audienceSignals.segments[0]
    : null;
  if (firstSegment) {
    return {
      description: pickFirstText(firstSegment.label, firstSegment.summary, firstSegment.description),
      pain_points: Array.isArray(firstSegment.painPoints) ? firstSegment.painPoints : [],
      decision_triggers: Array.isArray(firstSegment.decisionTriggers) ? firstSegment.decisionTriggers : [],
    };
  }
  return null;
}

function extractSecondaryAudienceProfile(results: Record<string, any>): Record<string, unknown> | null {
  const secondSegment = Array.isArray(results?.audienceSignals?.segments)
    ? results.audienceSignals.segments[1]
    : null;
  if (!secondSegment) return null;
  return {
    description: pickFirstText(secondSegment.label, secondSegment.summary, secondSegment.description),
    pain_points: Array.isArray(secondSegment.painPoints) ? secondSegment.painPoints : [],
    decision_triggers: Array.isArray(secondSegment.decisionTriggers) ? secondSegment.decisionTriggers : [],
  };
}

// ─── Helper: Extract differentiators ───
function extractDifferentiators(
  results: Record<string, any>,
  insights: Record<string, any>
): Array<{ differentiator: string; competitive_advantage: string; proof: string }> {
  const positioning = insights.positioning;
  if (positioning?.differentiators && Array.isArray(positioning.differentiators)) {
    return positioning.differentiators;
  }
  if (Array.isArray(results?.competitivePositioning?.differentiators)) {
    return results.competitivePositioning.differentiators.map((item: any) => ({
      differentiator: pickFirstText(item?.title, item?.name, item?.differentiator),
      competitive_advantage: pickFirstText(item?.advantage, item?.summary, item?.description),
      proof: pickFirstText(item?.proof, item?.example),
    }));
  }
  const differentiationSummary = pickFirstText(results?.competitivePositioning?.differentiationSummary);
  if (differentiationSummary) {
    return [{ differentiator: differentiationSummary, competitive_advantage: "", proof: "" }];
  }
  return [];
}
