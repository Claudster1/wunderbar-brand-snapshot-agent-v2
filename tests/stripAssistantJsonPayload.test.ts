import { describe, expect, it } from "vitest";
import {
  extractIntakeJsonPayload,
  splitAssistantIntakePayload,
  stripIntakeJsonFromAssistantText,
} from "@/lib/intake/stripAssistantJsonPayload";

describe("stripAssistantJsonPayload", () => {
  it("strips fenced answers JSON and keeps handoff prose", () => {
    const raw = `Excellent — everything you've shared is confidential.

\`\`\`json
{
  "userName": "Claudine",
  "businessName": "Wunderbar Digital",
  "industry": "Marketing"
}
\`\`\``;
    const { displayText, payload } = splitAssistantIntakePayload(raw);
    expect(displayText).toMatch(/confidential/i);
    expect(displayText).not.toContain("userName");
    expect(displayText).not.toContain("```");
    expect(payload?.userName).toBe("Claudine");
    expect(payload?.businessName).toBe("Wunderbar Digital");
  });

  it("strips incomplete / trailing-comma JSON leaks", () => {
    const raw = `Your WunderBrand Snapshot™ is being finalized now.

\`\`\`json
{
  "userName": "Claudine",
  "businessName": "Wunderbar Digital",
}
`;
    const cleaned = stripIntakeJsonFromAssistantText(raw);
    expect(cleaned).toMatch(/finalized now/i);
    expect(cleaned).not.toContain("userName");
    expect(cleaned).not.toContain("```");
  });

  it("parses lenient trailing commas in extract", () => {
    const raw = `Thanks!\n{"userName":"A","businessName":"B",}`;
    const { payload } = extractIntakeJsonPayload(raw);
    expect(payload?.userName).toBe("A");
    expect(payload?.businessName).toBe("B");
  });

  it("leaves normal questions alone", () => {
    const q = "Where do you mainly serve customers — locally, regionally, nationally, or globally?";
    expect(stripIntakeJsonFromAssistantText(q)).toBe(q);
    expect(extractIntakeJsonPayload(q).payload).toBeNull();
  });
});
