import { describe, expect, it } from "vitest";
import {
  isConsumerFacingBusinessType,
  resultsCustomerNoun,
  resultsRevenueProxyStatement,
  resultsSpendAllocationHint,
  resultsSpendRiskLabel,
} from "@/lib/results/audienceFacingCopy";
import { getPillarOpportunity, getPillarOpportunityExpanded } from "@/src/lib/pillars/pillarReportCopy";
import { getQaSeedTurns } from "@/lib/intake/qaSeedTranscripts";
import { toneFromMessages } from "@/lib/intake/toneProfile";
import { scoringEnginePrompt } from "@/src/prompts/scoringEnginePrompt";

describe("audienceFacingCopy / results B2C language", () => {
  it("treats local and retail types as consumer-facing", () => {
    expect(isConsumerFacingBusinessType("local_service")).toBe(true);
    expect(isConsumerFacingBusinessType("retail")).toBe(true);
    expect(isConsumerFacingBusinessType("service_b2b")).toBe(false);
    expect(resultsCustomerNoun("local_service")).toBe("clients");
    expect(resultsCustomerNoun("retail")).toBe("guests");
  });

  it("uses booking language for salon spend/revenue proxies", () => {
    expect(resultsSpendRiskLabel("conversion", "local_service")).toMatch(/booking|purchase/i);
    expect(resultsRevenueProxyStatement("positioning", "local_service")).not.toMatch(/sales cycles/i);
    expect(resultsRevenueProxyStatement("positioning", "local_service")).toMatch(/books or buys|clients/i);
    expect(resultsRevenueProxyStatement("positioning", "service_b2b")).toMatch(/buying cycles|close/i);
  });

  it("differentiates fashion vs salon vs consumer-finance vertical copy", () => {
    expect(
      resultsSpendRiskLabel("conversion", "retail", "Fashion / apparel / boutique"),
    ).toMatch(/browse|purchase/i);
    expect(
      resultsSpendRiskLabel("conversion", "local_service", "Hair / beauty / spa"),
    ).toMatch(/booking|purchase/i);
    expect(
      resultsSpendRiskLabel("conversion", "service_b2c", "Consumer financial / advisory"),
    ).toMatch(/consult/i);

    expect(
      resultsSpendAllocationHint("retail", "Fashion / apparel / boutique"),
    ).toMatch(/product storytelling|purchase-path|fit/i);
    expect(
      resultsSpendAllocationHint("local_service", "Hair / beauty / spa"),
    ).toMatch(/booking|Instagram|Google/i);
    expect(
      resultsSpendAllocationHint("service_b2c", "Consumer financial / advisory"),
    ).toMatch(/consult|credential/i);

    expect(getPillarOpportunity("conversion", "retail", "Fashion / apparel / boutique")).toMatch(
      /shop|try-on|purchase/i,
    );
    expect(getPillarOpportunity("conversion", "local_service", "Hair / beauty / spa")).toMatch(
      /book|call|visit|buy/i,
    );
    expect(
      getPillarOpportunity("conversion", "service_b2c", "Consumer financial / advisory"),
    ).toMatch(/consult/i);
    expect(
      getPillarOpportunityExpanded("credibility", "retail", "Fashion / apparel / boutique"),
    ).toMatch(/PDP|cart|UGC|fit/i);
  });

  it("serves consumer pillar opportunity copy for local businesses", () => {
    expect(getPillarOpportunity("credibility", "local_service")).toMatch(/reviews|booking/i);
    expect(getPillarOpportunity("credibility", "local_service")).not.toMatch(/prospects/i);
    expect(getPillarOpportunityExpanded("positioning", "retail")).toMatch(/Google listing|Instagram/i);
    expect(getPillarOpportunityExpanded("positioning", "service_b2b")).toMatch(/homepage hero/i);
  });

  it("locks scoring engine against B2C prospect jargon", () => {
    expect(scoringEnginePrompt).toContain("AUDIENCE LANGUAGE LOCK");
    expect(scoringEnginePrompt).toContain("NEVER default to:");
    expect(scoringEnginePrompt).toContain("prospects");
  });
});

describe("salon / restaurant / fashion / finance QA seeds → tone", () => {
  it("salon seed resolves to local service consumer tone", () => {
    const turns = getQaSeedTurns("near-end-salon");
    const messages = turns.map((t) => ({ role: t.role, content: t.text }));
    expect(toneFromMessages(messages)).toBe("b2c_local_service");
    const joined = turns.map((t) => t.text).join("\n");
    expect(joined).not.toMatch(/LinkedIn POV|prospects choose|ship a feature/i);
  });

  it("restaurant seed resolves to hospitality tone", () => {
    const turns = getQaSeedTurns("near-end-restaurant");
    const messages = turns.map((t) => ({ role: t.role, content: t.text }));
    expect(toneFromMessages(messages)).toBe("b2c_hospitality");
    const joined = turns.map((t) => t.text).join("\n");
    expect(joined).toMatch(/brand-new guest|menu or experience/i);
    expect(joined).not.toMatch(/LinkedIn POV|prospects choose/i);
  });

  it("fashion seed resolves to retail tone with shopper language", () => {
    const turns = getQaSeedTurns("near-end-fashion");
    const messages = turns.map((t) => ({ role: t.role, content: t.text }));
    expect(toneFromMessages(messages)).toBe("b2c_retail");
    const joined = turns.map((t) => t.text).join("\n");
    expect(joined).toMatch(/Fashion \/ apparel|Thread & Tide|shoppers/i);
    expect(joined).not.toMatch(/book a consult|LinkedIn POV/i);
  });

  it("consumer-finance seed resolves to professional consult tone", () => {
    const turns = getQaSeedTurns("near-end-consumer-finance");
    const messages = turns.map((t) => ({ role: t.role, content: t.text }));
    expect(toneFromMessages(messages)).toBe("b2c_professional");
    const joined = turns.map((t) => t.text).join("\n");
    expect(joined).toMatch(/consult|Consumer financial|Northshore Wealth/i);
    expect(joined).not.toMatch(/Instagram, Google, TikTok/i);
    expect(joined).not.toMatch(/LinkedIn POV|prospects choose/i);
  });
});
