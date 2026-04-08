// app/api/snapshot-plus/pdf/route.ts
// API route to generate WunderBrand Snapshot+™ PDF (content mirrors report view)

import { NextResponse } from 'next/server';
import React from 'react';
import { logger } from '@/lib/logger';
import { supabaseServer } from '@/lib/supabaseServer';
import { getPrimaryPillar } from '@/src/lib/pillars/getPrimaryPillar';
import type { BrandSnapshotPlusReport } from "@/src/pdf/BrandSnapshotPlusPDF";

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
    archetype,
    voice: r.enriched_voice ?? r.voice,
    colorPalette: r.enriched_color_palette ?? r.color_palette ?? [],
    roadmap_30: pickFirst(
      r.roadmap_30,
      r.roadmap30,
      r.thirtyDayPlan,
      r.plan30,
      roadmapFromObject.next30Days,
      roadmapFromObject.day30,
      roadmapFromObject.thirtyDay
    ),
    roadmap_60: pickFirst(
      r.roadmap_60,
      r.roadmap60,
      r.sixtyDayPlan,
      r.plan60,
      roadmapFromObject.next60Days,
      roadmapFromObject.day60,
      roadmapFromObject.sixtyDay
    ),
    roadmap_90: pickFirst(
      r.roadmap_90,
      r.roadmap90,
      r.ninetyDayPlan,
      r.plan90,
      roadmapFromObject.next90Days,
      roadmapFromObject.day90,
      roadmapFromObject.ninetyDay
    ),
    opportunities_map: r.opportunities_map,
    brandOpportunities: r.brand_opportunities ?? r.brandOpportunities,
    targetCustomers: r.target_customers ?? r.targetCustomers,
    competitorNames: r.competitor_names ?? r.competitorNames ?? [],
    personalityWords: r.personality_words ?? r.personalityWords ?? [],
    messagingGaps: r.messaging_gaps ?? r.messagingGaps,
    visibilityPlan: r.visibility_plan ?? r.visibilityPlan,
    contentFormatChannelSnapshot:
      r.content_format_channel_snapshot ??
      r.contentFormatChannelSnapshot,
    marketingSpendAuditSignal:
      r.marketing_spend_audit_signal ??
      r.marketingSpendAuditSignal ??
      r.marketing_spend_efficiency_signal ??
      r.marketingSpendEfficiencySignal,
    competitiveVulnerabilitySignal:
      r.competitive_vulnerability_signal ??
      r.competitiveVulnerabilitySignal,
    revenueImpactStatement:
      r.revenue_impact_statement ??
      r.revenueImpactStatement,
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
    const exportType = (searchParams.get("type") || "snapshot-plus").toLowerCase();

    if (!reportId) {
      return NextResponse.json(
        { error: 'Missing report id' },
        { status: 400 }
      );
    }
    if (!["snapshot-plus", "executive", "prompts"].includes(exportType)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: snapshot-plus, executive, prompts' },
        { status: 400 }
      );
    }

    // Fetch report from Supabase
    const supabase = supabaseServer();
    
    // Try snapshot-plus reports first (support report_id and id), then fall back to snapshot table.
    let { data: report, error } = await supabase
      .from('brand_snapshot_plus_reports')
      .select('*')
      .eq('report_id', reportId)
      .single();

    if (error || !report) {
      const byIdResult = await supabase
        .from('brand_snapshot_plus_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (byIdResult.data) {
        report = byIdResult.data;
        error = byIdResult.error;
      }
    }

    if (error || !report) {
      // Fall back to regular snapshot reports
      const resultByReportId = await supabase
        .from('brand_snapshot_reports')
        .select('*')
        .eq('report_id', reportId)
        .single();

      report = resultByReportId.data;
      error = resultByReportId.error;
    }

    if (error || !report) {
      const resultById = await supabase
        .from('brand_snapshot_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      report = resultById.data;
      error = resultById.error;
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
    let doc: React.ReactElement;
    if (exportType === "executive") {
      const { SnapshotPlusExecutiveSummaryDocument } = await import(
        "@/src/pdf/documents/SnapshotPlusExecutiveSummaryDocument"
      );
      doc = React.createElement(SnapshotPlusExecutiveSummaryDocument, {
        report: reportData as BrandSnapshotPlusReport,
      });
    } else if (exportType === "prompts") {
      const { SnapshotPlusPromptGuideDocument } = await import(
        "@/src/pdf/documents/SnapshotPlusPromptGuideDocument"
      );
      doc = React.createElement(SnapshotPlusPromptGuideDocument, {
        report: reportData as BrandSnapshotPlusReport,
      });
    } else {
      const { BrandSnapshotPlusPDF } = await import('@/src/pdf/BrandSnapshotPlusPDF');
      doc = React.createElement(BrandSnapshotPlusPDF, { report: reportData as BrandSnapshotPlusReport });
    }
    const pdfBuffer = await renderToBuffer(doc as any);

    // Generate filename
    const companyName = reportData.businessName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename =
      exportType === "executive"
        ? `${companyName}-SnapshotPlus-Executive-Summary.pdf`
        : exportType === "prompts"
          ? `${companyName}-SnapshotPlus-Prompt-Guide.pdf`
          : `${companyName}-Brand-Snapshot+.pdf`;

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
