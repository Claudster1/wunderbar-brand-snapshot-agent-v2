/**
 * Optional `conversionSpine` on channel strategies ties every playbook to one macro conversion,
 * one offer anchor, and this section’s job on the path (Blueprint+ contract).
 */

export type ConversionSpineFields = {
  primaryMacroConversion: string;
  primaryOfferAnchor: string;
  advancesConversion: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function extractConversionSpine(
  record: Record<string, unknown> | null | undefined,
): ConversionSpineFields | null {
  if (!record) return null;
  const raw = asRecord(record.conversionSpine);
  if (!raw) return null;
  const primaryMacroConversion =
    typeof raw.primaryMacroConversion === "string" ? raw.primaryMacroConversion.trim() : "";
  const primaryOfferAnchor =
    typeof raw.primaryOfferAnchor === "string" ? raw.primaryOfferAnchor.trim() : "";
  const advancesConversion =
    typeof raw.advancesConversion === "string" ? raw.advancesConversion.trim() : "";
  if (!primaryMacroConversion && !primaryOfferAnchor && !advancesConversion) return null;
  return { primaryMacroConversion, primaryOfferAnchor, advancesConversion };
}

/** Plain lines for diagnostics / export (no markdown ## so it nests under existing headings). */
export function formatConversionSpinePlainLines(spine: ConversionSpineFields): string[] {
  const out: string[] = ["Conversion focus (this strategy)"];
  if (spine.primaryMacroConversion) {
    out.push(`Main conversion goal: ${spine.primaryMacroConversion}`);
  }
  if (spine.primaryOfferAnchor) {
    out.push(`Primary offer: ${spine.primaryOfferAnchor}`);
  }
  if (spine.advancesConversion) {
    out.push(`How this channel helps: ${spine.advancesConversion}`);
  }
  return out;
}

/** Markdown block for bodies that support ## sections (prepended ahead of overview). */
export function formatConversionSpineMarkdownBlock(spine: ConversionSpineFields): string {
  const lines = [
    "## Conversion focus",
    "",
    spine.primaryMacroConversion
      ? `**Main conversion goal:** ${spine.primaryMacroConversion}`
      : "",
    spine.primaryOfferAnchor ? `**Primary offer:** ${spine.primaryOfferAnchor}` : "",
    spine.advancesConversion ? `**How this channel helps:** ${spine.advancesConversion}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}
