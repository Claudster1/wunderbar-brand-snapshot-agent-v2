// lib/ai/providers/openai.ts
// ─────────────────────────────────────────────────────────────────
// OpenAI provider implementation.
// Supports: GPT-4o, GPT-4o-mini, GPT-4-turbo, o1-mini, etc.
// Features: Full function/tool calling support.
// ─────────────────────────────────────────────────────────────────

import OpenAI from "openai";
import type {
  AIProviderClient,
  CompletionOptions,
  CompletionResponse,
  ToolFollowUpOptions,
  ChatMessage,
  ToolDefinition,
  ToolCall,
} from "../types";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("[OpenAI Provider] OPENAI_API_KEY is not set");
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

/** Convert universal messages to OpenAI format */
function toOpenAIMessages(
  messages: ChatMessage[]
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

/** Convert universal tool definitions to OpenAI format */
function toOpenAITools(
  tools: ToolDefinition[]
): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

/** Extract tool calls from OpenAI response */
function extractToolCalls(
  choice: OpenAI.Chat.Completions.ChatCompletion.Choice
): ToolCall[] {
  if (!choice.message?.tool_calls?.length) return [];
  return choice.message.tool_calls
    .filter((tc: any) => tc.type === "function" && tc.function)
    .map((tc: any) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    }));
}

export function createOpenAIProvider(model: string): AIProviderClient {
  return {
    provider: "openai",

    get isConfigured() {
      return !!process.env.OPENAI_API_KEY;
    },

    async complete(options: CompletionOptions): Promise<CompletionResponse> {
      const client = getClient();

      const params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
        model,
        messages: toOpenAIMessages(options.messages),
        temperature: options.temperature ?? 0.6,
        max_tokens: options.maxTokens ?? 2000,
      };

      // Add tools if provided
      if (options.tools?.length) {
        params.tools = toOpenAITools(options.tools);
      }

      // JSON mode
      if (options.jsonMode) {
        params.response_format = { type: "json_object" };
      }

      const completion = await client.chat.completions.create(params);
      const choice = completion.choices?.[0];

      const toolCalls = extractToolCalls(choice);
      const hasToolCalls =
        choice?.finish_reason === "tool_calls" && toolCalls.length > 0;

      return {
        content: choice?.message?.content ?? "",
        hasToolCalls,
        toolCalls,
        raw: completion,
        provider: "openai",
        model,
        usage: completion.usage
          ? {
              inputTokens: completion.usage.prompt_tokens,
              outputTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
      };
    },

    async completeWithToolResults(
      options: ToolFollowUpOptions
    ): Promise<CompletionResponse> {
      const client = getClient();

      // Reconstruct the full message chain including the tool call + results
      const rawCompletion = options.originalResponse.raw as OpenAI.Chat.Completions.ChatCompletion;
      const assistantMessage = rawCompletion.choices?.[0]?.message;

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        ...toOpenAIMessages(options.messages),
        ...(assistantMessage ? [assistantMessage] : []),
        ...options.toolResults.map((tr) => ({
          role: "tool" as const,
          tool_call_id: tr.toolCallId,
          content: tr.content,
        })),
      ];

      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature: options.temperature ?? 0.6,
        max_tokens: options.maxTokens ?? 2000,
      });

      const choice = completion.choices?.[0];

      return {
        content: choice?.message?.content ?? "",
        hasToolCalls: false,
        toolCalls: [],
        raw: completion,
        provider: "openai",
        model,
        usage: completion.usage
          ? {
              inputTokens: completion.usage.prompt_tokens,
              outputTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
      };
    },
  };
}
