// app/api/snapshot-plus/pdf/route.ts
// API route to generate WunderBrand Snapshot+™ PDF (content mirrors report view)

import { NextResponse } from 'next/server';
import React from 'react';
import { logger } from '@/lib/logger';
import { supabaseServer } from '@/lib/supabaseServer';
import { getPrimaryPillar } from '@/src/lib/pillars/getPrimaryPillar';

export const runtime = "nodejs";

const defaultPillarScores = {
  positioning: 0,
  messaging: 0,
  visibility: 0,
  credibility: 0,
  conversion: 0,
};

const defaultPillarStrings = {
  positioning: "",
  messaging: "",
  visibility: "",
  credibility: "",
  conversion: "",
};

/**
 * Transform database report to BrandSnapshotPlusReport (same shape as report view).
 */
function transformReportData(report: any) {
  const r = report?.full_report ?? report ?? {};

  const pillarScores = r.pillar_scores || r.pillarScores || defaultPillarScores;
  const primaryResult = getPrimaryPillar(pillarScores);
  const primaryPillar =
    primaryResult.type === "tie" && primaryResult.pillars?.length
      ? primaryResult.pillars[0]
      : (primaryResult as { pillar: string }).pillar;

  return {
    userName: r.user_name || r.userName || "User",
    businessName: r.company || r.business_name || r.company_name || "Your Company",
    industry: r.industry ?? "",
    website: r.website ?? null,
    socials: Array.isArray(r.socials) ? r.socials : [],
    brandAlignmentScore: r.brand_alignment_score ?? r.brandAlignmentScore ?? 0,
    pillarScores,
    primaryPillar,
    pillarInsights: r.pillar_insights || r.pillarInsights || defaultPillarStrings,
    recommendations:
      r.recommendations && typeof r.recommendations === "object"
        ? {
            positioning: r.recommendations.positioning ?? "",
            messaging: r.recommendations.messaging ?? "",
            visibility: r.recommendations.visibility ?? "",
            credibility: r.recommendations.credibility ?? "",
            conversion: r.recommendations.conversion ?? "",
          }
        : defaultPillarStrings,
    contextCoverage: r.context_coverage ?? r.contextCoverage,
    persona: r.enriched_persona ?? r.persona,
    archetype: r.enriched_archetype ?? r.archetype ?? r.brand_archetype,
    voice: r.enriched_voice ?? r.voice,
    colorPalette: r.enriched_color_palette ?? r.color_palette ?? [],
    roadmap_30: r.roadmap_30,
    roadmap_60: r.roadmap_60,
    roadmap_90: r.roadmap_90,
    opportunities_map: r.opportunities_map,
    brandOpportunities: r.brand_opportunities ?? r.brandOpportunities,
    targetCustomers: r.target_customers ?? r.targetCustomers,
    competitorNames: r.competitor_names ?? r.competitorNames ?? [],
    personalityWords: r.personality_words ?? r.personalityWords ?? [],
    messagingGaps: r.messaging_gaps ?? r.messagingGaps,
    visibilityPlan: r.visibility_plan ?? r.visibilityPlan,
    visualIdentityNotes: r.visual_identity_notes ?? r.visualIdentityNotes,
    aeoRecommendations: r.aeo_recommendations ?? r.aeoRecommendations,
    aiPrompts: r.ai_prompts ?? r.aiPrompts ?? [],
  };
}

/**
 * GET /api/snapshot-plus/pdf?id=report-id
 * 
 * Generates a WunderBrand Snapshot+™ PDF from a report ID
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json(
        { error: 'Missing report id' },
        { status: 400 }
      );
    }

    // Fetch report from Supabase
    const supabase = supabaseServer();
    
    // Try snapshot-plus reports first, then fall back to regular snapshot reports
    let { data: report, error } = await supabase
      .from('brand_snapshot_plus_reports')
      .select('*')
      .eq('report_id', reportId)
      .single();

    if (error || !report) {
      // Fall back to regular snapshot reports
      const result = await supabase
        .from('brand_snapshot_reports')
        .select('*')
        .eq('report_id', reportId)
        .single();
      
      report = result.data;
      error = result.error;
    }

    if (error || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // ─── Security: block PDF access for unverified reports ───
    if (report.email_verified === false) {
      return NextResponse.json(
        { error: 'Email verification required before downloading your report.' },
        { status: 403 }
      );
    }

    // Transform report data (same shape as report view)
    const reportData = transformReportData(report);

    const { renderToBuffer } = await import('@react-pdf/renderer');
    const { BrandSnapshotPlusPDF } = await import('@/src/pdf/BrandSnapshotPlusPDF');
    const doc = React.createElement(BrandSnapshotPlusPDF, { report: reportData });
    const pdfBuffer = await renderToBuffer(doc as any);

    // Generate filename
    const companyName = reportData.businessName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${companyName}-Brand-Snapshot+.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err: unknown) {
    logger.error("[Snapshot+ PDF] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: 'Failed to generate PDF. Please try again.' },
      { status: 500 }
    );
  }
}
