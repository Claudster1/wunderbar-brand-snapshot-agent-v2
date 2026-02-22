import { describe, it, expect } from 'vitest';
import { calculateBrandSnapshotScores, calculateScores, type PillarScores } from '../src/lib/brandSnapshotEngine';
import { generateReport, type ReportData } from '../src/services/reportGenerator';

function makeRandomAnswers(): Record<string, number> {
  const keys = [
    'marketClarity', 'targetCustomerDefinition', 'uniqueValue', 'marketDifferentiation', 'offerClarity',
    'coreMessageStrength', 'websiteMessagingClarity', 'socialMessagingConsistency', 'storyClarity', 'benefitClarity',
    'webPresence', 'socialPresence', 'seoHealth', 'contentVelocity', 'discoverability',
    'proofPoints', 'reviews', 'socialProof', 'brandProfessionalism', 'websiteTrustSignals',
    'ctaClarity', 'funnelStrength', 'leadCapture', 'offerMessaging', 'salesReadiness',
  ];
  const answers: Record<string, number> = {};
  keys.forEach(k => { answers[k] = Math.floor(Math.random() * 5) + 1; });
  return answers;
}

function makeRandomPillarScores(): PillarScores {
  return {
    positioning: Math.floor(Math.random() * 21) + 5,
    messaging: Math.floor(Math.random() * 21) + 5,
    visibility: Math.floor(Math.random() * 21) + 5,
    credibility: Math.floor(Math.random() * 21) + 5,
    conversion: Math.floor(Math.random() * 21) + 5,
  };
}

