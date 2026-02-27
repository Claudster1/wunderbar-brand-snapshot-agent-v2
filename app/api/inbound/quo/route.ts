import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { isValidEmail, sanitizeString } from "@/lib/security/inputValidation";
import {
  createCrmActivity,
  createCrmInquiry,
  createCrmSyncLog,
  createDefaultCrmTaskForInquiry,
  findInquiryByExternalRef,
  upsertCrmContact,
} from "@/lib/crm/inbound";
import { applyActiveCampaignTags, removeActiveCampaignTags } from "@/lib/applyActiveCampaignTags";
import { resolveAutoAssignedOwner } from "@/lib/crm/assignment";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.QUO_WEBHOOK_SECRET || process.env.INBOUND_WEBHOOK_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  const headerSecret = req.headers.get("x-quo-secret")?.trim();
  return auth === secret || headerSecret === secret;
}

function mapQuoSource(rawType: string): "quo_call" | "quo_voicemail" {
  return rawType === "voicemail" ? "quo_voicemail" : "quo_call";
}

export async function POST(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "inbound-quo", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const eventType = sanitizeString(body.eventType ?? body.type ?? "call");
    const source = mapQuoSource(eventType);
    const externalRef = sanitizeString(body.callId ?? body.id ?? body.externalRef ?? "");
    const name = sanitizeString(body.contactName ?? body.name ?? "");
    const emailRaw = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const email = emailRaw && isValidEmail(emailRaw) ? emailRaw : "";
    const phone = sanitizeString(body.phone ?? body.from ?? "");
    const companyName = sanitizeString(body.companyName ?? "");
    const summary = sanitizeString(body.summary ?? body.note ?? "");
    const transcript = sanitizeString(body.transcript ?? body.voicemailText ?? "");

    if (!phone && !email) {
      return NextResponse.json(
        { error: "At least one contact method (phone or email) is required." },
        { status: 400 },
      );
    }

    const existingInquiryId = await findInquiryByExternalRef(source, externalRef || null);
    if (existingInquiryId) {
      return NextResponse.json({ ok: true, deduped: true, inquiryId: existingInquiryId });
    }

    const contactId = await upsertCrmContact({
      email: email || null,
      phone: phone || null,
      fullName: name || null,
      companyName: companyName || null,
      source,
      metadata: { channel: "quo" },
    });

    const assignment = await resolveAutoAssignedOwner({ source });

    const inquiryId = await createCrmInquiry({
      contactId,
      source,
      status: "new",
      owner: assignment.owner,
      priority: source === "quo_voicemail" ? "high" : "normal",
      subject: source === "quo_voicemail" ? "Inbound voicemail" : "Inbound phone call",
      message: summary || null,
      transcript: transcript || null,
      externalRef: externalRef || null,
      channelMetadata: {
        channel: "quo",
        event_type: eventType,
      },
      attribution: {
        inbound_channel: "phone",
      },
    });

    if (!inquiryId) {
      return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
    }

    await createCrmActivity({
      inquiryId,
      contactId,
      activityType: source === "quo_voicemail" ? "voicemail_received" : "call_received",
      body: summary || null,
      payload: {
        hasTranscript: Boolean(transcript),
        assigned_owner: assignment.owner,
        assign_reason: assignment.reason,
      },
      createdBy: "system",
    });

    if (assignment.owner) {
      await createCrmActivity({
        inquiryId,
        contactId,
        activityType: "owner_auto_assigned",
        body: `Inquiry auto-assigned to ${assignment.owner}`,
        payload: { owner: assignment.owner, reason: assignment.reason },
        createdBy: "system",
      });
    }

    await createDefaultCrmTaskForInquiry({
      inquiryId,
      contactId,
      source,
    });

    if (email) {
      try {
        await applyActiveCampaignTags({
          email,
          tags: [
            "inquiry:pending-response",
            "inbound:call",
            source === "quo_voicemail" ? "inbound:voicemail" : "inbound:live-call",
          ],
        });
        await removeActiveCampaignTags({ email, tags: ["inquiry:responded"] });
        await createCrmSyncLog({
          status: "success",
          eventType: "ac.tags.inbound_call_pending",
          contactId,
          inquiryId,
          payload: { email, source },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await createCrmSyncLog({
          status: "failed",
          eventType: "ac.tags.inbound_call_pending",
          contactId,
          inquiryId,
          errorMessage: msg,
          payload: { email, source },
        });
      }
    }

    logger.info("[Inbound Quo] Inquiry created", { inquiryId, source });
    return NextResponse.json({ ok: true, inquiryId, contactId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("[Inbound Quo] Error", { error: msg });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
