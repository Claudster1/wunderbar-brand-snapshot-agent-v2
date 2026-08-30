/**
 * Local WunderBrand persona illustration library.
 * Files live in `public/assets/persona-portraits/`.
 * Role keywords map report personas onto a reusable archetype cast.
 */

import {
  inferPersonaPortraitGender,
  type PersonaPortraitGenderHint,
} from "@/lib/personaPortrait";

export type PersonaArchetypeId =
  | "wb-econ-buyer"
  | "wb-exec-sponsor"
  | "wb-func-champion"
  | "wb-ops-owner"
  | "wb-tech-eval"
  | "wb-rev-lead"
  | "wb-people-ops"
  | "wb-practitioner"
  | "wb-procurement"
  | "wb-partner"
  | "wb-primary-shopper"
  | "wb-value-buyer"
  | "wb-premium-buyer"
  | "wb-parent"
  | "wb-life-pro"
  | "wb-wellness"
  | "wb-local"
  | "wb-gift"
  | "wb-founder"
  | "wb-smb-owner"
  | "wb-senior"
  | "wb-youth";

/** Archetypes that currently have both A (default) and B (alt) variants on disk. */
const VARIANTS_WITH_B = new Set<PersonaArchetypeId>([
  "wb-econ-buyer",
  "wb-exec-sponsor",
  "wb-func-champion",
  "wb-tech-eval",
  "wb-rev-lead",
  "wb-founder",
  "wb-smb-owner",
  "wb-senior",
]);

const ROLE_RULES: Array<{ id: PersonaArchetypeId; pattern: RegExp }> = [
  { id: "wb-econ-buyer", pattern: /\b(cfo|finance|budget|economic buyer|payback|controller|treasurer)\b/i },
  { id: "wb-exec-sponsor", pattern: /\b(ceo|executive sponsor|general manager|\bgm\b|managing director)\b/i },
  { id: "wb-founder", pattern: /\b(founder|co-?founder|startup)\b/i },
  { id: "wb-smb-owner", pattern: /\b(smb|small business|owner-?operator|solopreneur|shop owner)\b/i },
  { id: "wb-func-champion", pattern: /\b(cmo|marketing|growth|brand|demand gen|demand-gen)\b/i },
  { id: "wb-ops-owner", pattern: /\b(operations|vp ops|head of ops|delivery|coo)\b/i },
  { id: "wb-tech-eval", pattern: /\b(cto|revops|rev ops|it\b|technical|systems|integration|engineering)\b/i },
  { id: "wb-rev-lead", pattern: /\b(cro|sales|revenue|account executive|\bae\b)\b/i },
  { id: "wb-people-ops", pattern: /\b(chro|people ops|human resources|\bhr\b|chief of staff)\b/i },
  { id: "wb-procurement", pattern: /\b(procurement|purchasing|legal|security|compliance|risk|gatekeeper)\b/i },
  { id: "wb-partner", pattern: /\b(partner|reseller|agency|franchise|channel)\b/i },
  { id: "wb-parent", pattern: /\b(parent|caregiver|mom|dad|mother|father)\b/i },
  { id: "wb-wellness", pattern: /\b(health|wellness|patient|fitness)\b/i },
  { id: "wb-premium-buyer", pattern: /\b(premium|aspirational|luxury|high-?end)\b/i },
  { id: "wb-value-buyer", pattern: /\b(value-conscious|budget-conscious|price-sensitive|frugal)\b/i },
  { id: "wb-primary-shopper", pattern: /\b(shopper|household|consumer|buyer)\b/i },
  { id: "wb-local", pattern: /\b(local|community|neighborhood|hospitality)\b/i },
  { id: "wb-gift", pattern: /\b(gift|occasion|seasonal)\b/i },
  { id: "wb-senior", pattern: /\b(senior|retiree|older adult|accessibility)\b/i },
  { id: "wb-youth", pattern: /\b(gen ?z|youth|student|early[- ]career|next-gen)\b/i },
  { id: "wb-life-pro", pattern: /\b(professional|career|individual contributor|\bic\b)\b/i },
  { id: "wb-practitioner", pattern: /\b(practitioner|end[- ]user|specialist|coordinator|manager)\b/i },
];

const FALLBACK_BY_CONTEXT: Record<"b2b" | "b2c" | "unknown", PersonaArchetypeId[]> = {
  b2b: ["wb-func-champion", "wb-econ-buyer", "wb-practitioner", "wb-tech-eval", "wb-ops-owner"],
  b2c: ["wb-primary-shopper", "wb-value-buyer", "wb-parent", "wb-life-pro", "wb-premium-buyer"],
  unknown: ["wb-func-champion", "wb-smb-owner", "wb-practitioner", "wb-founder", "wb-econ-buyer"],
};

function hashToUint(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function personaPortraitPublicPath(id: PersonaArchetypeId, variant: "a" | "b" = "a"): string {
  return `/assets/persona-portraits/wunderbar-persona-${id}-${variant}.png`;
}

export function resolvePersonaArchetypeId(params: {
  role: string;
  personaName?: string;
  index?: number;
  audienceKind?: "b2b" | "b2c" | "unknown";
}): PersonaArchetypeId {
  const corpus = `${params.role} ${params.personaName ?? ""}`.trim();
  for (const rule of ROLE_RULES) {
    if (rule.pattern.test(corpus)) return rule.id;
  }
  const kind = params.audienceKind ?? "unknown";
  const pool = FALLBACK_BY_CONTEXT[kind];
  const idx = Math.abs(params.index ?? 0) % pool.length;
  return pool[idx]!;
}

function pickVariant(params: {
  archetypeId: PersonaArchetypeId;
  gender: PersonaPortraitGenderHint;
  seedKey: string;
}): "a" | "b" {
  if (!VARIANTS_WITH_B.has(params.archetypeId)) return "a";
  if (params.gender === "male") return "b";
  if (params.gender === "female") return "a";
  return hashToUint(params.seedKey) % 2 === 0 ? "a" : "b";
}

/**
 * Prefer local WunderBrand illustrations; callers may still fall back to DiceBear if null.
 */
export function resolveLocalPersonaPortraitSrc(params: {
  role: string;
  personaName?: string;
  index?: number;
  audienceKind?: "b2b" | "b2c" | "unknown";
  personaRecord?: Record<string, unknown> | null;
  seedKey?: string;
}): { src: string; archetypeId: PersonaArchetypeId; variant: "a" | "b"; remote: false } {
  const archetypeId = resolvePersonaArchetypeId({
    role: params.role,
    personaName: params.personaName,
    index: params.index,
    audienceKind: params.audienceKind,
  });
  const gender = inferPersonaPortraitGender({
    personaName: params.personaName?.trim() ?? "",
    personaRecord: params.personaRecord,
  });
  const variant = pickVariant({
    archetypeId,
    gender,
    seedKey: params.seedKey ?? `${params.role}|${params.personaName ?? ""}|${params.index ?? 0}`,
  });
  return {
    src: personaPortraitPublicPath(archetypeId, variant),
    archetypeId,
    variant,
    remote: false,
  };
}
