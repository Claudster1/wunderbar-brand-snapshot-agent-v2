// components/UpgradeButton.tsx
// Reusable upgrade button component for product purchases
// Passes customer email to checkout for automatic upgrade credit detection.

"use client";

import { useState } from "react";
import { getPersistedEmail } from "@/lib/persistEmail";
import {
  getSmsOptInPreference,
  setSmsOptInPreference,
  getEmailMarketingOptInPreference,
  setEmailMarketingOptInPreference,
} from "@/lib/smsConsent";

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
  const [smsOptedIn, setSmsOptedIn] = useState<boolean>(() => getSmsOptInPreference());
  const [emailMarketingOptedIn, setEmailMarketingOptedIn] = useState<boolean>(() =>
    getEmailMarketingOptInPreference(),
  );
  const [showCommsPrefs, setShowCommsPrefs] = useState<boolean>(() => {
    const smsPref = getSmsOptInPreference();
    const emailPref = getEmailMarketingOptInPreference();
    return smsPref || emailPref;
  });
  const config = productConfig[product];

  const handleClick = async () => {
    setLoading(true);
    try {
      const email = getPersistedEmail();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey: product, email, smsOptedIn, emailMarketingOptedIn }),
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
    <div className="flex flex-col gap-2">
      <div>
        <button
          type="button"
          onClick={() => setShowCommsPrefs((prev) => !prev)}
          className="text-xs font-medium text-[#021859] underline decoration-dotted underline-offset-2"
        >
          Communication preferences (optional)
        </button>
        {showCommsPrefs && (
          <div className="mt-2 space-y-2 text-left text-xs leading-5 text-slate-600">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={smsOptedIn}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSmsOptedIn(checked);
                  setSmsOptInPreference(checked);
                }}
                className="mt-0.5"
              />
              <span>
                Text me occasional updates and reminders. Message and data rates may apply. Reply STOP to opt out.
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={emailMarketingOptedIn}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setEmailMarketingOptedIn(checked);
                  setEmailMarketingOptInPreference(checked);
                }}
                className="mt-0.5"
              />
              <span>Email me occasional product tips and offers. You can unsubscribe anytime.</span>
            </label>
          </div>
        )}
      </div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Loading..." : config.label}
      </button>
    </div>
  );
}
