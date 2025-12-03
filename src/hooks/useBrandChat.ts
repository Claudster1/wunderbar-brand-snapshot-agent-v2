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
// Must match the system prompt's first greeting exactly
const INITIAL_ASSISTANT_MESSAGE = createMessage(
  'assistant',
  `Hi! I'm Wundy. I'll guide you through a few quick questions so I can learn about your business and create your personalized Brand Snapshot™.`
);

export function useBrandChat() {
  const [messages, setMessages] = useState<BrandChatMessage[]>([
    INITIAL_ASSISTANT_MESSAGE,
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return; // Prevent double submission

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
      // Only process if response looks like JSON (starts with { and contains scores)
      if (replyText.trim().startsWith('{') && replyText.includes('"scores"') && replyText.includes('"brandAlignmentScore"')) {
        try {
          const snapshotData = JSON.parse(replyText.trim());
          
          // Verify it has the expected structure
          if (snapshotData.scores && typeof snapshotData.scores.brandAlignmentScore === 'number') {
            // Send scores to parent page via postMessage (for visual display)
            if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
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

            // Check if this is the final JSON (has email and optIn) - then save to DB and sync to AC
            if (snapshotData.user?.email && typeof snapshotData.optIn === 'boolean') {
              // Import dynamically to avoid SSR issues and reduce bundle size
              const { saveReportAndSync } = await import('../services/reportService');
              const result = await saveReportAndSync(snapshotData);
              
              if (result.success) {
                console.log('[useBrandChat] Report saved and synced:', result.reportId);
              } else {
                console.error('[useBrandChat] Failed to save/sync report:', result.error);
              }
            }
          }
        } catch (parseError) {
          // Not valid JSON or parsing failed - that's okay, continue normally
          console.debug('[useBrandChat] JSON parse failed:', parseError);
        }
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
