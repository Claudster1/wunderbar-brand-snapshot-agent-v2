"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section id is closest to the viewport “reading line” (below the sticky header)
 * so the left nav / chips can show an active state while the user scrolls.
 */
export function useActiveSectionInView(sectionIdsKey: string): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sectionIds = sectionIdsKey.split("\0").filter(Boolean);
    if (!sectionIds.length) return undefined;

    /** Align with scrollMarginTop on section blocks (~120) + small offset. */
    const SECTION_ANCHOR_PX = 142;

    function compute() {
      let bestId: string | null = null;
      let bestScore = -Infinity;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 56) continue;
        if (rect.top > window.innerHeight - 32) continue;
        const score = -Math.abs(rect.top - SECTION_ANCHOR_PX);
        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      }
      if (bestId) {
        setActiveId((prev) => (prev === bestId ? prev : bestId));
      }
    }

    let scrollRaf = 0;
    const scheduleCompute = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        compute();
      });
    };

    compute();
    const t = window.setTimeout(compute, 120);
    window.addEventListener("scroll", scheduleCompute, { passive: true });
    window.addEventListener("resize", scheduleCompute);
    return () => {
      clearTimeout(t);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      window.removeEventListener("scroll", scheduleCompute);
      window.removeEventListener("resize", scheduleCompute);
    };
  }, [sectionIdsKey]);

  return activeId;
}
