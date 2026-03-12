// app/api/blueprint/pdf/route.tsx
// Generates any Blueprint/Blueprint+ document PDF by type.
// GET /api/blueprint/pdf?reportId=xxx&type=complete|executive|messaging|prompts|voice-checklist|activation|digital|competitive|standards&tier=blueprint|blueprint-plus

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import React from "react";
import { supabaseServer } from "@/lib/supabase";
import type { BlueprintEngineOutput } from "@/src/pdf/types/blueprintReport";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_TYPES = ["complete", "executive", "messaging", "prompts", "voice-checklist", "activation", "digital", "competitive", "standards"] as const;
type DocType = (typeof VALID_TYPES)[number];
type WorkbookShape = Record<string, any>;

const BLUEPRINT_TYPES: DocType[] = ["complete", "executive", "messaging", "prompts", "voice-checklist"];
const BLUEPRINT_PLUS_TYPES: DocType[] = ["complete", "executive", "messaging", "prompts", "voice-checklist", "activation", "digital", "competitive", "standards"];

const DOC_LABELS: Record<DocType, string> = {
  complete: "Complete_Blueprint",
  executive: "Executive_Summary",
  messaging: "Messaging_Playbook",
  prompts: "AI_Prompt_Library",
  "voice-checklist": "Voice_Do_Dont_Checklist",
  activation: "90_Day_Activation_Plan",
  digital: "Digital_Marketing_Strategy",
  competitive: "Competitive_Intelligence_Brief",
  standards: "Brand_Standards_Guide",
};

