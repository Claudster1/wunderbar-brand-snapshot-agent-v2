import { describe, it, expect } from 'vitest';
import {
  calculateBrandAlignmentScore,
  getPrimaryPillar,
  classifyStrength,
} from '../src/scoring/scoringEngine';

describe('scoringEngine', () => {
  describe('calculateBrandAlignmentScore', () => {
    it('sums all pillar scores to 100-point model', () => {
      const scores = { positioning: 15, messaging: 18, visibility: 12, credibility: 10, conversion: 20 };
      expect(calculateBrandAlignmentScore(scores)).toBe(75);
    });

    it('returns exact total when evenly distributed', () => {
      const scores = { positioning: 10, messaging: 10, visibility: 10, credibility: 10, conversion: 10 };
      expect(calculateBrandAlignmentScore(scores)).toBe(50);
    });

    it('handles integer totals directly', () => {
      const scores = { positioning: 11, messaging: 12, visibility: 13, credibility: 14, conversion: 15 };
      expect(calculateBrandAlignmentScore(scores)).toBe(65);
    });

    it('caps at all-max score (20 each)', () => {
      const scores = { positioning: 20, messaging: 20, visibility: 20, credibility: 20, conversion: 20 };
      expect(calculateBrandAlignmentScore(scores)).toBe(100);
    });

    it('handles all-min scores', () => {
      const scores = { positioning: 0, messaging: 0, visibility: 0, credibility: 0, conversion: 0 };
      expect(calculateBrandAlignmentScore(scores)).toBe(0);
    });
  });

  describe('getPrimaryPillar', () => {
    it('returns the weakest pillar by spec logic', () => {
      const scores = { positioning: 15, messaging: 18, visibility: 12, credibility: 10, conversion: 20 };
      expect(getPrimaryPillar(scores)).toBe('credibility');
    });

    it('applies upstream override before raw-lowest fallback', () => {
      const scores = { positioning: 8, messaging: 14, visibility: 13, credibility: 15, conversion: 12 };
      expect(getPrimaryPillar(scores)).toBe('positioning');
    });

    it('uses business-type multipliers for near-tie priority', () => {
      const scores = { positioning: 14, messaging: 14, visibility: 14, credibility: 14, conversion: 14 };
      expect(getPrimaryPillar(scores, "local_service")).toBe('visibility');
    });

    it('uses upstream tie-break in adjusted-gap near ties', () => {
      const scores = { positioning: 14, messaging: 14, visibility: 15, credibility: 15, conversion: 14 };
      expect(getPrimaryPillar(scores, "service_b2b")).toBe('positioning');
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
