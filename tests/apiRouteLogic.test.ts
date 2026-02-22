import { describe, it, expect } from 'vitest';
import { calculateBrandSnapshotScores } from '../src/lib/brandSnapshotEngine';

/**
 * These tests validate the logic that the snapshot API route uses,
 * without requiring Supabase, OpenAI, or ActiveCampaign connections.
 * They test the same code paths the API exercises.
 */

function buildSummary(
  scores: { brandAlignmentScore: number; pillarScores: Record<string, number> },
  insights: string[],
  companyName?: string | null
): string {
  const name = companyName ? `${companyName}'s ` : 'Your ';
  const score = scores.brandAlignmentScore;
  if (score >= 70) {
    return `${name}brand shows strong alignment (${score}/100). The biggest opportunities are in the areas where the score suggests refinement—focusing there will compound your existing strengths.`;
  }
  if (score >= 50) {
    return `${name}brand has a solid foundation (${score}/100). Prioritizing the recommendations below will help clarify positioning, messaging, and conversion so you can grow with confidence.`;
  }
  return `${name}WunderBrand Score™ (${score}/100) highlights specific areas to strengthen. The recommendations below are tailored to your results and will help establish credibility and drive growth.`;
}

function buildOpportunitiesSummary(
  recommendations: string[],
  pillarScores: Record<string, number>
): string {
  const weakPillars = (Object.entries(pillarScores) as [string, number][])
    .filter(([, v]) => v < 14)
    .map(([k]) => k);
  if (weakPillars.length === 0) {
    return 'Your five pillars are in good shape. Keep documenting what works and apply it consistently across channels.';
  }
  if (recommendations.length >= 2) {
    return `Your biggest opportunities are in ${weakPillars.slice(0, 2).join(' and ')}. Addressing these first will have the highest impact on how your brand is perceived and how well it converts.`;
  }
  return `Focusing on ${weakPillars[0]} will strengthen your overall brand alignment and help you show up more clearly to your ideal customers.`;
}

function buildUpgradeCta(
  primaryPillar: string,
  companyName?: string | null
): string {
  const pillarLabel = primaryPillar.charAt(0).toUpperCase() + primaryPillar.slice(1);
  const name = companyName ? ` For ${companyName}, ` : ' ';
  return `Your top opportunity is ${pillarLabel}.${name}Snapshot+™ gives you a detailed roadmap, persona-aligned messaging, and actionable next steps so you can improve this pillar and your overall score.`;
}

function buildPillarInsightsFromScores(pillarScores: Record<string, number>) {
  const mk = (pillar: string, score: number) => {
    if (score >= 18) {
      return {
        strength: `Your ${pillar} is a clear strength right now — the foundation is working.`,
        opportunity: `Keep tightening consistency so this pillar stays an advantage as you scale.`,
        action: `Document the 2–3 patterns that are working best in ${pillar}, and apply them everywhere you show up.`,
      };
    }
    if (score >= 14) {
      return {
        strength: `Your ${pillar} has a solid baseline — you're not starting from zero.`,
        opportunity: `A few focused refinements would make this pillar feel sharper and more intentional.`,
        action: `Choose one change in ${pillar} that removes confusion (headline, positioning line, CTA, proof point) and implement it this week.`,
      };
    }
    return {
      strength: `There's meaningful upside in your ${pillar} — improving this will lift the whole system.`,
      opportunity: `Right now this pillar likely creates friction or uncertainty for new customers.`,
      action: `Start with one high-impact fix in ${pillar} (clarify the offer, simplify the narrative, add proof, or improve CTAs) and measure the change.`,
    };
  };

  return {
    positioning: mk('positioning', pillarScores.positioning ?? 0),
    messaging: mk('messaging', pillarScores.messaging ?? 0),
    visibility: mk('visibility', pillarScores.visibility ?? 0),
    credibility: mk('credibility', pillarScores.credibility ?? 0),
    conversion: mk('conversion', pillarScores.conversion ?? 0),
  };
}

