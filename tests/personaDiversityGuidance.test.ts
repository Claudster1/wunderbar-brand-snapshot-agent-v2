import { describe, expect, it } from "vitest";
import {
  BUYER_PERSONA_DIVERSITY_RULES,
  IMAGERY_DIVERSITY_GUIDANCE,
  INCLUSIVE_LANGUAGE_GUIDANCE,
} from "@/src/prompts/fragments/personaDiversityGuidance";
import { blueprintPlusReportPrompt } from "@/src/prompts/blueprintPlusReportPrompt";
import { blueprintEnginePrompt } from "@/src/prompts/blueprintEnginePrompt";

describe("persona diversity guidance", () => {
  it("requires orientation and ethnicity diversity in the shared rules", () => {
    expect(BUYER_PERSONA_DIVERSITY_RULES).toMatch(/Sexual orientation/i);
    expect(BUYER_PERSONA_DIVERSITY_RULES).toMatch(/LGBTQ\+/i);
    expect(BUYER_PERSONA_DIVERSITY_RULES).toMatch(/heteronormative/i);
    expect(BUYER_PERSONA_DIVERSITY_RULES).toMatch(/ethnically ambiguous/i);
    expect(BUYER_PERSONA_DIVERSITY_RULES).toMatch(/partner/i);
    expect(IMAGERY_DIVERSITY_GUIDANCE).toMatch(/LGBTQ\+/i);
    expect(INCLUSIVE_LANGUAGE_GUIDANCE).toMatch(/husband\/wife/i);
  });

  it("is wired into Blueprint and Blueprint+ report engines", () => {
    expect(blueprintPlusReportPrompt).toContain("PERSONA DIVERSITY");
    expect(blueprintPlusReportPrompt).toContain("LGBTQ+");
    expect(blueprintEnginePrompt).toContain("PERSONA DIVERSITY");
    expect(blueprintEnginePrompt).toContain("LGBTQ+");
  });
});
