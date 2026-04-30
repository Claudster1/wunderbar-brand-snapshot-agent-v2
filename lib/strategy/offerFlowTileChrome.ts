/** Distinct tile styling for lead-magnet / offer flow steps (Activation reference diagrams). */
export type OfferFlowTileChrome = {
  border: string;
  bgFrom: string;
  bgTo: string;
  leftRail: string;
  numberBg: string;
  chipBg: string;
  chipText: string;
  cue: string;
};

const HOOK: OfferFlowTileChrome = {
  border: "#FDA4AF",
  bgFrom: "#FFF1F2",
  bgTo: "#FFFFFF",
  leftRail: "#E11D48",
  numberBg: "#E11D48",
  chipBg: "#FFE4E6",
  chipText: "#BE123C",
  cue: "Interrupt the scroll",
};

const LANDING: OfferFlowTileChrome = {
  border: "#93C5FD",
  bgFrom: "#EFF6FF",
  bgTo: "#FFFFFF",
  leftRail: "#2563EB",
  numberBg: "#2563EB",
  chipBg: "#DBEAFE",
  chipText: "#1E40AF",
  cue: "Earn the opt-in",
};

const DELIVER: OfferFlowTileChrome = {
  border: "#6EE7B7",
  bgFrom: "#ECFDF5",
  bgTo: "#FFFFFF",
  leftRail: "#059669",
  numberBg: "#059669",
  chipBg: "#D1FAE5",
  chipText: "#047857",
  cue: "Instant payoff",
};

const BRIDGE: OfferFlowTileChrome = {
  border: "#C4B5FD",
  bgFrom: "#F5F3FF",
  bgTo: "#FFFFFF",
  leftRail: "#7C3AED",
  numberBg: "#7C3AED",
  chipBg: "#EDE9FE",
  chipText: "#5B21B6",
  cue: "Carry momentum",
};

const SEQUENCE: OfferFlowTileChrome[] = [HOOK, LANDING, DELIVER, BRIDGE];

function norm(s: string): string {
  return s.trim().toLowerCase();
}

export function getOfferFlowTileChrome(label: string, index: number): OfferFlowTileChrome {
  const k = norm(label);
  if (k.includes("hook")) return HOOK;
  if (k.includes("landing")) return LANDING;
  if (k.includes("deliver")) return DELIVER;
  if (k.includes("bridge")) return BRIDGE;
  return SEQUENCE[index % SEQUENCE.length];
}
