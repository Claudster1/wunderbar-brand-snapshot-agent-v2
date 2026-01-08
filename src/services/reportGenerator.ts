// src/services/reportGenerator.ts
// Brand Snapshot™ Report Generation Engine

import pillarInsightsData from '../prompts/pillarInsights.json';
import {
  generateAllPillarInsights,
  generateUpsellCopy,
  findWeakestPillar,
  findStrongPillars,
  type GapSeverity,
} from './dynamicInsights';

// Type assertion for JSON import
const pillarInsights = pillarInsightsData as {
  pillarInsights: {
    [key: string]: {
      excellent: string;
      strong: string;
      developing: string;
      needs_focus: string;
      modifiers: { [key: string]: string };
    };
  };
};

// Types
export interface PillarScores {
  positioning: number;
  messaging: number;
  visibility: number;
  credibility: number;
  conversion: number;
}

export interface UserContext {
  hasWebsite?: boolean;
  hasBrandGuidelines?: boolean;
  contentConsistency?: 'none' | 'light' | 'regular';
  hasSocialProof?: boolean;
  knowsDifferentiator?: boolean;
  hasClearCTA?: boolean;
  visualIdentityConsistency?: 'low' | 'medium' | 'high';
  industryCompetitiveness?: 'low' | 'medium' | 'high';
  hasElevatorPitch?: boolean;
  messagingConsistent?: boolean;
  customersGetIt?: boolean;
  hasEmailList?: boolean;
  emailCampaignsRegular?: boolean;
  hasContentSystem?: boolean;
  hasTestimonials?: boolean;
  hasCaseStudies?: boolean;
  workExamplesVisible?: boolean;
  hasLeadMagnets?: boolean;
  hasNurtureSequences?: boolean;
  nextStepObvious?: boolean;
  [key: string]: any; // Allow additional context fields
}

export interface ReportData {
  brandAlignmentScore: number;
  pillarScores: PillarScores;
  userContext?: UserContext;
}

export interface PillarInsight {
  score: number;
  insight: string;
}

export interface BrandSnapshotReport {
  summary: string;
  overallInterpretation: string;
  pillars: {
    positioning: PillarInsight;
    messaging: PillarInsight;
    visibility: PillarInsight;
    credibility: PillarInsight;
    conversion: PillarInsight;
  };
  opportunitiesSummary: string;
  upgradeCTA: string;
}

// Score range helpers
function getScoreRange(score: number): 'excellent' | 'strong' | 'developing' | 'needs_focus' {
  if (score >= 18) return 'excellent';
  if (score >= 15) return 'strong';
  if (score >= 11) return 'developing';
  return 'needs_focus';
}

function getOverallScoreRange(score: number): 'excellent' | 'strong' | 'developing' | 'needs_focus' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'strong';
  if (score >= 40) return 'developing';
  return 'needs_focus';
}

// Get base insight for a pillar
function getBaseInsight(pillar: keyof PillarScores, score: number): string {
  const range = getScoreRange(score);
  const insights = pillarInsights.pillarInsights[pillar];
  if (!insights) return '';
  
  switch (range) {
    case 'excellent':
      return insights.excellent || '';
    case 'strong':
      return insights.strong || '';
    case 'developing':
      return insights.developing || '';
    case 'needs_focus':
      return insights.needs_focus || '';
  }
}

