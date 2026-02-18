// lib/refreshEntitlements.ts
// Core logic for refresh entitlements: creation, eligibility checks, and usage tracking.

import { supabaseServer } from "@/lib/supabase";

export interface RefreshEntitlement {
  id: string;
  user_email: string;
  product_tier: string;
  brand_name: string;
  window_start: string;
  window_end: string;
  max_free_refreshes: number;
  refreshes_used: number;
  paid_refresh_price: number;
  status: string;
}

export interface RefreshEligibility {
  canRefresh: boolean;
  isFree: boolean;
  paidPrice: number | null;
  freeRemaining: number;
  windowEnd: string | null;
  daysRemaining: number | null;
  brandName: string | null;
  brandLocked: boolean;
  reason: string;
}

/** Refresh window durations by tier. */
const WINDOW_DAYS: Record<string, number> = {
  blueprint: 90,
  blueprint_plus: 365,
};

/** Max free refreshes by tier. */
const MAX_FREE: Record<string, number> = {
  snapshot_plus: 0,
  blueprint: 1,
  blueprint_plus: 9999, // effectively unlimited
};

/** Paid refresh price in cents by tier. */
const PAID_PRICE_CENTS: Record<string, number> = {
  snapshot_plus: 4700,
  blueprint: 9700,
  blueprint_plus: 9700, // after year 1
};

/**
 * Create a refresh entitlement when a product is purchased.
 * Called from the Stripe webhook after recording the purchase.
 */
export async function createRefreshEntitlement({
  email,
  productTier,
  brandName,
  purchaseId,
}: {
  email: string;
  productTier: "snapshot_plus" | "blueprint" | "blueprint_plus";
  brandName: string;
  purchaseId?: string;
}): Promise<void> {
  const supabase = supabaseServer();

  const windowDays = WINDOW_DAYS[productTier] || 90;
  const windowEnd = new Date();
  windowEnd.setDate(windowEnd.getDate() + windowDays);

  const { error } = await (supabase.from("refresh_entitlements" as any) as any).insert({
    user_email: email.toLowerCase(),
    product_tier: productTier,
    brand_name: brandName.trim(),
    purchase_id: purchaseId || null,
    window_start: new Date().toISOString(),
    window_end: windowEnd.toISOString(),
    max_free_refreshes: MAX_FREE[productTier] ?? 0,
    refreshes_used: 0,
    paid_refresh_price: PAID_PRICE_CENTS[productTier] ?? 0,
    status: "active",
  });

  if (error) {
    console.error("[RefreshEntitlements] Create error:", error.message);
    throw new Error(`Failed to create refresh entitlement: ${error.message}`);
  }
}

/**
 * Check refresh eligibility for a user.
 * Returns whether they can refresh, if it's free, the price if paid,
 * remaining free refreshes, and the brand lock.
 */
export async function checkRefreshEligibility(
  email: string,
): Promise<RefreshEligibility> {
  const supabase = supabaseServer();

  // Get the most recent active entitlement for this user
  const { data, error } = await (supabase
    .from("refresh_entitlements" as any)
    .select("*")
    .eq("user_email", email.toLowerCase())
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1) as any);

  if (error || !data || data.length === 0) {
    // No entitlement — free tier, always allowed
    return {
      canRefresh: true,
      isFree: true,
      paidPrice: null,
      freeRemaining: Infinity,
      windowEnd: null,
      daysRemaining: null,
      brandName: null,
      brandLocked: false,
      reason: "Free tier — retake anytime.",
    };
  }

  const ent = data[0] as RefreshEntitlement;
  const now = new Date();
  const windowEnd = new Date(ent.window_end);
  const daysRemaining = Math.max(0, Math.ceil((windowEnd.getTime() - now.getTime()) / 86400000));
  const isExpired = now > windowEnd;
  const freeRemaining = Math.max(0, ent.max_free_refreshes - ent.refreshes_used);

  // Blueprint+ with active window: unlimited free refreshes
  if (ent.product_tier === "blueprint_plus" && !isExpired) {
    return {
      canRefresh: true,
      isFree: true,
      paidPrice: null,
      freeRemaining: Infinity,
      windowEnd: ent.window_end,
      daysRemaining,
      brandName: ent.brand_name,
      brandLocked: true,
      reason: `Unlimited refreshes included — ${daysRemaining} days remaining.`,
    };
  }

  // Blueprint with free refresh remaining and within window
  if (ent.product_tier === "blueprint" && freeRemaining > 0 && !isExpired) {
    return {
      canRefresh: true,
      isFree: true,
      paidPrice: null,
      freeRemaining,
      windowEnd: ent.window_end,
      daysRemaining,
      brandName: ent.brand_name,
      brandLocked: true,
      reason: `${freeRemaining} free refresh${freeRemaining > 1 ? "es" : ""} remaining — use within ${daysRemaining} days.`,
    };
  }

  // Window expired or free refreshes exhausted — paid refresh available
  const priceDollars = ent.paid_refresh_price / 100;
  return {
    canRefresh: true,
    isFree: false,
    paidPrice: priceDollars,
    freeRemaining: 0,
    windowEnd: isExpired ? null : ent.window_end,
    daysRemaining: isExpired ? 0 : daysRemaining,
    brandName: ent.brand_name,
    brandLocked: true,
    reason: isExpired
      ? `Free refresh window expired. Refreshes available at $${priceDollars}.`
      : `Free refreshes used. Additional refreshes available at $${priceDollars}.`,
  };
}

/**
 * Record a refresh being used. Increments the counter.
 * Call this when a refresh report is generated (not at checkout).
 */
export async function recordRefreshUsed(email: string): Promise<void> {
  const supabase = supabaseServer();

  const { data } = await (supabase
    .from("refresh_entitlements" as any)
    .select("id, refreshes_used")
    .eq("user_email", email.toLowerCase())
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1) as any);

  if (!data || data.length === 0) return;

  const ent = data[0];
  await (supabase
    .from("refresh_entitlements" as any) as any)
    .update({ refreshes_used: (ent.refreshes_used || 0) + 1 })
    .eq("id", ent.id);
}

/**
 * Validate that a refresh is for the correct brand.
 * Returns true if the brand name matches the entitlement (case-insensitive).
 */
export function validateBrandMatch(
  entitlementBrand: string,
  refreshBrand: string,
): boolean {
  return entitlementBrand.trim().toLowerCase() === refreshBrand.trim().toLowerCase();
}

/**
 * Get entitlements expiring within N days (for AC reminder cron).
 */
export async function getExpiringEntitlements(
  withinDays: number,
  reminderField: "reminder_60_day_sent" | "reminder_30_day_sent" | "reminder_7_day_sent",
): Promise<RefreshEntitlement[]> {
  const supabase = supabaseServer();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);

  const { data } = await (supabase
    .from("refresh_entitlements" as any)
    .select("*")
    .eq("status", "active")
    .eq(reminderField, false)
    .lte("window_end", cutoff.toISOString())
    .gte("window_end", new Date().toISOString())
    .order("window_end", { ascending: true }) as any);

  return (data || []) as RefreshEntitlement[];
}

/**
 * Mark a reminder as sent for an entitlement.
 */
export async function markReminderSent(
  entitlementId: string,
  reminderField: "reminder_60_day_sent" | "reminder_30_day_sent" | "reminder_7_day_sent" | "expiry_notice_sent",
): Promise<void> {
  const supabase = supabaseServer();
  await (supabase
    .from("refresh_entitlements" as any) as any)
    .update({ [reminderField]: true })
    .eq("id", entitlementId);
}
