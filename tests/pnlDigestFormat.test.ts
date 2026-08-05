import { describe, expect, it } from "vitest";
import { formatPnLSlackDigest, type PnLSummary } from "@/lib/admin/computePnL";

const sample: PnLSummary = {
  days: 7,
  since: "2026-01-01T00:00:00.000Z",
  migrationRequired: false,
  overview: {
    revenueUsd: 497,
    aiCostUsd: 12.5,
    grossAfterAiUsd: 484.5,
    aiCalls: 40,
    inputTokens: 1000,
    outputTokens: 2000,
    freeSnapshotCompletions: 10,
    paidConversions: 1,
    conversionRate: 0.1,
    aiCostPerFreeCompletionUsd: 1.25,
    aiCostPerPaidConversionUsd: 12.5,
  },
  byProduct: [{ sku: "SNAPSHOT_PLUS", revenueUsd: 497, count: 1, avgUsd: 497 }],
  byProvider: [{ key: "openai", costUsd: 12.5, calls: 40, tokens: 3000 }],
  byUseCase: [],
  byModel: [],
};

describe("formatPnLSlackDigest", () => {
  it("includes revenue and admin link", () => {
    const { text, blocks } = formatPnLSlackDigest(sample, "https://app.wunderbrand.ai");
    expect(text).toContain("Revenue");
    expect(text).toContain("SNAPSHOT_PLUS");
    expect(JSON.stringify(blocks)).toContain("/admin/pnl");
  });
});
