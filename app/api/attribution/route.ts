import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * POST /api/attribution — Save first-visit attribution data to Supabase.
 * PATCH /api/attribution — Link an email/report to existing attribution record.
 */

export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "attribution", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const body = await req.json();
    const { supabaseServer } = await import("@/lib/supabase");
    const supabase = supabaseServer();

    const { error } = await (supabase.from("session_attribution" as any) as any).insert({
      anonymous_id: body.anonymousId,
      referrer: body.referrer || null,
      referrer_domain: body.referrerDomain || null,
      is_ai_referral: body.isAiReferral ?? false,
      ai_source: body.aiSource || null,
      utm_source: body.utmSource || null,
      utm_medium: body.utmMedium || null,
      utm_campaign: body.utmCampaign || null,
      utm_content: body.utmContent || null,
      utm_term: body.utmTerm || null,
      landing_page: body.landingPage || null,
      user_agent: req.headers.get("user-agent") || null,
      screen_width: body.screenWidth || null,
    });

    if (error) {
      logger.error("[Attribution] Insert error", { error: error.message });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("[Attribution] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Attribution capture failed." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "attribution-link", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const body = await req.json();
    if (!body.anonymousId) {
      return NextResponse.json({ error: "anonymousId required" }, { status: 400 });
    }

    const { supabaseServer } = await import("@/lib/supabase");
    const supabase = supabaseServer();

    const update: Record<string, unknown> = {};
    if (body.email) update.user_email = body.email.toLowerCase();
    if (body.reportId) update.report_id = body.reportId;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: true });
    }

    const { error } = await (supabase
      .from("session_attribution" as any) as any)
      .update(update)
      .eq("anonymous_id", body.anonymousId);

    if (error) {
      logger.error("[Attribution] Update error", { error: error.message });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("[Attribution] Patch error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Attribution link failed." }, { status: 500 });
  }
}
