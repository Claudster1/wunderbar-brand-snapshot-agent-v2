// lib/purchases/runPurchaseStartReminders.ts
// Find paid, unfulfilled purchases and send day-2 / day-7 / day-21 start nudges.

import "server-only";

import { logger } from "@/lib/logger";
import {
  sendPurchaseStartReminderEmail,
  type PurchaseStartReminderKey,
} from "@/lib/email/purchaseStartReminderEmail";
import {
  buildPurchaseAccessUrl,
  createPurchaseAccessToken,
} from "@/lib/security/purchaseAccessLink";
import { fireACEvent } from "@/lib/fireACEvent";
import { applyActiveCampaignTags } from "@/lib/applyActiveCampaignTags";

type ReminderColumn =
  | "start_reminder_2d_sent_at"
  | "start_reminder_7d_sent_at"
  | "start_reminder_21d_sent_at";

type ReminderConfig = {
  key: PurchaseStartReminderKey;
  minAgeDays: number;
  maxAgeDays: number;
  column: ReminderColumn;
  acTag: string;
  acEvent: string;
};

const REMINDERS: ReminderConfig[] = [
  {
    key: "2d",
    minAgeDays: 2,
    maxAgeDays: 6,
    column: "start_reminder_2d_sent_at",
    acTag: "reminder:purchase-start-2d",
    acEvent: "purchase_start_reminder_2d",
  },
  {
    key: "7d",
    minAgeDays: 7,
    maxAgeDays: 20,
    column: "start_reminder_7d_sent_at",
    acTag: "reminder:purchase-start-7d",
    acEvent: "purchase_start_reminder_7d",
  },
  {
    key: "21d",
    minAgeDays: 21,
    maxAgeDays: 89,
    column: "start_reminder_21d_sent_at",
    acTag: "reminder:purchase-start-21d",
    acEvent: "purchase_start_reminder_21d",
  },
];

const FULL_TIER_SKUS = ["SNAPSHOT_PLUS", "BLUEPRINT", "BLUEPRINT_PLUS"];

function skuToChatTier(sku: string): string {
  switch (sku) {
    case "BLUEPRINT_PLUS":
      return "blueprint-plus";
    case "BLUEPRINT":
      return "blueprint";
    default:
      return "snapshot-plus";
  }
}

export type PurchaseStartReminderRunResult = {
  reminder: PurchaseStartReminderKey;
  candidates: number;
  sent: number;
  errors: number;
  skippedMissingColumn?: boolean;
};

export async function runPurchaseStartReminders(): Promise<PurchaseStartReminderRunResult[]> {
  const { supabaseServer } = await import("@/lib/supabase");
  const supabase = supabaseServer();
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://app.wunderbrand.ai";
  const dashboardUrl = `${baseUrl.replace(/\/$/, "")}/dashboard`;

  const out: PurchaseStartReminderRunResult[] = [];

  for (const config of REMINDERS) {
    const result: PurchaseStartReminderRunResult = {
      reminder: config.key,
      candidates: 0,
      sent: 0,
      errors: 0,
    };

    const now = Date.now();
    const olderThan = new Date(now - config.minAgeDays * 86400000).toISOString();
    const newerThan = new Date(now - config.maxAgeDays * 86400000).toISOString();

    const { data, error } = await (supabase
      .from("brand_snapshot_purchases" as any)
      .select(
        `id, user_email, product_sku, created_at, ${config.column}`,
      )
      .eq("status", "paid")
      .eq("fulfilled", false)
      .in("product_sku", FULL_TIER_SKUS)
      .is(config.column, null)
      .lte("created_at", olderThan)
      .gte("created_at", newerThan)
      .limit(200) as any);

    if (error) {
      // Migration may not be applied yet — don't fail the whole cron loudly as 500 for ops.
      const msg = String(error.message || "");
      if (/column|does not exist|start_reminder/i.test(msg)) {
        result.skippedMissingColumn = true;
        logger.warn("[Purchase Start Reminders] Reminder columns missing — run migration", {
          column: config.column,
          error: msg,
        });
      } else {
        logger.error("[Purchase Start Reminders] Query failed", {
          reminder: config.key,
          error: msg,
        });
        result.errors += 1;
      }
      out.push(result);
      continue;
    }

    const rows = (data || []) as Array<{
      id: string;
      user_email: string;
      product_sku: string;
      created_at: string;
    }>;
    result.candidates = rows.length;

    for (const row of rows) {
      try {
        const email = String(row.user_email || "").toLowerCase();
        if (!email) continue;

        const chatTier = skuToChatTier(row.product_sku);
        const accessTok = createPurchaseAccessToken({
          email,
          tier: chatTier,
        });
        const accessUrl = accessTok
          ? buildPurchaseAccessUrl(baseUrl, accessTok)
          : `${baseUrl.replace(/\/$/, "")}/?tier=${chatTier}`;

        const sent = await sendPurchaseStartReminderEmail({
          to: email,
          reminderKey: config.key,
          productSku: row.product_sku,
          accessUrl,
          dashboardUrl,
        });

        if (!sent.ok) {
          result.errors += 1;
          logger.error("[Purchase Start Reminders] Email failed", {
            email,
            reminder: config.key,
            error: sent.error,
            provider: sent.provider,
          });
          continue;
        }

        const { error: markErr } = await (supabase.from("brand_snapshot_purchases") as any)
          .update({
            [config.column]: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id);

        if (markErr) {
          result.errors += 1;
          logger.error("[Purchase Start Reminders] Mark sent failed", {
            purchaseId: row.id,
            error: markErr.message,
          });
          continue;
        }

        try {
          await applyActiveCampaignTags({ email, tags: [config.acTag] });
          await fireACEvent({
            email,
            eventName: config.acEvent,
            tags: [config.acTag, "onboarding:awaiting-start"],
            fields: {
              start_diagnostic_link: accessUrl,
              dashboard_link: dashboardUrl,
              product_sku: row.product_sku,
              reminder_key: config.key,
            },
          });
        } catch {
          // non-blocking
        }

        result.sent += 1;
      } catch (err) {
        result.errors += 1;
        logger.error("[Purchase Start Reminders] Row failed", {
          purchaseId: row.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    out.push(result);
  }

  return out;
}
