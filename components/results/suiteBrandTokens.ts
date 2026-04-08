import type { CSSProperties } from "react";

/** Wunderbar brand UI tokens — keep suite tabs aligned with `tailwind.config.js` + globals. */
export const SUITE_NAVY = "#021859";
export const SUITE_BLUE = "#07B0F2";
export const SUITE_BORDER = "#E0E3EA";
export const SUITE_MUTED = "#5A6B7E";

/** Structural vertical accent (suite-wide rails). */
export const SUITE_PANEL_RAIL = "rgba(7, 176, 242, 0.55)";

/** Interactive / highlight accent (CTAs, icons, callout labels). */
export const SUITE_ACCENT_BRIGHT = SUITE_BLUE;

/** Section nav “current section” — distinct from primary blue; reads as “here / OK”. */
export const SUITE_SECTION_ACTIVE = "#059669";
export const SUITE_SECTION_ACTIVE_BORDER = "#10B981";
export const SUITE_SECTION_ACTIVE_BG = "rgba(5, 150, 105, 0.12)";

/** Chip + section-jump chrome above sidebar layouts (Strategy, Standards, Activation, …). */
export const SUITE_CHIP_CARD_STYLE: CSSProperties = {
  marginBottom: 16,
  padding: "14px 16px",
  border: `1px solid ${SUITE_BORDER}`,
  borderRadius: 5,
  borderLeft: `3px solid ${SUITE_PANEL_RAIL}`,
  background: "#FFFFFF",
  boxShadow: "0 3px 10px rgba(2,24,89,0.05)",
};
