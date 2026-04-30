import { buildPersonaPortraitSeed, dicebearPersonaPortraitUrlForPersona } from "@/lib/personaPortrait";

/** Normalize audience fields from report / workbook / enrichment (string or `{ description }`). */
export function audienceFieldToString(v: unknown): string {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const d = (v as { description?: unknown }).description;
    if (typeof d === "string" && d.trim()) return d.trim();
  }
  return "";
}

/** Cap for `additionalICPs` in narratives and Strategy UI (partners, expansion markets, etc.). */
export const MAX_ADDITIONAL_ICP_SLOTS = 8;

function asStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function joinBlocks(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join("\n\n");
}

const AUDIENCE_DEDUPE_STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "all",
  "can",
  "was",
  "our",
  "out",
  "get",
  "has",
  "how",
  "its",
  "may",
  "new",
  "now",
  "see",
  "who",
  "did",
  "let",
  "put",
  "say",
  "she",
  "too",
  "use",
  "with",
  "that",
  "this",
  "from",
  "they",
  "have",
  "been",
  "more",
  "when",
  "what",
  "your",
  "will",
  "than",
  "then",
  "them",
  "into",
  "also",
  "only",
  "most",
  "some",
  "such",
  "over",
  "after",
  "first",
  "well",
  "where",
  "much",
]);

function significantWordSet(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !AUDIENCE_DEDUPE_STOPWORDS.has(w)),
  );
}

/** True when snapshot copy repeats structured ICP (summary/name) so we can drop the duplicate paragraph. */
export function textsSubstantiallyOverlap(a: string, b: string): boolean {
  const na = a.trim().toLowerCase().replace(/\s+/g, " ");
  const nb = b.trim().toLowerCase().replace(/\s+/g, " ");
  if (!na || !nb) return false;
  if (na === nb) return true;
  const minLen = Math.min(na.length, nb.length);
  if (minLen < 14) return false;
  const short = na.length <= nb.length ? na : nb;
  const long = na.length > nb.length ? na : nb;
  if (long.includes(short) && short.length / long.length >= 0.82) return true;
  const A = significantWordSet(a);
  const B = significantWordSet(b);
  if (A.size < 4 || B.size < 4) return false;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter += 1;
  const union = A.size + B.size - inter;
  return union > 0 && inter / union >= 0.58;
}

function snapshotOverlapsIcp(snapshotParagraph: string, icp: unknown): boolean {
  if (
    !snapshotParagraph.trim() ||
    !icp ||
    typeof icp !== "object" ||
    Array.isArray(icp)
  )
    return false;
  const r = icp as Record<string, unknown>;
  for (const key of ["summary", "name", "icpLabel"] as const) {
    const t = asStr(r[key]);
    if (t && textsSubstantiallyOverlap(snapshotParagraph, t)) return true;
  }
  return false;
}

function transitionPlanHasRenderableContent(plan: unknown): boolean {
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) return false;
  const p = plan as Record<string, unknown>;
  const steps = Array.isArray(p.repositioningSteps)
    ? (p.repositioningSteps as unknown[]).filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0,
      )
    : [];
  return Boolean(
    asStr(p.currentAudience) ||
    asStr(p.idealAudience) ||
    asStr(p.gapDiagnosis) ||
    asStr(p.messagingShifts) ||
    asStr(p.channelShifts) ||
    asStr(p.timeline) ||
    steps.length > 0,
  );
}

function audiencePersonasHasRenderableBlocks(
  diagnostic: Record<string, unknown>,
): boolean {
  const apRaw = diagnostic.audiencePersonas;
  if (!apRaw || typeof apRaw !== "object" || Array.isArray(apRaw)) return false;
  const ap = apRaw as Record<string, unknown>;
  if (formatIcpDetail(ap.primaryICP, "Primary ICP")) return true;
  if (formatIcpDetail(ap.secondaryICP, "Secondary ICP")) return true;
  const add = Array.isArray(ap.additionalICPs) ? ap.additionalICPs : [];
  for (const raw of add.slice(0, MAX_ADDITIONAL_ICP_SLOTS)) {
    if (formatIcpDetail(raw, "Additional segment")) return true;
  }
  if (transitionPlanHasRenderableContent(ap.audienceTransitionPlan))
    return true;
  return false;
}

