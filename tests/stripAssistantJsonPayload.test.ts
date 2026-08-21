import { describe, expect, it } from "vitest";
import {
  extractIntakeJsonPayload,
  splitAssistantIntakePayload,
  stripIntakeJsonFromAssistantText,
  stripStreamingAssistantDisplay,
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

  it("strips Here's the information I gathered mirror intros", () => {
    const leaked = `That's wonderful to hear! Everything you've shared is confidential.

Here's the information I gathered:

Excellent — everything you've shared is confidential and your brand insights stay yours. Your WunderBrand Snapshot™ is being finalized now.`;
    const cleaned = stripIntakeJsonFromAssistantText(leaked);
    expect(cleaned).not.toMatch(/information I gathered/i);
    expect(cleaned).toMatch(/being finalized now/i);
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

  it("hides JSON mid-stream as soon as a fence opens", () => {
    const partial = `Your WunderBrand Snapshot™ is being finalized now.\n\n\`\`\`json\n{\n  "userName":`;
    expect(stripStreamingAssistantDisplay(partial)).toMatch(/finalized now/i);
    expect(stripStreamingAssistantDisplay(partial)).not.toContain("```");
    expect(stripStreamingAssistantDisplay(partial)).not.toContain("userName");
  });

  it("hides orphan key dumps after opening brace was already stripped", () => {
    const leaked = `That's a great description of your brand voice! Your WunderBrand Snapshot™ is being finalized now. You'll be redirected to your diagnostic results page automatically in a moment. Here's the information you've provided:

"businessName": "Wunderbar Digital",
"businessType": "saas",
"industry": "Professional services / consulting"
`;
    const cleaned = stripStreamingAssistantDisplay(leaked);
    expect(cleaned).toMatch(/finalized now/i);
    expect(cleaned).not.toContain("businessName");
    expect(cleaned).not.toContain("Wunderbar Digital");
    expect(cleaned).not.toMatch(/information you've provided/i);
  });

  it("hides mid-payload orphan keys like offerClarity (opening brace already stripped)", () => {
    const leaked = `Your WunderBrand Snapshot™ is being finalized now.

"offerClarity": "very clear",
"messagingClarity": null,
"missionStatement": null,
"hasBrandGuidelines": false,
"credibilityDetails": { "testimonialContext": null },
"thoughtLeadershipActivity": [ { "hasActivity": false, "activities": [] } ]
`;
    const cleaned = stripStreamingAssistantDisplay(leaked);
    expect(cleaned).toMatch(/finalized now/i);
    expect(cleaned).not.toContain("offerClarity");
    expect(cleaned).not.toContain("missionStatement");
    expect(cleaned).not.toContain("hasBrandGuidelines");
  });

  it("keeps stripping when raw stream is accumulated then display-stripped", () => {
    const chunks = [
      "Excellent — everything you've shared is confidential.\n\n",
      "Your WunderBrand Snapshot™ is being finalized now.\n\n",
      "{\n",
      '  "businessName": "Wunderbar Digital",\n',
      '  "industry": "Consulting"\n',
      "}",
    ];
    let raw = "";
    let display = "";
    for (const chunk of chunks) {
      raw += chunk;
      display = stripStreamingAssistantDisplay(raw);
    }
    expect(display).toMatch(/finalized now/i);
    expect(display).not.toContain("businessName");
    expect(display).not.toContain("{");
  });
});
