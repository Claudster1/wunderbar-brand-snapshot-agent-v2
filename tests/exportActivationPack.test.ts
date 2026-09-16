import { describe, expect, it } from "vitest";
import { buildActivationPlanSectionMarkdown } from "@/lib/activation/exportActivationPack";

describe("buildActivationPlanSectionMarkdown", () => {
  it("builds a briefing doc with usage guidance", () => {
    const md = buildActivationPlanSectionMarkdown({
      planLabel: "Email Lifecycle Plan",
      companyName: "Acme Co",
      summary: "Welcome and follow-up emails",
      body: "## Your email sequence\n\nHi there.",
    });
    expect(md).toMatch(/Email Lifecycle Plan — Acme Co/);
    expect(md).toMatch(/Google Docs, Word, or Notion/);
    expect(md).toMatch(/do not paste this whole file/);
    expect(md).toMatch(/Welcome and follow-up emails/);
    expect(md).toMatch(/Hi there/);
  });
});