/** One ICP slot from `full_report.audiencePersonas` (Blueprint / Plus). */
export function formatIcpDetail(
  icp: unknown,
  defaultTitle: string,
): string | null {
  if (!icp || typeof icp !== "object" || Array.isArray(icp)) return null;
  const r = icp as Record<string, unknown>;
  const title = asStr(r.icpLabel) || asStr(r.name) || defaultTitle;
  const chunks: string[] = [];

  const summary = asStr(r.summary);
  if (summary) chunks.push(summary);

  const sub = joinBlocks(
    asStr(r.demographics) &&
      `Demographics / firmographics: ${asStr(r.demographics)}`,
    asStr(r.psychographics) &&
      `Mindset & motivations: ${asStr(r.psychographics)}`,
    asStr(r.goals) && `Goals: ${asStr(r.goals)}`,
    asStr(r.buyingJourney) && `Buying journey: ${asStr(r.buyingJourney)}`,
    asStr(r.languageTheyUse) &&
      `Language they use: ${asStr(r.languageTheyUse)}`,
    asStr(r.whereToBeFindable) &&
      `Where to reach them: ${asStr(r.whereToBeFindable)}`,
  );
  if (sub) chunks.push(sub);

  const pains = Array.isArray(r.painPoints)
    ? (r.painPoints as unknown[]).filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0,
      )
    : [];
  if (pains.length)
    chunks.push(`Pain points:\n${pains.map((p) => `• ${p}`).join("\n")}`);

  const obj = Array.isArray(r.objections)
    ? (r.objections as unknown[]).filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0,
      )
    : [];
  if (obj.length)
    chunks.push(`Typical objections:\n${obj.map((o) => `• ${o}`).join("\n")}`);

  if (chunks.length === 0) return null;
  return `${title}\n\n${chunks.join("\n\n")}`;
}

/** One ICP rendered as Strategy tab cards (not prose wall). */
export type StrategyIcpDetail = {
  badge: string;
  title: string;
  summary: string;
  fields: Array<{ label: string; value: string }>;
  painPoints: string[];
  objections: string[];
};

/** Intake-level audience lines (primary / secondary / tertiary). */
export type StrategyIntakeSegment = { label: string; body: string };

/** Transition plan as labeled rows for structured UI. */
export type StrategyAudienceTransitionRow = { label: string; value: string };

export function icpUnknownToStrategyDetail(
  icp: unknown,
  badge: string,
  defaultTitle: string,
): StrategyIcpDetail | null {
  if (!icp || typeof icp !== "object" || Array.isArray(icp)) return null;
  const r = icp as Record<string, unknown>;
  const title = asStr(r.icpLabel) || asStr(r.name) || defaultTitle;
  const summary = asStr(r.summary);
  const fields: Array<{ label: string; value: string }> = [];
  const push = (label: string, v: string) => {
    const t = v.trim();
    if (t) fields.push({ label, value: t });
  };
  push("Demographics / firmographics", asStr(r.demographics));
  push("Mindset & motivations", asStr(r.psychographics));
  push("Goals", asStr(r.goals));
  push("Buying journey", asStr(r.buyingJourney));
  push("Language they use", asStr(r.languageTheyUse));
  push("Where to reach them", asStr(r.whereToBeFindable));
  const painPoints = Array.isArray(r.painPoints)
    ? (r.painPoints as unknown[]).filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0,
      )
    : [];
  const objections = Array.isArray(r.objections)
    ? (r.objections as unknown[]).filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0,
      )
    : [];
  if (
    !summary &&
    fields.length === 0 &&
    painPoints.length === 0 &&
    objections.length === 0
  )
    return null;
  return {
    badge,
    title,
    summary,
    fields,
    painPoints,
    objections,
  };
}

