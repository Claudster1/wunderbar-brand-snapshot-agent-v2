// components/ui/useRefinementModal.ts
// Hook for managing refinement modal state

import { useState } from "react";
import { PillarKey } from "@/lib/pillars/pillarCopy";

export function useRefinementModal(reportId: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<PillarKey | null>(null);

  const openRefinementModal = (pillar: PillarKey) => {
    setSelectedPillar(pillar);
    setIsOpen(true);
  };

  const closeRefinementModal = () => {
    setIsOpen(false);
    setSelectedPillar(null);
  };

  return {
    isOpen,
    selectedPillar,
    openRefinementModal,
    closeRefinementModal,
  };
}
