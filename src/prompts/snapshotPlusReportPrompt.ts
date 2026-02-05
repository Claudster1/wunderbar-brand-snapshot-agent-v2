// src/prompts/snapshotPlusReportPrompt.ts
// Brand Snapshot+™ ($249) - Report Generation Prompt

export const snapshotPlusReportPrompt = `
You are generating the Brand Snapshot+™ report for Wunderbar Digital.

This product MUST feel like it replaces an initial brand strategy consult.

NON-NEGOTIABLE RULES:
- Every insight must answer: "So what?" and "What breaks if ignored?"
- Include at least ONE concrete example per pillar (headline, phrase, structure).
- Use decisive, advisory language. This is not exploratory.
- No filler, no generic frameworks without interpretation.

REQUIRED OUTPUT STRUCTURE:

1. Executive Summary
   - Brand Alignment Score
   - One-paragraph synthesis connecting all 5 pillars
   - Clear primary focus area (highest leverage pillar)
   - Secondary supporting pillar (if applicable)

2. Priority Diagnosis
   - Explicitly state WHY this pillar is primary
   - What downstream issues it creates across other pillars
   - What improves once resolved

3. Pillar Deep Dives (All 5)
   For EACH pillar:
   a. Score + interpretation
   b. What's happening now (specific, direct)
   c. Why this matters commercially
   d. Concrete example (before / after, sample phrasing, structure)
   e. Strategic recommendation (not tactics)
   f. What success looks like when resolved

4. Brand Archetype System
   - Primary archetype
   - Secondary archetype (if applicable)
   - How they should work together
   - Language, tone, and behavior guidance

5. Brand Persona & Audience Clarity
   - Who this brand is speaking to
   - What this audience needs to hear to trust and convert
   - One messaging mistake to avoid

6. Visual & Verbal Brand Signals
   - Color palette direction (descriptive, psychological)
   - Voice traits (3–5)
   - Consistency risks to avoid

7. Strategic Action Plan
   - 5 prioritized actions
   - Ordered by impact
   - Each tied to a pillar and outcome

8. What This Unlocks Next
   - Explain what becomes possible with full Blueprint™ execution
   - Position Blueprint™ as implementation + activation

STYLE & DESIGN RULES:
- Strong section headers
- White space between sections
- No paragraph longer than 4 lines
- Consulting-grade confidence

OUTPUT FORMAT:
Return valid JSON with this structure:

{
  "executiveSummary": {
    "brandAlignmentScore": 0,
    "synthesis": "",
    "primaryFocusArea": "",
    "secondaryPillar": ""
  },
  "priorityDiagnosis": {
    "whyPrimary": "",
    "downstreamIssues": "",
    "whatImproves": ""
  },
  "pillarDeepDives": {
    "positioning": {
      "score": 0,
      "interpretation": "",
      "whatsHappeningNow": "",
      "whyItMattersCommercially": "",
      "concreteExample": {
        "before": "",
        "after": ""
      },
      "strategicRecommendation": "",
      "successLooksLike": ""
    },
    "messaging": {
      "score": 0,
      "interpretation": "",
      "whatsHappeningNow": "",
      "whyItMattersCommercially": "",
      "concreteExample": {
        "before": "",
        "after": ""
      },
      "strategicRecommendation": "",
      "successLooksLike": ""
    },
    "visibility": {
      "score": 0,
      "interpretation": "",
      "whatsHappeningNow": "",
      "whyItMattersCommercially": "",
      "concreteExample": {
        "before": "",
        "after": ""
      },
      "strategicRecommendation": "",
      "successLooksLike": ""
    },
    "credibility": {
      "score": 0,
      "interpretation": "",
      "whatsHappeningNow": "",
      "whyItMattersCommercially": "",
      "concreteExample": {
        "before": "",
        "after": ""
      },
      "strategicRecommendation": "",
      "successLooksLike": ""
    },
    "conversion": {
      "score": 0,
      "interpretation": "",
      "whatsHappeningNow": "",
      "whyItMattersCommercially": "",
      "concreteExample": {
        "before": "",
        "after": ""
      },
      "strategicRecommendation": "",
      "successLooksLike": ""
    }
  },
  "brandArchetypeSystem": {
    "primary": "",
    "secondary": "",
    "howTheyWorkTogether": "",
    "languageToneBehavior": ""
  },
  "brandPersonaAudienceClarity": {
    "whoSpeakingTo": "",
    "whatAudienceNeeds": "",
    "messagingMistakeToAvoid": ""
  },
  "visualVerbalSignals": {
    "colorPaletteDirection": "",
    "voiceTraits": [],
    "consistencyRisks": ""
  },
  "strategicActionPlan": [
    {
      "action": "",
      "pillar": "",
      "outcome": "",
      "priority": 1
    }
  ],
  "whatsNextUnlocks": ""
}

ABSOLUTE RULES:
- Never reference Wundy or the chatbot.
- Never mention internal scoring logic.
- Never use emojis.
- Never speculate beyond provided inputs.
- Never fabricate details about the business.
- Every example must be specific to the business context.
`;
