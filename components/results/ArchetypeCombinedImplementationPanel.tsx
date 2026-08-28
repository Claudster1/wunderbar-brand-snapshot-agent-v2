"use client";

import type { ArchetypeCombinedImplementation } from "@/lib/archetype/brandArchetypeSystem";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_MD,
  SUITE_SECTION_ACTIVE_BG,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

type Props = {
  brandName: string;
  primaryName: string;
  secondaryName?: string | null;
  howTheyWorkTogether?: string | null;
  combined: ArchetypeCombinedImplementation;
};

function ListBlock({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  if (items.length === 0) return null;
  return (
    <div
      style={{
        border: `1px solid ${SUITE_BORDER}`,
        borderRadius: SUITE_RADIUS_MD,
        background: "#FFFFFF",
        padding: "14px 16px",
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: accent,
          fontFamily: SUITE_FONT_UI,
        }}
      >
        {title}
      </p>
      <ul style={{ margin: 0, padding: "0 0 0 18px", display: "grid", gap: 8 }}>
        {items.map((item) => (
          <li
            key={item}
            style={{
              fontSize: 14,
              lineHeight: 1.55,
              color: SUITE_TEXT_PRIMARY,
              fontFamily: SUITE_FONT_UI,
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Shows how primary + secondary archetypes work together for this brand —
 * implementation split, not a second definition of each archetype.
 */
export default function ArchetypeCombinedImplementationPanel({
  brandName,
  primaryName,
  secondaryName,
  howTheyWorkTogether,
  combined,
}: Props) {
  const pairLabel = secondaryName ? `${primaryName} + ${secondaryName}` : primaryName;

  return (
    <section
      style={{
        marginTop: 12,
        marginBottom: 12,
        padding: "18px 20px",
        border: `1px solid ${SUITE_BORDER}`,
        borderRadius: SUITE_RADIUS_MD,
        background: `linear-gradient(165deg, ${SUITE_SECTION_ACTIVE_BG} 0%, #FFFFFF 55%)`,
        boxShadow: SUITE_SHADOW_CARD,
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: SUITE_ACCENT_BRIGHT,
        }}
      >
        Together for {brandName}
      </p>
      <h3
        style={{
          margin: "0 0 10px",
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: SUITE_NAVY,
        }}
      >
        How {pairLabel} shows up in the business
      </h3>
      {(howTheyWorkTogether || combined.oneLiner) && (
        <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.6, color: SUITE_TEXT_PRIMARY }}>
          {combined.oneLiner || howTheyWorkTogether}
        </p>
      )}
      {howTheyWorkTogether && combined.oneLiner && howTheyWorkTogether !== combined.oneLiner ? (
        <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.55, color: SUITE_MUTED }}>
          {howTheyWorkTogether}
        </p>
      ) : null}

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <ListBlock
          title={`Lead with ${primaryName}`}
          items={combined.leadWithPrimary}
          accent={SUITE_ACCENT_BRIGHT}
        />
        {secondaryName ? (
          <ListBlock
            title={`Lean on ${secondaryName}`}
            items={combined.leanOnSecondary}
            accent="#0D9488"
          />
        ) : null}
        <ListBlock title="Don't mix in the same beat" items={combined.neverMix} accent="#D97706" />
      </div>

      {combined.weekOneMove ? (
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            borderRadius: SUITE_RADIUS_MD,
            background: "#FFFFFF",
            border: `1px solid ${SUITE_BORDER}`,
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: SUITE_ACCENT_BRIGHT,
            }}
          >
            Week-one move
          </p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: SUITE_TEXT_PRIMARY }}>
            {combined.weekOneMove}
          </p>
        </div>
      ) : null}
    </section>
  );
}
