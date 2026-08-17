import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";
import { buildCapturedSummary } from "@/lib/intake/buildCapturedSummary";
import type { IntakeMessage } from "@/lib/intake/buildIntakeTopicResume";
import {
  resolveChipSelectionMode,
  resolveSuggestedReplies,
} from "@/lib/intake/multiSelectChipCatalog";
import { getNarrativeCompletionState } from "@/lib/intake/narrativeMilestones";
import type { IntakeResponseMeta } from "@/lib/intake/intakeTypes";
import { intakeProgressDenominator, type ChatTier } from "@/lib/chatTierConfig";

export type CaptureStateSlice = {
  key: CaptureKey;
  label: string;
  completed: boolean;
};

export function buildIntakeResponseMeta(params: {
  messages: IntakeMessage[];
  tier: ChatTier;
  captureStates: CaptureStateSlice[];
  nextPendingKey: CaptureKey | null;
  priorAnswers?: Record<string, unknown> | null;
  /**
   * Outgoing assistant reply for this turn. When set, chips resolve from the question
   * on screen — not the previous assistant message still at the end of `messages`.
   */
  outgoingAssistantText?: string | null;
}): IntakeResponseMeta {
  const { messages, tier, captureStates, nextPendingKey, priorAnswers } = params;
  const totalCaptures = captureStates.length || 1;
  const completedCaptures = captureStates.filter((c) => c.completed).length;
  const captureCompletionPercent = Math.round((completedCaptures / totalCaptures) * 100);
  const pendingCaptureLabels = captureStates.filter((c) => !c.completed).map((c) => c.label);

  const narrative = getNarrativeCompletionState(messages, tier, params.priorAnswers);
  const narrativeCompletionPercent = narrative.percent;

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
  /** Do not offer finalize while the latest assistant turn is still an unanswered question. */
  const awaitingAnswerToAssistantQuestion =
    lastMessage?.role === "assistant" && /\?/.test(String(lastMessage.content || ""));

  const userTurns = messages.filter((m) => m.role === "user").length;
  const denom = intakeProgressDenominator(tier);

  const pendingNarrativeCount = narrative.pendingLabels.length;
  const pendingCaptureCount = pendingCaptureLabels.length;
  const narrativeComplete = pendingNarrativeCount === 0;
  const questionsRemainingEstimate = pendingCaptureCount + pendingNarrativeCount;

  const intakeReadyForFinalize =
    captureCompletionPercent >= 100 &&
    narrativeComplete &&
    !nextPendingKey &&
    !awaitingAnswerToAssistantQuestion &&
    userTurns >= 6;

  /**
   * Progress tracks remaining captures + narrative topics.
   * Never report 100 here — the client shows 100 only once a results URL exists.
   */
  const remaining = questionsRemainingEstimate;
  const approxTotalQuestions = Math.max(remaining + completedCaptures + Math.round((narrativeCompletionPercent / 100) * 8), denom, 1);
  const answeredApprox = Math.max(0, approxTotalQuestions - remaining);

  let overallProgressPercent: number;
  if (intakeReadyForFinalize) {
    overallProgressPercent = 97;
  } else if (remaining <= 0 && captureCompletionPercent >= 100) {
    overallProgressPercent = 96;
  } else {
    const fromRemaining = Math.round((answeredApprox / approxTotalQuestions) * 94);
    const fromCaptures =
      captureCompletionPercent >= 100
        ? Math.round(70 + narrativeCompletionPercent * 0.26)
        : Math.round(
            captureCompletionPercent * 0.75 +
              Math.min((userTurns / Math.max(denom, 1)) * 12, 12) +
              narrativeCompletionPercent * 0.08,
          );
    overallProgressPercent = Math.min(94, Math.max(fromRemaining, fromCaptures));
  }

  const lastAssistantInHistory =
    [...messages].reverse().find((m) => m.role === "assistant")?.content ?? null;
  const outgoing = String(params.outgoingAssistantText ?? "").trim();
  const chipSourceText = outgoing || lastAssistantInHistory;
  const suggestedReplies = resolveSuggestedReplies({
    nextPendingKey,
    lastAssistantText: chipSourceText,
  });
  const chipSelectionMode = resolveChipSelectionMode({
    nextPendingKey,
    lastAssistantText: chipSourceText,
  });

  return {
    captureCompletionPercent,
    narrativeCompletionPercent,
    overallProgressPercent,
    pendingCaptureLabels,
    nextCaptureKey: nextPendingKey,
    intakeReadyForFinalize,
    suggestedReplies: suggestedReplies?.length ? suggestedReplies : null,
    chipSelectionMode,
    questionsRemainingEstimate,
    capturedSummary: buildCapturedSummary(messages, priorAnswers),
  };
}
