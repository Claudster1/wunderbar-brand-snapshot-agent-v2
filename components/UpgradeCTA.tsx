// components/UpgradeCTA.tsx
// Upgrade CTA component with A/B testing and analytics
// Passes customer email to checkout for automatic upgrade credit detection.

"use client";

import { getUpgradeCTAVariant } from "@/lib/abTest";
import { trackEvent } from "@/lib/analytics";
import { getPersistedEmail } from "@/lib/persistEmail";
import { useState, useEffect } from "react";

export function UpgradeCTA({
  primaryPillar,
  productKey,
}: {
  primaryPillar: string;
  productKey: string;
}) {
  const [loading, setLoading] = useState(false);
  const variant = getUpgradeCTAVariant();

  const label =
    variant === "A"
      ? `Strengthen your ${primaryPillar} with WunderBrand Blueprint+™`
      : `Activate your complete brand system with WunderBrand Blueprint+™`;

  useEffect(() => {
    trackEvent("RESULTS_VIEWED", {
      source: "upgrade_cta",
      productKey,
      variant,
    });
  }, [productKey, variant]);

  async function handleClick() {
    trackEvent("UPGRADE_CLICKED", {
      target: "Snapshot+",
      primaryPillar,
      variant,
    });

    setLoading(true);
    try {
      const email = getPersistedEmail();
      const res = await fetch("/api/stripe/createCheckout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productKey,
          email,
          metadata: {
            source: "snapshot-results",
            primary_pillar: primaryPillar,
            variant,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Checkout failed");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? "Loading..." : label}
    </button>
  );
}
