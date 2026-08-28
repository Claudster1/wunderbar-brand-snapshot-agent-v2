import { describe, expect, it } from "vitest";
import {
  extractBrandArchetypeSystem,
  fallbackCombinedImplementation,
} from "@/lib/archetype/brandArchetypeSystem";

describe("brandArchetypeSystem", () => {
  it("extracts combinedImplementation from report JSON", () => {
    const system = extractBrandArchetypeSystem({
      brandArchetypeSystem: {
        primary: { name: "Sage", whenAligned: "Teaches", riskIfMisused: "Slow", languageTone: "Clear", behaviorGuide: "Lead with diagnosis" },
        secondary: { name: "Caregiver", whenAligned: "Cares", riskIfMisused: "Soft", languageTone: "Warm", behaviorGuide: "Nurture" },
        howTheyWorkTogether: "Sage first, Caregiver later.",
        combinedImplementation: {
          oneLiner: "For Acme: Sage owns hero; Caregiver owns nurture.",
          leadWithPrimary: ["Homepage hero"],
          leanOnSecondary: ["Welcome email"],
          neverMix: ["Don't soft-pedal the hero"],
          weekOneMove: "Rewrite hero + nurture subject.",
        },
      },
    });
    expect(system?.primary.name).toBe("Sage");
    expect(system?.combinedImplementation?.oneLiner).toContain("Sage owns hero");
    expect(system?.combinedImplementation?.leadWithPrimary).toEqual(["Homepage hero"]);
  });

  it("builds a fallback combined plan when only howTheyWorkTogether exists", () => {
    const system = extractBrandArchetypeSystem({
      brandArchetypeSystem: {
        primary: { name: "Hero", whenAligned: "", riskIfMisused: "", languageTone: "", behaviorGuide: "" },
        secondary: { name: "Creator", whenAligned: "", riskIfMisused: "", languageTone: "", behaviorGuide: "" },
        howTheyWorkTogether: "Hero claims the category; Creator shapes content craft.",
      },
    });
    expect(system).not.toBeNull();
    const combined = fallbackCombinedImplementation(system!, "Acme Co");
    expect(combined.oneLiner).toContain("Hero claims the category");
    expect(combined.leadWithPrimary.length).toBeGreaterThan(0);
    expect(combined.leanOnSecondary.length).toBeGreaterThan(0);
    expect(combined.weekOneMove).toMatch(/Hero|Creator/);
  });
});
