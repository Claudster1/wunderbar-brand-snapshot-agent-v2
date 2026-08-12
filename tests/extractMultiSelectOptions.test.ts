import { describe, expect, it } from "vitest";
import { extractMultiSelectOptions } from "@/lib/intake/extractMultiSelectOptions";

describe("extractMultiSelectOptions", () => {
  it("parses personalized goal bullets", () => {
    const text = `In the next 6–12 months, what are the 1–2 outcomes that matter most for Wunderbar Digital?

You can select multiple:
- Attract more qualified leads
- Build brand awareness and credibility
- Differentiate from look-alike competitors
- Improve conversion — turn interest into paying customers
- Other — not listed above (add goals or nuance in your own words)

Take your time.`;

    expect(extractMultiSelectOptions(text)).toEqual([
      "Attract more qualified leads",
      "Build brand awareness and credibility",
      "Differentiate from look-alike competitors",
      "Improve conversion — turn interest into paying customers",
      "Other — not listed above (add goals or nuance in your own words)",
    ]);
  });

  it("returns empty when there is no select-multiple block", () => {
    expect(extractMultiSelectOptions("What's the name of your business?")).toEqual([]);
  });
});
