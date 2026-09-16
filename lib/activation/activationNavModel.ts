import type { ActivationPlanSectionId } from "@/components/results/tabConfig";

/**
 * Activation tab IA (all tiers):
 * Overview → Buyer journey (+ related context) → 90-day roadmap → Schedule → Channels → Prompts
 */

/** Context before the operating plan (journey first when present). */
export const ACTIVATION_NAV_CONTEXT_IDS: readonly ActivationPlanSectionId[] = [
  "journey-orchestration",
  "audience-segments",
  "competitive-motion-plan",
];

export const ACTIVATION_NAV_ROADMAP_ID: ActivationPlanSectionId = "execution-roadmap";

/** Channel / campaign plays — company-ranked in Guided; full set in Reference. */
export const ACTIVATION_NAV_CHANNEL_IDS: readonly ActivationPlanSectionId[] = [
  "lead-magnet-planning",
  "email-lifecycle",
  "seo-aeo",
  "paid-ads",
  "thought-leadership",
  "pr-plan",
];

/** Plain-language nav labels — shared Guided + Reference + all tiers. */
export const ACTIVATION_NAV_LABELS: Record<string, string> = {
  "journey-orchestration": "Buyer journey",
  "audience-segments": "Audiences",
  "competitive-motion-plan": "Competitive response",
  "execution-roadmap": "90-day roadmap",
  "lead-magnet-planning": "Free offer",
  "email-lifecycle": "Email sequence",
  "seo-aeo": "SEO & AEO",
  "paid-ads": "Paid ads",
  "thought-leadership": "Content & social",
  "pr-plan": "Press & PR",
};

export function activationNavLabel(sectionId: string, fallback?: string): string {
  return ACTIVATION_NAV_LABELS[sectionId] || fallback || sectionId;
}

export function isActivationNavChannelId(sectionId: string): boolean {
  return (ACTIVATION_NAV_CHANNEL_IDS as readonly string[]).includes(sectionId);
}

export function isActivationNavContextId(sectionId: string): boolean {
  return (ACTIVATION_NAV_CONTEXT_IDS as readonly string[]).includes(sectionId);
}

function indexIn(ids: readonly string[], id: string): number {
  const i = ids.indexOf(id);
  return i >= 0 ? i : 999;
}

/**
 * Stable display order for Activation sections (nav + body).
 * Prefer `preferredChannelOrder` (e.g. Guided ranking) when provided.
 */
export function sortActivationSectionsForNav<T extends { id: string }>(
  sections: T[],
  preferredChannelOrder?: readonly string[],
): T[] {
  const byId = new Map(sections.map((s) => [s.id, s]));
  const out: T[] = [];
  const used = new Set<string>();

  const pushId = (id: string) => {
    if (used.has(id)) return;
    const row = byId.get(id);
    if (!row) return;
    used.add(id);
    out.push(row);
  };

  for (const id of ACTIVATION_NAV_CONTEXT_IDS) pushId(id);
  pushId(ACTIVATION_NAV_ROADMAP_ID);

  const channelIds =
    preferredChannelOrder && preferredChannelOrder.length > 0
      ? [
          ...preferredChannelOrder.filter((id) => isActivationNavChannelId(id)),
          ...ACTIVATION_NAV_CHANNEL_IDS.filter((id) => !preferredChannelOrder.includes(id)),
        ]
      : [...ACTIVATION_NAV_CHANNEL_IDS];

  for (const id of channelIds) pushId(id);

  // Any unexpected section ids — keep at end, stable by original order.
  for (const row of sections) {
    if (!used.has(row.id)) {
      used.add(row.id);
      out.push(row);
    }
  }

  return out;
}

/** Sort key helper when comparing two section ids without full lists. */
export function activationNavSectionRank(sectionId: string): number {
  if (sectionId === ACTIVATION_NAV_ROADMAP_ID) return 100;
  if (isActivationNavContextId(sectionId)) return indexIn(ACTIVATION_NAV_CONTEXT_IDS, sectionId);
  if (isActivationNavChannelId(sectionId)) return 200 + indexIn(ACTIVATION_NAV_CHANNEL_IDS, sectionId);
  return 900;
}
