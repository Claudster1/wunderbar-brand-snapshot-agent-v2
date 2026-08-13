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

  // Honest progress: track pending work, not a soft mid-intake ceiling that feels "stuck".
  const overallProgressPercent = intakeReadyForFinalize
    ? 100
    : captureCompletionPercent >= 100
      ? Math.min(98, Math.round(72 + narrativeCompletionPercent * 0.26))
      : Math.min(
          90,
          Math.round(
            captureCompletionPercent * 0.88 + Math.min((userTurns / Math.max(denom, 1)) * 14, 14),
          ),
        );

  const lastAssistantText =
    [...messages].reverse().find((m) => m.role === "assistant")?.content ?? null;
  const suggestedReplies = resolveSuggestedReplies({
    nextPendingKey,
    lastAssistantText,
  });
  const chipSelectionMode = resolveChipSelectionMode({
    nextPendingKey,
    lastAssistantText,
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
