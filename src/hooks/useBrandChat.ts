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

// Total questions in the diagnostic (used for progress tracking and resume context)
const TOTAL_QUESTIONS = 41;

// First assistant message that appears in the chat
// Must match the system prompt's first greeting exactly
const INITIAL_ASSISTANT_MESSAGE = createMessage(
  'assistant',
  `Hi, I'm Wundy™ — your brand guide. I'll walk you through a short conversation to build your WunderBrand Snapshot™.

This takes about 15–20 minutes. There are no wrong answers, and you don't need anything prepared — but if you have your website, a sense of your competitors, and your target audience in mind, your results will be even sharper.

Ready when you are — what's your name?`
);

// ─── Resume: Extract first name from saved conversation ───
function extractFirstNameFromHistory(msgs: BrandChatMessage[]): string | null {
  // The first user message is usually their name
  const firstUserMsg = msgs.find((m) => m.role === 'user');
  if (!firstUserMsg) return null;
  const text = firstUserMsg.text.trim();
  // Strip common prefixes
  const cleaned = text
    .replace(/^(hi[,!.]?\s*)?/i, '')
    .replace(/^(hey[,!.]?\s*)?/i, '')
    .replace(/^(hello[,!.]?\s*)?/i, '')
    .replace(/^(my name is|i'?\s*m|i am|it'?\s*s|call me|they call me|you can call me)\s+/i, '')
    .replace(/[.!,]+$/, '')
    .trim();
  const name = cleaned.split(/\s+/)[0] || text;
  if (!name || name.length > 30) return null;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// ─── Resume: Detect what topic Wundy was discussing ───
const TOPIC_SIGNALS: [RegExp, string][] = [
  [/position(ing)?|unique|differentiat|stand\s*out|competitive\s+advantage/i, 'your brand positioning'],
  [/messag(e|ing)|tagline|value\s+prop|tone|voice|headline/i, 'your brand messaging'],
  [/visib(le|ility)|channel|social\s+media|marketing|advertis|SEO|content|audience\s+reach/i, 'your brand visibility'],
  [/credib(le|ility)|trust|testimonial|review|proof|authority|reputation/i, 'your brand credibility'],
  [/conver(t|sion)|funnel|leads?|sales|CTA|call.to.action|customer\s+journey|landing\s+page/i, 'your conversion strategy'],
  [/competitor|compet(e|ition)|rival|alternative/i, 'your competitive landscape'],
  [/audience|customer|ideal\s+client|target\s+market|buyer|persona/i, 'your target audience'],
  [/website|online\s+presence|domain/i, 'your online presence'],
  [/business|company|industry|what\s+you\s+do/i, 'your business'],
];

function detectLastTopic(msgs: BrandChatMessage[]): string {
  // Look at the last 2 assistant messages for topic context
  const assistantMsgs = msgs.filter((m) => m.role === 'assistant');
  const recent = assistantMsgs.slice(-2);
  for (const msg of recent.reverse()) {
    for (const [pattern, label] of TOPIC_SIGNALS) {
      if (pattern.test(msg.text)) return label;
    }
  }
  return 'your brand';
}

// ─── Resume: Build personalized welcome-back message ───
function buildResumeGreeting(
  firstName: string | null,
  lastTopic: string,
  questionsAnswered: number,
  totalQuestions: number
): string {
  const name = firstName || 'there';
  const pctComplete = Math.round((questionsAnswered / totalQuestions) * 100);

  // Contextual encouragement based on progress
  let progressNote: string;
  if (pctComplete < 30) {
    progressNote = "We're just getting started — plenty of good stuff ahead.";
  } else if (pctComplete < 60) {
    progressNote = "We've made solid progress — the picture is already starting to come together.";
  } else if (pctComplete < 85) {
    progressNote = "We're in the home stretch — just a few more questions to round things out.";
  } else {
    progressNote = "We're almost done — just a few final details and your results will be ready.";
  }

  return `Welcome back, ${name}! Last time we were working on ${lastTopic}. ${progressNote}

Let's pick up right where we left off.`;
}

interface UseBrandChatOptions {
  /** Called when the assessment completes and report is saved. If provided, the hook will NOT auto-redirect — the caller is responsible for navigation. */
  onComplete?: (reportId: string, redirectUrl: string) => void;
  /** Custom greeting message (overrides the default). Used for product-tier-specific greetings. */
  customGreeting?: string;
  /** Welcome-back template with {firstName} placeholders. If provided, the first user message is treated as their name and the welcome-back is injected directly instead of calling the AI. */
  welcomeBackTemplate?: string;
}

export function useBrandChat(options?: UseBrandChatOptions) {
  const initialMessage = options?.customGreeting
    ? createMessage('assistant', options.customGreeting)
    : INITIAL_ASSISTANT_MESSAGE;

  const [messages, setMessages] = useState<BrandChatMessage[]>([
    initialMessage,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [lastFailedInput, setLastFailedInput] = useState<string | null>(null);
  const hasReceivedName = useRef(false);
  const sendingRef = useRef(false); // Synchronous guard against double-sends
  const router = useRouter();
  const { generateReport, loading: pdfLoading } = useGenerateReport();
  const onCompleteRef = useRef(options?.onComplete);
  useEffect(() => { onCompleteRef.current = options?.onComplete; }, [options?.onComplete]);
  const isInitialized = useRef(false);

  // Initialize: create draft report or load resume
  // Also persist reportId in sessionStorage so a page refresh can recover.
  useEffect(() => {
    if (isInitialized.current || typeof window === 'undefined') return;
    isInitialized.current = true;

    // Check for resume query param
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('resume');

    // Also check sessionStorage for a previously started session (page refresh recovery)
    const sessionReportId = sessionStorage.getItem('wundy_report_id');
    const effectiveResumeId = resumeId || sessionReportId;
    
    if (effectiveResumeId) {
      // Load existing progress
      fetch(`/api/snapshot/resume?reportId=${effectiveResumeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.reportId && data.progress) {
            setReportId(data.reportId);
            sessionStorage.setItem('wundy_report_id', data.reportId);

            // Restore messages from progress if available
            if (data.progress.messages && Array.isArray(data.progress.messages)) {
              const savedMessages = data.progress.messages as BrandChatMessage[];

              // Mark that we already have the name (so the welcome-back template is skipped)
              hasReceivedName.current = true;

              // Build a personalized welcome-back message
              const firstName = extractFirstNameFromHistory(savedMessages);
              const lastTopic = detectLastTopic(savedMessages);
              const answeredCount = savedMessages.filter((m: BrandChatMessage) => m.role === 'user').length;
              const resumeGreeting = buildResumeGreeting(firstName, lastTopic, answeredCount, TOTAL_QUESTIONS);
              const resumeMessage = createMessage('assistant', resumeGreeting);

              setMessages([...savedMessages, resumeMessage]);
            }
          } else if (!resumeId) {
            // sessionStorage had stale ID — fall through to create new draft
            sessionStorage.removeItem('wundy_report_id');
            createDraft();
          }
        })
        .catch((err) => {
          console.error('[useBrandChat] Error loading resume:', err);
          if (!resumeId) createDraft();
        });
    } else {
      createDraft();
    }

    function createDraft() {
      fetch('/api/snapshot/draft', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.reportId) {
            setReportId(data.reportId);
            sessionStorage.setItem('wundy_report_id', data.reportId);
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
    if (!trimmed || isLoading || sendingRef.current) return; // Prevent double submission
    sendingRef.current = true;

    const userMessage = createMessage('user', trimmed);

    // Optimistically add the user message to the UI
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setIsLoading(true);

    // ─── Two-message intro flow: intercept first message as name ───
    // If a welcomeBackTemplate is provided and we haven't received the name yet,
    // treat this message as the user's name and inject the welcome-back directly.
    if (options?.welcomeBackTemplate && !hasReceivedName.current) {
      hasReceivedName.current = true;
      try {
        const { extractFirstName, interpolateWelcomeBack } = await import('@/lib/chatTierConfig');
        const firstName = extractFirstName(trimmed);
        const welcomeBack = interpolateWelcomeBack(options.welcomeBackTemplate, firstName);
        const assistantMessage = createMessage('assistant', welcomeBack);
        const updatedHistory = [...nextHistory, assistantMessage];
        setMessages(updatedHistory);
        // Save progress with the name
        saveProgress('name_received', updatedHistory);
      } catch (err) {
        console.error('[useBrandChat] Welcome-back interpolation error:', err);
        // Fall through to normal API call if something goes wrong
        hasReceivedName.current = false;
      }
      setIsLoading(false);
      sendingRef.current = false;
      if (hasReceivedName.current) return;
    }

    try {
      const replyText = await getBrandSnapshotReply(nextHistory);

      // Check if the response contains JSON (should NOT be displayed in chat).
      // Wundy outputs either:
      //   A) Collected inputs: { userName, businessName, industry, ... }
      //   B) Legacy scores format: { brandAlignmentScore, pillarScores, ... }
      const trimmedReply = replyText.trim();
      
      // Try to find a JSON object in the response
      let jsonMatch: RegExpMatchArray | string[] | null = null;

      // Pattern 1: Score-based JSON (legacy)
      jsonMatch = trimmedReply.match(/\{[\s\S]*"brandAlignmentScore"[\s\S]*\}/);
      
      // Pattern 2: Collected-inputs JSON (current system prompt format)
      if (!jsonMatch) {
        jsonMatch = trimmedReply.match(/\{[\s\S]*"userName"[\s\S]*"businessName"[\s\S]*\}/);
      }
      
      // Pattern 3: Any large JSON object at the end of the response (catch-all)
      if (!jsonMatch) {
        const jsonBlockMatch = trimmedReply.match(/\{[^{}]{200,}\}$/);
        if (jsonBlockMatch) {
          try {
            JSON.parse(jsonBlockMatch[0]);
            jsonMatch = jsonBlockMatch;
          } catch {
            // Not valid JSON, ignore
          }
        }
      }

      // Pattern 4: Whole response is JSON
      if (!jsonMatch && trimmedReply.startsWith('{') && trimmedReply.endsWith('}')) {
        jsonMatch = [trimmedReply];
      }

      if (jsonMatch && jsonMatch[0]) {
        // JSON detected — extract it and send for scoring. NEVER display JSON in chat.
        try {
          const jsonString = jsonMatch[0];
          const snapshotData = JSON.parse(jsonString);
          
          console.log('[useBrandChat] Detected JSON response:', Object.keys(snapshotData).slice(0, 8));
          
          // Determine format: scores-based vs collected-inputs
          const hasScores = (snapshotData.scores && typeof snapshotData.scores.brandAlignmentScore === 'number')
            || (typeof snapshotData.brandAlignmentScore === 'number' && snapshotData.pillarScores);
          const isCollectedInputs = !hasScores && (snapshotData.userName || snapshotData.businessName || snapshotData.industry);

          let brandAlignmentScore: number;
          let pillarScores: any;
          let pillarInsights: any = {};
          let recommendations: any = {};

          if (isCollectedInputs) {
            // Collected inputs format — send to /api/snapshot for server-side scoring
            console.log('[useBrandChat] Collected inputs detected, sending to scoring API');

            const turnstileToken = typeof window !== 'undefined' ? (window as any).__turnstileToken : undefined;

            const scoringRes = await fetch('/api/snapshot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                answers: snapshotData,
                name: snapshotData.userName,
                companyName: snapshotData.businessName,
                businessName: snapshotData.businessName,
                turnstileToken,
              }),
            });

            if (scoringRes.ok) {
              const scoringResult = await scoringRes.json();
              const finalReportId = scoringResult.reportId;

              // Persist brand name for cross-page use (checkout, dashboard, etc.)
              if (snapshotData.businessName && typeof window !== 'undefined') {
                try {
                  const { persistBrandName } = await import('@/lib/persistBrand');
                  persistBrandName(snapshotData.businessName);
                  localStorage.setItem('brand_snapshot_company', snapshotData.businessName);
                } catch { /* non-critical */ }
              }

              // Extract handoff message (text before the JSON)
              const textBeforeJson = trimmedReply.substring(0, (jsonMatch as RegExpMatchArray).index || 0).trim();
              if (textBeforeJson) {
                const handoffMessage = createMessage('assistant', textBeforeJson);
                setMessages((prev) => [...prev, handoffMessage]);
              }

              saveProgress('completed', nextHistory);

              // Navigate to results
              if (typeof window !== 'undefined') {
                const redirectUrl = `/results?reportId=${finalReportId}`;
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ type: 'BRAND_SNAPSHOT_COMPLETE', data: { report_id: finalReportId, redirectUrl } }, '*');
                } else if (onCompleteRef.current) {
                  onCompleteRef.current(finalReportId, redirectUrl);
                } else {
                  router.push(redirectUrl);
                }
              }
            } else {
              console.error('[useBrandChat] Scoring API failed:', await scoringRes.text());
            }

            setIsLoading(false);
            sendingRef.current = false;
            return;
          }
          
          if (snapshotData.scores && typeof snapshotData.scores.brandAlignmentScore === 'number') {
            brandAlignmentScore = snapshotData.scores.brandAlignmentScore;
            pillarScores = {
              positioning: snapshotData.scores.positioning || 0,
              messaging: snapshotData.scores.messaging || 0,
              visibility: snapshotData.scores.visibility || 0,
              credibility: snapshotData.scores.credibility || 0,
              conversion: snapshotData.scores.conversion || 0,
            };
          } else if (typeof snapshotData.brandAlignmentScore === 'number' && snapshotData.pillarScores) {
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
              // Include security tokens (bot protection)
              const turnstileToken = typeof window !== 'undefined' ? (window as any).__turnstileToken : undefined;
              const behavioralSignals = typeof window !== 'undefined' ? (window as any).__behavioralSignals : undefined;

              const saveResponse = await fetch('/api/save-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  brandAlignmentScore,
                  pillarScores,
                  pillarInsights,
                  recommendations,
                  userContext,
                  userName: companyInfo.company_name,
                  company: companyInfo.company_name,
                  websiteNotes: companyInfo.website,
                  turnstileToken,
                  behavioralScore: behavioralSignals?.riskScore ?? null,
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
                  } else if (onCompleteRef.current) {
                    // Caller provided onComplete callback — defer navigation to them
                    // (used for email verification gate)
                    onCompleteRef.current(finalReportId, redirectUrl);
                  } else {
                    // No callback and not in iframe — redirect directly
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

            // Extract any text before the JSON (handoff message)
            const textBeforeJson = trimmedReply.substring(0, (jsonMatch as RegExpMatchArray).index || 0).trim();
            
            // Strip score-related text but keep the conversational handoff
            const scorePatterns = [
              /WunderBrand Score™[™]?:?\s*\d+/gi,
              /Pillar Breakdown:?/gi,
              /(?:Positioning|Messaging|Visibility|Credibility|Conversion):\s*\d+(?:\/\d+)?/gi,
              /\b\d+\/100\b/g,
              /\b\d+\/20\b/g,
            ];
            
            let cleanText = textBeforeJson;
            scorePatterns.forEach(pattern => {
              cleanText = cleanText.replace(pattern, '');
            });
            cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();
            
            if (cleanText && cleanText.length > 10) {
              const handoffMessage = createMessage('assistant', cleanText);
              const finalHistory = [...nextHistory, handoffMessage];
              setMessages(finalHistory);
              saveProgress('handoff', finalHistory);
            } else {
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
        const hasScoreNumbers = /\b\d+\/100\b|\b\d+\/20\b|WunderBrand Score™[™]?:?\s*\d+/i.test(replyText);
        
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
      setLastFailedInput(trimmed);
      const errorMessage = createMessage(
        'assistant',
        'I ran into a connection issue. Your progress is saved — tap "Retry" to try again, or rephrase your answer.'
      );
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      sendingRef.current = false;
    }
  };

  const retry = () => {
    if (lastFailedInput) {
      // Remove the error message from chat
      setMessages((prev) => prev.filter((m) => m.text !== 'I ran into a connection issue. Your progress is saved — tap "Retry" to try again, or rephrase your answer.'));
      const inputToRetry = lastFailedInput;
      setLastFailedInput(null);
      sendMessage(inputToRetry);
    }
  };

  const reset = () => {
    setMessages([INITIAL_ASSISTANT_MESSAGE]);
    setLastFailedInput(null);
  };

  // Calculate assessment progress based on assistant question count
  const assistantTurns = messages.filter((m) => m.role === 'assistant').length;
  // Subtract 1 for the initial greeting, clamp to 0
  const questionsAnswered = Math.max(0, assistantTurns - 1);
  const assessmentProgress = Math.min(Math.round((questionsAnswered / TOTAL_QUESTIONS) * 100), 99);

  return {
    messages,
    isLoading,
    sendMessage,
    retry,
    canRetry: !!lastFailedInput,
    reset,
    reportId,
    assessmentProgress,
    questionsAnswered,
    totalQuestions: TOTAL_QUESTIONS,
  };
}
