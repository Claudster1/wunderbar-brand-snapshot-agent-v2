// app/api/snapshot-plus/pdf/route.ts
// API route to generate Brand Snapshot+™ PDF using ReportDocument

import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { SnapshotPlusReport } from '@/src/pdf/SnapshotPlusReport';
import { supabaseServer } from '@/lib/supabaseServer';
import { getPrimaryPillar, detectStage } from '@/src/utils/postStripeStrategy';

export const runtime = "nodejs";

/**
 * Transform database report to SnapshotPlusReport props
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

  return {
    brandName: r.company || r.business_name || r.company_name || "Your Company",
    userRolePhrase: r.userRolePhrase || r.userRoleContext,
    stage: r.stage || detectStage({
      yearsInBusiness: r.years_in_business,
      teamSize: r.team_size,
      monthlyRevenue: r.monthly_revenue,
    }),
    archetype: r.archetype || r.brand_archetype || "Explorer",
    brandAlignmentScore: r.brand_alignment_score || r.brandAlignmentScore || 0,
    pillarScores,
    primaryPillar: getPrimaryPillar(pillarScores),
    pillarInsights: r.pillar_insights || r.pillarInsights || {},
    recommendations: r.recommendations || {},
    contextCoverage: r.contextCoverage || r.context_coverage || 0,
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
    const doc = React.createElement(SnapshotPlusReport, data);
    const pdfBuffer = await renderToBuffer(doc);

    // Generate filename
    const companyName = data.brandName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
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
