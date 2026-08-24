import { describe, expect, it } from "vitest";
import { assistantMessageInvitesChoice } from "@/lib/intake/assistantMessageInvitesChoice";
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

  it("on-screen question topic wins over a stale pending capture key", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: "social_platform_presence",
      lastAssistantText: buildCaptureQuestion("competitive_pressure_point", null),
    });
    expect(chips).toEqual(getSuggestedRepliesForCapture("competitive_pressure_point"));
    expect(chips?.[0]).toBe("Price");
  });

  it("bridge sentences that echo a prior topic still resolve to the new ask", () => {
    const bridged: Array<{
      text: string;
      expectKey: CaptureKey;
      staleKey: CaptureKey;
    }> = [
      {
        text: "That makes sense — it's common to build social presence alongside a launch. **When prospects choose a competitor over you, what reason comes up most often?**",
        expectKey: "competitive_pressure_point",
        staleKey: "social_platform_presence",
      },
      {
        text: "Got it on the website. **Where does your brand show up on social today?** Name the platforms that matter (or say *none / not really active yet*).",
        expectKey: "social_platform_presence",
        staleKey: "website_presence",
      },
      {
        text: "Thanks — social is noted. **Beyond your website and social, where else are you putting time or budget** — email, SEO, paid, events, or mostly referrals?",
        expectKey: "additional_marketing_surfaces",
        staleKey: "social_platform_presence",
      },
    ];
    for (const row of bridged) {
      const chips = resolveSuggestedReplies({
        nextPendingKey: row.staleKey,
        lastAssistantText: row.text,
      });
      expect(chips).toEqual(getSuggestedRepliesForCapture(row.expectKey));
    }
  });

  it("narrative goals still resolve when no capture is pending", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText: "What are you hoping to achieve with your brand in the next 6–12 months?",
    });
    expect(chips?.[0]).toMatch(/qualified leads|Attract/i);
  });

  it("brand consistency question never gets conversion-rate chips", () => {
    const text =
      "How do you feel about the consistency of your brand across different touchpoints — does it feel cohesive wherever it shows up, somewhat consistent, or still a bit scattered?";
    const chips = resolveSuggestedReplies({
      nextPendingKey: "conversion_rate_estimate",
      lastAssistantText: text,
    });
    expect(chips?.[0]).toMatch(/Cohesive|Somewhat consistent|scattered/i);
    expect(chips?.join(" ")).not.toMatch(/I track it/i);
  });

  it("decision-style wording resolves decision chips", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText:
        "When you make decisions for the business, which pattern fits you best? Tap below — or type your own.",
    });
    expect(chips?.[0]).toMatch(/instincts|research|collaborate|systems/i);
  });

  it("personality person-in-a-room wording resolves personality chips", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText:
        "If Wunderbar Digital were a person in a room, how would you describe them? Tap a few below — or type your own words.",
    });
    expect(chips?.[0]).toMatch(/Sharp|Approachable|Challenger/i);
  });

  it("content formats wording with 'engages' resolves chips", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText:
        "What formats do you think your audience engages with most? Tap all that apply below — or type your own.",
    });
    expect(chips?.[0]).toMatch(/social|Long-form|Video|Email/i);
  });

  it("confidentiality ack never invites leftover conversion chips", () => {
    expect(
      assistantMessageInvitesChoice(
        "Totally fair — your diagnostic will have plenty to work with. Everything you've shared is confidential — your brand insights stay yours.",
      ),
    ).toBe(false);
  });
});