// Get relevant modifiers for a pillar based on user context
function getModifiers(pillar: keyof PillarScores, userContext?: UserContext): string[] {
  if (!userContext || !pillarInsights.pillarInsights[pillar]?.modifiers) {
    return [];
  }

  const modifiers = pillarInsights.pillarInsights[pillar].modifiers;
  const selectedModifiers: string[] = [];

  // Positioning modifiers
  if (pillar === 'positioning') {
    if (!userContext.hasWebsite && modifiers.no_website) {
      selectedModifiers.push(modifiers.no_website);
    }
    if (!userContext.knowsDifferentiator && modifiers.unclear_differentiation) {
      selectedModifiers.push(modifiers.unclear_differentiation);
    }
    if (userContext.industryCompetitiveness === 'high' && modifiers.industry_competitive) {
      selectedModifiers.push(modifiers.industry_competitive);
    }
    if (userContext.knowsDifferentiator && modifiers.strong_competitor_awareness) {
      selectedModifiers.push(modifiers.strong_competitor_awareness);
    }
  }

  // Messaging modifiers
  if (pillar === 'messaging') {
    if (!userContext.hasElevatorPitch && modifiers.no_elevator_pitch) {
      selectedModifiers.push(modifiers.no_elevator_pitch);
    }
    if (!userContext.messagingConsistent && modifiers.messaging_inconsistent) {
      selectedModifiers.push(modifiers.messaging_inconsistent);
    }
    if (userContext.messagingConsistent && modifiers.messaging_consistent) {
      selectedModifiers.push(modifiers.messaging_consistent);
    }
    if (!userContext.customersGetIt && modifiers.customers_dont_get_it) {
      selectedModifiers.push(modifiers.customers_dont_get_it);
    }
  }

  // Visibility modifiers
  if (pillar === 'visibility') {
    if (!userContext.hasContentSystem && modifiers.no_content_system) {
      selectedModifiers.push(modifiers.no_content_system);
    }
    if (userContext.contentConsistency === 'none' && modifiers.sporadic_publishing) {
      selectedModifiers.push(modifiers.sporadic_publishing);
    }
    if (userContext.hasEmailList && modifiers.email_list_active) {
      selectedModifiers.push(modifiers.email_list_active);
    }
    if (userContext.emailCampaignsRegular && modifiers.email_campaigns_regular) {
      selectedModifiers.push(modifiers.email_campaigns_regular);
    }
    if (!userContext.hasEmailList && modifiers.no_email_list) {
      selectedModifiers.push(modifiers.no_email_list);
    }
  }

  // Credibility modifiers
  if (pillar === 'credibility') {
    if (userContext.hasTestimonials && modifiers.has_testimonials) {
      selectedModifiers.push(modifiers.has_testimonials);
    }
    if (userContext.hasCaseStudies && modifiers.has_case_studies) {
      selectedModifiers.push(modifiers.has_case_studies);
    }
    if (!userContext.workExamplesVisible && modifiers.work_examples_visible) {
      selectedModifiers.push(modifiers.work_examples_visible);
    }
    if (!userContext.hasSocialProof && modifiers.no_social_proof) {
      selectedModifiers.push(modifiers.no_social_proof);
    }
  }

  // Conversion modifiers
  if (pillar === 'conversion') {
    if (userContext.hasClearCTA && modifiers.clear_ctas) {
      selectedModifiers.push(modifiers.clear_ctas);
    }
    if (!userContext.hasClearCTA && modifiers.no_ctas) {
      selectedModifiers.push(modifiers.no_ctas);
    }
    if (userContext.nextStepObvious && modifiers.next_step_obvious) {
      selectedModifiers.push(modifiers.next_step_obvious);
    }
    if (!userContext.nextStepObvious && modifiers.next_step_unclear) {
      selectedModifiers.push(modifiers.next_step_unclear);
    }
    if (userContext.hasLeadMagnets && modifiers.has_lead_magnets) {
      selectedModifiers.push(modifiers.has_lead_magnets);
    }
    if (!userContext.hasLeadMagnets && modifiers.no_lead_capture) {
      selectedModifiers.push(modifiers.no_lead_capture);
    }
  }

  // Limit to 2-3 modifiers max to avoid overwhelm
  return selectedModifiers.slice(0, 3);
}

// Generate pillar insight using dynamic severity-based logic + modifiers
function generatePillarInsight(
  pillar: keyof PillarScores,
  score: number,
  userContext?: UserContext
): string {
  // Use dynamic insights based on severity
  const dynamicInsight = generateAllPillarInsights({ [pillar]: score } as unknown as PillarScores)[pillar];
  
  // Get contextual modifiers
  const modifiers = getModifiers(pillar, userContext);

  if (modifiers.length === 0) {
    return dynamicInsight;
  }

  // Combine dynamic insight with modifiers, ensuring smooth flow
  let combined = dynamicInsight;
  modifiers.forEach((modifier) => {
    combined += ' ' + modifier;
  });

  return combined;
}

