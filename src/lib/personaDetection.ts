// src/lib/personaDetection.ts
// Persona detection logic based on business attributes

export type Persona = 'early_founder' | 'scaling_team' | 'advanced_operator' | null;

interface PersonaDetectionInput {
  brandConsistency: 'inconsistent' | 'somewhat' | 'strong';
  messagingClarity: 'very clear' | 'somewhat clear' | 'unclear';
  marketingChannels: string[];
  visualConfidence: 'very confident' | 'somewhat confident' | 'not confident';
}

export function detectPersona(input: PersonaDetectionInput): Persona {
  const {
    brandConsistency,
    messagingClarity,
    marketingChannels,
    visualConfidence,
  } = input;

  // Early founder: inconsistent brand, unclear messaging, no active marketing
  if (
    brandConsistency === "inconsistent" &&
    messagingClarity !== "very clear" &&
    marketingChannels.includes("None currently")
  ) {
    return 'early_founder';
  }

  // Scaling team: some consistency, multiple channels, visual confidence
  if (
    brandConsistency === "somewhat" &&
    marketingChannels.length >= 2 &&
    visualConfidence !== "not confident"
  ) {
    return 'scaling_team';
  }

  // Advanced operator: SEO + AEO, strong brand consistency
  if (
    marketingChannels.includes("SEO") &&
    marketingChannels.includes("AEO") &&
    brandConsistency === "strong"
  ) {
    return 'advanced_operator';
  }

  return null;
}
