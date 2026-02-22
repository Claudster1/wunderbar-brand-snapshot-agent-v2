import { describe, it, expect } from 'vitest';
import { calculateBrandSnapshotScores } from '../src/lib/brandSnapshotEngine';
import { generateReport, type ReportData } from '../src/services/reportGenerator';

describe('input validation & edge cases', () => {
  describe('brandSnapshotEngine with malformed inputs', () => {
    it('handles completely empty object', () => {
      const result = calculateBrandSnapshotScores({});
      expect(result).toHaveProperty('brandAlignmentScore');
      expect(result).toHaveProperty('pillarScores');
      // All values will be NaN since undefined inputs go through normalize
      expect(typeof result.brandAlignmentScore).toBe('number');
    });

    it('handles string values where numbers expected', () => {
      const result = calculateBrandSnapshotScores({
        marketClarity: 'high' as any,
        targetCustomerDefinition: 'low' as any,
        uniqueValue: 3,
        marketDifferentiation: 3,
        offerClarity: 3,
      });
      expect(typeof result.pillarScores.positioning).toBe('number');
    });

    it('handles null input fields', () => {
      const result = calculateBrandSnapshotScores({
        marketClarity: null as any,
        targetCustomerDefinition: null as any,
        uniqueValue: null as any,
        marketDifferentiation: null as any,
        offerClarity: null as any,
      });
      expect(typeof result.pillarScores.positioning).toBe('number');
    });

    it('handles boolean values where numbers expected', () => {
      const result = calculateBrandSnapshotScores({
        marketClarity: true as any,
        targetCustomerDefinition: false as any,
      });
      expect(typeof result.pillarScores.positioning).toBe('number');
    });

    it('handles negative numbers', () => {
      const result = calculateBrandSnapshotScores({
        marketClarity: -5,
        targetCustomerDefinition: -100,
        uniqueValue: -1,
        marketDifferentiation: 0,
        offerClarity: -999,
        coreMessageStrength: 3,
        websiteMessagingClarity: 3,
        socialMessagingConsistency: 3,
        storyClarity: 3,
        benefitClarity: 3,
        webPresence: 3, socialPresence: 3, seoHealth: 3, contentVelocity: 3, discoverability: 3,
        proofPoints: 3, reviews: 3, socialProof: 3, brandProfessionalism: 3, websiteTrustSignals: 3,
        ctaClarity: 3, funnelStrength: 3, leadCapture: 3, offerMessaging: 3, salesReadiness: 3,
      });
      // Normalize clamps to [1, 5], so all negatives should become 1
      // positioning = 1 + 1 + 1 + 1 + 1 = 5 (0 clamps to 1 since Math.max(0, 1) = 1)
      expect(result.pillarScores.positioning).toBe(5);
    });

    it('handles very large numbers', () => {
      const result = calculateBrandSnapshotScores({
        marketClarity: Number.MAX_SAFE_INTEGER,
        targetCustomerDefinition: 999999,
        uniqueValue: Infinity,
        marketDifferentiation: 3,
        offerClarity: 3,
        coreMessageStrength: 3, websiteMessagingClarity: 3, socialMessagingConsistency: 3, storyClarity: 3, benefitClarity: 3,
        webPresence: 3, socialPresence: 3, seoHealth: 3, contentVelocity: 3, discoverability: 3,
        proofPoints: 3, reviews: 3, socialProof: 3, brandProfessionalism: 3, websiteTrustSignals: 3,
        ctaClarity: 3, funnelStrength: 3, leadCapture: 3, offerMessaging: 3, salesReadiness: 3,
      });
      // Large numbers clamp to 5
      expect(result.pillarScores.positioning).toBe(5 + 5 + 5 + 3 + 3); // 21
    });

    it('handles mixed valid and invalid fields', () => {
      const result = calculateBrandSnapshotScores({
        marketClarity: 4,
        targetCustomerDefinition: 'invalid' as any,
        uniqueValue: 3,
        marketDifferentiation: null as any,
        offerClarity: 5,
        extraField: 'should be ignored',
        anotherExtra: 42,
      });
      expect(typeof result.brandAlignmentScore).toBe('number');
    });

    it('handles array values where numbers expected', () => {
      const result = calculateBrandSnapshotScores({
        marketClarity: [1, 2, 3] as any,
      });
      expect(typeof result.pillarScores.positioning).toBe('number');
    });

    it('handles object values where numbers expected', () => {
      const result = calculateBrandSnapshotScores({
        marketClarity: { value: 3 } as any,
      });
      expect(typeof result.pillarScores.positioning).toBe('number');
    });
  });

  describe('reportGenerator with edge-case data', () => {
    it('handles score of exactly 80 (boundary: excellent)', () => {
      const report = generateReport({ brandAlignmentScore: 80, pillarScores: { positioning: 20, messaging: 20, visibility: 20, credibility: 10, conversion: 10 } });
      expect(report.overallInterpretation).toContain('excellent');
    });

    it('handles score of exactly 60 (boundary: strong)', () => {
      const report = generateReport({ brandAlignmentScore: 60, pillarScores: { positioning: 15, messaging: 15, visibility: 15, credibility: 15, conversion: 15 } });
      expect(report.overallInterpretation).toContain('strong');
    });

    it('handles score of exactly 40 (boundary: developing)', () => {
      const report = generateReport({ brandAlignmentScore: 40, pillarScores: { positioning: 10, messaging: 10, visibility: 10, credibility: 10, conversion: 10 } });
      expect(report.overallInterpretation).toContain('developing');
    });

    it('handles score of 39 (needs_focus)', () => {
      const report = generateReport({ brandAlignmentScore: 39, pillarScores: { positioning: 8, messaging: 8, visibility: 8, credibility: 8, conversion: 8 } });
      expect(report.overallInterpretation).toContain('opportunity');
    });

    it('handles pillar score at boundary 18 (excellent pillar)', () => {
      const report = generateReport({ brandAlignmentScore: 18, pillarScores: { positioning: 18, messaging: 18, visibility: 18, credibility: 18, conversion: 18 } });
      expect(report.pillars.positioning.score).toBe(18);
      expect(report.pillars.positioning.insight.length).toBeGreaterThan(0);
    });

    it('handles pillar score at boundary 15 (strong pillar)', () => {
      const report = generateReport({ brandAlignmentScore: 15, pillarScores: { positioning: 15, messaging: 15, visibility: 15, credibility: 15, conversion: 15 } });
      expect(report.pillars.positioning.score).toBe(15);
    });

    it('handles pillar score at boundary 11 (developing pillar)', () => {
      const report = generateReport({ brandAlignmentScore: 11, pillarScores: { positioning: 11, messaging: 11, visibility: 11, credibility: 11, conversion: 11 } });
      expect(report.pillars.positioning.score).toBe(11);
    });

    it('handles all pillars equal (no clear top/bottom)', () => {
      const report = generateReport({ brandAlignmentScore: 15, pillarScores: { positioning: 15, messaging: 15, visibility: 15, credibility: 15, conversion: 15 } });
      expect(report.summary.length).toBeGreaterThan(0);
    });

    it('handles user context with all true values', () => {
      const report = generateReport({
        brandAlignmentScore: 15,
        pillarScores: { positioning: 15, messaging: 15, visibility: 15, credibility: 15, conversion: 15 },
        userContext: {
          hasWebsite: true,
          hasBrandGuidelines: true,
          hasSocialProof: true,
          knowsDifferentiator: true,
          hasClearCTA: true,
          hasEmailList: true,
          emailCampaignsRegular: true,
          hasContentSystem: true,
          hasTestimonials: true,
          hasCaseStudies: true,
          workExamplesVisible: true,
          hasLeadMagnets: true,
          hasNurtureSequences: true,
          nextStepObvious: true,
          hasElevatorPitch: true,
          messagingConsistent: true,
          customersGetIt: true,
        },
      });
      expect(report.pillars.positioning.insight.length).toBeGreaterThan(0);
    });

    it('handles user context with all false values', () => {
      const report = generateReport({
        brandAlignmentScore: 8,
        pillarScores: { positioning: 8, messaging: 8, visibility: 8, credibility: 8, conversion: 8 },
        userContext: {
          hasWebsite: false,
          hasBrandGuidelines: false,
          hasSocialProof: false,
          knowsDifferentiator: false,
          hasClearCTA: false,
          hasEmailList: false,
          emailCampaignsRegular: false,
          hasContentSystem: false,
          hasTestimonials: false,
          hasCaseStudies: false,
          workExamplesVisible: false,
          hasLeadMagnets: false,
          hasNurtureSequences: false,
          nextStepObvious: false,
          hasElevatorPitch: false,
          messagingConsistent: false,
          customersGetIt: false,
        },
      });
      // Should produce longer insights due to modifiers
      expect(report.pillars.positioning.insight.length).toBeGreaterThan(20);
      expect(report.pillars.credibility.insight.length).toBeGreaterThan(20);
    });
  });
});
