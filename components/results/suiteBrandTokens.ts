import type { CSSProperties } from "react";

/** Wunderbar brand UI tokens — suite chrome uses calm, editorial spacing and hairline borders. */
export const SUITE_NAVY = "#021859";
export const SUITE_BLUE = "#07B0F2";
/** Hairline borders (system-native feel). */
export const SUITE_BORDER = "#D2D2D7";
export const SUITE_MUTED = "#5A6B7E";
/** Secondary labels in chrome (tab metadata, captions). */
export const SUITE_CHROME_MUTED = "#86868B";
/** Primary text on light surfaces — slightly softer than pure black. */
export const SUITE_TEXT_PRIMARY = "#1D1D1F";

/** Page canvas behind cards. */
export const SUITE_BG_PAGE = "#F5F5F7";
export const SUITE_BG_CARD = "#FFFFFF";
/** Frosted chrome (pair with backdrop-filter on supporting browsers). */
export const SUITE_BG_CHROME = "rgba(255, 255, 255, 0.76)";

export const SUITE_FONT_UI = `'Lato', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

export const SUITE_RADIUS_LG = 14;
export const SUITE_RADIUS_MD = 12;
export const SUITE_RADIUS_SM = 10;

/** Layered, soft elevation (avoid heavy navy-tinted shadows). */
export const SUITE_SHADOW_CARD: CSSProperties["boxShadow"] =
  "0 2px 16px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.06)";
export const SUITE_SHADOW_FLOAT: CSSProperties["boxShadow"] =
  "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)";
export const SUITE_SHADOW_TAB_PILL: CSSProperties["boxShadow"] =
  "0 1px 3px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04)";

export const SUITE_CONTENT_MAX_PX = 1120;

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
  padding: "18px 20px",
  border: `1px solid ${SUITE_BORDER}`,
  borderRadius: SUITE_RADIUS_LG,
  borderLeft: `3px solid ${SUITE_PANEL_RAIL}`,
  background: SUITE_BG_CARD,
  boxShadow: SUITE_SHADOW_CARD,
};

/** Top-of-tab insight band (replaces flat bright blue boxes). */
export const SUITE_INTRO_BAND_STYLE: CSSProperties = {
  marginBottom: 16,
  padding: "20px 22px",
  border: "1px solid rgba(7, 176, 242, 0.22)",
  borderRadius: SUITE_RADIUS_LG,
  background: "linear-gradient(165deg, rgba(7, 176, 242, 0.09) 0%, rgba(255, 255, 255, 0.97) 55%, #FFFFFF 100%)",
  boxShadow: SUITE_SHADOW_CARD,
};

export const SUITE_BACKDROP_BLUR: CSSProperties = {
  backdropFilter: "saturate(180%) blur(20px)",
  WebkitBackdropFilter: "saturate(180%) blur(20px)",
};