// Generate headline summary
function generateSummary(brandAlignmentScore: number, pillarScores: PillarScores): string {
  const range = getOverallScoreRange(brandAlignmentScore);
  const topPillar = Object.entries(pillarScores).reduce((a, b) => 
    pillarScores[a[0] as keyof PillarScores] > pillarScores[b[0] as keyof PillarScores] ? a : b
  )[0];
  const bottomPillar = Object.entries(pillarScores).reduce((a, b) => 
    pillarScores[a[0] as keyof PillarScores] < pillarScores[b[0] as keyof PillarScores] ? a : b
  )[0];

  const topScore = pillarScores[topPillar as keyof PillarScores];
  const bottomScore = pillarScores[bottomPillar as keyof PillarScores];

  if (range === 'excellent') {
    return `Your brand shows excellent alignment across all five pillars, with particularly strong ${topPillar} (${topScore}/20). This foundation positions you well for growth and expansion. Small refinements in ${bottomPillar} could unlock even greater clarity and conversion.`;
  } else if (range === 'strong') {
    return `Your brand has a strong foundation, with ${topPillar} leading the way (${topScore}/20). You're well-positioned to build on this momentum. Focusing on ${bottomPillar} (${bottomScore}/20) could create meaningful improvements in how customers perceive and engage with your brand.`;
  } else if (range === 'developing') {
    return `Your brand is developing, with ${topPillar} showing promise (${topScore}/20). There's clear opportunity to strengthen your foundation, particularly in ${bottomPillar} (${bottomScore}/20). With focused attention, you can build the clarity and consistency that drives trust and conversion.`;
  } else {
    return `Your brand has room to grow, with ${topPillar} as a starting point (${topScore}/20). The biggest opportunity lies in strengthening ${bottomPillar} (${bottomScore}/20). With strategic focus, you can build a brand foundation that clearly communicates your value and converts visitors into customers.`;
  }
}

// Generate overall interpretation
function generateOverallInterpretation(brandAlignmentScore: number): string {
  const range = getOverallScoreRange(brandAlignmentScore);

  if (range === 'excellent') {
    return `Your Brand Alignment Score™ of ${brandAlignmentScore} reflects excellent alignment across positioning, messaging, visibility, credibility, and conversion. Your brand foundation is strong, and customers likely understand your value quickly. The focus now is on maintaining this clarity as you scale and identifying opportunities to deepen your competitive advantage.`;
  } else if (range === 'strong') {
    return `Your Brand Alignment Score™ of ${brandAlignmentScore} shows a strong foundation. You've built clarity in key areas, and your brand is communicating effectively. The opportunity is to strengthen the areas where alignment is developing, which will create more consistency and trust across every customer touchpoint.`;
  } else if (range === 'developing') {
    return `Your Brand Alignment Score™ of ${brandAlignmentScore} indicates your brand is developing. You have pieces in place, and there's clear potential to build a more cohesive brand experience. With focused attention on the pillars that need strengthening, you can create the clarity and consistency that drives customer trust and conversion.`;
  } else {
    return `Your Brand Alignment Score™ of ${brandAlignmentScore} shows there's significant opportunity to strengthen your brand foundation. The good news is that brand alignment can be improved systematically—by focusing on one pillar at a time, you can build clarity, consistency, and trust that transforms how customers perceive and choose your brand.`;
  }
}

