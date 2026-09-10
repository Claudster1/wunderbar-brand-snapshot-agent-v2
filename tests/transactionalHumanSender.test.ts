import { describe, expect, it, afterEach } from "vitest";
import { buildSnapshotReportEmail } from "@/lib/email/reportDeliveryEmail";
import {
  TRANSACTIONAL_HUMAN_FROM_DISPLAY,
  TRANSACTIONAL_HUMAN_SIGN_OFF_NAME,
  TRANSACTIONAL_RESULTS_NOT_PROMO_FOOTER,
  TRANSACTIONAL_RESUME_NOT_PROMO_FOOTER,
  buildTransactionalHumanFrom,
  extractEmailAddress,
} from "@/lib/email/transactionalHumanSender";

describe("transactional human sender", () => {
  afterEach(() => {
    delete process.env.TRANSACTIONAL_RESULTS_EMAIL_FROM;
  });

  it("wraps verified mailbox with Claudine display name", () => {
    expect(
      buildTransactionalHumanFrom("Wunderbar Digital <auth@mail.wunderbardigital.com>"),
    ).toBe(`${TRANSACTIONAL_HUMAN_FROM_DISPLAY} <auth@mail.wunderbardigital.com>`);
  });

  it("honors TRANSACTIONAL_RESULTS_EMAIL_FROM override", () => {
    process.env.TRANSACTIONAL_RESULTS_EMAIL_FROM =
      "Claudine at Wunderbar Digital <results@mail.wunderbrand.ai>";
    expect(buildTransactionalHumanFrom("ignored <x@y.com>")).toBe(
      "Claudine at Wunderbar Digital <results@mail.wunderbrand.ai>",
    );
  });

  it("extracts bare address from angle brackets", () => {
    expect(extractEmailAddress('WunderBrand <auth@mail.wunderbrand.ai>')).toBe(
      "auth@mail.wunderbrand.ai",
    );
  });
});

describe("buildSnapshotReportEmail human voice", () => {
  it("uses founder sign-off and not-a-promo footer", () => {
    const { text, html } = buildSnapshotReportEmail({
      resultsUrl: "https://app.wunderbrand.ai/results?reportId=abc",
      firstName: "FAE",
    });
    expect(text).toContain(TRANSACTIONAL_HUMAN_SIGN_OFF_NAME);
    expect(text).toContain(TRANSACTIONAL_RESULTS_NOT_PROMO_FOOTER);
    expect(text).not.toMatch(/Wunderbar Digital Team/i);
    expect(html).toContain(TRANSACTIONAL_HUMAN_SIGN_OFF_NAME);
    expect(html).toContain(TRANSACTIONAL_RESULTS_NOT_PROMO_FOOTER);
    expect(html).not.toMatch(/Wunderbar Digital Team/i);
  });
});

describe("resume footer constant", () => {
  it("is clearly not a promo", () => {
    expect(TRANSACTIONAL_RESUME_NOT_PROMO_FOOTER).toMatch(/not a promo/i);
  });
});
