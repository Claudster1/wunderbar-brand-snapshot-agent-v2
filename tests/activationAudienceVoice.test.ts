import { describe, expect, it } from "vitest";
import { resolveActivationAudienceVoice } from "@/lib/activation/activationAudienceVoice";
import {
  buildDevelopedCompetitivePlan,
  buildDevelopedEmailPlan,
  buildDevelopedExecutionRoadmap,
  buildDevelopedJourneyPlan,
  buildDevelopedPrPlan,
  buildDevelopedSeoAeoPlan,
  buildDevelopedThoughtLeadershipPack,
} from "@/lib/activation/activationDevelopedPlansCopy";
import { extractActivationDerivatives, buildActivationPlanSectionsList } from "@/lib/activation/activationPlanModel";
import { ensurePaidMediaChannelsMinimum } from "@/lib/activation/paidMediaPlanFields";
import { pdfAudienceChrome } from "@/src/pdf/lib/pdfAudienceChrome";
import type { BlueprintEngineOutput } from "@/src/pdf/types/blueprintReport";

function salonDiagnostic() {
  return {
    companyName: "Studio North Color",
    industry: "Hair / beauty / spa",
    businessType: "local_service",
    audienceType: "B2C",
    targetAudience: "Local clients looking for color and cuts",
    primaryWeakPillar: "Visibility",
    strategicPriorities: ["More bookings", "Stronger reviews", "Clearer offer"],
    channelPlans: {},
  };
}

describe("activationAudienceVoice", () => {
  it("resolves salon to beauty voice with appointment language", () => {
    const voice = resolveActivationAudienceVoice(salonDiagnostic());
    expect(voice.consumer).toBe(true);
    expect(voice.vertical).toBe("beauty_wellness");
    expect(voice.who).toBe("clients");
    expect(voice.primaryCta).toBe("Book an appointment");
    expect(voice.primaryCta).not.toMatch(/color|scope fit|demo/i);
    expect(voice.socialPlatforms[0]?.name).toMatch(/Instagram/i);
  });

  it("resolves HVAC to homeowner estimate language", () => {
    const voice = resolveActivationAudienceVoice({
      industry: "HVAC and plumbing",
      businessType: "local_service",
      audienceType: "B2C",
    });
    expect(voice.vertical).toBe("home_services");
    expect(voice.who).toBe("homeowners");
    expect(voice.primaryCta).toMatch(/estimate|call/i);
  });

  it("keeps B2B consulting on buyer / LinkedIn-first path", () => {
    const voice = resolveActivationAudienceVoice({
      industry: "Professional services / consulting",
      businessType: "service_b2b",
      audienceType: "B2B",
    });
    expect(voice.consumer).toBe(false);
    expect(voice.socialPlatforms[0]?.name).toBe("LinkedIn");
  });
});

