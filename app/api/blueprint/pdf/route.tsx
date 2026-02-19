// app/api/blueprint/pdf/route.tsx
// Generates any Blueprint/Blueprint+ document PDF by type.
// GET /api/blueprint/pdf?reportId=xxx&type=complete|executive|messaging|prompts|activation|digital|competitive|standards&tier=blueprint|blueprint-plus

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { supabaseServer } from "@/lib/supabase";
import type { BlueprintEngineOutput } from "@/src/pdf/types/blueprintReport";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_TYPES = ["complete", "executive", "messaging", "prompts", "activation", "digital", "competitive", "standards"] as const;
type DocType = (typeof VALID_TYPES)[number];

const BLUEPRINT_TYPES: DocType[] = ["complete", "executive", "messaging", "prompts"];
const BLUEPRINT_PLUS_TYPES: DocType[] = ["complete", "executive", "messaging", "prompts", "activation", "digital", "competitive", "standards"];

const DOC_LABELS: Record<DocType, string> = {
  complete: "Complete_Blueprint",
  executive: "Executive_Summary",
  messaging: "Messaging_Playbook",
  prompts: "AI_Prompt_Library",
  activation: "90_Day_Activation_Plan",
  digital: "Digital_Marketing_Strategy",
  competitive: "Competitive_Intelligence_Brief",
  standards: "Brand_Standards_Guide",
};

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

    const { data: report, error } = await sb
      .from("blueprint_reports")
      .select("report_data, company_name, user_email, user_name, tier")
      .eq("id", reportId)
      .single() as {
        data: { report_data: BlueprintEngineOutput; company_name: string; user_email: string; user_name?: string; tier?: string } | null;
        error: unknown;
      };

    if (error || !report) {
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

    const brandName = report.company_name || "Your Brand";
    const userName = report.user_name || undefined;
    const engineData = report.report_data;

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
    console.error("[Blueprint PDF]", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
