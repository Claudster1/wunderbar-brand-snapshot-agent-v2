/**
 * Parse email sequence "send map" blocks into schedule rows
 * (markdown table or numbered Day · Stage — Subject lines).
 */

export type EmailSendMapRow = {
  emailNum: string;
  when: string;
  stage: string;
  subject: string;
};

const TABLE_ROW = /^\|(.+)\|$/;
const TABLE_SEP = /^\|[\s:|-]+\|$/;
const NUMBERED_SEND =
  /^(\d+)\.\s+(.+?)\s+[·•]\s+(.+?)\s+[—–-]\s+(.+)$/;

function splitPipeCells(line: string): string[] {
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((c) => c.trim());
}

function isSendMapHeader(cells: string[]): boolean {
  const joined = cells.map((c) => c.toLowerCase()).join(" ");
  return (
    (joined.includes("email") || joined.includes("#")) &&
    (joined.includes("when") || joined.includes("day") || joined.includes("send")) &&
    (joined.includes("stage") ||
      joined.includes("subject") ||
      joined.includes("job") ||
      joined.includes("purpose"))
  );
}

function parseMarkdownSendTable(lines: string[], start: number): { rows: EmailSendMapRow[]; end: number } | null {
  if (start >= lines.length || !TABLE_ROW.test(lines[start]!.trim())) return null;
  const headerCells = splitPipeCells(lines[start]!);
  if (!isSendMapHeader(headerCells)) return null;

  let i = start + 1;
  if (i < lines.length && TABLE_SEP.test(lines[i]!.trim())) i++;

  const rows: EmailSendMapRow[] = [];
  while (i < lines.length) {
    const trimmed = lines[i]!.trim();
    if (!TABLE_ROW.test(trimmed) || TABLE_SEP.test(trimmed)) break;
    const cells = splitPipeCells(trimmed);
    if (cells.length < 4) break;
    const [emailNum, when, stage, ...subjectParts] = cells;
    const subject = subjectParts.join(" | ").trim();
    if (!emailNum || !when || !stage || !subject) break;
    rows.push({ emailNum, when, stage, subject });
    i++;
  }
  return rows.length > 0 ? { rows, end: i } : null;
}

function parseNumberedSendList(lines: string[], start: number): { rows: EmailSendMapRow[]; end: number } | null {
  const rows: EmailSendMapRow[] = [];
  let i = start;
  while (i < lines.length) {
    const trimmed = lines[i]!.trim();
    if (!trimmed) {
      if (rows.length > 0) break;
      i++;
      continue;
    }
    const m = trimmed.match(NUMBERED_SEND);
    if (!m) break;
    rows.push({
      emailNum: m[1]!,
      when: m[2]!.trim(),
      stage: m[3]!.trim(),
      subject: m[4]!.trim(),
    });
    i++;
  }
  return rows.length >= 2 ? { rows, end: i } : null;
}

function isSendMapTitle(line: string): boolean {
  const t = line.replace(/\*\*/g, "").trim().toLowerCase();
  return (
    t.startsWith("send map") ||
    t.startsWith("at a glance") ||
    t === "email sequence schedule" ||
    t.startsWith("sequence schedule")
  );
}

/**
 * Pull the first send-map schedule out of section prose.
 * Returns surrounding text so callers can still render intro / outro.
 */
export function extractEmailSendMap(content: string): {
  before: string;
  rows: EmailSendMapRow[];
  after: string;
} | null {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i]!.trim();

    const fromTable = parseMarkdownSendTable(lines, i);
    if (fromTable) {
      let beforeEnd = i;
      if (beforeEnd > 0 && isSendMapTitle(lines[beforeEnd - 1]!.trim())) beforeEnd--;
      if (beforeEnd > 0 && !lines[beforeEnd - 1]!.trim()) beforeEnd--;
      return {
        before: lines.slice(0, beforeEnd).join("\n").trim(),
        rows: fromTable.rows,
        after: lines.slice(fromTable.end).join("\n").trim(),
      };
    }

    if (isSendMapTitle(trimmed)) {
      let j = i + 1;
      while (j < lines.length && !lines[j]!.trim()) j++;
      const fromList = parseNumberedSendList(lines, j);
      const fromTableAfterTitle = parseMarkdownSendTable(lines, j);
      const parsed = fromTableAfterTitle ?? fromList;
      if (parsed) {
        return {
          before: lines.slice(0, i).join("\n").trim(),
          rows: parsed.rows,
          after: lines.slice(parsed.end).join("\n").trim(),
        };
      }
    }

    const fromList = parseNumberedSendList(lines, i);
    if (fromList && fromList.rows.length >= 3) {
      return {
        before: lines.slice(0, i).join("\n").trim(),
        rows: fromList.rows,
        after: lines.slice(fromList.end).join("\n").trim(),
      };
    }
  }
  return null;
}
