import { describe, expect, it } from "vitest";
import { assistantMessageInvitesChoice } from "@/lib/intake/assistantMessageInvitesChoice";
import { flexibleDirectCaptureComplete } from "@/lib/intake/flexibleDirectCaptureComplete";
import { getNarrativeCompletionState } from "@/lib/intake/narrativeMilestones";

describe("assistantMessageInvitesChoice", () => {
  it("is true for questions and tap-below invites", () => {
    expect(assistantMessageInvitesChoice("How clear is your offer?")).toBe(true);
    expect(assistantMessageInvitesChoice("Tap below — or type your own.")).toBe(true);
  });

  it("is false for pure acknowledgments", () => {
    expect(
      assistantMessageInvitesChoice(
        "Good starting point — DIY work means you’ve already been thinking about this intentionally.",
      ),
    ).toBe(false);
  });
});

describe("geographic scope soft answers", () => {
  it("accepts Nationally after a do-business ask", () => {
    expect(
      flexibleDirectCaptureComplete(
        "geographic_scope",
        "Where do you mainly do business today?",
        "Nationally",
      ),
    ).toBe(true);
  });

  it("accepts national / US-based phrasing", () => {
    expect(
      flexibleDirectCaptureComplete(
        "geographic_scope",
        "Where do you mainly serve customers — locally, regionally, nationally, or globally?",
        "We're US-based / national",
      ),
    ).toBe(true);
  });
});

describe("narrative Q&A pairing", () => {
  it("marks goals complete when user answers a goals question with chip labels", () => {
    const state = getNarrativeCompletionState(
      [
        {
          role: "assistant",
          content: "Which outcomes matter most for the next 6–12 months? Tap all that apply below.",
        },
        {
          role: "user",
          content: "Attract more qualified leads, Build brand awareness and credibility",
        },
      ],
      "snapshot",
    );
    expect(state.pendingLabels).not.toContain("Goals");
  });

  it("marks voice complete after personality Q&A even without keyword-heavy user text", () => {
    const state = getNarrativeCompletionState(
      [
        {
          role: "assistant",
          content:
            "If Wunderbar Digital were a person in a room, how would you describe them? Tap a few below.",
        },
        { role: "user", content: "Approachable / no jargon" },
      ],
      "snapshot",
    );
    expect(state.pendingLabels).not.toContain("Brand voice");
  });

  it("does not mark messaging complete from an unanswered assistant question", () => {
    const state = getNarrativeCompletionState(
      [
        { role: "user", content: "We help SMBs." },
        {
          role: "assistant",
          content: "If your brand were a person in a room, how would you describe them?",
        },
      ],
      "snapshot",
    );
    expect(state.pendingLabels).toContain("Brand voice");
  });
});
