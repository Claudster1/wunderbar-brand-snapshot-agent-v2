'use client'

import { FormEvent, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useBrandChat } from "../src/hooks/useBrandChat";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import { BehaviorTracker } from "@/lib/security/behavioralScoring";
import { EmailVerificationGate } from "@/components/security/EmailVerificationGate";
import {
  parseTierFromParam,
  getChatTierConfig,
  interpolateWelcomeBack,
  pdfDownloadPathForTier,
  type ChatTier,
} from "@/lib/chatTierConfig";
import { AssetUploadPanel } from "@/components/assets/AssetUploadPanel";
import { ChatMarkdown, renderChatMarkdownInline } from "@/components/chat/ChatMarkdown";
import WundyLogo from "@/src/assets/wundy-logo.jpeg";
import { staticImageUrl } from "@/lib/staticImageUrl";
import { getPersistedEmail, persistEmail } from "@/lib/persistEmail";
import {
  assistantPromisedExternalResultsEntry,
  conversationSuggestsIntakeComplete,
} from "@/lib/intake/assistantFinalHandoff";

export type HomePageClientProps = {
  tierParam: string | null;
  nameParam: string | null;
  tokenParam: string | null;
};

export default function HomePageClient({ tierParam, nameParam, tokenParam }: HomePageClientProps) {
  const WUNDY_AVATAR_SRC = staticImageUrl(WundyLogo);
  const WUNDY_AVATAR_FALLBACK = "/assets/og/wundy-outline.svg";
  const WUNDY_AVATAR_FINAL_FALLBACK = "/assets/og/wundy-outline.svg";
  const [wundyAvatarSrc, setWundyAvatarSrc] = useState<string>(WUNDY_AVATAR_SRC);
  // ─── Product tier + customer name detection (from server-passed URL params) ───
  const tier = useMemo(() => parseTierFromParam(tierParam), [tierParam]);
  const tierConfig = useMemo(() => getChatTierConfig(tier), [tier]);
  // Sanitize name param: strip non-letter chars, cap at 50 chars
  const rawName = nameParam;
  const customerName = useMemo(() => {
    if (!rawName) return null;
    const sanitized = rawName.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "").trim().slice(0, 50);
    return sanitized || null;
  }, [rawName]);
  const tierTokenParam = tokenParam;

  // ─── Security: Validate paid tier access ───
  // If someone visits /?tier=blueprint without a valid token, downgrade to free tier
  const [validatedTier, setValidatedTier] = useState(tier === "snapshot" ? "snapshot" : "pending");
  useEffect(() => {
    if (tier === "snapshot") {
      setValidatedTier("snapshot");
      return;
    }
    // Paid tier: validate token
    if (!tierTokenParam) {
      console.warn("[Tier] No token for paid tier — downgrading to snapshot");
      setValidatedTier("snapshot");
      return;
    }
    fetch(`/api/validate-tier?token=${encodeURIComponent(tierTokenParam)}&tier=${tier}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setValidatedTier(tier);
        } else {
          console.warn("[Tier] Token validation failed:", data.reason);
          setValidatedTier("snapshot");
        }
      })
      .catch(() => {
        setValidatedTier("snapshot");
      });
  }, [tier, tierTokenParam]);

  // Use URL tier optimistically while validating token so resume + upgrade continuation use paid intake rules immediately.
  const activeTier: ChatTier =
    validatedTier === "pending" && tier !== "snapshot" && tierTokenParam
      ? tier
      : validatedTier === "pending"
        ? "snapshot"
        : (validatedTier as ChatTier);
  const activeTierConfig = useMemo(() => getChatTierConfig(activeTier), [activeTier]);
  /** Wait for /api/validate-tier before loading ?resume= so paid upgrade continuation uses the correct product tier. */
  const resumeHoldUntilValidated =
    tier !== "snapshot" && Boolean(tierTokenParam) && validatedTier === "pending";

  // Greeting resolution:
  //   Name known (any tier) → interpolate {firstName} in greeting, complete intro in one message
  //   Name NOT known (free tier) → ask for name first, then use welcomeBack after name is collected
  const resolvedGreeting = useMemo(() => {
    if (customerName) {
      return interpolateWelcomeBack(activeTierConfig.greeting, customerName);
    }
    // No name available — modify greeting to ask for name
    return activeTierConfig.greeting
      .replace(/\{firstName\},?\s*/g, "")
      .replace(/let's get into it\./i, "First things first — what's your name?")
      .replace(/let's get started\./i, "But first — what's your name?")
      .replace(/let's begin\./i, "But first — what's your name?");
  }, [activeTierConfig, customerName]);

  // Snapshot / Snapshot+: send people to the results page first; email capture happens there. Paid tiers still use the OTP gate when no email on file.
  const handleAssessmentComplete = useCallback((completedReportId: string, redirectUrl: string) => {
    pendingRedirectRef.current = redirectUrl;
    const snapshotish = activeTier === "snapshot" || activeTier === "snapshot-plus";
    if (typeof window !== "undefined") {
      const existing = getPersistedEmail();
      if (existing && existing.includes("@")) {
        setEmailVerified(true);
        setShowEmailVerification(false);
        setPostVerifyDestination({
          resultsUrl: redirectUrl,
          reportId: completedReportId,
          email: existing,
        });
        return;
      }
    }
    if (snapshotish) {
      setShowEmailVerification(false);
      return;
    }
    setShowEmailVerification(true);
  }, [activeTier]);

  const {
    messages,
    isLoading,
    sendMessage,
    retry,
    canRetry,
    reset,
    reportId,
    resultsEntryUrl,
    assessmentProgress,
    questionsAnswered,
    totalQuestions,
    finalizeFromTranscript,
    isFinalizing,
    finalizeError,
    clearFinalizeError,
  } = useBrandChat({
    onComplete: handleAssessmentComplete,
    customGreeting: resolvedGreeting,
    welcomeBackTemplate: !customerName ? activeTierConfig.welcomeBack : undefined,
    productTier: activeTier,
    resumeHoldUntilValidated,
  });
  const [inputValue, setInputValue] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveEmail, setSaveEmail] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  /** Populated after successful save-exit so users can resume even if AC email is delayed or misconfigured. */
  const [saveResumeUrl, setSaveResumeUrl] = useState<string | null>(null);
  const [saveResumeEventSent, setSaveResumeEventSent] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Security: Turnstile token ───
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
    // Store globally so the useBrandChat hook can include it in API calls
    if (typeof window !== "undefined") {
      (window as any).__turnstileToken = token;
    }
  }, []);

  // ─── Security: Honeypot field ───
  const [honeypot, setHoneypot] = useState("");

  // ─── Asset upload (Blueprint/Blueprint+ only) ───
  const [chatEmail, setChatEmail] = useState<string | null>(null);
  const isUploadTier = activeTier === "blueprint" || activeTier === "blueprint-plus";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  /** Blueprint uploads need an email on the upload API — sync from localStorage whenever it may have changed. */
  const syncChatEmailFromStorage = useCallback(() => {
    if (!isUploadTier) return;
    const email = getPersistedEmail();
    if (email) setChatEmail(email);
  }, [isUploadTier]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!chatEmail || isUploading) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", chatEmail);
      formData.append("tier", activeTier === "blueprint-plus" ? "blueprint-plus" : "blueprint");
      if (reportId) formData.append("sessionId", reportId);
      const res = await fetch("/api/assets/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        await sendMessage(`[Uploaded file: ${file.name}]`);
      } else {
        await sendMessage(`[Tried to upload ${file.name} but it didn't work — no worries, we can continue without it]`);
      }
    } catch {
      await sendMessage(`[Tried to upload ${file.name} but hit a connection issue — no worries, we can continue without it]`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [chatEmail, isUploading, activeTier, reportId, sendMessage]);

  // ─── Security: Behavioral tracking ───
  const behaviorTrackerRef = useRef<BehaviorTracker | null>(null);
  useEffect(() => {
    behaviorTrackerRef.current = new BehaviorTracker();
    return () => { behaviorTrackerRef.current?.destroy(); };
  }, []);

  // ─── Security: Email verification gate ───
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const pendingRedirectRef = useRef<string | null>(null);
  /** After email verification: show a top bar with primary navigation to results + PDF (not buried in chat). */
  const [postVerifyDestination, setPostVerifyDestination] = useState<{
    resultsUrl: string;
    reportId: string;
    email: string;
  } | null>(null);
  const [postVerifyResultsLinkCopied, setPostVerifyResultsLinkCopied] = useState(false);

  useEffect(() => {
    setPostVerifyResultsLinkCopied(false);
  }, [postVerifyDestination?.resultsUrl, postVerifyDestination?.email]);

  useEffect(() => {
    syncChatEmailFromStorage();
  }, [syncChatEmailFromStorage, messages.length, postVerifyDestination?.email, emailVerified]);

  /** Model promised an in-chat reveal or "below" but scoring URL never registered — offer recovery. */
  const handoffPromisedNoEntryUrl = useMemo(() => {
    if (resultsEntryUrl || isLoading) return false;
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return false;
    return (
      assistantPromisedExternalResultsEntry(lastAssistant.text) &&
      messages.filter((m) => m.role === "user").length >= 3
    );
  }, [messages, resultsEntryUrl, isLoading]);

  /** Progress can show 100% while scoring URL is still missing — always surface the same primary CTA as the success path. */
  const needsResultsRecovery = useMemo(() => {
    if (resultsEntryUrl || postVerifyDestination || isLoading) return false;
    return conversationSuggestsIntakeComplete(messages);
  }, [messages, resultsEntryUrl, postVerifyDestination, isLoading]);

  /**
   * Once the user has reached the end of intake (results URL ready, recovery panel up, finalize
   * running, or post-verify) the chat input/Send/Skip should be hidden — they have nothing left to
   * type and seeing the box invites confusion as in the support screenshots.
   */
  const intakeInputHidden =
    !!resultsEntryUrl ||
    !!postVerifyDestination ||
    isFinalizing ||
    needsResultsRecovery ||
    handoffPromisedNoEntryUrl ||
    conversationSuggestsIntakeComplete(messages);

  /** Auto-run transcript finalize once when the model clearly wrapped up but no results URL (avoids “click Continue” loops). */
  const finalizeFnRef = useRef(finalizeFromTranscript);
  finalizeFnRef.current = finalizeFromTranscript;
  const autoTranscriptFinalizeConsumedRef = useRef(false);
  const autoTranscriptFinalizeAttemptsRef = useRef(0);

  useEffect(() => {
    if (!handoffPromisedNoEntryUrl || resultsEntryUrl) {
      autoTranscriptFinalizeConsumedRef.current = false;
      autoTranscriptFinalizeAttemptsRef.current = 0;
    }
  }, [handoffPromisedNoEntryUrl, resultsEntryUrl]);

  useEffect(() => {
    if (
      finalizeError &&
      handoffPromisedNoEntryUrl &&
      !isFinalizing &&
      !resultsEntryUrl
    ) {
      autoTranscriptFinalizeConsumedRef.current = false;
    }
  }, [finalizeError, handoffPromisedNoEntryUrl, isFinalizing, resultsEntryUrl]);

  useEffect(() => {
    if (!handoffPromisedNoEntryUrl || resultsEntryUrl) return;
    if (isLoading || isFinalizing || autoTranscriptFinalizeConsumedRef.current) return;
    if (autoTranscriptFinalizeAttemptsRef.current >= 2) return;
    autoTranscriptFinalizeConsumedRef.current = true;
    autoTranscriptFinalizeAttemptsRef.current += 1;
    const t = window.setTimeout(() => {
      void finalizeFnRef.current();
    }, 600);
    return () => window.clearTimeout(t);
  }, [
    handoffPromisedNoEntryUrl,
    resultsEntryUrl,
    isLoading,
    isFinalizing,
    finalizeError,
  ]);

  // Skip the current question
  const handleSkip = async () => {
    if (isLoading || isFinalizing) return;
    await sendMessage("Skip");
    setSelectedOptions([]);
    setInputValue("");
  };

  // Save progress and email a resume link
  const handleSaveAndExit = async () => {
    if (!saveEmail.trim() || !saveEmail.includes("@")) return;
    setSaveStatus("saving");
    setSaveErrorMessage(null);
    try {
      // Persist the email (use the static import — a dynamic import here loads a separate chunk
      // that breaks with "Failed to load chunk" after a deploy while the tab still has an old bundle).
      persistEmail(saveEmail.trim());

      // Send resume link via API
      const saveExitRes = await fetch("/api/snapshot/save-exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          email: saveEmail.trim(),
          turnstileToken,
        }),
      });
      if (!saveExitRes.ok) {
        let message = "Something went wrong. Please try again.";
        try {
          const payload = await saveExitRes.json();
          if (typeof payload?.error === "string" && payload.error.trim()) {
            message = payload.error;
          }
        } catch {
          // Ignore JSON parse failures and keep fallback message.
        }
        if (saveExitRes.status === 429) {
          message = "Too many attempts. Please wait a moment, then try again.";
        }
        throw new Error(message);
      }
      let payload: { resumeUrl?: string; resumeEventSent?: boolean } = {};
      try {
        payload = await saveExitRes.json();
      } catch {
        /* ignore */
      }
      if (typeof payload.resumeUrl === "string" && payload.resumeUrl.startsWith("http")) {
        setSaveResumeUrl(payload.resumeUrl);
      } else {
        setSaveResumeUrl(null);
      }
      setSaveResumeEventSent(typeof payload.resumeEventSent === "boolean" ? payload.resumeEventSent : null);
      setSaveStatus("saved");
      setSaveErrorMessage(null);
      syncChatEmailFromStorage();
    } catch (error) {
      const raw =
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong. Please try again.";
      const isStaleBundle =
        /failed to load chunk|loading chunk \d+|dynamically imported module/i.test(raw);
      setSaveErrorMessage(
        isStaleBundle
          ? "This page was updated while you had it open. Refresh the page (Cmd+Shift+R or Ctrl+Shift+R), then try Save and continue again."
          : raw,
      );
      setSaveStatus("error");
    }
  };

  // Only show save/skip after the conversation has started (more than just the greeting)
  const conversationStarted = messages.filter((m) => m.role === "user").length >= 1;

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            return prev; // Slow down near the end
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 300);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Auto-scroll to bottom when messages change or loading state changes.
  // IMPORTANT: Scroll only the .chat-messages container — NOT scrollIntoView,
  // which walks up the DOM and scrolls the page body (pushing content past the footer).
  useEffect(() => {
    requestAnimationFrame(() => {
      const container = chatMessagesRef.current;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    });
  }, [messages, isLoading]);

  // Auto-focus input field when ready for next question
  useEffect(() => {
    // Focus input when:
    // 1. Component mounts (initial focus)
    // 2. Loading finishes (after assistant responds)
    // 3. New assistant message arrives
    if (!isLoading && inputRef.current && !inputRef.current.disabled) {
      // Small delay to ensure DOM is ready and scroll completes
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, messages]);

  // Also focus after form submission (when input is cleared)
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    if (isFinalizing || isLoading) return;

    // ─── Security: Honeypot check (bots fill hidden fields) ───
    if (honeypot) {
      // Silently ignore — looks like a successful submission to the bot
      setInputValue("");
      return;
    }

    // Track behavioral signal for this message
    behaviorTrackerRef.current?.recordMessage(inputValue);

    // Expose behavioral signals to the save-report hook (read via window)
    if (behaviorTrackerRef.current) {
      (window as any).__behavioralSignals = behaviorTrackerRef.current.getSignals();
    }

    await sendMessage(inputValue);
    setInputValue("");
    // Focus input after message is sent and cleared
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

              // Report iframe height to parent window for auto-expanding
              useEffect(() => {
                const reportHeight = () => {
                  if (typeof window !== "undefined" && window.parent !== window) {
                    const height = document.documentElement.scrollHeight;
                    // Support both message types for compatibility
                    window.parent.postMessage({ type: "BS_IFRAME_HEIGHT", height }, "*");
                    window.parent.postMessage({ type: "RESIZE_IFRAME", height }, "*");
                  }
                };

                let rafId = 0;
                const queueReport = () => {
                  if (rafId) return;
                  rafId = window.requestAnimationFrame(() => {
                    rafId = 0;
                    reportHeight();
                  });
                };

                // Report initial height and keep observing layout changes once.
                queueReport();
                const resizeObserver = new ResizeObserver(queueReport);
                resizeObserver.observe(document.body);

                return () => {
                  if (rafId) window.cancelAnimationFrame(rafId);
                  resizeObserver.disconnect();
                };
              }, []);

              // Report updates when chat content changes without recreating observers.
              useEffect(() => {
                if (typeof window === "undefined" || window.parent === window) return;
                const timeoutId = window.setTimeout(() => {
                  const height = document.documentElement.scrollHeight;
                  window.parent.postMessage({ type: "BS_IFRAME_HEIGHT", height }, "*");
                  window.parent.postMessage({ type: "RESIZE_IFRAME", height }, "*");
                }, 100);
                return () => window.clearTimeout(timeoutId);
              }, [messages.length, isLoading]);

  const handleReset = () => {
    reset();
    setInputValue("");
    setSelectedOptions([]);
    setPostVerifyDestination(null);
    setPostVerifyResultsLinkCopied(false);
  };

  // Parse select options from assistant message (multi-select or single-select)
  const parseSelectOptions = (text: string): { options: string[], isMultiSelect: boolean } | null => {
    // Check if message contains bullet points (indicating a list of options)
    const lines = text.split('\n');
    const options: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match lines starting with - or • followed by text
      const match = trimmed.match(/^[-•]\s*(.+)$/);
      if (match) {
        options.push(match[1].trim());
      }
    }

    // If we found options, determine if it's multi-select or single-select
    if (options.length > 0) {
      // Check for multi-select indicators
      const hasMultiSelectIndicator = /select multiple|you can select|multiple options|select all that apply/i.test(text);
      
      // Determine selection type:
      // - If explicit multi-select indicator, use checkboxes (multi-select)
      // - Otherwise, use radio buttons (single-select) for any list of options
      const isMultiSelect = hasMultiSelectIndicator;
      
      return { options, isMultiSelect };
    }

    return null;
  };

  // Get the last assistant message to check for select options
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
  const selectOptions = lastAssistantMessage 
    ? parseSelectOptions(lastAssistantMessage.text)
    : null;
  /** Once the user sends a reply, the thread ends with a user bubble — don't keep showing stale radios (Continue would stay disabled). */
  const lastThreadMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
  const chatAwaitingChoiceOnLatestAssistant =
    !!lastThreadMessage &&
    lastThreadMessage.role === "assistant" &&
    !isLoading &&
    !isFinalizing;

  // Handle checkbox toggle (multi-select)
  const handleCheckboxToggle = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  // Handle radio button selection (single-select)
  const handleRadioSelect = (option: string) => {
    setSelectedOptions([option]);
  };

  // Handle submit with checkboxes/radio buttons
  const handleSubmitWithOptions = async () => {
    if (selectedOptions.length === 0 || isLoading || isFinalizing) return;
    const response = selectedOptions.join(', ');
    await sendMessage(response);
    setSelectedOptions([]);
    setInputValue("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="app-root">
      {/* Invisible Cloudflare Turnstile CAPTCHA */}
      <TurnstileWidget onToken={handleTurnstileToken} />

      {/* Email verification gate — shown after assessment completes */}
      {showEmailVerification && !emailVerified && reportId && (
        <EmailVerificationGate
          reportId={reportId}
          productName={activeTierConfig.productName}
          initialEmail={typeof window !== "undefined" ? getPersistedEmail() ?? "" : ""}
          onVerified={(verifiedEmail) => {
            persistEmail(verifiedEmail);
            setEmailVerified(true);
            setShowEmailVerification(false);
            if (activeTier === "blueprint" || activeTier === "blueprint-plus") {
              setChatEmail(verifiedEmail);
            }
            const url = pendingRedirectRef.current;
            const rid = reportId;
            if (url && rid) {
              setPostVerifyDestination({
                resultsUrl: url,
                reportId: rid,
                email: verifiedEmail,
              });
            } else if (url) {
              window.location.href = url;
            } else if (rid) {
              setPostVerifyDestination({
                resultsUrl: `/results?reportId=${encodeURIComponent(rid)}`,
                reportId: rid,
                email: verifiedEmail,
              });
            }
          }}
        />
      )}

      {postVerifyDestination && (
        <div
          role="region"
          aria-label="Your results are ready"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10001,
            background: "#021859",
            color: "#fff",
            padding: "14px 18px",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.22)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px 20px",
          }}
        >
          <div style={{ flex: "1 1 240px", minWidth: 0, textAlign: "center", maxWidth: 560 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              Your {activeTierConfig.productName} is ready
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 13, opacity: 0.92, lineHeight: 1.5 }}>
              Open the full results experience for scores, insights, and sharing. We also saved this session to{" "}
              <span style={{ fontWeight: 700, wordBreak: "break-all" }}>{postVerifyDestination.email}</span> so you
              can reopen your link from email anytime.
            </p>
            <p style={{ margin: "10px 0 0", fontSize: 12, opacity: 0.85, lineHeight: 1.45 }}>
              Save or share your results page: use <strong>Copy results link</strong> below (full URL to clipboard).
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => {
                window.location.href = postVerifyDestination.resultsUrl;
              }}
              style={{
                padding: "12px 22px",
                borderRadius: 8,
                border: "none",
                background: "#07B0F2",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              See my results
            </button>
            <button
              type="button"
              onClick={() => {
                const rel = postVerifyDestination.resultsUrl;
                const abs =
                  rel.startsWith("http://") || rel.startsWith("https://")
                    ? rel
                    : `${window.location.origin}${rel.startsWith("/") ? rel : `/${rel}`}`;
                void navigator.clipboard.writeText(abs).then(
                  () => {
                    setPostVerifyResultsLinkCopied(true);
                    window.setTimeout(() => setPostVerifyResultsLinkCopied(false), 2500);
                  },
                  () => {},
                );
              }}
              style={{
                padding: "12px 22px",
                borderRadius: 8,
                border: "1px solid rgba(255, 255, 255, 0.4)",
                background: "transparent",
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              {postVerifyResultsLinkCopied ? "Copied!" : "Copy results link"}
            </button>
            <a
              href={pdfDownloadPathForTier(activeTier, postVerifyDestination.reportId)}
              style={{
                padding: "12px 22px",
                borderRadius: 8,
                border: "1px solid rgba(255, 255, 255, 0.4)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                boxSizing: "border-box",
              }}
            >
              Download PDF
            </a>
          </div>
        </div>
      )}

      <div
        className="app-shell"
        style={postVerifyDestination ? { paddingTop: "clamp(96px, 22vw, 160px)" } : undefined}
      >
        <section className="app-card" aria-labelledby="wundy-heading">
          <header className="app-card-header">
            <div className="app-card-avatar-wrap">
              <div className="app-card-avatar">
                <img
                  src={wundyAvatarSrc}
                  alt="Wundy™, brand specialist"
                  className="app-card-avatar-img"
                  width={64}
                  height={64}
                  onError={() => {
                    if (wundyAvatarSrc === WUNDY_AVATAR_SRC) setWundyAvatarSrc(WUNDY_AVATAR_FALLBACK);
                    else if (wundyAvatarSrc === WUNDY_AVATAR_FALLBACK) setWundyAvatarSrc(WUNDY_AVATAR_FINAL_FALLBACK);
                  }}
                />
              </div>
            </div>

            <div>
              <div className="app-card-eyebrow">{activeTierConfig.heading}</div>
              <p style={{ fontSize: '14px', color: '#5A6B7E', fontWeight: 400, textAlign: 'center', marginTop: '6px', marginBottom: 0 }}>
                {activeTierConfig.valueProp}
              </p>
            </div>
          </header>

          {/* Progress during the conversation */}
          {conversationStarted && (
            <div className="assessment-progress-wrap">
              <div className="assessment-progress-bar">
                <div
                  className="assessment-progress-fill"
                  style={{ width: `${assessmentProgress}%` }}
                />
              </div>
              <div className="assessment-progress-label">
                <span>
                  {assessmentProgress < 30
                    ? "Getting started..."
                    : assessmentProgress < 60
                    ? "Making progress..."
                    : assessmentProgress < 85
                    ? "Almost there..."
                    : "Wrapping up!"}
                </span>
                <span>{assessmentProgress}% complete</span>
              </div>
            </div>
          )}

          <div className="app-body">
            <p className="assessment-inline-confidence">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#07B0F2" width="14" height="14" style={{ display: 'inline-block', verticalAlign: '-1px', marginRight: '4px', flexShrink: 0 }}><path d="M18 10h-1V7A5 5 0 0 0 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2ZM9 7a3 3 0 1 1 6 0v3H9V7Z"/></svg>
              Your responses are confidential and won&apos;t be shared with third parties.{' '}
              <a
                href="https://wunderbardigital.com/privacy-policy?utm_source=diagnostic_flow&utm_medium=diagnostic_ui&utm_campaign=confidentiality_link&utm_content=privacy_policy"
                target="_blank"
                rel="noopener noreferrer"
                className="assessment-privacy-link"
              >
                Privacy Policy
              </a>
            </p>

            {/* Asset upload panel for Blueprint/Blueprint+ tiers */}
            {isUploadTier && conversationStarted && chatEmail && (
              <AssetUploadPanel
                email={chatEmail}
                tier={activeTier as "blueprint" | "blueprint-plus"}
                sessionId={reportId || undefined}
              />
            )}

            <div className="chat-panel">
              <div ref={chatMessagesRef} className="chat-messages" aria-live="polite">
                {messages.map((message) => {
                  const isLastAssistant =
                    message.role === "assistant" &&
                    message.id === lastAssistantMessage?.id &&
                    chatAwaitingChoiceOnLatestAssistant;

                  // Only the latest assistant turn (no user reply yet) gets interactive options
                  const selectData = isLastAssistant
                    ? parseSelectOptions(message.text)
                    : null;
                  
                  if (selectData && selectData.options.length > 0) {
                    // Extract ALL non-bullet text as the question context
                    const contextLines = message.text.split('\n')
                      .filter(line => !line.trim().match(/^[-•]\s/))
                      .map(line => line.trim())
                      .filter(Boolean);
                    
                    const isMultiSelect = selectData.isMultiSelect;
                    
                    return (
                      <div
                        key={message.id}
                        className={`chat-bubble chat-bubble-${message.role}`}
                      >
                        {contextLines.map((line, idx) => (
                          <p key={idx}>{renderChatMarkdownInline(line)}</p>
                        ))}
                        <div className={isMultiSelect ? "chat-checkboxes" : "chat-radio-buttons"}>
                          {selectData.options.map((option, idx) => (
                            <label key={idx} className={isMultiSelect ? "chat-checkbox-label" : "chat-radio-label"}>
                              <input
                                type={isMultiSelect ? "checkbox" : "radio"}
                                name={isMultiSelect ? undefined : `radio-${message.id}`}
                                checked={isMultiSelect 
                                  ? selectedOptions.includes(option)
                                  : selectedOptions[0] === option
                                }
                                onChange={() => isMultiSelect 
                                  ? handleCheckboxToggle(option)
                                  : handleRadioSelect(option)
                                }
                                disabled={isLoading || isFinalizing}
                              />
                              <span>{renderChatMarkdownInline(option)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  // Regular message rendering
                  return (
                    <div
                      key={message.id}
                      className={`chat-bubble chat-bubble-${message.role}`}
                    >
                      <ChatMarkdown text={message.text} />
                    </div>
                  );
                })}
                {(isLoading || isFinalizing) && (
                  <div className="chat-bubble chat-bubble-assistant pending">
                    {isFinalizing
                      ? "Building your diagnostic from this conversation…"
                      : "Wundy™ is thinking…"}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Retry bar — shown when the last API call failed */}
              {canRetry && !isLoading && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: "#FEF2F2",
                  borderRadius: 5,
                  border: "1px solid #FECACA",
                }}>
                  <span style={{ fontSize: 13, color: "#991B1B", flex: 1 }}>
                    Something went wrong.
                  </span>
                  <button
                    type="button"
                    onClick={retry}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 5,
                      border: "none",
                      background: "#07b0f2",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {resultsEntryUrl && !postVerifyDestination && (
                <div
                  style={{
                    padding: "14px 12px",
                    marginBottom: 10,
                    borderRadius: 10,
                    background: "linear-gradient(180deg, #E0F2FE 0%, #DBEAFE 100%)",
                    border: "1px solid #7DD3FC",
                  }}
                >
                  <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#0C4A6E" }}>
                    Your {activeTierConfig.productName} is ready
                  </p>
                  <p style={{ margin: "0 0 12px", fontSize: 13, color: "#075985", lineHeight: 1.45 }}>
                    Open your results to see your WunderBrand Score™. If you haven&apos;t added an email yet, you&apos;ll
                    confirm it there to finish saving everything.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = resultsEntryUrl;
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: "#07B0F2",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    See my results
                  </button>
                  {showEmailVerification && (
                    <p style={{ margin: "10px 0 0", fontSize: 12, color: "#075985", lineHeight: 1.45 }}>
                      If an email confirmation step is open on top of this page, complete it first — then tap{" "}
                      <strong>See my results</strong> (or use the bar at the top).
                    </p>
                  )}
                </div>
              )}

              {needsResultsRecovery && (
                <div
                  style={{
                    padding: "14px 12px",
                    marginBottom: 10,
                    borderRadius: 10,
                    background: "linear-gradient(180deg, #E0F2FE 0%, #DBEAFE 100%)",
                    border: "1px solid #7DD3FC",
                  }}
                >
                  <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#0C4A6E" }}>
                    Almost there
                  </p>
                  <p style={{ margin: "0 0 12px", fontSize: 13, color: "#075985", lineHeight: 1.45 }}>
                    Tap below to finish saving your diagnostic and open your results. If something failed on the first try,
                    this runs the handoff again — same button as when your link is ready.
                  </p>
                  {finalizeError && (
                    <p style={{ margin: "0 0 10px", fontSize: 12, color: "#991B1B", lineHeight: 1.45 }}>
                      {finalizeError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => void finalizeFromTranscript()}
                    disabled={isFinalizing}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: isFinalizing ? "#94D8F7" : "#07B0F2",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: isFinalizing ? "wait" : "pointer",
                    }}
                  >
                    {isFinalizing ? "Opening…" : "See my results"}
                  </button>
                  {finalizeError && (
                    <button
                      type="button"
                      onClick={() => clearFinalizeError()}
                      style={{
                        marginTop: 8,
                        padding: 0,
                        border: "none",
                        background: "none",
                        color: "#0369A1",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Dismiss message
                    </button>
                  )}
                </div>
              )}

              {intakeInputHidden ? null : selectOptions && selectOptions.options.length > 0 && chatAwaitingChoiceOnLatestAssistant ? (
                // Show submit button for checkboxes / radio
                <div className="chat-input-row">
                  <button
                    type="button"
                    className="chat-send"
                    onClick={handleSubmitWithOptions}
                    disabled={isLoading || isFinalizing || selectedOptions.length === 0}
                  >
                    {isLoading || isFinalizing ? "Sending…" : "Continue"}
                  </button>
                  {conversationStarted && (
                    <button
                      type="button"
                      className="chat-skip"
                      onClick={handleSkip}
                      disabled={isLoading || isFinalizing}
                      title="Skip this question — you can come back to it"
                    >
                      Skip
                    </button>
                  )}
                </div>
              ) : (
                // Regular text input form
                <form className="chat-input-row" onSubmit={handleSubmit}>
                  <label htmlFor="brand-message" className="sr-only">
                    Send a message to Wundy™
                  </label>
                  {/* Honeypot: invisible to humans, bots auto-fill it */}
                  <input
                    type="text"
                    name="company_url"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", width: 0, height: 0, opacity: 0 }}
                  />
                  {/* File upload for Blueprint-level tiers */}
                  {isUploadTier && chatEmail && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                      <button
                        type="button"
                        className="chat-attach"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || isFinalizing || isUploading}
                        title="Attach a file (brand guidelines, style guide, logo, etc.)"
                        aria-label="Attach file"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                      </button>
                    </>
                  )}
                  <input
                    ref={inputRef}
                    id="brand-message"
                    name="brand-message"
                    value={inputValue}
                    onChange={(event) => {
                      setInputValue(event.target.value);
                      behaviorTrackerRef.current?.recordKeystroke();
                    }}
                    placeholder={isUploading ? "Uploading file…" : "Type your reply…"}
                    disabled={isLoading || isFinalizing || isUploading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="chat-send"
                    disabled={isLoading || isFinalizing || isUploading || !inputValue.trim()}
                  >
                    {isUploading ? "Uploading…" : isLoading || isFinalizing ? "Sending…" : "Send"}
                  </button>
                  {conversationStarted && (
                    <button
                      type="button"
                      className="chat-skip"
                      onClick={handleSkip}
                      disabled={isLoading || isFinalizing || isUploading}
                      title="Skip this question — you can come back to it"
                    >
                      Skip
                    </button>
                  )}
                </form>
              )}
            </div>
            {isLoading && (
              <div className="app-loading-status">
                <div className="app-progress-bar">
                  <div
                    className="app-progress-fill"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="app-card-footer">
                  Wundy™ is preparing your personalized questions and will be ready in a moment.
                </p>
              </div>
            )}

            {/* Save & Continue Later link — only visible while there are still questions to answer */}
            {conversationStarted && !isLoading && !intakeInputHidden && (
              <div style={{
                textAlign: "center",
                padding: "8px 0 4px",
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setSaveResumeUrl(null);
                    setSaveResumeEventSent(null);
                    setShowSaveModal(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#5A6B7E",
                    fontSize: 13,
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  Save and continue later
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Save & Continue Later Modal */}
      {showSaveModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,24,89,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => {
            if (saveStatus !== "saving") {
              setShowSaveModal(false);
              setSaveResumeUrl(null);
              setSaveResumeEventSent(null);
            }
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 420,
              width: "100%",
              padding: "32px 28px",
              boxShadow: "0 8px 32px rgba(2,24,89,0.15)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {saveStatus === "saved" ? (
              <>
                <div style={{ fontSize: 28, marginBottom: 12 }}>
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ margin: "0 auto" }}>
                    <circle cx="18" cy="18" r="18" fill="#22C55E" />
                    <path d="M12 18.5L16 22.5L24 14.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 style={{ color: "#021859", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
                  Progress saved
                </h3>
                <p style={{ color: "#5A6B7E", fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>
                  {saveResumeEventSent === false
                    ? "We saved your progress. We couldn’t queue the automated resume email (check ActiveCampaign webhook / automation). Use the link below to continue anytime."
                    : "Check your email within a few minutes for your resume link (ActiveCampaign automations usually send quickly). Your answers are already saved — Wundy™ will be waiting."}
                </p>
                {saveResumeUrl ? (
                  <div style={{ margin: "0 0 16px", textAlign: "left" }}>
                    <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "#021859" }}>
                      Your resume link
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "stretch",
                        flexWrap: "wrap",
                      }}
                    >
                      <code
                        style={{
                          flex: "1 1 180px",
                          fontSize: 11,
                          wordBreak: "break-all",
                          padding: "10px 10px",
                          background: "#F1F5F9",
                          borderRadius: 8,
                          border: "1px solid #E2E8F0",
                          color: "#0F172A",
                        }}
                      >
                        {saveResumeUrl}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(saveResumeUrl).catch(() => {});
                        }}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: "1px solid #CBD5E1",
                          background: "#fff",
                          color: "#021859",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        Copy link
                      </button>
                    </div>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveModal(false);
                    setSaveResumeUrl(null);
                    setSaveResumeEventSent(null);
                  }}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 8,
                    border: "none",
                    background: "#07B0F2",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Got it
                </button>
              </>
            ) : (
              <>
                <h3 style={{ color: "#021859", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
                  Save and continue later
                </h3>
                <p style={{ color: "#5A6B7E", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
                  Your progress is saved automatically. Enter your email and we&rsquo;ll send you a link to pick up where you left off.
                </p>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={saveEmail}
                  onChange={(e) => setSaveEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && saveStatus !== "saving" && saveEmail.trim()) {
                      e.preventDefault();
                      void handleSaveAndExit();
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    fontSize: 15,
                    border: "1px solid #D6DFE8",
                    borderRadius: 8,
                    outline: "none",
                    boxSizing: "border-box",
                    marginBottom: 12,
                    color: "#021859",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#07B0F2")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#D6DFE8")}
                  autoFocus
                />
                <p
                  aria-live="polite"
                  style={{
                    minHeight: 18,
                    margin: "0 0 8px",
                    fontSize: 12,
                    color:
                      saveStatus === "error"
                        ? "#DC2626"
                        : saveStatus === "saving"
                          ? "#0369A1"
                          : "#5A6B7E",
                    lineHeight: 1.45,
                  }}
                >
                  {saveStatus === "saving"
                    ? "Sending your resume link..."
                    : saveStatus === "error"
                      ? saveErrorMessage ||
                        "Could not send the link. Please check your email and try again."
                      : "We will send a secure resume link to this address."}
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 8,
                      border: "1px solid #D6DFE8",
                      background: "#fff",
                      color: "#5A6B7E",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAndExit}
                    disabled={saveStatus === "saving" || !saveEmail.trim()}
                    style={{
                      padding: "10px 24px",
                      borderRadius: 8,
                      border: "none",
                      background: "#07B0F2",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: saveStatus === "saving" ? "wait" : "pointer",
                      opacity: saveStatus === "saving" || !saveEmail.trim() ? 0.6 : 1,
                    }}
                  >
                    {saveStatus === "saving" ? "Saving..." : "Send me a link"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

