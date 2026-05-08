import { describe, expect, it } from "vitest";
import { assistantAskedDedicatedSocialPlatformPresence } from "../lib/intake/flexibleDirectCaptureComplete";
import { dedupeAssistantRepeatedParagraphChunks } from "../lib/assistantCopy/dedupeAssistantParagraphRepeats";
import { sanitizeTierAssistantReply } from "../lib/assistantCopy/sanitizeTierAssistantReply";

/** Must stay aligned with `buildCaptureQuestion("social_platform_presence", …)` in `app/api/brand-snapshot/route.ts`. */
const APPROVED_SNAPSHOT_SOCIAL_PLATFORM_CAPTURE =
  "**Where does your brand show up on social today?** Name the platforms that matter (or say *none / not really active yet*).";

describe("approved snapshot social capture wording vs dedicated-social detector", () => {
  it("matches assistantAskedDedicatedSocialPlatformPresence before post-processing", () => {
    expect(assistantAskedDedicatedSocialPlatformPresence(APPROVED_SNAPSHOT_SOCIAL_PLATFORM_CAPTURE)).toBe(true);
  });

  it("still matches after the same assistant pipeline as /api/brand-snapshot (dedupe → tier sanitize)", () => {
    let t = APPROVED_SNAPSHOT_SOCIAL_PLATFORM_CAPTURE;
    t = dedupeAssistantRepeatedParagraphChunks(t);
    t = sanitizeTierAssistantReply(t, { hasInChatUploads: false, intakeTier: "snapshot" });
    expect(assistantAskedDedicatedSocialPlatformPresence(t)).toBe(true);
  });
});
