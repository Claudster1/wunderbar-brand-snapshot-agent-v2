import { describe, expect, it } from "vitest";
import {
  mapRolePhrase,
  normalizeUserRoleContext,
} from "@/src/lib/activeCampaign/mapRolePhrase";

describe("normalizeUserRoleContext", () => {
  it("passes through enum values", () => {
    expect(normalizeUserRoleContext("marketing_lead")).toBe("marketing_lead");
    expect(normalizeUserRoleContext("founder")).toBe("founder");
  });

  it("maps in-house marketing chip text to marketing_lead", () => {
    expect(normalizeUserRoleContext("In-house marketing / brand")).toBe("marketing_lead");
  });

  it("maps founder chip text", () => {
    expect(normalizeUserRoleContext("I'm a founder / co-founder")).toBe("founder");
  });
});

describe("mapRolePhrase", () => {
  it("returns marketing-lead prose for enum and chip text", () => {
    expect(mapRolePhrase("marketing_lead")).toMatch(/brand clarity/i);
    expect(mapRolePhrase("In-house marketing / brand")).toMatch(/brand clarity/i);
  });
});