export function audienceTransitionPlanToRows(
  plan: unknown,
  dedupeCurrentAgainst?: readonly string[],
): StrategyAudienceTransitionRow[] {
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) return [];
  const p = plan as Record<string, unknown>;
  const steps = Array.isArray(p.repositioningSteps)
    ? (p.repositioningSteps as unknown[]).filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0,
      )
    : [];
  const current = asStr(p.currentAudience);
  const skipCurrent =
    Boolean(current) &&
    Boolean(dedupeCurrentAgainst?.length) &&
    dedupeCurrentAgainst!.some(
      (d) => d.trim() && textsSubstantiallyOverlap(current, d),
    );
  const ideal = asStr(p.idealAudience);
  const skipIdeal =
    Boolean(ideal) &&
    Boolean(dedupeCurrentAgainst?.length) &&
    dedupeCurrentAgainst!.some(
      (d) => d.trim() && textsSubstantiallyOverlap(ideal, d),
    );
  const rows: StrategyAudienceTransitionRow[] = [];
  if (current && !skipCurrent) {
    rows.push({ label: "Current audience focus", value: current });
  }
  if (ideal && !skipIdeal) {
    rows.push({ label: "Ideal audience focus", value: ideal });
  }
  const gap = asStr(p.gapDiagnosis);
  if (gap) rows.push({ label: "Gap diagnosis", value: gap });
  const msg = asStr(p.messagingShifts);
  if (msg) rows.push({ label: "Messaging shifts", value: msg });
  const ch = asStr(p.channelShifts);
  if (ch) rows.push({ label: "Channel shifts", value: ch });
  const tl = asStr(p.timeline);
  if (tl) rows.push({ label: "Timeline", value: tl });
  if (steps.length > 0) {
    rows.push({
      label: "Repositioning steps",
      value: steps.map((s) => `• ${s}`).join("\n"),
    });
  }
  return rows;
}

export type StrategyAudienceProfilesUiModel = {
  /** When true, render structured layout instead of a single prose block. */
  useStructuredLayout: boolean;
  intakeSegments: StrategyIntakeSegment[];
  icpDetails: StrategyIcpDetail[];
  transitionRows: StrategyAudienceTransitionRow[];
};

/**
 * Builds data for Strategy → Audience Profiles structured cards.
 * Mirrors dedupe rules in `buildAudienceProfilesBody` so UI and prose stay aligned.
 */
export function buildStrategyAudienceProfilesUiModel(params: {
  companyName: string;
  industry: string;
  audienceShort: string;
  targetAudience: string;
  diagnostic: Record<string, unknown>;
}): StrategyAudienceProfilesUiModel {
  const { companyName, industry, audienceShort, targetAudience, diagnostic } =
    params;
  const primary =
    typeof targetAudience === "string" ? targetAudience.trim() : "";
  const secondary =
    audienceFieldToString(diagnostic.secondaryAudience) ||
    audienceFieldToString(diagnostic.secondary_audience);
  const tertiary =
    audienceFieldToString(diagnostic.tertiaryAudience) ||
    audienceFieldToString(diagnostic.tertiary_audience);

  const apRaw = diagnostic.audiencePersonas;
  const ap =
    apRaw && typeof apRaw === "object" && !Array.isArray(apRaw)
      ? (apRaw as Record<string, unknown>)
      : null;

  const includePrimary =
    Boolean(primary) &&
    !(
      ap &&
      ((snapshotOverlapsIcp(primary, ap.primaryICP) &&
        icpHasRenderableDetail(ap.primaryICP)) ||
        (snapshotOverlapsIcp(primary, ap.secondaryICP) &&
          icpHasRenderableDetail(ap.secondaryICP)))
    );
  const includeSecondary =
    Boolean(secondary) &&
    !(
      ap &&
      ((snapshotOverlapsIcp(secondary, ap.secondaryICP) &&
        icpHasRenderableDetail(ap.secondaryICP)) ||
        (snapshotOverlapsIcp(secondary, ap.primaryICP) &&
          icpHasRenderableDetail(ap.primaryICP)))
    );
  const includeTertiary =
    Boolean(tertiary) && !(ap && tertiaryOverlapsStructuredIcp(tertiary, ap));

  const intakeSegments: StrategyIntakeSegment[] = [];
  if (includePrimary && primary) {
    intakeSegments.push({ label: "Primary audience (from intake)", body: primary });
  }
  if (includeSecondary && secondary) {
    intakeSegments.push({
      label: "Secondary audience",
      body: secondary,
    });
  }
  if (includeTertiary && tertiary) {
    intakeSegments.push({ label: "Additional segment", body: tertiary });
  }

  const icpDetails: StrategyIcpDetail[] = [];
  if (ap) {
    const a = icpUnknownToStrategyDetail(ap.primaryICP, "Primary", "Primary ICP");
    if (a) icpDetails.push(a);
    const b = icpUnknownToStrategyDetail(
      ap.secondaryICP,
      "Secondary",
      "Secondary ICP",
    );
    if (b) icpDetails.push(b);
    const add = Array.isArray(ap.additionalICPs) ? ap.additionalICPs : [];
    for (const raw of add.slice(0, MAX_ADDITIONAL_ICP_SLOTS)) {
      const d = icpUnknownToStrategyDetail(raw, "Also consider", "Segment");
      if (d) icpDetails.push(d);
    }
  }

  const transitionDedupe: string[] = [];
  if (includePrimary && primary) transitionDedupe.push(primary);
  if (includeSecondary && secondary) transitionDedupe.push(secondary);
  if (includeTertiary && tertiary) transitionDedupe.push(tertiary);
  transitionDedupe.push(...collectIcpDedupeStrings(ap ?? {}));

  const transitionRows = ap
    ? audienceTransitionPlanToRows(
        ap.audienceTransitionPlan,
        transitionDedupe,
      )
    : [];

  /** Structured cards when report ICPs or transition plan exist; plain intake-only stays on prose. */
  const useStructuredLayout =
    icpDetails.length > 0 || transitionRows.length > 0;

  if (!useStructuredLayout) {
    return {
      useStructuredLayout: false,
      intakeSegments: [],
      icpDetails: [],
      transitionRows: [],
    };
  }

  return {
    useStructuredLayout: true,
    intakeSegments,
    icpDetails,
    transitionRows,
  };
}

