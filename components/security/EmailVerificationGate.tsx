"use client";

// components/security/EmailVerificationGate.tsx
// Full-screen overlay shown after the assessment completes but before results are revealed.
// User enters their email → receives a 6-digit code → enters it → results unlock.

import { useState, useRef, useEffect, useCallback, FormEvent } from "react";

interface EmailVerificationGateProps {
  reportId: string;
  onVerified: (email: string) => void;
  /** Pre-filled email if already collected (e.g., from save-and-exit) */
  initialEmail?: string;
}

export function EmailVerificationGate({
  reportId,
  onVerified,
  initialEmail = "",
}: EmailVerificationGateProps) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-focus email input on mount; cleanup abort controller on unmount
  useEffect(() => {
    emailRef.current?.focus();
    return () => { abortRef.current?.abort(); };
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const sendCode = useCallback(async (emailToVerify: string) => {
    if (loading) return false; // Guard against double-submit
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToVerify, reportId }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (controller.signal.aborted) return false;
      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
        setLoading(false);
        return false;
      }
      setResendCooldown(60);
      setLoading(false);
      return true;
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return false;
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return false;
    }
  }, [loading, reportId]);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    const success = await sendCode(trimmed);
    if (success) {
      setStep("code");
      // Focus first code input after a short delay
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError("");

    // Auto-advance to next input
    if (digit && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (digit && index === 5 && newCode.every((d) => d !== "")) {
      verifyCode(newCode.join(""));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setCode(newCode);
      codeRefs.current[5]?.focus();
      verifyCode(pasted);
    }
  };

  const verifyCode = useCallback(async (codeStr: string) => {
    if (loading) return; // Guard against double-submit
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, code: codeStr }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (controller.signal.aborted) return;
      if (!res.ok) {
        setError(data.error || "Verification failed.");
        setCode(["", "", "", "", "", ""]);
        codeRefs.current[0]?.focus();
        setLoading(false);
        return;
      }
      onVerified(email.trim().toLowerCase());
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [loading, reportId, email, onVerified]);

  return (
    <div className="email-verification-gate">
      <div className="email-verification-card">
        {/* Header */}
        <div className="email-verification-header">
          <div className="email-verification-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#07B0F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 className="email-verification-title">
            {step === "email" ? "Your results are ready!" : "Check your email"}
          </h2>
          <p className="email-verification-subtitle">
            {step === "email"
              ? "Enter your email to unlock your WunderBrand Snapshot™ results."
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {/* Email step */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="email-verification-form">
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="Your email address"
              className="email-verification-input"
              disabled={loading}
              autoComplete="email"
            />
            {error && <p className="email-verification-error">{error}</p>}
            <button
              type="submit"
              className="email-verification-btn"
              disabled={loading || !email.trim()}
            >
              {loading ? "Sending..." : "Send verification code"}
            </button>
            <p className="email-verification-note">
              We&apos;ll also save your results to this email so you can access them later.
            </p>
          </form>
        )}

        {/* Code step */}
        {step === "code" && (
          <div className="email-verification-form">
            <div className="email-verification-code-inputs" onPaste={handleCodePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { codeRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  className="email-verification-code-digit"
                  disabled={loading}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
            {error && <p className="email-verification-error">{error}</p>}
            <div className="email-verification-actions">
              <button
                className="email-verification-link"
                onClick={() => { setStep("email"); setCode(["", "", "", "", "", ""]); setError(""); }}
                disabled={loading}
              >
                Change email
              </button>
              <button
                className="email-verification-link"
                onClick={() => sendCode(email.trim())}
                disabled={loading || resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
