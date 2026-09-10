import { describe, expect, it } from "vitest";
import { buildCaptureQuestion } from "@/lib/intake/buildCaptureQuestion";
import { getSuggestedRepliesForCapture } from "@/lib/intake/captureSuggestedReplies";
import { flexibleDirectCaptureComplete } from "@/lib/intake/flexibleDirectCaptureComplete";
import { intakeProgressDenominator } from "@/lib/chatTierConfig";
import { wundySnapshotTierFragment } from "@/src/prompts/wundySnapshotTierFragment";

describe("early role + team size captures", () => {
  it("exposes single-select chips for role and team size", () => {
    expect(getSuggestedRepliesForCapture("user_role_context")).toContain("In-house marketing / brand");
    expect(getSuggestedRepliesForCapture("user_role_context")).toContain("I'm a founder / co-founder");
    expect(getSuggestedRepliesForCapture("team_size")).toContain("Just me");
  });

  it("forces early role on free Snapshot (before industry in the playbook)", () => {
    expect(wundySnapshotTierFragment).toMatch(/\*\*role\*\*/i);
    expect(wundySnapshotTierFragment).toMatch(/before industry/i);
    expect(wundySnapshotTierFragment).not.toMatch(/Do not\*\* force role/i);
    expect(intakeProgressDenominator("snapshot")).toBe(15);
  });

  it("collapses agency/studio into one for-clients industry chip", () => {
    const industry = getSuggestedRepliesForCapture("industry") ?? [];
    expect(industry).toContain("Agency / studio / freelance (for clients)");
    expect(industry.filter((c) => /agency|studio|freelance/i.test(c))).toHaveLength(1);
    expect(industry.some((c) => /in-house marketing/i.test(c))).toBe(false);
  });

  it("does not treat agency-for-clients industry pick as a role answer", () => {
    expect(
      flexibleDirectCaptureComplete(
        "user_role_context",
        "How do you think about your role here?",
        "Agency / studio / freelance (for clients)",
      ),
    ).toBe(false);
  });

  it("completes in-house marketing role chip after role ask", () => {
    expect(
      flexibleDirectCaptureComplete(
        "user_role_context",
        "How do you think about your role here?",
        "In-house marketing / brand",
      ),
    ).toBe(true);
  });

  it("adds company-category helper when marketing lead already answered", () => {
    const q = buildCaptureQuestion("industry", "saas", {
      messages: [
        { role: "user", content: "In-house marketing / brand" },
        { role: "assistant", content: "Got it." },
      ],
    });
    expect(q).toMatch(/company/i);
    expect(q).toMatch(/not your marketing job/i);
  });

  it("keeps default industry ask when role is not marketing lead", () => {
    const q = buildCaptureQuestion("industry", "saas", {
      messages: [
        { role: "user", content: "I'm a founder / co-founder" },
        { role: "assistant", content: "Got it." },
      ],
    });
    expect(q).toMatch(/industry or space is the business/i);
    expect(q).not.toMatch(/marketing job/i);
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
