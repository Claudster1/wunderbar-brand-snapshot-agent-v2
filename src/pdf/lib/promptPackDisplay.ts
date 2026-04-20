import type { PromptItem } from "@/src/pdf/types/blueprintReport";

/** Accepts #RGB or #RRGGBB from strategy output. */
export function parseHexAccent(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const t = raw.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t;
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const r = t[1];
    const g = t[2];
    const b = t[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return undefined;
}

/**
 * Many engine outputs repeat the same long "brand guardrails" prefix in every `prompt`,
 * or duplicate `instruction` inside `prompt`. This shapes fields for readable PDFs.
 */
export function normalizePromptItemForPdf(
  p: PromptItem,
  options: { guardrailPrefix?: string } = {},
): {
  title: string;
  category: string;
  instructionBlock: string | null;
  copyBlock: string;
  whyItMatters: string;
} {
  let instruction = (p.instruction || "").trim();
  let prompt = (p.prompt || "").trim();
  const guard = (options.guardrailPrefix || "").trim();

  if (guard && prompt.startsWith(guard)) {
    prompt = prompt.slice(guard.length).replace(/^\s+/, "").trim();
  }

  if (instruction && prompt === instruction) {
    instruction = "";
  }

  if (instruction && prompt.startsWith(instruction)) {
    const rest = prompt.slice(instruction.length).replace(/^[\s.:;\-–—]+/, "").trim();
    if (rest.length > 12) {
      prompt = rest;
    }
  }

  if (!prompt && instruction) {
    prompt = instruction;
    instruction = "";
  }

  return {
    title: (p.title || "Untitled prompt").trim(),
    category: (p.category || "General").trim(),
    instructionBlock: instruction || null,
    copyBlock: prompt.trim() || "—",
    whyItMatters: (p.whyItMatters || "").trim(),
  };
}

export function allPromptBodiesIdentical(prompts: PromptItem[] | undefined): boolean {
  if (!prompts || prompts.length < 2) return false;
  const bodies = prompts.map((x) => (x.prompt || "").trim()).filter((x) => x.length > 0);
  if (bodies.length < 2) return false;
  const first = bodies[0];
  return bodies.every((b) => b === first);
}
