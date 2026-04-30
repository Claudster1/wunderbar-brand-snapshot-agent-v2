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
    "Use this file as your briefing doc, or copy sections into your task system (Asana, Monday, Jira, etc.).",
    "",
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const blocks = sections.map((s) => {
    const body = (s.body || "").trim();
    return [
      `## ${s.label}`,
      "",
      `**Focus:** ${(s.summary || "").trim() || "—"}`,
      "",
      body || "_No playbook body for this section._",
      "",
      "---",
      "",
    ].join("\n");
  });

  return `${header}${blocks.join("\n")}`.trim() + "\n";
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
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}-activation-pack.md`;
  a.click();
  URL.revokeObjectURL(url);
}
