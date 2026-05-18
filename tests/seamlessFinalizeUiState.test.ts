import { describe, expect, it } from "vitest";
import {
  computeComposerHidden,
  computeIntakeReadyForSeamlessFinalize,
  computeSeamlessWrapUpActive,
  lastMessageAwaitingUserReply,
} from "@/lib/intake/computeSeamlessFinalizeUiState";

describe("computeIntakeReadyForSeamlessFinalize", () => {
  const readyBase = {
    intakeReadyForFinalize: true,
    resultsEntryUrl: null,
    postVerifyDestination: null,
    awaitingUserReplyToQuestion: false,
    isLoading: false,
    isFinalizing: false,
    questionsRemainingEstimate: 1,
  };

  it("is true when server meta says intake is complete and no open question", () => {
    expect(computeIntakeReadyForSeamlessFinalize(readyBase)).toBe(true);
  });

  it("is false while the latest assistant message is still a question", () => {
    expect(
      computeIntakeReadyForSeamlessFinalize({ ...readyBase, awaitingUserReplyToQuestion: true }),
    ).toBe(false);
  });

  it("is false when questions remaining estimate is above one", () => {
    expect(
      computeIntakeReadyForSeamlessFinalize({ ...readyBase, questionsRemainingEstimate: 3 }),
    ).toBe(false);
  });

  it("is false when results URL or post-verify bar is already set", () => {
    expect(
      computeIntakeReadyForSeamlessFinalize({
        ...readyBase,
        resultsEntryUrl: "/results?reportId=abc",
      }),
    ).toBe(false);
    expect(
      computeIntakeReadyForSeamlessFinalize({
        ...readyBase,
        postVerifyDestination: { resultsUrl: "/results?reportId=abc" },
      }),
    ).toBe(false);
  });
});

describe("computeSeamlessWrapUpActive", () => {
  it("shows dock while finalizing even if ready flag dropped", () => {
    expect(
      computeSeamlessWrapUpActive({
        intakeReadyForSeamlessFinalize: false,
        isFinalizing: true,
        resultsEntryUrl: null,
        postVerifyDestination: null,
      }),
    ).toBe(true);
  });

  it("hides dock once results URL exists", () => {
    expect(
      computeSeamlessWrapUpActive({
        intakeReadyForSeamlessFinalize: true,
        isFinalizing: true,
        resultsEntryUrl: "/results?reportId=x",
        postVerifyDestination: null,
      }),
    ).toBe(false);
  });
});

describe("computeComposerHidden", () => {
  it("hides composer during seamless wrap-up even if intake input would show", () => {
    expect(computeComposerHidden(false, true)).toBe(true);
    expect(computeComposerHidden(true, false)).toBe(true);
  });
});

describe("lastMessageAwaitingUserReply", () => {
  it("detects trailing assistant questions", () => {
    expect(
      lastMessageAwaitingUserReply([
        { role: "user", text: "Acme" },
        { role: "assistant", text: "What is your website?" },
      ]),
    ).toBe(true);
    expect(
      lastMessageAwaitingUserReply([
        { role: "user", text: "Acme" },
        { role: "assistant", text: "Thanks — I have everything I need to build your Snapshot." },
      ]),
    ).toBe(false);
  });
});
