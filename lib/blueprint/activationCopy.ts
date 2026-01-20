export function getBlueprintActivationCopy(pillar: string) {
  const map: Record<string, { description: string }> = {
    Positioning: {
      description:
        "Translate your positioning insight into a clear, defensible market stance and value narrative.",
    },
    Messaging: {
      description:
        "Turn clarity into consistent, confident messaging across channels.",
    },
    Visibility: {
      description:
        "Activate discoverability with SEO + AEO strategies aligned to how buyers search today.",
    },
    Credibility: {
      description:
        "Reinforce trust signals and brand authority where it matters most.",
    },
    Conversion: {
      description:
        "Remove friction from the buyer journey and improve action clarity.",
    },
  };

  return map[pillar];
}
