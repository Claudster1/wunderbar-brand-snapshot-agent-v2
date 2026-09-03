import { describe, expect, it } from "vitest";
import { buildPurchaseStartReminderEmail } from "@/lib/email/purchaseStartReminderEmail";

describe("purchaseStartReminderEmail", () => {
  it("builds day-2 nudge with access CTA", () => {
    const built = buildPurchaseStartReminderEmail({
      reminderKey: "2d",
      productSku: "SNAPSHOT_PLUS",
      firstName: "Alex",
      accessUrl: "https://app.example/api/access/claim?token=x",
      dashboardUrl: "https://app.example/dashboard",
    });
    expect(built.subject.toLowerCase()).toMatch(/nudge|ready/);
    expect(built.html).toContain("https://app.example/api/access/claim?token=x");
    expect(built.text).toContain("Alex");
  });

  it("mentions 90-day window on day-21", () => {
    const built = buildPurchaseStartReminderEmail({
      reminderKey: "21d",
      productSku: "BLUEPRINT_PLUS",
      accessUrl: "https://app.example/access",
      dashboardUrl: "https://app.example/dashboard",
    });
    expect(built.text).toMatch(/90 days/i);
    expect(built.subject.toLowerCase()).toMatch(/last nudge|blueprint/);
  });
});
