import { describe, expect, it } from "vitest";
import { buildFoundationPersonaAtlasEntries } from "@/lib/foundationPersonaAtlas";
import {
  personaPortraits,
  resolveLocalPersonaPortraitSrc,
} from "@/lib/personaPortraitAssets";
import { buyerPersonasToStrategyCards } from "@/lib/strategy/audienceNarrative";

function heritageFromSrc(src: string) {
  return personaPortraits.find((p) => p.src === src)?.heritageGroup;
}

describe("ICP persona portrait diversity", () => {
  it("avoids repeating heritage groups across a sequential resolve set", () => {
    const used: Array<ReturnType<typeof resolveLocalPersonaPortraitSrc>["heritageGroup"]> = [];
    const roles = ["VP Marketing", "CFO", "Head of RevOps"];
    const names = ["Jordan Ellis", "Casey Morgan", "Alex Reed"];
    const heritages = roles.map((role, index) => {
      const local = resolveLocalPersonaPortraitSrc({
        role,
        personaName: names[index],
        index,
        audienceKind: "b2b",
        seedKey: `diversity-test|${role}|${index}`,
        avoidHeritageGroups: used,
      });
      used.push(local.heritageGroup);
      return local.heritageGroup;
    });
    expect(new Set(heritages).size).toBe(heritages.length);
  });

  it("builds a diverse Foundation sample atlas when buyer personas are missing", () => {
    const entries = buildFoundationPersonaAtlasEntries({
      diagnosticData: {},
      businessName: "Acme Co",
      reportId: "preview-diversity",
      topGap: "message consistency",
      primaryPillar: "Messaging",
    });
    expect(entries.length).toBe(3);
    const heritages = entries.map((e) => heritageFromSrc(e.portraitSrc));
    expect(heritages.every(Boolean)).toBe(true);
    expect(new Set(heritages).size).toBe(3);
  });

  it("diversifies Strategy buyer persona cards", () => {
    const cards = buyerPersonasToStrategyCards(
      [
        { personaName: "Jordan Ellis", role: "VP Marketing" },
        { personaName: "Casey Morgan", role: "CFO" },
        { personaName: "Alex Reed", role: "Head of RevOps" },
      ],
      { companyName: "Acme Co", reportId: "strategy-diversity", diagnostic: { marketType: "B2B" } },
    );
    expect(cards.length).toBe(3);
    const heritages = cards.map((c) => heritageFromSrc(c.portraitSrc));
    expect(heritages.every(Boolean)).toBe(true);
    expect(new Set(heritages).size).toBe(3);
  });

  it("diversifies preview-shaped buyerPersona sets used by Foundation", () => {
    const entries = buildFoundationPersonaAtlasEntries({
      diagnosticData: {
        buyerPersonas: [
          { personaName: "Jordan Ellis", role: "VP Marketing" },
          { personaName: "Casey Morgan", role: "CFO" },
          { personaName: "Alex Reed", role: "Head of Revenue Operations" },
        ],
      },
      businessName: "Acme Co",
      reportId: "preview-buyer-personas",
      topGap: "message consistency",
      primaryPillar: "Messaging",
    });
    expect(entries.length).toBe(3);
    const heritages = entries.map((e) => heritageFromSrc(e.portraitSrc));
    expect(new Set(heritages).size).toBe(3);
  });

  it("keeps resolving when every name forces the same heritage cue", () => {
    const used: Array<ReturnType<typeof resolveLocalPersonaPortraitSrc>["heritageGroup"]> = [];
    const names = ["Priya Sharma", "Raj Patel", "Anjali Mehta"];
    const heritages = names.map((personaName, index) => {
      const local = resolveLocalPersonaPortraitSrc({
        role: "VP Marketing",
        personaName,
        index,
        audienceKind: "b2b",
        seedKey: `same-heritage|${index}`,
        avoidHeritageGroups: used,
      });
      used.push(local.heritageGroup);
      return local.heritageGroup;
    });
    expect(heritages.every(Boolean)).toBe(true);
    expect(heritages.length).toBe(3);
  });
});
