// src/services/reportService.ts

/**
 * Service to handle saving reports and syncing to ActiveCampaign
 */

interface WundyJson {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
    industry?: string;
    website?: string;
    socialLinks?: {
      linkedin?: string;
      instagram?: string;
      facebook?: string;
      other?: string[];
    };
  };
  scores: {
    positioning: number;
    messaging: number;
    visibility: number;
    credibility: number;
    conversion: number;
    brandAlignmentScore: number;
  };
  summary?: string;
  optIn: boolean;
  fullReport?: {
    positioningInsight?: string;
    messagingInsight?: string;
    visibilityInsight?: string;
    credibilityInsight?: string;
    conversionInsight?: string;
    recommendations?: string[];
    websiteNotes?: string;
  };
  [key: string]: any; // Allow other fields
}

/**
 * Save report to Supabase and sync to ActiveCampaign
 * Returns the reportId for use in email links
 */
export async function saveReportAndSync(
  wundyJson: WundyJson
): Promise<{ reportId: string; success: boolean; error?: string }> {
  try {
    // Generate report ID
    const reportId = wundyJson.reportId || `report-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    // Extract user info
    const email = wundyJson.user?.email || '';
    const name = wundyJson.user?.firstName && wundyJson.user?.lastName
      ? `${wundyJson.user.firstName} ${wundyJson.user.lastName}`.trim()
      : wundyJson.user?.firstName || 'Unknown';

    // Prepare data structure for the API
    const reportData = {
      reportId,
      email,
      name,
      data: {
        brandAlignmentScore: wundyJson.scores?.brandAlignmentScore || 0,
        pillarScores: {
          positioning: wundyJson.scores?.positioning || 0,
          messaging: wundyJson.scores?.messaging || 0,
          visibility: wundyJson.scores?.visibility || 0,
          credibility: wundyJson.scores?.credibility || 0,
          conversion: wundyJson.scores?.conversion || 0,
        },
        pillarInsights: {
          positioning: wundyJson.fullReport?.positioningInsight || '',
          messaging: wundyJson.fullReport?.messagingInsight || '',
          visibility: wundyJson.fullReport?.visibilityInsight || '',
          credibility: wundyJson.fullReport?.credibilityInsight || '',
          conversion: wundyJson.fullReport?.conversionInsight || '',
        },
        recommendations: wundyJson.fullReport?.recommendations || [],
        websiteNotes: wundyJson.fullReport?.websiteNotes || '',
        ...wundyJson, // Include full data
      }
    };

    // Step 1: Save to Supabase
    const saveResponse = await fetch('/api/report/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json().catch(() => ({}));
      console.error('[Report Service] Failed to save report:', errorData);
      return {
        reportId: '',
        success: false,
        error: errorData.error || 'Failed to save report',
      };
    }

    // Verify save was successful (API returns { success: true })
    const saveData = await saveResponse.json();
    if (!saveData.success) {
      return {
        reportId: '',
        success: false,
        error: 'Report save returned unsuccessful',
      };
    }

    // Step 2: Sync to ActiveCampaign (with report link)
    // Add report link to the JSON for ActiveCampaign
    // Use wunderbardigital.com for report links (can be overridden with NEXT_PUBLIC_BASE_URL)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wunderbardigital.com';
    const reportLink = `${baseUrl}/report/${reportId}`;
    
    const acResponse = await fetch('/api/activecampaign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...wundyJson,
        reportLink, // Include report link for email
      }),
    });

    if (!acResponse.ok) {
      const errorData = await acResponse.json().catch(() => ({}));
      console.error('[Report Service] Failed to sync to ActiveCampaign:', errorData);
      // Don't fail completely - report is saved, just AC sync failed
      return {
        reportId,
        success: true, // Report saved successfully
        error: 'Report saved but ActiveCampaign sync failed',
      };
    }

    return {
      reportId,
      success: true,
    };
  } catch (err: any) {
    console.error('[Report Service] Unexpected error:', err);
    return {
      reportId: '',
      success: false,
      error: err?.message || 'Unknown error',
    };
  }
}

