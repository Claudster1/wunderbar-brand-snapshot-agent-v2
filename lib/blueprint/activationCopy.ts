export function getBlueprintActivationCopy(pillar: string) {
  const map: Record<string, { description: string }> = {
    Positioning: {
      description:
        "Clarify what makes {{BUSINESS_NAME}} distinct — and why it matters.",
    },
    Messaging: {
      description:
        "Strengthen how your brand explains its value — clearly and consistently.",
    },
    Visibility: {
      description:
        "Increase how and where your brand shows up — across search and AI answers.",
    },
    Credibility: {
      description:
        "Build trust through consistency, confidence, and brand signals.",
    },
    Conversion: {
      description:
        "Turn clarity into action with stronger pathways to engagement.",
    },
  };

  return map[pillar];
}
