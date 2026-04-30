"use client";

import type { CSSProperties, ReactNode } from "react";
import { useId, useLayoutEffect, useRef, useState } from "react";
import {
  SUITE_BLUE,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";
import { getJourneyMapTileChrome, journeyStageTitleColor } from "@/lib/strategy/journeyMapTileChrome";
import { getOfferFlowTileChrome } from "@/lib/strategy/offerFlowTileChrome";

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

/** Gradient frame + navy eyebrow — matches Channel mix and other suite “insight” visuals. */
export function SuiteVisualFrame({
  eyebrow,
  description,
  children,
  marginTop = 12,
  marginBottom,
}: {
  eyebrow: string;
  description?: ReactNode;
  children: ReactNode;
  marginTop?: number;
  marginBottom?: number;
}) {
  return (
    <div
      style={{
        marginTop,
        marginBottom,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        background: "linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 55%)",
        padding: "16px 18px 18px",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          margin: description ? "0 0 4px" : "0 0 10px",
          fontSize: 11,
          fontWeight: 800,
          color: NAVY,
          letterSpacing: "0.06em",
        }}
      >
        {eyebrow}
      </p>
      {description ? (
        <div style={{ margin: "0 0 12px", fontSize: 12, color: MID_GRAY, lineHeight: 1.45 }}>{description}</div>
      ) : null}
      {children}
    </div>
  );
}

function HubAndSpokeDiagram({
  hubLabel,
  hubSublabel,
  nodes,
  ariaLabel,
}: {
  hubLabel: string;
  hubSublabel: string;
  nodes: Array<{ label: string; sub: string }>;
  ariaLabel: string;
}) {
  const uid = useId().replace(/:/g, "");
  const glowId = `hub-glow-${uid}`;
  const spokeId = `hub-spoke-${uid}`;
  const cx = 200;
  const cy = 180;
  const rHub = 56;
  const rRing = 124;
  const n = Math.max(1, nodes.length);
  const hub = hubLabel.trim() || "Your brand";
  const hubPrimary = hub.length > 20 ? `${hub.slice(0, 18)}…` : hub;
  /** Spoke cards: room for wrapped title + sub-label */
  const w = 128;
  const h = 64;

  return (
    <svg
      viewBox="0 6 400 336"
      width="100%"
      style={{ maxWidth: 440, maxHeight: 360, display: "block", margin: "0 auto" }}
      overflow="visible"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.14" />
          <stop offset="70%" stopColor={BLUE} stopOpacity="0.02" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={spokeId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.2" />
          <stop offset="55%" stopColor={BLUE} stopOpacity="0.65" />
          <stop offset="100%" stopColor={BLUE_DEEP} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={rRing + 36} fill={`url(#${glowId})`} />
      {nodes.map((ch, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const x = cx + rRing * Math.cos(angle);
        const y = cy + rRing * Math.sin(angle);
        const x0 = cx + (rHub + 2) * Math.cos(angle);
        const y0 = cy + (rHub + 2) * Math.sin(angle);
        return (
          <g key={`${ch.label}-${i}`}>
            <line
              x1={x0}
              y1={y0}
              x2={x - (w / 2 - 10) * Math.cos(angle)}
              y2={y - (h / 2 - 10) * Math.sin(angle)}
              stroke={`url(#${spokeId})`}
              strokeWidth={2.75}
              strokeLinecap="round"
            />
            <rect
              x={x - w / 2}
              y={y - h / 2}
              width={w}
              height={h}
              rx={10}
              fill="#EEF6FC"
              stroke="rgba(2, 24, 89, 0.16)"
              strokeWidth={1.25}
              style={{ filter: "drop-shadow(0 2px 8px rgba(2,24,89,0.1))" }}
            />
            <text
              x={x}
              y={y - h / 2 + 16}
              textAnchor="middle"
              dominantBaseline="hanging"
              fill={NAVY}
              style={{ fontSize: 10.5, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}
            >
              {ch.label}
            </text>
            <text
              x={x}
              y={y - h / 2 + 34}
              textAnchor="middle"
              dominantBaseline="hanging"
              fill={BLUE_DEEP}
              style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "system-ui, sans-serif" }}
            >
              {ch.sub}
            </text>
          </g>
        );
      })}
      <circle
        cx={cx}
        cy={cy}
        r={rHub}
        fill="#F5FAFD"
        stroke={BLUE}
        strokeWidth={2.75}
        style={{ filter: "drop-shadow(0 3px 12px rgba(7,176,242,0.28))" }}
      />
      <text
        x={cx}
        y={cy - rHub + 18}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill={NAVY}
        style={{ fontSize: 11.5, fontWeight: 800, fontFamily: "system-ui, sans-serif" }}
      >
        {hubPrimary}
      </text>
      <text
        x={cx}
        y={cy - rHub + 34}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill={BLUE}
        style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em", fontFamily: "system-ui, sans-serif" }}
      >
        {hubSublabel}
      </text>
    </svg>
  );
}

const SPOKE_CARD: CSSProperties = {
  padding: "15px 17px 17px",
  borderRadius: 13,
  background: "linear-gradient(160deg, #F3F9FF 0%, #FFFFFF 62%)",
  border: "1px solid rgba(2, 24, 89, 0.16)",
  boxShadow: "0 3px 16px rgba(2, 24, 89, 0.11)",
  minWidth: 0,
  boxSizing: "border-box",
};

const SPOKE_SUB_CHIP: CSSProperties = {
  display: "inline-block",
  marginTop: 11,
  padding: "3px 9px",
  fontSize: 9.5,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: BLUE_DEEP,
  background: "rgba(7, 176, 242, 0.18)",
  borderRadius: 5,
  fontFamily: SUITE_FONT_UI,
};

/**
 * Messaging hub: HTML spokes wrap full labels; radial layout scales with container.
 * Below ~520px width, switches to hub + stacked cards to avoid overlap.
 */
function MessagingHubFlexibleDiagram({
  hubLabel,
  hubSublabel,
  nodes,
  ariaLabel,
}: {
  hubLabel: string;
  hubSublabel: string;
  nodes: Array<{ label: string; sub: string }>;
  ariaLabel: string;
}) {
  const uid = useId().replace(/:/g, "");
  const glowId = `msg-hub-glow-${uid}`;
  const spokeId = `msg-hub-spoke-${uid}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 560, h: 500 });
  const n = Math.max(1, nodes.length);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(300, r.width);
      const h =
        n >= 6
          ? Math.max(510, Math.min(660, w * 1.02))
          : Math.max(460, Math.min(620, w * 0.9));
      setDims({ w, h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);

  const hub = hubLabel.trim() || "Core message";
  const compact = dims.w < 520;

  if (compact) {
    return (
      <div
        ref={wrapRef}
        role="img"
        aria-label={ariaLabel}
        style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}
      >
        <div
          style={{
            ...SPOKE_CARD,
            border: `2px solid ${BLUE}`,
            boxShadow: "0 4px 18px rgba(7, 176, 242, 0.22)",
            background: "linear-gradient(165deg, #FFFFFF 0%, #E8F4FC 100%)",
            padding: "18px 20px",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 800,
              color: NAVY,
              lineHeight: 1.45,
              fontFamily: SUITE_FONT_UI,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {hub}
          </p>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: BLUE,
              fontFamily: SUITE_FONT_UI,
            }}
          >
            {hubSublabel}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {nodes.map((ch, i) => (
            <div key={`spoke-stack-${i}`} style={{ ...SPOKE_CARD }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: NAVY,
                  lineHeight: 1.45,
                  fontFamily: SUITE_FONT_UI,
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {ch.label}
              </p>
              <span style={SPOKE_SUB_CHIP}>{ch.sub}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cx = dims.w / 2;
  const cy = dims.h / 2;
  const rLineStart = 88;
  const side = Math.min(dims.w, dims.h);
  /** Balance radial spacing with larger spoke cards for readability at desktop widths. */
  const R = side * (n >= 6 ? 0.4 : n >= 5 ? 0.37 : 0.34);
  const chord = 2 * R * Math.sin(Math.PI / n);
  const chordCap = n >= 5 ? 0.84 : 0.9;
  const maxSpokeW = Math.floor(
    Math.min(304, dims.w * 0.44, Math.max(168, chord * chordCap)),
  );

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={ariaLabel}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 640,
        margin: "0 auto",
        minHeight: dims.h,
        padding: "12px 14px 22px",
        boxSizing: "border-box",
        overflow: "visible",
      }}
    >
      <svg
        width={dims.w}
        height={dims.h}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          display: "block",
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <defs>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.11" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={spokeId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.22" />
            <stop offset="100%" stopColor={BLUE_DEEP} stopOpacity="0.88" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R + 32} fill={`url(#${glowId})`} />
        {nodes.map((_, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
          const x1 = cx + rLineStart * Math.cos(angle);
          const y1 = cy + rLineStart * Math.sin(angle);
          const x2 = cx + R * Math.cos(angle);
          const y2 = cy + R * Math.sin(angle);
          return (
            <line
              key={`ln-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={`url(#${spokeId})`}
              strokeWidth={2.85}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          maxWidth: Math.min(380, dims.w * 0.58),
          padding: "18px 20px 20px",
          borderRadius: 15,
          background: "linear-gradient(160deg, #FFFFFF 0%, #EAF6FF 100%)",
          border: `2px solid ${BLUE}`,
          boxShadow: "0 6px 22px rgba(7, 176, 242, 0.2)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 14.5,
            fontWeight: 800,
            color: NAVY,
            lineHeight: 1.43,
            fontFamily: SUITE_FONT_UI,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
        >
          {hub}
        </p>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 8.8,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: BLUE,
            fontFamily: SUITE_FONT_UI,
          }}
        >
          {hubSublabel}
        </p>
      </div>

      {nodes.map((ch, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const left = cx + R * Math.cos(angle);
        const top = cy + R * Math.sin(angle);
        return (
          <div
            key={`spoke-radial-${i}`}
            title={ch.label}
            style={{
              position: "absolute",
              left,
              top,
              transform: "translate(-50%, -50%)",
              width: maxSpokeW,
              maxWidth: maxSpokeW,
              zIndex: 3,
              ...SPOKE_CARD,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                color: NAVY,
                lineHeight: 1.48,
                fontFamily: SUITE_FONT_UI,
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {ch.label}
            </p>
            <span style={SPOKE_SUB_CHIP}>{ch.sub}</span>
          </div>
        );
      })}
    </div>
  );
}

export function JourneyMapVisual({
  stages,
  title = "Journey at a glance",
  caption,
}: {
  stages: Array<{ label: string; focus: string }>;
  /** Replaces default eyebrow above the grid */
  title?: string;
  /** Muted line under title (e.g. tie tiles to narrative blocks below) */
  caption?: string;
}) {
  return (
    <SuiteVisualFrame marginTop={12} eyebrow={title} description={caption}>
      <div className="journey-map-visual-grid">
        {stages.map((stage, index) => {
          const chrome = getJourneyMapTileChrome(stage.label, index);
          return (
            <div key={`${stage.label}-${index}`}>
              <div
                style={{
                  border: `1px solid ${chrome.border}`,
                  borderRadius: 10,
                  background: `linear-gradient(145deg, ${chrome.bgFrom} 0%, ${chrome.bgTo} 100%)`,
                  padding: "14px 14px 15px",
                  minHeight: 92,
                  boxShadow: `0 4px 14px ${chrome.leftRail}22`,
                  borderTopWidth: 3,
                  borderTopStyle: "solid",
                  borderTopColor: chrome.leftRail,
                  borderLeftWidth: 4,
                  borderLeftStyle: "solid",
                  borderLeftColor: chrome.leftRail,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span
                    style={{
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 24,
                      height: 24,
                      borderRadius: "999px",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#FFFFFF",
                      background: chrome.numberBg,
                      marginTop: 1,
                    }}
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                        color: journeyStageTitleColor(chrome),
                      }}
                    >
                      {stage.label}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: SUB,
                        fontFamily: SUITE_FONT_UI,
                      }}
                    >
                      {chrome.cue}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: SUB, lineHeight: 1.5 }}>{stage.focus}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SuiteVisualFrame>
  );
}

export function FunnelVisual({
  steps,
}: {
  steps: Array<{ label: string; detail: string }>;
}) {
  return (
    <SuiteVisualFrame
      marginTop={12}
      eyebrow="Funnel flow visual"
      description="Stage compression from first touch through optimization—use Activation playbooks for channel-specific assets."
    >
      <div style={{ display: "grid", gap: 10 }}>
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
                padding: "12px 14px",
              }}
            >
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: BLUE }}>{step.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: SUB, lineHeight: 1.45 }}>{step.detail}</p>
            </div>
          );
        })}
      </div>
    </SuiteVisualFrame>
  );
}

