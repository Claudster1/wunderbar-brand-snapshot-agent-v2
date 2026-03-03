import { NextRequest, NextResponse } from "next/server";
import {
  applyActiveCampaignTags,
  removeActiveCampaignTags,
  setContactFields,
} from "@/lib/applyActiveCampaignTags";
import { isValidEmail, sanitizeString } from "@/lib/security/inputValidation";
import { logger } from "@/lib/logger";

function isValidPhoneE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

export async function POST(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "sms-consent", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      sms_opted_in?: boolean;
      phone_mobile?: string | null;
      source?: string;
    };

    const email = (body.email || "").trim().toLowerCase();
    const smsOptedIn = body.sms_opted_in === true;
    const source = sanitizeString(body.source || "unknown");
    const phoneMobileRaw = (body.phone_mobile || "").trim();
    const phoneMobile = phoneMobileRaw && isValidPhoneE164(phoneMobileRaw) ? phoneMobileRaw : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    if (smsOptedIn) {
      await applyActiveCampaignTags({
        email,
        tags: ["sms:opted-in"],
      });
      await removeActiveCampaignTags({
        email,
        tags: ["sms:opted-out"],
      });
    } else {
      await applyActiveCampaignTags({
        email,
        tags: ["sms:opted-out"],
      });
      await removeActiveCampaignTags({
        email,
        tags: ["sms:opted-in"],
      });
    }

    const fields: Record<string, string> = {
      sms_opted_in: smsOptedIn ? "true" : "false",
      sms_optin_source: source || "unknown",
    };
    if (phoneMobile) fields.phone_mobile = phoneMobile;
    await setContactFields({ email, fields });

    return NextResponse.json({
      ok: true,
      email,
      sms_opted_in: smsOptedIn,
      source,
    });
  } catch (err) {
    logger.error("[SMS Consent] Failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to update SMS consent." }, { status: 500 });
  }
}
