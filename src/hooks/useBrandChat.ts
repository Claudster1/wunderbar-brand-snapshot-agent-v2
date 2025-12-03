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
  `Hi! I'm Wundy. I'll walk you through a short Q&A about your business so we can

calculate your Brand Alignment Score™.



To start, tell me in a sentence or two what your business does and who you primarily serve.

`
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

      // Check if the response contains JSON with scores (final output)
      try {
        // Look for JSON in the message (could be wrapped in code blocks or plain)
        const jsonMatch = replyText.match(/\{[\s\S]*"scores"[\s\S]*"brandAlignmentScore"[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const snapshotData = JSON.parse(jsonStr);
          
          // Verify it has the expected structure
          if (snapshotData.scores && snapshotData.scores.brandAlignmentScore !== undefined) {
            // Send scores to parent page via postMessage
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({
                type: 'BRAND_SNAPSHOT_COMPLETE',
                data: {
                  brandAlignmentScore: snapshotData.scores.brandAlignmentScore,
                  pillarScores: {
                    positioning: snapshotData.scores.positioning || 0,
                    messaging: snapshotData.scores.messaging || 0,
                    visibility: snapshotData.scores.visibility || 0,
                    credibility: snapshotData.scores.credibility || 0,
                    conversion: snapshotData.scores.conversion || 0,
                  }
                }
              }, '*');
            }
          }
        }
      } catch (parseError) {
        // Not JSON or parsing failed - that's okay, continue normally
        console.debug('[useBrandChat] No JSON found in response or parse failed:', parseError);
      }
    } catch (err: any) {
      console.error('[useBrandChat] Error:', err);
      const errorMessage = createMessage(
        'assistant',
        err?.message || 'I ran into an issue generating a response. Please try again.'
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
