// lib/generateSnapshotPdf.ts
// PDF generation utility for Brand Snapshot reports

import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { BrandSnapshotReport } from "@/pdf/BrandSnapshotReport";
import type { ReactElement } from "react";

/**
 * Transform database report format to PDF template format
 */
function transformReportForPdf(report: any) {
  const pillarScores = report.pillar_scores || {};
  const pillarInsights = report.pillar_insights || {};
  
  // Extract insights - handle both old format (string) and new format (object)
  const insights: Record<string, string> = {};
  Object.keys(pillarScores).forEach((pillar) => {
    const insightData = pillarInsights[pillar];
    if (typeof insightData === 'string') {
      insights[pillar] = insightData;
    } else if (insightData && typeof insightData === 'object') {
      // Combine strength, opportunity, and action into a single string
      const parts: string[] = [];
      if (insightData.strength) parts.push(`Strength: ${insightData.strength}`);
      if (insightData.opportunity) parts.push(`Opportunity: ${insightData.opportunity}`);
      if (insightData.action) parts.push(`Next Step: ${insightData.action}`);
      insights[pillar] = parts.join('\n\n') || 'No insight available.';
    } else {
      insights[pillar] = 'No insight available.';
    }
  });

  // Transform recommendations - handle both array and object formats
  let recommendations: Array<{ title: string; description: string }> = [];
  if (Array.isArray(report.recommendations)) {
    recommendations = report.recommendations.map((rec: any, index: number) => {
      if (typeof rec === 'string') {
        return { title: `Recommendation ${index + 1}`, description: rec };
      }
      return { title: rec.title || `Recommendation ${index + 1}`, description: rec.description || rec };
    });
  } else if (report.recommendations && typeof report.recommendations === 'object') {
    // If it's an object with pillar keys, convert to array
    Object.entries(report.recommendations).forEach(([pillar, rec]: [string, any]) => {
      if (typeof rec === 'string') {
        recommendations.push({ title: `${pillar.charAt(0).toUpperCase() + pillar.slice(1)} Recommendation`, description: rec });
      } else if (rec && typeof rec === 'object') {
        recommendations.push({ title: rec.title || `${pillar.charAt(0).toUpperCase() + pillar.slice(1)} Recommendation`, description: rec.description || rec });
      }
    });
  }

  // If no recommendations, create a default one
  if (recommendations.length === 0) {
    recommendations.push({
      title: "Next Steps",
      description: "Review your Brand Snapshot™ results and focus on improving your weakest pillar first. Consider upgrading to Snapshot+™ for a complete strategic roadmap.",
    });
  }

  // Transform persona and archetype
  const persona = report.persona 
    ? { summary: typeof report.persona === 'string' ? report.persona : report.persona.summary || report.persona }
    : { summary: "Your brand persona will be defined in your Snapshot+™ report." };
  
  const archetype = report.archetype
    ? { summary: typeof report.archetype === 'string' ? report.archetype : report.archetype.summary || report.archetype }
    : { summary: "Your brand archetype will be defined in your Snapshot+™ report." };

  // Transform brand pillars
  let brandPillars: Array<{ name: string; description: string }> = [];
  if (report.brand_pillars && Array.isArray(report.brand_pillars)) {
    brandPillars = report.brand_pillars.map((p: any) => {
      if (typeof p === 'string') {
        return { name: p, description: `This pillar represents a core truth your brand stands on.` };
      }
      return { name: p.name || 'Brand Pillar', description: p.description || p };
    });
  }
  
  // If no brand pillars, create placeholder
  if (brandPillars.length === 0) {
    brandPillars = [
      { name: "Brand Pillars", description: "Your brand pillars will be defined in your Snapshot+™ report." }
    ];
  }

  // Transform color palette
  const colorSystem = report.color_palette && Array.isArray(report.color_palette)
    ? report.color_palette.map((c: any) => ({
        name: c.name || 'Color',
        hex: c.hex || '#000000',
        role: c.role || 'Primary',
        meaning: c.meaning || 'No meaning specified.',
      }))
    : [
        { name: "Primary Blue", hex: "#07B0F2", role: "Primary", meaning: "Trust and clarity" },
        { name: "Navy", hex: "#021859", role: "Secondary", meaning: "Authority and professionalism" },
      ];

  // Get score label
  const score = report.brand_alignment_score || 0;
  let scoreLabel = "Your brand shows strong alignment across key pillars.";
  if (score < 10) {
    scoreLabel = "Your brand has significant opportunities for improvement. Focus on your weakest pillar first.";
  } else if (score < 15) {
    scoreLabel = "Your brand is developing. Small refinements can create meaningful momentum.";
  } else if (score < 18) {
    scoreLabel = "Your brand shows strong alignment. Continue building on your strengths.";
  }

  return {
    reportId: report.report_id || report.id,
    name: report.user_name || report.name,
    businessName: report.company || report.company_name || report.businessName,
    website: report.website,
    brandAlignmentScore: score,
    scoreLabel,
    pillars: pillarScores,
    insights,
    recommendations,
    persona,
    archetype,
    brandPillars,
    colorSystem,
  };
}

export async function generateSnapshotPdf(report: any): Promise<Buffer> {
  try {
    const transformedData = transformReportForPdf(report);
    const element = React.createElement(BrandSnapshotReport, transformedData as any) as ReactElement;
    const pdfBuffer = await renderToBuffer(element as any);
    return pdfBuffer;
  } catch (error) {
    console.error("[PDF Generation] Error:", error);
    throw new Error("Failed to generate PDF");
  }
}