const CHANNEL_HUB_NODES: Array<{ label: string; sub: string }> = [
  { label: "Site & landing", sub: "Proof + primary CTA" },
  { label: "Email", sub: "Nurture + handoffs" },
  { label: "Social", sub: "Authority + hooks" },
  { label: "Search & AEO", sub: "Intent capture" },
  { label: "Paid media", sub: "Scale + tests" },
  { label: "Sales voice", sub: "Talk tracks + deck" },
];

/**
 * Hub-and-spoke diagram for Strategy → Channel mix (roles, not execution detail).
 * Detailed calendars, sequences, and channel plans live on the Activation tab.
 */
export function ChannelMixHubVisual({ hubLabel }: { hubLabel: string }) {
  const hub = hubLabel.trim() || "Your brand";
  return (
    <SuiteVisualFrame
      marginTop={12}
      eyebrow="Channel mix at a glance"
      description={
        <>
          Each channel has one job in the system—all spokes should reinforce the same message spine. Ship-ready plans and
          assets are on <strong style={{ color: NAVY }}>Activation</strong>.
        </>
      }
    >
      <HubAndSpokeDiagram
        hubLabel={hub}
        hubSublabel="MESSAGE SPINE"
        nodes={CHANNEL_HUB_NODES}
        ariaLabel="Diagram: message spine in the center with six channels connected around it"
      />
    </SuiteVisualFrame>
  );
}

