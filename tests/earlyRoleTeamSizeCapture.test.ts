import { describe, expect, it } from "vitest";
import { getSuggestedRepliesForCapture } from "@/lib/intake/captureSuggestedReplies";
import { flexibleDirectCaptureComplete } from "@/lib/intake/flexibleDirectCaptureComplete";

describe("early role + team size captures", () => {
  it("exposes single-select chips for role and team size", () => {
    expect(getSuggestedRepliesForCapture("user_role_context")).toContain(
      "I lead marketing / brand in-house",
    );
    expect(getSuggestedRepliesForCapture("user_role_context")).toContain("I'm a founder / co-founder");
    expect(getSuggestedRepliesForCapture("team_size")).toContain("Just me");
  });

  it("keeps agency/creative industry chips distinct from in-house role", () => {
    const industry = getSuggestedRepliesForCapture("industry") ?? [];
    expect(industry).toContain("Agency / freelance (not in-house)");
    expect(industry).toContain("Creative studio (not in-house)");
    expect(industry.some((c) => /in-house marketing/i.test(c))).toBe(false);
  });

  it("does not treat agency '(not in-house)' industry pick as a role answer", () => {
    expect(
      flexibleDirectCaptureComplete(
        "user_role_context",
        "How do you think about your role here?",
        "Agency / freelance (not in-house)",
      ),
    ).toBe(false);
  });

  it("completes in-house marketing role chip after role ask", () => {
    expect(
      flexibleDirectCaptureComplete(
        "user_role_context",
        "How do you think about your role here?",
        "I lead marketing / brand in-house",
      ),
    ).toBe(true);
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
