import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Validates prompt files for structural integrity, consistency,
 * and potential issues that could cause AI model confusion.
 */

function readPromptFile(relativePath: string): string {
  return readFileSync(resolve(__dirname, '..', relativePath), 'utf-8');
}

describe('prompt structure validation', () => {
  describe('wundySystemPrompt', () => {
    let prompt: string;

    beforeAll(() => {
      prompt = readPromptFile('src/prompts/wundySystemPrompt.ts');
    });

    it('contains all expected question numbers (Q1 through Q42)', () => {
      for (let i = 1; i <= 42; i++) {
        const pattern = new RegExp(`\\b${i}\\.\\s+[A-Z]`);
        expect(prompt).toMatch(pattern);
      }
    });

    it('contains no duplicate question numbers', () => {
      const questionMatches = prompt.match(/^\d+\.\s+[A-Z][A-Z\s&]+$/gm) || [];
      const numbers = questionMatches.map(m => parseInt(m.split('.')[0]));
      const unique = new Set(numbers);
      expect(numbers.length).toBe(unique.size);
    });

    it('references all required JSON fields', () => {
      const requiredFields = [
        'userName', 'businessName', 'industry', 'geographicScope', 'audienceType',
        'website', 'socials', 'competitorNames', 'currentCustomers', 'idealCustomers',
        'primaryGoals', 'biggestChallenge', 'whatMakesYouDifferent',
        'offerClarity', 'messagingClarity',
        'hasTestimonials', 'hasCaseStudies', 'credibilityDetails', 'thoughtLeadershipActivity',
        'hasEmailList', 'hasLeadMagnet', 'hasClearCTA',
        'marketingChannels', 'visualConfidence', 'brandPersonalityWords',
        'archetypeSignals', 'yearsInBusiness', 'brandOriginStory', 'teamSize', 'revenueRange',
      ];
      for (const field of requiredFields) {
        expect(prompt).toContain(field);
      }
    });

    it('contains TONE RULE directives for sensitive sections', () => {
      const toneRuleCount = (prompt.match(/TONE RULE:/g) || []).length;
      expect(toneRuleCount).toBeGreaterThanOrEqual(2);
    });

    it('contains EMOTIONAL GUARDRAIL for credibility section', () => {
      expect(prompt).toContain('EMOTIONAL GUARDRAIL');
    });

    it('marks thought leadership and credibility as sensitive questions', () => {
      expect(prompt).toMatch(/SENSITIVE QUESTIONS.*23.*Thought Leadership/);
      expect(prompt).toMatch(/SENSITIVE QUESTIONS.*27.*Credibility/);
    });

    it('contains normalizing language for "no" answers', () => {
      const normalizing = [
        "totally normal", "really common", "no pressure",
        "no worries", "that's fine", "no wrong answer",
      ];
      let found = 0;
      for (const phrase of normalizing) {
        if (prompt.toLowerCase().includes(phrase.toLowerCase())) found++;
      }
      expect(found).toBeGreaterThanOrEqual(4);
    });

    it('does not contain judgmental language patterns outside of guardrails', () => {
      const judgmental = [
        'you should have',
        'you need to fix',
        'this is a problem',
        "you're behind",
        "you're lacking",
        'your brand is weak',
      ];
      // Split prompt into lines and check that judgmental phrases don't appear
      // outside of "Never say" / "Do NOT" guardrail instructions
      const lines = prompt.toLowerCase().split('\n');
      for (const phrase of judgmental) {
        const lowerPhrase = phrase.toLowerCase();
        for (const line of lines) {
          if (line.includes(lowerPhrase)) {
            const isGuardrail = line.includes('never say') || line.includes('do not') || line.includes("don't");
            expect(isGuardrail).toBe(true);
          }
        }
      }
    });

    it('contains privacy policy links', () => {
      expect(prompt).toContain('wunderbardigital.com/privacy-policy');
    });

    it('contains sophistication calibration for questions', () => {
      const calibrationCount = (prompt.match(/Sophistication-calibrated/gi) || []).length;
      expect(calibrationCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('snapshotPlusEnginePrompt', () => {
    let prompt: string;

    beforeAll(() => {
      prompt = readPromptFile('src/prompts/snapshotPlusEnginePrompt.ts');
    });

    it('references credibilityDetails input field', () => {
      expect(prompt).toContain('credibilityDetails');
    });

    it('references thoughtLeadershipActivity input field', () => {
      expect(prompt).toContain('thoughtLeadershipActivity');
    });

    it('contains personalization instructions', () => {
      expect(prompt.toUpperCase()).toContain('PERSONALIZATION');
    });

    it('references all five pillars', () => {
      for (const pillar of ['positioning', 'messaging', 'visibility', 'credibility', 'conversion']) {
        expect(prompt.toLowerCase()).toContain(pillar);
      }
    });
  });

  describe('blueprintEnginePrompt', () => {
    let prompt: string;

    beforeAll(() => {
      prompt = readPromptFile('src/prompts/blueprintEnginePrompt.ts');
    });

    it('references credibilityDetails input field', () => {
      expect(prompt).toContain('credibilityDetails');
    });

    it('references thoughtLeadershipActivity input field', () => {
      expect(prompt).toContain('thoughtLeadershipActivity');
    });

    it('contains Blueprint-specific deliverable references', () => {
      expect(prompt).toContain('Blueprint');
    });
  });

  describe('cross-prompt consistency', () => {
    let wundy: string;
    let snapshotPlus: string;
    let blueprint: string;

    beforeAll(() => {
      wundy = readPromptFile('src/prompts/wundySystemPrompt.ts');
      snapshotPlus = readPromptFile('src/prompts/snapshotPlusEnginePrompt.ts');
      blueprint = readPromptFile('src/prompts/blueprintEnginePrompt.ts');
    });

    it('all prompts reference the same credibilityDetails field name', () => {
      expect(wundy).toContain('credibilityDetails');
      expect(snapshotPlus).toContain('credibilityDetails');
      expect(blueprint).toContain('credibilityDetails');
    });

    it('all prompts reference the same thoughtLeadershipActivity field name', () => {
      expect(wundy).toContain('thoughtLeadershipActivity');
      expect(snapshotPlus).toContain('thoughtLeadershipActivity');
      expect(blueprint).toContain('thoughtLeadershipActivity');
    });

    it('credibilityDetails sub-fields are consistent across prompts', () => {
      const subFields = ['testimonialContext', 'caseStudyContext', 'credentials', 'quantifiableResults', 'partnerships'];
      for (const field of subFields) {
        expect(wundy).toContain(field);
      }
    });

    it('thoughtLeadershipActivity sub-fields are consistent across prompts', () => {
      const subFields = ['hasActivity', 'activities', 'expertTopics', 'aspirations'];
      for (const field of subFields) {
        expect(wundy).toContain(field);
      }
    });
  });
});
