// POST /api/calendly/webhook
// Receives Calendly webhook events when someone books, cancels, or no-shows a session.
// Tags the contact in ActiveCampaign for the appropriate session type.
//
// Calendly webhook events:
//   invitee.created    — someone booked
//   invitee.canceled   — someone canceled
//   invitee.no_show    — host marked invitee as a no-show
//
// Set CALENDLY_WEBHOOK_SECRET in env to validate the webhook signature.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

type SessionType = "talk_to_expert" | "activation_session" | "general_session";

// Map Calendly event type names to our session types
const EVENT_TYPE_MAP: Record<string, SessionType> = {
  "talk-to-an-expert": "talk_to_expert",
  "talk to an expert": "talk_to_expert",
  "strategy-activation-session": "activation_session",
  "strategy activation session": "activation_session",
  "blueprint-plus-activation": "activation_session",
};

function detectSessionType(eventTypeName: string): SessionType {
  const lower = eventTypeName.toLowerCase().trim();
  if (EVENT_TYPE_MAP[lower]) return EVENT_TYPE_MAP[lower];
  if (lower.includes("expert") || lower.includes("consultation")) return "talk_to_expert";
  if (lower.includes("activation") || lower.includes("blueprint")) return "activation_session";
  return "general_session";
}

function getSessionLabel(sessionType: SessionType): string {
  if (sessionType === "talk_to_expert") return "Talk to an Expert";
  if (sessionType === "activation_session") return "Strategy Activation Session";
  return "General Session";
}

function getCalendlyRefs(payload: Record<string, unknown>) {
  const inviteeUri =
    ((payload.uri as string | undefined) ||
      ((payload.invitee as { uri?: string } | undefined)?.uri as string | undefined) ||
      null);
  const scheduledEventUri =
    ((payload.scheduled_event as { uri?: string } | undefined)?.uri as string | undefined) || null;
  const rescheduledFromInviteeUri =
    ((payload as { old_invitee?: { uri?: string } }).old_invitee?.uri as string | undefined) ||
    ((payload as { rescheduled_from_invitee_uri?: string }).rescheduled_from_invitee_uri as string | undefined) ||
    null;
  const rescheduledToInviteeUri =
    ((payload as { new_invitee?: { uri?: string } }).new_invitee?.uri as string | undefined) ||
    ((payload as { rescheduled_to_invitee_uri?: string }).rescheduled_to_invitee_uri as string | undefined) ||
    null;
  const isRescheduled =
    Boolean((payload as { rescheduled?: boolean }).rescheduled) ||
    Boolean(rescheduledFromInviteeUri) ||
    Boolean(rescheduledToInviteeUri);
  return {
    inviteeUri: inviteeUri?.trim() || null,
    scheduledEventUri: scheduledEventUri?.trim() || null,
    rescheduledFromInviteeUri: rescheduledFromInviteeUri?.trim() || null,
    rescheduledToInviteeUri: rescheduledToInviteeUri?.trim() || null,
    isRescheduled,
  };
}

function getLifecycleStatus(event: string): "scheduled" | "canceled" | "no_show" | "updated" {
  if (event === "invitee.created") return "scheduled";
  if (event === "invitee.canceled") return "canceled";
  if (event === "invitee.no_show" || event === "invitee_no_show") return "no_show";
  return "updated";
}

