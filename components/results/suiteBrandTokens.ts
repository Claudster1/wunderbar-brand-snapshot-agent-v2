import type { CSSProperties } from "react";

/** Wunderbar brand UI tokens — suite chrome uses calm, editorial spacing and hairline borders. */
export const SUITE_NAVY = "#021859";
export const SUITE_BLUE = "#07B0F2";
/** Hairline borders (system-native feel). */
export const SUITE_BORDER = "#D2D2D7";
export const SUITE_MUTED = "#5A6B7E";
/** Secondary labels in chrome (tab metadata, captions). */
export const SUITE_CHROME_MUTED = "#86868B";
/** Sticky header metadata (date, confidential) — darker than SUITE_CHROME_MUTED for readability on white/frosted chrome. */
export const SUITE_HEADER_META = "#4A5568";
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
/** Primary CTAs (matches app `btn-primary` / 5px corner spec). */
export const SUITE_RADIUS_BUTTON = 5;
/** Hover state for bright blue CTAs (matches `brand-blueHover`). */
export const SUITE_ACCENT_HOVER = "#059BD8";

/** Layered, soft elevation (avoid heavy navy-tinted shadows). */
export const SUITE_SHADOW_CARD: CSSProperties["boxShadow"] =
  "0 2px 16px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.06)";
export const SUITE_SHADOW_FLOAT: CSSProperties["boxShadow"] =
  "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)";
export const SUITE_SHADOW_TAB_PILL: CSSProperties["boxShadow"] =
  "0 1px 3px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04)";

/** Structural vertical accent (suite-wide rails). */
export const SUITE_PANEL_RAIL = "rgba(7, 176, 242, 0.55)";

/**
 * Nested insight cards (Strategy marketing blocks, narrative sub-panels, priority chart shell).
 * Pairs with `SUITE_INSIGHT_CARD_RAIL_LEFT` when a vertical brand rail is desired.
 */
export const SUITE_INSIGHT_CARD_BASE: CSSProperties = {
  background: "linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 55%)",
  border: `1px solid ${SUITE_BORDER}`,
  borderRadius: SUITE_RADIUS_MD,
  boxShadow: SUITE_SHADOW_CARD,
};

export const SUITE_INSIGHT_CARD_RAIL_LEFT: CSSProperties = {
  borderLeft: `3px solid ${SUITE_PANEL_RAIL}`,
};

/** Softer inset for secondary metrics / muted columns (execution guidance grid). */
export const SUITE_INSIGHT_CARD_MUTED: CSSProperties = {
  background: "linear-gradient(180deg, #F6F8FC 0%, #FAFBFD 100%)",
  border: `1px solid ${SUITE_BORDER}`,
  borderRadius: SUITE_RADIUS_MD,
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.045)",
};

/** Max content width for results suite (tab nav, tab bodies, sidebar layouts). */
export const SUITE_CONTENT_MAX_PX = 1280;

/** Interactive / highlight accent (CTAs, icons, callout labels). */
export const SUITE_ACCENT_BRIGHT = SUITE_BLUE;

/**
 * Section nav selected state — matches Foundation left rail + suite chip row (light blue wash).
 * Kept in the Wunderbar blue family so Results / Foundation / Strategy feel like one chrome system.
 */
export const SUITE_SECTION_ACTIVE = SUITE_BLUE;
export const SUITE_SECTION_ACTIVE_BORDER = "rgba(7, 176, 242, 0.4)";
export const SUITE_SECTION_ACTIVE_BG = "#E6F7FE";

/** Foundation sidebar inactive row text (slightly softer than navy for hierarchy vs selected). */
export const SUITE_NAV_ITEM_MUTED = "#1A1A1A";

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

/**
 * Large suite panels (Strategy marketing block, narrative sections, archetype card).
 * Barely-there cool wash — rail + icons carry brand blue; panel fill stays calm.
 */
export const SUITE_COOL_PANEL_TINT =
  "linear-gradient(165deg, rgba(7, 176, 242, 0.028) 0%, #FAFAFC 55%, #FFFFFF 100%)" as const;

/** Top-of-tab insight band (replaces flat bright blue boxes). */
export const SUITE_INTRO_BAND_STYLE: CSSProperties = {
  marginBottom: 16,
  padding: "20px 22px",
  border: "1px solid rgba(7, 176, 242, 0.22)",
  borderRadius: SUITE_RADIUS_LG,
  background: "linear-gradient(165deg, rgba(7, 176, 242, 0.09) 0%, rgba(255, 255, 255, 0.97) 55%, #FFFFFF 100%)",
  boxShadow: SUITE_SHADOW_CARD,
};

/** Kicker / eyebrow line above tab intro titles (Results, Foundation). */
export const SUITE_INTRO_EYEBROW_TEXT_STYLE: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "0.06em",
  color: SUITE_ACCENT_BRIGHT,
};

/**
 * Bright blue in-card subheads — matches Foundation tab
 * (`text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue` in `FoundationBlueprintContent.tsx`).
 */
export const SUITE_FOUNDATION_SUBHEAD_STYLE: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.08em",
  color: SUITE_ACCENT_BRIGHT,
  fontFamily: SUITE_FONT_UI,
};

/** Title line under the eyebrow (matches Foundation tab intros). */
export const SUITE_INTRO_TITLE_TEXT_STYLE: CSSProperties = {
  margin: "0 0 6px",
  fontSize: 20,
  fontWeight: 600,
  letterSpacing: "-0.02em",
  lineHeight: 1.25,
  color: SUITE_NAVY,
};

/** Muted guidance under the intro title. */
export const SUITE_INTRO_GUIDANCE_TEXT_STYLE: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: SUITE_MUTED,
  lineHeight: 1.55,
  fontWeight: 400,
};

/**
 * Outer padding + width for Suite tabs that mirror the Foundation tab shell
 * (Strategy, Brand Standards, Activation, Workbook, Downloads).
 */
export const SUITE_TAB_BODY_SHELL: CSSProperties = {
  width: "100%",
  maxWidth: SUITE_CONTENT_MAX_PX,
  margin: "0 auto",
  padding: "28px min(24px, 4vw) 88px",
  fontFamily: SUITE_FONT_UI,
  boxSizing: "border-box",
};

/**
 * Small blue section headers on Results (pillar cards, context meter, hero kickers).
 * Tailwind must see this string; this file lives under components/ so it is picked up by the Tailwind content globs.
 */
export const SUITE_SECTION_KICKER_CLASS =
  "text-[14px] font-semibold tracking-[0.08em] text-brand-blue";

export const SUITE_BACKDROP_BLUR: CSSProperties = {
  backdropFilter: "saturate(180%) blur(20px)",
  WebkitBackdropFilter: "saturate(180%) blur(20px)",
};
