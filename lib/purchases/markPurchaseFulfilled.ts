// lib/purchases/markPurchaseFulfilled.ts
// Mark paid purchases as fulfilled when the buyer completes a diagnostic report.

import "server-only";

import { logger } from "@/lib/logger";
import { applyActiveCampaignTags, removeActiveCampaignTags } from "@/lib/applyActiveCampaignTags";

const FULL_TIER_SKUS = ["SNAPSHOT_PLUS", "BLUEPRINT", "BLUEPRINT_PLUS"] as const;

/**
 * Mark open paid purchases for this email as fulfilled and attach report_id when provided.
 * Stops start-reminder cron from nagging buyers who already finished.
 */
export async function markPurchasesFulfilledForEmail(
  email: string,
  reportId?: string | null,
): Promise<number> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return 0;

  const { supabaseServer } = await import("@/lib/supabase");
  const supabase = supabaseServer();

  const patch: Record<string, unknown> = {
    fulfilled: true,
    updated_at: new Date().toISOString(),
  };
  if (reportId && /^[0-9a-f-]{36}$/i.test(reportId)) {
    patch.report_id = reportId;
  }

  const { data, error } = await (supabase.from("brand_snapshot_purchases") as any)
    .update(patch)
    .eq("user_email", normalized)
    .eq("status", "paid")
    .eq("fulfilled", false)
    .in("product_sku", [...FULL_TIER_SKUS])
    .select("id");

  if (error) {
    logger.warn("[markPurchasesFulfilled] Update failed", {
      email: normalized,
      error: error.message,
    });
    return 0;
  }

  const count = Array.isArray(data) ? data.length : 0;
  if (count > 0) {
    logger.info("[markPurchasesFulfilled] Marked fulfilled", {
      email: normalized,
      count,
      reportId: reportId || null,
    });
    try {
      await removeActiveCampaignTags({
        email: normalized,
        tags: ["onboarding:awaiting-start"],
      });
      await applyActiveCampaignTags({
        email: normalized,
        tags: ["diagnostic:completed"],
      });
    } catch (acErr) {
      logger.warn("[markPurchasesFulfilled] AC tag update failed", {
        error: acErr instanceof Error ? acErr.message : String(acErr),
      });
    }
  }
  return count;
}