function applyWorkbookOverrides(data: BlueprintEngineOutput, workbook?: WorkbookShape | null): BlueprintEngineOutput {
  if (!workbook) return data;

  const next: any = {
    ...(data as any),
    brandFoundation: { ...((data as any).brandFoundation || {}) },
    companyDescription: { ...((data as any).companyDescription || {}) },
    competitivePositioning: { ...((data as any).competitivePositioning || {}) },
    visualVerbalSignals: { ...((data as any).visualVerbalSignals || {}) },
    brandPersona: { ...((data as any).brandPersona || {}) },
    brandStory: { ...((data as any).brandStory || {}) },
    audienceSignals: { ...((data as any).audienceSignals || {}) },
    executiveSummary: { ...((data as any).executiveSummary || {}) },
    customerJourneyMap: { ...((data as any).customerJourneyMap || {}) },
    visibilityAndDiscovery: { ...((data as any).visibilityAndDiscovery || {}) },
    conversionOptimization: { ...((data as any).conversionOptimization || {}) },
    emailMarketingFramework: { ...((data as any).emailMarketingFramework || {}) },
    socialMediaStrategy: { ...((data as any).socialMediaStrategy || {}) },
    strategicSignals: { ...((data as any).strategicSignals || {}) },
    swotAnalysis: { ...((data as any).swotAnalysis || {}) },
    brandStrategyRollout: { ...((data as any).brandStrategyRollout || {}) },
  };

  const reportSections = workbook?.custom_sections?.report_sections || {};
  const strategic = workbook?.custom_sections?.strategic || {};

  if (typeof workbook.positioning_statement === "string" && workbook.positioning_statement.trim()) {
    next.brandFoundation.positioningStatement = workbook.positioning_statement.trim();
  }
  if (typeof workbook.unique_value_proposition === "string" && workbook.unique_value_proposition.trim()) {
    next.brandFoundation.differentiationNarrative = workbook.unique_value_proposition.trim();
  }
  if (typeof workbook.competitive_differentiation === "string" && workbook.competitive_differentiation.trim()) {
    next.competitivePositioning.differentiationSummary = workbook.competitive_differentiation.trim();
  }
  if (typeof workbook.elevator_pitch_30s === "string" && workbook.elevator_pitch_30s.trim()) {
    next.brandStory.elevatorPitch = workbook.elevator_pitch_30s.trim();
    next.companyDescription.oneLiner = workbook.elevator_pitch_30s.trim();
  }
  if (typeof workbook.elevator_pitch_60s === "string" && workbook.elevator_pitch_60s.trim()) {
    next.companyDescription.shortDescription = workbook.elevator_pitch_60s.trim();
  }
  if (typeof workbook.elevator_pitch_email === "string" && workbook.elevator_pitch_email.trim()) {
    next.companyDescription.proposalIntro = workbook.elevator_pitch_email.trim();
  }
  if (Array.isArray(workbook.messaging_pillars) && workbook.messaging_pillars.length > 0) {
    next.messagingPillars = workbook.messaging_pillars.map((item: any) => ({
      name: item?.title || item?.name || "Messaging Pillar",
      whatItCommunicates: item?.description || "",
      exampleMessage: Array.isArray(item?.proof_points) ? item.proof_points[0] || "" : "",
      proofPoints: Array.isArray(item?.proof_points) ? item.proof_points : [],
    }));
  }
  if (Array.isArray(workbook.brand_voice_attributes) && workbook.brand_voice_attributes.length > 0) {
    next.visualVerbalSignals.voiceTraits = workbook.brand_voice_attributes;
  }
  if (typeof workbook.tone_guidelines === "string" && workbook.tone_guidelines.trim()) {
    next.visualVerbalSignals.toneGuidelines = workbook.tone_guidelines.trim();
    next.brandPersona.communicationStyle = {
      ...(next.brandPersona.communicationStyle || {}),
      tone: workbook.tone_guidelines.trim(),
    };
  }
  if (Array.isArray(workbook.voice_dos) || Array.isArray(workbook.voice_donts)) {
    next.brandPersona.doAndDont = {
      do: Array.isArray(workbook.voice_dos)
        ? workbook.voice_dos.map((v: any) => ({ guideline: String(v || "").trim() })).filter((v: any) => v.guideline)
        : next.brandPersona?.doAndDont?.do || [],
      dont: Array.isArray(workbook.voice_donts)
        ? workbook.voice_donts.map((v: any) => ({ guideline: String(v || "").trim() })).filter((v: any) => v.guideline)
        : next.brandPersona?.doAndDont?.dont || [],
    };
  }
  if (workbook.primary_audience) {
    const desc = typeof workbook.primary_audience === "string"
      ? workbook.primary_audience
      : workbook.primary_audience?.description;
    if (typeof desc === "string" && desc.trim()) {
      next.targetAudience = desc.trim();
      next.audienceSignals.segments = [
        { ...(next.audienceSignals?.segments?.[0] || {}), summary: desc.trim(), label: desc.trim() },
        ...(Array.isArray(next.audienceSignals?.segments) ? next.audienceSignals.segments.slice(1) : []),
      ];
    }
  }
  if (Array.isArray(workbook.key_differentiators) && workbook.key_differentiators.length > 0) {
    next.competitivePositioning.differentiators = workbook.key_differentiators.map((d: any) => ({
      title: d?.differentiator || d?.title || String(d || ""),
      advantage: d?.competitive_advantage || "",
      proof: d?.proof || "",
    }));
  }

  if (typeof reportSections.executive_summary === "string" && reportSections.executive_summary.trim()) {
    next.executiveSummary.synthesis = reportSections.executive_summary.trim();
  }
  if (typeof reportSections.score_analysis === "string" && reportSections.score_analysis.trim()) {
    next.executiveSummary.industryBenchmark = reportSections.score_analysis.trim();
  }
  if (typeof reportSections.strategic_signals === "string" && reportSections.strategic_signals.trim()) {
    next.strategicSignals.narrative = reportSections.strategic_signals.trim();
  }
  if (typeof reportSections.competitive_positioning === "string" && reportSections.competitive_positioning.trim()) {
    next.competitivePositioning.positioningSummary = reportSections.competitive_positioning.trim();
  }
  if (typeof reportSections.journey_map === "string" && reportSections.journey_map.trim()) {
    next.customerJourneyMap.overview = reportSections.journey_map.trim();
  }
  if (typeof reportSections.seo_aeo === "string" && reportSections.seo_aeo.trim()) {
    next.visibilityAndDiscovery.searchStrategy = reportSections.seo_aeo.trim();
  }
  if (typeof reportSections.conversion_strategy === "string" && reportSections.conversion_strategy.trim()) {
    next.conversionOptimization.overview = reportSections.conversion_strategy.trim();
  }
  if (typeof reportSections.email_framework === "string" && reportSections.email_framework.trim()) {
    next.emailMarketingFramework.overview = reportSections.email_framework.trim();
  }
  if (typeof reportSections.social_strategy === "string" && reportSections.social_strategy.trim()) {
    next.socialMediaStrategy.overview = reportSections.social_strategy.trim();
  }
  if (typeof reportSections.implementation_action_plan === "string" && reportSections.implementation_action_plan.trim()) {
    next.brandStrategyRollout.brandStrategyOnePager = reportSections.implementation_action_plan.trim();
  }

  if (typeof strategic.swot_overview === "string" && strategic.swot_overview.trim()) {
    next.swotAnalysis.summary = strategic.swot_overview.trim();
  }
  if (typeof strategic.swot_strengths === "string" && strategic.swot_strengths.trim()) {
    next.swotAnalysis.strengths = strategic.swot_strengths.split("\n").map((s: string) => s.trim()).filter(Boolean);
  }
  if (typeof strategic.swot_weaknesses === "string" && strategic.swot_weaknesses.trim()) {
    next.swotAnalysis.weaknesses = strategic.swot_weaknesses.split("\n").map((s: string) => s.trim()).filter(Boolean);
  }
  if (typeof strategic.swot_opportunities === "string" && strategic.swot_opportunities.trim()) {
    next.swotAnalysis.opportunities = strategic.swot_opportunities.split("\n").map((s: string) => s.trim()).filter(Boolean);
  }
  if (typeof strategic.swot_threats === "string" && strategic.swot_threats.trim()) {
    next.swotAnalysis.threats = strategic.swot_threats.split("\n").map((s: string) => s.trim()).filter(Boolean);
  }

  return next as BlueprintEngineOutput;
}

