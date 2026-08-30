"use client";

import { useId, useState } from "react";
import type { CSSProperties } from "react";
import type { SuiteTabIntro } from "@/lib/copy/resultsSuiteGuidance";
import { uiAbbreviationNote } from "@/lib/copy/abbreviationPolicy";

/**
 * Tab hero guidance with an opt-in glossary.
 * Collapsed by default: a single text control so readers who know the terms
 * keep an unbroken path from guidance → section nav.
 */
export function TabIntroGuidanceBlock({
  intro,
  guidanceStyle,
}: {
  intro: SuiteTabIntro;
  guidanceStyle: CSSProperties;
}) {
  const glossaryId = useId();
  const [open, setOpen] = useState(false);
  const terms = intro.glossary ?? [];

  return (
    <>
      <p style={guidanceStyle}>{intro.guidance}</p>
      {terms.length > 0 ? (
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={glossaryId}
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              margin: 0,
              padding: "2px 0",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12.5,
              fontWeight: 600,
              color: "#5A6B7E",
              lineHeight: 1.4,
            }}
          >
            <span aria-hidden style={{ color: "#07B0F2", fontSize: 11, fontWeight: 800 }}>
              {open ? "▾" : "▸"}
            </span>
            <span>
              {open ? "Hide terms & abbreviations" : "Terms & abbreviations"}
              <span style={{ fontWeight: 500, color: "#8A97A8" }}>
                {" "}
                ({terms.length})
              </span>
            </span>
          </button>

          {open ? (
            <div
              id={glossaryId}
              style={{
                marginTop: 10,
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid #D6DFE8",
                background: "#F8FBFF",
              }}
            >
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: "#5A6B7E",
                  fontWeight: 500,
                }}
              >
                {uiAbbreviationNote}
              </p>
              <dl
                style={{
                  margin: 0,
                  padding: 0,
                  display: "grid",
                  gap: 10,
                }}
              >
                {terms.map((g) => (
                  <div key={`full-${g.term}`} style={{ margin: 0 }}>
                    <dt
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: "0.03em",
                        color: "#021859",
                      }}
                    >
                      {g.term}
                    </dt>
                    <dd
                      style={{
                        margin: "4px 0 0",
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: "#2D3A4A",
                      }}
                    >
                      {g.definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
