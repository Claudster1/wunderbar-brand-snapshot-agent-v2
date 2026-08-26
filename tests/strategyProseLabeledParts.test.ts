import { describe, expect, it } from "vitest";
import { splitLabeledParts } from "@/lib/strategy/labeledProse";

describe("splitLabeledParts", () => {
  it("splits a single Label: value line", () => {
    expect(splitLabeledParts("Why ask: Surfaces narrative inconsistency.")).toEqual([
      { label: "Why ask", value: "Surfaces narrative inconsistency." },
    ]);
  });

  it("splits title-case multi-word workbook labels", () => {
    expect(splitLabeledParts("Voice Attributes: Clear, Confident, Insightful, Practical")).toEqual([
      { label: "Voice Attributes", value: "Clear, Confident, Insightful, Practical" },
    ]);
    expect(splitLabeledParts("Primary Archetype: The Sage")).toEqual([
      { label: "Primary Archetype", value: "The Sage" },
    ]);
    expect(
      splitLabeledParts(
        "Current Brand Verdict: Acme Co has a strong strategic base but inconsistent external execution.",
      ),
    ).toEqual([
      {
        label: "Current Brand Verdict",
        value: "Acme Co has a strong strategic base but inconsistent external execution.",
      },
    ]);
  });

  it("splits smashed multi-label talk-track lines", () => {
    const parts = splitLabeledParts(
      "Stage: First 10 minutes Objective: Earn permission Key message: We care Proof: One snapshot",
    );
    expect(parts?.map((p) => p.label)).toEqual(["Stage", "Objective", "Key message", "Proof"]);
    expect(parts?.[0]?.value).toBe("First 10 minutes");
    expect(parts?.[3]?.value).toBe("One snapshot");
  });

  it("returns null for unlabeled prose", () => {
    expect(splitLabeledParts("Acme Co opener in Sage voice.")).toBeNull();
  });
});
