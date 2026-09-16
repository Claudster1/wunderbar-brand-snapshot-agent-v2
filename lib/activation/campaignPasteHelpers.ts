/**
 * Clipboard helpers for field-level Activation paste (ads, FAQ blocks, etc.).
 * Whole plans export as .md documents — do not clipboard-dump an entire playbook.
 */

export async function copyTextToClipboard(text: string): Promise<boolean> {
  const value = text.trim();
  if (!value) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** Strip light markdown so Meta/LinkedIn/email paste stays clean. */
export function plainTextForCampaignPaste(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Meta / LinkedIn-style paste block from paid channel fields. */
export function formatAdPlatformPaste(fields: {
  platform?: string;
  headline?: string;
  primaryText?: string;
  description?: string;
  cta?: string;
}): string {
  const lines: string[] = [];
  if (fields.platform) lines.push(`Platform: ${fields.platform}`);
  if (fields.headline) lines.push(`Headline: ${fields.headline}`);
  if (fields.primaryText) lines.push(`Primary text: ${fields.primaryText}`);
  if (fields.description) lines.push(`Description: ${fields.description}`);
  if (fields.cta) lines.push(`Button / next step: ${fields.cta}`);
  return lines.join("\n");
}
