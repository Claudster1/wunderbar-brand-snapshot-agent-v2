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
import { allowMissingSecret } from "@/lib/security/requireSecret";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

type SessionType =
  | "talk_to_expert"
  | "activation_session"
  | "managed_services_consult"
  | "ai_consulting_consult"
  | "general_session";

// Map Calendly event type names (display names + slugs, lowercased) to our session types.
const EVENT_TYPE_MAP: Record<string, SessionType> = {
  "talk-to-an-expert": "talk_to_expert",
  "talk to an expert": "talk_to_expert",
  "strategy-activation-session": "activation_session",
  "strategy activation session": "activation_session",
  "blueprint-plus-activation": "activation_session",
  "brand blueprint+ strategy activation session": "activation_session",
  // Managed services SALES call (bottom-of-funnel MQL)
  "talk to an expert - managed marketing consultation": "managed_services_consult",
  "talk-to-an-expert-managed-marketing-consultation": "managed_services_consult",
  "managed marketing consultation": "managed_services_consult",
  // AI consulting SALES call
  "free ai consultation": "ai_consulting_consult",
  "free-ai-consultation": "ai_consulting_consult",
  "ai consultation": "ai_consulting_consult",
};

function detectSessionType(eventTypeName: string): SessionType {
  const lower = eventTypeName.toLowerCase().trim();
  if (EVENT_TYPE_MAP[lower]) return EVENT_TYPE_MAP[lower];
  // Most-specific first: the sales calls also contain the generic
  // "expert"/"consultation" keywords, so they must be matched before them.
  if (lower.includes("managed marketing") || lower.includes("managed-marketing"))
    return "managed_services_consult";
  if (lower.includes("ai consult") || lower.includes("ai-consult")) return "ai_consulting_consult";
  if (lower.includes("activation") || lower.includes("blueprint")) return "activation_session";
  if (lower.includes("expert") || lower.includes("consultation")) return "talk_to_expert";
  return "general_session";
}

function getSessionLabel(sessionType: SessionType): string {
  if (sessionType === "talk_to_expert") return "Talk to an Expert";
  if (sessionType === "activation_session") return "Strategy Activation Session";
  if (sessionType === "managed_services_consult") return "Managed Marketing Consultation";
  if (sessionType === "ai_consulting_consult") return "Free AI Consultation";
  return "General Session";
}

// Per-session-type AC signals. Booked tags are the primary automation triggers
// (applied via the Contacts API, which works without the legacy webhook). The
// `mql:*` tags flag high-intent sales leads for CRM routing / suppression.
const SESSION_AC_CONFIG: Record<
  SessionType,
  {
    bookedTags: string[];
    canceledTag: string;
    noShowTag: string;
    bookedEvent: string;
    noShowEvent: string;
  }
> = {
  talk_to_expert: {
    bookedTags: ["call:expert-scheduled"],
    canceledTag: "call:expert-canceled",
    noShowTag: "call:expert-no-show",
    bookedEvent: "expert_call_booked",
    noShowEvent: "expert_call_no_show",
  },
  activation_session: {
    bookedTags: ["session:activation-scheduled", "session:booked"],
    canceledTag: "session:activation-canceled",
    noShowTag: "session:activation-no-show",
    bookedEvent: "activation_session_booked",
    noShowEvent: "activation_session_no_show",
  },
  managed_services_consult: {
    bookedTags: ["services:managed-marketing-scheduled", "mql:managed-marketing"],
    canceledTag: "services:managed-marketing-canceled",
    noShowTag: "services:managed-marketing-no-show",
    bookedEvent: "managed_marketing_consult_booked",
    noShowEvent: "managed_marketing_consult_no_show",
  },
  ai_consulting_consult: {
    bookedTags: ["services:ai-consulting-scheduled", "mql:ai-consulting"],
    canceledTag: "services:ai-consulting-canceled",
    noShowTag: "services:ai-consulting-no-show",
    bookedEvent: "ai_consulting_consult_booked",
    noShowEvent: "ai_consulting_consult_no_show",
  },
  general_session: {
    bookedTags: ["call:scheduled"],
    canceledTag: "call:canceled",
    noShowTag: "call:no-show",
    bookedEvent: "meeting_booked",
    noShowEvent: "meeting_no_show",
  },
};

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
  } else if (!allowMissingSecret()) {
    // Fail closed in production if the signing secret is not configured.
    logger.error("[Calendly Webhook] CALENDLY_WEBHOOK_SECRET not configured; rejecting");
    return new NextResponse("Webhook secret not configured", { status: 401 });
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
      const { fireACEvent, trackActiveCampaignSiteEvent } = await import("@/lib/fireACEvent");

      const firstName = name.split(" ")[0] || "";
      const cfg = SESSION_AC_CONFIG[sessionType];

      if (firstName) {
        await getOrCreateContactId(normalizedEmail, { firstName });
      }

      if (event === "invitee.created") {
        const tags = cfg.bookedTags;

        await applyActiveCampaignTags({ email: normalizedEmail, tags });

        await setContactFields({
          email: normalizedEmail,
          fields: {
            last_call_type: getSessionLabel(sessionType),
            last_call_date: new Date().toISOString().split("T")[0],
            ...(firstName ? { first_name_custom: firstName } : {}),
          },
        });

        // Record via Event Tracking (fires without the legacy webhook) and also
        // fire the legacy JSON webhook as a no-op fallback if it is configured.
        await Promise.all([
          trackActiveCampaignSiteEvent({
            email: normalizedEmail,
            eventName: cfg.bookedEvent,
            eventData: getSessionLabel(sessionType),
          }),
          fireACEvent({
            email: normalizedEmail,
            eventName: cfg.bookedEvent,
            tags,
            fields: {
              first_name: firstName,
              session_type: getSessionLabel(sessionType),
              scheduled_date: scheduledStart || "",
            },
          }),
        ]);
      }

      if (event === "invitee.canceled") {
        logger.info("[Calendly Webhook] Session canceled", { email: normalizedEmail, sessionType });
        await applyActiveCampaignTags({ email: normalizedEmail, tags: [cfg.canceledTag] });
      }

      if (event === "invitee.no_show" || event === "invitee_no_show") {
        await applyActiveCampaignTags({
          email: normalizedEmail,
          tags: [cfg.noShowTag, "noshow:needs-followup"],
        });

        await setContactFields({
          email: normalizedEmail,
          fields: {
            last_noshow_type: getSessionLabel(sessionType),
            last_noshow_date: new Date().toISOString().split("T")[0],
          },
        });

        await Promise.all([
          trackActiveCampaignSiteEvent({
            email: normalizedEmail,
            eventName: cfg.noShowEvent,
            eventData: getSessionLabel(sessionType),
          }),
          fireACEvent({
            email: normalizedEmail,
            eventName: cfg.noShowEvent,
            tags: [cfg.noShowTag],
            fields: {
              first_name: firstName,
              session_type: getSessionLabel(sessionType),
              noshow_date: new Date().toISOString().split("T")[0],
            },
          }),
        ]);

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
