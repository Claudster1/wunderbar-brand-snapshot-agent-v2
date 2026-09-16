import { describe, expect, it } from "vitest";
import {
  PLATFORM_AGNOSTIC_TOOLS_PROMPT_RULE,
  audienceLikelyPrefersVideo,
  formatRecommendationList,
  optionalWalkthroughBodyLine,
  resolveWalkthroughRecommendation,
  walkthroughSecondaryCta,
  SHORT_WALKTHROUGH_FORMATS,
} from "@/lib/activation/formatAgnosticRecommendations";

describe("formatAgnosticRecommendations", () => {
  it("lists walkthrough formats with written and video options", () => {
    expect(SHORT_WALKTHROUGH_FORMATS[0]).toMatch(/Annotated|PDF|checklist/i);
    expect(formatRecommendationList(SHORT_WALKTHROUGH_FORMATS)).toContain("1.");
    expect(formatRecommendationList(SHORT_WALKTHROUGH_FORMATS)).toMatch(/screen recording/i);
  });

  it("keeps CTAs platform-agnostic by default", () => {
    expect(walkthroughSecondaryCta("audit")).not.toMatch(/loom/i);
    expect(walkthroughSecondaryCta("audit")).toMatch(/written walkthrough/i);
    expect(optionalWalkthroughBodyLine(2)).not.toMatch(/loom/i);
    expect(optionalWalkthroughBodyLine(2)).toMatch(/annotated PDF/i);
  });

  it("leads with video for B2B when capacity and comfort allow, with a non-video twin", () => {
    expect(
      audienceLikelyPrefersVideo({
        audienceType: "B2B",
        businessType: "professional services",
        marketingChannels: ["LinkedIn"],
      }),
    ).toBe(true);

    const path = resolveWalkthroughRecommendation({
      audienceType: "B2B",
      businessType: "SaaS",
      contentCreationCapacity: "5_10_hours",
      videoComfort: "comfortable",
      teamSize: "8",
    });
    expect(path.leadWith).toBe("video");
    expect(path.offerLine).toMatch(/Non-video|one-pager|slides/i);
    expect(path.toolsLine).toMatch(/Zoom|Loom|native/i);
  });

  it("keeps written primary when capacity is low even if audience fits video", () => {
    const path = resolveWalkthroughRecommendation({
      audienceType: "B2B",
      contentCreationCapacity: "under_2_hours",
      videoComfort: "prefer_written",
      teamSize: "solo",
    });
    expect(path.leadWith).toBe("written");
    expect(path.audienceVideoFit).toBe(true);
    expect(path.offerLine).toMatch(/Lead with an annotated|optional short screen/i);
  });

  it("embeds capacity and dual-path rules in the report prompt fragment", () => {
    expect(PLATFORM_AGNOSTIC_TOOLS_PROMPT_RULE).toMatch(/videoComfort/i);
    expect(PLATFORM_AGNOSTIC_TOOLS_PROMPT_RULE).toMatch(/contentCreationCapacity/i);
    expect(PLATFORM_AGNOSTIC_TOOLS_PROMPT_RULE).toMatch(/non-video/i);
    expect(PLATFORM_AGNOSTIC_TOOLS_PROMPT_RULE).toMatch(/SMB/i);
  });
});
