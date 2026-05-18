import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";
import { buildCapturedSummary } from "@/lib/intake/buildCapturedSummary";
import { getSuggestedRepliesForCapture } from "@/lib/intake/captureSuggestedReplies";
import type { IntakeMessage } from "@/lib/intake/buildIntakeTopicResume";
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

  const overallProgressPercent =
    captureCompletionPercent >= 100
      ? Math.min(99, Math.round(68 + narrativeCompletionPercent * 0.31))
      : Math.min(
          88,
          Math.round(captureCompletionPercent * 0.82 + Math.min((userTurns / denom) * 18, 18)),
        );

  const pendingNarrativeCount = narrative.pendingLabels.length;
  const pendingCaptureCount = pendingCaptureLabels.length;
  const narrativeComplete = pendingNarrativeCount === 0;
  const questionsRemainingEstimate = Math.max(
    1,
    pendingCaptureCount + pendingNarrativeCount,
  );

  const intakeReadyForFinalize =
    captureCompletionPercent >= 100 &&
    narrativeComplete &&
    !nextPendingKey &&
    !awaitingAnswerToAssistantQuestion &&
    userTurns >= 6;

  const suggestedReplies = nextPendingKey ? getSuggestedRepliesForCapture(nextPendingKey) : null;

  return {
    captureCompletionPercent,
    narrativeCompletionPercent,
    overallProgressPercent,
    pendingCaptureLabels,
    nextCaptureKey: nextPendingKey,
    intakeReadyForFinalize,
    suggestedReplies: suggestedReplies?.length ? suggestedReplies : null,
    questionsRemainingEstimate,
    capturedSummary: buildCapturedSummary(messages, priorAnswers),
  };
}
