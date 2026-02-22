export const blueprintPlusCopy = {
  hero: {
    title: "WunderBrand Blueprint+\u2122",
    subtitle: "The advanced brand system built for scale, AI readiness, and market leadership",
    intro:
      "WunderBrand Blueprint+\u2122 extends your brand foundation into a full activation system \u2014 with advanced customer journey mapping, a 12-month content roadmap, complete AEO implementation, campaign architecture, and an advanced AI prompt library. Designed for brands ready to operationalize strategy into consistent, scalable execution.",
  },

  differentiation: [
    "Customer journey mapping with stage-specific messaging and conversion triggers",
    "12-month content roadmap with monthly themes, messaging angles, and AEO integration",
    "Complete Answer Engine Optimization system with platform-specific implementation",
    "Advanced AI Prompt Library for content improvement, competitive analysis, and strategic planning",
    "Visual direction with photography guidance, stock photo selection criteria, and color application rules",
    "Brand personality system with decision filters for on-brand/off-brand evaluation",
    "30-minute Strategy Activation Session with a senior brand strategist",
  ],

  outcome: {
    headline: "Why Blueprint+\u2122 exists",
    bullets: [
      "Scale your brand across new channels, campaigns, and team members without diluting what makes you distinctive",
      "Execute a 12-month content strategy with AI-integrated workflows and clear measurement",
      "Own the AI search conversation in your category with a complete AEO implementation system",
      "Launch faster, iterate with confidence, and maintain brand integrity at every touchpoint",
    ],
  },

  pricing: {
    label: "WunderBrand Blueprint+\u2122",
    price: "$1,997",
    note:
      "One-time investment. Snapshot+\u2122 and Blueprint\u2122 credits apply. Includes Strategy Activation Session.",
  },

  cta: {
    primary: "Get your advanced brand activation system",
    secondary: "See what Blueprint+\u2122 delivers beyond Blueprint\u2122",
  },
};

export const BLUEPRINT_PLUS_LAYERS = {
  strategyExpansion: {
    title: "Advanced Strategic Expansion",
    description:
      "Extends positioning into competitive territory mapping, strategic trade-off analysis, and audience transition planning \u2014 the depth needed when markets shift and growth accelerates.",
  },

  messagingMatrix: {
    title: "Channel-Specific Messaging Architecture",
    description:
      "Takes your messaging pillars and adapts them to each channel with specific copy examples \u2014 website, social, email, and sales \u2014 so consistency doesn\u2019t mean repetition.",
  },

  campaignArchitecture: {
    title: "12-Month Campaign Architecture",
    description:
      "Maps your brand strategy into monthly execution themes with messaging angles, growth priorities, and AEO strategies \u2014 so you\u2019re never starting from a blank page.",
  },

  advancedAEO: {
    title: "Complete AEO Implementation System",
    description:
      "Platform-specific optimization for ChatGPT, Perplexity, Google AI Overviews, and emerging AI platforms \u2014 with entity building, content structuring, and measurement guidance.",
  },

  systemPrompts: {
    title: "Advanced AI Prompt Library",
    description:
      "Multi-step prompt sequences designed to operationalize your brand across ChatGPT, Claude, and other AI tools \u2014 for content creation, competitive analysis, and strategic planning.",
  },
};

export type PillarKey =
  | "positioning"
  | "messaging"
  | "visibility"
  | "credibility"
  | "conversion";

export const blueprintPlusUpsellByPillar: Record<
  PillarKey,
  { headline: string; body: string; cta: string }
> = {
  positioning: {
    headline: "Turn positioning clarity into defensible market leadership",
    body:
      "Blueprint+\u2122 extends your positioning into competitive territory mapping, strategic trade-off analysis, and a customer journey framework \u2014 so your brand doesn\u2019t just occupy a position, it owns one competitors can\u2019t replicate.",
    cta: "Get your Blueprint+\u2122 activation system",
  },
  messaging: {
    headline: "Scale your messaging into a 12-month execution system",
    body:
      "Blueprint+\u2122 transforms your messaging framework into a complete campaign architecture with monthly content themes, channel-specific copy examples, and advanced AI prompts \u2014 so consistency becomes automatic, not aspirational.",
    cta: "Get your Blueprint+\u2122 activation system",
  },
  visibility: {
    headline: "Own the AI search conversation in your category",
    body:
      "Blueprint+\u2122 delivers a complete AEO implementation system with platform-specific optimization, entity building, and structured content guidance \u2014 so your brand is the one AI assistants reference and recommend.",
    cta: "Get your Blueprint+\u2122 activation system",
  },
  credibility: {
    headline: "Build a credibility system that scales with your growth",
    body:
      "Blueprint+\u2122 strengthens trust through a comprehensive credibility strategy \u2014 proof-point roadmap, authority signal plan, brand consistency checklist, and photography direction that makes every touchpoint reinforce the same level of quality.",
    cta: "Get your Blueprint+\u2122 activation system",
  },
  conversion: {
    headline: "Turn brand alignment into a measurable revenue engine",
    body:
      "Blueprint+\u2122 connects every strategic element \u2014 positioning, messaging, credibility, and visibility \u2014 into an integrated conversion system with customer journey mapping, CTA architecture, and measurement frameworks that track real business impact.",
    cta: "Get your Blueprint+\u2122 activation system",
  },
};
