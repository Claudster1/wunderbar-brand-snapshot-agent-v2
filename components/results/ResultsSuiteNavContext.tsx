"use client";

import { createContext, useContext } from "react";
import type { ResultsTab } from "@/components/results/tabConfig";

export type ResultsSuiteNav = {
  openTab: (tab: ResultsTab) => void;
  /**
   * Switch to Foundation and scroll to a section whose root element uses this DOM `id`
   * (e.g. `archetype-voice`). Omitted when the current product tier does not include Foundation.
   */
  openFoundationSection?: (sectionDomId: string) => void;
};

export const ResultsSuiteNavContext = createContext<ResultsSuiteNav | null>(null);

export function useResultsSuiteNav(): ResultsSuiteNav | null {
  return useContext(ResultsSuiteNavContext);
}
