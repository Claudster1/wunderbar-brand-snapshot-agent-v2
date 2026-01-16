// components/pricing/PricingCard.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

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

  async function startCheckout() {
    if (!ctaAction || !checkoutProductKey) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productKey: checkoutProductKey }),
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

      <ul className="mt-5 space-y-2 text-[14.5px] text-[#0C1526]">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="mt-[6px] inline-block h-2 w-2 rounded-full bg-[#07B0F2]" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {ctaHref ? (
          <Link
            href={ctaHref}
            className={[
              "inline-flex w-full items-center justify-center rounded-[10px] px-5 py-3 text-sm font-semibold transition no-underline",
              isFeatured
                ? "bg-[#07B0F2] text-white hover:bg-[#059BD8]"
                : "border border-[#E0E3EA] bg-white text-[#021859] hover:bg-[#F5F7FB]",
            ].join(" ")}
          >
            {ctaLabel}
          </Link>
        ) : (
          <button
            onClick={startCheckout}
            disabled={loading}
            className={[
              "inline-flex w-full items-center justify-center rounded-[10px] px-5 py-3 text-sm font-semibold transition",
              isFeatured
                ? "bg-[#07B0F2] text-white hover:bg-[#059BD8]"
                : "border border-[#E0E3EA] bg-white text-[#021859] hover:bg-[#F5F7FB]",
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
