import { describe, expect, it } from "vitest";
import { formatFollowupPendingSlackMessage } from "@/lib/session/notifyFollowupPendingSlack";

describe("formatFollowupPendingSlackMessage", () => {
  it("includes contact, session type, and admin review link", () => {
    const msg = formatFollowupPendingSlackMessage({
      followupId: "abc-123",
      contactEmail: "alex@example.com",
      contactName: "Alex",
      sessionType: "talk_to_expert",
      subject: "Great talking today",
      teamMemberName: "Claudine",
      source: "otter_zapier",
      appBaseUrl: "https://app.wunderbrand.ai",
    });

    expect(msg.text).toMatch(/Talk to an Expert/);
    expect(msg.text).toMatch(/alex@example.com/);
    const body = JSON.stringify(msg.blocks);
    expect(body).toContain("Alex (alex@example.com)");
    expect(body).toContain("https://app.wunderbrand.ai/admin/followups");
    expect(body).toContain("Great talking today");
    expect(body).toContain("abc-123");
  });
});
