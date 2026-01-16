// app/results/components/ResultsPillarPanel.tsx

import React from "react";

type Props = {
  pillar: string;
  state: "expanded" | "collapsed" | "minimal";
  insight: string;
  whyItMatters: string;
  children?: React.ReactNode;
};

export function ResultsPillarPanel({
  pillar,
  state,
  insight,
  whyItMatters,
  children,
}: Props) {
  return (
    <section className={`pillar pillar-${state}`}>
      <h3>{pillar}</h3>

      {state === "expanded" && (
        <>
          <p>{insight}</p>
          {children}
        </>
      )}

      {state === "collapsed" && (
        <>
          <p>{whyItMatters}</p>
          <button>View details</button>
        </>
      )}

      {state === "minimal" && <p>{whyItMatters}</p>}
    </section>
  );
}
