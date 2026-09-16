import { describe, expect, it } from "vitest";
import { buildActivationNavMenuItems } from "@/lib/activation/activationTabNav";
import {
  activationNavLabel,
  sortActivationSectionsForNav,
} from "@/lib/activation/activationNavModel";

describe("activationNavModel", () => {
  it("uses plain-language labels across tiers", () => {
    expect(activationNavLabel("seo-aeo")).toBe("SEO & AEO");
    expect(activationNavLabel("thought-leadership")).toBe("Content & social");
    expect(activationNavLabel("execution-roadmap")).toBe("90-day roadmap");
    expect(activationNavLabel("email-lifecycle")).toBe("Email sequence");
  });

  it("orders context → roadmap → channels", () => {
    const ordered = sortActivationSectionsForNav([
      { id: "paid-ads" },
      { id: "execution-roadmap" },
      { id: "journey-orchestration" },
      { id: "email-lifecycle" },
      { id: "audience-segments" },
    ]);
    expect(ordered.map((s) => s.id)).toEqual([
      "journey-orchestration",
      "audience-segments",
      "execution-roadmap",
      "email-lifecycle",
      "paid-ads",
    ]);
  });

  it("builds Guided nav: overview → journey → roadmap → schedule → channels → prompts", () => {
    const items = buildActivationNavMenuItems(
      "blueprint-plus",
      {
        primaryPillar: "visibility",
        strategicPriorities: [{ title: "Improve organic search coverage" }],
      },
      [{ channel: "Email", week: "1", task: "Send", owner: "Mkt" }] as never,
      null,
      "guided",
    );
    const ids = items.map((i) => i.id);
    expect(ids[0]).toBe("activation-overview");
    expect(ids).toContain("activation-journey-orchestration");
    expect(ids).toContain("activation-execution-roadmap");
    expect(ids).toContain("activation-spreadsheet-schedule");
    expect(ids).toContain("activation-nav-channels");
    expect(ids.at(-1)).toMatch(/prompt-library/);

    const journeyIdx = ids.indexOf("activation-journey-orchestration");
    const roadmapIdx = ids.indexOf("activation-execution-roadmap");
    const scheduleIdx = ids.indexOf("activation-spreadsheet-schedule");
    const channelsIdx = ids.indexOf("activation-nav-channels");
    expect(journeyIdx).toBeLessThan(roadmapIdx);
    expect(roadmapIdx).toBeLessThan(scheduleIdx);
    expect(scheduleIdx).toBeLessThan(channelsIdx);

    expect(items.find((i) => i.id === "activation-seo-aeo")?.label).toBe("SEO & AEO");
    expect(items.find((i) => i.id === "activation-spreadsheet-schedule")?.label).toBe("Schedule");
    expect(items.find((i) => i.id.endsWith("prompt-library"))?.label).toBe("Prompts");
  });
});
