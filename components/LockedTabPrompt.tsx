"use client";

import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BG_CARD,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_BUTTON,
  SUITE_RADIUS_LG,
  SUITE_SECTION_ACTIVE_BG,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

interface LockedTabPromptProps {
  tabLabel: string;
  availableFrom: string;
  featuresPreview: string[];
  seeWhatsIncludedUrl: string;
  talkToExpertUrl: string;
  onDismiss: () => void;
}

const TIER_NAMES: Record<string, string> = {
  "snapshot-plus": "WunderBrand Snapshot+™",
  blueprint: "WunderBrand Blueprint™",
  "blueprint-plus": "WunderBrand Blueprint+™",
};

export default function LockedTabPrompt({
  tabLabel,
  availableFrom,
  featuresPreview,
  seeWhatsIncludedUrl,
  talkToExpertUrl,
  onDismiss,
}: LockedTabPromptProps) {
  const productName = TIER_NAMES[availableFrom] ?? availableFrom;

  return (
    <div
      className="locked-tab-prompt"
      style={{
        maxWidth: 600,
        margin: "80px auto",
        padding: "48px",
        backgroundColor: SUITE_BG_CARD,
        border: `1px solid ${SUITE_BORDER}`,
        borderRadius: SUITE_RADIUS_LG,
        borderTop: `3px solid ${SUITE_ACCENT_BRIGHT}`,
        boxShadow: SUITE_SHADOW_CARD,
        fontFamily: SUITE_FONT_UI,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: SUITE_SECTION_ACTIVE_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="9" width="14" height="10" rx="2" stroke={SUITE_ACCENT_BRIGHT} strokeWidth="1.6" />
          <path
            d="M6 9V6a4 4 0 1 1 8 0v3"
            stroke={SUITE_ACCENT_BRIGHT}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, color: SUITE_NAVY, margin: "0 0 8px" }}>
        {tabLabel} is available in {productName}
      </h2>

      <p style={{ fontSize: 15, color: SUITE_MUTED, lineHeight: 1.6, margin: "0 0 28px" }}>
        Your current report unlocks the tabs you can open now. Upgrade to {productName} to add{" "}
        {tabLabel} — where strategy becomes clearer, more usable action.
      </p>

      {featuresPreview.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", textAlign: "left" }}>
          {featuresPreview.map((feature) => (
            <li
              key={feature}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: 14,
                color: SUITE_TEXT_PRIMARY,
                marginBottom: 10,
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  backgroundColor: SUITE_SECTION_ACTIVE_BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 1,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5l2.5 2.5L8 2.5"
                    stroke={SUITE_ACCENT_BRIGHT}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {feature}
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a
          href={seeWhatsIncludedUrl}
          style={{
            display: "inline-block",
            padding: "13px 28px",
            backgroundColor: SUITE_ACCENT_BRIGHT,
            color: "#ffffff",
            border: `2px solid ${SUITE_ACCENT_BRIGHT}`,
            borderRadius: SUITE_RADIUS_BUTTON,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            letterSpacing: "0.03em",
            fontFamily: SUITE_FONT_UI,
          }}
        >
          See What&apos;s Included
        </a>
        <a
          href={talkToExpertUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "13px 28px",
            backgroundColor: SUITE_BG_CARD,
            color: SUITE_ACCENT_BRIGHT,
            border: `2px solid ${SUITE_ACCENT_BRIGHT}`,
            borderRadius: SUITE_RADIUS_BUTTON,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            letterSpacing: "0.03em",
            fontFamily: SUITE_FONT_UI,
          }}
        >
          Talk to an Expert
        </a>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        style={{
          display: "block",
          margin: "20px auto 0",
          background: "none",
          border: "none",
          color: SUITE_MUTED,
          fontSize: 13,
          cursor: "pointer",
          fontFamily: SUITE_FONT_UI,
          textDecoration: "underline",
        }}
      >
        Back to my results
      </button>
    </div>
  );
}
