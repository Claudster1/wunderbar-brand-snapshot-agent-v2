"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Invisible component that captures first-visit attribution data.
 * Detects referrer, UTM params, and AI sources on the initial page load.
 * Drop this once in the root layout — it runs once per visitor.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
