import { afterEach, describe, expect, it } from "vitest";
import {
  FEATURES,
  isFeatureEnabled,
  AI_INTAKE_UNAVAILABLE,
} from "@/lib/featureFlags";

describe("feature flags", () => {
  afterEach(() => {
    delete process.env.FEATURE_FLAG_AI_INTAKE;
  });

  it("defaults AI_INTAKE to enabled", () => {
    expect(isFeatureEnabled(FEATURES.AI_INTAKE)).toBe(true);
  });

  it("disables AI_INTAKE via env", () => {
    process.env.FEATURE_FLAG_AI_INTAKE = "false";
    expect(isFeatureEnabled(FEATURES.AI_INTAKE)).toBe(false);
  });

  it("exposes a stable unavailable payload", () => {
    expect(AI_INTAKE_UNAVAILABLE.code).toBe("ai_intake_disabled");
    expect(AI_INTAKE_UNAVAILABLE.error.length).toBeGreaterThan(20);
  });
});
