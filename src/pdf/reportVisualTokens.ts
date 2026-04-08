/**
 * Report visual language — PDF + web preview alignment
 *
 * • Green / red: RESERVED for explicit guidance pairs only — Do / Don’t, Use / Avoid,
 *   Show / Avoid, Phrases to use / avoid (same semantic as do/don’t).
 * • Illustrative content (Before/After rewrites, concrete examples, “state A → state B”):
 *   neutral slate + brand blue — never red/green.
 * • Generic “Example” callouts: muted label + italic body (navy text), no semantic colors.
 */
import { pdfTheme } from "./theme";

export const SEMANTIC_DO = {
  border: "#059669",
  bg: "#F0FDF4",
  label: "#059669",
  text: "#0C1526",
} as const;

export const SEMANTIC_DONT = {
  border: "#EF4444",
  bg: "#FEF2F2",
  label: "#991B1B",
  text: "#0C1526",
} as const;

/** Before / After illustration (not “bad vs good” judgment — narrative transformation) */
export const ILLUSTRATION_BEFORE = {
  border: "#94A3B8",
  bg: "#F8FAFC",
  label: "#475569",
} as const;

export const ILLUSTRATION_AFTER = {
  border: pdfTheme.colors.blue,
  bg: "#F8FBFF",
  label: pdfTheme.colors.navy,
} as const;

/** Shared “Example” line (voice traits, snippets, samples) */
export const EXAMPLE_CALLOUT = {
  labelColor: "#6B7280",
  bodyColor: "#0C1526",
  /** Preferred prefix in generated copy */
  labelPrefix: "Example —",
} as const;
