import type { ActivationPlanSection } from "@/lib/activation/activationPlanModel";

/**
 * Single file users can import into Notion, Google Docs, Confluence, or split into Sheets rows.
 */
export function buildActivationPackMarkdown(
  sections: ActivationPlanSection[],
  meta: { companyName?: string; reportId?: string },
): string {
  const title = meta.companyName?.trim() || "Brand";
  const header = [
    `# Activation pack — ${title}`,
    "",
    meta.reportId ? `- Report ID: \`${meta.reportId}\`` : null,
    `- Generated: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "Open this file in Google Docs, Word, Notion, or any markdown editor. Copy the pieces you need into your email tool, ads account, or website — you do not paste the whole pack into one platform.",
    "",
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const blocks = sections.map((s) => buildOnePlanMarkdownBlock(s));

  return `${header}${blocks.join("\n")}`.trim() + "\n";
}

function buildOnePlanMarkdownBlock(
  section: Pick<ActivationPlanSection, "label" | "summary" | "body">,
): string {
  const body = (section.body || "").trim();
  return [
    `## ${section.label}`,
    "",
    `**Focus:** ${(section.summary || "").trim() || "—"}`,
    "",
    body || "_No playbook body for this section._",
    "",
    "---",
    "",
  ].join("\n");
}

/** One channel plan as a briefing doc (upload to Docs/Notion, then copy pieces out). */
export function buildActivationPlanSectionMarkdown(opts: {
  planLabel: string;
  summary?: string;
  companyName?: string;
  body: string;
}): string {
  const title = opts.companyName?.trim() || "Brand";
  const header = [
    `# ${opts.planLabel} — ${title}`,
    "",
    `- Generated: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "This is a working document for your team. Open it in Google Docs, Word, or Notion, then copy individual subjects, emails, ads, or page outlines into your tools — do not paste this whole file into your email tool or website builder.",
    "",
    "---",
    "",
  ].join("\n");

  return (
    header +
    buildOnePlanMarkdownBlock({
      label: opts.planLabel,
      summary: opts.summary || "",
      body: opts.body,
    }).trim() +
    "\n"
  );
}

function triggerMarkdownDownload(markdown: string, filenameBase: string): void {
  const safeName = filenameBase
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 48)
    .replace(/-+$/g, "");
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName || "activation-plan"}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadActivationPackMarkdown(
  sections: ActivationPlanSection[],
  meta: { companyName?: string; reportId?: string },
): void {
  const md = buildActivationPackMarkdown(sections, meta);
  const safeName = (meta.companyName || "activation-pack")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 48);
  triggerMarkdownDownload(md, `${safeName}-activation-pack`);
}

export function downloadActivationPlanSectionMarkdown(opts: {
  planLabel: string;
  summary?: string;
  companyName?: string;
  body: string;
}): void {
  const md = buildActivationPlanSectionMarkdown(opts);
  const companyBit = (opts.companyName || "plan")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 24);
  const planBit = opts.planLabel
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 32);
  triggerMarkdownDownload(md, `${companyBit}-${planBit}`);
}
