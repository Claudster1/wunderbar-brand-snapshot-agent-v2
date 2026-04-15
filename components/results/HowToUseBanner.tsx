"use client";

import { useEffect, useState } from "react";
import type { ProductTier } from "@/components/results/tabConfig";
import { getHowToUseBannerSegments } from "@/lib/copy/resultsSuiteGuidance";
import {
  SUITE_CHROME_MUTED,
  SUITE_CONTENT_MAX_PX,
  SUITE_FONT_UI,
  SUITE_RADIUS_MD,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

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
        maxWidth: SUITE_CONTENT_MAX_PX,
        margin: "16px auto 0",
        padding: "0 min(24px, 4vw)",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.03)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: SUITE_RADIUS_MD,
          padding: "14px 16px 14px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          fontFamily: SUITE_FONT_UI,
          boxShadow: SUITE_SHADOW_CARD,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2, opacity: 0.85 }}>
          <circle cx="8" cy="8" r="7" stroke={SUITE_CHROME_MUTED} strokeWidth="1.2" />
          <path d="M8 7.5v4" stroke={SUITE_CHROME_MUTED} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="8" cy="5.25" r="0.75" fill={SUITE_CHROME_MUTED} />
        </svg>
        <p style={{ flex: 1, fontSize: 14, color: SUITE_TEXT_PRIMARY, lineHeight: 1.55, margin: 0, fontWeight: 400 }}>
          <strong style={{ fontWeight: 600 }}>{lead}</strong> {path}
          <span style={{ display: "block", marginTop: 8, fontSize: 13, color: SUITE_CHROME_MUTED, fontWeight: 400 }}>
            {habits}
          </span>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            background: "rgba(0, 0, 0, 0.04)",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            cursor: "pointer",
            color: SUITE_CHROME_MUTED,
            fontSize: 18,
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
            fontFamily: SUITE_FONT_UI,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "rgba(0, 0, 0, 0.07)";
            event.currentTarget.style.color = SUITE_TEXT_PRIMARY;
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "rgba(0, 0, 0, 0.04)";
            event.currentTarget.style.color = SUITE_CHROME_MUTED;
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
