export type ArchetypeConfidence = "high" | "medium" | "low";

type InferredArchetype = {
  likelyArchetype: string | null;
  archetypeConfidence: ArchetypeConfidence | null;
};

const ARCHETYPE_MEANINGS: Record<string, string> = {
  Sage: "Seeks truth and clarity, building trust through insight, expertise, and thoughtful guidance.",
  Hero: "Motivates action through courage, progress, and high standards for performance.",
  Outlaw: "Challenges convention and reframes the category with bold, nontraditional positioning.",
  Magician: "Transforms complex problems into meaningful outcomes through vision and possibility.",
  Lover: "Builds deep connection through emotion, experience, and strong relational resonance.",
  Caregiver: "Leads with service, support, and reliability, creating safety and long-term trust.",
  Ruler: "Signals authority and excellence through structure, standards, and decisive leadership.",
  Creator: "Expresses originality and craft, turning ideas into distinctive, high-value experiences.",
  Innocent: "Emphasizes simplicity, optimism, and honesty to create confidence and ease.",
  Explorer: "Represents freedom and discovery, inviting people into growth and new possibilities.",
  Neighbor: "Feels practical, approachable, and human, winning trust through relatability.",
  Entertainer: "Captures attention with energy and delight, making the brand memorable and engaging.",
};

const ARCHETYPE_ICONS: Record<string, string> = {
  Sage: "🧠",
  Hero: "🛡️",
  Outlaw: "🔥",
  Magician: "✨",
  Lover: "💖",
  Caregiver: "🤝",
  Ruler: "👑",
  Creator: "🎨",
  Innocent: "🌤️",
  Explorer: "🧭",
  Neighbor: "🏡",
  Entertainer: "🎭",
};

const ARCHETYPE_KEYWORDS: Record<string, string[]> = {
  Sage: ["expert", "insight", "educate", "analysis", "clarity", "authority", "evidence"],
  Hero: ["bold", "performance", "win", "challenge", "achieve", "results", "overcome"],
  Outlaw: ["disrupt", "break", "challenge status quo", "rebel", "nontraditional", "different"],
  Magician: ["transform", "breakthrough", "possibility", "reinvent", "innovation", "visionary"],
  Lover: ["relationship", "care", "connection", "experience", "intimacy", "elegant", "premium"],
  Caregiver: ["support", "help", "nurture", "service", "protect", "compassion", "reliable"],
  Ruler: ["premium", "leader", "control", "structure", "standards", "authority", "elite"],
  Creator: ["creative", "design", "original", "craft", "expression", "innovation", "imagination"],
  Innocent: ["simple", "honest", "clean", "trust", "optimistic", "pure", "straightforward"],
  Explorer: ["freedom", "adventure", "discovery", "independent", "new", "journey", "bold move"],
  Neighbor: ["community", "approachable", "practical", "everyday", "real", "friendly", "accessible"],
  Entertainer: ["fun", "playful", "energy", "charisma", "humor", "engaging", "delight"],
};

function normalizedText(input: unknown): string {
  if (typeof input === "string") return input.toLowerCase();
  if (Array.isArray(input)) {
    return input.map((item) => (typeof item === "string" ? item.toLowerCase() : "")).join(" ");
  }
  return "";
}

export function inferLikelyArchetype(answers: Record<string, unknown>): InferredArchetype {
  const directSignals = [
    answers.decisionStyle,
    answers.authoritySource,
    answers.riskOrientation,
    answers.customerExpectation,
    answers.archetype_reputation_goal,
    answers.archetype_avoid_pattern,
  ];
  const words = normalizedText(answers.brandPersonalityWords);
  const signalsRaw =
    answers.archetypeSignals && typeof answers.archetypeSignals === "object"
      ? (answers.archetypeSignals as Record<string, unknown>)
      : {};
  const signals = normalizedText([
    signalsRaw.decisionStyle,
    signalsRaw.authoritySource,
    signalsRaw.riskOrientation,
    signalsRaw.customerExpectation,
    signalsRaw.reputationGoal,
    signalsRaw.avoidPattern,
    ...directSignals,
  ]);

  const corpus = `${words} ${signals}`.trim();
  if (!corpus) return { likelyArchetype: null, archetypeConfidence: null };

  const scores = Object.entries(ARCHETYPE_KEYWORDS).map(([name, keywords]) => {
    let score = 0;
    for (const keyword of keywords) {
      if (corpus.includes(keyword)) score += 1;
    }
    return { name, score };
  });

  scores.sort((a, b) => b.score - a.score);
  const top = scores[0];
  const second = scores[1];

  if (!top || top.score <= 0) {
    return { likelyArchetype: null, archetypeConfidence: "low" };
  }

  const gap = top.score - (second?.score ?? 0);
  const evidence = top.score;
  const confidence: ArchetypeConfidence =
    evidence >= 3 && gap >= 2 ? "high" : evidence >= 2 ? "medium" : "low";

  return {
    likelyArchetype: top.name,
    archetypeConfidence: confidence,
  };
}

export function getArchetypeMeaning(archetype: string | null | undefined): string | null {
  if (!archetype) return null;
  return ARCHETYPE_MEANINGS[archetype] ?? null;
}

export function getArchetypeIcon(archetype: string | null | undefined): string {
  if (!archetype) return "🔎";
  return ARCHETYPE_ICONS[archetype] ?? "🔎";
}
