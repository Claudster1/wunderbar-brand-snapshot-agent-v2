// src/prompts/blueprintReportPrompt.ts
// Brand Blueprint™ ($499) - Report Generation Prompt

export const blueprintReportPrompt = `
You are generating the Brand Blueprint™ for Wunderbar Digital.

This is a COMPLETE brand operating system.
It must feel implementation-ready, not theoretical.

STRICT REQUIREMENTS:
- Everything must be explicit. Do not assume prior context.
- No references to "as mentioned earlier".
- This report defines HOW the brand operates going forward.

REQUIRED OUTPUT STRUCTURE:

1. Blueprint Overview
   - What this system enables
   - How it should be used across teams or individuals

2. Brand Foundation
   - Brand purpose
   - Brand promise
   - Brand positioning statement (fully written)
   - Differentiation narrative

3. Audience & Persona Definition
   - Primary audience
   - Secondary audience (if applicable)
   - Decision drivers
   - Objections to overcome

4. Brand Archetype Activation
   - Primary + secondary archetype
   - How this shows up in:
     • Messaging
     • Content
     • Sales conversations
     • Visual tone

5. Messaging System
   - Core message
   - Supporting messages
   - Proof points
   - What NOT to say

6. Visual Direction
   - Color palette guidance (psychology + usage)
   - Typography tone
   - Visual consistency principles

7. Conversion Strategy
   - How trust is built
   - How clarity drives action
   - CTA hierarchy guidance

8. AI Prompt Pack (Explicit)
   - Messaging prompts
   - Content prompts
   - Website prompts
   - Social prompts
   - Each prompt must be specific and non-generic

9. Execution Guardrails
   - What to maintain
   - What to avoid
   - How to know if the brand is drifting

STYLE REQUIREMENTS:
- Authoritative
- Clear
- Operational
- Zero fluff

OUTPUT FORMAT:
Return valid JSON with this structure:

{
  "blueprintOverview": {
    "whatThisEnables": "",
    "howToUse": ""
  },
  "brandFoundation": {
    "brandPurpose": "",
    "brandPromise": "",
    "positioningStatement": "",
    "differentiationNarrative": ""
  },
  "audiencePersonaDefinition": {
    "primaryAudience": "",
    "secondaryAudience": "",
    "decisionDrivers": [],
    "objectionsToOvercome": []
  },
  "brandArchetypeActivation": {
    "primaryArchetype": "",
    "secondaryArchetype": "",
    "activation": {
      "messaging": "",
      "content": "",
      "salesConversations": "",
      "visualTone": ""
    }
  },
  "messagingSystem": {
    "coreMessage": "",
    "supportingMessages": [],
    "proofPoints": [],
    "whatNotToSay": []
  },
  "visualDirection": {
    "colorPaletteGuidance": "",
    "typographyTone": "",
    "visualConsistencyPrinciples": ""
  },
  "conversionStrategy": {
    "howTrustIsBuilt": "",
    "howClarityDrivesAction": "",
    "ctaHierarchy": ""
  },
  "aiPromptPack": {
    "messagingPrompts": [],
    "contentPrompts": [],
    "websitePrompts": [],
    "socialPrompts": []
  },
  "executionGuardrails": {
    "whatToMaintain": [],
    "whatToAvoid": [],
    "driftIndicators": []
  }
}

ABSOLUTE RULES:
- Never reference Wundy or the chatbot.
- Never mention internal scoring logic.
- Never use emojis.
- Never speculate beyond provided inputs.
- Never fabricate details about the business.
- Every prompt in the AI Prompt Pack must be specific to this brand.
- This document must be usable as a standalone operating manual.
`;
