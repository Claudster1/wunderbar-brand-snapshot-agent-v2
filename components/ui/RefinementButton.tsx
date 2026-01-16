// components/ui/RefinementButton.tsx
// Example component showing how to use the refinement modal

"use client";

import { PillarKey } from "@/lib/pillars/pillarCopy";
import { RefinementModal } from "./RefinementModal";
import { useRefinementModal } from "./useRefinementModal";

interface RefinementButtonProps {
  pillar: PillarKey;
  reportId: string;
}

export function RefinementButton({ pillar, reportId }: RefinementButtonProps) {
  const { isOpen, selectedPillar, openRefinementModal, closeRefinementModal } =
    useRefinementModal(reportId);

  return (
    <>
      <button
        onClick={() => openRefinementModal(pillar)}
        className="text-sm underline text-brand-blue"
      >
        Request refinement for this pillar
      </button>

      {selectedPillar && (
        <RefinementModal
          isOpen={isOpen}
          onClose={closeRefinementModal}
          pillar={selectedPillar}
          reportId={reportId}
        />
      )}
    </>
  );
}
