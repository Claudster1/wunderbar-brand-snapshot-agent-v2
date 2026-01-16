// src/copy/pillars.ts
// ALL pillar copy (UI + PDF) - consolidated pillar content

export type PillarKey =
  | "positioning"
  | "messaging"
  | "visibility"
  | "credibility"
  | "conversion";

export const pillarCopy: Record<PillarKey, {
  title: string;
  summary: (brand: string) => string;
  whyItMatters: string;
  expanded: {
    strong: (brand: string) => string;
    mixed: (brand: string) => string;
    weak: (brand: string) => string;
  };
}> = {
  positioning: {
    title: "Positioning",
    summary: (brand) =>
      `${brand} has a defined offering, but clarity varies depending on where and how it shows up.`,
    whyItMatters:
      "Positioning determines whether the right customers immediately understand why you matter.",
    expanded: {
      strong: (brand) =>
        `${brand} communicates its value clearly and consistently, making it easy for the right customers to self-select.`,
      mixed: (brand) =>
        `${brand} has strong foundations, but the value proposition isn't always immediately obvious.`,
      weak: (brand) =>
        `${brand} would benefit from sharpening how its offer is framed so customers instantly understand what sets it apart.`,
    },
  },

  messaging: {
    title: "Messaging",
    summary: (brand) =>
      `Your core ideas are present, but they're not always expressed with the same clarity or confidence.`,
    whyItMatters:
      "Messaging shapes how people remember, describe, and trust your brand.",
    expanded: {
      strong: (brand) =>
        `${brand} speaks with a clear, confident voice that reinforces its positioning.`,
      mixed: (brand) =>
        `${brand} has strong ideas, but consistency across channels could be improved.`,
      weak: (brand) =>
        `${brand} would benefit from tighter message alignment across touchpoints.`,
    },
  },

  visibility: {
    title: "Visibility",
    summary: (brand) =>
      `${brand} shows up in some channels, but discoverability can be expanded.`,
    whyItMatters:
      "If the right people can't find you, even strong brands stall.",
    expanded: {
      strong: (brand) =>
        `${brand} is discoverable across both traditional search and AI-driven discovery.`,
      mixed: (brand) =>
        `${brand} has visibility foundations but could better leverage SEO and AEO.`,
      weak: (brand) =>
        `${brand} is under-represented where customers are actively looking.`,
    },
  },

  credibility: {
    title: "Credibility",
    summary: (brand) =>
      `Trust signals are present, but not always reinforced consistently.`,
    whyItMatters:
      "Credibility reduces friction and accelerates decisions.",
    expanded: {
      strong: (brand) =>
        `${brand} reinforces trust through consistency, clarity, and proof.`,
      mixed: (brand) =>
        `${brand} shows credibility signals, but they're not always visible.`,
      weak: (brand) =>
        `${brand} would benefit from stronger proof and consistency cues.`,
    },
  },

  conversion: {
    title: "Conversion",
    summary: (brand) =>
      `Opportunities exist to guide visitors more confidently to the next step.`,
    whyItMatters:
      "Clear paths turn interest into action.",
    expanded: {
      strong: (brand) =>
        `${brand} makes it easy for people to know what to do next.`,
      mixed: (brand) =>
        `${brand} has calls-to-action, but they're not always reinforced.`,
      weak: (brand) =>
        `${brand} would benefit from clearer, more confident conversion paths.`,
    },
  },
};
