import { describe, expect, it } from "vitest";
import { buildActivationPlanSectionsList } from "@/lib/activation/activationPlanModel";
import { buildLockedReportAudienceContext } from "@/lib/results/reportAudienceContext";
import {
  sanitizeConsumerReportContent,
  textHasB2bAudienceDrift,
} from "@/lib/results/sanitizeConsumerReportLanguage";
import { buildStrategyNavMenuItems } from "@/lib/strategy/strategyNavMenu";
import { audienceLanguageLockFragment } from "@/src/prompts/fragments/audienceLanguageLock";

const BANNED =
  /\b(decision-makers?|prospects|pipeline|ICP|SQL|ABM)\b|scope fit|LinkedIn-first/i;

const fixtures = [
  {
    name: "salon",
    vertical: "beauty_wellness",
    who: /clients/i,
    cta: /Book an appointment/i,
    diagnostic: {
      companyName: "Studio North Color",
      industry: "Hair / beauty / spa",
      businessType: "local_service",
      audienceType: "B2C",
      targetAudience: "Local clients looking for color and cuts",
      primaryPillar: "Visibility",
      primaryWeakPillar: "Visibility",
      strategicPriorities: ["More bookings", "Stronger reviews"],
      channelPlans: {},
    },
  },
  {
    name: "HVAC",
    vertical: "home_services",
    who: /homeowners/i,
    cta: /estimate|call/i,
    diagnostic: {
      companyName: "Valley Air Pros",
      industry: "HVAC and plumbing",
      businessType: "local_service",
      audienceType: "B2C",
      targetAudience: "Local homeowners needing heating and cooling service",
      primaryPillar: "Trust",
      primaryWeakPillar: "Visibility",
      strategicPriorities: ["More estimate requests", "Stronger Google reviews"],
      channelPlans: {},
    },
  },
  {
    name: "dental",
    vertical: "health_clinic",
    who: /patients/i,
    cta: /Schedule an appointment/i,
    diagnostic: {
      companyName: "Bright Smile Family Dental",
      industry: "Dental clinic",
      businessType: "local_service",
      audienceType: "B2C",
      targetAudience: "Local families looking for a trusted dentist",
      primaryPillar: "Trust",
      primaryWeakPillar: "Visibility",
      strategicPriorities: ["More new patient appointments", "Reviews"],
      channelPlans: {},
    },
  },
] as const;

describe("b2c anti-drift eval (salon / HVAC / dental)", () => {
  for (const fixture of fixtures) {
    describe(fixture.name, () => {
      it("locks audience context to consumer vertical", () => {
        const locked = buildLockedReportAudienceContext(fixture.diagnostic);
        expect(locked.consumerFacing).toBe(true);
        expect(locked.consumerVertical).toBe(fixture.vertical);
        expect(locked.audienceVoice.who).toMatch(fixture.who);
        expect(locked.audienceVoice.primaryCta).toMatch(fixture.cta);
        expect(locked.languageDirective).toMatch(/LOCKED consumer vertical/i);
        expect(locked.languageDirective).toMatch(/do not use B2B vocabulary/i);
        expect(locked.languageDirective).toMatch(BANNED);
      });

      it("Strategy tab defaults avoid B2B jargon", () => {
        const items = buildStrategyNavMenuItems(
          "snapshot-plus",
          fixture.diagnostic as Record<string, unknown>,
        );
        const blob = items.map((i) => `${i.summary}\n${i.body}`).join("\n");
        expect(blob).not.toMatch(BANNED);
        expect(blob.toLowerCase()).not.toContain("pipeline movement");
        expect(blob.toLowerCase()).not.toContain("pipeline quality");
        expect(blob.toLowerCase()).not.toContain("decision-makers");
      });

      it("Activation plan sections avoid B2B jargon", () => {
        const sections = buildActivationPlanSectionsList(
          fixture.diagnostic as Record<string, unknown>,
          "snapshot-plus",
        );
        const blob = sections.map((s) => `${s.label}\n${s.body}`).join("\n");
        expect(blob).not.toMatch(BANNED);
        expect(blob).toMatch(fixture.cta);
      });

      it("sanitizer clears seeded B2B drift in report JSON", () => {
        const locked = buildLockedReportAudienceContext(fixture.diagnostic);
        const dirty =
          "Reach decision-makers and prospects. Improve pipeline. Book a 20-minute scope fit. LinkedIn-first ICP filters.";
        expect(textHasB2bAudienceDrift(dirty)).toBe(true);
        const cleaned = sanitizeConsumerReportContent(
          { tip: dirty, nested: { line: dirty } },
          locked,
        );
        expect(String(cleaned.tip)).not.toMatch(BANNED);
        expect(String((cleaned.nested as { line: string }).line)).not.toMatch(BANNED);
        expect(String(cleaned.tip)).toMatch(fixture.who);
      });
    });
  }

  it("prompt lock fragment names LOCKED vertical ban list", () => {
    expect(audienceLanguageLockFragment).toMatch(/LOCKED/i);
    expect(audienceLanguageLockFragment).toMatch(/Explicit ban list/i);
    expect(audienceLanguageLockFragment).toContain("beauty_wellness");
    expect(audienceLanguageLockFragment).toContain("prospects");
    expect(audienceLanguageLockFragment).toContain("pipeline");
  });
});
