"use client";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const LIGHT_BLUE = "#E8F6FE";
const AMBER = "#F59E0B";
const AMBER_LIGHT = "#FEF3C7";
const MID_GRAY = "#5A6B7E";
const BORDER = "#E0E8F0";

interface LockedSignalCardProps {
  signalName: string;
  isLocked: boolean;
  lockedLabel: string;
  lockedDescription: string;
  upgradeProductUrl: string;
  severity?: "low" | "medium" | "high";
  summary?: string;
  implication?: string;
  recommendation?: string;
}

const SEVERITY_CONFIG = {
  low: { label: "Low Exposure", color: "#16A34A", bg: "#F0FDF4" },
  medium: { label: "Moderate Signal", color: AMBER, bg: AMBER_LIGHT },
  high: { label: "High Priority", color: "#DC2626", bg: "#FEF2F2" },
};

export default function LockedSignalCard({
  signalName,
  isLocked,
  lockedLabel,
  lockedDescription,
  upgradeProductUrl,
  severity,
  summary,
  implication,
  recommendation,
}: LockedSignalCardProps) {
  if (isLocked) {
    return (
      <div
        style={{
          border: `1px solid ${BORDER}`,
          borderLeft: "4px solid #CBD5E0",
          borderRadius: 8,
          padding: "20px 24px",
          backgroundColor: "#FAFBFC",
          marginBottom: 16,
          fontFamily: "'Lato', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backdropFilter: "blur(3px)",
            backgroundColor: "rgba(250, 251, 252, 0.6)",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2.5" y="8" width="13" height="9" rx="2" stroke="#94A3B8" strokeWidth="1.4" />
            <path d="M5.5 8V5.5a3.5 3.5 0 1 1 7 0V8" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 12, color: MID_GRAY, fontWeight: 600 }}>
            Available in WunderBrand Snapshot+™
          </span>
          <a
            href={upgradeProductUrl}
            style={{
              fontSize: 12,
              color: BLUE,
              fontWeight: 700,
              textDecoration: "underline",
              fontFamily: "'Lato', sans-serif",
            }}
          >
            See What's Included →
          </a>
        </div>

        <div style={{ filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: MID_GRAY,
              }}
            >
              {signalName}
            </span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: AMBER_LIGHT,
                color: AMBER,
              }}
            >
              {lockedLabel}
            </span>
          </div>
          <p style={{ fontSize: 14, color: MID_GRAY, lineHeight: 1.6, margin: 0 }}>{lockedDescription}</p>
        </div>
      </div>
    );
  }

  const severityConfig = severity ? SEVERITY_CONFIG[severity] : null;
  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderLeft: `4px solid ${BLUE}`,
        borderRadius: 8,
        padding: "20px 24px",
        backgroundColor: "#ffffff",
        marginBottom: 16,
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: NAVY,
          }}
        >
          {signalName}
        </span>
        {severityConfig && (
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: severityConfig.bg,
              color: severityConfig.color,
            }}
          >
            {severityConfig.label}
          </span>
        )}
      </div>
      {summary && (
        <p style={{ fontSize: 15, color: NAVY, fontWeight: 500, lineHeight: 1.6, margin: "0 0 12px" }}>
          {summary}
        </p>
      )}
      {implication && (
        <div style={{ marginBottom: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: MID_GRAY,
              display: "block",
              marginBottom: 4,
            }}
          >
            What this means
          </span>
          <p style={{ fontSize: 14, color: "#2D3A4A", lineHeight: 1.6, margin: 0 }}>{implication}</p>
        </div>
      )}
      {recommendation && (
        <div style={{ padding: "12px 16px", backgroundColor: LIGHT_BLUE, borderRadius: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: BLUE,
              display: "block",
              marginBottom: 4,
            }}
          >
            Recommended focus
          </span>
          <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.6, margin: 0 }}>{recommendation}</p>
        </div>
      )}
    </div>
  );
}
