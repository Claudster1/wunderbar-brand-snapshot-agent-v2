"use client";

import { useMemo, useState } from "react";
import { BrandArchetypeIcon } from "@/components/results/BrandIcons";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const BORDER = "#D6DFE8";
const SUB = "#5A6B7E";

interface ArchetypeToggleCardProps {
  /** Shown as “{brandName} Archetypes” above the toggle. */
  brandName: string;
  primaryName: string;
  secondaryName?: string | null;
  primaryMeaning?: string | null;
  secondaryMeaning?: string | null;
  primaryDetails?: {
    strategicImplication?: string;
    voiceApplication?: string;
    visualApplication?: string;
    conversionRisk?: string;
  } | null;
  secondaryDetails?: {
    strategicImplication?: string;
    voiceApplication?: string;
    visualApplication?: string;
    conversionRisk?: string;
  } | null;
}

export default function ArchetypeToggleCard({
  brandName,
  primaryName,
  secondaryName,
  primaryMeaning,
  secondaryMeaning,
  primaryDetails,
  secondaryDetails,
}: ArchetypeToggleCardProps) {
  const [selected, setSelected] = useState<"primary" | "secondary">("primary");
  const hasSecondary = Boolean(secondaryName && secondaryName.trim());

  const active = useMemo(() => {
    if (selected === "secondary" && hasSecondary) {
      return {
        name: secondaryName as string,
        meaning:
          secondaryMeaning && secondaryMeaning.trim().length > 0
            ? secondaryMeaning
            : "Secondary archetype adds nuance to tone, perspective, and buyer trust signals.",
        details: secondaryDetails ?? null,
      };
    }
    return {
      name: primaryName,
      meaning:
        primaryMeaning && primaryMeaning.trim().length > 0
          ? primaryMeaning
          : "Primary archetype defines the dominant voice and market presence of the brand.",
      details: primaryDetails ?? null,
    };
  }, [
    selected,
    hasSecondary,
    primaryName,
    secondaryName,
    primaryMeaning,
    secondaryMeaning,
    primaryDetails,
    secondaryDetails,
  ]);

  const detailRows = useMemo(() => {
    const d = active.details;
    if (!d) return [];
    const rows: { id: string; label: string; body: string }[] = [];
    if (d.strategicImplication?.trim()) {
      rows.push({ id: "strategic", label: "For your brand", body: d.strategicImplication.trim() });
    }
    if (d.voiceApplication?.trim()) {
      rows.push({ id: "voice", label: "Voice application", body: d.voiceApplication.trim() });
    }
    if (d.visualApplication?.trim()) {
      rows.push({ id: "visual", label: "Visual direction", body: d.visualApplication.trim() });
    }
    if (d.conversionRisk?.trim()) {
      rows.push({ id: "risk", label: "Watch-out", body: d.conversionRisk.trim() });
    }
    return rows;
  }, [active]);

  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%)",
        padding: "18px 18px 20px",
      }}
    >
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 12,
          fontWeight: 800,
          color: NAVY,
          letterSpacing: "0.02em",
        }}
      >
        {brandName.trim() || "Your brand"} Archetypes
      </p>
      <div style={{ display: "grid", gridTemplateColumns: hasSecondary ? "1fr 1fr" : "1fr", gap: 12 }}>
        <button
          type="button"
          onClick={() => setSelected("primary")}
          style={{
            border: selected === "primary" ? `2px solid ${BLUE}` : `1px solid ${BORDER}`,
            borderRadius: 8,
            background: "#FFFFFF",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            boxShadow: selected === "primary" ? "0 4px 12px rgba(7,176,242,0.2)" : "none",
            minHeight: 72,
          }}
        >
          <BrandArchetypeIcon archetype={primaryName} size={42} />
          <div style={{ textAlign: "left" }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: SUB, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Primary
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: NAVY }}>{primaryName}</p>
          </div>
        </button>
        {hasSecondary && (
          <button
            type="button"
            onClick={() => setSelected("secondary")}
            style={{
              border: selected === "secondary" ? `2px solid ${BLUE}` : `1px solid ${BORDER}`,
              borderRadius: 8,
              background: "#FFFFFF",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              boxShadow: selected === "secondary" ? "0 4px 12px rgba(7,176,242,0.2)" : "none",
              minHeight: 72,
            }}
          >
            <BrandArchetypeIcon archetype={secondaryName || undefined} size={42} />
            <div style={{ textAlign: "left" }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: SUB, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Secondary
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: NAVY }}>{secondaryName}</p>
            </div>
          </button>
        )}
      </div>
      <div
        style={{
          marginTop: 16,
          padding: "18px 16px 16px",
          borderRadius: 8,
          background: "#FFFFFF",
          border: `1px solid ${BORDER}`,
          boxShadow: "0 2px 8px rgba(2, 24, 89, 0.04)",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: NAVY }}>{active.name}</p>
        <p style={{ margin: "10px 0 0", fontSize: 14, color: "#334155", lineHeight: 1.65 }}>{active.meaning}</p>
        {detailRows.length > 0 ? (
          <div
            role="list"
            style={{
              marginTop: 18,
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {detailRows.map((row, index) => (
              <div
                key={row.id}
                role="listitem"
                style={{
                  marginTop: index === 0 ? 0 : 16,
                  borderTop: index === 0 ? "none" : `1px solid #E8F0FA`,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 800,
                    color: BLUE,
                    textTransform: "uppercase",
                    letterSpacing: "0.11em",
                  }}
                >
                  {row.label}
                </p>
                <p
                  style={{
                    margin: "10px 0 0",
                    paddingLeft: 12,
                    borderLeft: `3px solid ${BLUE}`,
                    fontSize: 14,
                    color: "#334155",
                    lineHeight: 1.65,
                  }}
                >
                  {row.body}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

