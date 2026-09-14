import { logger } from "@/lib/logger";
import type { SessionType } from "@/lib/session/followupPrompts";

export type FollowupPendingSlackInput = {
  followupId: string;
  contactEmail: string;
  contactName?: string | null;
  sessionType: SessionType;
  subject?: string | null;
  teamMemberName?: string | null;
  source?: string | null;
  appBaseUrl: string;
};

function sessionLabel(sessionType: SessionType): string {
  return sessionType === "talk_to_expert"
    ? "Talk to an Expert"
    : "Strategy Activation Session";
}

/** Pure Slack payload builder — unit-tested without network. */
export function formatFollowupPendingSlackMessage(
  input: FollowupPendingSlackInput,
): { text: string; blocks: Record<string, unknown>[] } {
  const label = sessionLabel(input.sessionType);
  const who = input.contactName?.trim()
    ? `${input.contactName.trim()} (${input.contactEmail})`
    : input.contactEmail;
  const reviewUrl = `${input.appBaseUrl.replace(/\/$/, "")}/admin/followups`;
  const subjectLine = input.subject?.trim()
    ? `\n• Draft subject: ${input.subject.trim().slice(0, 120)}`
    : "";
  const strategist = input.teamMemberName?.trim()
    ? `\n• Strategist: ${input.teamMemberName.trim()}`
    : "";
  const source = input.source?.trim() ? `\n• Source: ${input.source.trim()}` : "";

  const text = `Follow-up ready for review: ${label} — ${input.contactEmail}`;
  return {
    text,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "Session follow-up ready for review" },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            `• Type: *${label}*` +
            `\n• Contact: ${who}` +
            subjectLine +
            strategist +
            source +
            `\n• Queue: <${reviewUrl}|Open admin follow-ups>`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `followup_id \`${input.followupId}\` · approve within 24h`,
          },
        ],
      },
    ],
  };
}

/**
 * Non-blocking CRM Slack ping when a transcript follow-up hits pending_review.
 * Uses SLACK_CRM_WEBHOOK (fallback SLACK_ALERT_WEBHOOK) — same channel as Calendly ops.
 */
export async function notifyFollowupPendingSlack(
  input: FollowupPendingSlackInput,
): Promise<void> {
  const webhookUrl = process.env.SLACK_CRM_WEBHOOK || process.env.SLACK_ALERT_WEBHOOK;
  if (!webhookUrl) return;

  const payload = formatFollowupPendingSlackMessage(input);
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      logger.warn("[Session] Slack follow-up notify failed", {
        status: res.status,
        followupId: input.followupId,
      });
    }
  } catch (err) {
    logger.warn("[Session] Slack follow-up notify threw", {
      error: err instanceof Error ? err.message : String(err),
      followupId: input.followupId,
    });
  }
}
