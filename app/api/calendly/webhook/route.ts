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

// Map Calendly event type names to our session types
const EVENT_TYPE_MAP: Record<string, "talk_to_expert" | "activation_session"> = {
  "talk-to-an-expert": "talk_to_expert",
  "talk to an expert": "talk_to_expert",
  "strategy-activation-session": "activation_session",
  "strategy activation session": "activation_session",
  "blueprint-plus-activation": "activation_session",
};

function detectSessionType(eventTypeName: string): "talk_to_expert" | "activation_session" | null {
  const lower = eventTypeName.toLowerCase().trim();
  if (EVENT_TYPE_MAP[lower]) return EVENT_TYPE_MAP[lower];
  if (lower.includes("expert") || lower.includes("consultation")) return "talk_to_expert";
  if (lower.includes("activation") || lower.includes("blueprint")) return "activation_session";
  return null;
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
  sessionType: "talk_to_expert" | "activation_session";
  eventTypeName: string;
}) {
  if (!supabaseAdmin) return;

  const normalizedEmail = params.email.trim().toLowerCase();
  const inviteeUri =
    ((params.payload.uri as string | undefined) ||
      ((params.payload.invitee as { uri?: string } | undefined)?.uri as string | undefined) ||
      "").trim();
  const startTime =
    ((params.payload.scheduled_event as { start_time?: string } | undefined)?.start_time as string | undefined) ||
    null;
  const sourceEventId = inviteeUri
    ? `${params.event}:${inviteeUri}`
    : `${params.event}:${normalizedEmail}:${startTime || "unknown_start"}`;
  const occurredAt = pickOccurredAt(params.payload, params.event);
  const accountKey = getEmailDomain(normalizedEmail);
  const { eventType, direction } = getCalendlyEventMapping(params.event);

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
    event_type_name: params.eventTypeName,
    scheduled_event_uri: ((params.payload.scheduled_event as { uri?: string } | undefined)?.uri as string | undefined) || null,
    invitee_uri: inviteeUri || null,
    start_time: startTime,
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
    const payload = body.payload;

    if (!payload) {
      return NextResponse.json({ received: true });
    }

    const email = payload.email || payload.invitee?.email;
    const name = payload.name || payload.invitee?.name || "";
    const eventTypeName = payload.event_type?.name || payload.scheduled_event?.name || "";

    if (!email) {
      logger.warn("[Calendly Webhook] No email in payload");
      return NextResponse.json({ received: true });
    }

    const sessionType = detectSessionType(eventTypeName);
    if (!sessionType) {
      logger.info("[Calendly Webhook] Unrecognized event type", { eventTypeName });
      return NextResponse.json({ received: true, note: "Unrecognized event type" });
    }

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

    // ─── Tag in ActiveCampaign ───
    try {
      const { applyActiveCampaignTags, setContactFields, getOrCreateContactId } =
        await import("@/lib/applyActiveCampaignTags");
      const { fireACEvent } = await import("@/lib/fireACEvent");

      const normalizedEmail = email.trim().toLowerCase();
      const firstName = name.split(" ")[0] || "";

      if (firstName) {
        await getOrCreateContactId(normalizedEmail, { firstName });
      }

      if (event === "invitee.created") {
        const tags = sessionType === "talk_to_expert"
          ? ["call:expert-scheduled"]
          : ["session:activation-scheduled", "session:booked"];

        await applyActiveCampaignTags({ email: normalizedEmail, tags });

        await setContactFields({
          email: normalizedEmail,
          fields: {
            last_call_type: sessionType === "talk_to_expert" ? "Talk to an Expert" : "Strategy Activation Session",
            last_call_date: new Date().toISOString().split("T")[0],
            ...(firstName ? { first_name_custom: firstName } : {}),
          },
        });

        const eventName = sessionType === "talk_to_expert"
          ? "expert_call_booked"
          : "activation_session_booked";

        await fireACEvent({
          email: normalizedEmail,
          eventName,
          tags,
          fields: {
            first_name: firstName,
            session_type: sessionType === "talk_to_expert" ? "Talk to an Expert" : "Strategy Activation Session",
            scheduled_date: payload.scheduled_event?.start_time || "",
          },
        });
      }

      if (event === "invitee.canceled") {
        logger.info("[Calendly Webhook] Session canceled", { email: normalizedEmail, sessionType });
        const cancelTag = sessionType === "talk_to_expert"
          ? "call:expert-canceled"
          : "session:activation-canceled";
        await applyActiveCampaignTags({ email: normalizedEmail, tags: [cancelTag] });
      }

      if (event === "invitee.no_show" || event === "invitee_no_show") {
        const noShowTag = sessionType === "talk_to_expert"
          ? "call:expert-no-show"
          : "session:activation-no-show";

        await applyActiveCampaignTags({
          email: normalizedEmail,
          tags: [noShowTag, "noshow:needs-followup"],
        });

        await setContactFields({
          email: normalizedEmail,
          fields: {
            last_noshow_type: sessionType === "talk_to_expert" ? "Talk to an Expert" : "Strategy Activation Session",
            last_noshow_date: new Date().toISOString().split("T")[0],
          },
        });

        const eventName = sessionType === "talk_to_expert"
          ? "expert_call_no_show"
          : "activation_session_no_show";

        await fireACEvent({
          email: normalizedEmail,
          eventName,
          tags: [noShowTag],
          fields: {
            first_name: firstName,
            session_type: sessionType === "talk_to_expert" ? "Talk to an Expert" : "Strategy Activation Session",
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