async function sendCalendlyDispositionPrompt(params: {
  meetingKey: string;
  inviteeUri: string | null;
  scheduledEventUri: string | null;
  email: string;
  sessionType: SessionType;
  eventTypeName: string;
  scheduledStart: string | null;
}) {
  const webhookUrl = process.env.SLACK_CRM_WEBHOOK || process.env.SLACK_ALERT_WEBHOOK;
  if (!webhookUrl) return;

  const actionValue = JSON.stringify({
    meetingKey: params.meetingKey,
    inviteeUri: params.inviteeUri,
    scheduledEventUri: params.scheduledEventUri,
    email: params.email,
    sessionType: params.sessionType,
    eventTypeName: params.eventTypeName,
    scheduledStart: params.scheduledStart,
  });

  const label = getSessionLabel(params.sessionType);
  const scheduledLine = params.scheduledStart
    ? `\n• Start: ${new Date(params.scheduledStart).toLocaleString()}`
    : "";

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `Calendly booked: ${label} — ${params.email}`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "Calendly Meeting Booked" },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `• Type: ${label}` +
              `\n• Event: ${params.eventTypeName || "Unnamed Calendly event"}` +
              `\n• Email: ${params.email}` +
              scheduledLine,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Completed" },
              style: "primary",
              action_id: "cal_mark_completed",
              value: actionValue,
            },
            {
              type: "button",
              text: { type: "plain_text", text: "No-show" },
              action_id: "cal_mark_no_show",
              value: actionValue,
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Rescheduled" },
              action_id: "cal_mark_rescheduled",
              value: actionValue,
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Canceled" },
              style: "danger",
              action_id: "cal_mark_canceled",
              value: actionValue,
            },
          ],
        },
      ],
    }),
  });
}

function getEmailDomain(email: string): string | null {
  if (!email.includes("@")) return null;
  const domain = email.split("@")[1]?.trim().toLowerCase();
  return domain || null;
}

function getCalendlyEventMapping(event: string): {
  eventType: string;
  direction: "inbound" | "outbound" | "neutral";
} {
  if (event === "invitee.created") {
    return { eventType: "calendly_meeting_booked", direction: "inbound" };
  }
  if (event === "invitee.canceled") {
    return { eventType: "calendly_meeting_canceled", direction: "neutral" };
  }
  if (event === "invitee.no_show" || event === "invitee_no_show") {
    return { eventType: "calendly_meeting_no_show", direction: "neutral" };
  }
  return { eventType: "calendly_event", direction: "neutral" };
}

function pickOccurredAt(payload: Record<string, unknown>, event: string): string {
  const candidate =
    (event === "invitee.canceled" ? (payload.cancelled_at as string | undefined) : undefined) ||
    (event === "invitee.no_show" || event === "invitee_no_show"
      ? ((payload.no_show_at as string | undefined) || (payload.updated_at as string | undefined))
      : undefined) ||
    (event === "invitee.created"
      ? ((payload.created_at as string | undefined) ||
        ((payload.scheduled_event as { start_time?: string } | undefined)?.start_time as string | undefined))
      : undefined) ||
    (payload.created_at as string | undefined) ||
    (payload.updated_at as string | undefined);
  return candidate || new Date().toISOString();
}

async function upsertUnifiedCalendlyEvent(params: {
  event: string;
  payload: Record<string, unknown>;
  email: string;
  sessionType: SessionType;
  eventTypeName: string;
}) {
  if (!supabaseAdmin) return;

  const normalizedEmail = params.email.trim().toLowerCase();
  const refs = getCalendlyRefs(params.payload);
  const startTime =
    ((params.payload.scheduled_event as { start_time?: string } | undefined)?.start_time as string | undefined) ||
    null;
  const meetingKey = refs.scheduledEventUri || refs.inviteeUri;
  const sourceEventId = refs.inviteeUri
    ? `${params.event}:${refs.inviteeUri}`
    : `${params.event}:${normalizedEmail}:${startTime || "unknown_start"}`;
  const occurredAt = pickOccurredAt(params.payload, params.event);
  const accountKey = getEmailDomain(normalizedEmail);
  const { eventType, direction } = getCalendlyEventMapping(params.event);
  const lifecycleStatus = getLifecycleStatus(params.event);

  let contactId: string | null = null;
  try {
    const { data: contact } = await supabaseAdmin
      .from("crm_contacts")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle();
    contactId = (contact?.id as string | undefined) || null;
  } catch {
    contactId = null;
  }

  const metadata = {
    calendly_event: params.event,
    session_type: params.sessionType,
    session_label: getSessionLabel(params.sessionType),
    event_type_name: params.eventTypeName,
    meeting_key: meetingKey,
    scheduled_event_uri: refs.scheduledEventUri,
    invitee_uri: refs.inviteeUri,
    rescheduled: refs.isRescheduled,
    rescheduled_from_invitee_uri: refs.rescheduledFromInviteeUri,
    rescheduled_to_invitee_uri: refs.rescheduledToInviteeUri,
    start_time: startTime,
    lifecycle_status: lifecycleStatus,
    status: params.event,
  };

  const { error } = await supabaseAdmin.from("crm_events").upsert(
    {
      source: "calendly_webhook",
      source_event_id: sourceEventId,
      event_type: eventType,
      direction,
      channel: "calendly",
      contact_id: contactId,
      inquiry_id: null,
      owner: null,
      account_key: accountKey,
      user_email: normalizedEmail,
      occurred_at: occurredAt,
      metadata,
    },
    { onConflict: "source,source_event_id" },
  );

  if (error) {
    logger.error("[Calendly Webhook] Failed to upsert crm_events row", {
      error: error.message,
      event: params.event,
      email: normalizedEmail,
    });
  }
}

