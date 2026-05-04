"use client";

import type { CSSProperties } from "react";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BG_CARD,
  SUITE_BG_PAGE,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_MD,
  SUITE_RADIUS_SM,
} from "@/components/results/suiteBrandTokens";
import { strategicOfferPrimaryLabel } from "@/lib/strategy/strategicOfferPlan";

type Props = {
  diagnosticData: Record<string, unknown>;
  onOpenStrategy: () => void;
};

function asTrimString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Up to three lines tying Activation plans back to Strategy / diagnostic focus. */
function buildActivationStrategyBridgeLines(diagnosticData: Record<string, unknown>): string[] {
  const priorities = (diagnosticData.strategicPriorities as Array<{ title?: string }> | undefined) ?? [];
  const fromPriorities = priorities
    .map((p) => asTrimString(p.title))
    .filter(Boolean)
    .slice(0, 3);

  if (fromPriorities.length >= 3) return fromPriorities;

  const out = [...fromPriorities];
  const ex = diagnosticData.executiveSummary;
  if (out.length < 3 && ex && typeof ex === "object" && !Array.isArray(ex)) {
    const focus = asTrimString((ex as { primaryFocusArea?: unknown }).primaryFocusArea);
    if (focus) out.push(`Leadership focus: ${focus}`);
  }
  const gaps = Array.isArray(diagnosticData.topGaps)
    ? diagnosticData.topGaps.map((g) => String(g).trim()).filter(Boolean)
    : [];
  for (const g of gaps) {
    if (out.length >= 3) break;
    const line = `Priority fix: ${g}`;
    if (!out.includes(line)) out.push(line);
  }
  return out.slice(0, 3);
}

const BTN: CSSProperties = {
  marginTop: 14,
  padding: "9px 16px",
  borderRadius: SUITE_RADIUS_SM,
  border: `1px solid ${SUITE_NAVY}`,
  background: SUITE_BG_CARD,
  color: SUITE_NAVY,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: SUITE_FONT_UI,
};

/**
 * Fixed strip under the Activation hero: connects channel plans to Strategy priorities.
 */
export default function ActivationStrategyBridgeBanner({ diagnosticData, onOpenStrategy }: Props) {
  const lines = buildActivationStrategyBridgeLines(diagnosticData);
  const offerHook = strategicOfferPrimaryLabel(diagnosticData);

  return (
    <section
      aria-labelledby="activation-strategy-bridge-title"
      style={{
        marginBottom: 28,
        padding: "16px 18px",
        borderRadius: SUITE_RADIUS_MD,
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderLeft: `3px solid ${SUITE_ACCENT_BRIGHT}`,
        background: "#FAFBFC",
        maxWidth: 760,
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <p
        id="activation-strategy-bridge-title"
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: SUITE_ACCENT_BRIGHT,
        }}
      >
        How these plans connect
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 700, color: SUITE_NAVY, lineHeight: 1.35 }}>
        Your channel plans execute the direction from Strategy
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: SUITE_MUTED, lineHeight: 1.55 }}>
        The sections below turn your go-to-market choices into concrete plays. When you need the full rationale—audiences,
        journey, spend, and sequencing—open Strategy.
      </p>
      {offerHook ? (
        <p
          style={{
            margin: "12px 0 0",
            padding: "10px 12px",
            borderRadius: SUITE_RADIUS_SM,
            background: SUITE_BG_CARD,
            border: `1px solid ${SUITE_BORDER}`,
            fontSize: 13,
            color: SUITE_NAVY,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ fontWeight: 700 }}>Primary offer anchor: </strong>
          {offerHook}
        </p>
      ) : null}
      {lines.length > 0 ? (
        <ul
          style={{
            margin: "12px 0 0",
            paddingLeft: 18,
            fontSize: 13,
            color: SUITE_NAVY,
            lineHeight: 1.55,
          }}
        >
          {lines.map((line) => (
            <li key={line} style={{ marginBottom: 6 }}>
              {line}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: "12px 0 0", fontSize: 13, color: SUITE_MUTED, lineHeight: 1.55 }}>
          Open Strategy for ranked priorities, audience focus, and channel decisions that inform every plan in this tab.
        </p>
      )}
      <p style={{ margin: "14px 0 0", fontSize: 12, color: SUITE_MUTED, lineHeight: 1.5, fontStyle: "italic" }}>
        This week: choose one plan below, assign an owner, and set a due date in Workbook or your own tracker—small moves
        keep momentum.
      </p>
      <button type="button" onClick={onOpenStrategy} style={BTN}>
        Open Strategy for full rationale
      </button>
    </section>
  );
}
