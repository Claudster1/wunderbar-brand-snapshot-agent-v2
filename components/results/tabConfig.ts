export type ResultsTab =
  | "results"
  | "foundation"
  | "strategy"
  | "standards"
  | "activation"
  | "workbook"
  | "downloads";
export type ProductTier = "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus";

export interface ResultsTabDefinition {
  id: ResultsTab;
  label: string;
  availableFrom: ProductTier;
  accentColor: string;
}

export const TIER_RANK: Record<ProductTier, number> = {
  snapshot: 0,
  "snapshot-plus": 1,
  blueprint: 2,
  "blueprint-plus": 3,
};

export const TAB_DEFINITIONS: ResultsTabDefinition[] = [
  { id: "results", label: "Results", availableFrom: "snapshot", accentColor: "#021859" },
  { id: "foundation", label: "Foundation", availableFrom: "snapshot-plus", accentColor: "#0D5BD7" },
  { id: "strategy", label: "Strategy", availableFrom: "snapshot-plus", accentColor: "#0B5FCC" },
  { id: "standards", label: "Brand Standards", availableFrom: "blueprint", accentColor: "#0F766E" },
  { id: "activation", label: "Activation", availableFrom: "snapshot-plus", accentColor: "#07B0F2" },
  { id: "workbook", label: "Workbook", availableFrom: "snapshot-plus", accentColor: "#0EA472" },
  { id: "downloads", label: "Downloads", availableFrom: "snapshot", accentColor: "#6B5BCE" },
];

export function isTabAvailable(tab: ResultsTabDefinition, tier: ProductTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[tab.availableFrom];
}

export function getAvailableTabs(tier: ProductTier): ResultsTabDefinition[] {
  return TAB_DEFINITIONS.filter((tab) => isTabAvailable(tab, tier));
}

/** Short tier label for locked tab pills (upgrade preview in sub-nav). */
export const TIER_UPGRADE_LABEL: Record<ProductTier, string> = {
  snapshot: "",
  "snapshot-plus": "Snapshot+",
  blueprint: "Blueprint",
  "blueprint-plus": "Blueprint+",
};

export function tierUpgradeLabelForTab(tab: ResultsTabDefinition): string {
  return TIER_UPGRADE_LABEL[tab.availableFrom] ?? "";
}

// ─── Strategy / Activation: which subsections render per tier ───────────────

export const STRATEGY_SECTION_IDS = [
  "positioning",
  "strategic-offer",
  "messaging-pillars",
  "archetype-voice",
  "icp-personas",
  "persona-atlas",
  "buyer-journey-map",
  "competitive-matrix",
  "channel-strategy",
  "spend-roadmap",
  "execution-priorities",
] as const;

export type StrategySectionId = (typeof STRATEGY_SECTION_IDS)[number];

export const ACTIVATION_PLAN_SECTION_IDS = [
  "audience-segments",
  "journey-orchestration",
  "competitive-motion-plan",
  "lead-magnet-planning",
  "email-lifecycle",
  "seo-aeo",
  "paid-ads",
  "thought-leadership",
  "pr-plan",
  "execution-roadmap",
] as const;

export type ActivationPlanSectionId = (typeof ACTIVATION_PLAN_SECTION_IDS)[number];

/** Strategy tab panels: free Snapshot = essentials; Snapshot+ adds journey/spend; Blueprint(+) adds Persona Atlas + competitive matrix. */
export const STRATEGY_SECTION_IDS_BY_TIER: Record<ProductTier, readonly StrategySectionId[]> = {
  snapshot: ["positioning", "messaging-pillars", "channel-strategy", "execution-priorities"],
  "snapshot-plus": [
    "positioning",
    "messaging-pillars",
    "archetype-voice",
    "icp-personas",
    "buyer-journey-map",
    "channel-strategy",
    "spend-roadmap",
    "execution-priorities",
  ],
  blueprint: [
    "positioning",
    "strategic-offer",
    "messaging-pillars",
    "archetype-voice",
    "icp-personas",
    "persona-atlas",
    "buyer-journey-map",
    "competitive-matrix",
    "channel-strategy",
    "spend-roadmap",
    "execution-priorities",
  ],
  "blueprint-plus": [
    "positioning",
    "strategic-offer",
    "messaging-pillars",
    "archetype-voice",
    "icp-personas",
    "persona-atlas",
    "buyer-journey-map",
    "competitive-matrix",
    "channel-strategy",
    "spend-roadmap",
    "execution-priorities",
  ],
};

