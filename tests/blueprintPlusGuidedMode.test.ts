import { describe, expect, it } from "vitest";
import {
  BLUEPRINT_PLUS_GUIDED_ACTIVATION_SECTION_IDS,
  BLUEPRINT_PLUS_GUIDED_STRATEGY_SECTION_IDS,
  buildBlueprintPlusStartHereMoves,
  filterBlueprintPlusGuidedActivationNavItems,
  filterBlueprintPlusGuidedActivationSections,
  filterBlueprintPlusGuidedStrategySections,
  guidedActivationChipLabel,
  guidedStrategyChipLabel,
  limitBlueprintPlusGuidedPromptSections,
  parseBlueprintPlusViewModeParam,
  primaryGuidedActivationChannelId,
  resolveBlueprintPlusGuidedActivationSectionIds,
  resolveBlueprintPlusGuidedStrategySectionIds,
  shouldPersistBlueprintPlusViewMode,
} from "@/lib/results/blueprintPlusGuidedMode";

describe("blueprintPlusGuidedMode", () => {
  it("parses view mode query values", () => {
    expect(parseBlueprintPlusViewModeParam("guided")).toBe("guided");
    expect(parseBlueprintPlusViewModeParam("reference")).toBe("reference");
    expect(parseBlueprintPlusViewModeParam("full")).toBeNull();
  });

  it("filters strategy sections in guided mode only", () => {
    const sections = [
      { id: "positioning" },
      { id: "persona-atlas" },
      { id: "messaging-pillars" },
      { id: "competitive-matrix" },
      { id: "execution-priorities" },
    ];
    const guided = filterBlueprintPlusGuidedStrategySections(sections, "guided");
    expect(guided.map((s) => s.id)).toEqual([
      "positioning",
      "messaging-pillars",
      "execution-priorities",
    ]);
    expect(filterBlueprintPlusGuidedStrategySections(sections, "reference")).toHaveLength(5);
    expect(BLUEPRINT_PLUS_GUIDED_STRATEGY_SECTION_IDS.length).toBeGreaterThan(3);
  });

  it("picks a conversion-focused strategy panel from the report", () => {
    const sections = [
      { id: "positioning" },
      { id: "messaging-pillars" },
      { id: "icp-personas" },
      { id: "buyer-journey-map" },
      { id: "channel-strategy" },
      { id: "competitive-matrix" },
      { id: "execution-priorities" },
    ];
    const guided = filterBlueprintPlusGuidedStrategySections(sections, "guided", {
      primaryPillar: "conversion",
    });
    expect(guided.map((s) => s.id)).toEqual([
      "positioning",
      "messaging-pillars",
      "icp-personas",
      "buyer-journey-map",
      "execution-priorities",
    ]);
    expect(resolveBlueprintPlusGuidedStrategySectionIds({ primaryPillar: "credibility" })).toContain(
      "competitive-matrix",
    );
  });

  it("filters activation sections and keeps overview/prompt chips", () => {
    const sections = [
      { id: "email-lifecycle" },
      { id: "paid-ads" },
      { id: "seo-aeo" },
      { id: "execution-roadmap" },
      { id: "pr-plan" },
      { id: "journey-orchestration" },
    ];
    const guided = filterBlueprintPlusGuidedActivationSections(sections, "guided");
    expect(guided.map((s) => s.id)).toEqual([
      "journey-orchestration",
      "execution-roadmap",
      "email-lifecycle",
      "seo-aeo",
    ]);
    expect(BLUEPRINT_PLUS_GUIDED_ACTIVATION_SECTION_IDS).toEqual([
      "journey-orchestration",
      "execution-roadmap",
      "email-lifecycle",
      "seo-aeo",
    ]);

    const nav = filterBlueprintPlusGuidedActivationNavItems(
      [
        { id: "activation-overview" },
        { id: "activation-email-lifecycle" },
        { id: "activation-seo-aeo" },
        { id: "activation-paid-ads" },
        { id: "activation-prompt-library" },
      ],
      "guided",
    );
    expect(nav.map((i) => i.id)).toEqual([
      "activation-overview",
      "activation-email-lifecycle",
      "activation-seo-aeo",
      "activation-prompt-library",
    ]);
  });

  it("ranks activation channels from primary pillar and local signals", () => {
    const visibilityPath = resolveBlueprintPlusGuidedActivationSectionIds({
      primaryPillar: "visibility",
      strategicPriorities: [{ title: "Improve organic search coverage" }],
    });
    expect(visibilityPath[0]).toBe("journey-orchestration");
    expect(visibilityPath[1]).toBe("execution-roadmap");
    expect(visibilityPath).toContain("seo-aeo");
    expect(visibilityPath.at(-1)).not.toBe("execution-roadmap");
    expect(visibilityPath).not.toContain("thought-leadership");
    expect(primaryGuidedActivationChannelId({ primaryPillar: "visibility" })).toBe("seo-aeo");

    // Pillar preferred channel stays even when gaps pull toward nurture/email.
    // “Social proof on pages” must not unlock thought leadership as a Guided week-one channel.
    const visibilityWithNurtureGap = resolveBlueprintPlusGuidedActivationSectionIds({
      primaryPillar: "Visibility",
      topGaps: ["Visibility consistency", "Proof density", "Nurture flow"],
      strategicPriorities: [
        { title: "Unify external messaging to one positioning promise" },
        { title: "Build weekly visibility themes tied to pillar goals" },
        { title: "Surface social proof on key conversion pages" },
      ],
    });
    expect(visibilityWithNurtureGap).toContain("seo-aeo");
    expect(visibilityWithNurtureGap).not.toContain("thought-leadership");
    expect(visibilityWithNurtureGap.indexOf("execution-roadmap")).toBeLessThan(
      visibilityWithNurtureGap.indexOf("seo-aeo"),
    );

    const localPath = resolveBlueprintPlusGuidedActivationSectionIds({
      primaryPillar: "messaging",
      businessType: "Dental clinic",
      seoStrategy: { localSEOStrategy: "Claim Maps listing and weekly posts" },
    });
    expect(localPath).toContain("seo-aeo");
    expect(localPath.indexOf("execution-roadmap")).toBeLessThan(localPath.indexOf("seo-aeo"));

    const conversionPath = resolveBlueprintPlusGuidedActivationSectionIds({
      primaryPillar: "conversion",
      recommendations: ["Ship a lead magnet and paid remarketing"],
    });
    expect(conversionPath).toContain("lead-magnet-planning");
    expect(primaryGuidedActivationChannelId({ primaryPillar: "conversion" })).toBe(
      "lead-magnet-planning",
    );

    // Credibility defaults to core channels; thought leadership only with clear content signals.
    const credibilityPath = resolveBlueprintPlusGuidedActivationSectionIds({
      primaryPillar: "credibility",
    });
    expect(credibilityPath).not.toContain("thought-leadership");
    expect(credibilityPath).toContain("email-lifecycle");

    const credibilityWithContent = resolveBlueprintPlusGuidedActivationSectionIds({
      primaryPillar: "credibility",
      strategicPriorities: [{ title: "Stand up a thought leadership content system on LinkedIn" }],
    });
    expect(credibilityWithContent).toContain("thought-leadership");
  });

  it("orders guided activation sections by the report path, not library order", () => {
    const sections = [
      { id: "execution-roadmap" },
      { id: "paid-ads" },
      { id: "email-lifecycle" },
      { id: "journey-orchestration" },
      { id: "seo-aeo" },
    ];
    const guided = filterBlueprintPlusGuidedActivationSections(sections, "guided", {
      primaryPillar: "visibility",
      strategicPriorities: [{ title: "Improve organic search coverage" }],
    });
    expect(guided.map((s) => s.id)[0]).toBe("journey-orchestration");
    expect(guided.map((s) => s.id)[1]).toBe("execution-roadmap");
    expect(guided.map((s) => s.id).at(-1)).not.toBe("execution-roadmap");
    expect(guided.map((s) => s.id)).toContain("seo-aeo");
  });

  it("builds five start-here moves from strategic priorities and role", () => {
    const moves = buildBlueprintPlusStartHereMoves(
      {
        strategicPriorities: [
          { title: "Clarify homepage promise" },
          { title: "Repeat proof in email" },
          { title: "Assign 90-day owners" },
        ],
        primaryPillar: "Messaging",
      },
      "marketing",
    );
    expect(moves).toHaveLength(5);
    expect(moves[0].sectionId).toBe("priority-actions");
    expect(moves[1].sectionId).toBe("strategy-messaging-pillars");
    expect(moves[2].tab).toBe("activation");
    expect(moves[2].sectionId).toBe("activation-email-lifecycle");
    expect(moves[2].detail).toMatch(/Email sequence/i);
    expect(moves[4].title).toMatch(/Marketing role pack/i);
  });

  it("limits guided prompt sections and skips preview persistence", () => {
    expect(limitBlueprintPlusGuidedPromptSections(["a", "b", "c", "d", "e", "f"], "guided")).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
    ]);
    expect(limitBlueprintPlusGuidedPromptSections(["a", "b", "c", "d", "e", "f"], "reference")).toHaveLength(6);
    expect(shouldPersistBlueprintPlusViewMode("preview-results-tabs")).toBe(false);
    expect(shouldPersistBlueprintPlusViewMode("live-report-123")).toBe(true);
    expect(guidedStrategyChipLabel("icp-personas", "Audience Profiles")).toBe("Who you serve");
    expect(guidedActivationChipLabel("email-lifecycle", "Email Lifecycle Plan")).toBe("Email sequence");
    expect(guidedActivationChipLabel("seo-aeo", "Search & AI Discovery Plan")).toBe("SEO & AEO");
    expect(guidedActivationChipLabel("paid-ads", "Paid Ads Plan")).toBe("Paid ads");
    expect(guidedActivationChipLabel("thought-leadership", "Thought Leadership Plan")).toBe(
      "Content & social",
    );
    expect(guidedActivationChipLabel("execution-roadmap", "90-Day Execution Roadmap")).toBe(
      "90-day roadmap",
    );
  });
});
