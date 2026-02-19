// src/lib/pillars/pillarCopy.ts
// Pillar-specific copy for CTAs, headlines, and messaging

export type PillarKey =
  | "positioning"
  | "messaging"
  | "visibility"
  | "credibility"
  | "conversion";

export interface PillarCopy {
  label: string;
  headline: (businessName: string) => string;
  body: (businessName: string) => string;
  whyItMatters: (businessName: string) => string;
  cta: {
    label: string;
    href: string;
  };
}

export const PILLAR_COPY: Record<PillarKey, PillarCopy> = {
  positioning: {
    label: "Positioning",
    headline: (businessName) =>
      `Clarify how ${businessName} should be understood — instantly`,
    body: (businessName) =>
      `Your WunderBrand Snapshot™ shows that ${businessName}'s value may not be immediately clear to first-time visitors. 
WunderBrand Snapshot+™ defines your positioning precisely so customers understand why you in seconds.`,
    whyItMatters: (businessName) =>
      `Clear positioning reduces confusion, shortens decision time, and helps ${businessName} stand out in a crowded market.`,
    cta: {
      label: "Go deeper on Positioning →",
      href: "/snapshot-plus",
    },
  },

  messaging: {
    label: "Messaging",
    headline: () =>
      "Align your messaging so it works everywhere",
    body: () =>
      `Your messaging is strong in places, but not always consistent.
WunderBrand Snapshot+™ maps your core message once — then shows how to express it clearly across channels.`,
    whyItMatters: () =>
      "Consistent messaging builds trust and ensures your brand sounds intentional, not improvised.",
    cta: {
      label: "Refine my messaging →",
      href: "/snapshot-plus",
    },
  },

  visibility: {
    label: "Visibility",
    headline: (businessName) =>
      `Make ${businessName} easier to discover — everywhere people search`,
    body: () =>
      `Your visibility today limits how often your brand is surfaced — especially in AI-driven discovery.
WunderBrand Snapshot+™ shows where to strengthen SEO and AEO so your brand is easier to find and reference.`,
    whyItMatters: () =>
      "If your brand isn't discoverable, even strong positioning and messaging go unseen.",
    cta: {
      label: "Increase my visibility →",
      href: "/snapshot-plus",
    },
  },

  credibility: {
    label: "Credibility",
    headline: () =>
      "Strengthen trust at every touchpoint",
    body: (businessName) =>
      `Your brand shows promise, but consistency signals trust.
WunderBrand Snapshot+™ identifies what to standardize so ${businessName} feels credible everywhere it appears.`,
    whyItMatters: () =>
      "Credibility reduces friction and reassures people they're making the right choice.",
    cta: {
      label: "Build stronger brand trust →",
      href: "/snapshot-plus",
    },
  },

  conversion: {
    label: "Conversion",
    headline: () =>
      "Turn clarity into confident action",
    body: (businessName) =>
      `People may understand ${businessName} — but hesitate to act.
WunderBrand Snapshot+™ reveals what's missing between interest and conversion.`,
    whyItMatters: () =>
      "Conversion issues often stem from small gaps that compound across the experience.",
    cta: {
      label: "Improve conversions →",
      href: "/snapshot-plus",
    },
  },
};
