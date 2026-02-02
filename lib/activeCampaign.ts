export async function trackUpgradeClick(
  product: "snapshot+" | "blueprint" | "blueprint+",
  variant: "A" | "B"
) {
  const tag =
    product === "snapshot+"
      ? "snapshot:clicked-upgrade"
      : "blueprint:clicked";

  await fetch(process.env.ACTIVECAMPAIGN_WEBHOOK_URL!, {
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
}

export { fireACEvent } from "@/lib/fireACEvent";
