import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createCrmActivity, createCrmSyncLog } from "@/lib/crm/inbound";
import { applyActiveCampaignTags, removeActiveCampaignTags } from "@/lib/applyActiveCampaignTags";
import { logger } from "@/lib/logger";

const ACTION_TO_STATUS: Record<string, "in_progress" | "responded" | "closed"> = {
  crm_set_in_progress: "in_progress",
  crm_set_responded: "responded",
  crm_set_closed: "closed",
};
const ACTION_CLAIM = "crm_claim_owner";
const ACTION_SNOOZE_4H = "crm_snooze_4h";
const CAL_ACTION_COMPLETE = "cal_mark_completed";
const CAL_ACTION_NO_SHOW = "cal_mark_no_show";
const CAL_ACTION_RESCHEDULED = "cal_mark_rescheduled";
const CAL_ACTION_CANCELED = "cal_mark_canceled";

type CalendlyDispositionPayload = {
  meetingKey: string;
  inviteeUri?: string | null;
  scheduledEventUri?: string | null;
  email?: string | null;
  sessionType?: string | null;
  eventTypeName?: string | null;
  scheduledStart?: string | null;
};

type CalendlyDispositionSpec = {
  eventType: string;
  lifecycleStatus: string;
  userMessage: string;
};

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifySlackSignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) return false;

  const timestamp = req.headers.get("x-slack-request-timestamp") || "";
  const signature = req.headers.get("x-slack-signature") || "";
  if (!timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const age = Math.abs(Date.now() / 1000 - ts);
  if (age > 60 * 5) return false;

  const base = `v0:${timestamp}:${rawBody}`;
  const expected = `v0=${crypto.createHmac("sha256", secret).update(base).digest("hex")}`;
  return safeEqual(expected, signature);
}

function isSlackUserAllowed(slackUserId: string): boolean {
  const raw = process.env.CRM_SLACK_ALLOWED_USER_IDS?.trim();
  if (!raw) return true;
  const allowed = raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return allowed.includes(slackUserId);
}

function parseCalendlyDispositionValue(value: string): CalendlyDispositionPayload | null {
  try {
    const parsed = JSON.parse(value) as Partial<CalendlyDispositionPayload>;
    if (!parsed || typeof parsed.meetingKey !== "string" || !parsed.meetingKey.trim()) return null;
    return {
      meetingKey: parsed.meetingKey.trim(),
      inviteeUri: typeof parsed.inviteeUri === "string" ? parsed.inviteeUri : null,
      scheduledEventUri: typeof parsed.scheduledEventUri === "string" ? parsed.scheduledEventUri : null,
      email: typeof parsed.email === "string" ? parsed.email.trim().toLowerCase() : null,
      sessionType: typeof parsed.sessionType === "string" ? parsed.sessionType : null,
      eventTypeName: typeof parsed.eventTypeName === "string" ? parsed.eventTypeName : null,
      scheduledStart: typeof parsed.scheduledStart === "string" ? parsed.scheduledStart : null,
    };
  } catch {
    return null;
  }
}

