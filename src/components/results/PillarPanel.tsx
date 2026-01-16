// components/results/PillarPanel.tsx

interface Props {
  pillar: string;
  score: number;
  insight: string;
  expanded: boolean;
  stage: "early" | "scaling" | "growing";
  businessName: string;
}

export function PillarPanel({
  pillar,
  score,
  insight,
  expanded,
  stage,
  businessName,
}: Props) {
  return (
    <div className={`border rounded-xl p-6 ${expanded ? "bg-white shadow-lg" : "bg-gray-50"}`}>
      <header className="flex justify-between items-center">
        <h3 className="text-xl font-semibold capitalize">{pillar}</h3>
        <span className="text-sm font-medium">{score}/20</span>
      </header>

      {expanded ? (
        <div className="mt-4 space-y-3">
          <p className="text-[15px] leading-relaxed">
            {insight}
          </p>

          <p className="text-sm text-gray-600">
            For {businessName}, this matters most at your current stage
            {stage === "early" && " because early clarity compounds fastest."}
            {stage === "scaling" && " because inconsistencies now slow growth."}
            {stage === "growing" && " because alignment becomes critical as you scale."}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">
          Why this matters: strengthening this pillar improves overall brand alignment.
        </p>
      )}
    </div>
  );
}
