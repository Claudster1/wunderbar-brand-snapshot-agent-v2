import { describe, expect, it } from "vitest";
import { extractEmailSendMap } from "@/lib/activation/parseEmailSendMap";

describe("extractEmailSendMap", () => {
  it("parses markdown send-map tables", () => {
    const content = [
      "Build these emails in order.",
      "",
      "**Send map**",
      "",
      "| EMAIL # | WHEN | JOB OF THIS EMAIL | SUBJECT |",
      "| --- | --- | --- | --- |",
      "| 1 | Day 0 | Getting noticed | First subject |",
      "| 2 | Day 2 | Looking closer | Second subject |",
      "",
      "### Email 1",
    ].join("\n");

    const parsed = extractEmailSendMap(content);
    expect(parsed).not.toBeNull();
    expect(parsed!.before).toContain("Build these");
    expect(parsed!.rows).toEqual([
      { emailNum: "1", when: "Day 0", stage: "Getting noticed", subject: "First subject" },
      { emailNum: "2", when: "Day 2", stage: "Looking closer", subject: "Second subject" },
    ]);
    expect(parsed!.after).toContain("### Email 1");
  });

  it("parses numbered Day · Stage — Subject lists", () => {
    const content = [
      "**Send map (scan this first)**",
      "1. Day 0 · Awareness — Still seeing interest leak?",
      "2. Day 2 · Awareness — The proof they asked for",
      "3. Day 5 · Consideration — Governance and ownership",
    ].join("\n");

    const parsed = extractEmailSendMap(content);
    expect(parsed?.rows).toHaveLength(3);
    expect(parsed?.rows[0]).toEqual({
      emailNum: "1",
      when: "Day 0",
      stage: "Awareness",
      subject: "Still seeing interest leak?",
    });
  });
});
