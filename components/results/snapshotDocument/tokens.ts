/** Free Snapshot document chrome — aligned to suite brand tokens. */
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BG_CARD,
  SUITE_BG_PAGE,
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_LG,
  SUITE_RADIUS_MD,
  SUITE_RADIUS_SM,
  SUITE_SECTION_ACTIVE_BG,
} from "@/components/results/suiteBrandTokens";

export const NAVY = SUITE_NAVY;
export const BLUE = SUITE_ACCENT_BRIGHT;
export const WHITE = SUITE_BG_CARD;
export const LIGHT_BG = SUITE_BG_PAGE;
export const SUB = SUITE_MUTED;
export const BORDER = SUITE_BORDER;
export const RADIUS = SUITE_RADIUS_LG;
export const RADIUS_MD = SUITE_RADIUS_MD;
export const RADIUS_SM = SUITE_RADIUS_SM;
export const GREEN = "#16A34A";
export const YELLOW = "#EAB308";
export const ORANGE = "#F97316";
export const RED_S = "#EF4444";
export const GOOD_GREEN = "#16A34A";
export const ACCENT_BG = SUITE_SECTION_ACTIVE_BG;

export function scoreColor(percent: number) {
  if (percent >= 80) return GREEN;
  if (percent >= 60) return GOOD_GREEN;
  if (percent >= 40) return YELLOW;
  if (percent >= 20) return ORANGE;
  return RED_S;
}

export function scoreLabel(percent: number) {
  if (percent >= 80) return "Strong";
  if (percent >= 60) return "Good";
  if (percent >= 40) return "Fair";
  if (percent >= 20) return "Weak";
  return "Critical";
}

export function weakestPillarCallout(percent: number) {
  if (percent >= 60) return "Opportunity";
  if (percent >= 40) return "Improvement Opportunity";
  return "Needs Attention";
}
