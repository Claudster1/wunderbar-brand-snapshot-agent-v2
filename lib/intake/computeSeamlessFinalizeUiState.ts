/**
 * Client-side guards for auto-finalize and bottom-of-chat wrap-up UI.
 * Kept pure so Playwright + unit tests can lock behavior without mounting React.
 */

export type SeamlessFinalizeUiInput = {
  intakeReadyForFinalize: boolean;
  resultsEntryUrl: string | null;
  postVerifyDestination: unknown;
  awaitingUserReplyToQuestion: boolean;
  isLoading: boolean;
  isFinalizing: boolean;
  questionsRemainingEstimate?: number | null;
};

export function computeIntakeReadyForSeamlessFinalize(input: SeamlessFinalizeUiInput): boolean {
  return (
    input.intakeReadyForFinalize &&
    !input.resultsEntryUrl &&
    !input.postVerifyDestination &&
    !input.awaitingUserReplyToQuestion &&
    !input.isLoading &&
    !input.isFinalizing &&
    (input.questionsRemainingEstimate ?? 1) <= 1
  );
}

export function computeSeamlessWrapUpActive(params: {
  intakeReadyForSeamlessFinalize: boolean;
  isFinalizing: boolean;
  resultsEntryUrl: string | null;
  postVerifyDestination: unknown;
}): boolean {
  return (
    (params.intakeReadyForSeamlessFinalize || params.isFinalizing) &&
    !params.resultsEntryUrl &&
    !params.postVerifyDestination
  );
}

export function computeComposerHidden(intakeInputHidden: boolean, seamlessWrapUpActive: boolean): boolean {
  return intakeInputHidden || seamlessWrapUpActive;
}

/** Last assistant turn still asks an open question — block auto-finalize. */
export function lastMessageAwaitingUserReply(
  messages: Array<{ role: string; text?: string; content?: string }>,
): boolean {
  const last = messages.length > 0 ? messages[messages.length - 1] : undefined;
  if (!last || last.role !== "assistant") return false;
  const text = String(last.text ?? last.content ?? "");
  return /\?/.test(text);
}
