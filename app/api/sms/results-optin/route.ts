// POST /api/sms/results-optin
//
// Results-page SMS opt-in shown beside the upgrade CTA ("Want a 2-min text
// walkthrough of your #1 fix?"). Two jobs:
//   1) Record SMS consent on the AC contact (tags + phone_mobile), same as
//      /api/sms/consent but tied to a report.
//   2) Fulfill the promise immediately: send the opted-in user a personalized
//      first text via Quo naming their #1 growth lever (weakest pillar) and
//      inviting a reply — the automated hot-lead first-touch, human close.
//
// The pillar is derived server-side from the report (never trusted from client).

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  applyActiveCampaignTags,
  removeActiveCampaignTags,
  setContactFields,
} from "@/lib/applyActiveCampaignTags";
import { trackActiveCampaignSiteEvent } from "@/lib/fireACEvent";
import { getPrimaryPillar } from "@/lib/pillars/getPrimaryPillar";
import { sendQuoSms, isE164 } from "@/lib/sms/quo";

const PILLAR_LABELS: Record<string, string> = {
  positioning: "Positioning",
  messaging: "Messaging",
  visibility: "Visibility",
  credibility: "Credibility",
  conversion: "Conversion",
};

function firstNameFrom(name: unknown): string {
  if (typeof name !== "string" || !name.trim()) return "";
  return name.trim().split(/\s+/)[0].slice(0, 40);
}

function buildOptInSms(opts: { firstName: string; pillarLabel: string }): string {
  const hi = opts.firstName ? `Hi ${opts.firstName}, ` : "Hi, ";
  return (
    `${hi}it's Claudine at Wunderbar Digital. Your WunderBrand results point to ` +
    `${opts.pillarLabel} as your #1 growth lever. Want a quick 2-min walkthrough of how ` +
    `to fix it? Reply here and I'll help. Txt STOP to opt out.`
  );
}

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { EMAIL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "sms-results-optin", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { checkBodySize, BODY_LIMITS } = await import("@/lib/security/bodyLimit");
    const sizeCheck = checkBodySize(req, BODY_LIMITS.EMAIL_FORM);
    if (sizeCheck) return sizeCheck;

    const body = (await req.json().catch(() => ({}))) as {
      reportId?: string;
      email?: string;
      phone?: string;
      honeypot?: string;
    };
    const { reportId, email, phone, honeypot } = body;

    // Honeypot — silently drop bot-shaped submissions.
    if (typeof honeypot === "string" && honeypot.length > 0) {
      logger.warn("[SMS Opt-in] Honeypot tripped — dropping submission silently");
      return NextResponse.json({ success: true });
    }

    if (!email || !String(email).includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
    if (!isE164(normalizedPhone)) {
      return NextResponse.json(
        { error: "Enter a valid mobile number including country code (e.g. +16575551234)." },
        { status: 422 },
      );
    }

    const { validateEmail } = await import("@/lib/security/emailValidation");
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.friendlyMessage, reason: emailCheck.reason },
        { status: 422 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Derive the #1 pillar server-side from the report (never trust client copy).
    let pillarLabel = "your brand foundation";
    let firstName = "";
    const supabase = supabaseAdmin;
    if (supabase && reportId && typeof reportId === "string") {
      async function loadRow(idColumn: "id" | "report_id") {
        const { data } = await supabase!
          .from("brand_snapshot_reports")
          .select("pillar_scores, full_report, user_name")
          .eq(idColumn, reportId)
          .maybeSingle();
        return data as
          | { pillar_scores?: unknown; full_report?: unknown; user_name?: unknown }
          | null;
      }
      const row = (await loadRow("report_id")) ?? (await loadRow("id"));
      if (row) {
        const fr =
          row.full_report && typeof row.full_report === "object" && !Array.isArray(row.full_report)
            ? (row.full_report as Record<string, unknown>)
            : {};
        const answers =
          fr.answers && typeof fr.answers === "object" && !Array.isArray(fr.answers)
            ? (fr.answers as Record<string, unknown>)
            : {};
        const pillarScores =
          row.pillar_scores && typeof row.pillar_scores === "object" && !Array.isArray(row.pillar_scores)
            ? (row.pillar_scores as Record<string, number>)
            : {};
        const businessType =
          (typeof answers.businessType === "string" && answers.businessType) ||
          (typeof fr.business_type === "string" && fr.business_type) ||
          null;
        if (Object.keys(pillarScores).length > 0) {
          const primary = getPrimaryPillar(pillarScores, { businessType });
          pillarLabel = PILLAR_LABELS[primary.pillar] ?? pillarLabel;
        }
        firstName = firstNameFrom(row.user_name) || firstNameFrom(answers.userName);
      }
    }

    // 1) Record consent on the AC contact.
    try {
      await applyActiveCampaignTags({
        email: normalizedEmail,
        tags: ["sms:opted-in", "sms:results-optin", "intent:sms-walkthrough"],
      });
      await removeActiveCampaignTags({ email: normalizedEmail, tags: ["sms:opted-out"] });
      await setContactFields({
        email: normalizedEmail,
        fields: {
          phone_mobile: normalizedPhone,
          sms_opted_in: "true",
          sms_optin_source: "results_upgrade",
        },
      });
      await trackActiveCampaignSiteEvent({
        email: normalizedEmail,
        eventName: "sms_optin",
        eventData: "results_upgrade",
      });
    } catch (acErr) {
      logger.error("[SMS Opt-in] AC consent sync failed", {
        error: acErr instanceof Error ? acErr.message : String(acErr),
      });
      // Continue — we still try to send the promised text.
    }

    // 2) Fulfill the promise: send the first text now.
    const smsResult = await sendQuoSms({
      to: normalizedPhone,
      content: buildOptInSms({ firstName, pillarLabel }),
    });
    if (!smsResult.ok) {
      logger.warn("[SMS Opt-in] Quo send failed", {
        error: smsResult.error,
        provider: smsResult.provider,
      });
      // Consent is recorded; report success so the UX confirms opt-in even if the
      // immediate text is delayed (a human/automation can follow up).
    }

    return NextResponse.json({ success: true, texted: smsResult.ok });
  } catch (err) {
    logger.error("[SMS Opt-in] Unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
