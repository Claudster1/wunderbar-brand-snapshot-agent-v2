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
      `${brand}'s market position has identifiable strengths, but the gap between what it offers and how it's understood by the right buyers represents a material growth constraint.`,
    whyItMatters:
      "Positioning is the single most leveraged strategic decision a brand makes — it determines who notices you, who self-selects, and who pays a premium.",
    expanded: {
      strong: (brand) =>
        `${brand} occupies a clear, defensible position that makes it easy for the right customers to choose confidently — and for the wrong ones to self-select out. This clarity compounds across every other pillar.`,
      mixed: (brand) =>
        `${brand} has a recognizable presence, but the core value proposition isn't landing with the precision needed to drive confident buying decisions — which creates drag across messaging, conversion, and perceived authority.`,
      weak: (brand) =>
        `${brand} lacks the positioning clarity required for the market to understand what it does differently and why it matters — which means growth currently depends on effort rather than strategic leverage.`,
    },
  },

  messaging: {
    title: "Messaging",
    summary: (brand) =>
      `${brand}'s core narrative has promising elements, but inconsistency across touchpoints is diluting impact and slowing the path from attention to trust.`,
    whyItMatters:
      "Messaging is how positioning becomes tangible — it shapes whether people remember, repeat, and recommend your brand within the first 30 seconds of contact.",
    expanded: {
      strong: (brand) =>
        `${brand} communicates with a distinctive, consistent voice that reinforces its strategic position at every touchpoint — turning each interaction into a trust-building moment.`,
      mixed: (brand) =>
        `${brand} has strong messaging instincts, but the lack of a codified system means different channels tell subtly different stories — eroding the cumulative trust that drives conversion.`,
      weak: (brand) =>
        `${brand}'s messaging lacks the clarity and consistency needed to build recognition — which forces every new interaction to start from scratch rather than compounding previous ones.`,
    },
  },

  visibility: {
    title: "Visibility",
    summary: (brand) =>
      `${brand} has a presence in select channels, but significant discovery gaps mean qualified prospects are finding competitors — or nothing at all — where ${brand} should be appearing.`,
    whyItMatters:
      "Visibility is distribution for your brand — without it, even the strongest positioning and messaging never reach the people who would value them most.",
    expanded: {
      strong: (brand) =>
        `${brand} is discoverable across both traditional search and AI-driven platforms, creating multiple pathways for qualified prospects to find and evaluate the brand organically.`,
      mixed: (brand) =>
        `${brand} has visibility foundations in place, but gaps in SEO, AEO, and channel diversification are leaving high-intent discovery opportunities on the table.`,
      weak: (brand) =>
        `${brand} is significantly under-represented in the channels where its best customers are actively searching — which means growth is overly dependent on outbound effort and referrals.`,
    },
  },

  credibility: {
    title: "Credibility",
    summary: (brand) =>
      `${brand} has trust indicators in place, but they aren't consistently deployed where buying decisions happen — creating unnecessary friction at the most critical moments.`,
    whyItMatters:
      "Credibility is the currency of conversion — it determines whether a prospect trusts you enough to take the next step, and how much price sensitivity enters the conversation.",
    expanded: {
      strong: (brand) =>
        `${brand} reinforces trust through a layered system of social proof, visual consistency, and demonstrated expertise — reducing buyer hesitation and supporting premium positioning.`,
      mixed: (brand) =>
        `${brand} has credibility assets that aren't working hard enough — proof points exist but aren't strategically placed where they'd reduce the friction that's slowing conversion.`,
      weak: (brand) =>
        `${brand} lacks the visible trust signals needed to compete confidently — which means prospects default to safer, more established alternatives even when ${brand}'s offering is superior.`,
    },
  },

  conversion: {
    title: "Conversion",
    summary: (brand) =>
      `${brand} generates interest, but the gap between engagement and action reveals structural friction in the conversion path that's leaving revenue on the table.`,
    whyItMatters:
      "Conversion is where every other investment — in positioning, messaging, visibility, and credibility — either compounds into growth or leaks out through unclear next steps.",
    expanded: {
      strong: (brand) =>
        `${brand} makes the path from interest to action clear, confident, and low-friction — with well-structured CTAs, lead capture, and nurture systems that convert attention into revenue.`,
      mixed: (brand) =>
        `${brand} has conversion elements in place, but they aren't working as a cohesive system — which means qualified interest is being lost to unclear next steps and unoptimized flows.`,
      weak: (brand) =>
        `${brand} lacks the conversion infrastructure needed to capitalize on the attention it generates — without clear CTAs, lead capture, and follow-up systems, growth will remain unpredictable.`,
    },
  },
};
