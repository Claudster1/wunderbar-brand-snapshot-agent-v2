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

function stripLeadingRule(content: string): string {
  return content.replace(/^---+(\s*\n)*/u, "").trim();
}

function parseMarkdownChunk(
  chunk: string,
  idx: number,
  level: "h2" | "h3",
): ActivationBodySection | null {
  const trimmed = chunk.trim();
  if (!trimmed) return null;
  const lines = trimmed.split("\n");
  const first = lines[0]?.trim() ?? "";
  const re = level === "h2" ? /^##\s+(.+)$/ : /^###\s+(.+)$/;
  const m = first.match(re);
  const title = m ? m[1].trim() : idx === 0 ? "Overview" : `Section ${idx + 1}`;
  const content = stripLeadingRule((m ? lines.slice(1) : lines).join("\n").trim());
  return {
    id: `ap-${level}-${idx}-${slugPart(title)}`,
    title,
    content,
  };
}

/**
 * Splits long activation playbook prose into navigable sections.
 * Prefers Markdown `##` / `###` headings (email + channel playbooks), then numbered `1)` / `2.` boundaries.
 */
export function splitActivationBodyIntoSections(body: string): ActivationBodySection[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  const hasH2 = /(?:^|\n)##\s/m.test(trimmed);
  if (hasH2) {
    const parts = trimmed.split(/\n(?=##\s)/m).map((p) => p.trim()).filter(Boolean);
    const out = parts.map((chunk, idx) => parseMarkdownChunk(chunk, idx, "h2")).filter((x): x is ActivationBodySection => x !== null);
    if (out.length > 0) return out;
  }

  const hasH3 = /(?:^|\n)###\s/m.test(trimmed);
  if (hasH3) {
    const parts = trimmed.split(/\n(?=###\s)/m).map((p) => p.trim()).filter(Boolean);
    const out = parts.map((chunk, idx) => parseMarkdownChunk(chunk, idx, "h3")).filter((x): x is ActivationBodySection => x !== null);
    if (out.length > 0) return out;
  }

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
