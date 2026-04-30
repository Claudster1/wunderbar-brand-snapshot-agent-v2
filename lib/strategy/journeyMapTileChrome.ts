/** Per-stage visual language for journey map tiles (Strategy, Activation, shared `JourneyMapVisual`). */
export type JourneyMapTileChrome = {
  border: string;
  bgFrom: string;
  bgTo: string;
  leftRail: string;
  numberBg: string;
  chipBg: string;
  chipText: string;
  /** Short scan line under the stage title */
  cue: string;
};

const AWARE: JourneyMapTileChrome = {
  border: "#7CB3F8",
  bgFrom: "#E8F0FE",
  bgTo: "#FFFFFF",
  leftRail: "#1D4ED8",
  numberBg: "#2563EB",
  chipBg: "#DBEAFE",
  chipText: "#1E3A8A",
  cue: "Surface the problem",
};

const CONSIDER: JourneyMapTileChrome = {
  border: "#38BDF8",
  bgFrom: "#D4EEF9",
  bgTo: "#FFFFFF",
  leftRail: "#0369A1",
  numberBg: "#0284C7",
  chipBg: "#BAE6FD",
  chipText: "#0C4A6E",
  cue: "Earn consideration",
};

const DECIDE: JourneyMapTileChrome = {
  border: "#22D3EE",
  bgFrom: "#D7F4FC",
  bgTo: "#FFFFFF",
  leftRail: "#0891B2",
  numberBg: "#07B0F2",
  chipBg: "#CFFAFE",
  chipText: "#021859",
  cue: "Prove the fit",
};

const COMMIT: JourneyMapTileChrome = {
  border: "#2DD4BF",
  bgFrom: "#D1FAE5",
  bgTo: "#FFFFFF",
  leftRail: "#0D9488",
  numberBg: "#059669",
  chipBg: "#A7F3D0",
  chipText: "#064E3B",
  cue: "Land the plan",
};

const CLOSED: JourneyMapTileChrome = {
  border: "#FBBF24",
  bgFrom: "#FEF3C7",
  bgTo: "#FFFFFF",
  leftRail: "#CA8A04",
  numberBg: "#D97706",
  chipBg: "#FDE68A",
  chipText: "#92400E",
  cue: "Grow & retain",
};

/** Post-purchase / expansion stage used on Activation campaign journey strip (distinct from Commit/Closed). */
const GROW: JourneyMapTileChrome = {
  border: "#A78BFA",
  bgFrom: "#EDE9FE",
  bgTo: "#FFFFFF",
  leftRail: "#6D28D9",
  numberBg: "#7C3AED",
  chipBg: "#DDD6FE",
  chipText: "#4C1D95",
  cue: "Onboard & expand",
};

/** Use for stage titles so each phase reads distinctly (not the global bright-blue subhead). */
export function journeyStageTitleColor(chrome: JourneyMapTileChrome): string {
  return chrome.chipText;
}

const SEQUENCE: JourneyMapTileChrome[] = [AWARE, CONSIDER, DECIDE, COMMIT, CLOSED];

/** Rotate distinct tiles for Activation playbook `###` subsections (and similar dense markdown). */
const PLAYBOOK_SUBSECTION_ROTATION: JourneyMapTileChrome[] = [...SEQUENCE, GROW];

export function getPlaybookSubsectionChrome(index: number): JourneyMapTileChrome {
  return PLAYBOOK_SUBSECTION_ROTATION[index % PLAYBOOK_SUBSECTION_ROTATION.length];
}

function normalizeStageLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Resolve chrome from stage label (Aware, Consider, Decide, Commit, Closed / won, …) with index fallback.
 */
export function getJourneyMapTileChrome(label: string, index: number): JourneyMapTileChrome {
  const key = normalizeStageLabel(label);

  if (/\bgrow\b/.test(key)) return GROW;
  if (key.includes("closed") || key.includes("won")) return CLOSED;
  if (key.includes("commit")) return COMMIT;
  if (key.includes("decide")) return DECIDE;
  if (key.includes("consider")) return CONSIDER;
  if (/\baware\b/.test(key) && !key.includes("unaware")) return AWARE;

  return SEQUENCE[index % SEQUENCE.length];
}
