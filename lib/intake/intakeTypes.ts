import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";

/** Server → client metadata on each /api/brand-snapshot chat turn. */
export type IntakeResponseMeta = {
  captureCompletionPercent: number;
  narrativeCompletionPercent: number;
  overallProgressPercent: number;
  pendingCaptureLabels: string[];
  nextCaptureKey: CaptureKey | null;
  intakeReadyForFinalize: boolean;
  suggestedReplies: string[] | null;
  questionsRemainingEstimate: number;
  capturedSummary: { label: string; value: string }[];
};

export type BrandSnapshotChatResponse = {
  content: string;
  meta?: IntakeResponseMeta;
  _ai?: { provider: string; model: string };
};
