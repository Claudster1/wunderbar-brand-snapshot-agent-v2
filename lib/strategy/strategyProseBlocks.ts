export type StrategyProseBlock =
  | { type: "paragraph"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

const UL_LINE = /^\s*[-*•]\s+(.+)$/;
const OL_LINE = /^\s*\d+[.)]\s+(.+)$/;

function matchListLine(line: string): { kind: "ul" | "ol"; text: string } | null {
  const t = line.trimEnd();
  const ul = t.match(UL_LINE);
  if (ul?.[1]) return { kind: "ul", text: ul[1].trim() };
  const ol = t.match(OL_LINE);
  if (ol?.[1]) return { kind: "ol", text: ol[1].trim() };
  return null;
}

/**
 * Split strategy workbook / narrative prose into paragraphs vs list runs.
 * Paragraphs preserve internal newlines (pre-line friendly). List rows: `-`, `*`, `•`, or `1.` / `1)` style.
 */
export function parseStrategyProseToBlocks(raw: string): StrategyProseBlock[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: StrategyProseBlock[] = [];
  let para: string[] = [];
  let listKind: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushPara = () => {
    const text = para.join("\n").trim();
    if (text) blocks.push({ type: "paragraph", text });
    para = [];
  };

  const flushList = () => {
    if (listKind && listItems.length > 0) {
      blocks.push(listKind === "ul" ? { type: "ul", items: [...listItems] } : { type: "ol", items: [...listItems] });
    }
    listKind = null;
    listItems = [];
  };

  for (const line of lines) {
    if (!line.trim()) {
      flushList();
      flushPara();
      continue;
    }
    const hit = matchListLine(line);
    if (hit) {
      flushPara();
      if (listKind && listKind !== hit.kind) flushList();
      listKind = hit.kind;
      listItems.push(hit.text);
    } else {
      flushList();
      para.push(line.trimEnd());
    }
  }
  flushList();
  flushPara();
  return blocks;
}
