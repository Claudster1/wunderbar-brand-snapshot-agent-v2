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
    // Step 1: Save to Supabase
    const saveResponse = await fetch('/api/report/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wundyJson),
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

    const saveData = await saveResponse.json();
    const reportId = saveData.reportId;

    // Step 2: Sync to ActiveCampaign (with report link)
    // Add report link to the JSON for ActiveCampaign
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (typeof window !== 'undefined' ? window.location.origin : '');
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

