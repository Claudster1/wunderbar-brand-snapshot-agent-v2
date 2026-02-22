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
      `Define exactly how ${businessName} should be understood in the market`,
    body: (businessName) =>
      `Your diagnostic identified a gap between what ${businessName} offers and how the market perceives it. Snapshot+\u2122 translates this into a complete positioning analysis \u2014 with a value proposition statement, competitive context, and clear strategic direction so the right customers self-select with confidence.`,
    whyItMatters: (businessName) =>
      `Clear positioning is the single highest-leverage investment ${businessName} can make \u2014 it reduces customer acquisition cost, shortens sales cycles, and makes every downstream marketing dollar more effective.`,
    cta: {
      label: "Get your positioning strategy \u2192",
      href: "/snapshot-plus",
    },
  },

  messaging: {
    label: "Messaging",
    headline: (businessName) =>
      `Build a messaging system that compounds ${businessName}\u2019s trust at every touchpoint`,
    body: (businessName) =>
      `${businessName}\u2019s messaging has strong elements but lacks the consistency needed to build cumulative trust. Snapshot+\u2122 maps the core narrative once \u2014 then provides messaging pillars, voice guidance, and channel-specific frameworks so every interaction reinforces the same strategic story.`,
    whyItMatters: () =>
      "Inconsistent messaging forces every new interaction to start from zero. A codified system means each touchpoint builds on the last \u2014 compounding recognition and trust over time.",
    cta: {
      label: "Get your messaging framework \u2192",
      href: "/snapshot-plus",
    },
  },

  visibility: {
    label: "Visibility",
    headline: (businessName) =>
      `Make ${businessName} discoverable where high-intent buyers are searching`,
    body: (businessName) =>
      `${businessName}\u2019s current visibility gaps mean qualified prospects are finding competitors \u2014 or nothing \u2014 in the moments that matter most. Snapshot+\u2122 provides a full visibility analysis including AEO readiness, channel prioritization, and specific actions to close discovery gaps.`,
    whyItMatters: () =>
      "Visibility is distribution for your brand. Without it, your positioning, messaging, and credibility never reach the people who would value them most \u2014 and growth stays dependent on outbound effort.",
    cta: {
      label: "Get your visibility strategy \u2192",
      href: "/snapshot-plus",
    },
  },

  credibility: {
    label: "Credibility",
    headline: (businessName) =>
      `Build the trust infrastructure that accelerates ${businessName}\u2019s conversions`,
    body: (businessName) =>
      `${businessName} has trust indicators that aren\u2019t working hard enough. Snapshot+\u2122 identifies exactly where proof points are missing, where visual consistency is creating doubt, and provides a credibility roadmap that makes the brand look as strong as the work actually is.`,
    whyItMatters: () =>
      "Credibility is the currency of conversion \u2014 it determines whether a prospect trusts you enough to take the next step, and how much price sensitivity enters the conversation.",
    cta: {
      label: "Get your credibility roadmap \u2192",
      href: "/snapshot-plus",
    },
  },

  conversion: {
    label: "Conversion",
    headline: (businessName) =>
      `Turn ${businessName}\u2019s brand clarity into a measurable conversion system`,
    body: (businessName) =>
      `${businessName} generates interest but loses qualified attention before it becomes revenue. Snapshot+\u2122 diagnoses where structural friction exists in the conversion path and provides a prioritized action plan to close the gap between engagement and action.`,
    whyItMatters: () =>
      "Conversion is where every upstream investment \u2014 in positioning, messaging, visibility, and credibility \u2014 either compounds into growth or leaks out through unclear next steps.",
    cta: {
      label: "Get your conversion strategy \u2192",
      href: "/snapshot-plus",
    },
  },
};