const SPEND_ROLES_HUB_NODES: Array<{ label: string; sub: string }> = [
  { label: "Demand capture", sub: "Intent + awareness" },
  { label: "Nurture", sub: "Follow-up + proof" },
  { label: "Conversion", sub: "Offers + pages" },
  { label: "Scale winners", sub: "Reinvest what works" },
  { label: "Review cadence", sub: "Monthly rebalance" },
];

/** Strategy → Budget-aligned spend: roles in the system before dollar amounts. */
export function SpendRolesHubVisual({ hubLabel }: { hubLabel: string }) {
  const hub = hubLabel.trim() || "Your brand";
  return (
    <SuiteVisualFrame
      marginTop={12}
      eyebrow="Spend roles at a glance"
      description={
        <>
          Phasing and dollar targets stay in your narrative below—this is the <strong style={{ color: NAVY }}>discipline</strong>{" "}
          model: fund each job, then scale only what clears your success checks.
        </>
      }
    >
      <HubAndSpokeDiagram
        hubLabel={hub}
        hubSublabel="SPEND DISCIPLINE"
        nodes={SPEND_ROLES_HUB_NODES}
        ariaLabel="Diagram: brand at the center with five spend roles connected around it"
      />
    </SuiteVisualFrame>
  );
}

/** Marketing Strategy card — core message as hub, supporting and proof as spokes (3–6 nodes). */
export function MessagingSystemHubVisual({
  hubLabel,
  nodes,
}: {
  hubLabel: string;
  nodes: Array<{ label: string; sub: string }>;
}) {
  const trimmed = nodes.filter((n) => n.label.trim().length > 0).slice(0, 6);
  if (trimmed.length < 3) return null;
  return (
    <SuiteVisualFrame
      marginTop={0}
      eyebrow="Messaging system at a glance"
      description="One spine, multiple proof-backed lines—everything below expands each block for copy and briefs."
    >
      <MessagingHubFlexibleDiagram
        hubLabel={hubLabel.trim() || "Core message"}
        hubSublabel="MESSAGE SPINE"
        nodes={trimmed}
        ariaLabel="Diagram: core message in the center with supporting lines connected around it"
      />
    </SuiteVisualFrame>
  );
}

