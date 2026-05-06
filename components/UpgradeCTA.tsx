// components/UpgradeCTA.tsx
// Upgrade CTA component with A/B testing and analytics
// Passes customer email to checkout for automatic upgrade credit detection.

"use client";

import { getUpgradeCTAVariant } from "@/lib/abTest";
import { trackEvent } from "@/lib/analytics";
import { getPersistedEmail } from "@/lib/persistEmail";
import {
  getSmsOptInPreference,
  setSmsOptInPreference,
  getEmailMarketingOptInPreference,
  setEmailMarketingOptInPreference,
} from "@/lib/smsConsent";
import { useState, useEffect } from "react";

export function UpgradeCTA({
  primaryPillar,
  productKey,
  baseSnapshotReportId,
}: {
  primaryPillar: string;
  productKey: string;
  /** Prior free Snapshot report — passed through Stripe metadata as snapshot_id for post-checkout resume. */
  baseSnapshotReportId?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [smsOptedIn, setSmsOptedIn] = useState(false);
  const [emailMarketingOptedIn, setEmailMarketingOptedIn] = useState(false);
  const [showCommsPrefs, setShowCommsPrefs] = useState(false);
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

  useEffect(() => {
    const smsPref = getSmsOptInPreference();
    const emailPref = getEmailMarketingOptInPreference();
    setSmsOptedIn(smsPref);
    setEmailMarketingOptedIn(emailPref);
    setShowCommsPrefs(smsPref || emailPref);
  }, []);

  async function handleClick() {
    trackEvent("UPGRADE_CLICKED", {
      target: "Snapshot+",
      primaryPillar,
      variant,
    });

    setLoading(true);
    try {
      const email = getPersistedEmail();
      const brandName = typeof window !== "undefined"
        ? localStorage.getItem("brand_snapshot_company") || ""
        : "";
      const res = await fetch("/api/stripe/createCheckout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productKey,
          email,
          smsOptedIn,
          emailMarketingOptedIn,
          metadata: {
            source: "snapshot-results",
            primary_pillar: primaryPillar,
            variant,
            brand_name: brandName,
            ...(baseSnapshotReportId && /^[0-9a-f-]{36}$/i.test(baseSnapshotReportId.trim())
              ? { snapshot_id: baseSnapshotReportId.trim() }
              : {}),
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
        {loading ? "Loading..." : label}
      </button>
    </div>
  );
}
