/**
 * Shared suite visual language for all PDF exports.
 * Mirrors `components/results/suiteBrandTokens` for react-pdf StyleSheets.
 */
import { StyleSheet } from "@react-pdf/renderer";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BG_PAGE,
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_MD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";
import { PDF_HEADER_RESERVED } from "./components/PdfHeader";
import { PDF_FOOTER_RESERVED } from "./components/PdfFooter";

export const SUITE_PDF = {
  navy: SUITE_NAVY,
  blue: SUITE_ACCENT_BRIGHT,
  aqua: "#27CDF2",
  border: SUITE_BORDER,
  muted: SUITE_MUTED,
  text: SUITE_TEXT_PRIMARY,
  pageBg: SUITE_BG_PAGE,
  cardBg: "#FFFFFF",
  rail: "rgba(7, 176, 242, 0.55)",
  font: "Lato",
  radius: SUITE_RADIUS_MD,
  headerPad: PDF_HEADER_RESERVED + 8,
  footerPad: PDF_FOOTER_RESERVED + 8,
} as const;

/** Drop-in page + typography + card styles for Downloads library documents. */
export const suiteDocStyles = StyleSheet.create({
  page: {
    paddingTop: SUITE_PDF.headerPad,
    paddingBottom: SUITE_PDF.footerPad,
    paddingHorizontal: 36,
    fontFamily: SUITE_PDF.font,
    fontSize: 10,
    color: SUITE_PDF.text,
    lineHeight: 1.55,
    backgroundColor: SUITE_PDF.pageBg,
  },
  /** Body page without sticky PdfHeader (cover / divider siblings still use reserved footer). */
  pageBare: {
    paddingTop: 36,
    paddingBottom: SUITE_PDF.footerPad,
    paddingHorizontal: 36,
    fontFamily: SUITE_PDF.font,
    fontSize: 10,
    color: SUITE_PDF.text,
    lineHeight: 1.55,
    backgroundColor: SUITE_PDF.pageBg,
  },
  cover: {
    padding: 42,
    fontFamily: SUITE_PDF.font,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: SUITE_PDF.navy,
  },
  coverLogo: { width: 110, marginBottom: 36, opacity: 0.95 },
  coverTitle: {
    fontFamily: SUITE_PDF.font,
    fontSize: 28,
    fontWeight: 900,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  coverSubtitle: {
    fontFamily: SUITE_PDF.font,
    fontSize: 13,
    fontWeight: 600,
    color: SUITE_PDF.aqua,
    textAlign: "center",
    marginBottom: 28,
  },
  coverMeta: {
    fontFamily: SUITE_PDF.font,
    fontSize: 9,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.72,
    marginTop: 4,
  },
  h1: {
    fontFamily: SUITE_PDF.font,
    fontSize: 18,
    fontWeight: 700,
    color: SUITE_PDF.navy,
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: SUITE_PDF.font,
    fontSize: 13,
    fontWeight: 700,
    color: SUITE_PDF.navy,
    marginBottom: 6,
    marginTop: 14,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: SUITE_PDF.font,
    fontSize: 11,
    fontWeight: 700,
    color: SUITE_PDF.navy,
    marginBottom: 4,
    marginTop: 10,
  },
  h4: {
    fontFamily: SUITE_PDF.font,
    fontSize: 10,
    fontWeight: 700,
    color: SUITE_PDF.navy,
    marginBottom: 3,
    marginTop: 8,
  },
  body: {
    fontFamily: SUITE_PDF.font,
    fontSize: 10,
    lineHeight: 1.55,
    marginBottom: 6,
    color: SUITE_PDF.text,
  },
  small: {
    fontFamily: SUITE_PDF.font,
    fontSize: 9,
    color: SUITE_PDF.muted,
    lineHeight: 1.5,
  },
  label: {
    fontFamily: SUITE_PDF.font,
    fontSize: 8,
    fontWeight: 700,
    color: SUITE_PDF.blue,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
    marginTop: 10,
  },
  card: {
    backgroundColor: SUITE_PDF.cardBg,
    borderRadius: SUITE_PDF.radius,
    padding: 12,
    paddingLeft: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: SUITE_PDF.border,
    borderLeftWidth: 3,
    borderLeftColor: SUITE_PDF.rail,
  },
  cardTitle: {
    fontFamily: SUITE_PDF.font,
    fontSize: 11,
    fontWeight: 700,
    color: SUITE_PDF.navy,
    marginBottom: 4,
  },
  accentCard: {
    backgroundColor: SUITE_PDF.cardBg,
    borderRadius: SUITE_PDF.radius,
    padding: 12,
    paddingLeft: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: SUITE_PDF.border,
    borderLeftWidth: 3,
    borderLeftColor: SUITE_PDF.blue,
  },
  warnCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: SUITE_PDF.radius,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  bullet: {
    fontFamily: SUITE_PDF.font,
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 3,
    paddingLeft: 10,
    color: SUITE_PDF.text,
  },
  row: { flexDirection: "row", marginBottom: 6 },
  col2: { width: "50%", paddingRight: 8 },
  col3: { width: "33%", paddingRight: 6 },
});

/**
 * Merge suite base styles with document-specific extras.
 * Prefer spreading suite keys rather than redefining Helvetica / ice-blue cards.
 */
export function extendSuiteDocStyles<T extends Record<string, object>>(extra: T) {
  return {
    ...suiteDocStyles,
    ...StyleSheet.create(extra as any),
  } as typeof suiteDocStyles & T;
}
