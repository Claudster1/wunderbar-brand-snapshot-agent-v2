"use client";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const LIGHT_BLUE = "#E8F6FE";
const MID_GRAY = "#5A6B7E";

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
        backgroundColor: "#ffffff",
        border: "1px solid #E0E8F0",
        borderRadius: 12,
        borderTop: `4px solid ${BLUE}`,
        fontFamily: "'Lato', sans-serif",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: LIGHT_BLUE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="9" width="14" height="10" rx="2" stroke={BLUE} strokeWidth="1.6" />
          <path d="M6 9V6a4 4 0 1 1 8 0v3" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>
        {tabLabel} is available in {productName}
      </h2>

      <p style={{ fontSize: 15, color: MID_GRAY, lineHeight: 1.6, margin: "0 0 28px" }}>
        Your current diagnostic includes the Foundation tab. The {tabLabel} tab is where strategy
        becomes action.
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
                color: "#2D3A4A",
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
                  backgroundColor: LIGHT_BLUE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 1,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 2.5" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
            backgroundColor: BLUE,
            color: "#ffffff",
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            letterSpacing: "0.03em",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          See What's Included
        </a>
        <a
          href={talkToExpertUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "13px 28px",
            backgroundColor: "transparent",
            color: NAVY,
            border: "2px solid #CBD5E0",
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            letterSpacing: "0.03em",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Talk to an Expert
        </a>
      </div>

      <button
        onClick={onDismiss}
        style={{
          display: "block",
          margin: "20px auto 0",
          background: "none",
          border: "none",
          color: MID_GRAY,
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "'Lato', sans-serif",
          textDecoration: "underline",
        }}
      >
        Back to my results
      </button>
    </div>
  );
}
