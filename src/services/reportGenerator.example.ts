// Example usage and integration guide for reportGenerator.ts

import { generateReport, generateExampleReport, type ReportData } from './reportGenerator';

/**
 * EXAMPLE 1: Basic Usage
 * 
 * Generate a report with scores and optional user context
 */
const example1: ReportData = {
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

const report1 = generateReport(example1);
console.log(JSON.stringify(report1, null, 2));

/**
 * EXAMPLE 2: Minimal Context
 * 
 * Works with just scores - modifiers won't be applied
 */
const example2: ReportData = {
  brandAlignmentScore: 45,
  pillarScores: {
    positioning: 8,
    messaging: 9,
    visibility: 10,
    credibility: 9,
    conversion: 9,
  },
};

const report2 = generateReport(example2);
console.log(JSON.stringify(report2, null, 2));

/**
 * EXAMPLE 3: High Score
 * 
 * Excellent alignment across all pillars
 */
const example3: ReportData = {
  brandAlignmentScore: 88,
  pillarScores: {
    positioning: 19,
    messaging: 18,
    visibility: 17,
    credibility: 18,
    conversion: 16,
  },
  userContext: {
    hasWebsite: true,
    hasBrandGuidelines: true,
    contentConsistency: 'regular',
    hasSocialProof: true,
    knowsDifferentiator: true,
    hasClearCTA: true,
    visualIdentityConsistency: 'high',
    hasElevatorPitch: true,
    messagingConsistent: true,
    customersGetIt: true,
    hasEmailList: true,
    emailCampaignsRegular: true,
    hasContentSystem: true,
    hasTestimonials: true,
    hasCaseStudies: true,
    workExamplesVisible: true,
    hasLeadMagnets: true,
    hasNurtureSequences: true,
    nextStepObvious: true,
  },
};

const report3 = generateReport(example3);
console.log(JSON.stringify(report3, null, 2));

/**
 * EXAMPLE 4: Next.js API Route Integration
 * 
 * Use in your API route to generate reports
 */
export async function GET(request: Request) {
  // Extract scores from query params or request body
  const { brandAlignmentScore, pillarScores, userContext } = await request.json();

  const reportData: ReportData = {
    brandAlignmentScore: parseInt(brandAlignmentScore),
    pillarScores: {
      positioning: parseInt(pillarScores.positioning),
      messaging: parseInt(pillarScores.messaging),
      visibility: parseInt(pillarScores.visibility),
      credibility: parseInt(pillarScores.credibility),
      conversion: parseInt(pillarScores.conversion),
    },
    userContext: userContext || {},
  };

  const report = generateReport(reportData);

  return new Response(JSON.stringify(report), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * EXAMPLE OUTPUT STRUCTURE
 * 
 * {
 *   "summary": "Your brand has a strong foundation...",
 *   "overallInterpretation": "Your Brand Alignment Score™ of 72 shows...",
 *   "pillars": {
 *     "positioning": {
 *       "score": 16,
 *       "insight": "You have a solid foundation for positioning..."
 *     },
 *     "messaging": {
 *       "score": 15,
 *       "insight": "Your messaging is clear and mostly consistent..."
 *     },
 *     "visibility": {
 *       "score": 14,
 *       "insight": "You're building visibility, which is great..."
 *     },
 *     "credibility": {
 *       "score": 13,
 *       "insight": "You're building credibility, which is essential..."
 *     },
 *     "conversion": {
 *       "score": 14,
 *       "insight": "You have a solid conversion setup..."
 *     }
 *   },
 *   "opportunitiesSummary": "Your brand shines in positioning and messaging...",
 *   "upgradeCTA": "Ready to take your brand to the next level?..."
 * }
 */

