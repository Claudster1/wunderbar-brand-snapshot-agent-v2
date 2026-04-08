"use client";

const NAVY = "#021859";
const BLUE = "#07B0F2";

interface RevenueImpactStatementProps {
  businessName: string;
  primaryPillar: string;
  wunderBrandScore: number;
  impactStatement: string;
  topOpportunity: string;
}

export default function RevenueImpactStatement({
  impactStatement,
  topOpportunity,
}: RevenueImpactStatementProps) {
  return (
    <div
      style={{
        backgroundColor: NAVY,
        borderRadius: 10,
        padding: "32px 36px",
        marginBottom: 24,
        fontFamily: "'Lato', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${BLUE}, #27CDF2)`,
        }}
      />
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: BLUE,
          marginBottom: 16,
        }}
      >
        Revenue Impact Statement
      </div>
      <p style={{ fontSize: 18, fontWeight: 600, color: "#ffffff", lineHeight: 1.5, margin: "0 0 20px", maxWidth: 700 }}>
        {impactStatement}
      </p>
      <div
        style={{
          padding: "16px 20px",
          backgroundColor: "rgba(7, 176, 242, 0.12)",
          borderRadius: 8,
          borderLeft: `3px solid ${BLUE}`,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: BLUE,
            display: "block",
            marginBottom: 6,
          }}
        >
          Highest-leverage opportunity
        </span>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: 0 }}>
          {topOpportunity}
        </p>
      </div>
    </div>
  );
}
