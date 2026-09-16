"use client";

import type { CSSProperties } from "react";
import type {
  BlueprintPlusStartHereMove,
  BlueprintPlusStartHereRole,
} from "@/lib/results/blueprintPlusGuidedMode";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_ACCENT_HOVER,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_BUTTON,
  SUITE_RADIUS_MD,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

const ROLES: Array<{ id: BlueprintPlusStartHereRole; label: string }> = [
  { id: "founder", label: "Founder / lead" },
  { id: "marketing", label: "Marketing" },
  { id: "sales", label: "Sales" },
  { id: "design", label: "Design" },
];

type Props = {
  businessName?: string;
  role: BlueprintPlusStartHereRole;
  moves: BlueprintPlusStartHereMove[];
  onRoleChange: (role: BlueprintPlusStartHereRole) => void;
  onSelectMove: (move: BlueprintPlusStartHereMove) => void;
  onOpenReference: () => void;
};

const CARD: CSSProperties = {
  margin: "0 0 24px",
  padding: "20px 20px 18px",
  borderRadius: SUITE_RADIUS_MD,
  border: `1px solid ${SUITE_BORDER}`,
  borderTop: `2px solid ${SUITE_ACCENT_BRIGHT}`,
  background: "#FFFFFF",
  boxShadow: SUITE_SHADOW_CARD,
  fontFamily: SUITE_FONT_UI,
};

function rolePill(active: boolean): CSSProperties {
  return {
    border: active ? `1px solid ${SUITE_NAVY}` : `1px solid ${SUITE_BORDER}`,
    background: active ? SUITE_NAVY : "#FFFFFF",
    color: active ? "#FFFFFF" : SUITE_TEXT_PRIMARY,
    borderRadius: SUITE_RADIUS_BUTTON,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: SUITE_FONT_UI,
  };
}

function moveButtonStyle(): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
    width: "100%",
    textAlign: "left",
    padding: "14px 14px",
    borderRadius: SUITE_RADIUS_BUTTON,
    border: `1px solid ${SUITE_BORDER}`,
    background: "#FAFBFC",
    cursor: "pointer",
    fontFamily: SUITE_FONT_UI,
  };
}

/**
 * Blueprint+ Guided hub — role + this week’s moves before the full report scroll.
 */
export default function BlueprintPlusStartHereHub({
  businessName,
  role,
  moves,
  onRoleChange,
  onSelectMove,
  onOpenReference,
}: Props) {
  const weekMoves = moves.slice(0, 3);
  const laterMoves = moves.slice(3);

  return (
    <section style={CARD} aria-labelledby="bp-plus-start-here-title">
      <p
        style={{
          margin: 0,
          fontSize: 14, fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: SUITE_ACCENT_BRIGHT,
        }}
      >
        Start here
      </p>
      <h2
        id="bp-plus-start-here-title"
        style={{
          margin: "8px 0 0",
          fontSize: 22,
          fontWeight: 800,
          color: SUITE_NAVY,
          lineHeight: 1.25,
        }}
      >
        {businessName ? `${businessName}: your week-one path` : "Your week-one path"}
      </h2>
      <p style={{ margin: "8px 0 0", fontSize: 15, color: SUITE_MUTED, lineHeight: 1.55, maxWidth: 640 }}>
        Blueprint+ is a full brand system. Guided mode shows what to do first. Switch to Reference when you
        need the complete library.
      </p>

      <div
        role="group"
        aria-label="Your role"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}
      >
        {ROLES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={role === item.id}
            onClick={() => onRoleChange(item.id)}
            style={rolePill(role === item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ol
        style={{
          listStyle: "none",
          margin: "18px 0 0",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {weekMoves.map((move, index) => (
          <li key={move.id}>
            <button type="button" onClick={() => onSelectMove(move)} style={moveButtonStyle()}>
              <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: SUITE_ACCENT_BRIGHT }}>
                {index + 1}. {move.title}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: SUITE_TEXT_PRIMARY, lineHeight: 1.45 }}>
                {move.detail}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: SUITE_NAVY }}>Open →</span>
            </button>
          </li>
        ))}
      </ol>

      {laterMoves.length > 0 ? (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: SUITE_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Then lock ownership
          </p>
          {laterMoves.map((move) => (
            <button key={move.id} type="button" onClick={() => onSelectMove(move)} style={moveButtonStyle()}>
              <span style={{ fontSize: 13, fontWeight: 700, color: SUITE_NAVY }}>{move.title}</span>
              <span style={{ fontSize: 13, color: SUITE_MUTED, lineHeight: 1.45 }}>{move.detail}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: `1px solid ${SUITE_BORDER}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, color: SUITE_MUTED, lineHeight: 1.45, maxWidth: 480 }}>
          Need every matrix, scorecard, and export? Reference mode keeps the full Blueprint+ library.
        </p>
        <button
          type="button"
          onClick={onOpenReference}
          style={{
            border: "none",
            borderRadius: SUITE_RADIUS_BUTTON,
            padding: "10px 14px",
            background: SUITE_ACCENT_BRIGHT,
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: SUITE_FONT_UI,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = SUITE_ACCENT_HOVER;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = SUITE_ACCENT_BRIGHT;
          }}
        >
          Browse full library
        </button>
      </div>
    </section>
  );
}