export function formatAudienceTransitionPlan(
  plan: unknown,
  dedupeCurrentAgainst?: readonly string[],
): string | null {
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) return null;
  const p = plan as Record<string, unknown>;
  const steps = Array.isArray(p.repositioningSteps)
    ? (p.repositioningSteps as unknown[]).filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0,
      )
    : [];
  const current = asStr(p.currentAudience);
  const skipCurrent =
    Boolean(current) &&
    Boolean(dedupeCurrentAgainst?.length) &&
    dedupeCurrentAgainst!.some(
      (d) => d.trim() && textsSubstantiallyOverlap(current, d),
    );
  const ideal = asStr(p.idealAudience);
  const skipIdeal =
    Boolean(ideal) &&
    Boolean(dedupeCurrentAgainst?.length) &&
    dedupeCurrentAgainst!.some(
      (d) => d.trim() && textsSubstantiallyOverlap(ideal, d),
    );

  const body = joinBlocks(
    current && !skipCurrent && `Current audience focus: ${current}`,
    ideal && !skipIdeal && `Ideal audience focus: ${ideal}`,
    asStr(p.gapDiagnosis) && `Gap diagnosis: ${asStr(p.gapDiagnosis)}`,
    asStr(p.messagingShifts) && `Messaging shifts: ${asStr(p.messagingShifts)}`,
    asStr(p.channelShifts) && `Channel shifts: ${asStr(p.channelShifts)}`,
    asStr(p.timeline) && `Timeline: ${asStr(p.timeline)}`,
    steps.length > 0 &&
      `Repositioning steps:\n${steps.map((s) => `• ${s}`).join("\n")}`,
  );
  return body || null;
}

function icpHasRenderableDetail(icp: unknown): boolean {
  return formatIcpDetail(icp, "ICP") !== null;
}

function tertiaryOverlapsStructuredIcp(
  tertiary: string,
  ap: Record<string, unknown>,
): boolean {
  if (!tertiary.trim()) return false;
  if (
    snapshotOverlapsIcp(tertiary, ap.primaryICP) &&
    icpHasRenderableDetail(ap.primaryICP)
  )
    return true;
  if (
    snapshotOverlapsIcp(tertiary, ap.secondaryICP) &&
    icpHasRenderableDetail(ap.secondaryICP)
  )
    return true;
  const add = Array.isArray(ap.additionalICPs) ? ap.additionalICPs : [];
  for (const raw of add.slice(0, MAX_ADDITIONAL_ICP_SLOTS)) {
    if (snapshotOverlapsIcp(tertiary, raw) && icpHasRenderableDetail(raw))
      return true;
  }
  return false;
}

