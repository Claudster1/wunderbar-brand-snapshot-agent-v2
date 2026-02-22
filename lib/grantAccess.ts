// lib/grantAccess.ts
// Grant product access to users after successful purchase

import { supabaseServer } from "@/lib/supabaseServer";
import { withRetry } from "@/lib/supabase/withRetry";
import { logger } from "@/lib/logger";

type ProductKey = "snapshot_plus" | "blueprint" | "blueprint_plus";

/**
 * Grant access to a product for a user
 * Updates user_purchases table with access flags
 */
export async function grantAccess(
  userId: string,
  productKey: ProductKey
): Promise<void> {
  const supabase = supabaseServer();

  const accessUpdate: Record<string, boolean> = {};
  
  switch (productKey) {
    case "snapshot_plus":
      accessUpdate.has_brand_snapshot_plus = true;
      break;
    case "blueprint":
      accessUpdate.has_blueprint = true;
      accessUpdate.has_brand_snapshot_plus = true;
      break;
    case "blueprint_plus":
      accessUpdate.has_blueprint_plus = true;
      accessUpdate.has_blueprint = true;
      accessUpdate.has_brand_snapshot_plus = true;
      break;
  }

  const { error } = await withRetry<{ error: { message: string } | null }>(
    async () =>
      await supabase
        .from("user_purchases")
        .upsert(
          {
            user_id: userId,
            ...accessUpdate,
            purchase_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        ),
    "grantAccess"
  );

  if (error) {
    logger.error("[grantAccess] Failed to grant access", { userId, productKey, error: error.message });
    throw new Error(`Failed to grant access: ${error.message}`);
  }
}
