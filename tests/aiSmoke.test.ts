import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai", () => ({
  getAIDirect: vi.fn(),
}));

vi.mock("@/lib/ai/config", () => ({
  getModelRoute: vi.fn(() => ({
    provider: "openai",
    model: "gpt-4o-mini",
    fallbackProvider: "anthropic",
    fallbackModel: "claude-sonnet-4-6",
  })),
}));

vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { getAIDirect } from "@/lib/ai";
import { runAssessmentChatSmoke } from "@/lib/health/aiSmoke";

const getAIDirectMock = vi.mocked(getAIDirect);

afterEach(() => {
  vi.clearAllMocks();
});

describe("runAssessmentChatSmoke", () => {
  it("ok when primary succeeds", async () => {
    getAIDirectMock.mockReturnValue({
      provider: "openai",
      isConfigured: true,
      complete: async () => ({
        content: "OK",
        hasToolCalls: false,
        toolCalls: [],
        provider: "openai",
        model: "gpt-4o-mini",
      }),
      completeWithToolResults: async () => {
        throw new Error("unused");
      },
    });

    const result = await runAssessmentChatSmoke();
    expect(result.ok).toBe(true);
    expect(result.primaryFailed).toBeUndefined();
    expect(result.usedProvider).toBe("openai");
  });

  it("ok via fallback when primary fails", async () => {
    getAIDirectMock.mockImplementation((provider: string) => {
      if (provider === "openai") {
        return {
          provider: "openai",
          isConfigured: true,
          complete: async () => {
            throw new Error("429 no credits");
          },
          completeWithToolResults: async () => {
            throw new Error("unused");
          },
        };
      }
      return {
        provider: "anthropic",
        isConfigured: true,
        complete: async () => ({
          content: "OK",
          hasToolCalls: false,
          toolCalls: [],
          provider: "anthropic",
          model: "claude-sonnet-4-6",
        }),
        completeWithToolResults: async () => {
          throw new Error("unused");
        },
      };
    });

    const result = await runAssessmentChatSmoke();
    expect(result.ok).toBe(true);
    expect(result.primaryFailed).toBe(true);
    expect(result.usedProvider).toBe("anthropic");
  });

  it("fails when primary and fallback both fail", async () => {
    getAIDirectMock.mockReturnValue({
      provider: "openai",
      isConfigured: true,
      complete: async () => {
        throw new Error("boom");
      },
      completeWithToolResults: async () => {
        throw new Error("unused");
      },
    });

    const result = await runAssessmentChatSmoke();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/primary.*fallback/i);
  });
});
