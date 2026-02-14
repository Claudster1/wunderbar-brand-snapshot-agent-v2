/**
 * Shared Design Tokens for WunderBrand Suite™ Reports
 * ─────────────────────────────────────────────────────
 * Single source of truth for colors, spacing, typography, and radii
 * used across all four report tiers (Snapshot, Snapshot+, Blueprint, Blueprint+).
 */

/* ═══ COLOR TOKENS ═══ */
export const COLORS = {
  // Brand primaries
  NAVY: "#021859",
  BLUE: "#07B0F2",
  WHITE: "#FFFFFF",

  // Backgrounds
  LIGHT_BG: "#F4F7FB",
  ACCENT_BG: "#EEF6FE",

  // Text
  TEXT_PRIMARY: "#1a1a2e",     // Body text
  TEXT_HEADING: "#021859",     // Headings (same as NAVY)
  SUB: "#5A6B7E",             // Secondary/caption text
  TEXT_MUTED: "#8A97A8",       // Confidential lines, footer fine print
  TEXT_TERTIARY: "#94A3B8",    // Gauge ticks, very light labels

  // Borders
  BORDER: "#D6E4F0",
  BORDER_SUBTLE: "#E2E8F0",   // Track backgrounds, subtle dividers

  // Semantic / pillar
  GREEN: "#22C55E",
  GREEN_DARK: "#16A34A",
  GOOD_GREEN: "#16A34A",
  YELLOW: "#EAB308",
  YELLOW_DARK: "#92700C",
  ORANGE: "#F97316",
  RED_S: "#EF4444",

  // Preview banner
  BANNER_BG: "#fff9e6",
  BANNER_BORDER: "#f5e6b3",
  BANNER_TEXT: "#8b6914",
} as const;

/* ═══ SPACING SCALE (8px base) ═══ */
export const SPACE = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
} as const;

/* ═══ TYPOGRAPHY SCALE ═══ */
export const TYPE = {
  xs: 10,        // TM superscripts, gauge ticks
  sm: 12,        // Labels, eyebrows, badges
  caption: 13,   // Dates, captions, secondary info
  body_sm: 14,   // Small body, descriptions
  body: 16,      // Main body copy
  body_lg: 18,   // Emphasis body, pullquotes
  subtitle: 20,  // Section titles (default)
  title: 22,     // Report name in header
  heading: 24,   // Section titles (hero), business name
  display: 30,   // Key card values
  score: 50,     // Main gauge score
} as const;

/* ═══ LINE HEIGHTS ═══ */
export const LEADING = {
  none: 1,
  tight: 1.3,
  normal: 1.6,
  relaxed: 1.75,
} as const;

/* ═══ FONT WEIGHTS ═══ */
export const WEIGHT = {
  light: 300,
  regular: 400,
  bold: 700,
  black: 900,
} as const;

/* ═══ BORDER RADIUS ═══ */
export const RADIUS = {
  sm: 4,
  md: 5,     // Cards, buttons
  lg: 8,     // Larger cards
  xl: 10,    // Feature cards
  full: 9999,
} as const;

/* ═══ REPORT HEADER DOT PATTERN CSS ═══ */
export const HEADER_DOT_PATTERN: React.CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  width: "40%",
  opacity: 0.04,
  backgroundImage: `radial-gradient(${COLORS.NAVY} 1px, transparent 1px)`,
  backgroundSize: "16px 16px",
};

/* ═══ REPORT MOBILE + PRINT STYLES ═══ */
export const REPORT_RESPONSIVE_STYLES = `
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    [data-section] { page-break-inside: avoid; break-inside: avoid; }
    [data-page-break] { page-break-before: always; break-before: page; }
    button { display: none !important; }
  }
  @media (max-width: 640px) {
    [data-report] { font-size: 15px; }
    [data-header-top] { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
    [data-header-info] { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
    [data-header-actions] { align-items: flex-start !important; }
    [data-key-cards] { grid-template-columns: 1fr !important; }
    [data-gauge-row] { flex-direction: column !important; align-items: center !important; gap: 20px !important; }
    [data-pillar-meters] { grid-template-columns: 1fr !important; }
    [data-pillar-detail] { grid-template-columns: 1fr !important; }
    [data-pillar-header] { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
    [data-archetype-layout] { flex-direction: column !important; align-items: center !important; }
    [data-archetype-content] { min-width: 0 !important; width: 100% !important; }
    [data-section] { padding: 20px 16px !important; }
    [data-how-to-read] { flex-direction: column !important; gap: 8px !important; }
    [data-action-item] { flex-direction: column !important; gap: 10px !important; }
    [data-suite-cards] { grid-template-columns: 1fr !important; }
    [data-before-after] { grid-template-columns: 1fr !important; }
    [data-archetype-cards] { grid-template-columns: 1fr !important; }
    [data-focus-cards] { grid-template-columns: 1fr !important; }
    [data-voice-traits] { flex-wrap: wrap !important; }
    [data-two-col] { grid-template-columns: 1fr !important; }
    [data-three-col] { grid-template-columns: 1fr !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
