import { describe, expect, it } from "vitest";
import {
  formatJourneyStageLabel,
  normalizeEngineJourneyStageKey,
  parseBuyerJourneyStages,
} from "@/lib/strategy/parseBuyerJourneyStages";
import { chromeForLabeledField, stripBrandReplyPrefix, stripSpokenScriptMetaPrefix } from "@/lib/strategy/labeledFieldChrome";

describe("normalizeEngineJourneyStageKey", () => {
  it("maps Blueprint engine stages onto suite keys", () => {
    expect(normalizeEngineJourneyStageKey("Awareness")).toBe("Aware");
    expect(normalizeEngineJourneyStageKey("Consideration")).toBe("Consider");
    expect(normalizeEngineJourneyStageKey("Decision")).toBe("Decide");
    expect(normalizeEngineJourneyStageKey("Onboarding")).toBe("Commit");
    expect(normalizeEngineJourneyStageKey("Retention")).toBe("Closed/Won");
    expect(normalizeEngineJourneyStageKey("Advocacy")).toBe("Grow");
  });
});

describe("parseBuyerJourneyStages", () => {
  it("keeps all six engine stages after flatten", () => {
    const raw = [
      "Aware: Early problem recognition.",
      "Consider: Comparing approaches.",
      "Decide: Choosing a partner.",
      "Commit: Onboarding and first wins.",
      "Closed/Won: Retention and expansion.",
      "Grow: Advocacy and referrals.",
    ].join("\n\n");
    const stages = parseBuyerJourneyStages(raw);
    expect(stages?.map((s) => s.key)).toEqual([
      "Aware",
      "Consider",
      "Decide",
      "Commit",
      "Closed/Won",
      "Grow",
    ]);
    expect(formatJourneyStageLabel("Grow")).toBe("Advocacy");
  });
});

describe("labeledFieldChrome", () => {
  it("assigns distinct chrome to Response / Pillar / Proof", () => {
    expect(chromeForLabeledField("Response").rail).toBe("#07B0F2");
    expect(chromeForLabeledField("Pillar").rail).toBe("#6366F1");
    expect(chromeForLabeledField("Proof").rail).toBe("#D97706");
    expect(chromeForLabeledField("Response").rail).not.toBe(chromeForLabeledField("Pillar").rail);
  });

  it("strips redundant brand reply prefixes", () => {
    expect(stripBrandReplyPrefix('Acme reply: "We do not sell workshops."')).toBe(
      '"We do not sell workshops."',
    );
  });

  it("strips stage-direction prefixes from spoken lines", () => {
    expect(stripSpokenScriptMetaPrefix("Acme close (Sage): Would it help if we start with two weeks?")).toBe(
      "Would it help if we start with two weeks?",
    );
    expect(
      stripSpokenScriptMetaPrefix("Acme opener (Sage voice — calm, precise): Can we look at the journey together?"),
    ).toBe("Can we look at the journey together?");
    expect(stripSpokenScriptMetaPrefix('Offer: "Happy to intro a peer."')).toBe('"Happy to intro a peer."');
  });
});
