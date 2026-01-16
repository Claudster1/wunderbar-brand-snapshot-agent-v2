// components/pillars/PillarPanel.tsx

import { useState } from "react";
import { PillarBadge } from "@/components/pillars/PillarBadge";

type Props = {
  pillar: string;
  score: number;
  defaultExpanded: boolean;
  emphasis: "primary" | "secondary";
  onToggle?: () => void;
};

export function PillarPanel({
  pillar,
  score,
  defaultExpanded,
  emphasis,
  onToggle,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggle?.();
  };

  return (
    <div
      className={`pillar-panel rounded-xl border p-6 transition ${
        emphasis === "primary"
          ? "border-brand-blue bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <header
        className="flex items-center justify-between cursor-pointer"
        onClick={handleToggle}
      >
        <div>
          <h3 className="capitalize text-lg font-semibold text-brand-navy">
            {pillar}
          </h3>
          {emphasis === "primary" && (
            <div className="mt-1">
              <PillarBadge label="Primary Focus Area" />
            </div>
          )}
        </div>

        <strong className="text-brand-blue">{score}/20</strong>
      </header>

      {isExpanded && (
        <div className="pillar-details mt-4">
          {/* insights + recommendations */}
        </div>
      )}
    </div>
  );
}
