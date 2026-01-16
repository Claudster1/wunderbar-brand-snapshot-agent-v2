// src/lib/blueprint/promptPacks.ts
// AI prompt packs for each pillar to help users generate content

import { PillarKey } from "@/lib/pillars/pillarCopy";

export const PROMPT_PACKS: Record<PillarKey, string[]> = {
  positioning: [
    "Generate a one-sentence positioning statement that clearly communicates who [business] serves and why they're the best choice.",
    "Rewrite this homepage headline for clarity and immediate understanding of [business]'s value proposition.",
    "Create a positioning framework that differentiates [business] from competitors in the [industry] space.",
    "Develop a tagline that captures [business]'s unique positioning in 5-7 words.",
  ],
  messaging: [
    "Create a brand voice guide based on these traits: [traits]. Show how to apply this voice across website, social, and email.",
    "Rewrite this About page using the brand narrative and ensuring it aligns with our messaging framework.",
    "Generate three variations of our core message, each tailored for different audiences: [audience1], [audience2], [audience3].",
    "Develop messaging guidelines for [business] that ensure consistency across all customer touchpoints.",
  ],
  visibility: [
    "Generate AEO-ready FAQ content that answers common questions about [business] in a way AI assistants can easily reference.",
    "Structure a pillar page for AI discovery that covers [topic] comprehensively and includes clear, authoritative information.",
    "Create SEO and AEO optimized content for [business]'s main service pages, ensuring discoverability in both search and AI results.",
    "Develop a content strategy that positions [business] as an authority in [industry] for both human readers and AI systems.",
  ],
  credibility: [
    "Generate trust signals and proof points that reinforce [business]'s credibility across the customer journey.",
    "Create case study templates that showcase [business]'s expertise and results in a credible, authentic way.",
    "Develop social proof content that builds confidence in [business] without feeling overly promotional.",
    "Rewrite testimonials and reviews to highlight credibility while maintaining authenticity.",
  ],
  conversion: [
    "Optimize this landing page copy to convert visitors by addressing their primary concerns and motivations.",
    "Create a conversion-focused email sequence that guides prospects from interest to action for [business].",
    "Generate call-to-action variations that feel natural and compelling for [business]'s target audience.",
    "Develop a conversion optimization strategy that removes friction and builds confidence in the buying decision.",
  ],
};

// Blueprint activation prompt packs with titles
export const blueprintPromptPacks = {
  Positioning: {
    title: "Positioning Activation Prompts",
    prompts: [
      "Define our core positioning in one sentence for a first-time visitor.",
      "Describe what differentiates us from competitors in plain language.",
      "Write a positioning statement for sales conversations.",
    ],
  },
  Messaging: {
    title: "Messaging Activation Prompts",
    prompts: [
      "Rewrite our homepage headline for clarity and confidence.",
      "Create a short brand elevator pitch.",
    ],
  },
};
