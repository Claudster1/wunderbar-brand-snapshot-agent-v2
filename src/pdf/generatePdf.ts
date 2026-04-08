// src/pdf/generatePdf.ts
// Centralized PDF generation utility for all document types
// Handles WunderBrand Snapshot™, Snapshot+™, Blueprint™, and Blueprint+™

import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getPrimaryPillar } from "@/src/lib/pillars/getPrimaryPillar";
import { BrandSnapshotPDF, BrandSnapshotReport } from "./BrandSnapshotPDF";
import { BrandSnapshotPlusPDF, BrandSnapshotPlusReport } from "./BrandSnapshotPlusPDF";
import { BrandBlueprintPDF, BrandBlueprintReport } from "./BrandBlueprintPDF";
// TODO: Update when Blueprint+ PDF is implemented
import BrandBlueprintPlusPDF, { BrandBlueprintPlusPDFProps } from "./documents/BrandBlueprintPlusPDF";

export type PDFDocumentType = 
  | "snapshot" 
  | "snapshot-plus" 
  | "blueprint" 
  | "blueprint-plus";

export interface PDFGenerationOptions {
  documentType: PDFDocumentType;
  data: BrandSnapshotReport | BrandSnapshotPlusReport | BrandBlueprintReport | BrandBlueprintPlusPDFProps;
  filename?: string;
}

/**
 * Generate a PDF buffer from a document type and data
 * 
 * @param options - PDF generation options
 * @returns Promise<Buffer> - PDF buffer ready for download/upload
 * 
 * @example
 * ```ts
 * const pdfBuffer = await generatePdf({
 *   documentType: "snapshot",
 *   data: {
 *     userName: "John",
 *     businessName: "Acme Co",
 *     brandAlignmentScore: 75,
 *     pillarScores: { ... },
 *     pillarInsights: { ... }
 *   }
 * });
 * ```
 */
