import { describe, expect, it } from "vitest";
import { buildLockedReportAudienceContext } from "@/lib/results/reportAudienceContext";
import {
  sanitizeConsumerFacingText,
  sanitizeConsumerReportContent,
  textHasB2bAudienceDrift,
} from "@/lib/results/sanitizeConsumerReportLanguage";

describe("reportAudienceContext + consumer language sanitize", () => {
  it("locks salon assessment to beauty_wellness consumer voice", () => {
    const locked = buildLockedReportAudienceContext({
      industry: "Hair / beauty / spa",
      businessType: "local_service",
      audienceType: "B2C",
      businessName: "Studio North",
    });
    expect(locked.consumerFacing).toBe(true);
    expect(locked.consumerVertical).toBe("beauty_wellness");
    expect(locked.audienceVoice.primaryCta).toBe("Book an appointment");
    expect(locked.languageDirective).toMatch(/LOCKED consumer vertical/i);
    expect(locked.languageDirective).not.toMatch(/B2B jargon OK/i);
  });

  it("keeps consulting B2B", () => {
    const locked = buildLockedReportAudienceContext({
      industry: "Professional services / consulting",
      businessType: "service_b2b",
      audienceType: "B2B",
    });
    expect(locked.consumerFacing).toBe(false);
    expect(locked.consumerVertical).toBeNull();
  });

  it("rewrites B2B drift terms for consumer reports", () => {
    const locked = buildLockedReportAudienceContext({
      industry: "Hair / beauty / spa",
      businessType: "local_service",
      audienceType: "B2C",
    });
    const raw =
      "Reach decision-makers and prospects. Improve pipeline. Book a 20-minute scope fit. LinkedIn-first ICP filters.";
    expect(textHasB2bAudienceDrift(raw)).toBe(true);
    const cleaned = sanitizeConsumerFacingText(raw, locked);
    expect(cleaned).toMatch(/clients/i);
    expect(cleaned).toMatch(/Book an appointment/i);
    expect(cleaned).not.toMatch(/\bprospects\b/i);
    expect(cleaned).not.toMatch(/scope fit/i);
    expect(cleaned).not.toMatch(/\bICP\b/);
  });

  it("deep-sanitizes nested report JSON for consumer", () => {
    const locked = buildLockedReportAudienceContext({
      industry: "dental clinic",
      businessType: "local_service",
      audienceType: "B2C",
    });
    const content = sanitizeConsumerReportContent(
      {
        executiveSummary: "Help prospects book. ICP conversion path.",
        nested: { tip: "Book a 20-minute scope fit with decision-makers." },
      },
      locked,
    );
    expect(String(content.executiveSummary)).not.toMatch(/prospects|ICP/i);
    expect(String((content.nested as { tip: string }).tip)).toMatch(/Schedule an appointment|patients/i);
    expect(String((content.nested as { tip: string }).tip)).not.toMatch(/scope fit/i);
  });

  it("does not sanitize B2B reports", () => {
    const locked = buildLockedReportAudienceContext({
      industry: "SaaS",
      businessType: "saas",
      audienceType: "B2B",
    });
    const content = sanitizeConsumerReportContent(
      { executiveSummary: "Improve pipeline with ICP targeting." },
      locked,
    );
    expect(content.executiveSummary).toBe("Improve pipeline with ICP targeting.");
  });
});
