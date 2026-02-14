// src/content/blueprintPlus.copy.ts
// Copy for WunderBrand Blueprint+™ ($1,997)

export const blueprintPlusCopy = {
  hero: {
    title: "WunderBrand Blueprint+™",
    subtitle: "Turn clarity into scale — with an activation-ready brand system",
    intro:
      "WunderBrand Blueprint+™ extends your foundation into a scalable system — designed for growing campaigns and AI-driven marketing environments.",
  },

  differentiation: [
    "Advanced audience segmentation",
    "Campaign-level messaging systems",
    "Expanded AEO strategy",
    "Brand themes for future offerings",
    "Execution-ready AI prompt packs",
  ],

  outcome: {
    headline: "Why Blueprint+™ exists",
    bullets: [
      "Scale without dilution",
      "Consistency across tools",
      "Faster launches",
      "Stronger discovery in AI and search",
    ],
  },

  pricing: {
    label: "WunderBrand Blueprint+™",
    price: "$1,997",
    note:
      "One-time purchase. Snapshot+™ and Blueprint™ credits apply.",
  },

  cta: {
    primary: "Activate WunderBrand Blueprint+™",
    secondary: "Scale my brand with confidence",
  },
};

// Blueprint+™ Layers
// Defines the advanced components included in Blueprint+™

export const BLUEPRINT_PLUS_LAYERS = {
  strategyExpansion: {
    title: "Advanced Strategic Expansion",
    description:
      "Deepens positioning, audience segmentation, and differentiation beyond the Snapshot+™ foundation.",
  },

  messagingMatrix: {
    title: "Messaging Matrix",
    description:
      "Channel-specific messaging guidance aligned to your primary and secondary pillars.",
  },

  campaignArchitecture: {
    title: "Campaign Architecture",
    description:
      "Maps your brand strategy into campaign-level themes, narratives, and rollout logic.",
  },

  advancedAEO: {
    title: "Advanced AEO Optimization",
    description:
      "Structures your brand to be cited, referenced, and surfaced by AI answer engines.",
  },

  systemPrompts: {
    title: "Advanced Prompt System",
    description:
      "Multi-step prompt sequences designed to operationalize your brand across tools.",
  },
};

// Blueprint+™ Upsell Copy by Pillar
// Pillar-specific upsell messaging for Blueprint+™

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
    headline: "Turn positioning clarity into market leadership",
    body:
      "WunderBrand Blueprint+™ expands your positioning into a defensible narrative, competitive differentiation, and category clarity — so your brand isn't just clear, it's unmistakable.",
    cta: "Activate WunderBrand Blueprint+™",
  },
  messaging: {
    headline: "Transform messaging into a scalable system",
    body:
      "WunderBrand Blueprint+™ converts your messaging insights into a complete narrative framework your team and AI tools can use consistently across every channel.",
    cta: "Unlock WunderBrand Blueprint+™",
  },
  visibility: {
    headline: "Build visibility that compounds over time",
    body:
      "WunderBrand Blueprint+™ deepens your SEO + AEO strategy so your brand shows up where modern buyers actually search — including AI-powered discovery.",
    cta: "Expand with WunderBrand Blueprint+™",
  },
  credibility: {
    headline: "Turn trust into a strategic advantage",
    body:
      "WunderBrand Blueprint+™ strengthens credibility through consistent voice, visual direction, and authority-building systems that scale with your growth.",
    cta: "Strengthen with WunderBrand Blueprint+™",
  },
  conversion: {
    headline: "Convert clarity into confident action",
    body:
      "WunderBrand Blueprint+™ aligns positioning, messaging, and trust signals into a conversion-ready system designed to reduce friction and increase momentum.",
    cta: "Activate WunderBrand Blueprint+™",
  },
};
