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
  `Hi! I'm Wundy 👋 I'll walk you through a few guided questions to build your personalized Brand Snapshot™. Ready when you are.`
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
      // Try to extract JSON from the response (might have whitespace or other text)
      const trimmedReply = replyText.trim();
      let jsonMatch = trimmedReply.match(/\{[\s\S]*"scores"[\s\S]*"brandAlignmentScore"[\s\S]*\}/);
      
      // If no match, check if the whole response is JSON
      if (!jsonMatch && trimmedReply.startsWith('{') && trimmedReply.endsWith('}')) {
        jsonMatch = [trimmedReply];
      }

      if (jsonMatch && jsonMatch[0]) {
        // This is the scoring JSON - extract it and send to parent, but DON'T add to chat
        try {
          const jsonString = jsonMatch[0];
          const snapshotData = JSON.parse(jsonString);
          
          console.log('[useBrandChat] Detected JSON response with scores:', snapshotData);
          
          // Verify it has the expected structure
          if (snapshotData.scores && typeof snapshotData.scores.brandAlignmentScore === 'number') {
            const scoresPayload = {
              brandAlignmentScore: snapshotData.scores.brandAlignmentScore,
              pillarScores: {
                positioning: snapshotData.scores.positioning || 0,
                messaging: snapshotData.scores.messaging || 0,
                visibility: snapshotData.scores.visibility || 0,
                credibility: snapshotData.scores.credibility || 0,
                conversion: snapshotData.scores.conversion || 0,
              }
            };
            
            console.log('[useBrandChat] Sending scores to parent:', scoresPayload);
            
            // Send scores to parent page via postMessage (for visual display)
            if (typeof window !== 'undefined') {
              // Check if we're in an iframe
              if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                  type: 'BRAND_SNAPSHOT_COMPLETE',
                  data: scoresPayload
                }, '*');
                console.log('[useBrandChat] postMessage sent to parent window');
              } else {
                console.warn('[useBrandChat] Not in an iframe - cannot send postMessage to parent');
              }
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
              // JSON with scores but no email yet - agent will send handoff message
              // Don't add JSON to chat, just wait for next response
              // The agent will direct user to the form on the parent page (no email collection in chat)
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
