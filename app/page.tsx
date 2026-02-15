'use client'

import { FormEvent, useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useBrandChat } from "../src/hooks/useBrandChat";
import WundyLogo from "@/assets/wundy-logo.jpeg";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import { BehaviorTracker } from "@/lib/security/behavioralScoring";
import { EmailVerificationGate } from "@/components/security/EmailVerificationGate";
import { parseTierFromParam, getChatTierConfig, interpolateWelcomeBack, type ChatTier } from "@/lib/chatTierConfig";
import "./globals.css";

export default function Home() {
  // ─── Product tier + customer name detection ───
  const searchParams = useSearchParams();
  const tier = useMemo(() => parseTierFromParam(searchParams.get("tier")), [searchParams]);
  const tierConfig = useMemo(() => getChatTierConfig(tier), [tier]);
  // Sanitize name param: strip non-letter chars, cap at 50 chars
  const rawName = searchParams.get("name") || null;
  const customerName = useMemo(() => {
    if (!rawName) return null;
    const sanitized = rawName.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "").trim().slice(0, 50);
    return sanitized || null;
  }, [rawName]);
  const tierTokenParam = searchParams.get("token") || null;

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

  // Use the validated tier's config (paid access must be verified)
  const activeTier = validatedTier === "pending" ? "snapshot" : validatedTier as ChatTier;
  const activeTierConfig = useMemo(() => getChatTierConfig(activeTier), [activeTier]);

  // For paid tiers with a known name from Stripe:
  //   → Skip the "what's your name?" step entirely
  //   → Combine a short intro + the personalized welcome-back into one opening message
  // For the free tier (or paid without a name):
  //   → Use the standard two-message flow: greeting asks name → user responds → welcome-back
  const resolvedGreeting = useMemo(() => {
    if (customerName && activeTier !== "snapshot") {
      // Paid tier with name from Stripe — build a single personalized opening
      const welcomeBack = interpolateWelcomeBack(activeTierConfig.welcomeBack, customerName);
      return `Hi ${customerName}, I'm Wundy™ — your brand guide here at Wunderbar Digital.\n\n${welcomeBack}`;
    }
    // Standard greeting (asks for name)
    return activeTierConfig.greeting;
  }, [activeTier, activeTierConfig, customerName]);

  // When the assessment completes, show email verification instead of auto-redirecting
  const handleAssessmentComplete = useCallback((completedReportId: string, redirectUrl: string) => {
    pendingRedirectRef.current = redirectUrl;
    setShowEmailVerification(true);
  }, []);

  const { messages, isLoading, sendMessage, retry, canRetry, reset, reportId, assessmentProgress, questionsAnswered, totalQuestions } = useBrandChat({
    onComplete: handleAssessmentComplete,
    customGreeting: resolvedGreeting,
    welcomeBackTemplate: (!customerName || activeTier === "snapshot") ? activeTierConfig.welcomeBack : undefined,
  });
  const [inputValue, setInputValue] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveEmail, setSaveEmail] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  // Skip the current question
  const handleSkip = async () => {
    if (isLoading) return;
    await sendMessage("Skip");
    setSelectedOptions([]);
    setInputValue("");
  };

  // Save progress and email a resume link
  const handleSaveAndExit = async () => {
    if (!saveEmail.trim() || !saveEmail.includes("@")) return;
    setSaveStatus("saving");
    try {
      // Persist the email
      const { persistEmail } = await import("@/lib/persistEmail");
      persistEmail(saveEmail.trim());

      // Send resume link via API
      await fetch("/api/snapshot/save-exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          email: saveEmail.trim(),
        }),
      });
      setSaveStatus("saved");
    } catch {
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

  // Auto-scroll to bottom when messages change or loading state changes
  useEffect(() => {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
                function reportHeight() {
                  if (typeof window !== 'undefined' && window.parent !== window) {
                    const height = document.documentElement.scrollHeight;
                    // Support both message types for compatibility
                    window.parent.postMessage({ type: "BS_IFRAME_HEIGHT", height }, "*");
                    window.parent.postMessage({ type: "RESIZE_IFRAME", height }, "*");
                  }
                }

                // Report initial height
                reportHeight();

                // Watch for size changes
                const resizeObserver = new ResizeObserver(() => {
                  reportHeight();
                });

                resizeObserver.observe(document.body);

                // Also report on messages/loading changes
                const timeoutId = setTimeout(reportHeight, 100);

                return () => {
                  resizeObserver.disconnect();
                  clearTimeout(timeoutId);
                };
              }, [messages, isLoading]);

  const handleReset = () => {
    reset();
    setInputValue("");
    setSelectedOptions([]);
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
    if (selectedOptions.length === 0) return;
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
          onVerified={(verifiedEmail) => {
            setEmailVerified(true);
            setShowEmailVerification(false);
            // If we have a pending redirect, navigate now
            if (pendingRedirectRef.current) {
              window.location.href = pendingRedirectRef.current;
            }
          }}
        />
      )}

      <div className="app-shell">
        <section className="app-card" aria-labelledby="wundy-heading">
          <header className="app-card-header">
            <div className="app-card-avatar-wrap">
              <Image
                src={WundyLogo}
                alt="Wundy™, brand specialist"
                className="app-card-avatar"
                width={64}
                height={64}
              />
            </div>

            <div>
              <div className="app-card-eyebrow">{activeTierConfig.heading}</div>
              <p style={{ fontSize: '14px', color: '#5A6B7E', fontWeight: 400, textAlign: 'center', marginTop: '8px', marginBottom: 0 }}>
                {activeTierConfig.valueProp}
              </p>
            </div>
          </header>

          {/* Assessment Progress Indicator — visible after conversation starts */}
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
              Your responses are confidential and won't be shared with third parties.{' '}
              <a
                href="https://wunderbardigital.com/privacy-policy?utm_source=diagnostic_flow&utm_medium=diagnostic_ui&utm_campaign=confidentiality_link&utm_content=privacy_policy"
                target="_blank"
                rel="noopener noreferrer"
                className="assessment-privacy-link"
              >
                Privacy Policy
              </a>
            </p>

            

            

            <div className="chat-panel">
              <div className="chat-messages" aria-live="polite">
                {messages.map((message) => {
                  // Check if this is a select question (multi-select or single-select)
                  const selectData = message.role === 'assistant' 
                    ? parseSelectOptions(message.text)
                    : null;
                  
                  if (selectData && selectData.options.length > 0) {
                    // Render message with checkboxes (multi-select) or radio buttons (single-select)
                    const questionText = message.text.split('\n').find(line => 
                      !line.trim().match(/^[-•]\s/)
                    ) || message.text.split('\n')[0];
                    
                    const isMultiSelect = selectData.isMultiSelect;
                    
                    return (
                      <div
                        key={message.id}
                        className={`chat-bubble chat-bubble-${message.role}`}
                      >
                        <p>{questionText}</p>
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
                                disabled={isLoading}
                              />
                              <span>{option}</span>
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
                      {message.text.split("\n\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="chat-bubble chat-bubble-assistant pending">
                    Wundy™ is thinking…
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

              {selectOptions && selectOptions.options.length > 0 ? (
                // Show submit button for checkboxes / radio
                <div className="chat-input-row">
                  <button
                    type="button"
                    className="chat-send"
                    onClick={handleSubmitWithOptions}
                    disabled={isLoading || selectedOptions.length === 0}
                  >
                    {isLoading ? "Sending…" : "Continue"}
                  </button>
                  {conversationStarted && (
                    <button
                      type="button"
                      className="chat-skip"
                      onClick={handleSkip}
                      disabled={isLoading}
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
                  <input
                    ref={inputRef}
                    id="brand-message"
                    name="brand-message"
                    value={inputValue}
                    onChange={(event) => {
                      setInputValue(event.target.value);
                      behaviorTrackerRef.current?.recordKeystroke();
                    }}
                    placeholder="Type your reply…"
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="chat-send"
                    disabled={isLoading || !inputValue.trim()}
                  >
                    {isLoading ? "Sending…" : "Send"}
                  </button>
                  {conversationStarted && (
                    <button
                      type="button"
                      className="chat-skip"
                      onClick={handleSkip}
                      disabled={isLoading}
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

            {/* Save & Continue Later link — only visible after conversation starts */}
            {conversationStarted && !isLoading && (
              <div style={{
                textAlign: "center",
                padding: "8px 0 4px",
              }}>
                <button
                  type="button"
                  onClick={() => setShowSaveModal(true)}
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
            if (saveStatus !== "saving") setShowSaveModal(false);
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
                <p style={{ color: "#5A6B7E", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
                  Check your email for a link to pick up right where you left off. Your answers are saved and Wundy™ will be waiting.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
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
                {saveStatus === "error" && (
                  <p style={{ color: "#DC2626", fontSize: 13, margin: "0 0 8px" }}>
                    Something went wrong. Please try again.
                  </p>
                )}
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

