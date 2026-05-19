import { describe, expect, it } from "vitest";
import {
  ACTIVATION_PLAN_SECTION_IDS,
  STRATEGY_SECTION_IDS,
  TAB_DEFINITIONS,
  filterActivationPlanSections,
  filterStrategySections,
  getAvailableTabs,
  isTabAvailable,
  type ProductTier,
} from "@/components/results/tabConfig";
import { TIER_DELIVERABLES } from "@/lib/tierDeliverables";
import {
  resolveReportTabTier,
  resolveStoredProductTier,
} from "@/lib/results/resolveReportProductTier";

const TIERS: ProductTier[] = ["snapshot", "snapshot-plus", "blueprint", "blueprint-plus"];

describe("tier report gating", () => {
  it("exposes only tabs allowed for each tier", () => {
    expect(getAvailableTabs("snapshot").map((t) => t.id)).toEqual(["results", "downloads"]);
    expect(getAvailableTabs("snapshot-plus").map((t) => t.id)).toEqual([
      "results",
      "foundation",
      "strategy",
      "activation",
      "workbook",
      "downloads",
    ]);
    expect(getAvailableTabs("blueprint").map((t) => t.id)).toContain("standards");
    expect(getAvailableTabs("blueprint-plus").map((t) => t.id)).toContain("standards");
  });

  it("blocks deep-linked tabs above the report tier", () => {
    const foundation = TAB_DEFINITIONS.find((t) => t.id === "foundation")!;
    expect(isTabAvailable(foundation, "snapshot")).toBe(false);
    expect(isTabAvailable(foundation, "snapshot-plus")).toBe(true);
  });

  it("filters strategy sections per tier", () => {
    const all = STRATEGY_SECTION_IDS.map((id) => ({ id }));
    for (const tier of TIERS) {
      const visible = filterStrategySections(tier, all).map((s) => s.id);
      expect(visible.length).toBeGreaterThan(0);
      if (tier === "snapshot") {
        expect(visible).not.toContain("persona-atlas");
        expect(visible).not.toContain("competitive-matrix");
      }
      if (tier === "blueprint" || tier === "blueprint-plus") {
        expect(visible).toContain("persona-atlas");
        expect(visible).toContain("competitive-matrix");
      }
    }
  });

  it("filters activation sections to match TIER_DELIVERABLES", () => {
    const all = ACTIVATION_PLAN_SECTION_IDS.map((id) => ({ id }));
    for (const tier of TIERS) {
      const visible = new Set(filterActivationPlanSections(tier, all).map((s) => s.id));
      const expected = new Set(TIER_DELIVERABLES[tier].activationSections);
      expect(visible).toEqual(expected);
    }
  });

  it("resolves report tier from persisted metadata only", () => {
    const report = {
      product_tier: "snapshot",
      user: { has_blueprint_plus: true },
      full_report: { _meta: { tier: "snapshot_plus" } },
    };
    expect(resolveStoredProductTier(report)).toBe("snapshot_plus");
    expect(resolveReportTabTier(report)).toBe("snapshot-plus");
  });

  it("defaults missing metadata to snapshot", () => {
    expect(resolveStoredProductTier({ full_report: {} })).toBe("snapshot");
    expect(resolveReportTabTier({ full_report: {} })).toBe("snapshot");
  });
});
