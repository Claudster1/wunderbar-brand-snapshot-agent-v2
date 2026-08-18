export const NAVY = "#021859";
export const BLUE = "#07B0F2";
export const WHITE = "#FFFFFF";
export const LIGHT_BG = "#F4F7FB";
export const SUB = "#5A6B7E";
export const BORDER = "#D6DFE8";
export const GREEN = "#22C55E";
export const YELLOW = "#EAB308";
export const ORANGE = "#F97316";
export const RED_S = "#EF4444";
export const GOOD_GREEN = "#4ADE80";
export const ACCENT_BG = "#E8F6FE";

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
