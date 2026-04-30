/**
 * Workbook sections can contain multiple activation plans separated by markers.
 * Seeded format (see ResultsTabsShell):
 *   ---\n\nActivation plan: {label}\n{body...}
 * First block may omit the leading ---.
 */
export function extractActivationPlanBodyFromSectionText(
  sectionText: string,
  planLabel: string,
): string | null {
  const trimmed = typeof sectionText === "string" ? sectionText.trim() : "";
  if (!trimmed) return null;

  const marker = `Activation plan: ${planLabel}`;
  const idx = trimmed.indexOf(marker);
  if (idx === -1) return null;

  let after = trimmed.slice(idx + marker.length);
  after = after.replace(/^\s*\n/, "");

  const nextIdx = after.search(/\n---\s*\n\s*Activation plan:/);
  const block =
    nextIdx === -1 ? after.trim() : after.slice(0, nextIdx).trim();

  return block.length > 0 ? block : null;
}
