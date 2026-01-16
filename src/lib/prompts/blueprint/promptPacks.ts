/* ============================================================================
   Blueprint™ Prompt Packs
   Source of truth for all Blueprint™ + Blueprint+™ prompts
============================================================================ */

export type BrandStage = 'early' | 'scaling' | 'established';
export type Archetype =
  | 'Visionary'
  | 'Guide'
  | 'Authority'
  | 'Creator'
  | 'Challenger';

export type Pillar =
  | 'positioning'
  | 'messaging'
  | 'visibility'
  | 'credibility'
  | 'conversion';

export interface PromptPack {
  id: string;
  title: string;
  pillar: Pillar;
  archetypes: Archetype[];
  stages: BrandStage[];
  level: 'blueprint' | 'blueprint_plus';
  description: string;
  prompts: string[];
}

/* ============================================================================
   PROMPT PACKS
============================================================================ */

export const BLUEPRINT_PROMPT_PACKS: PromptPack[] = [
  {
    id: 'positioning-core',
    title: 'Core Brand Positioning',
    pillar: 'positioning',
    archetypes: ['Visionary', 'Authority', 'Challenger'],
    stages: ['early', 'scaling', 'established'],
    level: 'blueprint',
    description:
      'Clarifies your positioning so your brand is immediately understood and differentiated.',
    prompts: [
      `Act as a senior brand strategist. Based on the information below, define a clear and differentiated brand positioning statement.`,
      `Rewrite this positioning to be sharper, more specific, and instantly understandable to the ideal customer.`,
      `Identify the primary differentiation lever this brand should lead with in messaging.`,
      `Explain how this brand should describe what it does in one sentence to a first-time visitor.`,
    ],
  },

  {
    id: 'messaging-core',
    title: 'Messaging Framework',
    pillar: 'messaging',
    archetypes: ['Guide', 'Authority', 'Creator'],
    stages: ['early', 'scaling'],
    level: 'blueprint',
    description:
      'Creates consistent, confident messaging across all brand touchpoints.',
    prompts: [
      `Generate a core brand message that clearly communicates value without jargon.`,
      `Rewrite the following messaging to be more confident, customer-centric, and outcome-focused.`,
      `Create 3 supporting proof points that reinforce the core message.`,
      `Translate this message into language suitable for a homepage hero section.`,
    ],
  },

  {
    id: 'visibility-aeo',
    title: 'Visibility & AEO Optimization',
    pillar: 'visibility',
    archetypes: ['Authority', 'Guide'],
    stages: ['scaling', 'established'],
    level: 'blueprint',
    description:
      'Improves discoverability across search engines and AI answer engines.',
    prompts: [
      `Identify the top questions potential customers would ask AI tools when searching for this solution.`,
      `Rewrite the brand's core content to be optimized for AI answer engines like ChatGPT and Perplexity.`,
      `Generate an authority-style FAQ section designed for AI ingestion.`,
      `Outline a content structure that positions this brand as the definitive answer source in its category.`,
    ],
  },

  {
    id: 'credibility-signals',
    title: 'Trust & Credibility Signals',
    pillar: 'credibility',
    archetypes: ['Authority', 'Guide'],
    stages: ['early', 'scaling'],
    level: 'blueprint',
    description:
      'Strengthens trust through consistent, professional brand signals.',
    prompts: [
      `Identify the credibility gaps in this brand's current presentation.`,
      `Generate 3 trust signals this brand should emphasize immediately.`,
      `Rewrite brand copy to sound more confident, expert, and established.`,
      `Recommend visual and messaging adjustments that increase perceived authority.`,
    ],
  },

  {
    id: 'conversion-foundations',
    title: 'Conversion Foundations',
    pillar: 'conversion',
    archetypes: ['Challenger', 'Visionary'],
    stages: ['early', 'scaling'],
    level: 'blueprint',
    description:
      'Aligns messaging and structure to increase conversion clarity.',
    prompts: [
      `Rewrite this offer so it is immediately clear who it's for and why it matters.`,
      `Identify friction points preventing conversion and suggest fixes.`,
      `Generate a clear primary CTA aligned with this brand's positioning.`,
      `Create a short value reinforcement section for mid-page placement.`,
    ],
  },

  /* =========================
     Blueprint+™ ADVANCED
  ========================== */

  {
    id: 'positioning-advanced',
    title: 'Advanced Positioning & Narrative',
    pillar: 'positioning',
    archetypes: ['Visionary', 'Challenger'],
    stages: ['scaling', 'established'],
    level: 'blueprint_plus',
    description:
      'Expands positioning into a full narrative and strategic lens.',
    prompts: [
      `Develop a long-form brand narrative rooted in this positioning.`,
      `Identify category tensions this brand can strategically challenge.`,
      `Rewrite positioning for investor, customer, and internal audiences.`,
      `Define how this positioning should evolve over the next 12–24 months.`,
    ],
  },

  {
    id: 'visibility-advanced-aeo',
    title: 'Advanced AEO & Authority Mapping',
    pillar: 'visibility',
    archetypes: ['Authority'],
    stages: ['scaling', 'established'],
    level: 'blueprint_plus',
    description:
      'Positions the brand as a primary authority for AI-driven discovery.',
    prompts: [
      `Map authority topics this brand should own across AI search results.`,
      `Create an AI-first content hierarchy for long-term discoverability.`,
      `Generate schema-style content outlines optimized for AI systems.`,
      `Define signals that reinforce this brand as a trusted answer source.`,
    ],
  },
];
