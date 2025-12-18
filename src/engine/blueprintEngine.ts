export function buildBlueprint(data) {
  return {
    userName: data.userName,

    brandEssence: `
Your brand exists to ${data.corePurpose}.
You help ${data.audience} achieve ${data.transformation}.
Your essence: ${data.brandEssence}.
    `.trim(),

    brandPromise: `
You promise your customers ${data.promise}.
This represents the outcome they can depend on.
    `.trim(),

    differentiation: `
Your brand stands out because ${data.differentiation}.
Your competitive advantage is ${data.advantage}.
    `.trim(),

    persona: {
      summary: data.personaSummary,
    },

    archetype: {
      summary: data.archetypeSummary,
    },

    toneOfVoice: data.toneOfVoiceList,

    messagingPillars: data.pillars,

    colorPalette: data.colorPalette,

    aiPrompts: data.aiPrompts,
  };
}


