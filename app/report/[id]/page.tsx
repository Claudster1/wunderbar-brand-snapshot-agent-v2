// app/report/[id]/page.tsx

import { ReportTemplate } from "@/components/ReportTemplate";
import { notFound } from "next/navigation";

async function getReportData(id: string) {
  // Use absolute URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  try {
    const response = await fetch(
      `${baseUrl}/api/report/get?id=${id}`,
      { 
        cache: "no-store",
        next: { revalidate: 0 } // Ensure fresh data
      }
    );

    if (!response.ok) {
      console.error(`[Report Page] Failed to fetch report: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[Report Page] Error fetching report:', error);
    return null;
  }
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  const reportData = await getReportData(params.id);

  if (!reportData) return notFound();

  // Transform the full_report data to match ReportTemplate expectations
  const transformedData = {
    reportId: params.id,
    userName: reportData.user?.firstName && reportData.user?.lastName
      ? `${reportData.user.firstName} ${reportData.user.lastName}`.trim()
      : reportData.user?.firstName || 'User',
    brandAlignmentScore: reportData.brandAlignmentScore || reportData.scores?.brandAlignmentScore || 0,
    pillarScores: reportData.pillarScores || {
      positioning: reportData.scores?.positioning || 0,
      messaging: reportData.scores?.messaging || 0,
      visibility: reportData.scores?.visibility || 0,
      credibility: reportData.scores?.credibility || 0,
      conversion: reportData.scores?.conversion || 0,
    },
    pillarInsights: reportData.pillarInsights || {
      positioning: reportData.fullReport?.positioningInsight || '',
      messaging: reportData.fullReport?.messagingInsight || '',
      visibility: reportData.fullReport?.visibilityInsight || '',
      credibility: reportData.fullReport?.credibilityInsight || '',
      conversion: reportData.fullReport?.conversionInsight || '',
    },
    recommendations: reportData.recommendations || reportData.fullReport?.recommendations || [],
    websiteNotes: reportData.websiteNotes || reportData.fullReport?.websiteNotes || null,
  };

  return (
    <main className="bg-white min-h-screen">
      <ReportTemplate data={transformedData} />
    </main>
  );
}