describe("activation plan consumer fallbacks", () => {
  it("salon activation social/email avoid B2B ops jargon", () => {
    const d = extractActivationDerivatives(salonDiagnostic());
    expect(d.voice.consumer).toBe(true);
    expect(d.socialMediaPlan).toMatch(/Book an appointment/i);
    expect(d.socialMediaPlan).toMatch(/Instagram/i);
    expect(d.socialMediaPlan).not.toMatch(/ICP|scope fit|pipeline|decision-makers|LinkedIn POV/i);

    const email = buildDevelopedEmailPlan({
      companyName: d.companyName,
      industry: d.industry,
      primaryPillar: d.primaryPillar,
      firstPriority: d.firstPriority,
      secondPriority: d.secondPriority,
      thirdPriority: d.thirdPriority,
      audienceShort: d.audienceShort,
      audienceSummary: d.audienceSummary,
      voice: d.voice,
    });
    expect(email).toMatch(/Book an appointment/i);
    expect(email).toMatch(/Thanks for finding|Thanks for reaching out/i);
    expect(email).not.toMatch(/scope fit|pipeline-sourced|RFP theater|growth lead/i);

    const seo = buildDevelopedSeoAeoPlan({
      companyName: d.companyName,
      industry: d.industry,
      primaryPillar: d.primaryPillar,
      firstPriority: d.firstPriority,
      secondPriority: d.secondPriority,
      thirdPriority: d.thirdPriority,
      audienceShort: d.audienceShort,
      audienceSummary: d.audienceSummary,
      voice: d.voice,
    });
    expect(seo).toMatch(/Local SEO|near me|Book an appointment/i);
    expect(seo).not.toMatch(/vendor evaluation|scope fit/i);
  });

  it("paid scaffolds prefer Meta/Google for consumer when ordered", () => {
    const voice = resolveActivationAudienceVoice(salonDiagnostic());
    const strategy = ensurePaidMediaChannelsMinimum({ channels: [] }, 3, voice.paidPlatforms);
    const channels = strategy.channels as Array<{ platform?: string }>;
    expect(channels[0]?.platform).toBe("Meta");
    expect(channels.map((c) => c.platform)).toContain("Google Ads");
    expect(channels[0]?.platform).not.toBe("LinkedIn");
  });

  it("salon journey / PR / thought-leadership packs stay natural", () => {
    const d = extractActivationDerivatives(salonDiagnostic());
    const ctx = {
      companyName: d.companyName,
      industry: d.industry,
      primaryPillar: d.primaryPillar,
      firstPriority: d.firstPriority,
      secondPriority: d.secondPriority,
      thirdPriority: d.thirdPriority,
      audienceShort: d.audienceShort,
      audienceSummary: d.audienceSummary,
      voice: d.voice,
    };

    expect(buildDevelopedJourneyPlan(ctx)).toMatch(/Customer journey|Book an appointment/i);
    expect(buildDevelopedJourneyPlan(ctx)).not.toMatch(/scope fit|CRM/i);
    expect(buildDevelopedThoughtLeadershipPack(ctx)).toMatch(/Instagram|Google|Book an appointment/i);
    expect(buildDevelopedThoughtLeadershipPack(ctx)).not.toMatch(/LinkedIn-length|comment “map”/i);
    expect(buildDevelopedPrPlan(ctx)).toMatch(/Local visibility|neighborhood/i);
    expect(buildDevelopedPrPlan(ctx)).not.toMatch(/RFP|procurement/i);
    expect(buildDevelopedCompetitivePlan(ctx)).toMatch(/Standing out locally/i);
    expect(buildDevelopedExecutionRoadmap(ctx)).toMatch(/Google Business|Book an appointment/i);
  });

  it("buildActivationPlanSectionsList includes consumer social body for salon", () => {
    const sections = buildActivationPlanSectionsList(salonDiagnostic() as Record<string, unknown>, "snapshot-plus");
    const social = sections.find((s) => /social|thought/i.test(s.id) || /social|thought/i.test(s.label));
    expect(social?.body || "").toMatch(/Book an appointment|Instagram/i);
    expect(social?.body || "").not.toMatch(/scope fit|ICP filters/i);
    expect(sections.find((s) => s.id === "journey-orchestration")?.label).toBe("Customer journey plan");
  });

  it("Blueprint PDF chrome uses customer language for salon-like audiences", () => {
    const data = {
      audienceClarity: {
        audienceSignals: {
          primaryAudience: "Local clients looking for color and cuts",
          audienceCharacteristics: "Hair / beauty / spa",
          audienceLanguage: "warm and clear",
        },
      },
    } as BlueprintEngineOutput;
    const chrome = pdfAudienceChrome(data);
    expect(chrome.consumer).toBe(true);
    expect(chrome.conversionBackboneLabel).toBe("How customers decide");
    expect(chrome.conversionSnapshotTitle).toBe("Customer Conversion Snapshot");
    expect(chrome.primarySegmentLabel).toBe("Primary audience");
  });
});