// Generate opportunities summary with dynamic analysis
function generateOpportunitiesSummary(
  brandAlignmentScore: number,
  pillarScores: PillarScores
): string {
  const weakest = findWeakestPillar(pillarScores);
  const strongPillars = findStrongPillars(pillarScores);
  const range = getOverallScoreRange(brandAlignmentScore);

  const pillarName = weakest.pillar.charAt(0).toUpperCase() + weakest.pillar.slice(1);

  if (range === 'excellent' || range === 'strong') {
    if (strongPillars.length > 0) {
      const strengthList = strongPillars
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' and ');
      return `Your brand shines in ${strengthList}, which creates a solid foundation for growth. Your biggest opportunity right now is strengthening ${pillarName} (${weakest.score}/20). Even small improvements here can create outsized impact on clarity, trust, and conversion. As AI search becomes more common, consider optimizing for both traditional SEO and Answer Engine Optimization (AEO) to ensure you're discoverable when people ask AI assistants about your industry. The goal isn't perfection, but consistent progress toward a brand that communicates clearly at every touchpoint.`;
    }
    return `Your brand has a strong foundation. Your biggest opportunity right now is strengthening ${pillarName} (${weakest.score}/20). Even small improvements here can create outsized impact on clarity, trust, and conversion. As AI search grows, optimizing for both traditional search engines and AI assistants (AEO) is becoming essential—Snapshot+ includes AI-optimization strategies to help you show up in the age of AI search.`;
  } else {
    if (strongPillars.length > 0) {
      const strengthList = strongPillars
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' and ');
      return `Your brand shows promise in ${strengthList}, which is a great starting point. The biggest opportunity for impact lies in strengthening ${pillarName} (${weakest.score}/20)—this pillar, when improved, creates a ripple effect that enhances clarity, builds trust, and drives conversion. As AI search becomes more common, optimizing for both traditional SEO and Answer Engine Optimization (AEO) will help ensure you're discoverable when people ask AI assistants about your industry. Focus on this area first, and you'll see meaningful progress toward a more aligned brand.`;
    }
    return `Your biggest opportunity for impact lies in strengthening ${pillarName} (${weakest.score}/20). This pillar, when improved, creates a ripple effect that enhances clarity, builds trust, and drives conversion. As AI search grows, optimizing for both traditional search engines and AI assistants (AEO) is becoming essential—Snapshot+ includes AI-optimization strategies to help you show up in the age of AI search. Focus on this area first, and you'll see meaningful progress toward a more aligned brand.`;
  }
}

// Generate upgrade CTA with dynamic opportunity detection
function generateUpgradeCTA(
  brandAlignmentScore: number,
  pillarScores: PillarScores
): string {
  // Use dynamic upsell copy based on weakest pillar
  const dynamicUpsell = generateUpsellCopy(pillarScores);
  
  // Add closing CTA
  return `${dynamicUpsell}

Ready to get started? Upgrade to Snapshot+ and receive your complete Brand Blueprint with personalized recommendations, examples, step-by-step guides, and AI-optimization strategies (including SEO & AEO) tailored to your specific brand.`;
}

// Main report generation function
export function generateReport(data: ReportData): BrandSnapshotReport {
  const { brandAlignmentScore, pillarScores, userContext } = data;

  return {
    summary: generateSummary(brandAlignmentScore, pillarScores),
    overallInterpretation: generateOverallInterpretation(brandAlignmentScore),
    pillars: {
      positioning: {
        score: pillarScores.positioning,
        insight: generatePillarInsight('positioning', pillarScores.positioning, userContext),
      },
      messaging: {
        score: pillarScores.messaging,
        insight: generatePillarInsight('messaging', pillarScores.messaging, userContext),
      },
      visibility: {
        score: pillarScores.visibility,
        insight: generatePillarInsight('visibility', pillarScores.visibility, userContext),
      },
      credibility: {
        score: pillarScores.credibility,
        insight: generatePillarInsight('credibility', pillarScores.credibility, userContext),
      },
      conversion: {
        score: pillarScores.conversion,
        insight: generatePillarInsight('conversion', pillarScores.conversion, userContext),
      },
    },
    opportunitiesSummary: generateOpportunitiesSummary(brandAlignmentScore, pillarScores),
    upgradeCTA: generateUpgradeCTA(brandAlignmentScore, pillarScores),
  };
}

// Example usage
export function generateExampleReport(): BrandSnapshotReport {
  const exampleData: ReportData = {
    brandAlignmentScore: 72,
    pillarScores: {
      positioning: 16,
      messaging: 15,
      visibility: 14,
      credibility: 13,
      conversion: 14,
    },
    userContext: {
      hasWebsite: true,
      knowsDifferentiator: true,
      hasElevatorPitch: true,
      messagingConsistent: true,
      hasContentSystem: false,
      hasEmailList: true,
      emailCampaignsRegular: true,
      hasTestimonials: true,
      hasClearCTA: true,
      nextStepObvious: true,
      hasLeadMagnets: false,
    },
  };

  return generateReport(exampleData);
}

