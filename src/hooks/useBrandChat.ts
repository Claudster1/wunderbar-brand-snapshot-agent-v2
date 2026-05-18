// src/hooks/useBrandChat.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BrandChatMessage,
  getBrandSnapshotReply,
} from '../services/openaiService';
import { useGenerateReport } from './useGenerateReport';
import { getPersistedEmail } from '@/lib/persistEmail';
import {
  buildUpgradeGapFillAssistantMessage,
  intakeProgressDenominator,
  type ChatTier,
} from '@/lib/chatTierConfig';
import type { IntakeResponseMeta } from '@/lib/intake/intakeTypes';
import { trackIntakeEvent } from '@/lib/intake/trackIntakeEvent';
import {
  assistantPromisedExternalResultsEntry,
  conversationSuggestsIntakeComplete,
  isAssistantFinalHandoffWithoutJsonBlock,
  textContainsScoringJsonPayload,
} from '@/lib/intake/assistantFinalHandoff';

function snapshotResultsEntryUrl(finalReportId: string): string {
  return `/results?reportId=${encodeURIComponent(finalReportId)}`;
}

/** Confirm the report row exists before sending the user to `/results`. */
async function waitForReportReadable(reportId: string, maxAttempts = 5): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`/api/snapshot/get?id=${encodeURIComponent(reportId)}`, {
        cache: "no-store",
      });
      if (res.ok) return true;
    } catch {
      /* retry */
    }
    if (i < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  return false;
}

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

