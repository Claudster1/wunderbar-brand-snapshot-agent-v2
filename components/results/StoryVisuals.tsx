"use client";

import type { ReactNode } from "react";
import { SUITE_BLUE, SUITE_BORDER, SUITE_MUTED, SUITE_NAVY } from "@/components/results/suiteBrandTokens";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_BLUE;
const BORDER = SUITE_BORDER;
const MID_GRAY = SUITE_MUTED;
const SUB = "#5A6B7E";
/** Deeper cyan from brand system (globals / tailwind brand-blueHover) — funnel base → tip. */
const BLUE_DEEP = "#059BD8";

type FunnelStepChrome = { borderLeft: string; background: string };

function funnelChromeForIndex(index: number, total: number): FunnelStepChrome {
  if (total <= 1) {
    return {
      borderLeft: `3px solid ${BLUE}`,
      background: `linear-gradient(135deg, rgba(7, 176, 242, 0.12) 0%, #FFFFFF 100%)`,
    };
  }
  const stops: FunnelStepChrome[] = [
    {
      borderLeft: `3px solid rgba(2, 24, 89, 0.42)`,
      background: `linear-gradient(135deg, rgba(2, 24, 89, 0.08) 0%, #FFFFFF 92%)`,
    },
    {
      borderLeft: `3px solid rgba(7, 176, 242, 0.55)`,
      background: `linear-gradient(135deg, rgba(2, 24, 89, 0.04) 0%, rgba(7, 176, 242, 0.07) 100%)`,
    },
    {
      borderLeft: `3px solid ${BLUE}`,
      background: `linear-gradient(135deg, rgba(7, 176, 242, 0.11) 0%, #FFFFFF 100%)`,
    },
    {
      borderLeft: `3px solid ${BLUE_DEEP}`,
      background: `linear-gradient(135deg, rgba(7, 176, 242, 0.18) 0%, #F8FBFF 100%)`,
    },
  ];
  const max = stops.length - 1;
  const pos = Math.min(max, Math.round((index / Math.max(total - 1, 1)) * max));
  return stops[pos];
}

