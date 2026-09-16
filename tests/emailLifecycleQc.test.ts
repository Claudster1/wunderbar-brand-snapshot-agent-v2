import { describe, expect, it } from "vitest";
import { buildDevelopedEmailLifecyclePlan } from "@/lib/activation/emailLifecycleDevelopedCopy";
import { extractEmailSendMap } from "@/lib/activation/parseEmailSendMap";
import { buildActivationPlanSectionMarkdown } from "@/lib/activation/exportActivationPack";

/** Mirrors ActivationPlanReadableBody field-line parser. */
const FIELD_LINE = /^- \*\*(.+?)(?::\*\*|\*\*:)\s*(.*)$/;

function extractLabeledFields(content: string): { label: string; value: string }[] {
  const lines = content.split("\n");
  const fields: { label: string; value: string }[] = [];
  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i]!.trim();
    const m = trimmed.match(FIELD_LINE);
    if (!m) {
      i++;
      continue;
    }
    const label = m[1]!.trim();
    let value = m[2] ?? "";
    i++;
    if (!value) {
      const bodyLines: string[] = [];
      while (i < lines.length) {
        const nextTrim = lines[i]!.trim();
        if (FIELD_LINE.test(nextTrim) || nextTrim.startsWith("### ")) break;
        bodyLines.push(lines[i]!);
        i++;
      }
      value = bodyLines.join("\n").trim();
    }
    fields.push({ label, value });
  }
  return fields;
}

const sample = () =>
  buildDevelopedEmailLifecyclePlan({
    companyName: "Acme Co",
    industry: "B2B services",
    primaryPillar: "Clarity",
    firstPriority: "Message consistency",
    secondPriority: "Proof",
    thirdPriority: "Follow-up",
    audienceShort: "growth-stage founders",
  });

describe("email lifecycle QC pipeline", () => {
  it("builds a plain-language sequence with a parseable send map", () => {
    const body = sample();
    expect(body).not.toMatch(/\bESP\b/);
    expect(body).toMatch(/Start here — your email sequence/);
    expect(body).toMatch(/JOB OF THIS EMAIL/);

    const map = extractEmailSendMap(body);
    expect(map).not.toBeNull();
    expect(map!.rows.length).toBe(9);
    expect(map!.rows[0]).toMatchObject({
      emailNum: "1",
      when: "Day 0",
      stage: "Getting noticed",
    });
    expect(map!.rows[0]!.subject.length).toBeGreaterThan(10);
  });

  it("uses friendly field labels that parse into field cards", () => {
    const body = sample();
    const email3 = body.split("### Email 3")[1]?.split("### Email 4")[0] ?? "";
    const fields = extractLabeledFields(email3);
    const labels = fields.map((f) => f.label);
    expect(labels).toEqual(
      expect.arrayContaining([
        "Subject line",
        "Inbox preview",
        "Image idea",
        "Email body",
        "Main next step",
        "Optional second step",
      ]),
    );
    const bodyField = fields.find((f) => f.label === "Email body");
    expect(bodyField?.value).toMatch(/Hi \{\{first_name\}\}/);
    expect(bodyField?.value).not.toMatch(/\*\*/);
  });

  it("exports a briefing document people can open and cherry-pick from", () => {
    const body = sample();
    const md = buildActivationPlanSectionMarkdown({
      planLabel: "Email Lifecycle Plan",
      companyName: "Acme Co",
      summary: "Simple email sequence",
      body,
    });
    expect(md).toMatch(/working document/);
    expect(md).toMatch(/do not paste this whole file/);
    expect(md).toMatch(/Getting noticed/);
    expect(md.length).toBeGreaterThan(2000);
  });
});
