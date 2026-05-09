/** Matches chat Q41 / CRM — persisted after email capture, not in diagnostic chat. */
export type SnapshotContentOptIn = "marketing_trends" | "ai_updates" | "both" | "no_thanks";

const ALLOWED = new Set<SnapshotContentOptIn>([
  "marketing_trends",
  "ai_updates",
  "both",
  "no_thanks",
]);

export function parseSnapshotContentOptIn(raw: unknown): SnapshotContentOptIn | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim() as SnapshotContentOptIn;
  return ALLOWED.has(v) ? v : null;
}
