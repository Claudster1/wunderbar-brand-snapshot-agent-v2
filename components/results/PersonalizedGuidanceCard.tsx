"use client";

import { EXAMPLE_CALLOUT, SEMANTIC_DO, SEMANTIC_DONT } from "@/src/pdf/reportVisualTokens";

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
          margin: "0 0 10px",
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: "0.03em",
          color: MID,
        }}
      >
        {title}
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        <div
          style={{
            borderLeft: `4px solid ${SEMANTIC_DO.border}`,
            background: SEMANTIC_DO.bg,
            borderRadius: 8,
            padding: "10px 12px",
            border: "1px solid rgba(5, 150, 105, 0.2)",
            borderLeftWidth: 4,
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: SEMANTIC_DO.label }}>
            Do this
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: SEMANTIC_DO.text, lineHeight: 1.55 }}>{doText}</p>
        </div>
        <div
          style={{
            borderLeft: `4px solid ${SEMANTIC_DONT.border}`,
            background: SEMANTIC_DONT.bg,
            borderRadius: 8,
            padding: "10px 12px",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderLeftWidth: 4,
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: SEMANTIC_DONT.label }}>
            Don&apos;t / not this
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: SEMANTIC_DONT.text, lineHeight: 1.55 }}>{dontText}</p>
        </div>
        <div
          style={{
            marginTop: 2,
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px solid ${BORDER}`,
            background: "#FAFBFC",
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", color: EXAMPLE_CALLOUT.labelColor }}>
            Brand-specific example
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: NAVY, lineHeight: 1.6 }}>{example}</p>
        </div>
      </div>
    </div>
  );
}
