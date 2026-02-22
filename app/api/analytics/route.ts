import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/** Event → category mapping for the analytics_events table. */
const EVENT_CATEGORIES: Record<string, string> = {
  SNAPSHOT_STARTED: "product",
  SNAPSHOT_COMPLETED: "conversion",
  RESULTS_VIEWED: "engagement",
  UPGRADE_CLICKED: "conversion",
  UPGRADE_ABANDONED: "engagement",
  UPGRADE_NUDGE_CLICKED: "conversion",
  PDF_DOWNLOADED: "engagement",
  BLUEPRINT_STARTED: "product",
  BLUEPRINT_COMPLETED: "conversion",
};

export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "analytics", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const body = await req.json();

    // ── 1. Write to Supabase analytics_events table ──
    const { supabaseServer } = await import("@/lib/supabase");
    const supabase = supabaseServer();

    const eventRow = {
      event_name: body.event,
      event_category: EVENT_CATEGORIES[body.event] || "product",
      session_id: body.meta?.sessionId || null,
      report_id: body.meta?.reportId || null,
      user_email: body.meta?.email?.toLowerCase() || null,
      anonymous_id: body.meta?.anonymousId || null,
      referrer: body.meta?.referrer || null,
      referrer_domain: body.meta?.referrerDomain || null,
      utm_source: body.meta?.utmSource || null,
      utm_medium: body.meta?.utmMedium || null,
      utm_campaign: body.meta?.utmCampaign || null,
      utm_content: body.meta?.utmContent || null,
      utm_term: body.meta?.utmTerm || null,
      is_ai_referral: body.meta?.isAiReferral ?? false,
      ai_source: body.meta?.aiSource || null,
      ab_variant: body.meta?.abVariant || null,
      ab_test_id: body.meta?.abTestId || null,
      meta: body.meta || {},
      page_path: body.meta?.pagePath || null,
      user_agent: req.headers.get("user-agent") || null,
    };

    const { error: dbError } = await supabase
      .from("analytics_events" as any)
      .insert(eventRow as any);

    if (dbError) {
      logger.error("[Analytics] Supabase insert error", { error: dbError.message });
    }

    // ── 2. Forward to ActiveCampaign webhook (existing behavior) ──
    const tags: string[] = [];

    if (body.event === "RESULTS_VIEWED") {
      tags.push("snapshot:viewed-results");
      if (body.meta?.returnVisit) {
        tags.push("snapshot:return-visit");
      }
    }

    if (body.event === "UPGRADE_CLICKED") {
      tags.push("snapshot:clicked-upgrade");
    }

    if (body.event === "SNAPSHOT_COMPLETED") {
      tags.push("snapshot:completed");
    }

    const webhookUrl = process.env.ACTIVE_CAMPAIGN_WEBHOOK;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: body.event,
          ...body.meta,
          tags,
        }),
      }).catch((err) => {
        logger.error("[Analytics] AC webhook error", { error: err instanceof Error ? err.message : String(err) });
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    logger.error("[Analytics API] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Analytics request failed." },
      { status: 500 }
    );
  }
}
