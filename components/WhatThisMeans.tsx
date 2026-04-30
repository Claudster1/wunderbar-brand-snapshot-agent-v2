"use client";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const LIGHT_BLUE = "#E8F6FE";
const MID_GRAY = "#5A6B7E";
const BORDER = "#E0E8F0";

interface PillarDependency {
  primaryPillar: string;
  upstreamPillar: string;
  explanation: string;
}

interface SynthesisPoint {
  label: string;
  content: string;
}

interface WhatThisMeansProps {
  businessName: string;
  synthesisPoints?: SynthesisPoint[] | null;
  pillarDependency?: PillarDependency;
  productTier?: "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus" | null;
  upgradeProductUrl?: string;
  talkToExpertUrl: string;
}

function normalizeSynthesisPoints(raw: SynthesisPoint[] | null | undefined): SynthesisPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (p): p is SynthesisPoint =>
      Boolean(p) &&
      typeof p === "object" &&
      typeof p.label === "string" &&
      p.label.trim().length > 0 &&
      typeof p.content === "string" &&
      p.content.trim().length > 0,
  );
}

export default function WhatThisMeans({
  businessName,
  synthesisPoints,
  pillarDependency,
  productTier,
  upgradeProductUrl,
  talkToExpertUrl,
}: WhatThisMeansProps) {
  const tier = productTier ?? "snapshot";
  const isFree = tier === "snapshot";
  const points = normalizeSynthesisPoints(synthesisPoints);

  return (
    <div style={{ borderTop: `2px solid ${BORDER}`, paddingTop: 40, marginTop: 48, fontFamily: "'Lato', sans-serif" }}>
      <div style={{ maxWidth: 800 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 6,
              height: 28,
              borderRadius: 3,
              background: `linear-gradient(180deg, ${BLUE}, ${NAVY})`,
              flexShrink: 0,
            }}
          />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: 0 }}>
            What This Means for {businessName}
          </h2>
        </div>

        <p style={{ fontSize: 14, color: MID_GRAY, lineHeight: 1.6, margin: "0 0 32px 18px" }}>
          A distillation of your diagnostic, where you stand, what to protect, and where to focus.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
          {points.length === 0 ? (
            <p style={{ fontSize: 15, color: NAVY, lineHeight: 1.6, margin: "0 0 0 18px" }}>
              Synthesis points will appear here once your diagnostic includes labeled takeaways (what to protect,
              prioritize, and what unlocks growth).
            </p>
          ) : null}
          {points.map((point, i) => (
            <div
              key={`${point.label}-${i}`}
              style={{
                display: "flex",
                gap: 16,
                padding: "18px 20px",
                backgroundColor: "#ffffff",
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: LIGHT_BLUE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                  color: BLUE,
                  marginTop: 1,
                }}
              >
                {i + 1}
              </div>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: MID_GRAY,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {point.label}
                </span>
                <p style={{ fontSize: 15, color: NAVY, lineHeight: 1.6, margin: 0 }}>{point.content}</p>
              </div>
            </div>
          ))}
        </div>

        {pillarDependency && (
          <div
            style={{
              padding: "20px 24px",
              backgroundColor: LIGHT_BLUE,
              borderRadius: 8,
              borderLeft: `4px solid ${BLUE}`,
              marginBottom: 32,
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
                marginBottom: 8,
              }}
            >
              Pillar Dependency
            </span>
            <p style={{ fontSize: 15, color: NAVY, lineHeight: 1.6, margin: "0 0 6px", fontWeight: 600 }}>
              Your {pillarDependency.primaryPillar} pillar improvement depends on resolving your{" "}
              {pillarDependency.upstreamPillar} pillar gap first.
            </p>
            <p style={{ fontSize: 14, color: MID_GRAY, lineHeight: 1.6, margin: 0 }}>
              {pillarDependency.explanation}
            </p>
          </div>
        )}

        {isFree && upgradeProductUrl && (
          <div
            style={{
              padding: "24px 28px",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              backgroundColor: "#ffffff",
              display: "flex",
              gap: 24,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 240 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 4px" }}>
                Ready to go deeper?
              </p>
              <p style={{ fontSize: 14, color: MID_GRAY, lineHeight: 1.5, margin: 0 }}>
                WunderBrand Snapshot+™ opens the contributing factors, reveals your full archetype
                profile, and gives you 8 AI prompts built around your specific results.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
              <a
                href={upgradeProductUrl}
                style={{
                  display: "inline-block",
                  padding: "11px 22px",
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
                  padding: "11px 22px",
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
        )}
      </div>
    </div>
  );
}
