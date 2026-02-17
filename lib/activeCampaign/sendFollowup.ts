/**
 * lib/activeCampaign/sendFollowup.ts
 *
 * Sends an approved follow-up email via ActiveCampaign by:
 * 1. Ensuring the contact exists
 * 2. Setting custom fields with the email subject + body
 * 3. Applying a tag that triggers the "Send Follow-Up Email" automation
 *
 * Prerequisites in ActiveCampaign:
 * - Custom fields: followup_email_subject, followup_email_body, followup_session_type
 * - Tags: followup:send, followup:talk_to_expert, followup:activation_session
 * - An automation triggered by the "followup:send" tag that sends the email
 *   using %FOLLOWUP_EMAIL_SUBJECT% and %FOLLOWUP_EMAIL_BODY% personalization tags.
 */

import {
  getOrCreateContactId,
  setContactFields,
  applyActiveCampaignTags,
  createTag,
  createCustomField,
} from "@/lib/applyActiveCampaignTags";

export interface FollowupPayload {
  contactEmail: string;
  contactName?: string | null;
  sessionType: "talk_to_expert" | "activation_session";
  subject: string;
  body: string;
  productTier?: string | null;
  businessName?: string | null;
}

export interface SendResult {
  success: boolean;
  contactId: string | null;
  error?: string;
}

/**
 * Push follow-up content to ActiveCampaign and trigger the send automation.
 */
export async function sendFollowupViaAC(payload: FollowupPayload): Promise<SendResult> {
  try {
    // 1. Ensure contact exists (create or sync)
    const nameParts = payload.contactName?.split(" ") || [];
    const contactId = await getOrCreateContactId(payload.contactEmail, {
      firstName: nameParts[0] || undefined,
      lastName: nameParts.slice(1).join(" ") || undefined,
    });

    if (!contactId) {
      return { success: false, contactId: null, error: "Failed to create/sync contact in ActiveCampaign." };
    }

    // 2. Set custom fields with follow-up content
    await setContactFields({
      email: payload.contactEmail,
      fields: {
        followup_email_subject: payload.subject,
        followup_email_body: payload.body,
        followup_session_type: payload.sessionType === "talk_to_expert"
          ? "Talk to an Expert Session"
          : "Strategy Activation Session",
        ...(payload.businessName ? { followup_business_name: payload.businessName } : {}),
        ...(payload.productTier ? { followup_product_tier: payload.productTier } : {}),
      },
    });

    // 3. Apply session-specific tag + the send trigger tag
    const sessionTag = payload.sessionType === "talk_to_expert"
      ? "followup:talk_to_expert"
      : "followup:activation_session";

    await applyActiveCampaignTags({
      email: payload.contactEmail,
      tags: [sessionTag, "followup:send"],
    });

    return { success: true, contactId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[sendFollowupViaAC] Error:", message);
    return { success: false, contactId: null, error: message };
  }
}

/**
 * Ensure all required custom fields and tags exist in ActiveCampaign.
 * Run once during setup (idempotent).
 */
export async function ensureFollowupACResources(): Promise<{ fields: string[]; tags: string[] }> {
  const fieldNames = [
    "followup_email_subject",
    "followup_email_body",
    "followup_session_type",
    "followup_business_name",
    "followup_product_tier",
  ];

  const tagNames = [
    "followup:send",
    "followup:talk_to_expert",
    "followup:activation_session",
    "followup:sent",
  ];

  const createdFields: string[] = [];
  const createdTags: string[] = [];

  for (const name of fieldNames) {
    const type = name === "followup_email_body" ? "textarea" : "text";
    const id = await createCustomField(name, type);
    if (id) createdFields.push(name);
  }

  for (const name of tagNames) {
    const id = await createTag(name);
    if (id) createdTags.push(name);
  }

  return { fields: createdFields, tags: createdTags };
}
