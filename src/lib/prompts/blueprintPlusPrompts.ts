import { PromptBlock } from "./types";

export const blueprintPlusPrompts: Record<string, PromptBlock[]> = {
  positioning: [
    {
      id: "positioning-market-dominance",
      title: "Market Dominance Narrative",
      description:
        "Defines how your brand should be positioned as the default choice in your category.",
      prompt: ({ brandName, archetype, stage }) => `
You are a senior brand strategist.

Create a market-dominance positioning narrative for ${brandName}.

Brand archetype: ${archetype}
Business stage: ${stage}

Your output should include:
1. The core positioning statement
2. The category frame (how the market should see them)
3. The emotional driver behind choosing this brand
4. How this positioning should evolve as the brand scales

Write with authority, clarity, and confidence.
`,
    },
  ],

  messaging: [
    {
      id: "messaging-matrix",
      title: "Audience Messaging Matrix",
      description:
        "Maps core messages across audiences, objections, and buying stages.",
      prompt: ({ brandName, stage }) => `
Build a messaging matrix for ${brandName}.

Business stage: ${stage}

Include:
- Primary message
- Proof points
- Emotional hook
- Objection handling
- Call-to-action guidance

Present this as a structured table.
`,
    },
  ],

  visibility: [
    {
      id: "visibility-aeo-authority",
      title: "AEO Authority Strategy",
      description:
        "Positions the brand to be cited by AI assistants and answer engines.",
      prompt: ({ brandName }) => `
Design an Answer Engine Optimization (AEO) authority plan for ${brandName}.

Include:
- Core topics the brand should own
- Content formats AI systems favor
- How to structure pages and content for AI retrieval
- Signals that establish authority and trust

Focus on long-term AI visibility, not short-term hacks.
`,
    },
  ],

  credibility: [
    {
      id: "credibility-trust-architecture",
      title: "Trust Architecture Blueprint",
      description:
        "Defines how trust should be built systematically across touchpoints.",
      prompt: ({ brandName, archetype }) => `
Design a trust architecture for ${brandName}.

Brand archetype: ${archetype}

Include:
- Visual trust signals
- Language patterns that increase credibility
- Social proof strategy
- Authority reinforcement mechanisms

Explain why each element matters psychologically.
`,
    },
  ],

  conversion: [
    {
      id: "conversion-journey-optimization",
      title: "End-to-End Conversion Journey",
      description: "Optimizes the entire path from first touch to decision.",
      prompt: ({ brandName, stage }) => `
Map the ideal conversion journey for ${brandName}.

Business stage: ${stage}

Include:
- Awareness entry points
- Key decision moments
- Friction points to remove
- Conversion triggers
- Post-conversion reinforcement

Focus on clarity, momentum, and confidence.
`,
    },
  ],
};
