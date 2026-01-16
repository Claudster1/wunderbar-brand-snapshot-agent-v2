// src/hooks/useBrandChat.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  BrandChatMessage,
  getBrandSnapshotReply,
} from '../services/openaiService';
import { useGenerateReport } from './useGenerateReport';

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
  `Hi, I'm Wundy. I'll guide you through a few questions to build your Brand Snapshot™.

Before we continue — quick note: this will only take a few minutes, and there's no right or wrong answer. The clearer your answers, the more useful your Brand Snapshot™ will be.

Ready to begin?`
);

export function useBrandChat() {
  const [messages, setMessages] = useState<BrandChatMessage[]>([
    INITIAL_ASSISTANT_MESSAGE,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const router = useRouter();
  const { generateReport, loading: pdfLoading } = useGenerateReport();
  const isInitialized = useRef(false);

  // Initialize: create draft report or load resume
  useEffect(() => {
    if (isInitialized.current || typeof window === 'undefined') return;
    isInitialized.current = true;

    // Check for resume query param
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('resume');
    
    if (resumeId) {
      // Load existing progress
      fetch(`/api/snapshot/resume?reportId=${resumeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.reportId && data.progress) {
            setReportId(data.reportId);
            // Restore messages from progress if available
            if (data.progress.messages && Array.isArray(data.progress.messages)) {
              setMessages(data.progress.messages);
            }
          }
        })
        .catch((err) => {
          console.error('[useBrandChat] Error loading resume:', err);
        });
    } else {
      // Create new draft report
      fetch('/api/snapshot/draft', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.reportId) {
            setReportId(data.reportId);
          }
        })
        .catch((err) => {
          console.error('[useBrandChat] Error creating draft:', err);
        });
    }
  }, []);

  // Extract answers from conversation history
  const extractAnswers = (history: BrandChatMessage[]): Record<string, any> => {
    const answers: Record<string, any> = {};
    const userMessages = history.filter((m) => m.role === 'user');
    
    // Extract key information from conversation
    userMessages.forEach((msg, index) => {
      // Store user responses
      answers[`response_${index}`] = msg.text;
    });
    
    // Extract structured data if available
    const conversationText = userMessages.map((m) => m.text).join(' ').toLowerCase();
    
    // Business name
    const businessNameMatch = conversationText.match(/business.*?name[:\s]+([^\n,\.]+)/i);
    if (businessNameMatch) {
      answers.businessName = businessNameMatch[1].trim();
    }
    
    // Website
    if (conversationText.includes('website') && conversationText.includes('yes')) {
      answers.hasWebsite = true;
    }
    
    // Industry
    const industryMatch = conversationText.match(/industry[:\s]+([^\n,\.]+)/i);
    if (industryMatch) {
      answers.industry = industryMatch[1].trim();
    }
    
    return answers;
  };

  // Save progress after assistant responds
  const saveProgress = async (step: string, history: BrandChatMessage[]) => {
    if (!reportId) return;
    
    const answers = extractAnswers(history);
    
    try {
      await fetch('/api/snapshot/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          lastStep: step,
          progress: {
            ...answers,
            messages: history,
            lastUpdated: new Date().toISOString(),
          },
        }),
      });
    } catch (err) {
      console.error('[useBrandChat] Error saving progress:', err);
    }
  };

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

            // Update draft report status to completed
            if (reportId) {
              try {
                await fetch('/api/snapshot/progress', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    reportId,
                    lastStep: 'completed',
                    progress: {
                      ...extractAnswers(nextHistory),
                      completed: true,
                      completedAt: new Date().toISOString(),
                    },
                  }),
                });
                
                // Update report status to completed
                await fetch('/api/snapshot/complete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    reportId,
                    status: 'completed',
                  }),
                });
              } catch (err) {
                console.error('[useBrandChat] Error updating report status:', err);
              }
            }

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
                
                // Generate PDF and get report ID
                const pdfPayload = {
                  userName: userContext.firstName || companyInfo.company_name || 'User',
                  businessName: companyInfo.company_name || '',
                  brandAlignmentScore,
                  pillarScores,
                  pillarInsights,
                  recommendations: Array.isArray(recommendations) 
                    ? recommendations 
                    : Object.values(recommendations).filter((r: any) => typeof r === 'string'),
                  suggestedPalette: snapshotData.suggestedPalette || snapshotData.colorPalette || snapshotData.color_palette || [],
                };

                const pdfResult = await generateReport(pdfPayload);
                
                // Use PDF report ID if available, otherwise use save report ID
                const finalReportId = pdfResult?.reportId || saveResult.reportId;
                const redirectUrl = saveResult.redirectUrl || `/report/${finalReportId}`;
                
                // Send scores to parent page via postMessage (for visual display)
                if (typeof window !== 'undefined') {
                  // Check if we're in an iframe
                  if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                      type: 'BRAND_SNAPSHOT_COMPLETE',
                      data: {
                        ...scoresPayload,
                        report_id: finalReportId,
                        redirectUrl,
                      }
                    }, '*');
                    console.log('[useBrandChat] postMessage sent to parent window with redirectUrl:', redirectUrl);
                  } else {
                    console.warn('[useBrandChat] Not in an iframe - cannot send postMessage to parent');
                    // If not in iframe, redirect directly
                    if (finalReportId) {
                      router.push(`/report/${finalReportId}`);
                    }
                  }
                  
                  // Store redirect URL for potential redirect
                  if (saveResult.success && redirectUrl) {
                    (window as any).__snapshotRedirectUrl = redirectUrl;
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
              const finalHistory = [...nextHistory, handoffMessage];
              setMessages(finalHistory);
              
              // Save progress with completion step
              saveProgress('handoff', finalHistory);
            } else {
              // Save progress even if no handoff message
              saveProgress('completed', nextHistory);
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
          const updatedHistory = [...nextHistory, assistantMessage];
          setMessages(updatedHistory);
          
          // Save progress after assistant responds
          // Use message count as step identifier
          const step = `step_${updatedHistory.filter(m => m.role === 'assistant').length}`;
          saveProgress(step, updatedHistory);
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
