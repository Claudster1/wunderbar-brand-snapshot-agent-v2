// components/UpgradeCTA.tsx
// Upgrade CTA component with A/B testing and analytics

"use client";

import { getUpgradeCTAVariant } from "@/lib/abTest";
import { track } from "@/lib/analytics";
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
      ? `Strengthen your ${primaryPillar} with Brand Blueprint+™`
      : `Activate your complete brand system with Brand Blueprint+™`;

  useEffect(() => {
    track("upgrade_cta_viewed", { productKey, variant });
  }, [productKey, variant]);

  async function handleClick() {
    track("upgrade_cta_clicked", { productKey, variant });

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/createCheckout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey }),
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