/**
 * Verify Calendly webhook signature using HMAC-SHA256.
 * Calendly signs the raw body and sends the signature in the
 * `calendly-webhook-signature` header as: t=<timestamp>,v1=<signature>
 */
function verifyCalendlySignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  try {
    const parts = signatureHeader.split(",");
    const timestampPart = parts.find((p) => p.startsWith("t="));
    const signaturePart = parts.find((p) => p.startsWith("v1="));

    if (!timestampPart || !signaturePart) return false;

    const timestamp = timestampPart.slice(2);
    const signature = signaturePart.slice(3);

    // Reject signatures older than 5 minutes to prevent replay attacks
    const age = Math.abs(Date.now() - parseInt(timestamp, 10) * 1000);
    if (age > 5 * 60 * 1000) {
      logger.warn("[Calendly Webhook] Signature too old", { ageMs: age });
      return false;
    }

    const payload = `${timestamp}.${rawBody}`;
    const expected = createHmac("sha256", secret).update(payload).digest("hex");

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (sigBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const CALENDLY_WEBHOOK_SECRET = process.env.CALENDLY_WEBHOOK_SECRET;
  const rawBody = await req.text();

  // ─── HMAC signature verification ───
  if (CALENDLY_WEBHOOK_SECRET) {
    const sig = req.headers.get("calendly-webhook-signature") || "";
    if (!sig || !verifyCalendlySignature(rawBody, sig, CALENDLY_WEBHOOK_SECRET)) {
      logger.warn("[Calendly Webhook] Signature verification failed");
      return new NextResponse("Invalid signature", { status: 401 });
    }
  }

  try {
    const body = JSON.parse(rawBody);
    const event = body.event;
    const payload = body.payload as Record<string, unknown>;

    if (!payload) {
      return NextResponse.json({ received: true });
    }

    const email = (payload.email as string | undefined) || ((payload.invitee as { email?: string } | undefined)?.email as string | undefined);
    const name =
      (payload.name as string | undefined) ||
      ((payload.invitee as { name?: string } | undefined)?.name as string | undefined) ||
      "";
    const eventTypeName =
      ((payload.event_type as { name?: string } | undefined)?.name as string | undefined) ||
      ((payload.scheduled_event as { name?: string } | undefined)?.name as string | undefined) ||
      "";

    if (!email) {
      logger.warn("[Calendly Webhook] No email in payload");
      return NextResponse.json({ received: true });
    }

    const sessionType = detectSessionType(eventTypeName);
    const refs = getCalendlyRefs(payload);
    const normalizedEmail = email.trim().toLowerCase();
    const scheduledStart =
      ((payload.scheduled_event as { start_time?: string } | undefined)?.start_time as string | undefined) ||
      null;
    const meetingKey = refs.scheduledEventUri || refs.inviteeUri || `${normalizedEmail}:${Date.now()}`;

    logger.info("[Calendly Webhook] Processing", { event, email, sessionType, eventTypeName });

    try {
      await upsertUnifiedCalendlyEvent({
        event,
        payload,
        email,
        sessionType,
        eventTypeName,
      });
    } catch (crmErr) {
      logger.error("[Calendly Webhook] Unified event write failed", {
        error: crmErr instanceof Error ? crmErr.message : String(crmErr),
      });
    }

    if (event === "invitee.created") {
      await sendCalendlyDispositionPrompt({
        meetingKey,
        inviteeUri: refs.inviteeUri,
        scheduledEventUri: refs.scheduledEventUri,
        email: normalizedEmail,
        sessionType,
        eventTypeName,
        scheduledStart,
      }).catch((slackErr) => {
        logger.error("[Calendly Webhook] Failed to send Slack disposition prompt", {
          error: slackErr instanceof Error ? slackErr.message : String(slackErr),
          email: normalizedEmail,
        });
      });
    }

    // ─── Tag in ActiveCampaign ───
    try {
      const { applyActiveCampaignTags, setContactFields, getOrCreateContactId } =
        await import("@/lib/applyActiveCampaignTags");
      const { fireACEvent } = await import("@/lib/fireACEvent");

      const firstName = name.split(" ")[0] || "";

      if (firstName) {
        await getOrCreateContactId(normalizedEmail, { firstName });
      }

      if (event === "invitee.created") {
        const tags = sessionType === "talk_to_expert"
          ? ["call:expert-scheduled"]
          : sessionType === "activation_session"
            ? ["session:activation-scheduled", "session:booked"]
            : ["call:scheduled"];

        await applyActiveCampaignTags({ email: normalizedEmail, tags });

        await setContactFields({
          email: normalizedEmail,
          fields: {
            last_call_type: getSessionLabel(sessionType),
            last_call_date: new Date().toISOString().split("T")[0],
            ...(firstName ? { first_name_custom: firstName } : {}),
          },
        });

        const eventName = sessionType === "talk_to_expert"
          ? "expert_call_booked"
          : sessionType === "activation_session"
            ? "activation_session_booked"
            : "meeting_booked";

        await fireACEvent({
          email: normalizedEmail,
          eventName,
          tags,
          fields: {
            first_name: firstName,
            session_type: getSessionLabel(sessionType),
            scheduled_date: scheduledStart || "",
          },
        });
      }

      if (event === "invitee.canceled") {
        logger.info("[Calendly Webhook] Session canceled", { email: normalizedEmail, sessionType });
        const cancelTag = sessionType === "talk_to_expert"
          ? "call:expert-canceled"
          : sessionType === "activation_session"
            ? "session:activation-canceled"
            : "call:canceled";
        await applyActiveCampaignTags({ email: normalizedEmail, tags: [cancelTag] });
      }

      if (event === "invitee.no_show" || event === "invitee_no_show") {
        const noShowTag = sessionType === "talk_to_expert"
          ? "call:expert-no-show"
          : sessionType === "activation_session"
            ? "session:activation-no-show"
            : "call:no-show";

        await applyActiveCampaignTags({
          email: normalizedEmail,
          tags: [noShowTag, "noshow:needs-followup"],
        });

        await setContactFields({
          email: normalizedEmail,
          fields: {
            last_noshow_type: getSessionLabel(sessionType),
            last_noshow_date: new Date().toISOString().split("T")[0],
          },
        });

        const eventName = sessionType === "talk_to_expert"
          ? "expert_call_no_show"
          : sessionType === "activation_session"
            ? "activation_session_no_show"
            : "meeting_no_show";

        await fireACEvent({
          email: normalizedEmail,
          eventName,
          tags: [noShowTag],
          fields: {
            first_name: firstName,
            session_type: getSessionLabel(sessionType),
            noshow_date: new Date().toISOString().split("T")[0],
          },
        });

        logger.info("[Calendly Webhook] No-show processed", { email: normalizedEmail, sessionType });
      }
    } catch (acErr) {
      logger.error("[Calendly Webhook] AC tagging failed", {
        error: acErr instanceof Error ? acErr.message : String(acErr),
      });
    }

    return NextResponse.json({ received: true, processed: true });
  } catch (err) {
    logger.error("[Calendly Webhook] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
