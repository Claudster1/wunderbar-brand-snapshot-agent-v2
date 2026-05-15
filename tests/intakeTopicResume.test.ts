import { describe, expect, it } from "vitest";
import {
  buildIntakeTopicResumeLines,
  buildIntakeWrapUpGuardLines,
} from "@/lib/intake/buildIntakeTopicResume";
import {
  buildFallbackAnswersFromMessages,
  mergeExtractedWithFallback,
} from "@/lib/intake/transcriptAnswerFallback";

describe("buildIntakeTopicResumeLines", () => {
  const sampleThread = [
    { role: "user", content: "Claudine" },
    { role: "assistant", content: "Thanks, Claudine. Wunderbar Digital." },
    { role: "user", content: "yes" },
    { role: "user", content: "www.wunderbardigital.com" },
    { role: "user", content: "linkedin, facebook, ig" },
    { role: "user", content: "email, seo, aeo" },
    { role: "user", content: "trust and proof" },
    { role: "user", content: "other marketing agencies targeting smbs" },
    { role: "user", content: "smbs and startups...just launching and don't have clients yet" },
    { role: "user", content: "small, medium size businesses and start ups who recognize the power of having a strong brand" },
  ];

  it("flags website, social, competitors, and customers as done", () => {
    const lines = buildIntakeTopicResumeLines(sampleThread);
    const joined = lines.join(" ");
    expect(joined).toMatch(/WEBSITE/i);
    expect(joined).toMatch(/SOCIAL/i);
    expect(joined).toMatch(/COMPETITOR/i);
    expect(joined).toMatch(/CUSTOMERS/i);
  });

  it("emits wrap-up guard when captures are complete", () => {
    const wrap = buildIntakeWrapUpGuardLines(sampleThread, 100, []);
    expect(wrap.length).toBeGreaterThan(0);
    expect(wrap.join(" ")).toMatch(/CAPTURES COMPLETE/i);
  });
});

describe("transcriptAnswerFallback", () => {
  it("builds scorable fallback from a minimal thread", () => {
    const messages = [
      { role: "user", content: "Claudine" },
      { role: "assistant", content: "business called Wunderbar Digital" },
      { role: "user", content: "www.wunderbardigital.com" },
      { role: "user", content: "linkedin" },
    ];
    const fb = buildFallbackAnswersFromMessages(messages);
    expect(fb.userName).toBe("Claudine");
    expect(fb.businessName).toBe("Wunderbar Digital");
    expect(fb.website).toContain("wunderbardigital.com");
    expect(Array.isArray(fb.socials)).toBe(true);
  });

  it("merge fills empty arrays from fallback", () => {
    const messages = [
      { role: "user", content: "Claudine" },
      { role: "user", content: "linkedin" },
    ];
    const merged = mergeExtractedWithFallback({ userName: "C", businessName: "Acme", socials: [] }, messages);
    expect((merged.socials as string[]).length).toBeGreaterThan(0);
  });
});
