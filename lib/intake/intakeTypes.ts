import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";
import type { ChipSelectionMode } from "@/lib/intake/captureSuggestedReplies";
import type { CapturedSummaryItem } from "@/lib/intake/buildCapturedSummary";

/** Server → client metadata on each /api/brand-snapshot chat turn. */
export type IntakeResponseMeta = {
  captureCompletionPercent: number;
  narrativeCompletionPercent: number;
  overallProgressPercent: number;
  pendingCaptureLabels: string[];
  nextCaptureKey: CaptureKey | null;
  intakeReadyForFinalize: boolean;
  suggestedReplies: string[] | null;
  /** single = auto-send on chip tap; multi = select then Send. */
  chipSelectionMode: ChipSelectionMode;
  questionsRemainingEstimate: number;
  capturedSummary: CapturedSummaryItem[];
};

export type BrandSnapshotChatResponse = {
  content: string;
  meta?: IntakeResponseMeta;
  _ai?: { provider: string; model: string };
};
