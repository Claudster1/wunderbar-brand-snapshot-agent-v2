import { describe, it, expect } from 'vitest';
import {
  getGapSeverity,
  findWeakestPillar,
  findStrongPillars,
  generatePillarInsight,
  generateAllPillarInsights,
  generateUpsellCopy,
  type PillarScores,
} from '../src/services/dynamicInsights';

describe('dynamicInsights', () => {
  describe('getGapSeverity', () => {
    it('returns "major" for scores <= 8', () => {
      expect(getGapSeverity(0)).toBe('major');
      expect(getGapSeverity(5)).toBe('major');
      expect(getGapSeverity(8)).toBe('major');
    });

    it('returns "moderate" for scores 9-12', () => {
      expect(getGapSeverity(9)).toBe('moderate');
      expect(getGapSeverity(10)).toBe('moderate');
      expect(getGapSeverity(12)).toBe('moderate');
    });

    it('returns "light" for scores > 12', () => {
      expect(getGapSeverity(13)).toBe('light');
      expect(getGapSeverity(20)).toBe('light');
      expect(getGapSeverity(25)).toBe('light');
    });
  });

  describe('findWeakestPillar', () => {
    it('finds the pillar with lowest score', () => {
      const scores: PillarScores = { positioning: 15, messaging: 18, visibility: 7, credibility: 20, conversion: 12 };
      const result = findWeakestPillar(scores);
      expect(result.pillar).toBe('visibility');
      expect(result.score).toBe(7);
      expect(result.severity).toBe('major');
    });

    it('classifies severity correctly for the weakest', () => {
      expect(findWeakestPillar({ positioning: 5, messaging: 20, visibility: 20, credibility: 20, conversion: 20 }).severity).toBe('major');
      expect(findWeakestPillar({ positioning: 10, messaging: 20, visibility: 20, credibility: 20, conversion: 20 }).severity).toBe('moderate');
      expect(findWeakestPillar({ positioning: 15, messaging: 20, visibility: 20, credibility: 20, conversion: 20 }).severity).toBe('light');
    });
  });

  describe('findStrongPillars', () => {
    it('returns pillars scoring >= 16', () => {
      const scores: PillarScores = { positioning: 16, messaging: 15, visibility: 20, credibility: 10, conversion: 18 };
      const strong = findStrongPillars(scores);
      expect(strong).toContain('positioning');
      expect(strong).toContain('visibility');
      expect(strong).toContain('conversion');
      expect(strong).not.toContain('messaging');
      expect(strong).not.toContain('credibility');
    });

    it('returns empty array when no pillars are strong', () => {
      const scores: PillarScores = { positioning: 5, messaging: 8, visibility: 10, credibility: 12, conversion: 15 };
      expect(findStrongPillars(scores)).toEqual([]);
    });

    it('returns all pillars when all are strong', () => {
      const scores: PillarScores = { positioning: 20, messaging: 18, visibility: 25, credibility: 16, conversion: 22 };
      expect(findStrongPillars(scores).length).toBe(5);
    });
  });

  describe('generatePillarInsight', () => {
    const pillars: (keyof PillarScores)[] = ['positioning', 'messaging', 'visibility', 'credibility', 'conversion'];

    it('returns non-empty string for each pillar at each severity', () => {
      for (const pillar of pillars) {
        expect(generatePillarInsight(pillar, 5).length).toBeGreaterThan(0);
        expect(generatePillarInsight(pillar, 10).length).toBeGreaterThan(0);
        expect(generatePillarInsight(pillar, 15).length).toBeGreaterThan(0);
      }
    });

    it('returns different insights for different severities', () => {
      for (const pillar of pillars) {
        const major = generatePillarInsight(pillar, 5);
        const moderate = generatePillarInsight(pillar, 10);
        const light = generatePillarInsight(pillar, 15);
        expect(major).not.toBe(light);
        expect(major).not.toBe(moderate);
      }
    });

    it('returns fallback for unknown pillar', () => {
      const result = generatePillarInsight('unknown' as keyof PillarScores, 10);
      expect(result).toContain('opportunity');
    });
  });

  describe('generateAllPillarInsights', () => {
    it('returns insights for all 5 pillars', () => {
      const scores: PillarScores = { positioning: 10, messaging: 15, visibility: 8, credibility: 20, conversion: 5 };
      const insights = generateAllPillarInsights(scores);
      expect(insights).toHaveProperty('positioning');
      expect(insights).toHaveProperty('messaging');
      expect(insights).toHaveProperty('visibility');
      expect(insights).toHaveProperty('credibility');
      expect(insights).toHaveProperty('conversion');
      for (const value of Object.values(insights)) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
    });
  });

  describe('generateUpsellCopy', () => {
    it('mentions the weakest pillar by name', () => {
      const scores: PillarScores = { positioning: 20, messaging: 20, visibility: 20, credibility: 5, conversion: 20 };
      const copy = generateUpsellCopy(scores);
      expect(copy.toLowerCase()).toContain('credibility');
    });

    it('includes the score', () => {
      const scores: PillarScores = { positioning: 20, messaging: 20, visibility: 7, credibility: 20, conversion: 20 };
      const copy = generateUpsellCopy(scores);
      expect(copy).toContain('7/20');
    });

    it('always mentions Snapshot+', () => {
      const scores: PillarScores = { positioning: 10, messaging: 10, visibility: 10, credibility: 10, conversion: 10 };
      expect(generateUpsellCopy(scores)).toContain('Snapshot+');
    });
  });
});
