// src/services/snapshotService.ts
// Service to handle Brand Snapshot report generation and saving

import { calculateScores } from '../lib/brandSnapshotEngine';
import type { BrandChatMessage } from '../types';

/**
 * Extract user context from conversation history
 * This parses the conversation to extract key information for report generation
 */
export function extractUserContext(messages: BrandChatMessage[]): UserContext {
  const context: UserContext = {};
  const conversationText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.text.toLowerCase())
    .join(' ');

  // Website presence
  if (conversationText.includes('yes') && conversationText.includes('website')) {
    context.hasWebsite = true;
  } else if (conversationText.includes('no') && conversationText.includes('website')) {
    context.hasWebsite = false;
  }

  // Extract website URL if mentioned
  const urlMatch = conversationText.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    context.hasWebsite = true;
  }

  // Elevator pitch
  if (
    conversationText.includes('elevator pitch') &&
    (conversationText.includes('yes') || conversationText.includes('have'))
  ) {
    context.hasElevatorPitch = true;
  }

  // Messaging consistency
  if (
    conversationText.includes('messaging') &&
    conversationText.includes('consistent')
  ) {
    context.messagingConsistent = true;
  } else if (
    conversationText.includes('messaging') &&
    (conversationText.includes('inconsistent') || conversationText.includes('varies'))
  ) {
    context.messagingConsistent = false;
  }

  // Customers get it
  if (
    conversationText.includes('get') &&
    (conversationText.includes('yes') || conversationText.includes('immediately'))
  ) {
    context.customersGetIt = true;
  }

  // Content system
  if (
    conversationText.includes('content system') &&
    (conversationText.includes('yes') || conversationText.includes('have'))
  ) {
    context.hasContentSystem = true;
  } else if (
    conversationText.includes('sporadic') ||
    conversationText.includes('no schedule')
  ) {
    context.hasContentSystem = false;
    context.contentConsistency = 'none';
  }

  // Email list
  if (
    conversationText.includes('email list') &&
    (conversationText.includes('yes') || conversationText.includes('have'))
  ) {
    context.hasEmailList = true;
  }

  // Email campaigns
  if (
    conversationText.includes('email campaign') &&
    (conversationText.includes('weekly') ||
      conversationText.includes('monthly') ||
      conversationText.includes('regular'))
  ) {
    context.emailCampaignsRegular = true;
  }

  // Testimonials
  if (
    conversationText.includes('testimonial') &&
    (conversationText.includes('yes') || conversationText.includes('have'))
  ) {
    context.hasTestimonials = true;
  }

  // Case studies
  if (
    conversationText.includes('case study') &&
    (conversationText.includes('yes') || conversationText.includes('have'))
  ) {
    context.hasCaseStudies = true;
  }

  // Work examples visible
  if (
    conversationText.includes('work example') &&
    (conversationText.includes('yes') || conversationText.includes('visible'))
  ) {
    context.workExamplesVisible = true;
  }

  // Clear CTAs
  if (
    conversationText.includes('call to action') ||
    conversationText.includes('cta')
  ) {
    if (conversationText.includes('yes') || conversationText.includes('clear')) {
      context.hasClearCTA = true;
    }
  }

  // Next step obvious
  if (
    conversationText.includes('next step') &&
    (conversationText.includes('yes') || conversationText.includes('obvious'))
  ) {
    context.nextStepObvious = true;
  }

  // Lead magnets
  if (
    conversationText.includes('lead magnet') &&
    (conversationText.includes('yes') || conversationText.includes('have'))
  ) {
    context.hasLeadMagnets = true;
  }

  // Differentiator
  if (
    conversationText.includes('different') &&
    !conversationText.includes("don't know") &&
    !conversationText.includes('not sure')
  ) {
    context.knowsDifferentiator = true;
  }

  return context;
}

/**
 * Extract company info from conversation
 */
export function extractCompanyInfo(messages: BrandChatMessage[]): {
  company_name?: string;
  website?: string;
  industry?: string;
} {
  const info: { company_name?: string; website?: string; industry?: string } = {};

  // Find company name (usually in first few user messages)
  const earlyMessages = messages
    .filter((m) => m.role === 'user')
    .slice(0, 3);
  
  for (const msg of earlyMessages) {
    const text = msg.text;
    // Look for company name question response
    if (text.length < 50 && !text.includes('?')) {
      info.company_name = text.trim();
      break;
    }
  }

  // Extract website URL
  const allText = messages.map((m) => m.text).join(' ');
  const urlMatch = allText.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    info.website = urlMatch[0];
  }

  // Extract industry (look for "industry" question response)
  const industryMessages = messages.filter((m) => 
    m.role === 'assistant' && m.text.toLowerCase().includes('industry')
  );
  if (industryMessages.length > 0) {
    const industryIndex = messages.indexOf(industryMessages[0]);
    const nextUserMessage = messages[industryIndex + 1];
    if (nextUserMessage && nextUserMessage.role === 'user') {
      info.industry = nextUserMessage.text.trim();
    }
  }

  return info;
}

/**
 * Generate full report and save to database using centralized engine
 */
export async function generateAndSaveSnapshot(
  brandAlignmentScore: number,
  pillarScores: {
    positioning: number;
    messaging: number;
    visibility: number;
    credibility: number;
    conversion: number;
  },
  pillarInsights: {
    positioning?: string;
    messaging?: string;
    visibility?: string;
    credibility?: string;
    conversion?: string;
  },
  messages: BrandChatMessage[],
  userInfo?: {
    user_name?: string;
    company_name?: string;
    website?: string;
    industry?: string;
  }
): Promise<{ report_id: string; success: boolean; error?: string }> {
  try {
    // Extract company info from conversation
    const companyInfo = extractCompanyInfo(messages);

    // Use centralized engine to calculate scores and generate all insights
    const engineResults = calculateScores(pillarScores);

    // Generate unique report ID
    const report_id = crypto.randomUUID();

    // Save to database using save-report API
    const saveResponse = await fetch('/api/save-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandAlignmentScore: engineResults.brandAlignmentScore,
        pillarScores: engineResults.pillarScores,
        pillarInsights: pillarInsights, // Use provided insights if available
        recommendations: recommendations || {}, // Pillar-specific recommendations
        userName: userInfo?.user_name || null,
        company: userInfo?.company_name || companyInfo.company_name || null,
        email: null, // Email collected via form on parent page
        websiteNotes: userInfo?.website || companyInfo.website || null,
      }),
    });

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      throw new Error(errorData.error || 'Failed to save snapshot');
    }

    const result = await saveResponse.json();

    return { report_id: result.reportId || report_id, success: true };
  } catch (error: any) {
    console.error('[Snapshot Service] Error:', error);
    return {
      report_id: '',
      success: false,
      error: error?.message || 'Failed to generate and save snapshot',
    };
  }
}

