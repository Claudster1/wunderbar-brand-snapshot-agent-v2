// POST /api/services/interest
//
// Captures interest in a managed service (Managed Marketing / AI Consulting) from
// leads who have NOT completed a snapshot. Applies the same tags the snapshot flow
// uses (`services:managed_marketing` / `services:consulting`), which are the entry
// triggers for the pre-booking nurtures (Automation E / F). This closes the gap
// where non-snapshot leads could never enter those goals-first sequences.
//
// Snapshot-completers are already tagged by /api/snapshot; this route is for the
// standalone service CTAs (site nav, service pages) where there is no report.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { applyActiveCampaignTags, setContactFields } from "@/lib/applyActiveCampaignTags";
import { trackActiveCampaignSiteEvent } from "@/lib/fireACEvent";

type ServiceInterest = "managed_marketing" | "consulting" | "both";

function tagsForService(service: ServiceInterest): string[] {
  const tags = ["services:interested"];
  if (service === "managed_marketing" || service === "both") tags.push("services:managed_marketing");
  if (service === "consulting" || service === "both") tags.push("services:consulting");
  return tags;
}

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { EMAIL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "services-interest", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { checkBodySize, BODY_LIMITS } = await import("@/lib/security/bodyLimit");
    const sizeCheck = checkBodySize(req, BODY_LIMITS.EMAIL_FORM);
    if (sizeCheck) return sizeCheck;

    const body = await req.json();
    const {
      email,
      service: rawService,
      firstName: rawFirstName,
      company: rawCompany,
      source: rawSource,
      honeypot,
    } = body as {
      email?: string;
      service?: string;
      firstName?: string;
      company?: string;
      source?: string;
      honeypot?: string;
    };

    // Honeypot — silently drop bot-shaped submissions.
    if (typeof honeypot === "string" && honeypot.length > 0) {
      logger.warn("[Services Interest] Honeypot tripped — dropping submission silently");
      return NextResponse.json({ success: true });
    }

    const { verifyTurnstileToken } = await import("@/lib/security/turnstile");
    const turnstileResult = await verifyTurnstileToken(
      body.turnstileToken,
      req.headers.get("x-forwarded-for") || undefined,
    );
    if (!turnstileResult.success) {
      logger.warn("[Services Interest] Turnstile failed", { errorCodes: turnstileResult["error-codes"] });
      return NextResponse.json(
        { error: "Security verification failed. Please refresh and try again." },
        { status: 403 },
      );
    }

    if (!email || !String(email).includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const service: ServiceInterest =
      rawService === "managed_marketing" || rawService === "consulting" || rawService === "both"
        ? rawService
        : "managed_marketing";

    const { validateEmail } = await import("@/lib/security/emailValidation");
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.friendlyMessage, reason: emailCheck.reason },
        { status: 422 },
      );
    }

    const normalized = email.trim().toLowerCase();
    const { sanitizeString } = await import("@/lib/security/inputValidation");
    const firstName =
      typeof rawFirstName === "string" && rawFirstName.trim() ? sanitizeString(rawFirstName).slice(0, 80) : "";
    const company =
      typeof rawCompany === "string" && rawCompany.trim() ? sanitizeString(rawCompany).slice(0, 120) : "";
    const source =
      typeof rawSource === "string" && rawSource.trim() ? sanitizeString(rawSource).slice(0, 60) : "site";

    // Apply the interest tag(s) — these are the entry triggers for the pre-booking nurtures.
    try {
      await applyActiveCampaignTags({ email: normalized, tags: tagsForService(service) });

      const fields: Record<string, string> = { services_interest_source: source };
      if (firstName) fields.first_name_custom = firstName;
      if (company) fields.company_name = company;
      await setContactFields({ email: normalized, fields });

      // Record an event so AC reporting / any event-triggered automation can see it.
      await trackActiveCampaignSiteEvent({
        email: normalized,
        eventName: "services_interest",
        eventData: `${service}:${source}`,
      });
    } catch (acErr) {
      logger.error("[Services Interest] AC sync failed", {
        error: acErr instanceof Error ? acErr.message : String(acErr),
      });
      // Don't leak internals; the tag apply is best-effort from the caller's POV.
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("[Services Interest] Unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
