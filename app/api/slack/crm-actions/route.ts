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
    const inquiryId = action?.value || "";
    const status = ACTION_TO_STATUS[actionId];

    if (!status || !inquiryId) {
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
      status,
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    };
    if (status === "responded" && inquiry.status !== "responded") {
      updates.first_response_at = new Date().toISOString();
    }
    if (status === "closed") {
      updates.resolved_at = new Date().toISOString();
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

    await createCrmActivity({
      inquiryId,
      contactId: inquiry.contact_id,
      activityType: "status_changed",
      body: `Status changed to ${status} from Slack`,
      payload: { from: inquiry.status, to: status, by_slack_user_id: slackUserId },
      createdBy: payload.user?.name || "slack",
    });

    if (status === "responded" || status === "closed") {
      await supabaseAdmin
        .from("crm_tasks")
        .update({ status: "done", updated_at: new Date().toISOString() })
        .eq("inquiry_id", inquiryId)
        .eq("status", "open");
    }

    const contactEmail = (inquiry as { crm_contacts?: { email?: string } | null })?.crm_contacts?.email;
    if (contactEmail) {
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
    return NextResponse.json({
      response_type: "ephemeral",
      text: `Updated "${subject}" to *${status.replace("_", " ")}*.`,
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
