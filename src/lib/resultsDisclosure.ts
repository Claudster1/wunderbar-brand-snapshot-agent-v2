// src/lib/resultsDisclosure.ts

export type Pillar = "Positioning" | "Messaging" | "Visibility" | "Credibility" | "Conversion";

export function getDisclosureState(
  primary: Pillar,
  ordered: Pillar[]
) {
  return ordered.map((pillar, index) => {
    if (pillar === primary) {
      return { pillar, state: "expanded" as const };
    }

    if (index === 1) {
      return { pillar, state: "collapsed" as const };
    }

    return { pillar, state: "minimal" as const };
  });
}