function toBrandStandardsData(d: BlueprintEngineOutput, brandName: string) {
  const bsd = (d as any).brandStandardsGuide || {};
  return {
    business_name: brandName,
    positioning_statement: d.brandFoundation?.positioningStatement,
    unique_value_proposition: d.brandFoundation?.differentiationNarrative,
    brand_archetype: d.brandArchetypeSystem?.primary?.name,
    archetype_description: d.brandArchetypeSystem?.primary?.whenAligned,
    archetype_application: d.brandArchetypeActivation?.activation?.messaging,
    brand_alignment_score: d.executiveSummary?.brandAlignmentScore,
    brand_voice_attributes: d.visualVerbalSignals?.voiceTraits,
    tone_guidelines: d.brandPersona?.communicationStyle?.tone,
    voice_dos: d.brandPersona?.doAndDont?.do?.map((i: any) => i.guideline || i),
    voice_donts: d.brandPersona?.doAndDont?.dont?.map((i: any) => i.guideline || i),
    elevator_pitch_30s: d.brandStory?.elevatorPitch,
    messaging_pillars: d.messagingPillars?.map(mp => ({
      name: mp.name,
      description: mp.whatItCommunicates,
      example: mp.exampleMessage,
    })),
    brand_imagery_direction: {
      photography_style_direction: d.brandImageryDirection?.photographyStyleDirection,
      subject_matter_guidance: d.brandImageryDirection?.subjectMatterGuidance,
      stock_photo_selection_criteria: d.brandImageryDirection?.stockPhotoSelectionCriteria,
      image_donts: d.brandImageryDirection?.imageDonts,
      color_application_in_imagery: d.brandImageryDirection?.colorApplicationInImagery,
    },
    brand_standards_data: {
      brand_story: d.brandStory ? {
        headline: d.brandStory.headline,
        narrative: d.brandStory.narrative,
        founder_story: d.brandStory.founderStory,
      } : undefined,
      brand_purpose: d.brandFoundation?.brandPurpose,
      brand_promise: d.brandFoundation?.brandPromise,
      mission: d.brandFoundation?.mission,
      vision: d.brandFoundation?.vision,
      values: d.brandFoundation?.values,
      persona_summary: d.brandPersona?.personaSummary,
      core_identity: d.brandPersona?.coreIdentity ? {
        who_you_are: d.brandPersona.coreIdentity.whoYouAre,
        what_you_stand_for: d.brandPersona.coreIdentity.whatYouStandFor,
        how_you_show_up: d.brandPersona.coreIdentity.howYouShowUp,
      } : undefined,
      color_palette: d.visualDirection?.colorPalette,
      avoid_colors: d.visualVerbalSignals?.avoidColors,
      visual_consistency_principles: d.visualDirection?.visualConsistencyPrinciples,
      logo_guidelines: bsd.logoGuidelines ? {
        overview: bsd.logoGuidelines.overview,
        clear_space: bsd.logoGuidelines.clearSpace,
        minimum_size: bsd.logoGuidelines.minimumSize,
        placement_rules: bsd.logoGuidelines.placementRules,
        incorrect_uses: bsd.logoGuidelines.incorrectUses,
      } : undefined,
      layout_guidelines: bsd.layoutGuidelines ? {
        overview: bsd.layoutGuidelines.overview,
        margins: bsd.layoutGuidelines.margins,
        spacing: bsd.layoutGuidelines.spacing,
        grid_system: bsd.layoutGuidelines.gridSystem,
        digital_patterns: bsd.layoutGuidelines.digitalPatterns,
        print_patterns: bsd.layoutGuidelines.printPatterns,
      } : undefined,
      writing_guidelines: bsd.writingGuidelines ? {
        overview: bsd.writingGuidelines.overview,
        grammar_preferences: bsd.writingGuidelines.grammarPreferences,
        jargon_rules: bsd.writingGuidelines.jargonRules,
        point_of_view: bsd.writingGuidelines.pointOfView,
        inclusive_language: bsd.writingGuidelines.inclusiveLanguage,
        style_preferences: bsd.writingGuidelines.stylePreferences,
      } : undefined,
      taglines: d.taglineRecommendations?.map(t => ({ tagline: t.tagline, usage: t.bestUsedOn })),
      boilerplate: d.companyDescription ? {
        one_liner: d.companyDescription.oneLiner,
        short_description: d.companyDescription.shortDescription,
        full_boilerplate: d.companyDescription.fullBoilerplate,
        proposal_intro: d.companyDescription.proposalIntro,
      } : undefined,
      sample_executions: bsd.sampleExecutions,
      do_and_dont_pages: bsd.doAndDontPages,
      content_pillars: d.contentPillars?.map((cp: any) => ({
        name: cp.name,
        description: cp.description,
        example_topics: cp.exampleTopics,
      })),
      governance_template: bsd.governanceTemplate ? {
        brand_owner_role: bsd.governanceTemplate.brandOwnerRole,
        review_cadence: bsd.governanceTemplate.reviewCadence,
        exception_process: bsd.governanceTemplate.exceptionProcess,
      } : undefined,
    },
  };
}

