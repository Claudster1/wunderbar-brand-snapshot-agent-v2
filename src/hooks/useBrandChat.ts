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

      // Check if the response is JSON with scores (should NOT be displayed in chat)
      const isJsonResponse = replyText.trim().startsWith('{') && 
                            replyText.includes('"scores"') && 
                            replyText.includes('"brandAlignmentScore"');

      if (isJsonResponse) {
        // This is the scoring JSON - extract it and send to parent, but DON'T add to chat
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

            // If this JSON has email, it's the final output - save to DB and sync to AC
            if (snapshotData.user?.email && typeof snapshotData.optIn === 'boolean') {
              // Import dynamically to avoid SSR issues
              const { saveReportAndSync } = await import('../services/reportService');
              const result = await saveReportAndSync(snapshotData);
              
              if (result.success) {
                console.log('[useBrandChat] Report saved and synced:', result.reportId);
                // Add a success message to chat
                const successMessage = createMessage(
                  'assistant',
                  `Perfect! I've saved your Brand Snapshot™. Check your email for your detailed report link.`
                );
                setMessages((prev) => [...prev, successMessage]);
              } else {
                console.error('[useBrandChat] Failed to save/sync report:', result.error);
              }
            } else {
              // JSON with scores but no email yet - agent will ask for email next
              // Don't add JSON to chat, just wait for next response
              // The agent should follow up with email request
            }
          }
        } catch (parseError) {
          // Not valid JSON - treat as normal message
          console.debug('[useBrandChat] JSON parse failed:', parseError);
          const assistantMessage = createMessage('assistant', replyText);
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } else {
        // Normal text response - add to chat as usual
        const assistantMessage = createMessage('assistant', replyText);
        setMessages((prev) => [...prev, assistantMessage]);
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
