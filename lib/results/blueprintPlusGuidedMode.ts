/**
 * Blueprint+ Guided vs Reference consumption mode.
 * Guided = Start Here + shorter Strategy/Activation path; Reference = full library.
 */

import type { ActivationPlanSectionId, ResultsTab, StrategySectionId } from "@/components/results/tabConfig";
import { buildGoogleBusinessPasteFields } from "@/lib/activation/googleBusinessProfilePaste";
import { activationNavLabel } from "@/lib/activation/activationNavModel";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type BlueprintPlusViewMode = "guided" | "reference";

export type BlueprintPlusStartHereRole = "founder" | "marketing" | "sales" | "design";

export type BlueprintPlusStartHereMove = {
  id: string;
  title: string;
  detail: string;
  tab: ResultsTab;
  /** DOM id / section chip target when known. */
  sectionId?: string;
  /** Downloads document id for role packs. */
  documentAnchorId?: string;
};

/**
 * Default Guided Strategy spine when no report signals are available.
 * Live reports use `resolveBlueprintPlusGuidedStrategySectionIds`.
 */
export const BLUEPRINT_PLUS_GUIDED_STRATEGY_SECTION_IDS: readonly StrategySectionId[] = [
  "positioning",
  "messaging-pillars",
  "icp-personas",
  "channel-strategy",
  "execution-priorities",
];

/**
 * Default Guided Activation spine when no report signals are available.
 * Live reports use `resolveBlueprintPlusGuidedActivationSectionIds`.
 */
export const BLUEPRINT_PLUS_GUIDED_ACTIVATION_SECTION_IDS: readonly ActivationPlanSectionId[] = [
  "journey-orchestration",
  "execution-roadmap",
  "email-lifecycle",
  "seo-aeo",
];

/** Always shown in Guided Strategy (orientation). */
const GUIDED_STRATEGY_SPINE: readonly StrategySectionId[] = [
  "positioning",
  "messaging-pillars",
  "icp-personas",
  "execution-priorities",
];

/** Always shown in Guided Activation (journey context + 90-day plan). */
const GUIDED_ACTIVATION_SPINE: readonly ActivationPlanSectionId[] = [
  "journey-orchestration",
  "execution-roadmap",
];

/** Channel / campaign plans that can fill Guided Activation slots from report signals. */
const GUIDED_ACTIVATION_CHANNEL_CANDIDATES: readonly ActivationPlanSectionId[] = [
  "email-lifecycle",
  "seo-aeo",
  "paid-ads",
  "lead-magnet-planning",
  "thought-leadership",
  "pr-plan",
];

const GUIDED_CHANNEL_SLOT_COUNT = 2;

const VIEW_MODE_STORAGE_PREFIX = "wb_bp_plus_view_mode:";
const FIRST_ACTION_STORAGE_PREFIX = "wb_bp_plus_first_action:";
const GUIDED_SHOWN_STORAGE_PREFIX = "wb_bp_plus_guided_shown:";

export function isBlueprintPlusViewMode(raw: string | null | undefined): raw is BlueprintPlusViewMode {
  return raw === "guided" || raw === "reference";
}

export function parseBlueprintPlusViewModeParam(
  raw: string | string[] | null | undefined,
): BlueprintPlusViewMode | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return isBlueprintPlusViewMode(normalized) ? normalized : null;
}

export function blueprintPlusViewModeStorageKey(reportId: string): string {
  return `${VIEW_MODE_STORAGE_PREFIX}${reportId || "default"}`;
}

