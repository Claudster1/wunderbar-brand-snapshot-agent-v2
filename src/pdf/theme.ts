// src/pdf/theme.ts
// Centralized theme configuration for all PDF documents
// Ensures consistency across WunderBrand Snapshot™, Snapshot+™, Blueprint™, and Blueprint+™ reports

import { StyleSheet } from "@react-pdf/renderer";

// ============================================================
// PDF THEME
// ============================================================
export const pdfTheme = {
  colors: {
    navy: "#021859",
    blue: "#07B0F2",
    aqua: "#27CDF2",
    midnight: "#0C1526",
    gray: "#F2F2F2",
    border: "#E6E6E6",
    text: "#0C1526",
  },
  fontSizes: {
    xs: 9,
    sm: 11,
    base: 12,
    md: 14,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
} as const;

// ============================================================
// BRAND COLORS (for backward compatibility and extended use)
// ============================================================
export const colors = {
  // Primary brand colors
  navy: pdfTheme.colors.navy,
  blue: pdfTheme.colors.blue,
  aqua: pdfTheme.colors.aqua,
  
  // Text colors
  textPrimary: pdfTheme.colors.text,
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  midnight: pdfTheme.colors.midnight,
  
  // Background colors
  bgPrimary: "#FFFFFF",
  bgSecondary: pdfTheme.colors.gray,
  bgTertiary: "#F9FAFB",
  
  // Border colors
  borderLight: pdfTheme.colors.border,
  borderMedium: "#E0E3EA",
  borderDark: "#D1D5DB",
  
  // Status colors (for scores, meters)
  success: "#22C55E",
  warning: "#FACC15",
  error: "#EF4444",
} as const;

// ============================================================
// TYPOGRAPHY / FONTS
// ============================================================
export const fonts = {
  // Font families
  primary: "Inter",           // Primary font (Inter)
  fallback: "Helvetica Neue", // Fallback if Inter not available
  system: "System Sans",      // System fallback
  
  // Font weights
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  
  // Font sizes (using pdfTheme)
  xs: pdfTheme.fontSizes.xs,
  sm: pdfTheme.fontSizes.sm,
  base: pdfTheme.fontSizes.base,
  md: pdfTheme.fontSizes.md,
  lg: pdfTheme.fontSizes.lg,
  xl: pdfTheme.fontSizes.xl,
  "2xl": pdfTheme.fontSizes.xxl,
  "3xl": 26,
  "4xl": 28,
  "5xl": 32,
  "6xl": 36,
  
  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// ============================================================
// SPACING
// ============================================================
export const spacing = {
  // Base spacing (using pdfTheme)
  xs: pdfTheme.spacing.xs,
  sm: pdfTheme.spacing.sm,
  md: pdfTheme.spacing.md,
  lg: pdfTheme.spacing.lg,
  xl: pdfTheme.spacing.xl,
  "2xl": pdfTheme.spacing.xxl,
  "3xl": 60,
  
  // Common spacing patterns
  pagePadding: 40,           // Standard page padding
  sectionSpacing: 20,         // Space between sections
  elementSpacing: 12,         // Space between elements
  tightSpacing: 6,            // Tight spacing
  looseSpacing: 30,           // Loose spacing
} as const;

// ============================================================
// LAYOUT PRESETS
// ============================================================
export const layout = {
  // Page settings
  page: {
    size: "A4",
    padding: spacing.pagePadding,
    fontFamily: fonts.primary,
    fontSize: fonts.base,
    lineHeight: fonts.normal,
    color: colors.textPrimary,
  },
  
  // Container widths
  container: {
    full: "100%",
    narrow: "80%",
    wide: "90%",
  },
  
  // Border radius
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 10,
    full: 9999,
  },
  
  // Border widths
  border: {
    thin: "1px",
    medium: "2px",
    thick: "3px",
  },
} as const;

// ============================================================
// STYLE PRESETS (React-PDF StyleSheet)
// ============================================================
export const stylePresets = StyleSheet.create({
  // Page base
  page: {
    padding: layout.page.padding,
    fontFamily: fonts.primary,
    fontSize: pdfTheme.fontSizes.base,
    lineHeight: fonts.normal,
    color: pdfTheme.colors.text,
  },
  
  // Typography
  h1: {
    fontSize: pdfTheme.fontSizes.xxl,
    fontWeight: fonts.bold,
    color: pdfTheme.colors.navy,
    marginBottom: pdfTheme.spacing.md,
  },
  
  h2: {
    fontSize: pdfTheme.fontSizes.lg,
    fontWeight: fonts.bold,
    color: pdfTheme.colors.navy,
    marginTop: pdfTheme.spacing.xl,
    marginBottom: pdfTheme.spacing.sm,
  },
  
  h3: {
    fontSize: pdfTheme.fontSizes.md,
    fontWeight: fonts.semibold,
    marginTop: pdfTheme.spacing.lg,
    marginBottom: pdfTheme.spacing.xs,
    color: pdfTheme.colors.navy,
  },
  
  h4: {
    fontSize: pdfTheme.fontSizes.base,
    fontWeight: fonts.semibold,
    marginTop: pdfTheme.spacing.md,
    marginBottom: pdfTheme.spacing.xs,
    color: pdfTheme.colors.navy,
  },
  
  body: {
    fontSize: pdfTheme.fontSizes.base,
    lineHeight: fonts.normal,
    color: pdfTheme.colors.text,
  },
  
  small: {
    fontSize: pdfTheme.fontSizes.sm,
    color: colors.textSecondary,
  },
  
  caption: {
    fontSize: pdfTheme.fontSizes.xs,
    color: colors.textMuted,
  },
  
  // Layout containers
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  
  container: {
    marginBottom: spacing.lg,
  },
  
  // Score box
  scoreBox: {
    padding: pdfTheme.spacing.md,
    borderRadius: layout.radius.lg,
    backgroundColor: pdfTheme.colors.gray,
    border: `${layout.border.thin} solid ${pdfTheme.colors.border}`,
    marginBottom: pdfTheme.spacing.md,
  },
  
  // Meter/track
  meterTrack: {
    width: "100%",
    height: 8,
    borderRadius: layout.radius.xl,
    backgroundColor: colors.borderLight,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  
  // Table styles
  tableRow: {
    flexDirection: "row",
    borderBottom: `${layout.border.thin} solid ${colors.borderLight}`,
    paddingVertical: spacing.sm,
  },
  
  // Card/block styles
  card: {
    padding: pdfTheme.spacing.md,
    borderRadius: layout.radius.md,
    backgroundColor: pdfTheme.colors.gray,
    marginBottom: pdfTheme.spacing.md,
  },
  
  // Divider
  divider: {
    borderBottom: `${layout.border.thin} solid ${pdfTheme.colors.border}`,
    marginVertical: pdfTheme.spacing.md,
  },
  
  // Footer
  footer: {
    marginTop: spacing["2xl"],
    fontSize: pdfTheme.fontSizes.sm,
    textAlign: "center",
    color: colors.textSecondary,
  },
  
  // Utility classes
  textCenter: {
    textAlign: "center",
  },
  
  textRight: {
    textAlign: "right",
  },
  
  bold: {
    fontWeight: fonts.bold,
  },
  
  semibold: {
    fontWeight: fonts.semibold,
  },
  
  uppercase: {
    textTransform: "uppercase",
  },
  
  capitalize: {
    textTransform: "capitalize",
  },
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get meter fill color based on score
 */
export const getMeterFillColor = (score: number): string => {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.warning;
  return colors.error;
};

/**
 * Get meter fill style
 */
export const getMeterFill = (percent: number) => ({
  width: `${percent}%`,
  height: 8,
  borderRadius: layout.radius.xl,
  backgroundColor: getMeterFillColor(percent),
});

/**
 * Get column width helper
 */
export const getCol = (width: string) => ({
  width,
  paddingRight: spacing.sm,
});

/**
 * Get color swatch style
 */
export const getColorSwatch = (hex: string, size: number = 24) => ({
  width: size,
  height: size,
  borderRadius: layout.radius.sm,
  backgroundColor: hex,
  border: `${layout.border.thin} solid ${colors.borderLight}`,
});

/**
 * Get score label based on score
 */
export const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Excellent Alignment";
  if (score >= 60) return "Strong Foundation";
  return "Needs Focused Attention";
};

/**
 * Get pillar score label
 */
export const getPillarScoreLabel = (score: number): string => {
  if (score >= 18) return "Excellent";
  if (score >= 15) return "Strong";
  if (score >= 12) return "Steady";
  if (score >= 9) return "Mixed";
  return "Needs Attention";
};

// ============================================================
// EXPORTS
// ============================================================
export default {
  pdfTheme,
  colors,
  fonts,
  spacing,
  layout,
  stylePresets,
  helpers: {
    getMeterFillColor,
    getMeterFill,
    getCol,
    getColorSwatch,
    getScoreLabel,
    getPillarScoreLabel,
  },
};
