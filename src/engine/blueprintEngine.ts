export function buildBlueprint(data: any) {
  const base: Record<string, unknown> = {
    userName: data.userName,
    businessName: data.businessName ?? data.userName,

    brandEssence: data.brandEssence ?? (data.corePurpose != null
      ? `Your brand exists to ${data.corePurpose}. You help ${data.audience} achieve ${data.transformation}. Your essence: ${data.brandEssence ?? ""}.`.trim()
      : undefined),

    brandPromise: data.brandPromise ?? (data.promise != null
      ? `You promise your customers ${data.promise}. This represents the outcome they can depend on.`.trim()
      : undefined),

    differentiation: data.differentiation ?? (data.differentiation != null && data.advantage != null
      ? `Your brand stands out because ${data.differentiation}. Your competitive advantage is ${data.advantage}.`.trim()
      : data.differentiation),

    persona: data.persona ?? (data.personaSummary != null ? { summary: data.personaSummary } : undefined),
    archetype: data.archetype ?? (data.archetypeSummary != null ? { summary: data.archetypeSummary } : undefined),

    toneOfVoice: data.toneOfVoice ?? data.toneOfVoiceList,
    messagingPillars: data.messagingPillars ?? data.pillars,
    colorPalette: data.colorPalette,
    aiPrompts: data.aiPrompts,
  };

  // Pass through foundation content when provided (merged Snapshot+ data)
  if (typeof data.brandAlignmentScore === "number") base.brandAlignmentScore = data.brandAlignmentScore;
  if (data.pillarScores && typeof data.pillarScores.positioning === "number") base.pillarScores = data.pillarScores;
  if (data.pillarInsights && typeof data.pillarInsights === "object") base.pillarInsights = data.pillarInsights;
  if (data.recommendations && typeof data.recommendations === "object") base.recommendations = data.recommendations;
  if (data.primaryPillar != null) base.primaryPillar = data.primaryPillar;
  if (typeof data.contextCoverage === "number") base.contextCoverage = data.contextCoverage;

  return base;
}