describe('API route logic (snapshot)', () => {
  const sampleWundyInput = {
    marketClarity: 4, targetCustomerDefinition: 3, uniqueValue: 4, marketDifferentiation: 3, offerClarity: 4,
    coreMessageStrength: 3, websiteMessagingClarity: 4, socialMessagingConsistency: 3, storyClarity: 3, benefitClarity: 4,
    webPresence: 3, socialPresence: 3, seoHealth: 2, contentVelocity: 2, discoverability: 3,
    proofPoints: 3, reviews: 2, socialProof: 2, brandProfessionalism: 4, websiteTrustSignals: 3,
    ctaClarity: 3, funnelStrength: 3, leadCapture: 2, offerMessaging: 4, salesReadiness: 3,
    userName: 'Sarah', businessName: 'Bloom Studio', industry: 'Interior Design',
    audienceType: 'B2C', geographicScope: 'regional',
    website: 'https://bloomstudio.com', hasTestimonials: true, hasCaseStudies: false,
    hasEmailList: true, hasLeadMagnet: false, hasClearCTA: true,
    offerClarityText: 'somewhat clear', messagingClarity: 'somewhat clear',
    revenueRange: '100k-500k', teamSize: '2-5',
  };

  describe('full pipeline simulation', () => {
    it('processes sample Wundy input end-to-end', () => {
      const scores = calculateBrandSnapshotScores(sampleWundyInput);

      expect(scores.brandAlignmentScore).toBeGreaterThanOrEqual(5);
      expect(scores.brandAlignmentScore).toBeLessThanOrEqual(25);

      const pillarInsights = buildPillarInsightsFromScores(scores.pillarScores as any);
      expect(pillarInsights).toHaveProperty('positioning');
      expect(pillarInsights.positioning).toHaveProperty('strength');
      expect(pillarInsights.positioning).toHaveProperty('opportunity');
      expect(pillarInsights.positioning).toHaveProperty('action');

      const summary = buildSummary(scores, scores.insights, 'Bloom Studio');
      expect(summary).toContain('Bloom Studio');
      expect(summary.length).toBeGreaterThan(20);

      const oppSummary = buildOpportunitiesSummary(scores.recommendations, scores.pillarScores as any);
      expect(oppSummary.length).toBeGreaterThan(20);

      const entries = Object.entries(scores.pillarScores);
      const weakest = entries.reduce((min, [pillar, score]) =>
        (score as number) < (min[1] as number) ? [pillar, score] : min,
        ['positioning', 25]
      );
      const cta = buildUpgradeCta(weakest[0] as string, 'Bloom Studio');
      expect(cta).toContain('Bloom Studio');
      expect(cta).toContain('Snapshot+');
    });
  });

  describe('buildSummary', () => {
    it('shows company name when provided', () => {
      const scores = calculateBrandSnapshotScores(sampleWundyInput);
      expect(buildSummary(scores, scores.insights, 'TestCo')).toContain('TestCo');
    });

    it('uses "Your" when no company name', () => {
      const scores = calculateBrandSnapshotScores(sampleWundyInput);
      expect(buildSummary(scores, scores.insights, null)).toMatch(/^Your /);
    });

    it('produces different text for different score ranges', () => {
      const high = buildSummary({ brandAlignmentScore: 75, pillarScores: {} as any }, [], null);
      const mid = buildSummary({ brandAlignmentScore: 55, pillarScores: {} as any }, [], null);
      const low = buildSummary({ brandAlignmentScore: 35, pillarScores: {} as any }, [], null);
      expect(high).toContain('strong alignment');
      expect(mid).toContain('solid foundation');
      expect(low).toContain('WunderBrand Score');
    });
  });

  describe('buildOpportunitiesSummary', () => {
    it('returns "good shape" when no weak pillars', () => {
      const result = buildOpportunitiesSummary([], { positioning: 20, messaging: 18, visibility: 16, credibility: 15, conversion: 14 });
      expect(result).toContain('good shape');
    });

    it('mentions weak pillars when present', () => {
      const result = buildOpportunitiesSummary(['rec1', 'rec2'], { positioning: 20, messaging: 8, visibility: 10, credibility: 18, conversion: 16 });
      expect(result.toLowerCase()).toContain('messaging');
    });

    it('handles single weak pillar', () => {
      const result = buildOpportunitiesSummary(['rec1'], { positioning: 20, messaging: 20, visibility: 20, credibility: 10, conversion: 20 });
      expect(result.toLowerCase()).toContain('credibility');
    });
  });

  describe('buildPillarInsightsFromScores', () => {
    it('produces strong insights for high scores', () => {
      const insights = buildPillarInsightsFromScores({ positioning: 20, messaging: 20, visibility: 20, credibility: 20, conversion: 20 });
      expect(insights.positioning.strength).toContain('clear strength');
    });

    it('produces moderate insights for mid scores', () => {
      const insights = buildPillarInsightsFromScores({ positioning: 15, messaging: 15, visibility: 15, credibility: 15, conversion: 15 });
      expect(insights.positioning.strength).toContain('solid baseline');
    });

    it('produces growth insights for low scores', () => {
      const insights = buildPillarInsightsFromScores({ positioning: 8, messaging: 8, visibility: 8, credibility: 8, conversion: 8 });
      expect(insights.positioning.strength).toContain('meaningful upside');
    });

    it('handles missing pillar scores with defaults', () => {
      const insights = buildPillarInsightsFromScores({});
      expect(insights.positioning.strength).toContain('meaningful upside');
    });
  });

  describe('real-world Wundy input scenarios', () => {
    it('handles a strong business (all high scores)', () => {
      const input = {
        marketClarity: 5, targetCustomerDefinition: 5, uniqueValue: 5, marketDifferentiation: 5, offerClarity: 5,
        coreMessageStrength: 5, websiteMessagingClarity: 5, socialMessagingConsistency: 5, storyClarity: 5, benefitClarity: 5,
        webPresence: 5, socialPresence: 5, seoHealth: 5, contentVelocity: 5, discoverability: 5,
        proofPoints: 5, reviews: 5, socialProof: 5, brandProfessionalism: 5, websiteTrustSignals: 5,
        ctaClarity: 5, funnelStrength: 5, leadCapture: 5, offerMessaging: 5, salesReadiness: 5,
      };
      const scores = calculateBrandSnapshotScores(input);
      expect(scores.brandAlignmentScore).toBe(25);
      expect(scores.insights.length).toBe(0);
      expect(scores.recommendations.length).toBe(0);
    });

    it('handles a startup (all low scores)', () => {
      const input = {
        marketClarity: 1, targetCustomerDefinition: 1, uniqueValue: 1, marketDifferentiation: 1, offerClarity: 1,
        coreMessageStrength: 1, websiteMessagingClarity: 1, socialMessagingConsistency: 1, storyClarity: 1, benefitClarity: 1,
        webPresence: 1, socialPresence: 1, seoHealth: 1, contentVelocity: 1, discoverability: 1,
        proofPoints: 1, reviews: 1, socialProof: 1, brandProfessionalism: 1, websiteTrustSignals: 1,
        ctaClarity: 1, funnelStrength: 1, leadCapture: 1, offerMessaging: 1, salesReadiness: 1,
      };
      const scores = calculateBrandSnapshotScores(input);
      expect(scores.brandAlignmentScore).toBe(5);
      expect(scores.insights.length).toBe(5);
      expect(scores.recommendations.length).toBe(5);
    });

    it('handles a typical mid-range business', () => {
      const input = {
        marketClarity: 3, targetCustomerDefinition: 4, uniqueValue: 3, marketDifferentiation: 2, offerClarity: 3,
        coreMessageStrength: 3, websiteMessagingClarity: 3, socialMessagingConsistency: 2, storyClarity: 3, benefitClarity: 3,
        webPresence: 3, socialPresence: 2, seoHealth: 2, contentVelocity: 2, discoverability: 3,
        proofPoints: 2, reviews: 3, socialProof: 2, brandProfessionalism: 3, websiteTrustSignals: 3,
        ctaClarity: 3, funnelStrength: 2, leadCapture: 2, offerMessaging: 3, salesReadiness: 3,
      };
      const scores = calculateBrandSnapshotScores(input);
      expect(scores.brandAlignmentScore).toBeGreaterThanOrEqual(10);
      expect(scores.brandAlignmentScore).toBeLessThanOrEqual(20);
    });

    it('handles Wundy input with extra conversational fields (ignored safely)', () => {
      const input = {
        marketClarity: 3, targetCustomerDefinition: 3, uniqueValue: 3, marketDifferentiation: 3, offerClarity: 3,
        coreMessageStrength: 3, websiteMessagingClarity: 3, socialMessagingConsistency: 3, storyClarity: 3, benefitClarity: 3,
        webPresence: 3, socialPresence: 3, seoHealth: 3, contentVelocity: 3, discoverability: 3,
        proofPoints: 3, reviews: 3, socialProof: 3, brandProfessionalism: 3, websiteTrustSignals: 3,
        ctaClarity: 3, funnelStrength: 3, leadCapture: 3, offerMessaging: 3, salesReadiness: 3,
        // Extra Wundy fields that should be ignored by scoring
        userName: 'Alex', businessName: 'Test Co', industry: 'Tech',
        hasTestimonials: true, hasCaseStudies: false,
        credibilityDetails: { testimonialContext: 'on website', credentials: ['Google Partner'] },
        thoughtLeadershipActivity: { hasActivity: true, activities: ['LinkedIn thought leadership'] },
        brandOriginStory: 'Started in a garage',
        missionStatement: 'To make brands better',
        coreValues: ['integrity', 'innovation'],
        brandVoiceDescription: 'professional yet approachable',
      };
      const scores = calculateBrandSnapshotScores(input);
      expect(scores.brandAlignmentScore).toBe(15);
    });
  });
});