function isContinueAnyway(text: string): boolean {
  return /(continue|proceed|go ahead|generate|submit|finish|run it|continue anyway)/i.test(
    text,
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasLeadMagnetDetailSignal(snapshotData: Record<string, unknown>): boolean {
  const nested = snapshotData.leadMagnetDetails;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const o = nested as Record<string, unknown>;
    if (isNonEmptyString(o.title) || isNonEmptyString(o.summary)) return true;
  }
  if (isNonEmptyString(snapshotData.leadMagnetTitle) || isNonEmptyString(snapshotData.leadMagnetDescription)) {
    return true;
  }
  return false;
}

function getMissingHighImpactSignals(
  snapshotData: Record<string, unknown>,
  productTier?: 'snapshot' | 'snapshot-plus' | 'blueprint' | 'blueprint-plus',
): string[] {
  const tier = productTier ?? 'snapshot';
  const hasBusinessType = isNonEmptyString(snapshotData.businessType);
  const hasAcquisitionChannel =
    isNonEmptyString(snapshotData.primaryAcquisitionChannel) ||
    isNonEmptyString(snapshotData.topAcquisitionChannel) ||
    (Array.isArray(snapshotData.customerAcquisitionSource) &&
      (snapshotData.customerAcquisitionSource as unknown[]).length > 0);

  const hasRevenueRange =
    isNonEmptyString(snapshotData.monthlyRevenueRange) ||
    isNonEmptyString(snapshotData.revenueRange);
  const hasAvgTransactionValue = isNonEmptyString(snapshotData.averageTransactionValue);
  const hasConversionRate = isNonEmptyString(snapshotData.conversionRateEstimate);
  const hasMarketingBudget = isNonEmptyString(snapshotData.monthlyMarketingBudget);
  const hasContentCapacity = isNonEmptyString(snapshotData.contentCreationCapacity);

  const missing: string[] = [];
  if (!hasBusinessType) missing.push('Business type');
  if (!hasAcquisitionChannel) missing.push('Primary acquisition channel');

  // Match server tier policy: Snapshot does not collect revenue / conversion / budget / capacity.
  const needsPerformanceSignals =
    tier === 'snapshot-plus' || tier === 'blueprint' || tier === 'blueprint-plus';
  if (needsPerformanceSignals) {
    if (!hasRevenueRange) missing.push('Monthly or annual revenue range');
    if (!hasAvgTransactionValue) missing.push('Average transaction value / deal size');
    if (!hasConversionRate) missing.push('Conversion or close rate estimate');
    if (!hasContentCapacity) missing.push('Content creation capacity');
  }

  if (tier === 'blueprint' || tier === 'blueprint-plus') {
    if (!hasMarketingBudget) missing.push('Monthly marketing budget');
  }

  if (snapshotData.hasLeadMagnet === true && !hasLeadMagnetDetailSignal(snapshotData)) {
    missing.push("Your current free offer: what it's called and what people get (a line each is enough)");
  }

  const isActivationTier = productTier === 'blueprint' || productTier === 'blueprint-plus';
  if (isActivationTier) {
    const hasEmailList = typeof snapshotData.hasEmailList === 'boolean';
    const hasLeadMagnet = typeof snapshotData.hasLeadMagnet === 'boolean';
    const hasClearCTA = typeof snapshotData.hasClearCTA === 'boolean';
    const hasMarketingChannels =
      Array.isArray(snapshotData.marketingChannels) &&
      (snapshotData.marketingChannels as unknown[]).length > 0;

    if (!hasEmailList) missing.push('Email list (yes/no — small lists count)');
    if (!hasLeadMagnet) missing.push('Free download or sign-up offer (yes/no — "not yet" is a fine answer)');
    if (!hasClearCTA) missing.push('How clear your main next step is');
    if (!hasMarketingChannels) missing.push('Channels you are active on');
  }

  return missing;
}

interface UseBrandChatOptions {
  /** Called when the assessment completes and report is saved. If provided, the hook will NOT auto-redirect — the caller is responsible for navigation. */
  onComplete?: (reportId: string, redirectUrl: string) => void;
  /** Custom greeting message (overrides the default). Used for product-tier-specific greetings. */
  customGreeting?: string;
  /** Welcome-back template with {firstName} placeholders. If provided, the first user message is treated as their name and the welcome-back is injected directly instead of calling the AI. */
  welcomeBackTemplate?: string;
  /** Active product tier for tier-aware intake behavior. */
  productTier?: 'snapshot' | 'snapshot-plus' | 'blueprint' | 'blueprint-plus';
  /**
   * When true, `?resume=` is not loaded until the parent finishes tier-token validation
   * (paid checkout → home with token).
   */
  resumeHoldUntilValidated?: boolean;
}

export function useBrandChat(options?: UseBrandChatOptions) {
  const progressTotal = intakeProgressDenominator((options?.productTier ?? 'snapshot') as ChatTier);

  const initialMessage = options?.customGreeting
    ? createMessage('assistant', options.customGreeting)
    : INITIAL_ASSISTANT_MESSAGE;

  const [messages, setMessages] = useState<BrandChatMessage[]>([
    initialMessage,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  /** Set when scoring/save succeeds — full URL to open the diagnostic results UI. */
  const [resultsEntryUrl, setResultsEntryUrl] = useState<string | null>(null);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [lastFailedInput, setLastFailedInput] = useState<string | null>(null);
  const [intakeMeta, setIntakeMeta] = useState<IntakeResponseMeta | null>(null);
  const intakeMilestoneFiredRef = useRef(false);
  const intakeReadyFiredRef = useRef(false);
  const hasReceivedName = useRef(false);
  const allowIncompleteSubmissionRef = useRef(false);
  const sendingRef = useRef(false); // Synchronous guard against double-sends
  /** First paid-tier API call after upgrade may attach prior Snapshot JSON from this report id. */
  const continuationReportIdForApiRef = useRef<string | null>(null);
  const resumeLoadedReportIdRef = useRef<string | null>(null);
  const router = useRouter();
  const { generateReport, loading: pdfLoading } = useGenerateReport();
  const onCompleteRef = useRef(options?.onComplete);
  useEffect(() => { onCompleteRef.current = options?.onComplete; }, [options?.onComplete]);
  const isInitialized = useRef(false);
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const finalizingRef = useRef(false);

  const assignLocalDraftId = () => {
    if (typeof window === 'undefined') return;
    const fallbackId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setReportId(fallbackId);
    sessionStorage.setItem('wundy_report_id', fallbackId);
  };

  // Initialize: create draft report or load resume
  // Also persist reportId in sessionStorage so a page refresh can recover.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('resume');

    if (resumeId) {
      if (options?.resumeHoldUntilValidated) return;

      const ac = new AbortController();

      fetch(`/api/snapshot/resume?reportId=${encodeURIComponent(resumeId)}`, { signal: ac.signal })
        .then((res) => {
          if (ac.signal.aborted) return null;
          return res.json();
        })
        .then((data) => {
          if (ac.signal.aborted || data == null) return;

          const resumeOk =
            data.reportId &&
            (data.continuationMode === 'answers_only' || data.progress != null);
          if (!resumeOk) {
            createDraft();
            return;
          }

          if (resumeLoadedReportIdRef.current === resumeId) return;
          resumeLoadedReportIdRef.current = resumeId;

          setReportId(data.reportId);
          sessionStorage.setItem('wundy_report_id', data.reportId);

          const paidTier =
            options?.productTier &&
            options.productTier !== 'snapshot';

          if (
            data.continuationMode === 'answers_only' &&
            paidTier &&
            data.priorAnswers &&
            typeof data.priorAnswers === 'object'
          ) {
            hasReceivedName.current = true;
            const rawName = (data.priorAnswers as Record<string, unknown>).userName;
            const firstName = typeof rawName === 'string' ? rawName : null;
            const intro = buildUpgradeGapFillAssistantMessage(
              options!.productTier as ChatTier,
              firstName,
            );
            setMessages([createMessage('assistant', intro)]);
            continuationReportIdForApiRef.current = data.reportId;
            return;
          }

          if (data.progress?.messages && Array.isArray(data.progress.messages)) {
            const savedMessages = data.progress.messages as BrandChatMessage[];
            hasReceivedName.current = true;
            const firstName = extractFirstNameFromHistory(savedMessages);
            const lastTopic = detectLastTopic(savedMessages);
            const answeredCount = savedMessages.filter((m: BrandChatMessage) => m.role === 'user').length;
            const resumeGreeting = buildResumeGreeting(firstName, lastTopic, answeredCount, progressTotal);
            const resumeMessage = createMessage('assistant', resumeGreeting);
            const last = savedMessages[savedMessages.length - 1];
            const alreadyHasSameResume =
              last?.role === 'assistant' && last.text.trim() === resumeGreeting.trim();
            setMessages(alreadyHasSameResume ? savedMessages : [...savedMessages, resumeMessage]);
            if (paidTier) {
              continuationReportIdForApiRef.current = data.reportId;
            } else {
              continuationReportIdForApiRef.current = null;
            }
            return;
          }

          createDraft();
        })
        .catch((err: unknown) => {
          if (ac.signal.aborted) return;
          const name =
            typeof err === 'object' && err !== null && 'name' in err ? (err as { name: string }).name : '';
          if (name === 'AbortError') return;
          createDraft();
        });

      return () => {
        ac.abort();
      };
    }

    if (isInitialized.current) return;
    isInitialized.current = true;

    const sessionReportId = sessionStorage.getItem('wundy_report_id');
    if (sessionReportId) {
      setReportId(sessionReportId);
    } else {
      createDraft();
    }

    function createDraft() {
      const persistedEmail = getPersistedEmail();
      fetch('/api/snapshot/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persistedEmail ? { userEmail: persistedEmail } : {}),
      })
        .then(async (res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((data) => {
          if (data.reportId) {
            setReportId(data.reportId);
            sessionStorage.setItem('wundy_report_id', data.reportId);
          } else {
            assignLocalDraftId();
          }
        })
        .catch(() => {
          assignLocalDraftId();
        });
    }
  }, [options?.resumeHoldUntilValidated, progressTotal]);

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
  const saveProgress = async (
    step: string,
    history: BrandChatMessage[],
    explicitReportId?: string | null,
  ) => {
    const rid = explicitReportId ?? reportId;
    if (!rid) return;

    const answers = extractAnswers(history);

    try {
      await fetch('/api/snapshot/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: rid,
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

  /**
   * Server-side transcript → structured answers → /api/snapshot.
   * Pass explicit `history` when React state/refs may not have flushed yet.
   */
  const runTranscriptFinalizeCore = async (
    history: BrandChatMessage[],
    attempt = 0,
  ): Promise<boolean> => {
    if (finalizingRef.current && attempt === 0) return false;
    if (history.length < 4) {
      setFinalizeError('Not enough conversation to generate your diagnostic yet.');
      return false;
    }
    finalizingRef.current = true;
    setIsFinalizing(true);
    trackIntakeEvent('INTAKE_FINALIZE_STARTED', {
      reportId: reportId ?? undefined,
      productTier: options?.productTier,
    });
    // Don't blank the previous error on retry — that's what made the panel look like it was
    // resetting on every cycle. Only clear once we actually succeed.
    /**
     * The server transcript-extract has a 45s LLM timeout + a fallback retry, so without a client-side
     * abort an unlucky cold start could leave the user staring at "Opening…" for ~90s. These ceilings
     * are well above the typical 4–8s response and surface a recoverable error instead.
     */
    const EXTRACT_TIMEOUT_MS = 60_000;
    const SCORING_TIMEOUT_MS = 30_000;
    try {
      const extController = new AbortController();
      const extTimer = setTimeout(() => extController.abort(), EXTRACT_TIMEOUT_MS);
      let ext: Response;
      try {
        ext = await fetch('/api/snapshot/complete-from-transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, text: m.text })),
            productTier: options?.productTier,
            continuationReportId:
              options?.productTier && options.productTier !== 'snapshot'
                ? continuationReportIdForApiRef.current ?? reportId
                : undefined,
          }),
          signal: extController.signal,
        });
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') {
          setFinalizeError('That took longer than expected. Tap See my results to try again.');
          return false;
        }
        throw e;
      } finally {
        clearTimeout(extTimer);
      }
      const extBody = await ext.text();
      let extJson: { error?: string; answers?: Record<string, unknown> } = {};
      try {
        extJson = JSON.parse(extBody) as typeof extJson;
      } catch {
        /* ignore */
      }
      if (!ext.ok) {
        const errMsg =
          extJson.error || 'Could not read your answers from the chat. Please try again.';
        if (attempt < 1 && (ext.status === 422 || ext.status >= 500)) {
          finalizingRef.current = false;
          setIsFinalizing(false);
          return runTranscriptFinalizeCore(history, attempt + 1);
        }
        setFinalizeError(errMsg);
        trackIntakeEvent('INTAKE_FINALIZE_FAILED', {
          reportId: reportId ?? undefined,
          status: ext.status,
        });
        return false;
      }
      const answers = extJson.answers;
      if (!answers || typeof answers !== 'object') {
        setFinalizeError('Unexpected response from the server. Please try again.');
        return false;
      }

      const turnstileToken = typeof window !== 'undefined' ? (window as any).__turnstileToken : undefined;
      const persistedEmail = typeof window !== 'undefined' ? getPersistedEmail() : null;

      const scoringController = new AbortController();
      const scoringTimer = setTimeout(() => scoringController.abort(), SCORING_TIMEOUT_MS);
      let scoringRes: Response;
      try {
        scoringRes = await fetch('/api/snapshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers,
            name: typeof answers.userName === 'string' ? answers.userName : undefined,
            companyName: typeof answers.businessName === 'string' ? answers.businessName : undefined,
            businessName: typeof answers.businessName === 'string' ? answers.businessName : undefined,
            ...(persistedEmail ? { email: persistedEmail } : {}),
            turnstileToken,
          }),
          signal: scoringController.signal,
        });
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') {
          setFinalizeError('Scoring is taking longer than expected. Tap See my results to try again.');
          return false;
        }
        throw e;
      } finally {
        clearTimeout(scoringTimer);
      }
      const scoreText = await scoringRes.text();
      let scoreJson: Record<string, unknown> = {};
      try {
        scoreJson = JSON.parse(scoreText) as Record<string, unknown>;
      } catch {
        /* ignore */
      }
      if (!scoringRes.ok) {
        const baseMsg =
          typeof scoreJson.error === 'string' && scoreJson.error.trim()
            ? scoreJson.error
            : 'Scoring failed. Please try again in a moment.';
        const code =
          typeof scoreJson.errorCode === 'string' && scoreJson.errorCode.trim()
            ? scoreJson.errorCode
            : null;
        // The Postgres SQLSTATE code (e.g. 23502 not-null, 42703 missing column, 42501 RLS denial)
        // tells us at-a-glance what bucket the failure falls into — surface it so support / on-call
        // can act without round-tripping to logs.
        const msg = code ? `${baseMsg} (code: ${code})` : baseMsg;
        // Always log the full payload so a screenshot of DevTools' Console gives us everything.
        // eslint-disable-next-line no-console
        console.error('[useBrandChat] /api/snapshot failed', {
          status: scoringRes.status,
          body: scoreJson,
        });
        setFinalizeError(msg);
        trackIntakeEvent('INTAKE_FINALIZE_FAILED', {
          reportId: reportId ?? undefined,
          status: scoringRes.status,
        });
        return false;
      }

      const finalReportId = scoreJson.reportId as string | undefined;
      if (!finalReportId) {
        setFinalizeError('No report was created. Please try again.');
        return false;
      }

      const readable = await waitForReportReadable(finalReportId);
      if (!readable) {
        setFinalizeError(
          'Your diagnostic was saved but is still processing. Wait a few seconds, then tap Generate again.',
        );
        return false;
      }

      setReportId(finalReportId);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('wundy_report_id', finalReportId);
      }

      const redirectUrl = snapshotResultsEntryUrl(finalReportId);
      setResultsEntryUrl(redirectUrl);
      setFinalizeError(null);

      await saveProgress('completed', history, finalReportId);

      if (typeof window !== 'undefined') {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            { type: 'BRAND_SNAPSHOT_COMPLETE', data: { report_id: finalReportId, redirectUrl } },
            '*',
          );
          if (onCompleteRef.current) {
            onCompleteRef.current(finalReportId, redirectUrl);
          }
        } else if (onCompleteRef.current) {
          onCompleteRef.current(finalReportId, redirectUrl);
        } else {
          router.push(redirectUrl);
        }
      }

      return true;
    } catch (e) {
      console.error('[useBrandChat] runTranscriptFinalizeCore', e);
      setFinalizeError('Something went wrong. Please try again.');
      trackIntakeEvent('INTAKE_FINALIZE_FAILED', { reportId: reportId ?? undefined });
      return false;
    } finally {
      finalizingRef.current = false;
      setIsFinalizing(false);
    }
  };

  const finalizeFromTranscript = async (): Promise<boolean> => runTranscriptFinalizeCore(messagesRef.current);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || sendingRef.current || finalizingRef.current) return; // Prevent double submission
    if (isContinueAnyway(trimmed)) {
      allowIncompleteSubmissionRef.current = true;
    } else {
      allowIncompleteSubmissionRef.current = false;
    }
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
      const paidTier = options?.productTier && options.productTier !== 'snapshot';
      const continuationReportId = paidTier
        ? continuationReportIdForApiRef.current ?? reportId
        : null;
      const streamingMessage = createMessage('assistant', '');
      const streamingMessageId = streamingMessage.id;
      setMessages([...nextHistory, streamingMessage]);
      setIsStreaming(true);

      const reply = await getBrandSnapshotReply(nextHistory, {
        productTier: options?.productTier,
        continuationReportId: continuationReportId ?? undefined,
        stream: true,
        onToken: (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingMessageId ? { ...m, text: m.text + token } : m,
            ),
          );
        },
      });
      const replyText = reply.content;

      setMessages((prev) =>
        prev.map((m) => (m.id === streamingMessageId ? { ...m, text: replyText } : m)),
      );
      if (reply.meta) {
        setIntakeMeta(reply.meta);
        if (reply.meta.overallProgressPercent >= 50 && !intakeMilestoneFiredRef.current) {
          intakeMilestoneFiredRef.current = true;
          trackIntakeEvent('INTAKE_PROGRESS_MILESTONE', {
            percent: reply.meta.overallProgressPercent,
            capturePercent: reply.meta.captureCompletionPercent,
            productTier: options?.productTier,
          });
        }
        if (reply.meta.intakeReadyForFinalize && !intakeReadyFiredRef.current) {
          intakeReadyFiredRef.current = true;
          trackIntakeEvent('INTAKE_READY_FINALIZE', {
            productTier: options?.productTier,
            questionsRemaining: reply.meta.questionsRemainingEstimate,
          });
        }
      }

      const maybeCompleteWithoutJson = async (assistantText: string): Promise<boolean> => {
        if (textContainsScoringJsonPayload(assistantText)) return false;

        /* Any “results live outside chat” / wrap-up cue → server transcript extract (replacing weak client extractAnswers). */
        const finalizeCue =
          isAssistantFinalHandoffWithoutJsonBlock(assistantText) ||
          assistantPromisedExternalResultsEntry(assistantText);
        if (!finalizeCue) return false;

        const userTurns = nextHistory.filter((m) => m.role === 'user').length;
        if (userTurns < 3) return false;

        const handoffMessage = createMessage('assistant', assistantText);
        const completedHistory = [...nextHistory, handoffMessage];
        messagesRef.current = completedHistory;
        setMessages(completedHistory);
        await saveProgress('handoff_attempt', completedHistory);

        await runTranscriptFinalizeCore(completedHistory);
        return true;
      };

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
          
          // JSON response detected — process for scoring
          
          // Determine format: scores-based vs collected-inputs
          const hasScores = (snapshotData.scores && typeof snapshotData.scores.brandAlignmentScore === 'number')
            || (typeof snapshotData.brandAlignmentScore === 'number' && snapshotData.pillarScores);
          const isCollectedInputs = !hasScores && (snapshotData.userName || snapshotData.businessName || snapshotData.industry);

          let brandAlignmentScore: number;
          let pillarScores: any;
          let pillarInsights: any = {};
          let recommendations: any = {};

          if (isCollectedInputs) {
            const missingSignals = getMissingHighImpactSignals(
              snapshotData as Record<string, unknown>,
              options?.productTier,
            );
            const userTurnCount = nextHistory.filter((m) => m.role === 'user').length;
            const skipCompletenessNudge =
              allowIncompleteSubmissionRef.current ||
              (options?.productTier === 'snapshot' && userTurnCount >= 10) ||
              userTurnCount >= 14;

            if (missingSignals.length > 0 && !skipCompletenessNudge) {
              const missingList = missingSignals.map((item) => `- ${item}`).join('\n');
              const activationWarmth =
                options?.productTier === 'blueprint' || options?.productTier === 'blueprint-plus'
                  ? `A few quick signals help us write campaigns that match your real world — not a fantasy marketing stack. If something is "not yet" or "we don't," say so; your plan can still include supportive ideas and plug them into the email and social drafts we build for you.\n\n`
                  : '';
              const nudge = createMessage(
                'assistant',
                `${activationWarmth}Before we finalize your diagnostic, here's what would still sharpen things:\n\n${missingList}\n\nShare what feels easy — short answers are perfect. You can also say "continue anyway" whenever you're ready.`,
              );
              const updatedHistory = [...nextHistory, nudge];
              setMessages(updatedHistory);
              await saveProgress('completeness_nudge', updatedHistory);
              setIsLoading(false);
              sendingRef.current = false;
              return;
            }
            allowIncompleteSubmissionRef.current = false;
            // Collected inputs format — send to /api/snapshot for server-side scoring
            // Collected inputs — route through server-side scoring

            const turnstileToken = typeof window !== 'undefined' ? (window as any).__turnstileToken : undefined;
            const persistedEmail = typeof window !== 'undefined' ? getPersistedEmail() : null;

            const scoringRes = await fetch('/api/snapshot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                answers: snapshotData,
                name: snapshotData.userName,
                companyName: snapshotData.businessName,
                businessName: snapshotData.businessName,
                ...(persistedEmail ? { email: persistedEmail } : {}),
                turnstileToken,
              }),
            });

            if (scoringRes.ok) {
              const scoringResult = (await scoringRes.json()) as Record<string, unknown>;
              const finalReportId = scoringResult.reportId as string | undefined;
              if (!finalReportId) {
                setIsLoading(false);
                sendingRef.current = false;
                return;
              }
              const readable = await waitForReportReadable(finalReportId);
              if (!readable) {
                setFinalizeError(
                  'Your diagnostic was saved but is still processing. Wait a few seconds, then tap Generate again.',
                );
                setIsLoading(false);
                sendingRef.current = false;
                return;
              }
              setReportId(finalReportId);
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('wundy_report_id', finalReportId);
              }

              const redirectUrl = snapshotResultsEntryUrl(finalReportId);
              setResultsEntryUrl(redirectUrl);

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

              if (typeof window !== 'undefined') {
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ type: 'BRAND_SNAPSHOT_COMPLETE', data: { report_id: finalReportId, redirectUrl } }, '*');
                  if (onCompleteRef.current) {
                    onCompleteRef.current(finalReportId, redirectUrl);
                  }
                } else if (onCompleteRef.current) {
                  onCompleteRef.current(finalReportId, redirectUrl);
                } else {
                  router.push(redirectUrl);
                }
              }
            } else {
              const failText = await scoringRes.text();
              console.error('[useBrandChat] Scoring API failed:', failText);
              setFinalizeError(
                'We could not score your answers from that message. Tap See my results to build your diagnostic from the full conversation.',
              );
              messagesRef.current = nextHistory;
              await runTranscriptFinalizeCore(nextHistory);
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
            
            // Dispatch scores to parent frame / callback
            
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
                setResultsEntryUrl(redirectUrl);

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
                    // postMessage dispatched to parent frame
                    // Also trigger local completion callback so in-app email gate can appear
                    // even when embedded contexts are present.
                    if (onCompleteRef.current) {
                      onCompleteRef.current(finalReportId, redirectUrl);
                    }
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
          // Model pasted invalid / partial JSON — treat as plain assistant text; if it reads like handoff, finalize from transcript.
          const assistantMessage = createMessage('assistant', replyText);
          const badJsonHistory = [...nextHistory, assistantMessage];
          messagesRef.current = badJsonHistory;
          setMessages(badJsonHistory);
          const t = replyText.trim();
          const userTurns = badJsonHistory.filter((m) => m.role === 'user').length;
          const handoffLikely =
            userTurns >= 3 &&
            !textContainsScoringJsonPayload(t) &&
            (isAssistantFinalHandoffWithoutJsonBlock(t) || assistantPromisedExternalResultsEntry(t));
          if (handoffLikely) {
            await saveProgress('handoff_attempt_invalid_json', badJsonHistory);
            await runTranscriptFinalizeCore(badJsonHistory);
            return;
          }
          const step = `step_${badJsonHistory.filter((m) => m.role === 'assistant').length}`;
          await saveProgress(step, badJsonHistory);
        }
      } else {
        // Check if response contains score numbers but no JSON (should also be filtered)
        const hasScoreNumbers = /\b\d+\/100\b|\b\d+\/20\b|WunderBrand Score™[™]?:?\s*\d+/i.test(replyText);
        
        if (hasScoreNumbers) {
          // This looks like scores displayed as text - don't add to chat
          // Score text detected — filter from chat display
          // Try to extract just a handoff message if present
          const handoffMatch = replyText.match(/(?:Perfect!|Great!|Here's|Your).*?(?:form|below|details|enter)/i);
          if (handoffMatch) {
            const handoffMessage = createMessage('assistant', handoffMatch[0]);
            setMessages((prev) => [...prev, handoffMessage]);
          }
        } else {
          if (await maybeCompleteWithoutJson(replyText)) {
            return;
          }
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
      const errMsg = err instanceof Error ? err.message : String(err);
      const timedOut = /timed out/i.test(errMsg);
      const heavyChat = nextHistory.filter((m) => m.role === 'user').length >= 4;

      if (timedOut && heavyChat) {
        messagesRef.current = nextHistory;
        setMessages(nextHistory);
        await runTranscriptFinalizeCore(nextHistory);
      } else {
        setLastFailedInput(trimmed);
        const errorMessage = createMessage(
          'assistant',
          'I ran into a connection issue. Your progress is saved — click "Retry" to try again, or rephrase your answer.',
        );
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      sendingRef.current = false;
    }
  };

  const retry = () => {
    if (lastFailedInput) {
      // Remove the error message from chat
      setMessages((prev) => prev.filter((m) => m.text !== 'I ran into a connection issue. Your progress is saved — click "Retry" to try again, or rephrase your answer.'));
      const inputToRetry = lastFailedInput;
      setLastFailedInput(null);
      sendMessage(inputToRetry);
    }
  };

  const reset = () => {
    setMessages([INITIAL_ASSISTANT_MESSAGE]);
    setLastFailedInput(null);
    setResultsEntryUrl(null);
    setFinalizeError(null);
    setIntakeMeta(null);
    intakeMilestoneFiredRef.current = false;
    intakeReadyFiredRef.current = false;
    resumeLoadedReportIdRef.current = null;
  };

  // Progress: prefer server capture + narrative blend; fall back to turn count
  const assistantTurns = messages.filter((m) => m.role === 'assistant').length;
  const questionsAnswered = Math.max(0, assistantTurns - 1);
  const turnBasedProgressPct = Math.min(Math.round((questionsAnswered / progressTotal) * 100), 99);
  const intakeLooksComplete =
    !!resultsEntryUrl ||
    conversationSuggestsIntakeComplete(messages as BrandChatMessage[]);
  const serverProgress = intakeMeta?.overallProgressPercent;
  const assessmentProgress = intakeLooksComplete
    ? 100
    : typeof serverProgress === 'number'
      ? Math.min(serverProgress, 99)
      : turnBasedProgressPct;

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    retry,
    canRetry: !!lastFailedInput,
    reset,
    reportId,
    resultsEntryUrl,
    assessmentProgress,
    questionsAnswered,
    totalQuestions: progressTotal,
    intakeMeta,
    intakeReadyForFinalize: intakeMeta?.intakeReadyForFinalize ?? false,
    suggestedReplies: intakeMeta?.suggestedReplies ?? null,
    capturedSummary: intakeMeta?.capturedSummary ?? [],
    questionsRemainingEstimate: intakeMeta?.questionsRemainingEstimate ?? null,
    finalizeFromTranscript,
    isFinalizing,
    finalizeError,
    clearFinalizeError: () => setFinalizeError(null),
  };
}
