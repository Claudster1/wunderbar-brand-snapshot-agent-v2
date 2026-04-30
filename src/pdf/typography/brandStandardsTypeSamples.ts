// Helpers for Brand Standards PDF typography samples: map workbook / AI strings
// to registered @react-pdf families and numeric weights.

export const PDF_BRAND_STANDARDS_FAMILIES = ["Inter", "Lato", "Merriweather"] as const;
export type PdfBrandStandardsFamily = (typeof PDF_BRAND_STANDARDS_FAMILIES)[number];

const DEFAULT_SIZES_PT = {
  headline: 28,
  subhead: 18,
  body: 12,
  caption: 9,
  accent: 11,
} as const;

/** Resolve free-text font names from typography_recommendations to a registered PDF family. */
export function resolvePdfFontFamily(input: string | undefined | null): PdfBrandStandardsFamily {
  const raw = (input ?? "").toLowerCase().replace(/['"]/g, "").trim();
  if (!raw) return "Inter";

  const strip = raw
    .replace(/\b(bold|semibold|medium|regular|light|italic|oblique)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const candidates: Array<{ re: RegExp; family: PdfBrandStandardsFamily }> = [
    { re: /\bmerriweather\b/, family: "Merriweather" },
    { re: /\blato\b/, family: "Lato" },
    { re: /\binter\b/, family: "Inter" },
    { re: /\b(source serif|source-serif|georgia|times|serif headline)\b/, family: "Merriweather" },
    { re: /\b(open sans|opensans|roboto|poppins|montserrat|nunito|work sans|raleway|figtree)\b/, family: "Inter" },
  ];

  for (const { re, family } of candidates) {
    if (re.test(strip) || re.test(raw)) return family;
  }

  return "Inter";
}

/** Numeric fontWeight for react-pdf Text (must match registered files per family). */
export function mapTypographyWeightToNumeric(
  weightInput: string | undefined | null,
  family: PdfBrandStandardsFamily,
): number {
  const w = (weightInput ?? "").toLowerCase();

  let tier: "bold" | "semibold" | "medium" | "normal" = "normal";
  if (/\b(black|heavy|extrabold|ultrabold|800|900)\b/.test(w) || /^8|9/.test(w.trim())) tier = "bold";
  else if (/\b(bold|700)\b/.test(w) || w.includes("700")) tier = "bold";
  else if (/\b(semibold|demi|600)\b/.test(w) || w.includes("600")) tier = "semibold";
  else if (/\b(medium|500)\b/.test(w) || w.includes("500")) tier = "medium";

  if (family === "Lato") {
    if (tier === "bold" || tier === "semibold") return 700;
    if (tier === "medium") return 400;
    return 400;
  }

  if (tier === "bold") return 700;
  if (tier === "semibold") return 600;
  if (tier === "medium") return 500;
  return 400;
}

/** Parse "28–36pt", "11-13 pt", "16px" into a single pt size for the sample line. */
export function parseTypeSizePt(input: string | undefined | null, fallbackPt: number): number {
  if (!input) return fallbackPt;
  const nums = input.match(/\d+(\.\d+)?/g);
  if (!nums?.length) return fallbackPt;
  const values = nums.map((n) => Number.parseFloat(n)).filter((n) => Number.isFinite(n));
  if (!values.length) return fallbackPt;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const pt = input.toLowerCase().includes("px") ? avg * 0.75 : avg;
  return Math.min(56, Math.max(8, Math.round(pt)));
}

export function sampleStyleForRole(
  level: { font?: string; weight?: string; size?: string } | undefined,
  role: keyof typeof DEFAULT_SIZES_PT,
): {
  fontFamily: PdfBrandStandardsFamily;
  fontSize: number;
  fontWeight: number;
} {
  const family = resolvePdfFontFamily(level?.font);
  const fallback = DEFAULT_SIZES_PT[role];
  const fontSize = parseTypeSizePt(level?.size, fallback);
  const fontWeight = mapTypographyWeightToNumeric(level?.weight, family);
  return { fontFamily: family, fontSize, fontWeight };
}