function collectIcpDedupeStrings(ap: Record<string, unknown>): string[] {
  const out: string[] = [];
  const additional = Array.isArray(ap.additionalICPs)
    ? ap.additionalICPs.slice(0, MAX_ADDITIONAL_ICP_SLOTS)
    : [];
  for (const icp of [ap.primaryICP, ap.secondaryICP, ...additional]) {
    if (!icp || typeof icp !== "object" || Array.isArray(icp)) continue;
    const r = icp as Record<string, unknown>;
    for (const key of ["icpLabel", "name", "summary"] as const) {
      const t = asStr(r[key]);
      if (t) out.push(t);
    }
  }
  return out;
}

/** Append structured ICP + transition content when `audiencePersonas` exists on diagnostic. */
export function appendAudiencePersonasFromReport(
  baseBody: string,
  diagnostic: Record<string, unknown>,
  transitionDedupeAgainst?: string[],
): string {
  const apRaw = diagnostic.audiencePersonas;
  if (!apRaw || typeof apRaw !== "object" || Array.isArray(apRaw))
    return baseBody;
  const ap = apRaw as Record<string, unknown>;

  const extras: string[] = [];

  const primary = formatIcpDetail(ap.primaryICP, "Primary ICP");
  if (primary) extras.push(primary);

  const secondary = formatIcpDetail(ap.secondaryICP, "Secondary ICP");
  if (secondary) extras.push(secondary);

  const add = Array.isArray(ap.additionalICPs) ? ap.additionalICPs : [];
  for (const raw of add.slice(0, MAX_ADDITIONAL_ICP_SLOTS)) {
    const block = formatIcpDetail(raw, "Additional segment");
    if (block) extras.push(block);
  }

  const dedupeTransition = [
    ...(transitionDedupeAgainst ?? []),
    ...collectIcpDedupeStrings(ap),
  ];
  const transition = formatAudienceTransitionPlan(
    ap.audienceTransitionPlan,
    dedupeTransition,
  );
  if (transition) {
    extras.push(`Audience transition plan\n\n${transition}`);
  }

  if (extras.length === 0) return baseBody;
  return joinBlocks(baseBody, extras.join("\n\n"));
}

function formatOneBuyerPersona(raw: unknown, index: number): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const p = raw as Record<string, unknown>;
  const name = asStr(p.personaName) || `Persona ${index + 1}`;
  const body = joinBlocks(
    asStr(p.icpAlignment) && `ICP alignment: ${asStr(p.icpAlignment)}`,
    asStr(p.role) && `Role: ${asStr(p.role)}`,
    asStr(p.coreFrustration) && `Core frustration: ${asStr(p.coreFrustration)}`,
    asStr(p.primaryMotivation) &&
      `Primary motivation: ${asStr(p.primaryMotivation)}`,
    asStr(p.decisionStyle) && `Decision style: ${asStr(p.decisionStyle)}`,
    asStr(p.informationSources) &&
      `Information sources: ${asStr(p.informationSources)}`,
    asStr(p.messagingAngle) && `Messaging angle: ${asStr(p.messagingAngle)}`,
    asStr(p.contentPreferences) &&
      `Content preferences: ${asStr(p.contentPreferences)}`,
    Array.isArray(p.channelPriority) && p.channelPriority.length > 0
      ? `Channel priority: ${(p.channelPriority as unknown[]).filter((x): x is string => typeof x === "string").join(", ")}`
      : undefined,
    (() => {
      const o = p.objectionAndResponse as Record<string, unknown> | undefined;
      if (!o) return undefined;
      const ox = asStr(o.objection);
      const resp = asStr(o.response);
      if (!ox && !resp) return undefined;
      return joinBlocks(
        ox && `Likely objection: ${ox}`,
        resp && `Recommended response: ${resp}`,
      );
    })(),
    asStr(p.sampleHeadline) && `Sample headline: ${asStr(p.sampleHeadline)}`,
    asStr(p.sampleCTA) && `Sample CTA: ${asStr(p.sampleCTA)}`,
  );
  if (!body) return null;
  return `${name}\n\n${body}`;
}

