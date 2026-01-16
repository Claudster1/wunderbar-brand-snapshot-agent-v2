// src/components/ContextCoverageMeter.tsx

interface Props {
  coveragePercent: number;
  confidenceLevel: "high" | "medium" | "low";
}

export function ContextCoverageMeter({
  coveragePercent,
  confidenceLevel,
}: Props) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">
          Context Coverage
        </span>
        <span className="text-sm text-gray-600">
          {coveragePercent}%
        </span>
      </div>

      <div className="h-2 bg-gray-200 rounded">
        <div
          className={`h-2 rounded ${
            confidenceLevel === "high"
              ? "bg-green-500"
              : confidenceLevel === "medium"
              ? "bg-yellow-500"
              : "bg-gray-400"
          }`}
          style={{ width: `${coveragePercent}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-gray-600">
        {confidenceLevel === "high" &&
          "Strong context — insights are highly specific."}
        {confidenceLevel === "medium" &&
          "Good context — deeper clarity is possible."}
        {confidenceLevel === "low" &&
          "Limited context — insights are directional."}
      </p>
    </div>
  );
}