export function JourneyMapVisual({
  stages,
}: {
  stages: Array<{ label: string; focus: string }>;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        background: "#FFFFFF",
        padding: "12px 14px",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 11,
          fontWeight: 800,
          color: BLUE,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        Journey Map Visual
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
        {stages.map((stage, index) => (
          <div key={`${stage.label}-${index}`} style={{ position: "relative" }}>
            <div
              style={{
                border: `1px solid ${BORDER}`,
                borderTop: `3px solid ${BLUE}`,
                borderRadius: 6,
                background: "#F8FBFF",
                padding: "8px 9px",
                minHeight: 84,
              }}
            >
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>{stage.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: SUB, lineHeight: 1.45 }}>{stage.focus}</p>
            </div>
            {index < stages.length - 1 && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  right: -6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: BLUE,
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                {"->"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FunnelVisual({
  steps,
}: {
  steps: Array<{ label: string; detail: string }>;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        background: "#FFFFFF",
        padding: "12px 14px",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 11,
          fontWeight: 800,
          color: BLUE,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        Funnel Flow Visual
      </p>
      <div style={{ display: "grid", gap: 7 }}>
        {steps.map((step, index) => {
          const width = 100 - index * 12;
          const chrome = funnelChromeForIndex(index, steps.length);
          return (
            <div
              key={`${step.label}-${index}`}
              style={{
                width: `${width}%`,
                minWidth: 210,
                margin: "0 auto",
                borderRadius: 6,
                border: `1px solid ${SUITE_BORDER}`,
                borderLeft: chrome.borderLeft,
                background: chrome.background,
                padding: "8px 10px",
              }}
            >
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>{step.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: SUB, lineHeight: 1.45 }}>{step.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SwotVisual({
  strengths,
  weaknesses,
  opportunities,
  threats,
}: {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}) {
  const cardStyle = {
    borderRadius: 6,
    padding: "9px 10px",
    border: `1px solid ${BORDER}`,
    background: "#FFFFFF",
  };
  return (
    <div
      style={{
        marginTop: 12,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        background: "#FFFFFF",
        padding: "12px 14px",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 11,
          fontWeight: 800,
          color: BLUE,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        SWOT Snapshot
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ ...cardStyle, borderLeft: "3px solid #16A34A", background: "#F0FDF4" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#166534", textTransform: "uppercase" }}>
            Strengths
          </p>
          {strengths.slice(0, 2).map((item, index) => (
            <p key={`s-${index}`} style={{ margin: "5px 0 0", fontSize: 12, color: "#14532D", lineHeight: 1.45 }}>
              - {item}
            </p>
          ))}
        </div>
        <div style={{ ...cardStyle, borderLeft: "3px solid #DC2626", background: "#FEF2F2" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#991B1B", textTransform: "uppercase" }}>
            Weaknesses
          </p>
          {weaknesses.slice(0, 2).map((item, index) => (
            <p key={`w-${index}`} style={{ margin: "5px 0 0", fontSize: 12, color: "#7F1D1D", lineHeight: 1.45 }}>
              - {item}
            </p>
          ))}
        </div>
        <div style={{ ...cardStyle, borderLeft: "3px solid #0284C7", background: "#F0F9FF" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#0369A1", textTransform: "uppercase" }}>
            Opportunities
          </p>
          {opportunities.slice(0, 2).map((item, index) => (
            <p key={`o-${index}`} style={{ margin: "5px 0 0", fontSize: 12, color: "#0C4A6E", lineHeight: 1.45 }}>
              - {item}
            </p>
          ))}
        </div>
        <div style={{ ...cardStyle, borderLeft: "3px solid #7C3AED", background: "#F5F3FF" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#5B21B6", textTransform: "uppercase" }}>
            Threats
          </p>
          {threats.slice(0, 2).map((item, index) => (
            <p key={`t-${index}`} style={{ margin: "5px 0 0", fontSize: 12, color: "#4C1D95", lineHeight: 1.45 }}>
              - {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Shared wrapper for channel reference diagrams (not data charts). */
function chartShell(title: string, children: ReactNode) {
  return (
    <div
      style={{
        marginTop: 0,
        marginBottom: 14,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        background: "#FFFFFF",
        padding: "12px 14px",
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 11,
          fontWeight: 800,
          color: BLUE,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

/** Shown on every campaign playbook: align assets to a primary journey stage. */
export function CampaignJourneyContextVisual() {
  const stages = [
    { label: "Aware", hint: "Reach & education" },
    { label: "Consider", hint: "Proof & nurture" },
    { label: "Decide", hint: "Offer & CTA" },
    { label: "Grow", hint: "Onboard & expand" },
  ];
  return chartShell(
    "Campaign ↔ buyer journey",
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(112px, 1fr))",
          gap: 8,
          alignItems: "stretch",
        }}
      >
        {stages.map((stage, index) => (
          <div key={stage.label} style={{ position: "relative" }}>
            <div
              style={{
                border: `1px solid ${BORDER}`,
                borderTop: `3px solid ${BLUE}`,
                borderRadius: 6,
                background: "#F8FBFF",
                padding: "8px 9px",
                minHeight: 72,
              }}
            >
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>{stage.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: SUB, lineHeight: 1.4 }}>{stage.hint}</p>
            </div>
            {index < stages.length - 1 && (
              <span
                aria-hidden
                style={{
                  display: "none",
                }}
              />
            )}
          </div>
        ))}
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 11, color: SUB, lineHeight: 1.45 }}>
        Map each asset in this playbook to <strong style={{ color: NAVY }}>one primary stage</strong> so messaging and CTAs stay coherent.
      </p>
    </>,
  );
}

export function LeadMagnetFlowVisual() {
  const steps = [
    { label: "Hook", detail: "Ad, social, or search promise" },
    { label: "Landing", detail: "Form + value prop + trust" },
    { label: "Deliver", detail: "Asset + instant confirmation" },
    { label: "Bridge", detail: "Nurture into next step" },
  ];
  return chartShell(
    "Offer flow",
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "stretch" }}>
      {steps.map((step, i) => (
        <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 140px" }}>
          <div
            style={{
              flex: 1,
              borderRadius: 6,
              border: `1px solid ${BORDER}`,
              borderLeft: `3px solid ${BLUE}`,
              background: "linear-gradient(135deg, rgba(7,176,242,0.08) 0%, #FFFFFF 100%)",
              padding: "8px 10px",
            }}
          >
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>{step.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: SUB, lineHeight: 1.4 }}>{step.detail}</p>
          </div>
          {i < steps.length - 1 ? (
            <span style={{ color: BLUE, fontWeight: 900, fontSize: 13, flexShrink: 0 }} aria-hidden>
              →
            </span>
          ) : null}
        </div>
      ))}
    </div>,
  );
}

export function EmailLifecycleFlowVisual() {
  const steps = [
    { label: "Entry", detail: "Trigger + expectations" },
    { label: "Educate", detail: "Stories, proof, POV" },
    { label: "Convert", detail: "Single strong CTA" },
    { label: "Retain", detail: "Rhythm + segmentation" },
  ];
  return chartShell(
    "Lifecycle sequence shape",
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
      {steps.map((step, index) => (
        <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              flex: 1,
              borderRadius: 6,
              border: `1px solid ${BORDER}`,
              background: index % 2 === 0 ? "#F8FBFF" : "#FFFFFF",
              padding: "8px 9px",
              minHeight: 76,
            }}
          >
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>{step.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: SUB, lineHeight: 1.4 }}>{step.detail}</p>
          </div>
        </div>
      ))}
    </div>,
  );
}

export function SeoAeoIntentVisual() {
  const cols = [
    { label: "Discover", detail: "Educational / question queries" },
    { label: "Evaluate", detail: "Comparison + proof pages" },
    { label: "Act", detail: "High-intent + structured data" },
  ];
  return chartShell(
    "Search intent layers",
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
      {cols.map((c, i) => (
        <div
          key={c.label}
          style={{
            borderRadius: 6,
            border: `1px solid ${BORDER}`,
            borderTop: `4px solid ${i === 0 ? "#94A3B8" : i === 1 ? BLUE : BLUE_DEEP}`,
            padding: "10px 11px",
            background: "#FFFFFF",
          }}
        >
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>{c.label}</p>
          <p style={{ margin: "5px 0 0", fontSize: 11, color: SUB, lineHeight: 1.45 }}>{c.detail}</p>
        </div>
      ))}
    </div>,
  );
}

export function ThoughtLeadershipFlywheelVisual() {
  const nodes = [
    { label: "Insight", detail: "POV + customer truth" },
    { label: "Package", detail: "Format for channel" },
    { label: "Publish", detail: "Cadence + hooks" },
    { label: "Learn", detail: "Engagement → next themes" },
  ];
  return chartShell(
    "Authority cadence loop",
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {nodes.map((n, i) => (
        <div key={n.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              borderRadius: 999,
              border: `1px solid ${BORDER}`,
              background: "#F0F9FF",
              padding: "8px 12px",
              minWidth: 100,
            }}
          >
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>{n.label}</p>
            <p style={{ margin: "3px 0 0", fontSize: 10, color: SUB, lineHeight: 1.35 }}>{n.detail}</p>
          </div>
          {i < nodes.length - 1 ? (
            <span style={{ color: BLUE, fontWeight: 900 }} aria-hidden>
              ↻
            </span>
          ) : (
            <span style={{ color: MID_GRAY, fontSize: 11, marginLeft: 4 }} aria-hidden>
              (repeat)
            </span>
          )}
        </div>
      ))}
    </div>,
  );
}

export function PrSignalChainVisual() {
  const steps = [
    { label: "Narrative", detail: "Angle + proof" },
    { label: "Target", detail: "Outlets & formats" },
    { label: "Coverage", detail: "Pickup + quotes" },
    { label: "Reuse", detail: "Social, site, sales" },
  ];
  return chartShell(
    "PR signal chain",
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
      {steps.map((s, idx) => (
        <div key={s.label} style={{ textAlign: "center" as const }}>
          <div
            style={{
              margin: "0 auto",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: idx === 0 ? NAVY : idx === steps.length - 1 ? BLUE_DEEP : BLUE,
            }}
          />
          <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 800, color: NAVY }}>{s.label}</p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: SUB, lineHeight: 1.4 }}>{s.detail}</p>
          {idx < steps.length - 1 ? (
            <div style={{ height: 1, background: BORDER, margin: "10px 0 0", opacity: 0.7 }} aria-hidden />
          ) : null}
        </div>
      ))}
    </div>,
  );
}

export function ExecutionQuarterTimelineVisual() {
  const phases = [
    { label: "Days 1–30", detail: "Foundations, quick wins, instrumentation" },
    { label: "Days 31–60", detail: "Scale what works, cut what drags" },
    { label: "Days 61–90", detail: "Optimize, handoff, next-quarter bets" },
  ];
  return chartShell(
    "90-day rollout timeline",
    <div style={{ display: "grid", gap: 10 }}>
      {phases.map((p, i) => (
        <div key={p.label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `linear-gradient(135deg, rgba(7,176,242,${0.15 + i * 0.08}) 0%, #FFFFFF 100%)`,
              border: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 900,
              color: NAVY,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: NAVY }}>{p.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: SUB, lineHeight: 1.45 }}>{p.detail}</p>
            <div
              style={{
                marginTop: 8,
                height: 6,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${BLUE} ${33 * (i + 1)}%, ${BORDER} 0%)`,
                maxWidth: "100%",
              }}
              aria-hidden
            />
          </div>
        </div>
      ))}
    </div>,
  );
}

export function CompetitiveMotionVisual() {
  const lanes = [
    { label: "Your wedge", detail: "Where you win on story + proof" },
    { label: "Pressure", detail: "Where competitors squeeze you" },
    { label: "Counter-move", detail: "Battle cards, talk tracks, landing swaps" },
  ];
  return chartShell(
    "Competitive motion map",
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
      {lanes.map((lane, i) => (
        <div
          key={lane.label}
          style={{
            borderRadius: 6,
            padding: "10px 11px",
            border: `1px solid ${BORDER}`,
            borderLeft: `4px solid ${i === 0 ? "#16A34A" : i === 1 ? "#DC2626" : BLUE}`,
            background: "#FFFFFF",
          }}
        >
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>{lane.label}</p>
          <p style={{ margin: "5px 0 0", fontSize: 11, color: SUB, lineHeight: 1.45 }}>{lane.detail}</p>
        </div>
      ))}
    </div>,
  );
}

export function AudienceFoundationVisual() {
  const layers = [
    { label: "ICP", detail: "Who buys and why now" },
    { label: "Personas", detail: "Roles and proof they need" },
    { label: "Triggers", detail: "Moments that open the conversation" },
  ];
  return chartShell(
    "Audience & segment stack",
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
      {layers.map((layer, i) => (
        <div
          key={layer.label}
          style={{
            textAlign: "center" as const,
            padding: "10px 8px",
            borderRadius: 6,
            border: `1px solid ${BORDER}`,
            background: i === 1 ? "#F8FBFF" : "#FFFFFF",
          }}
        >
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>{layer.label}</p>
          <p style={{ margin: "5px 0 0", fontSize: 11, color: SUB, lineHeight: 1.4 }}>{layer.detail}</p>
        </div>
      ))}
    </div>,
  );
}