export function SwotVisual({
  strengths,
  weaknesses,
  opportunities,
  threats,
  namedCompetitors,
}: {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  /** From `competitivePositioning.players` — shown above the SWOT grid when present. */
  namedCompetitors?: Array<{ name: string; narrative?: string }>;
}) {
  const cardStyle = {
    borderRadius: 6,
    padding: "12px 14px",
    border: `1px solid ${BORDER}`,
    background: "#FFFFFF",
    boxSizing: "border-box" as const,
  };
  const hasCompetitors = Boolean(namedCompetitors && namedCompetitors.length > 0);
  return (
    <SuiteVisualFrame
      marginTop={12}
      eyebrow="Competitive landscape"
      description="Named alternatives when available, plus a compact SWOT read—use your full matrix in the Workbook for depth."
    >
      {hasCompetitors ? (
        <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${BORDER}` }}>
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 11,
              fontWeight: 800,
              color: NAVY,
              letterSpacing: "0.06em",
            }}
          >
            Named competitors
          </p>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: MID_GRAY, lineHeight: 1.45 }}>
            Alternatives your buyers compare you against from the competitive positioning map in your deliverable.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 10,
            }}
          >
            {namedCompetitors!.map((c, index) => (
              <div
                key={`${c.name}-${index}`}
                style={{
                  ...cardStyle,
                  borderLeft: `3px solid ${BLUE}`,
                  background: "#F8FBFF",
                  padding: "12px 14px",
                }}
              >
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: NAVY, lineHeight: 1.35 }}>{c.name}</p>
                {c.narrative ? (
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: 11,
                      color: SUB,
                      lineHeight: 1.45,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical" as const,
                      overflow: "hidden",
                    }}
                  >
                    {c.narrative}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <p
        style={{
          margin: hasCompetitors ? "14px 0 8px" : "0 0 8px",
          fontSize: 11,
          fontWeight: 800,
          color: NAVY,
          letterSpacing: "0.06em",
        }}
      >
        SWOT snapshot
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ ...cardStyle, borderLeft: "3px solid #16A34A", background: "#F0FDF4" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#166534" }}>
            Strengths
          </p>
          {strengths.slice(0, 2).map((item, index) => (
            <p key={`s-${index}`} style={{ margin: "5px 0 0", fontSize: 12, color: "#14532D", lineHeight: 1.45 }}>
              - {item}
            </p>
          ))}
        </div>
        <div style={{ ...cardStyle, borderLeft: "3px solid #DC2626", background: "#FEF2F2" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#991B1B" }}>
            Weaknesses
          </p>
          {weaknesses.slice(0, 2).map((item, index) => (
            <p key={`w-${index}`} style={{ margin: "5px 0 0", fontSize: 12, color: "#7F1D1D", lineHeight: 1.45 }}>
              - {item}
            </p>
          ))}
        </div>
        <div style={{ ...cardStyle, borderLeft: "3px solid #0284C7", background: "#F0F9FF" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#0369A1" }}>
            Opportunities
          </p>
          {opportunities.slice(0, 2).map((item, index) => (
            <p key={`o-${index}`} style={{ margin: "5px 0 0", fontSize: 12, color: "#0C4A6E", lineHeight: 1.45 }}>
              - {item}
            </p>
          ))}
        </div>
        <div style={{ ...cardStyle, borderLeft: "3px solid #7C3AED", background: "#F5F3FF" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#5B21B6" }}>
            Threats
          </p>
          {threats.slice(0, 2).map((item, index) => (
            <p key={`t-${index}`} style={{ margin: "5px 0 0", fontSize: 12, color: "#4C1D95", lineHeight: 1.45 }}>
              - {item}
            </p>
          ))}
        </div>
      </div>
    </SuiteVisualFrame>
  );
}

/** Shared wrapper for Activation channel reference diagrams (not data charts). */
function chartShell(title: string, children: ReactNode) {
  return (
    <SuiteVisualFrame marginTop={0} marginBottom={14} eyebrow={title}>
      {children}
    </SuiteVisualFrame>
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
        {stages.map((stage, index) => {
          const chrome = getJourneyMapTileChrome(stage.label, index);
          return (
            <div key={stage.label} style={{ position: "relative" }}>
              <div
                style={{
                  border: `1px solid ${chrome.border}`,
                  borderRadius: 10,
                  background: `linear-gradient(145deg, ${chrome.bgFrom} 0%, ${chrome.bgTo} 100%)`,
                  padding: "12px 12px",
                  minHeight: 86,
                  boxShadow: `0 4px 14px ${chrome.leftRail}22`,
                  borderTopWidth: 3,
                  borderTopStyle: "solid",
                  borderTopColor: chrome.leftRail,
                  borderLeftWidth: 4,
                  borderLeftStyle: "solid",
                  borderLeftColor: chrome.leftRail,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span
                    style={{
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 22,
                      height: 22,
                      borderRadius: "999px",
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#FFFFFF",
                      background: chrome.numberBg,
                      marginTop: 1,
                    }}
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 800,
                        color: journeyStageTitleColor(chrome),
                      }}
                    >
                      {stage.label}
                    </p>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: SUB,
                        fontFamily: SUITE_FONT_UI,
                      }}
                    >
                      {chrome.cue}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: 11, color: SUB, lineHeight: 1.4 }}>{stage.hint}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
      {steps.map((step, i) => {
        const chrome = getOfferFlowTileChrome(step.label, i);
        const nextChrome =
          i < steps.length - 1 ? getOfferFlowTileChrome(steps[i + 1]!.label, i + 1) : null;
        return (
          <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 140px" }}>
            <div
              style={{
                flex: 1,
                borderRadius: 10,
                border: `1px solid ${chrome.border}`,
                background: `linear-gradient(145deg, ${chrome.bgFrom} 0%, ${chrome.bgTo} 100%)`,
                padding: "12px 14px",
                boxShadow: "0 2px 8px rgba(2, 24, 89, 0.06)",
                borderLeftWidth: 4,
                borderLeftStyle: "solid",
                borderLeftColor: chrome.leftRail,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: "999px",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    background: chrome.numberBg,
                    marginTop: 1,
                  }}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>{step.label}</p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      color: chrome.chipText,
                      fontFamily: SUITE_FONT_UI,
                    }}
                  >
                    {chrome.cue}
                  </p>
                  <p style={{ margin: "5px 0 0", fontSize: 11, color: SUB, lineHeight: 1.4 }}>{step.detail}</p>
                </div>
              </div>
            </div>
            {i < steps.length - 1 ? (
              <span
                style={{
                  color: nextChrome?.leftRail ?? BLUE,
                  fontWeight: 900,
                  fontSize: 13,
                  flexShrink: 0,
                  padding: "0 4px",
                }}
                aria-hidden
              >
                →
              </span>
            ) : null}
          </div>
        );
      })}
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
              padding: "12px 12px",
              minHeight: 80,
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
            padding: "12px 14px",
            background: "#FFFFFF",
            boxSizing: "border-box",
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
              padding: "12px 14px",
              minWidth: 100,
              boxSizing: "border-box",
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
      {steps.map((s, idx) => (
        <div key={s.label} style={{ textAlign: "center" as const, padding: "4px 8px 8px", boxSizing: "border-box" }}>
          <div
            style={{
              margin: "0 auto",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: idx === 0 ? NAVY : idx === steps.length - 1 ? BLUE_DEEP : BLUE,
            }}
          />
          <p style={{ margin: "10px 0 0", fontSize: 12, fontWeight: 800, color: NAVY }}>{s.label}</p>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: SUB, lineHeight: 1.4 }}>{s.detail}</p>
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
    <div style={{ display: "grid", gap: 12 }}>
      {phases.map((p, i) => (
        <div key={p.label} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "4px 0" }}>
          <div
            style={{
              width: 40,
              height: 40,
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
              boxSizing: "border-box",
            }}
          >
            {i + 1}
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
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
            padding: "12px 14px",
            border: `1px solid ${BORDER}`,
            borderLeft: `4px solid ${i === 0 ? "#16A34A" : i === 1 ? "#DC2626" : BLUE}`,
            background: "#FFFFFF",
            boxSizing: "border-box",
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
            padding: "12px 12px",
            borderRadius: 6,
            border: `1px solid ${BORDER}`,
            background: i === 1 ? "#F8FBFF" : "#FFFFFF",
            boxSizing: "border-box",
          }}
        >
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>{layer.label}</p>
          <p style={{ margin: "5px 0 0", fontSize: 11, color: SUB, lineHeight: 1.4 }}>{layer.detail}</p>
        </div>
      ))}
    </div>,
  );
}
