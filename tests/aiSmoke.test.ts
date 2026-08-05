import { afterEach, describe, expect, it, vi } from "vitest";
import type { AIProvider, AIProviderClient, CompletionResponse } from "@/lib/ai/types";

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

function okResponse(
  provider: AIProvider,
  model: string,
): CompletionResponse {
  return {
    content: "OK",
    hasToolCalls: false,
    toolCalls: [],
    raw: {},
    provider,
    model,
  };
}

function mockClient(
  provider: AIProvider,
  complete: AIProviderClient["complete"],
): AIProviderClient {
  return {
    provider,
    isConfigured: true,
    complete,
    completeWithToolResults: async () => {
      throw new Error("unused");
    },
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("runAssessmentChatSmoke", () => {
  it("ok when primary succeeds", async () => {
    getAIDirectMock.mockReturnValue(
      mockClient("openai", async () => okResponse("openai", "gpt-4o-mini")),
    );

    const result = await runAssessmentChatSmoke();
    expect(result.ok).toBe(true);
    expect(result.primaryFailed).toBeUndefined();
    expect(result.usedProvider).toBe("openai");
  });

  it("ok via fallback when primary fails", async () => {
    getAIDirectMock.mockImplementation((provider: AIProvider) => {
      if (provider === "openai") {
        return mockClient("openai", async () => {
          throw new Error("429 no credits");
        });
      }
      return mockClient("anthropic", async () =>
        okResponse("anthropic", "claude-sonnet-4-6"),
      );
    });

    const result = await runAssessmentChatSmoke();
    expect(result.ok).toBe(true);
    expect(result.primaryFailed).toBe(true);
    expect(result.usedProvider).toBe("anthropic");
  });

  it("fails when primary and fallback both fail", async () => {
    getAIDirectMock.mockReturnValue(
      mockClient("openai", async () => {
        throw new Error("boom");
      }),
    );

    const result = await runAssessmentChatSmoke();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/primary.*fallback/i);
  });
});
