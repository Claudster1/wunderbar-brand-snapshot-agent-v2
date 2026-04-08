import type { ReactNode } from "react";

const NAVY = "#021859";
const BLUE = "#07B0F2";

interface PillarScore {
  name: string;
  score: number;
  max: number;
}

interface DiagnosticTruthPanelProps {
  businessName: string;
  wunderBrandScore: number;
  primaryArchetype: string;
  secondaryArchetype?: string;
  pillarScores: PillarScore[];
  primaryPillar: string;
  competitiveVulnerabilitySeverity?: "low" | "medium" | "high";
  marketingSpendEfficiencySeverity?: "low" | "medium" | "high";
  resultsDeliveredAt: string;
}

const SEVERITY_COLORS: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "#16A34A", bg: "#F0FDF4" },
  medium: { label: "Medium", color: "#D97706", bg: "#FEF3C7" },
  high: { label: "High", color: "#DC2626", bg: "#FEF2F2" },
};

export default function DiagnosticTruthPanel({
  businessName,
  wunderBrandScore,
  primaryArchetype,
  secondaryArchetype,
  pillarScores,
  primaryPillar,
  competitiveVulnerabilitySeverity,
  marketingSpendEfficiencySeverity,
  resultsDeliveredAt,
}: DiagnosticTruthPanelProps) {
  const deliveredDate = new Date(resultsDeliveredAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      style={{
        backgroundColor: "#F6FAFF",
        border: "1px solid #D6E5F8",
        borderRadius: 10,
        padding: "28px 32px",
        marginBottom: 40,
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

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1.5" y="6" width="11" height="7" rx="1.5" stroke={BLUE} strokeWidth="1.4" />
          <path d="M4 6V4a3 3 0 1 1 6 0v2" stroke={BLUE} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: BLUE,
          }}
        >
          Diagnostic Truth — Read Only
        </span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#5B6F95" }}>
          {businessName} · Generated {deliveredDate}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <Card label="WunderBrand Score™">
          <span style={{ fontSize: 32, fontWeight: 900, color: NAVY }}>{wunderBrandScore}</span>
          <span style={{ fontSize: 16, color: "#6A7DA3", marginLeft: 4 }}>/ 100</span>
        </Card>
        <Card label="Brand Archetype">
          <span style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{primaryArchetype}</span>
          {secondaryArchetype && (
            <span style={{ fontSize: 13, color: "#6A7DA3", display: "block", marginTop: 2 }}>
              + {secondaryArchetype}
            </span>
          )}
        </Card>
        <Card label="Primary Focus Area">
          <span style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{primaryPillar}</span>
        </Card>
      </div>

      <div style={{ marginBottom: 20 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#5B6F95",
            display: "block",
            marginBottom: 12,
          }}
        >
          Pillar Scores
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pillarScores.map((pillar) => (
            <div key={pillar.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontSize: 12,
                  color: "#4A5E85",
                  width: 100,
                  flexShrink: 0,
                }}
              >
                {pillar.name}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  backgroundColor: "#DCE8F8",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(0, Math.min(100, (pillar.score / Math.max(pillar.max, 1)) * 100))}%`,
                    height: "100%",
                    backgroundColor: BLUE,
                    borderRadius: 3,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: pillar.name === primaryPillar ? "#B45309" : "#4A5E85",
                  width: 40,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {pillar.score}/{pillar.max}
              </span>
            </div>
          ))}
        </div>
      </div>

      {(competitiveVulnerabilitySeverity || marketingSpendEfficiencySeverity) && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {competitiveVulnerabilitySeverity && (
            <SignalBadge
              label="Competitive Vulnerability"
              severity={competitiveVulnerabilitySeverity}
            />
          )}
          {marketingSpendEfficiencySeverity && (
            <SignalBadge
              label="Marketing Spend Efficiency"
              severity={marketingSpendEfficiencySeverity}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        padding: "16px 20px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E4ECF9",
        borderRadius: 8,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: BLUE,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function SignalBadge({
  label,
  severity,
}: {
  label: string;
  severity: "low" | "medium" | "high";
}) {
  const styles = SEVERITY_COLORS[severity];
  return (
    <div
      style={{
        padding: "8px 14px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E4ECF9",
        borderRadius: 6,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 12, color: "#4A5E85" }}>{label}</span>
      <span
        style={{
          padding: "1px 8px",
          borderRadius: 10,
          fontSize: 11,
          fontWeight: 700,
          backgroundColor: styles.bg,
          color: styles.color,
        }}
      >
        {styles.label}
      </span>
    </div>
  );
}
