"use client";

import {
  SUITE_ACCENT_BRIGHT,
  SUITE_FONT_UI,
  SUITE_INSIGHT_CARD_BASE,
  SUITE_INSIGHT_CARD_RAIL_LEFT,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";

type Item = { rank?: number; title?: string; pillar?: string };

type Props = {
  items: Item[];
};

/**
 * Ordered strategic priorities — vertical sequence (timeline), not progress / completion.
 */
export function StrategicPrioritiesBarChart({ items }: Props) {
  const sorted = [...items]
    .filter((x) => x.title && String(x.title).trim())
    .sort((a, b) => (Number(a.rank) || 99) - (Number(b.rank) || 99))
    .slice(0, 8);
  if (sorted.length === 0) return null;

  const n = sorted.length;

  return (
    <div
      className="mb-6"
      style={{
        ...SUITE_INSIGHT_CARD_BASE,
        ...SUITE_INSIGHT_CARD_RAIL_LEFT,
        padding: "20px 22px 22px",
        fontFamily: SUITE_FONT_UI,
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          margin: 0,
          paddingBottom: 14,
          marginBottom: 6,
          borderBottom: "1px solid rgba(7, 176, 242, 0.14)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.06em",
          color: SUITE_NAVY,
        }}
      >
        Priority order
      </p>
      <p style={{ margin: "10px 0 0", fontSize: 12, lineHeight: 1.5, color: SUITE_MUTED }}>
        Numbered steps show <strong style={{ color: SUITE_NAVY, fontWeight: 700 }}>sequence</strong>, not how “done” each
        item is—work #1 before you overload the team on #2 and below.
      </p>
      <ul className="mt-6 space-y-0 p-0 list-none m-0" aria-label="Strategic priorities in recommended order">
        {sorted.map((row, i) => {
          const r = Number(row.rank) || i + 1;
          const isLast = i === n - 1;
          return (
            <li
              key={`${r}-${row.title?.slice(0, 24)}`}
              className="flex gap-4"
              style={{ alignItems: "stretch" }}
            >
              <div
                className="flex flex-col items-center"
                style={{ width: 40, flexShrink: 0, paddingTop: 4 }}
                aria-hidden
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "999px",
                    background: SUITE_ACCENT_BRIGHT,
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: SUITE_FONT_UI,
                    boxShadow: "0 2px 8px rgba(7, 176, 242, 0.35)",
                  }}
                >
                  {r}
                </div>
                {!isLast ? (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 20,
                      marginTop: 6,
                      marginBottom: 4,
                      borderRadius: 1,
                      background: "linear-gradient(180deg, rgba(7, 176, 242, 0.45) 0%, rgba(7, 176, 242, 0.12) 100%)",
                    }}
                  />
                ) : null}
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 2 : 20, paddingRight: 4 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: 1.5,
                    color: SUITE_NAVY,
                  }}
                >
                  {row.title}
                </p>
                {row.pillar ? (
                  <p style={{ margin: "6px 0 0", fontSize: 12, lineHeight: 1.45, color: SUITE_MUTED }}>
                    Pillar: <span style={{ color: SUITE_NAVY, fontWeight: 600 }}>{row.pillar}</span>
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
