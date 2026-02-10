// components/UpgradeButton.tsx
// Reusable upgrade button component for product purchases
// Passes customer email to checkout for automatic upgrade credit detection.

"use client";

import { useState } from "react";
import { getPersistedEmail } from "@/lib/persistEmail";

type Product = "snapshot_plus" | "blueprint" | "blueprint_plus";

const productConfig: Record<Product, { label: string }> = {
  snapshot_plus: {
    label: "Upgrade to Snapshot+™",
  },
  blueprint: {
    label: "Activate your Snapshot+™ priorities",
  },
  blueprint_plus: {
    label: "Activate Blueprint+™",
  },
};

export function UpgradeButton({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const config = productConfig[product];

  const handleClick = async () => {
    setLoading(true);
    try {
      const email = getPersistedEmail();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey: product, email }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? "Loading..." : config.label}
    </button>
  );
}