export function readStoredBlueprintPlusViewMode(reportId: string): BlueprintPlusViewMode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(blueprintPlusViewModeStorageKey(reportId));
    return isBlueprintPlusViewMode(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeStoredBlueprintPlusViewMode(reportId: string, mode: BlueprintPlusViewMode): void {
  if (typeof window === "undefined") return;
  if (!shouldPersistBlueprintPlusViewMode(reportId)) return;
  try {
    window.localStorage.setItem(blueprintPlusViewModeStorageKey(reportId), mode);
  } catch {
    /* ignore */
  }
}

/** Preview / mock reports should always start Guided for demos and QC. */
export function shouldPersistBlueprintPlusViewMode(reportId: string): boolean {
  const id = (reportId || "").toLowerCase();
  if (!id) return true;
  return !(
    id.startsWith("preview") ||
    id.includes("preview") ||
    id === "preview-results-tabs" ||
    id === "preview-mock"
  );
}

export function resolveInitialBlueprintPlusViewMode(
  reportId: string,
  queryMode: BlueprintPlusViewMode | null,
): BlueprintPlusViewMode {
  if (queryMode) return queryMode;
  if (typeof window !== "undefined" && shouldPersistBlueprintPlusViewMode(reportId)) {
    const stored = readStoredBlueprintPlusViewMode(reportId);
    if (stored) return stored;
  }
  return "guided";
}

/** Everyday labels for Guided Strategy chips (glossary terms stay in Reference). */
export const BLUEPRINT_PLUS_GUIDED_STRATEGY_LABELS: Record<string, string> = {
  positioning: "Your position",
  "messaging-pillars": "Core messages",
  "icp-personas": "Who you serve",
  "channel-strategy": "Where to show up",
  "buyer-journey-map": "Buyer journey",
  "competitive-matrix": "Competitive edge",
  "execution-priorities": "What to do first",
};

export const BLUEPRINT_PLUS_GUIDED_ACTIVATION_LABELS: Record<string, string> = {
  "journey-orchestration": "Buyer journey",
  "lead-magnet-planning": "Free offer",
  "email-lifecycle": "Email sequence",
  "seo-aeo": "SEO & AEO",
  "paid-ads": "Paid ads",
  "thought-leadership": "Content & social",
  "pr-plan": "Press & PR",
  "execution-roadmap": "90-day roadmap",
};

export function guidedStrategyChipLabel(sectionId: string, fallback: string): string {
  return BLUEPRINT_PLUS_GUIDED_STRATEGY_LABELS[sectionId] || fallback;
}

export function guidedActivationChipLabel(sectionId: string, fallback: string): string {
  return activationNavLabel(sectionId, BLUEPRINT_PLUS_GUIDED_ACTIVATION_LABELS[sectionId] || fallback);
}

/** Prompt Library sections shown in Guided before “see all in Reference”. */
export const BLUEPRINT_PLUS_GUIDED_PROMPT_SECTION_LIMIT = 5;

export function limitBlueprintPlusGuidedPromptSections<T>(sections: T[], mode: BlueprintPlusViewMode): T[] {
  if (mode !== "guided") return sections;
  return sections.slice(0, BLUEPRINT_PLUS_GUIDED_PROMPT_SECTION_LIMIT);
}

function uniquePreserveOrder<T extends string>(ids: readonly T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function signalBlob(diagnosticData: Record<string, unknown>): string {
  const parts: string[] = [
    asString(diagnosticData.primaryPillar),
    asString(diagnosticData.topOpportunity),
    asString(diagnosticData.businessType),
    asString(diagnosticData.industry),
  ];
  for (const title of priorityTitles(diagnosticData)) parts.push(title);
  const gaps = Array.isArray(diagnosticData.topGaps) ? diagnosticData.topGaps : [];
  for (const gap of gaps) parts.push(asString(gap));
  const recs = Array.isArray(diagnosticData.recommendations) ? diagnosticData.recommendations : [];
  for (const rec of recs) parts.push(asString(rec));

  // Channel strategy objects help rank core channels. Soft channels (content / PR) still
  // need plain-language signals — key names alone must not unlock them for every Blueprint+ report.
  const strategyKeys = [
    "emailMarketingFramework",
    "seoStrategy",
    "aeoStrategy",
    "paidMediaStrategy",
    "leadMagnetStrategy",
    "conversionStrategy",
  ] as const;
  for (const key of strategyKeys) {
    const value = diagnosticData[key];
    if (value == null) continue;
    if (typeof value === "string") {
      parts.push(key, value.slice(0, 400));
      continue;
    }
    if (typeof value === "object") {
      parts.push(key);
      try {
        parts.push(JSON.stringify(value).slice(0, 600));
      } catch {
        /* ignore */
      }
    }
  }

  return parts.join(" ").toLowerCase();
}

function primaryPillarKey(diagnosticData: Record<string, unknown>): string {
  return asString(diagnosticData.primaryPillar).toLowerCase();
}

function isLocalDiscoveryBusiness(diagnosticData: Record<string, unknown>): boolean {
  return buildGoogleBusinessPasteFields(diagnosticData).showGoogleBusiness;
}

/**
 * Stable Strategy spine + one report-driven panel (channel, journey, or competitive).
 */
export function resolveBlueprintPlusGuidedStrategySectionIds(
  diagnosticData?: Record<string, unknown> | null,
): StrategySectionId[] {
  if (!diagnosticData) return [...BLUEPRINT_PLUS_GUIDED_STRATEGY_SECTION_IDS];

  const pillar = primaryPillarKey(diagnosticData);
  let dynamic: StrategySectionId = "channel-strategy";
  if (pillar === "conversion") dynamic = "buyer-journey-map";
  else if (pillar === "credibility") dynamic = "competitive-matrix";
  else if (pillar === "visibility") dynamic = "channel-strategy";
  else dynamic = "channel-strategy";

  // Insert dynamic panel before execution priorities so “what to do first” stays last.
  const spine = [...GUIDED_STRATEGY_SPINE];
  const execIdx = spine.indexOf("execution-priorities");
  const withDynamic =
    execIdx >= 0
      ? [...spine.slice(0, execIdx), dynamic, ...spine.slice(execIdx)]
      : [...spine, dynamic];
  return uniquePreserveOrder(withDynamic);
}

/** Week-one channels almost every report can start with. */
const GUIDED_CORE_CHANNELS = new Set<ActivationPlanSectionId>([
  "email-lifecycle",
  "seo-aeo",
  "paid-ads",
  "lead-magnet-planning",
]);

/**
 * Authority / earned channels — only enter Guided when the report actually points there.
 * (Credibility alone is not enough; many brands need email + search first.)
 */
const GUIDED_SIGNAL_GATED_CHANNELS = new Set<ActivationPlanSectionId>([
  "thought-leadership",
  "pr-plan",
]);

function pillarChannelScores(pillar: string): Record<string, number> {
  switch (pillar) {
    case "visibility":
      return {
        "seo-aeo": 34,
        "paid-ads": 22,
        "email-lifecycle": 16,
        "lead-magnet-planning": 10,
        "thought-leadership": 8,
        "pr-plan": 6,
      };
    case "conversion":
      return {
        "lead-magnet-planning": 32,
        "email-lifecycle": 28,
        "paid-ads": 20,
        "seo-aeo": 12,
        "thought-leadership": 4,
        "pr-plan": 2,
      };
    case "credibility":
      return {
        "email-lifecycle": 26,
        "seo-aeo": 20,
        "lead-magnet-planning": 14,
        "paid-ads": 10,
        "thought-leadership": 8,
        "pr-plan": 8,
      };
    case "messaging":
      return {
        "email-lifecycle": 32,
        "lead-magnet-planning": 22,
        "seo-aeo": 12,
        "paid-ads": 10,
        "thought-leadership": 6,
        "pr-plan": 4,
      };
    case "positioning":
    default:
      return {
        "lead-magnet-planning": 24,
        "email-lifecycle": 24,
        "seo-aeo": 18,
        "paid-ads": 12,
        "thought-leadership": 6,
        "pr-plan": 4,
      };
  }
}

function channelSignalBoost(sectionId: ActivationPlanSectionId, blob: string): number {
  switch (sectionId) {
    case "email-lifecycle":
      return /\b(email|nurture|lifecycle|newsletter|drip|welcome sequence|emailmarketingframework)\b/.test(blob)
        ? 28
        : 0;
    case "seo-aeo":
      return /\b(search|seo|aeo|serp|google|maps|organic|ai discovery|ai answer|aeostrategy|seostrategy)\b/.test(
        blob,
      )
        ? 28
        : 0;
    case "paid-ads":
      return /\b(paid|ads?|meta|ppc|cpc|media spend|linkedin ads|paidmediastrategy)\b/.test(blob) ? 28 : 0;
    case "lead-magnet-planning":
      return /\b(lead magnet|free offer|download|opt[- ]?in|magnet|capture|leadmagnetstrategy|conversionstrategy)\b/.test(
        blob,
      )
        ? 28
        : 0;
    case "thought-leadership":
      // Require content/authority intent — “social proof on pages” is conversion, not a content system.
      return /\b(thought leadership|linkedin content|content system|organic social|authority content|editorial calendar|content calendar|weekly posts?|publish(ing)? cadence)\b/.test(
        blob,
      )
        ? 36
        : 0;
    case "pr-plan":
      return /\b(pr\b|press|publicity|earned media|media relations|byline|podcast guest)\b/.test(blob) ? 34 : 0;
    default:
      return 0;
  }
}

function scoreActivationChannel(
  sectionId: ActivationPlanSectionId,
  pillar: string,
  blob: string,
  localDiscovery: boolean,
): number {
  let score = pillarChannelScores(pillar)[sectionId] ?? 0;
  const signal = channelSignalBoost(sectionId, blob);
  score += signal;

  if (localDiscovery && sectionId === "seo-aeo") score += 40;

  // Soft channels without a real report signal stay out of Guided.
  if (GUIDED_SIGNAL_GATED_CHANNELS.has(sectionId) && signal <= 0) return 0;

  return score;
}

/**
 * Stable Activation spine + up to two channel plans ranked from the report.
 */
export function resolveBlueprintPlusGuidedActivationSectionIds(
  diagnosticData?: Record<string, unknown> | null,
): ActivationPlanSectionId[] {
  if (!diagnosticData) return [...BLUEPRINT_PLUS_GUIDED_ACTIVATION_SECTION_IDS];

  const pillar = primaryPillarKey(diagnosticData);
  const blob = signalBlob(diagnosticData);
  const localDiscovery = isLocalDiscoveryBusiness(diagnosticData);

  const ranked = GUIDED_ACTIVATION_CHANNEL_CANDIDATES.map((id) => ({
    id,
    score: scoreActivationChannel(id, pillar, blob, localDiscovery),
  })).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const picks: ActivationPlanSectionId[] = [];
  for (const row of ranked) {
    if (picks.length >= GUIDED_CHANNEL_SLOT_COUNT) break;
    if (row.score <= 0) continue;
    picks.push(row.id);
  }

  // Keep the pillar’s strongest *core* channel in the path even when text signals pull elsewhere.
  // Do not force thought leadership / PR without report signals.
  const pillarPreferred = (
    Object.entries(pillarChannelScores(pillar))
      .filter(([id]) => GUIDED_CORE_CHANNELS.has(id as ActivationPlanSectionId))
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] || ["email-lifecycle", 0]
  )[0] as ActivationPlanSectionId;
  if (
    (GUIDED_ACTIVATION_CHANNEL_CANDIDATES as readonly string[]).includes(pillarPreferred) &&
    !picks.includes(pillarPreferred)
  ) {
    if (picks.length < GUIDED_CHANNEL_SLOT_COUNT) picks.push(pillarPreferred);
    else picks[picks.length - 1] = pillarPreferred;
    // Re-sort picks by score so the stronger channel stays first.
    picks.sort((a, b) => {
      const sa = ranked.find((r) => r.id === a)?.score ?? 0;
      const sb = ranked.find((r) => r.id === b)?.score ?? 0;
      return sb - sa || a.localeCompare(b);
    });
  }

  const defaults: ActivationPlanSectionId[] = localDiscovery
    ? ["seo-aeo", "email-lifecycle"]
    : ["email-lifecycle", "seo-aeo"];
  for (const id of defaults) {
    if (picks.length >= GUIDED_CHANNEL_SLOT_COUNT) break;
    if (!picks.includes(id)) picks.push(id);
  }

  // Journey + roadmap first (the plan), then ranked channels.
  return uniquePreserveOrder([
    GUIDED_ACTIVATION_SPINE[0],
    GUIDED_ACTIVATION_SPINE[1],
    ...picks,
  ]);
}

export function primaryGuidedActivationChannelId(
  diagnosticData?: Record<string, unknown> | null,
): ActivationPlanSectionId {
  const ids = resolveBlueprintPlusGuidedActivationSectionIds(diagnosticData);
  const channel = ids.find((id) =>
    (GUIDED_ACTIVATION_CHANNEL_CANDIDATES as readonly string[]).includes(id),
  );
  return channel || "email-lifecycle";
}

export function filterBlueprintPlusGuidedStrategySections<T extends { id: string }>(
  sections: T[],
  mode: BlueprintPlusViewMode,
  diagnosticData?: Record<string, unknown> | null,
): T[] {
  if (mode !== "guided") return sections;
  const allow = new Set<string>(resolveBlueprintPlusGuidedStrategySectionIds(diagnosticData));
  return sections.filter((s) => allow.has(s.id));
}

export function filterBlueprintPlusGuidedActivationSections<T extends { id: string }>(
  sections: T[],
  mode: BlueprintPlusViewMode,
  diagnosticData?: Record<string, unknown> | null,
): T[] {
  if (mode !== "guided") return sections;
  const allow = new Set<string>(resolveBlueprintPlusGuidedActivationSectionIds(diagnosticData));
  // Preserve the report-driven order, not the full library order.
  const byId = new Map(sections.map((s) => [s.id, s]));
  const ordered: T[] = [];
  for (const id of allow) {
    const row = byId.get(id);
    if (row) ordered.push(row);
  }
  return ordered;
}

/** Keep overview / schedule / prompt chips; filter plan section chips in Guided. */
export function filterBlueprintPlusGuidedActivationNavItems<T extends { id: string }>(
  items: T[],
  mode: BlueprintPlusViewMode,
  diagnosticData?: Record<string, unknown> | null,
): T[] {
  if (mode !== "guided") return items;
  const allow = new Set<string>(resolveBlueprintPlusGuidedActivationSectionIds(diagnosticData));
  return items.filter((item) => {
    if (item.id === "activation-overview") return true;
    if (item.id === "activation-spreadsheet-schedule") return true;
    if (item.id === "activation-nav-channels") return true;
    if (item.id === "activation-prompt-library" || item.id.endsWith("prompt-library")) return true;
    if (!item.id.startsWith("activation-")) return true;
    const sectionId = item.id.slice("activation-".length);
    return allow.has(sectionId);
  });
}

function priorityTitles(diagnosticData: Record<string, unknown>): string[] {
  const fromStrategic = Array.isArray(diagnosticData.strategicPriorities)
    ? diagnosticData.strategicPriorities
        .map((item) => {
          if (!item || typeof item !== "object") return "";
          return asString((item as { title?: unknown }).title);
        })
        .filter(Boolean)
    : [];
  if (fromStrategic.length > 0) return fromStrategic.slice(0, 3);

  const fromRecs = Array.isArray(diagnosticData.recommendations)
    ? diagnosticData.recommendations.map((r) => asString(r)).filter(Boolean)
    : [];
  if (fromRecs.length > 0) return fromRecs.slice(0, 3);

  const gaps = Array.isArray(diagnosticData.topGaps)
    ? diagnosticData.topGaps.map((g) => asString(g)).filter(Boolean)
    : [];
  return gaps.slice(0, 3);
}

function rolePackAnchor(role: BlueprintPlusStartHereRole): string {
  switch (role) {
    case "marketing":
      return "downloads-role-packs";
    case "sales":
      return "downloads-role-packs";
    case "design":
      return "downloads-role-packs";
    case "founder":
    default:
      return "downloads-role-packs";
  }
}

function rolePackLabel(role: BlueprintPlusStartHereRole): string {
  switch (role) {
    case "marketing":
      return "Download the Marketing role pack";
    case "sales":
      return "Download the Sales role pack";
    case "design":
      return "Download the Design role pack";
    case "founder":
    default:
      return "Download the Leadership role pack";
  }
}

/**
 * Builds the Guided “this week” path from diagnostic priorities + selected role.
 * Always returns 5 moves so the hub stays scannable.
 */
export function buildBlueprintPlusStartHereMoves(
  diagnosticData: Record<string, unknown>,
  role: BlueprintPlusStartHereRole = "founder",
): BlueprintPlusStartHereMove[] {
  const titles = priorityTitles(diagnosticData);
  const first = titles[0] || "Ship one clarity fix on your highest-traffic page";
  const second = titles[1] || "Repeat your core message in one customer-facing channel";
  const third = titles[2] || "Set owners on your next 30 days of activation work";
  const primaryChannel = primaryGuidedActivationChannelId(diagnosticData);
  const channelLabel = guidedActivationChipLabel(primaryChannel, primaryChannel);

  return [
    {
      id: "week-move-1",
      title: "Do this first",
      detail: first,
      tab: "results",
      sectionId: "priority-actions",
    },
    {
      id: "week-move-2",
      title: "Protect the story",
      detail: second.startsWith("Improve") || second.length > 40 ? second : `Make sure this shows up clearly: ${second}`,
      tab: "strategy",
      sectionId: "strategy-messaging-pillars",
    },
    {
      id: "week-move-3",
      title: "Run one channel plan",
      detail: `Open Activation and start with your ${channelLabel} plan—finish that before opening every other channel.`,
      tab: "activation",
      sectionId: `activation-${primaryChannel}`,
    },
    {
      id: "week-move-4",
      title: "Open your 90-day plan",
      detail: third,
      tab: "activation",
      sectionId: "activation-execution-roadmap",
    },
    {
      id: "week-move-5",
      title: rolePackLabel(role),
      detail:
        "Hand your team a role-sized pack instead of the full library. Switch to Reference anytime for every section and export.",
      tab: "downloads",
      sectionId: rolePackAnchor(role),
      documentAnchorId: rolePackAnchor(role),
    },
  ];
}

export function markBlueprintPlusGuidedShown(reportId: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${GUIDED_SHOWN_STORAGE_PREFIX}${reportId || "default"}`;
    if (!window.sessionStorage.getItem(key)) {
      window.sessionStorage.setItem(key, String(Date.now()));
    }
  } catch {
    /* ignore */
  }
}

export type BlueprintPlusFirstActionKind =
  | "start_here_move"
  | "switch_reference"
  | "switch_guided"
  | "role_select";

/** Records first Guided action latency once per session (for time-to-first-action). */
export function markBlueprintPlusFirstAction(
  reportId: string,
  kind: BlueprintPlusFirstActionKind,
  detail?: string,
): { recorded: boolean; latencyMs: number | null } {
  if (typeof window === "undefined") return { recorded: false, latencyMs: null };
  try {
    const shownKey = `${GUIDED_SHOWN_STORAGE_PREFIX}${reportId || "default"}`;
    const actionKey = `${FIRST_ACTION_STORAGE_PREFIX}${reportId || "default"}`;
    if (window.sessionStorage.getItem(actionKey)) {
      return { recorded: false, latencyMs: null };
    }
    const shownRaw = window.sessionStorage.getItem(shownKey);
    const shownAt = shownRaw ? Number(shownRaw) : Date.now();
    const latencyMs = Math.max(0, Date.now() - (Number.isFinite(shownAt) ? shownAt : Date.now()));
    window.sessionStorage.setItem(
      actionKey,
      JSON.stringify({ kind, detail: detail ?? null, latencyMs, at: Date.now() }),
    );
    return { recorded: true, latencyMs };
  } catch {
    return { recorded: false, latencyMs: null };
  }
}
