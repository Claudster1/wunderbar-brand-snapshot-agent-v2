import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

const INTAKE_EVENTS = {
  INTAKE_PROGRESS_MILESTONE: "INTAKE_PROGRESS_MILESTONE",
  INTAKE_READY_FINALIZE: "INTAKE_READY_FINALIZE",
  INTAKE_FINALIZE_STARTED: "INTAKE_FINALIZE_STARTED",
  INTAKE_FINALIZE_FAILED: "INTAKE_FINALIZE_FAILED",
} as const;

export type IntakeAnalyticsEvent = keyof typeof INTAKE_EVENTS;

/** Fire intake funnel events (Supabase + AC webhook via /api/analytics). */
export function trackIntakeEvent(
  event: IntakeAnalyticsEvent,
  meta?: Record<string, unknown>,
): void {
  trackEvent(event as AnalyticsEvent, meta);
}

export { INTAKE_EVENTS };
