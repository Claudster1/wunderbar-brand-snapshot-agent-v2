/** Shared shape for primary + secondary brand archetype pairing in suite reports. */

export type ArchetypeDetail = {
  name: string;
  whenAligned: string;
  riskIfMisused: string;
  languageTone: string;
  behaviorGuide: string;
};

/**
 * How the two archetypes should show up together for THIS business —
 * not a second definition of each archetype, but an implementation split.
 */
export type ArchetypeCombinedImplementation = {
  /** One sentence: Primary owns X; Secondary owns Y for this brand. */
  oneLiner: string;
  /** Surfaces / moments where primary should lead (hero, pitch, ads…). */
  leadWithPrimary: string[];
  /** Surfaces / moments where secondary should lead (nurture, CS, proof…). */
  leanOnSecondary: string[];
  /** Anti-patterns — where mixing both in the same beat confuses buyers. */
  neverMix: string[];
  /** Concrete first move this week that uses the pair correctly. */
  weekOneMove: string;
};

export type BrandArchetypeSystem = {
  primary: ArchetypeDetail;
  secondary: ArchetypeDetail;
  howTheyWorkTogether: string;
  combinedImplementation?: ArchetypeCombinedImplementation | null;
};

function asTrimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asTrimmed(item)).filter(Boolean);
}

function asArchetypeDetail(raw: unknown, fallbackName = ""): ArchetypeDetail {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    name: asTrimmed(obj.name) || fallbackName,
    whenAligned: asTrimmed(obj.whenAligned) || asTrimmed(obj.alignedSignal),
    riskIfMisused: asTrimmed(obj.riskIfMisused) || asTrimmed(obj.misusedRisk),
    languageTone: asTrimmed(obj.languageTone),
    behaviorGuide: asTrimmed(obj.behaviorGuide),
  };
}

function asCombinedImplementation(raw: unknown): ArchetypeCombinedImplementation | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const oneLiner = asTrimmed(obj.oneLiner);
  const leadWithPrimary = asStringList(obj.leadWithPrimary);
  const leanOnSecondary = asStringList(obj.leanOnSecondary);
  const neverMix = asStringList(obj.neverMix);
  const weekOneMove = asTrimmed(obj.weekOneMove);
  if (!oneLiner && leadWithPrimary.length === 0 && leanOnSecondary.length === 0) return null;
  return { oneLiner, leadWithPrimary, leanOnSecondary, neverMix, weekOneMove };
}

/**
 * Pull brandArchetypeSystem from a stored report / full_report blob.
 * Tolerates nested full_report and partial legacy shapes.
 */
export function extractBrandArchetypeSystem(
  report: Record<string, unknown> | null | undefined,
  fallbackPrimaryName = "",
  fallbackSecondaryName = "",
): BrandArchetypeSystem | null {
  if (!report) return null;
  const full =
    report.full_report && typeof report.full_report === "object"
      ? (report.full_report as Record<string, unknown>)
      : report;
  const raw =
    full.brandArchetypeSystem ??
    report.brandArchetypeSystem ??
    (full as { brand_archetype_system?: unknown }).brand_archetype_system;
  if (!raw || typeof raw !== "object") {
    if (!fallbackPrimaryName && !fallbackSecondaryName) return null;
    return {
      primary: asArchetypeDetail({}, fallbackPrimaryName),
      secondary: asArchetypeDetail({}, fallbackSecondaryName),
      howTheyWorkTogether: "",
      combinedImplementation: null,
    };
  }
  const system = raw as Record<string, unknown>;
  const primary = asArchetypeDetail(system.primary, fallbackPrimaryName);
  const secondary = asArchetypeDetail(system.secondary, fallbackSecondaryName);
  return {
    primary,
    secondary,
    howTheyWorkTogether: asTrimmed(system.howTheyWorkTogether),
    combinedImplementation: asCombinedImplementation(system.combinedImplementation),
  };
}

/** Fallback when older reports lack combinedImplementation but have howTheyWorkTogether. */
export function fallbackCombinedImplementation(
  system: BrandArchetypeSystem,
  brandName: string,
): ArchetypeCombinedImplementation {
  if (system.combinedImplementation) return system.combinedImplementation;
  const primary = system.primary.name || "Primary";
  const secondary = system.secondary.name || "Secondary";
  const blend = system.howTheyWorkTogether;
  return {
    oneLiner:
      blend ||
      `For ${brandName}: lead with ${primary} on first impressions; let ${secondary} shape relationship and follow-through.`,
    leadWithPrimary: [
      `Homepage hero and category claim (${primary})`,
      `Sales openers and proposal framing (${primary})`,
      `Paid ads that introduce who you are (${primary})`,
    ],
    leanOnSecondary: [
      `Nurture email and onboarding (${secondary})`,
      `Proof, case studies, and customer success moments (${secondary})`,
      `Support and renewal conversations (${secondary})`,
    ],
    neverMix: [
      `Don't soft-pedal the hero with ${secondary} warmth — claim first, then care`,
      `Don't open nurture with pure ${primary} authority and no human follow-through`,
    ],
    weekOneMove: `Rewrite one hero line in ${primary} voice and one nurture subject in ${secondary} voice — same promise, different beat.`,
  };
}
