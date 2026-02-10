// lib/ai/providers/anthropic.ts
// ─────────────────────────────────────────────────────────────────
// Anthropic (Claude) provider implementation.
// Supports: claude-sonnet-4-20250514, claude-3-5-haiku-20241022, etc.
// Features: Tool use, 200K context, superior writing quality.
//
// ENV: ANTHROPIC_API_KEY
// ─────────────────────────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import type {
  AIProviderClient,
  CompletionOptions,
  CompletionResponse,
  ToolFollowUpOptions,
  ChatMessage,
  ToolDefinition,
  ToolCall,
} from "../types";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("[Anthropic Provider] ANTHROPIC_API_KEY is not set");
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

/** Anthropic uses a separate `system` parameter — split it out */
function splitSystemMessage(messages: ChatMessage[]): {
  system: string | undefined;
  userMessages: Array<{ role: "user" | "assistant"; content: string }>;
} {
  let system: string | undefined;
  const userMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const m of messages) {
    if (m.role === "system") {
      system = (system ? system + "\n\n" : "") + m.content;
    } else {
      userMessages.push({ role: m.role, content: m.content });
    }
  }

  return { system, userMessages };
}

/** Convert universal tool definitions to Anthropic format */
function toAnthropicTools(tools: ToolDefinition[]): Anthropic.Tool[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters as Anthropic.Tool["input_schema"],
  }));
}

/** Extract tool calls from Anthropic response */
function extractToolCalls(response: Anthropic.Message): ToolCall[] {
  const calls: ToolCall[] = [];
  for (const block of response.content) {
    if (block.type === "tool_use") {
      calls.push({
        id: block.id,
        name: block.name,
        arguments: block.input as Record<string, unknown>,
      });
    }
  }
  return calls;
}

/** Extract text content from Anthropic response */
function extractContent(response: Anthropic.Message): string {
  const textBlocks = response.content.filter((b) => b.type === "text");
  return textBlocks.map((b) => (b as Anthropic.TextBlock).text).join("\n");
}

export function createAnthropicProvider(model: string): AIProviderClient {
  return {
    provider: "anthropic",

    get isConfigured() {
      return !!process.env.ANTHROPIC_API_KEY;
    },

    async complete(options: CompletionOptions): Promise<CompletionResponse> {
      const client = getClient();
      const { system, userMessages } = splitSystemMessage(options.messages);

      const params: Anthropic.MessageCreateParamsNonStreaming = {
        model,
        max_tokens: options.maxTokens ?? 2000,
        messages: userMessages,
        ...(system ? { system } : {}),
        ...(options.temperature !== undefined
          ? { temperature: options.temperature }
          : {}),
      };

      // Add tools if provided
      if (options.tools?.length) {
        params.tools = toAnthropicTools(options.tools);
      }

      const response = await client.messages.create(params);

      const toolCalls = extractToolCalls(response);
      const hasToolCalls = response.stop_reason === "tool_use" && toolCalls.length > 0;
      const content = extractContent(response);

      return {
        content,
        hasToolCalls,
        toolCalls,
        raw: response,
        provider: "anthropic",
        model,
        usage: {
          inputTokens: response.usage?.input_tokens,
          outputTokens: response.usage?.output_tokens,
          totalTokens:
            (response.usage?.input_tokens ?? 0) +
            (response.usage?.output_tokens ?? 0),
        },
      };
    },

    async completeWithToolResults(
      options: ToolFollowUpOptions
    ): Promise<CompletionResponse> {
      const client = getClient();
      const { system, userMessages } = splitSystemMessage(options.messages);

      // Reconstruct the Anthropic message chain:
      // 1. Original user/assistant messages
      // 2. The assistant's tool_use response
      // 3. User's tool_result messages
      const originalRaw = options.originalResponse.raw as Anthropic.Message;

      const messages: Anthropic.MessageParam[] = [
        ...userMessages,
        // The assistant's response with tool_use blocks
        { role: "assistant" as const, content: originalRaw.content },
        // Tool results
        {
          role: "user" as const,
          content: options.toolResults.map((tr) => ({
            type: "tool_result" as const,
            tool_use_id: tr.toolCallId,
            content: tr.content,
          })),
        },
      ];

      const response = await client.messages.create({
        model,
        max_tokens: options.maxTokens ?? 2000,
        messages,
        ...(system ? { system } : {}),
        ...(options.temperature !== undefined
          ? { temperature: options.temperature }
          : {}),
      });

      return {
        content: extractContent(response),
        hasToolCalls: false,
        toolCalls: [],
        raw: response,
        provider: "anthropic",
        model,
        usage: {
          inputTokens: response.usage?.input_tokens,
          outputTokens: response.usage?.output_tokens,
          totalTokens:
            (response.usage?.input_tokens ?? 0) +
            (response.usage?.output_tokens ?? 0),
        },
      };
    },
  };
}