function getCalendlyDispositionSpec(actionId: string): CalendlyDispositionSpec | null {
  if (actionId === CAL_ACTION_COMPLETE) {
    return {
      eventType: "calendly_meeting_completed",
      lifecycleStatus: "completed",
      userMessage: "Marked as *completed*.",
    };
  }
  if (actionId === CAL_ACTION_NO_SHOW) {
    return {
      eventType: "calendly_meeting_no_show",
      lifecycleStatus: "no_show",
      userMessage: "Marked as *no-show*.",
    };
  }
  if (actionId === CAL_ACTION_RESCHEDULED) {
    return {
      eventType: "calendly_meeting_rescheduled",
      lifecycleStatus: "rescheduled",
      userMessage: "Marked as *rescheduled*.",
    };
  }
  if (actionId === CAL_ACTION_CANCELED) {
    return {
      eventType: "calendly_meeting_canceled",
      lifecycleStatus: "canceled",
      userMessage: "Marked as *canceled*.",
    };
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ text: "CRM is unavailable." }, { status: 503 });
  }

  const rawBody = await req.text();
  if (!verifySlackSignature(req, rawBody)) {
    return NextResponse.json({ text: "Invalid Slack signature." }, { status: 401 });
  }

  try {
    const params = new URLSearchParams(rawBody);
    const payloadRaw = params.get("payload");
    if (!payloadRaw) {
      return NextResponse.json({ text: "Missing payload." }, { status: 400 });
    }

    const payload = JSON.parse(payloadRaw) as {
      type?: string;
      user?: { id?: string; name?: string };
      actions?: Array<{ action_id?: string; value?: string }>;
    };

    if (payload.type !== "block_actions") {
      return NextResponse.json({ text: "Unsupported Slack payload type." }, { status: 400 });
    }

    const slackUserId = payload.user?.id || "";
    if (!isSlackUserAllowed(slackUserId)) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "You are not allowed to perform CRM actions.",
      });
    }

    const action = payload.actions?.[0];
    const actionId = action?.action_id || "";
    const rawValue = action?.value || "";
    const inquiryId = rawValue;
    const status = ACTION_TO_STATUS[actionId];
    const isClaim = actionId === ACTION_CLAIM;
    const isSnooze = actionId === ACTION_SNOOZE_4H;
    const dispositionSpec = getCalendlyDispositionSpec(actionId);

    if (dispositionSpec) {
      const disposition = parseCalendlyDispositionValue(rawValue);
      if (!disposition) {
        return NextResponse.json({
          response_type: "ephemeral",
          text: "Invalid Calendly disposition payload.",
        });
      }

      const normalizedEmail = disposition.email || null;
      let contactId: string | null = null;
      if (normalizedEmail) {
        const { data: contact } = await supabaseAdmin
          .from("crm_contacts")
          .select("id")
          .ilike("email", normalizedEmail)
          .maybeSingle();
        contactId = (contact?.id as string | undefined) || null;
      }

      const occurredAt = new Date().toISOString();
      const sourceEventId = `${actionId}:${disposition.meetingKey}`;
      const { error: upsertError } = await supabaseAdmin.from("crm_events").upsert(
        {
          source: "slack_disposition",
          source_event_id: sourceEventId,
          event_type: dispositionSpec.eventType,
          direction: "neutral",
          channel: "calendly",
          contact_id: contactId,
          inquiry_id: null,
          owner: payload.user?.name || slackUserId,
          account_key:
            normalizedEmail && normalizedEmail.includes("@")
              ? normalizedEmail.split("@")[1]?.toLowerCase() || null
              : null,
          user_email: normalizedEmail,
          occurred_at: occurredAt,
          metadata: {
            meeting_key: disposition.meetingKey,
            invitee_uri: disposition.inviteeUri || null,
            scheduled_event_uri: disposition.scheduledEventUri || null,
            lifecycle_status: dispositionSpec.lifecycleStatus,
            session_type: disposition.sessionType || null,
            event_type_name: disposition.eventTypeName || null,
            scheduled_start: disposition.scheduledStart || null,
            disposition_by_slack_user_id: slackUserId,
            disposition_by_slack_user_name: payload.user?.name || null,
          },
        },
        { onConflict: "source,source_event_id" },
      );

      if (upsertError) {
        logger.error("[Slack CRM Actions] Failed Calendly disposition upsert", {
          error: upsertError.message,
          actionId,
          meetingKey: disposition.meetingKey,
        });
        return NextResponse.json({
          response_type: "ephemeral",
          text: "Could not record meeting disposition.",
        });
      }

      return NextResponse.json({
        response_type: "ephemeral",
        text: `Meeting ${dispositionSpec.userMessage}`,
      });
    }

    if ((!status && !isClaim && !isSnooze) || !inquiryId) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Invalid action payload.",
      });
    }

    const { data: inquiry, error: fetchError } = await supabaseAdmin
      .from("crm_inquiries")
      .select("id, contact_id, status, subject, owner, crm_contacts(email)")
      .eq("id", inquiryId)
      .single();

    if (fetchError || !inquiry) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Inquiry not found.",
      });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (status) {
      updates.status = status;
      updates.last_activity_at = new Date().toISOString();
      if (status === "responded" && inquiry.status !== "responded") {
        updates.first_response_at = new Date().toISOString();
      }
      if (status === "closed") {
        updates.resolved_at = new Date().toISOString();
      }
    }
    if (isClaim) {
      updates.owner = payload.user?.name || slackUserId;
      updates.last_activity_at = new Date().toISOString();
    }
    if (isSnooze) {
      const snoozeUntil = new Date();
      snoozeUntil.setHours(snoozeUntil.getHours() + 4);
      updates.last_activity_at = snoozeUntil.toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from("crm_inquiries")
      .update(updates)
      .eq("id", inquiryId);

    if (updateError) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Failed to update inquiry.",
      });
    }

    if (status) {
      await createCrmActivity({
        inquiryId,
        contactId: inquiry.contact_id,
        activityType: "status_changed",
        body: `Status changed to ${status} from Slack`,
        payload: { from: inquiry.status, to: status, by_slack_user_id: slackUserId },
        createdBy: payload.user?.name || "slack",
      });
    } else if (isClaim) {
      await createCrmActivity({
        inquiryId,
        contactId: inquiry.contact_id,
        activityType: "owner_claimed",
        body: `Inquiry claimed by ${payload.user?.name || slackUserId} from Slack`,
        payload: { owner: payload.user?.name || slackUserId, by_slack_user_id: slackUserId },
        createdBy: payload.user?.name || "slack",
      });
    } else if (isSnooze) {
      await createCrmActivity({
        inquiryId,
        contactId: inquiry.contact_id,
        activityType: "snoozed_from_slack",
        body: "Snoozed stale reminder window by 4 hours from Slack",
        payload: { by_slack_user_id: slackUserId, snooze_hours: 4 },
        createdBy: payload.user?.name || "slack",
      });
    }

    if (status === "responded" || status === "closed") {
      await supabaseAdmin
        .from("crm_tasks")
        .update({ status: "done", updated_at: new Date().toISOString() })
        .eq("inquiry_id", inquiryId)
        .eq("status", "open");
    }

    const contactEmail = (inquiry as { crm_contacts?: { email?: string } | null })?.crm_contacts?.email;
    if (contactEmail && status) {
      try {
        if (status === "responded" || status === "closed") {
          await applyActiveCampaignTags({
            email: contactEmail,
            tags: ["inquiry:responded"],
          });
          await removeActiveCampaignTags({
            email: contactEmail,
            tags: ["inquiry:pending-response"],
          });
        } else {
          await applyActiveCampaignTags({
            email: contactEmail,
            tags: ["inquiry:pending-response"],
          });
        }

        await createCrmSyncLog({
          status: "success",
          eventType: "ac.tags.inquiry_status_update.slack",
          contactId: inquiry.contact_id,
          inquiryId,
          payload: { email: contactEmail, status, slackUserId },
        });
      } catch (err) {
        await createCrmSyncLog({
          status: "failed",
          eventType: "ac.tags.inquiry_status_update.slack",
          contactId: inquiry.contact_id,
          inquiryId,
          errorMessage: err instanceof Error ? err.message : String(err),
          payload: { email: contactEmail, status, slackUserId },
        });
      }
    }

    const subject = inquiry.subject || "Inbound inquiry";
    if (status) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: `Updated "${subject}" to *${status.replace("_", " ")}*.`,
      });
    }
    if (isClaim) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: `Claimed "${subject}" and assigned owner to *${payload.user?.name || slackUserId}*.`,
      });
    }
    return NextResponse.json({
      response_type: "ephemeral",
      text: `Snoozed "${subject}" for 4 hours.`,
    });
  } catch (err) {
    logger.error("[Slack CRM Actions] Failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      {
        response_type: "ephemeral",
        text: "Failed to process Slack action.",
      },
      { status: 500 },
    );
  }
}
