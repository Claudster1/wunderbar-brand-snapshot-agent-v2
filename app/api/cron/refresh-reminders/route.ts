// GET /api/cron/refresh-reminders
// Cron job to send AC reminder emails for expiring refresh windows.
// Intended to run daily via Vercel Cron or external scheduler.
//
// Reminder schedule:
//   - Blueprint (90-day window):  60-day reminder (30 days left), 7-day reminder
//   - Blueprint+ (1-year window): 60-day reminder (2 months left), 30-day reminder, 7-day reminder
//   - Post-expiry: expiry notice (window ended)

import { NextRequest, NextResponse } from "next/server";
import {
  getExpiringEntitlements,
  markReminderSent,
} from "@/lib/refreshEntitlements";
import { fireACEvent } from "@/lib/fireACEvent";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Verify cron secret to prevent unauthorized access
function verifyCronAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // allow if no secret configured (dev)
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

interface ReminderConfig {
  withinDays: number;
  field: "reminder_60_day_sent" | "reminder_30_day_sent" | "reminder_7_day_sent";
  eventName: string;
  tags: string[];
  urgency: string;
}

const REMINDER_CONFIGS: ReminderConfig[] = [
  {
    withinDays: 60,
    field: "reminder_60_day_sent",
    eventName: "refresh_window_60_day_reminder",
    tags: ["refresh:60-day-reminder"],
    urgency: "low",
  },
  {
    withinDays: 30,
    field: "reminder_30_day_sent",
    eventName: "refresh_window_30_day_reminder",
    tags: ["refresh:30-day-reminder"],
    urgency: "medium",
  },
  {
    withinDays: 7,
    field: "reminder_7_day_sent",
    eventName: "refresh_window_7_day_reminder",
    tags: ["refresh:7-day-reminder"],
    urgency: "high",
  },
];

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { reminder: string; sent: number; errors: number }[] = [];

  for (const config of REMINDER_CONFIGS) {
    let sent = 0;
    let errors = 0;

    try {
      const entitlements = await getExpiringEntitlements(config.withinDays, config.field);

      for (const ent of entitlements) {
        try {
          const daysLeft = Math.max(
            0,
            Math.ceil((new Date(ent.window_end).getTime() - Date.now()) / 86400000)
          );
          const windowEndFormatted = new Date(ent.window_end).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });

          // Determine what they should do
          const freeRemaining = Math.max(0, ent.max_free_refreshes - ent.refreshes_used);
          const hasUnusedRefresh = freeRemaining > 0;

          await fireACEvent({
            email: ent.user_email,
            eventName: config.eventName,
            tags: [
              ...config.tags,
              `refresh:${ent.product_tier.replace(/_/g, "-")}`,
            ],
            fields: {
              refresh_brand_name: ent.brand_name,
              refresh_tier: ent.product_tier,
              refresh_days_remaining: daysLeft,
              refresh_window_end: windowEndFormatted,
              refresh_urgency: config.urgency,
              refresh_free_remaining: hasUnusedRefresh
                ? (ent.product_tier === "blueprint_plus" ? "unlimited" : String(freeRemaining))
                : "0",
              refresh_has_unused: hasUnusedRefresh ? "yes" : "no",
              refresh_action_url: "https://app.wunderbrand.ai/dashboard",
            },
          });

          await markReminderSent(ent.id, config.field);
          sent++;
        } catch (err) {
          errors++;
          logger.error("[Refresh Reminders] Failed to send reminder", {
            entitlementId: ent.id,
            email: ent.user_email,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    } catch (err) {
      logger.error("[Refresh Reminders] Failed to fetch entitlements", {
        reminder: config.field,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    results.push({ reminder: config.field, sent, errors });
  }

  // Also handle post-expiry notices
  let expirySent = 0;
  try {
    const { supabaseServer } = await import("@/lib/supabase");
    const supabase = supabaseServer();

    // Find active entitlements that have expired but haven't received an expiry notice
    const { data: expired } = await (supabase
      .from("refresh_entitlements" as any)
      .select("*")
      .eq("status", "active")
      .eq("expiry_notice_sent", false)
      .lt("window_end", new Date().toISOString())
      .order("window_end", { ascending: true })
      .limit(100) as any);

    for (const ent of expired || []) {
      try {
        await fireACEvent({
          email: ent.user_email,
          eventName: "refresh_window_expired",
          tags: [
            "refresh:window-expired",
            `refresh:${ent.product_tier.replace(/_/g, "-")}`,
          ],
          fields: {
            refresh_brand_name: ent.brand_name,
            refresh_tier: ent.product_tier,
            refresh_window_end: new Date(ent.window_end).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            refresh_action_url: "https://app.wunderbrand.ai/dashboard",
          },
        });

        await markReminderSent(ent.id, "expiry_notice_sent");

        // Mark the entitlement as expired
        await (supabase
          .from("refresh_entitlements" as any) as any)
          .update({ status: "expired" })
          .eq("id", ent.id);

        expirySent++;
      } catch {
        // continue
      }
    }
  } catch (err) {
    logger.error("[Refresh Reminders] Expiry notice check failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  results.push({ reminder: "expiry_notice", sent: expirySent, errors: 0 });

  logger.info("[Refresh Reminders] Cron complete", { results });

  return NextResponse.json({
    ok: true,
    results,
    timestamp: new Date().toISOString(),
  });
}
