"use client";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const LIGHT_BLUE = "#E8F6FE";
const MID_GRAY = "#5A6B7E";
const BORDER = "#E0E8F0";

interface LockedArchetypeIndicatorProps {
  upgradeProductUrl: string;
  talkToExpertUrl: string;
}

export default function LockedArchetypeIndicator({
  upgradeProductUrl,
  talkToExpertUrl,
}: LockedArchetypeIndicatorProps) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: "28px 32px",
        backgroundColor: "#FAFBFC",
        fontFamily: "'Lato', sans-serif",
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: LIGHT_BLUE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: "blur(2px)",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="10" stroke={BLUE} strokeWidth="2" fill="none" />
          <path d="M11 16l3 3 7-7" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: MID_GRAY,
            }}
          >
            Brand Archetype
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 10px",
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: LIGHT_BLUE,
              color: BLUE,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1.5" y="4.5" width="7" height="5" rx="1" stroke={BLUE} strokeWidth="1.2" />
              <path d="M3 4.5V3a2 2 0 1 1 4 0v1.5" stroke={BLUE} strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Identified
          </span>
        </div>

        <p style={{ fontSize: 15, color: NAVY, fontWeight: 600, margin: "0 0 6px" }}>
          Your brand archetype was identified during the diagnostic.
        </p>

        <p style={{ fontSize: 14, color: MID_GRAY, lineHeight: 1.6, margin: "0 0 18px" }}>
          Your archetype is the strategic personality pattern that shapes how your brand communicates,
          differentiates, and connects with the right audience. Knowing it changes how you write, what
          you emphasize, and which markets you are positioned to own.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={upgradeProductUrl}
            style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: BLUE,
              color: "#ffffff",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
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
              padding: "10px 20px",
              backgroundColor: "transparent",
              color: NAVY,
              border: "2px solid #CBD5E0",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Talk to an Expert
          </a>
        </div>
      </div>
    </div>
  );
}
