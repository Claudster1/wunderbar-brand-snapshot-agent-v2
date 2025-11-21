// src/hooks/useBrandChat.ts
import { useState } from 'react';
import {
  BrandChatMessage,
  getBrandSnapshotReply,
} from '../services/openaiService';

const createMessage = (
  role: BrandChatMessage['role'],
  text: string
): BrandChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  text,
});

// First assistant message that appears in the chat
const INITIAL_ASSISTANT_MESSAGE = createMessage(
  'assistant',
  `Hi, I’m your Brand Snapshot™ guide. 

We’ll walk through a quick Q&A about your business, audience, and offers so I can calculate your Brand Alignment Score™ and highlight where your brand is strong—and where it’s losing momentum.

To start, tell me in a sentence or two what your business does and who you primarily serve.`
);

export function useBrandChat() {
  const [messages, setMessages] = useState<BrandChatMessage[]>([
    INITIAL_ASSISTANT_MESSAGE,
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = createMessage('user', trimmed);

    // Optimistically add the user message to the UI
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setIsLoading(true);

    try {
      const replyText = await getBrandSnapshotReply(nextHistory);
      const assistantMessage = createMessage('assistant', replyText);

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = createMessage(
        'assistant',
        'I ran into an issue generating a response. Please try again.'
      );
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setMessages([INITIAL_ASSISTANT_MESSAGE]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    reset,
  };
}


