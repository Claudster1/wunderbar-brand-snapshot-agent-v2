"use client";

import type { CSSProperties } from "react";
import type { SuiteTabIntro } from "@/lib/copy/resultsSuiteGuidance";
import { TooltipIcon } from "@/components/ui/Tooltip";

/** Tab hero guidance plus optional glossary row (info icons). */
export function TabIntroGuidanceBlock({
  intro,
  guidanceStyle,
}: {
  intro: SuiteTabIntro;
  guidanceStyle: CSSProperties;
}) {
  return (
    <>
      <p style={guidanceStyle}>{intro.guidance}</p>
      {intro.glossary && intro.glossary.length > 0 ? (
        <div
          style={{
            ...guidanceStyle,
            marginTop: 12,
            marginBottom: 0,
            fontSize: 13,
            lineHeight: 1.55,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: 14,
            rowGap: 8,
          }}
        >
          <span style={{ fontWeight: 700, marginRight: 2 }}>Quick terms</span>
          {intro.glossary.map((g) => (
            <span key={g.term} className="inline-flex items-center gap-1.5">
              <span style={{ fontWeight: 600 }}>{g.term}</span>
              <TooltipIcon side="bottom" content={g.definition} />
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
}
