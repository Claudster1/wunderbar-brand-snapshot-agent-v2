import { describe, expect, it } from "vitest";
import { buildAudienceProfilesBody, textsSubstantiallyOverlap } from "@/lib/strategy/audienceNarrative";

describe("textsSubstantiallyOverlap", () => {
  it("detects near-duplicate phrasing", () => {
    const a =
      "Founder-led B2B services teams who need pipeline quality and one narrative spine across channels.";
    const b =
      "Founder-led B2B services teams who need pipeline quality and one consistent narrative spine across channels.";
    expect(textsSubstantiallyOverlap(a, b)).toBe(true);
  });
});

describe("buildAudienceProfilesBody", () => {
  it("omits snapshot primary when it duplicates structured primary ICP", () => {
    const shared =
      "Founder-led B2B services teams who need pipeline quality and one narrative spine across channels.";
    const body = buildAudienceProfilesBody({
      companyName: "Acme",
      industry: "B2B",
      audienceShort: "founders",
      targetAudience: shared,
      diagnostic: {
        audiencePersonas: {
          primaryICP: {
            name: "Founder-led firms",
            summary: shared,
            demographics: "US-based, 15–120 employees",
            psychographics: "Skeptical of vanity metrics",
            painPoints: ["Message drift by channel"],
            goals: "Stable qualified pipeline",
            buyingJourney: "Referral → diagnostic → pilot",
            languageTheyUse: "Pipeline quality, payback",
            whereToBeFindable: "LinkedIn, outbound, intros",
            objections: ["Tried agencies before"],
          },
          secondaryICP: {
            name: "Marketing-led scale-ups",
            summary: "Different segment entirely for testing.",
            demographics: "50–400 employees",
            psychographics: "Data-hungry",
            painPoints: [],
            goals: "SQL quality",
            buyingJourney: "Committee",
            languageTheyUse: "Attribution",
            whereToBeFindable: "Communities",
            objections: [],
          },
        },
      },
    });

    expect(body.startsWith(shared)).toBe(false);
    expect(body).toContain(shared);
    expect(body).toContain("Founder-led firms");
  });
});
