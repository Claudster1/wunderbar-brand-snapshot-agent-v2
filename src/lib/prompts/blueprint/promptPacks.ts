export type PromptPack = {
  pillar: string;
  title: string;
  prompts: string[];
};

export const BLUEPRINT_PROMPT_PACKS: PromptPack[] = [
  {
    pillar: "Positioning",
    title: "Positioning Clarity Prompts",
    prompts: [
      "Refine our primary value proposition for clarity and differentiation.",
      "Rewrite our positioning statement for a [INDUSTRY] audience.",
      "Identify the one thing our brand should be known for.",
    ],
  },
  {
    pillar: "Messaging",
    title: "Messaging Consistency Prompts",
    prompts: [
      "Rewrite our homepage headline for clarity and confidence.",
      "Align our brand voice across website and social content.",
      "Simplify our messaging without losing authority.",
    ],
  },
  {
    pillar: "Visibility",
    title: "Visibility & AEO Prompts",
    prompts: [
      "Optimize our content to appear in AI-generated answers.",
      "Rewrite this page for AEO and SEO together.",
      "Structure our brand content so LLMs can reference it.",
    ],
  },
  {
    pillar: "Credibility",
    title: "Trust-Building Prompts",
    prompts: [
      "Strengthen brand signals that build trust at first glance.",
      "Clarify our authority in the market.",
      "Improve visual consistency across touchpoints.",
    ],
  },
  {
    pillar: "Conversion",
    title: "Conversion Optimization Prompts",
    prompts: [
      "Improve our CTA clarity without sounding salesy.",
      "Reduce friction in our primary conversion flow.",
      "Rewrite copy to guide decision-making confidently.",
    ],
  },
];

// Re-export shared prompt types for Blueprint+ helpers
export type { BlueprintPrompt, BlueprintPromptPack } from "../types";
