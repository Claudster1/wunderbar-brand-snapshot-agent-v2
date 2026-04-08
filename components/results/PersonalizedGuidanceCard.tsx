"use client";

interface PersonalizedGuidanceCardProps {
  title: string;
  doText: string;
  dontText: string;
  example: string;
}

const BORDER = "#D6DFE8";
const NAVY = "#021859";
const MID = "#5A6B7E";

export default function PersonalizedGuidanceCard({
  title,
  doText,
  dontText,
  example,
}: PersonalizedGuidanceCardProps) {
  return (
    <div
      style={{
        marginTop: 12,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        background: "#FCFDFF",
        padding: "12px 13px",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 14,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: MID,
        }}
      >
        {title}
      </p>
      <div style={{ display: "grid", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#14532D", lineHeight: 1.5 }}>
          <strong>Do:</strong> {doText}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "#7F1D1D", lineHeight: 1.5 }}>
          <strong>Don&apos;t:</strong> {dontText}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: NAVY, lineHeight: 1.6 }}>
          <strong>Brand-specific example:</strong> {example}
        </p>
      </div>
    </div>
  );
}