/** Activation tab channel blocks: Snapshot+ = core channels + roadmap; Blueprint(+) adds ICP/audience, competitive motion, PR. */
export const ACTIVATION_SECTION_IDS_BY_TIER: Record<ProductTier, readonly ActivationPlanSectionId[]> = {
  snapshot: [],
  "snapshot-plus": [
    "journey-orchestration",
    "email-lifecycle",
    "seo-aeo",
    "thought-leadership",
    "paid-ads",
    "execution-roadmap",
  ],
  blueprint: [
    "audience-segments",
    "journey-orchestration",
    "competitive-motion-plan",
    "email-lifecycle",
    "seo-aeo",
    "paid-ads",
    "thought-leadership",
    "pr-plan",
    "execution-roadmap",
  ],
  "blueprint-plus": [
    "audience-segments",
    "journey-orchestration",
    "competitive-motion-plan",
    "lead-magnet-planning",
    "email-lifecycle",
    "seo-aeo",
    "paid-ads",
    "thought-leadership",
    "pr-plan",
    "execution-roadmap",
  ],
};

export function filterStrategySections<T extends { id: string }>(tier: ProductTier, sections: T[]): T[] {
  const ids = STRATEGY_SECTION_IDS_BY_TIER[tier] ?? STRATEGY_SECTION_IDS_BY_TIER.snapshot;
  const allow = new Set(ids);
  return sections.filter((s) => allow.has(s.id as StrategySectionId));
}

/** Narrative strategy blocks (outcomes, conversion, content, credibility, sales) — Snapshot+ and above. */
export function showStrategyPlanNarrativePanels(tier: ProductTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK["snapshot-plus"];
}

export function filterActivationPlanSections<T extends { id: string }>(tier: ProductTier, sections: T[]): T[] {
  const allow = new Set(ACTIVATION_SECTION_IDS_BY_TIER[tier]);
  return sections.filter((s) => allow.has(s.id as ActivationPlanSectionId));
}

/** Foundation → Audience subsections: align with Strategy (Persona Atlas = Blueprint+). */
export const FOUNDATION_AUDIENCE_SUBSECTION_IDS_BY_TIER: Record<ProductTier, readonly string[]> = {
  snapshot: [],
  "snapshot-plus": ["audience-jtbd", "audience-journey"],
  blueprint: ["audience-persona-atlas", "audience-jtbd", "audience-journey", "audience-objections"],
  "blueprint-plus": ["audience-persona-atlas", "audience-jtbd", "audience-journey", "audience-objections"],
};

/**
 * DOM `id` on Foundation (`FoundationBlueprintContent` → Voice & Expression).
 * Strategy (and other tabs) can jump here instead of repeating archetype / voice bedrock copy.
 */
export const FOUNDATION_VOICE_EXPRESSION_ANCHOR_ID = "archetype-voice";

export function filterFoundationAudienceSubsections<T extends { id: string }>(tier: ProductTier, subsections: T[]): T[] {
  const allowList = FOUNDATION_AUDIENCE_SUBSECTION_IDS_BY_TIER[tier];
  if (!Array.isArray(allowList)) {
    return filterFoundationAudienceSubsections("snapshot-plus", subsections);
  }
  if (allowList.length === 0) return [];
  const allow = new Set(allowList);
  return subsections.filter((s) => allow.has(s.id));
}

/** Normalize API/storage tier strings to tab `ProductTier`. */
export function normalizeProductTierString(raw: string): ProductTier {
  const n = raw.trim().toLowerCase().replace(/_/g, "-");
  if (n === "blueprint-plus") return "blueprint-plus";
  if (n === "blueprint") return "blueprint";
  if (n === "snapshot-plus") return "snapshot-plus";
  return "snapshot";
}

const RESULTS_TAB_IDS: readonly ResultsTab[] = [
  "results",
  "foundation",
  "strategy",
  "standards",
  "activation",
  "workbook",
  "downloads",
];

/** Deep-link helper for `/results?tab=…`. */
export function parseResultsTabId(raw: string | string[] | undefined): ResultsTab | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  return (RESULTS_TAB_IDS as readonly string[]).includes(normalized) ? (normalized as ResultsTab) : undefined;
}

export function parseActivationPlanSectionId(
  raw: string | string[] | undefined,
): ActivationPlanSectionId | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return undefined;
  return (ACTIVATION_PLAN_SECTION_IDS as readonly string[]).includes(value)
    ? (value as ActivationPlanSectionId)
    : undefined;
}
