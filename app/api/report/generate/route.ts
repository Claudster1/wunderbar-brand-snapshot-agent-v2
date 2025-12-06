// app/api/report/generate/route.ts
// API route to generate Brand Snapshot™ reports

import { NextResponse } from 'next/server';
import { generateReport, type ReportData } from '@/src/services/reportGenerator';

export async function POST(request: Request) {
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
    console.error('[Report Generate API] Error:', error);
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
    console.error('[Report Generate API] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate example report' },
      { status: 500 }
    );
  }
}

