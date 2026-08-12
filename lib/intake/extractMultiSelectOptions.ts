/**
 * When Wundy writes a "You can select multiple:" bullet list in chat,
 * turn those lines into tappable quick-reply pills (user can still type their own).
 */

const SELECT_MULTIPLE_RE = /you can select multiple\s*:/i;
const BULLET_LINE_RE = /^\s*(?:[-*•–—]|\d+[.)])\s+(.+?)\s*$/;

export function extractMultiSelectOptions(assistantText: string | null | undefined): string[] {
  if (!assistantText || !SELECT_MULTIPLE_RE.test(assistantText)) return [];

  const match = assistantText.match(SELECT_MULTIPLE_RE);
  if (!match || match.index == null) return [];

  const after = assistantText.slice(match.index + match[0].length);
  const lines = after.split(/\r?\n/);
  const options: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (options.length > 0) break;
      continue;
    }
    const bullet = trimmed.match(BULLET_LINE_RE);
    if (!bullet) {
      if (options.length > 0) break;
      continue;
    }
    const label = bullet[1].replace(/\s+/g, " ").trim();
    if (!label || label.length > 120) continue;
    if (options.some((o) => o.toLowerCase() === label.toLowerCase())) continue;
    options.push(label);
    if (options.length >= 9) break;
  }

  return options;
}
