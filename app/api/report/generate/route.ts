// app/api/report/generate/route.ts
// API route to generate WunderBrand Snapshot™ reports

import { NextResponse } from 'next/server';
import { generateReport, type ReportData } from '@/src/services/reportGenerator';
import { logger } from '@/lib/logger';
import { apiGuard } from '@/lib/security/apiGuard';
import { GENERAL_RATE_LIMIT } from '@/lib/security/rateLimit';

export async function POST(request: Request) {
  const guard = apiGuard(request, { routeId: 'report-generate', rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await request.json();

    // Validate required fields
    if (typeof body.brandAlignmentScore !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid brandAlignmentScore' },
        { status: 400 }
      );
    }

    if (!body.pillarScores || typeof body.pillarScores !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid pillarScores' },
        { status: 400 }
      );
    }

    // Build report data
    const reportData: ReportData = {
      brandAlignmentScore: body.brandAlignmentScore,
      pillarScores: {
        positioning: body.pillarScores.positioning || 0,
        messaging: body.pillarScores.messaging || 0,
        visibility: body.pillarScores.visibility || 0,
        credibility: body.pillarScores.credibility || 0,
        conversion: body.pillarScores.conversion || 0,
      },
      userContext: body.userContext || {},
    };

    // Generate report
    const report = generateReport(reportData);

    return NextResponse.json(report);
  } catch (error: any) {
    logger.error("[Report Generate API] Error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: error?.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint for testing with example data
export async function GET() {
  try {
    const { generateExampleReport } = await import('@/src/services/reportGenerator');
    const exampleReport = generateExampleReport();
    return NextResponse.json(exampleReport);
  } catch (error: any) {
    logger.error("[Report Generate API] Error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: error?.message || 'Failed to generate example report' },
      { status: 500 }
    );
  }
}

