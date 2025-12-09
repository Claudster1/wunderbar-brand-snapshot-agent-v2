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
  `Hi! I'm Wundy 🐾 I'll walk you through a few guided questions to build your personalized Brand Snapshot™. Ready when you are.`
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

      // Check if the response contains JSON with scores (should NOT be displayed in chat)
      const trimmedReply = replyText.trim();
      
      // Try multiple patterns to find JSON
      let jsonMatch = trimmedReply.match(/\{[\s\S]*"scores"[\s\S]*"brandAlignmentScore"[\s\S]*\}/);
      
      // If no match, try finding any JSON object
      if (!jsonMatch) {
        jsonMatch = trimmedReply.match(/\{[\s\S]*"brandAlignmentScore"[\s\S]*\}/);
      }
      
      // If still no match, check if the whole response is JSON
      if (!jsonMatch && trimmedReply.startsWith('{') && trimmedReply.endsWith('}')) {
        jsonMatch = [trimmedReply];
      }

      if (jsonMatch && jsonMatch[0]) {
        // This is the scoring JSON - extract it and send to parent, but DON'T add to chat
        try {
          const jsonString = jsonMatch[0];
          const snapshotData = JSON.parse(jsonString);
          
          console.log('[useBrandChat] Detected JSON response with scores:', snapshotData);
          
          // Verify it has the expected structure (new format without nested "scores" object)
          // Support both old format (with nested "scores") and new format (flat structure)
          let brandAlignmentScore: number;
          let pillarScores: any;
          let pillarInsights: any = {};
          let recommendations: any = {};
          
          if (snapshotData.scores && typeof snapshotData.scores.brandAlignmentScore === 'number') {
            // Old format with nested "scores" object
            brandAlignmentScore = snapshotData.scores.brandAlignmentScore;
            pillarScores = {
              positioning: snapshotData.scores.positioning || 0,
              messaging: snapshotData.scores.messaging || 0,
              visibility: snapshotData.scores.visibility || 0,
              credibility: snapshotData.scores.credibility || 0,
              conversion: snapshotData.scores.conversion || 0,
            };
          } else if (typeof snapshotData.brandAlignmentScore === 'number' && snapshotData.pillarScores) {
            // New format with flat structure
            brandAlignmentScore = snapshotData.brandAlignmentScore;
            pillarScores = {
              positioning: snapshotData.pillarScores.positioning || 0,
              messaging: snapshotData.pillarScores.messaging || 0,
              visibility: snapshotData.pillarScores.visibility || 0,
              credibility: snapshotData.pillarScores.credibility || 0,
              conversion: snapshotData.pillarScores.conversion || 0,
            };
            pillarInsights = snapshotData.pillarInsights || {};
            recommendations = snapshotData.recommendations || {};
          } else {
            throw new Error('Invalid JSON structure');
          }
          
          if (brandAlignmentScore !== undefined && pillarScores) {
            const scoresPayload = {
              brandAlignmentScore,
              pillarScores,
              pillarInsights,
              recommendations
            };
            
            console.log('[useBrandChat] Sending scores to parent:', scoresPayload);
            
            // Extract user context from conversation for report generation
            const { extractUserContext, extractCompanyInfo } = await import('../services/snapshotService');
            const userContext = extractUserContext(nextHistory);
            const companyInfo = extractCompanyInfo(nextHistory);

            // Save report and get redirect URL
            try {
              const saveResponse = await fetch('/api/save-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  brandAlignmentScore,
                  pillarScores,
                  pillarInsights,
                  recommendations,
                  userContext,
                  userName: companyInfo.company_name, // Will be updated when form is submitted
                  company: companyInfo.company_name,
                  websiteNotes: companyInfo.website,
                }),
              });

              if (saveResponse.ok) {
                const saveResult = await saveResponse.json();
                
                // Send scores to parent page via postMessage (for visual display)
                if (typeof window !== 'undefined') {
                  // Check if we're in an iframe
                  if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                      type: 'BRAND_SNAPSHOT_COMPLETE',
                      data: {
                        ...scoresPayload,
                        report_id: saveResult.reportId,
                        redirectUrl: saveResult.redirectUrl,
                      }
                    }, '*');
                    console.log('[useBrandChat] postMessage sent to parent window with redirectUrl:', saveResult.redirectUrl);
                  } else {
                    console.warn('[useBrandChat] Not in an iframe - cannot send postMessage to parent');
                  }
                  
                  // Store redirect URL for potential redirect
                  if (saveResult.success && saveResult.redirectUrl) {
                    (window as any).__snapshotRedirectUrl = saveResult.redirectUrl;
                  }
                }
              } else {
                console.error('[useBrandChat] Failed to save report:', await saveResponse.text());
              }
            } catch (saveError) {
              console.error('[useBrandChat] Error saving report:', saveError);
              // Still send scores to parent even if save fails
              if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
                window.parent.postMessage({
                  type: 'BRAND_SNAPSHOT_COMPLETE',
                  data: scoresPayload
                }, '*');
              }
            }

            // Extract any text before the JSON (handoff message) - but filter out score text
            const textBeforeJson = trimmedReply.substring(0, jsonMatch.index || 0).trim();
            
            // Filter out score-related text patterns
            const scorePatterns = [
              /Brand Alignment Score[™]?:?\s*\d+/i,
              /Pillar Breakdown/i,
              /Positioning:\s*\d+/i,
              /Messaging:\s*\d+/i,
              /Visibility:\s*\d+/i,
              /Credibility:\s*\d+/i,
              /Conversion:\s*\d+/i,
              /\d+\/100/i,
              /\d+\/20/i,
            ];
            
            let cleanText = textBeforeJson;
            scorePatterns.forEach(pattern => {
              cleanText = cleanText.replace(pattern, '');
            });
            cleanText = cleanText.trim();
            
            // Only add handoff message if it exists and doesn't contain scores
            if (cleanText && cleanText.length > 0 && !/\d+/.test(cleanText)) {
              const handoffMessage = createMessage('assistant', cleanText);
              setMessages((prev) => [...prev, handoffMessage]);
            }
            
            // Don't add JSON to chat - it's only for the parent page
            // The scores will appear below the chatbox via postMessage
          }
        } catch (parseError) {
          // Not valid JSON - treat as normal message
          console.debug('[useBrandChat] JSON parse failed:', parseError);
          const assistantMessage = createMessage('assistant', replyText);
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } else {
        // Check if response contains score numbers but no JSON (should also be filtered)
        const hasScoreNumbers = /\b\d+\/100\b|\b\d+\/20\b|Brand Alignment Score[™]?:?\s*\d+/i.test(replyText);
        
        if (hasScoreNumbers) {
          // This looks like scores displayed as text - don't add to chat
          console.log('[useBrandChat] Detected score text in response - filtering out');
          // Try to extract just a handoff message if present
          const handoffMatch = replyText.match(/(?:Perfect!|Great!|Here's|Your).*?(?:form|below|details|enter)/i);
          if (handoffMatch) {
            const handoffMessage = createMessage('assistant', handoffMatch[0]);
            setMessages((prev) => [...prev, handoffMessage]);
          }
        } else {
          // Normal text response - add to chat as usual
          const assistantMessage = createMessage('assistant', replyText);
          setMessages((prev) => [...prev, assistantMessage]);
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
