// GET /api/workbook/export?reportId=xxx&email=xxx
// Generates and streams a Brand Standards & Guidelines PDF.
//
// Merges workbook data (editable by customer) with rich report data
// (brand story, color palette, writing guidelines, etc.) to produce
// a comprehensive brand standards guide.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import React from "react";

export const runtime = "nodejs";
export const maxDuration = 30;

/* eslint-disable @typescript-eslint/no-explicit-any */

function extractBrandStandardsData(report: any): Record<string, any> {
  const r = report.engine_results || report.results || {};
  const bsd: Record<string, any> = {};

  // Brand Foundations
  if (r.brandFoundation) {
    bsd.brand_purpose = r.brandFoundation.brandPurpose;
    bsd.brand_promise = r.brandFoundation.brandPromise;
  }

  if (r.brandStory) {
    bsd.brand_story = {
      headline: r.brandStory.headline,
      narrative: r.brandStory.narrative,
      founder_story: r.brandStory.founderStory,
    };
  }

  // Mission, Vision, Values — may come from various report fields
  if (r.brandFoundation?.mission) bsd.mission = r.brandFoundation.mission;
  if (r.brandFoundation?.vision) bsd.vision = r.brandFoundation.vision;
  if (r.brandFoundation?.values) bsd.values = r.brandFoundation.values;

  // Brand Persona
  if (r.brandPersona) {
    bsd.persona_summary = r.brandPersona.personaSummary;
    if (r.brandPersona.coreIdentity) {
      bsd.core_identity = {
        who_you_are: r.brandPersona.coreIdentity.whoYouAre,
        what_you_stand_for: r.brandPersona.coreIdentity.whatYouStandFor,
        how_you_show_up: r.brandPersona.coreIdentity.howYouShowUp,
      };
    }
    bsd.personality_traits = r.brandPersona.personalityTraits;
    bsd.communication_style = r.brandPersona.communicationStyle;
  }

  // Visual: Color Palette
  if (r.visualDirection?.colorPalette) {
    bsd.color_palette = r.visualDirection.colorPalette.map((c: any) => ({
      name: c.name,
      hex: c.hex,
      rgb: c.rgb,
      cmyk: c.cmyk,
      usage: c.usage,
    }));
  }

  // Also pull from visualVerbalSignals for secondary/avoid colors
  if (r.visualVerbalSignals?.colorSwatches) {
    // If no primary palette from visualDirection, use these
    if (!bsd.color_palette) {
      bsd.color_palette = r.visualVerbalSignals.colorSwatches.map((c: any) => ({
        name: c.name, hex: c.hex, rgb: c.rgb, cmyk: c.cmyk, usage: c.usage,
      }));
    }
  }
  if (r.visualVerbalSignals?.avoidColors) {
    bsd.avoid_colors = r.visualVerbalSignals.avoidColors.map((c: any) => ({
      name: c.name, hex: c.hex, reason: c.reason,
    }));
  }

  if (r.visualDirection?.visualConsistencyPrinciples) {
    bsd.visual_consistency_principles = r.visualDirection.visualConsistencyPrinciples;
  }

  // Logo Guidelines
  if (r.brandStandardsGuide?.logoGuidelines || r.logoGuidelines) {
    const lg = r.brandStandardsGuide?.logoGuidelines || r.logoGuidelines;
    bsd.logo_guidelines = {
      overview: lg.overview,
      clear_space: lg.clearSpace,
      minimum_size: lg.minimumSize,
      placement_rules: lg.placementRules,
      incorrect_uses: lg.incorrectUses,
    };
  }

  // Layout Guidelines
  if (r.brandStandardsGuide?.layoutGuidelines || r.layoutGuidelines) {
    const lg = r.brandStandardsGuide?.layoutGuidelines || r.layoutGuidelines;
    bsd.layout_guidelines = {
      overview: lg.overview,
      margins: lg.margins,
      spacing: lg.spacing,
      grid_system: lg.gridSystem,
      digital_patterns: lg.digitalPatterns,
      print_patterns: lg.printPatterns,
    };
  }

  // Writing Guidelines
  if (r.brandStandardsGuide?.writingGuidelines || r.writingGuidelines) {
    const wg = r.brandStandardsGuide?.writingGuidelines || r.writingGuidelines;
    bsd.writing_guidelines = {
      overview: wg.overview,
      grammar_preferences: wg.grammarPreferences,
      jargon_rules: wg.jargonRules,
      point_of_view: wg.pointOfView,
      inclusive_language: wg.inclusiveLanguage,
      style_preferences: wg.stylePreferences,
    };
  }

  // Taglines
  if (r.taglineRecommendations && Array.isArray(r.taglineRecommendations)) {
    bsd.taglines = r.taglineRecommendations.map((t: any) => ({
      tagline: t.tagline,
      usage: t.bestUsedOn || t.rationale,
    }));
  }

  // Company Descriptions / Boilerplate
  if (r.companyDescription) {
    bsd.boilerplate = {
      one_liner: r.companyDescription.oneLiner,
      short_description: r.companyDescription.shortDescription,
      full_boilerplate: r.companyDescription.fullBoilerplate,
      proposal_intro: r.companyDescription.proposalIntro,
      industry_specific: r.companyDescription.industrySpecific,
    };
  }

  // Content Pillars
  if (r.contentPillars && Array.isArray(r.contentPillars)) {
    bsd.content_pillars = r.contentPillars.map((cp: any) => ({
      name: cp.name,
      description: cp.description,
      example_topics: cp.exampleTopics,
      suggested_formats: cp.suggestedFormats,
    }));
  }

  // Sample Executions
  if (r.brandStandardsGuide?.sampleExecutions) {
    bsd.sample_executions = r.brandStandardsGuide.sampleExecutions;
  }

  // Do / Don't Pages
  if (r.brandStandardsGuide?.doAndDontPages) {
    bsd.do_and_dont_pages = r.brandStandardsGuide.doAndDontPages;
  }

  // Governance Template
  if (r.brandStandardsGuide?.governanceTemplate) {
    bsd.governance_template = r.brandStandardsGuide.governanceTemplate;
  }

  return bsd;
}

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const reportId = url.searchParams.get("reportId");
  const email = url.searchParams.get("email");

  if (!reportId || !email) {
    return NextResponse.json({ error: "reportId and email are required." }, { status: 400 });
  }

  try {
    // Fetch workbook
    const { data: workbook, error } = await supabaseAdmin
      .from("brand_workbook")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (error || !workbook) {
      return NextResponse.json({ error: "Workbook not found." }, { status: 404 });
    }

    if (workbook.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    // Fetch the full report to extract rich brand standards data
    let brandStandardsData = workbook.brand_standards_data || {};

    const { data: report } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .select("engine_results, results")
      .eq("report_id", reportId)
      .single() as { data: any };

    if (report) {
      const extracted = extractBrandStandardsData(report);
      // Merge: workbook's saved brand_standards_data takes precedence over extracted
      brandStandardsData = { ...extracted, ...brandStandardsData };
    }

    // Also check blueprint_reports for Blueprint+ data
    const { data: bpReport } = await supabaseAdmin
      .from("blueprint_reports")
      .select("report_data")
      .eq("user_email", email.toLowerCase())
      .order("created_at", { ascending: false })
      .limit(1)
      .single() as { data: any };

    if (bpReport?.report_data) {
      const bpExtracted = extractBrandStandardsData({ engine_results: bpReport.report_data });
      // Merge: previously extracted data and workbook data take precedence
      brandStandardsData = { ...bpExtracted, ...brandStandardsData };
    }

    // Build the complete data object for the PDF
    const pdfData = {
      ...workbook,
      brand_standards_data: brandStandardsData,
    };

    const { renderToBuffer } = await import("@react-pdf/renderer");
    const { BrandStandardsDocument } = await import("@/src/pdf/documents/BrandStandardsDocument");
    const buffer = await renderToBuffer(
      React.createElement(BrandStandardsDocument, { data: pdfData }) as any
    );

    await supabaseAdmin
      .from("brand_workbook")
      .update({
        last_exported_at: new Date().toISOString(),
        export_count: (workbook.export_count || 0) + 1,
      })
      .eq("report_id", reportId);

    const filename = `${(workbook.business_name || "Brand").replace(/[^a-zA-Z0-9]/g, "_")}_Brand_Standards_Guide.pdf`;

    return new NextResponse(Buffer.from(buffer) as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    logger.error("[Workbook Export] PDF generation failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "PDF generation failed." }, { status: 500 });
  }
}
