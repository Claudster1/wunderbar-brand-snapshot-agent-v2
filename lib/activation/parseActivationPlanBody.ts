export type ActivationBodySection = {
  id: string;
  title: string;
  content: string;
};

function slugPart(input: string, max = 40): string {
  const s = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, max);
  return s || "section";
}

/**
 * Splits long activation playbook prose into navigable sections.
 * Detects lines like `1) Title` or `2. Title` as section boundaries.
 */
export function splitActivationBodyIntoSections(body: string): ActivationBodySection[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\n(?=\s*\d+[).]\s+)/);
  const out: ActivationBodySection[] = [];

  parts.forEach((part, idx) => {
    const chunk = part.trim();
    if (!chunk) return;
    const lines = chunk.split("\n");
    const first = lines[0]?.trim() ?? "";
    const numMatch = first.match(/^(\d+[).])\s*(.+)$/);
    if (numMatch) {
      const title = `${numMatch[1]} ${numMatch[2]}`.trim();
      const content = lines.slice(1).join("\n").trim();
      out.push({
        id: `ap-sec-${idx}-${slugPart(numMatch[2])}`,
        title,
        content,
      });
      return;
    }

    const firstLine = first;
    const rest = lines.slice(1).join("\n").trim();
    const isLikelyTitle =
      firstLine.length > 0 &&
      firstLine.length <= 96 &&
      !firstLine.endsWith(".") &&
      lines.length > 1;

    if (isLikelyTitle) {
      out.push({
        id: `ap-intro-${idx}-${slugPart(firstLine)}`,
        title: firstLine,
        content: rest,
      });
    } else {
      out.push({
        id: `ap-block-${idx}`,
        title: idx === 0 ? "Overview" : `Section ${idx + 1}`,
        content: chunk,
      });
    }
  });

  return out;
}
