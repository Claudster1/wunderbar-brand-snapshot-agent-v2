type Prompt = {
  id: string;
  title: string;
  description: string;
  body: string;
};

export const blueprintPromptMap: Record<string, Prompt[]> = {
  Positioning: [
    {
      id: "positioning-core",
      title: "Core Positioning Clarifier",
      description:
        "Clarifies your primary value, audience, and differentiation.",
      body: `
Act as a senior brand strategist.

Using the following inputs, refine a clear, compelling positioning statement:

• Who the brand serves
• The primary problem it solves
• Why it is meaningfully different
• What makes it credible

Keep the output concise, confident, and aligned to the brand’s stage.
`,
    },
  ],

  Messaging: [
    {
      id: "messaging-framework",
      title: "Messaging Framework Builder",
      description:
        "Builds a consistent message hierarchy aligned to brand priorities.",
      body: `
Create a messaging framework that includes:

• Primary brand message
• Supporting proof points
• Emotional framing
• Language guidance

Ensure clarity, consistency, and ease of reuse across channels.
`,
    },
  ],

  Visibility: [
    {
      id: "visibility-aeo",
      title: "AEO + Visibility Activation",
      description:
        "Optimizes content to surface in both search and AI-driven discovery.",
      body: `
Develop a visibility strategy that combines SEO and Answer Engine Optimization.

Include:
• Content themes AI systems can reference
• Structural guidance for AI readability
• Signals that improve brand discoverability in LLM responses
`,
    },
  ],

  Credibility: [
    {
      id: "credibility-signals",
      title: "Credibility Signal Strengthener",
      description:
        "Identifies and reinforces trust-building brand signals.",
      body: `
Identify opportunities to strengthen credibility through:

• Visual consistency
• Authority signals
• Social proof
• Brand clarity

Prioritize actions with the highest trust impact.
`,
    },
  ],

  Conversion: [
    {
      id: "conversion-clarity",
      title: "Conversion Path Optimizer",
      description:
        "Improves clarity and momentum across key conversion moments.",
      body: `
Evaluate and optimize conversion touchpoints by clarifying:

• Primary calls to action
• Value articulation
• Friction points
• Confidence cues

Recommend improvements aligned to brand maturity.
`,
    },
  ],
};
