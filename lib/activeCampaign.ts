const AC_WEBHOOK_URL = process.env.ACTIVECAMPAIGN_WEBHOOK_URL ?? process.env.NEXT_PUBLIC_ACTIVECAMPAIGN_WEBHOOK_URL;

export async function trackUpgradeClick(
  product: "snapshot+" | "blueprint" | "blueprint+",
  variant: "A" | "B"
) {
  if (!AC_WEBHOOK_URL) return;
  try {
    const tag =
      product === "snapshot+"
        ? "snapshot:clicked-upgrade"
        : "blueprint:clicked";

    await fetch(AC_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "upgrade_cta_clicked",
        product,
        variant,
        timestamp: Date.now(),
        tags: tag ? [tag] : [],
      }),
    });
  } catch (_) {
    // No-op when webhook is unavailable
  }
}

export { fireACEvent } from "@/lib/fireACEvent";
