"use client";

import { useEffect, useState } from "react";
import type { ProductTier } from "@/components/results/tabConfig";
import { getHowToUseBannerSegments } from "@/lib/copy/resultsSuiteGuidance";

const DISMISS_KEY = "wb_how_to_use_dismissed";

export default function HowToUseBanner({
  productName,
  productTier,
}: {
  productName: string;
  productTier: ProductTier;
}) {
  const [dismissed, setDismissed] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const wasDismissed = sessionStorage.getItem(DISMISS_KEY) === "true";
      setDismissed(wasDismissed);
    } catch {
      setDismissed(false);
    }
    setLoaded(true);
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // Ignore storage issues.
    }
  }

  if (!loaded || dismissed) return null;

  const { lead, path, habits } = getHowToUseBannerSegments(productTier, productName);

  return (
    <div
      className="how-to-use-banner"
      style={{
        maxWidth: 1100,
        margin: "20px auto 0",
        padding: "0 28px",
      }}
    >
      <div
        style={{
          backgroundColor: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: 8,
          padding: "12px 14px 12px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="8" cy="8" r="7" stroke="#3B82F6" strokeWidth="1.4" />
          <path d="M8 7.5v4" stroke="#3B82F6" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8" cy="5.25" r="0.85" fill="#3B82F6" />
        </svg>
        <p style={{ flex: 1, fontSize: 13, color: "#1E40AF", lineHeight: 1.6, margin: 0 }}>
          <strong>{lead}</strong> {path}
          <span style={{ display: "block", marginTop: 8, fontSize: 12, opacity: 0.95 }}>{habits}</span>
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#93C5FD",
            fontSize: 20,
            lineHeight: 1,
            padding: "0 0 0 8px",
            flexShrink: 0,
            fontFamily: "sans-serif",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = "#3B82F6";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = "#93C5FD";
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
