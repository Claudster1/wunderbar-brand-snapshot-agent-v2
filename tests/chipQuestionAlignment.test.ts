import { describe, expect, it } from "vitest";
import { buildCaptureQuestion } from "@/lib/intake/buildCaptureQuestion";
import { buildIntakeResponseMeta } from "@/lib/intake/buildIntakeResponseMeta";
import { getSuggestedRepliesForCapture } from "@/lib/intake/captureSuggestedReplies";
import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";
import { resolveSuggestedReplies } from "@/lib/intake/multiSelectChipCatalog";

/** Every forced capture key that ships chips. */
const CAPTURE_KEYS_WITH_CHIPS: CaptureKey[] = [
  "business_type_classifier",
  "audience_type_classifier",
  "user_role_context",
  "team_size",
  "industry",
  "geographic_scope",
  "years_in_business",
  "offer_clarity",
  "messaging_clarity",
  "credibility_proof",
  "visual_confidence",
  "thought_leadership",
  "website_presence",
  "social_platform_presence",
  "additional_marketing_surfaces",
  "monthly_revenue_range",
  "average_transaction_value",
  "conversion_rate_estimate",
  "primary_acquisition_channel",
  "monthly_marketing_budget",
  "content_creation_capacity",
  "competitive_pressure_point",
  "has_email_list",
  "has_lead_magnet",
  "has_clear_cta",
  "marketing_channel_mix",
];

function chipSig(chips: string[] | null | undefined): string {
  return (chips ?? []).join("|");
}

describe("chip ↔ question alignment QC", () => {
  it("every forced capture prompt resolves to that capture's chip catalog", () => {
    const mismatches: string[] = [];
    for (const key of CAPTURE_KEYS_WITH_CHIPS) {
      const expected = getSuggestedRepliesForCapture(key);
      expect(expected.length).toBeGreaterThan(0);

      const prompt = buildCaptureQuestion(key, null);
      const resolved = resolveSuggestedReplies({
        nextPendingKey: key,
        lastAssistantText: prompt,
      });
      if (chipSig(resolved) !== chipSig(expected)) {
        mismatches.push(`${key}: got [${chipSig(resolved)}] expected [${chipSig(expected)}]`);
      }

      // Topic detect alone (client contextual / narrative) should also land on the same catalog
      // when the canonical prompt is on screen.
      const fromTopicOnly = resolveSuggestedReplies({
        nextPendingKey: null,
        lastAssistantText: prompt,
      });
      if (chipSig(fromTopicOnly) !== chipSig(expected)) {
        mismatches.push(
          `${key} (topic-only): got [${chipSig(fromTopicOnly)}] expected [${chipSig(expected)}]`,
        );
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("chips follow the outgoing question, not the previous assistant ask in history", () => {
    const mismatches: string[] = [];
    for (let i = 0; i < CAPTURE_KEYS_WITH_CHIPS.length - 1; i++) {
      const prevKey = CAPTURE_KEYS_WITH_CHIPS[i]!;
      const nextKey = CAPTURE_KEYS_WITH_CHIPS[i + 1]!;
      const prevPrompt = buildCaptureQuestion(prevKey, null);
      const nextPrompt = buildCaptureQuestion(nextKey, null);
      const expected = getSuggestedRepliesForCapture(nextKey);

      const meta = buildIntakeResponseMeta({
        messages: [
          { role: "assistant", content: prevPrompt },
          { role: "user", content: "answered" },
        ],
        tier: "snapshot",
        captureStates: [
          { key: prevKey, label: prevKey, completed: true },
          { key: nextKey, label: nextKey, completed: false },
        ],
        nextPendingKey: nextKey,
        outgoingAssistantText: nextPrompt,
      });

      if (chipSig(meta.suggestedReplies) !== chipSig(expected)) {
        mismatches.push(`${prevKey}→${nextKey}: got [${chipSig(meta.suggestedReplies)}]`);
      }
      // Must not keep previous question's first chip when catalogs differ.
      const prevFirst = getSuggestedRepliesForCapture(prevKey)[0];
      const nextFirst = expected[0];
      if (prevFirst && nextFirst && prevFirst !== nextFirst && meta.suggestedReplies?.[0] === prevFirst) {
        mismatches.push(`${prevKey}→${nextKey}: stuck on previous first chip "${prevFirst}"`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("pending capture catalog wins over a stale previous-question topic match", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: "competitive_pressure_point",
      lastAssistantText: buildCaptureQuestion("social_platform_presence", null),
    });
    expect(chips).toEqual(getSuggestedRepliesForCapture("competitive_pressure_point"));
    expect(chips?.[0]).toBe("Price");
  });

  it("narrative goals still resolve when no capture is pending", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText: "What are you hoping to achieve with your brand in the next 6–12 months?",
    });
    expect(chips?.[0]).toMatch(/qualified leads|Attract/i);
  });
});