/** Role-level buyer persona as Strategy tab cards. */
export type StrategyBuyerPersonaCard = {
  title: string;
  subtitle: string;
  rows: Array<{ label: string; value: string }>;
  /** Same deterministic Notionists avatars as Foundation Persona Atlas */
  portraitSrc: string;
  portraitAlt: string;
};

export type StrategyPersonaCardsContext = {
  reportId?: string;
  companyName?: string;
  /** Used to pick B2B- vs B2C-leaning portrait styles and background tints */
  diagnostic?: Record<string, unknown> | null;
};

export function buyerPersonasToStrategyCards(
  list: unknown,
  ctx?: StrategyPersonaCardsContext,
): StrategyBuyerPersonaCard[] {
  if (!Array.isArray(list) || list.length === 0) return [];
  const out: StrategyBuyerPersonaCard[] = [];
  for (let i = 0; i < list.length && i < 8; i++) {
    const raw = list[i];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const p = raw as Record<string, unknown>;
    const title = asStr(p.personaName) || `Persona ${i + 1}`;
    const subtitle =
      [asStr(p.role), asStr(p.icpAlignment)].filter(Boolean).join(" · ") ||
      "Buyer role";
    const roleForSeed =
      asStr(p.role) || asStr(p.jobTitle) || asStr(p.icpAlignment) || subtitle.split(" · ")[0] || "Decision maker";
    const seed = buildPersonaPortraitSeed({
      reportId: ctx?.reportId,
      companyName: ctx?.companyName?.trim() ?? "",
      personaName: title,
      role: roleForSeed,
      index: i,
    });
    const rows: Array<{ label: string; value: string }> = [];
    const add = (label: string, v: string) => {
      const t = v.trim();
      if (t) rows.push({ label, value: t });
    };
    add("Core frustration", asStr(p.coreFrustration));
    add("Primary motivation", asStr(p.primaryMotivation));
    add("Decision style", asStr(p.decisionStyle));
    add("Information sources", asStr(p.informationSources));
    add("Messaging angle", asStr(p.messagingAngle));
    add("Content preferences", asStr(p.contentPreferences));
    if (Array.isArray(p.channelPriority) && p.channelPriority.length > 0) {
      const ch = (p.channelPriority as unknown[])
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .join(", ");
      if (ch) rows.push({ label: "Channel priority", value: ch });
    }
    const o = p.objectionAndResponse as Record<string, unknown> | undefined;
    if (o) {
      add("Likely objection", asStr(o.objection));
      add("Recommended response", asStr(o.response));
    }
    add("Sample headline", asStr(p.sampleHeadline));
    add("Sample CTA", asStr(p.sampleCTA));
    if (rows.length === 0 && !asStr(p.personaName)) continue;
    out.push({
      title,
      subtitle,
      rows,
      portraitSrc: dicebearPersonaPortraitUrlForPersona({
        seed,
        index: i,
        diagnostic: ctx?.diagnostic,
        personaName: title,
        personaRecord: p,
      }),
      portraitAlt: `Illustrated persona: ${title} (${roleForSeed})`,
    });
  }
  return out;
}

export function formatBuyerPersonasDeep(list: unknown): string | null {
  if (!Array.isArray(list) || list.length === 0) return null;
  const blocks = list
    .slice(0, 8)
    .map((raw, i) => formatOneBuyerPersona(raw, i))
    .filter((x): x is string => Boolean(x));
  if (blocks.length === 0) return null;
  return `Role-level profiles (from your deliverable)\n\n${blocks.join("\n\n—\n\n")}`;
}

