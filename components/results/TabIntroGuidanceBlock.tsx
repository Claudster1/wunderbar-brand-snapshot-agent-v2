"use client";

import { useId, useState } from "react";
import type { CSSProperties } from "react";
import type { SuiteTabIntro } from "@/lib/copy/resultsSuiteGuidance";
import { uiAbbreviationNote } from "@/lib/copy/abbreviationPolicy";
import { TooltipIcon } from "@/components/ui/Tooltip";

/** Tab hero guidance plus a visible glossary (spell-outs + definitions). */
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
        <div
          style={{
            ...guidanceStyle,
            marginTop: 12,
            marginBottom: 0,
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid #D6DFE8",
            background: "#F8FBFF",
          }}
        >
          <button
            type="button"
            aria-expanded={open}
            aria-controls={glossaryId}
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              margin: 0,
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
            <span>
              <span style={{ fontWeight: 800, color: "#021859", fontSize: 13, letterSpacing: "0.04em" }}>
                Glossary
              </span>
              <span style={{ display: "block", marginTop: 4, fontSize: 12, color: "#5A6B7E", lineHeight: 1.45, fontWeight: 500 }}>
                {uiAbbreviationNote}
              </span>
            </span>
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 800,
                color: "#07B0F2",
                letterSpacing: "0.04em",
              }}
            >
              {open ? "Hide" : "Show"}
            </span>
          </button>

          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              lineHeight: 1.55,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              columnGap: 14,
              rowGap: 8,
            }}
          >
            <span style={{ fontWeight: 700, marginRight: 2, color: "#021859" }}>Quick terms</span>
            {terms.map((g) => (
              <span key={g.term} className="inline-flex items-center gap-1.5">
                <span style={{ fontWeight: 600, color: "#021859" }}>{g.term}</span>
                <TooltipIcon side="bottom" content={g.definition} />
              </span>
            ))}
          </div>

          {open ? (
            <dl
              id={glossaryId}
              style={{
                margin: "14px 0 0",
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
          ) : null}
        </div>
      ) : null}
    </>
  );
}
