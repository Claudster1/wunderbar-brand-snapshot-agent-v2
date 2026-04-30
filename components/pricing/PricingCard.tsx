// components/pricing/PricingCard.tsx
// Passes customer email to checkout for automatic upgrade credit detection.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPersistedEmail } from "@/lib/persistEmail";
import {
  getSmsOptInPreference,
  setSmsOptInPreference,
  getEmailMarketingOptInPreference,
  setEmailMarketingOptInPreference,
} from "@/lib/smsConsent";

type Props = {
  badge?: string;
  title: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref?: string;
  ctaAction?: "checkout";
  checkoutProductKey?: "snapshot_plus" | "blueprint" | "blueprint_plus";
  variant?: "base" | "featured";
};

export function PricingCard({
  badge,
  title,
  price,
  priceNote,
  description,
  features,
  ctaLabel,
  ctaHref,
  ctaAction,
  checkoutProductKey,
  variant = "base",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [smsOptedIn, setSmsOptedIn] = useState(false);
  const [emailMarketingOptedIn, setEmailMarketingOptedIn] = useState(false);
  const [showCommsPrefs, setShowCommsPrefs] = useState(false);

  useEffect(() => {
    const smsPref = getSmsOptInPreference();
    const emailPref = getEmailMarketingOptInPreference();
    setSmsOptedIn(smsPref);
    setEmailMarketingOptedIn(emailPref);
    setShowCommsPrefs(smsPref || emailPref);
  }, []);

  async function startCheckout() {
    if (!ctaAction || !checkoutProductKey) return;
    setLoading(true);
    try {
      const email = getPersistedEmail();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productKey: checkoutProductKey, email, smsOptedIn, emailMarketingOptedIn }),
      });

      if (!res.ok) throw new Error("Checkout failed");
      const data = (await res.json()) as { url: string };

      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert("Sorry — something went wrong starting checkout. Please try again.");
    }
  }

  const isFeatured = variant === "featured";

  return (
    <div
      className={[
        "relative rounded-2xl border bg-white p-6 shadow-sm",
        isFeatured ? "border-[#07B0F2] shadow-[0_18px_45px_rgba(2,24,89,0.12)]" : "border-[#E0E3EA]",
      ].join(" ")}
    >
      {badge && (
        <div className="mb-4 inline-flex rounded-full border border-[#E0E3EA] bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-[#021859]">
          {badge}
        </div>
      )}

      <h3 className="text-lg font-semibold text-[#021859]">{title}</h3>

      <div className="mt-3 flex items-end gap-2">
        <div className="text-3xl font-semibold text-[#021859]">{price}</div>
        {priceNote && <div className="pb-1 text-sm text-slate-600">{priceNote}</div>}
      </div>

      <p className="mt-3 text-[14.5px] leading-relaxed text-[#0C1526]">{description}</p>

      <ul className="mt-5 flex flex-col gap-2 text-[14.5px] text-[#0C1526]">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <span
              className="mt-[0.55em] size-1.5 shrink-0 rounded-full"
              style={{ background: "var(--wb-bullet-accent, #07b0f2)" }}
              aria-hidden
            />
            <span className="min-w-0 flex-1">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {ctaAction === "checkout" && (
          <div className="mb-3">
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
                  <span>Text me occasional updates and reminders. Message and data rates may apply. Reply STOP to opt out.</span>
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
        )}
        {ctaHref ? (
          <Link
            href={ctaHref}
            className={[
              "inline-flex w-full items-center justify-center rounded-[5px] px-5 py-3 text-sm font-semibold transition no-underline bg-[#07B0F2] text-white hover:bg-[#059BD8]",
            ].join(" ")}
          >
            {ctaLabel}
          </Link>
        ) : (
          <button
            onClick={startCheckout}
            disabled={loading}
            className={[
              "inline-flex w-full items-center justify-center rounded-[5px] px-5 py-3 text-sm font-semibold transition bg-[#07B0F2] text-white hover:bg-[#059BD8]",
              loading ? "opacity-60" : "",
            ].join(" ")}
          >
            {loading ? "Starting checkout…" : ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