/** Customer Profiles panel: summary line + rich buyer persona rows when present. */
export function buildCustomerProfilesDeepBody(params: {
  personaAtlasSummary: string;
  buyerPersonas: unknown;
  companyName: string;
  audienceShort: string;
}): string {
  try {
    const summary = params.personaAtlasSummary.trim();
    const deep = formatBuyerPersonasDeep(params.buyerPersonas);
    const fallback = `${params.companyName} should define a primary customer profile for ${params.audienceShort}, plus 1–2 secondary buyer roles. For each: jobs-to-be-done, top objections, decision criteria, and preferred channels.`;

    if (summary && deep) {
      const first = Array.isArray(params.buyerPersonas)
        ? params.buyerPersonas[0]
        : null;
      if (first && typeof first === "object" && !Array.isArray(first)) {
        const r = first as Record<string, unknown>;
        const personaHook = [
          asStr(r.personaName),
          asStr(r.messagingAngle),
          asStr(r.coreFrustration),
        ]
          .filter(Boolean)
          .join("\n");
        if (
          personaHook.length >= 14 &&
          textsSubstantiallyOverlap(summary, personaHook)
        ) {
          return deep;
        }
      }
      return joinBlocks(summary, deep);
    }
    if (deep) return deep;
    if (summary) return summary;
    return fallback;
  } catch (err) {
    console.error("[strategy] buildCustomerProfilesDeepBody failed", err);
    return `${params.companyName} should define a primary customer profile for ${params.audienceShort}, plus 1–2 secondary buyer roles. For each: jobs-to-be-done, top objections, decision criteria, and preferred channels.`;
  }
}

export function buildAudienceProfilesBody(params: {
  companyName: string;
  industry: string;
  audienceShort: string;
  targetAudience: string;
  diagnostic: Record<string, unknown>;
}): string {
  try {
    const { companyName, industry, audienceShort, targetAudience, diagnostic } =
      params;
    const primary =
      typeof targetAudience === "string" ? targetAudience.trim() : "";
    const secondary =
      audienceFieldToString(diagnostic.secondaryAudience) ||
      audienceFieldToString(diagnostic.secondary_audience);
    const tertiary =
      audienceFieldToString(diagnostic.tertiaryAudience) ||
      audienceFieldToString(diagnostic.tertiary_audience);

    const apRaw = diagnostic.audiencePersonas;
    const ap =
      apRaw && typeof apRaw === "object" && !Array.isArray(apRaw)
        ? (apRaw as Record<string, unknown>)
        : null;

    const includePrimary =
      Boolean(primary) &&
      !(
        ap &&
        ((snapshotOverlapsIcp(primary, ap.primaryICP) &&
          icpHasRenderableDetail(ap.primaryICP)) ||
          (snapshotOverlapsIcp(primary, ap.secondaryICP) &&
            icpHasRenderableDetail(ap.secondaryICP)))
      );
    const includeSecondary =
      Boolean(secondary) &&
      !(
        ap &&
        ((snapshotOverlapsIcp(secondary, ap.secondaryICP) &&
          icpHasRenderableDetail(ap.secondaryICP)) ||
          (snapshotOverlapsIcp(secondary, ap.primaryICP) &&
            icpHasRenderableDetail(ap.primaryICP)))
      );
    const includeTertiary =
      Boolean(tertiary) && !(ap && tertiaryOverlapsStructuredIcp(tertiary, ap));

    const parts: string[] = [];
    if (includePrimary && primary) parts.push(primary);
    if (includeSecondary && secondary) {
      parts.push(
        `Secondary audience (supporting readers, partners, or later-stage buyers—typically lower messaging weight than primary, but still needs coherent proof and CTAs):\n\n${secondary}`,
      );
    }
    if (includeTertiary && tertiary) {
      parts.push(`Additional segment:\n\n${tertiary}`);
    }
    const base =
      parts.length > 0
        ? parts.join("\n\n")
        : `${companyName}'s highest-fit profile should name a primary buyer, any secondary audience, and influencer or blocker roles so your offer and proof sequence match real buying behavior in ${industry}. Until populated, center narrative on ${audienceShort}.`;

    const transitionDedupe: string[] = [];
    if (includePrimary && primary) transitionDedupe.push(primary);
    if (includeSecondary && secondary) transitionDedupe.push(secondary);
    if (includeTertiary && tertiary) transitionDedupe.push(tertiary);

    return appendAudiencePersonasFromReport(base, diagnostic, transitionDedupe);
  } catch (err) {
    console.error("[strategy] buildAudienceProfilesBody failed", err);
    return `${params.companyName}'s highest-fit profile should name a primary buyer, any secondary audience, and influencer or blocker roles so your offer and proof sequence match real buying behavior in ${params.industry}. Until populated, center narrative on ${params.audienceShort}.`;
  }
}
