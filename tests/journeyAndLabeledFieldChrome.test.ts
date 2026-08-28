import { describe, expect, it } from "vitest";
import {
  formatJourneyStageLabel,
  normalizeEngineJourneyStageKey,
  parseBuyerJourneyStages,
} from "@/lib/strategy/parseBuyerJourneyStages";
import {
  chromeForLabeledField,
  stripBrandReplyPrefix,
  stripSpokenScriptMetaPrefix,
  sanitizeSpokenCustomerScript,
  sanitizeSalesConversationGuide,
} from "@/lib/strategy/labeledFieldChrome";

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

  it("softens pushy meeting-takeover openers", () => {
    expect(
      sanitizeSpokenCustomerScript(
        "Acme Co opener (Sage voice — calm, precise): Before we talk channels, I want ten minutes on where Acme’s story and Acme’s funnel disagree.",
      ),
    ).toBe(
      "Would it help if we start with a quick look at where Acme’s story and Acme’s funnel disagree.",
    );
    expect(sanitizeSpokenCustomerScript("I want ten minutes on the homepage gap.")).toBe(
      "Would it help if we spend a few minutes on the homepage gap.",
    );
    expect(sanitizeSpokenCustomerScript("Give me ten minutes on the proof gap.")).toBe(
      "Would it help if we spend a few minutes on the proof gap.",
    );
  });

  it("sanitizes full salesConversationGuide trees for every tier surface", () => {
    const cleaned = sanitizeSalesConversationGuide({
      openingFramework: "Before we talk channels, I want ten minutes on the story gap.",
      closingLanguage: "Let’s lock next week.",
      talkTrackFramework: [{ keyMessage: "I want ten minutes on proof placement." }],
      discoveryQuestions: [{ question: "Where does it stall?", listenFor: "I’ll need a stage name." }],
      objectionHandlingPlaybook: [{ response: "Acme reply: We can start small." }],
      personaConversationTracks: [
        { persona: "CFO", openingVariation: "I want ten minutes on payback.", samplePitch: "Let’s lock the pilot." },
      ],
    });
    expect(cleaned.openingFramework).toContain("Would it help if we start with a quick look at");
    expect(cleaned.closingLanguage).toBe("Can we agree on next week.");
    expect(cleaned.talkTrackFramework?.[0]?.keyMessage).toContain("Would it help if we spend a few minutes on");
    expect(cleaned.discoveryQuestions?.[0]?.listenFor).toContain("it would help to");
    expect(cleaned.objectionHandlingPlaybook?.[0]?.response).toBe("We can start small.");
    expect(cleaned.personaConversationTracks?.[0]?.openingVariation).toContain(
      "Would it help if we spend a few minutes on",
    );
    expect(cleaned.personaConversationTracks?.[0]?.samplePitch).toBe("Can we agree on the pilot.");
  });
});
