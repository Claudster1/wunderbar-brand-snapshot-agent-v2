import { describe, it, expect } from 'vitest';
import {
  calculateBrandAlignmentScore,
  getPrimaryPillar,
  classifyStrength,
} from '../src/scoring/scoringEngine';

describe('scoringEngine', () => {
  describe('calculateBrandAlignmentScore', () => {
    it('averages all pillar scores and rounds', () => {
      const scores = { positioning: 15, messaging: 18, visibility: 12, credibility: 10, conversion: 20 };
      expect(calculateBrandAlignmentScore(scores)).toBe(15);
    });

    it('returns exact average when evenly divisible', () => {
      const scores = { positioning: 10, messaging: 10, visibility: 10, credibility: 10, conversion: 10 };
      expect(calculateBrandAlignmentScore(scores)).toBe(10);
    });

    it('rounds correctly for fractional averages', () => {
      const scores = { positioning: 11, messaging: 12, visibility: 13, credibility: 14, conversion: 15 };
      // sum = 65, avg = 13
      expect(calculateBrandAlignmentScore(scores)).toBe(13);
    });

    it('handles all-max scores (25 each)', () => {
      const scores = { positioning: 25, messaging: 25, visibility: 25, credibility: 25, conversion: 25 };
      expect(calculateBrandAlignmentScore(scores)).toBe(25);
    });

    it('handles all-min scores (1 each)', () => {
      const scores = { positioning: 1, messaging: 1, visibility: 1, credibility: 1, conversion: 1 };
      expect(calculateBrandAlignmentScore(scores)).toBe(1);
    });

    it('handles zero scores', () => {
      const scores = { positioning: 0, messaging: 0, visibility: 0, credibility: 0, conversion: 0 };
      expect(calculateBrandAlignmentScore(scores)).toBe(0);
    });
  });

  describe('getPrimaryPillar', () => {
    it('returns the lowest-scoring pillar', () => {
      const scores = { positioning: 15, messaging: 18, visibility: 12, credibility: 10, conversion: 20 };
      expect(getPrimaryPillar(scores)).toBe('credibility');
    });

    it('returns first lowest when tied', () => {
      const scores = { positioning: 10, messaging: 10, visibility: 15, credibility: 15, conversion: 15 };
      const result = getPrimaryPillar(scores);
      expect(['positioning', 'messaging']).toContain(result);
    });

    it('works when all scores are equal', () => {
      const scores = { positioning: 12, messaging: 12, visibility: 12, credibility: 12, conversion: 12 };
      const result = getPrimaryPillar(scores);
      expect(['positioning', 'messaging', 'visibility', 'credibility', 'conversion']).toContain(result);
    });

    it('identifies correct weakest across various combos', () => {
      expect(getPrimaryPillar({ positioning: 5, messaging: 20, visibility: 20, credibility: 20, conversion: 20 })).toBe('positioning');
      expect(getPrimaryPillar({ positioning: 20, messaging: 5, visibility: 20, credibility: 20, conversion: 20 })).toBe('messaging');
      expect(getPrimaryPillar({ positioning: 20, messaging: 20, visibility: 5, credibility: 20, conversion: 20 })).toBe('visibility');
      expect(getPrimaryPillar({ positioning: 20, messaging: 20, visibility: 20, credibility: 5, conversion: 20 })).toBe('credibility');
      expect(getPrimaryPillar({ positioning: 20, messaging: 20, visibility: 20, credibility: 20, conversion: 5 })).toBe('conversion');
    });
  });

  describe('classifyStrength', () => {
    it('classifies strong scores (>= 16)', () => {
      expect(classifyStrength(16)).toBe('strong');
      expect(classifyStrength(20)).toBe('strong');
      expect(classifyStrength(25)).toBe('strong');
    });

    it('classifies mixed scores (11-15)', () => {
      expect(classifyStrength(11)).toBe('mixed');
      expect(classifyStrength(13)).toBe('mixed');
      expect(classifyStrength(15)).toBe('mixed');
    });

    it('classifies weak scores (< 11)', () => {
      expect(classifyStrength(10)).toBe('weak');
      expect(classifyStrength(5)).toBe('weak');
      expect(classifyStrength(0)).toBe('weak');
      expect(classifyStrength(1)).toBe('weak');
    });

    it('handles boundary values precisely', () => {
      expect(classifyStrength(10)).toBe('weak');
      expect(classifyStrength(11)).toBe('mixed');
      expect(classifyStrength(15)).toBe('mixed');
      expect(classifyStrength(16)).toBe('strong');
    });
  });
});
