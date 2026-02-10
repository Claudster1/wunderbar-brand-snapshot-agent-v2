// lib/ai/providers/gemini.ts
// ─────────────────────────────────────────────────────────────────
// Google Gemini provider implementation.
// Supports: gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash.
// Features: Very fast, extremely cheap, 1M+ context window.
//
// ENV: GEMINI_API_KEY (or GOOGLE_AI_API_KEY)
// ─────────────────────────────────────────────────────────────────

import {
  GoogleGenerativeAI,
  type Content,
  type Part,
  type FunctionDeclaration,
  type GenerateContentResult,
  type FunctionCallingMode,
} from "@google/generative-ai";
import type {
  AIProviderClient,
  CompletionOptions,
  CompletionResponse,
  ToolFollowUpOptions,
  ChatMessage,
  ToolDefinition,
  ToolCall,
} from "../types";

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("[Gemini Provider] GEMINI_API_KEY is not set");
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
}

/**
 * Convert universal messages to Gemini format.
 * Gemini uses "user"/"model" roles, and system instructions are separate.
 */
function toGeminiMessages(messages: ChatMessage[]): {
  systemInstruction: string | undefined;
  contents: Content[];
} {
  let systemInstruction: string | undefined;
  const contents: Content[] = [];

  for (const m of messages) {
    if (m.role === "system") {
      systemInstruction = (systemInstruction ? systemInstruction + "\n\n" : "") + m.content;
    } else {
      contents.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      });
    }
  }

  return { systemInstruction, contents };
}

/** Convert universal tool definitions to Gemini format */
function toGeminiTools(tools: ToolDefinition[]): FunctionDeclaration[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters as unknown as FunctionDeclaration["parameters"],
  }));
}

/** Extract text content from Gemini response */
function extractContent(result: GenerateContentResult): string {
  try {
    return result.response.text();
  } catch {
    // If no text parts, return empty
    return "";
  }
}

/** Extract tool calls from Gemini response */
function extractToolCalls(result: GenerateContentResult): ToolCall[] {
  const calls: ToolCall[] = [];
  const candidate = result.response.candidates?.[0];
  if (!candidate?.content?.parts) return calls;

  for (const part of candidate.content.parts) {
    if ("functionCall" in part && part.functionCall) {
      calls.push({
        id: `gemini-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: part.functionCall.name,
        arguments: (part.functionCall.args ?? {}) as Record<string, unknown>,
      });
    }
  }
  return calls;
}

export function createGeminiProvider(model: string): AIProviderClient {
  return {
    provider: "gemini",

    get isConfigured() {
      return !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY);
    },

    async complete(options: CompletionOptions): Promise<CompletionResponse> {
      const genAI = getGenAI();
      const { systemInstruction, contents } = toGeminiMessages(options.messages);

      const generationConfig: Record<string, unknown> = {
        temperature: options.temperature ?? 0.6,
        maxOutputTokens: options.maxTokens ?? 2000,
      };

      // JSON mode
      if (options.jsonMode) {
        generationConfig.responseMimeType = "application/json";
      }

      const modelInstance = genAI.getGenerativeModel({
        model,
        ...(systemInstruction ? { systemInstruction } : {}),
        generationConfig,
        ...(options.tools?.length
          ? {
              tools: [{ functionDeclarations: toGeminiTools(options.tools) }],
            }
          : {}),
      });

      const result = await modelInstance.generateContent({ contents });

      const toolCalls = extractToolCalls(result);
      const hasToolCalls = toolCalls.length > 0;
      const content = hasToolCalls ? "" : extractContent(result);

      const usage = result.response.usageMetadata;

      return {
        content,
        hasToolCalls,
        toolCalls,
        raw: result,
        provider: "gemini",
        model,
        usage: usage
          ? {
              inputTokens: usage.promptTokenCount,
              outputTokens: usage.candidatesTokenCount,
              totalTokens: usage.totalTokenCount,
            }
          : undefined,
      };
    },

    async completeWithToolResults(
      options: ToolFollowUpOptions
    ): Promise<CompletionResponse> {
      const genAI = getGenAI();
      const { systemInstruction, contents } = toGeminiMessages(options.messages);

      // Add the model's function call response
      const originalResult = options.originalResponse.raw as GenerateContentResult;
      const modelParts = originalResult.response.candidates?.[0]?.content?.parts ?? [];

      contents.push({
        role: "model",
        parts: modelParts,
      });

      // Add function response(s)
      const responseParts: Part[] = options.toolResults.map((tr) => ({
        functionResponse: {
          name:
            options.originalResponse.toolCalls.find((tc) => tc.id === tr.toolCallId)
              ?.name ?? "unknown",
          response: JSON.parse(tr.content),
        },
      }));

      contents.push({
        role: "user",
        parts: responseParts,
      });

      const modelInstance = genAI.getGenerativeModel({
        model,
        ...(systemInstruction ? { systemInstruction } : {}),
        generationConfig: {
          temperature: options.temperature ?? 0.6,
          maxOutputTokens: options.maxTokens ?? 2000,
        },
      });

      const result = await modelInstance.generateContent({ contents });

      const usage = result.response.usageMetadata;

      return {
        content: extractContent(result),
        hasToolCalls: false,
        toolCalls: [],
        raw: result,
        provider: "gemini",
        model,
        usage: usage
          ? {
              inputTokens: usage.promptTokenCount,
              outputTokens: usage.candidatesTokenCount,
              totalTokens: usage.totalTokenCount,
            }
          : undefined,
      };
    },
  };
}
