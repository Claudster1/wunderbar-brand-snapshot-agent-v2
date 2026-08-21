// components/blueprint/BlueprintPlusNudge.tsx
// Nudge component encouraging upgrade to Blueprint+™

import { getTrackedCheckoutUrl } from "@/lib/checkoutUrls";

export function BlueprintPlusNudge({ primaryPillar }: { primaryPillar: string }) {
  return (
    <div className="mt-16 border-t pt-8 max-w-3xl">
      <h3 className="font-semibold text-brand-navy mb-2">
        Want to go deeper?
      </h3>

      <p className="text-[15px] mb-4">
        Blueprint+™ expands on your {primaryPillar.toLowerCase()} work with advanced
        prompt packs, audience-specific variants, and campaign-level activation.
      </p>

      <a
        href={getTrackedCheckoutUrl({
          product: "blueprint-plus",
          medium: "results_cta",
          content: "blueprint_plus_nudge",
        })}
        className="inline-block text-sm text-brand-blue font-semibold"
      >
        Explore Blueprint+™ →
      </a>
    </div>
  );
}
