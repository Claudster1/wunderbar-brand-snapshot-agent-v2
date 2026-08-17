import { describe, expect, it } from "vitest";
import { getSuggestedRepliesForCapture } from "@/lib/intake/captureSuggestedReplies";
import { flexibleDirectCaptureComplete } from "@/lib/intake/flexibleDirectCaptureComplete";

describe("early role + team size captures", () => {
  it("exposes single-select chips for role and team size", () => {
    expect(getSuggestedRepliesForCapture("user_role_context")).toContain("I'm a founder / co-founder");
    expect(getSuggestedRepliesForCapture("team_size")).toContain("Just me");
  });

  it("completes role from chip-style answer after role ask", () => {
    expect(
      flexibleDirectCaptureComplete(
        "user_role_context",
        "How do you think about your role here?",
        "I lead strategy and growth",
      ),
    ).toBe(true);
  });

  it("completes team size from band answer", () => {
    expect(
      flexibleDirectCaptureComplete(
        "team_size",
        "How big is your team today — including you?",
        "Just me",
      ),
    ).toBe(true);
  });
});
