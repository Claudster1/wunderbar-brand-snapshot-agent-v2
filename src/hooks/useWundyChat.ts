// src/hooks/useWundyChat.ts
// Reusable hook for Wundy chat in both General Guide and Report Companion modes.

import { useState, useCallback, useRef } from "react";

export type WundyChatMessage = {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
};

export type WundyChatMode = "general" | "report";

/** Auto-appended context for support requests — never shown to user or LLM */
export type WundySessionMeta = {
  userId?: string;
  stripeSessionId?: string;
  acContactId?: string;
};

type UseWundyChatOptions = {
  /** Chat mode: "general" for everyone, "report" for paid tiers with report access */
  mode: WundyChatMode;
  /** Report ID — required for "report" mode */
  reportId?: string;
  /** Product tier — required for "report" mode */
  tier?: "snapshot-plus" | "blueprint" | "blueprint-plus";
  /** Optional greeting message from Wundy */
  greeting?: string;
  /** Auto-collected session metadata for support requests */
  sessionMeta?: WundySessionMeta;
};

const DEFAULT_GREETINGS: Record<WundyChatMode, string> = {
  general:
    "Hi, I'm Wundy — your brand guide. I can help you understand branding concepts, learn about our products, or figure out which Brand Snapshot product is right for you. What can I help with?",
  report:
    "Hi, I'm Wundy — I have your report right here. I can help you understand your scores, explain any section, or help you prioritize your next steps. What would you like to know?",
};

export function useWundyChat(options: UseWundyChatOptions) {
  const { mode, reportId, tier, greeting, sessionMeta } = options;

  const greetingMsg: WundyChatMessage = {
    role: "assistant",
    text: greeting || DEFAULT_GREETINGS[mode],
    timestamp: Date.now(),
  };

  const [messages, setMessages] = useState<WundyChatMessage[]>([greetingMsg]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading) return;

      setError(null);

      const userMessage: WundyChatMessage = {
        role: "user",
        text: userText.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Build API messages (exclude greeting for cleaner context)
      const allMessages = [...messages, userMessage];
      const apiMessages = allMessages.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      try {
        // Cancel any in-flight request
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const response = await fetch("/api/wundy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            messages: apiMessages,
            ...(mode === "report" ? { reportId, tier } : {}),
            ...(sessionMeta ? { sessionMeta } : {}),
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error || "Something went wrong. Please try again."
          );
        }

        const data = await response.json();
        const assistantMessage: WundyChatMessage = {
          role: "assistant",
          text: data.content,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setError(msg);
        // Add error as assistant message so user sees it
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Sorry, I ran into an issue. Could you try again?",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, mode, reportId, tier, sessionMeta]
  );

  const clearChat = useCallback(() => {
    setMessages([greetingMsg]);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    mode,
  };
}
