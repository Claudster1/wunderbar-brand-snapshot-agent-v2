// lib/ai/types.ts
// ─────────────────────────────────────────────────────────────────
// Shared types for the multi-provider AI abstraction layer.
// All providers implement the same interface so routes can swap
// models without changing business logic.
// ─────────────────────────────────────────────────────────────────

/** Supported LLM providers */
export type AIProvider = "openai" | "anthropic" | "gemini";

/** A chat message in the universal format */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Tool/function definition (provider-agnostic) */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/** A tool call returned by the model */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/** Tool result to send back after executing a tool */
export interface ToolResult {
  toolCallId: string;
  content: string;
}

/** Options for a chat completion request */
export interface CompletionOptions {
  /** Messages (system + conversation history) */
  messages: ChatMessage[];
  /** Sampling temperature (0-2, default: 0.6) */
  temperature?: number;
  /** Max tokens to generate (default: 2000) */
  maxTokens?: number;
  /** Tools the model can call (optional) */
  tools?: ToolDefinition[];
  /** Force JSON output format (default: false) */
  jsonMode?: boolean;
}

/** Standardized completion response */
export interface CompletionResponse {
  /** The text content of the response */
  content: string;
  /** Whether the model requested a tool call instead of returning text */
  hasToolCalls: boolean;
  /** Tool calls requested by the model (empty if hasToolCalls is false) */
  toolCalls: ToolCall[];
  /** Raw provider-specific response (for advanced use cases) */
  raw: unknown;
  /** Provider that handled this request */
  provider: AIProvider;
  /** Model used */
  model: string;
  /** Approximate token usage (if available) */
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

/** Options for continuing after a tool call */
export interface ToolFollowUpOptions {
  /** Original messages that led to the tool call */
  messages: ChatMessage[];
  /** The original completion response containing tool calls */
  originalResponse: CompletionResponse;
  /** Results of executing the tools */
  toolResults: ToolResult[];
  /** Temperature for the follow-up */
  temperature?: number;
  /** Max tokens for the follow-up */
  maxTokens?: number;
}

/** Interface every provider must implement */
export interface AIProviderClient {
  /** Provider identifier */
  readonly provider: AIProvider;
  /** Whether this provider is configured (has API keys) */
  readonly isConfigured: boolean;
  /** Run a chat completion */
  complete(options: CompletionOptions): Promise<CompletionResponse>;
  /** Continue a conversation after tool execution */
  completeWithToolResults(options: ToolFollowUpOptions): Promise<CompletionResponse>;
}
