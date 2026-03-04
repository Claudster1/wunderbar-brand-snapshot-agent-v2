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
import { applyActiveCampaignTags, removeActiveCampaignTags, setContactFields } from "@/lib/applyActiveCampaignTags";
import { resolveAutoAssignedOwner } from "@/lib/crm/assignment";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.INBOUND_WEBHOOK_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  const headerSecret = req.headers.get("x-inbound-secret")?.trim();
  return auth === secret || headerSecret === secret;
}

export async function POST(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "inbound-connect", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const name = sanitizeString(body.name ?? body.fullName ?? "");
    const companyName = sanitizeString(body.companyName ?? body.company ?? "");
    const message = sanitizeString(body.message ?? "");
    const source = sanitizeString(body.source ?? "connect_form");
    const normalizedSource =
      source === "results_human_assist_branch" ? "results_human_assist_branch" : "connect_form";
    const externalRef = sanitizeString(body.externalRef ?? body.id ?? "");
    const smsOptedIn = body.sms_opted_in === true;
    const emailMarketingOptedIn = body.email_marketing_opted_in === true;
    const phoneMobile = typeof body.phone_mobile === "string" ? body.phone_mobile.trim() : "";

    if (!email && !phone) {
      return NextResponse.json(
        { error: "At least one contact method (email or phone) is required." },
        { status: 400 },
      );
    }
    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const existingInquiryId = await findInquiryByExternalRef(normalizedSource, externalRef || null);
    if (existingInquiryId) {
      return NextResponse.json({ ok: true, deduped: true, inquiryId: existingInquiryId });
    }

    const contactId = await upsertCrmContact({
      email: email || null,
      phone: phone || null,
      fullName: name || null,
      companyName: companyName || null,
      source: normalizedSource,
      metadata: { inbound_source: source },
    });

    const isHumanAssistSource = normalizedSource === "results_human_assist_branch";
    const preferredHumanAssistOwner = sanitizeString(process.env.CRM_HUMAN_ASSIST_OWNER ?? "");
    const defaultAssignment = await resolveAutoAssignedOwner({ source: normalizedSource });
    const assignment =
      isHumanAssistSource && preferredHumanAssistOwner
        ? { owner: preferredHumanAssistOwner, reason: "human_assist_owner_override" }
        : defaultAssignment;

    const inquiryId = await createCrmInquiry({
      contactId,
      source: normalizedSource,
      status: "new",
      priority: isHumanAssistSource ? "high" : "normal",
      owner: assignment.owner,
      subject: `${isHumanAssistSource ? "Human assist request" : "Connect inquiry"}${companyName ? ` - ${companyName}` : ""}`,
      message: message || null,
      externalRef: externalRef || null,
      channelMetadata: { source },
      attribution: {
        utm_source: sanitizeString(body.utm_source ?? ""),
        utm_medium: sanitizeString(body.utm_medium ?? ""),
        utm_campaign: sanitizeString(body.utm_campaign ?? ""),
      },
    });

    if (!inquiryId) {
      return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
    }

    await createCrmActivity({
      inquiryId,
      contactId,
      activityType: "inbound_received",
      body: isHumanAssistSource ? "Human assist request received from results" : "Connect form inquiry received",
      payload: { source, assigned_owner: assignment.owner, assign_reason: assignment.reason },
      createdBy: "system",
    });

    if (isHumanAssistSource) {
      await createCrmActivity({
        inquiryId,
        contactId,
        activityType: "human_assist_requested",
        body: "High-intent human assist request from results page",
        payload: { source, priority: "high" },
        createdBy: "system",
      });
    }

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
      source: normalizedSource,
    });

    if (email) {
      try {
        const tags = ["inquiry:pending-response", "inbound:connect"];
        if (isHumanAssistSource) {
          tags.push("inquiry:human-assist");
        } else {
          tags.push("inquiry:connect-form");
        }
        if (smsOptedIn) tags.push("sms:opted-in");
        if (emailMarketingOptedIn) tags.push("email:marketing-opted-in");

        await applyActiveCampaignTags({
          email,
          tags,
        });
        const removeTags = ["inquiry:responded"];
        if (smsOptedIn) removeTags.push("sms:opted-out");
        if (emailMarketingOptedIn) removeTags.push("email:marketing-opted-out");
        await removeActiveCampaignTags({
          email,
          tags: removeTags,
        });
        if (smsOptedIn || emailMarketingOptedIn) {
          const fields: Record<string, string> = {};
          if (smsOptedIn) {
            fields.sms_opted_in = "true";
            fields.sms_optin_source = normalizedSource;
          }
          if (emailMarketingOptedIn) {
            fields.email_marketing_opted_in = "true";
            fields.email_marketing_optin_source = normalizedSource;
          }
          if (phoneMobile) fields.phone_mobile = phoneMobile;
          await setContactFields({ email, fields });
        }
        await createCrmSyncLog({
          status: "success",
          eventType: "ac.tags.inquiry_pending",
          contactId,
          inquiryId,
          payload: { email, sms_opted_in: smsOptedIn, email_marketing_opted_in: emailMarketingOptedIn },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await createCrmSyncLog({
          status: "failed",
          eventType: "ac.tags.inquiry_pending",
          contactId,
          inquiryId,
          errorMessage: msg,
          payload: { email },
        });
      }
    }

    logger.info("[Inbound Connect] Inquiry created", { inquiryId, hasEmail: Boolean(email) });
    return NextResponse.json({ ok: true, inquiryId, contactId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("[Inbound Connect] Error", { error: msg });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
