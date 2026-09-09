import { describe, expect, it } from "vitest";
import {
  isConsumerFacingBusinessType,
  resultsCustomerNoun,
  resultsRevenueProxyStatement,
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

describe("salon / restaurant QA seeds → tone", () => {
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
});
