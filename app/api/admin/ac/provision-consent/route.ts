import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminSession";
import { createCustomField, createTag } from "@/lib/applyActiveCampaignTags";
import { logger } from "@/lib/logger";

const CONSENT_TAGS = [
  "sms:opted-in",
  "sms:opted-out",
  "email:marketing-opted-in",
  "email:marketing-opted-out",
] as const;

const CONSENT_FIELDS = [
  "sms_opted_in",
  "sms_optin_source",
  "phone_mobile",
  "email_marketing_opted_in",
  "email_marketing_optin_source",
] as const;

type ProvisionResult = {
  key: string;
  ok: boolean;
  id: string | null;
  error?: string;
};

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return auth.response;

  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AUTH_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "admin-ac-provision-consent", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const missingEnv = !process.env.ACTIVE_CAMPAIGN_API_URL || !process.env.ACTIVE_CAMPAIGN_API_KEY;
  if (missingEnv) {
    return NextResponse.json(
      { error: "ActiveCampaign API environment variables are not configured." },
      { status: 500 },
    );
  }

  const tags: ProvisionResult[] = [];
  const fields: ProvisionResult[] = [];

  for (const tagName of CONSENT_TAGS) {
    try {
      const id = await createTag(tagName);
      tags.push({ key: tagName, ok: Boolean(id), id });
    } catch (err) {
      tags.push({
        key: tagName,
        ok: false,
        id: null,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  for (const fieldTitle of CONSENT_FIELDS) {
    try {
      const id = await createCustomField(fieldTitle, "text");
      fields.push({ key: fieldTitle, ok: Boolean(id), id });
    } catch (err) {
      fields.push({
        key: fieldTitle,
        ok: false,
        id: null,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const ok = [...tags, ...fields].every((item) => item.ok);
  if (!ok) {
    logger.warn("[Admin AC Provision Consent] Partial failure", {
      tagsFailed: tags.filter((x) => !x.ok).map((x) => x.key),
      fieldsFailed: fields.filter((x) => !x.ok).map((x) => x.key),
      adminUser: auth.identity.email,
    });
  }

  return NextResponse.json(
    {
      ok,
      timestamp: new Date().toISOString(),
      tags,
      fields,
      notes: [
        "This endpoint is idempotent. Existing tags/fields are reused.",
        "Required for consent sync: sms and email marketing opt-in state.",
      ],
    },
    { status: ok ? 200 : 207 },
  );
}