async function renderDocument(type: DocType, data: BlueprintEngineOutput, brandName: string, userName?: string) {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  switch (type) {
    case "complete": {
      const { CompleteBlueprintDocument } = await import("@/src/pdf/documents/CompleteBlueprintDocument");
      return renderToBuffer(<CompleteBlueprintDocument data={data} brandName={brandName} userName={userName} />);
    }
    case "executive": {
      const { ExecutiveSummaryDocument } = await import("@/src/pdf/documents/ExecutiveSummaryDocument");
      return renderToBuffer(<ExecutiveSummaryDocument data={data} brandName={brandName} userName={userName} />);
    }
    case "messaging": {
      const { MessagingPlaybookDocument } = await import("@/src/pdf/documents/MessagingPlaybookDocument");
      return renderToBuffer(<MessagingPlaybookDocument data={data} brandName={brandName} />);
    }
    case "prompts": {
      const { PromptLibraryDocument } = await import("@/src/pdf/documents/PromptLibraryDocument");
      return renderToBuffer(<PromptLibraryDocument data={data} brandName={brandName} />);
    }
    case "voice-checklist": {
      const { VoiceChecklistDocument } = await import("@/src/pdf/documents/VoiceChecklistDocument");
      return renderToBuffer(<VoiceChecklistDocument data={data} brandName={brandName} />);
    }
    case "activation": {
      const { ActivationPlanDocument } = await import("@/src/pdf/documents/ActivationPlanDocument");
      return renderToBuffer(<ActivationPlanDocument data={data} brandName={brandName} />);
    }
    case "digital": {
      const { DigitalStrategyDocument } = await import("@/src/pdf/documents/DigitalStrategyDocument");
      return renderToBuffer(<DigitalStrategyDocument data={data} brandName={brandName} />);
    }
    case "competitive": {
      const { CompetitiveIntelDocument } = await import("@/src/pdf/documents/CompetitiveIntelDocument");
      return renderToBuffer(<CompetitiveIntelDocument data={data} brandName={brandName} />);
    }
    case "standards": {
      const { BrandStandardsDocument } = await import("@/src/pdf/documents/BrandStandardsDocument");
      const workbookData = toBrandStandardsData(data, brandName);
      return renderToBuffer(<BrandStandardsDocument data={workbookData as any} />);
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const reportId = req.nextUrl.searchParams.get("reportId");
    const type = req.nextUrl.searchParams.get("type") as DocType | null;
    const email = req.nextUrl.searchParams.get("email");
    const tier = req.nextUrl.searchParams.get("tier") || "blueprint";

    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const allowedTypes = tier === "blueprint-plus" ? BLUEPRINT_PLUS_TYPES : BLUEPRINT_TYPES;
    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: `Document type "${type}" requires Blueprint+™` },
        { status: 403 }
      );
    }

    const sb = supabaseServer();

    type ReportShape = { report_data: BlueprintEngineOutput; company_name: string; user_email: string; user_name?: string; tier?: string };
    let report: ReportShape | null = null;

    const { data: primary, error: primaryErr } = await sb
      .from("blueprint_reports" as any)
      .select("report_data, company_name, user_email, user_name, tier")
      .eq("id", reportId)
      .single();

    if (primary && !primaryErr) {
      report = primary as unknown as ReportShape;
    } else {
      const { data: fallback } = await sb
        .from("brand_snapshot_plus_reports" as any)
        .select("full_report, company_name, user_email, user_name, tier")
        .eq("id", reportId)
        .single();

      if (fallback) {
        const fb = fallback as Record<string, unknown>;
        const fullReport = typeof fb.full_report === "string"
          ? JSON.parse(fb.full_report)
          : fb.full_report;
        report = {
          report_data: fullReport as BlueprintEngineOutput,
          company_name: (fb.company_name as string) || (fullReport as any)?.businessName || "Your Brand",
          user_email: (fb.user_email as string) || "",
          user_name: fb.user_name as string | undefined,
          tier: (fb.tier as string) || tier,
        };
      }
    }

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (email && report.user_email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 });
    }

    const reportTier = report.tier || tier;
    const serverAllowed = reportTier === "blueprint-plus" ? BLUEPRINT_PLUS_TYPES : BLUEPRINT_TYPES;
    if (!serverAllowed.includes(type)) {
      return NextResponse.json(
        { error: `This report's tier does not include the "${type}" document` },
        { status: 403 }
      );
    }

    let workbook: WorkbookShape | null = null;
    try {
      let workbookQuery = sb
        .from("brand_workbook" as any)
        .select("*")
        .eq("report_id", reportId)
        .limit(1);
      if (email) {
        workbookQuery = workbookQuery.eq("email", email.toLowerCase());
      }
      const { data: workbookRows } = await workbookQuery;
      if (Array.isArray(workbookRows) && workbookRows.length > 0) {
        workbook = workbookRows[0] as WorkbookShape;
      }
    } catch (wbErr) {
      logger.warn("[Blueprint PDF] Workbook overlay skipped", {
        error: wbErr instanceof Error ? wbErr.message : String(wbErr),
        reportId,
      });
    }

    const brandName = (workbook?.business_name as string) || report.company_name || "Your Brand";
    const userName = report.user_name || undefined;
    const engineData = applyWorkbookOverrides(report.report_data, workbook);

    if (!engineData) {
      return NextResponse.json({ error: "Report has no engine data" }, { status: 404 });
    }

    const buffer = await renderDocument(type, engineData, brandName, userName);
    const uint8 = new Uint8Array(buffer);

    const tierSuffix = reportTier === "blueprint-plus" ? "Blueprint_Plus" : "Blueprint";
    const sanitizedName = brandName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${sanitizedName}_${DOC_LABELS[type]}_${tierSuffix}.pdf`;

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    logger.error("[Blueprint PDF]", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