describe('stress tests', () => {
  describe('volume: scoring engine', () => {
    it('processes 10,000 scoring calculations without error', () => {
      const start = performance.now();
      for (let i = 0; i < 10_000; i++) {
        const result = calculateBrandSnapshotScores(makeRandomAnswers());
        expect(result).toHaveProperty('brandAlignmentScore');
        expect(result.brandAlignmentScore).toBeGreaterThanOrEqual(5);
        expect(result.brandAlignmentScore).toBeLessThanOrEqual(25);
      }
      const elapsed = performance.now() - start;
      console.log(`10,000 scoring calculations: ${elapsed.toFixed(0)}ms (${(elapsed / 10_000).toFixed(3)}ms/calc)`);
      expect(elapsed).toBeLessThan(10_000); // Should complete in under 10s
    });

    it('processes 10,000 calculateScores calls without error', () => {
      const start = performance.now();
      for (let i = 0; i < 10_000; i++) {
        const result = calculateScores(makeRandomPillarScores());
        expect(result).toHaveProperty('brandAlignmentScore');
        expect(result).toHaveProperty('weakestPillar');
        expect(result).toHaveProperty('pillarInsights');
      }
      const elapsed = performance.now() - start;
      console.log(`10,000 calculateScores calls: ${elapsed.toFixed(0)}ms (${(elapsed / 10_000).toFixed(3)}ms/calc)`);
      expect(elapsed).toBeLessThan(10_000);
    });
  });

  describe('volume: report generation', () => {
    it('generates 5,000 reports without error', () => {
      const start = performance.now();
      for (let i = 0; i < 5_000; i++) {
        const pillarScores = makeRandomPillarScores();
        const brandAlignmentScore = Math.round(
          (pillarScores.positioning + pillarScores.messaging + pillarScores.visibility + pillarScores.credibility + pillarScores.conversion) / 5
        );
        const report = generateReport({ brandAlignmentScore, pillarScores });
        expect(report).toHaveProperty('summary');
        expect(report.summary.length).toBeGreaterThan(0);
        expect(Object.keys(report.pillars).length).toBe(5);
      }
      const elapsed = performance.now() - start;
      console.log(`5,000 report generations: ${elapsed.toFixed(0)}ms (${(elapsed / 5_000).toFixed(3)}ms/report)`);
      expect(elapsed).toBeLessThan(30_000);
    });
  });

  describe('concurrent scoring simulation', () => {
    it('handles 1,000 concurrent Promise.all scoring calls', async () => {
      const start = performance.now();
      const promises = Array.from({ length: 1_000 }, () =>
        Promise.resolve(calculateBrandSnapshotScores(makeRandomAnswers()))
      );
      const results = await Promise.all(promises);
      expect(results.length).toBe(1_000);
      for (const r of results) {
        expect(r.brandAlignmentScore).toBeGreaterThanOrEqual(5);
        expect(r.brandAlignmentScore).toBeLessThanOrEqual(25);
      }
      const elapsed = performance.now() - start;
      console.log(`1,000 concurrent scoring calls: ${elapsed.toFixed(0)}ms`);
    });

    it('handles 1,000 concurrent report generations', async () => {
      const start = performance.now();
      const promises = Array.from({ length: 1_000 }, () => {
        const pillarScores = makeRandomPillarScores();
        const brandAlignmentScore = Math.round(
          (pillarScores.positioning + pillarScores.messaging + pillarScores.visibility + pillarScores.credibility + pillarScores.conversion) / 5
        );
        return Promise.resolve(generateReport({ brandAlignmentScore, pillarScores }));
      });
      const results = await Promise.all(promises);
      expect(results.length).toBe(1_000);
      for (const r of results) {
        expect(r).toHaveProperty('summary');
        expect(r).toHaveProperty('pillars');
      }
      const elapsed = performance.now() - start;
      console.log(`1,000 concurrent report generations: ${elapsed.toFixed(0)}ms`);
    });
  });

  describe('data consistency under volume', () => {
    it('produces deterministic output for same input across 1,000 runs', () => {
      const fixedAnswers = {
        marketClarity: 4, targetCustomerDefinition: 3, uniqueValue: 5, marketDifferentiation: 2, offerClarity: 4,
        coreMessageStrength: 3, websiteMessagingClarity: 4, socialMessagingConsistency: 2, storyClarity: 5, benefitClarity: 3,
        webPresence: 4, socialPresence: 3, seoHealth: 2, contentVelocity: 1, discoverability: 4,
        proofPoints: 3, reviews: 5, socialProof: 2, brandProfessionalism: 4, websiteTrustSignals: 3,
        ctaClarity: 4, funnelStrength: 3, leadCapture: 2, offerMessaging: 5, salesReadiness: 4,
      };
      const baseline = calculateBrandSnapshotScores(fixedAnswers);

      for (let i = 0; i < 1_000; i++) {
        const result = calculateBrandSnapshotScores(fixedAnswers);
        expect(result.brandAlignmentScore).toBe(baseline.brandAlignmentScore);
        expect(result.pillarScores).toEqual(baseline.pillarScores);
        expect(result.insights).toEqual(baseline.insights);
        expect(result.recommendations).toEqual(baseline.recommendations);
      }
    });

    it('report generation is deterministic for same input across 1,000 runs', () => {
      const data: ReportData = {
        brandAlignmentScore: 14,
        pillarScores: { positioning: 16, messaging: 12, visibility: 18, credibility: 8, conversion: 14 },
      };
      const baseline = generateReport(data);

      for (let i = 0; i < 1_000; i++) {
        const result = generateReport(data);
        expect(result.summary).toBe(baseline.summary);
        expect(result.overallInterpretation).toBe(baseline.overallInterpretation);
        expect(result.pillars).toEqual(baseline.pillars);
        expect(result.opportunitiesSummary).toBe(baseline.opportunitiesSummary);
        expect(result.upgradeCTA).toBe(baseline.upgradeCTA);
      }
    });
  });

  describe('score distribution validation', () => {
    it('all random inputs produce valid score ranges', () => {
      for (let i = 0; i < 5_000; i++) {
        const result = calculateBrandSnapshotScores(makeRandomAnswers());
        for (const pillar of ['positioning', 'messaging', 'visibility', 'credibility', 'conversion'] as const) {
          expect(result.pillarScores[pillar]).toBeGreaterThanOrEqual(5);
          expect(result.pillarScores[pillar]).toBeLessThanOrEqual(25);
        }
        expect(result.brandAlignmentScore).toBeGreaterThanOrEqual(5);
        expect(result.brandAlignmentScore).toBeLessThanOrEqual(25);
      }
    });

    it('all random inputs produce non-empty insights for low scores', () => {
      let lowScoreCount = 0;
      for (let i = 0; i < 1_000; i++) {
        const answers: Record<string, number> = {};
        const keys = [
          'marketClarity', 'targetCustomerDefinition', 'uniqueValue', 'marketDifferentiation', 'offerClarity',
          'coreMessageStrength', 'websiteMessagingClarity', 'socialMessagingConsistency', 'storyClarity', 'benefitClarity',
          'webPresence', 'socialPresence', 'seoHealth', 'contentVelocity', 'discoverability',
          'proofPoints', 'reviews', 'socialProof', 'brandProfessionalism', 'websiteTrustSignals',
          'ctaClarity', 'funnelStrength', 'leadCapture', 'offerMessaging', 'salesReadiness',
        ];
        keys.forEach(k => { answers[k] = Math.floor(Math.random() * 2) + 1; }); // Scores 1-2 = low
        const result = calculateBrandSnapshotScores(answers);
        if (result.pillarScores.positioning < 14) {
          lowScoreCount++;
          expect(result.insights.length).toBeGreaterThan(0);
        }
      }
      expect(lowScoreCount).toBeGreaterThan(0);
    });
  });

  describe('payload size handling', () => {
    it('handles input with many extra fields (100 extra)', () => {
      const answers = makeRandomAnswers();
      for (let i = 0; i < 100; i++) {
        answers[`extraField_${i}`] = Math.random() * 100;
      }
      const result = calculateBrandSnapshotScores(answers);
      expect(result).toHaveProperty('brandAlignmentScore');
      expect(result.brandAlignmentScore).toBeGreaterThanOrEqual(5);
    });

    it('handles input with very long string values in extra fields', () => {
      const answers: Record<string, any> = makeRandomAnswers();
      answers.longString = 'x'.repeat(100_000);
      answers.anotherLong = JSON.stringify(Array.from({ length: 1000 }, (_, i) => ({ key: i, value: 'test' })));
      const result = calculateBrandSnapshotScores(answers);
      expect(result).toHaveProperty('brandAlignmentScore');
    });
  });
});
