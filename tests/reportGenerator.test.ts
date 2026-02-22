import { describe, it, expect } from 'vitest';
import { generateReport, generateExampleReport, type PillarScores, type ReportData } from '../src/services/reportGenerator';

describe('reportGenerator', () => {
  describe('generateReport', () => {
    it('returns all required fields', () => {
      const data: ReportData = {
        brandAlignmentScore: 15,
        pillarScores: { positioning: 15, messaging: 15, visibility: 15, credibility: 15, conversion: 15 },
      };
      const report = generateReport(data);
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('overallInterpretation');
      expect(report).toHaveProperty('pillars');
      expect(report).toHaveProperty('opportunitiesSummary');
      expect(report).toHaveProperty('upgradeCTA');
    });

    it('returns all 5 pillar objects with score and insight', () => {
      const data: ReportData = {
        brandAlignmentScore: 15,
        pillarScores: { positioning: 15, messaging: 15, visibility: 15, credibility: 15, conversion: 15 },
      };
      const report = generateReport(data);
      for (const pillar of ['positioning', 'messaging', 'visibility', 'credibility', 'conversion'] as const) {
        expect(report.pillars[pillar]).toHaveProperty('score');
        expect(report.pillars[pillar]).toHaveProperty('insight');
        expect(typeof report.pillars[pillar].score).toBe('number');
        expect(typeof report.pillars[pillar].insight).toBe('string');
        expect(report.pillars[pillar].insight.length).toBeGreaterThan(0);
      }
    });

    it('produces different summaries for different score ranges', () => {
      const excellent = generateReport({ brandAlignmentScore: 85, pillarScores: { positioning: 20, messaging: 20, visibility: 20, credibility: 20, conversion: 20 } });
      const strong = generateReport({ brandAlignmentScore: 65, pillarScores: { positioning: 16, messaging: 16, visibility: 16, credibility: 16, conversion: 16 } });
      const developing = generateReport({ brandAlignmentScore: 45, pillarScores: { positioning: 12, messaging: 12, visibility: 12, credibility: 12, conversion: 12 } });
      const needsFocus = generateReport({ brandAlignmentScore: 30, pillarScores: { positioning: 8, messaging: 8, visibility: 8, credibility: 8, conversion: 8 } });

      expect(excellent.overallInterpretation).toContain('excellent');
      expect(strong.overallInterpretation).toContain('strong');
      expect(developing.overallInterpretation).toContain('developing');
      expect(needsFocus.overallInterpretation).toContain('opportunity');
    });

    it('identifies top and bottom pillars in summary', () => {
      const data: ReportData = {
        brandAlignmentScore: 14,
        pillarScores: { positioning: 20, messaging: 5, visibility: 15, credibility: 10, conversion: 18 },
      };
      const report = generateReport(data);
      expect(report.summary.toLowerCase()).toContain('positioning');
      expect(report.summary.toLowerCase()).toContain('messaging');
    });

    it('includes WunderBrand Score in interpretation', () => {
      const report = generateReport({
        brandAlignmentScore: 72,
        pillarScores: { positioning: 16, messaging: 15, visibility: 14, credibility: 13, conversion: 14 },
      });
      expect(report.overallInterpretation).toContain('72');
    });

    it('applies user context modifiers when provided', () => {
      const withContext = generateReport({
        brandAlignmentScore: 15,
        pillarScores: { positioning: 15, messaging: 15, visibility: 15, credibility: 15, conversion: 15 },
        userContext: {
          hasWebsite: false,
          knowsDifferentiator: false,
          hasTestimonials: false,
          hasClearCTA: false,
        },
      });
      const withoutContext = generateReport({
        brandAlignmentScore: 15,
        pillarScores: { positioning: 15, messaging: 15, visibility: 15, credibility: 15, conversion: 15 },
      });
      // With context should have modifier text appended
      expect(withContext.pillars.positioning.insight.length).toBeGreaterThanOrEqual(withoutContext.pillars.positioning.insight.length);
    });

    it('generates upgrade CTA mentioning Snapshot+', () => {
      const report = generateReport({
        brandAlignmentScore: 12,
        pillarScores: { positioning: 10, messaging: 12, visibility: 8, credibility: 15, conversion: 14 },
      });
      expect(report.upgradeCTA).toContain('Snapshot+');
    });

    it('generates opportunities summary mentioning weakest pillar', () => {
      const report = generateReport({
        brandAlignmentScore: 12,
        pillarScores: { positioning: 20, messaging: 20, visibility: 5, credibility: 20, conversion: 20 },
      });
      expect(report.opportunitiesSummary.toLowerCase()).toContain('visibility');
    });
  });

  describe('generateExampleReport', () => {
    it('returns a valid report', () => {
      const report = generateExampleReport();
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('overallInterpretation');
      expect(report).toHaveProperty('pillars');
      expect(report.pillars).toHaveProperty('positioning');
      expect(report.pillars.positioning.score).toBe(16);
    });
  });

  describe('edge cases', () => {
    it('handles extreme high scores gracefully', () => {
      const report = generateReport({
        brandAlignmentScore: 100,
        pillarScores: { positioning: 25, messaging: 25, visibility: 25, credibility: 25, conversion: 25 },
      });
      expect(report.summary.length).toBeGreaterThan(0);
      expect(report.overallInterpretation.length).toBeGreaterThan(0);
    });

    it('handles extreme low scores gracefully', () => {
      const report = generateReport({
        brandAlignmentScore: 1,
        pillarScores: { positioning: 1, messaging: 1, visibility: 1, credibility: 1, conversion: 1 },
      });
      expect(report.summary.length).toBeGreaterThan(0);
      expect(report.pillars.positioning.insight.length).toBeGreaterThan(0);
      expect(report.opportunitiesSummary.length).toBeGreaterThan(0);
    });

    it('handles asymmetric scores (one very high, rest very low)', () => {
      const report = generateReport({
        brandAlignmentScore: 9,
        pillarScores: { positioning: 25, messaging: 5, visibility: 5, credibility: 5, conversion: 5 },
      });
      expect(report.summary.toLowerCase()).toContain('positioning');
      expect(report.opportunitiesSummary.length).toBeGreaterThan(0);
    });

    it('handles zero brandAlignmentScore', () => {
      const report = generateReport({
        brandAlignmentScore: 0,
        pillarScores: { positioning: 0, messaging: 0, visibility: 0, credibility: 0, conversion: 0 },
      });
      expect(report.summary.length).toBeGreaterThan(0);
    });
  });
});
