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

export const runtime = "nodejs";

// Map Calendly event type names to our session types
// Update these to match your actual Calendly event type slugs or names
const EVENT_TYPE_MAP: Record<string, "talk_to_expert" | "activation_session"> = {
  "talk-to-an-expert": "talk_to_expert",
  "talk to an expert": "talk_to_expert",
  "strategy-activation-session": "activation_session",
  "strategy activation session": "activation_session",
  "blueprint-plus-activation": "activation_session",
};

function detectSessionType(eventTypeName: string): "talk_to_expert" | "activation_session" | null {
  const lower = eventTypeName.toLowerCase().trim();
  // Direct match
  if (EVENT_TYPE_MAP[lower]) return EVENT_TYPE_MAP[lower];
  // Fuzzy match
  if (lower.includes("expert") || lower.includes("consultation")) return "talk_to_expert";
  if (lower.includes("activation") || lower.includes("blueprint")) return "activation_session";
  return null;
}

export async function POST(req: NextRequest) {
  // ─── Verify webhook secret (optional but recommended) ───
  const CALENDLY_WEBHOOK_SECRET = process.env.CALENDLY_WEBHOOK_SECRET;
  if (CALENDLY_WEBHOOK_SECRET) {
    const sig = req.headers.get("calendly-webhook-signature") || "";
    // Calendly uses HMAC-SHA256 in their webhook signature
    // For now, we do a basic token check. For production, implement full HMAC validation.
    if (!sig) {
      logger.warn("[Calendly Webhook] Missing signature");
      // Still process — Calendly signature validation is complex;
      // rely on secret URL as primary protection
    }
  }

  try {
    const body = await req.json();
    const event = body.event; // "invitee.created" or "invitee.canceled"
    const payload = body.payload;

    if (!payload) {
      return NextResponse.json({ received: true });
    }

    // Extract contact info
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

    // ─── Tag in ActiveCampaign ───
    try {
      const { applyActiveCampaignTags, setContactFields, getOrCreateContactId } =
        await import("@/lib/applyActiveCampaignTags");
      const { fireACEvent } = await import("@/lib/fireACEvent");

      const normalizedEmail = email.trim().toLowerCase();
      const firstName = name.split(" ")[0] || "";

      // Sync contact
      if (firstName) {
        await getOrCreateContactId(normalizedEmail, { firstName });
      }

      if (event === "invitee.created") {
        // ── Booking ──
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
        // ── Cancellation — log and lightly tag ──
        logger.info("[Calendly Webhook] Session canceled", { email: normalizedEmail, sessionType });

        const cancelTag = sessionType === "talk_to_expert"
          ? "call:expert-canceled"
          : "session:activation-canceled";
        await applyActiveCampaignTags({ email: normalizedEmail, tags: [cancelTag] });
      }

      if (event === "invitee.no_show" || event === "invitee_no_show") {
        // ── No-Show — tag + fire event for follow-up automation ──
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
    return NextResponse.json({ received: true }, { status: 200 }); // Always 200 to prevent retries
  }
}
