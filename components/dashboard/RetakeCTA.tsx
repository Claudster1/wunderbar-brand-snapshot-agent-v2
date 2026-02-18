// components/dashboard/RetakeCTA.tsx
"use client";

import { useEffect, useState } from "react";
import { getPersistedEmail } from "@/lib/persistEmail";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const WHITE = "#FFFFFF";
const GREEN = "#10B981";
const AMBER = "#F59E0B";

type PurchaseTier = "blueprint_plus" | "blueprint" | "snapshot_plus" | "free";

interface RefreshEligibility {
  canRefresh: boolean;
  isFree: boolean;
  paidPrice: number | null;
  freeRemaining: number | string;
  windowEnd: string | null;
  daysRemaining: number | null;
  brandName: string | null;
  brandLocked: boolean;
  reason: string;
}

export default function RetakeCTA() {
  const [tier, setTier] = useState<PurchaseTier>("free");
  const [eligibility, setEligibility] = useState<RefreshEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const email = getPersistedEmail();

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`/api/user-tier?email=${encodeURIComponent(email)}`)
        .then((res) => res.json()),
      fetch(`/api/refresh-eligibility?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .catch(() => null),
    ]).then(([tierData, eligData]) => {
      setTier(tierData.tier || "free");
      if (eligData && !eligData.error) setEligibility(eligData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [email]);

  if (loading || !email) return null;

  // Format the window end date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Blueprint+ customers with active free refresh window
  if (tier === "blueprint_plus" && eligibility?.isFree) {
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

        <p style={{ fontSize: 14, color: SUB, margin: "0 0 8px", lineHeight: 1.6 }}>
          Unlimited quarterly refreshes are included with WunderBrand Blueprint+™. Retake the diagnostic to see how your brand has evolved.
        </p>

        {/* Brand lock notice */}
        {eligibility.brandName && (
          <p style={{ fontSize: 12, color: SUB, margin: "0 0 8px", lineHeight: 1.5, opacity: 0.8 }}>
            Refreshes apply to <strong>{eligibility.brandName}</strong> only.
          </p>
        )}

        {/* Expiration notice */}
        {eligibility.daysRemaining != null && eligibility.daysRemaining <= 90 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 6,
              background: `${AMBER}15`,
              border: `1px solid ${AMBER}30`,
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 12, color: AMBER, fontWeight: 700 }}>
              {eligibility.daysRemaining} days remaining
            </span>
            <span style={{ fontSize: 11, color: SUB }}>
              — free refreshes expire {formatDate(eligibility.windowEnd)}
            </span>
          </div>
        )}

        <div style={{ marginTop: 6 }}>
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

        {eligibility.windowEnd && (
          <p style={{ fontSize: 11, color: SUB, margin: "10px 0 0", opacity: 0.6 }}>
            Free refreshes included through {formatDate(eligibility.windowEnd)}. Annual refresh plans available after.
          </p>
        )}
      </div>
    );
  }

  // Blueprint with free refresh available
  if (tier === "blueprint" && eligibility?.isFree && (eligibility.freeRemaining as number) > 0) {
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
            Free Refresh Available
          </span>
        </div>

        <p style={{ fontSize: 14, color: SUB, margin: "0 0 8px", lineHeight: 1.6 }}>
          Your WunderBrand Blueprint™ includes {eligibility.freeRemaining} free strategy refresh{(eligibility.freeRemaining as number) > 1 ? "es" : ""}. See how your brand scores have changed.
        </p>

        {eligibility.brandName && (
          <p style={{ fontSize: 12, color: SUB, margin: "0 0 8px", lineHeight: 1.5, opacity: 0.8 }}>
            Refreshes apply to <strong>{eligibility.brandName}</strong> only.
          </p>
        )}

        {eligibility.daysRemaining != null && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 6,
              background: eligibility.daysRemaining <= 30 ? `${AMBER}15` : `${BLUE}08`,
              border: `1px solid ${eligibility.daysRemaining <= 30 ? AMBER : BLUE}30`,
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 12, color: eligibility.daysRemaining <= 30 ? AMBER : BLUE, fontWeight: 700 }}>
              {eligibility.daysRemaining} days remaining
            </span>
            <span style={{ fontSize: 11, color: SUB }}>
              — use before {formatDate(eligibility.windowEnd)}
            </span>
          </div>
        )}

        <div style={{ marginTop: 6 }}>
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
            Use Free Refresh
          </a>
        </div>

        <p style={{ fontSize: 12, color: SUB, margin: "12px 0 0", lineHeight: 1.5 }}>
          After your free refresh, additional refreshes are $97 each. Or{" "}
          <a href="/checkout?product=blueprint-plus" style={{ color: BLUE, fontWeight: 700, textDecoration: "none" }}>
            upgrade to Blueprint+™
          </a>{" "}
          for unlimited refreshes.
        </p>
      </div>
    );
  }

  // Paid tier customers — no free refreshes (used up or Snapshot+ which has none)
  if (tier === "snapshot_plus" || tier === "blueprint" || (tier === "blueprint_plus" && !eligibility?.isFree)) {
    const refreshKey = tier === "snapshot_plus" ? "snapshot_plus_refresh" : "blueprint_refresh";
    const refreshPrice = eligibility?.paidPrice
      ? `$${eligibility.paidPrice}`
      : tier === "snapshot_plus" ? "$47" : "$97";
    const tierLabel = tier === "snapshot_plus"
      ? "WunderBrand Snapshot+™"
      : tier === "blueprint"
        ? "WunderBrand Blueprint™"
        : "WunderBrand Blueprint+™";

    async function handleRefreshCheckout() {
      setCheckoutLoading(true);
      try {
        const res = await fetch("/api/refresh-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refreshKey,
            email,
            brandName: eligibility?.brandName || "",
          }),
        });
        const data = await res.json();

        if (data.freeRefresh) {
          window.location.href = "/";
          return;
        }

        if (data.url) {
          window.location.href = data.url;
        } else {
          alert(data.message || data.error || "Unable to start checkout.");
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
        <p style={{ fontSize: 13, color: SUB, margin: "0 0 6px", lineHeight: 1.6 }}>
          Your updated {tierLabel} report includes a side-by-side comparison with your previous scores.
        </p>

        {eligibility?.brandName && (
          <p style={{ fontSize: 12, color: SUB, margin: "0 0 10px", lineHeight: 1.5, opacity: 0.8 }}>
            Refreshes apply to <strong>{eligibility.brandName}</strong> only.
          </p>
        )}

        {/* Expired window notice for Blueprint+ */}
        {tier === "blueprint_plus" && !eligibility?.isFree && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 6,
              background: `${SUB}10`,
              border: `1px solid ${SUB}20`,
              marginBottom: 12,
              fontSize: 12,
              color: SUB,
            }}
          >
            Your free refresh window has ended. Annual refresh plans are available.
          </div>
        )}

        <div style={{ marginTop: 4 }}>
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
        </div>

        {tier !== "blueprint_plus" && (
          <p style={{ fontSize: 12, color: SUB, margin: "12px 0 0", lineHeight: 1.5 }}>
            Or{" "}
            <a href="/checkout?product=blueprint-plus" style={{ color: BLUE, fontWeight: 700, textDecoration: "none" }}>
              upgrade to WunderBrand Blueprint+™
            </a>{" "}
            for unlimited free refreshes.
          </p>
        )}
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
        Want a fresh perspective? Retake the diagnostic with updated information for a new analysis.
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