export async function generatePdf(
  options: PDFGenerationOptions
): Promise<Buffer> {
  const { documentType, data } = options;

  try {
    let pdfElement: React.ReactElement;

    switch (documentType) {
      case "snapshot":
        pdfElement = React.createElement(
          BrandSnapshotPDF,
          { report: data as BrandSnapshotReport }
        );
        break;

      case "snapshot-plus":
        pdfElement = React.createElement(
          BrandSnapshotPlusPDF,
          { report: data as BrandSnapshotPlusReport }
        );
        break;

      case "blueprint":
        pdfElement = React.createElement(
          BrandBlueprintPDF,
          { report: data as BrandBlueprintReport }
        );
        break;

      case "blueprint-plus":
        pdfElement = React.createElement(
          BrandBlueprintPlusPDF,
          data as BrandBlueprintPlusPDFProps
        );
        break;

      default:
        throw new Error(`Unknown document type: ${documentType}`);
    }

    const pdfBuffer = await renderToBuffer(pdfElement as any);
    return pdfBuffer;
  } catch (error) {
    console.error(`[PDF Generation] Error generating ${documentType} PDF:`, error);
    throw new Error(`Failed to generate ${documentType} PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate a PDF and return it as a Response with proper headers
 * Useful for API routes
 * 
 * @param options - PDF generation options
 * @returns Promise<Response> - Next.js Response with PDF
 * 
 * @example
 * ```ts
 * const response = await generatePdfResponse({
 *   documentType: "snapshot-plus",
 *   data: { ... },
 *   filename: "my-report.pdf"
 * });
 * return response;
 * ```
 */
export async function generatePdfResponse(
  options: PDFGenerationOptions
): Promise<Response> {
  try {
    const pdfBuffer = await generatePdf(options);
    const filename = options.filename || `${options.documentType}-report.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[PDF Generation] Error creating response:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate PDF",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Transform database report data to PDF props format
 * Handles different data structures from Supabase
 */
export function transformReportDataForPdf(
  report: any,
  documentType: PDFDocumentType
): BrandSnapshotReport | BrandSnapshotPlusReport | BrandBlueprintReport | BrandBlueprintPlusPDFProps {
  const r = report?.full_report || report || {};

  // Common fields
  const baseProps = {
    userName: r.user_name || report?.user_name || report?.userName || "User",
    businessName: r.company || r.business_name || report?.company || report?.business_name || "",
  };

  switch (documentType) {
    case "snapshot":
      const answers =
        report?.full_report?.answers && typeof report.full_report.answers === "object"
          ? (report.full_report.answers as Record<string, unknown>)
          : {};
      return {
        ...baseProps,
        brandAlignmentScore:
          r.brand_alignment_score ||
          r.brandAlignmentScore ||
          report?.brand_alignment_score ||
          0,
        pillarScores: r.pillar_scores || r.pillarScores || report?.pillar_scores || {
          positioning: 0,
          messaging: 0,
          visibility: 0,
          credibility: 0,
          conversion: 0,
        },
        pillarInsights: r.pillar_insights || r.pillarInsights || report?.pillar_insights || {
          positioning: "",
          messaging: "",
          visibility: "",
          credibility: "",
          conversion: "",
        },
        recommendations: r.recommendations && typeof r.recommendations === "object"
          ? {
              positioning: r.recommendations.positioning || "",
              messaging: r.recommendations.messaging || "",
              visibility: r.recommendations.visibility || "",
              credibility: r.recommendations.credibility || "",
              conversion: r.recommendations.conversion || "",
            }
          : {
              positioning: "",
              messaging: "",
              visibility: "",
              credibility: "",
              conversion: "",
            },
        suggestedPalette:
          r.color_palette ||
          r.colorPalette ||
          report?.color_palette ||
          report?.enriched_color_palette ||
          [],
        fullReportAnswers:
          answers,
        businessType: typeof answers.businessType === "string" ? answers.businessType : null,
        monthlyMarketingBudget:
          typeof answers.monthlyMarketingBudget === "string" ? answers.monthlyMarketingBudget : null,
        monthlyRevenueRange:
          typeof answers.monthlyRevenueRange === "string" ? answers.monthlyRevenueRange : null,
        annualRevenueRange: typeof answers.revenueRange === "string" ? answers.revenueRange : null,
        averageTransactionValue:
          typeof answers.averageTransactionValue === "string" ? answers.averageTransactionValue : null,
        conversionRateEstimate:
          typeof answers.conversionRateEstimate === "string" ? answers.conversionRateEstimate : null,
        likelyArchetype:
          typeof answers.likelyArchetype === "string"
            ? answers.likelyArchetype
            : typeof (report?.likely_archetype) === "string"
              ? report.likely_archetype
              : null,
      } as unknown as BrandSnapshotReport;

    case "snapshot-plus": {
      const pickFirst = (...values: unknown[]) =>
        values.find((value) => typeof value === "string" && value.trim().length > 0) as string | undefined;
      const roadmapFromObject =
        r.roadmap && typeof r.roadmap === "object" ? (r.roadmap as Record<string, unknown>) : {};
      const archetypeSource =
        r.enriched_archetype && typeof r.enriched_archetype === "object"
          ? (r.enriched_archetype as Record<string, unknown>)
          : r.archetype && typeof r.archetype === "object"
            ? (r.archetype as Record<string, unknown>)
            : {};
      const archetype = {
        ...archetypeSource,
        name:
          pickFirst(
            archetypeSource.name,
            typeof r.enriched_archetype === "string" ? r.enriched_archetype : undefined,
            typeof r.archetype === "string" ? r.archetype : undefined,
            r.brand_archetype,
            r.likely_archetype
          ) ?? "",
        summary: pickFirst(archetypeSource.summary, archetypeSource.description),
        risk: pickFirst(archetypeSource.risk, r.archetype_risk),
        languageTone: pickFirst(archetypeSource.languageTone, r.archetype_language_tone),
        behaviorGuide: pickFirst(archetypeSource.behaviorGuide, r.archetype_behavior_guide),
        secondary:
          archetypeSource.secondary ??
          (typeof r.secondary_archetype === "string"
            ? { name: r.secondary_archetype, summary: pickFirst(r.secondary_archetype_summary) }
            : undefined),
        pairingGuidance: pickFirst(archetypeSource.pairingGuidance, r.archetype_pairing_guidance),
        activation:
          archetypeSource.activation && typeof archetypeSource.activation === "object"
            ? archetypeSource.activation
            : r.archetype_activation && typeof r.archetype_activation === "object"
              ? r.archetype_activation
              : undefined,
      };
      const pillarScores = r.pillar_scores || r.pillarScores || report?.pillar_scores || {
        positioning: 0,
        messaging: 0,
        visibility: 0,
        credibility: 0,
        conversion: 0,
      };
      const primaryPillarResult =
        typeof getPrimaryPillar === "function"
          ? getPrimaryPillar(pillarScores)
          : { pillar: "positioning" as const };
      const primaryPillar =
        "type" in primaryPillarResult &&
        primaryPillarResult.type === "tie" &&
        primaryPillarResult.pillars?.length
          ? primaryPillarResult.pillars[0]
          : primaryPillarResult.pillar;
      return {
        ...baseProps,
        industry: r.industry ?? report?.industry ?? "",
        website: r.website ?? report?.website ?? null,
        socials: Array.isArray(r.socials) ? r.socials : Array.isArray(report?.socials) ? report.socials : [],
        primaryPillar,
        brandAlignmentScore:
          r.brand_alignment_score ||
          r.brandAlignmentScore ||
          report?.brand_alignment_score ||
          0,
        pillarScores,
        pillarInsights: r.pillar_insights || r.pillarInsights || report?.pillar_insights || {
          positioning: "",
          messaging: "",
          visibility: "",
          credibility: "",
          conversion: "",
        },
        recommendations: r.recommendations && typeof r.recommendations === "object"
          ? {
              positioning: r.recommendations.positioning || "",
              messaging: r.recommendations.messaging || "",
              visibility: r.recommendations.visibility || "",
              credibility: r.recommendations.credibility || "",
              conversion: r.recommendations.conversion || "",
            }
          : {
              positioning: "",
              messaging: "",
              visibility: "",
              credibility: "",
              conversion: "",
            },
        personalityWords: r.personality_words || r.personalityWords || report?.personality_words || [],
        competitorNames: r.competitor_names || r.competitorNames || report?.competitor_names || [],
        targetCustomers: r.target_customers || r.targetCustomers || report?.target_customers,
        brandOpportunities: r.brand_opportunities || r.brandOpportunities || report?.brand_opportunities,
        messagingGaps: r.messaging_gaps || r.messagingGaps || report?.messaging_gaps,
        visibilityPlan: r.visibility_plan || r.visibilityPlan || report?.visibility_plan,
        contentFormatChannelSnapshot:
          r.content_format_channel_snapshot ||
          r.contentFormatChannelSnapshot ||
          report?.content_format_channel_snapshot,
        marketingSpendAuditSignal:
          r.marketing_spend_audit_signal ||
          r.marketingSpendAuditSignal ||
          report?.marketing_spend_audit_signal,
        competitiveVulnerabilitySignal:
          r.competitive_vulnerability_signal ||
          r.competitiveVulnerabilitySignal ||
          report?.competitive_vulnerability_signal,
        revenueImpactStatement:
          r.revenue_impact_statement ||
          r.revenueImpactStatement ||
          report?.revenue_impact_statement,
        visualIdentityNotes: r.visual_identity_notes || r.visualIdentityNotes || report?.visual_identity_notes,
        aiPrompts: r.ai_prompts || r.aiPrompts || report?.ai_prompts || [],
        aeoRecommendations: r.aeo_recommendations || r.aeoRecommendations || report?.aeo_recommendations,
        contextCoverage: r.contextCoverage ?? r.context_coverage ?? report?.context_coverage,
        persona: r.enriched_persona ?? r.persona ?? report?.enriched_persona,
        archetype,
        voice: r.enriched_voice ?? r.voice ?? report?.enriched_voice,
        colorPalette: r.enriched_color_palette ?? r.color_palette ?? r.colorPalette ?? report?.enriched_color_palette ?? [],
        roadmap_30: pickFirst(
          r.roadmap_30,
          r.roadmap30,
          report?.roadmap_30,
          r.thirtyDayPlan,
          r.plan30,
          roadmapFromObject.next30Days,
          roadmapFromObject.day30,
          roadmapFromObject.thirtyDay
        ),
        roadmap_60: pickFirst(
          r.roadmap_60,
          r.roadmap60,
          report?.roadmap_60,
          r.sixtyDayPlan,
          r.plan60,
          roadmapFromObject.next60Days,
          roadmapFromObject.day60,
          roadmapFromObject.sixtyDay
        ),
        roadmap_90: pickFirst(
          r.roadmap_90,
          r.roadmap90,
          report?.roadmap_90,
          r.ninetyDayPlan,
          r.plan90,
          roadmapFromObject.next90Days,
          roadmapFromObject.day90,
          roadmapFromObject.ninetyDay
        ),
        opportunities_map: r.opportunities_map ?? report?.opportunities_map,
      } as BrandSnapshotPlusReport;
    }

    case "blueprint":
      const blueprintPillarScores = r.pillar_scores || r.pillarScores || report?.pillar_scores;
      const blueprintPillarInsights = r.pillar_insights || r.pillarInsights || report?.pillar_insights;
      const blueprintRecommendations = r.recommendations || report?.recommendations;
      const pickBlueprintRoadmap = (...values: unknown[]) =>
        values.find((value) => typeof value === "string" && value.trim().length > 0) as string | undefined;
      const blueprintRoadmap =
        r.roadmap && typeof r.roadmap === "object" ? (r.roadmap as Record<string, unknown>) : {};
      return {
        ...baseProps,
        brandAlignmentScore:
          r.brand_alignment_score ||
          r.brandAlignmentScore ||
          report?.brand_alignment_score ||
          undefined,
        pillarScores: blueprintPillarScores,
        pillarInsights: blueprintPillarInsights,
        recommendations:
          blueprintRecommendations && typeof blueprintRecommendations === "object"
            ? {
                positioning: blueprintRecommendations.positioning || "",
                messaging: blueprintRecommendations.messaging || "",
                visibility: blueprintRecommendations.visibility || "",
                credibility: blueprintRecommendations.credibility || "",
                conversion: blueprintRecommendations.conversion || "",
              }
            : undefined,
        contextCoverage: r.context_coverage ?? r.contextCoverage ?? report?.context_coverage,
        opportunitiesMap: r.opportunities_map ?? r.opportunitiesMap ?? report?.opportunities_map,
        roadmap30: pickBlueprintRoadmap(
          r.roadmap_30,
          r.roadmap30,
          report?.roadmap_30,
          r.thirtyDayPlan,
          r.plan30,
          blueprintRoadmap.next30Days,
          blueprintRoadmap.day30
        ),
        roadmap60: pickBlueprintRoadmap(
          r.roadmap_60,
          r.roadmap60,
          report?.roadmap_60,
          r.sixtyDayPlan,
          r.plan60,
          blueprintRoadmap.next60Days,
          blueprintRoadmap.day60
        ),
        roadmap90: pickBlueprintRoadmap(
          r.roadmap_90,
          r.roadmap90,
          report?.roadmap_90,
          r.ninetyDayPlan,
          r.plan90,
          blueprintRoadmap.next90Days,
          blueprintRoadmap.day90
        ),
        industry: r.industry || report?.industry,
        targetCustomers: r.target_customers || r.targetCustomers || report?.target_customers,
        competitorNames: r.competitor_names || r.competitorNames || report?.competitor_names || [],
        brandPersonalityWords: r.brand_personality_words || r.brandPersonalityWords || report?.brand_personality_words || [],
        brandVoiceDescription: r.brand_voice_description || r.brandVoiceDescription || report?.brand_voice_description,
        positioningStatement: r.positioning_statement || r.positioningStatement || report?.positioning_statement || r.positioning_platform || report?.positioning_platform,
        valueProposition: r.value_proposition || r.valueProposition || report?.value_proposition,
        differentiation: r.differentiation || report?.differentiation,
        brandPromise: r.brand_promise || r.brandPromise || report?.brand_promise,
        brandProofPoints: r.brand_proof_points || r.brandProofPoints || report?.brand_proof_points || [],
        narrative: r.narrative || r.brand_narrative || report?.narrative || report?.brand_narrative,
        toneGuidelines: r.tone_guidelines || r.toneGuidelines || report?.tone_guidelines || [],
        audienceSegments: r.audience_segments || r.audienceSegments || report?.audience_segments || [],
        brandArchetype: r.brand_archetype || r.brandArchetype || report?.brand_archetype,
        brandTheme: r.brand_theme || r.brandTheme || report?.brand_theme,
        colorPalette: r.color_palette || r.colorPalette || report?.color_palette || [],
        contentPillars: r.content_pillars || r.contentPillars || report?.content_pillars || [],
        aiPrompts: r.ai_prompts || r.aiPrompts || report?.ai_prompts || [],
        visualDirection: r.visual_direction || report?.visual_direction,
        opportunities: r.opportunities || report?.opportunities,
        campaignArchitectureStarter:
          r.campaign_architecture_starter ||
          r.campaignArchitectureStarter ||
          report?.campaign_architecture_starter,
        revenueMappedWorkbook:
          r.revenue_mapped_workbook ||
          r.revenueMappedWorkbook ||
          report?.revenue_mapped_workbook,
        competitiveVulnerabilitySignal:
          r.competitive_vulnerability_signal ||
          r.competitiveVulnerabilitySignal ||
          report?.competitive_vulnerability_signal ||
          report?.competitiveVulnerabilitySignal,
        marketingSpendEfficiencySignal:
          r.marketing_spend_efficiency_signal ||
          r.marketingSpendEfficiencySignal ||
          r.marketing_spend_audit_signal ||
          r.marketingSpendAuditSignal ||
          report?.marketing_spend_efficiency_signal ||
          report?.marketingSpendEfficiencySignal ||
          report?.marketing_spend_audit_signal ||
          report?.marketingSpendAuditSignal,
        revenueImpactStatement:
          r.revenue_impact_statement ||
          r.revenueImpactStatement ||
          report?.revenue_impact_statement ||
          report?.revenueImpactStatement,
        aeoIntegratedStrategy: r.aeo_integrated_strategy || r.aeoIntegratedStrategy || report?.aeo_integrated_strategy,
      } as BrandBlueprintReport;

    case "blueprint-plus":
      const blueprintPlusPillarScores = r.pillar_scores || r.pillarScores || report?.pillar_scores;
      const blueprintPlusPillarInsights = r.pillar_insights || r.pillarInsights || report?.pillar_insights;
      const blueprintPlusRecommendations = r.recommendations || report?.recommendations;
      const pickBlueprintPlusRoadmap = (...values: unknown[]) =>
        values.find((value) => typeof value === "string" && value.trim().length > 0) as string | undefined;
      const blueprintPlusRoadmap =
        r.roadmap && typeof r.roadmap === "object" ? (r.roadmap as Record<string, unknown>) : {};
      return {
        ...baseProps,
        brandAlignmentScore:
          r.brand_alignment_score ||
          r.brandAlignmentScore ||
          report?.brand_alignment_score ||
          undefined,
        pillarScores: blueprintPlusPillarScores,
        pillarInsights: blueprintPlusPillarInsights,
        recommendations:
          blueprintPlusRecommendations && typeof blueprintPlusRecommendations === "object"
            ? {
                positioning: blueprintPlusRecommendations.positioning || "",
                messaging: blueprintPlusRecommendations.messaging || "",
                visibility: blueprintPlusRecommendations.visibility || "",
                credibility: blueprintPlusRecommendations.credibility || "",
                conversion: blueprintPlusRecommendations.conversion || "",
              }
            : undefined,
        persona: r.enriched_persona ?? r.persona ?? report?.enriched_persona,
        archetype:
          r.enriched_archetype ??
          r.archetype ??
          report?.enriched_archetype ??
          r.brand_archetype ??
          r.likely_archetype,
        voice: r.enriched_voice ?? r.voice ?? report?.enriched_voice,
        colorPalette:
          r.enriched_color_palette ??
          r.color_palette ??
          r.colorPalette ??
          report?.enriched_color_palette ??
          [],
        contextCoverage: r.context_coverage ?? r.contextCoverage ?? report?.context_coverage,
        opportunitiesMap: r.opportunities_map ?? r.opportunitiesMap ?? report?.opportunities_map,
        roadmap30: pickBlueprintPlusRoadmap(
          r.roadmap_30,
          r.roadmap30,
          report?.roadmap_30,
          r.thirtyDayPlan,
          r.plan30,
          blueprintPlusRoadmap.next30Days,
          blueprintPlusRoadmap.day30
        ),
        roadmap60: pickBlueprintPlusRoadmap(
          r.roadmap_60,
          r.roadmap60,
          report?.roadmap_60,
          r.sixtyDayPlan,
          r.plan60,
          blueprintPlusRoadmap.next60Days,
          blueprintPlusRoadmap.day60
        ),
        roadmap90: pickBlueprintPlusRoadmap(
          r.roadmap_90,
          r.roadmap90,
          report?.roadmap_90,
          r.ninetyDayPlan,
          r.plan90,
          blueprintPlusRoadmap.next90Days,
          blueprintPlusRoadmap.day90
        ),
        brandStory: r.brand_story || report?.brand_story,
        positioning: r.positioning || report?.positioning,
        journey: r.journey || report?.journey || [],
        contentRoadmap: r.content_roadmap || report?.content_roadmap || [],
        visualDirection: r.visual_direction || report?.visual_direction || [],
        personality: r.personality || report?.personality,
        decisionFilters: r.decision_filters || report?.decision_filters || [],
        aiPrompts: r.ai_prompts || report?.ai_prompts || [],
        completeAEOSystem: r.complete_aeo_system || report?.complete_aeo_system,
        marketingRoiPrioritization:
          r.marketing_roi_prioritization ||
          r.marketingRoiPrioritization ||
          report?.marketing_roi_prioritization,
        activationSessionPlan:
          r.activation_session_plan ||
          r.activationSessionPlan ||
          report?.activation_session_plan,
        competitiveVulnerabilitySignal:
          r.competitive_vulnerability_signal ||
          r.competitiveVulnerabilitySignal ||
          report?.competitive_vulnerability_signal ||
          report?.competitiveVulnerabilitySignal,
        marketingSpendEfficiencySignal:
          r.marketing_spend_efficiency_signal ||
          r.marketingSpendEfficiencySignal ||
          r.marketing_spend_audit_signal ||
          r.marketingSpendAuditSignal ||
          report?.marketing_spend_efficiency_signal ||
          report?.marketingSpendEfficiencySignal ||
          report?.marketing_spend_audit_signal ||
          report?.marketingSpendAuditSignal,
        revenueImpactStatement:
          r.revenue_impact_statement ||
          r.revenueImpactStatement ||
          report?.revenue_impact_statement ||
          report?.revenueImpactStatement,
      } as BrandBlueprintPlusPDFProps;

    default:
      throw new Error(`Unknown document type: ${documentType}`);
  }
}

/**
 * Generate PDF from database report data
 * Convenience function that combines transformation and generation
 * 
 * @param report - Report data from database
 * @param documentType - Type of document to generate
 * @param filename - Optional filename for the PDF
 * @returns Promise<Buffer> - PDF buffer
 */
export async function generatePdfFromReport(
  report: any,
  documentType: PDFDocumentType,
  filename?: string
): Promise<Buffer> {
  const transformedData = transformReportDataForPdf(report, documentType);
  return generatePdf({
    documentType,
    data: transformedData,
    filename,
  });
}

/**
 * Generate PDF Response from database report data
 * Convenience function for API routes
 * 
 * @param report - Report data from database
 * @param documentType - Type of document to generate
 * @param filename - Optional filename for the PDF
 * @returns Promise<Response> - Next.js Response with PDF
 */
export async function generatePdfResponseFromReport(
  report: any,
  documentType: PDFDocumentType,
  filename?: string
): Promise<Response> {
  const transformedData = transformReportDataForPdf(report, documentType);
  return generatePdfResponse({
    documentType,
    data: transformedData,
    filename,
  });
}

// Note: Document types are exported from their respective document files
// This file only exports PDF generation utilities
