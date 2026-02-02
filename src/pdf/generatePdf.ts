// src/pdf/generatePdf.ts
// Centralized PDF generation utility for all document types
// Handles Brand Snapshot™, Snapshot+™, Blueprint™, and Blueprint+™

import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
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
      } as unknown as BrandSnapshotReport;

    case "snapshot-plus":
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
        personalityWords: r.personality_words || r.personalityWords || report?.personality_words || [],
        competitorNames: r.competitor_names || r.competitorNames || report?.competitor_names || [],
        targetCustomers: r.target_customers || r.targetCustomers || report?.target_customers,
        brandOpportunities: r.brand_opportunities || r.brandOpportunities || report?.brand_opportunities,
        messagingGaps: r.messaging_gaps || r.messagingGaps || report?.messaging_gaps,
        visibilityPlan: r.visibility_plan || r.visibilityPlan || report?.visibility_plan,
        visualIdentityNotes: r.visual_identity_notes || r.visualIdentityNotes || report?.visual_identity_notes,
        aiPrompts: r.ai_prompts || r.aiPrompts || report?.ai_prompts || [],
        aeoRecommendations: r.aeo_recommendations || r.aeoRecommendations || report?.aeo_recommendations,
      } as BrandSnapshotPlusReport;

    case "blueprint":
      return {
        ...baseProps,
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
        aeoIntegratedStrategy: r.aeo_integrated_strategy || r.aeoIntegratedStrategy || report?.aeo_integrated_strategy,
      } as BrandBlueprintReport;

    case "blueprint-plus":
      return {
        ...baseProps,
        brandStory: r.brand_story || report?.brand_story,
        positioning: r.positioning || report?.positioning,
        journey: r.journey || report?.journey || [],
        contentRoadmap: r.content_roadmap || report?.content_roadmap || [],
        visualDirection: r.visual_direction || report?.visual_direction || [],
        personality: r.personality || report?.personality,
        decisionFilters: r.decision_filters || report?.decision_filters || [],
        aiPrompts: r.ai_prompts || report?.ai_prompts || [],
        completeAEOSystem: r.complete_aeo_system || report?.complete_aeo_system,
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
