// components/dashboard/RetakeCTA.tsx
"use client";

import { useEffect, useState } from "react";
import { getPersistedEmail } from "@/lib/persistEmail";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const WHITE = "#FFFFFF";
const GREEN = "#10B981";

type PurchaseTier = "blueprint_plus" | "blueprint" | "snapshot_plus" | "free";

export default function RetakeCTA() {
  const [tier, setTier] = useState<PurchaseTier>("free");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const email = getPersistedEmail();

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    // Check the user's highest purchased tier
    fetch(`/api/user-tier?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        setTier(data.tier || "free");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [email]);

  if (loading || !email) return null;

  // Blueprint+ customers get free refreshes
  if (tier === "blueprint_plus") {
    return (
      <div
        style={{
          marginTop: 40,
          padding: "24px 28px",
          borderRadius: 10,
          border: `1px solid ${GREEN}30`,
          background: `${GREEN}06`,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: WHITE,
              fontWeight: 700,
            }}
          >
            ✓
          </div>
          <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" as const, color: GREEN }}>
            Blueprint+ Perk
          </span>
        </div>
        <p style={{ fontSize: 14, color: SUB, margin: "0 0 14px", lineHeight: 1.6 }}>
          Unlimited quarterly refreshes are included with WunderBrand Blueprint+™. Retake the assessment to see how your brand has evolved.
        </p>
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            padding: "0 22px",
            borderRadius: 6,
            background: GREEN,
            color: WHITE,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Start Quarterly Refresh — Free
        </a>
      </div>
    );
  }

  // Paid tier customers (Snapshot+ or Blueprint) can purchase a refresh
  if (tier === "snapshot_plus" || tier === "blueprint") {
    const refreshKey = tier === "snapshot_plus" ? "snapshot_plus_refresh" : "blueprint_refresh";
    const refreshPrice = tier === "snapshot_plus" ? "$47" : "$97";
    const tierLabel = tier === "snapshot_plus" ? "WunderBrand Snapshot+™" : "WunderBrand Blueprint™";

    async function handleRefreshCheckout() {
      setCheckoutLoading(true);
      try {
        const res = await fetch("/api/refresh-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshKey, email }),
        });
        const data = await res.json();

        if (data.freeRefresh) {
          // Blueprint+ customer — redirect to assessment
          window.location.href = "/";
          return;
        }

        if (data.url) {
          window.location.href = data.url;
        } else {
          alert(data.error || "Unable to start checkout.");
        }
      } catch {
        alert("Something went wrong. Please try again.");
      } finally {
        setCheckoutLoading(false);
      }
    }

    return (
      <div
        style={{
          marginTop: 40,
          padding: "24px 28px",
          borderRadius: 10,
          border: `1px dashed ${BLUE}40`,
          background: `${BLUE}04`,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 14, color: SUB, margin: "0 0 6px", lineHeight: 1.6 }}>
          Ready for a quarterly check-in? See how your brand scores have changed.
        </p>
        <p style={{ fontSize: 13, color: SUB, margin: "0 0 14px", lineHeight: 1.6 }}>
          Your updated {tierLabel} report includes a side-by-side comparison with your previous scores.
        </p>
        <button
          onClick={handleRefreshCheckout}
          disabled={checkoutLoading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            padding: "0 22px",
            borderRadius: 6,
            background: BLUE,
            color: WHITE,
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            cursor: checkoutLoading ? "default" : "pointer",
            opacity: checkoutLoading ? 0.7 : 1,
          }}
        >
          {checkoutLoading ? "Loading..." : `Quarterly Refresh — ${refreshPrice}`}
        </button>
        <p style={{ fontSize: 12, color: SUB, margin: "12px 0 0", lineHeight: 1.5 }}>
          Or <a href="/checkout?product=blueprint-plus" style={{ color: BLUE, fontWeight: 700, textDecoration: "none" }}>upgrade to WunderBrand Blueprint+™</a> for unlimited free refreshes.
        </p>
      </div>
    );
  }

  // Free tier — standard retake CTA
  return (
    <div
      style={{
        marginTop: 40,
        padding: "24px 28px",
        borderRadius: 10,
        border: `1px dashed ${BLUE}40`,
        background: `${BLUE}04`,
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 14, color: SUB, margin: "0 0 14px", lineHeight: 1.6 }}>
        Want a fresh perspective? Retake the assessment with updated information for a new analysis.
      </p>
      <a
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 44,
          padding: "0 22px",
          borderRadius: 6,
          background: BLUE,
          color: WHITE,
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
        }}
      >
        Start a new WunderBrand Snapshot™
      </a>
    </div>
  );
}
