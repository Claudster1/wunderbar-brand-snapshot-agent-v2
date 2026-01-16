// app/api/snapshot-plus/pdf/route.ts
// API route to generate Brand Snapshot+™ PDF using ReportDocument

import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { SnapshotPlusReportDocument, type Pillar } from '@/src/pdf';
import { supabaseServer } from '@/lib/supabaseServer';
import { getPrimaryPillar, detectStage } from '@/src/utils/postStripeStrategy';
import { PILLARS } from '@/lib/pillars';

export const runtime = "nodejs";

/**
 * Transform database report to ReportDocument props
 */
function transformReportData(report: any) {
  const r = report?.full_report || report || {};
  
  const pillarScores = r.pillar_scores || r.pillarScores || {
    positioning: 0,
    messaging: 0,
    visibility: 0,
    credibility: 0,
    conversion: 0,
  };

  const pillarInsights = r.pillar_insights || r.pillarInsights || {};
  const recommendations = r.recommendations || {};

  // Determine primary pillar (lowest score)
  const primaryPillarKey = getPrimaryPillar(pillarScores);
  const primaryPillarName = PILLARS[primaryPillarKey]?.title || primaryPillarKey;

  // Determine stage label
  const stage = detectStage({
    yearsInBusiness: r.years_in_business,
    teamSize: r.team_size,
    monthlyRevenue: r.monthly_revenue,
  });
  const stageLabels: Record<string, string> = {
    early: "Early stage",
    growth: "Growth stage",
    scaling: "Scaling stage",
  };
  const stageLabel = stageLabels[stage] || "Your current stage";

  // Transform pillars array
  const pillars: Pillar[] = Object.entries(pillarScores).map(([key, score]) => {
    const pillarKey = key as keyof typeof PILLARS;
    const pillarInfo = PILLARS[pillarKey];
    const insight = pillarInsights[pillarKey] || "";
    const recommendation = recommendations[pillarKey] || "";

    // Extract structured insight if it's an object
    let whatWeSee = insight;
    let whyItMatters = "";
    let riskIfUnchanged = "";
    let nextFocus = recommendation;

    if (typeof insight === "object" && insight !== null) {
      whatWeSee = insight.analysis || insight.headline || insight.text || "";
      whyItMatters = insight.whyThisMatters || "";
    } else if (typeof insight === "string") {
      whatWeSee = insight;
    }

    // If we don't have structured data, generate defaults
    if (!whyItMatters) {
      whyItMatters = `At your ${stage} stage, ${pillarInfo?.summary || "this pillar"} directly impacts your ability to attract and convert customers.`;
    }

    if (!riskIfUnchanged) {
      riskIfUnchanged = `Without addressing ${pillarInfo?.title.toLowerCase()}, you may struggle to differentiate from competitors and miss opportunities for growth.`;
    }

    if (!nextFocus && recommendation) {
      nextFocus = Array.isArray(recommendation) 
        ? recommendation.join(" ") 
        : recommendation;
    }

    if (!nextFocus) {
      nextFocus = `Focus on strengthening your ${pillarInfo?.title.toLowerCase()} to improve overall brand alignment.`;
    }

    return {
      name: pillarInfo?.title || key,
      score: score as number,
      whatWeSee: whatWeSee || `Your ${pillarInfo?.title.toLowerCase()} needs attention.`,
      whyItMatters: whyItMatters || `This pillar is critical for your brand's success.`,
      riskIfUnchanged: riskIfUnchanged || `Continuing without improvement may limit your growth potential.`,
      nextFocus: nextFocus || `Take action to strengthen this area.`,
    };
  });

  return {
    companyName: r.company || r.business_name || r.company_name || "Your Company",
    brandAlignmentScore: r.brand_alignment_score || r.brandAlignmentScore || 0,
    primaryPillar: primaryPillarName,
    stageLabel,
    pillars,
  };
}

/**
 * GET /api/snapshot-plus/pdf?id=report-id
 * 
 * Generates a Brand Snapshot+™ PDF from a report ID
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

    // Transform report data
    const data = transformReportData(report);

    // Generate PDF
    const doc = React.createElement(SnapshotPlusReportDocument, data);
    const pdfBuffer = await renderToBuffer(doc);

    // Generate filename
    const companyName = data.companyName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${companyName}-Brand-Snapshot+.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error('[Snapshot+ PDF] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
